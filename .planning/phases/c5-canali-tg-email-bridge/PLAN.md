# C5 Canali TG/email — bridge B

Ultimo aggiornamento: 08/10/2026 20:38 CEST.

Assegnazione: posta 20261008-202442, worktree 147-1, branch codex/c5-canali-tg-bridge, base ae7c464c458814b26baca17106c8dce80f4c6f84. Il piano generale della bacheca C5-CANALI-TG-EMAIL-PLAN.md ha SHA256 86fee95ed80b96d66dce64cd3277b4a6d14d515814bfdfe68ff12f77edde28a4. È stato letto con le decisioni 192927 e 202442. Bacheca e MESSAGGI sono sola lettura; si comunica con posta.py e compito.py.

## Fruibilità (R-34)

Obiettivo completo: owner/SA apre Canali, crea il bot o la casella dell'agente esistente, rigenera soltanto il token dello stesso bot, applica accesso/pausa e vede una prova reale ingresso → turno → risposta. Questo lotto prepara i contratti risorsa: non installa handler, non crea risorse, non prova il percorso vivo. Forge 148-1 e X9 149-1 seguono producer → consumer → UI → qualifica. Storico unico di C (89cc499), non un DTO parallelo. Dist è esclusa: F la rigenera all'integrazione 1.45.

## Perimetro

Esclusivamente src/agent/agent-channel-resource-operation.ts, src/http/endpoints/forge-agent-channel-resource.ts, src/http/endpoints/internal-agent-channel-probe.ts, src/http/endpoints/forge-agent-channel-probe.ts; sole aggiunte nei due barrel agent/index.ts e http/endpoints/index.ts; tests/agent/c5-channel-resource.test.ts, tests/http/endpoints/c5-channel-resource.test.ts, tests/http/endpoints/c5-channel-probe.test.ts, tests/cjs/c5-tg-email-smoke.mjs; questa cartella documentale. Nessun altro modulo, manifest, lock, versione, dist o configurazione. Fonte canonica: AgentChannelConfiguration, AgentOwnedChannelResource, AgentChannelAccessBinding, AgentManagementRequestId, AgentConfigVersion, AgentChannelFailure. Non si cambiano schemi precedenti.

## Lotti

- B1, 20:33–21:18, massimo 3 riparazioni: comando senza identità/risorsa/segreti dal browser; intento risolto dal server e relativo CAS; ricevuta pubblica stretta con vecchia risorsa e stato pending/applied/failed/reconcile_pending. Rotazione solo TG con bot proprio noto e identità invariata. Creazione solo assenza attestata (il produttore deve distinguere unknown da assente). Failed conserva risorsa nota; ambiguità richiede riconciliazione. Applied richiede nuova versione ed evidenza runtime canonica, non equivale a risposta utente. I contratti non attestano persistenza, provider o firma email: prove nei consumer successivi.
- B2: facciata Forge e avanzamento, autorizzazione sessione server e correlazione; preservare endpoint manual-token già esistente.
- B3: probe TG/email: consegna outbound distinta da risposta vera, requestId fresco, storico unico C e binding/versione/risorsa. Prima consumare i contratti di C integrati o chiedere dipendenza precisa.

Test prima del codice e rosso per asserzione pertinente, non errore di import. Ogni controllo nuovo viene rotto di proposito. Runner nativo Node24 env-i, worker1, no-file-parallelism, no-cache, testTimeout60000. Nessun test harness alternativo. Una suite pesante alla volta. Dopo ogni commit prodotto: commit SUMMARY/prove, poi rilettura PLAN/SUMMARY. Scadenza o 3 riparazioni: checkpoint, SALTATO con motivo, prossimo lotto indipendente. Niente push, merge, deploy, chiavi o dati reali.

## Esistente (R-35)

- **Esiste già?** In parte. Nel bridge esistono risorsa propria, configurazione desired/applied, binding e comando accesso; manca il comando pubblico idempotente per creare una risorsa dell'agente esistente o rigenerare il token automaticamente. Ricerca 08/10 20:37 nei src non trova create-resource/rotate-token; il test internal-factory-telegram-token.test.ts:71 riguarda il token manuale.
- **Dove vive oggi:** bridge src/agent/agent-channel-configuration.ts:41,56,93 (resource/config/applied); src/agent/agent-channel-access.ts:9,15 (binding/confronto); src/agent/agent-channel-access-requests.ts:59,133 (apply access e ricevuta); src/http/endpoints/internal-factory-telegram-token.ts:29,58 (manual token). Forge base 00a468e0: services/factory/src/services/rotate-telegram-token.ts:58,71,92; routes/telegram-token.routes.ts:34; agentmail.service.ts:54; agent-birth.repo.ts:15. Fonti lette da blob Git nel worktree B congelato 137-1, non dal checkout principale.
- **Come funziona oggi:** il manual-token passa dalla rotta autenticata al motore Forge, sostituisce la chiave propria nel Vault, scrive DB/context con writer unico e ricarica l'agente. Access C1 applica la singola porta separatamente. AgentMail crea inbox nel provisioning e può restituire stringhe vuote. AgentBirthRepo.begin crea l'agente: non è adatto a risorse tardive.
- **Vecchio Forge:** blob 4f3fc42: services/factory/src/services/telegram.service.ts:179 crea bot via BotFather, :278 valida getMe, :282 rollback delete; :322 deleteTelegramBot non è revoke-token. Agentmail.service.ts:54 crea inbox, :76 POST al provider, :119–122 ricava ID/address, :129 delete per rollback. Non esisteva una ricevuta pubblica di risorsa tardiva con CAS desired/applied. Non viene copiato un flusso parallelo di provisioning.
- **Cosa si riusa:** gli schemi canonici sopra, i codici failure fissi, metadata resource propria, versioni e requestId. Manual-token rimane nel suo endpoint. Nel consumer successivo si riusano writer/Vault e servizi provider; nessuna copia DTO, altro archivio storico o tabella births.
- **Cambia come funziona lo stack?** No nel B1: soli contratti e helper puri, nessun handler o collegamento fra servizi. Prima di cambiare reload/producer/writer nei lotti Forge/X9 occorre decisione precisa della coordinatrice: oggi manual-token ricarica l'agente intero, mentre la tavola richiede la sola porta. Non si può presentare tale scarto come già risolto da questi schemi.
