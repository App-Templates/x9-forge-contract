# Configurazione Coach / ElevenLabs: ricognizione bridge

Ricognizione statica del 15/10/2026, package 1.49.0. Ambito: contratti per la configurazione canonica per agente, punto 3 del percorso utente indicato nel compito. Consultato `STATO.md:1`; il suo riepilogo 1.29 è precedente ai sorgenti correnti. Nessuna verifica dei consumer o dal vivo; accettazione e tipi spettano allo script.

## Subpath pubblici e catena degli export

| Import pubblico | Evidenza |
| --- | --- |
| `@x9-forge/contracts/capability` | `package.json:53` (exports), `package.json:17` (sorgente). Configurazione ordinaria riesportata da `src/capability/index.ts:74`, ElevenLabs da `:88`, Coach da `:91`; versioni/esecuzione/misure/contabilità/budget Coach da `:123`, `:124`, `:126`, `:127`, `:128`; operazioni Coach da `:132`; configurazione nativa e readback ElevenLabs da `:139`, `:140`. |
| `@x9-forge/contracts/http` | `package.json:93`, sorgente `package.json:25`; `src/http/index.ts:40` → `src/http/endpoints/index.ts:25` (configurazione agente), `:26` (ElevenLabs), `:27` (Coach). Operazioni Coach e canale nativo anche da `src/http/index.ts:71`, `:72`, `:73`, `:75`. |
| `@x9-forge/contracts/capability/ricerca` | `package.json:83`; schemi da `src/capability/ricerca/index.ts:12`, spesa da `:48`. |
| `@x9-forge/contracts/capability/lab` | `package.json:88`; configurazione da `src/capability/lab/index.ts:12`. |

Non esistono subpath pubblici dedicati `capability/coach` o `capability/agent-elevenlabs`: usare `/capability`, non importare direttamente i file sorgente. I percorsi HTTP riportati sotto descrivono i contratti: i consumer devono importare contratti e costruttori di percorso.

## Configurazione canonica comune ai due servizi

- `CapabilityOrdinaryConfigurationSchema` (`src/capability/ordinary-configuration.ts:47`): formato `ordinary-v2`, scope, capacità, versione e parametri. `CapabilityOrdinaryConfigWriteSchema` (`:69`) aggiunge `requestId`, `expectedVersion` nullable e `configuration`.
- `CapabilityOrdinaryStructuredCodecs` (`:13`) include `agent-elevenlabs.nativeConfig`, con `ElevenLabsNativeConfigSchema`; `CapabilityOrdinaryDefinitionSchema` (`:19`) ammette definizioni ordinarie e strutturate. Coach può usare i parametri ordinari dichiarati dal consumer; il programma ha un contratto dedicato, non richiede un duplicato nel registro dei codec.
- `parseCapabilityOrdinaryWrite` (`:78`) controlla destinazione, dichiarazioni e versione attesa: la nuova versione deve essere quella corrente più uno (`:81`–`:84`). `CapabilityOrdinaryConfigStateSchema` (`:120`) distingue desiderato, applicato, errore e parametri effettivi; `CapabilityOrdinaryCallSnapshotSchema` (`:154`) e `parseCapabilityOrdinaryCall` (`:163`) vincolano lo snapshot alla revisione autorevole.
- `ordinaryCapabilityAgentConfigPutContract` e `ordinaryCapabilityAgentConfigGetContract` (`src/http/endpoints/internal-capability-agent.ts:167`, `:168`): PUT/GET `/internal/capability/agents/:agentId/config`, autenticazione `secret`, risposta `CapabilityOrdinaryConfigStateSchema`. PUT riceve `CapabilityOrdinaryConfigWriteSchema`; GET riceve `CapabilityOrdinaryConfigQuerySchema` (`:151`: tenant, owner, agent, capacità e formato).
- Riutilizzare `capAgentConfigPath(agentId: string)` (`:31`) e i parser GET/PUT (`:152`, `:157`), che verificano identità e corrispondenza con il percorso. `selectCapabilityAgentConfigFormat` (`:136`) separa legacy e formato ordinario, rifiutando formati sconosciuti. `ordinaryCapabilityLifecyclePutContract` (`:169`) riusa PUT config con richiesta/ricevuta del ciclo di vita.

## cap-coach: programmi e configurazione operativa

| Schemi già pubblici in `/capability` | Endpoint già pubblici in `/http` |
| --- | --- |
| `CoachAgentScopeSchema`, `CoachPersonScopeSchema` (`src/capability/coach/index.ts:19`, `:20`); `CoachStepSchema` (`:32`), `CoachProgramSchema` (`:42`): scope per agente, ID, kind aperto che ammette meditation, titolo, lingua, versione e passi. | `coachProgramPutContract` / `coachProgramGetContract` (`src/http/endpoints/internal-capability-coach.ts:28`, `:37`): PUT/GET `/internal/capability/agents/:agentId/coach/programs/:programId`. PUT corpo programma → `AgentConfigSavedSchema`; GET → programma. Versione precedente o uguale: 409 documentato a `:17`. Costruttore `capCoachProgramPath(agentId, programId)` a `:62`. |
| `CoachProgramVersionRefSchema` (`src/capability/coach/program-version.ts:9`); `CoachProgramApplyRequestSchema` / `CoachProgramApplyResultSchema` (`src/capability/coach/operational/program.ts:9`, `:13`): definizione, riferimento versionato, versione attesa, requestId e indicazione replay. Export tramite `src/capability/coach/operational/index.ts:2`. | `coachProgramApplyContract` (`src/http/endpoints/coach-operational-write.ts:11`): PUT `/internal/capability/agents/:agentId/coach/v2/programs/:programId/revisions/:programVersion`; costruttore a `:19`. `coachProgramVersionReadContract` (`src/http/endpoints/coach-operational-read.ts:49`): POST `.../coach/v2/programs/read`, con richiesta/risposta a `:13`, `:15`. Prefisso in `coach-operational-common.ts:8`. |
| `CoachPersonProfileSchema`, `CoachMinuteBudgetSchema`, `CoachPersonSnapshotSchema` (`src/capability/coach/index.ts:63`, `:148`, `:165`); `CoachRollingBudgetSchema`, `CoachSessionQuotaSchema` (`src/capability/coach/rolling-budget.ts:4`, `:9`); `CoachSessionAccountingSchema` (`src/capability/coach/accounting.ts:26`). | `coachPersonSnapshotContract` (`src/http/endpoints/internal-capability-coach.ts:54`): GET `.../coach/people/:userId`. `coachOperationalBudgetReadContract` (`src/http/endpoints/coach-operational-read.ts:52`): POST `.../coach/v2/budget/read`. Sono letture di stato/budget, non PUT della configurazione canonica. |

## cap-agent-elevenlabs: configurazione e applicazione

- `ElevenLabsAgentConfigSchema` (`src/capability/agent-elevenlabs/index.ts:38`) descrive nome, voce, modelli, lingua, primo messaggio, versione prompt e strumenti. `ElevenLabsProvisionRequestSchema` (`:57`) aggiunge scope, requestId, configVersion, stato desiderato ed eventuale adozione.
- `elevenLabsProvisionContract` / `elevenLabsStatusContract` (`src/http/endpoints/internal-capability-elevenlabs.ts:21`, `:30`): PUT/GET `/internal/capability/agents/:agentId/elevenlabs`; richiesta di provisioning → `ElevenLabsProvisionResultSchema`, GET → `ElevenLabsChannelStatusSchema`. Costruttore `capElevenLabsAgentPath(agentId: string)` a `:38`. Il GET legge mapping/stato, non sostituisce GET config ordinaria.
- `ElevenLabsNativeConfigSchema` (`src/capability/agent-elevenlabs/native-config-values.ts:9`, riesportato da `native-config.ts:7`): agent/prompt con modelli e strumenti, TTS, turni, conversazione e restrizioni origine; contenuto del prompt e credenziali restano fuori dal descrittore.
- `ElevenLabsNativeDesiredConfigSchema` (`src/capability/agent-elevenlabs/native-config.ts:8`) lega scope, configVersion, hash del prompt, fingerprint e configurazione; `ElevenLabsNativeCommandReceiptSchema` (`:13`) attesta ricezione del comando, non applicazione presso il provider. `ElevenLabsNativeConfigReadbackSchema` (`src/capability/agent-elevenlabs/native-readback.ts:11`) descrive la rilettura.
- `nativeApplyContract` / `nativeReadbackContract` (`src/http/endpoints/native-channel.ts:70`, `:72`): POST `/internal/capability/agents/:agentId/elevenlabs/native/apply` e `/readback`; apply riceve requestId, expectedConfigVersion nullable e desired, readback requestId e binding. Risposte: ricevuta comando e readback. `nativePromptBundleContract` (`:69`) risolve il prompt separatamente. Prefisso/metodo/autenticazione a `:25`, `:26`; costruttore `capElevenLabsNativePath(agentId: string)` a `:42`.

## Confronto con ricerca/lab

`ResearchAgentConfigSchema` (`src/capability/ricerca/agent-config.ts:73`) contiene agentId, version, objective, budget, models, research, sourceRule; `LabAgentConfigSchema` (`src/capability/lab/agent-config.ts:28`) contiene agentId, version, models, budget, domain, conventions, pageKinds e linkKinds.

In `src/http/endpoints/internal-capability-agent.ts`, `ricercaAgentConfigPutContract` / `ricercaAgentConfigGetContract` (`:48`, `:56`) e `labAgentConfigPutContract` / `labAgentConfigGetContract` (`:65`, `:73`) condividono PUT/GET config e autenticazione secret, ma usano corpi/risposte specifici. Il servizio destinazione è scelto dalla baseUrl (`:15`); PUT restituisce `AgentConfigSavedSchema` (`:35`), con errore `AgentConfigStaleSchema` (`:36`) per versione non crescente.

`ricercaAgentSpendContract` (`:95`) e `labAgentSpendContract` (`:105`) condividono GET `/internal/capability/agents/:agentId/spend`, `AgentSpendQuerySchema` (`:84`) e `AgentSpendResponseSchema` (`:90`: giorni e queuedNow); usare `capAgentSpendPath(agentId: string)` (`:32`). Questo riepilogo monetario non equivale al budget minuti/persona Coach. Non occorre inventare endpoint spend Coach/ElevenLabs per configurare Meditation: GET/PUT canonici sono già generici e i contratti di dominio sono separati.

## Esito

**COMPLETO** — per il perimetro dei contratti bridge di configurazione per agente: schemi, GET/PUT canonici, programmi Coach e applicazione/rilettura nativa ElevenLabs sono già esportati. Patch bridge necessarie: **0/5 file**. Nessuna interfaccia modificata.

Il compito successivo deve verificare nei rispettivi repository che Forge usi questi import e che i servizi montino GET/PUT con il formato ordinario e le dichiarazioni autorevoli. Un eventuale 405 richiede verifica degli handler e dell'instradamento: questa ricognizione non prova il funzionamento del pannello né identifica la causa del 405.
