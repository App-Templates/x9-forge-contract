# C5 Canali Telefono/Web — SUMMARY incrementale

Ultimo aggiornamento: 08/10/2026 21:02. Worktree143-1, branch codex/c5-canali-bridge, base27749e4.

## Stato

B0a, B0b, B0c1 storico e B0c2a enabled implementati e testati nel solo bridge. Il task generale resta IN CORSO: facciate/inviti/outbound e letture contenuti B0c, producer X9, consumer Forge, montaggio e accettazione dal vivo ancora da completare. Nessun canale dichiarato al100%. File comuni della scheda Canali riservati a B. Spesa135-1/141-1 congelata, esclusa dal rilascio.

Installazione nativa Node24/pnpm9 frozen:235/235 dipendenze riusate,0download. Suite full finale4420/4420 in157/157file,0skip. Qualità nativa typecheck/lint/build/check:pack exit0, configurazione originale; compiled ESM+CJS58/58, smoke CJS originale36/36 e probe originali. Prove JSON/runner in proof/. Nessun bump/pin/tag/push/merge/deploy.

## B0a Rubrica e ammissione

Prodotti b6984d4 (Rubrica) e7df114386ac8544a68464b1b0684f1dc57c692c0 (gate). Nuovi105/105test (21Rubrica+84ammissione), full precedente4320/4320 in154/154file. Campagna finale unica38/38source (6Rubrica+32gate) e2/2compiled con6/6file source/test identici prima/dopo. Baseline Rubrica4rossi/17giàverdi; baseline gate9assertrossi,0errorisecondari sullo scaffold fail-closed con fixture valida.

phones?:E164[]|null non inventa telefoni per il libro email legacy: null/assenza fonte non attestata,[]fonte completa vuota. E.164 esatta/univoca, limite2048 e completezza/freshness/scope/management/runtime/vault. Gate inbound usa policy e voce APPLICATE, lifecycle loaded/nonarchived e attestazione corrente di linea/selettore. Un edit desired pending/failed non sostituisce l'applicato operativo. Outbound solo Rubrica, richiesta esplicita server-owned correlata e TTL<=60sec, generazioni phone/linea/selettore correnti. Public inbound non concede outbound; caller hidden/null negato conservativamente.

Prima campagna327test:7positive invalide per failed:null mancante nella fixture R4; corretta solo fixture, asserzioni intatte, poi327/327. Mutante active-application:2asserzioni funzionali qualificano;2TypeError collaterali ESCLUSI. Nessun import/transform/timeout conta come mutazione funzionale.

## B0b identità web — lotto20:00→20:45

Riusa AgentContextIdentitySchema verificato di D: tenant/owner/runtime esatti, management/vault e Master dell'erede confrontati con identità corrente ricaricata dal server. Response discriminata ammette successo solo con identità nonnull e lifecycle active, richiesta/scope/link/fase correlati. Failurelegacy e helpercurrent conservati: un diagnostic identitynull può essere corrente come correlazione, ma NON è autorità utilizzabile. Nuovo isElevenLabsWebAuthorityUsable richiede anche viewer/origin/versione/tempo correnti e identità canonica identica. Non autorizza da solo politica, invito o risorsa provider: issuer deve ricaricare tutto prima/dopo ogni await.

31/31nuovi test, baseline21verdi/10assertrossi funzionali; regressione mirata168/168 in3/3file. Full finale4351/4351 in155/155file. 14/14mutazioni source qualificate con0errorisecondari e2/2compiled su ESM/CJS; sourceSHA7b57a2666918a4d7aba7544985c9439967b271da763a342c109dc24b9344ff09 ripristinato. Prima mutazione compiled false&& non compilava per narrowing TypeScript: SCARTATA,0qualifica, report preservato; sostituita da negazione compilabile, rosso AssertionError su entrambe le distribuzioni e34/34 dopo ripristino/build. Test expectedIdentityundefined chiamato direttamente per evitare il default JavaScript della fixture, nessuna asserzione indebolita.

## Artefatti generati e perimetro

Su posta coordinatrice200112, dist viene rigenerato una sola volta da F all'integrazione1.45. Dopo prove B0b,100file dist tracked riportati aHEAD e8nuovi generated preservati in/private/tmp/c5-canali-143-generated-0mvo_kdf; distDiffAfter vuoto,0dist committati. B0a ripristinato prima con stessa autorizzazione. Non usare dist HEAD vecchio come prova del nuovo gate: le prove compilate riguardano le build native registrate, la distribuzione finale compete all'integrazione.

## Prossimo passo

B0c: contratti canonici facciata browser separata da S2S, anteprima/applica, inviti email risolti dal server, test-call/outbound, history comune di TUTTI4kind telegram/email/phone/web (B consuma lo stesso DTO). Prima test/scaffold chiuso e rosso funzionale; singola correzione, mutazioni e ripristino. Poi nuovi worktree X9/Forge e pin da coordinatrice. LeaseC fino20:44:38,1commandopesante/worker1; rinnovo prima di altra suite oltre scadenza.

## Fruibilità alla consegna (R-34)

Pronti solo B0a/B0b/B0c1/B0c2a del bridge per revisione. Piano42/42requisiti mappati;0/42verifiche live,0/2percorsi Telefono/Web completi dalvivo. I gate non autenticano utente/firma provider, non emettono effetti/sessioni, non gestiscono idempotenza o storico: producer e montaggio ancora mancanti. Vecchio Forge e provider esistenti da riusare come PLAN; nessuna risorsa a pagamento creata, nessun dato reale inventato. Il task resta IN CORSO, non CONSEGNATO globale.

## B0c1 storico comune — chiuso entro21:00

Contratto UNICO telegram/email/phone/web con binding management/runtime/vault/owner/tenant; pagina massimo100, total:null significa denominatore non attestato, unavailable non viene trasformato in lista vuota. Contenuti solo metadati di disponibilità/retention, nessun bearer/audio/transcript/provider raw nel listato. Le letture autorizzate dei contenuti restano nel prossimo lotto. Identificatori canonici sono riferimenti del record locale, non provider raw message-id. Eventi terminali richiedono data vera; active/unknown non inventano durata o conclusione. Durata attestata non può eccedere l'intervallo start/end; durata null è sconosciuta, non0. Fonte e record completi, recenti, della stessa porta; doppioni/futuro/totali falsi negati.

La verifica necessita requestId della NUOVA operazione esplicita, record terminale correlato/outcome completed e conclusione recente: un vecchio evento storico, una pagina appena aggiornata o un mapping sano non prova il canale. lastVerification descrive un record della pagina; su pagine che non lo contengono rimane null. Producer dovrà attestare il percorso end-to-end, schema/GET non lo esegue. GET canonici /internal/agents/:agentId/channels/:kind/history e /api/agents/:agentId/channels/:kind/history, auth secret/session+SA-or-owner rispettivamente. URL browser usa management id, scope interno runtime, ownership verificata dal server; nessuna autorità browser.

57/57 nuovi (42dominio+15HTTP), baseline30test22assertrossi/8verdi eHTTP15test1assertrosso/14verdi. Primo green23/30: confronto helper strict riceveva entry completa invece di sola proiezione binding; corretto il prodotto a bindingOf(scope/identity), asserzioni intatte. Prima campagna40/41: limite non qualificato perché IDs entry-0 troppo corti nella fixture; correggo SOLOID e aggiungo positiva100/negativa101, poi finale unica46/46source+2/2compiled funzionali,0errorisecondari;8/8fileSHAidentici. Primo compiled falliva il controllo nativo portable-dts (mancava importzod endpoint):0qualifica, logpreservati, import aggiunto come richiesto dallo stack; buildnative ripristinata0 e2/2compiled AssertionError exportmancante. Full4408/4408 in157/157file,0skip,tsc/lint/build/pack0,compiled52/52 ESM+CJS,legacy36/36+probeoriginali. Dist rigenerato per prove poi ripristinato solo generated su200112,0distcommit. Nessun handler/prova live o percorsoR34completo.

Autorizzazione201558 aggiunge web-channel.ts/web-session.ts e test per enabled opzionale: assente=active legacy, false esplicito=off, distinto da pausa. Segue B0c2 browser/inviti+off e outbound. LeaseC rinnovata fino21:11:19,1worker/1pesante. Lo storico condiviso è preparazione per B, non sua UI o producer già funzionante.

## B0c2a enabled/off — autorizzato201558

Enabled:boolean facoltativo nella policy e nel change canonici; assente resta identico legacy/attivo, false esplicito chiude nuove sessioni anche quando paused:false. Readback CAS confronta anche enabled con fallbacktrue da entrambi i lati. canAdmit già esistente applica off insieme ai gateC3; sessioncurrent già esistente lo richiama dopo await. Nessun altro writer, nessuna creazione/providerpause, link e mapping persistenti invariati. Non promette revoca retroattiva di bearer già emesso.

12/12nuovi test (7policy+5session), baseline8assertrossi/151test,143giaVerdi. Mirati151/151 in2/2file, full4420/4420 in157/157file,0skip;typecheck/lint/nativebuild/checkpack0. Qualifica8/8source+2/2compiled AssertionError,0errorisecondari;2sourceSHA ripristinati e manifest5filefinali. Smoke compilato58/58 ESM+CJS,legacy36/36+probeoriginali. Dist solo generated ripristinato su200112,0distcommittati. Consumer off/pausa non ancora montato,0live.

## R-35 e prossimo lotto

PLAN ora contiene Esistente R35 con grep path:riga dei flussi attuali e vecchioForge4f3fc42: registrazione/scopedvoiceSessions/HMAC/postcall/brief/provider esistenti da riusare. Nuovo issuer/sessione, collocazione policy/link/inviti/tentativi e storageproposti NON sono scelte diC: domanda203655 alla coordinatrice prima di creare i producerX9/Forge. Prima scritturaPLAN fallita per cwd errato dopo domanda, salvataeffettivamente20:37 nel143-1 e rettifica inavanza,nessunaltrafilemodifica. Continuare solo contratti nelperimetro e dati/flowesistenti finché decisione esplicita; non duplicare writer,spostarevoiceSessions oinventare nuova persistedsource. Prossimo B0c2b browserfacade/inviti con Esistente prima di ogni decisione. LeaseC fino21:11:19. TaskglobaleIN CORSO,0/42live,0/2percorsi completi.


## B0c2b proiezione browser — checkpoint source, SDK ancora incompleto

Request stretta solo requestId/linkId. Proiezione restituisce esattamente6campi del lease, dopo ammissioneC3 con snapshot/viewer/origin corrente e autoritàD della fase after; nessun mapping/scope/viewer/invito/identity nelle proprietà della risposta. signedUrl è l'unico bearer necessario al collegamento ElevenLabs, solo all'ammesso, non log/storico/linkstabile. La validazione URL C3 è estratta e riusata senza aggiungere secondo parser; formatoURL non prova risorsa privata o ammissione. Owner/invitato/pubblico esplicito testati come helper, non autenticazione/HTTP/sessione reale.

39/39nuovi; baseline finale16verdi/23AssertionError,0errorisecondari, sorgente ripristinato SHA7497d5fad97320a043f3ae785e69d687e781e562e840cd3210348f3ee31b5970. Mirati124/124 in2/2file, full4459/4459 in158/158file,0skip. Native typecheck/lint/build/checkpack exit0. Finale20/20source mutant qualificate,2/2source SHA ripristinati. Prima19/20 mancava caso signature presente ma vuota: aggiunta solo fixture e rifatta campagna completa; baseline iniziale aveva7TypeError nel controllo proprietà su null, esclusa da qualifica e rifatta con assert nonnull prima della stessa assert proprietà. Nessuna asserzione indebolita.

Export pubblico SDK BLOCCATO sul perimetro: richiesta204709 per sole righeC in src/capability/index.ts. Non esportare dal agent-elevenlabs/index.ts: introdurrebbe ciclo index→browser→session→index con accesso ai suoi schemi prima dell'inizializzazione. Native build/pack passa, consumer namespace ESM/CJS è correttamente rosso 2/2 per funzione pubblica assente; queste sono BASELINE,0mutazioni compiled qualificate e0green SDK dichiarati. Testsmoke88asserzioni preparato WIP, non committato finché export autorizzato e verde. La distribuzione dist generata è ripristinata soltanto su200112, nuovi generated preservati nel percorso registrato B0c2b-DIST-RESTORE.json;0distcommittati.

R35: riuso src/capability/agent-elevenlabs/web-session.ts:88/116 (lease/sessioncurrent), web-context.ts autoritàD e src/capability/index.ts:92/94/95/97 (pattern exportdiretti). Forge attuale00a468e e vecchio4f3fc42 non contengono paginaParla/inviti; voice-svc registra e chiude sessioni esistenti, da riusare quando producerassegnato.0nuovihandler/storage/flow. Decisioni203655/204317 su proprietà dei dati e risolutore email ancora pendenti, nessuna scelta locale.

SegnalazioneB210025: il helper history89cc499 confronta binding/kind/requestId/tempo, NON resource/version né attestazione ingresso→turno→reply consegnata. NON usarlo da solo per Funziona. B fornirà forma del suo intentledger canonico; successivoB0c3 aggiunge attestazione/guard condivisi nel perimetro, non DTOlocale o writerduplicato. TaskglobaleIN CORSO,0/42live e0/2percorsiutente completi.
