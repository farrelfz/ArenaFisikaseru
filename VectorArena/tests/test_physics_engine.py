"""Deterministic unit tests for the Vector Arena physics engine.

Every expected value below is derived by hand from the kinematic / vector
equations (not from the engine), so a regression in the engine shows up as a
genuine disagreement rather than a self-fulfilling assertion.

Run with:
    /home/si/AI-Workspace/.venv/bin/python -m pytest tests -q
"""

from __future__ import annotations

import math
import os
import sys

import pytest

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPTS = os.path.normpath(os.path.join(HERE, "..", "scripts"))
if SCRIPTS not in sys.path:
    sys.path.insert(0, SCRIPTS)

import physics_engine as pe  # noqa: E402


# ---------------------------------------------------------------------------
# Zone 01-03 — vectors
# ---------------------------------------------------------------------------
class TestMagnitude:
    def test_pythagorean_triple(self):
        assert pe.magnitude(3, 4) == pytest.approx(5.0)

    def test_negative_components(self):
        # (-6, 8) -> 10 ; sign must not leak into the magnitude
        assert pe.magnitude(-6, 8) == pytest.approx(10.0)
        assert pe.magnitude(-6, -8) == pytest.approx(10.0)

    def test_zero_vector(self):
        assert pe.magnitude(0, 0) == 0.0

    def test_pure_axis(self):
        assert pe.magnitude(0, -7.5) == pytest.approx(7.5)
        assert pe.magnitude(7.5, 0) == pytest.approx(7.5)


class TestDirectionAngle:
    """θ = atan2(Ry, Rx) normalised to [0°, 360°)."""

    @pytest.mark.parametrize(
        "x,y,expected",
        [
            (1, 0, 0.0),        # +x axis
            (0, 1, 90.0),       # +y axis
            (-1, 0, 180.0),     # -x axis (quadrant boundary)
            (0, -1, 270.0),     # -y axis (quadrant boundary)
            (1, 1, 45.0),       # quadrant I
            (-1, 1, 135.0),     # quadrant II
            (-1, -1, 225.0),    # quadrant III
            (1, -1, 315.0),     # quadrant IV
        ],
    )
    def test_all_quadrants(self, x, y, expected):
        assert pe.direction_angle(x, y) == pytest.approx(expected)

    def test_angle_never_negative(self):
        for x, y in [(1, -1), (3, -4), (0.001, -100)]:
            assert 0.0 <= pe.direction_angle(x, y) < 360.0

    def test_zero_vector_rejected(self):
        with pytest.raises(pe.PhysicsError):
            pe.direction_angle(0, 0)


class TestVectorComponents:
    def test_cardinal_angles(self):
        assert pe.vector_components(10, 0) == pytest.approx((10, 0))
        assert pe.vector_components(10, 90) == pytest.approx((0, 10))
        assert pe.vector_components(10, 180) == pytest.approx((-10, 0))
        assert pe.vector_components(10, 270) == pytest.approx((0, -10))

    def test_negative_magnitude_rejected(self):
        with pytest.raises(pe.PhysicsError):
            pe.vector_components(-1, 0)

    def test_roundtrip_with_direction_angle(self):
        for mag, ang in [(5, 37), (12, 200), (1, 359)]:
            x, y = pe.vector_components(mag, ang)
            assert pe.magnitude(x, y) == pytest.approx(mag)
            assert pe.direction_angle(x, y) == pytest.approx(ang, abs=1e-9)


class TestAddSubtract:
    def test_cancelling_vectors(self):
        r = pe.add(-5, 2, 5, -2)
        assert r["x"] == 0 and r["y"] == 0
        assert r["magnitude"] == 0
        # a zero resultant carries no direction at all
        assert r["angle"] is None and r["isZero"] is True

    def test_subtract_gives_pythagorean(self):
        r = pe.subtract(6, 2, 2, 5)  # (4, -3)
        assert r["magnitude"] == pytest.approx(5.0)
        assert r["angle"] == pytest.approx(pe.direction_angle(4, -3))

    def test_not_commutative_for_subtraction(self):
        ab = pe.subtract(3, 1, 1, 4)
        ba = pe.subtract(1, 4, 3, 1)
        assert (ab["x"], ab["y"]) == (-ba["x"], -ba["y"])

    def test_negate(self):
        assert pe.negate(2, -3) == (-2, 3)


class TestCosineRuleResultant:
    def test_perpendicular(self):
        assert pe.cosine_rule_resultant(3, 4, 90) == pytest.approx(5.0)

    def test_equal_vectors_60(self):
        # √(25 + 25 + 2·25·0.5) = √75 = 5√3
        assert pe.cosine_rule_resultant(5, 5, 60) == pytest.approx(5 * math.sqrt(3))

    def test_equal_vectors_120(self):
        # √(25 + 25 − 25) = 5
        assert pe.cosine_rule_resultant(5, 5, 120) == pytest.approx(5.0)

    def test_parallel(self):
        assert pe.cosine_rule_resultant(4, 7, 0) == pytest.approx(11.0)

    def test_antiparallel(self):
        assert pe.cosine_rule_resultant(4, 7, 180) == pytest.approx(3.0)


# ---------------------------------------------------------------------------
# Zone 06 — GVA (thrown upward, positive = up, a = −g)
# ---------------------------------------------------------------------------
class TestGVA:
    def test_time_to_apex(self):
        assert pe.gva_max_height_time(20, 10) == pytest.approx(2.0)

    def test_time_to_apex_scales_with_g(self):
        assert pe.gva_max_height_time(20, 9.8) == pytest.approx(20 / 9.8)

    def test_max_height_from_ground(self):
        # 20²/(2·10) = 20 m
        assert pe.gva_max_height(20, 0, 10) == pytest.approx(20.0)

    def test_max_height_from_elevated_start(self):
        # balcony 12 m, v0 = 8 -> 12 + 64/20 = 15.2 m
        assert pe.gva_max_height(8, 12, 10) == pytest.approx(15.2)

    def test_total_flight_time_symmetric(self):
        assert pe.gva_total_flight_time(20, 10) == pytest.approx(4.0)

    def test_total_flight_time_from_elevation(self):
        # 0 = 12 + 8t − 5t² -> t = (8 + √(64 + 240))/10 = (8+√304)/10
        expected = (8 + math.sqrt(8 ** 2 + 2 * 10 * 12)) / 10
        assert pe.gva_total_flight_time_to_ground(8, 12, 10) == pytest.approx(expected)

    def test_state_at_apex(self):
        state = pe.vertical_state(20, 2, 0, 10)
        assert state["v"] == pytest.approx(0.0, abs=1e-12)
        assert state["y"] == pytest.approx(20.0)

    def test_velocity_after_half_rise(self):
        assert pe.vertical_state(20, 1, 0, 10)["v"] == pytest.approx(10.0)

    def test_velocity_becomes_negative_on_descent(self):
        assert pe.vertical_state(20, 3, 0, 10)["v"] == pytest.approx(-10.0)

    def test_zero_launch_speed_rejected(self):
        with pytest.raises(pe.PhysicsError):
            pe.gva_max_height_time(0)

    def test_negative_launch_speed_rejected(self):
        with pytest.raises(pe.PhysicsError):
            pe.gva_max_height(-5)

    def test_zero_gravity_rejected(self):
        with pytest.raises(pe.PhysicsError):
            pe.gva_max_height_time(10, g=0)


# ---------------------------------------------------------------------------
# Zone 07 — GVB (thrown downward, v0 > 0)
# ---------------------------------------------------------------------------
class TestGVB:
    def test_final_velocity(self):
        # √(10² + 2·10·15) = √400 = 20
        assert pe.gvb_final_velocity(10, 15, 10) == pytest.approx(20.0)

    def test_fall_time(self):
        # 15 = 10t + 5t² -> t = 1
        assert pe.gvb_fall_time(10, 15, 10) == pytest.approx(1.0)

    def test_distance_at_t(self):
        # 5·2 + ½·10·4 = 10 + 20 = 30
        assert pe.gvb_distance_at_t(5, 2, 10) == pytest.approx(30.0)

    def test_zero_initial_velocity_matches_free_fall(self):
        assert pe.gvb_final_velocity(0, 20, 10) == pytest.approx(pe.gjb_impact_velocity(20, 10))
        assert pe.gvb_fall_time(0, 45, 10) == pytest.approx(pe.gjb_fall_time(45, 10))

    def test_negative_downward_velocity_rejected(self):
        # Downward speed is a magnitude here; a negative value is a sign-convention error.
        with pytest.raises(pe.PhysicsError):
            pe.gvb_final_velocity(-1, 10)

    def test_zero_height_rejected(self):
        with pytest.raises(pe.PhysicsError):
            pe.gvb_fall_time(5, 0)


# ---------------------------------------------------------------------------
# Zone 08 — GJB (released from rest, v0 = 0)
# ---------------------------------------------------------------------------
class TestGJB:
    def test_fall_time(self):
        assert pe.gjb_fall_time(45, 10) == pytest.approx(3.0)

    def test_fall_time_decimal_height(self):
        # √(2·1.25/10) = 0.5
        assert pe.gjb_fall_time(1.25, 10) == pytest.approx(0.5)

    def test_impact_velocity(self):
        assert pe.gjb_impact_velocity(45, 10) == pytest.approx(30.0)

    def test_height_from_time(self):
        assert pe.gjb_height_from_time(3, 10) == pytest.approx(45.0)

    def test_speed_from_time(self):
        assert pe.gjb_speed_from_time(2.5, 10) == pytest.approx(25.0)

    def test_zero_height_rejected(self):
        with pytest.raises(pe.PhysicsError):
            pe.gjb_fall_time(0)

    def test_negative_time_rejected(self):
        with pytest.raises(pe.PhysicsError):
            pe.gjb_height_from_time(-1)


# ---------------------------------------------------------------------------
# Cross-zone consistency: the three vertical models must agree on the overlap
# ---------------------------------------------------------------------------
class TestCrossZoneConsistency:
    def test_gva_descent_matches_gvb(self):
        """The downward leg of a GVA from apex must equal GVB from the same height."""
        v0, g = 20, 10
        h_apex = pe.gva_max_height(v0, 0, g)
        t_up = pe.gva_max_height_time(v0, g)
        t_total = pe.gva_total_flight_time(v0, g)
        t_down = t_total - t_up
        assert t_down == pytest.approx(pe.gjb_fall_time(h_apex, g))
        # speed at the ground equals the launch speed by energy symmetry
        assert pe.gjb_impact_velocity(h_apex, g) == pytest.approx(v0)

    def test_apex_velocity_is_continuously_zero(self):
        v0, g = 30, 9.8
        t_apex = pe.gva_max_height_time(v0, g)
        for dt in (-1e-6, 0.0, 1e-6):
            assert abs(pe.vertical_state(v0, t_apex + dt, 0, g)["v"]) < 1e-5

    def test_bank_report_consistency(self):
        """Every vertical formula used in the bank resolves through the engine."""
        for fn in (
            "gva_max_height_time",
            "gva_max_height",
            "gva_total_flight_time",
            "gva_total_flight_time_to_ground",
            "gvb_final_velocity",
            "gvb_fall_time",
            "gvb_distance_at_t",
            "gjb_fall_time",
            "gjb_impact_velocity",
            "gjb_height_from_time",
            "gjb_speed_from_time",
        ):
            assert callable(getattr(pe, fn, None)), f"engine is missing {fn}"
