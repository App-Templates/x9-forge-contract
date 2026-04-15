# Phase 0 Plan Review — Goal-Backward Assessment

**Reviewed:** 2026-04-14
**Plans reviewed:** 00-PLAN.md + 00-01-PLAN.md + 00-02-PLAN.md + 00-03-PLAN.md + 00-04-PLAN.md
**Verdict:** PASS CON FIX MINORI
**Score:** 8.5/10

---

## Executive verdict

I quattro plan coprono integralmente i 6 success criteria del ROADMAP.md, tutti i 12 requirement di Phase 0 (BRDG-01..06, MGRT-01..03, OBS-01..03) e i 3 constraint research mandate critici per questa phase. La struttura a commit atomici con rollback per ogni task e esemplare. Gli step di verifica (binari e verificabili) sono una forza del piano. I should-fix rilevati sono due: un'incoerenza `git+ssh` vs `git+https` tra REQUIREMENTS.md e CONTEXT.md (il piano segue correttamente CONTEXT.md ma REQUIREMENTS.md va aggiornato), e un'incompatibilità dell'engine `pnpm>=10` del bridge con i consumer che usano pnpm 9.x. Nessun blocker blocca l'esecuzione se i due should-fix vengono risolti prima o durante 00-01. I plan sono pronti per l'esecuzione.

---

## 1. Goal-backward coverage

| Success Criterion (ROADMAP.md) | Plan(s) | Task(s) che lo consegna | Copertura |
|---|---|---|---|
| SC-1: `pnpm install && pnpm build && pnpm test` verde nel bridge | 00-01 | 00-01.1 (package.json), 00-01.2 (tsconfig + src), 00-01.3 (vitest + test) | Completa |
| SC-2: Forge v2 compila con zod@4 + TS 6.0.2 + exactOptionalPropertyTypes; 229 test passano | 00-02 + 00-03 | 00-02.1..6 (Zod migration service per service), 00-03.1..3 (TS bump + flag) | Completa |
| SC-3: Forge staging deploy verificato sano post-bump (17/17 container healthy) | 00-02 (Task 00-02.7) + 00-03 (Task 00-03.4) | Gate staging deploy con checkpoint Stefano obbligatorio prima di merge in main | Completa |
| SC-4: Consumer test `import { foo } from '@x9-forge/contracts'` compila | 00-04 | 00-04.0 (DummyProbe), 00-04.2 (X9 import type), 00-04.3 (Forge import type) | Completa |
| SC-5: README con "How to add a new contract" + tabella contratti | 00-01 | 00-01.4 (README skeleton OBS-01..03) | Completa |
| SC-6: Dev loop `pnpm.overrides` link funziona — modifica bridge → consumer vede cambio | 00-04 | 00-04.4 (round-trip test empirico con DummyProbe) | Completa |

---

## 2. Requirements coverage

| Requirement | Plan | Task(s) | Status |
|---|---|---|---|
| BRDG-01 (git+https URL + prepare script) | 00-01 | 00-01.1 (package.json con prepare), 00-01.4 (README documenta URL) | Coperto |
| BRDG-02 (sub-path exports) | 00-01 | 00-01.1 (exports field), 00-01.2 (src layout 6 sub-domini) | Coperto |
| BRDG-03 (tsconfig strict + exactOptionalPropertyTypes + noUncheckedIndexedAccess + ES2023 + NodeNext) | 00-01 | 00-01.2 (tsconfig.json con tutti i flag) | Coperto |
| BRDG-04 (Zod v4 + z.infer pattern) | 00-01 | 00-01.1 (devDep + peerDep zod@4), 00-01.3 (smoke test z.object) | Coperto |
| BRDG-05 (exports + files field) | 00-01 | 00-01.1 (package.json shape completa) | Coperto |
| BRDG-06 (dev loop pnpm.overrides link verificato) | 00-04 | 00-04.1..4 (abilitazione + test round-trip) | Coperto |
| MGRT-01 (Forge zod@4) | 00-02 | 00-02.1..6 (migration incrementale 5 service + lockfile consolidation) | Coperto |
| MGRT-02 (Forge exactOptionalPropertyTypes in packages/types/tsconfig.json) | 00-03 | 00-03.3 (abilita flag + fix cascade) | Coperto |
| MGRT-03 (Forge TS 6.0.2) | 00-03 | 00-03.1 (bump TS in tutti i workspace member) | Coperto |
| OBS-01 (README tabella contratti) | 00-01 | 00-01.4 (sezione "Contracts coverage") | Coperto |
| OBS-02 (README How to add a new contract) | 00-01 | 00-01.4 (sezione "How to add a new contract") | Coperto |
| OBS-03 (README breaking change policy) | 00-01 | 00-01.4 (sezione "Breaking change policy") | Coperto |

Tutti i 12 requirement coperti. Nessun gap.

---

## 3. Research mandate compliance (8 vincoli PROJECT.md)

| Vincolo | Rispettato? | Evidenza nei plan |
|---|---|---|
| 1. Verificare TUTTO sul codice prima di scrivere tipi | Parzialmente — citazioni file:linea presenti ma con un off-by-one (vedi §5) | 00-02 e 00-03 citano file:linea verificati. 00-PLAN cita `agent-x9/package.json:24` ma la riga effettiva di typescript e la :25. Differenza non operativa. |
| 2. Zero regressioni — contract tests obbligatori | Si | 00-02.0 cattura baseline test count (`/tmp/forge-baseline-tests.log`). 00-02.6 fa diff post-migration. 00-03.0 cattura baseline typecheck. Ogni task ha `pnpm -r test` come gate. |
| 3. Migrazione incrementale, mai big-bang | Si — esemplare | 00-02 migra un service alla volta (vault → factory → workspace → voice → docker → packages/types). Commit atomico per ogni step. |
| 4. Backward compatibility cross-repo durante migration | Si — per design | Phase 0 non migra nessun contratto. Il bridge e vuoto. Zero rischio cross-repo. Il vincolo diventa rilevante da Phase 1+. |
| 5. X9 production continuity | Si — garantito strutturalmente | Phase 0 non tocca X9 runtime ne VPS X9. 00-04 usa solo branch temporanei mai mergiati in main X9. Checklist finale: `git log agent-x9 --since=start → zero commit`. |
| 6. README update obbligatori (DoD) | Si | OBS-01..03 sono requirement di Phase 0. 00-01.4 aggiorna README con 3 sezioni obbligatorie. |
| 7. Non reinventare Forge multi-tenant | Si | Phase 0 non tocca logica Forge. Solo bump dipendenze (Zod, TS, tsconfig). |
| 8. Non reinventare X9 multi-agent | Si | Phase 0 non tocca X9 runtime. BRDG-06 usa solo `import type` temporaneo su branch dev. |

---

## 4. Pitfall coverage

### Pitfall CRITICAL coperte per Phase 0

| Pitfall | Severity | Come affrontata |
|---|---|---|
| P-01 Compat shim loop (bridge importa dai consumer) | CRITICAL | Bridge Phase 0 ha solo `export {}` placeholder. Zero import da X9/Forge. ESLint rule pianificata per Phase 7. Il plan 00-01 esplicita: "bridge non importa MAI da X9/Forge". |
| P-03 Zod schema drift da TS type manuale | CRITICAL | 00-01.3 usa `z.object()` direttamente (pattern corretto). Il vincolo `z.infer` e nel README. Pattern sistematico rimandato a Phase 1 quando arrivano contratti reali. |
| P-04 Version drift tra consumer (pnpm workspace non unificato) | CRITICAL | 00-04.1 e 00-04.3 testano `link:` che crea symlink esplicito. 00-04.1 cita fallback se pnpm non crea il symlink. 00-02.6 fa `pnpm why zod` finale per garantire unica versione. |
| P-14 exactOptionalPropertyTypes asimmetria bridge/Forge | HIGH | 00-03.3 abilita la flag in `packages/types/tsconfig.json`. 00-01.2 setta la flag nel bridge. Plan esplicita che X9 gia la ha. Allineamento completo post-Phase 0. |

### Pitfall non rilevanti per Phase 0 (correttamente escluse)

- **P-02** (compile vs runtime gap al boundary HTTP): rilevante da Phase 1+ (endpoint contracts). Phase 0 non aggiunge endpoint.
- **P-05** (breaking change senza atomic cross-repo release): rilevante da Phase 1+.
- **P-06** (AgentCredentials migration): Phase 2.
- **P-07** (VaultEntry AES vs plain): Phase 5.
- **P-08** (Model Router contracts freeze): Phase 6.
- **P-15** (Docker build rompe bridge risoluzione): citata correttamente in 00-04 come "OUT OF SCOPE" con nota hand-off a Phase 1.

### Pitfall parzialmente affrontata

- **P-12 Barrel sprawl**: 00-01 usa sub-path exports correttamente, ma il barrel root `src/index.ts` ha solo `export {}`. Il rischio che Phase 1+ accumuli re-export nel barrel root e reale ma documentato ("evitare"). Non e un blocker Phase 0.

---

## 5. Fact accuracy spot-check

Verifica di 9 citazioni file:linea dai plan su codice reale:

| Claim nel plan | File reale verificato | Risultato |
|---|---|---|
| `agent-x9/tsconfig.base.json:13` → `exactOptionalPropertyTypes: true` | Riga 13: `"exactOptionalPropertyTypes": true,` | CORRETTO |
| `agent-x9/package.json:24` → `typescript@^6.0.2` | Riga 24: `"turbo": "^2.5.0"`. La riga di typescript e la **25**. | OFF-BY-ONE (non operativo) |
| `forge-v2/packages/types/package.json:20` → `typescript@^5.0.0` | Riga 20: `"typescript": "^5.0.0"` | CORRETTO |
| `forge-v2/packages/types/tsconfig.json:11` → ha solo `strict: true` | Riga 11: `"strict": true,` (confermato: no exactOptionalPropertyTypes) | CORRETTO |
| Forge ha `pnpm-workspace.yaml` con `packages/*`, `services/*`, `gateway`, `api`, `web` | Verificato: esatto match | CORRETTO |
| Forge services hanno `zod@^3.0.0` (vault, factory, workspace, voice, docker) | Verificato su package.json di tutti e 5 | CORRETTO |
| Forge `services/docker` ha `typescript@^5.0.0` (non ^5.9.3) | `docker/package.json` devDependencies: `"typescript": "^5.0.0"` | CORRETTO |
| "229 test distribuiti 51+62+79+24+13" | `it()` count: vault=51, factory=62, workspace=79, voice=24, docker=13. Totale: 229. | CORRETTO (su 5 file `.test.ts`, uno per service) |
| Bridge e X9 e Forge siblings sotto `/Downloads/Claude/` | `ls` conferma agent-x9, forge-v2, x9-forge-contract-bridge allo stesso livello | CORRETTO |

**Unico mismatch:** off-by-one in `agent-x9/package.json:24` (typescript e alla riga 25). Differenza non operativa: il valore `^6.0.2` e correttamente citato. Tutti gli altri 8 claim sono verificati corretti.

---

## 6. Atomic commit discipline

**Giudizio: PASS — esemplare**

Ogni task produce un commit atomico con messaggio convenzionale esplicito (es. `chore(forge-vault): migrate zod v3 → v4`). L'ordine di commit garantisce che ogni SHA lasci il repo in stato deployabile (test verdi dopo ogni commit). Rollback per ogni task e `git reset --hard HEAD~1` (commit singolo) o `git checkout main && git branch -D <branch>` (branch completo). Nessun force push senza OK Stefano esplicito — correttamente documentato. La sequenza di staging deploy con checkpoint Stefano (00-02.7 e 00-03.4) prima del merge in main e il pattern corretto. Punti di forza:

- 00-02 mantiene tutto su branch `bridge-migration/zod-v4` fino a staging verde
- 00-04 usa branch `dev-loop-verify` mai mergiato in main dei consumer
- VPS snapshot pre-esistente (eseguito 2026-04-14) come ancora di rollback finale

---

## 7. Risk assessment

**Giudizio: PASS**

La tabella rischi nel 00-PLAN e accurata. Le stime di probabilita e impatto sono realistiche:

- "Zod v3→v4 breaking changes >50 fix" classificato come probabilita Media: corretto (il changelog Zod v4 ha refactoring API `.passthrough()`, `.strict()`, metodi top-level come `z.email()`).
- "exactOptionalPropertyTypes cascade >50 errori" classificato Alta (50%+) in 00-03: onesto e conservativo. Forge oggi non ha la flag, pattern `field?: string | undefined` e probabilmente diffuso.
- Escalation trigger espliciti (>50 fix → flag Stefano, insertion point 00.1): decisione pre-autorizzata da Stefano in CONTEXT.md.
- "X9 runtime si rompe durante Phase 0" classificato Zero per design: corretto e verificabile (no commit su X9 main).

L'unica lacuna minore: il rischio che il `prepare` script del bridge faccia rebuild ogni `pnpm install` nei consumer (lentezza CI) e citato ma classificato come deferrable a Phase 1. Per Phase 0 (nessun consumer importa il bridge in CI) e accettabile.

---

## 8. Dependency graph

**Giudizio: PASS**

```
00-01 (bridge scaffolding) → indipendente
00-02 (Forge zod@4 migration) → indipendente da 00-01, puo partire in parallelo
00-03 (Forge TS 6 + exactOptionalPropertyTypes) → dipende da 00-02 (stesso branch, piggyback)
00-04 (dev-loop verification) → dipende da 00-01 (bridge buildato) + 00-03 mergiato in main Forge
```

Il grafo e coerente e acyclico. Le onde di esecuzione raccomandate (sequenziale per chiarezza commit history) sono valide. La parallelizzabilita di 00-01 e 00-02 e documentata correttamente come opzionale. 00-04 ha le due dipendenze upstream corrette (bridge con `dist/` + Forge allineato).

---

## 9. Success criteria verifiability

**Giudizio: PASS**

Tutti i success criteria dei singoli task sono binari e verificabili con comandi specifici. Esempi rappresentativi:

- `pnpm install` exit code 0 + `cat node_modules/zod/package.json | grep version` → versione `^4.x` — BINARIO
- `pnpm why zod` mostra ZERO reference a `zod@^3.x` — BINARIO
- `grep "exactOptionalPropertyTypes" packages/types/tsconfig.json` → match — BINARIO
- Round-trip dev-loop: modifica DummyProbe → errore TS nel consumer entro 1 typecheck run — BINARIO
- 17/17 container `healthy` nel `docker compose ps` — BINARIO

Nessun criterio vago trovato. La verifica finale pre-SUMMARY in ogni plan lista esattamente le condizioni richieste.

---

## 10. Out of scope discipline

**Giudizio: PASS**

I piani si mantengono rigorosamente in scope Phase 0. Verificato che NESSUNO dei seguenti elementi deferred da CONTEXT.md appare nei plan:

- CI/CD release pipeline del bridge → assente
- Deploy Key SSH su VPS → assente (correttamente notato in 00-04 "Note per Phase 1")
- ts-rest upgrade → assente
- Contratti reali migrati → assente (solo DummyProbe placeholder rimosso al termine di 00-04)
- Typed HTTP client (`createBridgeClient`) → assente
- Modifiche a X9 runtime → assente

La sezione "Fuori scope" in ogni plan e esplicita e coerente con CONTEXT.md `<deferred>`.

---

## Blocker issues (MUST fix prima di execute)

Nessun blocker. I plan sono eseguibili.

---

## Should-fix issues (consigliabili, non blocker)

**Should-fix 1 — Incoerenza REQUIREMENTS.md vs CONTEXT.md su BRDG-01 (git+ssh vs git+https)**

I plan seguono correttamente la decisione locked in CONTEXT.md (`git+https`) ma REQUIREMENTS.md alla riga BRDG-01 recita ancora `git+ssh://`. Chi legge REQUIREMENTS.md in isolamento ha un'informazione obsoleta. Aggiornare REQUIREMENTS.md prima dell'esecuzione di 00-01.

File da aggiornare: `.planning/REQUIREMENTS.md`, riga BRDG-01
Fix: cambiare `git+ssh://<host>/<repo>#<SHA>` in `git+https://github.com/App-Templates/x9-forge-contract.git#<SHA>`

**Should-fix 2 — Bridge `engines.pnpm >= 10` incompatibile con X9 (pnpm@9.15.9) e Forge (pnpm>=9)**

Il package.json del bridge in 00-01.1 dichiara `"pnpm": ">=10.0.0"` ma X9 usa `packageManager: pnpm@9.15.9` e Forge richiede `pnpm>=9`. Quando Forge o X9 fanno `pnpm install` (con `prepare` che builda il bridge), pnpm potrebbe rifiutare l'engines check.

Fix: abbassare engines bridge a `"pnpm": ">=9.0.0"` per compatibilita con i consumer attuali, oppure upgradare X9 e Forge a pnpm 10 prima dell'esecuzione di 00-04. Se si upgrada pnpm nei consumer, farlo come task esplicito.

---

## Nits (opzionali)

**Nit 1 — Off-by-one in citazione `agent-x9/package.json:24`**

La citazione dovrebbe essere `:25` (typescript e alla riga 25, non 24). Non impatta l'esecuzione ma potrebbe confondere chi legge il plan e apre il file.

**Nit 2 — Smoke test `node -e "import(...)"` in 00-01.2 step 6 richiede package name risolto**

Il comando `node -e "import('@x9-forge/contracts').then(m => console.log(Object.keys(m)))"` presuppone che `@x9-forge/contracts` sia risolto globalmente. Dato che viene eseguito dalla root del bridge (non da un consumer), e il package stesso che lo chiama, richiede che `package.json.exports` punti a `dist/index.js` che esiste. Il test funziona ma e un po' fragile (richiede che node usi il `node_modules` locale). Un test piu robusto: `node dist/index.js` direttamente. Nit, non blocker.

**Nit 3 — `ignoreDeprecations: "6.0"` presente in X9 tsconfig.base.json ma non nel bridge tsconfig**

X9 ha `"ignoreDeprecations": "6.0"` per silenziare warning TS 6 su alcune API deprecate. Il bridge usa TS 6.0.2 ma non ha questa flag. Potrebbe generare warning durante build. Vale la pena aggiungerla se emergono warning durante 00-01.2.

---

## Final recommendation

**PASS CON SCORE 8.5/10 — pronto per execute dopo i due should-fix**

I due should-fix (REQUIREMENTS.md BRDG-01 e engines pnpm versione) sono risolvibili in meno di 10 minuti prima o durante l'esecuzione di 00-01. Raccomandazione operativa:

1. Aggiornare REQUIREMENTS.md BRDG-01 (`git+ssh` → `git+https`) — 2 minuti
2. Decidere la strategia pnpm: abbassare engines bridge a `>=9` oppure aggiornare X9/Forge a pnpm 10 prima di 00-04 — 5 minuti
3. Eseguire `00-01 → 00-02 → 00-03 → 00-04` nell'ordine indicato in 00-PLAN.md

Il piano e strutturalmente solido, ben documentato, rispetta tutti i vincoli architetturali e di qualita del progetto.

---

*Review scritta: 2026-04-14*
*Reviewer: plan-checker (goal-backward)*
