# Requirements: x9-forge-contract-bridge

**Defined:** 2026-04-14
**Core Value:** Un cambio di contratto cross-repo che rompe la compatibilita DEVE generare errore di compilazione in entrambi i repo. Mai piu bug scoperti solo a runtime (Bug #15 post-call webhook 401 silent).

## v1 Requirements

Requirements per la prima release del bridge. Ogni requirement mappa a una phase del roadmap.

### Bridge Foundation (BRDG)

- [ ] **BRDG-01**: Il package `@x9-forge/contracts` e distribuito via `git+ssh://<host>/<repo>#<SHA>` con `prepare` build script (nessun registry npm, nessun submodule)
- [ ] **BRDG-02**: Il package esporta sub-path nominati (`/http`, `/capability`, `/agent`, `/vault`, `/model-router`, `/auth`) per tree-shaking e isolamento dominio
- [ ] **BRDG-03**: `tsconfig` del package ha `strict: true`, `exactOptionalPropertyTypes: true`, `noUncheckedIndexedAccess: true`, target ES2023, NodeNext
- [ ] **BRDG-04**: Zod v4 come source of truth; tipi TypeScript derivati via `z.infer<typeof schema>` (zero drift schema↔type)
- [ ] **BRDG-05**: `package.json` ha `"exports"` field con sub-path exports, `"files"` field esplicito (no dist/ leak)
- [ ] **BRDG-06**: Setup dev locale con `pnpm.overrides` + `link:` nei due consumer per hot-reload senza republish

### Type Consolidation — Capability & Tools (CAPA)

- [ ] **CAPA-01**: `CapabilityManifest` tipizzato con Zod schema, consolidato tra X9 (`packages/types/src/capability.ts`) e Forge (`packages/types/src/x9.ts` — `X9CapabilityManifest`). Divergenza `serviceName?` risolta nel canonical shape
- [ ] **CAPA-02**: `ToolCallRequest` e `ToolCallResponse` tipizzati (tutti e due gia in X9, assenti in Forge)
- [ ] **CAPA-03**: `CapabilityTool` (name, description, inputSchema) tipizzato
- [ ] **CAPA-04**: `CapabilityRegistryEntry` tipizzato con shape canonical **`{ host: string; port: number; version: string; protocol?: 'http' | 'https' }`** + helper derivation `toEndpoint(entry)` / `fromEndpoint(url)` nel bridge
- [ ] **CAPA-05**: `EnvSchemaField` e `EnvSchemaDoc` (required/optional) consolidati
- [ ] **CAPA-06**: `HealthStatus` (`healthy | degraded | unhealthy`) tipizzato

### Agent Identity & Context (AGNT)

- [ ] **AGNT-01**: `AgentIdentity` tipizzato: `{ agentId: AgentId; ownerId: OwnerId }` con branded types per IDs (evita confusione string → string assignments)
- [ ] **AGNT-02**: `AgentContextCore` tipizzato (cross-repo, Forge writes + X9 reads): identity, credentials, llmConfig core, ownership. **Split da `AgentContext` esistente**
- [ ] **AGNT-03**: `AgentContextRuntime` tipizzato (X9-local only): `workspacePath`, `registryPath`, `telegramBotToken`, `telegramAllowFrom`, `displayName` — **NON nel bridge**, X9 lo estende
- [ ] **AGNT-04**: `AgentCredentials` discriminated: `KnownCredentials & Record<string, string>` con auto-complete per chiavi note (`OPENAI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `X9_INTERNAL_SECRET`, `ELEVENLABS_API_KEY`, `FORGE_VOICE_REGISTER_TOKEN`, ecc.) + backward-compat per chiavi capability-specific dinamiche
- [ ] **AGNT-05**: Helper `parseAgentContext(json: unknown): AgentContextCore` con Zod validation, fail-loud

### Auth Headers (AUTH)

- [ ] **AUTH-01**: Literal types per header names: `X-Internal-Secret` vs `X-Internal-Token` (discriminated)
- [ ] **AUTH-02**: `AuthInternalSecret` type = `{ 'X-Internal-Secret': string }`, `AuthInternalToken` type = `{ 'X-Internal-Token': string }`
- [ ] **AUTH-03**: Ogni endpoint contract dichiara quale auth richiede: `AuthInternalSecret | AuthInternalToken | null`
- [ ] **AUTH-04**: Typed HTTP client helper rifiuta in compile-time chiamate senza header richiesto (chiude Bug #15)

### HTTP Endpoint Contracts (HTTP)

- [ ] **HTTP-01**: `POST /internal/agents/:agentId/reload` tipizzato (request/response/auth)
- [ ] **HTTP-02**: `POST /internal/agents/:agentId/stop` tipizzato
- [ ] **HTTP-03**: `GET /internal/agents` tipizzato (list agents, auth)
- [ ] **HTTP-04**: `POST /internal/turn` tipizzato
- [ ] **HTTP-05**: `POST /internal/turn/stream` tipizzato (SSE — frame shape incluso)
- [ ] **HTTP-06**: `POST /internal/query` tipizzato
- [ ] **HTTP-07**: `POST /webhook/post-call` tipizzato (cross-repo X-Internal-Token — **l'endpoint del Bug #15**)
- [ ] **HTTP-08**: `GET /:cap/manifest` tipizzato
- [ ] **HTTP-09**: `GET /:cap/env-schema` tipizzato
- [ ] **HTTP-10**: `GET /:cap/health` tipizzato
- [ ] **HTTP-11**: `POST /api/voice/register` (X9→Forge) tipizzato
- [ ] **HTTP-12**: Typed HTTP client `createBridgeClient({ baseUrl, auth })` nel bridge, zero-dep (~80 righe), basato su `fetch` nativo
- [ ] **HTTP-13**: Error response shape standardizzata: `{ ok: false; code: string; message: string; details?: unknown }`
- [ ] **HTTP-14**: Success response shape standardizzata: `{ ok: true; data: T }` (generic)

### Vault Contracts (VLT)

- [ ] **VLT-01**: `VaultTier` enum: `'platform' | 'owner' | 'agent'` (ordered: platform < owner < agent per cascade priority)
- [ ] **VLT-02**: `VaultSyncState` enum derivato: `'synced' | 'overridden'` (synced = tier platform|owner, overridden = tier agent) con helper `toSyncState(tier): VaultSyncState`
- [ ] **VLT-03**: `VaultEntryPlain` tipizzato: `{ key, value, tier, isCustomized, ownerId?, agentId?, updatedAt }` — DTO plaintext post-decrypt per API response
- [ ] **VLT-04**: `VaultEntryEncrypted` tipizzato: `{ key, encryptedValue, iv, authTag, tier, ... }` — wire format AES-256-GCM, distinto da Plain per evitare leaks
- [ ] **VLT-05**: `VaultSyncEvent` tipizzato per `POST /api/vault/sync-all` (payload bulk resync: tocca solo `isCustomized === false`)
- [ ] **VLT-06**: `PlatformBootstrapEnv` tipizzato: `{ VAULT_KEY, DATABASE_URL, CLERK_SECRET_KEY, SUPERADMIN_CLERK_ID }` — env server Forge, NON nel vault (ricorsione)
- [ ] **VLT-07**: `AgentVaultedCredentials` tipizzato: categorizza le chiavi che DEVONO vivere nel vault (LLM keys, Telegram tokens, webhook tokens, internal secrets applicativi)
- [ ] **VLT-08**: `WorkspaceFile` shape condiviso (path, content, tier, isCustomized, ownerId, agentId) — stesso pattern tier-based di vault

### Model Router Contracts (MDRT)

**Nuovi contratti introdotti da Phase 35 agent-x9. Nascono nel bridge v1, non retrofittati.**

- [ ] **MDRT-01**: `ModelTier` ordered enum: `'standard' | 'advanced' | 'reasoning'` (ordered set, espandibile)
- [ ] **MDRT-02**: `ModelTierMapping` tipizzato: `Record<ModelTier, string>` (es. `{ standard: "gpt-4.1-mini", advanced: "o4-mini", reasoning: "claude-opus-4-6" }`)
- [ ] **MDRT-03**: `ModelPolicy` tipizzato: `{ min: ModelTier; max: ModelTier }` con invariant `min <= max` (runtime check)
- [ ] **MDRT-04**: `modelPolicy?: ModelPolicy` field aggiunto al `CapabilityRegistryEntry` schema condiviso (opzionale, default `{ min: 'standard', max: 'standard' }`)
- [ ] **MDRT-05**: `ModelPushRequest` tipizzato: request body per `POST /internal/model-config` (tier mappings + per-cap policy overrides + per-agent overrides)
- [ ] **MDRT-06**: `ModelPushResponse` tipizzato (success + errors per-cap se policy invalida)
- [ ] **MDRT-07**: `ModelHotReloadNotification` tipizzato (SSE o polling response shape, research-phase decide il meccanismo)
- [ ] **MDRT-08**: `PerAgentModelOverride` tipizzato: override per singolo clone (es. "clone X usa reasoning tier")

### Consumer Migration (MGRT)

- [ ] **MGRT-01**: Forge v2 services allineati a `zod@^4` (migration da `zod@^3`) — prerequisito tecnico per consumare bridge
- [ ] **MGRT-02**: Forge v2 tsconfig allineato con `exactOptionalPropertyTypes: true` (oggi unset in `packages/types/tsconfig.json`, X9 lo ha true)
- [ ] **MGRT-03**: Forge v2 TypeScript `^6.0.2` (aggiornamento da `^5.9`)
- [ ] **MGRT-04**: X9 `packages/types/` re-esporta dal bridge (compat shim: `export * from '@x9-forge/contracts/capability'`) finche tutti i consumer interni non importano direttamente dal bridge
- [ ] **MGRT-05**: Forge v2 `packages/types/src/x9.ts` analogo compat shim re-export
- [ ] **MGRT-06**: ESLint rule `no-restricted-imports` in entrambi i consumer: blocca import da `./packages/types/x9` (legacy) una volta completata la migration, forza import da `@x9-forge/contracts`

### Contract Testing (TEST)

- [ ] **TEST-01**: Vitest suite nel bridge: ogni contratto ha schema shape test (Zod parse fixture valido + reject fixture invalido)
- [ ] **TEST-02**: Contract conformance test: un fixture JSON per ogni endpoint (request + response reali catturati da staging) parsati con lo schema bridge
- [ ] **TEST-03**: CI gate: se un contract test fallisce → blocca merge
- [ ] **TEST-04**: Integration test cross-repo (da esplorare nel research-phase): curl staging + validazione con bridge schema. Green before any contract migration goes live
- [ ] **TEST-05**: Baseline green: prima di migrare un contratto, il contract test del baseline attuale deve essere green. Dopo migration, il test con bridge schema deve restare green

### Package & Release Discipline (RLSE)

- [ ] **RLSE-01**: Versioning: SHA-pinned nei consumer (no semver, no tag)
- [ ] **RLSE-02**: Breaking changes = bump SHA atomicamente nei 2 consumer in uno step (mai uno solo)
- [ ] **RLSE-03**: Deprecation workflow: `/** @deprecated */` JSDoc con timeline rimozione (>= 1 major cycle)
- [ ] **RLSE-04**: CHANGELOG.md nel bridge tracked by Changesets o manual (research-phase decide)
- [ ] **RLSE-05**: README bridge aggiornato ad ogni contract migrato (tabella "What this types")

### Observability & Docs (OBS)

- [ ] **OBS-01**: README bridge ha tabella contratti → file `src/` (discovery facile)
- [ ] **OBS-02**: README bridge ha "How to add a new contract" (workflow documentato)
- [ ] **OBS-03**: README bridge ha policy di breaking change (quando bump SHA, come coordinare i consumer)
- [ ] **OBS-04**: JSDoc su ogni tipo esportato (descrizione, cross-reference alla fonte cross-repo)
- [ ] **OBS-05**: CODEOWNERS file nei 2 consumer per paths che importano dal bridge (force code review cross-team)

## v2 Requirements

Deferred al cycle successivo. Tracciati ma non in v1.

### Advanced Contract Tooling (ADCT)

- **ADCT-01**: Valutare migrazione a `ts-rest` o `zodios` quando peer-deps si sbloccano (attualmente peer-dep conflict con zod@4 + fastify@5 blocca ts-rest@3.52.1)
- **ADCT-02**: OpenAPI/JSON Schema auto-export dal bridge per consumer esterni (mobile app, SDK partner futuri)
- **ADCT-03**: Pact contract testing (consumer-driven) se i consumer superano 3

### Operational (OPRL)

- **OPRL-01**: GitHub Actions workflow che auto-PR bump SHA sui 2 consumer quando il bridge ha nuovo commit su main
- **OPRL-02**: npm private registry (Verdaccio o GitHub Packages) se i consumer > 3
- **OPRL-03**: Migration guide generator (diff bridge vN vs vN+1 → human-readable changelog)

### Runtime Features (RNTM)

- **RNTM-01**: Hot-reload live push vault → X9 senza rigenerare context.json (aggiunge un endpoint `POST /internal/vault/push` su X9)
- **RNTM-02**: Multi-user dentro singolo agent: userId filter in memory recall (gap X9, separate phase)
- **RNTM-03**: Tenant self-service UI in Forge (SUPERADMIN_CLERK_ID rimosso come env hardcoded)

## Out of Scope

Esplicitamente esclusi. Documentati per prevenire scope creep.

| Feature | Motivo |
|---------|--------|
| CI/CD publish pipeline automatizzata | Rimandata a post-v1; per ora SHA-pin manuale basta |
| Tipi per contratti futuri non ancora esistenti | Incrementali, aggiunti quando nascono |
| Rename env vars asimmetriche (`INTERNAL_SECRET` ↔ `X9_INTERNAL_SECRET`) | Solo documentazione e mapping, no rename (rischio breaking) |
| Credential rotation effettiva | Deferred al lancio prodotto (memoria Stefano). Il bridge tipizza i contratti rotation, l'operazione e deferred |
| Phase 35 Model Router runtime implementation | Scope agent-x9 Phase 35, non bridge |
| Forge Phase 10 Model Router UI | Scope forge-v2 Phase 10, non bridge |
| npm public publish | Codice privato |
| Runtime codegen tooling | Rallenta dev loop (anti-feature AF-05) |
| Branding di ogni stringa | Brand solo su IDs (AgentId, OwnerId, TenantId, SessionId, ConversationId) — anti-feature AF-02 |
| Decoratori experimental TS | Anti-pattern, usa tipi structural |

## Traceability

Mapping requirements → phases. Popolato durante roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| MGRT-01, MGRT-02, MGRT-03 | Phase 0 | Pending |
| BRDG-01, BRDG-02, BRDG-03, BRDG-04, BRDG-05, BRDG-06 | Phase 0 | Pending |
| OBS-01, OBS-02, OBS-03 | Phase 0 | Pending |
| CAPA-01, CAPA-02, CAPA-03, CAPA-04, CAPA-05, CAPA-06 | Phase 1 | Pending |
| TEST-01, TEST-02, TEST-03, TEST-05 | Phase 1 | Pending |
| MGRT-04, MGRT-05 | Phase 1 (+ subsequent) | Pending |
| AGNT-01, AGNT-02, AGNT-03, AGNT-04, AGNT-05 | Phase 2 | Pending |
| AUTH-01, AUTH-02, AUTH-03, AUTH-04 | Phase 3 | Pending |
| HTTP-01 → HTTP-11, HTTP-12, HTTP-13, HTTP-14 | Phase 4 | Pending |
| VLT-01, VLT-02, VLT-03, VLT-04, VLT-05, VLT-06, VLT-07, VLT-08 | Phase 5 | Pending |
| MDRT-01, MDRT-02, MDRT-03, MDRT-04, MDRT-05, MDRT-06, MDRT-07, MDRT-08 | Phase 6 | Pending |
| MGRT-06, OBS-04, OBS-05 | Phase 7 (cleanup, opzionale) | Pending |
| TEST-04 | research-phase specific (Phase 2, 5, 6) | Pending |
| RLSE-01, RLSE-02, RLSE-03, RLSE-04, RLSE-05 | Trasversale (ogni phase) | Pending |

**Coverage:**
- v1 requirements: 69 totali
- Mapped to phases: 69 ✓
- Unmapped: 0 ✓

---

*Requirements defined: 2026-04-14*
*Last updated: 2026-04-14 after research synthesis*
