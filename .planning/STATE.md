# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-14)

**Core value:** Un cambio di contratto cross-repo che rompe la compatibilita DEVE generare errore di compilazione in entrambi i repo.
**Current focus:** Phase 0 — Prerequisites + Bridge Foundation (ready to plan)

## Current Position

Phase: 0 of 7 (Prerequisites + Bridge Foundation)
Plan: 0 of 4 in current phase
Status: Ready to plan
Last activity: 2026-04-14 — Research synthesis completed, REQUIREMENTS + ROADMAP scritti

Progress: ░░░░░░░░░░ 0% (0/22 plans v1.0)

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| — | — | — | — |

**Recent Trend:**
- No plans executed yet

## Accumulated Context

### Decisions

Recent decisions (full log in PROJECT.md Key Decisions):

- **2026-04-14**: Bridge = package TypeScript tipi cross-repo (Interpretazione A, no runtime service)
- **2026-04-14**: Master X9 peer dei cloni rispetto al vault (no gerarchia per chiavi)
- **2026-04-14**: Sync state per-chiave per-agent = tier cascade Forge (platform/owner=synced, agent=overridden)
- **2026-04-14**: Vault 3-tier contracts + Model Router contracts inclusi nello scope bridge v1
- **2026-04-14**: AgentCredentials discriminated (no piu flat Record<string,string>)
- **2026-04-14**: CapabilityRegistryEntry canonical shape = `{ host, port, version, protocol? }` + helper derivation (scelta tier-1)
- **2026-04-14**: X9_INTERNAL_SECRET e tutte le env applicative vivono esclusivamente nel vault (tier=platform default, tier=agent desync override). PlatformBootstrapEnv Forge (VAULT_KEY, DB, CLERK) resta env server per ricorsione
- **2026-04-14**: Distribuzione bridge = `git+ssh://...#<SHA>` + `prepare` build + `pnpm.overrides link:` per dev locale. ts-rest rifiutato per peer-dep conflict zod@4+fastify@5
- **2026-04-14**: Zod v4 source of truth per schema; TS types derivati via `z.infer`
- **2026-04-14**: Forge zod@3→@4 + TS 5.9→6.0.2 + `exactOptionalPropertyTypes: true` alignment = Phase 0 prerequisito

### Pending Todos

None yet (use /gsd-add-todo se emergono idee).

### Blockers/Concerns

None attivi. Research ha surfacciato 4 open questions da risolvere nei research-phase dedicati:

- Phase 2: edge case context.json produzione per `AgentCredentials` migration (inventario VPS)
- Phase 5: shape esatto AES encryption vault (iv/authTag/encoding) in `vault.service.ts`
- Phase 6: coordinamento shape Model Router con agent-x9 Phase 35 design
- Phase 4: verifica Dockerfile X9 per evitare P-15 (monorepo hoisting failures)

## Session Continuity

Last session: 2026-04-14 (research + requirements + roadmap)
Stopped at: ROADMAP.md + REQUIREMENTS.md + STATE.md scritti, ready for /gsd-plan-phase 0
Resume file: None
