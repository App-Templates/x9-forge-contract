# R2-2 — SUMMARY

Ultimo aggiornamento: 07/10 03:34. DELTA R27 implementato e testato, PRONTO PER RI-VERIFICA indipendente di B. Prodotto/test 208f0a848162fd6b576b7b285dd76ffc62641ddd; precedente e318fe9 REVISE per il primo check voice-only. Nessun consumer, rilascio o verifica dal vivo.

## Correzione P1 assegnata03:26, chiarita03:30

- `completed` richiede un controllo testuale riuscito: web attestato loaded/ready resta ammesso anche con Telegram/email in pausa; un check Telegram/email deve invece appartenere alla configurazione attiva e applicata, alla stessa channelId, con osservazione loaded/ready. Voce sola non basta. Configurazione degraded non viene nascosta da un firstCheck dichiarato ready. Le intenzioni entrambe paused restano valide per un job pending.
- Due controesempi B riprodotti più quello sull'osservazione email degradata: codice e318 con test finali57/60,3/3asserzioni rosse,0pending; dopo guardia60/60. Sei nuove prove, positivi web/email/pending conservati; Telegram attivo già verificato dalla suite precedente. Nessun cambiamento a fixture/export/schema runtime canonico.
- Due mutazioni finali2/2 con asserzioni (guardiavecchia:3, readinessapplicataignorata:1),2/2SHA ripristinati e60/60restore. Questo è il delta, non una nuova campagna dei107 precedenti e non viene sommato ad essa.
- Finale1957/1957in112file;127/127nuoviR2in4file. Build/typecheck/lint/pack4/4 e CJS36/36+6/6. Perimetro prodotto2/2;1888/1888file del frozen e318 intatti prima dei documenti di consegna;2/2prodotto privato identico autore e diffprodotto0.
- Prove in `evidence/p1-correction/`; raw privati in `/var/folders/m3/mywf84wd2k50664nh_ffnc3m0000gq/T/codex-c-r2-p1-_z2vcmyi`. Prima preparazione: pacchetto non ancora compilato causava2exportCJS mancanti; npm-cache esterna causava packexit3, corretto solo cache privata. Full sandbox1955/1957 con2listenEPERM su server sintetici locali, rerun autorizzato. Iterazione TG/email-only è superata dalla precisazione03:30 e non committata: relativo full interrottoexit130, nessun risultato accreditato. Finale qui è il solo criterio chiarito.

## Consegna precedente — storia e limiti conservati

Ultimo aggiornamento: 07/10 02:48. Implementato e testato, PRONTO PER REVISIONE; consegna con campagna mutazioni parziale accettata dalla coordinatrice alle02:36. Prodotto/test congelati 505ab2f68d9803b807011f9d6042637f51a26a85, base 897258d, branch codex/r2-2/worktree43-1. Nessun rilascio o prova dal vivo.

## Risultato

- Canali di nascita Telegram/email: desired/applied separati e versionati, risorsa pubblica propria legata a tenant/owner/agente e identità canonica, osservazione datata, errori fissi. Una pausa desiderata impedisce nuova ammissione ma conserva risorsa/configurazione e rende visibile una vecchia applicazione ancora attiva. Il context legacy assente resta compatibile; estensione malformata rifiutata.
- Creazione: intento esplicito e chiave obbligatoria, checkpoint/job/id DB/risorse conservati nel replay. Confronto dell'intera richiesta normalizzata, conflitto se cambia; completed richiede entrambi i canali applicati e primo controllo su canale caricato e pronto. Helper puro: persistenza atomica e lookup per tenant/owner autenticati competono al producer.
- AgentContextWithChannelsSchema/WriteSchema, shouldLoadAgentChannel, isChannelConfigurationApplied, AgentCreationRequest/Checkpoint/ResultSchema e creationReplay da ./agent; internalFactoryReplayableDeployContract da ./http è opt-in sulla route deploy esistente (auth token), nessun fallback al deploy non idempotente.
- Estensione assegnata01:55: AgentChannelAttestationRequestSchema/AgentChannelAttestationSchema/isChannelAttestationCurrent; internalChannelAttestationContract POST /internal/channels/attest, auth secret = X-Internal-Secret canonico come capToolCallContract. Richiesta scope/identity/kind email|voice/configVersion; risposta applicazione effettiva nullable + AgentRuntimeChannel/observedAt/errori fissi. Helper lega scope completo/management identity/kind/versione e freschezza con clock iniettato (default60000ms), current non significa ready. Il servizio deve autorizzare e osservare l'handler a ogni richiesta; desired/context o health globale non attestano il caricamento.
- Voice mantiene AgentVoiceConfigSchema canonico (versions/desired/applied); birth channelConfigurations resta solo Telegram/email. Contratto attestazione voce non introduce impostazioni voice locali.

## Prove

- Suite finale1951/1951 in112file; base897 precedentemente rifatta1830/1830 in108file nella revisione indipendente BRIDGE131.121/121nuovi in4file (118mirati+3compatibilità).
- Build/tipi/lint/check:pack4/4;294dichiarazioni portabili. CJS e compatibility nel log evidence/verification.json;556/556simboli1.30 in18subpath preservati dalla guardia della suite,26/26nuovi inESM e26/26inCJS.
- Perimetro 14/14, protetti 1856/1856 blob base intatti,2/2indici append-only,privato 378/378 input SHA ripristinati,diffprodotto0. Package/versione/CHANGELOG/dist autore intatti; compilazione solo privata.
- Test prima del codice: import mancanti conservati come diagnostici preparatori, non accreditati come mutazioni. Commit14044b0prima versione82/82mirati e1915/1915suite;ff3d02eisolamento90/90;95a4d71trasporto112/112;ac63c47frontiere118/118;505ab2f controesempi precisi e tutti26export.

## Mutazioni — limite e deroga della coordinatrice

Fase6SALTATO dopo3tentativi secondo BACHECA66; la coordinatrice02:36accetta il parziale e autorizza CONSEGNATOdopo qualità/suite. NON102/102o107/107.

1. Esplorativoac63:30/31campioni con AssertionError e verde dopo ogni restauro; controllo cardinalità sopravvissuto. Rafforzato il test del singolo canale e quello Telegram estraneo al servizio email/voice; prodotto invariato.
2. Finale505:21/102asserzioni rosse,restauro byte per campione e baseline118/118; Timeout180s processo22,nessun verde finale di questo giro. Non accreditato il timeout.
3. Sessioneunica107(incl5metadataHTTP):nessun rapporto baseline in150s,0/107mutanti accreditati. Processi privati chiusi e tutti4sorgenti ripristinati; la suite completa finale sopra è verde sul codice originale.

Giri distinti, nessuna somma dei punteggi. Campagna/runner/nomi/failureMessages in evidence/mutations-partial.json e script; raw in /private/tmp/codex-c-r2-2-check-dey_2m95/evidence. Il verificatore indipendente farà campioni mirati, dando precedenza a full scope/identità, pausa ammissione, completed/firstCheck, confronto intento intero e auth/schema del trasporto. Nessuna promessa di mutation coverage completa.

## Limiti e raccordo

Solo bridge/helper e fixture sintetiche; niente producer/consumer attivati, provider reale, credenziali/.env, Meditation/browser, push/merge/deploy, package release. Anche response ok:true può rappresentare checkpointincomplete: il consumer legge phase e osservazioni. Pronto e channelsComplete sono gate dei producer/B1; una versione applicata salvata da Forge non sostituisce l'osservazione runtime del servizio. Pin/release e unioneR2nel43-3 restano alla coordinatrice dopo R27.

R27 da altro autore richiesta. Tutte le prove del prodotto505 congelate; un eventuale commit successivo di questo SUMMARY/evidenze non cambia prodotto/test.
