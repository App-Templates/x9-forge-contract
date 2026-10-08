# C5 Canali Telefono/Web — SUMMARY incrementale

Ultimo aggiornamento: 08/10/2026 19:58. Worktree 143-1, codex/c5-canali-bridge, base 27749e4.

## Stato

B0a Rubrica + ammissione bridge implementato e testato localmente; nuovo libro105test e gate puri, non handler X9/Forge. Full native4320/4320 in154/154file,0skip; qualità nativa typecheck/lint/build/pack exit0; compilednuovo20/20 ESM+CJS, legacy CJS36/36 + altri probe del comando originale. Campagna finale unica38/38source+2/2compiled,6/6fileidentici. Nessun live, taskgeneraleIN CORSO. Posto C fino20:12. Segue B0b identità D nella callback web; B0c facciata/inviti/history tutti4canali e producer/consumer non ancora fatti. Install frozen235/235riuso,0download, pin/bump nessuno.

## Semantica da preservare

Libro contatti email-only legacy rimane valido e non acquista telefoni inventati. phones facoltativo: null/assenza = fonte telefonica non attestata; [] = fonte completa senza telefoni. Una fonte partial/unavailable non può pubblicare liste telefoniche. Il gate usa solo numero E.164 esatto e fonte Conoscenza corrente/scoped.

Il gate ammette la politica APPLICATA anche se una politica diversa è soltanto salvata: isPhoneChannelConfigurationApplied prova convergenza desired/applied, non è il gate delle chiamate. Per ammissione serve active applicato, attestation versione applicata, lifecycle loaded/nonarchived, linea/routing correnti e identità R4 per agente; desired nuovo non autorizza effetti. Fuori scope emettere provider effects dal bridge.

## Prossimo passo

Preparare test address-book, attendere posto, baseline rossa funzionale, aggiunta phones; qualifica mutazioni e commit atomico. Poi test ammissione con API esplicita, baseline fail-closed e guard applicato/fonte/routing/richiesta. B0b/B0c separati, X9/Forge solo dopo producer e assegnazione/pin da coordinatrice. Non tag, push, merge, deploy o live.

## Fruibilità alla consegna (R-34)

Preparazione bridge B0a pronta per revisione del solo lotto. 105/105nuovi controlli (21Rubrica+84ammissione) e4320/4320fullnativi;38/38mutazioni source+2/2compiled nella campagna finale unica con ripristino6/6file. Baseline valido fail-closed9/9rossifunzionali,17dei21testRubrica erano giàverdi e provati poi conmutazioni. Piano42/42requisiti mappati,0/42live,0/2percorsiTelefonico/Webcompleti dalvivo. Il gate pure non verifica firma provider, non autentica utente, non emette effetti, non gestisce idempotenza: lo fanno i producer da implementare nel perimetro successivo, ricaricando fonte dopoogni await. Nessuncanale100%, deploy/push/merge nessuno.

## Preparazione B0a ammissione (non eseguita)

Test scritti nel perimetro, implementazione ancora assente: numero esatto/Rubrica, inbound policy applicata e voce applicata durante edit pending, request/authority outbound server-owned con scope/versione/linea/selector/richiesta/TTL60sec correlati. Nessun boolean browser concede permesso: autorità sarà ricostruita dal produttore. API nova richiede scaffold fail-closed prima del rosso funzionale, nessun TypeError/import error contato come prova. Decisione192927: storico comune di tutti4kind, Bconsuma; raccordo props slug+revision/onRefresh senza DTO scope browser. Test/mutazioni ancora in coda5/5.

## Checkpoint di preparazione — 2026-10-08T19:33:52.184526+02:00

Semaforo ancora5/5 esauriti alla verifica19:33, nessuna lease C. Non è soglia swap: suite/mutazioni non avviate. Due file test WIP presenti non committati: c5-phone-address-book e c5-phone-admission; quest'ultimo attende nuovo modulo fail-closed, non conta errori import come rosso. Codice prodotto base27749e4 ancora immutato. Committati solo PLAN/SUMMARY/PREPARATION.json, non feature o controllo verde. Prossimo heartbeat riprende la riserva e il baseline address-book, poi singola correzione/qualifica prima del modulo ammissione.

## B0a1 Rubrica — 08/10/2026 19:42

Lease C ottenuta19:40 fino20:12. Baseline nuovo file21test:4rossidominio/17giaVerdi (phones rifiutato e limite completo). Aggiunta singola phones?:E164[]|null con2048/univoci/fontecompleta; emaillegacy identico. Dopo aggiunta e ripristino85/85 in2/2file (21nuovi+64C1),0skip;6/6mutazioni funzionali (formato,limite,univocità,completezza,null,legacy-no-default), SHA ripristinatoc4df9f46924a8744363a1693d566b47869d10d1bbfa85157062738c75dd50e7c. Logs/report/runner inproof/. Full/typecheck/build non ancora eseguiti, nuova APIammissione WIP non montata;0live. Commit prodotto contiene solo contratto libro e test; docproof atomici con la medesima correzione. Prossimo B0a2 gateammissione, scaffoldfailclosed prima baseline funzionale.

## B0a2 finale — 08/10/2026 19:58

9/71rossi iniziali su scaffold fail-closed; primo green320/327 aveva7fixturepositive R4invalide per failed:null mancante: non7difetti del prodotto. Aggiunto campo canonico e runtime stopped valido, nessuna asserzione indebolita; fixturevalidata prima di chiamare gate. 327/327 dopo correzione,84testammissione finali (3inputinvalidi,4fonti mancanti/linea/nonapplied,3authorityinvalidi,3schemaTTL aggiuntivi). Baseline fail-closed su fixturecorretta conferma9assertrossi/0errorisecondari. Campagna finale32/32guardammissione+6/6Rubrica+2/2compiled: active-application ha2asserzionifunzionali e2TypeErrorcollaterali ESCLUSI dallaqualifica (mutante bypassa intenzionalmente controllo null), tutti gli altri senzaerrorecollaterale. Nessunerrore import/transform/timeout qualificato. SHA e reports in B0a-FINAL-MUTATIONS.json;6/6file finali identici prima/dopo. Full4320/4320,154/154file. Source phone-number-helper exact match/owner/tenant/vault/time; policy e voce APPLICATE restano operative durante editpending/failed; outbound richiede richiesta esplicita server-owned correlata con TTL<=60sec e generazioni phone/linea/selector; publicinbound non concedeoutbound. Callerhidden/null resta negato nel contratto conservativo, mai default aperto. C2/R4/identità esistenti importati;0writerconsumer/0live.

## Prossimo passo aggiornato

Rileggere PLAN/SUMMARY dopo commit B0a2; B0b sostituisce il placeholder identitynull con D preservando failurelegacy e helpercurrent solo correlazione, aggiunge risposta di successo scoped e helperusable con identityexpectedserver/lifecycleactive. Nessuna ammissione web dedotta dal solo successoschema: producer recheckspolicy/viewer/inviti/mapping/origin prima e dopo await. B0c/B1X9/F1Forge e history4kind ancora da eseguire.
