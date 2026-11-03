"""Trim the authored bank to the exact per-zone targets.

Selection is deterministic (seeded) but prioritises keeping the richest
question types (multiple select, matching, ordering, true/false) and spreads
the kept set across all difficulty levels, so a trimmed zone still exercises
every question type and every difficulty.

    python3 scripts/trim_bank.py data/questions.json
"""

from __future__ import annotations

import json
import sys
from collections import defaultdict

RICH_TYPES = {"multiple_select", "matching", "ordering", "true_false"}
TARGETS = {1: 25, 2: 25, 3: 35, 4: 35, 5: 40, 6: 30, 7: 25, 8: 25}


def quota(n: int, sizes: dict[int, int]) -> dict[int, int]:
    """Largest-remainder apportionment so difficulty spreads survive trimming."""
    total = sum(sizes.values())
    raw = {k: n * v / total for k, v in sizes.items()}
    base = {k: int(v) for k, v in raw.items()}
    remainder = n - sum(base.values())
    for key in sorted(raw, key=lambda k: raw[k] - base[k], reverse=True):
        if remainder <= 0:
            break
        base[key] += 1
    return base


def _is_removable(candidate: dict, chosen: list[dict]) -> bool:
    """An item may be dropped only if its type and difficulty stay represented."""
    same_type = [c for c in chosen if c["type"] == candidate["type"]]
    same_diff = [c for c in chosen if c["difficulty"] == candidate["difficulty"]]
    return len(same_type) > 1 and len(same_diff) > 1


def main(path: str) -> int:
    with open(path, encoding="utf-8") as fh:
        payload = json.load(fh)

    by_zone: dict[int, list[dict]] = defaultdict(list)
    for q in payload["questions"]:
        by_zone[q["zoneId"]].append(q)

    order = {t: i for i, t in enumerate(["multiple_select", "matching", "ordering", "true_false", "mc"])}
    kept: list[dict] = []
    for zone, target in TARGETS.items():
        items = by_zone[zone]
        by_diff: dict[int, list[dict]] = defaultdict(list)
        for q in items:
            by_diff[q["difficulty"]].append(q)
        sizes = {d: len(v) for d, v in by_diff.items()}
        limits = quota(target, sizes)

        chosen: list[dict] = []
        # 1. one of every rich type per zone if available
        for q in items:
            if q["type"] in RICH_TYPES and len(chosen) < target:
                if len([c for c in chosen if c["type"] == q["type"]]) == 0:
                    chosen.append(q)

        # 2. fill remaining quota by difficulty, preferring rich types
        chosen_ids = {id(c) for c in chosen}
        for diff in sorted(by_diff):
            taken = len([c for c in chosen if c["difficulty"] == diff])
            need = limits.get(diff, 0) - taken
            pool = sorted(
                [q for q in by_diff[diff] if id(q) not in chosen_ids],
                key=lambda q: (q["type"] not in RICH_TYPES, q["id"]),
            )
            for q in pool[: max(0, need)]:
                chosen.append(q)
                chosen_ids.add(id(q))

        # 3. hard guarantee: every difficulty level present in the authored zone
        #    survives the trim (curriculum spread is a product requirement, so it
        #    must never depend on an incidental sort order).
        for diff in sorted(by_diff):
            if not any(c["difficulty"] == diff for c in chosen):
                pool = [q for q in by_diff[diff] if id(q) not in chosen_ids]
                if pool:
                    chosen.append(pool[0])
                    chosen_ids.add(id(pool[0]))

        # 4. drop the weakest kept item if the guarantee pushed us over target
        while len(chosen) > target:
            removable = [c for c in chosen if _is_removable(c, chosen)]
            if not removable:
                break
            victim = min(removable, key=lambda q: (order[q["type"]], q["difficulty"], q["id"]))
            chosen.remove(victim)
            chosen_ids.discard(id(victim))

        # 5. top-up to exact target
        if len(chosen) < target:
            pool = sorted(
                [q for q in items if id(q) not in chosen_ids],
                key=lambda q: (order.get(q["type"], 9), q["difficulty"], q["id"]),
            )
            chosen.extend(pool[: target - len(chosen)])

        kept.extend(sorted(chosen, key=lambda q: q["id"]))

    payload["questions"] = kept
    payload["counts"] = {str(z): len([q for q in kept if q["zoneId"] == z]) for z in TARGETS}
    payload["totalQuestions"] = len(kept)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=1)

    print(json.dumps(payload["counts"], indent=1))
    types: dict[str, int] = defaultdict(int)
    diffs: dict[str, int] = defaultdict(int)
    for q in kept:
        types[q["type"]] += 1
        diffs[q["difficulty"]] += 1
    print("types:", dict(sorted(types.items())))
    print("difficulty:", dict(sorted(diffs.items())))
    print("total:", len(kept))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1] if len(sys.argv) > 1 else "data/questions.json"))