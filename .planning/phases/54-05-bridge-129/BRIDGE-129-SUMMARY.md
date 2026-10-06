# BRIDGE-129 · proposta 1.29.0 corretta
Ultimo aggiornamento: 14:49 (06/10/2026)

Worktree: /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-12-9
Branch: codex/bridge-129-params-outputs. Base: d8ef67f (1.28.0).
Stato: R1–R7 e lab implementati e testati; giro unico, qualità e dist verificati. Restano perimetro e consegna.
Nessun push, merge, tag, deploy, consumer aggiornato o verifica dal vivo.

## Fonti e autorizzazioni

Piano BRIDGE-129-PLAN.md e risposta completa Samira di revisione-bridge-129-20261006, trascritta in BRIDGE-129-REVIEW.md.
Per lab: risposta completa bridge-129-lab-campi-20261006, decisioni della coordinatrice 13:35/13:40.
La sola eccezione non additiva riguarda lab non ancora consumato: models/budget obbligatori e ingest asincrono.
Documentata nel CHANGELOG. Nessun campo/export precedente di altri contratti rimosso o rinominato.

PAUSA SUBITO rispettata: R1–R4 già verdi e committate, nessun runner rimasto attivo. Ripresa soltanto dopo RIPARTITE.
I posti li prende/rilascia la coordinatrice; non modifico ~/.claude. Un solo comando pesante alla volta.

## Commit per compito

| Compito | Commit | Prova prima → dopo |
| --- | --- | --- |
| Piano iniziale | e3d7a2a | fonti/perimetro |
| B1 iniziale | 6730dfb | 0/63 → 63/63 |
| B7 iniziale | 10e5e53 | 0/77 → 140/140 |
| Dichiarazioni/export iniziali | 377d97b | 3/16 → 16/16; CJS 31/36 → 36/36 |
| Versione/qualità iniziali | 3ecdee0 | 16/17 → 17/17; 1140/1140 |
| Prima consegna | 846311c | 1161/1161 + CJS 36/36; 133/133 mutazioni aggregate in due giri |
| R1 rating/approval | dfd322a | 8/15 → 108/108 |
| R2 nome/foto | 461ab85 | 14/21 → 129/129 |
| R3 limiti | 0925e50 | 0/35 → 252/252 |
| R4 liste/pattern/optional | acdae4e | 29/37 → 283/283 |
| R5 editableBy | 80c478c | 7/23 → 306/306 |
| R6 JSDoc key/version/PUT | 176a4b7 | 95/98 nelle copie → 98/98 sugli originali |
| R7 tipi e scale | 2eee203 | 11/26 → 332/332 |
| Lab models/budget | 94b2e36 | 3/40 → 73/73 |
| Lab spesa | f63e842 | 2/11 → 84/84 |
| Lab ingest/status/errori | 754fa52 | 6/35 → 119/119 |
| Import z per primo | 4c7ab3d | regressioni 16/16; solo stile |
| Ripristino script test | 4a9b402 | isola la modifica precedente |
| Limiti script test, separati | 4b47560 | solo due worker/60 s; suite finale usa lo script |
| Dist ESM/CJS aggiornata | 2f66b8b | 0/10 → 44/44; build/dts e tipi |
| Report compatti | 6d32581 | 45/45 file convertiti; originali e hash conservati |
| Controlli isolati e giro finale | questo commit (checkpoint) | 469/469 casi visti rossi → 469/469; 299/299 in un giro completo |

I numeri prima del simbolo → sono test passati, con il denominatore dell'intero lotto. Le prove rosse registrano
anche il numero dei falliti e il loro nome. I verdi di regressione comprendono test di compiti precedenti:
non si sommano per contare test nuovi.

## Contratti → decisione → stati

| Famiglia | Decisione/fonti | Comportamento verificato |
| --- | --- | --- |
| B1 metadata | B1, HANDOFF D1/D8/D10, R5/R6 | chiave nel corpo config per agente; versione della stessa config; optional ed editableBy obbligatori; superadmin/owner |
| B1 valori | R3/R4 | number/integer/string/boolean/enum/string_list; limiti, pattern, opzioni; default dichiarato, override o needs_choice; array confrontati per contenuto |
| B7 feedback | VISTA §2/3/6/7, R1/R2 | rating 1–10 oppure approval approved/changes_requested; fonte project_view/domain_app, reviewerId e reviewerName; foto opzionali HTTP(S) |
| B7 uscite/andamento | B7, VISTA §7, R3/R7 | JSON di dominio limitato; tipo campo esportato; min/max facoltativi solo number; scala finita e ordinata; serie giornaliere per agente |
| Lab config | decisione Samira | digest obbligatorio, read facoltativo; budget e timezone obbligatori; ingest ceiling ≤ dailyUsd; nessun default |
| Lab spesa | contratto ricerca riusato | stessa rotta per agente, GET e secret auth, stessi schemi query/response; capability ricerca e lab |
| Lab tool | decisione Samira | lab_ingest restituisce UUID + queued; lab_ingest_status riusa queued/running/completed/failed/budget_exhausted; conteggi finali; quattro errori dichiarati |
| Distribuzione | R14 e compatibilità | ESM/CJS consumati dai test; 16/16 sottopercorsi precedenti e relativi simboli conservati |

Limiti pubblici: etichette/nome/pattern 200; descrizioni/commenti/elementi lista 2000; ID/chiavi 100;
stringhe 8000 (conventions lab); opzioni/kinds 50; parametri/liste/campi/metriche/pagine 100;
andamento ≤ AGENT_SPEND_MAX_DAYS (400); contenuto ≤ 64 KiB di JSON UTF-8; foto ≤ 10.

## Prove rosso → verde e mutazioni

Ogni correzione runtime ha test prima del codice, fallimenti di asserzione reali e regressione verde nello stesso commit.
R6 è solo documentazione: le prove rompono percorso e versione esistenti nella copia, poi 98/98 sugli originali.
Import e script test non introducono guardie runtime; nessun test che rispecchi solo il testo di un comando.

scripts/mutate-54-05-review.py conserva i 133 ID del runner iniziale e aggiunge le guardie della revisione/lab.
Solo copie temporanee di sorgenti, dist e package; un worker/60 s, timeout di avvio mai contato come rosso.
Le guardie duplicate sono disattivate insieme soltanto quando proteggono lo stesso caso (wire/semantica,
conteggio/unicità). Gli edit precisi sono nel report.

Primo giro completo della revisione: 286/286 rilevate; baseline e ripristino 469/469; hash sorgenti/dist invariati.
Un controllo nominativo ha trovato 14 fixture ancora protette da altri livelli e due asserzioni asincrone
che Vitest registra come Error da __VITEST_RESOLVES__. Queste sono asserzioni esplicite «instead of resolving»,
non errori di raccolta: il classificatore le distingue. Runner ampliato e secondo giro COMPLETO: 299/299 rilevate, zero errori di raccolta;
baseline e ripristino 469/469, hash sorgenti/dist invariati. Nessuna somma di lotti per l'esito finale.
Copertura nominativa: 469/469 casi distinti visti fallire con asserzioni; review/red-coverage.json.
17 casi isolati, 5 casi status aggiuntivi e gli export ESM/CJS rafforzati rimuovono le mascherature delle fixture.

La prima consegna 846311c riportava 133/133 come unione di due giri e il giro unico saltato dopo tre tentativi.
Quel dato resta storico, con report originali nella storia Git; non descrive la verifica finale corretta.

## Qualità sul worktree originale

- pnpm test: 1436/1436, 93/93 file; smoke CJS 36/36.
- typecheck e lint: codice 0.
- build: riuscita; 256/256 dichiarazioni .d.ts portabili.
- check:pack: codice 0. Warning già presente sulle types CJS del root; profilo node16,
  false-cjs escluso dallo script esistente e risoluzione node10 esclusa dal profilo. Nessuna opzione nuova.
- Build da copia senza dist: riuscita, 256/256 .d.ts portabili e 1024/1024 file dist identici byte per byte;
  sorgenti, package e dist originali invariati. Perimetro finale ancora da registrare.
- 275 test di revisione aggiunti ai 1161 della prima consegna. Le prove B1/B7/compatibilità
  della prima consegna più quelle di revisione contengono 469 casi distinti; tutti 469/469 visti rossi e verdi nel ripristino finale.

Il lettore delle prove della suite presumeva TAP per CJS, ma il repo usa il proprio riepilogo.
Corretto soltanto il lettore dal log della stessa esecuzione terminata con codice 0; nessun rilancio dei test.

## Evidenze

EVIDENCE.md elenca 45/45 report convertiti, SHA256 originali e copia locale temporanea.
Conteggi, nomi, stati e asserzioni conservati; niente stack o JSON Vitest grezzo. Il numero di byte è passato
da 1.579.715 a 756.331. La storia Git dei singoli commit conserva gli originali durabili.
I report finali usano un indice unico dei nomi di test; 299 righe riassunte anche in review/FINAL-MUTATIONS.md.
I due report passano da 643.489/653.743 a 131.535/137.464 byte. Assert, ID ed edit corti sono conservati;
gli edit lunghi hanno impronta/anteprima e si ricostruiscono dal runner sui sorgenti committati.
Le prove complete nuove sono nell'archivio locale indicato da rawProof, con SHA256; niente stack grezzi in Git.
Baseline, mutazioni, ripristino e copertura nominativa in review/.

## Scelte da confermare

- Non sono previste nuove rotte B1/B7 dalle fonti: ramo endpoint nuovo SALTATO come autorizza il piano e accetta Samira.
  Le modifiche config passano dal PUT capAgentConfigPath esistente; i consumer implementano letture e salvataggio.
- «Conteggi presenti quando completed» significa tre conteggi richiesti a completed e assenti negli altri stati.
  La revisione Samira ricontrolla questa interpretazione; non è stato implementato alcun worker nel bridge.
- Pattern limitati a 200, foto a 10 e pagina a 100: limiti espliciti fissati prima del rilascio per evitare futuri restringimenti.
- Content resta JSON di dominio: i consumer validano i propri campi prima di renderli.
- Parametri ordinari, mai credenziali; env-schema/vault restano il percorso delle chiavi.
- Rilascio della 1.29, aggiornamenti atomici dei consumer e BRIDGE-130 spettano alla coordinatrice dopo revisione.
