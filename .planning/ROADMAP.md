# Roadmap: x9-forge-contract-bridge

## Overview

Il bridge nasce come "strangler fig su tipi": il pacchetto `@x9-forge/contracts` diventa la single source of truth cross-repo per contratti TypeScript tra agent-x9 e forge-v2, migrando un blocco alla volta con compat shim e zero downtime. X9 in produzione non si ferma mai. Ogni phase e un **blocco atomico** che chiude un pezzo di scope (Bug #15, tipi duplicati, contratti nuovi per Phase 35) e lascia i 2 repo verdi e deployabili. L'ultima phase e opzionale e rimuove gli shim compat una volta completata la transizione.

## Milestones

- 🚧 **v1.0 Bridge Foundation** — Phases 0-6 (in pianificazione)
- 📋 **v1.1 Shim Cleanup** — Phase 7 (opzionale, post-v1.0)

## Phases

**Phase Numbering:**
- Integer phases (0-7): Milestone work
- Decimal phases (es. 2.1): Inserimenti urgenti (flag INSERTED)
- Letter phases (es. M): Mini-phase standalone, non-blocking, parallel-capable

- [x] **Phase 0: Prerequisites + Bridge Foundation** ✅ 2026-04-14 — bump Forge zod/TS, skeleton package, dev loop verified (X9 full, Forge partial R-08)
- [x] **Phase M: Memory Engine v2 Contracts (mini-phase)** ✅ 2026-04-15 — 9 Zod schemas + TS types per envelope cross-repo Memory Engine v2 (scope/type/status/temporal/identity/write-candidate/recall-bundle/retention/corrective-action). Bridge-only, zero consumer touch. Sub-path `@x9-forge/contracts/memory`.
- [ ] **Phase 1: Capability Contracts (Block A)** — valida il pattern shim su tipi simmetrici semplici (previo R-08 fix Forge moduleResolution)
- [x] **Phase 2: AgentContext Split (Block B)** ✅ 2026-04-15 — AgentContextCore + branded IDs + AgentCredentials 17 known keys + parseAgentContext, X9 AgentContextRuntime extends Core, Forge re-export
- [ ] **Phase 3: Auth Headers Discriminated (Block C)** — chiude Bug #15 compile-time
- [ ] **Phase 4: HTTP Endpoint Contracts (Block D)** — 11 endpoint + typed HTTP client
- [ ] **Phase 5: Vault Contracts (Block E)** — 3-tier + sync state + AES encryption separation
- [ ] **Phase 6: Model Router Contracts (Block F)** — greenfield, prerequisito Phase 35 X9
- [ ] **Phase 7: Shim Removal + Final Consolidation** (opzionale) — rimuove compat shim, enforce direct imports

## Phase Details

### Phase 0: Prerequisites + Bridge Foundation

**Goal**: Il bridge repo ha package scaffolding completo (build verde, tsconfig strict, Zod v4, sub-path exports, dev-loop `pnpm.overrides link` verificato). Forge v2 e allineato a zod@4 + TS 6.0.2 + `exactOptionalPropertyTypes: true`, compila verde, test esistenti passano, deploy staging ok. Il primo import dal bridge e possibile senza rompere nulla.

**Depends on**: Nothing (first phase)

**Requirements**: BRDG-01, BRDG-02, BRDG-03, BRDG-04, BRDG-05, BRDG-06, MGRT-01, MGRT-02, MGRT-03, OBS-01, OBS-02, OBS-03

**Success Criteria** (cosa deve essere TRUE):
1. `pnpm install && pnpm build && pnpm test` nel bridge passa verde
2. Forge v2 compila con `zod@^4`, `typescript@^6.0.2`, `exactOptionalPropertyTypes: true`; tutti i 229 test esistenti Forge passano
3. Forge v2 staging deploy verificato sano dopo il bump (health check OK, 17/17 container healthy)
4. Un consumer test (X9 o Forge in branch) puo fare `import { foo } from '@x9-forge/contracts'` e il tipo dummy compila
5. README bridge ha sezione "How to add a new contract" + mapping contratti → file
6. Il pattern dev locale `pnpm.overrides` con `link:` funziona: modifica nel bridge → consumer vede il cambio al salvataggio

**Plans**: 4 plans

Plans:
- [x] 00-01: Bridge package scaffolding (`package.json`, `tsconfig.json` strict, `exports` field, `prepare` build, vitest setup, README skeleton)
- [ ] 00-02: Forge v2 zod@3 → zod@4 migration (Forge-side phase, tutti gli schema migrati, test verdi, deploy staging)
- [ ] 00-03: Forge v2 TypeScript 5.9 → 6.0.2 bump + `exactOptionalPropertyTypes: true` alignment (fix tutti i type errors emergenti)
- [ ] 00-04: Dev loop verification (`pnpm.overrides` con `link:` nel X9 e Forge, dummy contract end-to-end test)

---

### Phase 1: Capability Contracts (Block A)

**Goal**: I contratti simmetrici e a basso rischio (manifest, tool calls, env schema, health) vivono nel bridge con Zod schema. Entrambi i consumer ri-esportano dal bridge via compat shim. Pattern migration validato e riutilizzabile per phase successive.

**Depends on**: Phase 0

**Requirements**: CAPA-01, CAPA-02, CAPA-03, CAPA-04, CAPA-05, CAPA-06, TEST-01, TEST-02, TEST-03, TEST-05, MGRT-04, MGRT-05

**Success Criteria**:
1. X9 `packages/types/src/capability.ts` re-esporta da `@x9-forge/contracts/capability`, zero modifiche al comportamento runtime
2. Forge v2 `packages/types/src/x9.ts` re-esporta da `@x9-forge/contracts/capability` per manifest + registry entry (risolta divergenza `serviceName?` e `endpoint` vs `host+port+version`)
3. Contract test: un fixture JSON reale di `GET /cap-calendar/manifest` catturato da staging, parsato con Zod bridge schema, risultato identico al tipo X9 attuale
4. CI verde su tutti e 3 i repo post-migration
5. `CapabilityRegistryEntry` canonical shape = `{ host, port, version, protocol? }` + helper `toEndpoint()` / `fromEndpoint()` funzionanti con fixture reali
6. X9 e Forge deployano in staging senza regressioni funzionali (manifest discovery, tool dispatch, health check)

**Plans**: 3 plans

Plans:
- [x] 01-01: Contratti capability nel bridge (`CapabilityManifest`, `CapabilityTool`, `ToolCallRequest`, `ToolCallResponse`, `CapabilityRegistryEntry` canonical, `EnvSchemaField`, `EnvSchemaDoc`, `HealthStatus`) + Zod schemas + unit test + fixture reali
- [x] 01-02: X9 migration — `packages/types/` re-export + aggiornamento `scripts/generate-registry.ts` per produrre shape canonical + verifica registry.json generato equivalente semantico
- [x] 01-03: Forge v2 migration — `packages/types/src/x9.ts` re-export + aggiornamento `services/factory` per consumare canonical shape + contract test end-to-end

---

### Phase 2: AgentContext Split (Block B)

**Goal**: `AgentContext` attuale e splittato in `AgentContextCore` (cross-repo, nel bridge) + `AgentContextRuntime` (X9-local, estende Core). `AgentCredentials` e discriminated con auto-complete per chiavi note + backward compat per chiavi dinamiche. Forge scrive context.json con shape Core, X9 lo legge, lo estende a Runtime al boot. Zero breaking runtime.

**Depends on**: Phase 1

**Requirements**: AGNT-01, AGNT-02, AGNT-03, AGNT-04, AGNT-05

**Success Criteria**:
1. `AgentContextCore` nel bridge ha: `agentId`, `ownerId`, `credentials`, `llmConfig`, `telegramAllowFrom`
2. `AgentContextRuntime` in X9 estende Core con `workspacePath`, `registryPath`, `telegramBotToken`, `displayName` — **non nel bridge**
3. `AgentCredentials` ha auto-complete per 10+ chiavi note (`OPENAI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `X9_INTERNAL_SECRET`, `ELEVENLABS_API_KEY`, `FORGE_VOICE_REGISTER_TOKEN`, `AGENTMAIL_API_KEY`, `AGENTMAIL_INBOX_ID`, `GOOGLE_CALENDAR_CLIENT_ID`, etc.) + Record extension
4. `parseAgentContext(json)` valida un context.json reale di staging senza errori
5. X9 runtime avvia regolarmente con context.json formato Core (via loader che estende a Runtime al boot)
6. Tutti i context.json in produzione VPS restano compatibili (inventario pre-migration + test di parse)

**Plans**: 3 plans (con research-phase flag per edge case produzione)

Plans:
- [x] 02-01: Research-phase — inventario context.json (VPS staging empty, shape from code), 3 fixtures, COMPAT-NOTES.md
- [x] 02-02: Bridge — `AgentIdentity` branded, `AgentContextCore`, `AgentCredentials` 17 known keys + catchall, `parseAgentContext`, 31 unit tests
- [x] 02-03: X9 migration — `AgentContextRuntime` extends Core, compat shim, agent-manager bridge-backed schema, Forge `X9AgentContext` re-export

---

### Phase 3: Auth Headers Discriminated (Block C)

**Goal**: Gli header auth `X-Internal-Secret` e `X-Internal-Token` sono tipizzati come literal discriminated. Il typed HTTP client rifiuta in compile-time chiamate senza header richiesto. **Bug #15 diventa impossibile da reintrodurre**.

**Depends on**: Phase 1 (pattern shim valido)

**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, HTTP-12 (parziale — skeleton client)

**Success Criteria**:
1. `AuthInternalSecret` e `AuthInternalToken` tipizzati come literal record: `{ 'X-Internal-Secret': string }` / `{ 'X-Internal-Token': string }`
2. Skeleton `createBridgeClient({ baseUrl, auth })` rifiuta compilazione se chiamo un endpoint che richiede token e passo secret, o viceversa
3. **Regression test Bug #15**: se cancello l'header `X-Internal-Token` nel mock di Forge `x9.client.ts` che chiama `/webhook/post-call`, il TypeScript build fallisce con errore concreto
4. Forge `X9Client` aggiornato a usare `createBridgeClient` per almeno `/internal/agents/:id/reload` (pilota)

**Plans**: 2 plans

Plans:
- [x] 03-01: Bridge — `Auth*` types, Zod schema header validator, `createBridgeClient` skeleton (fetch wrapper zero-dep), unit test Bug #15 regression
- [x] 03-02: Forge `X9Client` migration pilota — sostituisce una call con `createBridgeClient`, verifica compile + runtime identici

---

### Phase 4: HTTP Endpoint Contracts (Block D)

**Goal**: Tutti gli 11 endpoint HTTP cross-repo (10 Forge→X9 + 1 X9→Forge) sono tipizzati nel bridge con request/response/auth shape. `createBridgeClient` e completo e usato in X9 e Forge. Typed HTTP client copre il 100% delle chiamate cross-repo. Response shape standardizzate (success + error).

**Depends on**: Phase 3 (auth discriminated) + Phase 2 (AgentContext)

**Requirements**: HTTP-01 → HTTP-14

**Success Criteria**:
1. Tutti gli 11 endpoint hanno contract nel bridge con schema Zod e fixture test reale
2. Forge `X9Client` e X9 `cap-voice → forge /api/voice/register` usano `createBridgeClient`
3. Contract test: fixture reali da staging (JSON catturati da log + curl) parsano senza errori
4. SSE `POST /internal/turn/stream` frame shape tipizzato (heartbeat, data, error, complete)
5. Response shape standardizzate: `{ ok: true, data }` o `{ ok: false, code, message, details? }` ovunque
6. Deploy staging X9 + Forge con migration live, smoke test end-to-end verde (briefing, voice call, webhook post-call, internal/turn streaming)

**Plans**: 4 plans (parallelizable, blocchi indipendenti)

Plans:
- [x] 04-01: Bridge — 11 endpoint contract (request/response/auth) + `createBridgeClient` full + unit test + fixture reali
- [x] 04-02: Bridge — SSE frame shape per `/internal/turn/stream` + parser helper
- [x] 04-03: X9 migration — cap-voice chiama Forge con `createBridgeClient`, agent-core internal routes usano schema bridge al boundary (Fastify schema integration)
- [x] 04-04: Forge migration — `x9.client.ts`, `voice.ts`, `factory.ts` usano `createBridgeClient` end-to-end

---

### Phase 5: Vault Contracts (Block E)

**Goal**: I contratti del vault 3-tier sono tipizzati nel bridge. `VaultEntryEncrypted` (AES wire format) e distinto da `VaultEntryPlain` (post-decrypt DTO). `VaultSyncState` riconcilia la semantica "synced/overridden" con i tier platform/owner/agent. `PlatformBootstrapEnv` distingue le env bootstrap (non-vaulted) dalle `AgentVaultedCredentials`. Il `POST /api/vault/sync-all` esistente in Forge viene tipizzato.

**Depends on**: Phase 2 (AgentCredentials)

**Requirements**: VLT-01, VLT-02, VLT-03, VLT-04, VLT-05, VLT-06, VLT-07, VLT-08

**Success Criteria**:
1. `VaultTier` e `VaultSyncState` tipizzati con helper `toSyncState(tier)` + unit test
2. `VaultEntryEncrypted` e `VaultEntryPlain` distinti, parse test rifiuta mixing (no leak wire format come plain)
3. `PlatformBootstrapEnv` documenta le 4 env server Forge (`VAULT_KEY`, `DATABASE_URL`, `CLERK_SECRET_KEY`, `SUPERADMIN_CLERK_ID`) — NON nel vault
4. `AgentVaultedCredentials` elenca categorie chiavi (LLM, Telegram, webhook, internal applicative secrets) che DEVONO vivere nel vault
5. `POST /api/vault/sync-all` in Forge usa schema bridge, smoke test bulk resync su staging verde
6. `WorkspaceFile` shape tipizzato e usato da Forge workspace-svc nel contract test

**Plans**: 3 plans

Plans:
- [ ] 05-01: Research-phase — shape esatto AES encryption in Forge (iv/authTag/encoding) via `vault.service.ts`, shape canonical `VaultSyncEvent` payload
- [ ] 05-02: Bridge — `VaultTier`, `VaultSyncState`, `VaultEntryPlain`, `VaultEntryEncrypted`, `VaultSyncEvent`, `WorkspaceFile`, `PlatformBootstrapEnv`, `AgentVaultedCredentials` + Zod schemas + unit test
- [ ] 05-03: Forge migration — `vault.service.ts`, `vault.repo.ts`, `workspace.service.ts` usano schema bridge, contract test bulk sync

---

### Phase 6: Model Router Contracts (Block F)

**Goal**: I 5 contratti Model Router (Phase 35 agent-x9 prerequisite) nascono greenfield nel bridge. `ModelTier`, `ModelTierMapping`, `ModelPolicy`, `POST /internal/model-config` push endpoint, hot-reload notification shape. `PerAgentModelOverride` tipizzato per la visione clone-specific ("clone X su Opus 4.6"). **Freeze contrattuale**: Phase 35 X9 e Phase 10 Forge potranno essere implementate solo consumando questi tipi dal bridge.

**Depends on**: Phase 1 (modelPolicy field estende CapabilityRegistryEntry) + Phase 4 (HTTP endpoint pattern consolidato)

**Requirements**: MDRT-01, MDRT-02, MDRT-03, MDRT-04, MDRT-05, MDRT-06, MDRT-07, MDRT-08

**Success Criteria**:
1. `ModelTier` ordered enum tipizzato con helper `compareTiers(a, b): -1 | 0 | 1`
2. `ModelPolicy` runtime check `min <= max` fail-loud
3. `ModelTierMapping` tipizzato con Zod discriminated per provider (openai, anthropic, google se necessario)
4. `POST /internal/model-config` endpoint contract definito (request payload + response + auth header) — endpoint nuovo, il bridge lo dichiara ma X9 non lo implementa in questa phase
5. `modelPolicy?: ModelPolicy` opzionale aggiunto a `CapabilityRegistryEntry` (backward compat: default `{ standard, standard }`)
6. `PerAgentModelOverride` tipizzato, schema allinea con semantica tier=agent vault
7. Roadmap agent-x9 Phase 35 aggiornato per importare dal bridge (non piu "pianificata con tipi locali")

**Plans**: 3 plans

Plans:
- [ ] 06-01: Research-phase — coordinamento con Phase 35 X9 (leggi design doc in `agent-x9/.planning/ROADMAP.md:328`, allinea nomi endpoint e payload)
- [ ] 06-02: Bridge — `ModelTier`, `ModelTierMapping`, `ModelPolicy`, `ModelPushRequest`, `ModelPushResponse`, `ModelHotReloadNotification`, `PerAgentModelOverride` + Zod schema + unit test + fixture invented (no endpoint live ancora)
- [ ] 06-03: `CapabilityRegistryEntry.modelPolicy?` aggiunta backward-compat + test migration path (cap esistenti senza modelPolicy continuano a funzionare)

---

### Phase 7: Shim Removal + Final Consolidation (opzionale)

**Goal**: I compat shim re-export in `agent-x9/packages/types/` e `forge-v2/packages/types/src/x9.ts` vengono rimossi. Tutti i consumer interni importano direttamente da `@x9-forge/contracts/<sub-path>`. ESLint rule enforce. README finale aggiornato. v1.0 consolidato.

**Depends on**: Phase 6

**Requirements**: MGRT-06, OBS-04, OBS-05

**Success Criteria**:
1. ESLint rule `no-restricted-imports` blocca `./packages/types/x9` in Forge e `./packages/types/capability` in X9 (attivati in errore, non warning)
2. `grep -r "from '@x9/types'"` in X9 services → solo import di tipi X9-local (non re-export bridge)
3. `grep -r "from '@forge/types/x9'"` in Forge services → zero match (tutto migrato)
4. Forge e X9 build + test + deploy staging verdi post-removal
5. CODEOWNERS nei 2 consumer forza review cross-team per paths che importano dal bridge
6. README finale bridge: tabella completa contratti → file + JSDoc su ogni export

**Plans**: 2 plans

Plans:
- [ ] 07-01: X9 — rimuovi shim `packages/types/capability.ts`, aggiorna import interni, aggiungi ESLint rule, deploy staging verde
- [ ] 07-02: Forge — rimuovi shim `packages/types/src/x9.ts`, aggiorna import interni, aggiungi ESLint rule, CODEOWNERS, deploy staging verde

---

## Progress

**Execution Order:**
Phases execute in numeric order: 0 → 1 → 2 → 3 → 4 → 5 → 6 → (7 opzionale)

Phase 4 e 5 sono parzialmente parallelizzabili (dopo 3). Phase 6 dipende da 1+4. Per chiarezza, default sequenziale.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 0. Prerequisites + Bridge Foundation | 0/4 | Not started | - |
| 1. Capability Contracts (Block A) | 0/3 | Not started | - |
| 2. AgentContext Split (Block B) | 3/3 | Complete | 2026-04-15 |
| 3. Auth Headers Discriminated (Block C) | 0/2 | Not started | - |
| 4. HTTP Endpoint Contracts (Block D) | 0/4 | Not started | - |
| 5. Vault Contracts (Block E) | 0/3 | Not started | - |
| 6. Model Router Contracts (Block F) | 0/3 | Not started | - |
| 7. Shim Removal + Consolidation (opzionale) | 0/2 | Not started | - |

**Totale v1.0:** 22 plans (Phase 0-6). Phase 7 opzionale: +2 plans.

## Cross-Repo Impact Summary

| Repo | Phase | Tipo impatto |
|------|-------|--------------|
| forge-v2 | 0 | zod@3→@4, TS 5.9→6.0.2, tsconfig align |
| forge-v2 | 1-6 | compat shim re-export, progressivo |
| forge-v2 | 7 | shim removal, import diretti |
| agent-x9 | 1-6 | compat shim re-export, progressivo |
| agent-x9 | 7 | shim removal, import diretti |
| agent-x9 | (post-6) | Phase 35 Model Router ri-pianificata per consumare bridge |
| forge-v2 | (post-6) | Phase 10 Model Router UI consumera bridge |

## Dependency Graph

```
Phase 0 (prereq)
    |
Phase 1 (capability, pattern validato)
    |
    +-- Phase 2 (AgentContext)
    |       |
    |       +-- Phase 3 (auth discriminated)
    |               |
    |               +-- Phase 4 (HTTP endpoints)
    |                       |
    +-- Phase 5 (vault) ----+
    |                       |
    +-- Phase 6 (Model Router, depends on 1 + 4)
                            |
                    Phase 7 (shim removal, opzionale)
```

---

*Roadmap defined: 2026-04-14 after research synthesis*
*Last updated: 2026-04-14*
