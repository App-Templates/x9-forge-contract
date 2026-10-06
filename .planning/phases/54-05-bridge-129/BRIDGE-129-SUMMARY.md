# BRIDGE-129 · B1 e B7
Ultimo aggiornamento: 14:12 (06/10/2026)

Base: d8ef67f (v1.28.0). Branch: codex/bridge-129-params-outputs.
Stato: CORREZIONI RIPRESE per RIPARTITE 13:58 della coordinatrice. Proposta 1.29.0 implementata e testata localmente.
Nessun consumer aggiornato, tag, push, merge o rilascio. Nessuna verifica dal vivo.

## Compiti e commit

| Task | Stato | Commit | Prova |
| --- | --- | --- | --- |
| Preparazione | piano e SUMMARY iniziale | e3d7a2a | fonti e perimetro letti |
| 1 B1 parametri | implementato e testato | 6730dfb | 0/63 → 63/63, tipi/lint OK |
| 2 B7 uscite, feedback, andamento | implementato e testato | 10e5e53 | 0/77 → 140/140 B1+B7, tipi/lint OK |
| 3 dichiarazioni, export, smoke | implementato e testato | 377d97b | 3/16 → 16/16; regressioni 209/209; CJS 31/36 → 36/36 |
| 4 versione e qualità | verificato | 3ecdee0 | 16/17 → 17/17; suite 1140/1140 + CJS 36/36; build pulita identica |
| 5 mutazioni e prove finali | 133/133 verificate in lotti; riesecuzione unica SALTATA | 846311c | 194/194 nuovi test visti rossi; suite finale 1161/1161 + CJS 36/36 |

## Contratti e copertura

| Famiglia | Fonti e comportamento | Test nuovi finali |
| --- | --- | --- |
| B1 parameters | PIANO-SVILUPPI B1, HANDOFF D1: etichette e descrizioni, cinque tipi e vincoli, provenienza, scelta esplicita, deciso/proposto, riferimento, applicazione, consumo e ledger | 82/82 |
| B7 presentation | PIANO-SVILUPPI B7, FORGE-REDESIGN §7.3, VISTA-PROGETTO §0/2: uscite per agente, JSON di dominio, fonte distinta dal revisore, voto intero 1–10, metriche/unità e serie giornaliere | 77/77 |
| Manifest/registry e smoke | Dichiarazioni facoltative, payload precedenti identici, autenticazione v1.28 invariata, consumo reale delle nuove entrate ESM/CJS | 16/16 |
| Distribuzione | Versione proposta 1.29.0, due nuove mappe di export/build, 16/16 sottopercorsi precedenti e tutti i loro simboli pubblici reali conservati in ESM/CJS | 19/19 |

Totale nuovi: 194/194 verdi, tutti visti rossi. Base precedente: 967/967; finale: 1161/1161 in 82/82 file.
Smoke CJS separato: 36/36. I test sono sintetici locali; non attestano l'uso dei contratti da parte dei servizi.

## Scelte da confermare

- D54-11: tutto per agente e capability, nessun projectId nella configurazione.
- PIANO-SVILUPPI §B, HANDOFF D1/D13, FORGE-REDESIGN §7.3 e VISTA-PROGETTO §0/2: dichiarazioni facoltative nel manifest; vecchi manifest invariati.
- Le fonti richiedono letture/scritture ma non stabiliscono nuove rotte B1/B7. Il ramo del Task 3 relativo a nuovi endpoint è SALTATO come consente il piano: questa proposta aggiunge schemi e dichiarazioni. Le rotte per agente di v1.28 e la loro autenticazione restano intatte. Rotte e controllo di versione da concordare con Samira prima dei consumer.
- Parametri ordinari, mai credenziali: env-schema/vault restano il percorso delle chiavi. Nessun default di prodotto scelto dal bridge.
- Da quando vale: immediate oppure next_apply, coerente con D1. I valori dichiarano platform_default, agent_override o needs_choice; zero e false sono valori reali, non assenze.
- B7: la fonte identifica la vista/app, distinta dal reviewerId autenticato. Content è JSON di dominio; i consumer ne verificano i campi dichiarati prima di renderlo. Solo rating 1–10 in questa proposta; approva/chiedi modifiche richiede un futuro contratto. Andamento giornaliero con unità dichiarata e valori finiti, anche negativi.
- Consumer previsti: Forge fase 33 (parametri); agent-x9 capability (dichiarazioni, prima cap-food); vista di progetto esterna/app di dominio (B7). Aggiornamenti fuori repo affidati alla coordinatrice/Samira.
- Riesecuzione di tutte le mutazioni in un solo giro finale SALTATA dopo il terzo tentativo, secondo il limite del piano. La copertura documentata è l'unione di due lotti con asserzioni reali; Samira può ripetere il runner completo quando il Mac è libero.

## Prove rosso → verde

Task 1: tutti i 63 test iniziali hanno fallito per export assente (asserzioni, nessun errore di raccolta), poi 63/63 verdi. Task 2: 77/77 rossi per export assente, poi 140/140 B1+B7 verdi. Task 3: 13/13 controlli nuovi rossi prima; i 3 controlli legacy/autenticazione già verdi sono stati successivamente rotti nelle copie. 209/209 regressioni mirate verdi e CJS 31/36 → 36/36. Task 4: versione vista rossa, distribuzione 16/17 → 17/17; i controlli preesistenti sono stati rotti nel Task 5.

Task 5, script scripts/mutate-54-05.py: solo copie temporanee di sorgenti, dist e package. Un errore di raccolta o un timeout non conta come mutazione rilevata.

1. Primo tentativo: baseline e verde successivo 188/188; 122/129 mutazioni rilevate, 7 sopravvissute. Quattro varianti strict mancavano di casi dedicati; fixture min/max e guardie duplicate sul default richiedevano isolamento. Test rafforzati e guardie duplicate disattivate insieme nella copia, senza cambiare gli schemi originali.
2. Secondo tentativo: baseline 194/194; 115/115 mutazioni eseguite rilevate da asserzioni, inclusi i 7 casi corretti e 4 nuovi controlli su default/tipi/zero/false. Il successivo avvio su new-build-presentation ha superato 120 s: non conteggiato come rosso.
3. Terzo e ultimo tentativo: recupero dei soli 18 controlli rimanenti. L'avvio della baseline ha superato 300 s, con timeout dei singoli test sempre 60 s. Nessuna asserzione prodotta; non conteggiato. Arrestato soltanto il gruppo di processi della copia.

Prova finale task5-final-mutations.json: 133/133 ID distinti hanno asserzioni fallite senza errori di esecuzione (115 dal secondo lotto, 18 dal primo). Gli ultimi 18 riguardano export/build e simboli già verificati nel primo giro; package, dist e quei test sono invariati fra i giri. Il numero 133/133 è aggregato, non l'esito di una riesecuzione unica. I file generici task5-baseline/task5-mutations sono gli ultimi report validi del secondo tentativo; task5-green è il verde da 188 test del primo, non una nuova prova finale. I report originali di tutti i tentativi restano accanto al SUMMARY.

194/194 test nuovi finali hanno una prova rossa nominativa, raccolta dai report dei Task 1–4 e dalle mutazioni. Suite finale sul worktree originale: pnpm test 1161/1161 e CJS 36/36; lint completo riuscito. Nessun rilancio pesante dopo il terzo tentativo.

## Qualità, distribuzione e perimetro della prima consegna 846311c

Build/dts, typecheck, lint e check:pack riusciti nel Task 4. check:pack termina con codice 0, con un warning publint sul campo types del root export (interpretato CJS anche in import ESM); il target precedente è preservato. Il profilo già usato dal repo ignora false-cjs e node10, mentre node16 e bundler passano per 18/18 entrate. Dopo il rafforzamento dei test, pnpm test e lint completi riusciti ancora. Nella prima consegna 846311c, da 3ecdee0 non cambiava nessun file di src/, dist/ o package.json. Dopo le correzioni queste verifiche devono essere ripetute; dist non è ancora riallineata.

Dist: 1024/1024 file identici byte per byte a build pulita in directory temporanea, SHA256 riconfermati dopo le mutazioni. Nessun file vecchio rimosso. Alcune dichiarazioni enum rigenerate hanno soltanto ordine diverso delle proprietà, senza cambiare valori o tipi. Runner di suite limitato a due worker/60 s; runner di mutazioni a un worker/60 s.

final-perimeter.json registra branch corretto, zero file fuori perimetro e zero byte di diff sui contratti protetti. HTTP, autenticazione, ricerca/lab v1.28, root index, dipendenze, lockfile e hook sono invariati. Le sole estensioni di sorgenti precedenti sono capability index, manifest e registry. Nessuna modifica al bridge principale linkato dai consumer.

## Consegna

PRONTO PER REVISIONE: schemi, dichiarazioni, distribuzione e prove disponibili nel worktree assegnato.
Restano revisione Samira, decisione sulle rotte/consumer e rilascio della coordinatrice. La sola verifica locale saltata è il giro unico finale delle mutazioni, per limite di tre tentativi e timeout di avvio.

## Ripresa dopo revisione Samira

Ultimo aggiornamento correzioni: 12:38 (06/10/2026). Piano: BRIDGE-129-REVIEW.md.

R1–R7, estensioni lab e verifiche finali in corso; i numeri precedenti si riferiscono alla consegna 846311c. Il ramo non è ancora pronto per la nuova revisione.

- 12:41 · r1: fix(capability): declare rating and approval feedback. Prima 8/15 (falliti 7/15), dopo 108/108. Commit: dfd322a.

- 12:43 · r2: fix(capability): declare reviewer names and bounded photos. Prima 14/21 (falliti 7/21), dopo 129/129. Commit: 461ab85.

- 12:47 · r3: fix(capability): bound parameter and presentation payloads. Prima 0/35 (falliti 35/35), dopo 252/252. Commit: 0925e50.

- 12:53 · r4: fix(capability): describe lists patterns and optional configuration. Prima 29/37 (falliti 8/37), dopo 283/283. Commit: acdae4e.

### PAUSA SUBITO ricevuta

12:54 · R1–R4 committate e verdi, ultimo commit acdae4e (mirati finali 283/283). Nessun mio comando di test o mutazione ancora in corso: tutti i runner avviati sono terminati. STOP fino a «ripartite», nessun comando pesante o nuovo hook. Questo checkpoint resta sul disco senza nuovo commit.

Restano R5 editabilità, R6 JSDoc, R7 scale; estensioni lab; import z, script test separato, riepiloghi al posto dei JSON grezzi; tipi/lint/build/pack e giro finale unico di mutazioni. Nuova decisione 13:40: models e budget lab OBBLIGATORI, unica eccezione non additiva autorizzata verso 1.28 senza consumer. La precedente ipotesi facoltativa è superata. Prima di implementare lab leggere intera risposta bridge-129-lab-campi-20261006: anche ingest asincrono e lab_ingest_status, dettaglio Samira. Nessuna modifica a ~/.claude o ai consumer.

### Ripresa autorizzata

2026-10-06 14:03 · RIPARTITE letto. Posto già PRESO secondo bacheca; un comando pesante alla volta. R5–R7, lab obbligatorio/asincrono e verifiche finali riprendono; nessun consumer o rilascio. Risposta completa Samira lab letta.

- 14:04 · r5: fix(capability): declare parameter editors. Prima 7/23 (falliti 16/23), dopo 306/306. Commit: 80c478c.

- 14:05 · r6: docs(capability): clarify configuration keys and versions. Prima 95/98 (falliti 3/98), dopo 98/98. Commit: 176a4b7.

- 14:06 · r7: fix(capability): declare numeric output scales. Prima 11/26 (falliti 15/26), dopo 332/332. Commit: 2eee203.

- 14:08 · lab-config: fix(lab): require explicit models and ingest budgets. Prima 3/40 (falliti 37/40), dopo 73/73. Commit: 94b2e36.

- 14:10 · lab-spend: feat(lab): report per-agent spend with shared contracts. Prima 2/11 (falliti 9/11), dopo 84/84. Commit: f63e842.

Lab status: «conteggi presenti quando completed» applicato come tre conteggi richiesti a completed e assenti negli altri stati. È la forma operativa della decisione Samira, da ricontrollare in revisione; nessun worker/consumer implementato nel bridge.

- 14:11 · lab-tools: fix(lab): queue ingest and expose status and tool errors. Prima 6/35 (falliti 29/35), dopo 119/119. Commit: 754fa52.

- 14:12 · imports: style(capability): import zod before declaration schemas. Documentazione/stile; nessuna nuova guardia runtime. Commit: 4c7ab3d.

- 14:12 · test-script-restore: chore(test): restore the original test script for isolation. Documentazione/stile; nessuna nuova guardia runtime. Commit: questo commit (checkpoint).
