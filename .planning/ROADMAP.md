# Roadmap: x9-forge-contract-bridge

## Overview

Il bridge tipizza i contratti cross-repo tra **agent-x9** (Master Chief runtime) e **forge-v2** (control plane vault 3-tier). Il pacchetto `@x9-forge/contracts` è la single source of truth per request/response, endpoint paths, header auth, payload shapes, vault entry schema, model router contracts. Un cambio incompatibile genera errore di compilazione in entrambi i repo prima del deploy.

## Milestones

- ✅ **v1.0 Bridge Foundation** — Phases 0–6 + 04.1 + Phase M (shipped 2026-04-16) — see `milestones/v1.0-ROADMAP.md`
- 📋 **v1.1 Shim Cleanup + Bookkeeping** — Phase 7 + tech debt closure (planned)

## Phases

**Phase Numbering:**
- Integer phases: Milestone work
- Decimal phases (e.g. 4.1): INSERTED urgent work
- Letter phases (e.g. M): Mini-phase standalone, parallel-capable

<details>
<summary>✅ <b>v1.0 Bridge Foundation</b> — Phases 0–6 + 04.1 + Phase M — SHIPPED 2026-04-16 (24+1 plans)</summary>

- [x] Phase 0: Prerequisites + Bridge Foundation (4/4 plans) — 2026-04-14
- [x] Phase 1: Capability Contracts (Block A) (3/3 plans) — 2026-04-15
- [x] Phase 2: AgentContext Split (Block B) (3/3 plans) — 2026-04-15
- [x] Phase 3: Auth Headers Discriminated (Block C) (2/2 plans) — 2026-04-15
- [x] Phase 4: HTTP Endpoint Contracts (Block D) (4/4 plans) — 2026-04-15
- [x] Phase 04.1: NoAuthBridgeClient + capBridgeClient consolidation (R-09 INSERTED) (2/2 plans) — 2026-04-15
- [x] Phase 5: Vault Contracts (Block E) (3/3 plans) — 2026-04-15
- [x] Phase 6: Model Router Contracts (Block F) (3/3 plans) — 2026-04-15
- [x] Phase M: Memory Engine v2 Contracts (mini-phase) (1/1 plan) — 2026-04-15

Full archive: [v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md) · Audit: [v1.0-MILESTONE-AUDIT.md](milestones/v1.0-MILESTONE-AUDIT.md) · Requirements final status: [v1.0-REQUIREMENTS.md](milestones/v1.0-REQUIREMENTS.md)

</details>

### 📋 v1.1 Shim Cleanup + Bookkeeping (Planned)

- [ ] **Phase 7: Shim Removal + Final Consolidation (opzionale)** — rimuove compat shim re-export in `agent-x9/packages/types/` e `forge-v2/packages/types/src/x9.ts`. ESLint rule enforce. CODEOWNERS. JSDoc on every export.

**Goal:** Tutti i consumer interni importano direttamente da `@x9-forge/contracts/<sub-path>`. v1.0 consolidato.
**Depends on:** v1.0 (Phase 6)
**Requirements:** MGRT-06, OBS-04, OBS-05
**Plans:** 2 (TBD)
- [ ] 07-01: X9 — rimuovi shim `packages/types/capability.ts`, aggiorna import interni, ESLint rule, deploy staging
- [ ] 07-02: Forge — rimuovi shim `packages/types/src/x9.ts`, aggiorna import interni, ESLint rule, CODEOWNERS, deploy staging

**Optional bookkeeping cleanup** (could be a separate small phase or rolled into Phase 7):
- Back-fill missing VERIFICATION.md for Phases 0, 2, 6, M
- Flip stale VALIDATION.md frontmatter for Phases 02, 03, 05, 06
- Add CHANGELOG.md (RLSE-04)
- Document atomic SHA bump procedure (RLSE-02) and `@deprecated` workflow (RLSE-03)

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 0. Prerequisites + Bridge Foundation | v1.0 | 4/4 | ✅ Complete | 2026-04-14 |
| 1. Capability Contracts (Block A) | v1.0 | 3/3 | ✅ Complete | 2026-04-15 |
| 2. AgentContext Split (Block B) | v1.0 | 3/3 | ✅ Complete | 2026-04-15 |
| 3. Auth Headers Discriminated (Block C) | v1.0 | 2/2 | ✅ Complete | 2026-04-15 |
| 4. HTTP Endpoint Contracts (Block D) | v1.0 | 4/4 | ✅ Complete | 2026-04-15 |
| 04.1. NoAuthBridgeClient (R-09) | v1.0 | 2/2 | ✅ Complete | 2026-04-15 |
| 5. Vault Contracts (Block E) | v1.0 | 3/3 | ✅ Complete | 2026-04-15 |
| 6. Model Router Contracts (Block F) | v1.0 | 3/3 | ✅ Complete | 2026-04-15 |
| M. Memory Engine v2 Contracts | v1.0 | 1/1 | ✅ Complete | 2026-04-15 |
| 7. Shim Removal (opzionale) | v1.1 | 0/2 | Planned | - |

---

*Last updated: 2026-04-16 after v1.0 milestone close*
