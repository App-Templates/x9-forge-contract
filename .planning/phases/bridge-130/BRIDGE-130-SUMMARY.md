# BRIDGE-130 — execution record

Status: COMPLETE — implemented and tested; ready for independent review. Base d574f68 (1.29.0), branch
codex/bridge-130. Scope and decisions: BRIDGE-130-PLAN.md. Product decisions
D-A0..D-A8 confirmed at 01:35/01:40; no expansion into product work; meditation remains stopped.

## Tasks

| Task | Status | Red | Green | Mutation checks |
| --- | --- | --- | --- | --- |
| 1 — explicit identity | done | 12/12 failed | 12/12 passed | 4/4 killed |
| 2 — runtime and channels | done | 32/32 failed | 44/44 passed (32 new) | 10/10 killed |
| 3 — additive list metadata | done | 15 failed / 21 (6 compatibility passed) | 82/82 passed (24 task tests) | 11/11 killed |
| 4 — conservative lookup | done | 26 failed / 28 (2 export/path checks passed) | 110/110 passed (28 task tests); CJS 6/6, ESM 6/6 | 11/11 killed (9 lookup + 2 CJS wiring) |

Outputs will be saved under evidence/ in this directory. Full verification and
producer/consumer migration limits will be recorded after task completion.

## Task 1 — explicit identity

The pair preserves management x9-staging and runtime x9 without hard-coded
aliases; one identifier cannot name multiple agents across either namespace.
No numeric coercion or missing-ID inference. Public agent subpath exports added.
Red: evidence/task-1-red.txt (12 failures, exports absent).
Green: evidence/task-1-green.txt (12/12 tests).
Mutations: ambiguity guard, empty management ID, numeric coercion and inferred
runtime ID, all 4/4 rejected by assertion failures in the private copy; their
outputs are evidence/task-1-mutation-*.txt. Private copy restored after each.

Ultimo aggiornamento: 23:44

Evidence uses .txt so the original captured output is tracked despite the repository log ignore rule.
Ultimo aggiornamento: 23:44

## Task 2 — runtime and channels

Generic channels reuse the messaging enum plus additive web. Each channel has
loading evidence, its own state and independent readiness. Paused is non-error.
Canonical active requires observed loaded=true even for capability-owned channels;
legacy bot status is irrelevant. Explicit stopped/error remain distinguishable;
no-channel requires a loaded agent plus complete, known unloaded channels.
Contradictory claimed states, stopped-plus-loaded and duplicate channel IDs fail.
Red: evidence/task-2-red.txt (32/32 failed, exports absent).
Green: evidence/task-2-green.txt (44/44, including 12 identity regressions).
Mutations: channel consistency, duplicate channel IDs, stopped contradiction, claimed
state, readiness replacing loading, inventory completeness, known unloaded evidence,
pause treated as error, explicit agent error, explicit stopped; 10/10 tests fail.
Four fail an assertion, six reject a previously valid fixture with a ZodError after
the derivation was mutated. All outputs saved; private source restored each time.
The private runner initially counted only assertion failures, returned 1, then its
classification was corrected against the same captured outputs: no test rerun or
product change was needed.

Ultimo aggiornamento: 23:46

## Task 3 — additive list metadata

Optional identity/runtime/source fields preserve valid 1.29 payloads and all five
legacy statuses unchanged. The list rejects duplicate names, aliases shared with
legacy rows, row/runtime-ID mismatches and unsupported state evidence. A complete
source must be available; an available source has an ISO observation time and X9
authority. Missing fields are never defaulted into a false complete/available list.
Red: evidence/task-3-red.txt (15 failed, 6 compatibility tests passed, 21 total).
First green: evidence/task-3-green.txt (79/79).
Final green: evidence/task-3-green-final.txt (82/82, 24 task tests plus 58 regressions).
Mutations: complete-source consistency, observation, ISO timestamp, X9 authority,
required completeness/availability/authority/time, identity match, cross-row
collision validation and optional metadata compatibility; final 11/11 killed.
The initial completeness mutation survived because the test omitted two fields
together; evidence/task-3-mutation-source-coverage-survived.txt preserves that
result. Tests now omit all four fields separately. That same mutant then fails
its assertion; the corrected green and all final red outputs are saved.

Ultimo aggiornamento: 23:49

## Task 4 — conservative lookup and public consumers

getListAgentsRuntimeState is exported by @x9-forge/contracts/http. It validates
the payload before selecting an exact runtime or explicitly mapped management
ID. No fuzzy names, numeric database ID conversion, case folding, stale database
status or fallback from missing rows. Only available X9 observations supply state.
A partial list can prove a present channel loaded; absent/legacy data stay unknown.
Red: evidence/task-4-red-final.txt (26/28 failed, after making rejection checks
assert the expected schema message instead of accepting an unrelated exception).
Initial output is also preserved. Green: evidence/task-4-green.txt (110/110,
including 28 new lookup tests). Both real Node CJS and ESM probes first failed for
the absent helper after a private build, then the ESM probe passed 6/6; the corrected CJS proof is
recorded in the follow-up below. The new CJS probe is invoked by the existing standard smoke test.
Mutations: availability, missing source, management target, fuzzy match, case
folding, legacy fallback, absent-to-stopped, payload validation and partial-list
acceptance; 9/9 killed by specific regression assertions. All captured outputs
are under evidence/task-4-*.txt. No dist or package metadata was generated in
the assigned worktree; only the isolated private copy was built.

Ultimo aggiornamento: 23:52

### Task 4 follow-up — meaningful CJS wiring

Inspection found the first standard smoke output only ran its old 36 probes:
the appended require was after process.exit(0). The initial task-4-cjs-green.txt
therefore does NOT prove the new six CJS assertions. A new integration probe
asserts both successful exit and the six-assertion marker in the child output.
It failed first (task-4-cjs-wiring-red.txt); moving the require before exit made
it pass 2/2 (task-4-cjs-wiring-green.txt). Corrected standard smoke now proves
36/36 old probes plus 6/6 new assertions (task-4-cjs-green-final.txt).
Removing the require and forcing a nonzero exit both kill the integration probe,
2/2 additional mutations. The private source is restored. No product source
changed in this follow-up commit. ESM remains independently verified 6/6.

Ultimo aggiornamento: 23:53

## Final guard coverage — input boundaries

Added 17 boundary tests for required fields, scalar types and vocabularies.
Each was run first with its targeted schema protection disabled in the private
copy: 17/17 actual regression failures saved as evidence/boundary-mutation-*.txt.
The restored contract passes 17/17 (evidence/boundary-green.txt). Product source
was unchanged; the error channel fixture prevents a consistency check from
masking a missing-field bug. Missing channel inventories must not default to [].
Mutation coverage totals 53/53 killed: 4 identity, 10 runtime, 11 list, 11 lookup/
CJS wiring and 17 boundaries. The one initially surviving list mutation remains
recorded separately and was killed after strengthening the test.
The earlier full suite passed 1532/1532 in 97/97 files; the suite is repeated
once because these 17 meaningful boundary tests were added afterward.

Ultimo aggiornamento: 23:57

## Final verification and limits

| Check | Result | Captured output |
| --- | --- | --- |
| Complete source suite, one worker | 1549/1549 tests, 98/98 files | evidence/full-source-suite-final.txt |
| New source tests | 113/113 within the full suite | 12 identity + 32 runtime + 24 list + 28 lookup + 17 boundaries |
| Mutation protection | 53/53 killed; one initial survivor corrected | evidence/mutation-results.json and individual red outputs |
| tsc --noEmit | exit 0; no source changes afterward | evidence/typecheck.txt, verification-results.json |
| Lint changed TypeScript | exit 0 on 11/11 files | evidence/changed-source-lint-final.txt |
| Private dual build | exit 0; 262/262 declarations portable | evidence/task-4-private-build-green.txt |
| Real CJS public consumption | 36/36 old probes + 6/6 new assertions | evidence/task-4-cjs-green-final.txt |
| CJS integration wiring | 2/2 assertions | evidence/task-4-cjs-wiring-green.txt |
| Real ESM public consumption | 6/6 assertions | evidence/task-4-mjs-green.txt |
| Configured package checks | publint + attw exit 0 | evidence/private-package-check.txt |
| Private source restored | 131/131 files identical to assigned worktree | evidence/private-source-restored.json |
| Product diff whitespace | exit 0 | evidence/productDiff-check-final.txt |
| Whole diff whitespace | exit 2 from retained raw output whitespace | evidence/wholeDiff-check-final.txt |

The package check reports a root types interop warning. Its configured Node16
profile excludes node10 resolution and false-cjs, exactly as the existing script;
this is not an assertion that all possible package profiles are warning-free.
No version/CHANGELOG/dist differences and no perimeter violations. Evidence
outputs are kept verbatim, including whitespace. Their hashes are recorded in
evidence/evidence-manifest.json. No check is reported as live verification.

## Before → after and proof

| Requirement | Before → after | Verified by |
| --- | --- | --- |
| Identity | Runtime ID guessed from management slug → explicit unique pair, collision rejection | agent-runtime-identity.test.ts; internal-agents-runtime-list.test.ts |
| Agent state | Legacy bot-less/running can be mistaken for active → only observed loaded channels prove active; missing information stays unknown | agent-runtime-state.test.ts; internal-agents-runtime-lookup.test.ts |
| Channels | No per-agent wire inventory → individual loaded/paused/stopped/error/unknown plus separate readiness | agent-runtime-state.test.ts; agent-runtime-boundaries.test.ts |
| Source | Empty or unavailable list indistinguishable → explicit availability, completeness and observation time | internal-agents-runtime-list.test.ts; internal-agents-runtime-lookup.test.ts |
| Compatibility | Existing 1.29 payload → identical parsed fields and conservative canonical unknown | internal-agents-runtime-list.test.ts; real CJS/ESM smoke |

No task skipped and no required file outside the perimeter. Four product commits:
a88374c identity, 53d5a04 runtime/channels, 429b7ac list metadata, 9a5c602 lookup.
Two separate test-strengthening commits: c3509bc CJS execution, 5902885 boundaries.
The migration guide is BRIDGE-130-MIGRATION.md. This contract does not collect
live channels in X9 or update Forge consumers: those tasks depend on the
coordinator's release and subsequent integration. No release, push, merge, deploy,
server access, browser action, secret read or other worktree edit was performed.
Meditation remained stopped. The assigned worktree is frozen after delivery.

Ultimo aggiornamento: 23:59
