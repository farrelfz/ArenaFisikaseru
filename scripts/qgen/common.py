"""Shared question-authoring utilities for the Vector Arena bank builder.

Every numeric answer is produced by scripts/physics_engine.py, never by an LLM.
Each question also records a machine-checkable `verify` block that the
validator re-executes independently.
"""

from __future__ import annotations

import hashlib
import random
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Sequence

ZONES: Dict[int, Dict[str, str]] = {
    1: {"name": "Vector Fundamentals", "code": "Z01"},
    2: {"name": "Vector Representation", "code": "Z02"},
    3: {"name": "Vector Operations", "code": "Z03"},
    4: {"name": "Geometrical Vector Methods", "code": "Z04"},
    5: {"name": "Vector Components", "code": "Z05"},
    6: {"name": "GVA — Gerak Vertikal ke Atas", "code": "Z06"},
    7: {"name": "GVB — Gerak Vertikal ke Bawah", "code": "Z07"},
    8: {"name": "GJB — Gerak Jatuh Bebas", "code": "Z08"},
}

TARGETS = {1: 25, 2: 25, 3: 35, 4: 35, 5: 40, 6: 30, 7: 25, 8: 25}

BASE_POINTS = {1: 100, 2: 200, 3: 300, 4: 500}


def fmt(value: float | int, nd: int = 2) -> str:
    """Indonesian number formatting: decimal comma, no trailing zeros."""
    if value is None:
        return "-"
    rounded = round(float(value), nd)
    if abs(rounded - round(rounded)) < 1e-9:
        return str(int(round(rounded)))
    text = f"{rounded:.{nd}f}".rstrip("0").rstrip(".")
    return text.replace(".", ",")


def seed_for(text: str) -> int:
    return int(hashlib.sha256(text.encode("utf-8")).hexdigest()[:12], 16)


def shuffled_options(correct: str, distractors: Sequence[str], seed: str) -> List[str]:
    options = [correct, *distractors]
    if len(set(options)) != len(options):
        raise ValueError(f"Duplicate option detected for question: {seed[:80]!r} -> {options}")
    if len(options) < 4:
        raise ValueError(f"At least 4 options required for: {seed[:80]!r}")
    rng = random.Random(seed_for(seed))
    rng.shuffle(options)
    return options


@dataclass
class Registry:
    items: List[Dict[str, Any]] = field(default_factory=list)
    _texts: Dict[str, str] = field(default_factory=dict)
    _counters: Dict[int, int] = field(default_factory=dict)

    def add(
        self,
        zone: int,
        *,
        subtopic: str,
        difficulty: int,
        text: str,
        qtype: str,
        correct: Any,
        options: Optional[Sequence[str]] = None,
        pairs: Optional[Sequence[Dict[str, str]]] = None,
        items: Optional[Sequence[str]] = None,
        tolerance: Optional[float] = None,
        unit: str = "—",
        formula: str = "—",
        explanation: str,
        steps: Optional[Sequence[str]] = None,
        misconception: str,
        diagram: Optional[Dict[str, Any]] = None,
        time: int = 45,
        objective: str = "",
        verify: Optional[Dict[str, Any]] = None,
        source: str = "Vector Arena — authored & machine-verified",
    ) -> Dict[str, Any]:
        if zone not in ZONES:
            raise ValueError(f"Unknown zone {zone}")
        if difficulty not in BASE_POINTS:
            raise ValueError(f"Difficulty must be 1..4, got {difficulty}")
        if text in self._texts:
            raise ValueError(f"Duplicate question text: {text[:70]!r}")
        self._counters[zone] = self._counters.get(zone, 0) + 1
        seq = self._counters[zone]
        qid = f"VEC-{zone:02d}-{seq:03d}"
        self._texts[text] = qid
        record = {
            "id": qid,
            "zoneId": zone,
            "zoneName": ZONES[zone]["name"],
            "subtopic": subtopic,
            "difficulty": difficulty,
            "basePoints": BASE_POINTS[difficulty],
            "type": qtype,
            "questionText": text,
            "options": list(options) if options else [],
            "pairs": list(pairs) if pairs else [],
            "items": list(items) if items else [],
            "correctAnswer": correct,
            "tolerance": tolerance,
            "unit": unit,
            "formula": formula,
            "explanation": explanation,
            "calculationSteps": list(steps or []),
            "learningObjective": objective
            or f"Siswa mampu menerapkan konsep {subtopic} pada {ZONES[zone]['name']}.",
            "misconception": misconception,
            "diagram": diagram,
            "estimatedTime": time,
            "source": source,
            "status": "PUBLISHED",
            "version": 1,
            "validatedAt": None,
            "verification": verify,
            "history": [],
        }
        self.items.append(record)
        return record

    def mc(
        self,
        zone: int,
        *,
        subtopic: str,
        difficulty: int,
        text: str,
        correct: str,
        distractors: Sequence[str],
        explanation: str,
        misconception: str,
        **kwargs: Any,
    ) -> Dict[str, Any]:
        options = shuffled_options(correct, distractors, seed=text)
        return self.add(
            zone,
            subtopic=subtopic,
            difficulty=difficulty,
            text=text,
            qtype="mc",
            correct=correct,
            options=options,
            explanation=explanation,
            misconception=misconception,
            **kwargs,
        )

    def numeric(
        self,
        zone: int,
        *,
        subtopic: str,
        difficulty: int,
        text: str,
        answer: float,
        nd: int = 2,
        unit: str,
        wrong_answers: Sequence[float],
        explanation: str,
        misconception: str,
        verify: Dict[str, Any],
        **kwargs: Any,
    ) -> Dict[str, Any]:
        correct = fmt(answer, nd)
        distractors: List[str] = []
        for factor in (1.5, 2.0, 0.5, 1.25, 3.0, 0.75):
            wrong_answers = [*wrong_answers, answer * factor, answer + abs(answer) * 0.3 + 1]
        for wrong in wrong_answers:
            candidate = fmt(wrong, nd)
            if candidate == correct or candidate in [correct, *distractors]:
                continue
            distractors.append(candidate)
        if len(distractors) < 3:
            raise ValueError(f"Fewer than 3 unique distractors for: {text[:70]!r} -> {distractors}")
        options = shuffled_options(correct, distractors[:3], seed=text)
        return self.add(
            zone,
            subtopic=subtopic,
            difficulty=difficulty,
            text=text,
            qtype="mc",
            correct=correct,
            options=options,
            unit=unit,
            explanation=explanation,
            misconception=misconception,
            verify=verify,
            **kwargs,
        )

    def counts(self) -> Dict[int, int]:
        return dict(sorted(self._counters.items()))

    def missing(self) -> Dict[int, int]:
        return {z: TARGETS[z] - self._counters.get(z, 0) for z in TARGETS if self._counters.get(z, 0) < TARGETS[z]}


def gva_text(values: Dict[str, Any]) -> str:
    return (
        f"Sebuah bola dilempar vertikal ke atas dengan kecepatan awal {fmt(values['v0'])} m/s "
        f"dari atas bangunan yang tingginya {fmt(values['y0'])} m. "
        f"Gunakan g = {fmt(values['g'])} m/s² dan abaikan hambatan udara."
    )


def motion_diagram(mode: str, **params: Any) -> Dict[str, Any]:
    return {"type": mode, "params": params}