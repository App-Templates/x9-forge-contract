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

### Known Gaps (accepted as tech debt)

The audit `milestones/v1.0-MILESTONE-AUDIT.md` returned `gaps_found` due to bookkeeping/paper-trail gaps. The substantive work shipped clean (PR #1 merged, 384/384 tests pass, integration checker found no critical wiring gaps). These gaps are explicitly accepted at v1.0 close:

**Critical bookkeeping (4 phases):**
- **Phase 02 (AgentContext Split)** — 3 PLAN files exist, **0 SUMMARYs**, **no VERIFICATION.md**. Code shipped (integration checker confirms `AgentContextCore`, branded IDs, `parseAgentContext` in `src/agent/`); paper trail did not get written. AGNT-01..05 unverifiable from `.planning/` artifacts but corroborated by project memory + tests + sub-path build.
- **Phase 06 (Model Router)** — **no VERIFICATION.md** despite Bridge v1.0 PR #1 merged. MDRT-01..08 claimed in 06-02/06-03 SUMMARYs and confirmed wired by integration checker (incl. Phase 6 → Phase 1 `modelPolicy` link), but no formal verifier sign-off artifact.
- **Phase 00 (Prerequisites)** — **no VERIFICATION.md**. 12 REQs claimed across 4 SUMMARYs.
- **Phase M (Memory Engine v2 mini-phase)** — PLAN-only directory, no SUMMARY/VERIFICATION. `dist/memory/` artifact present per integration checker, but execution status indeterminate from `.planning/`.

**Stale Nyquist VALIDATION.md frontmatter (4 phases):**
- Phases 02, 03, 05, 06 all show `nyquist_compliant: false` / `status: draft` despite phase being verified passed (where VERIFICATION exists). Frontmatter never flipped post-execution.

**Missing VALIDATION.md (5 phases):** 00, 01, 04, 04.1, M.

**Cross-cutting orphaned requirements:**
- **RLSE-02..05** never explicitly attested in any SUMMARY frontmatter (atomic SHA bump discipline / `@deprecated` JSDoc workflow / CHANGELOG.md / per-migration README updates). Practice was followed implicitly (PR #1 merge demonstrates RLSE-01 SHA-pin) but not formally attested.

**Orphan REQs added post-roadmap:**
- **R-09** (Phase 04.1) addressed but never back-filled into REQUIREMENTS.md traceability table.
- **Phase M** (Memory Engine v2) has no REQ-ID assignment in roadmap.

**REQUIREMENTS.md traceability:** 0 of 72 boxes ever ticked off during execution; final per-REQ status reconstructed in `milestones/v1.0-REQUIREMENTS.md`.

**Operator-deferred (3 staging tasks + 1 vault smoke):**
- 04-03-09 X9 staging deploy
- 04-04-09 staging fixture capture
- 04-04-10 e2e staging smoke
- 05-03 vault sync-all live smoke

**External hand-offs (cross-repo, not bridge):**
- **MDRT-07 SC#7** — agent-x9 Phase 35 ROADMAP cross-repo cite (tracked in MEMORY.md)
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
- Optionally: bookkeeping cleanup (back-fill VERIFICATION for Phases 0/2/6/M, fix stale VALIDATION frontmatter)

---

*Index maintained by `/gsd-complete-milestone`. Full archives in `.planning/milestones/`.*
