# Vector Arena — Physics Validation Report

Bank file: `build_bank.py`  
Total questions: **240**

## Zone coverage

| Zone | Name | Questions | Target |
|---:|---|---:|---:|
| 01 | Vector Fundamentals | 25 | 25 |
| 02 | Vector Representation | 25 | 25 |
| 03 | Vector Operations | 35 | 35 |
| 04 | Geometrical Vector Methods | 35 | 35 |
| 05 | Vector Components | 40 | 40 |
| 06 | GVA — Gerak Vertikal ke Atas | 30 | 30 |
| 07 | GVB — Gerak Vertikal ke Bawah | 25 | 25 |
| 08 | GJB — Gerak Jatuh Bebas | 25 | 25 |

## Question type distribution

| Type | Count |
|---|---:|
| matching | 9 |
| mc | 206 |
| multiple_select | 9 |
| ordering | 7 |
| true_false | 9 |

## Difficulty distribution

| Level | Count |
|---:|---:|
| 1 | 33 |
| 2 | 141 |
| 3 | 57 |
| 4 | 9 |

## Automated checks

| Check | Result |
|---|---|
| Schema completeness | 240 questions inspected |
| Numeric answers re-derived from `physics_engine` | 130 |
| Conceptual questions (no numeric block) | 108 |
| Physics engine boundary spot-checks | 21 |
| Errors | 0 |
| Warnings | 0 |

## Errors

- none

## Warnings

- none

## Verified numeric answers (vertical motion)

| ID | Zone | Formula | Value | Unit |
|---|---:|---|---:|---|
| VEC-06-009 | 6 | `t_max = v₀/g` | 2.0 | s |
| VEC-06-010 | 6 | `h_max = v₀²/(2g) ; y_max = y₀ + h_max` | 20.0 | m |
| VEC-06-011 | 6 | `t_total = 2v₀/g` | 4.0 | s |
| VEC-06-012 | 6 | `v = v₀ − gt` | 10.0 | m/s |
| VEC-06-013 | 6 | `t_max = v₀/g` | 3.0 | s |
| VEC-06-014 | 6 | `h_max = v₀²/(2g) ; y_max = y₀ + h_max` | 45.0 | m |
| VEC-06-015 | 6 | `t_total = 2v₀/g` | 6.0 | s |
| VEC-06-016 | 6 | `v = v₀ − gt` | 15.0 | m/s |
| VEC-06-017 | 6 | `t_max = v₀/g` | 1.5 | s |
| VEC-06-018 | 6 | `h_max = v₀²/(2g) ; y_max = y₀ + h_max` | 11.25 | m |
| VEC-06-019 | 6 | `t_total = 2v₀/g` | 3.0 | s |
| VEC-06-020 | 6 | `v = v₀ − gt` | 7.5 | m/s |
| VEC-06-021 | 6 | `t_max = v₀/g` | 2.5 | s |
| VEC-06-022 | 6 | `h_max = v₀²/(2g) ; y_max = y₀ + h_max` | 31.25 | m |
| VEC-06-023 | 6 | `t_total = 2v₀/g` | 5.0 | s |
| VEC-06-024 | 6 | `v = v₀ − gt` | 12.5 | m/s |
| VEC-06-025 | 6 | `t_max = v₀/g` | 4.0 | s |
| VEC-06-026 | 6 | `h_max = v₀²/(2g) ; y_max = y₀ + h_max` | 80.0 | m |
| VEC-06-027 | 6 | `t_total = 2v₀/g` | 8.0 | s |
| VEC-06-036 | 6 | `t = (v₀ + √(v₀² + 2gy₀))/g` | 4.82842712474619 | s |
| VEC-06-041 | 6 | `t = (v₀ + √(v₀² + 2gy₀))/g` | 7.242640687119286 | s |
| VEC-06-059 | 6 | `v = v₀ − gt` | -20 | m/s |
| VEC-06-060 | 6 | `y = y₀ + v₀t − ½gt²` | 15.0 | m |
| VEC-07-009 | 7 | `vₜ = √(v₀² + 2gh)` | 20.615528128088304 | m/s |
| VEC-07-010 | 7 | `vₜ = √(v₀² + 2gh)` | 20.0 | m/s |
| VEC-07-011 | 7 | `vₜ = √(v₀² + 2gh)` | 30.066592756745816 | m/s |
| VEC-07-012 | 7 | `vₜ = √(v₀² + 2gh)` | 15.620499351813308 | m/s |
| VEC-07-013 | 7 | `vₜ = √(v₀² + 2gh)` | 16.0 | m/s |
| VEC-07-014 | 7 | `vₜ = √(v₀² + 2gh)` | 24.0 | m/s |
| VEC-07-015 | 7 | `vₜ = √(v₀² + 2gh)` | 24.49489742783178 | m/s |
| VEC-07-017 | 7 | `t = (−v₀ + √(v₀² + 2gh))/g` | 1.5615528128088303 | s |
| VEC-07-018 | 7 | `t = (−v₀ + √(v₀² + 2gh))/g` | 1.0 | s |
| VEC-07-019 | 7 | `t = (−v₀ + √(v₀² + 2gh))/g` | 2.8066592756745816 | s |
| VEC-07-020 | 7 | `t = (−v₀ + √(v₀² + 2gh))/g` | 0.7620499351813308 | s |
| VEC-07-021 | 7 | `t = (−v₀ + √(v₀² + 2gh))/g` | 1.2 | s |
| VEC-07-022 | 7 | `t = (−v₀ + √(v₀² + 2gh))/g` | 1.8 | s |
| VEC-07-023 | 7 | `t = (−v₀ + √(v₀² + 2gh))/g` | 1.449489742783178 | s |
| VEC-07-024 | 7 | `t = (−v₀ + √(v₀² + 2gh))/g` | 1.0 | s |
| VEC-08-009 | 8 | `t = √(2h/g)` | 1.0 | s |
| VEC-08-010 | 8 | `t = √(2h/g)` | 2.0 | s |
| VEC-08-012 | 8 | `t = √(2h/g)` | 4.0 | s |
| VEC-08-013 | 8 | `t = √(2h/g)` | 5.0 | s |
| VEC-08-014 | 8 | `t = √(2h/g)` | 6.0 | s |
| VEC-08-017 | 8 | `v = √(2gh)` | 10.0 | m/s |
| VEC-08-018 | 8 | `v = √(2gh)` | 20.0 | m/s |
| VEC-08-019 | 8 | `v = √(2gh)` | 30.0 | m/s |
| VEC-08-020 | 8 | `v = √(2gh)` | 40.0 | m/s |
| VEC-08-021 | 8 | `v = √(2gh)` | 50.0 | m/s |
| VEC-08-022 | 8 | `v = √(2gh)` | 60.0 | m/s |
| VEC-08-023 | 8 | `v = √(2gh)` | 15.0 | m/s |
| VEC-08-024 | 8 | `v = √(2gh)` | 25.0 | m/s |
