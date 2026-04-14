# x9-forge-contract-bridge

## What This Is

Pacchetto TypeScript condiviso tra agent-x9 e forge-v2 che definisce l'unica source of truth per tutti i contratti cross-repo: tipi request/response, endpoint paths, header di autenticazione, payload shapes. Entrambi i repo importano da questo package, e un cambio di contratto incompatibile genera errore di compilazione prima del deploy.

## Core Value

Un cambio di contratto cross-repo che rompe la compatibilita DEVE generare errore di compilazione in entrambi i repo. Mai piu bug scoperti solo a runtime in produzione.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Tutti gli 11 contratti cross-repo esistenti tipizzati in un unico package
- [ ] Entrambi i repo (agent-x9, forge-v2) importano tipi dal package
- [ ] Un cambio breaking genera errore TS in compile-time
- [ ] Naming asimmetrico env vars documentato e risolvibile (INTERNAL_SECRET vs X9_INTERNAL_SECRET)
- [ ] Zero regressioni: nessun endpoint esistente si rompe durante la migrazione
- [ ] Architettura del package (npm/submodule/workspace/OpenAPI) validata dalla ricerca
- [ ] **Model Router — `ModelTier` enum + `ModelTierMapping` (tier -> modelId) tipizzati nel bridge v1** (prerequisito Phase 35)
- [ ] **Model Router — `ModelPolicy` shape + `modelPolicy` field nel registry schema condiviso** (prerequisito Phase 35)
- [ ] **Model Router — Forge Model Push API (request/response + auth header) tipizzato PRIMA dell'implementazione agent-x9** (prerequisito Phase 35)

### Out of Scope

- CI/CD pipeline per publish automatico — da affrontare dopo v1, quando il pattern e stabile
- Tipi per contratti futuri non ancora esistenti (verranno aggiunti incrementalmente)
- Refactoring dei nomi env vars asimmetrici — solo documentazione e mapping, non rinomina

## Context

### Stato attuale dei contratti (scan 2026-04-13)

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
| Architettura package (npm/submodule/workspace/OpenAPI) | 4 opzioni, la ricerca GSD deve valutare | -- Pending |
| contract-bridge PRIMA di Phase 35 Model Router | Phase 35 introduce 5 nuovi contratti cross-repo, devono nascere nel package condiviso | Decided 2026-04-14 |
| Model Router contracts inclusi nello scope v1 del bridge | Evitare retrofit: tier enum, tier mapping, modelPolicy, Model Push API, hot-reload nascono qui | Decided 2026-04-14 |
| Phase 35 agent-x9 da rivedere dopo bridge v1 | La stesura preliminare non prevedeva il contract-bridge, deve importare dal bridge | -- Pending revisione (post bridge v1) |

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
*Last updated: 2026-04-14 — Model Router contracts (Phase 35) inclusi nello scope v1*
