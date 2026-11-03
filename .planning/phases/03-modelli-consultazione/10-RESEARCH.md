# Ricerca locale — stato della catena

## Perimetro delle prove

Lettura del codice e dei riepiloghi congelati in SOURCES.json. B be337e4f, C 5460fa2f, D 94bb25f5, F 88fa718f. B/C/F puliti al rilevamento; D ha 19 documenti non tracciati della fase59, non eseguiti e non modificati da F. Le basi hanno snapshot di prodotto diversi: questa analisi non dimostra che possano essere fuse senza conflitti. Nessuna suite prodotto rieseguita durante la preparazione; i numeri dei SUMMARY sono prove storiche dei rispettivi autori, non nuove prove F. Non si leggono file runtime o segreti.

## Percorso effettivamente presente

AgentModels → AuthenticatedModelsPage(readOnly) → ModelsPageSession/ModelsReadSession → modelsTransport → apiRequest autenticata → Vault modelsRoutes/facade → DurableModelsBackend (DB + fonte) → factoryModelsClient → Factory modelsSourceRoutes → X9ModelsClient → X9 registerInternalModelsOverviewRoute → readLoadedModelsOverviewWithCatalogs → AgentManager + modelConfiguration/provenance + chatModelRuntime.evidence.

Il GET state per singolo agente è una seconda lettura interna esistente: Factory X9ModelsClient.state → registerInternalAgentModelsStateRoute → createSavedModelsSource/readSavedAgentModelsState + loadedModelSourceAuthority. Non è attualmente la lettura usata dal browser. Il backend Forge sovrappone al dato X9 le scelte durevoli di model_configurations; i valori applied restano riscontri X9. La rotta legacy /api/agents/:slug/models risolve Vault e codeDefault: non prova il modello caricato e non deve diventare il ripiego della nuova vista.

## Cosa c’è e cosa manca, anello per anello

| Anello | Già presente nel codice osservato | Mancanza concreta per questo incremento | Piano |
|---|---|---|---|
| Pagina C | AgentModels passa slug a vista readonly; wrapper autenticato; sessione per caller; renderer separato saved/default/applied | slug non risolto esplicitamente contro identità management; renderer mostra ID, non usa nomi ricevuti; link «Cambia in Modelli»; mancano origine/installazione, dettaglio e refresh normale | 10-04 |
| Sessione C | Abort/epoch per risultati tardivi; parsing canonico; controllo owner; errore e catalogo per agente | load cancella ogni dato precedente; non distingue errore refresh da prima apertura; carica cataloghi di tutti gli agenti, inutili alla consultazione del configurato; manca attestazione di zero rispetto a fonte omessa | 10-01,10-04 |
| API pubblica B | GET canonico overview, requireAuth, owner da DB; source valida mapping DB per ogni riga e filtra owner | Il filtro copre le righe, non gli agenti omessi dalla fonte. Deve filtrare/validare anche la copertura e non trasformare assenza di righe in vuoto attestato | 10-03 |
| DB Forge B | DurableModelsBackend legge model_configurations e bindings, confronta identità/versioni, conserva applied distinto; lock già richiesto dalla migration0010 | Il DB sovrappone solo righe esistenti X9: una configurazione senza riga non riappare. Archivio/migrazione/produttore assenti danno indisponibilità, non vanno creati dal GET. Prove finali B M3f incomplete dopo STOP | 10-03 |
| Proxy B | Vault→Factory via factoryModelsClient, route interna protetta, Factory→X9 con bridge; timeout e errori pubblici neutri; montaggio reale Factory index:114 e Vault index:52 | Qualifica composta sullo stesso pin e candidato; preservazione copertura. Nessuna nuova rotta HTTP necessaria per la vista | 10-03,10-05 |
| X9 D overview | route autentica, fonte caricata, confronto pointer/config prima/dopo await; row.saved da modelConfiguration; applied solo descriptor attestati | runtime-overview omette del tutto legacy/provenance mancante. Funzioni senza runtime restano unknown, ma non pubblica inventario di esclusi/mancanti. readCatalog può far fallire tutto anche quando il configurato è leggibile. Wiring usa solo evidenza chat, non aggregato completo capability | 10-02 |
| X9 D saved/state | reader scoped, mapping management/runtime/owner, file privato letto dal servizio; fonte env-primary esplicita, desired/runtime distinti, generazione opaca del caricato | Serve una proiezione pubblica minima anche prima della provenienza moderna; nessuna lettura di contesti dal Mac e nessun primo Applica automatico. Initial source e orchestration D59 sono ancora piani, non prodotto | 10-01,10-02 |
| Contratto F | AgentModelsOverview/Row; origin master/custom, installation installed/absent/unknown; state saved/runtime; BootstrapSource completo/partial con missingSlots/excludedSlots; sourceObservation; GET local-source solo sorgente | Overview non attesta copertura per agente e non ammette origine sconosciuta. InitialSource roleless concordato ma non implementato; nuovo local-source non in dist, non consumabile. Solo i minimi necessari alla consultazione vanno estratti/qualificati | 10-01 |
| Dati veri / ambiente | Nessun accesso eseguito da F. Vecchi riepiloghi distinguono fixture/runtime0 e feature incompleta | Inventario autorizzato, versioni/mapping e percorso reale rilasciato da qualificare. I 13 agenti del vecchio lotto e i 34 consumer registrati non sono denominatori del nuovo ambiente | 10-05 |

## Raccordo tecnico proposto, senza scritture

1. Riutilizzare le rotte overview esistenti. Nel bridge aggiungere un’attestazione di copertura per agente e ammettere origine non attestata nella SOLA proiezione di lettura. Nessun nuovo enum nel binding salvato o nel comando. Il dettaglio dei campi è nel piano10-01: è una proposta tecnica da revisionare prima di implementare, non un contratto già pubblicato.
2. D legge le configurazioni veramente presenti nei propri reader. Le legacy richiedono una selezione osservata dal reader canonico reale e mapping validato: se una trasformazione non è dimostrabile, conservare il limite pubblico, non convertire codeDefault in dato vero. Nessuna migrazione/priming come prerequisito automatico. Il contratto roleless esistente in pianificazione è riusabile solo se strettamente necessario, dopo qualifica F; non far partire tutta F02/D59.
3. Distinguere configurato/salvato, caricato e applicato: saved/versione desiderata non diventano applied. Per origine unknown mostrare «Provenienza non disponibile», inclusi i casi legacy. «Master stesso» viene dal ruolo/metadata attestato, mai dal nome o da origin=custom da solo.
4. Funzione/capacità assente richiede evidenza di installazione assente allo stesso snapshot; un timeout è unknown. Fonte parziale conserva le righe valide e i mancanti. Zero è esposto solo con coverage complete e zero funzioni confermate, non con elenco omesso.
5. La lettura non richiede discovery provider/cataloghi per visualizzare ID e settings già attestati: catalogo indisponibile non deve oscurare il configurato. Prezzi o disponibilità di nuove scelte sono fuori scopo. Riutilizzare la modalità di lettura dei settings, senza indebolire il catalogo usato dal writer esistente.
6. Scope owner/tenant va verificato su copertura e righe sia server sia client. I nuovi campi non sono automaticamente compatibili con parser strict vecchi: prima pin/package concorde di tutti i consumatori, poi il producer li emette. Conservare i fixture e writer preesistenti; un lettore vecchio resta un caso esplicito da verificare.

## Fonti puntuali

Tutte le righe seguenti si riferiscono ai root assoluti e SHA di SOURCES.json.

- C web/src/pages/agent/Models.tsx:6; AuthenticatedModelsPage.tsx:20–40; ModelsReadOnly.tsx:9–22; read-session.ts:48–84; page-session.ts:18–39.
- B services/vault/src/routes/models.routes.ts:42–63 e :93–119 (legacy); models-facade.ts:69–90; models-store.ts:26–116; factory-models.client.ts:7–20; services/factory/src/services/x9-models.client.ts:6–19; routes/models-source.routes.ts:7–21; index.ts:114.
- D services/agent-core/src/models/runtime-overview.ts:17–35 (omissione) e :44–76 (proiezione), :102–126 (catalogo); routes/internal-agent-models-state.ts:37–67; models/saved-source.ts:8–18; index.ts:683–704.
- F src/model-router/models-batch.ts:35–74; agent-model-configuration.ts:47–59,86–123,150–160; src/http/endpoints/internal-agent-model-source-observation.ts:10–23; .planning/phases/02-modelli-authority-locale/02-01-SUMMARY.md (source/dist differiscono, task2/3 non iniziati).
- B .planning/phases/c5-modelli-f0b/master/SUMMARY.md:140–156: M3f checkpoint parziale, InitialSource ancora dipendenza; C .planning/phases/c5-modelli-pagina/SUMMARY.md:1–18: pagina sintetica, fonte/live aperti; D59 CONTEXT code_context: ciclo core→cap→core se si usa models/state come local authority.

## Validation Architecture

Contratto puro e distribuzione → reader X9 in-process Fastify con fixture pubbliche/sintetiche e pointer race → DB PGlite + route Vault/Factory e HTTP X9 locale → DOM e browser reale locale → candidato integrato e prova ambiente autorizzato da operatore. Ogni controllo nuovo viene rotto intenzionalmente (asserzione semantica), quindi sorgente ripristinato e verde rieseguito. Nessuna prova di loader/ambiente conta come rosso causale. 10-VALIDATION.md mappa AC e denominatori; 10-05 richiede verificatore indipendente e prova del prodotto, non del mock.
