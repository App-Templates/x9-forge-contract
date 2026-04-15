# Phase 00: Prerequisites + Bridge Foundation — Manifest

**Phase:** 00 — Prerequisites + Bridge Foundation
**Created:** 2026-04-14
**Status:** Ready for execution
**Total plans:** 4 (00-01, 00-02, 00-03, 00-04)

---

## Objective

Phase 0 mette le fondamenta del bridge `@x9-forge/contracts` e allinea Forge v2 ai prerequisiti tecnici richiesti dal package. Non migra nessun contratto reale (quello inizia in Phase 1), non tocca X9 runtime, non introduce typed HTTP client.

**Deliverable concreti:**
1. Il repo `x9-forge-contract-bridge` ha scaffolding completo (src layout, tsconfig strict, vitest, prepare script, sub-path exports) e build + test verdi
2. Forge v2 e completamente migrato da `zod@3` a `zod@4`: i 5 service (`vault`, `factory`, `workspace`, `voice`, `docker`) compilano e testano verdi
3. Forge v2 e aggiornato a `typescript@^6.0.2` su tutti i workspace member, e `packages/types/tsconfig.json` ha `exactOptionalPropertyTypes: true` come agent-x9 (verificato: `tsconfig.base.json:13`)
4. Il dev-loop `pnpm.overrides` + `link:` e validato end-to-end: modifica nel bridge → X9 e Forge vedono il cambio senza republish
5. Forge staging deploy post-migration e sano (17/17 container healthy)

**Fuori scope Phase 0 (conferma esplicita):**
- Nessun contratto reale migrato al bridge (Phase 1+)
- Nessun typed HTTP client o `createBridgeClient` (Phase 3+)
- Nessun cambiamento a X9 runtime o deploy X9
- Nessun endpoint nuovo in Forge
- Nessun compat shim re-export (Phase 1+)

---

## Requirements coperti

**12 requirement Phase 0:**
- Bridge Foundation: **BRDG-01, BRDG-02, BRDG-03, BRDG-04, BRDG-05, BRDG-06**
- Consumer Migration: **MGRT-01, MGRT-02, MGRT-03**
- Observability & Docs: **OBS-01, OBS-02, OBS-03**

Tutti i 12 requirement sono distribuiti tra i 4 plans (vedi singolo PLAN per dettaglio).

---

## Plans overview

| Plan | Nome | Requirement | Stima | Rischio |
|------|------|-------------|-------|---------|
| 00-01 | Bridge package scaffolding | BRDG-01..06, OBS-01..03 | ~3-4h | Basso |
| 00-02 | Forge zod@3 → zod@4 migration | MGRT-01 | ~4-8h | Medio |
| 00-03 | Forge TS 6.0.2 + `exactOptionalPropertyTypes` alignment | MGRT-02, MGRT-03 | ~2-6h | Medio |
| 00-04 | Dev loop verification end-to-end | BRDG-06 (verifica) | ~1-2h | Basso |

**Stima aggregate:** 10-20h Claude execution time. Se il runtime effettivo supera 20h → flag a Stefano per insertion point Phase 00.1.

---

## Dependency graph

```
00-01 (scaffolding bridge — indipendente)
    |
    |   (nessuna dipendenza runtime con Forge migration)
    |
00-02 (Forge zod@3→@4) — indipendente da 00-01
    |
    v
00-03 (Forge TS 6 + exactOptionalPropertyTypes) — DEVE venire dopo 00-02
    |                                              (piggyback sullo stesso branch)
    v
00-04 (dev loop verification) — DEVE venire dopo 00-01 + 00-03
                                 (richiede bridge buildato + Forge allineato)
```

**Esecuzione raccomandata (sequenziale per atomicita):**

1. **00-01 prima di tutto** — il bridge deve avere `dist/` prima che 00-04 possa verificare il link. Puo essere eseguito in parallelo a 00-02 tecnicamente, ma per chiarezza commit history: 00-01 prima.
2. **00-02 dopo 00-01** — Forge migration su branch feature `bridge-migration/zod-v4`. Nessuna dipendenza diretta dal bridge, ma ha senso ordinale eseguirli sequenzialmente.
3. **00-03 dopo 00-02** — stesso branch `bridge-migration/zod-v4` (piggyback). TS bump + tsconfig align dopo aver stabilizzato Zod. Evita round test ridondanti.
4. **00-04 ultimo** — richiede bridge scaffolding (00-01) + Forge allineato (00-03) per fare il test end-to-end sui tipi veri.

**Parallelizzabilita:** 00-01 e 00-02 sono tecnicamente parallelizzabili (repo diversi, zero overlap file). Default: sequenziali per manutenzione commit history lineare.

---

## Dependencies esterne

**Pre-requisiti gia completati (verificati 2026-04-14):**
- [x] Bridge repo creato su GitHub `App-Templates/x9-forge-contract` (privato, pushato)
- [x] Baseline tag `pre-bridge-migration-2026-04-14` su agent-x9 origin
- [x] Baseline tag `pre-bridge-migration-2026-04-14` su forge-v2 origin
- [x] VPS Hostinger snapshot eseguito da Stefano via hPanel

**Prerequisiti esterni:**
- agent-x9 e su `typescript@^6.0.2` — verificato `/Users/admintemp/Downloads/Claude/agent-x9/package.json:24`
- agent-x9 ha `exactOptionalPropertyTypes: true` — verificato `/Users/admintemp/Downloads/Claude/agent-x9/tsconfig.base.json:13`
- Forge v2 ha `@forge/types` workspace a `typescript@^5.0.0` — verificato `/Users/admintemp/Downloads/Claude/forge-v2/packages/types/package.json:20`
- Forge services (`vault`, `factory`, `workspace`, `voice`) hanno `zod@^3.0.0` e `typescript@^5.9.3` — verificato package.json di ogni service
- Forge service `docker` ha `zod@^3.0.0` e `typescript@^5.0.0` — verificato `services/docker/package.json`
- Forge v2 ha `pnpm-workspace.yaml` con `packages/*`, `services/*`, `gateway`, `api`, `web` — verificato `/Users/admintemp/Downloads/Claude/forge-v2/pnpm-workspace.yaml`

---

## Overall risk assessment

| Risk | Probabilita | Impatto | Mitigazione |
|------|-------------|---------|-------------|
| Zod v3→v4 breaking changes > stima (>50 fix) | Media | Medio — dilata 00-02 a piu giorni | Se emergono pattern sistematici (>50 fix), FLAG a Stefano per insertion point 00.1 (decisione gia definita in CONTEXT.md). Rollback = revert del commit merge |
| `exactOptionalPropertyTypes` cascade di errori > 50 | Media | Medio — dilata 00-03 | Se emerge lista >50 errori post TS bump, FLAG a Stefano. Decisione CONTEXT.md: insertion point 00.1. Rollback = revert del commit merge |
| Forge staging deploy post-migration fallisce | Bassa | Alto — blocca Phase 1 | VPS snapshot gia fatto. Rollback = restore snapshot + revert del merge in main. Smoke test obbligatorio pre-merge |
| `pnpm.overrides` + `link:` rompe risoluzione monorepo (pitfall P-04) | Bassa | Medio — blocca dev-loop | 00-04 include test esplicito. Se fallisce → fallback SHA pin per sviluppo (documentato) + apertura issue su pnpm |
| Bridge `prepare` script fallisce in clone consumer (pitfall P-15) | Bassa | Alto solo in Phase 1+ | Phase 0 non consuma bridge in produzione. 00-04 valida solo dev-loop. Fix defer a Phase 1 quando X9/Forge import producono Docker build |
| X9 runtime si rompe durante Phase 0 | **Zero** (per design) | N/A | **Phase 0 NON tocca X9**. Se un plan-task touch X9, BLOCCO a plan-check |
| Circular deps bridge → consumer (pitfall P-01) | **Zero** in Phase 0 | N/A | Bridge e vuoto (placeholder). Zero import da X9/Forge. Risk attivo a Phase 1+ |

**Escalation trigger (blocker per insertion point 00.1):**
- 00-02 emerge con >50 fix Zod → blocca, flag Stefano
- 00-03 emerge con >50 errori TS → blocca, flag Stefano
- Forge staging health check <17/17 container healthy post-deploy → blocca, rollback + investigation

---

## Rollback strategy (phase-wide)

### Scenario 1: 00-01 fallisce (bridge non builda o test rossi)
- Rollback: cancella tutto il contenuto del repo `x9-forge-contract-bridge` eccetto `.planning/` e `README.md` esistente, `git reset --hard <sha-precedente-sha-solo-docs>`
- Rischio residuo: nullo (nessun consumer dipende ancora)

### Scenario 2: 00-02 fallisce a meta (Zod migration rotta)
- Tutti i commit 00-02 sono su branch `bridge-migration/zod-v4`, non su `main`
- Rollback: `git checkout main && git branch -D bridge-migration/zod-v4`
- Main Forge resta a `zod@^3`, nessun impatto staging/produzione

### Scenario 3: 00-03 fallisce (cascade errori TS non risolvibili nei tempi)
- Stesso branch `bridge-migration/zod-v4` di 00-02
- Opzione A: mantieni 00-02 (Zod v4) mergiato, defer 00-03 a insertion point 00.1
- Opzione B: revert completo branch, resta Forge a `zod@^3` + `TS 5.9`
- Decisione binaria a Stefano al trigger > 50 errori

### Scenario 4: 00-04 rileva rottura dev-loop
- Rollback: rimuovi i blocchi `pnpm.overrides` dai package.json locali di X9 e Forge (non committati per design)
- Defer: investigazione pnpm team o fallback SHA pin temporaneo
- Non blocca Phase 1 (Phase 1 puo partire con SHA pin, dev-loop e ottimizzazione)

### Scenario 5: staging deploy fallisce post 00-02/00-03 merge
- VPS snapshot restore da hPanel (eseguito 2026-04-14)
- `git revert <merge-sha>` su Forge main
- Re-deploy Forge staging da main rollbackato
- Root cause analysis prima di ri-tentare merge

---

## Success criteria (phase-wide, binari)

Phase 0 e **completa** quando:

- [ ] `pnpm install && pnpm build && pnpm test` nel bridge passa verde (00-01)
- [ ] Bridge repo ha CI GitHub Actions verde su `main` (00-01)
- [ ] README bridge contiene: tabella contratti vuota (placeholder), sezione "How to add a new contract", policy breaking change (00-01, OBS-01, OBS-02, OBS-03)
- [ ] Forge v2 ha `zod@^4.x.x` in root lockfile (`pnpm why zod` → solo versioni `^4`) (00-02, MGRT-01)
- [ ] `pnpm test` alla root di forge-v2 passa verde (tutti i 5 service test verdi) (00-02)
- [ ] Forge v2 ha `typescript@^6.0.2` in tutti i workspace member (`pnpm why typescript` → solo `^6`) (00-03, MGRT-03)
- [ ] `packages/types/tsconfig.json` ha `exactOptionalPropertyTypes: true` (00-03, MGRT-02)
- [ ] `pnpm -r typecheck` passa verde su tutto forge-v2 (00-03)
- [ ] Forge staging deploy post-merge: `docker compose ps` mostra 17/17 container healthy (00-02+00-03 gate finale)
- [ ] Dev-loop test end-to-end (00-04): bridge modifica `DummyProbe` → X9 `tsc --noEmit` rileva cambio + Forge `tsc --noEmit` rileva cambio, entrambi in < 10s (BRDG-06)
- [ ] Cleanup post-verifica: `DummyProbe` rimosso dal bridge, `pnpm.overrides` rimossi dai consumer package.json root
- [ ] Branch `bridge-migration/zod-v4` mergiato in forge-v2 `main`
- [ ] Tutti i 12 requirement (BRDG-01..06, MGRT-01..03, OBS-01..03) marcati completi in REQUIREMENTS.md
- [ ] Phase 0 puo transizionare a Phase 1 senza blocker aperti

---

## Verification checklist pre-SUMMARY

Prima di scrivere SUMMARY e chiudere la phase:

- [ ] Ogni plan (00-01..00-04) ha il proprio SUMMARY markato complete
- [ ] `/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge` e stato buildato + testato localmente
- [ ] Forge v2 main ha i commit merged via PR review (no force-push)
- [ ] Forge v2 staging e sano per 30 minuti continui dopo il deploy (no restart loops, no 500 rate elevato)
- [ ] X9 NON e stato toccato (verificato: `git log --since=start-phase` in agent-x9 mostra zero commit Phase 0)
- [ ] Baseline tag `pre-bridge-migration-2026-04-14` e intatto su origin (non modificato)
- [ ] STATE.md aggiornato con esito Phase 0 (progress bar 4/22)
- [ ] REQUIREMENTS.md "Traceability" table aggiornata con status `Complete` per i 12 requirement

---

## Constraint compliance (check finale)

| Constraint non negoziabile | Verificato in Phase 0 |
|---|---|
| Verificare TUTTO sul codice prima di scrivere tipi | ✅ Ogni plan cita file:linea verificati (es. `forge-v2/packages/types/tsconfig.json:10`) |
| Zero regressioni — contract test obbligatori | ✅ 00-02 e 00-03 richiedono test baseline green prima e dopo |
| Migrazione incrementale, mai big-bang | ✅ 00-02 migra Zod un service alla volta (vault → factory → workspace → voice → docker → packages/types) |
| Backward compatibility cross-repo durante migration | ✅ Nessun contratto migrato in Phase 0, quindi nessun rischio cross-repo |
| X9 production continuity | ✅ Zero task Phase 0 tocca X9 runtime o VPS X9 |
| README update obbligatori | ✅ 00-01 include OBS-01..03 README bridge |
| Atomic commits + rollback sempre possibile | ✅ Ogni plan documenta commit atomici + rollback path |
| No `--force`, `--no-verify`, `rsync --delete` | ✅ Nessun comando distruttivo nei plans |

---

*Manifest Phase 0 scritto 2026-04-14*
*Prossimo step: esecuzione 00-01*
