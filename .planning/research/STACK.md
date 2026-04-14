# Stack Research — x9-forge-contract-bridge

**Domain:** Pacchetto TypeScript di contratti condivisi cross-repo (compile-time types + opzionale runtime validation), distribuito tra due pnpm monorepo separati (`agent-x9`, `forge-v2`) residenti in directory sorelle su disco, senza publish su npm pubblico.
**Researched:** 2026-04-14
**Confidence complessiva:** HIGH

---

## 1. Verdetto raccomandato (one-liner)

**Pacchetto TypeScript + Zod v4 come single source of truth, distribuito ai due consumer via `pnpm add git+ssh://...#<commit-sha>` con `prepare` build hook. In locale override via `pnpm.overrides` + `link:` protocol verso la directory sorella, per feedback loop istantaneo.**

Nessun registry, nessun submodule, nessun tool esotico. Solo meccanismi nativi di pnpm e git gia usati nei due consumer.

---

## 2. Recommended Stack

### 2.1 Core Technologies

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **TypeScript** | `^6.0.2` | Source language + compile-time type checking cross-repo | Gia allineato con X9 (6.0.2) e da allineare in Forge (oggi 5.9.3 → bump a 6.0.2). Strict mode + `moduleResolution: NodeNext` obbligatorio. |
| **Zod** | `^4.0.0` | Single source of truth: schema → tipo via `z.infer` → runtime validation al boundary HTTP | X9 gia usa zod@4; Forge `@forge/types` non usa zod (devDep), ma le services hanno zod@3 → v1 del bridge **forza upgrade Forge a zod@4** (breaking ma limitato, gia in roadmap). Evita drift tipi/runtime. |
| **pnpm** | `^10.33.0` | Package manager + workspace resolver nei due consumer. Supporta install da git URL con commit SHA. | Gia lo standard in X9 e Forge. `workspace:*` per link interno, `git+...#sha` per cross-repo. |
| **Node.js** | `>=22.0.0` | Runtime engine target (nessun runtime code nel bridge, ma package.json `engines` lo dichiara per coerenza con i consumer) | Allineato con X9 e Forge. |

### 2.2 Distribuzione cross-repo (il cuore della scelta)

| Meccanismo | Versione | Purpose | Why |
|------------|---------|---------|-----|
| **pnpm install da git URL** | pnpm `^10` nativo | X9 e Forge aggiungono il bridge come dependency pinnata su un commit SHA: `"@x9-forge/contracts": "git+ssh://git@github.com/<owner>/x9-forge-contract-bridge.git#<sha>"` | Zero infrastruttura. Pin immutabile per SHA (non per tag mobile). Nessun registry da mantenere. pnpm risolve, clona, builda via `prepare` hook, cache sotto `~/.pnpm-store`. |
| **`prepare` script nel bridge** | npm/pnpm nativo | Esegue `tsc` al momento dell'install in modo che il consumer riceva `dist/` buildato anche da un clone shallow | Standard pattern per "git-installable TypeScript package". Evita commit di `dist/` nel repo bridge. |
| **`pnpm.overrides` + `link:` protocol** | pnpm `^10` nativo | In locale, nel `package.json` root del consumer: `"pnpm": { "overrides": { "@x9-forge/contracts": "link:../x9-forge-contract-bridge" } }`. Non committato, gestito via `.pnpmrc` locale o env-specific package.json. | Feedback loop istantaneo: modifico `.ts` nel bridge, X9/Forge vedono il cambio senza re-publish ne re-install. `link:` (diverso da `file:`) usa symlink relativo. |
| **TypeScript `tsc` (no bundler)** | `^6.0.2` | Compila `src/**/*.ts` → `dist/**/*.js + *.d.ts + *.js.map` con `declarationMap` per go-to-definition cross-repo | Nessun bundler necessario (il bridge e types+schemas, non applicazione). `tsup` sarebbe overkill. `tshy` (4.1.1) valutato ma inutile per single-target ESM. |

### 2.3 Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@changesets/cli` | `^2.30.0` | Gestione changelog + version bump semver nel bridge | Da Phase 2 in poi, quando il bridge accumula > 5 contratti. Consigliato prima del primo "breaking change" reale. |
| `vitest` | `^2.x` (allineato con X9/Forge esistenti) | Unit test per schemi Zod + contract test (parse/invalidate fixture JSON reali dai log) | Obbligatorio. Test pyramid: schema tests (bridge) + build integration (X9/Forge compilano col bridge). |
| `tsx` | `^4.x` | Esecuzione rapida di script `.ts` nel bridge (es. validation di fixture da file) | Tool gia in uso nei consumer. |

### 2.4 Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `tsc --build` (project refs) | Incremental build nel bridge + composite per consumer che vogliano type-checking cross-repo senza build | `composite: true` + `declarationMap: true` nel `tsconfig.json` del bridge. Abilita go-to-definition da X9/Forge verso il codice sorgente del bridge in locale. |
| git tag semver | Release marker human-readable: `v0.1.0`, `v0.2.0` | I consumer pinnano per **SHA** (immutabile) non per tag (mobile). Il tag serve al developer per sapere "cosa sto installando". |
| `.nvmrc` | Lock Node version sul bridge | `v22` — coerenza con X9 e Forge. |

---

## 3. Installation

### 3.1 Setup iniziale nel bridge (`x9-forge-contract-bridge`)

```bash
cd /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge

# package.json minimo
pnpm init
pnpm add -D typescript@^6.0.2 @types/node@^22 vitest@^2 tsx@^4 @changesets/cli@^2.30.0
pnpm add zod@^4.0.0

# struttura
mkdir -p src tests
```

`package.json` del bridge (sketch chiave):

```jsonc
{
  "name": "@x9-forge/contracts",
  "version": "0.1.0",
  "private": false,                // MUST be false per essere installabile da git (ma mai publish)
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" },
    "./http": { "import": "./dist/http/index.js", "types": "./dist/http/index.d.ts" },
    "./vault": { "import": "./dist/vault/index.js", "types": "./dist/vault/index.d.ts" },
    "./model-router": { "import": "./dist/model-router/index.js", "types": "./dist/model-router/index.d.ts" }
  },
  "files": ["dist", "src", "README.md"],
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "prepare": "tsc"                 // CRITICO: eseguito da pnpm dopo `pnpm add git+...#sha`
  },
  "dependencies": {
    "zod": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^6.0.2",
    "@types/node": "^22",
    "vitest": "^2",
    "tsx": "^4"
  },
  "engines": { "node": ">=22" },
  "publishConfig": { "access": "restricted" }   // safety-net: se qualcuno fa `pnpm publish` → 403
}
```

`tsconfig.json` (strict + NodeNext + composite):

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "incremental": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "tests"]
}
```

### 3.2 Consumer setup — X9 e Forge (una tantum)

Sul primo consumo reale, nel `package.json` del servizio (es. `agent-x9/services/agent-core/package.json`):

```jsonc
{
  "dependencies": {
    "@x9-forge/contracts": "git+ssh://git@github.com/<owner>/x9-forge-contract-bridge.git#<commit-sha>"
  }
}
```

Poi nel `package.json` ROOT di ciascun consumer (NON committare il blocco overrides, usare `.pnpmfile.cjs` o env-specific flag), per il development locale:

```jsonc
{
  "pnpm": {
    "overrides": {
      "@x9-forge/contracts": "link:../x9-forge-contract-bridge"
    }
  }
}
```

NOTE operative:
- In CI (GitHub Actions / deploy VPS) l'`overrides` locale NON deve essere presente — si risolve al git SHA pinnato.
- Soluzione raccomandata: override committato in un file `package.local.json` o via `pnpm install --config.override-from-file` — oppure piu semplicemente via **uno script di bootstrap** `pnpm run bridge:link` che mette/leva l'override.

---

## 4. Alternatives Considered

| Recommended (git-URL + prepare) | Alternative | When to Use Alternative |
|---|---|---|
| **git-URL + `prepare` + pnpm overrides** | **A) npm private registry (GitHub Packages / Verdaccio)** | Solo quando il numero di consumer cresce a >3 e serve true semver resolution con range. Oggi costa infra (Verdaccio container 24/7 su VPS, o auth token GitHub Packages in CI) senza beneficio vs git-URL. |
| **git-URL** | **D) pnpm meta-monorepo (3 repo sotto un solo pnpm-workspace)** | Solo se Stefano accetta di perdere l'indipendenza dei 3 `.git` e di avere lockfile/CI unificato. Tradeoff enorme, contrario al design attuale (3 repo separati per ragioni di deploy e produzione). |
| **git-URL** | **F) OpenAPI codegen** | Solo se in futuro entrano consumer non-TypeScript (es. Python, Go). Oggi entrambi i consumer sono TS strict: OpenAPI aggiunge un passaggio di codegen + drift YAML↔codice senza benefici. |
| **git-URL** | **H) ts-rest** | Solo se si decide di adottare ts-rest come framework RPC nei due servizi. OGGI **bloccante**: `@ts-rest/core@3.52.1` richiede `zod@^3.22.3` peerDep e `fastify@^4` — X9 usa zod@4 + fastify@5, Forge usa fastify@5 → **incompatibilita peer-deps**. |
| **git-URL** | **Zod-only (nostra scelta) vs I) Zod as the whole stack** | Nessun "alternative" qui: Zod e PARTE della scelta raccomandata. `z.infer` per i tipi, `.parse()` runtime al boundary. |

### 4.1 Dettaglio delle opzioni — valutazione punto-per-punto

#### A) npm private registry (GitHub Packages / Verdaccio / CodeArtifact) — **RIFIUTATA**

- **Setup cost:** MEDIO-ALTO. GitHub Packages richiede PAT + `.npmrc` scope config in ogni repo + token in CI. Verdaccio richiede container 24/7 su VPS (concorre con X9 per risorse 2vCPU/8GB), backup DB, scadenze cert TLS.
- **Dev friction:** ALTA. Ogni modifica al bridge → `pnpm build` → `pnpm publish` → bump version in consumer → `pnpm install`. Ciclo 60-120s.
- **CI/CD:** richiede secret management (`NPM_TOKEN` o `GITHUB_TOKEN` con `read:packages`) in entrambe le pipeline di X9 e Forge.
- **Versioning:** EXCELLENT (semver range).
- **Runtime validation:** ortogonale.
- **Fit pnpm workspace:** buono, ma aggiunge configurazione (scoped registry resolution).
- **Migrazione incrementale:** supportata.
- **Verdetto:** overhead infra ingiustificato per 2 consumer e un autore unico (Stefano).

#### B) git submodule — **RIFIUTATA**

- **Setup cost:** BASSO.
- **Dev friction:** ALTA. Submodule e famigerato per foot-gun: `git submodule update`, commit pointer disallineato, detached HEAD, clone ricorsivo non scontato in CI. Incompatibile con la cultura "atomic commit" di Stefano (un cambio nel bridge = commit nel bridge + commit in X9 + commit in Forge).
- **Fit pnpm workspace:** MALE. Il submodule diventa una directory dentro X9/Forge, ma pnpm non la tratta come un package finche non e esplicitamente listata in `pnpm-workspace.yaml`. Se la aggiungi → X9 e Forge diventano "meta-monorepo" (scenario D).
- **Verdetto:** anti-pattern noto per distribuire pacchetti node.js.

#### C) git subtree — **RIFIUTATA**

- Copia fisica del bridge dentro X9 e dentro Forge. Divergenza inevitabile. Va contro l'essenza del progetto ("una sola source of truth").
- **Verdetto:** no.

#### D) pnpm meta-monorepo (3 repo sotto `/Users/admintemp/Downloads/Claude/pnpm-workspace.yaml`) — **RIFIUTATA**

- **Fatto interessante:** `/Users/admintemp/Downloads/Claude/` e **gia una working tree git** (ha `.git/`) con `package.json` minimo contenente solo `get-shit-done-cc`. Tecnicamente si potrebbe trasformare in pnpm workspace aggiungendo `pnpm-workspace.yaml` con i 3 path.
- **Problema 1:** i 3 repo figli hanno ciascuno il proprio `.git/`. Un pnpm-workspace parent non rompe i `.git/` figli, MA un singolo `pnpm-lock.yaml` a parent-level diventa conflitto con i lockfile gia presenti in `agent-x9` e `forge-v2`. Si dovrebbe scegliere: o lockfile parent-only, o ignorare il parent workspace in CI.
- **Problema 2:** deploy CI di X9 e Forge (VPS rsync) usa `pnpm install --frozen-lockfile` dentro **la directory del singolo repo** — impossibile con lockfile parent.
- **Problema 3:** regola operativa di Stefano "X9 production continuity, zero downtime". Ristrutturare la dir root e refactor invasivo.
- **Verdetto:** no. Tiene i 3 repo indipendenti e usa git-URL per il ponte.

#### E) `"file:../x9-forge-contract-bridge"` nel package.json dei consumer — **RIFIUTATA**

- **Problema 1:** `file:` protocol committato nel package.json **funziona in locale ma rompe CI**. In CI la directory sorella non esiste → install fallisce.
- **Problema 2:** path relativo dipende da come il repo e clonato. Se un collaboratore clona X9 in `~/projects/agent-x9/` e il bridge in `~/work/x9-forge-contract-bridge/` → rotto.
- **Verdetto:** no come distribution primary. SI come **dev-only override** via `pnpm.overrides` con protocol `link:` (vedi scelta raccomandata).

#### F) OpenAPI generated types (openapi-typescript `^7.13.0` / orval `^8.7.0`) — **RIFIUTATA**

- **Setup cost:** ALTO. Bisogna scrivere lo schema `.yaml` nel bridge, pipeline codegen in entrambi i consumer, controllare che il codegen non vada in drift.
- **Fit con zod@4:** discreto (openapi-typescript genera solo tipi, non schemi Zod). Per avere schemi Zod serve un secondo tool (`zod-openapi`) → complessita aumenta.
- **Runtime validation:** richiede tool separato.
- **Quando ha senso:** se un terzo consumer non-TS entra in gioco (Python, Go). Oggi no.
- **Verdetto:** overkill.

#### G) tRPC shared types (`@trpc/server@11.16.0`) — **RIFIUTATA**

- **Natura:** tRPC lega client e server TypeScript in un unico tipo. Funziona bene quando **l'intero stack** adotta tRPC come RPC.
- **Problema:** X9 e Forge espongono HTTP REST (Fastify route plugins con `X-Internal-Secret` header, webhook, SSE). Adottare tRPC = riscrivere le route esistenti. Violazione vincolo "zero regressioni" + "migrazione incrementale".
- **Verdetto:** no.

#### H) ts-rest contract package (`@ts-rest/core@3.52.1`, `@ts-rest/fastify@3.52.1`) — **RIFIUTATA (compatibilita peer-deps)**

- **Idea ottima in teoria:** un file `contract.ts` definisce le route con Zod, server Fastify e client fetch sono typed da quello stesso contract.
- **Bloccante concreto (verificato su npm 2026-04-14):**
  - `@ts-rest/core@3.52.1` → peerDep `zod@^3.22.3`
  - `@ts-rest/fastify@3.52.1` → peerDep `fastify@^4.0.0`, `zod@^3.22.3`
  - X9 usa `zod@^4.0.0` + `fastify@^5.3.2`; Forge usa `fastify@^5.8.4`
  - Forzare zod@3 su X9 = downgrade + regression. Forzare fastify@4 = downgrade su entrambi.
  - Ultimo update di ts-rest: 2 giugno 2025. Progetto non aggiornato per zod@4 / fastify@5.
- **Verdetto:** incompatibile con lo stack esistente. Riconsiderare quando ts-rest rilascia supporto zod@4 + fastify@5.

#### I) Zod schemas as source of truth — **INCLUSA nella scelta raccomandata**

- Zod e gia in uso in X9 (`zod@^4`) e Forge services (`zod@^3`, da bumpare a 4).
- Pattern canonico 2026: schema Zod nel bridge → `export type Foo = z.infer<typeof FooSchema>` → X9/Forge usano il tipo al compile-time, `.parse()` al boundary HTTP (ingresso Fastify + uscita fetch).
- Unifica compile-time e runtime: un solo punto di verita.
- **Verdetto:** adottata come core della soluzione. Consente migrazione incrementale: ogni contratto migrato nel bridge porta schema + tipo insieme, i consumer possono chiamare `.parse()` subito per validare al boundary.

---

## 5. What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@ts-rest/*` **oggi** | peerDep `zod@^3` + `fastify@^4`, incompatibile con X9 (zod@4, fastify@5) e Forge (fastify@5). Ultimo release 2026-06-02. | Zod schemas puri + Fastify route plugin handwritten, tipi dal bridge |
| `tRPC` | Richiede riscrivere tutte le route come procedure tRPC. Viola "zero regressioni" e "migrazione incrementale". | HTTP REST esistente + tipi dal bridge |
| npm publish pubblico | Codice proprietario (regola Stefano). | git+ssh URL con SHA pin |
| git submodule | Foot-gun noto, incompatibile con cultura "atomic commit". pnpm non lo tratta come package. | git+ssh URL |
| git subtree | Copia fisica → divergenza inevitabile, contraddice "single source of truth". | git+ssh URL |
| `"file:../x9-forge-contract-bridge"` **in package.json committato** | Rompe CI (directory sorella non esiste), path-dipendente da come il dev clona i repo. | `git+ssh://...#sha` committato, `link:../x9-forge-contract-bridge` **solo in pnpm.overrides non-committato o dev-only** |
| `tshy`, `tsup` per il bridge | Il bridge non distribuisce codice runtime pesante, ne ha bisogno di multi-format (CJS+ESM+types). Solo ESM + .d.ts. | `tsc` nativo con `declaration: true` + `composite: true` |
| Verdaccio in produzione (per questo progetto) | Overhead infra per 2 consumer e 1 autore. VPS 2vCPU/8GB gia carico. | git+ssh URL |
| `preserveSymlinks: true` in tsconfig dei consumer | TS non risolve correttamente i type dependencies nei node_modules linkati. Documentato da pnpm. | Lasciare `preserveSymlinks: false` (default) |
| Commit di `dist/` nel bridge | Bloat repo + merge conflicts. | `prepare` script: pnpm builda al consume-time |

---

## 6. Stack Patterns by Variant

### Variant A — "Sviluppo locale fluido" (default, ogni giorno)

- Nel `package.json` root di X9 e di Forge, aggiungere (non committato, o committato dietro flag dev):
  ```json
  "pnpm": { "overrides": { "@x9-forge/contracts": "link:../x9-forge-contract-bridge" } }
  ```
- `pnpm install` una volta → symlink creato in `node_modules/@x9-forge/contracts` → punta al sorgente del bridge.
- Modifica `src/*.ts` nel bridge → `pnpm build` nel bridge (o `pnpm build --watch`) → X9 e Forge vedono il cambio immediatamente al successivo `tsc --noEmit`.
- **Niente publish, niente bump version.**

### Variant B — "Commit di un cambio contratto" (release atomico)

1. Sul bridge: modifica schema/tipo + test verde + `pnpm build` + commit + push → nuovo SHA `<new-sha>`.
2. Su X9: `pnpm add "@x9-forge/contracts@git+ssh://git@github.com/<owner>/x9-forge-contract-bridge.git#<new-sha>"` → pnpm aggiorna `package.json` + `pnpm-lock.yaml` con il nuovo SHA. Commit.
3. Su Forge: stesso passaggio.
4. Se uno dei due compile-fail → il contratto del bridge va rivisto prima di mergiare. **Questo e il meccanismo di protezione cercato.**

### Variant C — "CI/CD deploy produzione" (X9/Forge → VPS)

- In CI: `pnpm install --frozen-lockfile` legge dal lockfile → risolve git+ssh URL → clone shallow del bridge al SHA pinnato → esegue `prepare` script → `dist/` pronto.
- Prerequisito: CI ha SSH key (deploy key su GitHub, read-only) o PAT con `read:repo` per clonare il bridge.
- Sul VPS (runtime): il bridge **non esiste** come dipendenza separata, viene compilato dentro `node_modules/` come qualunque altra lib. Zero infra aggiuntiva.

### Variant D — "Migrazione incrementale di un contratto"

1. Scrivere lo schema Zod nel bridge. Build. Commit. Nuovo SHA.
2. In X9 (o Forge, a rotazione), importare dal bridge il NUOVO tipo con `import { FooSchema, type Foo } from "@x9-forge/contracts"`.
3. Lasciare il vecchio tipo locale come **re-export** dal bridge per un tempo di grazia: `export type Foo = import("@x9-forge/contracts").Foo`.
4. Scrivere contract test che `.parse()` un fixture JSON reale (dai log produzione se possibile).
5. Merge. Deploy. Verifica.
6. Rimuovere il re-export locale nel successivo ciclo, quando tutti i consumer interni sono migrati.

---

## 7. Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `zod@^4.0.0` | `typescript@>=5.0` | Zod v4 sfrutta TS 5+ type inference. Richiede il bump di Forge a zod@4 (oggi zod@3 nelle services). |
| `typescript@^6.0.2` | `@types/node@^22`, `tsconfig moduleResolution: NodeNext` | X9 gia li, Forge da portare a 6.0.2. |
| `pnpm@^10` | `workspace:*`, `link:`, `git+ssh://...#sha` | Tutti i protocolli richiesti. Nessuna feature >10 richiesta. |
| `fastify@^5` | Nessun conflitto col bridge (il bridge NON importa Fastify, definisce solo tipi/schemi Zod; i consumer passano le richieste/risposte ai propri plugin Fastify). | Questo e PRECISAMENTE il motivo per cui ts-rest/tRPC sono out (si accoppiano a Fastify). |
| `@ts-rest/core@3.52.1` | **NON compatibile** con zod@4 e fastify@5 (peerDep zod@3 + fastify@4) | **Reason to avoid.** |

---

## 8. Procedura di sviluppo locale — step-by-step (testato mentalmente)

**Scenario:** Stefano deve aggiungere `ModelTier` enum + `ModelPolicy` al bridge e usarli in X9 (Phase 35) + Forge UI.

1. `cd /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge`
2. Crea `src/model-router/tier.ts` con schema Zod + `z.infer`.
3. `pnpm test` → schema test green.
4. `pnpm build` → `dist/` aggiornato.
5. `cd ../agent-x9`
6. Verificare override locale attivo: `cat package.json | jq '.pnpm.overrides'` deve mostrare `link:../x9-forge-contract-bridge`. Se no: `pnpm run bridge:link` (script che inietta l'override + rilancia `pnpm install`).
7. In `services/agent-core/src/model/router.ts`: `import { ModelTierSchema, type ModelTier } from "@x9-forge/contracts/model-router"`.
8. `pnpm typecheck` nel servizio → compile verde usando il sorgente live del bridge.
9. `cd ../forge-v2`
10. Stessa logica, stesso import, stesso typecheck.
11. Appena i due consumer sono verdi in locale: commit + push sul bridge → ottieni SHA.
12. Su X9 e Forge: `pnpm add "@x9-forge/contracts@git+ssh://git@github.com/<owner>/x9-forge-contract-bridge.git#<sha>"`. Questo aggiorna il lockfile con il SHA reale; l'override locale resta attivo in dev ma il lockfile ora vincola la CI.
13. Merge + deploy.

**Failure mode catturato al compile-time:** se Stefano cambia `ModelTierSchema` in modo breaking e uno dei due consumer non si adegua → `pnpm typecheck` al passo 8 o 10 fallisce. Nessun deploy possibile. Bug #15 non puo piu accadere.

---

## 9. Procedura CI/CD — step-by-step

### 9.1 CI del bridge (`x9-forge-contract-bridge`)

Una GitHub Action (o GitLab CI) su push/PR:

1. `pnpm install --frozen-lockfile`
2. `pnpm typecheck`
3. `pnpm test` (schema tests + contract tests su fixture JSON)
4. `pnpm build` (verify `dist/` compila)
5. Su push a `main`: crea git tag `vX.Y.Z` (via changesets o script manuale) + annota il SHA nella release note.

Nessun publish step. Nessun registry.

### 9.2 CI dei consumer (X9, Forge)

1. Checkout del repo X9 (o Forge) + **deploy key** registrata con `read` su `x9-forge-contract-bridge`.
2. `pnpm install --frozen-lockfile` → legge lockfile → risolve `git+ssh://...#<sha>` → clona bridge al SHA → esegue `prepare` → `dist/` nel node_modules del consumer.
3. `pnpm typecheck` → se il SHA del bridge e incompatibile con l'uso che ne fa il consumer → FAIL. **Nessun deploy.** 
4. `pnpm test` → inclusi contract test.
5. Build Docker image → deploy.

### 9.3 Gestione secret per clone del bridge

- **Opzione 1 (raccomandata):** Deploy Key per repository. GitHub → bridge repo → Settings → Deploy keys → aggiungi chiave pubblica CI. Nel CI registrare la private key come secret SSH.
- **Opzione 2:** PAT con scope `repo` (read-only) in `GIT_ASKPASS` helper. Piu semplice ma token user-scoped.

---

## 10. Mini-checklist di Definition of Done stack-level (per REQUIREMENTS.md)

- [ ] Bridge `package.json` con `prepare` script, `exports` field multi-subpath, `"private": false` ma `publishConfig.access: restricted`
- [ ] `tsconfig.json` con `composite: true`, `declaration: true`, `declarationMap: true`, `moduleResolution: NodeNext`
- [ ] Zod v4 come unica dependency runtime del bridge
- [ ] X9 (pnpm) e Forge (pnpm) bumpati a zod@4 prima del primo import reale dal bridge
- [ ] Forge `@forge/types` bumpato a typescript@^6.0.2
- [ ] Script `bridge:link` / `bridge:unlink` in X9 e Forge root per togliere/rimettere l'override locale senza editing manuale
- [ ] Deploy key GitHub creata per il bridge, registrata nei secret CI di X9 e di Forge
- [ ] README del bridge documenta: (a) installazione via SHA, (b) workflow dev locale con `link:`, (c) regole di breaking change + bumping

---

## 11. Sources

### Context7 / npm registry (verificato 2026-04-14)

- [`typescript` 6.0.2 on npm](https://www.npmjs.com/package/typescript) — verified `npm view typescript version` → `6.0.2`
- [`zod` 4.0.0+ on npm](https://www.npmjs.com/package/zod) — `4.3.6` stabile, `4.4.0-canary` in canale pre-release; discriminated unions + `z.infer` sono feature di base
- [`pnpm` 10.33.0 on npm](https://www.npmjs.com/package/pnpm) — supporta `workspace:*`, `link:`, `git+...#sha`, `pnpm.overrides`
- [`@ts-rest/core` 3.52.1 peerDeps](https://www.npmjs.com/package/@ts-rest/core) — verificato peer `zod@^3.22.3`, `fastify@^4` → **BLOCCANTE per il nostro stack**. Ultimo release 2026-06-02
- [`@trpc/server` 11.16.0](https://www.npmjs.com/package/@trpc/server) — non adatto perche impone paradigma RPC su HTTP REST esistente
- [`@changesets/cli` 2.30.0](https://www.npmjs.com/package/@changesets/cli) — stabile, 2026-03-03
- [`fastify` 5.8.5](https://www.npmjs.com/package/fastify) — latest 2026-04-14, confermato l'uso fastify@5 in X9 e Forge

### Documentazione ufficiale / articoli 2026 (HIGH confidence dove citato)

- [pnpm Workspaces — ufficiale](https://pnpm.io/workspaces) — HIGH — spiega `workspace:*`, `link:`, differenze con `file:`
- [pnpm Supported package sources](https://pnpm.io/package-sources) — HIGH — conferma `git+ssh://...#<sha>` come first-class
- [pnpm link CLI](https://pnpm.io/cli/link) — HIGH — sintassi per linkare package da sibling directory
- [pnpm TypeScript guidance](https://pnpm.io/typescript) — HIGH — **avvertenza esplicita** contro `preserveSymlinks: true`
- [Install npm Packages Directly from GitHub — 2026 guide](https://thelinuxcode.com/install-npm-packages-directly-from-github-a-practical-2026-guide/) — MEDIUM — pattern `prepare` script + git URL + SHA pin
- [Baeldung — How to Install an npm Package Directly From GitHub](https://www.baeldung.com/ops/github-npm-package-direct-installation) — MEDIUM
- [Zod v4 discriminated unions + z.infer](https://zod.dev/api) — HIGH — schema → tipo via inference, runtime validation
- [colinhacks/zod — GitHub](https://github.com/colinhacks/zod) — HIGH — source of truth per API v4
- [Sharing Types across PNPM monorepo — DEV.to](https://dev.to/lico/step-by-step-guide-sharing-types-and-values-between-react-esm-and-nestjs-cjs-in-a-pnpm-monorepo-2o2j) — MEDIUM — conferma pattern `workspace:*` per monorepo interni, applicabile con ingegno al cross-repo
- [Live types in a TypeScript monorepo — Colin McDonnell](https://colinhacks.com/essays/live-types-typescript-monorepo) — MEDIUM — conferma `declarationMap + composite` per go-to-definition cross-package
- [Nx Blog — Managing TypeScript Packages in Monorepos](https://nx.dev/blog/managing-ts-packages-in-monorepos) — MEDIUM — argomenta project references + workspace

### Evidenza diretta dal codebase (file:line)

- `/Users/admintemp/Downloads/Claude/agent-x9/packages/types/package.json` — `@x9/types@0.0.1 private:true workspace:* zod@^4.0.0 typescript@^6.0.2`
- `/Users/admintemp/Downloads/Claude/forge-v2/packages/types/package.json` — `@forge/types@0.0.1 private:true typescript@^5.0.0` (no zod runtime dep)
- `/Users/admintemp/Downloads/Claude/agent-x9/pnpm-workspace.yaml` — `packages/*`, `services/*`
- `/Users/admintemp/Downloads/Claude/forge-v2/pnpm-workspace.yaml` — `packages/*`, `services/*`, `gateway`, `api`, `web`
- `/Users/admintemp/Downloads/Claude/forge-v2/services/factory/package.json` — `fastify@^5.8.4 zod@^3.0.0 typescript@^5.9.3` → **drift zod v3↔v4** attualmente presente fra X9 e Forge; il bridge impone la riconciliazione a v4
- `/Users/admintemp/Downloads/Claude/agent-x9/services/agent-core/package.json` — `fastify@^5.3.2 zod@^4.0.0 typescript@^6.0.2`
- `/Users/admintemp/Downloads/Claude/.npmrc` parent — **assente** — conferma che non esiste gia un meta-workspace pnpm a parent level
- `/Users/admintemp/Downloads/Claude/package.json` — contiene solo `get-shit-done-cc`, nessun riferimento a workspace dei 3 repo

### Confidence levels per raccomandazione

| Claim | Confidence | Rationale |
|-------|-----------|-----------|
| git+ssh URL con SHA e `prepare` script e canonical per distribuire TS privato senza registry | HIGH | Documentato ufficialmente in pnpm docs + npm docs, pattern in uso industriale noto |
| pnpm `link:` in `pnpm.overrides` per dev loop istantaneo | HIGH | Documentato ufficialmente, testato mentalmente passo-passo |
| ts-rest non usabile oggi per peer-dep conflict zod@3/fastify@4 | HIGH | Verificato su npm `@ts-rest/core@3.52.1` + `@ts-rest/fastify@3.52.1` in data 2026-04-14 |
| Zod v4 come source of truth + `z.infer` | HIGH | Stack gia adottato in X9, pattern documentato zod v4 |
| Bump di Forge services da zod@3 a zod@4 e prerequisito | MEDIUM | Il bridge richiede coerenza di versione; zod v3→v4 ha breaking changes — **richiede Phase dedicata di migrazione Forge prima di consumare il bridge**. Non e incompatibilita insormontabile, ma costa |
| `composite: true` + `declarationMap: true` nel bridge abilita go-to-definition dai consumer | HIGH | Behaviour noto di TypeScript project references |
| Scartare tRPC e OpenAPI | HIGH | Scelta driven da zero regressioni + stack esistente HTTP REST Fastify; nessuna motivazione a riscrivere |
| Scartare Verdaccio / GitHub Packages | MEDIUM-HIGH | Valutazione costo-beneficio per 2 consumer + 1 autore. Se in futuro consumer > 3, riconsiderare GitHub Packages (incluso nel piano GitHub gia di Stefano) |
| Scartare meta-monorepo (3 repo sotto un pnpm-workspace root) | HIGH | Conflitto con deploy CI esistente + vincolo X9 production continuity |

---

## 12. Rischi noti e mitigazioni

| Rischio | Mitigazione |
|---------|-------------|
| Sviluppatore dimentica di togliere `pnpm.overrides` locale prima di commit → CI usa il link: invece del git URL | Committare lo script `bridge:link`/`bridge:unlink` + pre-commit hook che blocca `link:../x9-forge-contract-bridge` nel package.json committato |
| SHA pinnato diventa obsoleto, nessuno aggiorna → drift | In cap-security o in CI di X9/Forge: job settimanale che verifica se il bridge ha tag nuovi e apre PR automatica |
| `prepare` script fallisce perche il bridge usa feature TS non ancora installata nel consumer | `prepare` installa la sua `devDependency typescript` isolata (pnpm la mette nel node_modules del bridge) → isolato dal consumer |
| Bump zod@3→zod@4 in Forge rompe servizi esistenti | Eseguire migrazione zod in Forge **prima** del primo consumo del bridge da parte di Forge; Phase dedicata |
| Deploy key persa / ruotata | Documentare rotation runbook; usare GitHub "fine-grained PAT" come secondary |
| Bridge ha bug → produce tipi sbagliati in entrambi i consumer contemporaneamente | Contract test obbligatori (`tests/contracts/*.test.ts`) che validano fixture reali prima di bumparre il SHA |

---

*Stack research for: x9-forge-contract-bridge (v1)*
*Researched: 2026-04-14 — verificato contro snapshot npm registry, codebase X9, codebase Forge v2, documentazione ufficiale pnpm + Zod v4*
