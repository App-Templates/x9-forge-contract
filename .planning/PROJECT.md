# x9-forge-contract-bridge

## What This Is

Pacchetto TypeScript condiviso tra **agent-x9** (Master Chief runtime, multi-agent by design) e **forge-v2** (control plane con vault centralizzato 3-tier) che definisce l'unica source of truth per tutti i contratti cross-repo: tipi request/response, endpoint paths, header di autenticazione, payload shapes, vault entry schema, model router contracts. Entrambi i repo importano da questo package, e un cambio di contratto incompatibile genera errore di compilazione prima del deploy.

## Core Value

Un cambio di contratto cross-repo che rompe la compatibilita DEVE generare errore di compilazione in entrambi i repo. Mai piu bug scoperti solo a runtime in produzione (es. Bug #15 post-call webhook 401 silent, scoperto in produzione dopo Phase 21.1).

## Visione architetturale target

Forge v2 gestisce centralmente **tutto** per ogni agente X9 (master + cloni futuri):
- **Chiavi/secrets/env vars** (vault centralizzato 3-tier: platform → owner → agent, gia implementato in Forge)
- **LLM model config** (tier mappings + per-cap modelPolicy, Phase 35 non ancora implementata)
- **Workspace files** (gia gestito da Forge con isCustomized flag)
- **Capability selection** (gia gestito via registry.json)

Tutti gli agenti (**master X9 incluso, NON parent dei cloni per chiavi**) ereditano dal vault centralizzato. Una chiave modificata sul singolo agent diventa `tier=agent` (override: "synced vs overridden" a livello semantico) e non viene toccata dal bulk resync.

Il bridge tipizza i contratti di questo modello cross-repo. Non e un runtime service, e un package di tipi compile-time.

## Current State

**v1.0 Bridge Foundation** SHIPPED 2026-04-16 (PR #1 merged, git tag `v1.0`).

- 8 phases (0–6) + Phase 04.1 INSERTED + Phase M letter mini-phase = 24+1 plans
- 384/384 tests pass across 42 files
- 8/8 sub-paths built and exported (`./capability`, `./agent`, `./auth`, `./http`, `./vault`, `./model-router`, `./memory`, root)
- 11 HTTP endpoints + SSE frame schemas + vault 3-tier + Model Router 7 schemas all wired
- Bug #15 compile-time guard live (Forge `X9Client.reload()` migrated to `createBridgeClient<'secret'>` as pilot, then expanded to all cross-repo calls in Phase 4)
- Cross-repo drift guards operational in agent-x9 + forge-v2

**Pending external (cross-repo, not bridge-side):**
- MDRT-07 SC#7 — agent-x9 Phase 35 ROADMAP cross-repo cite
- agent-x9 vendor re-sync via `scripts/sync-bridge.sh` on `fix/docker-bridge-build-context` branch

## Requirements

### Validated

**v1.0 — shipped 2026-04-16:**

- ✓ Bridge package scaffolding + Zod v4 + sub-path exports + dev loop verificato (BRDG-01..05, BRDG-06 partial Forge) — v1.0 Phase 0
- ✓ Forge zod@4 + TS 6.0.2 + `exactOptionalPropertyTypes: true` (MGRT-01..03) — v1.0 Phase 0
- ✓ README contracts table + "How to add" + breaking change policy (OBS-01..03) — v1.0 Phase 0
- ✓ Risolvere divergenza `CapabilityRegistryEntry` — canonical `{host, port, version, protocol?}` + `toEndpoint()`/`fromEndpoint()` (CAPA-04) — v1.0 Phase 1
- ✓ Risolvere divergenza `CapabilityManifest` vs `X9CapabilityManifest` — `serviceName?` optional, alias re-export Forge (CAPA-01) — v1.0 Phase 1
- ✓ Normalizzare `ToolCallRequest`/`ToolCallResponse` — discriminated su `status`, 3 error codes (CAPA-02) — v1.0 Phase 1
- ✓ X9 `packages/types/` re-export shim from bridge (MGRT-04) — v1.0 Phase 1
- ✓ Forge `packages/types/src/x9.ts` re-export shim (MGRT-05) — v1.0 Phase 1
- ✓ Contract testing baseline: 57 bridge tests, CI gate, real fixtures (TEST-01,02,03,05) — v1.0 Phase 1
- ✓ `AgentIdentity` branded, `AgentContextCore`, `AgentCredentials` 17 known keys + catchall, `parseAgentContext` (AGNT-01..05) — v1.0 Phase 2
- ✓ `AuthInternalSecret` / `AuthInternalToken` literal discriminated + `createBridgeClient` + Bug #15 compile-time regression guard (AUTH-01..04) — v1.0 Phase 3
- ✓ Forge `X9Client.reload()` pilot migration to `createBridgeClient<'secret'>` (HTTP-12 partial) — v1.0 Phase 3
- ✓ 11 HTTP endpoint contracts typed + SSE frame schemas + Forge/X9 consumers migrated + drift guard operational (HTTP-01..14) — v1.0 Phase 4
- ✓ `NoAuthBridgeClient` + `createBridgeClient<'none'>` factory branch; Forge `capBridgeClient` collapsed to ≤10-line wrapper (R-09) — v1.0 Phase 4.1
- ✓ Vault 3-tier contracts: `VaultTier`, `VaultSyncState`, `VaultEntryPlain`/`Encrypted` with T-05-01 guard, `SyncAll*`, `WorkspaceFile`, `PlatformBootstrapEnv` type-only, `AgentVaultedCredentials` (VLT-01..08) — v1.0 Phase 5
- ✓ Model Router 7 schemas greenfield: `ModelTier`, `ModelTierMapping`, `ModelPolicy`, `ModelPushRequest/Response`, `ModelHotReloadNotification`, `PerAgentModelOverride` + `modelPolicy?` su `CapabilityRegistryEntry` (MDRT-01..08, MDRT-07 SC#7 partial — agent-x9 cite deferred) — v1.0 Phase 6
- ✓ Memory Engine v2 contracts: 9 schemas + sub-path `@x9-forge/contracts/memory` (no REQ-ID, orphan) — v1.0 Phase M
- ✓ Naming asimmetrico env vars documentato (`INTERNAL_SECRET` ↔ `X9_INTERNAL_SECRET`, ecc.) — v1.0 (Phase 0–4)
- ✓ Entrambi i repo importano tipi dal package via `git+https#SHA` — v1.0
- ✓ Cambio breaking genera errore TS compile-time in entrambi i repo — v1.0 (Bug #15 guard live)
- ✓ Zero regressioni durante migrazione (X9 produzione mai fermo) — v1.0
- ✓ Architettura `git+https#SHA` + `prepare` build + `pnpm.overrides link:` validata — v1.0 Phase 0
- ✓ README mapping contratti → file + policy breaking change + procedure update — v1.0 Phase 0

### Active

**v1.1 Shim Cleanup + Bookkeeping:**

- [ ] Phase 7: Shim Removal — rimuovi compat shim `agent-x9/packages/types/` + `forge-v2/packages/types/src/x9.ts`, ESLint `no-restricted-imports` enforce (MGRT-06)
- [ ] CODEOWNERS nei 2 consumer per paths che importano dal bridge (OBS-05)
- [ ] JSDoc su ogni tipo esportato (descrizione + cross-reference) (OBS-04)

**Bookkeeping cleanup (optional, can roll into Phase 7):**

- [ ] Back-fill VERIFICATION.md per Phases 0, 2, 6, M
- [ ] Flip stale VALIDATION.md frontmatter (Phases 02, 03, 05, 06)
- [ ] Add CHANGELOG.md (RLSE-04 closure)
- [ ] Document atomic SHA bump procedure (RLSE-02) + `@deprecated` workflow (RLSE-03)
- [ ] Update REQUIREMENTS.md cosmetic: `HealthStatus` enum says `'unhealthy'`, code uses `'down'` (CAPA-06)

**External cross-repo follow-ups (post-v1.0):**

- [ ] MDRT-07 SC#7 — agent-x9 Phase 35 ROADMAP cross-repo cite (operator action in agent-x9)
- [ ] agent-x9 vendor re-sync via `scripts/sync-bridge.sh` on `fix/docker-bridge-build-context` branch
- [ ] Resolve `X9_INTERNAL_SECRET` source-of-truth ambiguity (vault per-agent vs Forge platform env hardcoded)

**Operator-deferred staging tasks (carried from v1.0):**

- [ ] 04-03-09 X9 staging deploy
- [ ] 04-04-09 staging fixture capture
- [ ] 04-04-10 e2e staging smoke
- [ ] 05-03 vault sync-all live smoke (POST /api/vault/sync-all)

### Out of Scope

- CI/CD pipeline per publish automatico — da affrontare dopo v1, quando il pattern e stabile
- Tipi per contratti futuri non ancora esistenti (verranno aggiunti incrementalmente)
- Refactoring dei nomi env vars asimmetrici — solo documentazione e mapping, non rinomina
- **Hot-reload "live" push** vault → X9 senza rigenerare context.json (oggi flow e `Forge scrive context.json + POST /reload` — funziona. Live push e gap reale ma non blocker per bridge v1 — research decide se dentro o fuori scope)
- **Multi-user dentro un singolo agent** (userId filter in memory recall): gap reale di X9 ma fuori scope bridge v1
- **Tenant self-service UI** (oggi SUPERADMIN_CLERK_ID e env var hardcoded in Forge): fuori scope bridge, e lavoro su Forge
- **Implementazione Phase 35 Model Router** in X9 (il bridge tipizza i contratti; l'implementazione runtime resta scope di agent-x9 Phase 35)
- **Vault credential rotation effettiva** (deferred da Stefano al lancio prodotto): il bridge tipizza i contratti di push/rotation, l'operazione concreta e deferred

## Research Mandate (vincoli NON negoziabili)

1. **Verifica su codice** — leggere file:linea in X9+Forge prima di tipizzare, mai fidarsi di descrizioni
2. **Zero regressioni** — contract test green pre e post migrazione (unit + integration + curl e2e)
3. **Incrementale** — un contratto alla volta, mai big-bang. Rollback atomico se rompe
4. **Backward compat** — vecchi tipi restano come re-export shim finché tutti importano da bridge
5. **X9 continuity** — VPS snapshot prima di ogni deploy, rollback testato
6. **README update** — aggiornare bridge+x9+forge README ad ogni contratto migrato
7. **Non reinventare Forge** — il bridge tipizza il vault 3-tier esistente, non lo cambia
8. **Non reinventare X9** — il bridge tipizza l'agent-manager esistente, non lo cambia

## Context

### Post v1.0 codebase state

- **2,768 LOC TypeScript** in `src/` across 8 domains (capability, agent, auth, http, vault, model-router, memory, root)
- **42 test files, 384 assertions** — full green
- **8 sub-path exports** built into `dist/` (`./capability`, `./agent`, `./auth`, `./http`, `./vault`, `./model-router`, `./memory`, root)
- **No dead schemas, no mis-wires** (gsd-integration-checker confirms)
- Distribution: `git+https#SHA` (no registry, no submodule), `pnpm.overrides link:` for dev hot-reload
- Tech stack: Zod v4, TypeScript 6.0.2, vitest, pnpm workspace

### Contratti cross-repo (consolidati in v1.0)

11 endpoint (10 Forge→X9 + 1 X9→Forge `/api/voice/register`) tutti tipizzati con discriminated `Auth*`. Bug #15 (webhook 401 silent) chiuso compile-time. Drift guards operativi in agent-x9 + forge-v2.

Vault 3-tier (platform → owner → agent) tipizzato. `VaultEntryPlain` ≠ `VaultEntryEncrypted` per evitare leak wire-format come plain. `VaultSyncState` riconcilia "synced/overridden" con tier hierarchy.

### Phase 35 Model Router — 7 contratti nativi del bridge (greenfield in v1.0)

ModelTier ordered enum, ModelTierMapping (per-provider), ModelPolicy con invariant `min ≤ max`, ModelPushRequest/Response (POST `/internal/model-config`), ModelHotReloadNotification (versioned polling), PerAgentModelOverride. `modelPolicy?` aggiunto opzionale a `CapabilityRegistryEntry` (backward compat default `{standard, standard}`).

**Contratti freezati. Phase 35 X9 e Phase 10 Forge consumeranno questi tipi senza retrofit.**

### v1.0 known gaps (carried forward)

Audit `milestones/v1.0-MILESTONE-AUDIT.md` returned `gaps_found` (bookkeeping only — code shipped clean):
- VERIFICATION.md missing for Phases 0, 2, 6, M
- VALIDATION.md missing or stale frontmatter for 7 of 9 phases
- REQUIREMENTS.md traceability never ticked off (0/72)
- RLSE-02..05 cross-cutting reqs orphaned

These are explicitly accepted as v1.0 tech debt. Substantive work shipped + verified by integration checker + 384/384 tests.

## Constraints

- **Qualita**: Tier 1, 10/10, chirurgico. Zero margine d'errore
- **Compatibilita**: Zero breaking changes durante la migrazione — i due repo devono continuare a funzionare in ogni momento
- **X9 continuity**: X9 in produzione NON deve mai smettere di funzionare (regola non negoziabile di Stefano)
- **Repo scope**: Tocca 3 repo (contract-bridge nuovo + agent-x9 + forge-v2) — coordinamento chirurgico
- **Model Router contracts born here**: i 5 contratti nuovi introdotti da Phase 35 (tier enum, tier mapping, modelPolicy, Model Push API, hot-reload) nascono nel bridge v1 — non retrofittati da agent-x9 o forge-v2

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Architettura package = `git+ssh://...#<SHA>` + `prepare` build + `pnpm.overrides link:` dev loop | Scelta vincitrice research STACK: zero infra, zero registry, zero submodule, native pnpm | Decided 2026-04-14 |
| Zod v4 come source of truth schema; TS types via `z.infer` | Source of truth unica, zero drift schema↔type (pitfall P-27 preventivo) | Decided 2026-04-14 |
| ts-rest rifiutato per v1 | Peer-dep conflict `@ts-rest/core@3.52.1` con zod@4+fastify@5 verificato 2026-04-14. Rivalutare v1.1 | Decided 2026-04-14 |
| Custom typed HTTP client zero-dep (~80 righe) | Alternativa a ts-rest/zodios/tRPC respinti; coprira Bug #15 via literal auth types | Decided 2026-04-14 |
| Branded types solo su IDs (AgentId, OwnerId, TenantId, SessionId, ConversationId) | Brand di ogni stringa = anti-feature AF-02 (over-engineering) | Decided 2026-04-14 |
| Forge zod@3→@4 + TS 5.9→6.0.2 + `exactOptionalPropertyTypes: true` = Phase 0 | Tecnicamente non negoziabile: bridge impone zod@4, X9 gia allineato, Forge deve allinearsi | Decided 2026-04-14 |
| `CapabilityRegistryEntry` canonical shape = `{ host, port, version, protocol? }` + helper `toEndpoint` | Scelta tier-1: scalabilita (version pinning), manutenibilita (no URL parsing), estendibilita (TLS) | Decided 2026-04-14 |
| `AgentContext` split: `Core` (bridge, cross-repo) + `Runtime` (X9-local) | Forge non deve sapere dove X9 scrive su disco (workspacePath, registryPath). Boundary rule pulito | Decided 2026-04-14 |
| `X9_INTERNAL_SECRET` e tutte le env applicative = vault esclusivo (tier=platform default, tier=agent desync override) | Source of truth confermato da Stefano 2026-04-14. Vault nasce come escamotage di centralizzazione, e la verita. `PlatformBootstrapEnv` (VAULT_KEY, DB, CLERK) resta env server per ricorsione | Decided 2026-04-14 |
| Bridge = package TypeScript tipi cross-repo (Interpretazione A, no runtime service) | Stefano ha confermato 2026-04-14 | Decided 2026-04-14 |
| Master X9 peer dei cloni rispetto al vault (no gerarchia per chiavi) | Stefano ha corretto il modello mentale 2026-04-14 | Decided 2026-04-14 |
| contract-bridge PRIMA di Phase 35 Model Router | Phase 35 introduce 5 nuovi contratti cross-repo, devono nascere nel package condiviso | Decided 2026-04-14 |
| Model Router contracts inclusi nello scope v1 del bridge | Evitare retrofit: tier enum, tier mapping, modelPolicy, Model Push API, hot-reload nascono qui | Decided 2026-04-14 |
| Vault 3-tier contracts inclusi nello scope v1 del bridge | Forge ha gia implementato il meccanismo, il bridge normalizza la semantica cross-repo | Decided 2026-04-14 |
| `AgentCredentials` discriminated (no piu flat Record) | Oggi X9 `context.credentials` e `Record<string,string>` senza type safety | Decided 2026-04-14 |
| "Synced vs overridden" = tier `platform \| owner` vs tier `agent` | Riconciliazione semantica, nessuna rivoluzione del modello Forge | Decided 2026-04-14 |
| Multi-user dentro agent (userId filter in memory) | Gap reale di X9 ma fuori scope bridge (diventa nuova Phase di X9) | Decided 2026-04-14 (OUT) |
| Hot-reload "live" push vault → X9 | Gap reale ma non blocker per bridge v1 | Decided 2026-04-14 (OUT v1, differito) |
| Phase 35 agent-x9 da rivedere dopo bridge v1 | La stesura preliminare non prevedeva il contract-bridge, deve importare dal bridge | -- Pending revisione (post bridge v1) |
| Forge Phase 10 UI Model Router dipende da bridge + Phase 35 X9 | Ordine: bridge v1 → X9 Phase 35 → Forge Phase 10 | Decided 2026-04-14 |
| Phase 04.1 INSERTED dopo Phase 4 per chiudere R-09 (NoAuthBridgeClient) | `createBridgeClient` mancava `'none'` variant, X9+Forge duplicavano `capBridgeClient` helpers | ✓ Good — Decided + shipped 2026-04-15 |
| Phase M letter mini-phase per Memory Engine v2 contracts (parallel-capable, no REQ assignment) | Mini-phase non-blocking, scope orthogonal a Phase 0–6 | ✓ Good — shipped 2026-04-15 |
| Bridge v1.0 chiuso con `gaps_found` audit accettato (bookkeeping debt) | Code shipped clean (PR #1, 384/384 tests, integration checker pass); paper trail incomplete (VERIFICATION mancanti P0/P2/P6/M, RLSE-02..05 orphan) — backfill retroattivo non aggiunge valore | ✓ Good — Decided 2026-04-16 (Path B in audit recommendation) |
| Custom typed HTTP client (~80 lines) preferred over ts-rest/zodios | Peer-dep conflict zod@4+fastify@5; AUTH-04 compile-time guard ottenuto con discriminated `AuthForEndpoint<T>` mapping | ✓ Good — Bug #15 reintroduzione impossibile |
| Legacy endpoint success responses NOT standardized to `{ok, data}` envelope in v1.0 | Preserva backward compat consumer-side; standardized envelope wired into error path; bump deferred | ⚠ Revisit nel prossimo bump SHA |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-16 after v1.0 milestone close. Bridge Foundation SHIPPED (PR #1 merged, git tag v1.0). Next: v1.1 Shim Cleanup + Bookkeeping (Phase 7 + tech debt closure) when ready.*
