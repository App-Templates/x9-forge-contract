# CANALI-C1-B — checkpoint

08/10 00:45 · B1 preso, scadenza01:30. Base5034eef5, branchcodex/canali-c1-b, albero iniziale pulito; perimetro letto. Nessun AGENTS.md nel repo. Versione1.41 invariata. Piano approvato via posta004234. Test prima del codice, seguiti da mutazioni semantiche e ripristino. Nessun prodotto implementato/testato/live nel checkpoint iniziale.

## B1 — policy/configurazione, 00:56

Implementato: policy Telegram/email esplicite, binding canonico strict, lista vuota chiusa, fonte Rubrica metadata-only scoped/versionata e validità temporale, helper admission; campo access facoltativo dentro la configurazione canonica. Vecchi context privi di access conservati, politica esplicita invalida rifiutata; versione desiderata distinta dalla policy effettiva precedente.

Rosso iniziale:52/56casi falliti con AssertionError per schema/helper mancanti o nuovo campo rifiutato. Poi63/63casi verdi,0skip. Primo giro49/50:chat-type sopravviveva perché il segno dell'id mascherava il controllo enum; esito preservato in policy-first-campaign.json. Aggiunto witness con tipo channel e id negativo; secondo giro **50/50**mutazioni semantiche in UN giro completo, ogni mutante seguito da ripristino63/63 e SHA identici. Prova policy-mutation-proof.json, runner mutate.py/casi policy-mutations.json, lograw privati /private/tmp/codex-b-canali-c1-b-mutations/policy.

Regressione contratti agente **1093/1093**casi, nessun fallimento/skip; typecheck e lint mirato exit0. Non sommare la regressione alle63nuove prove giàincluse. Build completo e suite totale solo alla chiusuraB3. Tutti i conteggi da JSON runner; nessun provider/live eseguito.

Scelte da confermare: Rubrica completa oggi è un contratto per il producer futuro, non sorgente implementata. Membership esatta/normalizzata, partial/unavailable non autorizzano nessuno. Lo snapshot riuserà attestation/config via composizione nel nuovo requests.ts (nessun edit fuori perimetro). Build nativa in copia privata approvata posta005304; dist/versione/package restano alla coordinatrice.

CommitB1 575303e6a799482ff902e17ce6c1061940adbf9a, albero pulito dopo commit. PLAN/SUMMARY riletti. B2preso00:57, scadenza01:42:requests/snapshot/apply receipts prima i test, policyB1noncambia.

## B2 — richieste, snapshot e ricevute

Rosso57/57 conAssertionError per schemi/helper mancanti; poi73/73,0skip. Coda metadata-only con id/update/chat unici, versione e date coerenti; operazioni Ammetti/Ignora staged e CAS; snapshot compositivo con attestation email reale obbligatoria per osservazione; applied/pending/failed distinti, ricevuta completa correlata a scope/porta/versioni/requestId/operazioni. Ruoli/auth lato produttore, non dichiarati nel body.

Primo giro83/84:il maxsafe suupdateId sopravviveva perché Zod4.int giàimpone limite safe. Vincolo duplicato rimosso, prove negativo/frazionario/unsafe int conservate. Secondo giro completo **83/83** con ripristino73/73 e hash, non somma con il primo; requests-first-campaign.json preserva il vincolo sopravvissuto. Prove requests-mutation-proof.json e requests-mutations.json. Uno dei mutanti del secondo giro rendeva il gate sign sempre falso: osservato via AssertionError nei consumer (e ZodError sul parse positivo, non accreditato come witness). Nel giro finale Q il mutante sarà sempre true, per un witness negativo diretto sul gruppo. Tipi e lint mirato exit0. Test full e build nativa previsti dopo i moduli HTTP, nessun provider/live.

Ora registrato correttamente: B2 è iniziato col rosso00:55, prima della nota che diceva00:57; durata effettiva inferiore a45min, deadline01:40. I tempi di prossimi checkpoint verranno letti dall'orologio, non anticipati.

## B3a — rotte interne, 01:15

Rosso10/10conAssertionError, verde10/10. Contratti GETsnapshot e POSTapply sotto/internal/agents/:agentId/channels/:kind/access, auth secret esistente; params strict validati prima della costruzione path, schemi canonici agent e errori riusati. **18/18**mutazioni semantiche, ogni ripristino10/10 eSHAidentici (http-internal-mutation-proof.json). Tipi/lint mirato exit0. Il primo generatore dei casi si è fermato su un selettore ambiguo prima di modificare fonti; corretto il selettore, unico giro completo18/18. Sono descrittori e parser, nessun handler installato, nessuna prova live.

## B3b — facciata Forge, 01:22

Rosso19/19conAssertionError, primo verde19/19, finale29/29senza skip. Sessione Forge SA/owner+tenant soltanto da fonte fidata, distinto dall'auth interna; draft strict conCAS desired/applied eoperazioni della coda; preview con evidenza reale, nessun falso applied. Parser/path/schema riusati, nessunwriter/handler/URLprovider nuovo. Primo giro **51/54**:desired-version schema/CAS epreview-current mascherati dalla monotonicità del draft4vsapplied5. Aggiunti witness con appliednull e versione negativa/frazionaria, e desiredfuture6compatibile col vincolo monotono. Secondo giro unico **54/54**semantico, ripristini29/29eSHAidentici, http-forge-first-campaign.json preserva i sopravvissuti; http-forge-mutation-proof.json riporta il giro completo. Tipi/lintmirato exit0. Test di consumo ESM/CJS scritto e visto rosso AssertionError sulla dist1.41; verrà verificato/committato nel lottoQ dopo build privata. Nessuna prova browser/provider/live.

## Q1 — coerenza della risorsa con policy esplicita

Controprova prima del codice:1/64rosso per risorsa con vaultAgentId diverso dalla configurazione;63/64verdi già. Aggiunto vincolo soltanto dentro access esplicito, preservando il contratto legacy senza questo campo. Verde64/64 e **1/1**mutazione semantica del nuovo gate, ripristino64/64eSHAidentico (resource-mutation-proof.json). Tipi/lint exit0.

## Q2 — giro finale e pacchetto, 01:33

Prodotto adb430ddc00fde76ebfcd82afe32f2139fb05b91: **206/206**mutazioni semantiche inun giro finale sequenziale completo (policy50,requests83,HTTPinterno18,Forge54,resource1). Ogni ripristino verde, hashidentici; FINAL-MUTATIONS.json e singoli proof. Request-sign ora apre il gate, rilevato dal witness negativo diretto. Witness riportati soloAssertionError, rawlog integrali conservati.

Suite nativa completa **3185/3185**test in137file,0skip; include176nuovi in4file, non sommare. Typecheck/lintglobali exit0 senza warning. Build nativa soltanto nella copia privata approvata dalla coordinatrice: ESM+CJS, portable DTS332/332file, publint+attwprofilonode16exit0 (node10fuori profilo), nessuna pubblicazione. SmokeCJSoriginali36/36,6/6,15/15,16/16,39/39. Nuovo consumer pubblico dei45exportruntime: **102/102**assert ESM/CJS; rossoAssertionError sulla dist1.41 prebuild→verde dopo build. Inoltre **2/2**guasti semantici sugli artefatti privati CJS/ESM (lista vuota aperta) rilevati, hash byte ripristinati e102/102verdi per loader. PACKAGE-MUTATIONS.json; questi2non si sommano ai206source. QUALITY-PROOF.json contiene comandi, esiti, SHA diinput/artefatti/log.
