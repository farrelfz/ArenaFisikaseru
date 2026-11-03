"""Vector Arena question bank builder.

Usage:
    python3 scripts/build_bank.py            # build + write data/questions.json
    python3 scripts/build_bank.py --check    # build only, fail if targets unmet
"""

from __future__ import annotations

import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

from qgen.common import TARGETS, ZONES, Registry  # noqa: E402
from qgen import zone1, zone2, zone3, zone4, zone5, zone6, zone7, zone8  # noqa: E402

OUTPUT = os.path.join(HERE, "..", "data", "questions.json")

BUILDERS = [zone1, zone2, zone3, zone4, zone5, zone6, zone7, zone8]


def build_registry() -> Registry:
    reg = Registry()
    for module in BUILDERS:
        module.build(reg)
    return reg


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    reg = build_registry()
    counts = reg.counts()
    missing = reg.missing()

    print("Zone counts:")
    for zone, target in TARGETS.items():
        actual = counts.get(zone, 0)
        flag = "OK" if actual == target else ("OVER" if actual > target else "SHORT")
        print(f"  Z{zone:02d} {ZONES[zone]['name'][:34]:<34} {actual:>3}/{target:<3} {flag}")
    print(f"Total: {len(reg.items)} / {sum(TARGETS.values())}")

    if missing:
        print(f"Missing per zone: {missing}", file=sys.stderr)
        if args.check:
            return 1

    payload = {
        "schemaVersion": 2,
        "generatedBy": "scripts/build_bank.py",
        "zones": [
            {"id": zid, "name": meta["name"], "code": meta["code"], "target": TARGETS[zid]}
            for zid, meta in ZONES.items()
        ],
        "questions": reg.items,
    }

    out_path = os.path.normpath(OUTPUT)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=1)
    print(f"Wrote {out_path} ({os.path.getsize(out_path)} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())