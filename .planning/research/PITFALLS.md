# Pitfall di dominio — x9-forge-contract-bridge

**Dominio:** TypeScript cross-repo contract package (compile-time, due consumer interni in pnpm workspace)
**Ricerca:** 2026-04-14
**Contesto:** Brownfield. Il bridge nasce per prevenire Bug #15 (X-Internal-Token mancante su `/webhook/post-call`, scoperto in produzione 2026-04-11). La ricerca enumera gli altri modi in cui questo pattern fallisce, specialmente quando fatto male.

Legenda severity:
- **CRITICAL** — rompe la produzione di X9 o Forge, silent-fail, impossibile da rollback senza intervento manuale
- **HIGH** — rompe il build di un consumer, blocca deploy, corrompe stato ma recuperabile
- **MEDIUM** — debito tecnico che degrada l'ecosistema, bypass del bridge, drift lento
- **LOW** — fastidio DX, leggibilita, no impatto funzionale immediato

Legenda phase mapping (da ROADMAP in fase di scrittura — riferimenti logici, non numerici definitivi):
- **P0-Skeleton** — creazione package, tooling, tsconfig, export map
- **P1-HTTP** — migrazione 11 contratti HTTP esistenti
- **P2-Vault** — Vault 3-tier + AgentCredentials discriminated
- **P3-Model** — Model Router contracts nuovi (Phase 35 prereq)
- **P4-Cleanup** — rimozione compat shim, tipi legacy
- **CROSS** — vincolo trasversale, applicato a ogni phase

---

## Pitfall CRITICAL

### P-01 — Compat shim loop infinito (bridge ri-esporta a se stesso tramite il legacy)

**Sintomi / warning signs**
- `tsc --traceResolution` mostra risoluzione circolare tra `@x9-forge/contracts` e `@agent-x9/types`
- Stack trace runtime `Maximum call stack size exceeded` all'import
- `node --stack-trace-limit=1000` mostra loop di re-export
- Test unit del bridge passano ma integration test di X9/Forge falliscono al primo import

**Meccanismo**
Il research mandate (vincolo 4) permette che `agent-x9/packages/types/` e `forge-v2/packages/types/src/x9.ts` restino come re-export dai tipi bridge (compat shim). Se il bridge, per "riuso interno", importa un sotto-tipo da uno dei consumer legacy (perche "gia fatto la"), si crea un ciclo: bridge → x9-legacy → bridge. TypeScript risolve comunque i tipi (structural typing), ma ts-node/tsx a runtime va in loop di richiesta modulo.

**Prevenzione (actionable)**
1. Regola dura: **il bridge NON importa MAI da agent-x9 ne da forge-v2**. Solo `package.json.dependencies` standard (zod, typescript peer).
2. ESLint rule `no-restricted-imports` con pattern `agent-x9/*`, `forge-v2/*`, `@forge/*`, `@x9/*` attiva sul package bridge.
3. CI step che esegue `madge --circular src/` sul bridge e fallisce al primo ciclo.
4. Il compat shim va **solo in direzione consumer → bridge**, mai viceversa.

**Phase**: P0-Skeleton (regola eslint), P4-Cleanup (verifica finale con madge)
**Severity**: CRITICAL

---

### P-02 — Compile-time vs runtime gap al boundary HTTP

**Sintomi / warning signs**
- Test TS compilano, ma in produzione un campo arriva `undefined`, `null` o stringa invece di oggetto
- Sentry mostra `TypeError: Cannot read property 'X' of undefined` su endpoint appena migrato
- Forge costruisce request che TS dice ok, X9 la riceve e crasha sul primo accesso
- Log X9 `[express] body parsed OK` ma capability-service riceve shape invalido

**Meccanismo**
I tipi TypeScript del bridge garantiscono che chi **scrive** codice col tipo corretto emetta la shape giusta. Non garantiscono nulla su cio che **entra** nel sistema: body parsato da express/fastify, risposta fetch, env var letto, JSON di `context.json` sul disco. Se un file DB, una response legacy di Forge v1, o un payload non-bridge arriva al boundary, TS lo accetta come valido perche non e in grado di vederlo. Bug #15 era esattamente questo ma al contrario: TS non sapeva dell'header mancante perche nessuno validava l'outgoing request shape.

**Prevenzione (actionable)**
1. Ogni contratto del bridge esporta **coppia**: `TypeX` (TS type) e `TypeXSchema` (Zod schema). Regola: `type TypeX = z.infer<typeof TypeXSchema>`. Mai il contrario.
2. Al boundary di ingresso (fastify `preHandler`, express middleware, voice-svc consume) validazione Zod **obbligatoria**. Se Zod fallisce → 400 strutturato, non crash.
3. Al boundary di uscita (X9 che chiama Forge, Forge che chiama X9), `schema.parse(payload)` prima di `fetch`, altrimenti il bridge non ha prevenuto Bug #15, ha solo spostato il problema.
4. Test contract (vincolo 2 del mandate) includono sample **reale da log produzione** + parse Zod, non inventati a tavolino.

**Phase**: P0-Skeleton (pattern `z.infer` + export coppia), P1-HTTP (preHandler su tutti gli 11 endpoint), CROSS
**Severity**: CRITICAL

---

### P-03 — Zod schema diverge dal TS type dopo refactor manuale

**Sintomi / warning signs**
- `z.infer<typeof Schema>` non assegnabile a `Type` dichiarato manualmente → errore TS
- Review PR: qualcuno ha aggiunto un campo su `type` ma non su `schema`, o viceversa
- Runtime accetta payload piu permissivo di quello documentato dai tipi (campo opzionale lato schema ma required lato type)
- Test snapshot del contratto passa dopo edit parziale

**Meccanismo**
Qualcuno scrive:
```ts
export const AgentCredentialsSchema = z.object({ OPENAI_API_KEY: z.string() });
export type AgentCredentials = { OPENAI_API_KEY: string; TELEGRAM_BOT_TOKEN: string };
```
Notare il mismatch: `TELEGRAM_BOT_TOKEN` c'e nel tipo, non nello schema. TS accetta. Runtime valida meno di quello che i consumer usano. Forge invia solo `OPENAI_API_KEY`, X9 lo riceve, tipo dice c'e anche TELEGRAM, runtime non c'e → undefined access.

**Prevenzione (actionable)**
1. Convenzione **rigorosa**: `export type Foo = z.infer<typeof FooSchema>`. Mai type dichiarati manualmente in file che hanno anche Zod schema.
2. Lint rule custom (ts-morph) che cerca `export type X` + `export const XSchema` nello stesso file e fallisce se il type non e `z.infer<...>`.
3. Golden test: per ogni schema esporta un fixture reale (`__fixtures__/agent-credentials.json`), `FooSchema.parse(fixture)` deve passare.
4. Property-based test con `fast-check` + `zod-fast-check` che genera 100 casi random per schema → se Zod accetta, il tipo deve accettarlo (assignability).

**Phase**: P0-Skeleton (lint rule + convenzione), CROSS
**Severity**: CRITICAL

---

### P-04 — Version drift tra consumer in pnpm workspace

**Sintomi / warning signs**
- `pnpm why @x9-forge/contracts` mostra versioni multiple (`1.2.0`, `1.3.0-rc.1`) risolte in sotto-workspace diversi
- Build X9 OK, build Forge OK, integration test falliscono su shape disallineate
- `pnpm-lock.yaml` cambia all'improvviso dopo un `pnpm install` su un sotto-package
- Errore `Type X is not assignable to type X` (stesso nome, versioni diverse) — classico segnale di duplicate instance

**Meccanismo**
Il bridge e pubblicato (o linkato) come workspace:*, ma i tre repo (bridge, agent-x9, forge-v2) NON sono nello stesso monorepo. Il research mandate non chiarisce se il bridge e submodule, pnpm workspace esteso, o package npm privato. In tutti e tre i casi, due consumer possono risolvere versioni diverse se il lockfile non e sincronizzato. L'esempio classico: agent-x9 aggiorna al bridge v1.3 (nuovo campo `modelPolicy`), deploya; forge-v2 ancora su v1.2 builda ma non sa del campo; al runtime Forge invia payload senza `modelPolicy`, X9 (v1.3) si aspetta il campo, crash.

**Prevenzione (actionable)**
1. **Decisione architetturale esplicita** (research: stack decision): single pnpm monorepo che contiene bridge + x9 + forge, oppure npm private registry con versioning strict, oppure git submodule con SHA pinning. Mai misto.
2. Se pnpm workspace unificato: `dependenciesMeta.injected: true` su `@x9-forge/contracts` per evitare hoisting sporco.
3. Se package pubblicato: pin su versione exact (`1.2.0`, non `^1.2.0`) in entrambi i consumer. `pnpm config set save-exact true`.
4. Se submodule: CI step che verifica SHA del bridge sia identico in `agent-x9/.gitmodules` e `forge-v2/.gitmodules`, fail if divergono.
5. Renovate bot configurato per bumpare il bridge in X9 e Forge **nello stesso PR atomico**.

**Phase**: STACK (decisione architetturale), P0-Skeleton (pin strategy), P1-HTTP in poi
**Severity**: CRITICAL

---

### P-05 — Breaking change senza atomic cross-repo release

**Sintomi / warning signs**
- Bridge pubblicato v2.0.0 mercoledi, X9 aggiornato giovedi, Forge deploya venerdi sul vecchio bridge v1.x → prod con versioni disallineate per 24h
- Post-mortem rivela che il rename campo `endpoint` → `host`+`port`+`version` era solo in X9, Forge chiamava ancora endpoint
- Hotfix notturno perche staging non ha catchato il mismatch

**Meccanismo**
Il research mandate (vincolo 3, incremental migration) richiede migrazione un contratto alla volta. Ma un rename/remove di campo NON e additivo: il giorno che `CapabilityRegistryEntry.endpoint` viene rimosso, entrambi i consumer devono aggiornare. Se il processo non e atomico, c'e una finestra temporale in cui uno dei due e bugged.

**Prevenzione (actionable)**
1. Regola **expand-contract** per breaking changes:
   - **Expand (v1.N)**: aggiungi il nuovo campo (`host`, `port`, `version`) come opzionale, mantieni il vecchio (`endpoint`) come deprecato. Entrambi i consumer migrano a leggere/scrivere il nuovo.
   - **Contract (v2.0)**: rimuovi il vecchio campo **solo dopo** che entrambi i consumer hanno mergeato l'uso del nuovo.
2. Deprecation JSDoc `/** @deprecated use host+port+version. Removed in v2. */` che TS surface come warning nell'IDE.
3. CI cross-repo: PR che bumpa major del bridge blocca merge finche non esistono PR `chore: bump bridge to vX` in X9 e Forge entrambi green.
4. CHANGELOG.md con sezione "Breaking" obbligatoria + migration path. Nessuna major rilasciata senza migration guide.
5. In produzione: feature flag o env var che permette fallback al campo legacy per 1-2 deploy cycle.

**Phase**: CROSS (policy), P4-Cleanup (prima major con contract step)
**Severity**: CRITICAL

---

### P-06 — AgentCredentials discriminated senza migration path rompe context.json di X9 in produzione

**Sintomi / warning signs**
- X9 al reload: `ZodError: invalid_type at path .credentials` sul context.json esistente
- Agent master non parte, cloni non partono, `/internal/agents` ritorna 500
- Log: `context.credentials is Record<string,string>, expected discriminated union`

**Meccanismo**
Oggi X9 `context.credentials` e `Record<string, string>` flat. Il bridge v1 (scope v1) introduce `AgentCredentials` discriminated (es. `{ type: 'openai', apiKey: string } | { type: 'telegram', botToken: string }` o similare). Se la migrazione rimpiazza direttamente il parse del context.json senza:
- mantenere compatibilita col Record esistente su disco,
- migration script che riscrive i context.json delle N agent (master + cloni),

al primo `/reload` in produzione tutti gli agenti diventano unusable. Questo e **un Bug #15 al quadrato** — non silent, ma catastrofico.

**Prevenzione (actionable)**
1. Schema Zod con **union di vecchio e nuovo**: `CredentialsSchema = OldRecordSchema.or(NewDiscriminatedSchema)`. Parse tollerante, warn se old, errore mai.
2. Migration script idempotente `scripts/migrate-credentials.ts` che legge `/data/agents/*/context.json` vecchi e li riscrive col nuovo shape. Dry-run obbligatorio + diff + backup (`.bak`) prima di scrivere.
3. Rollout in 3 step: (a) bridge rilascia entrambi gli schema → X9 accetta entrambi; (b) Forge migra a scrivere nuovo shape; (c) X9 rilascia versione che accetta **solo** nuovo, dopo aver girato migration script in prod.
4. VPS snapshot Hostinger prima di ogni step (vincolo 5 mandate).
5. Feature flag `X9_CREDENTIALS_DISCRIMINATED=0/1` per rollback istantaneo.

**Phase**: P2-Vault
**Severity**: CRITICAL

---

### P-07 — Payload crittografato AES vs decriptato: doppio schema Zod confuso

**Sintomi / warning signs**
- Forge vault-service logga `zod parse fail: expected object, got string` su `VaultEntry.value`
- Oppure: X9 logga `fail: expected base64 string, got object` quando riceve vault push
- Un endpoint riceve chiaramente **bytes cifrati**, un altro riceve **JSON chiaro**, ma entrambi tipizzati come `VaultEntry`

**Meccanismo**
Forge v2 cifra i valori vault con AES-256-GCM (`services/vault/src/services/vault.service.ts`). Il campo `value` e:
- **stringa base64 cifrata** quando letto da DB/persistenza
- **JSON originale (plain)** quando consumato post-decrypt dentro Forge, o quando pushato a X9 in chiaro

Se il bridge espone un solo tipo `VaultEntry { value: string }`, entrambi i casi type-checkano ma semanticamente sono diversi. Quando qualcuno deve decriptare, non c'e type hint per sapere se value e gia cifrato o no.

**Prevenzione (actionable)**
1. **Due tipi distinti** nel bridge:
   ```ts
   type VaultEntryEncrypted = { value: string /* base64 AES-GCM */, iv: string, authTag: string, ... };
   type VaultEntryPlain = { value: string | Record<string,unknown>, ... };
   ```
2. Branded string per distinguere: `type EncryptedBlob = string & { __brand: 'encrypted' }`. Una funzione `decrypt(blob: EncryptedBlob): PlainValue` e l'unico modo per passare dall'uno all'altro.
3. Zod schema: `VaultEntryEncryptedSchema` valida la presenza di `iv` + `authTag` + pattern base64 su `value`. `VaultEntryPlainSchema` li rifiuta esplicitamente (`.strict()`).
4. Documentazione esplicita in JSDoc: "NEVER log `value` if encrypted=false: contiene secret in chiaro. Regola lint: nessun log.info/warn/error con VaultEntryPlain in argomento."

**Phase**: P2-Vault
**Severity**: CRITICAL

---

### P-08 — Breaking nei Model Router contracts rompe Phase 35 X9 in-flight

**Sintomi / warning signs**
- Phase 35 agent-x9 in corso, classifier LLM in sviluppo, Forge pusha `ModelTierMapping` con shape cambiato → X9 rifiuta
- Dipendenza P3-Model → Phase 35 X9 → Phase 10 Forge UI in rotta di collisione
- Stefano dice "Phase 35 non parte se il bridge non e congelato"

**Meccanismo**
I 5 contratti Model Router (ModelTier, ModelTierMapping, ModelPolicy, Model Push API, Hot-reload notification) sono **nuovi**, quindi iterabili solo nel bridge. Ma la Phase 35 di X9 dipende da shape stabile. Se durante la Phase 35 il bridge cambia la struttura (es. `ModelTier` da enum ordinato a discriminated union), la Phase 35 fa refactor in parallelo al bridge e si arena.

**Prevenzione (actionable)**
1. **Freeze contrattuale** dopo P3-Model: nessun breaking change sui 5 Model Router contracts per almeno 2 settimane o fino a Phase 35 merged.
2. Prototipo rapido dei 5 contratti **prima** del freeze: scrivere esempi reali di payload (tier mappings per 3 cap, policy min/max, hot-reload notification), farli validare a 4 mani con chi implementera Phase 35 in X9.
3. Versioning: ogni rilascio che tocca solo Model Router contracts = minor bump. La major bump (contract step) e vietata durante Phase 35.
4. Test "dry-run Phase 35": contract test che emula il flusso Forge Push → X9 consume → hot-reload, scritto nel bridge repo, green prima del freeze.

**Phase**: P3-Model (con freeze dichiarato a fine phase)
**Severity**: CRITICAL

---

## Pitfall HIGH

### P-09 — `any` o `unknown` castato che vanifica il contratto

**Sintomi / warning signs**
- `grep -r "as any" packages/bridge` mostra cast dentro il bridge
- Consumer fa `JSON.parse(body) as ToolCallRequest` senza validazione
- Code review: "TS si lamenta, metto `as unknown as X` per farlo tacere"
- Refactor con `// @ts-expect-error` lasciati in commit

**Meccanismo**
La forza del bridge e il rigore dei tipi. Un singolo `as any` in un punto di ingresso fa collassare la garanzia per tutta la chain. Se `ToolCallRequest` e castato da `any`, chi lo usa a valle crede di avere type safety ma sta lavorando su dati non verificati. Questo e il pattern che ha mascherato Bug #15 (nessuno validava il shape, era "implicitamente fidato").

**Prevenzione (actionable)**
1. ESLint rule `@typescript-eslint/no-explicit-any: error` nel bridge package. Zero eccezioni.
2. ESLint rule `@typescript-eslint/no-unsafe-assignment: error`, `no-unsafe-call`, `no-unsafe-member-access`, `no-unsafe-return` nei consumer per import dal bridge.
3. Regola: conversione da `unknown` a tipo bridge passa **solo** tramite `Schema.parse(data)` di Zod, mai via cast.
4. CI: `grep -nE "as any|as unknown as" packages/bridge/src` → fail build se match.
5. `tsconfig strict: true` + `noImplicitAny: true` + `noUncheckedIndexedAccess: true` come gia in agent-x9 `tsconfig.base.json:11`.

**Phase**: P0-Skeleton (lint config), CROSS
**Severity**: HIGH

---

### P-10 — Tipi interni di X9 over-broadcasting nel bridge

**Sintomi / warning signs**
- Bridge cresce a 40+ file, molti non referenziati da Forge
- `SessionStore`, `QdrantClient`, `CapabilityResolver` esportati dal bridge
- Dependency graph: bridge che importa peer inutili (es. `@qdrant/js-client`)
- Bundle size: bridge dichiarato "compile-time only" pesa 500KB

**Meccanismo**
Il pattern "ho gia i tipi qui, li metto nel bridge" porta a risucchiare tipi interni. Se X9 esporta `Session`, qualcuno ce lo mette perche "forse un giorno Forge vuole leggere le sessioni". Forge non lo usa mai, ma il tipo e la. Dopo 6 mesi il bridge ha tipi di dominio di X9 che non c'entrano nulla col cross-repo contract. Il bridge perde focus.

**Prevenzione (actionable)**
1. **Inclusion rule** esplicita nel README bridge: "un tipo entra SE E SOLO SE e usato da entrambi i repo o da un endpoint cross-repo". Lista dei tipi esistenti in un file `.contract-scope.md`.
2. Script CI `scripts/check-cross-usage.ts`: per ogni export del bridge, verifica con `ts-morph` che sia importato da **entrambi** `agent-x9` e `forge-v2`. Se solo uno → warning (orfano).
3. Barrel `src/index.ts` scritto a mano, non auto-generato. Auto-index tende a includere tutto.
4. Review PR: owner del bridge (assegnato) fa gate sugli add.

**Phase**: P0-Skeleton (inclusion rule), P4-Cleanup (check-cross-usage)
**Severity**: HIGH

---

### P-11 — Branded types senza controllo runtime

**Sintomi / warning signs**
- Type `AgentId = string & { __brand: 'AgentId' }` usato ovunque ma creato con `x as AgentId` sparso
- Runtime accetta qualsiasi stringa, incluso `""`, emoji, SQL injection
- Qualcuno tratta `TenantId` e `AgentId` come intercambiabili perche sono entrambi branded string

**Meccanismo**
Branded type in TypeScript e solo una fiction del compilatore. Senza costruttore che **valida a runtime** (regex, length, uuid format), l'utilita si limita a "non scambiare due string per sbaglio". Ma quando la branded string viene creata con cast, anche quel beneficio e zero.

**Prevenzione (actionable)**
1. Ogni branded type esporta:
   - Il tipo: `type AgentId = string & { __brand: 'AgentId' }`
   - Il costruttore: `function asAgentId(s: string): AgentId { AgentIdSchema.parse(s); return s as AgentId; }`
   - Il Zod schema: `const AgentIdSchema = z.string().uuid().brand<'AgentId'>()`
2. ESLint rule custom: cast `as AgentId` fuori dal file `agent-id.ts` → error. Solo `asAgentId()` permesso.
3. Mai branded troppo aggressivo su cose che passano a librerie esterne (es. URL string per `fetch()`). Regola: brandi i tuoi identificatori di dominio, non i primitivi.
4. `VaultTier` usa **literal union** (`'platform' | 'owner' | 'agent'`), non brand, perche TS moderno gestisce literal meglio degli enum (vedi P-13).

**Phase**: P2-Vault (AgentId, TenantId branded)
**Severity**: HIGH

---

### P-12 — Circular dependency via barrel export

**Sintomi / warning signs**
- `madge --circular src/` mostra cicli
- Tree-shaking non funziona, bundle consumer include tutto il bridge
- Tempi di build TS crescono non linearmente col numero di file
- Errori `Cannot access 'X' before initialization` a runtime

**Meccanismo**
Pattern comune: `src/index.ts` che fa `export * from './a'; export * from './b'; ...`. Se `a.ts` importa da `index.ts` (shortcut), c'e ciclo. Barrel monolitico anche uccide tree-shaking: webpack/rollup non puo eliminare gli export inutilizzati se tutto passa dall'index.

**Prevenzione (actionable)**
1. **Sub-barrel** per dominio: `src/http/index.ts`, `src/vault/index.ts`, `src/model/index.ts`, ciascuno standalone. L'`index.ts` top-level re-esporta i sub-barrel, ma ogni file interno importa dai sub-barrel o dai file diretti, mai dal top.
2. `package.json` `"exports"` field:
   ```json
   "exports": {
     ".": "./dist/index.js",
     "./http": "./dist/http/index.js",
     "./vault": "./dist/vault/index.js",
     "./model": "./dist/model/index.js"
   }
   ```
   Consumer possono fare `import { VaultEntry } from '@x9-forge/contracts/vault'` per tree-shake.
3. `madge --circular` in CI, fail su ciclo.
4. ESLint rule `import/no-self-import` + `import/no-cycle`.

**Phase**: P0-Skeleton (struttura sub-barrel + exports), CROSS
**Severity**: HIGH

---

### P-13 — Enum TypeScript vs literal union: comportamento diverso cross-version

**Sintomi / warning signs**
- `ModelTier.STANDARD` funziona in dev, fallisce in build prod perche `isolatedModules: true`
- Comparison `tier === 'standard'` funziona in un repo, non nell'altro
- Enum non serializzabile in JSON (diventa numero se numeric enum)

**Meccanismo**
TypeScript enum ha comportamento runtime (oggetto reale) e tipo, ma ha quirk: enum `const` non si comporta come enum normale, enum numerico serializza a numero, enum string piu sicuro ma non ordinabile. In un package condiviso cross-version, differenze nei `tsconfig` dei consumer possono rendere l'enum non interoperabile. Forge `tsconfig:2` non imposta `isolatedModules`, agent-x9 probabilmente si.

**Prevenzione (actionable)**
1. **Mai enum**, sempre literal union:
   ```ts
   export const ModelTiers = ['standard', 'advanced', 'reasoning'] as const;
   export type ModelTier = typeof ModelTiers[number];
   export const ModelTierSchema = z.enum(ModelTiers);
   ```
2. `as const` sistematico per oggetti costanti (`VAULT_TIERS`, `INTERNAL_HEADERS`).
3. `tsconfig.base.json` del bridge imposta `isolatedModules: true`, `verbatimModuleSyntax: true` → forza consumer a seguire stesso pattern.
4. Ordering (per `ModelTier` ordered): esporta funzione `compareTiers(a, b)` o `TIER_ORDER: Record<ModelTier, number>`, non basarsi sull'ordine dell'enum.

**Phase**: P0-Skeleton (convenzione), P3-Model (ModelTier canonical)
**Severity**: HIGH

---

### P-14 — `exactOptionalPropertyTypes` asimmetrico tra bridge e Forge

**Sintomi / warning signs**
- Bridge usa `foo?: string` con `exactOptionalPropertyTypes: true`, rifiuta `{ foo: undefined }`
- Forge (che NON ha `exactOptionalPropertyTypes` — vedi `forge-v2/packages/types/tsconfig.json:10`, manca la flag) passa `{ foo: undefined }` al bridge, compila senza errori nel proprio repo, fallisce quando il bridge prova a `Schema.parse(input)` con `.strict()`
- Build green in Forge, errore TS se lo stesso file e aperto in VSCode con tsconfig del bridge

**Meccanismo**
agent-x9 `tsconfig.base.json:13` ha `exactOptionalPropertyTypes: true`. Forge `packages/types/tsconfig.json:10` **non l'ha impostato**. I due consumer hanno semantica diversa di "campo opzionale". Il bridge deve scegliere, e la scelta impatta entrambi.

**Prevenzione (actionable)**
1. Bridge `tsconfig.json` eredita le flag piu strict di X9: `exactOptionalPropertyTypes: true`, `noUncheckedIndexedAccess: true`, `strict: true`, `noImplicitOverride: true`.
2. Forge deve **allineare** il proprio tsconfig al bridge prima di importare (o accettare il vincolo). Documentato in migration guide: "prima di migrare un contratto a Forge, verifica tsconfig allineato."
3. Zod schema usa `.strict()` per rifiutare campi extra, ma accetta `undefined` solo se il tipo e esplicitamente `.optional()`. Shape chiaro: `foo: z.string().optional()` → tipo `foo?: string` (NON `foo: string | undefined`).
4. Convenzione: campi davvero opzionali usano `?`, campi nullable usano `| null` esplicito. Mai misto.

**Phase**: P0-Skeleton (tsconfig canonical), documentare in README migration
**Severity**: HIGH

---

### P-15 — Hoisting pnpm rompe la risoluzione del bridge in Docker multi-stage build

**Sintomi / warning signs**
- `docker build` su X9 stage fallisce: `Cannot find module '@x9-forge/contracts'`
- Locale funziona, CI funziona, Docker fallisce
- `pnpm --frozen-lockfile` in Dockerfile non installa il workspace linkato
- `node_modules/.pnpm/` vuoto o incompleto nell'immagine finale

**Meccanismo**
Docker multi-stage classicamente copia `package.json + pnpm-lock.yaml`, fa `pnpm install --frozen-lockfile`, poi copia il codice. Ma se il bridge e workspace:*, l'install cerca il package che non esiste ancora nel container. Serve copiare **prima** anche `packages/bridge/package.json` + `packages/bridge/src/` (o gia built `dist/`). Facile dimenticarlo.

**Prevenzione (actionable)**
1. Dockerfile pattern corretto: `COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./` + `COPY packages/bridge/package.json packages/bridge/` (ripeti per ogni pkg) + `pnpm fetch --prod` + `pnpm install --frozen-lockfile --offline` + `COPY . .` + `pnpm -F bridge build` + `pnpm -F x9 build`.
2. Usa `pnpm deploy --legacy --prod /opt/x9` in final stage: estrae solo quello che serve, con dipendenze risolte.
3. Se pubblicato npm privato: Dockerfile non cambia (`pnpm install` risolve da registry), ma serve `.npmrc` con token. Usa Docker secret, mai ENV (leak layer).
4. CI step: `docker build` su ogni PR del bridge o consumer. Se build fail → merge block.

**Phase**: STACK (decisione bridge distribution), P1-HTTP (prima dockerizzazione con bridge)
**Severity**: HIGH

---

### P-16 — Cross-repo integration test mancanti: bridge green, consumer rotti

**Sintomi / warning signs**
- Test unit bridge 100% green
- PR del bridge merged, 24h dopo deploy X9 o Forge rompe
- Post-mortem: "il tipo era corretto, ma l'endpoint rispondeva diversamente"
- Nessuno ha mai girato Forge + X9 insieme con il nuovo bridge prima del merge

**Meccanismo**
Il bridge e type-only in compile time, ma i contratti descrivono comportamento HTTP runtime. Un rename di campo puo essere refactored nel bridge e in un consumer, ma se l'altro consumer non viene rebuildato contro il nuovo bridge, l'incongruenza appare solo in integration. Test unit del bridge non toccano mai la rete.

**Prevenzione (actionable)**
1. Test pyramid esplicito (vincolo 2 mandate):
   - **Unit**: schema Zod parse fixture → ok/fail (dentro bridge)
   - **Integration consumer-side**: agent-x9 gira con bridge linkato, chiama endpoint mock, verifica shape (dentro X9 CI)
   - **Contract test cross-repo**: docker compose up X9+Forge+DB, curl end-to-end degli 11 endpoint, parse risposta con bridge schema, deve passare (dentro bridge CI o repo orchestration)
2. CI del bridge pubblica tag pre-release `1.x.x-rc.N`, job downstream in agent-x9 e forge-v2 che puntano a quella rc, se green → promote stable.
3. Ogni PR sul bridge include **almeno** uno smoke test che prova import dai due consumer (mock repo `__tests__/consumer-x9` e `__tests__/consumer-forge` con 5 righe di codice ciascuno, `tsc --noEmit` deve passare).
4. Staging dedicated: VPS staging con Forge + X9 entrambi puntati a bridge `main` branch, smoke test automatico ogni notte.

**Phase**: CROSS, P0-Skeleton (pre-release CI), P1-HTTP in poi
**Severity**: HIGH

---

### P-17 — Release non atomico: bridge publish OK, consumer update fallisce, prod su versione vecchia

**Sintomi / warning signs**
- `pnpm publish` bridge v1.3 ok
- PR consumer fallisce (lint, CI flake)
- v1.3 usato solo in dev, prod resta su v1.2
- Dopo 1 mese nessuno ricorda perche v1.3 e orfana

**Meccanismo**
Release del package != merge nei consumer. Se la pipeline non tratta i tre repo come una singola deploy unit, succede. Pattern comune: publish bridge, nessuno aggiorna consumer, drift cresce.

**Prevenzione (actionable)**
1. Regola: **non pubblicare** una versione del bridge senza PR consumer ready. L'ordine e: (a) PR bridge, (b) PR X9 che bumpa, (c) PR Forge che bumpa — tutti aperti contemporaneamente, linkati tra loro, merged nell'ordine bridge → consumer.
2. GitHub Actions script `scripts/check-consumer-prs.ts` che, su merge bridge, verifica esistano PR aperte nei due consumer che fanno riferimento al bridge PR. Se no, open issue automatica.
3. Out of scope v1 (PROJECT.md) = CI/CD publish automatico **accettato**, ma non esenta da coordinamento manuale disciplinato in questa fase.
4. "Bridge dashboard" README con matrice `bridge version` × `x9 version` × `forge version`, aggiornata a ogni release, single source of truth visibile.

**Phase**: CROSS (policy), post-v1 (automazione CI/CD out of scope v1)
**Severity**: HIGH

---

### P-18 — CapabilityRegistryEntry divergence: scegliere il lato sbagliato come canonical

**Sintomi / warning signs**
- Decidere `host + port + version` (Forge) come canonical, X9 deve cambiare ogni uso di `endpoint` URL
- O viceversa: `endpoint` canonical, ma Forge perde granularita che usa per altre cose (es. health check loop su port)
- Dopo decisione: 30+ file modificati in un solo repo, grosso PR atomico che Stefano non puo review facilmente
- Rollback doloroso

**Meccanismo**
X9 usa `endpoint: "http://localhost:3001"` come URL completo. Forge v2 ha `host, port, version` separati perche fa cose tipo "chiama health su http://{host}:{port}/health". Entrambi validi. La scelta del canonical ha cost asimmetrico: quale consumer ha piu call-site?

**Prevenzione (actionable)**
1. **Research findings specifico**: grep su entrambi i repo per misurare call site:
   - `grep -rn "\.endpoint" agent-x9/packages` vs `grep -rn "\.host\|\.port\|\.version" forge-v2/packages`
   - Contare usi reali, decidere canonical su dato empirico, non su preferenza
2. Canonical shape = quello con meno call site da modificare, PIU un **helper function** nel bridge che derivi l'altro:
   ```ts
   type CapabilityRegistryEntry = { host: string; port: number; version: string; /* canonical */ };
   export function toEndpointUrl(e: CapabilityRegistryEntry): string { return `http://${e.host}:${e.port}`; }
   ```
3. Deprecation path: il consumer che perde lo shape nativo usa l'helper, tipo legacy diventa getter.
4. Schema migration per registry.json sul disco (analogo a P-06 per credentials).

**Phase**: P1-HTTP
**Severity**: HIGH

---

### P-19 — VaultTier letterale usato come stringa in query Drizzle: perdita type safety

**Sintomi / warning signs**
- Query `db.select().from(vault).where(eq(vault.tier, 'platfrom'))` → typo non catchato, 0 risultati, logica fail silent
- Drizzle `tier` column definita come `varchar` generica, non `enum`, quindi qualsiasi string passa
- Dopo rename `platform` → `global`, query con literal vecchia ancora nel codice

**Meccanismo**
Il bridge tipizza `VaultTier = 'platform' | 'owner' | 'agent'` bene in TS. Ma quando va in Drizzle `pgEnum` o `varchar`, la connessione tra tipo TS e colonna DB si rompe se non esplicita. Una query scritta a mano con literal string non passa dal tipo.

**Prevenzione (actionable)**
1. Drizzle: usa `pgEnum('vault_tier', ['platform', 'owner', 'agent'])` e importa l'enum dal bridge:
   ```ts
   import { VaultTiers } from '@x9-forge/contracts/vault';
   export const vaultTierEnum = pgEnum('vault_tier', VaultTiers);
   ```
   Unica source of truth e il bridge.
2. Wrapper helper: `function withTier(t: VaultTier) { return eq(vault.tier, t); }`. Query usano helper, non literal.
3. ESLint rule custom: string literal `'platform'|'owner'|'agent'` dentro file `.repo.ts` o `.query.ts` → warning, suggerisci `VaultTier` import.
4. Test integration che verifica: dato un `VaultTier` valido, query ritorna entry; dato un tier invalido, Drizzle (o prima Zod) rifiuta.

**Phase**: P2-Vault
**Severity**: HIGH

---

## Pitfall MEDIUM

### P-20 — Bridge bypassato dai nuovi contratti (defection)

**Sintomi / warning signs**
- 6 mesi dopo il v1, un dev X9 aggiunge un nuovo endpoint e definisce i tipi localmente in `agent-x9/packages/types/`
- Forge team fa lo stesso, tipi duplicati ri-appaiono
- Count: "nuovi contratti post-bridge-v1 = 5, di cui nel bridge = 2"
- Ritorno alla situazione pre-Bug #15 per i nuovi contratti

**Meccanismo**
Il bridge funziona per i contratti che ha, ma non si auto-popola. Senza policy esplicita e review discipline, i nuovi contratti nascono dove e piu comodo, che e sempre il repo locale. Il bridge diventa museo di contratti storici, non strumento vivo.

**Prevenzione (actionable)**
1. **CONTRIBUTING.md** nel bridge con sezione "When to add a contract here" + flowchart decisionale: e cross-repo? si → bridge. e solo uno? no → repo locale.
2. Review bot GitHub: PR su agent-x9 o forge-v2 che aggiungono tipi in `packages/types/src/` flaggata automaticamente, richiede checkbox "ho verificato che non appartiene al bridge".
3. Metrica regolare: count di tipi in `bridge/src` vs `agent-x9/packages/types/src` vs `forge-v2/packages/types/src`, plotted a ogni milestone. Se X9 o Forge crescono molto piu del bridge → alert.
4. Owner assegnato al bridge (Stefano o dev designato). PR a tipi cross-repo nei consumer pinga owner.

**Phase**: CROSS (CONTRIBUTING + policy), P4-Cleanup (metric automation)
**Severity**: MEDIUM

---

### P-21 — Semver in package privato: ambiguita semantica

**Sintomi / warning signs**
- "E major bump o minor?" — discussione ricorrente sui PR
- `v1.0.0` vs `v0.1.0` — non chiaro quando promuovere
- Pin exact `1.2.3` vs range `^1.0.0` usato a caso

**Meccanismo**
Semver e convenzione, non legge fisica. In package pubblico c'e pressione da consumer esterni. In package privato con 2 consumer interni la convenzione puo derivare. Senza disciplina: "e un fix interno, minor ok" su un rename field che rompe tutto.

**Prevenzione (actionable)**
1. **Regole esplicite** in CONTRIBUTING.md:
   - **Major**: rimozione/rename campo, cambio tipo (string → object), cambio semantico (enum aggiunto ordering)
   - **Minor**: aggiunta campo opzionale, nuovo endpoint type, nuovo helper function
   - **Patch**: JSDoc, fix interno a helper, fix Zod schema per matchare tipo gia corretto
2. **Changesets** tool (`@changesets/cli`) obbligatorio: ogni PR include `.changeset/*.md` con type (major/minor/patch) + descrizione. CI fail se manca.
3. Release automatizzato via changesets: genera CHANGELOG, bumpa version, pubblica. Riduce human error.
4. Consumer pinano **exact** versione in `dependencies`. Aggiornamento via PR esplicita, mai via `^` drift.

**Phase**: P0-Skeleton (changesets setup), CROSS
**Severity**: MEDIUM

---

### P-22 — Migration guide mancante per consumer

**Sintomi / warning signs**
- Bridge major v2.0.0 rilasciato, Forge dev chiede "cosa devo cambiare?" su Slack
- README aggiornato al nuovo shape ma senza before/after
- 3 giorni di refactor perso in debug invece di applicare migration meccanica

**Meccanismo**
Il bridge evolve, consumer devono seguire. Senza migration guide leggibile, ogni dev ricostruisce la migration ad-hoc. Tempo perso scala col numero di consumer e frequenza breaking.

**Prevenzione (actionable)**
1. Ogni PR con changeset type=major include `docs/migrations/vX.Y.Z.md` con:
   - Motivazione breaking
   - Diff before/after su tipi
   - Codemod script se possibile (`jscodeshift` o ts-morph)
   - Checklist step-by-step per consumer
2. README ha indice `Migration Guides` sempre visibile.
3. CI check: changeset type=major senza file in `docs/migrations/` → fail.

**Phase**: CROSS, P4-Cleanup
**Severity**: MEDIUM

---

### P-23 — Ownership ambigua: terra di nessuno

**Sintomi / warning signs**
- PR sul bridge resta open 2 settimane
- Nessuno risponde a issue
- Dev sotto pressione bypassano il bridge "perche non voglio aspettare la review"

**Meccanismo**
Pattern classico dei shared package. Tutti ne beneficiano, nessuno ne e responsabile. L'owner e "il team", che significa nessuno.

**Prevenzione (actionable)**
1. **Owner designato** (GitHub CODEOWNERS `* @stefano`). Tempo di review SLA: 48h.
2. Rotation se il carico e alto: ownership trimestrale, documentato.
3. Se owner non puo revieware in 48h, fallback: merge con 1 approve da qualunque altro maintainer, post-merge review.
4. Documenta in README: "The bridge is owned by X. Questions: tag @X on GitHub."

**Phase**: P0-Skeleton (CODEOWNERS), CROSS
**Severity**: MEDIUM

---

### P-24 — File barrel che rompe tree-shaking e amplifica bundle consumer

**Sintomi / warning signs**
- Forge web bundle cresce di 200KB dopo import bridge
- Import di un solo tipo `VaultEntry` trascina tutto il package
- `webpack-bundle-analyzer` mostra intero bridge nell'output anche in rotte che non lo usano

**Meccanismo**
Variante di P-12 ma piu sottile: il bridge puo essere compile-time only per tipi, ma se include Zod schema (runtime), import `* from bridge` trascina tutti gli schemi. Se il barrel non separa tipi da schemi, il consumer front-end paga.

**Prevenzione (actionable)**
1. Dual export: `@x9-forge/contracts/types` (solo type, tree-shakeabile, zero runtime) e `@x9-forge/contracts/schemas` (Zod, opzionale).
2. `package.json` `"sideEffects": false` per indicare tree-shake safe.
3. Consumer front-end Forge importa solo da `/types` dove possibile; back-end che valida importa da `/schemas`.
4. Tipi `import type { ... } from '@x9-forge/contracts'` sempre, per massimizzare tree-shake.

**Phase**: P0-Skeleton (dual export), CROSS
**Severity**: MEDIUM

---

### P-25 — Naming asimmetrico env var documentato ma non tipizzato

**Sintomi / warning signs**
- X9 usa `INTERNAL_SECRET`, Forge lo manda come `X9_INTERNAL_SECRET` — documentato in PROJECT.md Context, ma nessun file bridge riflette la mappatura
- Nuovo dev X9 legge `process.env.INTERNAL_SECRET`, nuovo dev Forge legge `process.env.X9_INTERNAL_SECRET`, entrambi pensano sia "lo stesso" ma scrivono codice che non lo e
- Bug simile a #15 ma su env var — header ok, ma l'env var letto da un lato e `undefined`

**Meccanismo**
Il research mandate (Out of Scope) ha esplicitamente scartato il rename. Ma tipizzare senza rinominare e possibile: il bridge esporta costanti con entrambi i nomi, documentando la relazione.

**Prevenzione (actionable)**
1. Bridge esporta `EnvVarNames` oggetto:
   ```ts
   export const EnvVarNames = {
     INTERNAL_SECRET: { x9: 'INTERNAL_SECRET', forge: 'X9_INTERNAL_SECRET' },
     VOICE_REGISTER: { x9: 'FORGE_VOICE_REGISTER_TOKEN', forge: 'VOICE_REGISTER_TOKEN' /* legacy: INTERNAL_SERVICE_TOKEN */ },
   } as const;
   ```
2. Helper `readEnv(side: 'x9'|'forge', key: keyof EnvVarNames): string | undefined`. Consumer chiamano l'helper, bridge sa quale env var leggere.
3. Zod schema per env al boot: `EnvSchema.parse(process.env)` fallisce fast se manca. Schema usa i nomi corretti per side.
4. JSDoc link tra i due nomi in modo che "vai a definizione" mostri entrambi.

**Phase**: P1-HTTP (env vars entrano con gli 11 endpoint contracts)
**Severity**: MEDIUM

---

### P-26 — Esposizione di secret shape nei tipi

**Sintomi / warning signs**
- `type AgentCredentials` stampato in log errore → chiave completa leaked
- Zod error message include il valore rejected, non solo il path
- Sentry breadcrumb mostra `OPENAI_API_KEY: 'sk-proj-abc...'`

**Meccanismo**
Tipizzare le credenziali (P2-Vault) e normalizzare, ma il tipo in se non protegge da stampa. Un `console.error(credentials)` stampa tutto. Zod di default include il valore invalido nell'errore.

**Prevenzione (actionable)**
1. Branded string per secret: `type Secret = string & { __brand: 'Secret' }` con `toString()` override che ritorna `'[REDACTED]'`.
2. Zod schema custom con `.transform()` che non espone valore in errore: `z.string().min(10).catch(() => { throw new Error('Invalid secret (value redacted)'); })`.
3. Sentry denylist (X9 Phase 32-A gia ha pattern) esteso per includere i nomi dei campi credentials del bridge. Bridge esporta `SECRET_FIELD_NAMES` per configurazione denylist.
4. Custom logger wrapper che intercetta field names da `SECRET_FIELD_NAMES` e sostituisce con `[REDACTED]`.

**Phase**: P2-Vault
**Severity**: MEDIUM

---

### P-27 — Drift tra contratti e implementazione effettiva (snapshot invecchiato)

**Sintomi / warning signs**
- Bridge dice `/internal/turn` risponde con `{ reply: string, sessionId: string }`
- X9 risponde con `{ reply: string, sessionId: string, tokenUsage: { ... } }` (campo aggiunto in Phase 30 senza toccare bridge)
- Forge non sa di `tokenUsage` perche il tipo dice che non c'e, non lo usa
- Feature di analytics tokenUsage mai wired

**Meccanismo**
Il bridge e snapshot al momento del typing. L'implementazione evolve. Senza **enforcement** che il bridge sia aggiornato quando l'endpoint cambia, drift e inevitabile.

**Prevenzione (actionable)**
1. **Test contract cross-repo** (vincolo 2 mandate) girano in CI di X9 e Forge. Se X9 cambia risposta, test Forge fallisce perche shape != bridge.
2. Schema-first workflow: per modificare un endpoint, PR tocca il bridge **prima** dell'implementazione consumer. Impl senza bridge update = review block.
3. Snapshot fixture: `__fixtures__/endpoint-responses/internal-turn.json` sample reale, Zod parse deve passare sullo schema corrente. Aggiornamento fixture e parte del PR.
4. Periodico (mensile): grep `fetch|axios|got` nei due repo, confronta URL con lista bridge. Endpoint non tipizzati → issue.

**Phase**: CROSS, P1-HTTP
**Severity**: MEDIUM

---

## Pitfall LOW

### P-28 — README del bridge che invecchia

**Sintomi / warning signs**
- README dice "11 contratti tipizzati", realta 15
- Link a file `file:line` rotti dopo refactor
- Esempi di codice non compilano contro ultima versione

**Meccanismo**
Ovvio ma pervasivo. README e "free text", non validato.

**Prevenzione (actionable)**
1. README include snippet `<!-- auto-generated -->` sezioni rigenerate da script (`scripts/update-readme.ts` che legge `src/` e popola la tabella dei contratti).
2. `remark-validate-links` + `markdown-link-check` in CI per link interni.
3. Esempi di codice in markdown estratti in file `.ts` reali compilati da `tsc`.
4. DoD (vincolo 6 mandate) gia impone update README su migration → rinforzare con lint.

**Phase**: P0-Skeleton (script autogen), CROSS
**Severity**: LOW

---

### P-29 — JSDoc con info obsolete (commenti che non vengono aggiornati)

**Sintomi / warning signs**
- JSDoc dice "used by X9 /webhook/post-call", endpoint rimosso
- `@example` con code che non compila
- `@see <link>` a issue chiusa e obsoleta

**Meccanismo**
Commenti degradano. Nessuno li verifica automaticamente.

**Prevenzione (actionable)**
1. JSDoc minimale: descrivi **cosa**, non **dove si usa** (cambia).
2. `@example` estratti come doctest: `tsx --test src/*.ts` estrae `@example` e compila.
3. Link solo a file stabili (es. README sezioni), mai a PR o issue.

**Phase**: CROSS
**Severity**: LOW

---

### P-30 — Type ergonomics: simboli too long o too cryptic

**Sintomi / warning signs**
- Nome tipo `X9ForgeInternalPostCallWebhookRequestV2` lungo 50 caratteri
- Oppure `TCR` troppo corto, nessuno sa cosa significa
- Autocomplete IDE spam di varianti

**Meccanismo**
Naming convention incoerente → UX pessima per consumer.

**Prevenzione (actionable)**
1. Convention documentata: `<Domain><EntityName>` (es. `VaultEntry`, `AgentCredentials`, `ModelPolicy`). No prefissi `X9`, `Forge` sul tipo stesso — se e nel bridge e gia cross-repo.
2. Suffisso `Request`/`Response` per HTTP shapes (`ToolCallRequest`, `ToolCallResponse`).
3. Suffisso `Schema` per Zod (`VaultEntrySchema`).
4. Lunghezza max 30 char, enforced da lint custom o review.

**Phase**: P0-Skeleton (naming convention)
**Severity**: LOW

---

## Phase-Specific Warnings

| Phase | Pitfall principale | Mitigation primaria |
|-------|---------------------|---------------------|
| STACK decision (pre-P0) | P-04 (version drift), P-15 (hoisting Docker) | Decisione esplicita tra pnpm workspace unificato / npm privato / submodule, con pro/contro scritti |
| P0-Skeleton | P-01 (loop shim), P-02/P-03 (Zod sync), P-09 (no any), P-12 (barrel), P-13 (no enum), P-14 (exactOptional), P-21 (changesets), P-23 (ownership), P-28 (README autogen), P-30 (naming) | Tooling + lint + convenzioni stabiliti ORA per tutto il progetto |
| P1-HTTP (11 endpoint) | P-02 (Zod boundary), P-18 (CapabilityRegistryEntry canonical), P-25 (env var asymmetry), P-27 (snapshot drift) | Contract test green prima di toccare ogni endpoint, grep per misurare call site prima di decidere canonical |
| P2-Vault | P-06 (AgentCredentials migration), P-07 (AES encrypted vs plain), P-11 (branded AgentId), P-19 (VaultTier in Drizzle), P-26 (secret redaction) | Migration script idempotente + VPS snapshot + dual schema encrypted/plain + branded secret |
| P3-Model | P-08 (breaking durante Phase 35), P-13 (ModelTier ordering) | Freeze contrattuale dopo P3, prototipo 4-mani con chi implementa Phase 35, literal union per ModelTier |
| P4-Cleanup | P-01 (madge verify), P-05 (contract step atomic), P-10 (orphan exports) | Madge CI, expand-contract discipline, script check-cross-usage |
| CROSS (vincoli permanenti) | P-05, P-16, P-17, P-20, P-22, P-23, P-27 | CODEOWNERS, changesets, cross-repo integration test, CONTRIBUTING, migration guide, SLA review 48h |

---

## Riferimenti a Bug #15 e altri modi in cui poteva andare peggio

**Bug #15 ricordato:** 2026-04-11, `/webhook/post-call` aggiunto header required `X-Internal-Token` in X9 Phase 21.1, Forge non aggiornato, 401 silent in produzione. Il bridge avrebbe reso il TS di Forge rosso.

**Modi in cui sarebbe potuto essere peggio:**

1. **Invece di 401, payload accettato con campo silently missing** → X9 avrebbe processato turn con `userId: undefined` e scritto in memoria sbagliata (leak cross-agent). Vedi P-02 (compile vs runtime) + P-11 (branded userId).
2. **Invece di header, rename del campo `userId` → `user_id`** nel body → Forge manda `userId`, X9 legge `user_id`, sessione perso ma turn eseguito su nuovo utente fantasma. Vedi P-05 (expand-contract) + P-18 (canonical shape).
3. **Invece di un endpoint, AgentCredentials flat → discriminated senza migration** → X9 reload crash, produzione down, nessun rollback perche migration non testata. Vedi P-06 (migration path critico).
4. **Breaking durante Phase 35 in corso** → Model Router non parte, deadlock tra refactor bridge e impl X9. Vedi P-08 (freeze contrattuale).
5. **Branded `EncryptedBlob` dimenticato** → log stampa vault value cifrato, o peggio, decifrato dal bridge e loggato in chiaro. Vedi P-07 + P-26.

Il Bug #15 originale e **il caso piu semplice**. I pitfall sopra sono modi in cui il bridge fatto male diventa worse-than-status-quo.

---

## Sources

- **Training data + verifica incrociata con:**
  - `agent-x9/tsconfig.base.json:13` — exactOptionalPropertyTypes: true
  - `forge-v2/packages/types/tsconfig.json:10` — exactOptionalPropertyTypes: NOT set (asimmetria verificata)
  - `.planning/PROJECT.md` — 8 vincoli research mandate + gap analysis
  - `README.md` bridge — Bug #15 context + architettura
  - `MEMORY.md` — ref_x9_forge_contracts.md, project_shared_types_package_idea.md, feedback_architectural_quality.md, feedback_atomic_commits_rollback.md
- [TypeScript Performance — Project References](https://github.com/microsoft/TypeScript/wiki/Performance) (pattern per P-12, P-15)
- [pnpm — injected dependencies](https://pnpm.io/package_json#dependenciesmetainjected) (P-04)
- [Zod — branding and refinement](https://zod.dev/?id=brand) (P-11, P-26)
- [Changesets](https://github.com/changesets/changesets) (P-21, P-22)
- [Madge circular dependency detection](https://github.com/pahen/madge) (P-01, P-12)
- [TypeScript — why avoid enums](https://www.typescriptlang.org/docs/handbook/enums.html#objects-vs-enums) (P-13)

**Confidence:** MEDIUM-HIGH — i pattern sono noti in ecosistema TS monorepo. Alta confidenza su P-01/P-02/P-04/P-06/P-07/P-08/P-18/P-19 perche ancorati a codice verificato dei due repo. Media confidenza su pitfall di processo (P-20/P-22/P-23) che dipendono da discipline umana non tech-enforced.
