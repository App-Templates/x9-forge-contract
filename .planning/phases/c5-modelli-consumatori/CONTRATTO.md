# Contratto C5 consumatori Modelli

Base e22e7a2d. Tutti i simboli qui sotto sono esportati da `@x9-forge/contracts/model-router` e root; endpoint dal sottopercorso `http`, comando da `agent`. I 34 ID rimandano al censimento D, non ad altrettante installazioni.

## Registro e impostazioni

`registeredModelConsumerDefinitions()` restituisce `ModelConsumerDefinition[]` staccati: `slotId`, `capability`, `function`, `requirements`, `label`, `inventoryIds`, `scope`, `changeBoundary`, `routing`, `linkedSelectionGroup?`. Il vecchio `registeredModelConsumers()` restituisce ancora i quattro campi di base, ora 34 righe. `findModelConsumerDefinition()`/`findModelConsumer()` non scelgono default per ID sconosciuti.

C01 è `agent_chat`, invariato. C02 `agent_classifier` non richiede JSON nativo: Responses/ChatCompletions testo enum, conferma D083359. C09/C11 `voice_phone_live`/`voice_web_live` sono stream audio senza tools; C10/C12 delega ha tools, senza stream Responses nel payload, conferme E083038/D083359. Immagini QA/Security richiedono `vision`; Ricerca C30 richiede `webSearch`; structured output è distinto. Questi requisiti non attestano compatibilità di un modello o disponibilità di chiavi.

`CapabilityModelSettingsSchema` conserva automatic/pin a quattro posizioni standard/advanced/reasoning/fallback. Aggiunge:

- `mode:'single'`, `descriptor` e `embeddingDimensions` obbligatoria solo per embedding;
- `mode:'failover'`, `primary` e `fallback`, per STT file; embedding non può passare a un altro spazio come ripiego.

Capacità/funzione/catalogVersion/requirements restano obbligatori. `modelSettingsSelections(settings)` enumera le vere posizioni, `primary` singola o `primary/fallback` o quattro tier. `sameCapabilityModelSettings(a,b)` confronta anche modalità, requisiti, catalogo e dimensione, senza dedurre origine. `isAgentModelRuntimeConfigurationMatching(config,runtime,now)` richiede identità/versione, evidenza fresca, copertura esatta e descriptor/dimensioni; non dimostra da solo un comando eseguito. `isAgentModelApplyConfirmed` mantiene anche comando/ricevuta/request/risultati.

Scope nel registro descrive il percorso esistente, non autorizza fallback globale o scritture su altri agenti. Le scelte condivise attuali sono dichiarate con linkedSelectionGroup (RAG C06–08; audio/delega phone+web; QA C22–23; Ricerca C30–31). Il producer conserva il gruppo e non aggiorna silenziosamente soltanto uno degli usi; l'inventario e la CAS includono i relativi cambiamenti.

## Fonte iniziale del Master

Normale GET `internalAgentModelsStateContract`, path esistente. `AgentModelsStateSchema.bootstrapSource` è opzionale/nullabile per compatibilità. Se presente non null, saved/runtime/versions sono null: la fonte osservata non finge un salvataggio o installed.

`AgentModelBootstrapSourceSchema`: schemaVersion1, identity completa management/runtime/Vault, scope owner/tenant/runtime, role master, authority runtime-loaded, sourceVersion opaca, observedAt/validUntil, coverage complete/partial, selections, missingSlots, excludedSlots opzionale. Selezioni riusano le impostazioni canoniche. Ogni slot del registro appare una volta come selezione, mancante oppure esclusione `{slotId,state:'not-installed'|'not-applicable',reason}`. Complete significa nessun missing attivo e almeno una selection. Assenza/non applicabilità vanno osservate nella stessa generation e scope; reader fallito o modello attivo sconosciuto non diventano esclusioni. C34 attivo senza modello osservato resta mancante. Nulla viene omesso dal censimento.

`isAgentModelBootstrapSourceCurrent(snapshot,{identity,scope,sourceVersion},now)` richiede fonte completa, identità/scope/generation equivalenti e finestra fresca. Il confronto dopo ogni await usa la generation vera del producer, mai quella eco della richiesta. Cambi a puntatore/config/install/enabled/fallback invalidano sourceVersion. Contesto privato, adapter o credenziali non si esportano. Nessun provider call per produrre la lettura.

Comando canonico `AgentManagementCommandSchema`, `apply-config`: campo opzionale `modelBootstrap:{expectedSourceVersion,expectedAbsent:true}`. Parte dell'idempotenza `sameAgentCommand`. È una precondizione, non un writer/installer: D conserva contesto privato e esegue CAS dell'assenza/generation, priming locale atomico, recupero e normale apply. Fonte opaca non diventa desiredVersion numerica. First Store e figli restano a B, handler X9 a D/E.

## Servizi

`internalModelConsumerStateContract`: POST `/internal/models/consumers/:slotId/state`, body `ModelConsumerStateRequestSchema` con identity/scope/slotId; response `ModelConsumerRuntimeStateSchema`.

`internalModelConsumerInstallContract`: POST `/internal/models/consumers/:slotId/install`, body `ModelConsumerInstallRequestSchema` con schemaVersion1, identity/scope/slotId/configVersion/requestId/expectedSourceVersion/settings; response `ModelConsumerInstallReceiptSchema`. Header interno esistente e servizio scelto da binding server fidato; mai URL browser. I producer chiamano `isModelConsumerRouteRequestMatching(params,body)` prima del lavoro, non basta validare separatamente i due oggetti.

Stato: schemaVersion1, identity/scope/slotId, sourceVersion osservata, observedAt/validUntil, status installed/pending/failed/unknown, configVersion/requestId/settings nullable, reason sanitizzata/null ed embedding rebuild/null. Installed obbliga settings/version/requestId ed eventuale rebuild completed; non-installed obbliga ragione. Readback vettori usa active, che resta previous finché rebuild non finisce. Il protocollo non qualifica un indice dal solo nome del modello. La nuova richiesta usa uno snapshot della chiamata/sessione; sessione in corso invariata fino al confine dichiarato.

Receipt: requestId, outcome installed/pending/failed, state. `isModelConsumerInstallRequestCurrent(request,{identity,scope,sourceVersion})` verifica CAS del server dopo await; `isModelConsumerInstallConfirmed(request,receipt,now)` confronta la prova reale, versione/request/slot/identità/scope/settings e freschezza. Reader remoto deve osservare provider realmente aggiornato. Unknown o lavoro in coda non sono installed. Idempotenza e revoca/rebuild/puntatori restano nei producer.

## Python e limiti della prova

`modelConsumerTransportJsonSchemas()` restituisce gli schemi JSON stretti shape-only per install/state/receipt/read. Non include refinements cross-field, generation CAS o osservazione runtime: Python deve passare dalla validazione del producer canonico e qualificare quei controlli nei suoi percorsi reali, senza copiare DTO o inventare la semantica. Il bridge non installa handler e non garantisce da solo isolamento di un servizio ancora condiviso.

Nessun provider, dato vivo, contesto o segreto letto. Test sintetici soltanto. Contratto implementato/testato localmente; installazioni/live 0/34. Revisione indipendente e integrazione restano necessarie.

## Delta del comando Master privato (09/10 09:00)

Nel normale apply-config si può trasmettere modelConfiguration, lo stesso AgentModelsConfiguration canonico con identità3ID e provenance completa. Ogni scelta deve corrispondere al registro (funzione/capability/requirements/routing); non si inferisce installed dal comando. modelExpectedSourceVersion è obbligatoria esattamente quando c'è la configurazione; opaca e osservata dal producer. configVersion deve coincidere con desiredVersion; se modelBootstrap è presente, le due expectedSourceVersion coincidono. PrimoStore usa expectedAbsent:true, modifiche successive non lo richiedono. Nessun contesto privato esportato.

Configuration, provenance/bindings e generation sono parte dell'idempotenza: scelta diversa con stesso requestId non è replay. Ordine proprietà e ordine dei set selections/bindings sono irrilevanti. isAgentModelCommandSourceCurrent(command,{identity,scope,sourceVersion}) ricontrolla la generation effettiva dopo ogni await e prima del writer; non legge provider né dimostra disponibilità. I producer verificano anche l'agente risolto dall'endpoint e owner/tenant autorizzati. Comandi legacy restano validi e non ricevono configurazioni/default inventati. isAgentModelApplyConfirmed confronta anche la configurazione trasmessa rispetto a quella salvata e la prova effettiva, non basta la versione numerica.

Lo schema della configurazione è isolato in agent-model-configuration-values, riusato e riesportato dai vecchi entrypoint. Valori condivisi management estratti byte-identici in agent-model-management-values; nessun contratto Vault cambiato. Le dipendenze lazy risolvono il caricamento da ogni entrypoint. La verifica nativa completa deve precedere la build.

## Fonte moderna leggibile da Forge (autorizzazione090653)

AgentModelsStateSchema.sourceObservation opzionale/null distingue il Master già salvato dalla bootstrapSource iniziale. Riusa SourceExpectation con identity completa, scope, sourceVersion opaca osservata e observedAt/validUntil. È presente esclusivamente con saved/provenance scoped e stesse identità/scope. Non si converte configVersion nella generation, non si inferisce installed, non si recupera il contesto privato e non si chiama un provider per leggerla.

B legge sourceObservation per modelExpectedSourceVersion, valida isAgentModelSourceObservationCurrent(observation,{identity,scope,sourceVersion},now); il confronto HTTP accetta la stessa finestra con max60secondi e tolleranza futuro5secondi, prima di validUntil. Il producer D mantiene la generation realmente osservata e la invalida su pointer/install/enabled/fallback. Dopo ogni await ricontrolla quel valore effettivo prima del writer. isAgentModelCommandSourceCurrent accetta sia la observation completa (e ne verifica freschezza) sia la tripletta letta direttamente dal producer; entrambe richiedono la configurazione trasmessa e generation/identity/scope uguali. Una risposta senza fonte moderna è esplicitamente indisponibile al percorso CAS, nessuna generation inventata.
