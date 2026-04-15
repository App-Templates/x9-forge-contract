# Phase 6: Model Router Contracts (Block F) - Context

**Gathered:** 2026-04-16 (auto mode)
**Status:** Ready for planning

<domain>
## Phase Boundary

Typizzare nel bridge (`@x9-forge/contracts/model-router`) i 5 contratti nuovi del Model Router, **greenfield**, prerequisito di agent-x9 Phase 35 e forge-v2 Phase 10:

- `ModelTier` ordered enum (`standard | advanced | reasoning`) + helper `compareTiers(a, b): -1 | 0 | 1`
- `ModelTierMapping` tipizzato (tier → modelId) + `ModelProvider` enum
- `ModelPolicy` (`{ min, max }`) con invariant `compareTiers(min, max) <= 0` fail-loud via Zod `.refine()`
- `POST /internal/model-config` endpoint contract (request/response/auth) — endpoint dichiarato, **non implementato** in questa phase
- `ModelHotReloadNotification` shape (meccanismo SSE vs polling → research-phase 06-01 decide)
- `PerAgentModelOverride` tipizzato per la visione clone-specific ("clone X usa reasoning tier")
- Estensione non-breaking di `CapabilityRegistryEntry` con `modelPolicy?` opzionale

Il bridge **freeza i contratti**: Phase 35 X9 e Phase 10 Forge potranno essere implementate solo importando da qui. Nessuna logica runtime nel bridge (no push, no hot-reload, no policy enforcement — tutti Forge/X9 side).

Out of scope (belong altrove):
- Implementazione runtime Model Router in X9 (Phase 35)
- UI Model Router in Forge (Phase 10)
- LLM provider adapters / SDK integration (X9/Forge)
- Rotation / versioning dei mapping (v1.1 o later)
- Billing / usage tracking per tier (out of milestone)

</domain>

<decisions>
## Implementation Decisions

### Sub-path & module layout
- **D-01:** Sub-path export = `@x9-forge/contracts/model-router`, allineato a `BRDG-02` (pattern Phase 5 `vault`, Phase M `memory`). File layout in `src/model-router/`:
  - `model-tier.ts` — `ModelTierSchema`, `TIER_ORDER`, `compareTiers()`
  - `model-provider.ts` — `ModelProviderSchema` (`openai | anthropic | google`)
  - `model-tier-mapping.ts` — `ModelTierMappingSchema`
  - `model-policy.ts` — `ModelPolicySchema` (con refine)
  - `model-push.ts` — `ModelPushRequest`/`ModelPushResponse`/`pushModelConfigContract`
  - `model-hot-reload.ts` — `ModelHotReloadNotificationSchema` (+ SSE frame variant)
  - `per-agent-model-override.ts` — `PerAgentModelOverrideSchema`
  - `index.ts` — barrel
- **D-02:** Zod v4 come single source of truth, tipi TS via `z.infer` (pattern consolidato Phase M/1/2/3/4/5). Zero dep runtime (solo zod).
- **D-03:** JSDoc su ogni export con `@see agent-x9/.planning/ROADMAP.md §Phase 35` + `@see forge-v2/.planning/... §Phase 10` (a research-phase 06-01 concluso: paths esatti). Marker esplicito `@status greenfield — consumers planned, no live endpoint yet` fino a Phase 35 landing.

### ModelTier enum + comparator
- **D-04:** `ModelTierSchema = z.enum(['standard', 'advanced', 'reasoning'])` — ordine lessicale **non** coincide con priorità (a differenza di `VaultTier`). Ordine logico esposto via `TIER_ORDER: readonly ModelTier[] = ['standard', 'advanced', 'reasoning'] as const` (low → high capability). Fonte: MDRT-01.
- **D-05:** `compareTiers(a: ModelTier, b: ModelTier): -1 | 0 | 1` implementato via `TIER_ORDER.indexOf(a) - TIER_ORDER.indexOf(b)` normalizzato a `-1 | 0 | 1`. Unit test esplicito per tutte le 9 combinazioni (3×3) + invariant `compareTiers(t, t) === 0`.
- **D-06:** Nessun branding (stringa literal enum basta, coerente con `VaultTier` Phase 5 D-05). Anche esposto const `MODEL_TIERS = ['standard', 'advanced', 'reasoning'] as const` per UI Forge downstream (pattern Phase 2 `KNOWN_CREDENTIAL_KEYS`).
- **D-07:** Estensibilità: documentare in JSDoc che aggiunta di un nuovo tier (es. `'omni'`) è **breaking change semantico** (riordina `TIER_ORDER`) quindi richiede bump esplicito; il bridge lo enforza implicitamente perché consumer pattern-matcha l'enum.

### ModelProvider enum
- **D-08:** `ModelProviderSchema = z.enum(['openai', 'anthropic', 'google'])` — 3 provider in v1 per MDRT-02. Estensibile (pattern identico a ModelTier). JSDoc documenta che `'google'` è placeholder (Gemini) e può essere rimosso se research 06-01 scopre che non è richiesto in Phase 35 v1 (decisione deferita a research).

### ModelTierMapping
- **D-09:** `ModelTierMappingSchema = z.record(ModelTierSchema, z.string().min(1))` — mapping piatto tier → modelId (es. `{ standard: 'gpt-4.1-mini', advanced: 'o4-mini', reasoning: 'claude-opus-4-6' }`). **Provider scoping vive al livello `ModelPushRequest`** (vedi D-13), non dentro il mapping — evita `Record<Provider, Record<Tier, string>>` troppo nested come default.
- **D-10:** Tutti i tier DEVONO essere presenti nel mapping (no optional field). Refine Zod `.refine(m => TIER_ORDER.every(t => t in m))` con errore diagnostico "missing mapping for tier: X". Rationale: un mapping parziale è runtime fragile (fallback ambiguo); meglio forzarne completezza contrattuale.

### ModelPolicy + invariant min <= max
- **D-11:** `ModelPolicySchema = z.object({ min: ModelTierSchema, max: ModelTierSchema }).refine(p => compareTiers(p.min, p.max) <= 0, { message: 'ModelPolicy violates invariant min <= max: received { min: X, max: Y }', path: ['max'] })`. Pattern identico a T-05-01 guard Phase 5 (Zod `.refine()` cross-field con messaggio diagnostico).
- **D-12:** Default per MDRT-04 (registry entry extension): `{ min: 'standard', max: 'standard' }` — consumer passa esplicitamente, il bridge non fornisce un `DEFAULT_MODEL_POLICY` const (evita implicit fallback; forza decisione consapevole). Documentare in JSDoc la convention.

### ModelPushRequest / ModelPushResponse / endpoint contract
- **D-13:** `ModelPushRequestSchema` = `z.object({ providers: z.record(ModelProviderSchema, ModelTierMappingSchema), perCapPolicies: z.record(z.string().min(1), ModelPolicySchema).optional(), perAgentOverrides: z.array(PerAgentModelOverrideSchema).optional() })`. Provider scoping qui (D-09). Chiave `perCapPolicies` = capability name (stringa opaca — non branded, coerente con `CapabilityRegistryEntry.name`).
- **D-14:** `ModelPushResponseSchema` = **discriminated union** su `ok` (pattern Phase 4 SC #5 standardized response):
  - Success: `{ ok: true, applied: number, reloadVersion?: string }` (applied = numero di capability aggiornate; reloadVersion opzionale per correlazione con `ModelHotReloadNotification`)
  - Error: `{ ok: false, code: 'INVALID_POLICY' | 'UNKNOWN_CAP' | 'INVALID_MAPPING' | 'INTERNAL_ERROR', message: string, details?: { capName?: string; reason: string }[] }`
- **D-15:** `pushModelConfigContract` = `{ method: 'POST', path: '/internal/model-config', authType: 'secret', requestSchema: ModelPushRequestSchema, responseSchema: ModelPushResponseSchema }` — auth = `X-Internal-Secret` (pattern Phase 3 reload, direzione Forge → X9). **Endpoint non implementato in Phase 6**, solo dichiarato: plan 06-02 aggiunge il contract in `src/http/endpoints/internal-model-config.ts` + registra in `endpoints/index.ts` (pattern Phase 4).
- **D-16:** Direzione: Forge → X9 (Forge UI Phase 10 pusha la config, X9 Phase 35 la riceve). Pattern identico a `reloadAgentContract`. Nessuna chiamata bidirezionale in v1.

### ModelHotReloadNotification (meccanismo deferred a research)
- **D-17:** **Shape locked, meccanismo aperto**. `ModelHotReloadNotificationSchema = z.object({ version: z.string().min(1), appliedAt: z.iso.datetime(), providersChanged: z.array(ModelProviderSchema).optional(), capsChanged: z.array(z.string().min(1)).optional() })`. Rationale: la shape è stabile indipendentemente dal trasporto, e consumer (X9 capability) può consumarla sia via SSE frame sia via polling response.
- **D-18:** **Meccanismo (SSE vs polling) → research-phase 06-01**: il plan 06-01 deve decidere leggendo `agent-x9/.planning/ROADMAP.md §Phase 35` e in base a questo fornire:
  - Se SSE: aggiungere SSE frame type `'model-config-reloaded'` a `src/http/sse-frames.ts` (pattern Phase 4 D-16 `/internal/turn/stream`) con payload = `ModelHotReloadNotification`.
  - Se polling: aggiungere endpoint contract `GET /internal/model-config/version` → `{ version, appliedAt, ... }` con auth secret.
  - Se entrambi: plan 06-02 produce entrambi.
- **D-19:** Bridge **tipizza, non decide il meccanismo** (pattern Phase 5 D-21 "Bridge tipizza, non decide"). Research-phase 06-01 produce RESEARCH.md con decisione + justification; plan 06-02 implementa il scelto (o entrambi).

### PerAgentModelOverride
- **D-20:** `PerAgentModelOverrideSchema = z.object({ agentId: AgentIdentitySchema, policy: ModelPolicySchema.optional(), tierMapping: z.record(ModelTierSchema, z.string().min(1)).partial().optional() }).refine(o => o.policy !== undefined || o.tierMapping !== undefined, { message: 'PerAgentModelOverride must specify at least one of: policy, tierMapping' })`. Riusa `AgentIdentitySchema` branded da Phase 2 D-01 (slug-based, non numeric come vault D-09). Rationale: Model Router config è runtime-facing e X9 parla AgentIdentity; vault è DB-facing.
- **D-21:** Semantica "tier=agent vault override" (MDRT-08 SC #6) è **documentata**, non enforced a schema. JSDoc esplicito: "Un `PerAgentModelOverride` equivale semanticamente a un `VaultTier === 'agent'` per i campi model config — ma è storato separatamente nella model config, non nel vault (evita ricorsione + permette hot-reload indipendente)."
- **D-22:** Partial tierMapping: diversamente da D-10 (ModelTierMapping global completa), l'override per-agent può specificare solo un sottoinsieme di tier (es. solo `reasoning: 'claude-opus-4-6'`). I tier non specificati cadono sul mapping globale del provider. Documentare in JSDoc.

### CapabilityRegistryEntry.modelPolicy? extension (MDRT-04)
- **D-23:** Aggiungere `modelPolicy: ModelPolicySchema.optional()` a `CapabilityRegistryEntrySchema` (file `src/capability/capability-registry-entry.ts`). Non-breaking: entries esistenti senza il field continuano a parsare verdi (optional).
- **D-24:** Default comportamentale = `{ min: 'standard', max: 'standard' }` (D-12) applicato dal **consumer** (X9 registry loader), non dal bridge. Documentare in JSDoc della field con snippet: `// Consumer should default to { min: 'standard', max: 'standard' } when absent.`.
- **D-25:** Migration path test (plan 06-03): 2 fixture JSON reali (catturati da staging X9 pre-Phase 35) senza `modelPolicy` → parse green; 1 fixture invented con `modelPolicy: { min: 'standard', max: 'reasoning' }` → parse green; 1 fixture con policy invalida (`min: 'reasoning', max: 'standard'`) → parse red con errore D-11. Nessuna modifica a `toEndpoint()`/`fromEndpoint()` (non toccano il field).

### Fixture strategy (greenfield)
- **D-26:** Phase 6 è **greenfield** — no staging endpoint live. Fixture `tests/fixtures/model-router/*.json` sono **invented** (pattern ROADMAP plan 06-02 "fixture invented"). Documentare in ogni fixture header `// SYNTHETIC — no live endpoint, will be replaced with staging capture once Phase 35 X9 ships`.
- **D-27:** Coverage fixture minima: (a) request push minimale (solo providers, no overrides), (b) request push completa (providers + perCapPolicies + perAgentOverrides), (c) response success, (d) response error per ognuno dei 4 codes, (e) hot-reload notification minimale, (f) registry entry con modelPolicy, (g) registry entry senza modelPolicy (backward compat).

### Coordination with X9 Phase 35 (plan 06-01 research-phase)
- **D-28:** Plan 06-01 è **research-phase obbligatoria** prima di 06-02. Deve:
  1. Leggere `agent-x9/.planning/ROADMAP.md` §Phase 35 (il path esatto è `/Users/admintemp/Downloads/Claude/agent-x9/.planning/ROADMAP.md`, user memory `project_agent_x9_phase36.md` conferma Phase 36 esiste; Phase 35 precede ed è quella prerequisito).
  2. Produrre RESEARCH.md con: mapping X9 Phase 35 nomi → bridge nomi (se divergenti, decidere quale vince → bridge ha precedenza per BRDG-03), meccanismo hot-reload scelto (SSE/polling/entrambi), provider list finale (D-08 `google` conferma/rimozione), shape `ModelPushRequest` conferma o amend.
  3. Aggiornare `agent-x9/.planning/ROADMAP.md` §Phase 35 con riferimento al bridge (goal MDRT-07 del ROADMAP bridge: "Roadmap agent-x9 Phase 35 aggiornato per importare dal bridge").
- **D-29:** Se research 06-01 scopre divergenze strutturali con Phase 35 draft (es. provider scoping nested richiesto): **fallback** = plan 06-02 schedula una amend decision prima di freeze, non dopo. In caso di amend sostanziale, notificare utente (Stefano) prima di committare il bridge.

### JSDoc & traceability
- **D-30:** Ogni export ha JSDoc con: (a) `@see` cross-repo a Phase 35 X9 + Phase 10 Forge (paths esatti post-research), (b) `@status greenfield` marker (D-03), (c) per helper (compareTiers): esempi `@example`. Pattern Phase 5 D-03.

### Claude's Discretion
- Esatta formulazione dei messaggi d'errore Zod (entro il vincolo D-11 che devono essere diagnostici e citare il valore ricevuto).
- Split test files (un test per schema vs singolo `model-router.test.ts`) — Claude decide in planning per massimizzare leggibilità, allineato al pattern Phase 5 (`vault.test.ts` unico vs split).
- Aggiunta o meno di `MODEL_PROVIDERS` const esportato (specchio di `MODEL_TIERS` D-06) — Claude aggiunge se utile a UI Forge Phase 10 downstream (senza costo runtime).
- Naming `pushModelConfigContract` vs `modelConfigPushContract` — Claude sceglie in planning, allineandosi al pattern `reloadAgentContract` di Phase 4 (verb-first).
- Se plan 06-02 deve includere anche un `@x9-forge/contracts/model-router` re-export al root `src/index.ts` — pattern Phase 5 (ogni sub-path re-esportato al root). Claude default: sì, coerenza.

### Folded Todos
Nessun todo foldato — `gsd-tools todo match-phase 6` ha restituito 0 match.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap & requirements (bridge)
- `.planning/ROADMAP.md` §"Phase 6: Model Router Contracts (Block F)" (lines 190-213) — Goal, requirements MDRT-01..08, 3 plans (research 06-01, bridge 06-02, capability extension 06-03), dependency su Phase 1 + Phase 4.
- `.planning/REQUIREMENTS.md` §"Model Router Contracts (MDRT)" (lines 73-82) — 8 requirement entries MDRT-01..08.
- `.planning/PROJECT.md` §"Visione architetturale target" (lines 15, 54-58) — Model Router nello scope v1 del bridge; §"Key Decisions" lines 127-128 — "bridge PRIMA di Phase 35", "Model Router contracts inclusi nello scope v1".

### Prior phases (reused contracts & patterns)
- `src/capability/capability-registry-entry.ts` (Phase 1) — schema da estendere con `modelPolicy?` (MDRT-04, D-23). Struttura attuale: `{ name, enabled, host, port, version, protocol?, tools? }`.
- `src/agent/agent-context-core.ts` (Phase 2) — `AgentIdentitySchema` branded slug-based, riusato per `PerAgentModelOverride.agentId` (D-20).
- `src/http/bridge-client.ts` + `src/http/endpoints/internal-agents-reload.ts` (Phase 3+4) — pattern `createBridgeClient<'secret'>` + contract shape (`method`, `path`, `authType`, request/responseSchema) — riusato per `pushModelConfigContract` (D-15).
- `src/http/sse-frames.ts` + `src/http/sse-parser.ts` (Phase 4) — pattern SSE frame shape, disponibile per hot-reload se research 06-01 sceglie SSE (D-18).
- `src/http/response.ts` (Phase 4) — discriminated `{ ok: true } | { ok: false, code, message, details? }`, pattern per `ModelPushResponse` (D-14).
- `src/vault/vault-tier.ts` (Phase 5) — pattern ordered enum + compare helper, precedente direttamente applicabile a `ModelTier` (D-04, D-05). NB: nomenclatura — vault 3-tier ≠ model 3-tier, semantica diversa.

### X9 coordination (research-phase 06-01)
- `agent-x9/.planning/ROADMAP.md` §"Phase 35" (path assoluto: `/Users/admintemp/Downloads/Claude/agent-x9/.planning/ROADMAP.md`) — design draft X9 Model Router, da **leggere** in 06-01 e da **aggiornare** post-Phase 6 freeze (MDRT-07 roadmap SC #7).
- `agent-x9/.planning/REQUIREMENTS.md` (se esiste) — eventuali requirement MDRT agent-x9 side da allineare.

### Forge coordination (post-Phase 6, informativa)
- `forge-v2/.planning/ROADMAP.md` §"Phase 10 Model Router UI" — dipende dal bridge, consumerà `ModelPushRequest`/`ModelTierMapping` via compat shim `packages/types/src/x9.ts` (plan fuori scope Phase 6, referenza per plan 06-02 JSDoc traceability D-30).

### Bridge tooling
- `tsconfig.json` — `exactOptionalPropertyTypes: true`, quindi optional fields devono essere dichiarati come `field?: T | undefined` esplicito (vincolo cross-phase).
- `package.json` §`exports` — aggiungere entry `./model-router` che punta a `dist/model-router/index.js` (plan 06-02, pattern Phase 5 vault).
- `scripts/check-drift.ts` (se esiste post-Phase 5) — il contract drift guard cross-repo. Phase 6 è greenfield quindi non ha drift check immediato, ma plan 06-02 può estenderlo con check su `capability-registry-entry` (il solo consumer esistente modificato, D-23).

### Open risks / deferred
- `.planning/STATE.md` — session state, lettura rapida per verificare risk note carry-forward (R-10 WR-01/02/03 tracciati come non-blocking, chiusi 2026-04-16 per memoria).
- Phase 35 agent-x9 è **non ancora pianificata**: research 06-01 potrebbe scoprire che X9 design doc è minimale/assente, in quel caso il bridge freeza comunque la shape di default e X9 Phase 35 è forzata a consumarla.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/model-router/index.ts` esiste come placeholder Phase 0 (`export {}`) — plan 06-02 lo sostituisce con barrel reale.
- `src/capability/capability-registry-entry.ts` — estensione non-breaking `modelPolicy?`; helper `toEndpoint()`/`fromEndpoint()` **non toccati** (non consultano modelPolicy).
- `src/agent/agent-context-core.ts` — `AgentIdentitySchema` branded, riuso 1:1 per `PerAgentModelOverride.agentId`. Coerente con scelta runtime-facing vs DB-facing (vault `agentId` numerico, Phase 5 D-09).
- `src/http/endpoints/*.ts` — template `pushModelConfigContract` segue lo stesso shape di `reloadAgentContract` (`method`, `path`, `authType: 'secret'`, schemas). Plan 06-02 aggiunge `internal-model-config.ts` e lo registra in `endpoints/index.ts`.
- `src/http/response.ts` — discriminated response pattern per `ModelPushResponseSchema` (D-14).
- `src/http/sse-frames.ts` + `sse-parser.ts` — disponibili se research 06-01 sceglie SSE per hot-reload (D-18).
- Test fixture pattern Phase 4/5 — `tests/fixtures/**/*.json` + `parse()` verde/rosso test; adattato a fixtures synthetic (D-26).

### Established Patterns
- Zod v4 + `z.infer` single source of truth (BRDG-04) — ogni schema è `const FooSchema = z.object({...})`, tipo `type Foo = z.infer<typeof FooSchema>`.
- Sub-path export per modulo (`@x9-forge/contracts/vault`, `/agent`, `/capability`, `/http`, `/memory`) — Phase 6 aggiunge `/model-router`.
- JSDoc `@see forge-v2/<path>` / `@see agent-x9/<path>` per cross-repo traceability (Phase 4/5).
- Ordered enum + compare helper (pattern Phase 5 `VaultTier` + `compareTiers` discretion D-74) — Phase 6 canonicalizza `compareTiers` come helper condiviso (D-04, D-05).
- Discriminated response `{ ok: true, data } | { ok: false, code, message, details? }` (Phase 4 SC #5) — applicato a `ModelPushResponse` (D-14).
- Zod `.refine()` cross-field per invariant (pattern T-05-01 Phase 5 `VaultEntryEncrypted`) — applicato a `ModelPolicy` `min <= max` (D-11) e `ModelTierMapping` completezza (D-10).
- Zero runtime dep oltre zod. Nessuna nuova dep in Phase 6.
- `exactOptionalPropertyTypes: true` — tutti i field opzionali dichiarati come `field?: T | undefined`.

### Integration Points
- Forge Phase 10 UI consumerà `ModelPushRequest`/`ModelTierMapping`/`ModelPolicy` via `packages/types/src/x9.ts` re-export (plan fuori scope Phase 6, ma referenziato in JSDoc D-30).
- X9 Phase 35 runtime consumerà `ModelTier`/`compareTiers`/`pushModelConfigContract`/`CapabilityRegistryEntry.modelPolicy` via `packages/types/model-router.ts` re-export shim (nuovo — plan fuori scope Phase 6, research 06-01 allinea).
- X9 `scripts/generate-registry.ts` — pattern Phase 1 per produrre `registry.json` con `modelPolicy?` facoltativo (consumer-side default decision D-24). Fuori scope Phase 6 tipizzare lo script, dentro scope tipizzare l'entry.
- Nessun Forge endpoint implementato in Phase 6 (MDRT-05 dice esplicitamente "il bridge lo dichiara ma X9 non lo implementa in questa phase"). Plan 06-02 produce solo il contract; implementazione è Phase 35 X9 + Phase 10 Forge.

</code_context>

<specifics>
## Specific Ideas

- **"Clone X su Opus 4.6"** (Stefano, visione PROJECT.md line 58): `PerAgentModelOverride` è il tipo che cristallizza questa visione — override per-agent permette di pinare un clone specifico sul reasoning tier con modello preciso. Shape supporta sia policy (solo bound) sia tierMapping (modello specifico) per flessibilità (D-20, D-22).
- **"Bridge tipizza, non decide il meccanismo"** (principio Phase 5 D-21, Phase 6 D-19): la scelta SSE vs polling per hot-reload è una decisione di transporto, non di contratto. Il bridge freeza la **shape** del payload (`ModelHotReloadNotification`, D-17); research 06-01 decide il transport.
- **Freeze contract-first**: Phase 6 produce i tipi PRIMA dell'implementazione. Pattern opposto a Phase 5 (che tipizzava codice già esistente in Forge). Implicazioni: fixture invented (D-26), contract drift guard non immediatamente applicabile (no live endpoint), research-phase 06-01 obbligatoria per coordinare con X9 Phase 35 draft (D-28).
- **Non retrofittare**: la roadmap è esplicita (ROADMAP line 26 "greenfield, prerequisito Phase 35 X9" + PROJECT.md line 110 "non retrofittati da agent-x9 o forge-v2"). Se X9 Phase 35 ha già draft con naming divergente, **il bridge ha precedenza** (BRDG-03: bridge è single source of truth). Research 06-01 allinea X9 al bridge, non viceversa (D-28, D-29).
- **Granularità di `applied` nella response** (D-14): `applied: number` = numero di capability che hanno adottato la nuova config. In caso di errori parziali, `ok: false` con `details[]` per-cap — mai risposta mista `ok: true` con errors (evita ambiguità client).

</specifics>

<deferred>
## Deferred Ideas

- **Implementazione endpoint `POST /internal/model-config` in X9** — Phase 35 X9, non Phase 6 bridge.
- **UI Forge Phase 10** (model-router settings page, per-agent override UI, tier mapping editor) — consumerà il bridge, implementazione fuori scope.
- **Billing / usage tracking per tier** — product concern, out of milestone v1.
- **Rotation / versioning dei mapping** (es. `previousVersion`, rollback endpoint) — v1.1 o later. Il field `reloadVersion` in response (D-14) è un hook minimale per futura feature senza bloccare il design.
- **Provider-specific mapping nested** (`Record<Provider, Record<Tier, string>>` come shape default di `ModelTierMapping`) — scartato in D-09 in favore di provider scoping al livello `ModelPushRequest`; può essere reintrodotto se research 06-01 scopre forti requirement Phase 35 per nested struct.
- **Brand su `ModelTier` / `CapabilityName`** — anti-feature AF-02 v1 (brand solo su AgentId/OwnerId/TenantId/SessionId/ConversationId, PROJECT.md line 120). Coerente con Phase 5 D-05.
- **Plugin architecture per nuovi provider** — `ModelProvider` enum è chiuso in v1 (D-08); aprirlo richiede nuova phase.
- **Validazione cross-field tra `perCapPolicies` e `modelPolicy` in CapabilityRegistryEntry** (es. policy push-time deve rispettare policy registry-time) — logica semantica downstream (Forge/X9 runtime), non contratto. Bridge tipizza entrambi separatamente.
- **SSE auth model per hot-reload** (se research sceglie SSE) — usa `X-Internal-Secret` come Phase 4 `/internal/turn/stream` di default; research 06-01 conferma.

### Reviewed Todos (not folded)
Nessun todo in attesa matchava Phase 6 (`gsd-tools todo match-phase 6` → 0 match).

</deferred>

---

*Phase: 06-model-router-contracts-block-f*
*Context gathered: 2026-04-16 (auto mode — all gray areas auto-resolved with recommended defaults, see DISCUSSION-LOG.md for audit trail)*
