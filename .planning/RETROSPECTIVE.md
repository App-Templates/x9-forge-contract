# Retrospective — x9-forge-contract-bridge

Living retrospective. New milestone sections appended above "## Cross-Milestone Trends".

---

## Milestone: v1.0 — Bridge Foundation

**Shipped:** 2026-04-16
**Phases:** 8 (+ 04.1 INSERTED + Phase M letter mini-phase) | **Plans:** 24 + 1
**Tag:** `v1.0` (commit `1d709a1`)

### What Was Built

A cross-repo TypeScript contracts package consolidating 11 HTTP endpoints, vault 3-tier semantics, AgentContext split (Core vs Runtime), discriminated auth headers (Bug #15 compile-time guard), and 7 greenfield Model Router schemas. The bridge becomes the single source of truth between agent-x9 and forge-v2; a contract change incompatible with consumers now produces a TypeScript compile error before deploy.

### What Worked

1. **Strangler-fig migration pattern** — every phase shipped with compat shim re-exports in agent-x9 + forge-v2 `packages/types/`, never a big-bang switch. X9 in production never stopped during the entire migration.

2. **Cross-repo drift guard via contract tests** — landing in Phase 4 (agent-core), extended to Phase 5 (Forge `sync-all.contract.test.ts`). Bridge schema change → consumer test fails. This catches the failure mode the bridge was created to prevent.

3. **Greenfield Model Router contracts in Phase 6** — Stefano's choice to introduce 7 new schemas in v1.0 (rather than retrofit after Phase 35 X9) saved a future migration cycle and gave Phase 35 + Phase 10 Forge UI a frozen contract surface to consume.

4. **Phase 04.1 INSERTED for R-09** — when Phase 4 execution surfaced duplicated `capBridgeClient` helpers in X9 + Forge, the right move was a surgical mini-phase (NoAuthBridgeClient + factory `'none'` variant) rather than expanding Phase 4 scope or deferring to Phase 7. Decimal phase numbering paid off.

5. **Phase M letter mini-phase for Memory Engine v2** — parallel-capable, zero consumer touch, no REQ assignment needed. The letter-phase pattern (orthogonal to the integer phase chain) is right for "drop-in additions" that don't fit the dependency graph.

6. **Audit-then-archive flow** — running `/gsd-audit-milestone` before `/gsd-complete-milestone` surfaced the bookkeeping debt explicitly. Path B (archive with Known Gaps) was a coherent choice once the integration checker confirmed the code actually shipped — paperwork for paperwork's sake would have been waste.

7. **Branded IDs limited to 5 types** (AgentId, OwnerId, TenantId, SessionId, ConversationId) — anti-pattern AF-02 ("brand every string") avoided. The narrow application of branding paid off: it caught real ID-mixing bugs in Phase 2 single-agent fallback paths.

### What Was Inefficient

1. **VERIFICATION.md and SUMMARY.md inconsistency.** Phases 0, 2, 6, M shipped without their formal verifier artifacts. Phase 2 went further: 3 PLANs but 0 SUMMARYs. The work was real (integration checker confirmed), but the paper trail did not keep pace. **Lesson:** when running auto-chain (discuss → plan → execute → verify) in a single session, the SUMMARY/VERIFICATION write-step gets skipped silently. Need a hard gate.

2. **VALIDATION.md frontmatter never flipped post-execution.** All 4 phases that authored a VALIDATION.md (02, 03, 05, 06) left `nyquist_compliant: false` / `status: draft` after the phase actually passed. The Nyquist gate exists, the docs got authored, the flip-after-pass step did not run.

3. **REQUIREMENTS.md traceability table never ticked off.** 0 of 72 boxes were ever checked during execution. The table was used as input (planning) and as audit input (cross-reference) but never as a running scoreboard.

4. **RLSE-02..05 cross-cutting requirements drifted to orphan status.** Atomic SHA bump discipline / `@deprecated` workflow / CHANGELOG.md / per-migration README updates were never explicitly attested in any SUMMARY frontmatter. Practice was followed implicitly (PR #1 demonstrates RLSE-01) but the bookkeeping never landed.

5. **R-09 added in Phase 04.1 was never back-filled into REQUIREMENTS.md.** New REQs that emerge during execution should be added to the traceability table at the moment of insertion, not "later".

6. **Zod v4 gotchas cost iteration.** `.refine(fn, fnMessage)` form broken in 4.3.6 → had to migrate `ModelTierMapping` to `superRefine`. `z.record(enum, value)` strict-completeness required `.optional()` workaround for partial mappings. These cost an extra iteration in Phase 6.

### Patterns Established (v1.0 conventions worth carrying forward)

- **Phase decimal numbering** for INSERTED urgent work (`04.1`) — semantic clarity, no renumbering chaos.
- **Phase letter numbering** for orthogonal mini-phases (`M`) — parallel-capable, no dependency on integer chain.
- **Compat shim re-export pattern** — `packages/types/` in each consumer re-exports from `@x9-forge/contracts/<sub-path>`. Migration is incremental, removal is Phase 7.
- **Contract test as drift guard** — every consumer migrating to the bridge gets a contract test that fails when the bridge schema changes. Lives in the consumer repo.
- **`{ok, data}` / `{ok, code, message, details?}` standardized envelopes** — defined and wired into error path; legacy endpoint success shapes preserve consumer compat (revisit at SHA bump).
- **Sub-path exports per domain** (`./capability`, `./agent`, `./auth`, `./http`, `./vault`, `./model-router`, `./memory`) — root `index.ts` does NOT kitchen-sink; consumers always import via sub-path.
- **`git+https#SHA` versioning** — no registry, no submodule, no semver. Atomic SHA bump in 2 consumers per breaking change.
- **`pnpm.overrides link:`** for dev hot-reload — modify in bridge, consumer sees change at save.

### Key Lessons

1. **Auto-chain skips paperwork.** When discuss → plan → execute → verify runs as one chained session, the SUMMARY and VERIFICATION write-steps don't fire reliably. Either gate the chain hard, or run verify as a separate session.
2. **REQUIREMENTS.md needs to be a living scoreboard.** Tick boxes as work lands, not at audit time. Missing this means the audit has to reconstruct status from VERIFICATION + SUMMARY frontmatter cross-references.
3. **Cross-cutting requirements need explicit phase ownership.** RLSE-02..05 belonged "to every phase" in the original mapping — and so belonged to none. Either assign to a specific phase or carve out a transverse plan.
4. **New REQs surfaced mid-execution must be back-filled immediately.** R-09 is the cautionary tale.
5. **Audit before archive.** The `gaps_found` audit verdict was useful — it surfaced the documentation debt explicitly so the milestone could be archived with a Known Gaps section rather than implicitly accepting the gaps.
6. **Integration checker substitutes for retroactive VERIFICATION.** When the code actually works, the test suite passes, and the cross-phase wires are verified, retroactively writing per-phase VERIFICATION docs is paperwork-for-paperwork's-sake. Path B (archive with explicit Known Gaps) is the right call.

### Cost Observations

- **Sessions:** primarily Opus 4.6 (executor + planner config: `opus / opus`).
- **Notable efficiency win:** integration checker as a 1-shot subagent at audit time replaced the need for retroactive per-phase verification — saved a half-dozen agent runs.
- **Notable inefficiency:** Zod v4 gotchas in Phase 6 (superRefine migration, record-enum optional) cost extra iteration the planning didn't anticipate.

### Post-shipping Backfill (2026-04-16)

After v1.0 was already merged (PR #1, commit `1d709a1`) and `/gsd-complete-milestone` had archived (commit `14c5c82`), the audit returned `gaps_found` (bookkeeping only). The pragmatic Path B (archive with Known Gaps) was initially chosen — Stefano then directed "10/10 chirurgico" closure.

**8 atomic backfill commits closed all bookkeeping debt** (`c2e5527`, `9ecd580`, `8c52cba`, `b77951b`, `384ce11`, `0de7982`, `a5020ad`, `6a2db18`) plus a re-audit (`1d8464c`) flipping verdict to `passed`. Total ~9 commits authored from authoritative sources (existing SUMMARYs + on-disk src/ + tests + integration checker findings + project memory). No code touched — purely paper-trail formalization.

**Why it was real verification, not theater:**
- Test suite was already 384/384 green (re-run during backfill confirmed)
- Integration checker had already validated all cross-phase wires
- Source code was already on disk and exported via sub-paths
- The backfill consisted of WRITING the verification artifacts that summarize what the test suite + integration checker had already proven, not REDOING the verification

**Lesson:** Path B vs Path A trade-off matters more in long retro-fits than in fresh debt. Here, the gap was 1 day old (paper missed during execution), source data was fully available, and re-auditing was cheap — so chirurgico was the right call. For older gaps (months), reconstruction risk grows fast and Path B (acknowledge + move on) often wins.

---

## Cross-Milestone Trends

*(To be populated as v1.1, v1.2, ... ship.)*

| Milestone | Phases | Plans | Tests at close | Audit verdict | Tech debt items | Operator-deferred |
|-----------|--------|-------|----------------|---------------|-----------------|-------------------|
| v1.0 Bridge Foundation | 8 (+1 mini) | 24 (+1) | 384/384 | passed (after backfill — initial gaps_found bookkeeping-only) | 9 | 4 staging + 1 vendor sync + MDRT-07 SC#7 |

### Recurring Patterns to Watch

- (none yet — single milestone)

### Process Improvements Tried

- (none yet — single milestone)

---

*Maintained by `/gsd-complete-milestone`. Append new milestone sections above "## Cross-Milestone Trends".*
