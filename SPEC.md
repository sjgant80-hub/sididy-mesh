# sididy-mesh — specification

## Purpose

The wire-up — every estate organ running as one live mesh: nodes (each a wisp folding into fall-remember, kappa-gated, liveness-watched, budget-governed) bound by LIGHT, reporting whether the whole is alive.

## Contract

- **LiveMesh** — part of the sididy-mesh public surface; deterministic, total (never throws).
- **LiveNode** — part of the sididy-mesh public surface; deterministic, total (never throws).
- **default** — part of the sididy-mesh public surface; deterministic, total (never throws).

## Guarantees

- **Deterministic** — the same input yields the same output on any machine, any run.
- **Total** — hostile or malformed input returns a defined value, never an exception.
- **Zero-dependency** — no third-party runtime code inside the trust boundary.

## Verification

The suite exercises the public surface directly and is mutation-checked: a change to any guarded line makes a
test fail. konomify admits sididy-mesh only when both the structure rubric (acg-assessor) and the behaviour gate
(witness) pass.
