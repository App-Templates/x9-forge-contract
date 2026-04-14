# Feature Research — x9-forge-contract-bridge

**Domain:** TypeScript cross-repo contract package (compile-time, no runtime)
**Researched:** 2026-04-14
**Confidence:** HIGH (su categorizzazione e mapping Bug #15); MEDIUM (su scelta esatta libreria HTTP binding — ts-rest vs plain Zod vs zero-dep)

---

## Come leggere questo documento

Le features qui elencate NON sono "feature di un prodotto community". Sono **le capacita che il contract package deve possedere** per raggiungere il Core Value dichiarato in PROJECT.md:

> "Un cambio di contratto cross-repo che rompe la compatibilita DEVE generare errore di compilazione in entrambi i repo."

Criterio di test per OGNI feature: "Senza questa, Bug #15 potrebbe ripetersi? o il bridge e inutile? o la DX crolla?"

Ogni feature ha:
- **Categoria** — table stakes / differentiator / anti-feature
- **Complessita** — LOW / MEDIUM / HIGH
- **Dipendenze** — altre feature del bridge o librerie esterne
- **Stack fit** — compatibile con Zod v4 / Fastify 5 / Drizzle ORM 0.38.x / pnpm workspaces del monorepo esistente
- **Confidence** — HIGH / MEDIUM / LOW

---

## Feature Landscape

### TABLE STAKES — senza queste il bridge e inutile

Features non negoziabili. Se una manca, il bridge fallisce nel suo scopo.

#### TS-01 — Plain TS interfaces + `readonly` per tutti i contratti HTTP

| Campo | Valore |
|-------|--------|
| Categoria | Table stakes |
| Complessita | LOW |
| Dipendenze | TypeScript 5.x + `strict: true` |
| Stack fit | Compatibile 100% (gia in uso in entrambi i repo) |
| Confidence | HIGH |

**Cosa**: tutti i contratti cross-repo esposti come `interface` o `type` TS puri, con field `readonly` dove semanticamente immutabili. Niente class, niente decorator.

**Perche table stakes**: il bridge e un compile-time package. Zero runtime ignifica zero overhead per il consumer. Entrambi i repo gia usano lo stesso pattern (`capability.ts:1-38`, `x9.ts:3-48`).

**Preventivo Bug #15**: parziale — da solo TS interfaces NON previene Bug #15 (mancava l'header, ma `fetch()` accetta `Record<string,string>` generico). Deve combinarsi con TS-04 (typed HTTP client).

---

#### TS-02 — Branded types per gli identificatori

| Campo | Valore |
|-------|--------|
| Categoria | Table stakes |
| Complessita | LOW |
| Dipendenze | TypeScript 5.x |
| Stack fit | Nessun conflitto — oggi in X9 `ownerId`, `agentId`, `tenantId` sono tutti `string` confondibili |
| Confidence | HIGH |

**Cosa**: `AgentId`, `OwnerId`, `TenantId`, `SessionId`, `ConversationId`, `CallId` come branded types (`type AgentId = string & { __brand: 'AgentId' }`). Costruzione via helper `asAgentId(raw: string): AgentId`.

**Perche table stakes**: oggi in `agent-context.ts:1-14` `agentId: string`, `ownerId: string`. Un `swap` accidentale tra i due non fa TS error. In un bridge multi-tenant con vault 3-tier (`platform | owner | agent`), confondere gli scope e **catastrofico** (leak cross-tenant).

**Scope minimale** (no over-engineering): brand SOLO gli identificatori, NON stringhe arbitrarie tipo `description`, `displayName`. Vedi anti-feature AF-02.

**Preventivo Bug #15**: no (era un header mancante, non un ID swapppato). Ma previene classe di bug affini.

---

#### TS-03 — Discriminated union per auth headers (tagged per endpoint)

| Campo | Valore |
|-------|--------|
| Categoria | Table stakes |
| Complessita | LOW-MEDIUM |
| Dipendenze | TS-01 |
| Stack fit | Fastify 5 supporta `preHandler` typed via generics — si aggancia nativamente |
| Confidence | HIGH |

**Cosa**: ogni endpoint cross-repo dichiara un literal type di auth:

```ts
type AuthInternalSecret = { 'X-Internal-Secret': string }
type AuthInternalToken  = { 'X-Internal-Token': string }
type AuthPublic         = Record<string, never>

interface PostCallWebhookEndpoint {
  method: 'POST'
  path: '/webhook/post-call'
  auth: AuthInternalToken    // <-- literal, non opzionale
  body: PostCallWebhookBody
  response: PostCallWebhookResponse
}
```

Il typed client (TS-04) ESIGE che il chiamante fornisca headers compatibili con `endpoint.auth`, a compile time.

**Perche table stakes**: questa e **LA feature** che avrebbe prevenuto Bug #15. Forge `x9.client.ts:14-16` fa oggi:

```ts
return this.internalSecret ? { 'X-Internal-Secret': this.internalSecret } : {};
```

L'ultimo `{}` e legale TS, ma runtime il server risponde 401. Con auth literal type, `{} extends AuthInternalToken` e `false` → errore di compilazione.

**Preventivo Bug #15**: SI — questo e il PRIMARY fix del Bug #15.

---

#### TS-04 — Typed HTTP client wrapper (fetch con endpoint contract)

| Campo | Valore |
|-------|--------|
| Categoria | Table stakes |
| Complessita | MEDIUM |
| Dipendenze | TS-01, TS-03 |
| Stack fit | Si aggancia a `fetch` (Node 20+ native in entrambi i repo). No axios richiesto. |
| Confidence | HIGH |

**Cosa**: helper `callEndpoint<T extends Endpoint>(endpoint: T, args: InferArgs<T>): Promise<InferResponse<T>>` che costruisce URL, headers, body e parsa response rispettando il contract TS-01+TS-03.

**Design constraint**: il body e validato runtime OPZIONALMENTE con Zod (TS-05), ma il client DEVE accettare il contract come unica fonte di verita per headers/body/response shape.

**Implementazione options** (da decidere in STACK.md, non qui):
- **Opzione A — zero-dep custom** (~80 righe TS, full control, copre esattamente 11 endpoint + pochi futuri)
- **Opzione B — ts-rest** (libreria esterna, ~20k weekly, supporta Standard Schema, Zod v4 compat) — ha il pattern `initClient` che Forge puo usare, ma introduce deps

**Preferenza**: Opzione A per v1 (superficie minima, ownership completa). ts-rest valutabile in differentiator DF-01 se la DX vale il costo.

**Preventivo Bug #15**: SI — il client rifiuta di compilare se il chiamante non passa l'auth richiesta dal contract.

---

#### TS-05 — Zod v4 schemas PARALLELI ai tipi TS, solo sui boundary HTTP

| Campo | Valore |
|-------|--------|
| Categoria | Table stakes |
| Complessita | MEDIUM |
| Dipendenze | Zod v4 (verificato 2025: `.brand()` con input/output control, discriminated unions composable) |
| Stack fit | Forge gia usa Zod in `voice.ts:16-27` per validazione runtime. X9 usa Zod (`AgentContextSchema`) per context parsing. |
| Confidence | HIGH |

**Cosa**: per ogni boundary HTTP (input request + output response), **oltre** al tipo TS, il bridge esporta uno Zod schema. Invariante: `z.infer<typeof PostCallBodySchema>` DEVE essere strutturalmente identico a `PostCallBody`.

**Strategia**: Zod schema come source of truth, tipo TS derivato via `z.infer<>`, oppure tipo TS scritto a mano + contract test che verifica `z.infer<>` match. Decisione in STACK.md.

**Dove applicare**: **SOLO sui boundary HTTP** (quello che entra/esce dalla rete). NON dentro strutture dati interne come `AgentContext.credentials` — li basta TS type (AF-05).

**Perche table stakes**:
1. Il middleware `requireInternalToken` di Forge fa gia runtime validation (`voice.ts:143`) — il bridge NON deve duplicarlo, ma deve fornire lo schema condiviso.
2. X9 deve validare i webhook inbound (oggi non lo fa sempre). Lo schema nel bridge lo abilita zero-effort.
3. Contract tests (TS-09) hanno bisogno degli schema per round-trip parse/serialize.

**Preventivo Bug #15**: complementare — Zod valida runtime QUELLO CHE arriva. TS-03 impone compile-time COSA si DEVE mandare.

---

#### TS-06 — Canonical shape risoluzione divergenze esistenti

| Campo | Valore |
|-------|--------|
| Categoria | Table stakes |
| Complessita | MEDIUM |
| Dipendenze | TS-01 |
| Stack fit | Richiede coordinazione con entrambi i repo (uno dei due dovra adattare il proprio shape) |
| Confidence | HIGH |

**Cosa**: risoluzione concreta delle divergenze gia identificate in PROJECT.md:

- `CapabilityRegistryEntry`: X9 usa `endpoint: string` (URL), Forge usa `{ host, port, version }` (`x9.ts:15-21`). Scegliere uno canonical. Proposta: `{ endpoint: string }` + derivare host/port dal parse URL, oppure tenere entrambi con adapter.
- `CapabilityManifest`: X9 ha shape stretto (`capability.ts:29-38`), Forge aggiunge `serviceName?` (`x9.ts:24-34`). Proposta: `serviceName?: string` opzionale in bridge, X9 ignora, Forge popola.
- `ToolCallRequest`/`ToolCallResponse`: X9 ha i tipi (`capability.ts:7-27`), Forge no. Bridge esporta come singolo source.
- `AgentContext.credentials`: oggi `Record<string, string>` in entrambi. Il bridge introduce `AgentCredentials` discriminated con chiavi tipizzate (`OPENAI_API_KEY: string`, `TELEGRAM_BOT_TOKEN: string`, `X9_INTERNAL_SECRET: string`, ...) — PROJECT.md scope v1.

**Perche table stakes**: senza questo, il bridge e "un altro package duplicato" invece di "single source of truth".

**Preventivo Bug #15**: indirettamente — elimina divergenze dove bug analoghi possono nascondersi.

---

#### TS-07 — Env-var naming asymmetry: documentato + tipi helper

| Campo | Valore |
|-------|--------|
| Categoria | Table stakes |
| Complessita | LOW |
| Dipendenze | TS-01 |
| Stack fit | Pulisce il presente senza refactor env vars (scope v1: "document, don't rename") |
| Confidence | HIGH |

**Cosa**: il bridge espone tipi `X9EnvVars` e `ForgeEnvVars` con JSDoc che documenta il mapping asimmetrico:

```ts
/**
 * Cross-repo env-var mapping (canonical source).
 *
 * X9 side               | Forge side
 * INTERNAL_SECRET       | X9_INTERNAL_SECRET
 * FORGE_VOICE_REGISTER_TOKEN | VOICE_REGISTER_TOKEN / INTERNAL_SERVICE_TOKEN
 */
export interface CrossRepoEnvMapping { ... }
```

Piu un helper `resolveHeader(endpoint: Endpoint, env: object): Headers` che conosce il mapping e sbaglia a compile time se manca un env var.

**Perche table stakes**: PROJECT.md lo elenca come required (`- [ ] Naming asimmetrico env vars documentato e risolvibile`). Senza, Stefano deve ricordarselo ogni volta.

**Preventivo Bug #15**: tangente — un consumer che legge la variabile sbagliata sarebbe stato catturato.

---

#### TS-08 — VaultEntry + VaultTier discriminated + semantica "synced vs overridden"

| Campo | Valore |
|-------|--------|
| Categoria | Table stakes |
| Complessita | MEDIUM |
| Dipendenze | TS-01, TS-02 (brand su `ownerId`, `agentId`) |
| Stack fit | Forge ha gia l'implementazione (`packages/db/src/schema.ts:41-55`, `vault.service.ts:73-116`). Bridge la tipizza. |
| Confidence | HIGH |

**Cosa**: tipo principale:

```ts
type VaultTier = 'platform' | 'owner' | 'agent'

// discriminated: le constraint su ownerId/agentId sono TIER-DIPENDENTI
type VaultEntry =
  | { tier: 'platform'; key: string; valueEncrypted: string; isCustomized: false }
  | { tier: 'owner';    key: string; valueEncrypted: string; isCustomized: boolean; ownerId: OwnerId }
  | { tier: 'agent';    key: string; valueEncrypted: string; isCustomized: true;    ownerId: OwnerId; agentId: AgentId }
```

Semantica: `synced = tier !== 'agent'`. Helper type guard `isOverridden(e: VaultEntry): e is AgentTierEntry`.

**Perche table stakes**: oggi un consumer puo costruire `VaultEntry { tier: 'platform', agentId: '...' }` che e semanticamente un non-senso. Discriminated lo esclude.

**Preventivo Bug #15**: no, ma previene classe di bug multi-tenant (tier leak).

---

#### TS-09 — Contract tests (bidirectional, cross-repo)

| Campo | Valore |
|-------|--------|
| Categoria | Table stakes |
| Complessita | MEDIUM |
| Dipendenze | TS-05, X9 running staging instance |
| Stack fit | Vitest/node:test compatibile con monorepo pnpm — nessuna nuova dep pesante |
| Confidence | HIGH |

**Cosa**: per ogni endpoint nel bridge esiste un contract test che:
1. **Consumer side** (Forge): emette la request usando il typed client, verifica che match lo Zod schema del bridge.
2. **Provider side** (X9): riceve una fixture request dal bridge, verifica che parsa con lo schema, risponde, verifica response match lo schema.
3. **Cross-repo smoke** (CI nightly oppure staging manual): curl end-to-end con fixture dal bridge.

**Perche table stakes**: PROJECT.md research mandate #2 e categorico: "Zero regressioni — contract tests obbligatori". Senza questo, la migrazione incrementale non e sicura.

**NON** Pact/consumer-driven full-blown — overkill per 2 consumer. Schema conformance + fixture round-trip e sufficiente. Vedi AF-06.

**Preventivo Bug #15**: SI — un contract test avrebbe catturato che la response e 401 quando manca l'header.

---

#### TS-10 — Semver discipline + CHANGELOG + breaking-change policy

| Campo | Valore |
|-------|--------|
| Categoria | Table stakes |
| Complessita | LOW |
| Dipendenze | nessuna |
| Stack fit | `pnpm changeset` o manual CHANGELOG.md — in monorepo pnpm workspaces |
| Confidence | HIGH |

**Cosa**:
- SEMVER rigoroso: rimozione field / cambio type / rinomina endpoint = **MAJOR**. Aggiunta field optional = minor. Solo doc/internal = patch.
- CHANGELOG.md auto-generato o manuale con sezione "BREAKING" obbligatoria.
- Policy scritta in README: "un MAJOR DEVE essere preceduto da una deprecation window di almeno 1 week nel codice, con `@deprecated` JSDoc su simboli rimossi".

**Perche table stakes**: il bridge vive in monorepo workspaces (`workspace:*` protocol). Il versioning e meno stretto di npm pubblico, ma e comunque necessario per:
1. Un consumer puo essere dietro sul pull (es. X9 deploy non simultaneo) — sapere se e allineato.
2. Permette migrazione incrementale (research mandate #3).

**Preventivo Bug #15**: mitiga classi future di Bug #15 — un MAJOR bump forza review.

---

### DIFFERENTIATORS — utili, migliorano la DX, opzionali per v1

#### DF-01 — Valutazione ts-rest come wrapper opzionale (v1.1 o rimane interno)

| Campo | Valore |
|-------|--------|
| Categoria | Differentiator |
| Complessita | MEDIUM |
| Dipendenze | Decisione architettura STACK.md |
| Stack fit | ts-rest 3.x supporta Standard Schema (Zod v4 compat), Fastify adapter ufficiale |
| Confidence | MEDIUM |

**Cosa**: valutare se usare [ts-rest](https://ts-rest.com/) come helper per la definizione del contract + client. ts-rest fornisce `initContract().router(...)` con ergonomics RPC-like ma semantica REST.

**Pro**: meno codice da scrivere, DX superiore, Fastify integration pronta, ~20k weekly downloads, attivamente mantenuto 2025. Zodios e considerato abbandonato ([astahmer/openapi-zod-client#305](https://github.com/astahmer/openapi-zod-client/issues/305)).

**Contro**: dipendenza esterna, lock-in, 11 endpoint non giustificano un framework.

**Raccomandazione**: **POSTPONE** — implementare v1 con zero-dep typed client (TS-04 Opzione A). Rivalutare ts-rest in v1.1 se la DX del custom client si dimostra insufficiente.

**Preventivo Bug #15**: equivalente a TS-04.

---

#### DF-02 — Model Router contracts come primi-class citizen (Phase 35 prereq)

| Campo | Valore |
|-------|--------|
| Categoria | Differentiator |
| Complessita | MEDIUM |
| Dipendenze | TS-01, TS-03, TS-05 |
| Stack fit | Forge UI consuma `ModelTier` enum per dropdown, X9 per validazione |
| Confidence | HIGH |

**Cosa**: i 5 contratti Model Router (PROJECT.md scope v1) nascono nel bridge invece di essere retrofittati dopo:

```ts
type ModelTier = 'standard' | 'advanced' | 'reasoning'
// ordering helper
function isAtLeast(a: ModelTier, min: ModelTier): boolean

type ModelTierMapping = Readonly<Record<ModelTier, string>>
type ModelPolicy = Readonly<{ min: ModelTier; max: ModelTier }>

interface ModelConfigPushEndpoint { path: '/internal/model-config'; ... }
type ModelConfigReloadNotification = { agentId: AgentId; mtime: number }
```

**Perche differentiator (non table stakes)**: senza Model Router il bridge v1 e gia utile. Ma la ratio costo/beneficio di metterli subito e altissima (PROJECT.md "decided 2026-04-14").

**Preventivo Bug #15**: previene un nuovo Bug #15 su Phase 35 quando Forge lancera UI di push model.

---

#### DF-03 — `@deprecated` JSDoc workflow + tipo marker

| Campo | Valore |
|-------|--------|
| Categoria | Differentiator |
| Complessita | LOW |
| Dipendenze | TS-10 |
| Stack fit | TS strict mode supporta nativamente `@deprecated` con warning IDE |
| Confidence | HIGH |

**Cosa**: quando un field diventa deprecato, pattern:

```ts
export interface CapabilityRegistryEntry {
  endpoint: string
  /** @deprecated since bridge 0.3, use `endpoint`. Will be removed in 0.5. Removal tracked: ISSUE-XX */
  host?: string
}
```

Piu un CI check che un simbolo `@deprecated` non stia in codice di test/exercise (chi deprecato non va exercited).

**Valore**: migrazione incrementale safe (PROJECT.md mandate #4 "compat shim, removed last") ha traccia esplicita.

**Preventivo Bug #15**: no, ma riduce churn durante migrazione.

---

#### DF-04 — JSON Schema export per external consumer (non-TS)

| Campo | Valore |
|-------|--------|
| Categoria | Differentiator |
| Complessita | LOW (derivato automatico da Zod v4 `.toJSONSchema()`) |
| Dipendenze | TS-05 |
| Stack fit | Zod v4 include JSON Schema built-in (Issue/Release zod 4.x) |
| Confidence | MEDIUM |

**Cosa**: dalla Zod schema collection il bridge espone `json-schema/` dir con un file per endpoint. Future-proof per integrazioni non-TS (es. un altro capability svc scritto in Rust/Go).

**Quando**: **NON in v1**. Aggiungere quando un consumer non-TS emerge.

**Preventivo Bug #15**: no.

---

#### DF-05 — Contract diff tool (bridge vN vs vN+1 → what breaks)

| Campo | Valore |
|-------|--------|
| Categoria | Differentiator |
| Complessita | MEDIUM |
| Dipendenze | TS-10 |
| Stack fit | Script Node standalone (TypeScript AST oppure ts-morph) |
| Confidence | LOW (richiede prototipazione) |

**Cosa**: `pnpm run diff-contracts 0.2.0 0.3.0` produce un report markdown di tutto cio che e cambiato in modo breaking (field rimossi, type narrow, endpoint rinominati).

**Valore**: fa risparmiare review manuale; fa emergere immediatamente il perche un MAJOR bump.

**Quando**: v1.2+, non blocking v1.

**Preventivo Bug #15**: no, ma riduce tempo di audit per cambi futuri.

---

#### DF-06 — Fastify schema binding helper

| Campo | Valore |
|-------|--------|
| Categoria | Differentiator |
| Complessita | LOW |
| Dipendenze | TS-05 |
| Stack fit | Fastify 5 ha `@fastify/type-provider-zod` stabile, oppure manual `body: schema.safeParse` |
| Confidence | HIGH |

**Cosa**: helper `bindEndpointFastify(fastify, bridgeEndpoint, handler)` che registra una route Fastify con schema validation auto-applicata dal bridge.

**Valore**: dal lato provider (X9 per webhook-post-call, Forge per voice/register) riduce boilerplate e garantisce che il server valida esattamente lo stesso schema che il client e tipato a emettere.

**Preventivo Bug #15**: SI a lato server — il provider non puo dimenticarsi di validare.

---

### ANTI-FEATURES — cose da NON costruire (con reasoning)

#### AF-01 — tRPC / RPC-first API

| Campo | Valore |
|-------|--------|
| Categoria | Anti-feature |
| Complessita | HIGH (richiederebbe rewrite dei 11 endpoint esistenti) |
| Perche tentante | DX superba, type inference end-to-end, popolare |

**Perche NO**: X9 e Forge gia parlano REST con path espliciti (`/webhook/post-call`, `/internal/turn`, `/api/voice/register`). tRPC richiede un tunnel RPC singolo, rompe compat con ElevenLabs webhook (che POST su URL REST fisso), e cambia il mental model. Scope v1 e **consolidare** contratti esistenti, non reinventarli.

**Invece**: TS-03 + TS-04 (REST typed).

---

#### AF-02 — Branded types su OGNI stringa (over-engineering)

| Campo | Valore |
|-------|--------|
| Categoria | Anti-feature |
| Complessita | MEDIUM (ma costo maintenance alto) |
| Perche tentante | "Safer is better" |

**Perche NO**: brandizzare `displayName`, `description`, `toolName` non aggiunge sicurezza (non si swappa accidentalmente un displayName con un'altra stringa random). Aggiunge solo costruttori boilerplate (`asDisplayName(raw)`) ovunque, e rende copy/paste di fixture nei test un incubo.

**Regola**: brand SOLO gli identificatori che compaiono fianco-a-fianco e sono confondibili (AgentId vs OwnerId, SessionId vs ConversationId).

**Invece**: TS-02 mirato.

---

#### AF-03 — Multi-version support (bridge v1 e v2 conviventi nel consumer)

| Campo | Valore |
|-------|--------|
| Categoria | Anti-feature |
| Complessita | HIGH |
| Perche tentante | "Non vogliamo rompere i consumer durante migration" |

**Perche NO**: PROJECT.md constraint #2 impone zero regressioni, ma la soluzione e "migrazione incrementale contrattor-per-contratto" (mandate #3), NON "aliasing tra v1 e v2". Aliasing crea version skew che e LA causa di Bug #15. Se uno dei due repo e dietro sulla version, il build DEVE fallire per forzare l'update.

**Invece**: `workspace:*` protocol pnpm + policy "update entrambi i repo nello stesso PR o blocca il PR". Compat shim (PROJECT.md mandate #4) vive DENTRO il bridge come re-export, non come aliasing esterno.

---

#### AF-04 — Pubblicazione su npm pubblico

| Campo | Valore |
|-------|--------|
| Categoria | Anti-feature |
| Complessita | LOW (ma privacy/security impact alto) |
| Perche tentante | "Cosi e installabile ovunque" |

**Perche NO**: il bridge contiene dettagli di architettura (nomi endpoint internal, shape di vault encrypted, naming env vars sensibili). PROJECT.md dice "License: Private. Not for distribution." E in monorepo pnpm il `workspace:*` protocol non richiede publish. npm private tier e cost inutile per un progetto 2-consumer.

**Invece**: pnpm workspace o git submodule (decisione STACK.md).

---

#### AF-05 — Runtime validation DENTRO structured data interne (non boundary)

| Campo | Valore |
|-------|--------|
| Categoria | Anti-feature |
| Complessita | MEDIUM |
| Perche tentante | "Zod ovunque = piu safe" |

**Perche NO**: Zod validation ha costo runtime. Validare `AgentContext.credentials` ogni volta che e passato tra funzioni INTERNE (non HTTP) e spreco. Forge ha gia `requireInternalToken` (`voice.ts:143`) che valida runtime al boundary — bridge non deve duplicare.

**Regola**: Zod SOLO su boundary HTTP (input/output network). Dentro: plain TS type.

**Invece**: TS-05 mirato + la regola esplicita nel README.

---

#### AF-06 — Pact consumer-driven contract testing full-stack

| Campo | Valore |
|-------|--------|
| Categoria | Anti-feature |
| Complessita | HIGH |
| Perche tentante | "Industry best practice per contract testing" |

**Perche NO**: Pact e progettato per ecosistemi di N microservizi polyglot con team separati. Qui abbiamo 2 servizi, stesso linguaggio, stessa codebase style, stesso owner (Stefano). Il Pact Broker + publish/verify lifecycle introduce infrastruttura (DB, CI config) che costa piu del valore aggiunto. Zod schema conformance + round-trip fixture tests (TS-09) e sufficiente.

**Invece**: TS-09 minimale.

---

#### AF-07 — Runtime codegen / post-install hooks

| Campo | Valore |
|-------|--------|
| Categoria | Anti-feature |
| Complessita | HIGH |
| Perche tentante | "Generiamo i tipi da OpenAPI al build" |

**Perche NO**: codegen al postinstall rallenta dev loop, introduce step opachi nei CI, e crea state desync tra "cosa e in git" vs "cosa e in node_modules". Il bridge ha ~20 tipi — scrivere codegen per quel volume e piu lavoro che mantenere i tipi a mano.

**Invece**: tipi TS checked-in + Zod schema checked-in. No generazione automatica.

---

#### AF-08 — Class + decorator (class-validator / TypeORM style)

| Campo | Valore |
|-------|--------|
| Categoria | Anti-feature |
| Complessita | MEDIUM |
| Perche tentante | "Eleganza OO" |

**Perche NO**:
1. Decoratori experimental TS richiedono flag, sono instabili tra versioni.
2. Entrambi i repo usano functional style / drizzle non-ORM / fastify plugin style. class-validator sarebbe un outlier.
3. Serialization di class != interface JSON — overhead e rischio di bug nascosti.

**Invece**: TS-01 plain interfaces + TS-05 Zod schema.

---

#### AF-09 — io-ts / Effect Schema / Valibot come alternative a Zod

| Campo | Valore |
|-------|--------|
| Categoria | Anti-feature (per questo progetto) |
| Complessita | HIGH (migrazione) |
| Perche tentante | "Valibot e piu piccolo, io-ts e piu puro" |

**Perche NO**: Forge usa gia Zod (`voice.ts:15`), X9 usa gia Zod (`AgentContextSchema`). Introdurre un secondo validator nel bridge significa che UN consumer deve migrare. Costo senza beneficio — nessuno dei due ha dimensione bundle critica (sono server Node).

**Invece**: Zod v4 standardizzato. Punto.

---

#### AF-10 — Hot-reload live push vault → X9 (gia marked out-of-scope in PROJECT.md)

| Campo | Valore |
|-------|--------|
| Categoria | Anti-feature (v1) |
| Complessita | HIGH |
| Perche tentante | "Sarebbe piu elegante del context.json + /reload" |

**Perche NO in v1**: PROJECT.md lo marca esplicitamente Out of Scope. Il flow attuale funziona. Un cambiamento di protocol richiede un plan separato in Forge + X9, non nel bridge.

**Invece**: bridge v1 tipizza il flow esistente (context.json write + `POST /reload`). Se v2 introduce live push, sara un contract nuovo aggiunto al bridge.

---

## Feature Dependencies

```
TS-01 (plain interfaces, readonly)
  ├─> TS-02 (branded IDs)
  ├─> TS-03 (auth discriminated)  ── requires ──> TS-04 (typed client)
  │     └─> TS-04 (typed client) ── PRIMARY FIX for Bug #15
  ├─> TS-05 (Zod schemas boundary)
  │     ├─> DF-04 (JSON Schema export)
  │     ├─> DF-06 (Fastify binding helper)
  │     └─> TS-09 (contract tests) ── required by ── PROJECT.md mandate #2
  ├─> TS-06 (canonical shape, divergence resolution)
  ├─> TS-07 (env-var mapping types)
  └─> TS-08 (VaultEntry discriminated tier) ── requires ── TS-02

TS-10 (semver + CHANGELOG) ── pairs with ── DF-03 (@deprecated workflow) ── DF-05 (diff tool, v1.2+)

DF-02 (Model Router contracts) ── requires ── TS-01, TS-03, TS-05

AF-03 (multi-version) ── conflicts with ── TS-10 (semver, forces update)
AF-05 (runtime Zod everywhere) ── conflicts with ── TS-05 (only at boundary)
```

**Note chiave**:
- **TS-03 + TS-04 insieme** sono il PRIMARY fix per Bug #15. Una senza l'altra e parziale.
- **TS-09 (contract tests)** e il SECONDARY fix — cattura regressioni al runtime se TS-03 fosse bypassato.
- **TS-02 (brand)** non previene Bug #15 specifico ma previene la sua classe generale (identifier swap).
- **TS-05 (Zod)** a server-side (provider) e ridondante rispetto al middleware `requireInternalToken` gia esistente — il valore e avere **UN** schema condiviso invece di 2 (uno in Forge voice.ts, uno in X9 per quando sara migrato).

---

## MVP Definition

### Launch With (v1 del bridge)

Tutto table stakes:

- [x] TS-01 — Plain TS interfaces con `readonly`
- [x] TS-02 — Branded types per gli identificatori (AgentId, OwnerId, TenantId, SessionId, ConversationId)
- [x] TS-03 — Discriminated union per auth headers (literal per endpoint) — **Bug #15 fix primary**
- [x] TS-04 — Typed HTTP client wrapper (zero-dep Opzione A) — **Bug #15 fix primary**
- [x] TS-05 — Zod v4 schemas al boundary HTTP
- [x] TS-06 — Risoluzione canonical shape divergenze esistenti (incluso `AgentCredentials` discriminated)
- [x] TS-07 — Env-var asymmetry documentata + helper tipizzato
- [x] TS-08 — VaultEntry + VaultTier discriminated (synced/overridden)
- [x] TS-09 — Contract tests consumer + provider (no Pact)
- [x] TS-10 — Semver + CHANGELOG + breaking-change policy

Piu un differentiator obbligatorio per PROJECT.md scope v1:
- [x] DF-02 — Model Router contracts (ModelTier, ModelTierMapping, ModelPolicy, Model Push API, Hot-Reload notification)

### Add After Validation (v1.1+)

- [ ] DF-01 — ts-rest (se DX del custom client insufficiente)
- [ ] DF-03 — `@deprecated` workflow formalizzato (inizialmente basta JSDoc)
- [ ] DF-06 — Fastify schema binding helper (utile quando piu endpoint X9 saranno migrati)

### Future Consideration (v2+)

- [ ] DF-04 — JSON Schema export (quando un consumer non-TS emerge)
- [ ] DF-05 — Contract diff tool (quando il numero di breaking change in release notes diventa ingestibile manuale)

### NON COSTRUIRE MAI

- [x] AF-01 — tRPC
- [x] AF-02 — Brand su ogni stringa
- [x] AF-03 — Multi-version conviventi
- [x] AF-04 — npm pubblico
- [x] AF-05 — Zod runtime nelle strutture interne
- [x] AF-06 — Pact full-stack
- [x] AF-07 — Runtime codegen
- [x] AF-08 — Class + decorator
- [x] AF-09 — io-ts / Valibot / Effect Schema
- [x] AF-10 — Hot-reload live push (vault → X9) in v1 del bridge

---

## Feature Prioritization Matrix

| Feature | User Value (DX impact per Stefano) | Implementation Cost | Priority |
|---------|------------------------------------|---------------------|----------|
| TS-03 (auth discriminated) | HIGH — Primary Bug #15 fix | LOW | P1 |
| TS-04 (typed client) | HIGH — Primary Bug #15 fix | MEDIUM | P1 |
| TS-01 (plain interfaces) | HIGH — foundation | LOW | P1 |
| TS-09 (contract tests) | HIGH — Stefano mandate | MEDIUM | P1 |
| TS-06 (divergence resolution) | HIGH — senza, bridge duplica | MEDIUM | P1 |
| TS-05 (Zod boundary) | HIGH — contract tests dep | MEDIUM | P1 |
| TS-08 (VaultTier) | HIGH — multi-tenant safety | MEDIUM | P1 |
| TS-02 (brand IDs) | MEDIUM — previene classi bug | LOW | P1 |
| TS-07 (env-var types) | MEDIUM — nice doc | LOW | P1 |
| TS-10 (semver) | MEDIUM — migration discipline | LOW | P1 |
| DF-02 (Model Router) | HIGH — Phase 35 unlock | MEDIUM | P1 (scope v1 per decision PROJECT.md) |
| DF-06 (Fastify helper) | MEDIUM — DX provider side | LOW | P2 |
| DF-03 (`@deprecated` workflow) | MEDIUM — migration tracking | LOW | P2 |
| DF-01 (ts-rest) | LOW (v1) — dipende da esperienza custom | MEDIUM | P3 |
| DF-04 (JSON Schema export) | LOW — nessun consumer attuale | LOW | P3 |
| DF-05 (diff tool) | LOW — fintanto che 2 consumer | MEDIUM | P3 |

**Priority key**:
- **P1**: Must have per v1 del bridge — senza, Bug #15 puo ripetersi o research mandate violato
- **P2**: Should have, v1.1 quando la superficie cresce
- **P3**: Nice to have, future

---

## Mapping Bug #15 → Features preventive (quality gate requirement)

| Feature | Contributo alla prevenzione di Bug #15 |
|---------|----------------------------------------|
| TS-03 (auth literal type) | **PRIMARY** — il type `AuthInternalToken` non e compatibile con `{}`; Forge `x9.client.ts` avrebbe fallito TS compilation |
| TS-04 (typed client) | **PRIMARY** — `callEndpoint(postCallWebhook, { body, auth: {...} })` esige l'auth nel signature |
| TS-09 (contract tests) | **SECONDARY** — un test consumer con fixture avrebbe catturato 401 |
| DF-06 (Fastify binding helper) | **SECONDARY** — a lato provider, il server garantisce che valida lo stesso schema che il client e costretto a mandare |
| TS-05 (Zod schema) | Tangente — serve per i contract tests ma non previene direttamente |
| TS-10 (semver) | Tangente — un MAJOR bump avrebbe forzato review esplicito della nuova policy auth |

**La combinazione TS-03 + TS-04 e LA feature catch-all che previene Bug #15 e la sua classe.**

---

## Stack Compatibility Check (2025 verified)

| Feature | Zod v4 | Fastify 5 | Drizzle 0.38.x | Note |
|---------|--------|-----------|----------------|------|
| TS-01 (interfaces) | N/A | nativo | nativo | Zero impatto |
| TS-02 (brand) | Zod v4 `.brand()` ora supporta in/out control | N/A | Drizzle supporta `$type<Branded>()` in column types | Compat totale |
| TS-03 (auth discr.) | `z.discriminatedUnion` compose in v4 | `preHandler` typed con generics | N/A | Compat totale |
| TS-04 (typed client) | N/A | N/A | N/A | fetch nativo Node 20+ |
| TS-05 (Zod boundary) | Zod v4 stable | `@fastify/type-provider-zod` maintained | Standard Schema support | Compat totale |
| TS-08 (VaultTier) | `z.discriminatedUnion` | N/A | Enum column type | Compat totale |
| TS-09 (contract tests) | Zod `.safeParse` runtime | N/A | N/A | Vitest/node:test OK |
| DF-02 (Model Router) | N/A | N/A | N/A | Puri tipi |
| DF-06 (Fastify helper) | N/A | `setValidatorCompiler` + `zodToJsonSchema` | N/A | Compat totale |

**Nessun conflitto stack**. Zod v4 upgrade richiede migration (branded types syntax cambiata) — ma Forge e X9 possono upgradare insieme nel PR di introduction del bridge.

---

## Competitor / Prior Art Analysis

| Approccio | Esempio | Quando adatto | Perche NON per noi |
|-----------|---------|---------------|--------------------|
| tRPC | Next.js full-stack apps | 1 repo, 1 team, RPC ok | Abbiamo REST ESISTENTE + ElevenLabs webhook REST fisso |
| ts-rest | Multi-repo REST typed | 10+ endpoint, DX matters | Possibile v1.1, overkill per 11 endpoint |
| zodios | Legacy REST + axios | axios already in stack | Maintainer inattivo ([#305](https://github.com/astahmer/openapi-zod-client/issues/305)) |
| @hono/zod-openapi | Hono-based servers | OpenAPI automatic | Forge usa Fastify, X9 usa Fastify |
| OpenAPI-first + openapi-typescript | Polyglot teams | 5+ lingue consumatrici | Entrambi TS — overhead YAML senza beneficio |
| Pact | Microservizi N×N | 10+ servizi, team separati | 2 consumer, stesso owner, codebase sorella |
| Plain interfaces + Zod boundary (proposto) | — | 2-3 consumer, stesso linguaggio, same-repo ecosystem | **Perfetto fit per questo progetto** |

---

## Gaps / Decisioni aperte per STACK.md

Questo FEATURES.md enumera **cosa fare**. STACK.md deve decidere:

1. **TS-04 implementazione**: Opzione A (zero-dep, ~80 righe custom) vs Opzione B (ts-rest come wrapper interno). Raccomandazione: A per v1.
2. **TS-05 source of truth**: Zod schema primary con `z.infer` vs TS type primary con contract test che verifica `z.infer` match. Raccomandazione: Zod primary (boundary = runtime, piu sicuro).
3. **Architettura package**: pnpm workspace cross-repo (richiede monorepo unificato, grosso refactor) vs git submodule (piu semplice, 2 repo autonomi) vs npm private scoped (cost). PROJECT.md elenca questa decisione come pending research.
4. **Contract test runner**: Vitest (piu feature) vs node:test (zero-dep). Raccomandazione: coerente con i repo esistenti.
5. **DF-02 Model Router endpoint path**: `/internal/model-config` vs altro. Da allineare con ROUTER-05 plan di X9 Phase 35.

---

## Sources

### Verified 2025
- [ts-rest official docs](https://ts-rest.com/) — supporto Standard Schema confermato
- [ts-rest future of the project](https://github.com/ts-rest/ts-rest/issues/797) — actively maintained
- [Zodios dead? discussion](https://github.com/astahmer/openapi-zod-client/issues/305) — Zodios maintainer inactive, migration path is ts-rest
- [Zod v4 release notes](https://zod.dev/v4) — branded types in/out, discriminated unions composable, JSON Schema export built-in
- [@hono/zod-openapi npm](https://www.npmjs.com/package/@hono/zod-openapi) — Hono-specific, no fit
- [Fastify 5 type-provider-zod] — verified existing, used by Forge
- [pnpm workspaces](https://pnpm.io/workspaces) — `workspace:*` protocol, gia in Forge (confermato da CLAUDE.md)

### Codebase ground truth (cited in this document)
- `/Users/admintemp/Downloads/Claude/forge-v2/packages/types/src/x9.ts:3-48` — Forge current types
- `/Users/admintemp/Downloads/Claude/agent-x9/packages/types/src/capability.ts:1-38` — X9 current capability types
- `/Users/admintemp/Downloads/Claude/agent-x9/packages/types/src/agent-context.ts:1-14` — X9 AgentContext (flat credentials Record)
- `/Users/admintemp/Downloads/Claude/forge-v2/services/factory/src/services/x9.client.ts:14-41` — Forge→X9 HTTP client (sito del Bug #15)
- `/Users/admintemp/Downloads/Claude/forge-v2/services/voice/src/routes/voice.ts:59-169` — voice-svc routing + requireInternalToken middleware already existing
- `/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge/.planning/PROJECT.md` — scope v1, research mandate, key decisions
- `/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge/README.md` — bridge architecture diagram + related phases

---

*Feature research for: x9-forge-contract-bridge — TypeScript cross-repo contract package*
*Researched: 2026-04-14*
*Output feeds: REQUIREMENTS.md (which features become requirements per priority)*
