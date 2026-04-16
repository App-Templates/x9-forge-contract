---
phase: 00-prerequisites-bridge-foundation
plan: 01
subsystem: infra
tags: [typescript, zod, vitest, eslint, pnpm, scaffolding, monorepo]

# Dependency graph
requires: []
provides:
  - Repo x9-forge-contract-bridge ha scaffolding completo (package.json, tsconfig, src/, tests/, vitest, eslint, ci)
  - Build artifacts (dist/) produce 7 sub-domain entries (root + capability/agent/http/auth/vault/model-router)
  - Zod v4.3.6 + TypeScript 6.0.2 installati e verdi nel bridge
  - GitHub Actions CI workflow pronto per trigger su push main
affects: [phase-00-02, phase-00-03, phase-00-04, phase-01, all-future-contract-phases]

# Tech tracking
tech-stack:
  added:
    - "zod@4.3.6 (peerDep ^4.0.0 + devDep ^4.3.6)"
    - "typescript@6.0.2"
    - "vitest@3.2.4"
    - "eslint@9.39.4 (flat config)"
    - "@typescript-eslint/eslint-plugin@8.58.2"
    - "@typescript-eslint/parser@8.58.2"
    - "@types/node@22.19.17"
  patterns:
    - "Sub-path exports per dominio (6 sub-path: capability/agent/http/auth/vault/model-router)"
    - "tsconfig strict + exactOptionalPropertyTypes + noUncheckedIndexedAccess (allineato agent-x9)"
    - "prepare script auto-build su install (BRDG-01 compliant)"
    - "tsconfig.eslint.json separato per lint type-aware su tests"

key-files:
  created:
    - "package.json"
    - ".gitignore"
    - ".nvmrc"
    - "pnpm-lock.yaml"
    - "tsconfig.json"
    - "tsconfig.eslint.json"
    - "src/index.ts"
    - "src/capability/index.ts"
    - "src/agent/index.ts"
    - "src/http/index.ts"
    - "src/auth/index.ts"
    - "src/vault/index.ts"
    - "src/model-router/index.ts"
    - "vitest.config.ts"
    - "tests/setup.ts"
    - "tests/smoke.test.ts"
    - "eslint.config.mjs"
    - ".github/workflows/ci.yml"
  modified:
    - "README.md (aggiunte 5 sezioni: Install, Dev locale, Contracts coverage, How to add, Breaking change policy)"

key-decisions:
  - "engines.pnpm >= 9.0.0 (non 10) per compat con agent-x9 (pnpm@9.15.9) e forge-v2 (>=9)"
  - "ignoreDeprecations: '6.0' in tsconfig per sopprimere TS 6 warning su esModuleInterop=false (esModuleInterop=false mantenuto come da plan)"
  - "tsconfig.eslint.json separato (estende tsconfig.json principale, include tests/) per abilitare lint type-aware su tests senza contaminare la build"
  - "ci.yml usa pnpm@10 runner (più recente) anche se engines richiede >=9 — lockfile pnpm 9 compatibile"
  - ".gitignore esteso con *.tsbuildinfo (incremental build cache TS composite)"

patterns-established:
  - "Sub-path exports: ogni dominio ha proprio index.ts placeholder, build produce dist/<dominio>/index.js"
  - "Placeholder pattern: file src/<dominio>/index.ts contiene solo `export {}` + JSDoc — pronto ad accogliere Zod schemas Phase 1+"
  - "Smoke test pattern: tests/smoke.test.ts verifica sanity (Zod v4 parse + safeParse fail-loud), pronto per contract test pattern Phase 1+"
  - "Flat ESLint 9 config con typescript-eslint 8 (no legacy .eslintrc)"

requirements-completed: ["BRDG-01", "BRDG-02", "BRDG-03", "BRDG-04", "BRDG-05", "OBS-01", "OBS-02", "OBS-03"]

# Metrics
duration: ~15min
completed: 2026-04-14
---

# Phase 00-01: Bridge Package Scaffolding — Summary

**Repo `@x9-forge/contracts` è operativo: install/build/test/lint verdi, 7 sub-domain exports pronti, README con policy di contribution. Nessun contratto reale (placeholder Phase 0) — fondazione pronta per Phase 1 migration.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-14 16:46 CEST
- **Completed:** 2026-04-14 17:00 CEST
- **Tasks:** 5/5 completed
- **Files created:** 18
- **Files modified:** 1 (README.md)

## Accomplishments

- Bridge package è installabile via `git+https` con SHA pinning e prepare-on-install (BRDG-01/05)
- Sub-path exports per 6 dominî (capability/agent/http/auth/vault/model-router) — consumer possono fare `import from '@x9-forge/contracts/capability'` (BRDG-02)
- tsconfig strict con `exactOptionalPropertyTypes: true` + `noUncheckedIndexedAccess` — allineato al più strict dei due consumer (agent-x9). Forge v2 dovrà adeguarsi in plan 00-03 (BRDG-03)
- Zod v4 come peerDep + devDep, smoke test valida parse + safeParse fail-loud (BRDG-04)
- README ha le 3 sezioni obbligatorie di governance: Contracts coverage (tabella popolata phase-per-phase), How to add a new contract (8 step canonici), Breaking change policy (7 regole non negoziabili) (OBS-01/02/03)
- GitHub Actions CI workflow pronto (lint + build + test su push main / PR) — trigger al primo push

## Task Commits

1. **Task 00-01.1: package.json + deps** — `9c63524` (chore)
2. **Task 00-01.2: tsconfig + src layout** — `95b1766` (chore)
3. **Task 00-01.3: vitest setup** — `53a3363` (chore)
4. **Task 00-01.4: README OBS-01..03** — `674ac3b` (docs)
5. **Task 00-01.5: ESLint + GitHub Actions CI** — `3fa5d6f` (ci)

## Files Created/Modified

**Config (5):**
- `package.json` — name `@x9-forge/contracts`, exports sub-path, prepare script, engines node>=22/pnpm>=9
- `tsconfig.json` — strict + exactOptionalPropertyTypes + NodeNext + ES2023 + ignoreDeprecations 6.0
- `tsconfig.eslint.json` — estende tsconfig.json, include tests per lint type-aware
- `vitest.config.ts` — include tests/**/*.test.ts, node env, coverage v8
- `eslint.config.mjs` — flat config ESLint 9 + typescript-eslint

**Src placeholder (7):**
- `src/index.ts` — barrel minimale con doc JSDoc
- `src/{capability,agent,http,auth,vault,model-router}/index.ts` — 6 placeholder `export {}`

**Tests (2):**
- `tests/setup.ts` — vitest bootstrap (hooks futuri)
- `tests/smoke.test.ts` — 2 test zod v4 (parse + safeParse fail-loud)

**CI/Infra (2):**
- `.github/workflows/ci.yml` — pnpm 10 + node 22 + install frozen + lint/build/test
- `.gitignore` — node_modules, dist, coverage, *.tsbuildinfo

**Repo meta (2):**
- `.nvmrc` — `22` (allineato engines.node)
- `pnpm-lock.yaml` — 154 pacchetti (resolved con pnpm 9.15.9)

**Docs (1 modified):**
- `README.md` — aggiunte 5 sezioni (Install, Dev locale, Contracts coverage, How to add, Breaking change policy), contenuto pre-esistente (Why, Scope v1, Verified ground truth, Architecture, Status, Related phases, License) preservato

## Verification results

- [x] `pnpm install --frozen-lockfile`: OK (lockfile up to date)
- [x] `pnpm build`: OK (silent success, dist/ produce 7 index.js + 7 .d.ts + declaration maps)
- [x] `pnpm test`: 2/2 passed (smoke.test.ts)
- [x] `pnpm lint`: OK (zero errori, zero warning)
- [x] `pnpm typecheck`: OK (durante build)
- [x] `dist/` struttura completa: root + 6 sub-domini
- [x] README ha 3 sezioni OBS richieste + 2 sezioni BRDG (Install/Dev locale)
- [x] 5 commit atomici lineari

## Deviations from plan

1. **`ignoreDeprecations: "6.0"` aggiunto al tsconfig** — il plan non lo prevedeva ma TS 6 emette un deprecation error su `esModuleInterop=false` (che il plan richiede esplicitamente). Flag aggiunta per preservare `esModuleInterop=false` come da plan.

2. **`tsconfig.eslint.json` creato** — il plan usava `project: './tsconfig.json'` nell'eslint config, ma `tsconfig.json` esclude `tests/` dalla compilazione. ESLint type-aware non trovava i test. Creato tsconfig separato per lint (estende il principale, include tests). La build principale resta intatta.

3. **`*.tsbuildinfo` aggiunto al .gitignore** — il plan non lo prevedeva ma `composite: true` in tsconfig genera questo file di cache incremental. Non va committato.

Nessuna deviation è materiale rispetto all'obiettivo del plan — tutte sono tactical fix per edge case del tooling (TS 6 deprecations + ESLint + composite build cache).

## Next steps

- **Non ancora eseguito:** push su `origin/main` (richiede OK esplicito Stefano per feedback rule push/deploy).
- **Non ancora eseguito:** GitHub Actions CI verde (trigger su push — verrà verificato post-push con `gh run list -R App-Templates/x9-forge-contract`).
- **Prossimi plan Phase 0 (non autorizzati in questa sessione):**
  - Plan 00-02: Forge v2 zod@3 → zod@4 migration (repo `forge-v2`, branch `bridge-migration/zod-v4`)
  - Plan 00-03: Forge v2 TS 6.0.2 + exactOptionalPropertyTypes alignment
  - Plan 00-04: Dev-loop verification end-to-end (richiede bridge buildato + Forge allineato)

## Rollback path

Se post-push emergono issue bloccanti:

```bash
cd /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge
git revert 3fa5d6f 674ac3b 53a3363 95b1766 9c63524  # 5 revert in inverse order
# oppure (soft reset locale, NO force push):
git reset --hard b3a1ab8  # pre-00-01 HEAD
```

Force-push richiede OK esplicito Stefano (feedback rule).
