# REGISTRO-BRIDGE-148 — «Contratti del registro: notifiche dei consumer e lavoro in corso nello stato»

Autore del piano: l'agente Opus dell'analisi (capo tecnico del «Registro modelli»), 13/10/2026, sotto il via di Stefano.
Riferimento: `/Users/admintemp/Downloads/Claude/forge-v2-bacheca/piani/PIANO-REGISTRO-MODELLI-1310.md` (lotti B1 e B2, bridge 1.48.0).

- **Feature:** F2/F3 del piano (pagina istantanea, lavori in coda). È un prerequisito: non è usabile da solo.
- **Repo:** `/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge` (NON forge-v2, NON agent-x9). **Worktree:** `/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-193-2`.
- **Base:** `524b5fad8eafaf39ad0fe5d14f23c874485ebef4` (bridge 1.47.0, la SHA che la produzione X9 711f610e ha fissata nel suo `package.json:29`). **Ramo:** `codex/registro-bridge-148`.
- **Autore:** Codex F. **Verifica:** Codex B più x9-contract-bridge-auditor. **Revisione d'architettura:** l'agente Opus.
- **Numero di versione:** 1.48.0 (aggiunte compatibili). **Il numero, il `CHANGELOG.md`, `package.json` e `dist/` NON li committa il Codex:** li assegna la coordinatrice al rilascio. Scrivi nel SUMMARY il testo proposto per il CHANGELOG.
- **Cambia lo stack:** sì. Sono contratti aggiuntivi del piano «Registro modelli», approvato da Stefano il 13/10: «Fallo fare all'agente opus che ha fatto l'analisi così prosegue con il contesto»; e il suo «si» del 13/10 all'assegnazione dei pezzi ai Codex tramite Opus.

## Perché (in parole semplici)

Oggi X9 deve «chiedere a ogni servizio» come sta per ricostruire lo stato dei modelli (circa 420 chiamate per ogni lettura) e un comando lungo fa aspettare chi lo ha chiesto. Il piano del registro vuole il contrario: i servizi **avvisano** X9 quando cambiano (B1) e lo stato può dire «lavoro in corso, a questo punto» invece di far aspettare o fallire (B2). Qui si scrivono solo i **contratti** (il formato dei messaggi): nessuno li usa finché Forge e X9 non adottano la 1.48.0.

## Perimetro

- **Scrivibili:**
  - `src/http/endpoints/internal-models-batch.ts`
  - `src/model-router/agent-model-configuration.ts`
  - `src/agent/agent-management.ts`
  - nuovi test: `tests/model-router/model-consumer-report-http.test.ts`, `tests/model-router/agent-models-pending.test.ts`, `tests/agent/agent-command-in-progress.test.ts`
  - `.planning/phases/registro-bridge-148/**`
- **Vietati:**
  - `dist/**`, `package.json`, `CHANGELOG.md`, `pnpm-lock.yaml`
  - ogni `src/**/index.ts` (le esportazioni passano già da sole: `src/http/endpoints/index.ts:57`, `src/http/index.ts:40`, `src/model-router/index.ts:51`, `src/agent/index.ts:56`)
  - `src/agent/agent-model-management-values.ts` e `src/model-router/model-consumers.ts` (toccati dalla linea di composizione Capacità `ee648e11`: non vanno toccati qui, per non creare conflitti)
  - ogni altro file di `src/`, `scripts/**`, `.github/**`
- **Se `pnpm build` modifica `dist/`:** non va committato. Prima di ripristinarlo controlla con `git -C <worktree> rev-parse --show-toplevel` di essere nel worktree giusto (R-15).

## Esistente (R-35)

- **Cosa c'è già:**
  - contratti stato e installazione serviti dai consumer (`src/http/endpoints/internal-models-batch.ts:37-48`) e modello del percorso con il suo aiuto (`agentModelsStatePath`, `:31-33`);
  - schema dello stato, stretto, in `src/model-router/agent-model-configuration.ts:153-175`;
  - `sourceVersion` è una stringa opaca da 1 a 128 caratteri (`agent-model-configuration.ts:89`, `:115`, `:135-141`; `src/model-router/model-slot.ts:8`);
  - motivo `'in-progress'` già nel contratto (`src/agent/agent-model-management-values.ts:16-27`) e già restituito da X9 (`agent-x9@711f610e services/agent-core/src/core/agent-management.ts:322-328`);
  - codice d'errore `idempotency_conflict` (`src/http/endpoints/internal-agents-management.ts:29-37`);
  - corpo riusabile: `ModelConsumerRuntimeStateSchema`;
  - intestazione `INTERNAL_SECRET_HEADER` (`src/auth/auth-headers.ts:11`).
- **Da non riusare:** `isModelConsumerRouteRequestMatching` (`src/http/endpoints/model-consumer-execution.ts:105-109`) accetta solo i corpi di stato e installazione. Per la notifica serve un aiuto proprio.
- **Cosa NON cambia:** nessun campo o elenco esistente, nessuna forma di versione, i contratti di stato, installazione e comandi.
- **Vecchio Forge (origin/main 4f3fc42):** `services/vault/src/routes/vault.ts:596-640`. Le scelte si scrivevano nel vault con PUT/DELETE sincroni, senza nessuno stato d'applicazione. Non c'è niente da riusare nel protocollo; il comportamento da mantenere è «il cambio vale subito», che B2 rende osservabile (in corso → applicato).
- **Si riscrive?** No: aggiunte in tre file.

## Cosa si costruisce

- **B1 — notifica dei consumer verso agent-core:**
  - `internalModelConsumerReportContract`: POST `/internal/models/consumer-reports/:slotId`, servito da agent-core (prefisso distinto, per non confonderlo con le rotte servite dai consumer);
  - `authType 'secret'` con `INTERNAL_SECRET_HEADER`;
  - parametri `{ slotId: ModelSlotIdSchema }` stretti; corpo `ModelConsumerRuntimeStateSchema`; risposta `{ ok: true }` stretta;
  - più `modelConsumerReportPath(slotId)` e `isModelConsumerReportMatching(params, body)`: lo slot del percorso deve essere uguale a quello del corpo.
- **B2a — lavoro in corso nello stato:**
  - `pending` facoltativo e annullabile in `AgentModelsStateSchema`, con `AgentModelsPendingWorkSchema` stretto;
  - campi: `requestId`; `kind` ('initial' | 'apply'); `desiredVersion`; `phase` ('accepted' | 'installing' | 'publishing' | 'failed'); `startedAt`, `updatedAt`; `slots[]` con `slotId`, `status` ('waiting' | 'installed' | 'pending' | 'failed') e `progress { completed, total }` facoltativo; `failure { slotId | null, code }` facoltativo;
  - regole interne: slot unici e registrati; `completed` ≤ `total`; `updatedAt` ≥ `startedAt`; `phase` 'failed' se e solo se c'è `failure`; `kind` 'initial' implica versione 1;
  - regole sullo stato: 'initial' implica `saved` nullo; 'apply' implica `saved` presente; `pending` può coesistere con `initialSource`.
- **B2b — aiuto e significati:**
  - `isAgentManagementCommandInProgress(result)`: vero solo se il risultato è valido, l'azione è `apply-config`, ogni esito non riuscito ha motivo `'in-progress'` (almeno uno), e `versions.applied` è diverso dalla versione richiesta;
  - commenti sui campi:
    - `sourceVersion`: i produttori dovrebbero usare l'impronta del contenuto pubblico dichiarato (X9 da X3); i consumatori la trattano come opaca e la confrontano solo per uguaglianza;
    - `observedAt`/`validUntil`: la finestra in cui il produttore attesta il contenuto.

## Trasversalità (R-31)

- Cosa si costruisce: contratti del bridge per le notifiche dei consumer e per il lavoro in corso nello stato di un agente.
- Capacità riusate: gli schemi e gli aiuti esistenti di `model-router` e `agent` (nessun nuovo motore).
- Parte trasversale: valgono per tutti i consumer (memory, voice-live, voice; rag, stt e scheduler quando saranno promossi) e per lo stato di ogni agente.
- Pannello Forge: Forge › Modelli.
- Parte non trasversale: nessuna.

## Fruibilità (R-34)

- **Di cosa si occupa:** il formato dei messaggi fra servizi X9 e fra X9 e Forge sul tema dei modelli.
- **Obiettivo di sviluppo:** contratti validati, con test, build e controlli di pacchetto verdi. **Obiettivo di rilascio:** bridge 1.48.0, poi F5 (Forge e X9 lo adottano senza usare i campi nuovi), poi X4/X5/X6.
- **Cosa potrà fare l'utente:** niente da solo, è solo un contratto.
- **Cosa abilita:**
  - le notifiche (R3 e S1–S4): un registro aggiornato senza riletture e la pagina istantanea (F2);
  - il lavoro in corso con avanzamento (W1–W3 e F1a): cambi che arrivano in fondo da soli (F3).
- **Manca qualcosa che rende inutile il rilascio?** Da solo sì, per costruzione: il bridge viene prima di F5, F5 prima di X4 e X6. Non si rilascia in produzione da solo.

## Corrispondenza aspettativa e tavola (R-34)

- «Questa cosa dei tempi di risposta… risolvere il problema a monte… non con patches» → B1 sostituisce le riletture con notifiche → test del contratto, poi R3.
- «il mio agente cambierà modello real time» → B2 rende visibile «in corso / applicato» invece di aspettare o fallire → test di `pending` e dell'aiuto.
- Tavola: non serve, nessuna interfaccia toccata.

## Lotti (45 minuti l'uno, un commit revertibile l'uno; massimo 3 tentativi per lotto)

1. **B1 — contratto, aiuti e test.** Commit: `feat(models): consumer report contract from consumer services to agent-core`.
2. **B2a — `pending` e test.** Commit: `feat(models): optional pending work in the agent models state`.
3. **B2b — aiuto `in-progress`, commenti e test.** Commit: `feat(agent): name the existing in-progress command outcome and document source versions`.
4. **Validazione, senza commit:** `pnpm build`, `check:dts`, `check:pack`, `test` una sola volta; `dist/` ripristinato; testo proposto per il CHANGELOG nel SUMMARY.

**Condizioni di uscita:** tsc ed eslint puliti; test verdi una volta; build e controlli di pacchetto riusciti in locale; tutte le mutazioni rosse; SUMMARY.

## Prove e mutazioni (una mutazione rossa per ogni controllo nuovo)

- **B1:**
  - casi: corpo valido accettato; slot diverso fra percorso e corpo rifiutato; slot non registrato rifiutato; campi in più rifiutati; percorso costruito dall'aiuto; intestazione presa dal bridge, mai scritta a mano;
  - mutazioni: togliere il confronto percorso/corpo; risposta non stretta; aiuto del percorso senza validazione dello slot.
- **B2a:**
  - casi: stato senza `pending` valido; con `pending` valido; slot duplicato, slot non registrato, `completed` > `total`, 'failed' senza `failure`, 'initial' con `saved` presente: tutti rifiutati;
  - mutazioni: una per ciascuna regola, più rendere `pending` obbligatorio.
- **B2b:**
  - casi: il risultato `'in-progress'` nella forma esatta di X9 è vero; il risultato `ok` è falso; un altro motivo è falso; `applied` uguale alla versione richiesta è falso;
  - mutazioni: una per ciascuna condizione.
- **Forma di produzione (R-33/R-34):** dati catturati dalla coordinatrice in sola lettura e senza segreti, in `/Users/admintemp/Downloads/Claude/forge-v2-bacheca/piani/dati-reali-1310/`:
  - `stato-master.json`: lo stato reale del Master da `GET /internal/agents/x9-staging/models/state` (10 scelte, 24 esclusi), letto con e senza `pending`: entrambi validi;
  - `stato-memory-embedding.json`: lo stato reale di memory_embedding (installato, 490/490), usato come corpo di notifica: valido; con lo slot cambiato: rifiutato.
  - Finché i file non ci sono, scrivi i lotti 1-3; usa i file nel lotto 4. Se mancano alla fine, scrivilo nel SUMMARY come limite.

## Carico e metodo

- Node 24 (il `.nvmrc` del bridge è 24; controlla `node -v`). Percorsi assoluti e `git -C <abs>` / `pnpm -C <abs>` su ogni comando (R-15).
- `pnpm -C /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-193-2 test`: lo script usa già `--maxWorkers=2`; una sola volta alla consegna.
- Prendi un posto con `/Users/admintemp/bin/x9-posti prendi --chi forge-v2-bacheca-codexF-registro-bridge148` prima della suite e rilascialo dopo. Se il Mac è sotto pressione di memoria, aspetta.

## Consegna

- SUMMARY di al massimo 30 righe con «## Fruibilità alla consegna (R-34)» e il testo proposto per il CHANGELOG.
- Nessun push (lo fa la coordinatrice), nessun rilascio, nessun tocco a produzione o VPS, nessun segreto nei file.

## Rischi e ritorno

- **Rischio principale:** lo schema dello stato è stretto. Se X9 emettesse `pending` prima che Forge abbia adottato la 1.48.0, Forge non riuscirebbe più a leggere lo stato. Ordine obbligato: bridge → F5 (adozione senza uso) → X9 emette, sotto interruttore.
- **Ritorno:** il ramo non è adottato da nessuno finché non arriva F5; si revertono i commit; la numerazione resta alla coordinatrice.
- **Dipendenze:** il bridge viene prima di F5; F5 prima di X4 e X6; la linea di composizione Capacità (`ee648e11`, 1.47.0, +46 commit) e cap-dev P01 si ricompongono sopra (probabile numero 1.49.0, deciso dalla coordinatrice).
