# C5-MODELLI-BRIDGE — B0 provenienza dei modelli

Codex F, incarico coordinatrice181004, lotto18:19:38–19:04:38 CEST, massimo45min/3tentativi. Repo unico di questo lotto: x9-forge-contract, worktree140-1, branchcodex/c5-modelli-bridge, base release/v1.44.0 e2cffd9af3773c04a208fd9cf43046b82920694f. Forge fase1 consegnata alle18:19; nessun consumer o fileForge/X9 modificato nel lotto. Letti STATO, PLAN identità1.44 e modello esistente, nessunAGENTS locale. Dipendenze frozen/prefer-offline:235pacchetti riusati,0download,lockfile intatto.

## Fruibilità (R-34)

Il contratto porta la scelta salvata e la provenienza esatta da Forge al context X9: ogni funzione è sincronizzata alla fonte Master oppure personalizzata, anche se i valori coincidono. SourceVersion resta distinta dalla versione dell'aggregate agente. Il nuovo ingresso richiede owner/tenant e3ID completi, e concordanza col ruolo/parentela1.44. Solo il contratto: pagina, Store, dotazione nascita, installer/runtime e prova della nuova richiesta restano ai lotti consumer; non sono completati dal parser.

## Corrispondenza aspettativa/tavola e vecchio Forge

Eredità e desincronia della tavola Modelli r39–66→binding per slot; cambioMaster r89–111→identità/versione fonte; customugualeMaster→origin esplicita; nascitaB→scope/identità e writer obbligatorio. F0PLAN copre171elementi del disegno e15funzioni vecchie: qui il trasporto è generico per ModelSlotIdSchema, nessun ID aggiunto o funzione perduta. La sincronia non si ricava da equal-settings. Stefano182143: source parametrico, nessun GlobalVault di gruppo ora; l'oggetto source usa identità/versione senza lookup codificato su uno slug Master. La nuova enum rimane master/custom come requisito attuale; un futuro origin differente richiederà contratto additivo.

## API minima e file

In src/model-router/agent-model-configuration.ts, senza cambiare vecchi campi: AgentModelSourceSchema {identity completa,sourceVersion}; AgentModelBindingSchema discriminanteorigin master|custom,source richiesto solo master; AgentModelsProvenanceSchema {scope canonico owner/tenant/runtime,bindings}. AgentModelsConfigurationSchema riceve provenance opzionale:legacy senza campo resta identico; quando esplicita,invalidità non si elimina/ignora. Ogni selection ha esattamente un binding e viceversa; fonte non self o mapping contraddittorio,scope runtime coerente.

Aggiunte pubbliche: AgentModelsConfigurationWithProvenanceSchema + createAgentModelsConfigurationWithProvenance (input tipato obbligatorio,output detached); AgentContextWithModelProvenanceSchema/WriteSchema compongono reader/writerModelli e identità1.44, obbligano nuova provenienza e confrontano root/config/owner/tenant/parent. Originmaster riferisce il runtime Master dichiarato, mai aliasmanagement; il Master stesso ha scelte proprie,non eredita da un'altra fonte. Schema attesta dichiarazione: esistenza/autorizzazione/freschezza della fonte e versione/source/model effettivo vanno riscontrati server-side nei consumer. Nessun automatico applied/runtime.

Perimetro181004: src/model-router/**,src/agent/**,i loro nuovi test,.planning/phases/c5-modelli-bridge/**. Previsto un solo file source e un test nuovo; nessun vecchio test/schemaLegacy rimosso,endpoint/header locale,pin,versioneCHANGELOG o gruppo. Nuovi simboli esportati dai wildcard model-router/root già esistenti. dist/** per build/pack richiesto182259, oppure build in copia privata e autore invariato; fullsolo dopo posto coordinatrice.

## Test prima del codice e mutazioni

Nuovo tests/model-router/c5-model-provenance.test.ts, entrypoint pubblico con fallbackunknown solo per osservare assertionrosse senza importerror. Casi: export,fullsnapshot,origin/value independence,scope mancante/null/blank,3ID positivi/scoped,copertura binding/selection,sourceversione distinta/valida,origine sconosciuta,custom con source,Master senza source,self-source/mappingconflitti,clone detached,legacy invariata,modern context e role/parent/scope/identity/version mismatch,writer anti-platformcredentials,stato saved con runtime null. Fixture sintetiche,nessun valore reale. Le asserzioni verdi della baseline si distinguono dalle rosse; TypeError/import/setup non sono rosso valido.

Una correzione alla volta, mirati maxWorkers1. Ogni controllo nuovo è rotto semanticamente; campagna documentata con mutazioni/AssertionError e baseline ripristinata/SHA,nessun timeout come successo. MiratiLegacy modelli/identità,tipi e lint. Appena slot:full,build/dts portabili,packprofilo invariato,smokeESM/CJS su vero package; fault compilato separato e restore. Audit diff/perimetro/protetti/0deletions;commit atomico normale senza push/merge/no-verify,docs/rilettura e verifica nonautore.

## Timer e limiti

Origine18:19:38→19:04:38,3repairmax,mai resetautonomo. Suitecomplete/build/pack pendenti slot; nessun blocco definitivo finché si può lavorare mirato. Alla deadline checkpoint e residui espliciti. ConsegnaImplementato/Testato locale distinto da Verificato dal vivo (0);versione1.45/rilascio/consumer solo coordinatrice eOKStefano.

## Ampliamento182834, concordato con D183832

ModelCatalogInventoryEntrySchema: {provider,modelId,access,compatibility:"unqualified"}, campi strict e provider/modelID/access riusati. Campo inventory opzionale nel ModelCatalog: solo ID non qualificati, stessa osservazione/versione/sourceVersion/agentId di entries, dedup esatta provider+ID, nessun ID già qualificato duplicato. Se non vuoto stato partial; [] richiede osservazione e distingue controllo eseguito da assenza legacy. Nessuna function/protocol/adapter/dimensione inventati, mai selezionabile. Access available è dichiarazione del producer dopo risposta completa di quel provider; prefissi parziali unknown. Revoca/missing elimina cache nel consumerD, non nel bridge statico. Fonte parametrica confermata da Stefano182143.

File aggiuntivo src/model-router/model-catalog.ts + tests/model-router/c5-model-inventory.test.ts; nessun vecchio test toccato. Test prima per export/canonicalfields/strict/null/duplicate/overlap/partial/observed-empty/legacy/nonselection. Mutazioni semantiche separate,poi unico full/build/dts/pack/pubconsumer sugli SHAfinali quando posto libero. Timer invariato18:19:38–19:04:38.

## Qualifica aggiornata dalla coordinatrice, 18:48

Messaggio 20261008-184810: commit normali e merge del main pubblicato 8b44af1 senza rebase; build/check:pack locali autorizzati anche col semaforo pieno. La suite completa sarà eseguita dalla CI nella PR in bozza che la coordinatrice pubblicherà. La consegna locale dichiara esplicitamente questo controllo pendente. B0b Chiavi nascita e B0c Spesa sono lotti separati successivi, con piani e timer propri. Nessun consumer modificato da questo B0.
