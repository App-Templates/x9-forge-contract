# Changelog — @x9-forge/contracts

## Non rilasciato

## v1.85.0 — sveglia del capo sul Mandato quando arriva una risposta email, additivo

- `@x9-forge/contracts/http` esporta in più `INTERNAL_PAPERCLIP_SEAT_REPLY_WAKE_PATH` (`POST /internal/paperclip/seats/reply-wake`, segreto interno), `InternalPaperclipSeatReplyWakeRequestSchema` (organizzazione, identità del posto, `messageId` come chiave di idempotenza), `InternalPaperclipSeatReplyWakeResponseSchema` (esiti `PAPERCLIP_SEAT_REPLY_WAKE_RESULTS`: `woken`, `skipped`, `duplicate`, `not_waiting`, `no_mandate`, `ambiguous`), `internalPaperclipSeatReplyWakeContract` e i tipi; nessuno schema esistente cambia; consumer: X9 cap-email (chiama dopo il turno email del capo) e cap-paperclip (sveglia con `POST /api/agents/{id}/heartbeat/invoke` di Paperclip).

## v1.84.0 — motivo leggibile dal modello negli errori di capacità, additivo

- `@x9-forge/contracts/capability` esporta in più `ToolErrorModelReasonSchema` (codice snake_case e spiegazione su una riga, al massimo `TOOL_ERROR_MODEL_REASON_MAX_CHARS` = 400 caratteri, nessun indirizzo, `Bearer` o sequenza da chiave), `TOOL_ERROR_MODEL_REASON_MAX_CHARS`, `toolErrorModelReasonOf` e il tipo `ToolErrorModelReason`; `ToolCallErrorResponseSchema` ha il campo facoltativo `modelReason`; i corpi senza il campo restano validi; primi consumer: X9 agent-core (lo lascia passare al modello con l'agente legato) e cap-paperclip (ci scrive i suoi motivi).

## v1.83.0 — catena di modelli a staffetta, additivo

- `@x9-forge/contracts/model-router` esporta in più `ModelChainSchema`, `ModelChainStepSchema`, `MODEL_CHAIN_STEP_ROLES` (`draft`, `critique`, `close`), `MODEL_CHAIN_EFFORTS`, `LAB_DIGEST_RELAY_CHAIN_ID`, `LAB_ANTHROPIC_MESSAGES_ADAPTER_ID`, `MODEL_CHAIN_ADAPTER_IDS`, `modelChainAcceptsAdapter`; nessuno schema esistente cambia; primo consumer: cap-lab dietro l'interruttore `LAB_RELAY` spento.

## v1.82.0 — attese native di Paperclip per P6 variante C, additivo

- `@x9-forge/contracts/capability/paperclip` esporta in aggiunta `PAPERCLIP_NATIVE_WAIT_TOOLS` (`paperclip_check_later`, fuori da `PAPERCLIP_TOOLS`), `PaperclipNativeReviewInputSchema` (review con `blockedByIssueIds` o `waitingFor.action`, solo con `blocked`, mai l'incarico stesso; `status: 'in_progress'` solo con `checkLater`), `PaperclipNativeCreateIssueInputSchema` (create con `waitForChild`, che richiede padre e ruolo), `PaperclipCheckLaterInputSchema`/`PaperclipCheckLaterOutputSchema` (monitor una tantum di Paperclip, 30..3600 s) e i tipi inferiti. Additivo: gli schemi e la lista degli strumenti esistenti non cambiano; il consumer li espone solo dietro `P6_LEAN_NATIVE_TURNS`. Origine `cbdd06c`, portata sopra `74fa40b`.

- P9, scheda 367: `INTERNAL_MEMORY_ASSET_CONTENT_PATH` (`/internal/memory/assets/content`), `InternalMemoryAssetContentRequestSchema`, `InternalMemoryAssetContentResponseSchema`, i tipi inferiti e `internalMemoryAssetContentContract` (POST, segreto interno) sono esportati da `@x9-forge/contracts/http` per leggere a blocchi i byte di un asset `generated` di Memoria A. La richiesta porta il contesto aziendale firmato, l'`AssetRef` completo con impronta e dimensione, `offset < sizeBytes` e `length` 1..262144. La risposta rigorosa (`assetId`, `sha256`, `sizeBytes`, `offset`, `contentBase64`, `eof`) impone base64 stretto, 1..262144 byte decodificati, `offset + byte <= sizeBytes` ed `eof` vero se e solo se si arriva alla fine; nessun percorso del deposito.
- Il servizio verifica sha256 e dimensione sull'intero contenuto prima di servire; il consumer le riverifica sul file montato. Assenza o asset altrui sono errori del servizio, mai un file vuoto. Contratto additivo: ingestione, lista e lettura dei puntatori di sessione restano invariati. Adozioni mancanti: memory (produttore: conservazione dei byte e rotta), cap-email (consumatore: allegato alla richiesta di approvazione) e ripin dei repo. Nessun bump o tag in questa fetta.
- Scelta 367: riuso invariato di `OrganizationRunContextSchema`, inclusa la scadenza successiva all'emissione; firma, scadenza rispetto all'ora corrente e autorizzazione restano al servizio. Nessuna dipendenza dall'orologio aggiunta al contratto.
- SUMMARY 367: base `590f21f25abbda048bdd422fce4f0fbb7f4fb920` (1.80.0). Scritti 75 casi, inclusi import ESM e require CJS dei compilati tramite Node e ricomposizione di più blocchi con sha256. Casi passati/totali 1/75: unico mirato eseguito 1/1 verde (`generated asset content request accepts only generated assets`), restanti 74/75 non eseguiti dal worker. Dopo la prova i file sono tornati alla base durante il lavoro: modifica riapplicata senza altre esecuzioni. Tipi, lint, accettazione, build/rigenerazione `dist` e prove dei pacchetti compilati sono riservati al cancello; la build deve precedere queste ultime. Mutazioni rilevate/richieste 0/4 (eseguite 0/4): restrizione `generated`, controllo `eof`, limite `offset < sizeBytes`, chiave estranea accettata; coperte dai casi nominati su origine, EOF, offset e chiavi estranee. Non verificato dal vivo.

- P5, scheda 366: `BusinessUnitLeadBirthPendingSchema` e tipo inferito `BusinessUnitLeadBirthPending`, esportati da `@x9-forge/contracts/organization`, descrivono il corpo HTTP 202 rigoroso `{ ok: false, error: 'in_corso', reason, step? }`. Il motivo non bianco (1–500 caratteri) è conservato senza trasformazioni; il passo pubblico non bianco (1–128 caratteri) è facoltativo e può essere `null`. Nessun campo tecnico o identità dell'agente ammesso.
- Compatibilità storica: `step` assente resta assente dopo il parse e indica un produttore storico; `null` indica un produttore aggiornato che non individua il passo; una stringa ne contiene la chiave pubblica. Nessun default, deduzione dal motivo o catalogo locale di passi. `internalBusinessUnitLeadBirthContract.pendingResponseSchema` espone lo schema 202 da `@x9-forge/contracts/http`; richiesta, metodo, percorso, autenticazione e `responseSchema` del solo 200/replay restano invariati.
- Adozioni mancanti: Forge deve inviare il passo pubblico nel 202; cap-paperclip (630) deve validare e conservare motivo e passo e usarli nel messaggio. Rilascio, tag, ripin dei due repo e prova al banco sono consegne distinte della coordinatrice; questa aggiunta non completa la 630.
- SUMMARY: base `c202b824346742885ce79320cfbd53bd9c3309b6` (1.80.0). Scritti 60 casi, inclusi import ESM e require CJS dei pacchetti compilati tramite Node: casi passati/totali 0/60 (non eseguiti dal worker). Mutazioni rilevate/richieste 0/4 (eseguite 0/4): motivo bianco ammesso, motivo scartato, passo perso, campo `technical` accettato; coperte dai casi nominati su motivo bianco, corpi storici, passo pubblico e campi tecnici. Build/rigenerazione `dist`, accettazione, tipi, lint e controprove isolate riservati al cancello secondo le regole worker del 28/10; la build deve precedere i test dei pacchetti compilati. Non verificato dal vivo.

## v1.80.0 — decisioni sulle consegne e lettura completa per progetto, additivo

- S10, scheda 364: `DeliveryDecisionSubjectSchema` e tipo `DeliveryDecisionSubject` legano la decisione all'asset già salvato (`assetId` e `sha256`), con organizzazione, progetto e BU espliciti, riusando gli schemi degli asset. Richieste ed esiti delivery conservano il referente e la ricevuta email; `decisionOutcomeMatchesSubject` confronta la consegna immutabile e `decisionOutcomeFromEmailReply` accetta il mittente `{ email }` oltre a `{ ownerId }`. `verticalPlanDecisionSubject` continua a restituire il solo soggetto di piano.
- S10/P10, scheda 365: `INTERNAL_MEMORY_DECISION_REQUEST_PROJECT_LIST_PATH` e `internalMemoryDecisionRequestProjectListContract` aggiungono GET `/internal/memory/decision-requests/by-project`, con segreto interno. `InternalMemoryDecisionRequestProjectListQuerySchema` richiede tenant, agente lettore, organizzazione e progetto; `InternalMemoryDecisionRequestProjectCursorSchema` descrive il cursore JSON base64url con ambito e chiavi `createdAt DESC, requestId ASC`. Tipi omonimi senza il suffisso `Schema` esportati insieme agli schemi.
- `InternalMemoryDecisionRequestProjectListResponseSchema` riusa integralmente `InternalMemoryDecisionRequestReadResponseSchema`: al massimo 100 richieste uniche per pagina, di tutti i capi e con stati `open`/`decided` ed esiti `approved`/`rejected` conservati. `nextCursor` è obbligatorio e solo `null` indica fine lista; limite predefinito del servizio 50, lettura `limit + 1`, senza offset o filtro di stato. Autorizzazione del Director e verifica dello scope del cursore a ogni pagina spettano al servizio.
- Compatibilità: i JSON precedenti di piani, richieste, esiti e lista per agente mantengono le forme precedenti; create/read/outcome e la lista preesistente non cambiano percorso, query o risposta. Nessun nuovo stato o proiezione che perda referente, esito o ricevuta.
- Consumatori previsti: memory per persistenza, autorizzazione e paginazione effettiva (1314), cap-email per esiti umani delivery (1313), agent-core per manifest/registro e strumento del Director (1314); Forge aggiorna i profili dopo l'adozione. Nessun pin o tag in questa scheda.
- SUMMARY: scritti 7 casi su forme, cursore decodificato e continuazione esplicita, con esempi di più pagine e capi. Test mirato sugli esempi di pagina: 1/1 verde via qrun, 7,42 s; gli altri 6/7 casi non eseguiti dal worker. Accettazione, tipi, lint, build/rigenerazione `dist` (inclusi export delivery della 364) e mutazioni sono riservati al cancello. Mutazioni richieste eseguite dal worker: 0/3 (`nextCursor` facoltativo, duplicati ammessi, `requestId` del cursore facoltativo), coperte rispettivamente dai casi sulla fine pagina, sui duplicati e sul cursore; rosso, ripristino e verde da rilevare dal cancello. Nessuna prova di autorizzazione, isolamento SQL, arrivi concorrenti o assemblaggio dal vivo.

## v1.79.0 - busta della corsa di organizzazione per i capability, additivo

- Scheda 351 (seconda parte della 350, R-14): `OrganizationRunEnvelopeSchema` (oggetto rigoroso con `context: OrganizationRunContextSchema` e `tenantId` non vuoto) e il tipo `OrganizationRunEnvelope`, esportati da `@x9-forge/contracts/organization`. Solo versione, changelog e `dist`; nessun cambio di codice sorgente. Consumatore previsto: cap-paperclip, in una scheda successiva.

## v1.78.0 — conferma di una voce della mappa condivisa, additivo

- Scheda 363, RM-02: `COMPANY_MAP_CONFIRM_OPTIONS` conserva le opzioni `confermo` / `e-cambiato` e il loro ordine; `companyMapConfirmationSubject(entry: CompanyMapAnyEntry): DecisionSubject` lega la conferma al digest e alla versione della voce, validando il soggetto con `DecisionSubjectSchema`.
- `CompanyMapConfirmTargetSchema` e il tipo `CompanyMapConfirmTarget` identificano la voce tramite livello, progetto e BU quando richiesti, tipo e riferimento; oggetto rigoroso, con il controllo di ambito già condiviso dalle voci. Esportazioni disponibili da `@x9-forge/contracts/organization`. Nessun contratto precedente cambia; adozione in memoria e cap-email prevista dalla scheda 1300.
- SUMMARY prove: aggiunti 22 casi in `tests/organization/company-map.test.ts`. Unico test mirato eseguito prima dell'implementazione: rosso 1/1 per funzione assente. `dist` ricostruita con `pnpm build` (esito 0). Accettazione completa e controllo dei tipi riservati allo script; nessuna verifica dal vivo.
- SUMMARY mutazioni richieste, eseguite 0/4: (1) `slice(0, 40)` → `slice(0, 39)`; (2) rimozione di `kind: 'confirmation'`; (3) rimozione del `superRefine` del bersaglio; (4) scambio dell'ordine delle opzioni. I casi aggiunti ne controllano rispettivamente identificativo, soggetto, ambito e ordine; esecuzione allo script.

## v1.77.0 — referenti proposti dal piano, mittente dell'asset, fonte `asset` del blocco aziendale, additivo

- Scheda 360: `ActionPlanReferentProposalSchema` e `referentProposals` facoltativo nel piano d'azione permettono di proporre referenti dell'organizzazione o della business unit, con controllo della BU nel piano completo.
- Scheda 361: `AssetRef.providedBy` facoltativo identifica il referente che ha fornito il materiale; `providedByEmail` facoltativo nell'ingresso della memoria permette al servizio di risolverlo dal mittente, rifiutando la compresenza con `asset.providedBy`. Consumatori: memoria e cap-email di X9.
- Scheda 362: fonte `asset` aggiunta a `COMPANY_CONTENT_SOURCES` e alla risposta del blocco aziendale; nessun'altra forma cambia e resta il controllo dei duplicati `[source, ref]`. Ogni piano, asset e richiesta valida con la 1.76.0 lo è con la 1.77.0. Prove: `tests/internal-memory-company-content.test.ts` copre la risposta `ok` con un asset, il duplicato asset e la fonte sconosciuta `file`, insieme al controllo duplicati preesistente; `tests/organization/index.test.ts` e `tests/internal-memory-assets.test.ts` coprono i contratti raccolti nel rilascio. Test mirato della risposta asset osservato rosso prima dell'aggiunta della fonte; accettazione, tipi e mutazioni a cura dello script. `dist` ricostruita con `pnpm build` (esito 0).

## v1.75.0 — segnale di nascita con i modelli e ricevuta della pubblicazione, additivo

- Gli agenti che nascono già con i modelli (eredi R&D: Lab, Ricerca, business unit del profilo `ricerca-lab`) non pubblicavano mai i modelli se non avevano una capability da installare: agent-core riconosceva la prima pubblicazione solo dalle configurazioni ordinarie. Il segnale di nascita lo dà chi possiede la nascita, cioè la factory di Forge.
- Nuovo file `src/agent/agent-birth.ts`, esportato da `@x9-forge/contracts/agent`: `AgentBirthDeployJobIdSchema`, `AgentBirthSignalSchema` (`deployJobId`, `configVersion`: la versione della `modelConfiguration` di nascita del contesto) e `AgentBirthModelsReceiptSchema` (`requestId`, `configVersion`: cosa risponde agent-core quando i modelli sono pubblicati e confermati), con i tipi `AgentBirthSignal` e `AgentBirthModelsReceipt`.
- `LifecycleCommandSchema` (`src/agent/agent-management.ts`): campo facoltativo `birth`, valido solo con `reload` (altre azioni: problema su `birth`, «A birth signal is only valid for a reload»). `sameAgentCommand` confronta anche `birth`: la stessa `requestId` con e senza segnale è un conflitto di idempotenza.
- `POST /internal/agents/:agentId/reload` (`src/http/endpoints/internal-agents-reload.ts`): corpo facoltativo `ReloadAgentBodySchema` (`{ birth? }`, `.strict()`) e risposta con `birthModels` facoltativo. Il contratto dichiara `bodySchema`; una richiesta senza corpo resta valida e `ReloadAgentResponseSchema` accetta la risposta di prima. `SecretBridgeClient.reloadAgent(agentId, body?)` manda il corpo solo se c'è e lo valida prima.
- `src/model-router/model-consumers.ts`: `MODEL_CONSUMER_ADAPTER_IDS` e `modelConsumerAcceptsAdapter(slotId, adapterId)`: gli adapter con cui un consumatore si installa quando non vale «qualunque adapter supportato». Oggi una sola voce: `lab_digest` solo con `lab-openai-responses` (cap-lab rifiuta dopo la nascita un descrittore con provider e modello giusti ma altro adapter); il produttore di una nascita lo controlla prima. Nessun cambiamento a `ModelConsumerDefinitionSchema`.
- Additivo: ogni comando, richiesta e risposta valido con la 1.74.0 lo è anche con la 1.75.0.
- Consumatori: agent-core di X9 (rotta reload e criterio di prima pubblicazione), factory Forge (passo `reload-agent-core` della nascita e controllo «ruolo completo»).
- Prove: `tests/agent/agent-birth.test.ts` (8 test), `tests/model-router/model-consumer-adapters.test.ts` (3 test); `tests/agent/agent-birth.mutation.mjs` toglie un controllo alla volta (14 mutanti, tutti uccisi). `dist` ricostruita con `pnpm build`.

## v1.74.0 — incarico di sessione della business unit e consegna verificata, additivo

- F4 (filiera MVP, cap-dev per le BU): nuovo file `src/capability/dev/session-assignment.ts`, esportato dal sottopercorso `@x9-forge/contracts/capability/dev`. È il contratto fra chi apre un incarico di sessione (cap-dev di X9, per conto del capo BU) e chi lo esegue (l'esecutore sul laptop del proprietario): l'incarico vive nel corpo di una issue della bacheca di sessione, il risultato nel ramo `consegna/<n>` e nel commento finale della stessa issue.
- Incarico: `DevSessionAssignmentSchema` (identità verificata di tenant, owner, organizzazione, agente e business unit; `productKind` solo `code` o `design`; compito e mini piano; materiali; repository di destinazione) con `DevSessionMaterialSchema` (allegato `AssetRef` oppure link GitHub, `DevSessionGitHubLinkSchema`: solo https e github.com, senza credenziali, parametri, frammento né segmenti `..`). Un materiale di un altro tenant, azienda, progetto o business unit rende l'incarico non valido (messaggi `material_foreign_tenant`, `material_foreign_company`, `material_foreign_project`, `material_foreign_business_unit`), sia in apertura sia in lettura.
- Blocco leggibile da macchina nel corpo della issue: `renderDevSessionBlock(assignment, digest)` e `parseDevSessionBlock(body)` (marcatore `x9:dev-session:v1` con l'impronta SHA-256, un blocco `json` di una riga con il `<` scritto `\u003c`); `devSessionAssignmentCanonicalJson` dà il testo su cui chi apre calcola l'impronta e chi legge la ricalcola (il ponte non calcola impronte). Blocco assente, doppio o illeggibile è un errore, mai un incarico vuoto.
- Consegna: `renderDevSessionDelivery` / `parseDevSessionDelivery` per il commento finale (riepilogo, riga facoltativa `Commit: <40 cifre>`, elenco `File consegnati:` con `- <percorso> sha256:<64 cifre> <n> byte`; percorsi relativi, niente `..`, massimo 20 file; riga malformata, percorso ripetuto o commit doppio sono errori). `DevSessionResultSchema` è il risultato letto e verificato da cap-dev: senza commit, file e asset non è un risultato.
- Costanti: `DEV_SESSION_AUTONOMOUS_LABEL` (`sessione:autonoma`), `DEV_SESSION_BRANCH_PREFIX` (`consegna/`), `DEV_SESSION_DELIVERED_FILES_LABEL`, `DEV_SESSION_COMMIT_LABEL`, `DEV_SESSION_BLOCK_MARKER`, i limiti, `devSessionBranch(n)` e `devSessionId(n)` (`R<n>`).
- `AssetOriginSchema`, variante `session` (`src/organization/asset.ts`): `repo`, `commit` e `path` facoltativi, tutti e tre insieme o nessuno (il puntatore alla consegna verificata; i riferimenti vecchi con il solo `sessionId` restano validi).
- `src/organization/business-unit-lead.ts`: `BUSINESS_UNIT_LEAD_AGENT_ID_PREFIX`, `businessUnitLeadAgentId(slug)` e `businessUnitSlugOfLeadAgentId(agentId)`: Forge dà al capo BU l'id `capo-<slug>` alla nascita, e chi ha verificato l'identità dell'agente ricava lo slug da lì invece di fidarsi di quello scritto dal modello.
- Consumatori: cap-dev di X9 (strumenti `dev_session_*`), cap-email di X9 (accetta come link nel resoconto un asset di sessione con il puntatore), esecutore laptop F5, factory Forge (nascita del capo BU).
- Prove: 77 test del contratto, 16 del puntatore di consegna, 12 dell'id del capo; `tests/capability/dev/session-assignment.mutation.mjs` toglie un controllo alla volta (25 mutanti, tutti uccisi). `dist` ricostruita con `pnpm build`.

## v1.73.0 — risposta di iscrizione R&D anche per la richiesta accodata, additivo

- ROPB-03 (346), sonda T1R: `CompanyRdEnrollmentResponseSchema` (`src/http/endpoints/internal-paperclip-rd-enrollment.ts`) accetta anche la risposta a una richiesta accodata e non ancora lavorata. La rotta registra soltanto la richiesta e i posti li crea dopo il processo a timer `cap-paperclip-enroll`: con `state: 'in_corso'`, `seats` ha 0 posti oppure esattamente un `lab` e una `ricerca` con `paperclipAgentId` distinti (altrimenti problema su `seats`: «Seats must be none or one per R&D part»); con `state: 'enrolled'` ha esattamente due posti, entrambi `enrolled` (altrimenti problema su `state`: «Enrolled state requires one seat per R&D part»). Con la 1.72.0 `seats` aveva sempre esattamente due posti. Restano i tre controlli di prima (parti distinte, `paperclipAgentId` distinti, `enrolled` solo con posti `enrolled`). La richiesta, i codici d'errore e il contratto non cambiano; nessun enum o regex nuovo. Additivo: ogni risposta valida con la 1.72.0 lo è anche con la 1.73.0.
- Consumatori: rotta di cap-paperclip di X9 (ramo `mvp/ropp-01`), factory Forge (chiamante della rotta), sonda T1R di night.
- `dist` ricostruita con `pnpm build`; export di `dist/http/endpoints/index.cjs`: 686 con la 1.72.0, 686 con la 1.73.0 (nessun export nuovo: cambia il corpo di uno schema già esportato).

## v1.72.0 — iscrizione Paperclip di Ricerca e Lab della società, additivo

- ROPB-02 (344), sonda T1R: `internalCompanyRdEnrollmentContract` (POST `/internal/paperclip/rd-enrollment`, costante `INTERNAL_COMPANY_RD_ENROLLMENT_PATH`, segreto interno), con gli schemi `CompanyRdEnrollmentRequestSchema`, `CompanyRdEnrollmentSeatStatusSchema`, `CompanyRdEnrollmentSeatSchema`, `CompanyRdEnrollmentResponseSchema`, `CompanyRdEnrollmentErrorCodeSchema`, `CompanyRdEnrollmentErrorResponseSchema` e i tipi `z.infer` `CompanyRdEnrollmentRequest`, `CompanyRdEnrollmentSeat`, `CompanyRdEnrollmentResponse`, `CompanyRdEnrollmentErrorCode`, `CompanyRdEnrollmentErrorResponse`. La factory di Forge chiede l'iscrizione dei due agenti di R&D della società (con l'identità completa) e Paperclip risponde con i loro posti.
- Regole: la richiesta ha esattamente un `lab` e una `ricerca`; la risposta ha un posto per parte, con `paperclipAgentId` distinti; `enrolled` solo se i due posti sono `enrolled`. Sei codici d'errore: `director_unknown`, `person_unknown`, `identity_mismatch`, `request_conflict`, `seat_failed`, `binding_write`.
- Consumatori: servizio Paperclip (rotta), Director e factory Forge, sonda T1R di night.
- `dist` ricostruita con `pnpm build`; export di `dist/http/endpoints/index.cjs`: 686 prima della ricostruzione e 686 dopo (la `dist` del ramo conteneva già i sorgenti e la ricostruzione non cambia nessun file), contro 672 con la 1.71.0: +14 a runtime. Otto sono dell'iscrizione (1 percorso, 1 contratto, 6 schemi). Sei sono del contratto di lettura dell'appartenenza capo/BU (PBB-01: `internalBusinessUnitMembershipReadContract`, `INTERNAL_BUSINESS_UNIT_MEMBERSHIP_PATH`, `BusinessUnitMembershipQuerySchema`, `BusinessUnitMembershipEvidenceSchema`, `BusinessUnitMembershipResponseSchema`, `parseBusinessUnitMembershipResponse`), già in `src/` e nella `dist` senza sezione versionata: questa versione lo dichiara e lo rende fissabile. Nessun altro export di `src/` resta senza sezione versionata.

## v1.71.0 — tenant esplicito nell'inventario degli agenti, additivo

- W22B-01 (sorgente nel compito 335), sonda T1: `ListAgentsAgentSchema` (`src/http/endpoints/internal-agents-list.ts`) accetta `tenantId` facoltativo. Quando ci sono sia `tenantId` sia `authority.tenantId`, devono coincidere (problema su `tenantId`: «Explicit tenant must match the declared authority»). Il valore non si ricava mai da altri campi: se manca, la riga è vecchia o l'agente non appartiene a una società. `AgentTenantIdSchema` (stringa non vuota e non fatta di soli spazi, nessun valore predefinito) è ora esportato dall'indice `agent` (`src/agent/agent-context-identity.ts`) ed è lo stesso schema del `tenantId` dell'identità del contesto.
- Consumatori: agent-core X9 con W22X-02 in `services/agent-core/src/routes/internal-agents-list.ts`, factory Forge `X9Client.listAgents()`, sonda T1 di night.
- `dist` ricostruita con `pnpm build`; export di `dist/http/endpoints/index.cjs`: 672 con la 1.70.0, 672 con la 1.71.0 (`tenantId` è un campo di uno schema già esportato; `AgentTenantIdSchema` entra nell'indice `agent`, non in questo). La `dist` della 1.70.0 conteneva già il sorgente, perché è stata ricostruita dopo il compito 335: questa versione lo dichiara e lo rende fissabile. Nessun altro export di `src/` resta senza sezione versionata.

## v1.70.0 — osservazione del tentativo di invio del piano verticale, additivo

- W25B-01 (335, 336, 337, 338), sonda T10: due contratti HTTP con segreto interno. `internalMemoryVerticalPlanObservationReadContract` (GET `/internal/memory/vertical-plan-observations/:observationId`, costante `INTERNAL_MEMORY_VERTICAL_PLAN_OBSERVATION_PATH`, sola lettura, query con scope esplicito) e `internalMemoryVerticalPlanObservationEventWriteContract` (POST `/internal/memory/vertical-plan-observations/:observationId/events`, costante `INTERNAL_MEMORY_VERTICAL_PLAN_OBSERVATION_EVENTS_PATH`). Schemi `InternalMemoryVerticalPlanObservationParamsSchema`, `InternalMemoryVerticalPlanObservationQuerySchema`, `InternalMemoryVerticalPlanObservationEventWriteRequestSchema`, `InternalMemoryVerticalPlanObservationReadResponseSchema`, `InternalMemoryVerticalPlanObservationEventWriteResponseSchema`, `VerticalPlanObservationErrorResponseSchema` e i tipi `z.infer` corrispondenti. Codici d'errore (`VerticalPlanObservationErrorCodeSchema`): `vertical_plan_observation_conflict`, `vertical_plan_observation_not_found`, `vertical_plan_observation_out_of_order`, `vertical_plan_observation_version_mismatch`.
- In `organization`: `VERTICAL_PLAN_ATTEMPT_EVENT_KINDS` (`sent`, `send_failed`, `reply_received`, `reply_delivered`), `VerticalPlanSendThreadSchema`, `VerticalPlanAttemptEventSchema`, `VerticalPlanAttemptObservationSchema`, `verticalPlanMatchesAttempt(scope, subject, plan)` e i tipi `VerticalPlanSendThread`, `VerticalPlanAttemptEvent`, `VerticalPlanAttemptObservation`. L'osservazione dice quale versione del piano è partita, verso chi e se la risposta è stata consegnata.
- Consumatori: memoria X9 (rotte e persistenza, W25L-02), sonda `piano_verticale_versione` T10 di night.
- `dist` ricostruita con `pnpm build`; export di `dist/http/endpoints/index.cjs`: 661 con la 1.69.0, 672 con la 1.70.0 (+11 a runtime: 2 percorsi, 2 contratti, 7 schemi). Nessun altro export di `src/` resta senza sezione versionata.

## v1.69.0 — lettura della spesa di una BU rispetto al tetto, additivo

- W26B-02 (333), sonda T12: `internalCompanySpendBusinessUnitReadContract` (GET `/internal/companies/:companyId/business-units/:buSlug/spend`, costante `INTERNAL_COMPANY_SPEND_BUSINESS_UNIT_PATH`), in sola lettura: il tetto non si cambia da qui. Richiede il segreto interno. Schemi `InternalCompanySpendBusinessUnitParamsSchema` (`companyId`, `buSlug`, presi dallo schema di nascita del responsabile della BU), `InternalCompanySpendBusinessUnitQuerySchema` (`tenantId` esplicito) e `InternalCompanySpendBusinessUnitResponseSchema` (`spentUsdMicros` e `capUsdMicros` in micro-USD interi, `percent` nullo se e solo se il tetto è 0, altrimenti `round(spent * 10000 / cap) / 100`; `warn80Alerted` e `capAlerted` restano veri anche se il tetto viene alzato dopo l'avviso); tipi `InternalCompanySpendBusinessUnitParams`, `InternalCompanySpendBusinessUnitQuery` e `InternalCompanySpendBusinessUnitResponse`.
- Consumatori: servizio che misura la spesa (rotta), pannello Forge della BU, sonda T12 di night.
- `dist` ricostruita con `pnpm build`; export di `dist/http/endpoints/index.cjs`: 661 con la 1.68.0, 661 con la 1.69.0. La `dist` della 1.68.0 conteneva già i 5 export a runtime della spesa (656 nominati più questi 5), costruiti quando il sorgente di 333 era già nel ramo: questa sezione li nomina per la prima volta. Nessun altro export di `src/` aggiunto dopo la 1.67.0 resta senza sezione.

## v1.68.0 — letture search e activity del posto Paperclip, additivo

- W26B-01 (331), sonda T12: `internalPaperclipSeatSearchReadContract` (GET `/internal/paperclip/seats/:paperclipAgentId/search`, costante `INTERNAL_PAPERCLIP_SEAT_SEARCH_PATH`), `InternalPaperclipSeatSearchQuerySchema` (`q`, `kinds` facoltativo a valori unici separati da virgola, `limit` 1-50) e `InternalPaperclipSeatSearchResponseSchema` (`paperclipAgentId` più l'uscita di ricerca); `internalPaperclipSeatActivityReadContract` (GET `/internal/paperclip/seats/:paperclipAgentId/activity`, costante `INTERNAL_PAPERCLIP_SEAT_ACTIVITY_PATH`), `InternalPaperclipSeatActivityQuerySchema` (`since`, `issueId`, `limit` 1-100) e `InternalPaperclipSeatActivityResponseSchema`. Entrambe richiedono il segreto interno e usano `InternalPaperclipSeatIssuesParamsSchema` per il parametro del percorso; tipi `InternalPaperclipSeatSearchQuery|Response` e `InternalPaperclipSeatActivityQuery|Response`.
- Export già in `src/` che nessuna sezione versionata nominava (W24B-01, 330):
  - Storico della mappa: `internalMemoryCompanyMapHistoryContract` (GET `/internal/memory/company-map/history`), `INTERNAL_MEMORY_COMPANY_MAP_HISTORY_PATH`, `CompanyMapHistoryQuerySchema`, `CompanyMapHistoryResponseSchema` e tipi `CompanyMapHistoryQuery`, `CompanyMapHistoryResponse`.
  - Osservazioni del mandato: `internalMemoryMandateObservationReadContract` (GET `/internal/memory/mandate-observations/:observationId`) e `internalMemoryMandateObservationEventWriteContract` (POST `/internal/memory/mandate-observations/:observationId/events`); costanti `INTERNAL_MEMORY_MANDATE_OBSERVATION_PATH`, `INTERNAL_MEMORY_MANDATE_OBSERVATION_EVENTS_PATH`; schemi `InternalMemoryMandateObservationParamsSchema`, `InternalMemoryMandateObservationQuerySchema`, `InternalMemoryMandateObservationEventWriteRequestSchema`, `InternalMemoryMandateObservationReadResponseSchema`, `InternalMemoryMandateObservationEventWriteResponseSchema`, `MandateObservationErrorCodeSchema`, `MandateObservationErrorResponseSchema`. Tipi corrispondenti: `InternalMemoryMandateObservationParams`, `InternalMemoryMandateObservationQuery`, `InternalMemoryMandateObservationEventWriteRequest`, `InternalMemoryMandateObservationReadResponse`, `InternalMemoryMandateObservationEventWriteResponse`, `MandateObservationErrorCode`, `MandateObservationErrorResponse`.
  - In `organization`: `MANDATE_ATTEMPT_EVENT_KINDS`, `MandateAttemptObservationIdSchema`, `MandateAttemptScopeSchema`, `MandateAttemptEventSchema`, `MandateAttemptObservationSchema` e tipi `MandateAttemptObservationId`, `MandateAttemptScope`, `MandateAttemptEvent`, `MandateAttemptObservation`.
- Consumatori: servizio Paperclip e Forge (rotte), sonda T12 di night; la memoria di X9 per storico e osservazioni del mandato.
- `dist` ricostruita con `pnpm build`; export di `dist/http/endpoints/index.cjs`: 633 con la 1.67.0, 656 con la 1.68.0.

## v1.67.0 — letture R&D per agente (lacune del brief di Lab, ricerche di Ricerca), additivo

- TV2B-01 (328), sonda T2: `labBriefGapsListContract` (GET `/internal/capability/agents/:agentId/lab/brief-gaps`), `LabBriefGapsListQuerySchema` e `LabBriefGapsListResponseSchema`; `ricercaResearchListContract` (GET `/internal/capability/agents/:agentId/ricerca/researches`), `RicercaResearchListQuerySchema` e `RicercaResearchListResponseSchema`. Entrambe le letture richiedono il segreto interno e lo scope esplicito del tenant e del proprietario.
- Consumatori: cap-lab e cap-ricerca di X9, sonde T2 di night; ripin TV2X-01, rotte TV2L-01/02 e sonda TV2N-04 necessari per il rilascio completo.
- TV2B-02 (329): versione e `dist` ricostruita con `pnpm build`; conservati 627/627 export di `dist/http/endpoints/index.cjs`, più 6 nuovi (totale 633).

## v1.66.0 — elenco delle richieste di decisione di un agente, additivo

- Sonde T3 e T7 dell'MVP (F1N-01) e ogni lettore che non conosce il requestId: `internalMemoryDecisionRequestListContract` (GET sullo stesso percorso della creazione), `InternalMemoryDecisionRequestListQuerySchema` (tenantId, agentId, planId e limit facoltativi), `InternalMemoryDecisionRequestListResponseSchema`.
- Consumatori: memoria A di X9 (rotta), sonde di night.
- `dist` ricostruita; conservati 624/624 export di `dist/http/endpoints/index.cjs` (ora 627).

## v1.65.0 — tipi da capo BU, ruoli lab e ricerca, modello effettivo, azienda cliente facoltativa nella lettura

- Tipi da capo BU (percorso MVP): `BUSINESS_UNIT_LEAD_TYPE_IDS` (dati, design, sviluppo, finanza, marketing), `BusinessUnitLeadTypeIdSchema`. Fonte unica (R-14): il catalogo di Forge (`packages/shared/src/business-unit-types.ts`) importa questi id e tiene solo capacità, livello e profilo. **Non compatibile:** `ActionPlanBusinessUnitSchema.typeId` accetta solo questi tipi (un piano non può più nominare un tipo che Forge non conosce). I piani salvati nella memoria A esistono solo da oggi e non sono in produzione.
- Ruoli (Stefano 24/10: «Si aggiungilo»): `LAB_ROLE`, `RICERCA_ROLE` in `AGENT_ROLES` con le loro capacità di base; `ParticipantBindingSchema.agentRole` facoltativo, scritto dal server alla creazione del posto. Additivo.
- Modello effettivo (decisione #21, «Ok»): `AgentModelSourceObservationSchema.effectiveModel` facoltativo (fornitore e modello), per la sonda T4. Additivo.
- Lettura del contenuto aziendale (decisione #18, «si strada minima per mvp»): `CompanyContentReadRequestSchema.clientId` facoltativo; se manca, la memoria A usa l'azienda attestata dalla mappa. Additivo per chi chiama.
- Consumatori: X9 (cap-email, memoria A, cap-paperclip, agent-core), Forge (catalogo dei tipi, compito dell'Opus di Forge).
- `dist` ricostruita; conservati 624/624 export di `dist/http/endpoints/index.cjs` e 176/176 di `dist/organization/index.cjs` (ora 180).

## v1.64.0 — versioni del piano d'azione nella memoria aziendale, additive

- F1P-01 (buco della riga: il contenuto del piano non era salvato da nessuna parte, la richiesta di decisione F1X-03 porta solo il soggetto): `INTERNAL_MEMORY_ACTION_PLANS_PATH` e `INTERNAL_MEMORY_ACTION_PLAN_READ_PATH`, `ActionPlanSaveRequestSchema`/`ActionPlanSaveResponseSchema`, `ActionPlanReadRequestSchema`/`ActionPlanReadResponseSchema`, `ACTION_PLAN_ERROR_CODES`, `ActionPlanErrorResponseSchema`, `internalMemoryActionPlanSaveContract` e `internalMemoryActionPlanReadContract` (POST, `authType: 'secret'`, contesto firmato come le altre rotte della memoria aziendale).
- Consumatori: memoria A di X9 (salva e legge), cap-email `email_request_decision` (salva la versione che manda), cap-paperclip `paperclip_create_approved_business_units` (legge la versione approvata).
- Compatibile con la 1.63.0: solo aggiunte. `dist` ricostruita; conservati 613/613 export di `dist/http/endpoints/index.cjs` (ora 624).

## v1.63.0 — contesto firmato nelle rotte asset della memoria aziendale, non compatibile

- F5B-01, seconda parte (compito del ponte per cap-lab/190 F5L-01, scelta di Stefano del 24/10: «Sì, va bene»): `InternalMemoryAssetIngestRequestSchema.context` (`OrganizationRunContextSchema`) obbligatorio: chi carica un documento dice per quale azienda agentica lo fa, con il contesto firmato del run; un allegato email che arriva da solo porta il contesto che il connettore emette per l'organizzazione della conversazione. La memoria A prende tenant e organizzazione dal contesto verificato, mai dall'asset (R-33).
- La risposta `file` dell'ingest porta `sha256` (impronta del contenuto).
- Elenco: `INTERNAL_MEMORY_ASSETS_LIST_PATH` (`/internal/memory/assets/list`), `InternalMemoryAssetListRequestSchema` (contesto, `projectId`, `companyId`/`buSlug`/`limit` facoltativi; niente `tenantId`/`agentId` nel corpo) e `internalMemoryAssetListContract` diventa POST con `bodySchema`. `InternalMemoryAssetListQuerySchema` resta esportato, deprecato.
- Consumatori da aggiornare: memoria A di X9 (cap-lab/190, primo consumatore: nessuno usava ancora queste rotte), poi F5L-02 e F5C-01.
- `dist` ricostruita; conservati 611/611 export di `dist/http/endpoints/index.cjs` (ora 613).

## v1.62.0 — projectId della ricerca e consulta_prima_il_quaderno, additive

- 322 (F1L-03): `ResearchRequestSchema.projectId` (facoltativo, come `AssetRefSchema.shape.projectId`) e `RicercaToolErrorSchema` con `consulta_prima_il_quaderno` in `src/capability/ricerca/` (consumatore: cap-ricerca di X9 `research_start`; poi cap-lab).
- Compatibile con la 1.61.0: solo aggiunte. La `dist` è ricostruita dalla punta di `integ/azienda-bridge`, quindi contiene anche quanto pubblicato dopo la 1.61.0 (tra cui 317, contratti della mappa aziendale, di Lab e del quaderno): i consumatori vedono questi export dalla `dist`.
- `dist` ricostruita; conservati 606/606 export di `dist/http/endpoints/index.cjs` (ora 611) e 174/174 di `dist/organization/index.cjs` (ora 176).

## v1.61.0 — tipo di BU nella richiesta di nascita del capo, non compatibile

- 320 (F2B-02): `BusinessUnitLeadBirthRequestSchema.businessUnit.typeId` è obbligatorio (`BusinessUnitTypeCardSchema.shape.typeId`); lo eredita `PaperclipCreateBusinessUnitInputSchema` e il `bodySchema` di `internalBusinessUnitLeadBirthContract`. Una richiesta senza `typeId` ora è rifiutata.
- Consumatori da aggiornare: Forge `services/factory/src/routes/business-unit-lead.routes.ts` (F2F-01); X9 cap-paperclip `create-approved-business-units.ts`, chi costruisce la richiesta (F1P-01/F2P-01).
- `dist` ricostruita; `dist/organization/index.cjs` 174 export (prima 152)

## v1.60.0 — piano d'azione, decisione legata alla versione, mappa dell'azienda cliente, porta Vault della chiave agente, contratti R&D, mandato riconciliato, additive

- 286-287: `ActionPlanSchema`, `ActionPlanBusinessUnitSchema`, `ActionPlanReferentRefSchema`, `ACTION_PLAN_BU_EXECUTORS` in `src/organization/action-plan.ts` (consumatori: agent-core, factory di Forge).
- 288: `DECISION_SUBJECT_KINDS`, `DecisionSubjectSchema` e il campo `subject` della richiesta di decisione (consumatori: agent-core, factory di Forge).
- 289: `CompanyMapEntrySchema`, `COMPANY_MAP_LEVELS`, `CompanyMapSourceSchema` in `src/organization/company-map.ts` (consumatori: memory, agent-core).
- 290: `INTERNAL_MEMORY_COMPANY_MAP_ENTRIES_PATH`, `internalMemoryCompanyMapWriteContract`, `internalMemoryCompanyMapListContract` (consumatori: memory, agent-core).
- 291: `putAgentCredentialContract`, `AGENT_CREDENTIAL_PORT_KEYS`, `PutAgentCredentialBodySchema`, porta Vault della chiave Paperclip dell'agente (consumatori: vault di Forge, cap-paperclip, cap-email).
- 292: `LAB_TOOLS.publish`/`readPublished`/`briefGaps`, `LabPublishInputSchema`, `LabReadPublishedOutputSchema`, `LabBriefGapsOutputSchema`, `LabGapsRefSchema` e il campo `labGapsRef` della ricerca (consumatori: cap-lab, cap-ricerca, agent-core).
- 293: `ReconciledMandateSchema`, `MandateReconciliationSchema` in `src/organization/business-unit-mandate.ts` (consumatori: agent-core, factory di Forge).
- `dist` ricostruita; conservati 587/587 export di `dist/http/endpoints/index.cjs` (ora 601) e 128/128 di `dist/organization/index.cjs` (ora 152).

## v1.59.0 — accesso per strumento esportato, rotte asset, posti e incarichi Paperclip, nascita R&D, additive

- 276 (P1X-01): `@x9-forge/contracts/capability` esporta `CAPABILITY_TOOL_ACCESS`, `CapabilityToolAccessSchema`, `capabilityToolAccess`, `toolsForRole` e il tipo `CapabilityToolAccess` (consumatori: agent-core, cap-paperclip).
- 278 (P1L-06): rotte asset della memoria aziendale, `INTERNAL_MEMORY_ASSETS_PATH`, `InternalMemoryAssetIngestRequestSchema`, `InternalMemoryAssetIngestResponseSchema`, `InternalMemoryAssetListQuerySchema`, `InternalMemoryAssetListResponseSchema` e i tipi `InternalMemoryAssetIngestRequest`, `InternalMemoryAssetIngestResponse`, `InternalMemoryAssetListQuery`, `InternalMemoryAssetListResponse` (consumatori: memory, cap-lab).
- 279 (P1L-06): `internalMemoryAssetIngestContract` (POST) e `internalMemoryAssetListContract` (GET), oggetti di contratto `{method, path}` delle rotte asset, importabili da X9 e dalla prova.
- 280 (P1P-02): `internalPaperclipSeatsReadContract`, lettura dei posti Paperclip, con `INTERNAL_PAPERCLIP_SEATS_PATH`, `InternalPaperclipSeatsQuerySchema`, `InternalPaperclipSeatSchema` e `InternalPaperclipSeatsResponseSchema` (consumatori: cap-paperclip, factory di Forge).
- 281 (P1P-02): `internalPaperclipSeatIssuesReadContract`, lettura degli incarichi del posto, con `INTERNAL_PAPERCLIP_SEAT_ISSUES_PATH`, `InternalPaperclipSeatIssuesParamsSchema`, `InternalPaperclipSeatIssueSchema` e `InternalPaperclipSeatIssuesResponseSchema`.
- 282 (P1L-05): `internalCompanyRdBirthContract`, nascita di Ricerca e Lab all'avvio della società, con `INTERNAL_COMPANY_RD_BIRTH_PATH`, `COMPANY_RD_PARTS`, `CompanyRdPartSchema`, `CompanyRdBirthRequestSchema`, `CompanyRdBirthResultSchema` e i tipi `CompanyRdPart`, `CompanyRdBirthRequest`, `CompanyRdBirthResult` (consumatore: factory di Forge).
- `dist` ricostruita; conservati tutti i 587/587 export di `dist/http/endpoints/index.cjs` nel confronto prima/dopo.

## v1.58.0 — permessi per ruolo, strumenti solo-Director, iscrizione in Paperclip, additive

- 265 (E2B-02): accesso read/write per strumento (consumatori: agent-core, cap-paperclip).
- 266-267 (E2B-02): ruoli e `roleScopePolicy` (consumatori: agent-core, factory di Forge).
- 268 (E2B-02): richiesta di approvazione umana di una scrittura e risposta che la decide (consumatori: agent-core, adapter Paperclip).
- 269 (E2B-03): `roles` negli strumenti e `toolsForRole` (consumatori: agent-core, cap-paperclip).
- 270 (E2B-03): capacità di base per ruolo, il Director può solo aggiungere (consumatori: factory di Forge, agent-core).
- 271 (E2B-04): iscrizione in Paperclip (`PaperclipEnrollmentSchema`) e rotta `/internal/paperclip/enrollments/resolve` (consumatori: cap-paperclip, adapter Paperclip, factory di Forge).
- 261-264 (AGD-02, PA-1.4, PA-1.6, AZE-01): vedi sotto.
- 262: `paperclip_search` e `paperclip_activity` (consumatore: cap-paperclip).
- 263: `BusinessUnitTypeCardSchema`, scheda del tipo di BU (consumatore: factory di Forge).
- 264: codici `business_unit_pending|refused|unavailable|register_failed|failed` (consumatori: agent-core e cap-paperclip).
- 261: `readDevSessionAssetContract`, byte di un file consegnato da una sessione autonoma con impronta (consumatore: cap-dev).
- Unisce main v1.57.0 (c978daf) con i contratti 261-264 su un solo commit; `dist` rigenerata dalla build.

## v1.57.0 — lab document ingestion and decision request routes, additive

- AGL-02: lab_ingest accetta un documento con AssetRef e brani.
- AGX-01: rotte interne delle richieste di decisione (apri, leggi, esito).
- Export the document ingestion schema through `@x9-forge/contracts/capability/lab` and the decision request contracts through `@x9-forge/contracts/http`; regenerate the distribution for X9 consumers.
- Built on v1.56.0 (main 716b5c3): keeps AVV-30 `daily_recap` and every 1.56.0 contract.

## v1.56.0 — company release (AGB-05), additive

- Single release for the agentic company: decision request (1.51.0), business unit competencies and referents (1.52.0), company asset reference (1.53.0), asynchronous per-agent turn jobs (1.54.0), company shared mailbox (1.55.0), automatic device snapshots (1.50.0) and the `daily_recap` owner notice kind (1.49.5, AVV-30) on one commit.
- No schema changed in this step: it joins `codex/cuore-bridge-148` and `opus/bridge-avvisi-20261020` and rebuilds `dist`. Consumers: agent-x9 (cap-email, cap-paperclip, cap-lab, memory, agent-core, cap-approvals) and forge-v2 (factory, web) pin this commit.

## v1.55.0 — company shared mailbox (AGB-04), additive

- Add `SharedMailboxSchema`, `SharedMailboxHolderSchema`, `SharedMailboxLabelSchema`, `SharedMailboxThreadSchema`, `parseSharedMailboxSubjectLabel`, `routeSharedMailboxMessage` (thread, then label in the subject, then Director) and `SHARED_MAILBOX_ROUTE_VIAS` to `@x9-forge/contracts/organization`.
- No existing schema changed. Consumers: cap-email (AGX-04), factory-svc agent birth (AGF-05).

## v1.54.0 — asynchronous per-agent turn jobs (AZ-EMAIL-LUNGHE), additive

- Add submit, read and result acknowledgement contracts, inferred types and validated path helpers to `@x9-forge/contracts/http`. Submission reuses the synchronous turn request with a 1–200 character idempotency key and optional email origin; HTTP 202 returns the durable job receipt, HTTP 409 uses `INTERNAL_AGENT_TURN_JOB_CONFLICT` for different content under the same key.
- Share job states and read validation: results only accompany completed jobs, errors only failed or uncertain jobs. Delivery acknowledgement echoes the stored result digest and is idempotent.
- Consumers: X9 agent-core and cap-email in follow-up tasks B–F. Distribution build and consumer pins follow separately; the synchronous endpoint is unchanged. These contracts alone do not implement durable jobs or email delivery.

## v1.53.0 — company asset reference (AGB-03), additive

- Add `AssetRefSchema`, `AssetOriginSchema` (origin kinds email, archive, session), `AssetSha256Schema` and `ASSET_ORIGIN_KINDS` to `@x9-forge/contracts/organization`.
- No existing schema changed. Consumers: company memory A (AGM-01), cap-lab (AGL-02), cap-email (AGX-03), cap-dev (AGD-01).

## v1.52.0 — business unit competencies and referents in the lead birth request (AGB-02), breaking

- `BusinessUnitLeadBirthRequestSchema` now requires `businessUnit.competencies` and `businessUnit.referents`. Add `BusinessUnitLeadReferentSchema` to the business unit lead contracts.
- R-37: no business unit lead birth requests are saved in production.
- Consumers: forge-v2 factory-svc `business-unit-lead.routes.ts` (AGF-01), agent-x9 cap-paperclip `runtime.ts` (AGP-01), and their fixtures must adopt the required fields and update the bridge pin.

## v1.51.0 — decision request and email reply outcome (AGB-01), additive

- Add `DecisionRequestSchema`, `DecisionOutcomeSchema`, `DecisionEmailReplySchema`, `decisionOutcomeFromEmailReply` and `decisionRequestSubjectLabel` (plus channel, id and option schemas) to `@x9-forge/contracts/organization`: an email reply «approvo / rifiuto: motivo» becomes the outcome of a decision request.
- No existing schema changed. Consumers: agent-x9 cap-email (AGX-01) and company memory A (AGM-01).

## v1.50.0 — automatic device snapshots (SNAP-AUTO), additive

- Add `backupDeviceAutoCreateInfoContract` (GET) and `backupDeviceAutoCreateContract` (POST) at `/backup/api/auto-create`, authenticated by device signature, and their strict schemas via `@x9-forge/contracts/capability`.
- Permanent authorization covers snapshot creation only: the body accepts a release and optional resource, never a restore kind. Export `BACKUP_AUTO_CREATE_DAILY_MAX` (6) and closed refusal codes `off`, `needs-passkey`, `daily-cap`, `busy`, `invalid`.
- Existing status, snapshot origins and passkey approval contracts remain unchanged. Consumers: cap-backup (x9-hotfix-backup/002) and x9-snapshot (mods-avvisi/022); adoption and deployment are separate.

## v1.49.5 — daily recap owner notice kind (AVV-30), additive

- Add `daily_recap` to `OwnerNoticeKindSchema` and its label «☀️ Recap del mattino» to `OWNER_NOTICE_KIND_LABEL` in `@x9-forge/contracts/capability`. Root cause: the night morning recap had no kind of its own, and reusing `fault` or `release_ready` would show a false label to the owner.
- Bodies and responses of `ownerNoticeDeviceContract` are unchanged; existing kinds stay valid.
- Consumers: agent-x9 cap-approvals (AVV-31, label comes from the bridge) and night `brief_cantiere.py mattino` (AVV-32).

## v1.49.4 — capo-bu literal and node-free subpath on one branch, additive

- Root cause: il letterale capo-bu e il sottopercorso node-free stavano su due rami diversi. The lane branch now carries both `BUSINESS_UNIT_LEAD_PROFILE_TEMPLATE` / `BusinessUnitLeadProfileTemplateSchema` (`capo-bu`) and the `@x9-forge/contracts/organization/business-unit-lead` subpath (1.49.3), with rebuilt `dist/`.
- Consumers: forge-v2 factory-svc `business-unit-lead.routes.ts` imports the literal from the subpath after the pin update.

## Unreleased — capo-bu profile template is a shared literal (R-14), breaking

- `BusinessUnitLeadBirthRequestSchema.profileTemplate` now accepts only `'capo-bu'` instead of any kebab-case string. Add `BUSINESS_UNIT_LEAD_PROFILE_TEMPLATE` and `BusinessUnitLeadProfileTemplateSchema` to `@x9-forge/contracts/organization` so consumers import the value instead of re-declaring it.
- Consumers: forge-v2 factory-svc `business-unit-lead.routes.ts` and `@forge/types` `FactoryWorkspaceProfileSchema` import the literal; agent-x9 cap-paperclip fixtures and the agent-core registry move from `'bu-lead'` to `'capo-bu'`.

## Unreleased — business unit lead birth endpoint (AZB-04), additive

- Add `INTERNAL_BUSINESS_UNIT_LEAD_BIRTH_PATH` and `internalBusinessUnitLeadBirthContract` to `@x9-forge/contracts/http`: `POST /api/internal/factory/business-unit-lead`, token authentication via `INTERNAL_TOKEN_HEADER`, reusing `BusinessUnitLeadBirthRequestSchema` and `BusinessUnitLeadBirthResultSchema`.
- Consumers: forge-v2 factory-svc (AZG-05) and agent-x9 Director tool «crea BU» (AZX-06).

## Unreleased — feature switches (BR-AUT-02), additive

- Add `FeatureSwitchStateSchema`, strict `FeatureSwitchSchema`, `FeatureSwitchListSchema` and inferred types to `@x9-forge/contracts/capability`. Enabled functions cannot have open links; lists require unique function names.
- Consumer adoption follows in X9-AUT-04, FG-AUT-01 and NM-096; this contract alone does not enable functions.

## Unreleased — `riassunto` nella richiesta di snapshot (BR-AUT-01), additivo

- `BackupDeviceRequestBodySchema` accetta il campo opzionale `riassunto` (stringa trim, 1..600 caratteri): «cosa potrai fare» con il rilascio, mostrato nella richiesta di snapshot sul telefono. I corpi senza il campo restano validi; il corpo resta `.strict()`.
- Consumer: night (NM-091) lo compila nella richiesta di snapshot.

## v1.49.2 — limiti del turno per agente (giro 0 azienda agentica), additivo

- Add `AgentTurnLimitsSchema`, `AgentMaxToolRoundsSchema`, `AgentTurnBudgetSchema`, `AGENT_DEFAULT_MAX_TOOL_ROUNDS` (5), `AGENT_MAX_TOOL_ROUNDS_CEILING` and the lenient reader `readAgentTurnLimits(context)` to `@x9-forge/contracts/agent`.
- New optional `context.json` field `turnLimits` `{ version, maxToolRounds: 1..200 | 'unlimited', budget?: { maxTokensPerTurn } }`; `'unlimited'` requires a budget. Absent ⇒ 5 rounds, no turn budget (today's behaviour). Invalid ⇒ defaults, never unlimited.
- Consumers: X9 agent-core `core/turn-processor.ts` and `core/conversation.ts` (reader); Forge factory writer and the agent settings page (follow-up). Context schemas are passthrough, so older consumers ignore the field.

## 1.49.1 + riconciliazione 18/10 (main b9a270e, consumer per SHA) — solo additivo

- La versione resta 1.49.1 (agent-core la fissa nel suo test di adozione); i consumer pinnano per SHA.
- Quaderno cap-lab: endpoint `src/http/endpoints/internal-capability-lab.ts` (pagine, dettaglio, crescita, competenze, lacune, export) con `LabHttpErrorSchema` derivato da `LabToolErrorSchema`.
- Lab: `src/capability/lab/browse.ts` e `growth.ts` (navigazione del quaderno e storico della crescita).
- Organizzazione e simulazione: `src/organization/*` (scenari versionati, corpora, esperimenti, `organizationRun` nel turno per agente).
- Paperclip: `AGENT_CREDENTIAL_COMMERCIAL_SERVICE_IDS` include `paperclip` e `github`.
- Sessioni di sviluppo e produzione cap-dev: `src/capability/dev/production-*`.
- Connect: `src/capability/connect/*` con i nuovi permessi `mail_read` e `drive_read`.
- Test: l'elenco del sottopercorso `capability/dev` conosce i due controlli nuovi.
- Attenzione R-37: `LabPageListOutputSchema`, `LabPageDetailOutputSchema`, `LabGrowthHistoryOutputSchema`, `LabExportResultSchema` hanno campi obbligatori nuovi (`snapshotVersion`, `truncated`, `content`, `partial`): sono risposte di cap-lab, non dati salvati; cap-lab non è ancora in produzione.

## v1.49.1 — fonte iniziale salvata rilegge gli slot registrati dopo (RIL-MODELLI-SLOT-NUOVI), patch

- Add `AgentModelSavedInitialSourceSchema`, `AgentModelSavedBootstrapSourceSchema` and `MODEL_SLOT_REGISTERED_AFTER_SOURCE_REASON` to `@x9-forge/contracts/model-router`: a source saved by an earlier bridge (34 slots on 13/10) that does not name a slot registered since (`lab_digest`) reads that slot as excluded `not-installed`, reason `Capability has no model receiver yet`.
- `AgentModelsStateSchema.initialSource` and `.bootstrapSource` use the saved variants, so X9 and Forge read persisted sources the same way.
- Export `MODEL_SOURCE_SLOTS_EXACTLY_ONCE_MESSAGE`, the message of that refusal, so consumers can name the cause instead of a generic error.
- Unchanged: a slot named twice or unknown is still refused; `AgentModelInitialSourceSchema` and `AgentModelBootstrapSourceSchema` stay strict for fresh producers.

## v1.49.0 — ricomposizione: cuore (1.48.0) + Models/News/Briefing/Native/Coach (bridge-compose-1210), solo additivo

- Merge commit di codex/bridge-compose-1210 in codex/cuore-bridge-148: nessun export di 1.48.0 rimosso.

## Unreleased — SIM01-b experiment pinned to a scenario corpus, additive

- `ExperimentSchema` gains optional `corpus` (`ScenarioCorpusSchema`); experiments without it stay valid.
- Add `assertScenarioMatchesCorpus(corpus, scenario)` returning `{ ok: true }` or `{ ok: false, reason: 'unknown_scenario' | 'version_mismatch' | 'hash_mismatch' }`; re-exported from `@x9-forge/contracts/organization`. Version and `dist` untouched.

## Unreleased — SIM01 versioned scenarios and corpora, additive

- Add `ScenarioVersionSchema`, `ScenarioVersionRefSchema`, `ScenarioCorpusSchema` and inferred types to `@x9-forge/contracts/organization`: strict payloads, required lowercase SHA-256, positive integer versions, nonempty items/references and unique item/scenario identities. Reuse the evidence hash schema with stricter casing and presence. Version and `dist` untouched.

## Unreleased — X01 turno per agente, `organizationRun` opzionale, additivo

- `InternalAgentTurnRequestSchema` gains optional `organizationRun` `{ context, attempt }` (reusing `OrganizationRunContextSchema` and `RunAttemptSchema`); `attempt.runId` must equal `context.runId`. Legacy bodies stay valid. Version and `dist` untouched.

## Unreleased — cap-lab browse, dettaglio, export (T2-b), additivo

- Add `capability/lab/browse`: page list (paged), page detail (page, claims, links, sources), export request/result with a server-chosen safe filename, and `LabBrowseErrorSchema` reusing `LabToolErrorSchema`.
- Re-export growth (T2-a) and browse symbols from `@x9-forge/contracts/capability/lab`. Additive only; version and `dist` untouched.

## Unreleased — cap-dev (P04), additivo

- Add the `@x9-forge/contracts/capability/dev` subpath re-exporting `signed-command` (v2 signed command, canonicalization) and `config-state` (binding, config, state).
- Additive only: no dev exports at the package root or in `./capability`. Version and `dist` untouched.

## Unreleased — C02 additivo, sub-path ./organization

- Re-export from `@x9-forge/contracts/organization` the C02 contracts: `decision-response`, `outcome-intake`, `publication-ref`, `experiment`, `company-memory`.
- Additive only: no existing shape changes and no organization exports at the package root. Version is decided by whoever releases; no `package.json` or `dist` change.

## Unreleased — organization (C01)

- Add the `@x9-forge/contracts/organization` subpath with canonical run context, attempt, outcome and operation contracts.
- Re-export the existing organization schemas and types without changing their shapes. This is additive, with no breaking changes or organization exports at the package root.
- Package version remains unchanged; compiled artifacts are left to the release process.

## v1.48.0 — models content version and durable per-slot progress

- Add portable synchronous catalog/configuration content fingerprints, the shared modelsVersion and withCatalogVersion stamping helper.
- Extend pending work with unchanged slots, typed sanitized reasons, state/install call counts and the final modelsVersion; retain previous payloads.
- Add optional apply/heirs/card fields to existing overview rows and strict stack/agent targets with one additive async apply/job endpoint pair.
- Accept per-heir saved configurations alongside legacy IDs and optional canonical command/runtime evidence on root/child jobs; new producers attest terminal completion explicitly.
- Add catalog-changed, catalog-version-mismatch, model-unavailable, qualification-failed and consumer-rejected management reasons.
- Consumers tracked in CUORE-MODELLI-LOTTI-1410: X9 delta/queue/consumer jobs and Forge vault/factory/web; no consumer deployment included.
## Unreleased — approved contract composition (version remains 1.47.0)

- Merge initial read-only models (524b5fad), c.3 News/Briefing (e45f815) and Native/Coach/browser (d98c0c05), retaining their history.
- Preserve all 18 existing internal actions and TTS_PROVIDER; add the five approved C actions: news_digest, news_digest_topic, calendar_today, calendar_week, lab_execute.
- Retain positive model CAS, scoped ordinary configuration and authenticated browser/native boundaries; rebuild ESM/CJS and portable Python from the combined source.
- Local candidate only: consumer pins, adoption and live verification remain separate.

## v1.47.0 — rilascio unico: Chiavi (1.44.3) + Modelli (27fa07d, 1.45.0) + Paperclip (main 1.45.0)

Composizione senza nuovi contratti: unisce le tre linee, nessun simbolo rimosso (verificato su ogni sottopercorso,
ESM, contro i tre pacchetti di origine).

- Linea Chiavi `codex/chiavi-100-bridge` 6dc32d6 (1.44.3): requisiti minimi delle credenziali, esecuzioni fisse dei chiamanti diretti (1.44.1),
  fonte della voce applicata e `agentVoiceSourceOf` (1.44.2/1.44.3), composizione dei contratti di modello con Chiavi.
- Linea Modelli `codex/c5-modelli-consumatori-bridge` 27fa07d (1.45.0): registro dei 34 consumatori, autorità del Master, osservazioni locali
  (agente, primario, backend telefono), InitialSource, fonti legacy con protocollo Live.
- `main` b22032d (1.45.0): sottopercorso `capability/paperclip`.
- Conflitti: `internal-agent-model-source-observation.ts` lato Modelli (superset); `endpoints/index.ts`, `capability/index.ts`: unione;
  `tests/cjs/smoke.cjs` lato Chiavi (superset). La composizione 1.46.0 di F (`codex/modelli-canonical-complete-f`, d6523a5) NON è inclusa.
- Versione 1.47.0 perché 1.45.0 indicava due contenuti diversi (Modelli e Paperclip) e 1.46.0 è il nome della composizione di F non unita.
- `.nvmrc` 24 (standard dello stack, R-32).

---


## 1.46.0 — composed local candidate

- Compose Paperclip, Keys, Models, scoped capability configuration, phone/Web channels and Knowledge without removing existing public entrypoints.
- Retain 35 registered model consumers, roleless InitialSource, positive legacy observation, primary local-source and phone backend observation contracts.
- Add Coach versioned program/session operations, native ElevenLabs channels, scoped RAG citations and loaded inventory authority; retain the qualified Web admission/readback semantics.
- Preserve public Web metadata/session and administrative invitation APIs together; carry Knowledge telephone entries into the canonical admission projection.
- This is a local integration candidate. Consumer pins, final verification and independent review precede publication; no deployed behavior is claimed.

## Unreleased — positive legacy model observation

- Add canonical observed consumer readback with actual settings and strictly null configVersion/requestId; preserve installed confirmation, receipt outcomes and unknown semantics.
- Retain canonical identity/scope/routing/reason/embedding validation. Producers must prove actual legacy authority and fail closed when modern authority is present; consumer wiring and live bootstrap remain separate qualification.
- Add source, compiled public-format and type probes without changing package version, exports or dependency pins.

## Unreleased — roleless InitialSource contract

- Add strict AgentModelInitialSourceSchema/type and Bootstrap-equivalent current helper through existing root/model-router exports; preserve all34 canonical consumer coverage, routing/settings and Master-only Bootstrap.
- Add optional nullable state.initialSource with exact identity, null saved/runtime/versions and mutually exclusive source authority. No new maximumage is added to Bootstrap-equivalent freshness.
- Qualify the additive contract separately from composition; packageversion stays1.45.0. Runtime firstMaster/bootstrap and first-save preservation remain consumer work, with no live claim.

---

## 1.45.0 — 2026-10-09

- Add the canonical `@x9-forge/contracts/capability/paperclip` subpath and capability barrel exports for material events, configurable role routing, resolved routes, durable handoff envelopes/receipts and manual decision audit records.
- Add four native Paperclip tool identifiers with strict input/output schemas and server-owned tenant/owner/agent-to-native company/agent/role bindings.
- Add communication, reply, host-only manual confirmation and decision-view schemas. Manual attestation records provenance and never claims to update Paperclip or exposes an LLM confirmation tool.
- Preserve every historic public subpath/symbol while allowing additive exports in the compatibility guard; regenerate ESM, CJS and portable declarations. No existing protocol changed.
- This package supplies contracts only. Per-agent provisioning, credentials, service deployment and real material/email workflow remain consumer/operator integration work.

## 1.46.0-capabilities-c.2 — local development

- Preserve full tenant/owner scope in context and spend requests, with explicit legacy compatibility; share trusted identity with native per-agent turns.
- Add fixed News/Calendar calls and SQL-lease-only Lab execution; keep internal actions outside model-visible manifests and results free of credentials.
- Register the actual Lab digest model reader (C35); no inactive read-model slot. Consumers: X9 capability-sdk/Core/News/Briefing/Ricerca/Lab/QA, Forge existing model and capability panels. Local package only.

## 1.46.0-capabilities-c.0 — local development

- Add scoped ordinary configuration, Master provenance, per-key effective observations and remote lifecycle on existing per-agent routes. Preserve B1/legacy formats.
- Add canonical workspace digests and retained single-capability authority lookup, plus typed structured settings and generated Python admission contracts.
- Consumers tracked in Capabilities phase35: X9 capability-sdk/agent-core/services and Forge factory/web. Local package only; no release or live claim.

All notable changes to the bridge package. This project adheres to [Semantic Versioning](https://semver.org/) at the milestone level (v1.0, v1.1, etc.); within a milestone, distribution is via SHA-pinned `git+https#<sha>` (no per-feature versioning).

## How releases work in this repo

- **No npm registry.** Consumers (agent-x9, forge-v2) depend via `git+https://github.com/App-Templates/x9-forge-contract.git#<sha>` with committed ESM/CJS `dist/`; `prepare` installs hooks only.
- **Atomic SHA bump.** Breaking contract changes require atomic SHA bump in BOTH consumer repos in the same step (RLSE-02). Never one consumer at a time.
- **Deprecation workflow** (RLSE-03): When deprecating a public symbol, add `/** @deprecated <reason — removal in v<X.Y>> */` JSDoc with explicit removal milestone. Minimum 1 milestone-cycle grace period before removal.

---

## v1.44.3 — la proiezione è una funzione del contratto

### Added (additive)

- `./http/endpoints`: `agentVoiceSourceOf(context)` — la proiezione whitelist di un contesto caricato verso `AgentVoiceSource`, una sola volta
  (agent-core la usa per rispondere, i consumatori per le fixture). `null` = nessuna fonte: mai una ricostruzione.

---

## v1.44.2 — fonte della voce applicata di un agente caricato (cap-voice)

### Added (additive)

- `./http/endpoints`: **`internalAgentVoiceSourceContract`** (`GET /internal/agents/:agentId/voice-source`, `:agentId` = id runtime) e `AgentVoiceSourceSchema`:
  proiezione non segreta del contesto CARICATO in agent-core (scope, identità, nome, `voiceConfiguration` o null, attestazione del workspace).
  Stessa risposta per un agente da file e per l'agente primario da env: le capacità non leggono più il disco di altri servizi.

Solo aggiunte.

---

## v1.44.1 — esecuzioni fisse per i chiamanti diretti (cap-voice, cap-security)

### Added (additive)

- `./http/endpoints`: dieci esecuzioni fisse in `INTERNAL_AGENT_EXECUTIONS` per i servizi che chiamano una capacità
  senza passare dal turno di un agente: `voice_calendar_{week,create,update,delete}`, `voice_email_send`,
  `voice_contacts_search`, `voice_schedule_create`, `security_{light_on_group,light_on,come_home}`. Il chiamante dice COSA fare per l'agente
  indirizzato; chiavi, identificativi e identità sono sempre quelli dell'agente caricato in agent-core, mai del chiamante.
  Input stretti, uguali agli schemi nativi dei tool. Inventario delle esecuzioni: da 8 a 18.

Solo aggiunte: nessun simbolo esistente cambia o viene rimosso.

---

## v1.45.0 — approved Models contracts and independent public entrypoint loading

### Added (additive)

- Canonical registry of 34 model consumers, single/failover policy, embedding dimensions, labels, scope and execution boundaries.
- Explicit Models source observations and generation, Master/agent configuration, compare-and-swap versions, installation transport, rebuild and readback metadata.
- These contracts were already implemented and independently reviewed before this release; version 1.45.0 makes their distribution explicit. No handler or live runtime behavior is introduced here.

### Fixed

- Public entrypoints initialize independently in ESM and CommonJS after the approved deferred canonical credential-key schema correction. The native CJS smoke includes all 18 entrypoints in fresh processes.
- Release documentation describes committed distribution files and the actual hooks-only `prepare` step. Consumers must install an approved immutable Git SHA.

---

## v1.44.0 — voce, telefono, canale web e identità esplicita del contesto agente

### Added (additive)

- `./http`: additive Web administrative snapshot, policy preview/apply and read-only catalog descriptors, bound to current Forge owner/SA session evidence.
- `./agent` / `./http`: bounded plain-text channel transcript DTO and opaque-entry authenticated reads, with explicit unavailable/retention states and full binding correlation. No provider URL or raw envelope is exposed.

- `./capability` / `./http/endpoints`: **descrittore della voce** per capacità vocali (BRIDGE-VOICE-DESCRIPTOR). Autore Codex E, verifica Codex F (APPROVE).
- `./http/endpoints`: **contratto del canale telefono** (CANALI-C2-BRIDGE B1+B2+B4). Autore Codex F, verifica Codex D (APPROVE).
- `./agent`: **identità esplicita del contesto agente** con ruolo master/erede e provenienza dal Master, funzione unica di riconoscimento (BRIDGE-IDENTITA-AGENTE, R-33). Autore Codex D, verifica Codex A (APPROVE).
- `./http/endpoints`: **contratti del canale web** — link, sessione, catalogo conversazionale e callback di ammissione Forge fail-closed (CANALI-C3-BRIDGE B1+B2+B3). Autore Codex A, verifica Codex F (APPROVE, suite completa 3562/3562).

Solo aggiunte: nessun simbolo esistente cambia o viene rimosso.

---

## v1.43.0 — registro canonico dei consumer di modello (Modelli M3)

### Added (additive)

- `./model-router`: **registro dei consumer** (`model-consumers`) — tupla canonica slot/capability/function con requirements (`agent_chat` · `agent-core` · `reasoning`: tools=true, stream=false, structuredOutput=false), schema Zod e tipi, lookup esatto. Nessun default, provider, prezzo o attestazione applicata.
- `./model-router`: costante esportata per lo slot server-owned `agent_chat` in `agent-model-configuration` (prima citato solo in commento). Gli slot di memoria e audio arriveranno con M4.

Autore Codex D, verifica indipendente Codex B (APPROVE).

---

## v1.42.0 — accessi e richieste delle porte Telegram/email (Canali C1)

### Added (additive)

- `./agent`: **policy di accesso delle porte** (`agent-channel-access`) — Telegram `approved-chats`/`anyone` con chat ammesse esplicite (lista vuota = chiusa), email `address-book`/`anyone` con fonte Rubrica (complete/partial/unavailable, scope, versione, data; fonte assente o scaduta non ammette). Campo additivo `configuration.access` in `agent-channel-configuration`: i context esistenti senza `access` restano validi.
- `./agent`: **richieste e ricevute** (`agent-channel-access-requests`) — snapshot delle richieste `/start` (solo metadati, id/chat/update unici, CAS della coda), comando «Salva e applica» per porta con ricevuta applied/pending/failed, replay esplicito e correlazione completa; nessun messaggio ordinario né credenziale nei DTO.
- `./http`: endpoint interni X9 `internal-agent-channel-access` (GET snapshot, POST apply, autenticazione di servizio esistente) e facciata Forge `forge-agent-channel-access` (anteprima distinta dall'applicazione, «Lascia com'era» senza comandi).

Solo contratti: nessun handler, consumer invariati finché non adottano il nuovo SHA. Autore Codex B, verifica indipendente Codex D (APPROVE).

---

## v1.41.0 — approvazioni firmate con passkey e punti di ripristino dei server (fase 59)

### Added (additive)

- `./capability`: **approvazioni firmate** (`approvals`) — permesso canonico v1 firmato Ed25519 con prefisso di dominio (`canonicalApprovalPermit`), tipo legato al cliente, scope tenant/owner/agente, hash del testo, vincoli piatti 1..16, finestra 60..900 s, nonce 128 bit; controllo puro lato cliente `checkApprovalPermit`; contratti `createApprovalRequestContract`, `deliverApprovalPermitContract`, `pendingApprovalsContract`, `approvalKeysContract`. Una capacità condivisa per ogni azione delicata (snapshot, cap-dev, rilasci, merge, pagamenti); vettore di firma fisso nei test.
- `./capability`: **cap-backup** (`backup`) — risorse per provider (hostinger), stato (snapshot unico con origine, azione, backup automatici, ultimo rilascio verificato, salute), tipi `backup.*` e vincoli, strumenti `backup_status/create/restore`, API dei dispositivi (`backupDeviceStatusContract`, `backupDeviceRequestContract`, `backupDeviceVerifiedContract`).
- `./auth`: **firma dei dispositivi** (`device-signature`) — messaggio canonico, quattro intestazioni `X-X9-Device-*`, finestra ±60 s; `EndpointAuthType` aggiunge `device_signature`.
- `./agent`: `HOSTINGER_API_TOKEN` tra le credenziali note (servizio commerciale `hostinger`); `./vault`: `APPROVALS_SIGNING_KEY` tra le chiavi platform-internal (mai proiettata negli agenti).
- Nessun sottopercorso nuovo, nessun simbolo esistente cambiato; consumer 1.40 restano validi.

---

## v1.40.0 — modelli governati per funzione e servizio di ogni credenziale (MODELLI M1 + BRIDGE-SERVIZI)

### Added (additive)

- `./model-router`: catalogo dei modelli per funzione attestato (`model-catalog`), configurazione dei modelli per agente con pin completo e fonte (segue il Master / personalizzato) (`agent-model-configuration`), impostazioni modello delle capacità (`capability-model-settings`), anteprima e applicazione in blocco con versione e prova di applicazione (`models-batch`). Base contrattuale della pagina «Modelli» di Forge (unico posto di modifica dei modelli).
- `./http/endpoints`: contratti `forge-models`, `internal-agent-model-catalog`, `internal-models-batch`.
- `./agent`: `agent-credential-services` — per ogni credenziale dichiarata il tipo (credenziale, impostazione, identificatore), il servizio commerciale per le chiavi univoche, i fornitori candidati per i selettori multi-fornitore, i token interni X9/Forge marcati come interni, etichetta italiana. Nessun valore.
- Nessun simbolo esistente cambiato; consumer 1.39 restano validi.

---

## v1.39.0 — attestazione del workspace applicato e metadati dell'inventario (BRIDGE-139)

### Added (additive)

- `./agent`: attestazione opzionale `workspace` (versione applicata, sha256, ora di caricamento, configVersion) nel risultato di gestione, nello stato di gestione e nella riga di inventario agenti; `workspace: null` = attestazione assente, mai ricostruita. Un comando con `workspace: null` non può dichiarare outcome `ok`; `configVersion` deve coincidere con `versions.applied` quando entrambi presenti. Helper `attestedWorkspaceVersionOf(row)`.
- Inventario agenti (`internal-agents-list`): metadati osservati opzionali `capabilities: [{ name, enabled }] | null` e, nello stato Telegram, `botUsername` (solo username Telegram valido, 5–32 caratteri, termina in `bot`, niente URL/token) e `allowFromCount` (intero ≥ 0, mai gli id).
- Righe e risultati 1.38 senza i nuovi campi restano validi.

---

## v1.38.0 — id vault dell'agente nell'identità runtime (BRIDGE-138)

### Added (additive)

- `./agent`: campo opzionale `identity.vaultAgentId` (intero positivo, id della riga agente in Forge) in `AgentRuntimeIdentitySchema`; helper `vaultAgentIdOf(ctx)` → id oppure `null`, letto solo da `identity` (mai derivato da slug, id runtime o `agentId`).
- Forge lo scrive insieme a `identity` nello stesso salvataggio della voce; X9 lo usa solo per `VaultClient.resolve`, senza ripieghi su altri agenti. Contesti 1.37 senza il campo restano validi.

---

## v1.37.0 — identità canonica nel contesto e voce legata all'id di gestione (BRIDGE-136a)

Correzione di 1.34: `voiceConfiguration.agentId` è l'id di GESTIONE (Forge), non quello runtime.

### Added (additive)

- `./agent`: campo opzionale `identity` (`AgentRuntimeIdentitySchema`, coppia gestione/runtime) nel contesto con canali e nella variante Write; helper `managementAgentIdOf(ctx)` → id di gestione oppure `null`.

### Changed

- Validazione dello scope del contesto: con `identity`, `identity.runtimeAgentId` deve coincidere con l'agente del contesto; l'id di gestione viene da `identity` oppure dai canali (tutti concordi); `voiceConfiguration.agentId` deve coincidere con l'id di gestione. Senza alcuna fonte di gestione resta valido il caso 1.34 (voce = agente del contesto).
- Ora rifiutati: canali con id di gestione discordanti; `identity` discordante dai canali; voce con id di gestione senza `identity` né canali. **Forge deve scrivere `identity` insieme alla voce.**

Verificato da revisore indipendente V15: 2244/2244, 8/8 mutazioni uccise, R-14 PASS.

---

## v1.36.0 — descrittore D-A9 del workspace agente (R7-1)

Additivo: un context.json 1.35 senza il campo resta valido.

### Added (additive, backward-compatible)

- `./agent`: `AGENT_WORKSPACE_HUMAN_FILES` (IDENTITY.md, SOUL.md, POLICIES.md, USER.md) e `AGENT_WORKSPACE_TOOLS_FILE` (TOOLS.md, generato e mai modificabile) come costanti canoniche; `AgentWorkspaceDescriptorSchema` con origine per file (Master/modello oppure proprio dell'agente, `kind: 'agent'`), versione salvata/applicata (schemi di versione esistenti), hash, data, cronologia e richiesta di ritorno a una versione precedente con versione attesa; skill progressive (descrizione sempre, procedura su richiesta, solo capability abilitate, limiti di dimensione). Permessi solo da `AgentScopePolicy` (nessun secondo schema).
- `./agent`: campo opzionale `workspace` nel contesto con canali e helper `appliedWorkspaceVersion(ctx)` → numero oppure `null`.

### Note

- La richiesta di ritorno da sola non verifica la versione di destinazione: la verifica avviene con lo schema di validazione che la accompagna (usare quello).

Verificato da revisore indipendente V13: 2152/2152, 11/11 mutazioni uccise, R-14 PASS.

---

## v1.35.0 — catalogo voce di cap-voice (BRIDGE-135)

Additivo: export 1.34 invariati.

### Added (additive, backward-compatible)

- `./http`: `internalVoiceCatalogContract` — `GET /internal/voice/catalog` (header interno del bridge, nessun corpo), risposta `VoiceProviderCatalogSchema` con versione del catalogo. cap-voice dichiara i provider, protocolli, trasporti, modelli e voci realmente supportati; Forge li legge per i menu, mai un catalogo inventato.

Verificato da revisore indipendente V11: 2046/2046, 4/4 mutazioni uccise, R-14 PASS.

---

## v1.34.0 — voce e scopo applicati nel contesto agente, identità del chiamante (BRIDGE-134)

Additivo: un context.json 1.33 senza i campi nuovi resta valido.

### Added (additive, backward-compatible)

- `./agent`: campo opzionale `voiceConfiguration` (`AgentVoiceConfigSchema`, salvata + applicata + versioni) nel contesto con canali e nella variante Write; `agentId` deve coincidere con lo scope del contesto. Helper `appliedAgentVoiceSettings(ctx)`: impostazioni applicate oppure `null` (motivo distinguibile `voice_not_applied`), mai un default inventato.
- `./agent`: campo opzionale `scopePolicy` (`AgentScopePolicySchema`, policy applicata con la sua versione) e helper `appliedAgentScopePolicy(ctx)` → policy oppure `null`.
- `./http` voice-register: campo opzionale `caller` (`OutboundCallerIdentitySchema`), identità autorevole del chiamante sul numero condiviso; i campi legacy restano validi, una discordanza è rifiutata.

### Note

- `VoiceRegisterRequestSchema` ora ha una refinement: in Zod 4 `.pick()/.omit()/.partial()` su questo schema lanciano a runtime. Nessun consumer attuale lo fa; per derivare forme usare lo schema base.

Verificato da revisore indipendente V8: 2028/2028, 9/9 mutazioni uccise, R-14 PASS.

---

## v1.33.0 — versione applicata della configurazione nel contesto agente (BRIDGE-133)

Additivo: export e payload 1.32 invariati; un context.json 1.32 senza il campo resta valido.

### Added (additive, backward-compatible)

- `./agent`: campo opzionale `configVersion` (`AgentConfigVersionSchema`, intero positivo) in `AgentContextFile`, `AgentContextWithChannels` e nelle varianti Write: la versione dell'intera configurazione salvata che il runtime ha davvero applicato.
- `./agent`: `appliedAgentConfigVersion(ctx)` restituisce quella versione oppure `null` se il contesto non la porta (mai un valore inventato).

Verificato da revisori indipendenti: Codex A (2008/2008, build/CJS/qualità) + verificatore V3 (4/4 mutazioni uccise, R-14 PASS).

---

## v1.32.0 — canali per agente: pausa, stato applicato e attestazione (R2-2)

Contratti per la creazione di un agente con canali propri (FABBRICA R2). Additivo: export e payload 1.31 invariati.

### Added (additive, backward-compatible)

- `./agent`: configurazione canali Telegram/email per agente con stato desiderato (attivo/in pausa) e applicato, versione, risorsa propria (mai copia del Master), errori sanitizzati; contesto con channelConfigurations opzionale.
- Checkpoint di creazione e replay del job con chiave di idempotenza: stessa chiave = stesso agente/job/risorse; «completato» solo con almeno un canale testuale caricato e pronto (Telegram, email non in pausa, oppure web attestato); la voce da sola non basta.
- `./http`: `POST /internal/channels/attest` (header interno del bridge) con cui i servizi canale attestano per agente, con scope completo e osservazione fresca, lo stato caricato/in pausa/errore letto dalla configurazione applicata.

Verificato da revisore indipendente (Codex B): REVISE (completato con sola voce) → corretto → APPROVE. 1957/1957 test.

---

## v1.31.0 — gestione, chiavi, voce, ambito e capability di Meditation (BRIDGE-131)

Contratti per il piano FABBRICA (R1b, R3, R4, R5, R6). Tutto additivo: export e payload della 1.30 invariati.

### Added (additive, backward-compatible)

- `./agent`, `./http` (R1b): comandi logici start/stop/restart/reload/apply-config con chiave di richiesta (stessa chiave e comando = replay, comando diverso = conflitto), versioni salvata/applicata/fallita, esito per bersaglio ok/errore/non gestibile con motivo; `POST /internal/agents/:agentId/commands`, `GET /internal/agents/:agentId/management`. L'agentId dei risultati deve coincidere con l'identità dichiarata.
- `./vault` (R3): chiave collegata al Master Chief oppure scollegata con valore proprio owner/agente, versione salvata/applicata; ruota/ricollega/scollega con esito per agente. Mai valori in transito; chiavi interne di piattaforma rifiutate.
- `./capability`, `./http` (R3): contesto di chiamata con tenant/owner/agente obbligatori, solo le credenziali richieste dalla capability, errori distinti; `POST /resolve/capability-context`.
- `./voice` (R4): solo testo oppure voce (provider, protocollo, trasporto, id voce, modello) con versione; identità del chiamante sul numero Telnyx condiviso; agente solo testo non chiama.
- `./agent` (R5): consentito/chiedi/vietato per capability e strumento, ricerca web predefinita, «limitato allo scopo», approvazioni umane con scadenza, registro azioni senza payload né segreti.
- `./capability` (R6): cap-agent-elevenlabs (creazione unica all'Applica, adozione solo con mapping esplicito, binding confrontato su scope completo tenant/owner/agente) e cap-coach (programmi per agente; profilo, sessioni, progressi e budget per persona, isolati per tenant/owner/agente/persona, scrittura idempotente).

Verificato da revisore indipendente (Codex C): REVISE sul binding ElevenLabs, corretto, poi APPROVE. 1830/1830 test, 148+10 mutazioni uccise, CJS/ESM e dts portabili.

---

## v1.30.0 — stato canonico degli agenti (BRIDGE-130)

Contratto unico con cui X9 dichiara e Forge legge identità, stato e canali di ogni agente (AGENTI-01).

### Added (additive, backward-compatible)

- `@x9-forge/contracts/agent`: identità esplicita gestione↔runtime (es. Forge `x9-staging` ↔ X9 `x9`), senza alias impliciti; un identificativo non può nominare due agenti.
- Stato canonico dell'agente: attivo / senza canale / spento / errore / sconosciuto, derivato dai canali osservati da X9. Attivo richiede almeno un canale caricato dimostrato; senza prova lo stato è sconosciuto, mai inventato.
- Canali per agente con stato proprio, compreso «in pausa» (dichiarato, non errore) e readiness distinta dal caricamento.
- Lista `/internal/agents`: metadati additivi di disponibilità e completezza della fonte. I vecchi payload restano validi e producono stato sconosciuto, mai un falso spento o attivo.

Verificato da un revisore indipendente (Codex D): 1549/1549 test, campioni di mutazione rossi, CJS/ESM e dts portabili.

---

## v1.29.0 — proposta in review — B1 parametri e B7 uscite/feedback/andamento

Aggiunte per agente e capability (D54-11, piano X9 54-05), corrette dopo la revisione del contratto.
Il rilascio e gli aggiornamenti dei consumer sono gestiti dalla coordinatrice dopo la verifica del contratto.

### Changed — sole exception: unconsumed lab contracts

- The lab portion of 1.28 has no consumers. Its configuration and ingest payload changes are intentionally non-additive.
  LabAgentConfigSchema now requires models (digest, optional read) and budget (dailyUsd, perIngestMaxUsd, timezone).
  No model or budget default is selected; the per-ingest ceiling cannot exceed the daily budget.
- The same unconsumed lab exception corrects synchronous ingest: lab_ingest returns only
  {ingestId: UUID, state: 'queued'}. New lab_ingest_status reuses research states and requires all three final
  counters when completed; other states carry no completion counters. LabToolErrorSchema includes
  invalid_request / not_configured / not_found / not_ready. No consumer is updated by this branch.

### Added (additive, backward-compatible)

- @x9-forge/contracts/capability/parameters: parametri number/integer/string/boolean/enum/string_list,
  etichetta, spiegazione, gruppo, unità, vincoli e default facoltativo della piattaforma.
  String e liste supportano pattern; liste anche opzioni e minItems/maxItems. optional ed editableBy
  obbligatori dichiarano assenza del valore e ruoli superadmin/owner. Regole decided/proposed con riferimento,
  modifica immediate/next_apply e consumo esplicito; valori platform_default/agent_override/needs_choice.
  key è il percorso puntato nella config per agente, version è la sua versione positiva.
  Nessun default di prodotto o credenziale introdotto; le chiavi restano in env-schema/vault.
- @x9-forge/contracts/capability/presentation: uscite con JSON di dominio fino a 64 KiB UTF-8;
  CapabilityOutputFieldTypeSchema esportato, min/max finiti facoltativi soltanto per number.
  Feedback discriminato rating (intero 1–10) / approval (approved/changes_requested), fonte
  project_view/domain_app, reviewerId e reviewerName; allegati HTTP(S) facoltativi fino a 10,
  dichiarazione attachments obbligatoria. Andamento giornaliero con metriche/unità, date reali crescenti
  e valori finiti; collezioni strict per un solo agente/capability, identificativi unici e limiti pubblici.
- Campi facoltativi parameters e presentation in manifest/registry: i payload precedenti restano identici.
  Entrambe le nuove famiglie nel sottopercorso capability esistente e nei due nuovi sottopercorsi ESM/CJS.
  Nessun export precedente rimosso o rinominato.
- CapabilityUsdSchema e CapabilityModelIdSchema esportano i validatori esistenti di ricerca invariati.
  SpendingCapabilitySchema accetta ricerca e lab; labAgentSpendContract riusa path, GET, schemi e secret auth
  della spesa di ricerca. AGENT_SPEND_MAX_DAYS resta lo stesso export pubblico e vale 400.
- Nessuna nuova rotta B1/B7 stabilita dalle fonti: schemi e dichiarazioni come previsto dalle fonti.
  Il salvataggio della config passa dal PUT capAgentConfigPath già esistente; i consumer realizzano letture
  e aggiornamenti. Validazione del contenuto specifico e montaggio nelle app restano ai consumer.
- Consumer previsti: Forge fase 33; capability di agent-x9; vista di progetto esterna/app di dominio.
  Nessun consumer modificato e nessuna verifica dal vivo in questo ramo.
- Test di revisione: 275 nuovi, oltre ai 194 della prima consegna; 469/469 casi distinti visti rossi.
  Suite finale 1436/1436 (93/93 file), CJS 36/36; tipi, lint, build/dts e check:pack con codice 0.
  Dist 1024/1024 identica byte per byte alla build pulita; 256/256 dichiarazioni .d.ts portabili.
  check:pack mantiene il warning preesistente sulle types CJS del root e le esclusioni del suo profilo.
- Giro finale unico: 299/299 mutazioni rilevate con asserzioni, baseline/ripristino 469/469,
  sorgenti/dist originali invariati. scripts/mutate-54-05-review.py e riepilogo FINAL-MUTATIONS.md;
  le 133 mutazioni in due lotti della prima consegna sono soltanto storico.
- Script test limitato a due worker e timeout 60 s in commit dedicato; report compatti con nomi,
  hash e riferimenti alle prove; riepilogo mutazioni unico in FINAL-MUTATIONS.md. Dettagli: .planning/phases/54-05-bridge-129/BRIDGE-129-SUMMARY.md.

## v1.28.0 — proposta in review — Fase 54: cap-ricerca e cap-lab, per agente

Decisione di Stefano (05/10): Forge gestisce gli agenti; configurazione e spesa delle capability sono **per agente e
per capability**; la LLM Wiki (cap-lab) si collega a ogni agente, ognuno coi suoi dati; il budget non si supera mai.
Nessun «progetto» dentro le capability.

### Added (additive, backward-compatible)
- Sottopercorso `@x9-forge/contracts/capability/ricerca`: `ResearchAgentConfigSchema` (configurazione di un agente:
  obiettivo, budget giornaliero e per ricerca col fuso orario, modelli, parametri di ricerca, regola delle fonti),
  `ResearchRequestSchema` / `ResearchResultSchema` (ricerca a cascata con `parentResearchId`, scoperte con origine
  `web` e almeno una fonte, nuove domande, costo vero), `AgentSpendDaySchema` (per agente, capability e giorno, con
  gli stop per il budget del giorno, `budgetReachedAt` e `overrunAt`), `RICERCA_TOOLS`, `RicercaToolErrorSchema` (motivo nel testo di un errore `TOOL_EXEC_FAILED`
  o `TOOL_CALL_INVALID` del bridge). Nessun default per budget, modelli e regola delle fonti.
- Sottopercorso `@x9-forge/contracts/capability/lab`: `LabAgentConfigSchema` (dominio, convenzioni, tipi di pagina e
  di collegamento scelti per agente), la LLM Wiki (`WikiSourceSchema` con impronta del testo, `WikiPageSchema`
  versionata, `WikiClaimSchema` con almeno una fonte, `WikiLinkSchema`), `CompetenceNodeViewSchema` (scala 0..4 del
  motore del contest), `CompetenceGapSchema`, `LAB_TOOLS`. Il testo della wiki è dato, mai istruzione.
- `@x9-forge/contracts/http`: rotte per agente di ogni capability `PUT/GET /internal/capability/agents/:agentId/config`
  (versione che solo cresce: 409 `stale_version`; rifiuti dichiarati in `CapabilityAgentRouteErrorSchema`, compreso
  `budget_below_minimum`),
  `GET …/spend?from&to` (cap-ricerca, finestra ≤ 400 giorni, date reali, `queuedNow`), `GET …/growth` (cap-lab);
  `capAgentConfigPath`, `capAgentSpendPath`, `capAgentGrowthPath` validano l'id.
- Consumer previsti: agent-x9 `services/cap-ricerca`, `services/cap-lab`, `services/cap-food`; forge-v2 gestione degli
  agenti (PIANO-SVILUPPI §B2/B3); enterprise-adoption ea-core dopo la migrazione.
- Verifiche: `tests/capability/ricerca/`, `tests/capability/lab/`, `tests/http/internal-capability-agent.test.ts`,
  smoke ESM e CJS; mutazioni `scripts/mutate-54-ricerca-lab.py` (20/20 rosse).
- Contiene la v1.27.1 (chiavi interne di piattaforma fuori dai contesti degli agenti, fix SEC del 01/10), unita da
  `origin/main` prima del rilascio.

## v1.27.1 — 2026-10-05 — Chiavi interne di piattaforma fuori dai contesti degli agenti (sicurezza)

### Added (additive, backward-compatible)
- `@x9-forge/contracts/vault`: `PLATFORM_INTERNAL_CREDENTIAL_KEYS` (`TELEGRAM_SESSION_STRING`),
  `isPlatformInternalCredentialKey`, `stripPlatformInternalCredentials`, tipo `PlatformInternalCredentialKey`.
  Chiavi di piattaforma usate solo da un servizio di piattaforma (factory-svc di Forge → @BotFather) che non devono
  mai finire nelle `credentials` di un agente (context.json, `/resolve` del vault, `.env` dell'agente).
- `@x9-forge/contracts/agent`: `AgentContextFileWriteSchema` + `parseAgentContextFileForWrite`, controllo lato
  scrittura che rifiuta quelle chiavi. `AgentContextFileSchema` / `parseAgentContextFile` (lettura) invariati.
- Perché: SEC 2026-10-01 — Forge copiava ogni riga di piattaforma del vault nel `context.json` di ogni agente, quindi
  la sessione del userbot BotFather arrivava a tutti gli agenti di tutti gli owner. Nessun codice X9 la legge dal
  contesto di un agente.
- Numero di versione: aggiunta additiva, ma rilasciata come **patch** 1.27.1 per decisione di Stefano (05/10), così
  la 1.28.0 resta ai contratti per agente di cap-ricerca/cap-lab (`feat/54-ricerca-lab-contracts`), che ripartono
  da questa base senza cambiare numero.
- Origine: `0f595b4` sul branch locale `fix/sec-tg-session-fanout` (era numerato 1.25.0, numero poi usato da MVP-07),
  portato invariato sopra la 1.27.0.
- Consumer: forge-v2 factory-svc (`deploy.machine` filtra e valida con lo schema di scrittura) e vault-svc
  (cascata e `/resolve` escludono le chiavi). agent-x9: nessuna modifica richiesta.
- Verifiche: `tests/vault/platform-internal-credentials.test.ts`, `tests/agent/agent-context-file.test.ts`.

## v1.27.0 — proposta in review — Enterprise Adoption: onboarding condotto dalla voce

### Added (additive, backward-compatible)
- `AgentTurnSchema`: `prepare` (prima di creare la sessione vocale, senza parole né effetti) ed `exchange`
  (ciò che la voce ha detto, poi le parole della persona, e `ended` a fine sessione).
- `CapabilityTurnLeadResponseSchema`: `lead` (istruzioni dell'intera sessione: la voce conduce da sola)
  e `noted` (ricevuto, con una `note` facoltativa: contesto per la voce, mai parole da dire).
- `InternalAgentTurnResponseSchema`: `lead` e `note` facoltativi, con `reply` vuoto. Rotta personale invariata.
- Costanti `CAPABILITY_LEAD_MAX_INSTRUCTIONS_CHARS` (16000) e `CAPABILITY_NOTE_MAX_CHARS` (1200);
  schemi `CapabilityLeadInstructionsSchema` e `CapabilityNoteSchema`.
- Consumer: agent-x9 agent-core (`core/capability-turn-lead.ts`, `routes/internal-agent-turn.ts`),
  cap-voice-live (`web/web-session-manager.ts`, `web/x9-ask.ts`), enterprise-adoption ea-core (`http/turn-route.ts`).
- Ordine di rilascio: bridge, poi ea-core e X9 insieme. Un consumer vecchio rifiuta i turni nuovi (400), mai in silenzio.
- Verifiche: `tests/capability/voice-led-onboarding.test.ts`; mutazioni `scripts/mutate-voice-led.py`.

## v1.26.0 — 2026-10-02 — X9 Meditazione B1: authenticated end-user identity

### Added (additive, backward-compatible)
- Optional `userId` on `InternalAgentTurnRequestSchema`, `ToolCallRequestSchema` and
  `CapabilityContextRequestSchema`, reusing the memory extraction contract's exact
  1–256 character string shape. Absent means the same serialized payload as before.
- `InternalTurnRequestSchema` (the personal agent) remains unchanged. The per-agent
  request is now an extension rather than an alias; its response remains identical.
- Follow-up consumers: agent-x9 B2 (`internal-agent-turn`, `auto-recall`,
  `memory-extractor`, `capability-context`, `tool-router`), cap-meditation B3/B4.
  Tools use the existing tool-call envelope and context uses `capContextContract`.
- Export the existing generic capability route as `capToolCallContract` /
  `capToolCallPath`, with validated parameters. B3 imports this URL rather than
  duplicating it. No new route or service-specific wire schema is introduced.
- Version 1.25.0 is reserved for the separate Enterprise Adoption step 5.
  Claude owns review, merge and release tags; this branch adds no tag.
## v1.25.0 — proposta in review — MVP-07: guida dei turni facoltativa

- Turno strutturato `opening | answer | incomplete | delivery` sulla sola rotta per agente;
  risposta con `moveId` facoltativo per correlare ciò che la voce ha pronunciato.
- Dichiarazione `turnLead: {}` facoltativa nel manifest e nel registry; contratto autenticato
  `capTurnLeadContract` (`POST /turn`) con `speak` oppure `release`.
- Payload legacy compatibili, contratto della rotta personale invariato, nessuna attivazione predefinita.
- Segue solo §0 del piano MVP-07 tappa 5: esclusi budget voce, negoziazione versione, organizzazione
  nel deploy ed eventi 004. Nessun runtime implementato in questo pacchetto.
- Consumer da aggiornare in PR successive: X9 cap-voice-live (`web/x9-ask.ts`, sessione web),
  agent-core (`routes/internal-agent-turn.ts`, registry), Forge factory (`deploy.machine.ts`), ea-core.
- Verifiche: Node 20, 903 test, 28 controlli CJS, 28 mutazioni nuove; denominatori in README/STATO.

---

## v1.24.0 — 2026-10-01 — Capability context: what a capability knows about the agent, at every turn

### Added (additive — MINOR, backward-compatible)
- `@x9-forge/contracts/capability`: `CapabilityContextDeclarationSchema`, `CapabilityContextRequestSchema`,
  `CapabilityContextResponseSchema`, `CAPABILITY_CONTEXT_MAX_CHARS` (6000), `CAPABILITY_CONTEXT_TIMEOUT_MS` (1500).
  Optional `context: { maxChars }` on `CapabilityManifestSchema` and `CapabilityRegistryEntrySchema`.
- `@x9-forge/contracts/http`: `capContextContract` — `POST /context`, secret auth (`INTERNAL_SECRET_HEADER`).
- Why: an Enterprise Adoption onboarding agent asked its person again, at every new call, what she had already told
  it (2026-10-01): the history is per session and nothing put the capability's knowledge in front of the model.
  The runtime (X9 agent-core) now asks each capability that declares `context` before the model answers.
- Consumers: X9 agent-core (reads `context` from the agent registry, calls `/context`), Forge factory
  `deploy.machine` (copies `context` from the manifest into the registry, like `tools`), enterprise-adoption ea-core
  (declares and serves it). Manifests and registries without `context` are unchanged.

---

## v1.23.0 — 2026-09-30 — Enterprise Adoption MVP: deploy without a Telegram bot

### Added (additive — MINOR, backward-compatible)
- `@x9-forge/contracts/http`: `InternalFactoryDeployRequestSchema.telegram_enabled` (optional boolean).
  `false` ⇒ factory-svc skips the BotFather step (`create-telegram-bot`): no conversation with BotFather, no bot,
  no `TELEGRAM_*` in `context.json`. Absent or `true` ⇒ identical to v1.22 (bot auto-created when no token is
  passed), so Parallel workspace-seeder-svc and every other existing caller are unaffected.
  Consumer: forge-v2 `services/factory` (S2S route `/api/internal/factory/deploy` → `deploy.machine.ts`).

---

## v1.22.0 — 2026-09-29 — Enterprise Adoption M0: per-agent turn

### Added (additive — MINOR, backward-compatible)
- `@x9-forge/contracts/http`: `internalAgentTurnContract` — `POST /internal/agents/:agentId/turn`, secret auth
  (`INTERNAL_SECRET_HEADER`). Body/success response = the existing `InternalTurnRequestSchema` /
  `InternalTurnResponseSchema`; `InternalAgentTurnParamsSchema` uses the reload/stop agentId regex.
  Error codes `INTERNAL_AGENT_TURN_UNKNOWN_AGENT` (`unknown_agent`, 404) and
  `INTERNAL_AGENT_TURN_PRIMARY_FORBIDDEN` (`primary_agent_forbidden`, 403); helper `internalAgentTurnPath(agentId)`.
- `SecretBridgeClient.internalAgentTurn(agentId, body)`.
- `@x9-forge/contracts/capability/voice-live`: `VoiceLiveWebSessionRequestSchema.agent_id` (optional, same regex).
  Absent ⇒ identical to v1.21.
- Purpose: a voice session bound to a Forge-created agent talks to THAT agent (its workspace, registry and
  memory identity) and never to the personal primary agent served by `/internal/turn`.
- Consumers: agent-x9 `services/agent-core/src/routes/internal-agent-turn.ts` (server),
  agent-x9 `services/cap-voice-live/src/web/x9-ask.ts` + `routes/web-session.ts` (client).
- `@x9-forge/contracts/http`: `InternalFactoryDeployRequestSchema.email_enabled` (optional boolean).
  `false` ⇒ factory-svc skips the AgentMail inbox step (no inbox, no `AGENT_EMAIL` in `context.json`) —
  Enterprise Adoption MVP keeps agent email in standby. Absent or `true` ⇒ identical to v1.21 (inbox created),
  so Parallel workspace-seeder-svc and every other existing caller are unaffected.
  Consumer: forge-v2 `services/factory` (S2S route `/api/internal/factory/deploy` → `deploy.machine.ts`).

## v1.21.1 — 2026-09-12 — credential key QDRANT_API_KEY

### Added (PATCH)
- `@x9-forge/contracts/agent` credential key `QDRANT_API_KEY` (optional) — X9 Qdrant API key consumed by memory-svc (and cap-rag). Enabling it in production requires Forge factory-svc (raw fetch to Qdrant) to send it too.

## v1.21.0 — 2026-09-12 — Phase 50-06 web ingress contracts (browser live voice)

### Added (additive — MINOR)
- `@x9-forge/contracts/capability/voice-live`: `VoiceLiveWebSessionRequestSchema` (`{sdp, conversation_id?}`, strict)
  + `VoiceLiveWebSessionResponseSchema` (`{session_id, conversation_id, sdp, voice, model}`).
- `@x9-forge/contracts/http`: `CAP_VOICE_LIVE_WEB_SESSION_PATH` (`/live/web/session`), `CAP_VOICE_LIVE_WEB_PAGE_PATH` (`/live/web/`).
- `@x9-forge/contracts/agent` credential key `LIVE_WEB_AUTH_TOKEN`.
- Purpose: "parlare con X9 in live senza telefonata" — the browser does WebRTC straight to GPT-Live; cap-voice-live
  mints the session (`POST /v1/live/sessions` with the SDP offer) and observes it over the sideband.

## v1.20.0 — 2026-09-12 — Phase 50 voice provider lane: GPT-Live-1 calls via cap-voice-live

### Added (additive — MINOR, backward-compatible)
- `@x9-forge/contracts/voice`:
  - `VoiceProviderSchema = z.enum(['elevenlabs', 'openai_live'])` + `VoiceProvider`
  - `OPENAI_LIVE_MODEL = 'gpt-live-1'`, `OPENAI_LIVE_DEFAULT_VOICE = 'marin'`,
    `OPENAI_LIVE_DEFAULT_BACKEND_MODEL = 'gpt-5.6-terra'`
  - `ForgeVoiceWebhookNormalizedEventSchema.provider` widened from
    `z.literal('elevenlabs')` to `VoiceProviderSchema` (existing producers unchanged)
  - `VoiceToolCallSourceSchema` gains `'openai_live'`
  - `VoiceCallStartResponseSchema`: `elevenlabs_agent_id` now optional; new optional `provider`
- New sub-path `@x9-forge/contracts/capability/voice-live` (strict, internal X9 boundary):
  `CAP_VOICE_LIVE_DEFAULT_PORT = 3217`, `VoiceLiveToolDefinitionSchema`,
  `VoiceLiveCallStartRequestSchema` / `VoiceLiveCallStartResponseSchema`,
  `VoiceLiveTranscriptTurnSchema`, `VoiceLiveCallEndReasonSchema`.
- `@x9-forge/contracts/http`: `CAP_VOICE_LIVE_CALL_START_PATH` (`/internal/live/call-start`),
  `CAP_VOICE_LIVE_STREAM_PATH(callId)` (`/live/stream/:callId`), `CAP_VOICE_LIVE_TELNYX_WEBHOOK_PATH`;
  `PostCallPayloadSchema` gains optional `provider` (stamped by cap-voice-live).
- `@x9-forge/contracts/agent` credential keys: `VOICE_CALL_PROVIDER`, `OPENAI_LIVE_VOICE`,
  `OPENAI_LIVE_BACKEND_MODEL`, `TELNYX_API_KEY`, `TELNYX_CONNECTION_ID`, `TELNYX_FROM_NUMBER`,
  `TELNYX_PUBLIC_KEY`.
- Purpose: agent-x9 Phase 50 — outbound calls selectable per agent / per call between
  ElevenLabs ConvAI and OpenAI GPT-Live-1 (Telnyx originator + `services/cap-voice-live`
  media bridge). ElevenLabs path byte-for-byte unchanged.

### Consumers
- agent-x9 `services/cap-voice` (provider layer), new `services/cap-voice-live`.
- forge-v2 voice-svc: no change required (still emits `provider: 'elevenlabs'`).

## v1.19.0 — 2026-09-12 — Phase 50 voice-note provider lanes (TTS + STT)

### Added (additive — MINOR, backward-compatible)
- New sub-path `@x9-forge/contracts/capability/tts`:
  - `TtsProviderSchema = z.enum(['elevenlabs', 'openai'])` + `TtsProvider`
  - `DEFAULT_TTS_PROVIDER = 'elevenlabs'` (zero behaviour change on rollout)
  - `OPENAI_TTS_DEFAULT_MODEL = 'gpt-4o-mini-tts'`, `OPENAI_TTS_DEFAULT_VOICE = 'marin'`
- `@x9-forge/contracts/capability/stt`:
  - `DEFAULT_STT_PRIMARY_PROVIDER = 'elevenlabs'` (which provider cap-stt tries first;
    the other stays the automatic fallback — enum unchanged: `TranscribeProviderSchema`)
  - `OPENAI_STT_DEFAULT_MODEL = 'gpt-transcribe'`
- `@x9-forge/contracts/agent` `KNOWN_CREDENTIAL_KEYS` + `AgentCredentialsSchema`
  gain five optional per-agent config keys (vault-resolvable, same pattern as
  `ELEVENLABS_MODEL_ID`): `TTS_PROVIDER`, `OPENAI_TTS_MODEL`, `OPENAI_TTS_VOICE`,
  `STT_PRIMARY_PROVIDER`, `OPENAI_STT_MODEL`.
- Purpose: agent-x9 Phase 50 — let Stefano choose, per agent, whether Telegram
  voice notes are synthesised/transcribed by ElevenLabs (today) or OpenAI,
  without removing either lane. Calls (GPT-Live-1) are Phase 50.1 and will
  bring `VoiceProviderSchema` in a later release.

### Consumers
- agent-x9 `services/agent-core` (TTS_PROVIDER), `services/cap-stt` (STT_PRIMARY_PROVIDER).
- forge-v2: no change required (keys flow through the existing vault catchall).

## v1.18.0 — 2026-07-03 — X9-ATTACH-01 Photo Forward Attachment

### Added (additive — MINOR, backward-compatible)
- `@x9-forge/contracts/http` `internal-turn`:
  - `TurnAttachmentSchema` + `TurnAttachment` — optional channel-attachment
    reference: `{ type: 'photo' | 'document' | 'video', fileUrl: url,
    mimeType?, filename? }`. Direction- and consumer-agnostic (any channel,
    any consumer). `fileUrl` may be provider-scoped (e.g. Telegram bot-token
    file URLs) — consumers MUST treat it as sensitive: internal use only,
    no info-level logging, no verbatim persistence.
  - `InternalTurnRequestSchema` gains **optional** `attachment` field — a
    payload WITHOUT it still validates (non-breaking, regression-guarded).
    `internal-turn-stream` reuses the same request schema, so the stream
    body gains the field automatically (additive there too).
- Purpose: X9 was image-blind on the forward boundary — the Telegram photo
  handler built the file URL internally but discarded it (telegram.ts:395),
  forwarding only `[Foto]\n{caption}` text.

### Affected consumers (atomic SHA bump in the same phase — RLSE-02)
- `agent-x9/services/agent-core/src/channel/forward.ts` — includes
  `attachment` in the POST body only when present (imports `TurnAttachment`).
- `agent-x9/services/agent-core/src/channel/telegram.ts` — photo handler
  passes `{ type: 'photo', fileUrl, mimeType }` into the forward gate.
- `parallel/services/inbound-router-svc/src/app.ts` — InboundRequestSchema
  accepts optional attachment via `TurnAttachmentSchema` import.
- `parallel/services/inbound-router-svc/src/handler.ts` — carries optional
  attachment fail-soft (absent attachment = byte-identical behavior).

---

## v1.17.0 — 2026-06-16 — Phase 22 Forge Live Agent Runtime Status

### Added (additive — MINOR, backward-compatible)
- `@x9-forge/contracts/http` `internal-agents-list`:
  - `RuntimeAgentStatusSchema` — the 5 real per-agent wire states agent-core emits:
    `running | degraded | starting | stopped | bot-less`. agent-core imports this
    (it can never emit `unknown`).
  - `ForgeRuntimeStatusSchema` — the 5 states + `unknown` (Forge-side overlay value,
    produced when agent-core is unreachable; never emitted on the wire).
  - `RuntimeErrorKindSchema` — `auth | poll-death | transient` (nullable), mirrors
    agent-core BotErrorKind.
  - `ListAgentsAgentSchema` gains 4 **optional** fields: `runtimeStatus`, `loaded`,
    `errorKind`, `lastError`. The existing required `agentId`/`displayName`/`ownerId`
    are untouched → a response WITHOUT the new fields still validates (old agent-core).
- Purpose: the Forge admin panel reflects LIVE per-agent runtime status instead of the
  stale stored `agents.status` (incident 2026-06-16: panel showed agents "running" while down).

### Affected consumers (atomic SHA bump in the same phase — RLSE-02)
- `agent-x9/services/agent-core/src/index.ts` — `GET /internal/agents` route emits
  `runtimeStatus` from AgentManager + BotSupervisor (imports `RuntimeAgentStatusSchema`).
- `forge-v2/services/factory/src/services/x9.client.ts` + `routes/owner.routes.ts` —
  `listAgentsDetailed()` + overlay live status (imports `ForgeRuntimeStatusSchema`).

---

## v1.16.0 — 2026-06-16 — Phase 21 Factory Telegram-Token Rotate

### Added (additive — MINOR)
- New HTTP endpoint contract (`@x9-forge/contracts/http`):
  - `internalFactoryTelegramTokenContract` (PATCH /api/internal/factory/agents/:slug/telegram-token, token-auth)
  - `InternalFactoryTelegramTokenParamsSchema` ({ slug })
  - `InternalFactoryTelegramTokenRequestSchema` ({ telegram_bot_token: string min 1, telegram_bot_username?: string })
  - `InternalFactoryTelegramTokenResponseSchema` ({ ok, slug, telegramBotUsername?, reloaded }) + `...ErrorResponseSchema`
- `EndpointContract` `TMethod` union widened additively to include `'PUT' | 'DELETE' | 'PATCH'` (hygiene — the doc-type now honestly admits the PATCH contract; zero existing GET/POST contracts affected).

### Validation gates
- CJS smoke (`tests/cjs/smoke.cjs`) asserts the new contract + request schema resolve via require()
- Engines `>=20.0.0`, dist committed (Phase 18.1.1 pattern)

### Consumer migration
- forge-v2 factory-svc bumps `pnpm.overrides["@x9-forge/contracts"]` to git+https#<v1.16.0-sha> (Phase 21 Plan 21-01).
- No agent-x9 / forge-storefront change required this phase.

## v1.15.0 — 2026-06-13

**Additive — canonical per-agent `registry.json` file wrapper (Bug #15-class drift fix, R-14).**

- NEW `src/capability/agent-registry-file.ts`: `AgentRegistryFileSchema` /
  `AgentRegistryFile` — the FILE-level wrapper `{ capabilities:
  CapabilityRegistryEntry[] }` shared between Forge factory-svc (writer) and
  X9 agent-core (reader). The per-ENTRY shape was already owned by the bridge
  (`CapabilityRegistryEntrySchema`), but the file wrapper never was — and it
  drifted: Forge `deploy.machine` write-registry + `capabilities.service` wrote
  a **bare array** (`[]` / `[{...}]`) while X9 `loadRegistry` expected
  `{ capabilities: [...] }`. Every factory-provisioned (Parallel character)
  agent failed reload with Zod `"expected object, received array"` (HTTP 500 →
  agent `degraded`). This is the exact cross-repo on-disk drift R-14 exists to
  prevent. Defining the wrapper here makes both sides import ONE contract.
- Exported from `@x9-forge/contracts/capability`.
- Tests: `tests/capability/agent-registry-file.test.ts` — valid wrapper, empty
  `capabilities: []`, plus NEGATIVE guards that a bare array (the pre-fix Forge
  shape) and a malformed entry both FAIL (Bug #15 lesson — the broken shape
  must never silently re-validate).

**Affected consumers (must update under the same GSD phase, RLSE-02):**
- `forge-v2` `services/factory/src/services/deploy.machine.ts` (write-registry,
  backup, disableAgent) + `services/factory/src/services/capabilities.service.ts`
  (getAgentCapabilities, toggleCapability) — write/read the wrapper, validate
  with `AgentRegistryFileSchema`.
- `agent-x9` `services/agent-core/src/registry/registry.ts` — already reads the
  wrapper (its `RegistryFileSchema` is a deliberate superset); add a compat-guard
  test proving a bridge `AgentRegistryFile` parses green under X9's reader.

## v1.14.0 — 2026-06-13

**Additive — canonical agent on-disk path helpers (Bug #15 path-drift fix).**

- NEW `src/agent/agent-paths.ts`: `agentWorkspacePath(dataDir, agentId)`,
  `agentRegistryPath(dataDir, agentId)`, `agentContextJsonPath(dataDir, agentId)`.
  The workspace-path convention (`/data/workspaces/{agentId}`) was previously
  only DOCUMENTED in a comment and never enforced — the Parallel
  workspace-seeder drifted to `/data/workspaces/owner-{id}/{slug}`, so every
  seeded character workspace landed where X9 agent-core never looked
  ("IDENTITY.md not found" → every character agent failed to boot). Promoted
  the convention to an enforced shared helper.
- Consumers (same-day): forge-v2 factory `deploy.machine` (writer — uses the
  helper + becomes non-clobbering for pre-seeded workspaces); Parallel
  workspace-seeder (pre-seeder — writes to the canonical path, not owner-N/slug).

---

## v1.13.2 — 2026-06-12

**Additive — reload response describes the bot-less wire shape.**

- `ReloadAgentResponseSchema` gains optional `telegram: z.literal('skipped')`
  — X9 sends it for bot-less reloads since v1.12.0 consumers. Zod default
  parsing strips unknown keys, so no consumer ever errored; this makes the
  contract truthful. Found by the F-1/F-2 independent audit.

---

## v1.13.1 — 2026-06-12

**Additive — INTERNAL_MEMORY_INGEST_PATH (D-1 unblock).**

- `src/memory/paths.ts`: `INTERNAL_MEMORY_INGEST_PATH` (`/internal/memory/ingest`)
  + METHOD. Was the missing constant blocking agent-core chat-turn episode
  ingest (FOLLOW-UP D-1) and forcing the memory tool-handlers to hardcode
  the URL (R-14 path-guard now enforces it).
- Consumers: agent-x9 memory tool-handlers (same-night F-2 PR); agent-core
  D-1 ingest when implemented; Parallel canon finalizer mirror.

---

## v1.13.0 — 2026-06-12

**Additive — F-2: per-agent (tenant, owner) memory-scope identity.**

- `AgentContextCoreSchema` gains optional `tenantId` (min 1). The memory
  engine scopes by the (tenantId, ownerId, agentId) triple; ownerId/agentId
  were always per-agent, tenantId came from process-global `X9_TENANT_ID` —
  collapsing all agents of a multi-agent runtime onto one tenant. Absent ⇒
  consumers fall back to env (single-tenant unchanged).
- `ToolCallRequestSchema` gains optional `tenantId` + `ownerId` (min 1) —
  agent-core's tool-router attaches the dispatching agent's identity so
  capability services (memory_capture / memory_recall in memory-svc) can
  scope per-agent instead of per-process env.
- Affected consumers (same-night PRs): agent-x9 `services/agent-core`
  (extractor + tool-router thread ctx identity), `services/memory`
  (tool-handlers prefer dispatched identity over env). forge-v2: none yet
  (factory may write tenantId at deploy when control-plane tenancy lands).

---

## v1.12.0 — 2026-06-11

**Additive — F-1: canonical full `context.json` contract; bot-less agents are legal.**

- NEW `src/agent/agent-context-file.ts`:
  - `AgentContextRuntimeFieldsSchema` — the Runtime fields Forge WRITES and
    X9 READS (`workspacePath`, `registryPath`, `telegramBotToken`,
    `displayName`). Previously re-declared X9-side only → drift.
  - `AgentContextFileSchema` = Core + Runtime — the FULL on-disk
    `context.json` contract. **`telegramBotToken` is `.optional()`** —
    absent or `''` (the Forge writer shape) ⇒ bot-less agent, LEGAL.
  - `hasTelegramBot(ctx)` — canonical bot-less discriminator (trims; `''`
    and whitespace = no bot). Consumers MUST use this to decide whether to
    boot a Telegram channel.
  - `parseAgentContextFile(json)` — fail-loud boundary parser for both the
    Forge writer (validate-before-write) and the X9 reader.
- WHY (Bug #15 class, F-1 in E2E-FINDINGS-2026-06-11): X9 required
  `telegramBotToken: min(1)` while Forge wrote `''` for bot-less agents →
  X9 reload threw, Forge swallowed, agent silently never registered.
- Affected consumers (same-night PRs): agent-x9 `packages/types`
  (AgentContextSchema now derives from `AgentContextFileSchema`),
  `services/agent-core` (boot/reload skip Telegram via `hasTelegramBot`,
  no quarantine for bot-less); forge-v2 `services/factory`
  (deploy.machine validates context against the bridge schema before
  write + stops swallowing X9 reload failures).

---

## v1.11.2 — 2026-06-11

**Additive — internal-memory-recall-bundle endpoint contract (R-14 closure, Block B).**

- NEW `src/http/endpoints/internal-memory-recall-bundle.ts`:
  `INTERNAL_MEMORY_RECALL_BUNDLE_PATH`, `internalMemoryRecallBundleContract`,
  request/response/entry/audit schemas mirroring the live
  `services/memory/src/routes/internal-recall-bundle.ts` route (incl. Phase 41
  temporal filter via existing `RecallTemporalFilterSchema`).
- Exported from `http/endpoints` index. Unit tests added (valid+invalid,
  temporal, contract pin).
- Affected consumers: agent-x9 `services/memory` (route + integration tests
  import the path constant — wired in Block B multi-tenant work). forge-v2:
  none yet (console may adopt later).

---

## v1.11.1 — 2026-05-29

**Patch — contract alignment (no consumer shipped against v1.11.0 yet).**
Aligns `InternalFactoryDeployRequestSchema` field-for-field with forge-v2
factory `deployBodySchema` so factory-svc can parse the body and pass it
straight to `deploy()`:
- `ownerId`: `string` → `z.number().int().positive().nullable().optional()`
  (Forge owner ids are numeric DB ids — v1.11.0 had the wrong type).
- Added `name.max(50)`, `slug.max(30)`, `objective.max(500)`, `creature.max(100)`,
  `vibe.max(200)`, `emoji.max(10)`, `telegram_bot_token`, `telegram_user_id`
  to mirror Forge constraints exactly.
- `selectedCapabilities`: plain `z.array(z.string())` (matches Forge; the
  registry step validates docker hostnames downstream).
`inboundForwardUrl` unchanged. agent-x9 (consumes only `inboundForwardUrl`,
unchanged) may stay pinned at v1.11.0; forge-v2 + parallel pin v1.11.1.

---

## v1.11.0 — 2026-05-29

**Minor release — additive only.** Parallel Wave 2 (per-character agent delivery).
Two additive contract changes, zero rename/removal:

1. **Re-adds `inboundForwardUrl` to `AgentContextCoreSchema`**
   (`z.string().url().nullable().optional()`). This field was introduced in
   v1.10.0, then reverted in the Wave-1 contamination decontamination
   (2026-05-29) because the agent-x9 X9-CORE-2 *global* forward gate that
   consumed it was contaminating Stefano's personal agent. v1.11.0 brings the
   field back for the *per-agent* mechanism only: Forge writes it into a
   character-agent's `context.json`; agent-core forwards that agent's inbound
   to the URL. Agents without the field (e.g. the personal `x9` agent) never
   forward. Back-compat: absent/null → no override.

2. **Adds `internal-factory-deploy` endpoint contract**
   (`POST /api/internal/factory/deploy`, `authType: 'token'`). S2S sibling of
   the Clerk-gated `/api/factory/deploy` — lets trusted control-plane services
   (Parallel `workspace-seeder-svc`) provision agents programmatically via the
   shared `INTERNAL_SERVICE_TOKEN`. Request carries optional `inboundForwardUrl`
   threaded into the deployed agent's `context.json`.

**Affected consumers:**
- `forge-v2` factory-svc — imports `internalFactoryDeployContract` +
  `InternalFactoryDeployRequestSchema`; adds the S2S route + `requireInternalAuth`
  middleware (bridge `INTERNAL_TOKEN_HEADER`); threads `inboundForwardUrl` into
  `deploy.machine` context.json write. Pin bump 41d8ee5 → v1.11.0.
- `agent-x9` agent-core — re-adds the *per-agent* `inboundForwardUrl` forward
  (clean X9-CORE-3, no global env var). Vendor re-sync to v1.11.0.
- `parallel` workspace-seeder-svc — builds the deploy request (client side).

(v1.10.0 is intentionally skipped: it was reverted; v1.11.0 supersedes it with
the same field plus the new endpoint.)

---

## v1.9.0 — 2026-05-27

**Minor release — additive only.** Phase 12.A. Adds `cc: string[]` to
`IncomingMessageEnvelopeSchema` as the knowledge-propagation primitive
for the Phase 12 awareness graph. Zero rename, zero removal. Default `[]`
keeps v1.8.0 consumers parsing v1.9.0 payloads without code change
(backward-compat invariant).

### Added
- **`IncomingMessageEnvelopeSchema.cc`** (`messaging/incoming-message-envelope.ts:84-95`) — array of CC recipients (email primarily; empty for channels without CC semantics like telegram/voice). Capped at 50 entries (DoS bound). Each entry follows the channel-native address format of `from`/`to`. Phase 12.A consumers (cap-email inbound webhook, topic-svc extractor) use this field to propagate `awareness=full` to CC'd characters when extracting topics from the message body.

### Notes
- **`.default([])`** is the backward-compat hinge: v1.8.0 producers that don't emit `cc[]` continue to parse cleanly under v1.9.0. v1.8.0 consumers ignoring `cc` will simply miss the propagation source (no error, just degraded awareness coverage until they upgrade).
- **Tests** (`tests/messaging/incoming-message-envelope.test.ts`) cover: default empty when omitted, single-CC, multi-CC, 50-cap rejection, empty-string entry rejection.
- **NOT in v1.9.0**: `bcc` field (Phase 13 candidate — BCC implies hidden awareness, the model gets richer).

### Consumer impact
- **agent-x9 cap-email**: `src/webhooks/inbound.ts` `IncomingMessageEnvelopeSchema.parse({...})` call must populate `cc: typed.message.cc ?? []`. Currently passes implicit default `[]` (still works), but explicit harvest is required to actually surface CC awareness downstream.
- **agent-x9 telegram-router-svc**: no change needed — telegram has no CC concept; the default `[]` is correct.
- **parallel inbound-router-svc**: no change needed — `cc` flows through transparently to topic-svc consumer.
- **parallel topic-svc** (Phase 12.C, new): consumes `envelope.cc` directly when computing `propagateAwareness(envelope, topics)`.
- **forge-v2**: atomic SHA bump of `pnpm.overrides["@x9-forge/contracts"]` from `946baf5` (v1.8.0) → v1.9.0 HEAD SHA. Same wave as bridge merge (RLSE-02 atomic).

### Rollback anchor
- Pre-Phase-12 baseline: tag `pre-phase-12-2026-05-27` at commit `946baf5` (v1.8.0 final). Restore via `git reset --hard pre-phase-12-2026-05-27` + atomic SHA revert in forge-v2/parallel/agent-x9.

---

## v1.8.0 — 2026-05-27

**Minor release — additive only.** Phase 11.A. New `messaging` subpath + 2 inbound webhook endpoint contracts + new `EndpointAuthType` literal. Zero rename, zero removal, zero shape change of existing schemas. Public API surface 100% backward-compatible with v1.7.1.

### Added
- **New subpath `./messaging`** — cross-channel inbound messaging contracts. 5 schemas:
  - `ChannelTypeSchema` — `z.enum(['telegram','email','voice','whatsapp'])`. Bridge-owned source-of-truth for the 4 channels X9/Forge address. Parallel mirrors locally per Hard Rule 21 (memoria 21) — JSDoc cross-link both files; update in lockstep.
  - `IncomingMessageAttachmentSchema` — reusable attachment subschema (`mime`, `filename`, `size_bytes`, `url`/`inline_b64`).
  - `IncomingMessageEnvelopeSchema` — STRICT internal boundary envelope emitted by cap-email (post-Svix verify) and telegram-router-svc (post-bot-secret verify). `signature_valid: z.literal(true)` enforces D-09 no-fallback (invalid-signature events MUST be dropped at the boundary, never propagated). `raw_provider_event: z.unknown()` is the LENIENT escape hatch for provider drift. Mirrors `capability/voice/normalized-event.ts` pattern.
  - `AgentEmailInboxSchema` — per-agent AgentMail inbox identity (matches Forge `agentmail.service.ts` return shape `{inboxId, email}`). Zero secret material in schema; vault carries the API key under existing `AGENTMAIL_API_KEY` credential (R-17).
  - `AgentTelegramBotSchema` — per-agent Telegram bot identity (`bot_username`, `bot_token_ref` vault pointer, `chat_allow_list` as string array to preserve int64 supergroup ids). NO `bot_token` field — vault carries the value (R-17). Pattern: `botTokenRef` references existing `TELEGRAM_BOT_TOKEN` credential.
- **2 new endpoint contracts in `./http`**:
  - `webhookInboundTelegramContract` (`POST /webhook/inbound/telegram`) — telegram-router-svc inbound. `authType: 'external_provider'` (provider-set secret-token header).
  - `webhookInboundEmailContract` (`POST /webhook/agentmail/inbound`) — cap-email inbound. `authType: 'external_provider'` (Svix HMAC).
- **New `EndpointAuthType` literal: `'external_provider'`** in `src/auth/auth-headers.ts`. Additive — `'secret' | 'token' | 'none'` unchanged. Documents the semantic where auth is supplied by an external provider's own scheme (Svix HMAC, Telegram bot secret-token, ElevenLabs HMAC). Bridge does NOT type the provider header shape; each consumer owns verification. Mirrors precedent in `webhook-post-call.ts:6` JSDoc.
- **Consumer-cjs probe + cjs-smoke** updated with all 5 messaging symbols (`ChannelTypeSchema`, `IncomingMessageEnvelopeSchema`, `IncomingMessageAttachmentSchema`, `AgentEmailInboxSchema`, `AgentTelegramBotSchema`). consumer-cjs-node20 CI gate now exercises the new subpath under NodeNext + Node 20 (Phase 18.1.1 D-18.1.1-3 mechanism).
- **Unit tests** under `tests/messaging/`: 6 files covering happy paths + STRICT boundary rejection cases (`signature_valid: false` rejected, int64 chat-id preservation, branded type safety, etc.).

### Notes
- **NOT added to bridge**: `AGENTMAIL_WEBHOOK_SECRET` is service-local in cap-email `env.ts` with `@bridge-optout` documentation (R-17 service-instance pattern). Mirrors the `ELEVENLABS_WEBHOOK_SECRET` exclusion at `agent-credentials.ts:67-79`. Webhook secrets are per-registration, not per-agent, so they don't belong in `AgentCredentialsSchema`.
- **Voice keeps `capability/voice/`** subpath — call-shaped contract predates the generic envelope and remains canonical for voice (transcript, conversation_id, post-call recap). Messaging subpath covers everything that is NOT call-shaped.
- **Snake_case convention** maintained across messaging transport payloads (`message_id`, `body_text`, `received_at`, `provider_event_hash`) — matches `normalized-event.ts` template.
- **`'external_provider'` auth literal** is intentionally distinct from `'token'` to preserve Bug #15 semantics (`'token'` reserved for `X-Internal-Token` forwarded across X9/Forge).
- **No removal, no rename, no shape change of existing schemas.** Public API surface byte-equivalent for v1.7.1 imports.

### Consumer impact
- **agent-x9**: zero install impact (link mode reads `dist/` directly). Consumers of `./messaging` subpath will become cap-email (Phase 11.B) and telegram-router-svc (Phase 11.C). Forge factory-svc may also import `AgentEmailInboxSchema` for cross-repo provisioning handshake.
- **forge-v2**: atomic SHA bump of `pnpm.overrides["@x9-forge/contracts"]` from `41d8ee5...` to the new v1.8.0 HEAD SHA. Same wave as bridge merge (RLSE-02 atomic). Forge factory-svc will optionally consume `AgentEmailInboxSchema` to type the `agentmail.service.ts` return value cross-repo.
- **parallel**: atomic SHA bump of `pnpm-lock.yaml` + `scripts/verify-bridge-pin.mjs` (replace SHA constant). 16 services in `*` pattern resolve via override. Parallel uses the messaging subpath in Phase 11.E inbound→Director→outbound loop.

### Rollback anchor
- Pre-Phase-11 baseline: tag `pre-phase-11-2026-05-27` at commit `41d8ee5` (v1.7.1 + STATE doc update). Restore via `git reset --hard pre-phase-11-2026-05-27` + atomic SHA revert in forge-v2/parallel.

### Incident reference
- Phase 11 plan + intel: `/Users/admintemp/Downloads/Claude/parallel/.planning/phases/11-multi-canale-routing/` (Parallel-side planning).
- Phase 10.11 night work that exposed the gap (outbound-only demo, no inbound loop): `/Users/admintemp/Downloads/Claude/parallel/.planning/phases/10-director-runtime-narrative-loop/10-11-NIGHT-FINAL.md`.

---

## v1.7.1 — 2026-05-05

**Hotfix release.** Closes the Node 20 consumability gap that broke forge-v2 CI on the v1.7.0 pin bump (`986634b`, CI run 25377004134). Public API surface byte-equivalent to v1.7.0 (R-14).

### Fixed
- **`engines.node` lowered** from `">=22.0.0"` to `">=20.0.0"` (Phase 18.1.1 D-18.1.1-1). Forge-v2 CI runs Node 20.20.2 — the previous constraint produced `WARN Unsupported engine` on install + downstream zshy ran on unsupported runtime, emitting `.d.cts` Node 20 NodeNext could not resolve (TS2307 across every subpath consumer).
- **`prepare`-in-temp-store dependency eliminated** (D-18.1.1-2). Bridge tarball now ships `dist/` pre-built; consumer `pnpm install --frozen-lockfile` no longer invokes zshy in pnpm 10 temp store. `package.json#/scripts.prepare` narrowed from `"husky && pnpm build"` to `"husky"` only; new `prepublishOnly` script keeps the npm publish path running `pnpm build`. `.gitignore` no longer excludes `dist/`.

### Added
- **`tests/consumer-cjs/` synthetic fixture + `consumer-cjs-node20` CI gate** (D-18.1.1-3). New required job in `.github/workflows/ci.yml` spins Node 20 + ubuntu + pnpm 10, runs `pnpm pack`, installs the tarball into a CommonJS-shaped fixture (`tsconfig.json` `moduleResolution: NodeNext` + `module: NodeNext` + `skipLibCheck: false`), runs `tsc --noEmit`. Catches every Phase-19-class subpath-resolution bug AT THE BRIDGE PR, not at consumer install time. Closes the producer-only-validation gap that let v1.7.0 ship broken.
- **`dist`-staleness CI gate** (companion to D-18.1.1-2). Existing Node 22 `test` job now asserts `git diff --quiet -- dist/` after `pnpm build` — committed dist must stay in lockstep with src.

### Notes
- **No breaking changes for ESM consumers.** Public API surface byte-identical to v1.7.0 (R-14 verified via `find dist -name '*.d.ts' -o -name '*.d.cts' | xargs grep -hE '^export ' | sort -u` → 735 export lines, zero-diff against v1.7.0 baseline).
- **agent-x9 unaffected** by the dist commit — it consumes via `link:` mode (file-system path), reads `dist/` directly. Tracked dist/ adds nothing for link consumers.
- **forge-v2 must bump `pnpm.overrides["@x9-forge/contracts"]`** to v1.7.1 SHA per RLSE-02 (atomic consumer bump). Tracked in forge-v2 Phase 18.1.1 Plan 02 Task 4.
- **v1.7.0 tag preserved on origin** as historical record (first dual-build attempt with engines/prepare flaws). v1.7.1 is the working release pointer.

### Why
Phase 18.1 attempted 2026-05-05. Bridge v1.7.0 ran 4 producer-side validation layers (vitest 711+/711+, cjs-smoke 13/13, publint, attw) all green LOCALLY on Node 22 + pnpm 9. Pushed; tagged. Forge-v2 pin bump `986634b` pushed to main → CI run 25377004134 FAILED with TS2307 across every bridge subpath consumer (`Cannot find module './agent-identity.cjs'` etc.). Local pin install passed (Node ≥22); CI on Node 20 failed.

3-auditor consensus 2026-05-05 (x9-verifier + x9-contract-bridge-auditor + x9-release-auditor):
- Smoking gun: `engines.node = ">=22.0.0"` mismatch with CI Node 20.20.2.
- Root cause: zshy `prepare` brittleness in pnpm 10 temp-store on CI (RESEARCH.md §Pitfall #3 — Fix C explicitly endorsed: commit dist/ to git).
- Validation gap: producer-side validation (publint+ATTW+vitest+cjs-smoke) all run INSIDE the bridge — none replicated a fresh consumer install on the consumer's runtime. Bridge-side CI gate added.

### Consumer impact
- **agent-x9:** zero impact (link mode reads `dist/` directly; engines lower is more permissive, not less).
- **forge-v2:** atomic SHA bump required (Phase 18.1.1 Plan 02 Task 4-5). After bump, fresh `pnpm install --frozen-lockfile` exits 0 on Node 20 + ubuntu + pnpm 10. Phase 19 deploy retry unblocked.

### Rollback anchor
- Bridge tag `pre-phase-18.1.1-2026-05-05` (LOCAL only) at commit `2520403` (post-Phase-18.1 v1.7.0 release commit + STATE update).
- Bridge tag `v1.7.0` on origin remains valid as the previous (broken-on-Node-20) release pointer.
- Bridge tag `pre-phase-18.1-2026-05-05` (LOCAL only) at `4f2da00` remains as v1.6.3 baseline.

### Incident reference
- forge-v2 CI run that surfaced the bug: GitHub Actions run `25377004134` on commit `986634b` (2026-05-05).
- forge-v2 Phase 18.1 handoff: `forge-v2/.planning/phases/18.1-bridge-dual-esm-cjs-build/18.1-HANDOFF.md`
- forge-v2 Phase 18.1.1: `forge-v2/.planning/phases/18.1.1-bridge-v1.7.1-hotfix/`
- Memory: `project_phase19_paused_cjs_esm_bug_2026_05_04.md` (2026-05-05 update section)

---

## v1.7.0 — 2026-05-05

### Added
- **Dual ESM+CJS build pipeline.** `pnpm build` now uses [`zshy`](https://github.com/colinhacks/zshy) (the same toolchain zod uses) to emit both ESM (`.js` + `.d.ts`) AND CJS (`.cjs` + `.d.cts`) artifacts for every public subpath. `package.json#/exports` declares `"types"` + `"import"` + `"require"` triples for all 11 subpaths (auto-written by zshy). `package.json#/main` flips to `./dist/index.cjs`, `package.json#/types` flips to `./dist/index.d.cts`, while `"type": "module"` and the `"import"` condition stay unchanged for ESM consumers.
- **`./capability/stt` subpath now has source.** The exports entry was declared in commit `43f7ef5` (X9 Phase 47.0) but no source file existed in the bridge — agent-x9's `services/cap-stt` consumes the subpath via link mode but a fresh git+https install would have failed. New `src/capability/stt/index.ts` exports `CAP_STT_DEFAULT_PORT` (number, =4011), `TranscribeProviderSchema` (zod enum: openai|elevenlabs), `TranscribeRequestSchema`, `TranscribeResponseSchema` + types. Symbol set derived from agent-x9 import sites (4 files in services/cap-stt/src).
- **CJS resolution smoke test.** `tests/cjs/smoke.cjs` is a pure-CommonJS file that runs via `node tests/cjs/smoke.cjs` (NOT vitest — vitest's loader is ESM and does not exercise the bug class that crashed forge-v2 vault-svc on 2026-05-04). The smoke `require()`s every public subpath + asserts known named symbols.
- **ESM smoke test.** `tests/esm/smoke.test.ts` mirrors the CJS smoke under vitest, proving ESM consumers (agent-x9 link mode + future ESM forge-v2) are unaffected by the dual build.
- **`publint` + `@arethetypeswrong/cli` validation layers.** Wired into `pnpm check:pack` (separated from `build` to avoid a recursive `prepare`-script fork-bomb — see Plan 01 Deviation #1). publint catches malformed `exports` map entries (missing files, wrong condition order). attw catches types-resolution failures across node10 / node16-cjs / node16-esm / bundler conditions. attw runs with `--profile node16 --ignore-rules false-cjs` to suppress the documented benign "Masquerading as CJS" warning that follows from the standard zod pattern (`"type": "module"` + `"types"` → `.d.cts`). New `pnpm validate` aggregator runs build + check:pack + test as a one-shot CI/pre-release entry point.
- **`scripts/check-portable-dts.mjs` walker extension.** Now scans `.d.cts` and `.d.mts` in addition to `.d.ts`. Function rename `walkDts` → `walkDeclarationFiles`. The TS2883 portable-dts guardrail introduced in v1.6.3 stays effective on the new artifact class.

### Notes
- **No breaking changes for existing ESM consumers.** Public API surface is byte-identical for the 9 pre-existing subpaths (verified via R-14 byte-identity diff: `find dist -name '*.d.ts' | xargs grep -hE '^export ' | sort -u` produces zero removed lines). Net-new exports come ONLY from the back-filled `./capability/stt` subpath (additive).
- **agent-x9 unaffected** by the dual build — it consumes via `link:` (file-system path), reads `dist/` directly, and the dual build adds CJS files alongside ESM without removing anything. agent-x9 stays on its current bridge link.
- **forge-v2 must bump `pnpm.overrides["@x9-forge/contracts"]`** to the new bridge SHA per RLSE-02 (atomic consumer bump). This is the post-release follow-up tracked in forge-v2 Phase 18.1 Plan 02 Task 4.

### Why
Forge-v2 Phase 19 deploy attempt (2026-05-04) crashed vault-svc with `ERR_PACKAGE_PATH_NOT_EXPORTED` on `@x9-forge/contracts/auth`. Root cause: bridge was full-ESM (`"type": "module"` + only `"import"` condition); all 5 forge-v2 services compile CJS (`tsconfig.json "module": "CommonJS"`); tsc emits `require("@x9-forge/contracts/auth")`; Node CJS resolver finds no `"require"` field in exports → throws. The latent bug was introduced in Phase 18-04 R-14 hygiene sweep (commits `20f0af1`, `ea24add`) which migrated subpath imports into vault, factory, voice. Local vitest passed because it runs the ESM resolver. First runtime exposure was Phase 19 deploy → PATH C Hostinger snapshot restore. Phase 18.1 closes the structural bug in the bridge so Phase 19 retry can succeed.

### Consumer impact
- **agent-x9:** zero impact (link mode reads `dist/` directly; new `./capability/stt` source resolves what was previously dangling — actually IMPROVES the install path for fresh consumer scenarios).
- **forge-v2:** atomic SHA bump required (Phase 18.1 Plan 02 Task 4-6). After bump, forge-v2 services compile + boot under CJS without the ERR_PACKAGE_PATH_NOT_EXPORTED crash. Phase 19 deploy retry unblocked.

### Rollback anchor
- Bridge tag `pre-phase-18.1-2026-05-05` at commit `4f2da00d0a7ae68ef4ca65c6b9664d63389e360d` (the v1.6.3 release commit).
- Bridge tag `pre-ts2883-fix-2026-05-04` at commit `7f718c17b1d65c6549ee8d43ceae2e814e3ad37c` (v1.6.2) remains valid.

### Incident reference
- forge-v2 Phase 19 Plan 02 deploy log: `forge-v2/.planning/phases/19-coordinated-phase17-18-deploy/19-DEPLOY-LOG.md` §"Task 2 — INCIDENT + ROLLBACK"
- forge-v2 Phase 18.1: `forge-v2/.planning/phases/18.1-bridge-dual-esm-cjs-build/`
- Memory: `project_phase19_paused_cjs_esm_bug_2026_05_04.md`

---

## v1.6.3 — 2026-05-04

### Fixed
- `src/http/endpoints/{cap-env-schema,cap-health,cap-manifest,memory-correct}.ts`: added `import { z } from 'zod'` so emitted `.d.ts` uses the portable `z.ZodObject<...>` named form instead of a synthesized `import("zod").ZodObject<...>` string. Without the in-scope `z`, TypeScript writes a string-literal import that a pnpm 10 consumer resolves through its temp prepare store (`_tmp_<hash>/`), producing TS2883 declaration emit errors.

### Added
- `scripts/check-portable-dts.mjs` — guardrail that fails the build if any emitted `.d.ts` contains a non-portable synthesized import (`import("zod")`, pnpm temp-store paths, or any `node_modules/` path). Wired as the second step of `pnpm build`, so every local build, every consumer `prepare`, and bridge CI catch a regression of this class at build time. Verified positive (700/700 tests, 89 portable `.d.ts`) and negative (injected violation → exit 1 with file + count + sample + fix recipe).

### Notes
- No breaking changes — pure declaration-emit fix; runtime behavior and public API identical to 1.6.2.
- Asymptomatic on bridge own CI (Node 22 / pnpm 10) because the bridge builds in a stable layout. Manifested only when a fresh pnpm 10 consumer fetched the package and ran `prepare` in a temp store.
- Incident reference: forge-v2 GH Actions run 25328536024 (2026-05-04) — Phase 19 deploy CI failed at `pnpm install --frozen-lockfile` during bridge `prepare` step.
- Rollback anchor: tag `pre-ts2883-fix-2026-05-04` on bridge commit `7f718c17b1d65c6549ee8d43ceae2e814e3ad37c` (v1.6.2).
- Consumer follow-up: forge-v2 must bump `pnpm.overrides["@x9-forge/contracts"]` to the new bridge SHA (atomic SHA bump per RLSE-02). agent-x9 currently uses `link:` and is unaffected.

---

## v1.6.2 — 2026-04-30

### Added
- `@x9-forge/contracts/memory`: `MEMORY_CORRECT_PATH`, `MEMORY_CORRECT_METHOD`, `MEMORY_CONSOLE_LIST_PATH_TEMPLATE`, `MEMORY_CONSOLE_LIST_METHOD` path constants (Phase 18 D3).
- `@x9-forge/contracts/http`: `memoryCorrectContract` endpoint contract (POST /internal/memory/correct, secret auth) and `memoryConsoleListContract` metadata + `memoryConsoleParamsSchema` + `MemoryConsoleKindSchema` (GET /internal/memory/console/:kind, secret auth).
- Tests: `tests/http/endpoints/memory-correct.test.ts`, `tests/http/endpoints/memory-console.test.ts`.

### Notes
- Closes forge-v2 Phase 18 D3 (R-14 cross-repo URL hygiene for memory-v2 routes).
- No breaking changes — additive only. Consumers can upgrade transparently.

---

## [1.6.1] - 2026-04-25 — M46 Phase 46.1: Bug C send_recap_email narrowing

### Added

- **`SendRecapEmailInputSchema`** — narrowed `send_recap_email` input shape (`{intent?: z.string().max(200).optional()}`). Replaces the generic `z.record(z.string(), z.unknown())` at the cap-voice handler boundary. LLM no longer supplies `subject`/`body`/`to` (Bug A closed `to`; Bug C closes `subject`/`body`).
- **`SendRecapEmailOutputSchema`** — narrowed output shape with `body_source: z.enum(['template'])`. Single value first cut; widens M47+ if LLM-synthesis fallback is enabled.

### Changed

- (additive only — no breaking changes; envelope `VoiceToolCallRequestSchema.input` stays `z.record` to preserve the 13-tool generic dispatch)

### Why

Bug C fold-in per `project_bug_c_decided_fold_in_m46_2026_04_23.md`. The recap email body is now composed server-side by `services/cap-voice/src/brief-composer/recap-body-composer.ts`. LLM-supplied body content is IGNORED. Eliminates the hallucination foot-gun observed in conv_2501 and quick-260422-qhc Ferrari test.

### Consumer impact

- **Additive only.** Envelope schema unchanged.
- cap-voice consumes the new schemas in `services/cap-voice/src/tools/send-recap-email.ts`.
- ElevenLabs dashboard tool description tightens via `sync-elevenlabs-tools.ts` PATCH at end of Phase 46.1 (D-13).
- Old consumers passing `subject`/`body`/`to` continue to work at envelope level — those fields are now silently ignored by the cap-voice handler. Tool count stays 13.

---

## [1.6.0] - 2026-04-24 — M46 Phase 46.0: Voice Origination Contracts

### Added

- **`VoiceCallIntentSchema`** — 7-enum `reminder|information|sales|legal|logistics|social|other` (VORIG-01).
  Exported from `src/capability/voice/intent.ts` + barrel `index.ts`. Order is part of the contract.
  Consumers: 46.1 intent classifier (classifier output), 46.2 workspace prompt dynVar wiring.
- **`VoiceCallProvenanceEntrySchema`** — minimal `{source, ref_id?, summary?(≤500), timestamp?}` (VORIG-03).
  Lives in `src/capability/voice/provenance.ts` (new file). Traces data sources
  (`strategic_file` / `cap_contacts` / `memory_v2` / `cap_calendar` / …) that composed a `VoiceCallBrief`.
  Placed in its own module (not co-located with `prepare-call.ts`) to avoid a module-initialization cycle
  with `brief.ts` — see `46.0-RESEARCH.md` §12 pitfall #2.
- **`VoicePrepareCallRequestSchema`** — `{call_id, raw_instruction, requested_contact?}` (VORIG-02).
- **`VoicePrepareCallResponseSchema`** — `{brief, authorized_actions, intent, intent_confidence?, provenance, preview_markdown?}` (VORIG-02).
- **`CAP_VOICE_PREPARE_CALL_PATH = '/call/voice_prepare_call'`** + `CAP_VOICE_PREPARE_CALL_METHOD = 'POST'` (VORIG-04).
  Exported from `src/http/endpoints/voice.ts`; re-exported via `src/http/endpoints/index.ts`.

### Changed (additive, non-breaking)

- **`VoiceCallBriefSchema`** extended with 4 optional fields (VORIG-03):
  - `intent?: VoiceCallIntentSchema`
  - `memory_context?: z.string().max(2000)` — ElevenLabs dynVar `{{memory_context}}` (wired in 46.2)
  - `relationship_context?: z.string().max(500)` — prior-interaction summary
  - `provenance?: VoiceCallProvenanceEntry[]` — data-source audit trail

### Why

M46 Voice Origination Composer (phases 46.0-46.4). Replaces free-form `voice_call`
prose with structured `voice_prepare_call` → `voice_call_start` pipeline. 46.0 is
bridge-FIRST per R-14 — no consumer code ships until bridge contracts are locked.

Q11 decision (CONTEXT.md): explicit `memory_context` field on brief (vs enriched string)
for typed validation + 2000-char bound enforcement at bridge layer. Sanitizer
implementation is 46.1 scope.

### Consumer impact

- **Additive only.** All 4 new `VoiceCallBriefSchema` fields are `.optional()` — pre-v1.6.0
  consumers compile and parse unchanged. No migration required for 46.0 (VORIG-05).
- **46.1 (cap-voice, upcoming)**: imports `VoiceCallIntentSchema`, `VoicePrepareCallRequestSchema`,
  `VoicePrepareCallResponseSchema`, `VoiceCallProvenanceEntrySchema` from `@x9-forge/contracts/capability/voice`
  (or the shorter `@x9-forge/contracts/voice` subpath). Also imports `CAP_VOICE_PREPARE_CALL_PATH` +
  `CAP_VOICE_PREPARE_CALL_METHOD` from `@x9-forge/contracts/http`.
- **46.2 (agent-core, upcoming)**: imports `CAP_VOICE_PREPARE_CALL_PATH` for workspace prompt wiring.
- **forge-v2**: no action in 46.0.
- **Vendor sync (agent-x9)**: Plan 03 syncs this version into `vendor/x9-forge-contract-bridge/`;
  consumers do NOT pick up until vendor update committed (VORIG-05).

### Tests

- `tests/capability/voice/origination.test.ts` — 37 tests covering VORIG-01..04:
  - Enum exhaustive (all 7 accepted, unknown/case-variant rejected, order preserved, length=7)
  - Provenance minimal + full round-trip + 500-char summary bound + datetime validation
  - Prepare-call request/response valid + invalid shape + empty-string rejection + optional fields
  - Response bounds `intent_confidence [0,1]` + enum enforcement + provenance array edge cases
  - Brief backward compat (legacy parses unchanged, 4 fields undefined) + 4 new-field accept
  - Brief bounds 2000/500 boundary + over-limit reject
  - Endpoint constant equality (`/call/voice_prepare_call` + `POST`)

---

## [1.5.0] - 2026-04-22 — Bug D1: cap dependency registry

### Added

- **`CapabilityManifestSchema.requires?: string[]`** — optional array of cap names this service depends on at runtime.
- **`CapabilityRegistryEntrySchema.requires?: string[]`** — same field on the registry-entry shape written by X9 generate-registry and Forge deploy.machine.

### Why

Bug D1 (quick-260422-wrz). Today cap-voice can be enabled while cap-calendar is disabled with ZERO error until the first live voice call tries to HTTP-dispatch calendar_today/week/etc. and the LLM hallucinates. `requires` lets agent-core's new `validateDependencies(registry)` fail-fast at boot on config drift.

### Consumer impact

- **Additive only.** Pre-v1.5.0 manifests/entries parse unchanged (`requires: undefined`).
- agent-x9 starts consuming in agent-core `registry.ts` + `validate-dependencies.ts`.
- forge-v2 D2 (storefront bundling + pricing schema) will consume later — OUT OF SCOPE for this release (parked M46).

---

## [1.4.1+blindatura-transcript] - 2026-04-20 — CRITICAL consumer bump required

### Fixed (latent, exposed 2026-04-20)

- **`PostCallPayloadSchema.transcript`** — ElevenLabs changed the post-call webhook shape on some calls so that `data.transcript` arrives as an **array of transcript turns** (structured objects) rather than a plain string. The historical `transcript: z.string().optional()` was too strict — the typed `postCallWebhook()` bridge client would throw `ZodError: expected string, received array`, dropping the whole forward from forge voice-svc → cap-voice and silently breaking the Telegram post-call recap.
- The fix (`z.unknown().optional()` on `transcript` both at the root and under `data.*`) was first landed in bridge commit `189dd850eef2e85a3cedf5972cc6615672e3cc59` ("quick-260419-m2a") on 2026-04-19, verified via golden fixtures + husky pre-commit gate.
- **Consumer status as of 2026-04-20T22:45Z:**
  - `agent-x9` (cap-voice): already consumes post-189dd850 bridge via workspace link + vendor sync — no action needed.
  - `forge-v2` (voice-svc): package.json pin stayed at `00cd9d92` (pre-blindatura) through Phase 45 planning. **Bumped to `1c9c73baddc7db4ab5476270fecec72960ae3058` on 2026-04-20** to unblock the post-call webhook forward.

### Required consumer pin (minimum)

Any repo consuming `PostCallPayloadSchema` MUST pin at or after `189dd850`. Before that SHA the schema rejects array-shaped transcripts and the entire post-call pipeline fails silently (voice-svc returns 200 to ElevenLabs per Pitfall 4, but the cap-voice forward never completes).

| Consumer | Path | Minimum SHA | As of |
|----------|------|-------------|-------|
| agent-x9 | `services/cap-voice/src/webhooks/post-call.ts` + vendor `src/http/endpoints/webhook-post-call.ts` | `189dd850` | ≥1c9c73b (vendored + workspace link) |
| forge-v2 | `services/voice/src/routes/voice.ts` (imports `PostCallPayloadSchema`) | `189dd850` | `1c9c73b` (bumped 2026-04-20) |

### Why this is non-obvious

The 2026-04-19 "quick" session added a 5-layer blindatura (bridge lenient schema + cap-voice normalizer + golden fixtures + husky hook + Claude hook) but the layers only protect the agent-x9 side. forge-v2 has no husky hook and its bridge pin was never atomically bumped per RLSE-02. A future edit to `PostCallPayloadSchema.transcript` that re-tightens the type (e.g. a well-intentioned "make types stricter" refactor) would re-break the same path — the bridge's own husky pre-commit gate (`.husky/pre-commit` running `webhook-post-call` tests) is the backstop.

### How to extend this blindatura

If future breaking changes to this schema are proposed:
1. Run `pnpm test -- webhook-post-call` — it MUST still pass with array-transcript fixtures under `tests/fixtures/elevenlabs-post-call/`.
2. Bump SHA atomically in both `agent-x9/vendor/x9-forge-contract-bridge/` (run `scripts/sync-bridge.sh`) AND `forge-v2/package.json` (`pnpm.overrides.@x9-forge/contracts`) in the same deploy (RLSE-02).
3. Add a new CHANGELOG entry listing all consumers and their new pin. If the change is not additive, bump `[1.5.0]` per SemVer milestone.

---

## [1.4.0] - 2026-04-19

### Added

- `InvalidationReasonSchema` — 10-value enum for memory invalidation tracking (ADR-MEM-GRAPHITI-ALIGNMENT §4.4): `superseded_by_new_fact`, `user_correction`, `admin_correction`, `source_deleted`, `privacy_redaction`, `retention_expired`, `entity_merge`, `entity_split`, `low_confidence_rejected`, `conflict_unresolved`.
- `RecallTemporalModeSchema` — 5 temporal recall modes: `current`, `valid_at`, `known_at`, `valid_between`, `history`.
- `RecallTemporalFilterSchema` — temporal filter contract for recall bundle requests (mode + optional datetime params + include flags).
- `BitemporalFieldsSchema` — bitemporal field contract: `validFrom`/`validTo` (validity time), `recordedAt`/`recordInvalidatedAt` (transaction time), `assertedAt`, `sourceObservedAt`.
- `InvalidationMetadataSchema` — structured invalidation metadata: `reason` (InvalidationReason enum) + optional `sourceId`, `actor`, `note`.
- 45 new unit tests in `tests/memory/invalidation-reason.test.ts` and `tests/memory/temporal.test.ts` covering all new schemas (valid + invalid payloads, edge cases, regression on existing TemporalSemanticsSchema).

### Why

Phase 41 (Memory V2 Graphiti Alignment) requires 4 temporal primitives from ADR-MEM-GRAPHITI-ALIGNMENT. Per R-14, all shared types must land in the bridge BEFORE consumer code. These 5 schemas are consumed by Plans 41-02 through 41-05 in agent-x9.

### Consumer migration (agent-x9)

- `services/memory/src/extraction/pipeline.ts`: `import { InvalidationReasonSchema } from '@x9-forge/contracts/memory'`
- `services/memory/src/routes/internal-recall-bundle.ts`: `import { RecallTemporalFilterSchema } from '@x9-forge/contracts/memory'`
- `services/memory/src/schema.ts`: `import { BitemporalFieldsSchema } from '@x9-forge/contracts/memory'` (reference for column names)

### Notes

- Additive minor bump. No existing contracts modified.
- `TemporalSemanticsSchema` (v1.0) remains untouched — backward compatible.
- `InvalidationReasonSchema` lives in `enums.ts` alongside existing `MemoryStatusSchema` and `MemoryCorrectiveActionSchema`.
- All new temporal schemas live in `temporal.ts` alongside existing `TemporalSemanticsSchema`.

---

## [1.3.0] - 2026-04-18

### Added

- `@x9-forge/contracts/http/endpoints/vault-resolve` — new endpoint contract for `GET /resolve/:agentId/:key` (X9 capabilities → Forge vault-svc, X-Internal-Token auth). Exports:
  - `VaultResolveParamsSchema` / `VaultResolveParams` — path-param schema (numeric `agentId`, non-empty `key`).
  - `VaultResolveResponseSchema` / `VaultResolveResponse` — 200 success body `{ ok: true, key, value, tier }` where `tier` reuses `VaultTierSchema` (platform | owner | agent).
  - `VaultResolveNotFoundResponseSchema` / `VaultResolveNotFoundResponse` — 404 body `{ ok: false, error }` (alias `VaultResolveErrorResponseSchema`).
  - `vaultResolveContract` — `GET /resolve/:agentId/:key`, `authType: 'token'`, paramsSchema + responseSchema.
- Re-exported from `src/http/endpoints/index.ts` so consumers can `import { VaultResolveResponseSchema, vaultResolveContract } from '@x9-forge/contracts/http'` (also reachable via `@x9-forge/contracts/http/endpoints/vault-resolve`).
- 16 new unit tests in `tests/http/endpoints/vault-resolve.test.ts` covering: valid 200 for every tier, missing/wrong tier, missing key/value, `ok: true|false` discriminator guards, non-string `value`, valid 404, missing `error`, alias parity, and contract metadata (method / path / authType / schema wiring).

### Why

Closes R-14 gap identified on 2026-04-17 during Phase 38 Wave 1 review. The agent-x9 `@x9/capability-sdk` VaultClient had shipped with (a) inline `z.enum(["agent","owner","platform"])` (wrong-ordered vs the bridge `['platform','owner','agent']`), (b) a literal `"X-Internal-Token"` header string, and (c) no endpoint contract for `/resolve/:agentId/:key`. This bridge release is the single source of truth; the consumer VaultClient is refactored in the same Phase 38 commit to import from here.

### Consumer migration (agent-x9)

- `packages/capability-sdk/package.json` adds `"@x9-forge/contracts": "link:../../../x9-forge-contract-bridge"` (matches `packages/types`).
- `packages/capability-sdk/src/vault-client.ts`:
  - `import { VaultTierSchema, type VaultTier } from '@x9-forge/contracts/vault'` (replaces local enum).
  - `import { INTERNAL_TOKEN_HEADER } from '@x9-forge/contracts/auth'` (replaces `"X-Internal-Token"` literal).
  - `import { VaultResolveResponseSchema, type VaultResolveResponse } from '@x9-forge/contracts/http'` (replaces the local `z.object({...})` schema).

### Notes

- Additive minor bump. No existing contract is modified.
- `vaultResolveContract` is a token-auth GET contract, so it slots into the existing `createBridgeClient<'token'>` factory without any runtime change.

---

## [1.2.0] - 2026-04-17

### Added

- `@x9-forge/contracts/rag` sub-path (Phase 37.7) — see commit `0774c31` for full list of cap-rag contracts.

### Notes

- No breaking changes. Additive minor bump.

---

## [1.1.0] - 2026-04-16

### Added

- `MemoryCorrectiveActionRequestSchema` + `MemoryCorrectiveActionResponse` — Zod schemas for ADR §20.3 `POST /internal/memory/correct` payload.
- `MemoryActorTypeSchema` (`'forge_user' | 'forge_superadmin' | 'system'`) and `MemoryTargetTypeSchema` (`'episode' | 'fact' | 'rule' | 'entity' | 'alias'`).
- `MemoryConsoleEpisodeSchema`, `MemoryConsoleFactSchema`, `MemoryConsoleRuleSchema`, `MemoryConsoleAliasSchema`, `MemoryConsoleFeedbackSchema` — read-shape schemas for ADR §22 Phase 5 Memory Console.
- `makeListResponseSchema<T>` helper + pre-baked `MemoryConsoleEpisodesResponseSchema`, `MemoryConsoleFactsResponseSchema`, `MemoryConsoleRulesResponseSchema`, `MemoryConsoleAliasesResponseSchema`, `MemoryConsoleFeedbackResponseSchema` for each row type.

### Notes

- Phase 36.6 (Forge governance) consumers: forge-v2 `services/factory` (via `link:`), agent-x9 `services/memory` continues with local Zod (decoupled).
- No breaking changes. Additive minor bump.
- `z.record(z.string(), z.unknown())` used for `beforeSnapshot`/`afterSnapshot` (Zod v4 `z.record()` requires key + value type).

---

## v1.0 — Bridge Foundation

**Shipped:** 2026-04-16 (PR #1, commit `1d709a1`, git tag `v1.0`)

### Added

**Sub-paths (8 total):**
- `@x9-forge/contracts/capability` — `CapabilityManifest`, `CapabilityTool`, `ToolCallRequest/Response`, `CapabilityRegistryEntry` (canonical `{host, port, version, protocol?}` + `toEndpoint`/`fromEndpoint` helpers; **`modelPolicy?` extension** in Phase 6), `EnvSchemaField/Doc`, `HealthStatus`
- `@x9-forge/contracts/agent` — `AgentIdentity` branded, `AgentContextCore` cross-repo, `AgentCredentials` discriminated for 17 known keys + catchall, `parseAgentContext` fail-loud helper
- `@x9-forge/contracts/auth` — `AuthInternalSecret`, `AuthInternalToken` literal discriminated types, header constants
- `@x9-forge/contracts/http` — `createBridgeClient<'secret'|'token'|'none'>` with `AuthForEndpoint<T>` compile-time discrimination, 11 endpoint contracts (HTTP-01..11), SSE frame discriminated schemas + parser (HTTP-05), standardized response envelopes `{ok, data}` / `{ok, code, message, details?}` (HTTP-13/14)
- `@x9-forge/contracts/vault` — `VaultTier`, `VaultSyncState` + `toSyncState`, `VaultEntryPlain` ≠ `VaultEntryEncrypted` (T-05-01 wire-format-leak guard), `SyncAll*`, `WorkspaceFile`, `PlatformBootstrapEnv` (type-only), `AgentVaultedCredentials`
- `@x9-forge/contracts/model-router` — `ModelTier` ordered enum + `compareTiers`, `ModelTierMapping`, `ModelPolicy` (`min ≤ max` invariant), `PerAgentModelOverride` (branded `AgentIdentity` reuse), `ModelPushRequest/Response`, `ModelHotReloadNotification`, `pushModelConfigContract`
- `@x9-forge/contracts/memory` — Memory Engine v2 anticipated contracts: 4 enum schemas (`MemoryScope`, `MemoryType`, `MemoryStatus`, `MemoryCorrectiveAction`) + 5 envelope schemas (`TemporalSemantics`, `MemoryIdentityEnvelope`, `MemoryWriteCandidate`, `RecallBundle`, `RetentionPolicyMetadata`)
- Root `@x9-forge/contracts` — re-exports model-router only (intentional — README guides consumers to sub-paths)

### Changed

- **Bug #15 (post-call webhook 401 silent) closed at compile time** — `createBridgeClient<'secret'|'token'|'none'>` rejects mis-auth construction at TypeScript compile via `AuthForEndpoint<T>` mapping
- **Cross-repo drift guards operational** in agent-x9 + forge-v2 (contract tests catch bridge schema drift)

### Migration notes for consumers

- Consumer `package.json`: pin via `git+https://github.com/App-Templates/x9-forge-contract.git#1d709a1` (or later v1.0 tag/SHA)
- Sub-path imports preferred (`@x9-forge/contracts/<domain>`); root import only re-exports model-router
- Forge prerequisite: zod@4 + TypeScript 6.0.2 + `exactOptionalPropertyTypes: true` (Phase 0)
- agent-x9 already on bridge-compatible baseline since pre-v1.0

### Known v1.0 trade-offs (documented, not bugs)

- Legacy endpoint success responses (`InternalQueryResponseSchema`, `ListAgentsResponseSchema`, etc.) keep domain-specific shapes rather than uniform `{ok, data}` envelope. Standardized envelope IS wired into the error path (`BridgeHttpError` parses `BridgeErrorResponseSchema`). Standardization across success shapes is tracked for the next breaking SHA bump.
- `web/` workspace stuck on zod@3 (R-07 — MCP SDK upstream peer-dep chain). Web does NOT consume the bridge.
- Cosmetic: `HealthStatus` enum uses `'down'` value; original REQUIREMENTS.md said `'unhealthy'` — code is canonical (CAPA-06).

### Operator-deferred items (carried forward)

- 04-03-09: X9 staging deploy
- 04-04-09: Forge staging fixture capture
- 04-04-10: Forge e2e staging smoke (briefing + voice + webhook + internal/turn streaming)
- 05-03 vault sync-all live smoke (POST /api/vault/sync-all)
- MDRT-07 SC#7: agent-x9 Phase 35 ROADMAP cross-repo cite (operator action in agent-x9 repo)
- agent-x9 vendor re-sync via `scripts/sync-bridge.sh` on `fix/docker-bridge-build-context` branch

---

## v1.1 (planned)

**Scope:** Shim Removal + Final Consolidation + Bookkeeping cleanup

### Will add

- ESLint `no-restricted-imports` rule in agent-x9 + forge-v2 (MGRT-06)
- CODEOWNERS in 2 consumers for paths importing the bridge (OBS-05)
- JSDoc on every public export (OBS-04)
- (Optional) Standardize legacy endpoint success responses to `{ok, data}` envelope at next breaking SHA bump

### Will remove (breaking — atomic SHA bump in both consumers)

- `agent-x9/packages/types/capability.ts` compat shim
- `forge-v2/packages/types/src/x9.ts` compat shim
