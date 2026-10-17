# Programma iniziale Coach: PUT e applicazione da Forge

**COMPLETO** — il bridge dispone dei contratti per scrivere e applicare un programma iniziale con scope tenant/owner/agent. Nessuna estensione bridge necessaria per questo perimetro. La disponibilità dei contratti non prova il montaggio delle rotte o il funzionamento di Forge/X9.

Ricognizione statica del 15/10/2026, punto 7 del piano RILASCIO-MEDITATION-1010. Consultati `STATO.md`, `01-CONFIG.md` e i sorgenti correnti; nessun altro repository consultato. Accettazione e controllo tipi spettano allo script; nessun test o controllo dal vivo eseguito.

## Schemi pubblici da riusare

- `CoachProgramSchema` (`src/capability/coach/index.ts:42`), tipo `CoachProgram`: `{ scope, programId, kind, title, locale, version, steps }`, oggetto strict. `kind` è uno slug aperto e ammette `meditation`; versione intera positiva (`src/capability/ricerca/agent-config.ts:20`). Da 1 a 500 passi, con `stepId` e `order` unici. `CoachStepSchema` (`index.ts:32`) richiede identificatore, ordine non negativo e titolo; durata, tecnica e istruzioni sono facoltative.
- `CoachAgentScopeSchema` (`index.ts:19`) riusa `CapabilityAgentScopeSchema` (`src/capability/capability-call-context.ts:22`): tenantId, ownerId e agentId obbligatori, nessun userId. Il programma appartiene all'agente; profilo, sessioni e avanzamento della persona hanno uno scope distinto. L'identità deve provenire dall'autenticazione e dal contesto validato, come documentato in `capability-call-context.ts:12`.
- `CoachStrategyRefSchema` (`src/capability/coach/program-version.ts:5`): `{ strategyId, strategyVersion }`. `CoachProgramVersionRefSchema` (`:9`): `{ scope, programId, programVersion, strategy, catalogRevision, policyRevision, progressionRevision, measureDefinitionRevision }`. Le revisioni testuali sono obbligatorie: Forge deve riceverle da una fonte autorevole, non inventarle.
- `CoachProgramApplyRequestSchema` (`src/capability/coach/operational/program.ts:9`), tipo `CoachProgramApplyRequest`: `{ requestId, program: CoachProgramVersionRef, definition: CoachProgram, expectedProgramVersion: number | null }`. `matchesProgram` (`:6`) impone uguaglianza dello scope completo, dell'ID e della versione fra riferimento e definizione.
- `CoachProgramApplyResultSchema` (`:13`), tipo `CoachProgramApplyResult`: `{ ok: true, requestId, replayed: boolean, program, definition }`, con lo stesso vincolo di coerenza. `isCoachProgramApplyResultForRequest(raw: unknown, expected: unknown): boolean` (`:17`) verifica parsing, requestId e uguaglianza completa del riferimento e della definizione rispetto alla richiesta.

Importare questi schemi/tipi da `@x9-forge/contracts/capability`: export in `src/capability/index.ts:91`, `:123`, `:132`, tramite `coach/operational/index.ts:2`. Non occorre un nuovo sotto-percorso Coach.

## Endpoint già disponibili

| Uso | Contratto e percorso | Richiesta e risposta |
| --- | --- | --- |
| Salvataggio del programma | `coachProgramPutContract`, PUT `/internal/capability/agents/:agentId/coach/programs/:programId` (`src/http/endpoints/internal-capability-coach.ts:28`) | `CoachProgramSchema` → `AgentConfigSavedSchema`, cioè `{ ok: true, version }` (`internal-capability-agent.ts:35`). Versione uguale o precedente: 409 `stale_version`, documentato in `internal-capability-coach.ts:17`. |
| Lettura del programma | `coachProgramGetContract`, GET dello stesso percorso (`:37`) | Nessun corpo; risposta `CoachProgramSchema`. |
| Applicazione della revisione | `coachProgramApplyContract`, PUT `/internal/capability/agents/:agentId/coach/v2/programs/:programId/revisions/:programVersion` (`src/http/endpoints/coach-operational-write.ts:11`, prefisso in `coach-operational-common.ts:8`) | `CoachProgramApplyRequestSchema` → `CoachProgramApplyResultSchema`. La definizione completa è già nel corpo: il contratto non impone un precedente PUT legacy. |
| Rilettura della revisione | `coachProgramVersionReadContract`, POST `/internal/capability/agents/:agentId/coach/v2/programs/read` (`src/http/endpoints/coach-operational-read.ts:49`) | `{ program: CoachProgramVersionRef }` → `{ ok: true, program, definition, measureDefinitions }`; schemi a `:13` e `:15`, con coerenza definizione/riferimento e unicità delle definizioni di misura. |

Tutte queste rotte dichiarano `authType: 'secret'`. Riutilizzare `INTERNAL_SECRET_HEADER` da `@x9-forge/contracts/auth` (alias operativo `COACH_OPERATIONAL_AUTH_HEADER`, `coach-operational-common.ts:9`); chiamate dal backend, senza esporre il segreto al browser.

Da `@x9-forge/contracts/http` sono esportati contratti e costruttori: `capCoachProgramPath(agentId: string, programId: string): string` (`internal-capability-coach.ts:62`), `capCoachOperationalProgramRevisionPath(agentId: string, programId: string, programVersion: number): string` (`coach-operational-write.ts:19`), `capCoachProgramVersionReadPath(agentId: string): string` (`coach-operational-read.ts:53`). Export tramite `src/http/endpoints/index.ts:27` e `src/http/index.ts:40`, `:71`, `:72`, `:73`. Usare questi export e il client bridge, senza duplicare URL o header.

## Sequenza e responsabilità del consumer

1. Ottenere lo scope autorizzato e il contenuto iniziale Meditation dal progetto; validare la definizione con `CoachProgramSchema`. Il bridge definisce il formato generico, non il template iniziale Meditation (`src/capability/coach/index.ts:12`).
2. Per il semplice salvataggio usare PUT legacy e poi GET. Per applicare una revisione operativa usare direttamente apply con definizione e riferimento completo, requestId stabile e versione attesa. Lo schema ammette `expectedProgramVersion: null` per la richiesta iniziale, ma non implementa né documenta da solo il confronto atomico con lo stato persistito: verificare la semantica di prima creazione nel servizio.
3. Il servizio deve confrontare tenant/owner/agent con l'identità autorizzata. `isCoachProgramForRevisionRoute(raw: unknown, rawParams: unknown): boolean` (`coach-operational-common.ts:30`) lega agente, ID programma e versione al percorso; non autentica tenant e owner. I parser separati di corpo e parametri non invocano automaticamente questo controllo.
4. Validare la ricevuta apply con `isCoachProgramApplyResultForRequest` e rileggere la revisione. Confrontare il riferimento restituito con quello richiesto: il solo schema di rilettura verifica la coerenza interna, non il legame con una richiesta esterna. `replayed` permette di rappresentare una ripetizione, ma idempotenza e persistenza dipendono dall'handler; il PUT legacy documenta invece il rifiuto della versione uguale.
5. Conservare gli errori operativi specifici: `scope_mismatch` 403, `strategy_unavailable` 422, `stale_program_version` e `idempotency_conflict` 409, `program_not_found` 404 (`coach-operational-common.ts:15`). `CoachOperationalErrorSchema` (`:20`) richiede `currentProgramVersion` soltanto per `stale_program_version`; non prevede un campo libero `message`.

## Passaggio al compito successivo

Nessun contratto mancante per trasportare definizione e applicazione con scope completo. Restano da verificare nei compiti consumer: origine del template e delle revisioni autorevoli, disponibilità della strategia, montaggio/instradamento delle rotte, autorizzazione, confronto atomico della versione, replay e rilettura. Non dedurre dal contratto che questi comportamenti siano già implementati.

Test esistenti consultati, non eseguiti: `tests/capability/coach-operational-program.test.ts:4` e `:10` coprono parsing, correlazione e incoerenze; `tests/http/endpoints/coach-operational-write.test.ts:6`, `:13`, `:23` coprono contratti, legame al percorso ed errori. Sono verifiche del bridge, non una prova end-to-end Forge → X9 → Coach.
