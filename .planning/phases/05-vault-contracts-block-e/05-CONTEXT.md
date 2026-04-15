# Phase 5: Vault Contracts (Block E) - Context

**Gathered:** 2026-04-15 (auto mode)
**Status:** Ready for planning

<domain>
## Phase Boundary

Typizzare nel bridge (`@x9-forge/contracts/vault`) i contratti del vault 3-tier esistente in Forge:
- `VaultTier` + `VaultSyncState` + helper `toSyncState(tier)`
- `VaultEntryEncrypted` (AES wire format) **distinto** da `VaultEntryPlain` (DTO post-decrypt)
- `VaultSyncEvent` per `POST /api/vault/sync-all` (request + response)
- `PlatformBootstrapEnv` (4 env server NON vaulted)
- `AgentVaultedCredentials` (alias tipizzato di `AgentCredentials`, categorie documentate)
- `WorkspaceFile` shape condiviso (tier-based, stesso pattern del vault)

Il bridge **non** implementa crypto né cascade logic — quelli vivono in Forge (`services/vault/src/lib/crypto.ts`, `services/vault/src/services/vault.service.ts`). Il bridge tipizza solo i contratti cross-repo. Phase 5 non introduce nuovi endpoint: tipizza `sync-all` esistente + prepara i contratti che Forge+X9 consumeranno.

Out of scope (belong altrove):
- Live push vault → X9 (deferred to v1.1 — requirement RNTM-01)
- Credential rotation (deferred to product launch)
- Vault UI tipizzato (Forge-local concern)
- Endpoint nuovi di push/pull vault (se emergono, Phase 6+ o mini-phase)

</domain>

<decisions>
## Implementation Decisions

### Sub-path & module layout
- **D-01:** Sub-path export = `@x9-forge/contracts/vault`, allineato a `BRDG-02`. File layout in `src/vault/`: `vault-tier.ts`, `vault-sync-state.ts`, `vault-entry.ts` (Plain + Encrypted), `vault-sync-event.ts`, `workspace-file.ts`, `platform-bootstrap-env.ts`, `agent-vaulted-credentials.ts`, `index.ts` (barrel).
- **D-02:** Zod v4 come single source of truth — tipi TS via `z.infer` (pattern consolidato in Phase M/1/2/3/4). **Eccezione**: `PlatformBootstrapEnv` è type-only (non runtime), lo riconosciamo come boundary non validato.
- **D-03:** JSDoc su ogni export con `@see forge-v2/services/vault/src/...` per tracciabilità cross-repo (pattern Phase 4).

### VaultTier enum + cascade semantics
- **D-04:** `VaultTier = z.enum(['platform', 'owner', 'agent'])` — ordine lessicale coincide con priorità cascade (platform = più bassa, agent = più alta). Helper `compareTiers(a, b): -1 | 0 | 1` (pattern Phase 6 anticipato, qui utile per cascade check). Fonte: `forge-v2/services/vault/src/repositories/vault.repo.ts:5`.
- **D-05:** Nessun branding su tier — stringa literal enum basta. Coerente con `VLT-01`.

### VaultSyncState + helper toSyncState
- **D-06:** `VaultSyncState = z.enum(['synced', 'overridden'])`. Helper `toSyncState(tier: VaultTier): VaultSyncState` = `tier === 'agent' ? 'overridden' : 'synced'`. Lossy reverse (`fromSyncState`) **non esposto** — documentato in JSDoc che `synced` ammette platform|owner ambiguo.
- **D-07:** Unit test esplicito per ogni tier → syncState, +1 test che afferma reverse è intenzionalmente non-fornito.

### VaultEntryPlain vs VaultEntryEncrypted (Plain/Encrypted separation)
- **D-08:** Due schema Zod **distinti**, nessun union tipo-safe — il consumer sceglie esplicitamente. `VaultEntryPlain` = `{ key: string; value: string; tier: VaultTier; isSecret: boolean; isCustomized: boolean; agentId: number | null; ownerId: number | null; updatedAt: z.iso.datetime() }`. `VaultEntryEncrypted` = stesso shape ma `value` deve matchare regex wire format + `isSecret: z.literal(true)`.
- **D-09:** IDs numerici (`agentId: number | null`, `ownerId: number | null`) — **non** branded. Motivazione: la colonna Drizzle è `number` (serial), cast a branded `AgentId` string forzerebbe conversione non-lossless cross-repo. Documentare in JSDoc che `agentId` (vault) ≠ `AgentId` branded (AgentContextCore) — sono concetti diversi (DB row vs deployment slug).
- **D-10:** Fixture test reali: catturare almeno 3 vault entries via query SQL staging (una per tier), parse green con lo schema corretto, parse red con schema opposto (Plain rifiuta wire format, Encrypted rifiuta plaintext senza `:`). Attenzione: **fixture mai committate con valori decrypted reali** — secretari redacted come `"REDACTED"` o synthetic.
- **D-11:** `isCustomized` derivato da `tier === 'agent'` è regola **Forge**, non enforced dal bridge schema (il bridge non fa semantic validation cross-field). Documentare come "consumer invariant" in JSDoc, non in Zod refinement.

### AES wire format (VaultEntryEncrypted.value)
- **D-12:** Wire format = `iv_hex:auth_tag_hex:ciphertext_hex` (3 segmenti hex separati da `:`). Specifica: AES-256-GCM, `iv` = 12 byte (24 hex char), `authTag` = 16 byte (32 hex char), ciphertext variabile. Fonte: `forge-v2/services/vault/src/lib/crypto.ts:29-36`.
- **D-13:** Zod schema usa **regex** `^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$` (case-insensitive disabled — Node `toString('hex')` produce lowercase). Messaggio d'errore deve dire esplicitamente "expected AES-256-GCM wire format: iv_hex(24):authTag_hex(32):ciphertext_hex" per aiutare debug.
- **D-14:** Test di non-leak: fixture con valore wire format NON deve parse-arre come `VaultEntryPlain`. Fixture con valore plaintext NON deve parse-arre come `VaultEntryEncrypted`. Questo è il guard principale contro wire-format leak.

### VaultSyncEvent (POST /api/vault/sync-all)
- **D-15:** Endpoint esistente, auth = superadmin Clerk (non un header bridge — è auth applicativa Forge, fuori scope del bridge contract). Request body: **vuoto** (trigger-only). Response: `{ ok: boolean; synced: SyncAgentResult[]; errors: SyncAgentResult[] }` dove `SyncAgentResult = { slug: string; keys?: number; error?: string }`. Fonte: `forge-v2/services/vault/src/services/vault.service.ts:289` + `forge-v2/services/vault/src/routes/vault.ts:167-181`.
- **D-16:** **Auth header**: `sync-all` è route interna Forge con `requireAuth + requireSuperadmin` (Clerk session). Il bridge tipizza solo request/response shape; il bridge client `createBridgeClient` non viene usato per questo endpoint (no cross-repo call — Forge web → Forge vault-svc). Documentare nel contract che l'auth non è `X-Internal-*` ma platform session, quindi usa `auth: 'none'` nel senso bridge-client (delegato a Clerk middleware).
- **D-17:** `VaultSyncEvent` nome rimane in requirement (`VLT-05`) ma pragmaticamente si chiama `SyncAllRequest` / `SyncAllResponse` + tipo helper `SyncAgentResult`. Re-export anche come `VaultSyncEvent = SyncAllResponse` per aderenza nomenclatura requirement.

### PlatformBootstrapEnv (NON vaulted)
- **D-18:** Type-only (no Zod runtime) — è documentazione contrattuale cross-repo delle env che DEVONO esistere server-side Forge e NON possono vivere nel vault (pena ricorsione: il vault è cifrato con `VAULT_KEY`, quindi `VAULT_KEY` stesso non può essere nel vault).
- **D-19:** Shape: `type PlatformBootstrapEnv = { VAULT_KEY: string; DATABASE_URL: string; CLERK_SECRET_KEY: string; SUPERADMIN_CLERK_ID: string }`. JSDoc esplicito: "NON vaulted — queste env vivono in env server (`forge-v2/services/*/src/env.ts` o container env)". Nessun helper, nessun parse.

### AgentVaultedCredentials
- **D-20:** Alias + re-export di `AgentCredentials` da `@x9-forge/contracts/agent` (Phase 2) — **non duplicare** 17 known keys. Nel file `src/vault/agent-vaulted-credentials.ts` esportiamo `export { AgentCredentialsSchema as AgentVaultedCredentialsSchema, type AgentCredentials as AgentVaultedCredentials } from '../agent/agent-credentials'` + JSDoc che categorizza le chiavi: `LLM (OPENAI/ANTHROPIC/GOOGLE)`, `Telegram (TELEGRAM_BOT_TOKEN)`, `Webhook (FORGE_VOICE_REGISTER_TOKEN, AGENTMAIL_*)`, `Internal (INTERNAL_SECRET, X9_INTERNAL_SECRET)`.
- **D-21:** Nessuna regola Zod refinement "must include LLM key" — è business-level, cambia per capability. Bridge tipizza, non decide.

### WorkspaceFile shape
- **D-22:** `WorkspaceFile = { agentId: number; ownerId: number | null; tier: VaultTier; path: string; content: string | null; isCustomized: boolean; updatedAt: z.iso.datetime() }`. Fonte: `forge-v2/services/workspace/src/services/workspace.service.ts:361-389`. Riutilizza `VaultTier` — stesso pattern 3-tier.
- **D-23:** `content: string | null` (null quando file unreadable — pattern Forge). Nessuna size/tokens field (quelli sono `FileNode` interno a Forge, non cross-repo). `path` = relativa al workspace root, stringa opaca (no schema di validazione path — Forge fa già quello).

### Claude's Discretion
- Organizzazione esatta dei test (split per file vs un singolo `vault.test.ts`) — Claude decide in planning per massimizzare leggibilità.
- Esatta formulazione dei messaggi di errore Zod (entro il vincolo D-13 che devono essere diagnostici).
- Nome del compare helper (`compareTiers` vs `cascadePriority`) — Claude decide in planning, prevalendo consistenza con futuri Model Router helpers (Phase 6).
- Decisione se `VaultSyncState` enum export anche una const `VAULT_SYNC_STATES = ['synced', 'overridden'] as const` — pattern da Phase 2 `KNOWN_CREDENTIAL_KEYS`; Claude lo aggiunge se utile per UI Forge downstream.

### Folded Todos
Nessun todo foldato — `gsd-tools todo match-phase 5` ha restituito 0 match.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap & requirements
- `.planning/ROADMAP.md` §"Phase 5: Vault Contracts (Block E)" (lines 165-187) — Goal, requirements VLT-01..08, 3 plans (research 05-01, bridge 05-02, Forge migration 05-03).
- `.planning/REQUIREMENTS.md` §"Vault Contracts (VLT)" (lines 60-69) — 8 requirement entries VLT-01..08.
- `.planning/PROJECT.md` §"Key Decisions" (lines 114-135) — Vault 3-tier decisions, `X9_INTERNAL_SECRET` = vault-exclusive, synced/overridden semantics, PlatformBootstrapEnv ricorsione.

### Forge vault implementation (source of truth)
- `forge-v2/services/vault/src/lib/crypto.ts` — AES-256-GCM encrypt/decrypt, wire format `iv:tag:ciphertext` in hex, `VAULT_KEY` hex-encoded 32-byte.
- `forge-v2/services/vault/src/repositories/vault.repo.ts` — `VaultTier`, `VaultRow`, tier-aware queries, upsert con `isCustomized` derivato da tier.
- `forge-v2/services/vault/src/services/vault.service.ts` — 3-tier cascade `resolve()`, `syncGlobalToAllAgents()`, `syncToEnvFile()` con merge order platform < owner < agent.
- `forge-v2/services/vault/src/routes/vault.ts` §`POST /api/vault/sync-all` (lines 167-181) — endpoint shape: empty body → `{ ok, synced[], errors[] }`.

### Forge workspace implementation (WorkspaceFile source)
- `forge-v2/services/workspace/src/services/workspace.service.ts:361-389` — `syncWorkspaceFilesToDB()` con tier classification + upsert + isCustomized preservation.

### Bridge prior phases (reused contracts)
- `src/agent/agent-credentials.ts` — `AgentCredentialsSchema` + `KNOWN_CREDENTIAL_KEYS` (17 keys), riusato come `AgentVaultedCredentials`.
- `src/agent/agent-context-core.ts` — `AgentContextCore`, `AgentIdentity` branded (NB: branded AgentId ≠ vault agentId numerico, documentare).
- `src/http/` (Phase 4) — pattern Zod schema + `z.infer` + fixture test reali + JSDoc `@see forge-v2/...`.

### Open risks relevant to Phase 5
- `.planning/STATE.md` §"Open risks carried forward" (lines 83-88) — R-10 WR-01/02/03 non-blocking ma memo; Phase 5 non li tocca.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/agent/agent-credentials.ts` — 17 known keys + catchall. Riusato 1:1 per `AgentVaultedCredentials`. Zero duplicazione.
- `src/http/` Phase 4 pattern — `createBridgeClient` (skeleton + NoAuth variant post-Phase 4.1) disponibile se Phase 5 aggiunge contratti endpoint aggiuntivi cross-repo (non previsto in VLT-01..08 ma possibile se research 05-01 lo richiede).
- `src/index.ts` — barrel pattern: ogni sub-path esporta da `src/<name>/index.ts`.
- Test fixture pattern (Phase 4): `tests/fixtures/*.json` + `parse()` test, forbid fixtures con secrets reali.

### Established Patterns
- Zod v4 + `z.infer` come single source of truth (BRDG-04). Gli schemi sono `const FooSchema = z.object({...})`, i tipi `type Foo = z.infer<typeof FooSchema>`. Questo pattern è usato in ogni Phase precedente.
- JSDoc `@see forge-v2/<path>` per cross-repo traceability (Phase 4).
- Zero-runtime-dep per sub-moduli (`createBridgeClient` usa solo `fetch` nativo). Phase 5 non dovrebbe introdurre dep runtime: crypto/validazione AES sta in Forge, il bridge solo tipizza.
- `exactOptionalPropertyTypes: true` attivo — fields opzionali devono essere `field?: T | undefined` espliciti, non `field: T | undefined`.

### Integration Points
- Forge `vault.service.ts` + `vault.repo.ts` + `vault.ts` routes → consumeranno `@x9-forge/contracts/vault` via shim in Phase 7 (o re-export in `packages/types/src/x9.ts`). Phase 5 piano 05-03 è la migration Forge concreta.
- X9 **non consuma** direttamente i contratti vault nel runtime attuale — il vault è interamente Forge-side; X9 riceve credentials già-decrypted via `context.credentials` (tipizzato in Phase 2 `AgentContextCore`). Possibile re-export in `agent-x9/packages/types/` solo se X9 aggiunge UI/log vault-aware in futuro.
- DB schema Forge (`vaultEntries`, `workspaceFiles` in `forge-v2/packages/db`): il bridge tipizza il **DTO/wire shape**, non lo schema Drizzle. Mismatch tollerato se documentato (es. Drizzle `tier: string` vs bridge `VaultTier = 'platform'|'owner'|'agent'`).

</code_context>

<specifics>
## Specific Ideas

- "Vault nasce come escamotage di centralizzazione, è la verità" (Stefano, 2026-04-14) — quindi `X9_INTERNAL_SECRET` e tutte le env applicative sono nel vault, mentre `VAULT_KEY`/`DATABASE_URL`/`CLERK_SECRET_KEY`/`SUPERADMIN_CLERK_ID` restano env server (ricorsione impossibile).
- "Synced vs overridden" è la semantica UI/docs di Forge, mentre `platform|owner|agent` è la semantica DB/runtime. Il bridge espone entrambe via `VaultSyncState` + `toSyncState(tier)` — riconcilia i due vocabolari senza duplicare stato.
- `VaultEntryEncrypted` vs `VaultEntryPlain` distinzione tassativa: niente "nullable encryption" o "conditional plaintext" field. Un consumer scrive plaintext → sa che è decrittato; scrive wire format → sa che è cifrato. Zero ambiguità → zero wire-format leak come quello che potrebbe emergere se i due tipi si confondessero (pattern difensivo simile a Phase 3 Bug #15 guard).
- Phase 4 ha introdotto il pattern "fixture reali catturate da staging + parse test": Phase 5 deve fare lo stesso per almeno `VaultEntryPlain` e `VaultEntryEncrypted`. Staging VPS però ha vault (vs context.json era empty in Phase 2): catturare 3 entries con valori redacted — il plan 05-03 userà questi fixture per il contract test Forge.
- `AgentVaultedCredentials` documenta le 4 categorie funzionali (LLM/Telegram/Webhook/Internal) ma non le enforce a schema: è doc-only perché le capability possono registrare chiavi dinamiche (catchall già in Phase 2).

</specifics>

<deferred>
## Deferred Ideas

- **Live push vault → X9** (senza rigenerare `context.json`) — requirement RNTM-01, out of scope v1, tracciato in REQUIREMENTS §v2.
- **Credential rotation** endpoints — deferred al lancio prodotto (Stefano). Se emerge urgenza, è una mini-phase futura.
- **Vault UI schema** (Forge-local) — non cross-repo, resta in `forge-v2/web/`.
- **Endpoint nuovi vault push/pull** (oltre `sync-all`) — non richiesti da VLT-01..08. Se la research 05-01 scopre che servono, valutare mini-phase decimale (5.1) per evitare scope creep su Phase 5.
- **Brand IDs vault** (`VaultRowId`, `VaultEntryId`) — anti-feature AF-02 per v1 (brand solo su AgentId/OwnerId/TenantId/SessionId/ConversationId, PROJECT.md line 120).
- **`fromSyncState(state)` helper** — intenzionalmente non esposto (lossy). Se un consumer lo richiede, documentare i tradeoff prima di aggiungerlo.
- **Multi-user dentro agent** (userId filter in memory recall) — REQUIREMENTS v2 RNTM-02, separata da vault.

### Reviewed Todos (not folded)
Nessun todo in attesa matchava Phase 5 (`gsd-tools todo match-phase 5` → 0 match).

</deferred>

---

*Phase: 05-vault-contracts-block-e*
*Context gathered: 2026-04-15 (auto mode — all gray areas auto-resolved with recommended defaults, see DISCUSSION-LOG.md for audit trail)*
