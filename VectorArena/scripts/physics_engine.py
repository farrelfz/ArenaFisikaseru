"""
Vector Arena — Deterministic Physics Engine
===========================================
Single source of truth for every numerical answer in the Vector Arena question
bank.  The question builder imports this module to compute answers, and the
validator recomputes them independently, so no answer is ever trusted from a
language model.

Conventions
-----------
* g = 10.0 m/s^2 is the SMA (Indonesian high-school) default.  g = 9.8 is
  available explicitly and every function accepts a `g` argument.
* Vertical axis: positive = up.  Therefore a = -g for every vertical mode.
* Angles for vector decomposition are measured counter-clockwise from +x.
* All public functions return **unrounded** floats; rounding is a presentation
  concern (see `fmt`).  This avoids compounding rounding error when components
  are summed.

Dimension table
---------------
`DIMENSIONS` maps a physical quantity to its SI dimension expressed as a tuple
of exponents over (m, kg, s, A).  `assert_dimension` is used by the test suite.
"""

from __future__ import annotations

import math
from typing import Dict, Iterable, List, Sequence, Tuple

Number = float | int

G_DEFAULT = 10.0
G_ACCURATE = 9.8

# (metre, kilogram, second, ampere)
DIMENSIONS: Dict[str, Tuple[int, int, int, int]] = {
    "panjang": (1, 0, 0, 0),
    "perpindahan": (1, 0, 0, 0),
    "jarak": (1, 0, 0, 0),
    "kelajuan": (1, 0, -1, 0),
    "kecepatan": (1, 0, -1, 0),
    "percepatan": (1, 0, -2, 0),
    "waktu": (0, 0, 1, 0),
    "massa": (0, 1, 0, 0),
    "gaya": (1, 1, -2, 0),
    "berat": (1, 1, -2, 0),
    "momentum": (1, 1, -1, 0),
    "impuls": (1, 1, -1, 0),
    "usaha": (2, 1, -2, 0),
    "energi": (2, 1, -2, 0),
    "daya": (2, 1, -3, 0),
    "tekanan": (-1, 1, -2, 0),
    "frekuensi": (0, 0, -1, 0),
    "kuat arus": (0, 0, 0, 1),
    "suhu": (0, 0, 0, 0),
}

VECTOR_QUANTITIES = {
    "perpindahan",
    "kecepatan",
    "percepatan",
    "gaya",
    "berat",
    "momentum",
    "impuls",
    "momen gaya",
    "torsi",
    "medan listrik",
    "medan gravitasi",
    "induksi magnetik",
}

SCALAR_QUANTITIES = {
    "jarak",
    "kelajuan",
    "massa",
    "waktu",
    "suhu",
    "usaha",
    "energi",
    "daya",
    "tekanan",
    "frekuensi",
    "kuat arus",
    "volume",
    "massa jenis",
}


class PhysicsError(ValueError):
    """Raised when a physical parameter set is impossible or meaningless."""


def _require_positive(name: str, value: Number) -> None:
    if value is None or not math.isfinite(value):
        raise PhysicsError(f"{name} harus berupa bilangan berhingga")
    if value < 0:
        raise PhysicsError(f"{name} tidak boleh negatif (diberikan {value})")
    if value == 0:
        raise PhysicsError(f"{name} harus lebih besar dari nol")


def _require_g(g: Number) -> None:
    if g is None or not math.isfinite(g) or g <= 0:
        raise PhysicsError("percepatan gravitasi g harus positif")


# ---------------------------------------------------------------------------
# Zone 01 — Fundamentals
# ---------------------------------------------------------------------------
def is_vector(quantity_name: str) -> bool:
    return quantity_name.strip().lower() in VECTOR_QUANTITIES


def classify_quantity(quantity_name: str) -> str:
    name = quantity_name.strip().lower()
    if name in VECTOR_QUANTITIES:
        return "vektor"
    if name in SCALAR_QUANTITIES:
        return "skalar"
    raise PhysicsError(f"Besaran '{quantity_name}' tidak ada dalam katalog besaran")


def magnitude(x: Number, y: Number, z: Number = 0.0) -> float:
    """|A| = sqrt(x^2 + y^2 + z^2)."""
    return math.sqrt(x * x + y * y + z * z)


def unit_vector(x: Number, y: Number, z: Number = 0.0) -> Tuple[float, float, float]:
    mag = magnitude(x, y, z)
    if mag == 0:
        raise PhysicsError("Vektor nol tidak memiliki vektor satuan")
    return (x / mag, y / mag, z / mag)


def direction_angle(x: Number, y: Number) -> float:
    """atan2(y, x) mapped into [0, 360) degrees.

    The zero vector has no direction, so asking for one is a modelling error
    rather than a case with a defensible answer of 0°.
    """
    if abs(x) <= 1e-15 and abs(y) <= 1e-15:
        raise PhysicsError("Vektor nol tidak memiliki arah")
    return (math.degrees(math.atan2(y, x)) + 360.0) % 360.0


def same_vector(ax: Number, ay: Number, bx: Number, by: Number, tol: float = 1e-9) -> bool:
    return abs(ax - bx) <= tol and abs(ay - by) <= tol


def is_negative_vector(ax: Number, ay: Number, bx: Number, by: Number, tol: float = 1e-9) -> bool:
    return abs(ax + bx) <= tol and abs(ay + by) <= tol


# ---------------------------------------------------------------------------
# Zone 02 — Representation
# ---------------------------------------------------------------------------
def position_vector(x: Number, y: Number) -> Dict[str, object]:
    mag = magnitude(x, y)
    angle = direction_angle(x, y)
    return {
        "x": x,
        "y": y,
        "magnitude": mag,
        "angle": angle,
        "quadrant": quadrant_of(x, y),
        "notation": vector_notation(x, y),
    }


def quadrant_of(x: Number, y: Number) -> str:
    if x == 0 and y == 0:
        return "titik asal"
    if x > 0 and y >= 0:
        return "I"
    if x <= 0 and y > 0:
        return "II"
    if x < 0 and y <= 0:
        return "III"
    return "IV"


def vector_notation(x: Number, y: Number) -> str:
    def term(value: Number, axis: str) -> str:
        if value == 0:
            return ""
        sign = "+" if value > 0 else "−"
        return f"{sign} {abs(value):g}{axis}"

    parts = [f"{x:g}i" if x else "", term(y, "j")]
    body = "".join(p for p in parts if p).strip()
    return body if not body.startswith("+") else body[2:]


def displacement(x0: Number, y0: Number, x1: Number, y1: Number) -> Dict[str, float]:
    dx, dy = x1 - x0, y1 - y0
    return {
        "x": dx,
        "y": dy,
        "magnitude": magnitude(dx, dy),
        "angle": direction_angle(dx, dy),
    }


CARDINALS = ["Timur", "Timur Laut", "Utara", "Barat Laut", "Barat", "Barat Daya", "Selatan", "Tenggara"]


def cardinal(angle: float) -> str:
    """Nearest 8-wind compass label for an angle measured from +x (east)."""
    normalized = angle % 360.0
    index = int(round(normalized / 45.0)) % 8
    return CARDINALS[index]


def opposite_cardinal(label: str) -> str:
    normalized = label.strip().title()
    if normalized not in CARDINALS:
        raise PhysicsError(f"Arah '{label}' bukan arah mata angin 8-wind")
    return CARDINALS[(CARDINALS.index(normalized) + 4) % 8]


# ---------------------------------------------------------------------------
# Zone 03 — Operations
# ---------------------------------------------------------------------------
def _resultant(rx: Number, ry: Number) -> Dict[str, float]:
    """Resultant record.  A zero resultant has magnitude 0 and angle None."""
    zero = abs(rx) <= 1e-15 and abs(ry) <= 1e-15
    return {
        "x": rx,
        "y": ry,
        "magnitude": magnitude(rx, ry),
        "angle": None if zero else direction_angle(rx, ry),
        "isZero": zero,
    }


def add(ax: Number, ay: Number, bx: Number, by: Number) -> Dict[str, float]:
    return _resultant(ax + bx, ay + by)


def subtract(ax: Number, ay: Number, bx: Number, by: Number) -> Dict[str, float]:
    return _resultant(ax - bx, ay - by)


def negate(ax: Number, ay: Number) -> Tuple[float, float]:
    return (-ax, -ay)


def is_zero_resultant(rx: Number, ry: Number, tol: float = 1e-9) -> bool:
    return magnitude(rx, ry) <= tol


# ---------------------------------------------------------------------------
# Zone 04 — Geometrical methods
# ---------------------------------------------------------------------------
def cosine_rule_resultant(a: Number, b: Number, theta_deg: Number) -> float:
    """R = sqrt(a^2 + b^2 + 2ab cos θ), θ = angle between the two vectors."""
    if a < 0 or b < 0:
        raise PhysicsError("Panjang vektor tidak boleh negatif")
    rad = math.radians(theta_deg)
    radicand = a * a + b * b + 2 * a * b * math.cos(rad)
    # Floating point can produce -1e-16 for θ = 180°, a = b.
    return math.sqrt(max(0.0, radicand))


def cosine_rule_angle(a: Number, b: Number, resultant: Number) -> float:
    """Angle between a and b given the resultant magnitude."""
    if a <= 0 or b <= 0:
        raise PhysicsError("Panjang vektor harus positif")
    cos_theta = (resultant * resultant - a * a - b * b) / (2 * a * b)
    cos_theta = max(-1.0, min(1.0, cos_theta))
    return math.degrees(math.acos(cos_theta))


def angle_between(ax: Number, ay: Number, bx: Number, by: Number) -> float:
    ma, mb = magnitude(ax, ay), magnitude(bx, by)
    if ma == 0 or mb == 0:
        raise PhysicsError("Sudut antara vektor tidak terdefinisi untuk vektor nol")
    cos_theta = (ax * bx + ay * by) / (ma * mb)
    return math.degrees(math.acos(max(-1.0, min(1.0, cos_theta))))


# ---------------------------------------------------------------------------
# Zone 05 — Components
# ---------------------------------------------------------------------------
def vector_components(mag: Number, angle_deg: Number) -> Tuple[float, float]:
    """Ax = A cos θ, Ay = A sin θ with θ measured from +x."""
    if mag < 0:
        raise PhysicsError("Besar vektor tidak boleh negatif")
    rad = math.radians(angle_deg)
    return (mag * math.cos(rad), mag * math.sin(rad))


def analytical_resultant(vectors: Sequence[Tuple[Number, Number]]) -> Dict[str, float]:
    """vectors: sequence of (magnitude, angle_from_+x)."""
    rx = ry = 0.0
    for mag, angle in vectors:
        ax, ay = vector_components(mag, angle)
        rx += ax
        ry += ay
    zero = abs(rx) <= 1e-15 and abs(ry) <= 1e-15
    return {
        "rx": rx,
        "ry": ry,
        "magnitude": magnitude(rx, ry),
        "angle": None if zero else direction_angle(rx, ry),
        "quadrant": None if zero else quadrant_of(rx, ry),
        "isZero": zero,
    }


def components_from_axes(ax: Number, ay: Number) -> Dict[str, float]:
    return {
        "rx": ax,
        "ry": ay,
        "magnitude": magnitude(ax, ay),
        "angle": direction_angle(ax, ay),
        "quadrant": quadrant_of(ax, ay),
    }


# ---------------------------------------------------------------------------
# Vertical motion — shared core
# ---------------------------------------------------------------------------
def vertical_state(v0: Number, t: Number, y0: Number = 0.0, g: Number = G_DEFAULT) -> Dict[str, float]:
    """v = v0 - g t ; y = y0 + v0 t - 1/2 g t^2 (positive = up)."""
    _require_g(g)
    if t < 0:
        raise PhysicsError("Waktu tidak boleh negatif")
    v = v0 - g * t
    y = y0 + v0 * t - 0.5 * g * t * t
    return {"v": v, "y": y, "speed": abs(v)}


def vertical_velocity_from_displacement(v0: Number, dy: Number, g: Number = G_DEFAULT) -> float:
    """v = ±sqrt(v0^2 - 2 g dy).  Returns the magnitude of the velocity."""
    _require_g(g)
    radicand = v0 * v0 - 2.0 * g * dy
    if radicand < -1e-9:
        raise PhysicsError("Kombinasi v0 dan perpindahan tidak tercapai secara fisik")
    return math.sqrt(max(0.0, radicand))


# ----- Zone 06 GVA -----
def gva_max_height_time(v0: Number, g: Number = G_DEFAULT) -> float:
    _require_g(g)
    if v0 <= 0:
        raise PhysicsError("GVA memerlukan kecepatan awal ke atas (v0 > 0)")
    return v0 / g


def gva_max_height(v0: Number, y0: Number = 0.0, g: Number = G_DEFAULT) -> float:
    """Peak height measured from the ground (includes y0)."""
    return y0 + gva_max_relative_height(v0, g)


def gva_max_relative_height(v0: Number, g: Number = G_DEFAULT) -> float:
    _require_g(g)
    if v0 < 0:
        raise PhysicsError("GVA memerlukan v0 positif (ke atas)")
    return (v0 * v0) / (2.0 * g)


def gva_total_flight_time(v0: Number, g: Number = G_DEFAULT) -> float:
    """Time to return to the original elevation (y = y0)."""
    return 2.0 * gva_max_height_time(v0, g)


def gva_total_flight_time_to_ground(v0: Number, y0: Number, g: Number = G_DEFAULT) -> float:
    """Time until y = 0 when launched from height y0 (positive root)."""
    if y0 < 0:
        raise PhysicsError("Ketinggian awal tidak boleh negatif")
    disc = v0 * v0 + 2.0 * g * y0
    return (v0 + math.sqrt(disc)) / g


def gva_state_at_t(v0: Number, t: Number, y0: Number = 0.0, g: Number = G_DEFAULT) -> Dict[str, float]:
    return vertical_state(v0, t, y0, g)


# ----- Zone 07 GVB -----
def gvb_final_velocity(v0_down: Number, h: Number, g: Number = G_DEFAULT) -> float:
    """vt = sqrt(v0^2 + 2 g h) for a body thrown downward with speed v0."""
    _require_g(g)
    if h < 0:
        raise PhysicsError("Ketinggian tidak boleh negatif")
    if v0_down < 0:
        raise PhysicsError("GVB memerlukan kecepatan awal ke bawah")
    if h == 0 and v0_down == 0:
        raise PhysicsError("GVB memerlukan kecepatan awal atau ketinggian positif")
    return math.sqrt(v0_down * v0_down + 2.0 * g * h)


def gvb_fall_time(v0_down: Number, h: Number, g: Number = G_DEFAULT) -> float:
    """Solve h = v0 t + 1/2 g t^2 for t > 0."""
    _require_g(g)
    if h < 0:
        raise PhysicsError("Ketinggian tidak boleh negatif")
    if v0_down < 0:
        raise PhysicsError("GVB memerlukan kecepatan awal ke bawah")
    if h == 0:
        raise PhysicsError("GVB memerlukan ketinggian positif")
    disc = v0_down * v0_down + 2.0 * g * h
    return (-v0_down + math.sqrt(disc)) / g


def gvb_distance_at_t(v0_down: Number, t: Number, g: Number = G_DEFAULT) -> float:
    if t < 0:
        raise PhysicsError("Waktu tidak boleh negatif")
    return v0_down * t + 0.5 * g * t * t


# ----- Zone 08 GJB -----
def gjb_fall_time(h: Number, g: Number = G_DEFAULT) -> float:
    _require_g(g)
    _require_positive("ketinggian", h)
    return math.sqrt(2.0 * h / g)


def gjb_impact_velocity(h: Number, g: Number = G_DEFAULT) -> float:
    _require_g(g)
    _require_positive("ketinggian", h)
    return math.sqrt(2.0 * g * h)


def gjb_height_from_time(t: Number, g: Number = G_DEFAULT) -> float:
    _require_g(g)
    if t < 0:
        raise PhysicsError("Waktu tidak boleh negatif")
    return 0.5 * g * t * t


def gjb_speed_from_time(t: Number, g: Number = G_DEFAULT) -> float:
    _require_g(g)
    if t < 0:
        raise PhysicsError("Waktu tidak boleh negatif")
    return g * t


# ---------------------------------------------------------------------------
# Dimensional analysis helpers (used by validator + tests)
# ---------------------------------------------------------------------------
def dimension_of(quantity: str) -> Tuple[int, int, int, int]:
    key = quantity.strip().lower()
    if key not in DIMENSIONS:
        raise PhysicsError(f"Dimensi '{quantity}' belum terdaftar")
    return DIMENSIONS[key]


def same_dimension(a: str, b: str) -> bool:
    return dimension_of(a) == dimension_of(b)


def assert_dimension(quantity: str, expected: Tuple[int, int, int, int]) -> None:
    actual = dimension_of(quantity)
    if actual != expected:
        raise AssertionError(f"Dimensi {quantity} {actual} != {expected}")


def is_valid_parameter_set(mode: str, **params: Number) -> bool:
    """Boundary guard reused by the API before scoring a numeric answer."""
    try:
        if mode == "gva":
            if params.get("v0", 0) <= 0 or params.get("g", G_DEFAULT) <= 0:
                return False
            if params.get("y0", 0) < 0:
                return False
        elif mode == "gvb":
            if params.get("v0", 0) < 0 or params.get("h", 0) < 0:
                return False
        elif mode == "gjb":
            if params.get("h", 0) <= 0:
                return False
            if params.get("v0", 0) != 0:
                return False
        elif mode in {"vector", "components"}:
            if params.get("magnitude", 0) < 0:
                return False
        else:
            return False
    except (TypeError, ValueError):
        return False
    return True


__all__ = [
    "G_DEFAULT",
    "G_ACCURATE",
    "DIMENSIONS",
    "VECTOR_QUANTITIES",
    "SCALAR_QUANTITIES",
    "PhysicsError",
    "is_vector",
    "classify_quantity",
    "magnitude",
    "unit_vector",
    "direction_angle",
    "same_vector",
    "is_negative_vector",
    "position_vector",
    "quadrant_of",
    "vector_notation",
    "displacement",
    "cardinal",
    "opposite_cardinal",
    "add",
    "subtract",
    "negate",
    "is_zero_resultant",
    "cosine_rule_resultant",
    "cosine_rule_angle",
    "angle_between",
    "vector_components",
    "analytical_resultant",
    "components_from_axes",
    "vertical_state",
    "vertical_velocity_from_displacement",
    "gva_max_height_time",
    "gva_max_height",
    "gva_max_relative_height",
    "gva_total_flight_time",
    "gva_total_flight_time_to_ground",
    "gva_state_at_t",
    "gvb_final_velocity",
    "gvb_fall_time",
    "gvb_distance_at_t",
    "gjb_fall_time",
    "gjb_impact_velocity",
    "gjb_height_from_time",
    "gjb_speed_from_time",
    "dimension_of",
    "same_dimension",
    "assert_dimension",
    "is_valid_parameter_set",
]