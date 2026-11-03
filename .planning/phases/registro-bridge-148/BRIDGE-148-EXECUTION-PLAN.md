# REGISTRO-BRIDGE-148 — raccordo di esecuzione R-35
Il piano tecnico vincolante resta BRIDGE-148-PLAN.md di Opus; questa nota registra il riuso verificato e non cambia mandato, limiti o perimetri.
Tre lotti B1/B2a/B2b, tre commit atomici; validazione finale senza un quarto commit o nuovo codice.
## Esistente (R-35)
**Esiste già?** In parte: trasporto stato/installazione consumer, stato per agente e motivo in-progress esistono; mancano notifica consumer→core e pending pubblico.
**Dove vive oggi:** src/http/endpoints/internal-models-batch.ts:37; src/model-router/agent-model-configuration.ts:153; src/agent/agent-management.ts:153; src/agent/agent-model-management-values.ts:16; src/model-router/model-consumer-execution.ts:45.
**Come funziona oggi:** i consumer pubblicano runtime state e ricevute tramite contratti canonici; agent-core aggrega lo stato e i comandi ritornano esiti per target. Il risultato valido distingue versione desiderata e applicata e contiene già in-progress. Questo componente aggiunge solo formati e aiuti, nessun handler o worker.
**Vecchio Forge:** forge-v2 al commit 4f3fc42, services/vault/src/routes/vault.ts:596-640: lettura e PUT dei modelli MC nel Vault, DELETE a seguire; salvataggio sincrono senza protocollo di registro o stato di applicazione. Codice letto in sola lettura.
**Comportamento da mantenere:** la scelta salvata deve diventare osservabile e applicata senza spegnere il runtime; gli esiti dei singoli target e il confronto di versione non possono essere sostituiti da un successo globale inventato.
**Cosa si riusa:** ModelConsumerRuntimeStateSchema, ModelSlotIdSchema, INTERNAL_SECRET_HEADER, identità/scope, versioni, requestId e reason code canonici, AgentManagementCommandResultSchema; export wildcard esistenti nei tre ingressi pubblici.
**Si riscrive?** No: aggiunte nei soli tre sorgenti e tre test autorizzati, senza nuovi motori o duplicazione dei contratti.
**Cambia come funziona lo stack?** Sì: aggiunte previste dal Registro modelli, approvato da Stefano: «Fallo fare all'agente opus che ha fatto l'analisi così prosegue con il contesto» e «si» all'assegnazione ai Codex tramite Opus.
## Confini confermati
POST consumer→core usa /internal/models/consumer-reports/:slotId, il prefisso distinto richiesto dal piano locale di Opus. Gli endpoint consumer esistenti restano invariati.
Pending è opzionale e annullabile. Failure usa i codici già dichiarati dal bridge; initial/apply rispettano la presenza dell'autorità salvata.
L'aiuto in-progress riusa il controllo di convergenza delle versioni già nello schema del risultato, evitando una seconda regola divergente.
Nessun index.ts, dist, versione, CHANGELOG, lock, model-consumers o agent-model-management-values consegnato.
Il posto è gestito dalla coordinatrice secondo risposta 134414; nessun accesso di Codex F a ~/.claude.
Ordine di adozione: bridge → F5 adotta senza emettere pending → X4/X6; pagina e comportamento dal vivo restano ai lotti consumer.
