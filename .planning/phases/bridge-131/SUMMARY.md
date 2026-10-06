# BRIDGE-131 — execution record

Status: IN CORSO. Base 515f84b (1.30.0), branch claude/bridge-131. Piano: PLAN.md. Autore: Claude S0.
Test sempre con `--maxWorkers=1 --testTimeout=60000`. Mutazioni su file committati, ripristino con
`git checkout HEAD -- <file>` dopo ogni prova, esito in `evidence/mutation-<id>.txt`.

| Task | Stato | Commit | Rosso | Verde | Mutazioni |
|---|---|---|---|---|---|
| 0 — guardia 1.30 | fatto | bbf64bb | n/a (guardia su codice esistente) | 23/23 | 1/1 uccisa (export tolto) |
| 1 — R1b gestione logica | fatto | 155cdbd, ac09bb8, 73e0e68 | 46/46 falliti (export assenti) | 48/48 | 23/23 uccise (2 sopravvissute al primo giro → test aggiunti) |

## Task 0
Snapshot export 1.30 per sottopercorso generato dal dist 1.30 (`tests/compat/bridge-130-exports.json`), test che
ogni simbolo resta esportato dalla stessa sorgente e che payload 1.30 (lista agenti legacy/canonica, reload/stop,
tool call con e senza ambito, vault resolve, registry, avvio chiamata voce) validano invariati.

## Task 1 — R1b
`src/agent/agent-management.ts` (export `./agent`), `src/http/endpoints/internal-agents-management.ts` (export `./http`).
Azioni logiche + apply-config, requestId con replay/conflitto (`sameAgentCommand`), versioni desired/applied/failed,
esito per bersaglio con motivo obbligatorio, esito complessivo derivato, apply riuscito ⇔ versione applicata = richiesta.
Riusati `AgentConfigVersionSchema`, `AgentRuntimeIdentitySchema`, `ReloadAgentParamsSchema` (stessi parametri di
reload/stop). Incidente di processo: il primo giro di mutazioni è partito su file non ancora committati (commit fallito
per un glob zsh); i file sono stati riscritti identici, il runner ora rifiuta file non tracciati o sporchi.

Ultimo aggiornamento: 07/10 01:10
