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

## Requirements

### Validated

- ✓ Risolvere divergenza `CapabilityRegistryEntry` — canonical shape `{ host, port, version, protocol?, tools? }` + `toEndpoint()`/`fromEndpoint()` — Phase 1
- ✓ Risolvere divergenza `CapabilityManifest` vs `X9CapabilityManifest` — `serviceName?` optional nel bridge, alias re-export in Forge — Phase 1
- ✓ Normalizzare `ToolCallRequest`/`ToolCallResponse` — discriminated union su `status`, 3 error codes — Phase 1
- ✓ X9 `packages/types/` re-export shim from bridge (MGRT-04) — Phase 1
- ✓ Forge `packages/types/src/x9.ts` re-export shim with aliases (MGRT-05) — Phase 1
- ✓ Contract testing baseline: 57 bridge tests green, CI gate, real fixtures (TEST-01, TEST-02 partial, TEST-03, TEST-05) — Phase 1
- ✓ `AgentIdentity` branded, `AgentContextCore`, `AgentCredentials` 17 known keys, `parseAgentContext` — Phase 2
- ✓ `AuthInternalSecret` / `AuthInternalToken` literal discriminated types + `createBridgeClient` skeleton + Bug #15 compile-time regression guard — Phase 3
- ✓ Forge `X9Client.reload()` pilot migration to `createBridgeClient<'secret'>` — Phase 3
- ✓ 11 HTTP endpoint contracts typed + Forge/X9 consumers migrated + drift guard operational — Phase 4
- ✓ `NoAuthBridgeClient` + `createBridgeClient<'none'>` factory branch; Forge `capBridgeClient` collapsed to ≤10-line wrapper (R-09) — Phase 4.1

### Active

**Contratti HTTP esistenti (consolidamento):**
- [ ] Tutti gli 11 contratti cross-repo esistenti tipizzati in un unico package
- [ ] Naming asimmetrico env vars documentato e risolvibile (INTERNAL_SECRET vs X9_INTERNAL_SECRET, FORGE_VOICE_REGISTER_TOKEN vs VOICE_REGISTER_TOKEN vs INTERNAL_SERVICE_TOKEN)
- [ ] Risolvere incoerenza `X9_INTERNAL_SECRET` che vive sia in Forge platform env (`factory/src/env.ts:19`) sia nel vault per-agent (`voice.ts:95-98`) — decidere source of truth

**Vault & multi-tenant contracts:**
- [ ] Tipizzare `VaultEntry` shape (key, value encrypted, `tier: 'platform' | 'owner' | 'agent'`, `isCustomized`, `ownerId?`, `agentId?`)
- [ ] Tipizzare `VaultTier` enum con semantica "synced vs overridden" documentata (platform/owner = synced, agent = overridden)
- [ ] Tipizzare `VaultSyncEvent` (bulk resync payload, tocca solo entries non-agent-tier)
- [ ] Tipizzare `AgentIdentity` (`agentId`, `tenantId/ownerId`) — base per multi-tenant discriminated
- [ ] Tipizzare `AgentCredentials` discriminated (sostituisce `Record<string, string>` flat di X9 `context.credentials` → type safety per chiave specifica: `OPENAI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `X9_INTERNAL_SECRET`, etc.)
- [ ] Tipizzare `WorkspaceFile` shape condiviso (path, content, tier, isCustomized, ownerId, agentId)

**Model Router contracts (Phase 35 prerequisite):**
- [ ] `ModelTier` enum + `ModelTierMapping` (tier -> modelId) tipizzati nel bridge v1
- [ ] `ModelPolicy` shape + `modelPolicy` field nel registry schema condiviso
- [ ] Forge Model Push API (request/response + auth header) tipizzato PRIMA dell'implementazione agent-x9
- [ ] `ModelOverridePerAgent` (estensione Phase 35 per clone-specific model override, es. "clone X su Opus 4.6")

**Integrazione & meta:**
- [ ] Entrambi i repo (agent-x9, forge-v2) importano tipi dal package — import path unificato
- [ ] Un cambio breaking genera errore TS in compile-time in entrambi i repo
- [ ] Zero regressioni: nessun endpoint esistente si rompe durante la migrazione (contract tests green)
- [ ] Architettura del package (npm/submodule/workspace/OpenAPI) validata dalla ricerca
- [ ] README x9-forge-contract-bridge con mapping contratti → file, policy di breaking change, procedure update

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

### Contratti cross-repo: 11 identificati, 3 auth pattern

Forge→X9: 10 endpoint (6 con X-Internal-Secret, 1 con X-Internal-Token, 3 senza auth)
X9→Forge: 1 endpoint (`/api/voice/register` POST, X-Internal-Token)

Naming asimmetrico env: `INTERNAL_SECRET` (X9) ↔ `X9_INTERNAL_SECRET` (Forge). Bug #15 = motivazione del bridge (webhook 401 silent, zero errore TS).

Gap analysis completo in `.planning/archive/research/ARCHITECTURE.md`. Forge: vault 3-tier + cascade + isCustomized ✅. X9: multi-agent runtime + hot-reload ✅. Synced vs overridden = tier platform|owner vs agent.

### Phase 35 Model Router — 5 contratti nativi del bridge

ModelTier enum, ModelTierMapping, ModelPolicy + modelPolicy field, Forge Model Push API (nuovo endpoint), Hot-reload notification. Ordine: bridge v1 → X9 Phase 35 → Forge Phase 10.

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
*Last updated: 2026-04-15 — Phase 4.1 complete (NoAuthBridgeClient + Forge capBridgeClient consolidation, R-09). Milestone v1.0 progress: 6/8 phases done. Next: Phase 5 (Vault Contracts — Block E).*
