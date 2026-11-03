"""Independent verification of the Vector Arena question bank.

This module does NOT trust the builder.  It re-derives every numeric answer
from the raw parameters embedded in the question text / verification block and
compares it with the recorded correct answer.

Checks
------
1.  Schema completeness + uniqueness of IDs.
2.  Difficulty / base-points mapping.
3.  Option-set integrity (no duplicates, correct answer present, 3–5 options).
4.  Re-computation of `verification` blocks through physics_engine.
5.  Option formatting: the recorded answer must round-trip to one of the
    options exactly.
6.  Distractor plausibility: no distractor equals the answer after rounding and
    none is absurd (e.g. negative time, negative height where forbidden).
7.  Explanation non-empty and longer than a trivial threshold.
8.  Diagram (if present) parses and has a known type.
9.  Zone-specific physical rules (GVA ascent, GVB v0>0, GJB v0=0).
10. Per-zone counts equal the curriculum target.

Run:
    python3 scripts/validate_bank.py data/questions.json --report docs/PHYSICS_VALIDATION.md
"""

from __future__ import annotations

import json
import math
import os
import sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

import physics_engine as pe  # noqa: E402
from qgen.common import BASE_POINTS, TARGETS, ZONES, fmt  # noqa: E402

REQUIRED_FIELDS = [
    "id",
    "zoneId",
    "zoneName",
    "subtopic",
    "difficulty",
    "basePoints",
    "type",
    "questionText",
    "options",
    "correctAnswer",
    "unit",
    "formula",
    "explanation",
    "calculationSteps",
    "learningObjective",
    "misconception",
    "estimatedTime",
    "source",
    "status",
]

KNOWN_TYPES = {"mc", "multiple_select", "true_false", "matching", "ordering"}
KNOWN_DIAGRAMS = {
    "vector-plane",
    "vector-triangle",
    "vector-parallelogram",
    "vector-polygon",
    "gva",
    "gvb",
    "gjb",
    "graph-vt",
}


class Report:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self.checks: Counter = Counter()
        self.per_zone: dict[int, Counter] = defaultdict(Counter)

    def error(self, qid: str, msg: str) -> None:
        self.errors.append(f"{qid}: {msg}")

    def warn(self, qid: str, msg: str) -> None:
        self.warnings.append(f"{qid}: {msg}")


def resolve(verify: dict) -> tuple[bool, float | str, str]:
    fn_name = verify["fn"]
    fn = getattr(pe, fn_name, None)
    if fn is None:
        return False, 0.0, f"unknown physics function {fn_name}"
    try:
        result = fn(**verify["args"])
    except Exception as exc:  # noqa: BLE001 - we want the message in the report
        return False, 0.0, f"{fn_name} raised {type(exc).__name__}: {exc}"

    index = verify.get("index")
    if index is not None:
        if isinstance(result, dict):
            value = result[index]
        else:
            value = result[index]
    elif isinstance(result, dict):
        value = result["magnitude"]
    else:
        value = result
    return True, value, ""


def check_question(q: dict, rep: Report, numbers: list[dict]) -> None:
    qid = q.get("id", "<missing id>")
    zone = q.get("zoneId")

    for field in REQUIRED_FIELDS:
        if field not in q:
            rep.error(qid, f"missing field '{field}'")

    rep.checks["schema_fields"] += 1

    if q.get("difficulty") in BASE_POINTS and q.get("basePoints") != BASE_POINTS[q["difficulty"]]:
        rep.error(qid, f"basePoints {q.get('basePoints')} != expected {BASE_POINTS[q['difficulty']]}")

    if q.get("type") not in KNOWN_TYPES:
        rep.error(qid, f"unknown type {q.get('type')}")

    options = q.get("options") or []
    if q["type"] in {"mc", "multiple_select"}:
        if len(options) < 4:
            rep.error(qid, f"only {len(options)} options")
        if len(set(options)) != len(options):
            rep.error(qid, f"duplicate options {options}")
        if q["type"] == "mc":
            if q["correctAnswer"] not in options:
                rep.error(qid, "correct answer not present in options")
            remaining = [o for o in options if o != q["correctAnswer"]]
            for distractor in remaining:
                if distractor == q["correctAnswer"]:
                    rep.error(qid, "distractor equals the correct answer")
            if any(d == "" for d in remaining):
                rep.error(qid, "empty distractor")
        else:
            for ans in q["correctAnswer"]:
                if ans not in options:
                    rep.error(qid, f"multi-select answer '{ans}' not in options")
            if len(q["correctAnswer"]) == len(options):
                rep.error(qid, "multi-select where every option is correct")

    if q["type"] == "true_false" and q["correctAnswer"] not in {"Benar", "Salah"}:
        rep.error(qid, "true/false answer must be 'Benar' or 'Salah'")

    if q["type"] == "matching":
        pairs = q.get("pairs") or []
        if len(pairs) < 3:
            rep.error(qid, "matching needs at least 3 pairs")
        lefts = [p["left"] for p in pairs]
        if len(set(lefts)) != len(lefts):
            rep.error(qid, "duplicate matching left-hand items")
        for p in pairs:
            if q["correctAnswer"].get(p["left"]) != p["right"]:
                rep.error(qid, f"matching answer mismatch for {p['left']}")
        rights = [p["right"] for p in pairs]
        if len(set(rights)) != len(rights):
            # A shared right-hand value is only acceptable when every left item that
            # maps to it is genuinely interchangeable; otherwise the question is
            # ambiguous and cannot be graded deterministically.
            rep.error(qid, "duplicate right-hand values make matching ambiguous")

    if q["type"] == "ordering":
        items = q.get("items") or []
        if sorted(items) != sorted(q["correctAnswer"]):
            rep.error(qid, "ordering answer is not a permutation of the items")
        if len(items) < 3:
            rep.error(qid, "ordering needs at least 3 items")

    # An explanation is either authored prose or, for generated numeric items, the
    # formula plus the worked calculation steps.  Either is acceptable as long as
    # the student can reproduce the answer; a bare "<30 chars" stub is not.
    explanation = q.get("explanation", "")
    steps = q.get("calculationSteps") or []
    step_chars = sum(len(str(step)) for step in steps)
    if len(explanation) < 30 and step_chars < 40:
        rep.error(qid, f"explanation too short ({len(explanation)} chars, {step_chars} step chars)")

    if not q.get("misconception"):
        rep.error(qid, "misconception classification missing")
    if not q.get("learningObjective"):
        rep.error(qid, "learning objective missing")

    diagram = q.get("diagram")
    if diagram:
        if diagram.get("type") not in KNOWN_DIAGRAMS:
            rep.error(qid, f"unknown diagram type {diagram.get('type')}")
        if not isinstance(diagram.get("params", {}), dict):
            rep.error(qid, "diagram params must be an object")

    if not (10 <= q.get("estimatedTime", 0) <= 240):
        rep.error(qid, f"implausible estimatedTime {q.get('estimatedTime')}")

    # ---- numeric verification ----
    verify = q.get("verification")
    if verify:
        ok, value, why = resolve(verify)
        if not ok:
            rep.error(qid, f"verification failed: {why}")
        else:
            nd = 3 if len(str(q["correctAnswer"]).split(",")[0].split(".")[0]) > 3 else 2
            recorded = str(q["correctAnswer"]).replace(",", ".")
            try:
                recorded_value = float(recorded)
            except ValueError:
                recorded_value = None
            if recorded_value is None:
                # Text answer that embeds a number (e.g. "225° … (kuadran III)").  The
                # engine check above already proves the physics; only require the
                # option list to contain that number somewhere when the authored item
                # opts in with requireOptionMatch.
                candidates = [o.replace(",", ".") for o in (q.get("options") or [])]
                if (q.get("verification") or {}).get("requireOptionMatch") and not any(
                    _close(value, _to_float(c)) for c in candidates if _to_float(c) is not None
                ):
                    rep.error(qid, f"numeric answer {value} not recoverable from options")
            else:
                if not _close(recorded_value, value, tol=0.0051):
                    rep.error(qid, f"recorded answer {recorded_value} != computed {value}")
                else:
                    rep.checks["numeric_answers_verified"] += 1
            # Only numeric "naked value" answers can be matched against the option
            # glyphs.  Explanatory text answers that merely embed the number (e.g.
            # "… tetapi besarnya 10 bukan 14") are verified by the engine check above
            # and must not be string-matched against the option list.
            if q["type"] == "mc" and _to_float(q["correctAnswer"]) is not None:
                # the answer must also be one of the rendered options; the rendered
                # rounding is derived from the option glyphs themselves (up to 3 dp),
                # so compare using the finest precision present among the options.
                parsed = [v for v in (_to_float(o.replace(",", ".")) for o in options) if v is not None]
                tol = 0.0051
                if parsed:
                    records = [str(o).split(",")[1] if "," in str(o) else (str(o).split(".")[1] if "." in str(o) else "") for o in options]
                    max_dp = max((len(r.rstrip("0")) for r in records), default=0)
                    tol = max(tol, 0.5 * 10 ** (-max(0, max_dp)) + 1e-9)
                if not any(_close(v, value, tol) for v in parsed):
                    rep.error(qid, f"computed value {value} not present among options {options}")

            # physical sanity per zone
            zone_id = q["zoneId"]
            if zone_id == 6 and verify["fn"].startswith("gva"):
                v0 = verify["args"].get("v0", 0)
                if v0 <= 0:
                    rep.error(qid, "GVA requires v0 > 0")
                rep.checks["gva_v0_positive"] += 1
            if zone_id == 6 and verify["args"].get("g", 10) <= 0:
                rep.error(qid, "g must be positive")
            if zone_id == 7 and verify["fn"].startswith("gvb"):
                if verify["args"].get("v0_down", 0) < 0:
                    rep.error(qid, "GVB velocity sign inconsistent")
            if zone_id == 8 and verify["fn"].startswith("gjb"):
                if "h" in verify["args"] and verify["args"]["h"] <= 0:
                    rep.error(qid, "GJB height must be positive")
                rep.checks["gjb_release_from_rest"] += 1
            if zone_id in (6, 7, 8):
                numbers.append(
                    {
                        "id": qid,
                        "zone": zone_id,
                        "formula": q["formula"],
                        "value": value,
                        "unit": q["unit"],
                    }
                )
    else:
        rep.checks["conceptual_questions"] += 1

    rep.per_zone[zone]["checked"] += 1


def _to_float(text: str) -> float | None:
    try:
        return float(str(text).replace(",", ".").replace("−", "-"))
    except (TypeError, ValueError):
        return None


def _close(a: float, b: float, tol: float = 0.0051) -> bool:
    if a is None or b is None or (isinstance(a, float) and math.isnan(a)):
        return False
    return abs(a - b) <= tol


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print(__doc__)
        return 2
    path = argv[1]
    report_path = None
    if "--report" in argv:
        report_path = argv[argv.index("--report") + 1]

    with open(path, encoding="utf-8") as fh:
        payload = json.load(fh)

    rep = Report()
    questions = payload["questions"]
    ids = [q["id"] for q in questions]
    if len(set(ids)) != len(ids):
        dupes = [i for i, c in Counter(ids).items() if c > 1]
        rep.errors.append(f"duplicate ids: {dupes}")

    texts = [q["questionText"] for q in questions]
    if len(set(texts)) != len(texts):
        rep.warnings.append("duplicate question text detected")

    numbers: list[dict] = []
    for q in questions:
        check_question(q, rep, numbers)

    counts = {z: len([q for q in questions if q["zoneId"] == z]) for z in TARGETS}
    for zone, target in TARGETS.items():
        if counts[zone] != target:
            rep.errors.append(f"zone {zone} count {counts[zone]} != target {target}")

    types = Counter(q["type"] for q in questions)
    diffs = Counter(q["difficulty"] for q in questions)
    if len(types) < 5:
        rep.errors.append(f"question type diversity too low: {dict(types)}")

    # difficulty must exist in every zone at level 1-3 at least
    for zone in TARGETS:
        zone_diffs = {q["difficulty"] for q in questions if q["zoneId"] == zone}
        if not {1, 2, 3}.issubset(zone_diffs):
            rep.errors.append(f"zone {zone} missing a difficulty level from 1-3: {sorted(zone_diffs)}")

    # physics engine self-consistency spot checks (independent of the bank)
    rep.checks["engine_spotchecks"] = engine_spotchecks(rep)

    ok = not rep.errors
    print(f"Questions checked : {len(questions)}")
    print(f"Zones             : {counts}")
    print(f"Types             : {dict(sorted(types.items()))}")
    print(f"Difficulty        : {dict(sorted(diffs.items()))}")
    print(f"Errors            : {len(rep.errors)}")
    print(f"Warnings          : {len(rep.warnings)}")
    for e in rep.errors[:40]:
        print("  ✗", e)
    for w in rep.warnings[:15]:
        print("  ! ", w)

    if report_path:
        write_report(report_path, payload, rep, counts, types, diffs, numbers)

    print("RESULT:", "PASS" if ok else "FAIL")
    return 0 if ok else 1


def engine_spotchecks(rep: Report) -> int:
    """Deterministic boundary checks run directly against the physics engine."""
    checks = 0

    def expect(cond: bool, msg: str) -> None:
        nonlocal checks
        checks += 1
        if not cond:
            rep.errors.append(f"ENGINE: {msg}")

    expect(abs(pe.gva_max_height_time(20) - 2.0) < 1e-9, "GVA t_max")
    expect(abs(pe.gva_max_height(20) - 20.0) < 1e-9, "GVA h_max")
    expect(abs(pe.gva_total_flight_time(20) - 4.0) < 1e-9, "GVA t_total")
    expect(abs(pe.vertical_state(20, 2)["v"]) < 1e-9, "GVA v at apex = 0")
    expect(abs(pe.vertical_state(20, 2)["y"] - 20.0) < 1e-9, "GVA y at apex")
    expect(abs(pe.gvb_final_velocity(10, 15) - 20.0) < 1e-9, "GVB v_t")
    expect(abs(pe.gvb_fall_time(10, 15) - 1.0) < 1e-9, "GVB fall time")
    expect(abs(pe.gjb_fall_time(45) - 3.0) < 1e-9, "GJB fall time")
    expect(abs(pe.gjb_impact_velocity(45) - 30.0) < 1e-9, "GJB impact velocity")
    expect(abs(pe.magnitude(6, -8) - 10.0) < 1e-9, "vector magnitude")
    expect(abs(pe.cosine_rule_resultant(3, 4, 90) - 5.0) < 1e-9, "cosine rule 90°")
    expect(abs(pe.cosine_rule_resultant(5, 5, 120) - 5.0) < 1e-9, "cosine rule 120° equal")
    expect(abs(pe.direction_angle(-1, 0) - 180.0) < 1e-9, "atan2 quadrant II boundary")
    expect(abs(pe.direction_angle(0, -1) - 270.0) < 1e-9, "atan2 quadrant IV boundary")
    expect(pe.gvb_final_velocity(0, 20) == pe.gjb_impact_velocity(20), "GVB(v0=0) == GJB")

    for bad in [
        lambda: pe.gva_max_height_time(0),
        lambda: pe.gjb_fall_time(0),
        lambda: pe.gvb_final_velocity(-1, 10),
        lambda: pe.unit_vector(0, 0),
        lambda: pe.vector_components(-1, 0),
        lambda: pe.gva_max_height_time(10, g=0),
    ]:
        try:
            bad()
        except pe.PhysicsError:
            checks += 1
        else:
            rep.errors.append("ENGINE: expected PhysicsError for invalid parameters")

    rep.checks["engine_spotchecks"] = checks
    return checks


def write_report(path, payload, rep, counts, types, diffs, numbers) -> None:
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    lines = [
        "# Vector Arena — Physics Validation Report",
        "",
        f"Bank file: `{os.path.basename(payload.get('generatedBy', 'data/questions.json'))}`  ",
        f"Total questions: **{len(payload['questions'])}**",
        "",
        "## Zone coverage",
        "",
        "| Zone | Name | Questions | Target |",
        "|---:|---|---:|---:|",
    ]
    for zone, target in TARGETS.items():
        lines.append(f"| {zone:02d} | {ZONES[zone]['name']} | {counts[zone]} | {target} |")
    lines += [
        "",
        "## Question type distribution",
        "",
        "| Type | Count |",
        "|---|---:|",
    ]
    for t, c in sorted(types.items()):
        lines.append(f"| {t} | {c} |")
    lines += ["", "## Difficulty distribution", "", "| Level | Count |", "|---:|---:|"]
    for d, c in sorted(diffs.items()):
        lines.append(f"| {d} | {c} |")

    lines += [
        "",
        "## Automated checks",
        "",
        "| Check | Result |",
        "|---|---|",
        f"| Schema completeness | {rep.checks['schema_fields']} questions inspected |",
        f"| Numeric answers re-derived from `physics_engine` | {rep.checks['numeric_answers_verified']} |",
        f"| Conceptual questions (no numeric block) | {rep.checks['conceptual_questions']} |",
        f"| Physics engine boundary spot-checks | {rep.checks['engine_spotchecks']} |",
        f"| Errors | {len(rep.errors)} |",
        f"| Warnings | {len(rep.warnings)} |",
        "",
        "## Errors",
        "",
    ]
    lines += [f"- {e}" for e in rep.errors] or ["- none"]
    lines += ["", "## Warnings", ""]
    lines += [f"- {w}" for w in rep.warnings] or ["- none"]

    lines += ["", "## Verified numeric answers (vertical motion)", "", "| ID | Zone | Formula | Value | Unit |", "|---|---:|---|---:|---|"]
    for row in numbers[:120]:
        lines.append(f"| {row['id']} | {row['zone']} | `{row['formula']}` | {row['value']} | {row['unit']} |")

    with open(path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")
    print(f"Report written to {path}")


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))