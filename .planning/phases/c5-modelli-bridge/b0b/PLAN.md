# B0b — chiavi alla nascita, contratto interno

Assegnazione coordinatrice 183937, ordine B0→B0b→B0c confermato 184810. B0 locale consegnato HEAD27749e4, suite completa in CI e review indipendente pendenti. Questo lotto distinto inizia 18:57:33 e termina 19:42:33 CEST; massimo45min/3riparazioni. Worktree140-1 sullo stesso ramo assegnato, repo unico bridge. Nessuna modifica Forge/X9 e nessun push.

## Fruibilità (R-34)

B riserva gli ID prima degli effetti esterni; A ha il writer transazionale di riferimenti alla fonte. Il contratto permette di osservare prima le chiavi disponibili e legare esattamente quello snapshot alla nascita, con idempotenza sul completo intento. Trasporta solo nomi, versioni e riferimenti: zero valori o hash privati. Fonte parametricamente identificata; oggi solo kind master, un futuro gruppo deve essere respinto senza fallback. La presenza di un riferimento non prova applicazione al runtime. Servizio, dati veri e prova dal vivo restano consumer: zero prove dal vivo qui.

## Riuso e perimetro

Riusare CredentialKeySchema (esclude chiavi interne), CredentialVersionSchema, AgentManagementRequestIdSchema (requestId) e z.uuid() (birthId), CapabilityAgentScopeSchema, identità completa 1.44 derivata dalla forma canonica AgentContextIdentitySchema, INTERNAL_TOKEN_HEADER/AuthInternalTokenSchema. sourceVersion aggregata non introdotta: ogni key ha version e il vettore è rappresentato da uno snapshot SHA256 opaco, senza TTL inventato. Niente schema o store nuovo nei consumer.

File previsti: src/vault/credential-birth.ts, export vault/index.ts, src/http/endpoints/internal-credential-birth.ts ed export endpoints/index.ts, tests/vault/c5-credential-birth.test.ts, questa sottocartella della fase autorizzata. src/vault/**,src/http/endpoints/** e test autorizzati183937; nessun file protetto, versione/pin/CHANGELOG o altro modulo di produzione. dist compilato conservato privatamente e ripristinato come185400.

## Forme proposte ai consumer

CredentialBirthSourceSchema {kind:master,identity3ID}; preview request{source}, response{ok:true,source,snapshot,entries:[{key,version}]}. Bind request{requestId,birthId,scope(ownerId,tenantId,agentId),identity3ID,source,expectedSnapshot}; result{ok:true,requestId,birthId,scope,identity,source,snapshot,outcome:created|unchanged,references:[{key,version,source}]}. Receipt{request,result} conserva l'intento completo, confronta ID/scope/source/snapshot e non inventa applied. Preview empty e riferimenti empty sono osservazioni vere, non falsa indisponibilità. Nessuna chiave duplicata, nessuna origine nonmaster, source nonself, scope.agentId=identity.runtimeAgentId.

Errori distinti:invalid_request,identity_mismatch,source_unavailable,snapshot_conflict,idempotency_conflict,birth_not_found. Il codice può trasportare questi esiti, senza associare automaticamente uno status HTTP nonimplementato. Endpoint POST /internal/credentials/birth/preview e /internal/credentials/birth/bind: token e header canonico,nessuna authClerk. Descrittori senza handler; fonte e scope devono essere riscontrati server-side prima di lookup. Lock agente→fonte,ricontrollo keyset/version/hash e scrittura riferimenti+receipt+audit nello stessoTX restano A.

## Qualifica prima del prodotto

Nuovo test usa export pubblici con fallbackunknown per asserzioni rosse, mai importerror. Copre campi obbligatori/null/blank/tipo, canonico3ID,snapshothexSHA256,scope,mapping,sourceparametrica e nonself,strictvalori/hash/TTLapplied vietati,keyinterni/versioni/dedup,request/resultcorrelazione,ritentativo identico/ordine proprietà/differenze complete/replaytransazionale solo dichiarato,descriptorPOST/path/header/auth/schema. Ogni controllo nuovo deve avere mutazione conAssertionError e restorehash;tipi/lint/build/dts/pack/pubESM+CJS/probetipi. Suite completa delegataCI184810. Vecchi test conservati;runmiratomaxWorkers1.

## Corrispondenza e limiti

Aspettativa Stefano: tutti gli agenti nascono con dote della fonte Master, futura fonte per gruppo senza costruirla ora. È prerequisito delle azioni della tavola Chiavi (sincronizzazione per agente/provenienza): nessun flussoUI o valore nel contratto. Asset vecchioForge: credentialWinners,cascade,referenceRepo,credentialActions e finishAction giàriusabili secondo A185348; non sostituirli con un nuovo store. Consegna locale distinta da CI e verifica indipendente; niente deploy o effetti reali.

## Precisazione consumer B, 19:03

birthId è UUID assegnato da AgentBirthRepo, distinto dal jobId UUID di CreationIntentRepo; relazione persistita1:1. Non sostituire i due. Il formato birthId viene qualificato con otto nuove asserzioni rosse prima del cambiamento; requestId mantiene il tipo canonico dell’operazione. La correlazione DB tra nascita e lavoro deve essere riscontrata nel consumer.

## Ordine aggiornato 19:07

Decisione coordinatrice 190721 per ordine Stefano19:05: Spesa esclusa dal rilascio, lotto B0c cancellato senza codice scritto. Restano B0 e B0b; A190601 conferma necessità della API Chiavi per la sincronia alla fonte Master. Fonte preview/classificazione ereditabile riscontrata dal consumer A: escludere botTelegram,modelsetting,internal e chiavi non classificate, senza inventare una seconda lista nel bridge. La relazione jobId UUID→birthId UUID è mantenuta e riscontrata dal consumer; il wire dichiara birthId e requestId dell’operazione.
