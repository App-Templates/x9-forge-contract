# C5 Canali Telefono/Web — SUMMARY incrementale

Ultimo aggiornamento: 08/10/2026 19:42. Worktree 143-1, codex/c5-canali-bridge, base 27749e4.

## Stato

PRESO B0a: solo Rubrica telefonica e ammissione bridge. Test da vedere rossi prima implementazione. Semaforo: 5/5 esauriti, non swap; nessun test pesante avviato. Install nativa frozen Node24/pnpm9 exit0, 235/235 pacchetti riusati, 0 download. Perimetro29 righe letto; PLAN di fase1 copiato immutato SHA93d6169e5cf5e0624b924cd57ef13542b670560e451484a35a8384b03cd1f997. Task generale IN CORSO; Spesa congelata.

## Semantica da preservare

Libro contatti email-only legacy rimane valido e non acquista telefoni inventati. phones facoltativo: null/assenza = fonte telefonica non attestata; [] = fonte completa senza telefoni. Una fonte partial/unavailable non può pubblicare liste telefoniche. Il gate usa solo numero E.164 esatto e fonte Conoscenza corrente/scoped.

Il gate ammette la politica APPLICATA anche se una politica diversa è soltanto salvata: isPhoneChannelConfigurationApplied prova convergenza desired/applied, non è il gate delle chiamate. Per ammissione serve active applicato, attestation versione applicata, lifecycle loaded/nonarchived, linea/routing correnti e identità R4 per agente; desired nuovo non autorizza effetti. Fuori scope emettere provider effects dal bridge.

## Prossimo passo

Preparare test address-book, attendere posto, baseline rossa funzionale, aggiunta phones; qualifica mutazioni e commit atomico. Poi test ammissione con API esplicita, baseline fail-closed e guard applicato/fonte/routing/richiesta. B0b/B0c separati, X9/Forge solo dopo producer e assegnazione/pin da coordinatrice. Non tag, push, merge, deploy o live.

## Fruibilità alla consegna (R-34)

Nessuna consegna applicativa. Piano42/42 righe mappate, 0/42 live. Preparazione bridge non equivale a chiamata telefonica o web riuscita. Numeri di test e mutazioni ancora 0 eseguiti; codice nuovo prodotto ancora assente.

## Preparazione B0a ammissione (non eseguita)

Test scritti nel perimetro, implementazione ancora assente: numero esatto/Rubrica, inbound policy applicata e voce applicata durante edit pending, request/authority outbound server-owned con scope/versione/linea/selector/richiesta/TTL60sec correlati. Nessun boolean browser concede permesso: autorità sarà ricostruita dal produttore. API nova richiede scaffold fail-closed prima del rosso funzionale, nessun TypeError/import error contato come prova. Decisione192927: storico comune di tutti4kind, Bconsuma; raccordo props slug+revision/onRefresh senza DTO scope browser. Test/mutazioni ancora in coda5/5.

## Checkpoint di preparazione — 2026-10-08T19:33:52.184526+02:00

Semaforo ancora5/5 esauriti alla verifica19:33, nessuna lease C. Non è soglia swap: suite/mutazioni non avviate. Due file test WIP presenti non committati: c5-phone-address-book e c5-phone-admission; quest'ultimo attende nuovo modulo fail-closed, non conta errori import come rosso. Codice prodotto base27749e4 ancora immutato. Committati solo PLAN/SUMMARY/PREPARATION.json, non feature o controllo verde. Prossimo heartbeat riprende la riserva e il baseline address-book, poi singola correzione/qualifica prima del modulo ammissione.

## B0a1 Rubrica — 08/10/2026 19:42

Lease C ottenuta19:40 fino20:12. Baseline nuovo file21test:4rossidominio/17giaVerdi (phones rifiutato e limite completo). Aggiunta singola phones?:E164[]|null con2048/univoci/fontecompleta; emaillegacy identico. Dopo aggiunta e ripristino85/85 in2/2file (21nuovi+64C1),0skip;6/6mutazioni funzionali (formato,limite,univocità,completezza,null,legacy-no-default), SHA ripristinatoc4df9f46924a8744363a1693d566b47869d10d1bbfa85157062738c75dd50e7c. Logs/report/runner inproof/. Full/typecheck/build non ancora eseguiti, nuova APIammissione WIP non montata;0live. Commit prodotto contiene solo contratto libro e test; docproof atomici con la medesima correzione. Prossimo B0a2 gateammissione, scaffoldfailclosed prima baseline funzionale.
