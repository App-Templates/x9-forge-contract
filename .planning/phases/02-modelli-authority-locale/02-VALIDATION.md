---
phase: 02-modelli-authority-locale
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-10-09
---
# Phase 02 Validation

Native Node24/pnpm9; one heavy command at a time, maxWorkers1. Reservation forge-v2-F-authority-locale expires12:03. Commands execute env-i; no secret/environment files.

| Requirement/task | Control | Automated proof | Status |
| --- | --- | --- | --- |
| AUTH-01 / 02-01.1 | GET local-only observation, exact canonical response/auth/params/header/path/barrels | agent-model-local-source-http.test.ts RED before implementation, GREEN; intentional endpoint faults and exactrestore | pending |
| AUTH-02 / 02-01.2 | strict roleless complete source, oldMaster intact, topology34, identity/scope/generation/time/state | agent-model-initial-source.test.ts RED before implementation, GREEN; old c5-model-consumers/source-observation regressions; intentional guard faults/restores | pending |
| AUTH-03 / 02-01.3 | fullnative source beforebuild, complete generateddist and publicformats | fullVitest(maxWorkers1),typecheck,lint,build,check:dts,check:pack,CJSsmoke,36firstentryprocesses; newAPI compiledESM/CJS and separatetypes; code-review + goalverifier | pending |

Wave0 writes new tests first, uses namespace export assertions so missing APIs produce AssertionError rather than module-load failures. No new native test runner or config profile. Workspace scripts are created before invocation; every intentional mutation records semantic assertion RED, exactbyte restore and fresh GREEN. A mutation counts once, not multiplied by failed assertions. No live/runtime handler claim (0/34 flows).

Sampling: focused tests after every task/mutation; full source suite after all code/mutation restorations and BEFORE firstbuild; type/lint/build and package checks once unless changed/failing; independent compiled/public probes on finalgenerateddist. Readonly GSD goalverification then independent otherCodex review of immutable publishedSHA. Failure => genuine gap, reviewed gapplan, no substitutedgreen. Finaldelivery includes R34 actual import/use path and scope limits.
