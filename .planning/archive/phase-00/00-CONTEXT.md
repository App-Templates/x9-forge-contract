# Phase 0: Prerequisites + Bridge Foundation - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning
**Source:** Direct dialogue with Stefano (no /gsd-discuss-phase — Stefano preferred in-chat alignment)

<domain>
## Phase Boundary

**Phase 0 delivers:**
- Il bridge repo `x9-forge-contract` ha package scaffolding completo (build verde, tsconfig strict, Zod v4, sub-path exports) e dev-loop `pnpm.overrides link` verificato end-to-end
- Forge v2 e allineato a `zod@^4` + `typescript@^6.0.2` + `exactOptionalPropertyTypes: true` nel `packages/types/tsconfig.json`
- Forge staging deploy post-migration verificato sano (17/17 container healthy, 229 test passano)
- Il primo import dal bridge e possibile senza rompere nulla

**What it does NOT deliver:**
- Nessun contratto reale migrato (quello inizia in Phase 1)
- Nessun typed HTTP client (Phase 3)
- Nessun cambiamento a X9 runtime (Phase 1+)

**Requirements in scope (12):** BRDG-01, BRDG-02, BRDG-03, BRDG-04, BRDG-05, BRDG-06, MGRT-01, MGRT-02, MGRT-03, OBS-01, OBS-02, OBS-03

</domain>

<decisions>
## Implementation Decisions (locked)

### Package identity

- **Package name:** `@x9-forge/contracts` (plurale, confermato da Stefano 2026-04-14)
- **Repo name:** `x9-forge-contract` (singolare, nome repo GitHub)
- **GitHub remote:** `https://github.com/App-Templates/x9-forge-contract.git` (privato, gia creato + pushato 2026-04-14)
- **Owner GitHub:** `App-Templates` (stesso account degli altri repo Stefano)

### Distribution mechanism

- **Dev loop locale:** `pnpm.overrides` con `link:../x9-forge-contract-bridge` NEL package.json dei consumer (non-committato nel main, vive in dev/locale) — modifica bridge → consumer vede subito
- **CI/prod:** dependency git URL pinnata su SHA, es. `"@x9-forge/contracts": "git+https://github.com/App-Templates/x9-forge-contract.git#<sha>"` (NOTA: `git+https` non `git+ssh` — coerente con setup GitHub di Stefano via token keychain gh CLI. La decisione STACK.md originale menzionava ssh; adottiamo https per zero-friction setup, SSH puo essere adottato in v1.1 come hardening)
- **Build trigger:** `prepare` script in package.json del bridge → pnpm lo esegue al clone consumer, produce `dist/` prima dell'uso
- **Zero infra:** no registry privato (Verdaccio/GitHub Packages) per v1

### Zod version source of truth

- **Zod v4 obbligatorio nel bridge.** Source of truth per schema; TS types via `z.infer<typeof schema>` (zero drift schema↔type)
- **Forge e bloccato a zod@3** (verificato via research). Migrare Forge a zod@4 e prerequisito tecnico. Non negoziabile.
- **X9 e gia zod@4** (verificato da research STACK.md) — nessun bump necessario

### TypeScript target

- **TS 6.0.2** (versione stabile attuale 2026-04-14)
- **tsconfig del bridge:** `strict: true`, `exactOptionalPropertyTypes: true`, `noUncheckedIndexedAccess: true`, `target: ES2023`, `module: NodeNext`, `moduleResolution: NodeNext`
- **Forge packages/types/tsconfig.json oggi NON ha `exactOptionalPropertyTypes`** (verificato). Va abilitato per allinearsi al bridge.
- **X9 ha gia `exactOptionalPropertyTypes: true`** (verificato `agent-x9/tsconfig.base.json:13`) — nessun bump

### Package structure (src layout)

```
x9-forge-contract-bridge/
├── src/
│   ├── index.ts            # barrel root (minimal, re-export subpath names)
│   ├── capability/         # CapabilityManifest, ToolCall, (modelPolicy aggiunto in Phase 6)
│   ├── agent/              # AgentContextCore, AgentIdentity, AgentCredentials (Phase 2)
│   ├── http/               # endpoint contracts (Phase 4)
│   ├── auth/               # headers discriminated (Phase 3)
│   ├── vault/              # VaultEntry, VaultTier, VaultSyncEvent (Phase 5)
│   └── model-router/       # ModelTier, ModelPolicy, push API (Phase 6)
├── tests/
│   ├── setup.ts            # vitest bootstrap
│   └── contracts.test.ts   # schema shape tests (una per dominio, riempiti fase per fase)
├── package.json            # exports, files, prepare, vitest
├── tsconfig.json
├── vitest.config.ts
├── README.md (gia presente, migliorato in Phase 0)
└── .github/workflows/ci.yml  # build + test + lint su PR/push
```

**In Phase 0:** tutti i sub-dir esistono ma sono vuoti (o con un file placeholder `.gitkeep`). Il primo contratto reale arriva in Phase 1.

### Package.json shape (scheletro)

```json
{
  "name": "@x9-forge/contracts",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./dist/index.js",
    "./capability": "./dist/capability/index.js",
    "./agent": "./dist/agent/index.js",
    "./http": "./dist/http/index.js",
    "./auth": "./dist/auth/index.js",
    "./vault": "./dist/vault/index.js",
    "./model-router": "./dist/model-router/index.js"
  },
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "tsc -b",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src tests",
    "prepare": "pnpm build"
  },
  "peerDependencies": {
    "zod": "^4.0.0"
  },
  "devDependencies": {
    "zod": "^4.x.x",
    "typescript": "^6.0.2",
    "vitest": "^3.x.x",
    "@types/node": "^22.x.x",
    "eslint": "^9.x.x"
  }
}
```

### Forge zod@3→@4 migration approach

**Strategia:** migrazione su branch feature (`bridge-migration/zod-v4`), non su `main`. Test completi green prima di merge. Deploy staging post-merge verificato.

**Aree impattate (da STACK research):**
- `services/vault/` — 51 test, Zod schemas su vault entries
- `services/factory/` — 62 test, schemas su agent deploy + owner CRUD
- `services/workspace/` — 79 test, schemas su file CRUD + sync
- `services/voice/` — 24 test, schemas su voice sessions
- `services/docker/` — 13 test, schemas su container lifecycle
- `packages/types/` — schema definitions root

**Breaking changes principali Zod v3→v4:**
- `.strict()` default diverso (zod@4 piu stretto)
- Error types refactor (`ZodError.issues` shape)
- `.passthrough()` e `.strict()` rimossi in favore di `.loose()` / `.strict()` con API diversa
- `z.string().email()` diventa `z.email()`
- Internal `_def` shape cambiata (usata raramente, ma se presente rompe)

**Strategia migration:**
1. Leggere tutti i `.parse()` e `.safeParse()` in Forge, mappare schemas
2. Upgrade `zod` to `^4.x` in root package.json
3. Correggere breaking changes file per file, `pnpm test` dopo ogni service
4. Full `pnpm test` green prima di commit
5. Staging deploy verificato con smoke test

**Stima magnitude:** ~20-40 fix puntuali. Tempo stimato 2-4 ore. Se emergono pattern sistematici inattesi (>50 fix) → flag a Stefano.

### TS 6 + exactOptionalPropertyTypes migration approach

**Strategia:** piggyback sul branch Zod (`bridge-migration/zod-v4`). TS bump e tsconfig alignment nello stesso sweep (risparmia round di test).

**Impatto atteso:**
- `typescript` 5.9 → 6.0.2: minor breaking su alcuni edge case di inference, documentati in release notes
- `exactOptionalPropertyTypes: true`: cambia semantica di `{ foo?: string }` → non accetta piu `{ foo: undefined }` esplicito. Forge ha pattern `field?: string | undefined` che emergono come errori.

**Strategia:**
1. Dopo Zod bump green, bump TS
2. Abilitare `exactOptionalPropertyTypes` SOLO in `packages/types/tsconfig.json` (allinea al bridge)
3. Run `pnpm -r tsc --noEmit` per elenco completo errori
4. Fix file per file
5. **Se >50 errori cascata → insertion point Phase 00.1** (decisione Stefano 2026-04-14)

### Dev loop verification protocol

**00-04 plan verifica:**
1. Aggiungere `"pnpm.overrides": { "@x9-forge/contracts": "link:../../x9-forge-contract-bridge" }` NEL package.json di X9 workspace root (dev-only, gitignored o branch dev)
2. Stessa cosa per Forge v2
3. Creare un dummy type nel bridge `export type DummyProbe = { ok: true }`
4. Importare in X9 `import type { DummyProbe } from '@x9-forge/contracts'`
5. Importare in Forge `import type { DummyProbe } from '@x9-forge/contracts'`
6. `pnpm tsc --noEmit` in entrambi → verde
7. Modificare il tipo nel bridge (`DummyProbe = { ok: true; version: number }`)
8. Entrambi i consumer rilevano il cambio **senza republish** (link: protocol)
9. Cleanup: rimuovere DummyProbe dal bridge (no side-effect da mergere)

### CI setup

- **GitHub Actions** su bridge repo (v1): lint + build + test su PR e push `main`
- Config minimale `.github/workflows/ci.yml`:
  ```yaml
  name: CI
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: pnpm/action-setup@v4
        - uses: actions/setup-node@v4
          with: { node-version: '22', cache: 'pnpm' }
        - run: pnpm install --frozen-lockfile
        - run: pnpm lint
        - run: pnpm build
        - run: pnpm test
  ```

### Commit + rollback discipline

- **Atomic commits** per ogni step significativo (no big-bang)
- Ogni commit deve lasciare il repo consumer in stato deployabile (tutti i test green)
- Rollback = `git revert <sha>` del commit problematico, o restore del tag `pre-bridge-migration-2026-04-14`
- VPS snapshot (eseguito 2026-04-14) come ultima ancora se il revert non basta
- **Zero merge in main Forge finche:** tutti i test green + smoke test staging post-deploy verde

### Claude's Discretion

Il planner puo decidere:
- Esatta lista di devDependencies (versioni specifiche `^x.y.z`)
- Layout dei test file (una suite per dominio vs tutto in contracts.test.ts)
- Formato preciso degli esempi JSDoc nei placeholder
- Eslint rules specifiche (oltre a quelle owasp-level)
- Commit message format (conventional commits si, dettagli sta al planner)
- Ordine esatto dei file creati in 00-01 (scaffolding)
- Se separare Zod upgrade da TS upgrade in due commit Forge separati o uno solo

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Research del progetto (base)
- `.planning/research/STACK.md` — Decisione stack, alternative rifiutate, procedure dev+CI
- `.planning/research/FEATURES.md` — Categorizzazione table stakes / differentiator / anti-feature
- `.planning/research/ARCHITECTURE.md` — Boundary rule, 6-block migration order, AgentContext split
- `.planning/research/PITFALLS.md` — 30 pitfall con severity e mapping a phase preventiva
- `.planning/research/SUMMARY.md` — Executive summary + roadmap implications

### Requirements e roadmap
- `.planning/REQUIREMENTS.md` — BRDG-01..06, MGRT-01..03, OBS-01..03 (12 req di Phase 0)
- `.planning/ROADMAP.md` — Success criteria Phase 0, dependency graph

### PROJECT context
- `.planning/PROJECT.md` — Research mandate (8 vincoli non negoziabili), Key Decisions

### Codice dei 2 consumer (per inspection durante planning)
- `/Users/admintemp/Downloads/Claude/forge-v2/package.json` — root
- `/Users/admintemp/Downloads/Claude/forge-v2/pnpm-workspace.yaml`
- `/Users/admintemp/Downloads/Claude/forge-v2/packages/types/package.json`
- `/Users/admintemp/Downloads/Claude/forge-v2/packages/types/tsconfig.json` — va modificato in 00-03
- `/Users/admintemp/Downloads/Claude/forge-v2/services/*/package.json` — 5 services per Zod deps
- `/Users/admintemp/Downloads/Claude/agent-x9/package.json`
- `/Users/admintemp/Downloads/Claude/agent-x9/tsconfig.base.json` — gia con exactOptionalPropertyTypes: true
- `/Users/admintemp/Downloads/Claude/agent-x9/pnpm-workspace.yaml`

### Esterni (verifica versioni attuali durante planning)
- https://zod.dev/api — Zod v4 API (breaking changes vs v3)
- https://www.typescriptlang.org/docs — TS 6.0 release notes
- https://pnpm.io/package-sources — git URL pinning reference
- https://vitest.dev — vitest 3.x

</canonical_refs>

<specifics>
## Specific Ideas

- Il primo dummy contract test in Phase 0 deve essere **minimale** (HealthStatus o DummyProbe), NON un contratto vero. I contratti veri iniziano in Phase 1.
- Dopo 00-02 + 00-03 (Forge migration), **il branch `bridge-migration/zod-v4` deve essere mergiato in Forge `main` prima di Phase 1**, altrimenti Phase 1 non puo avanzare. Il planner deve marcare questo come dependency critica.
- `pnpm.overrides` per il link locale NON va committato in `main` dei consumer (X9/Forge). Va in branch dev o gitignorato con un override script. Soluzione pulita: documentare il pattern in README del bridge + script helper `scripts/enable-local-link.sh` nei consumer.
- Il CI del bridge (v1) deve essere minimale ma corretto: no deploy, no release, solo test. Serve solo per gate su PR.
- Il `prepare` script di pnpm esegue al clone — questo significa che ogni consumer durante `pnpm install` builda il bridge. Verifica: il bridge build e pulito? Niente stateful? (Tutto `tsc -b` puro, niente side-effects.)

</specifics>

<deferred>
## Deferred Ideas

- **CI/CD release pipeline del bridge** — no release formale in Phase 0. Version resta 0.0.0 con SHA pinning nei consumer. Release con Changesets/semver e post-v1.0.
- **Deploy Key SSH sul VPS per pulling bridge** — in Phase 0 non serve (il bridge non e' ancora consumato runtime). Serve a partire da Phase 1 quando X9 staging importa dal bridge. Plan Phase 1 dovra includere "configure VPS SSH access to bridge repo".
- **ts-rest upgrade** — bloccato da peer-dep conflict (verificato 2026-04-14). Riconsiderare in v1.1.
- **Contract testing framework avanzato (Pact, etc.)** — overkill per v1 con 2 consumer.
- **JSON Schema auto-export** — Zod v4 supporta `.toJSONSchema()` nativo; deferred a v2 quando serve un consumer non-TS.

</deferred>

---

*Phase: 00-prerequisites-bridge-foundation*
*Context gathered: 2026-04-14 via direct dialogue (no /gsd-discuss-phase)*
