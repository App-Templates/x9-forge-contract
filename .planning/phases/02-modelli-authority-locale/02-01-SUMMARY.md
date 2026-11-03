---
phase: 02-modelli-authority-locale
plan: 01
status: author_verified_contract_runtime_pending
subsystem: http
provides: [source-only local model observation contract checkpoint]
requirements-completed: []
key-files:
  created: [src/http/endpoints/internal-agent-model-source-observation.ts, tests/model-router/agent-model-local-source-http.test.ts]
  modified: [src/http/endpoints/index.ts]
---
# Phase 02 checkpoint — STOP di Stefano

Ordine coordinatrice20261009-112545: «STOP ORA, ordine di Stefano: Ferma tutto, ferma tutto. Finite solo il comando in corso, committate quello che è già verde, aggiornate il SUMMARY e fermatevi. Nessun lavoro nuovo, nessuna verifica, nessun messaggio, finché la coordinatrice non scrive RIPARTITE.» Ricevuto11:26 al termine delle mutazioni endpoint; nessun lavoro successivo oltre salvataggio checkpoint, questo riepilogo e rilascio posto.

Checkpoint sorgente **4d30c39**, branchcodex/c5-modelli-consumatori-bridge, worktree156. Piano approvato93c45d0, contesto f9dc902. Fase incompleta, non consegnata né pubblicata; nessuna verifica indipendente richiesta per questo checkpoint.

## Implementato e testato prima dello STOP

Task1: internalAgentModelSourceObservationContract, GET /internal/agents/:agentId/models/local-source, agentModelSourceObservationPath. Risposta ESATTA AgentModelSourceObservationSchema già esistente; secret/header/params canonici, export dal barrelHTTP esistente. È il solo contratto di lettura locale, senza handler o chiamata runtime.

Prove rosse iniziali17/17 asserzioni per API assenti. Dopo implementazione, primo giro53casi:52passati/1fallito per un'aspettativa errata nel test (exportHTTPdalroot, che storicamente espone solo model-router). Corretto il test per confrontare i due barrelHTTP esistenti, senza aggiungere export alroot. Qualifica finale endpoint17/17,0skip; **8/8mutazioni** method/path/auth/header/params/response/helper-validation/barrel con AssertionError, ripristino byteesatto e freshgreen17/17 dopo OGNI mutazione. Gli altri36casi del primo giro erano verdi ma non rieseguiti dopo la correzione del test: nessuna qualifica full/regressione finale dichiarata.

Raw: workspace work/c5-authority-locale/endpoint-red.json, endpoint-green.json (diagnostico52/53), endpoint-mutations.json e singoli endpoint-*-red/restored.json/log. L'errore di aspettativa è un tentativo di harness, non una mutazione qualificata.

## Da riprendere SOLO dopo RIPARTITE

Task2 non iniziato nel repo: AgentModelInitialSourceSchema/type, isAgentModelInitialSourceCurrent, state.initialSource e rifattorizzazione condivisa NON implementati. B111549 ha confermato stessi campi/refinements/freshness del Bootstrap salvo assenza del ruolo, nessun60s aggiunto; oldBootstrapmaster-only invariato. Scelta comunicata B/D/E111832–111836. Draft privati in work/c5-authority-locale: agent-model-initial-source.test.ts, implement.py initial, model-local-authority-smoke.mjs, model-local-authority-types.mts/.cts; NON copiati nei sorgenti né eseguiti. Prima di eseguirli, rileggere piano/contesto e fare REDprima codice.

Task3 non iniziato: nessuna suite completa, typecheck/lint/build/check:dts/check:pack, prova compiled/type o distparity eseguita per questa fase. **dist resta deliberatamente quello della precedente1.45 e NON contiene il nuovoendpoint. Questo SHA non è installabile/rilasciabile come feature completa.** Nessun packageversion/lock/dependency modificato. Serve generare e qualificare tutta la distribuzione prima di qualunque richiesta di pubblicazione; seguono code-review GSD, goalverification e revisionealtroCodex. I risultati Phase1a510 non sono prove di questo delta.

Posta E112309 chiedeSHAquandoqualificato: letta, non risposto per STOP. Decisione coor105235 resta presa. OrdineSTOP112545 letto; nessun messaggio inviato dopoSTOP. Non avviare verifiche o nuovi task duranteSTOP.

## Fruibilità alla consegna (R-34)

- **La feature è completa?** No. Checkpoint del solo sorgente del contrattoGET; fase02 incompleta, nessuna consegna.
- **Cosa ne impedisce l'uso?** Mancano schema/state iniziali, distribuzione aggiornata, qualifica completa e handler/consumer B/D/E. Nessuna prova dal vivo:0/34flussi.
- **Prova del percorso dell'utente:** eseguita solo importazione del sorgenteHTTP e validazione della risposta/path nei17test; tutti8guastiintenzionali rilevati/ripristinati. Nessun primoApplica né percorso UI/runtime provato.

## Corrispondenza aspettativa e tavola (R-34)

**Aspettativa:** non serve: questa fase costruisce contratti interni e il checkpoint non rappresenta una funzione utente consegnata.
**Tavola:** non serve: pacchetto senza interfaccia, nessun pulsante o colonna introdotto dal delta.

| Elemento | Cosa si costruisce | Come si prova | Esito |
| --- | --- | --- | --- |
| Lettura generazione locale | ContrattoGETcanonico |17/17source,8/8faultrestored | Implementato/testato solo sorgente |
| Fonte primaApplica | Initialsource/state | REDpoiimplementazione | Non iniziato |
| Pacchetto completo | Dist/types/full/native | Qualifica task3 | Non iniziato |
| Uso realeModelli | Handler/consumerB/D/E | Percorso vivo | Non verificato0/34 |

Decisioni tecniche canoniche e riferimenti R31/R35 restano in02-CONTEXT; non duplicati qui. Ripartire solo su ordine esplicito della coordinatrice.


---

## Ripresa autorizzata — InitialSource isolato, 2026-10-09

# Qualifica autore — contratto InitialSource isolato

Il contratto InitialSource è implementato e qualificato localmente sulla base Models/Chiavi `2d12694`, nel worktree autore 156. Versione del pacchetto invariata: **1.45.0**. Il delta non contiene composizione Paperclip, modifiche ai barrel, dipendenze o lock. Nessun push, merge, pubblicazione o deploy.

Lo schema riusa forma e controlli del Bootstrap, escludendo strettamente qualsiasi ruolo. Il Bootstrap precedente richiede ancora `master`. Sono verificati identità completa, scope, generazione, partizione dei 34 slot canonici, configurazioni e requisiti, esclusioni esplicite, durata e freschezza equivalenti al Bootstrap senza limite aggiunto di 60 secondi. `state.initialSource` è opzionale/nullabile, legato all'identità e incompatibile con saved/runtime/versions o altre autorità.

## Prove proprie di questo worktree

| Controllo | Esito e denominatore | Evidenza |
| --- | --- | --- |
| Baseline sorgente precedente | Rosso semantico ammissione roleless, non export mancante | source-semantic-baseline |
| Baseline compilata precedente | AssertionError ammissione roleless | compiled-semantic-baseline |
| Suite sorgente nativa completa, prima della build | 5182/5182 casi, 170 file, 0 falliti, 0 saltati | full-native-source/vitest.json |
| Casi InitialSource | 96/96 verdi; 34/34 slot esercitati | extra-causality/combined-absence-restored.json |
| Causalità sorgente | 27/27 guasti semantici con SHA esatto e verde fresco dopo ciascuno | causality/initial-mutations.json; extra-causality/results.json |
| Copertura causale dei casi nuovi | 96/96 casi con testimone rosso reale; 0 mancanti | extra-causality/case-coverage-audit.json |
| Causalità compilata | 48/48 guasti su 24 vincoli × ESM/CJS, ripristini esatti e verde fresco | compiled-causality-v2/results.json |
| Causalità dichiarazioni | 4/4 guasti TS2322, ripristini esatti e verde fresco | type-causality/results.json |
| Superfici pubbliche | 6/6 superfici, 186 asserzioni nel probe | compiled-green e wiring-restored-native |
| Collegamento del probe nello smoke nativo | 1/1 guasto: smoke esce 0, marker assente, gate fallisce; ripristino esatto e verde fresco | wiring-causality.json |
| Primo caricamento entrypoint | 36/36 processi puliti | entrypoints-final/result.json |
| Dichiarazioni NodeNext | 2/2 compilazioni separate .mts/.cts | types-mts-final; types-cts-final |
| Controlli nativi | typecheck, lint, build, check:dts, check:pack, CJS completati con esito 0 | rispettivi execution.json |
| Ripetibilità build | 1552/1552 file identici, stesso insieme di percorsi | second-build-parity/result.json |

L'audit ha inizialmente trovato solo 73/96 casi nuovi effettivamente rossi. Tre controprove aggiuntive, conservate separatamente, hanno portato a 96/96 senza modificare il delta finale. I denominatori compilati restano 24 vincoli × 2 formati; non sono presentati come 27 × 2.

## Diagnostica e correzioni conservate

Il primo collegamento del probe era dopo `process.exit(0)`: gli smoke precedenti non qualificavano il nuovo probe. La baseline del gate registra smoke 0 e marker 0. Il collegamento è stato spostato prima dell'uscita e verificato con una disattivazione intenzionale, ripristino esatto e nuovo verde. Il lint successivo è verde. La suite sorgente non è stata ripetuta per questa sola correzione del collegamento.

Tre problemi preliminari dei driver sono conservati e non conteggiati come guasti semantici: cartella output già creata (nessun caso entrypoint eseguito); risoluzione AST di una costante (nessun mutante compilato eseguito); ancora condivisa con due occorrenze (nessun terzo mutante aggiuntivo eseguito in quel passaggio). Nessun errore è stato trasformato retroattivamente in verde. Profilo nativo check:pack invariato, incluse le sue esclusioni e avvertenze registrate.

## Fruibilità alla consegna (R-34)

**La feature è completa?** Il contratto e la sua distribuzione locale sono qualificati dall'autore; il percorso utente del primo Master resta incompleto.

**Cosa ne impedisce l'uso?** Restano produttore e collegamenti reali X9, acquisizione/preservazione Forge dei 34 slot al primo salvataggio, qualifica integrata e revisione indipendente. Il parser non dimostra la lettura reale dei modelli né il controllo della generazione dopo attese.

**Prova del percorso dell'utente:** 0/34 flussi verificati dal vivo. I 34/34 casi del contratto sono prove di partizione e non attestano 34 consumer runtime implementati. Nessun handler, primo Applica o viaggio browser qualificato da questo delta.

**Aspettativa e tavola:** contratto interno, nessuna interfaccia introdotta. La corrispondenza segue 02-CONTEXT: una fonte caricata roleless non assegna il ruolo Master, non equivale a saved/applied e non attiva provider.

## Stato e limiti

AUTH-01: endpoint locale canonico già presente nella base, coperto dalla suite completa e dal probe pubblico; la causalità endpoint 8/8 appartiene al checkpoint storico, non viene attribuita al nuovo delta.
AUTH-02: InitialSource qualificato dalle prove proprie sopra.
AUTH-03: distribuzione nativa, interop e dichiarazioni qualificati dalle prove proprie sopra.
Schema drift: nessuna copia locale di tipi/endpoint condivisi; runtime producer drift non valutabile da questo contratto.
Revisione indipendente e verifica integrata: pendenti. Questo rapporto è una qualifica autore, non un'approvazione indipendente.

Il checkpoint storico STOP viene conservato nel SUMMARY come storia; l'ordine successivo del coordinatore e la delega esplicita autorizzano questa ripresa isolata. Il genitore ha autorizzato il commit locale dopo la propria revisione del perimetro. Nessun push autorizzato.
