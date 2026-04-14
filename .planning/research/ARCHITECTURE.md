# Architecture Research

**Domain:** TypeScript cross-repo contract package (compile-time, zero runtime)
**Researched:** 2026-04-14
**Confidence:** HIGH (verificato sul codice reale: `agent-x9/packages/types/src/*`, `forge-v2/packages/types/src/x9.ts`, `forge-v2/packages/db/src/schema.ts`, `agent-x9/services/agent-core/src/core/agent-manager.ts`)

---

## TL;DR architetturale

Il bridge e un **package di soli tipi TypeScript** (nessun runtime, nessun server) con responsabilita singola: essere l'unica fonte di verita per i contratti che attraversano la frontiera `agent-x9 <-> forge-v2`.

La strategia di migrazione e **strangler fig su tipi**: il bridge nasce vuoto, ogni contratto viene migrato uno alla volta con pattern re-export shim che rende la migrazione invisibile ai consumer locali. X9 production non si ferma mai perche ogni step e un commit atomico rollback-able su un singolo repo.

Grafo dipendenze non negoziabile:

```
                +---------------------------------------+
                |   @x9-forge/bridge  (types-only)      |
                |   - zero deps su X9                   |
                |   - zero deps su Forge                |
                |   - zero deps runtime                 |
                +-------^-----------------------^-------+
                        |                       |
                  importa da                importa da
                        |                       |
          +-------------+-------+    +----------+-------------+
          |  agent-x9           |    |  forge-v2              |
          |  packages/types/ +  |    |  packages/types/src/   |
          |  services/*         |    |  services/* + web/     |
          +---------------------+    +------------------------+
                        \                     /
                         \                   /
                          \   MAI diretta   /
                           +---- NO -------+
```

Regola anti-ciclo: **X9 non importa Forge, Forge non importa X9, il bridge non importa ne X9 ne Forge**. Ogni freccia che violi questo grafo = plan-check FAIL.

---

## 1. Boundary decomposition — cosa vive dove

### Regola base (non negoziabile)

> **Un tipo vive nel bridge se e solo se e toccato da entrambi i repo.** Un tipo interno a un repo resta locale a quel repo.

Criterio operativo per decidere:

| Il tipo compare... | Vive... | Rationale |
|--------------------|---------|-----------|
| In un payload HTTP cross-repo (request o response) | **Bridge** | Contratto cross-repo |
| In un header auth scambiato tra i due repo | **Bridge** | Contratto cross-repo |
| In un manifest servito da un capability service X9 e consumato da Forge | **Bridge** | Contratto cross-repo |
| In una tabella DB di Forge ma serializzato e inviato a X9 | **Bridge** (shape on-wire) + **Forge-local** (row shape con campi DB-only tipo `id`, `createdAt`) | Shape wire-only e cross-repo; shape DB resta local |
| Solo nel runtime di X9 (es. turn counter in-memory, session state) | **X9-local** | Non attraversa mai il bridge |
| Solo nell'UI di Forge (es. form state, dropdown option view) | **Forge-local** | Non attraversa mai il bridge |
| Schema Zod per validation | **Bridge** (per contratti condivisi) | Coerente col tipo TS, entrambi validano |

### Inventario completo — dove ogni tipo finisce

**Bridge (cross-repo, scope v1):**

| Tipo | Origine oggi | Destinazione bridge |
|------|--------------|---------------------|
| `ToolCallRequest`, `ToolCallResponse` | `agent-x9/packages/types/src/capability.ts:7-27` (solo X9) | `src/capability/tool-call.ts` |
| `CapabilityTool` | X9 `capability.ts:1-5` | `src/capability/tool.ts` |
| `CapabilityManifest` | X9 `capability.ts:29-38` + Forge `x9.ts:24-34` (divergente su `serviceName?`) | `src/capability/manifest.ts` (shape canonica unificata) |
| `CapabilityRegistryEntry` | X9 (forma `endpoint: URL`) + Forge (forma `host+port+version` in `x9.ts:15-21`) | `src/capability/registry.ts` (decidere forma canonica nella phase di migrazione — vedi sezione 4) |
| `EnvSchemaField`, `EnvSchemaDoc` | X9 `env-schema.ts:1-12` + Forge `x9.ts:37-48` | `src/capability/env-schema.ts` |
| `HealthStatus` | X9 `health.ts:1-8` (solo X9, ma Forge lo legge via `/:cap/health`) | `src/http/health.ts` |
| `AgentContextCore` | X9 `agent-context.ts:1-14` (split, vedi sotto) + Forge `x9.ts:3-13` | `src/agent/context-core.ts` |
| `AgentIdentity` (`agentId`, `ownerId`) | Estratto da `AgentContext` | `src/agent/identity.ts` |
| `AgentCredentials` (discriminated) | Oggi `Record<string, string>` in X9 | `src/agent/credentials.ts` — nuovo |
| `VaultEntry` | Forge `schema.ts:41-55` (shape DB) + X9 consumer (shape on-wire) | `src/vault/entry.ts` (shape wire, esclude `id`/`createdAt`) |
| `VaultTier` enum | Forge DB `tier` col | `src/vault/tier.ts` |
| `VaultSyncEvent` | Forge `POST /api/vault/sync-all` payload | `src/vault/sync.ts` |
| `WorkspaceFile` | Forge `schema.ts:57-70` | `src/workspace/file.ts` |
| Tutti gli 11 endpoint HTTP (path+method+req+res+auth) | Sparsi in X9 `services/agent-core/src/index.ts` e Forge `services/*/src/routes/*` | `src/http/*.ts` (uno per endpoint) |
| `ModelTier`, `ModelTierMapping`, `ModelPolicy`, `ModelPushRequest/Response`, `ModelReloadEvent` | Non esistono ancora | `src/model-router/*.ts` — nascono qui |
| Auth headers tipizzati (`X-Internal-Secret`, `X-Internal-Token`) | Stringhe non tipizzate oggi | `src/auth/headers.ts` — discriminated |

**X9-local (NON entra nel bridge):**

| Tipo | File | Perche non nel bridge |
|------|------|----------------------|
| `AgentContextRuntime` (parte X9-only di AgentContext) | `agent-x9/packages/types/src/agent-context.ts` (dopo split) | Campi `telegramBotToken`, `displayName`, `registryPath` sono runtime-only: Forge li genera ma non li legge mai indietro |
| `LLMMessage`, `NormalizedToolCall`, `LLMResponse`, `LLMStreamChunk`, `ToolDefinition`, `LLMAdapter` | X9 `llm.ts` | Usati solo dentro X9 (adapter pattern per OpenAI/Anthropic). Forge non tocca LLM al runtime |
| `MemoryEntry`, `CaptureMemoryInput`, `RecallMemoryInput`, `RecallMemoryResult` | X9 `memory.ts` | Qdrant collection shape, interno al cap-memory. Se un giorno Forge avra UI memoria -> valutare promozione |
| `AgentContextSchema` (Zod) per runtime-only fields | X9 `agent-context.schema.ts` | Valida ingresso file `context.json`, non e cross-repo |
| In-flight turn counter, session maps, Telegram chatId maps | `agent-core/src/core/*` | State runtime puro |

**Forge-local (NON entra nel bridge):**

| Tipo | File | Perche non nel bridge |
|------|------|----------------------|
| DB row types (`owners`, `agents`, `nodes`, `auditLogs`, `voiceSessions`) | `forge-v2/packages/db/src/schema.ts:13-103` | Hanno `id: serial`, `createdAt: timestamp`, etc. — shape DB, non shape wire. Il bridge tipizza la proiezione wire, non la riga Postgres |
| Drizzle query result types | Inferiti da Drizzle | Accoppiano bridge a Drizzle — NO |
| UI state (form, dropdown, modal, toast) | `forge-v2/web/src/**` | View state React, zero cross-repo |
| SSH client types (`ssh2` wrappers) | `forge-v2/services/factory/**` | Infra interna Forge |
| Clerk session / user types | `@clerk/backend` | Third-party, wrapper Forge-local |

### Split `AgentContext` -> `AgentContextCore` + `AgentContextRuntime`

**Forma attuale** (`agent-x9/packages/types/src/agent-context.ts:1-14`, duplicata in `forge-v2/packages/types/src/x9.ts:3-13`):

```typescript
interface AgentContext {
  agentId: string
  ownerId: string
  workspacePath: string         // X9-only (path FS container)
  registryPath: string          // X9-only (path FS container)
  credentials: Record<string, string>
  llmConfig: { provider: string; model: string }
  telegramBotToken: string      // X9-only (passato a Telegram bot runtime)
  telegramAllowFrom: string[]
  displayName: string           // X9-only (label log)
}
```

**Pro split:**
- Forge genera `AgentContextCore` (agentId, ownerId, credentials, llmConfig, telegramAllowFrom) e lo serializza -> X9 riceve Core e lo estende con campi runtime-only (workspacePath, registryPath, telegramBotToken, displayName)
- Il bridge tipizza solo cio che Forge e X9 concordano di scambiare
- Aggiungere un campo runtime X9 (es. `localCacheDir`) non richiede bump del bridge
- Forge non deve conoscere dettagli FS del container X9 (cio che X9 fa col filesystem sono fatti X9)

**Contro split:**
- Due tipi invece di uno, nome da imparare
- Serializzazione asimmetrica: Forge scrive `context.json` con i campi X9-only inclusi (li popola come default perche il file on-disk li richiede), ma il contratto wire-level e solo Core
- Potenziale confusione: "ma `context.json` sul filesystem ha `telegramBotToken`, non era runtime-only?" Risposta: il file on-disk X9 e runtime X9, non contratto wire. Forge lo scrive ma potrebbe anche delegarlo a X9 (ri-costruzione da vault) — vedi FASE roadmap futura

**Raccomandazione: SI, split.**

Decomposizione proposta:

```typescript
// nel bridge
export interface AgentIdentity {
  readonly agentId: string
  readonly ownerId: string
}

export interface AgentContextCore extends AgentIdentity {
  readonly credentials: AgentCredentials       // discriminated, vedi sez 1.credentials
  readonly llmConfig: LLMConfig                 // { provider, model, tierMapping?, policy? }
  readonly telegramAllowFrom: ReadonlyArray<string>
}

// in X9, estende
export interface AgentContextRuntime extends AgentContextCore {
  readonly workspacePath: string         // FS container
  readonly registryPath: string          // FS container
  readonly telegramBotToken: string      // injected da vault al boot
  readonly displayName: string
}
```

### Split `AgentCredentials` — da flat Record a discriminated

**Forma attuale:**
```typescript
credentials: Record<string, string>
```

Zero type safety su chiavi specifiche (`OPENAI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `X9_INTERNAL_SECRET`, `FORGE_VOICE_REGISTER_TOKEN`, ...).

**Forma target:**

```typescript
// Credenziali note (type-safe, auto-complete)
export interface KnownCredentials {
  readonly OPENAI_API_KEY?: string
  readonly ANTHROPIC_API_KEY?: string
  readonly GOOGLE_API_KEY?: string
  readonly TELEGRAM_BOT_TOKEN?: string
  readonly X9_INTERNAL_SECRET?: string
  readonly FORGE_VOICE_REGISTER_TOKEN?: string
  readonly VAULT_KEY?: string
  // ... etc
}

// Credenziali capability-specific (estendibili senza toccare il bridge)
export type AgentCredentials = KnownCredentials & Readonly<Record<string, string>>
```

Rationale: le chiavi note danno auto-complete e refactor safety; il cast a `Record<string, string>` rimane backup per chiavi capability-specific dinamiche (es. `NETATMO_CLIENT_SECRET`, `REOLINK_PASSWORD`). Zero breaking change sul consumer esistente di `context.credentials['OPENAI_API_KEY']`.

---

## 2. Dependency direction (data flow)

### Grafo TS compile-time

```
                  package.json: @x9-forge/bridge
                  dependencies: { }   <- zero runtime deps
                  peerDependencies: { }
                  devDependencies: { typescript, tsup, vitest, zod? }
                          ^
                          |
             +------------+-------------+
             |                          |
   import { ... }                 import { ... }
   from '@x9-forge/bridge'        from '@x9-forge/bridge'
             |                          |
      +------+-------+            +-----+------+
      |   agent-x9   |            |  forge-v2  |
      |              |    ---X--- |            |
      +------+-------+            +-----+------+
             |                          |
         importa dal                importa dal
         bridge tramite             bridge tramite
         pnpm workspace,            pnpm workspace,
         submodule, o npm.          submodule, o npm.
         (decisione: STACK.md)      (decisione: STACK.md)
```

### Regole dipendenza (queste NON sono linee guida, sono lint rules)

1. `@x9-forge/bridge/package.json` `dependencies` e vuoto. Solo `zod` (se decidiamo di includere schemi) e ammesso, e zod e peer in entrambi i consumer quindi niente duplicazione.
2. Il bridge **non importa** da path che inizi per `agent-x9/*` o `forge-v2/*` o `@x9/*` o `@forge/*`. Enforcement via ESLint `no-restricted-imports`.
3. X9 `packages/types/` diventa thin re-export layer dal bridge durante migrazione (compat shim). Nessun altro file X9 importa direttamente da Forge.
4. Forge `packages/types/src/x9.ts` diventa thin re-export dal bridge durante migrazione. Nessun altro file Forge importa da X9.
5. Zero cicli possibili perche il bridge e un **leaf node** del grafo.

### Enforcement automatico (parte di phase 1 del bridge)

Nel bridge `eslint.config.js`:

```js
{
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        { group: ['agent-x9/**', 'forge-v2/**', '@x9/*', '@forge/*'],
          message: 'Bridge is a leaf package. It MUST NOT depend on consumer repos.' }
      ]
    }]
  }
}
```

In X9 e Forge:

```js
{
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        // X9 non importa da Forge
        { group: ['@forge/*', 'forge-v2/*'],
          message: 'X9 never imports from Forge. Shared contracts live in @x9-forge/bridge.' }
        // Forge non importa da X9
        { group: ['@x9/*', 'agent-x9/*'],
          message: 'Forge never imports from X9. Shared contracts live in @x9-forge/bridge.' }
      ]
    }]
  }
}
```

---

## 3. Compat shim pattern

### Principio

Ogni contratto migrato viene **ri-esportato** dai vecchi path dei consumer finche non e sicuro fare il rename degli import. Il re-export e un type alias, zero costo runtime, zero bundle impact.

### Pattern step-by-step per UN contratto (esempio: `CapabilityManifest`)

**Stato T0 (pre-migrazione):**

`agent-x9/packages/types/src/capability.ts`:
```typescript
export type CapabilityManifest = {
  readonly name: string
  readonly version: string
  readonly endpoint: string
  readonly tools: ReadonlyArray<CapabilityTool>
}
```

`forge-v2/packages/types/src/x9.ts`:
```typescript
export interface X9CapabilityManifest {
  name: string
  version: string
  endpoint: string
  serviceName?: string  // divergenza!
  tools: ReadonlyArray<{ name: string; description: string; inputSchema: Record<string, unknown> }>
}
```

Consumer in X9: `import { CapabilityManifest } from '@x9/types'`
Consumer in Forge: `import { X9CapabilityManifest } from '@forge/types'`

Bug: `serviceName?` esiste solo in Forge, quindi divergenza silenziosa.

**Step 1: aggiungi tipo canonico nel bridge** (commit nel repo bridge)

`bridge/src/capability/manifest.ts`:
```typescript
export interface CapabilityTool {
  readonly name: string
  readonly description: string
  readonly inputSchema: Record<string, unknown>
}

export interface CapabilityManifest {
  readonly name: string
  readonly version: string
  readonly endpoint: string
  readonly serviceName?: string   // promosso al bridge — decisione canonica
  readonly tools: ReadonlyArray<CapabilityTool>
}
```

Pubblica bridge v0.X.0. Bridge repo: verde. Nessun consumer toccato ancora.

**Step 2: X9 packages/types diventa shim** (commit nel repo X9)

`agent-x9/packages/types/src/capability.ts`:
```typescript
// SHIM: re-export dal bridge durante migrazione.
// Dopo v1.0 del bridge i consumer interni importeranno direttamente da '@x9-forge/bridge'.
// Vedi ROADMAP phase N+4 per shim removal.
export type {
  CapabilityManifest,
  CapabilityTool,
  ToolCallRequest,
  ToolCallResponse,
} from '@x9-forge/bridge'
```

Package.json X9 aggiunge `@x9-forge/bridge` come dipendenza (workspace, submodule, o npm — agnostico al meccanismo di distribuzione, vedi STACK.md).

**Risultato:** tutti i consumer X9 che facevano `import { CapabilityManifest } from '@x9/types'` continuano a funzionare. Zero file toccato oltre a `capability.ts`. Tempo di migrazione consumer: 0 secondi. Rebuild X9: verde.

**Step 3: Forge packages/types diventa shim** (commit nel repo Forge)

`forge-v2/packages/types/src/x9.ts`:
```typescript
// SHIM: il tipo canonico vive in @x9-forge/bridge.
// Mantengo l'alias con il prefisso X9* per zero breaking change sui consumer Forge.
import type {
  CapabilityManifest,
  AgentContextCore,
  EnvSchemaDoc,
  EnvSchemaField,
  CapabilityRegistryEntry,
} from '@x9-forge/bridge'

export type X9CapabilityManifest = CapabilityManifest
export type X9AgentContext = AgentContextCore   // split: X9-runtime fields NON qui
export type X9EnvSchemaDoc = EnvSchemaDoc
export type X9EnvSchemaField = EnvSchemaField
export type X9CapabilityRegistryEntry = CapabilityRegistryEntry
```

**Risultato:** tutti i consumer Forge che facevano `import { X9CapabilityManifest } from '@forge/types'` continuano a funzionare. Forge build: verde.

**Step 4: integration smoke test**

Contract test cross-repo: deploy staging, curl `GET /:cap/manifest`, verifica shape matcha lo schema canonico del bridge. Se verde -> promuovi. Se rosso -> rollback dei 3 commit.

**Step 5 (molto dopo, shim removal — phase 5 roadmap):**

Ricerca+replace globale in X9: `from '@x9/types'` -> `from '@x9-forge/bridge'` per i simboli migrati.
Ricerca+replace in Forge: `X9CapabilityManifest` -> `CapabilityManifest`, `from '@forge/types'` -> `from '@x9-forge/bridge'`.
Rimuovi alias dal shim. Shim file resta vuoto o si elimina.

### Trade-off del pattern shim

| Pro | Contro / mitigazione |
|-----|---------------------|
| Migrazione 1 contratto = 2-3 commit atomici (bridge + X9 shim + Forge shim) | Durante la migrazione parziale, un dev potrebbe importare un tipo "vecchio" senza sapere che ora vive nel bridge. **Mitigazione:** JSDoc `@deprecated` sul re-export piu comment "importa direttamente da @x9-forge/bridge per nuovo codice" |
| Zero breaking change per consumer interni ai repo | Bundle size: duplicazione type-only -> **zero runtime cost** perche i tipi vengono cancellati dal compiler TS |
| Rollback atomico per commit | Version skew: se X9 usa bridge v0.3 e Forge usa bridge v0.4 con breaking change, i due shim divergono silenziosamente. **Mitigazione:** lock bridge version in entrambi i repo al solito SHA/tag; CI check `bridge-version-parity.yml` fallisce se i due repo puntano a versioni diverse |
| Pattern riconosciuto (strangler fig) | Due "nomi" per un tipo (`CapabilityManifest` vs `X9CapabilityManifest`) durante la migrazione. **Mitigazione:** shim file lungo ma isolato; tempo di vita limitato (phase 5 rimuove) |

### Version skew protection (critico)

Senza version parity check, il bug #15 si ripete in forma diversa. Setup:

1. Entrambi i repo dichiarano `@x9-forge/bridge` con il **medesimo specifier** (git SHA se submodule, tag esatto se npm, `workspace:*` se monorepo).
2. CI di ciascun repo include uno step `verify-bridge-parity`:
   ```bash
   # pseudo-CI
   X9_BRIDGE_REF=$(cd x9 && node -p "require('./package.json').dependencies['@x9-forge/bridge']")
   FORGE_BRIDGE_REF=$(cd forge && node -p "require('./package.json').dependencies['@x9-forge/bridge']")
   if [ "$X9_BRIDGE_REF" != "$FORGE_BRIDGE_REF" ]; then
     echo "Bridge version mismatch: X9=$X9_BRIDGE_REF, Forge=$FORGE_BRIDGE_REF"
     exit 1
   fi
   ```
3. Almeno una volta per migrazione: smoke test sul deploy staging che chiama endpoint cross-repo e verifica shape.

---

## 4. Migration order (ordine contratti)

### Criteri di priorita

1. **Rischio basso, valore di validazione alto**: contratti gia simmetrici e ben compresi vanno prima, perche validano il pattern shim senza introdurre divergenze semantiche
2. **Bloccante per phase downstream**: contratti senza cui la Phase 35 X9 non puo partire vanno prima
3. **Alto impatto su bug scoperti**: contratti coinvolti in Bug #15 (post-call webhook) vanno presto, perche proteggono da ripetizioni
4. **Dipendenze tra contratti**: `CapabilityManifest` dipende da `CapabilityTool`; `AgentContextCore` dipende da `AgentCredentials`; migrare le foglie del grafo tipi prima

### Ordine proposto (blocchi A-F)

**Blocco A — Validation first (contratti simmetrici gia tipizzati in X9, Forge li usa manualmente):**

1. `CapabilityTool` (foglia, 3 campi, identico su entrambi i repo)
2. `CapabilityManifest` (usa `CapabilityTool`, divergenza risolta promuovendo `serviceName?` al bridge)
3. `ToolCallRequest`, `ToolCallResponse` (solo X9 li tipizza oggi — Forge li consuma `any`; il bridge porta safety a Forge)
4. `EnvSchemaField`, `EnvSchemaDoc` (identici su entrambi i repo)
5. `HealthStatus` (standard, gia in X9)

Rationale: **dopo il blocco A, il pattern shim e validato end-to-end**. Se qualcosa si rompe, si e rotto sui tipi piu semplici e si scoprono problemi di setup del bridge (non di divergenza semantica). Ogni contratto e 2-3 commit. Totale blocco A: ~10-15 commit atomici.

**Blocco B — AgentContext split (alto valore, media complessita):**

6. `AgentIdentity` (`{ agentId, ownerId }`) — foglia del nuovo grafo
7. `AgentCredentials` discriminated (migra il `Record<string, string>` con known keys)
8. `LLMConfig` (base: `{ provider, model }`)
9. `AgentContextCore` (compone 6+7+8 + `telegramAllowFrom`)
10. X9 introduce `AgentContextRuntime extends AgentContextCore`, sposta `workspacePath`/`registryPath`/`telegramBotToken`/`displayName` qui
11. Forge `X9AgentContext` diventa alias a `AgentContextCore` nel shim

Rationale: lo split e l'unica modifica "architetturale" vera. Facciamo solo **dopo** aver validato il pattern su contratti semplici. Se lo split rompesse qualcosa, si rompe su un pattern gia rodato, non sul primo giorno.

**Blocco C — Auth headers discriminated (protezione Bug #15):**

12. `InternalSecretHeader` (X-Internal-Secret)
13. `InternalTokenHeader` (X-Internal-Token) — usato su `/webhook/post-call` e `/api/voice/register`
14. Tipo union `InternalAuthHeader` discriminato
15. Helper type `EndpointAuth<E>` per associare header a endpoint

Rationale: questo e **il contratto che Bug #15 avrebbe protetto**. Non appena esiste, aggiornare `services/factory/src/services/x9.client.ts` in Forge per usare l'header tipizzato -> errore di compilazione se il client chiama un endpoint X-Internal-Token senza impostare l'header. Prima difesa concreta contro la ripetizione del bug.

**Blocco D — HTTP endpoint contracts (grosso ma meccanico):**

16. `/internal/agents` GET (lista)
17. `/internal/agents/:id/reload` POST
18. `/internal/agents/:id/stop` POST
19. `/internal/turn` POST
20. `/internal/turn/stream` POST SSE (scope: shape chunk SSE tipizzata)
21. `/internal/query` POST
22. `/webhook/post-call` POST (protegge Bug #15 definitivamente)
23. `/:cap/manifest` GET
24. `/:cap/env-schema` GET
25. `/:cap/health` GET
26. `/api/voice/register` POST (X9 -> Forge)

Ogni endpoint = 1 commit nel bridge + 1 commit X9 (o Forge) + 1 commit controparte. Totale blocco D: ~30 commit atomici.

Ogni endpoint ha template:
```typescript
// src/http/<endpoint>.ts
export const INTERNAL_TURN_PATH = '/internal/turn'
export const INTERNAL_TURN_METHOD = 'POST' as const
export const INTERNAL_TURN_AUTH = 'X-Internal-Secret' as const
export interface InternalTurnRequest { /* ... */ }
export interface InternalTurnResponse { /* ... */ }
```

Rationale: blocco D e **ripetitivo ma mind-less**. Lo facciamo dopo blocco A/B/C perche i tipi foglia che compongono request/response devono esistere prima. Possiamo parallelizzare: un executor agent al giorno per 4-5 endpoint.

**Blocco E — Vault contracts (dipende da `AgentIdentity` da blocco B):**

27. `VaultTier` enum
28. `VaultEntry` (shape wire, esclude `id`/`createdAt` che sono DB-only)
29. `VaultSyncEvent` (payload di `POST /api/vault/sync-all`)
30. `WorkspaceFile` (shape wire)
31. Endpoint vault `POST /api/vault/sync-all` (request/response)
32. Endpoint vault `GET /api/vault/resolve/:agentId` (cascade resolved view)

Rationale: il vault e **asimmetrico di conoscenza oggi** (Forge lo scrive, X9 lo legge via `context.json`). Tipizzarlo per primo non serve; tipizzarlo dopo blocco B quando `AgentIdentity` esiste si.

**Blocco F — Model Router contracts (Phase 35 prerequisite):**

33. `ModelTier` enum ordered (`standard < advanced < reasoning`)
34. `ModelTierMapping`
35. `ModelPolicy` (`{ min, max }`)
36. Estende `CapabilityRegistryEntry` con `modelPolicy?`
37. `ModelPushRequest/Response` (`POST /internal/model-config`)
38. `ModelReloadEvent` (hot-reload notification)

Rationale: questi sono **greenfield** — nessun codice esistente. Li facciamo **per ultimi** cosi il pattern e sedimentato e non rischiamo di inventare convenzioni bridge su tipi nuovi. Phase 35 X9 parte solo dopo blocco F merged.

### Ordine completo con razionale per ogni posizionamento

| # | Contratto | Blocco | Perche qui |
|---|-----------|--------|------------|
| 1 | `CapabilityTool` | A | Foglia, zero deps, identico su entrambi |
| 2 | `CapabilityManifest` | A | Usa #1; prima "vera" migrazione con divergenza risolta |
| 3 | `ToolCallRequest/Response` | A | Semplice; prima ondata su Forge (che oggi ha `any`) |
| 4 | `EnvSchemaField/Doc` | A | Simmetrico, validation del pattern |
| 5 | `HealthStatus` | A | Chiude il blocco "facile" |
| 6-11 | `AgentIdentity` -> `AgentContextCore` + split `Runtime` | B | Richiede pattern maturo; modifica architetturale |
| 12-15 | Auth headers discriminated | C | Chiude Bug #15, possibile solo con tipi base dal blocco A |
| 16-26 | 11 endpoint HTTP | D | Richiede blocchi A+B+C per comporre req/res |
| 27-32 | Vault contracts | E | Richiede `AgentIdentity` dal blocco B |
| 33-38 | Model Router contracts | F | Greenfield, fatti per ultimi su pattern consolidato |

---

## 5. Zero-downtime cutover (sequenza verificabile)

### Per OGNI contratto migrato, la checklist non negoziabile:

```
[ ] T0. Pre-migration baseline
      - X9 build: verde
      - Forge build: verde
      - Staging deploy smoke test: verde
      - Contract test (curl end-to-end sull'endpoint coinvolto): verde

[ ] T1. Commit nel bridge (bridge repo)
      - Aggiungi tipo in src/<dominio>/<file>.ts
      - Export da src/index.ts (barrel)
      - Test: tsc --noEmit verde
      - Test: vitest unit shape assertion verde
      - Bump version: 0.X.Y -> 0.X.(Y+1) (sempre patch in scope v1)
      - Commit: "feat(bridge): add <TypeName> canonical type"
      - Tag: v0.X.Y+1 (se distribuzione via tag)
      - CI: green
      - Rollback: git revert singolo commit

[ ] T2. Commit shim in X9 (agent-x9 repo)
      - Aggiorna packages/types/src/<file>.ts a re-export da @x9-forge/bridge
      - Aggiorna package.json se serve (bridge version bump)
      - Test: pnpm -w build verde
      - Test: esiste contract test Vitest sulla shape (non cambia niente)
      - Commit: "refactor(types): re-export <TypeName> from bridge"
      - CI X9: green
      - Rollback: git revert singolo commit

[ ] T3. Commit shim in Forge (forge-v2 repo)
      - Aggiorna packages/types/src/x9.ts a re-export da @x9-forge/bridge
      - Aggiorna package.json
      - Test: pnpm -w build verde
      - Commit: "refactor(types): re-export <TypeName> from bridge"
      - CI Forge: green
      - Rollback: git revert singolo commit

[ ] T4. Integration test cross-repo (staging)
      - Deploy X9 + Forge su staging con commit T2 + T3
      - Curl smoke sull'endpoint coinvolto
      - Verifica shape response matcha schema bridge
      - Se fallisce: rollback T2 + T3 (bridge a T1 resta, non tocca niente)

[ ] T5. Promozione produzione
      - Solo se T4 verde
      - Deploy X9 prod (snapshot VPS PRIMA)
      - Smoke test prod sull'endpoint (curl Bearer production token)
      - Deploy Forge prod (snapshot VPS PRIMA)
      - Smoke test prod cross-repo
      - Rollback: snapshot restore VPS entrambi (procedure X9 esistente)
```

### Invariante zero-downtime

**In ogni momento di questa sequenza, sia X9 sia Forge compilano e deployano.**

Dimostrazione per induzione:
- Dopo T1: solo il bridge e cambiato. X9 e Forge non sanno niente. Verdi per definizione.
- Dopo T2: X9 usa bridge shim. Forge ancora non lo sa. X9 verde (shim e re-export). Forge verde (niente cambiato).
- Dopo T3: sia X9 sia Forge usano shim. Entrambi verdi. Contratto canonico ora unico.
- Dopo T4: verifica end-to-end. Se fallisce, si rollback a T1 (stato: bridge ha tipo ma nessuno lo usa — safe).

**Mai** un deploy di X9 prod richiede un deploy contestuale di Forge prod o viceversa. Ogni deploy e indipendente (modulo version parity di tag bridge).

### Rollback atomico — come

| Problema emerso | Comando rollback | Note |
|-----------------|------------------|------|
| CI X9 rosso dopo T2 | `git revert <T2-sha>` | Rollback shim X9; bridge e Forge restano immutati |
| CI Forge rosso dopo T3 | `git revert <T3-sha>` | Rollback shim Forge; X9 gia in shim, resta |
| Integration T4 rosso | `git revert <T3-sha>` poi `git revert <T2-sha>` | In ordine inverso; bridge resta pubblicato (nessuno lo usa, next migration lo consuma) |
| Prod smoke rosso dopo T5 X9 | VPS snapshot restore X9 | Forge prod non toccato, continua a funzionare (il vecchio X9 rispondera col vecchio contratto, identico perche shim) |
| Prod smoke rosso dopo T5 Forge | VPS snapshot restore Forge | X9 prod continua con nuovo shim (che re-exporta da bridge); Forge torna al vecchio shim |

---

## 6. Package distribution (agnostico al meccanismo)

L'architettura e progettata per essere consumabile in **qualunque** dei meccanismi che STACK.md sta valutando (pnpm workspace / git submodule / private npm / tarball). Il bridge espone:

- `package.json` con `"main"`, `"types"`, `"exports"` standard
- Build output in `dist/` con `.d.ts` + `.js` (ESM, target ES2022)
- `src/index.ts` barrel export
- Sub-path exports opzionali: `@x9-forge/bridge/http`, `@x9-forge/bridge/vault`, etc. per tree-shaking tipi

```jsonc
// bridge/package.json
{
  "name": "@x9-forge/bridge",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./http": { "types": "./dist/http/index.d.ts", "import": "./dist/http/index.js" },
    "./vault": { "types": "./dist/vault/index.d.ts", "import": "./dist/vault/index.js" },
    "./capability": { "types": "./dist/capability/index.d.ts", "import": "./dist/capability/index.js" },
    "./agent": { "types": "./dist/agent/index.d.ts", "import": "./dist/agent/index.js" },
    "./model-router": { "types": "./dist/model-router/index.d.ts", "import": "./dist/model-router/index.js" },
    "./auth": { "types": "./dist/auth/index.d.ts", "import": "./dist/auth/index.js" }
  },
  "files": ["dist", "src"],
  "sideEffects": false
}
```

**Perche agnostico al meccanismo**: i consumer dichiarano `@x9-forge/bridge` come dipendenza secondo il protocollo scelto (`"workspace:*"`, `"file:../x9-forge-contract-bridge"`, `"git+ssh://..."`, `"1.2.3"`). Il codice del bridge e dei consumer non cambia. Solo il `package.json` dei consumer cambia.

Se un giorno si passa da submodule a npm privato, il codice bridge non si tocca.

---

## 7. Type evolution (post-v1)

### Aggiungere un nuovo contratto

**Workflow:**
1. Nuovo contratto emerge (es. endpoint X9 -> Forge per upload log strutturati)
2. Branch nel bridge: `feat/log-upload-contract`
3. Aggiungi `src/http/log-upload.ts` con request/response/path/method/auth
4. Export da `src/index.ts`
5. Vitest shape assertion (snapshot TS tipizzato)
6. Bump version patch: 1.X.Y -> 1.X.(Y+1)
7. PR + merge
8. Tag v1.X.(Y+1)
9. Consumer X9 e Forge aggiornano `@x9-forge/bridge` alla nuova versione; import diretto o shim (a discrezione del consumer)

### Modificare un contratto esistente

**Non-breaking (aggiunta campo opzionale, rilassamento di un constraint):**
- Bump **patch** (1.X.Y -> 1.X.Y+1)
- Consumer possono aggiornare quando vogliono
- Version skew e accettabile

**Breaking (rimozione campo, rename, cambio tipo):**
- Bump **major** (1.X.Y -> 2.0.0)
- Richiede migration guide nel CHANGELOG
- Entrambi i repo devono aggiornare in sincronia (coordinated deploy)
- Sequenza:
  1. Bridge v2.0.0-alpha pubblicata su tag/branch non default
  2. Branch X9 che testa v2.0.0-alpha -> verde
  3. Branch Forge che testa v2.0.0-alpha -> verde
  4. Staging deploy entrambi su v2.0.0-alpha -> verde
  5. Merge bridge v2.0.0 su main + tag
  6. Merge X9 branch + deploy prod
  7. Merge Forge branch + deploy prod (stessa finestra)
  8. Version parity check verde

**Alternativa preferibile (quando possibile):** **breaking-as-additive**:
- Aggiungi il nuovo campo/tipo in v1 minor
- Deprecate il vecchio con JSDoc `@deprecated`
- Dopo finestra di migrazione (es. 2 settimane, entrambi i consumer su nuovo), rimuovi in v2.0.0
- Riduce il rischio del coordinated deploy

### Rimuovere un contratto obsoleto

1. JSDoc `@deprecated` sul tipo nel bridge + CHANGELOG nota
2. Grep in X9 e Forge per tutti i consumer
3. Aggiorna consumer a non usare piu il tipo
4. Deploy consumer senza usi del tipo
5. Rimuovi dal bridge in major bump
6. Aggiorna consumer a nuovo bridge major

---

## 8. Repository layout (bridge internal)

### Layout proposto

```
x9-forge-contract-bridge/
├── src/
│   ├── index.ts                  # barrel (re-export di tutto)
│   │
│   ├── http/                     # contratti endpoint HTTP
│   │   ├── index.ts              # barrel http/*
│   │   ├── shared.ts             # tipi wire comuni (SSEChunk<T>, ErrorResponse, ...)
│   │   ├── internal-agents.ts    # /internal/agents (GET/reload/stop)
│   │   ├── internal-turn.ts      # /internal/turn, /internal/turn/stream
│   │   ├── internal-query.ts     # /internal/query
│   │   ├── cap-manifest.ts       # /:cap/manifest
│   │   ├── cap-env-schema.ts     # /:cap/env-schema
│   │   ├── cap-health.ts         # /:cap/health
│   │   ├── webhook-post-call.ts  # /webhook/post-call (Bug #15 canonical)
│   │   ├── voice-register.ts     # /api/voice/register (X9 -> Forge)
│   │   ├── vault-sync-all.ts     # /api/vault/sync-all (Forge-internal ma esposto tipato)
│   │   └── vault-resolve.ts      # /api/vault/resolve/:agentId
│   │
│   ├── capability/               # dominio capability/manifest/tools
│   │   ├── index.ts
│   │   ├── tool.ts               # CapabilityTool
│   │   ├── tool-call.ts          # ToolCallRequest, ToolCallResponse
│   │   ├── manifest.ts           # CapabilityManifest (con serviceName?, modelPolicy?)
│   │   ├── registry.ts           # CapabilityRegistryEntry (forma canonica)
│   │   └── env-schema.ts         # EnvSchemaField, EnvSchemaDoc
│   │
│   ├── agent/                    # dominio agent (identity, context core, credentials)
│   │   ├── index.ts
│   │   ├── identity.ts           # AgentIdentity { agentId, ownerId }
│   │   ├── credentials.ts        # AgentCredentials (discriminated + extensible)
│   │   ├── llm-config.ts         # LLMConfig { provider, model, tier? }
│   │   └── context-core.ts       # AgentContextCore (NO campi runtime X9-only)
│   │
│   ├── vault/                    # dominio vault centralizzato
│   │   ├── index.ts
│   │   ├── tier.ts               # VaultTier enum ('platform' | 'owner' | 'agent')
│   │   ├── entry.ts              # VaultEntry (wire shape, no DB id/timestamps)
│   │   ├── sync.ts               # VaultSyncEvent
│   │   └── semantics.ts          # doc string "synced vs overridden" -> tier mapping
│   │
│   ├── workspace/                # workspace files (Forge -> X9 sync)
│   │   ├── index.ts
│   │   └── file.ts               # WorkspaceFile (path, content, tier, isCustomized)
│   │
│   ├── model-router/             # Phase 35 contracts (greenfield)
│   │   ├── index.ts
│   │   ├── tier.ts               # ModelTier enum ordered
│   │   ├── tier-mapping.ts       # ModelTierMapping
│   │   ├── policy.ts             # ModelPolicy { min, max }
│   │   ├── override.ts           # ModelOverridePerAgent (Phase 35+)
│   │   ├── push.ts               # ModelPushRequest/Response
│   │   └── reload.ts             # ModelReloadEvent (hot-reload notification)
│   │
│   ├── auth/                     # header auth tipizzati, discriminated
│   │   ├── index.ts
│   │   ├── headers.ts            # X-Internal-Secret, X-Internal-Token, helper tipi
│   │   └── endpoint-auth.ts      # EndpointAuth<EndpointName> type-level mapping
│   │
│   └── health/
│       └── status.ts             # HealthStatus (promosso da X9)
│
├── tests/
│   ├── contracts.test.ts         # shape assertion per ogni tipo esportato
│   ├── type-compat.test-d.ts     # tsd / expect-type per compat backward
│   └── integration/
│       ├── curl-smoke.sh         # smoke test cross-repo su staging
│       └── fixtures/             # JSON samples reali per snapshot
│
├── scripts/
│   ├── verify-parity.sh          # CI check: X9 e Forge hanno stessa versione bridge
│   └── gen-barrel.ts             # genera src/index.ts da file structure
│
├── CHANGELOG.md                   # keep-a-changelog, linea di vita del bridge
├── MIGRATION.md                   # mapping vecchio-tipo -> nuovo-tipo per contract
├── README.md                      # esiste gia, aggiornato con tabella contratti
├── package.json
├── tsconfig.json
├── tsup.config.ts                 # build (o rollup, a scelta STACK)
├── vitest.config.ts
└── eslint.config.js               # lint rule: no imports from consumer repos
```

### Rationale layout

**Nested per dominio, non piatto:** con ~40 tipi previsti, un flat `src/*.ts` diventa illeggibile. Il raggruppamento per dominio riflette il modello mentale (HTTP / capability / agent / vault / workspace / model-router / auth), e i sub-path exports del package.json permettono import parziali (`import { VaultEntry } from '@x9-forge/bridge/vault'`).

**`src/http/` per endpoint, non per metodo:** ogni endpoint e un'unita atomica (path + method + req + res + auth). Separarli per metodo (`src/get/`, `src/post/`) frammenta contratti che vanno insieme.

**Barrel per sotto-dominio:** facilita sia import pieno (`import { X, Y } from '@x9-forge/bridge'`) sia import scoped (`import { VaultEntry } from '@x9-forge/bridge/vault'`). Meno noise nell'IDE.

**`src/auth/` separato da `src/http/`:** gli header auth sono policy ortogonali ai singoli endpoint (possono cambiare indipendentemente dai payload). Separarli rende chiaro che `POST /webhook/post-call` usa `X-Internal-Token` *in base a una policy*, non come accoppiamento forzato.

**Tests dedicati per contratti:** `tests/contracts.test.ts` fa shape assertion runtime (Zod) + type assertion compile-time (`expect-type`). Se un contratto cambia in modo breaking, sia il test runtime sia il build TS falliscono.

**`scripts/verify-parity.sh`:** invocato dal CI di X9 e Forge per garantire version parity (vedi sezione 3).

**CHANGELOG + MIGRATION obbligatori:** documentazione della linea di vita del bridge; parte della DoD di ogni migrazione contract (README mandate PROJECT.md punto 6).

---

## 9. Build order inter-phase (raggruppamento roadmap)

### Raggruppamento consigliato (6 phase)

**Phase 1 — Bridge Bootstrap (infrastruttura, zero contratti migrati)**
- Init repo con layout sezione 8
- tsconfig, tsup/rollup build, vitest, eslint rules anti-dep
- package.json con exports map
- CI verde sul repo bridge (build + test)
- Setup distribuzione verso X9 e Forge (meccanismo da STACK.md)
- Entrambi i repo dichiarano `@x9-forge/bridge@v0.1.0-empty` come dep (no-op — pacchetto vuoto)
- Script `verify-parity.sh` in CI di X9 e Forge
- Contract test baseline green in entrambi i repo
- **DoD:** bridge pubblicato, entrambi i repo buildano con bridge come dep senza usarne tipi. Zero regressioni funzionali.

**Phase 2 — Validation Block (blocco A migration ordine)**
- Migra `CapabilityTool`, `CapabilityManifest`, `ToolCallRequest/Response`, `EnvSchema*`, `HealthStatus` (5 contratti, ~15 commit atomici cross-repo)
- Pattern shim validato su tipi semplici
- Contract test cross-repo green per ognuno
- **DoD:** 5 contratti del blocco A migrati. Pattern shim rodato. Zero downtime misurato.

**Phase 3 — AgentContext Split + Auth Hardening (blocco B + blocco C)**
- Migra `AgentIdentity`, `AgentCredentials`, `LLMConfig`, `AgentContextCore`
- Introduce `AgentContextRuntime` in X9
- Migra auth headers tipizzati discriminated (blocco C)
- Aggiorna `services/factory/src/services/x9.client.ts` Forge a usare header tipizzati -> Bug #15 ora protetto a compile-time
- **DoD:** `AgentContext` split, `AgentCredentials` discriminated, Bug #15 protetto. Zero downtime.

**Phase 4 — HTTP Endpoint Contracts (blocco D, 11 endpoint)**
- Migra tutti gli 11 endpoint (path + method + req + res + auth)
- Parallelizzabile: fino a 2-3 endpoint in parallelo (executor agent separati)
- Contract test cross-repo per ognuno
- **DoD:** 11 endpoint tipizzati; ogni client (X9.client in Forge; Forge consumer in X9 se esistono) refactoring a chiamare via tipi. Zero downtime.

**Phase 5 — Vault & Workspace Contracts (blocco E)**
- Migra `VaultTier`, `VaultEntry`, `VaultSyncEvent`, `WorkspaceFile`
- Tipizza endpoint vault (sync-all, resolve)
- X9 consumer di vault (lettura `context.json`) riceve tipo da bridge
- **DoD:** vault shape tipizzata, endpoint vault sync-all protetto a compile-time. Zero downtime.

**Phase 6 — Model Router Contracts (blocco F, greenfield)**
- Crea `ModelTier`, `ModelTierMapping`, `ModelPolicy`, `ModelPushRequest/Response`, `ModelReloadEvent`
- Estende `CapabilityRegistryEntry` con `modelPolicy?`
- **DoD:** Phase 35 agent-x9 puo partire importando dal bridge. Forge UI puo partire importando dal bridge. Zero implementazione runtime qui (sono solo contratti).

**Phase 7 (opzionale, molto dopo) — Shim Removal & Consolidation**
- Quando tutti i consumer interni hanno migrato gli import a `@x9-forge/bridge` diretto
- Rimuovi `X9*` prefix aliases in Forge shim
- Rimuovi re-export layer in X9 packages/types (se tutti i moduli importano dal bridge)
- Bridge v1.0.0 lock
- **DoD:** packages/types e un vuoto storico; il bridge e la source of truth senza shim intermedi.

### Phase 7 e opzionale — pro/contro skipparla

| Pro skip phase 7 | Contro skip phase 7 |
|------------------|---------------------|
| Shim e zero-cost (type alias, nessun runtime) | Due nomi per lo stesso tipo in Forge (`X9CapabilityManifest` vs `CapabilityManifest`) — confusione |
| Refactor grep-replace rischioso su tanti file | Nuovo dev non sa subito che il tipo vive nel bridge |
| Branch/deploy extra | Bridge non e "l'evidente source of truth" ma nascosto dietro shim |

**Raccomandazione:** schedulare phase 7 **dopo** stabilizzazione (tipo 1-2 mesi dopo phase 6), non bloccarla sullo stesso milestone ma mantenerla sul radar. Shim persistente piu a lungo e accettabile; piu importante che non si ripeta Bug #15 (gia protetto in phase 3).

### Alternative considerate (rifiutate)

**Opzione A — Big bang:** migrare tutti i 24 contratti in un'unica phase monolitica. Rifiutata: viola vincolo X9 continuity, non rollback-able granularmente, contract tests troppi da verificare in una finestra.

**Opzione B — Per repo (X9 prima, Forge dopo):** migrare tutti i tipi X9 al bridge, poi tutti i tipi Forge. Rifiutata: durante la fase "solo X9 migrato" il bridge ha tipi che nessuno in Forge usa, ma Forge importa ancora da se stesso -> divergenza resta, il bridge e decorativo. Valore zero.

**Opzione C — Per endpoint pieno (AB-C-D prima di B+E):** migrare un endpoint alla volta end-to-end (tipo + header + req + res). Rifiutata: gli endpoint condividono foglie (`AgentIdentity`, `ToolCallRequest`), migrarli endpoint-per-endpoint costringe a migrazioni parziali di una stessa foglia in ordini diversi, aumentando il rischio di divergenza.

**Opzione D — Contratto per contratto senza blocchi:** senza raggruppare in phase, migrare 24 contratti in 24 mini-phase. Rifiutata: troppi GSD phase boundaries, overhead di planning superiore al valore. Il raggruppamento in 6 phase e il giusto trade-off.

---

## Pattern ricorrenti (codice reference)

### Pattern: Endpoint contract monolitico (http file)

```typescript
// src/http/internal-turn.ts
import type { AgentIdentity } from '../agent/identity.js'
import type { ToolCallResponse } from '../capability/tool-call.js'

export const INTERNAL_TURN_PATH = '/internal/turn' as const
export const INTERNAL_TURN_METHOD = 'POST' as const
export const INTERNAL_TURN_AUTH = 'X-Internal-Secret' as const

export interface InternalTurnRequest extends AgentIdentity {
  readonly sessionId: string
  readonly userMessage: string
  readonly userId?: string
}

export type InternalTurnResponse =
  | {
      readonly status: 'ok'
      readonly sessionId: string
      readonly reply: string
      readonly toolCalls: ReadonlyArray<ToolCallResponse>
    }
  | {
      readonly status: 'error'
      readonly code: 'AGENT_NOT_FOUND' | 'SESSION_INVALID' | 'LLM_FAILED'
      readonly message: string
    }
```

Forge client:
```typescript
import {
  INTERNAL_TURN_PATH,
  INTERNAL_TURN_METHOD,
  INTERNAL_TURN_AUTH,
  type InternalTurnRequest,
  type InternalTurnResponse,
} from '@x9-forge/bridge/http'

async function callTurn(req: InternalTurnRequest): Promise<InternalTurnResponse> {
  const res = await fetch(x9Host + INTERNAL_TURN_PATH, {
    method: INTERNAL_TURN_METHOD,
    headers: { [INTERNAL_TURN_AUTH]: secret, 'content-type': 'application/json' },
    body: JSON.stringify(req),
  })
  return res.json() as Promise<InternalTurnResponse>
}
```

Se il bridge cambia header `/webhook/post-call` da `X-Internal-Secret` a `X-Internal-Token`, TypeScript fallisce al `[INTERNAL_TURN_AUTH]: secret` perche l'IDE sa che la chiave header ora e `'X-Internal-Token'`. Bug #15 impossibile.

### Pattern: Discriminated auth headers

```typescript
// src/auth/headers.ts
export type InternalSecretHeader = { readonly 'X-Internal-Secret': string }
export type InternalTokenHeader = { readonly 'X-Internal-Token': string }
export type InternalAuthHeader = InternalSecretHeader | InternalTokenHeader

// src/auth/endpoint-auth.ts — type-level mapping
import type { INTERNAL_TURN_AUTH } from '../http/internal-turn.js'
import type { WEBHOOK_POST_CALL_AUTH } from '../http/webhook-post-call.js'

export type EndpointAuthFor<E> =
  E extends typeof INTERNAL_TURN_AUTH ? InternalSecretHeader :
  E extends typeof WEBHOOK_POST_CALL_AUTH ? InternalTokenHeader :
  never
```

### Pattern: Shape Zod parallela al tipo (quando necessario)

```typescript
// src/agent/context-core.ts
import { z } from 'zod'

export const AgentCredentialsSchema = z.record(z.string(), z.string())  // + known keys se refinement

export const AgentContextCoreSchema = z.object({
  agentId: z.string().min(1),
  ownerId: z.string().min(1),
  credentials: AgentCredentialsSchema,
  llmConfig: z.object({ provider: z.string(), model: z.string() }),
  telegramAllowFrom: z.array(z.string()),
})

export type AgentContextCore = z.infer<typeof AgentContextCoreSchema>
```

Un solo file = tipo + schema di validazione. Forge valida input via schema, X9 lo usa come tipo runtime-less. Il bridge decide dove includere Zod e dove no (tipi wire cross-repo -> SI; tipi util interni -> NO).

---

## Scaling considerations

Il bridge e un package di tipi, non un servizio. Scaling = evoluzione del numero di contratti e velocita di modifica.

| Scale | Architettura |
|-------|-------------|
| 1-20 contratti (scope v1) | Layout sezione 8 sufficiente, barrel + sub-path |
| 20-50 contratti | Stesso layout, continuare a splittare per dominio; aggiungere auto-generazione barrel via `scripts/gen-barrel.ts` |
| 50+ contratti | Valutare splitting del bridge in sub-packages (`@x9-forge/bridge-core`, `@x9-forge/bridge-vault`, `@x9-forge/bridge-router`). Probabilmente mai necessario per questo progetto |

### Bottleneck previsto: version parity

A ogni migrazione, il passaggio critico e mantenere parity bridge version tra X9 e Forge. Se il team cresce e piu branch aperti contemporaneamente, il CI check `verify-parity.sh` diventa il gatekeeper. Non ci sono alternative scalabili — e strutturale al problema.

---

## Anti-patterns

### AP1: Importare codice runtime nel bridge
**Errore:** aggiungere `import { something } from 'fastify'` o `from 'drizzle-orm'` nel bridge.
**Perche sbagliato:** il bridge deve poter essere importato da qualunque ambiente (Node server, browser, edge) senza trascinare dipendenze runtime.
**Cosa fare invece:** tipi e basta. Se serve helper runtime (es. validator factory), vive in un package separato `@x9-forge/bridge-validators` che dipende dal bridge, non viceversa.

### AP2: Estendere tipi Forge-only con campi X9-runtime
**Errore:** aggiungere `workspacePath` a `AgentContextCore` solo perche il file `context.json` on-disk in X9 ce l'ha.
**Perche sbagliato:** accoppia Forge a dettagli FS X9. Forge non deve sapere che X9 salva su disco.
**Cosa fare invece:** `AgentContextCore` e il contratto wire; `AgentContextRuntime` estende in X9 con campi FS-specific.

### AP3: Tipo "God object" per endpoint
**Errore:** un unico file `endpoints.ts` con tutti gli 11 endpoint dentro.
**Perche sbagliato:** ogni modifica a un endpoint tocca lo stesso file -> merge conflicts, diff rumorosi, rollback parziale impossibile.
**Cosa fare invece:** un file per endpoint in `src/http/<endpoint>.ts`, barrel in `src/http/index.ts`.

### AP4: Bump major per aggiunte
**Errore:** bump `2.0.0` perche "c'e un nuovo tipo".
**Perche sbagliato:** aggiunta di un tipo non e breaking; i consumer non cambiano. Bump major forza coordinated deploy inutilmente.
**Cosa fare invece:** patch per aggiunte e non-breaking; minor per deprecation; major solo per rimozioni/rename.

### AP5: Shim-per-sempre
**Errore:** non programmare mai phase 7 (shim removal).
**Perche sbagliato:** doppio nome per lo stesso tipo (`X9CapabilityManifest` vs `CapabilityManifest`) diventa canonico nel codebase, nuovi dev si confondono, il bridge sembra "opzionale".
**Cosa fare invece:** phase 7 schedulata anche se dopo 2-3 mesi; shim ha scadenza.

### AP6: Saltare contract test per "e solo un rename"
**Errore:** "e solo un alias, non serve test".
**Perche sbagliato:** Bug #15 e partito da "e solo un header in piu, cosa vuoi che sia".
**Cosa fare invece:** ogni contract migrato ha shape assertion runtime + compile-time, non negoziabile.

### AP7: Importare da `@x9-forge/bridge` direttamente nei file X9/Forge prima che esistano shim
**Errore:** migrazione parziale senza shim, con alcuni file che importano dal bridge e altri dal vecchio path.
**Perche sbagliato:** divergenza interna nello stesso repo, doppia source of truth fino a shim removal.
**Cosa fare invece:** step T2/T3 della sequenza sez 5 e non negoziabile: prima shim completo, poi (eventualmente) consumer migrano.

---

## Integration points

### External

| Sistema | Pattern | Note |
|---------|---------|------|
| npm registry privato / git submodule / pnpm workspace | Package consumption | Decisione in STACK.md; bridge e agnostico |
| CI GitHub Actions X9 | `verify-parity.sh` step | Fallisce se bridge version diverge da Forge |
| CI GitHub Actions Forge | `verify-parity.sh` step | Fallisce se bridge version diverge da X9 |
| VPS Hostinger (X9 prod) | Standard X9 deploy rsync | Bridge arriva come parte di X9 node_modules (bundled o submodule) |
| VPS Hostinger (Forge prod) | Standard Forge deploy rsync | Bridge arriva come parte di Forge node_modules |

### Internal boundaries

| Boundary | Comunicazione | Considerazioni |
|----------|---------------|-----------------|
| Bridge -> X9 | Type-only import | Zero runtime cost; solo compile-time |
| Bridge -> Forge | Type-only import | Zero runtime cost |
| X9 <-> Forge runtime | HTTP (tipizzato via bridge) | Payload validati contro shape bridge |
| X9 runtime <-> X9 packages/types shim | Re-export type alias | Zero cost |
| Forge runtime <-> Forge packages/types/x9.ts shim | Re-export type alias | Zero cost |

---

## Sources

**Codice verificato sul repo (ground truth):**
- `/Users/admintemp/Downloads/Claude/agent-x9/packages/types/src/capability.ts:1-38` — CapabilityTool, ToolCallRequest/Response, CapabilityManifest
- `/Users/admintemp/Downloads/Claude/agent-x9/packages/types/src/agent-context.ts:1-14` — AgentContext (forma attuale, pre-split)
- `/Users/admintemp/Downloads/Claude/agent-x9/packages/types/src/agent-context.schema.ts:1-13` — AgentContextSchema Zod
- `/Users/admintemp/Downloads/Claude/agent-x9/packages/types/src/env-schema.ts:1-12` — EnvSchemaField, EnvSchemaDoc
- `/Users/admintemp/Downloads/Claude/agent-x9/packages/types/src/health.ts:1-8` — HealthStatus
- `/Users/admintemp/Downloads/Claude/agent-x9/packages/types/src/llm.ts:1-56` — LLM types (X9-local, NON nel bridge)
- `/Users/admintemp/Downloads/Claude/agent-x9/packages/types/src/memory.ts:1-34` — Memory types (X9-local, NON nel bridge)
- `/Users/admintemp/Downloads/Claude/agent-x9/packages/types/src/index.ts:1-25` — barrel X9 types
- `/Users/admintemp/Downloads/Claude/agent-x9/services/agent-core/src/core/agent-manager.ts:1-67` — AgentContext loading runtime
- `/Users/admintemp/Downloads/Claude/forge-v2/packages/types/src/x9.ts:1-48` — Forge mirror di tipi X9 (duplicati, divergenti)
- `/Users/admintemp/Downloads/Claude/forge-v2/packages/db/src/schema.ts:13-103` — schema DB Forge (owners, agents, vault_entries, workspace_files)

**Documenti progetto:**
- `/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge/.planning/PROJECT.md` — scope v1, research mandate, 24 contratti mappati
- `/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge/README.md` — scope summary, gap analysis verificato 2026-04-14

**Pattern architetturali (training data, HIGH confidence):**
- Strangler fig pattern (Martin Fowler) — migrazione incrementale con facade
- Shared kernel (DDD) — pattern per tipi condivisi tra bounded context
- Contract-first API design — definizione contratti prima dell'implementazione
- Semantic versioning (semver.org) — major/minor/patch discipline
- pnpm workspace protocol — `"workspace:*"` per monorepo internal linking

---
*Architecture research for: TypeScript cross-repo contract package (x9-forge-contract-bridge)*
*Researched: 2026-04-14*
*Quality gate: dependency direction esplicita (sez 2), compat shim pattern con snippet (sez 3), ordine migrazione giustificato (sez 4), zero-downtime sequence step-by-step (sez 5), ogni contratto mappato a phase (sez 9), split AgentContext analizzato pro/contro (sez 1), rollback atomico per commit (sez 5).*
