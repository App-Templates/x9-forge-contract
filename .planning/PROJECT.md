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

### Active

**Contratti HTTP esistenti (consolidamento):**
- [ ] Tutti gli 11 contratti cross-repo esistenti tipizzati in un unico package
- [ ] Naming asimmetrico env vars documentato e risolvibile (INTERNAL_SECRET vs X9_INTERNAL_SECRET, FORGE_VOICE_REGISTER_TOKEN vs VOICE_REGISTER_TOKEN vs INTERNAL_SERVICE_TOKEN)
- [ ] Risolvere incoerenza `X9_INTERNAL_SECRET` che vive sia in Forge platform env (`factory/src/env.ts:19`) sia nel vault per-agent (`voice.ts:95-98`) — decidere source of truth
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

## Research Mandate (vincoli NON negoziabili per la ricerca GSD)

La research e i plan derivati devono rispettare questi vincoli operativi. **Ogni plan che viola un vincolo va bloccato al plan-check.**

### 1. Verificare TUTTO sul codice prima di scrivere tipi
Non fidarsi delle descrizioni di questo PROJECT.md ne della memoria. **Per ogni contratto da tipizzare**:
- Leggere il file sorgente in X9 e in Forge (cita `file:linea`)
- Verificare request/response shape attuali (non teorici)
- Verificare header auth attuali (non teorici)
- Verificare payload JSON effettivo con un test curl o un sample dai log se possibile

### 2. Zero regressioni — contract tests obbligatori
Prima di cambiare un import in X9 o Forge:
- Deve esistere un contract test che verifica shape request/response attuale
- Il test deve essere green sul codice pre-modifica
- Il test deve restare green dopo la migrazione al bridge
- Test pyramid: unit (bridge) + integration (X9 e Forge building col bridge) + contract test cross-repo (curl end-to-end su staging)

### 3. Migrazione incrementale, mai big-bang
- Un contratto alla volta, migrato, verificato, merged — poi il prossimo
- X9 e Forge devono compilare e funzionare DURANTE OGNI step della migrazione
- Se uno step rompe uno dei due repo → rollback atomico del commit, no workarounds

### 4. Backward compatibility cross-repo durante migration
Mentre il bridge si popola, i vecchi tipi in `agent-x9/packages/types/` e `forge-v2/packages/types/src/x9.ts` possono **restare** come re-export dai tipi bridge (compat shim). Rimozione tipi legacy = **ultimo step** della migrazione, solo quando tutti i consumer importano da bridge.

### 5. X9 production continuity
Vincolo non negoziabile: X9 in produzione NON deve smettere di funzionare. VPS snapshot prima di ogni deploy. Rollback path testato.

### 6. README update obbligatori (parte della Definition of Done)
Quando un contratto viene migrato al bridge, aggiornare:
- README bridge: nuovo contratto nella tabella "What this types"
- README agent-x9: riferimento al bridge dove prima c'era tipo locale
- README forge-v2: riferimento al bridge dove prima c'era tipo locale

### 7. Non reinventare Forge multi-tenant
Forge ha gia **3-tier vault cascade** (platform → owner → agent), `isCustomized` flag, ownership middleware, Clerk auth, deploy pipeline 10-step. **Il bridge tipizza quello che Forge fa gia**, non introduce un nuovo modello. Se la research vuole cambiare il modello Forge → deve spawnare una Phase separata in forge-v2, non infilarla nel bridge.

### 8. Non reinventare X9 multi-agent
X9 e multi-agent by design: `agent-core/src/core/agent-manager.ts` gia carica N agent da `/data/agents/*/context.json` con workspace/registry/credentials/sessioni/memoria isolate per `agentId`. **Il bridge tipizza quello che X9 fa gia**. Se la research scopre che serve un nuovo meccanismo runtime in X9 → Phase separata in agent-x9.

## Context

### Gap analysis verificato sul codice (2026-04-14)

**Verifica eseguita via Explore agent su entrambi i repo.** Citazioni file:linea disponibili nei report dei gap analysis.

#### Forge v2 — stato attuale (MOLTO avanzato)
| Feature | Stato | Riferimento |
|---------|-------|-------------|
| DB multi-tenant (owners + agents.ownerId) | ✅ Implementato | `packages/db/src/schema.ts:13-39` |
| Ownership check su routes | ✅ Middleware attivo | `services/factory/src/middleware/require-agent-ownership.ts` |
| Vault centralizzato 3-tier (platform / owner / agent) | ✅ Implementato | `packages/db/src/schema.ts:41-55`, `services/vault/src/services/vault.service.ts:73-116` |
| Encryption AES-256-GCM | ✅ `VAULT_KEY` env | `services/vault/src/services/vault.service.ts` |
| Cascade resolve (agent > owner > platform) | ✅ | `vault.service.ts:73-116` |
| `isCustomized` flag per-entry | ✅ | `vault.repo.ts:64`, `workspace_files.isCustomized` |
| Bulk sync endpoint (`POST /api/vault/sync-all`) | ✅ | `services/vault/src/routes/vault.ts:167` |
| Workspace sync master → agent (skip customized) | ✅ | `services/workspace/src/routes/sync.ts:88-128` |
| UI Vault, GlobalEnv, GlobalModels | ✅ | `web/src/pages/agent/` |
| LLM model slots per-agent | ⚠️ Parziale | default hardcoded in `AGENT_SLOT_DEFAULTS`, no tier policy |
| Multi-tenant X9 routing (voice-svc) | ✅ Parziale | Voice-svc risolve X9 creds da vault per agent |
| Internal API verso X9 (reload, stop, list) | ✅ | `services/factory/src/services/x9.client.ts` |
| Push vault changes a X9 senza reload | ❌ Non esiste | Oggi: scrive context.json + `POST /reload` |
| Tenant self-service UI | ❌ Non esiste | `SUPERADMIN_CLERK_ID` hardcoded env |

#### Agent X9 — stato attuale (multi-agent ready)
| Feature | Stato | Riferimento |
|---------|-------|-------------|
| Multi-agent runtime (N agent da /data/agents) | ✅ Implementato | `agent-core/src/core/agent-manager.ts:1-67` |
| AgentContext per-agent (workspace, registry, credentials) | ✅ | `agent-context.ts:1-14` |
| Workspace isolato per `workspacePath` | ✅ | `workspace.ts:17-81` |
| SessionStore isolato per `${agentId}-${chatId}` | ✅ | `session-store.ts:25-64` |
| Memory Qdrant isolata per collection `agent_${agentId}_memories` | ✅ | `memory/src/client.ts:49-84` |
| Hot-reload via `POST /internal/agents/:id/reload` | ✅ | `agent-core/src/index.ts:336-368` |
| Endpoint `/internal/turn`, `/internal/turn/stream`, `/internal/query` | ✅ | `agent-core/src/index.ts:396-570` |
| Endpoint `/webhook/post-call` | ❌ NON trovato | Il flow passa per Forge v2 voice-svc, non direttamente su X9 |
| Hot-reload env var / model config senza /reload | ❌ | No watchers, no SIGHUP, solo /reload file-based |
| Multi-user dentro singolo agent (userId filter in memory recall) | ❌ | userId nei payload ma recall non filtra |
| Phase 35 Model Router (modelPolicy, classifier) | ❌ Not implemented | Solo design doc, zero codice |
| `context.credentials` type-safe (non flat `Record<string,string>`) | ❌ | Flat record, zero type safety per chiave specifica |

#### Riconciliazione semantica "synced vs overridden" ↔ Forge 3-tier
| Semantica Stefano | Forge-v2 semantica | Meccanismo |
|-------------------|---------------------|------------|
| `synced` (resync lo tocca) | tier `platform` o `owner` (cascade cascade da qui) | modifichi vault → propaga |
| `overridden` (resync lo salta) | tier `agent` (cascade prende qui, override) | valore proprio, resync skip |
| "Desync quando modifichi a mano sull'agent" | Scrivere con agentId popolato → entry tier=`agent` creata | identico |

Il meccanismo c'e gia in Forge — il bridge v1 deve **tipizzarlo e normalizzarlo**, non inventarlo.

### Stato attuale dei contratti (scan 2026-04-13, verificato 2026-04-14)

**11 contratti cross-repo identificati:**

Forge -> X9 (10 endpoint):
- `/internal/agents` GET — X-Internal-Secret
- `/internal/agents/:id/reload` POST — X-Internal-Secret
- `/internal/agents/:id/stop` POST — X-Internal-Secret
- `/internal/turn` POST — X-Internal-Secret
- `/internal/turn/stream` POST SSE — X-Internal-Secret
- `/internal/query` POST — X-Internal-Secret
- `/webhook/post-call` POST — X-Internal-Token
- `/:cap/manifest` GET — nessuna auth
- `/:cap/env-schema` GET — nessuna auth
- `/:cap/health` GET — nessuna auth

X9 -> Forge (1 endpoint):
- `/api/voice/register` POST — X-Internal-Token

**Tipi esistenti MA duplicati:**
- X9 (`packages/types/src/capability.ts`): `ToolCallRequest`, `ToolCallResponse`, `CapabilityManifest`
- Forge (`packages/types/src/x9.ts`): `X9AgentContext`, `X9CapabilityRegistryEntry`, `X9CapabilityManifest`, `X9EnvSchemaField`, `X9EnvSchemaDoc`
- Divergenza concreta: `CapabilityManifest` vs `X9CapabilityManifest` — shape simile ma Forge ha `serviceName?` extra

**Naming asimmetrico env vars:**
- X9 `INTERNAL_SECRET` <-> Forge `X9_INTERNAL_SECRET`
- X9 `FORGE_VOICE_REGISTER_TOKEN` <-> Forge `VOICE_REGISTER_TOKEN` / `INTERNAL_SERVICE_TOKEN`

### Bug #15 — l'evidenza

Post-call webhook 401 silent (2026-04-11). X9 Phase 21.1 aggiunse header `X-Internal-Token` obbligatorio, Forge v2 continuava a chiamare senza. Nessun errore TS, scoperto solo per osservazione empirica in produzione. Con tipi condivisi il build di Forge sarebbe fallito.

### Dipendenza: Phase 35 Model Router (agent-x9) — contratti nativi del bridge v1

La Phase 35 (Model Router — Two-Level Routing) introduce **5 nuovi contratti cross-repo** che NON esistono oggi e che devono nascere nel bridge v1, non essere retrofittati dopo.

**Contratti Model Router inclusi nello scope v1 del bridge:**

1. **`ModelTier` enum** (ordered: `standard < advanced < reasoning`) — condiviso tra Forge UI (dropdown) e agent-x9 (validazione, ordering)
2. **`ModelTierMapping`** (`{ tier: ModelTier -> modelId: string }`, es. `standard: "gpt-4.1-mini"`) — Forge push, X9 consume per hot-reload senza redeploy
3. **`ModelPolicy`** (`{ min: ModelTier, max: ModelTier }`) + `modelPolicy` field nel `CapabilityRegistryEntry` / `CapabilityManifest` schema condiviso
4. **Forge Model Push API** (`/internal/model-config` POST o equivalente): request payload (tier mappings + per-cap policy overrides), response shape, header di autenticazione. **Endpoint nuovo, non ancora esistente** in nessuno dei due repo
5. **Hot-reload notification shape** (mtime check o webhook payload, a seconda di cosa decide la ricerca)

**Allineamento con ROADMAP agent-x9 Phase 35:**
- ROUTER-01 (Model Tier Registry) -> contratto #1, #2 nel bridge
- ROUTER-02 (Capability Model Policy) -> contratto #3 nel bridge
- ROUTER-05 (Forge Model Push) -> contratto #4 nel bridge
- ROUTER-06 (Hot-Reload) -> contratto #5 nel bridge

**Ordine di esecuzione:**
- Phase 35 agent-x9 **va eseguita DOPO il contract-bridge**, cosi i nuovi tipi nascono direttamente nel package condiviso
- La stesura preliminare della Phase 35 nel ROADMAP agent-x9 NON prevedeva il contract-bridge e **va rivista** prima dell'esecuzione (deve importare dal bridge, non definire tipi in locale)
- Forge v2 Phase 10 (UI dropdown + push layer) dipende a sua volta da Phase 35 agent-x9

### Volume stimato

- ~15-20 interfacce TypeScript
- ~11 endpoint request/response da tipizzare
- Import da aggiornare in entrambi i repo
- Lavoro chirurgico, volume contenuto

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
*Last updated: 2026-04-14 — Research GSD completata (STACK+FEATURES+ARCHITECTURE+PITFALLS+SUMMARY), REQUIREMENTS.md (69 req) + ROADMAP.md (7 phase, 22 plans v1.0) + STATE.md scritti. Decisioni architetturali finalizzate. Ready for /gsd-plan-phase 0*
