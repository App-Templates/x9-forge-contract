# Milestones — x9-forge-contract-bridge

Living index of shipped versions. Full archives in `.planning/milestones/`.

---

## v1.0 — Bridge Foundation

**Shipped:** 2026-04-16
**Tag:** `v1.0` (commit `1d709a1`)
**Closing PR:** #1 (merged to `main` 2026-04-16)
**Audit:** `milestones/v1.0-MILESTONE-AUDIT.md` — status `gaps_found` (bookkeeping only, code shipped clean)

### Stats

| Metric | Value |
|--------|-------|
| Phases | 8 (0, 1, 2, 3, 4, 04.1, 5, 6) + Phase M letter mini-phase |
| Plans | 24 + 1 (Phase M) |
| Files modified (src/) | 2,768 LOC TypeScript |
| Test suite | 384/384 pass across 42 files |
| Sub-path exports | 8/8 built (`./capability`, `./agent`, `./auth`, `./http`, `./vault`, `./model-router`, `./memory`, root) |
| Commits | 165 total (project init → v1.0 ship) |
| Timeline | 2026-04-13 → 2026-04-16 (3 days, project init to v1.0 tag) |

### Delivered

The first cross-repo TypeScript contracts package consolidating 11 HTTP endpoints, vault 3-tier semantics, AgentContext split, discriminated auth headers, and 7 greenfield Model Router schemas — closing Bug #15 (post-call webhook 401 silent) at compile time and freezing contracts that Phase 35 agent-x9 + Phase 10 forge-v2 will consume.

### Key Accomplishments

1. **Bug #15 compile-time guard live** — `createBridgeClient<'secret'|'token'|'none'>` rejects mis-auth at TypeScript compile, no longer reachable at runtime
2. **Cross-repo drift guard operational** — agent-core contract test catches bridge schema drift; Forge `sync-all.contract.test.ts` extends the pattern to vault
3. **11 HTTP endpoints + SSE frame schemas typed end-to-end** — `BridgeClient` covers 100% of cross-repo calls; SSE `internalTurnStream()` discriminated union (6 frame types)
4. **Vault 3-tier contracts consolidated** — `VaultEntryPlain` ≠ `VaultEntryEncrypted` (no leak via type confusion); `VaultSyncState` reconciles "synced/overridden" with platform/owner/agent tier hierarchy
5. **Model Router contracts greenfield** — 7 schemas (ModelTier, ModelTierMapping, ModelPolicy, ModelPushRequest/Response, ModelHotReloadNotification, PerAgentModelOverride) frozen for downstream Phase 35 X9 + Phase 10 Forge UI
6. **AgentContext split** — `Core` (cross-repo, bridge) + `Runtime` (X9-local) with branded `AgentId`/`OwnerId` and `AgentCredentials` discriminated for 17 known keys + dynamic catchall
7. **R-09 closure** — Phase 04.1 INSERTED to add `NoAuthBridgeClient`; collapsed duplicated `capBridgeClient` helpers in X9 + Forge

### Architecture Decisions

- Zod v4 source of truth + TS via `z.infer` (zero schema↔type drift)
- Custom typed HTTP client zero-dep (~80 lines, no ts-rest/zodios — peer-dep conflict)
- `git+https#SHA` versioning (no registry, no submodule), `pnpm.overrides link:` dev loop
- `CapabilityRegistryEntry` canonical = `{host, port, version, protocol?}` + `toEndpoint()`/`fromEndpoint()` helpers
- Branded IDs only for `AgentId/OwnerId/TenantId/SessionId/ConversationId` (anti-pattern AF-02 avoided)
- Sub-path exports per domain — root `index.ts` does not kitchen-sink

### Known Gaps — CLOSED via 2026-04-16 backfill

The original audit `milestones/v1.0-MILESTONE-AUDIT.md` returned `gaps_found` (bookkeeping only). Per Stefano's "10/10 chirurgico" directive, all bookkeeping debt was closed via 8 atomic backfill commits. **Re-audit verdict 2026-04-16T16:50: `passed`.**

**Backfill commits (chronological):**

| # | Commit | Closure |
|---|--------|---------|
| 1 | `c2e5527` | docs(phase-02): backfill SUMMARYs (3) + VERIFICATION + flip VALIDATION to passed |
| 2 | `9ecd580` | docs(phase-06): backfill VERIFICATION + flip VALIDATION to passed |
| 3 | `8c52cba` | docs(phase-00): backfill VERIFICATION + VALIDATION (Nyquist) |
| 4 | `b77951b` | docs(phase-M): backfill SUMMARY + VERIFICATION + VALIDATION + assign MEM-01..09 |
| 5 | `384ce11` | docs(validation): flip stale Nyquist frontmatter for Phases 03 + 05 |
| 6 | `0de7982` | docs(validation): backfill VALIDATION.md for Phases 01, 04, 04.1 |
| 7 | `a5020ad` | docs: add CHANGELOG.md — closes RLSE-04 + documents RLSE-02/03 workflow |
| 8 | `6a2db18` | docs(v1.0-archive): update REQUIREMENTS to reflect post-backfill clean state |
| 9 | `1d8464c` | docs(audit): re-audit v1.0 — verdict passed after chirurgico backfill |

**Post-backfill state:**
- ✅ All 9 phases (0, 1, 2, 3, 4, 04.1, 5, 6, M) have VERIFICATION.md on disk with status `passed`
- ✅ All 9 phases have VALIDATION.md with `nyquist_compliant: true` / `wave_0_complete: true`
- ✅ REQUIREMENTS traceability: 65/66 in-scope satisfied + 1 operator-deferred (TEST-04); 0 unsatisfied / 0 partial / 0 orphaned
- ✅ R-09 (Phase 04.1) added to traceability table
- ✅ MEM-01..09 (Phase M) added to traceability table — closes Phase M orphan
- ✅ CHANGELOG.md added at repo root (closes RLSE-04)
- ✅ RLSE-02 (atomic SHA bump) + RLSE-03 (@deprecated workflow) explicitly documented in CHANGELOG.md "How releases work" section
- ✅ RLSE-05 (README updates per migration) attested in archive

### Carried-forward Operator Items (NOT bookkeeping gaps — explicit v1.0 deferrals)

**Operator-deferred (3 staging tasks + 1 vault smoke):**
- 04-03-09 X9 staging deploy
- 04-04-09 staging fixture capture
- 04-04-10 e2e staging smoke (briefing + voice + webhook + internal/turn streaming)
- 05-03 vault sync-all live smoke

**External cross-repo hand-offs (not bridge-side):**
- **MDRT-07 SC#7** — agent-x9 Phase 35 ROADMAP cross-repo cite (text template in `06-01-PLAN.md` task 06-01-03; tracked in MEMORY.md)
- **agent-x9 vendor re-sync** post Phase 6 (`scripts/sync-bridge.sh` on `fix/docker-bridge-build-context` branch in agent-x9)

### Tech Debt Carried Forward

- **R-07** — `web/` workspace stuck on zod@3 (MCP SDK upstream peer-dep chain)
- **R-08** — Forge `moduleResolution=node` legacy (partial close in Phase 1)
- ~4 X9 services have stale `.js`/`.d.ts` cruft in `src/`
- Legacy success response shapes not standardized to `{ok, data}` envelope (documented v1.0 trade-off; standardized envelope wired into error path)
- cap-briefing 7 pre-existing test failures (out of scope, agent-x9 Phase 33 rule-engine)
- Zod v4 gotchas documented for future reference: `.refine(fn, fnMessage)` form broken in 4.3.6 → use `superRefine`; `z.record(enum, value)` strict-completeness requires `.optional()` workaround
- REQUIREMENTS.md cosmetic: `HealthStatus = 'unhealthy'` listed, code uses `'down'`

### What's Next (v1.1)

- **Phase 7 "Shim Removal + Final Consolidation"** (opzionale, originally part of v1.0 scope, deferred)
- Address MGRT-06 (ESLint enforce), OBS-04 (JSDoc on every export), OBS-05 (CODEOWNERS in 2 consumers)
- Standardize legacy endpoint success responses to `{ok, data}` envelope at next breaking SHA bump
- Optional: doc-side cleanup CAPA-06 cosmetic (REQUIREMENTS.md `'unhealthy'` → `'down'` to match canonical code)

**Process improvement for v1.1:** Auto-chain mode (discuss → plan → execute → verify in one session) silently skipped SUMMARY/VERIFICATION/VALIDATION write steps for several v1.0 phases — necessitating the 8-commit backfill above. v1.1 should either gate the chain harder OR run verify as a separate session to keep paper trail in sync with code as it ships.

---

*Index maintained by `/gsd-complete-milestone`. Full archives in `.planning/milestones/`.*
