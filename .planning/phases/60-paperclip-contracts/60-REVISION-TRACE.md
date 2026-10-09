# Phase60 — revisione dopo ritiro approvazione

2026-10-09. Decisione coor173852, testo letterale fornito dall'orchestratore. Approvazione172248 RITIRATA; nuova review e nuova approvazione obbligatorie. Questa traccia non è un verdict checker né prova prodotto.

## Decisione letterale

> Risposta a 20261009-173031-codex-e-a-coordinatrice-risposta: Piano Chiavi ricevuto, review a C. Ritiro l'approvazione del piano 60, errore mio: 60-03 fa chiedere ad agent-core a Factory/Vault la chiave a ogni chiamata, con una rotta nuova internal-capability-context. È il flusso che Stefano ha respinto l'08/10 (R-35): «Stai cambiando completamente come funziona lo stack e non è il tuo compito». Rifai 60-03 e 60-04 sul flusso esistente: le credenziali arrivano nel contesto dell'agente al caricamento, sincronizzate da Forge, e la cap le riceve nel contesto di chiamata che c'è già. Nessuna rotta nuova, nessuna risoluzione per chiamata. Se pensi che il flusso esistente non basti, scrivilo motivato e lo porto a Stefano. Esistente: agent-x9/services/agent-core/src/index.ts:87 legge le credenziali dal contesto nell'adattatore. Cambia lo stack: no: si torna al flusso esistente.

## Fonti riscontrate, sola lettura

| Fonte congelata | Riscontro |
|---|---|
| Forge568d4924 services/factory/src/services/agent-context.writer.ts:65–69,99–120,146 | Unico writer; bag sostituito dal resolved, non merge. Rimozione elimina key dal nuovo ctx. |
| Forge568d4924 agent-context.writer.ts:161–190 | Authority tenant/runtime/management/Vault server-side, no browser o parse slug. |
| Forge568d4924 packages/types/src/redesign/keys.ts:233–242 | ResolvedCredential ha già tier. Paperclip può richiedere tier agent durante sync senza nuovo endpoint. |
| Forge568d4924 services/factory/src/services/vault-internal.client.ts:121–132 | Resolved esistente controlla agentId risposta. |
| Forge568d4924 services/factory/src/services/apply.service.ts:236–310,321–367 | Keys→write→tools→reload→check; dispatch non è un nuovo momento di risoluzione. |
| X9 E168 f3164d8 services/agent-core/src/index.ts:58–81,230 | Adattatore legge ctx.credentials e router per agente. Riga87 nel mandato è riferimento storico; blocco nello SHA consultato58–81. |
| X9 E168 f3164d8 services/agent-core/src/core/agent-manager.ts:66–82 | Schema ctx validato load/reload, attesa turni in-flight. |
| X9 E168 f3164d8 services/agent-core/src/core/tool-router.ts:308–330,464–478 | Envelope esistente con scope senza credentials attuali: solo proiezione minima mancante. |
| X9 E168 f3164d8 services/agent-core/src/routes/internal-agent-turn.ts:112; index.ts:366,741,1033 | Cache/ingressi per agente e primary/fallback da coprire; env legacy non è trust Paperclip. |
| X9 E168 f3164d8 services/agent-core/src/registry/registry.ts:29–36,66–90 | Registry canonico per servizio/tools/enabled, no catalogo parallelo. |
| Bridge854f36a8 src/capability/tool-call.ts:26 | credentials z.record già opzionale nel ToolCallRequest, non aggiungerlo come DTO nuovo. |
| Bridge854f36a8 src/capability/capability-call-context.ts:51–133; src/http/endpoints/capability-call-context.ts:9–24 | Contratto esistente non dimostra producer né impone implementazione/uso HTTP E5. |

Resolved wire attuale contiene tier, non versione per-key. Non inventare versioni Vault o freshness per chiamata: si attesta ctx/config caricato e readback installato. Key Paperclip tier agent selezionata durante sync, altre chiavi mantengono modello esistente. Nessun file runtime con credenziali, .env o segreto effettivo letto.

## Superfici escluse e percorso ammesso

Esclusi: internal-capability-context.ts/snapshot Factory nuovo; capability-call-context.service/routes Vault; capability-call-context-client SDK; fetch Factory/Vault al dispatch; secondo resolver/cascade/counter; timer, refresh per-tool, nuovo canale invalidazione. Nessuna nuova UI/catalogo/installer parallelo, modifica LLM/Modelli o E3/E4. Contratto storico POST /resolve/capability-context non cancellato o riscritto: semplicemente fuori dall'implementazione E5.

Dopo nuova approvazione/perimetri: resolved Forge→writer ctx→reload standard; ctx proprio core→envelope call.credentials sola PAPERCLIP_API_KEY; bridge solo estensioni indispensabili config CAS/install/readback/configVersion/run effimero; install nel reload/attestation esatta; scope/identity/native /me e run reale. Primary/botless/internal-turn seguono medesimo modello: se manca ctx trusted Paperclip rifiuta, nessun env/Master fallback.

## Limiti rotazione/revoca

Sync/reload riuscito rende key nuova o assente effettiva nel core; file scritto/save desired/health non bastano. Prima può restare vecchio ctx, nessun claim revoca immediata. Revoca nativa può rifiutare key caricata, con prova distinta e no fallback401/403. Fonte down durante sync/reload refused rimangono failed/pending. Invalidazione immediata pre-reload non riscontrata richiede decisione Stefano via coordinatrice, non progetto nuovo canale.

## Hash storici ritirati

Partenza planner535256e8; piano inizialec60a5bd9 e approvazione172248 ritirata. SHA256 sotto descrivono set precedente, non revisione attuale. Il precedente60-PLAN-REVIEW.md è conservato in git535256e8; PLANNING-STRUCTURE.json resta prova storica. Il report corrente60-PLAN-REVIEW.md riguarda esclusivamente i nuovi hash revisionati.

| Piano precedente | SHA256 storico |
|---|---|
| 60-01-PLAN.md | d2b8f6767477e57027fffaabba2957e0f577c568b4eaeda88a63a133e7df063d |
| 60-02-PLAN.md | 8045317ba6eb924a7854bbb07af6304664353018454214d9e201aa16abcf4750 |
| 60-03-PLAN.md | ec32bd408534268b89ec0b15e4fcc36fe9148c439f29068d7911c9c631e10c8d |
| 60-04-PLAN.md | c0750df4085e1e88e5b94ec49ec54f0eee1c5194da8c4ad72d41811df0813c49 |
| 60-05-PLAN.md | 744db340e02a746f4801e91bbccbc12e5f45971fd6f6fc01ba2cbf337d03a55f |
| 60-06-PLAN.md | 75f3eb02ae37d42db077c41aac33023bbe727eaae72261328277e87feaa14906 |

## Copertura decisioni e gate

| Decisione | Piani | Copertura |
|---|---|---|
| D-01/D-02 riuso catalogo/UI/Chiavi/Applica | 02–06 | Full, no superfici UI nuove |
| D-03 perimetro/approvazione prima codice | tutti | Full, ritiro approvazione e ownergates conservati |
| D-04 contratti canonici | 01–05 | Full, solo estensioni indispensabili senza DTO locali |
| D-05 scope trusted | 01–06 | Full, ctx proprio e due agenti |
| D-06 corretto da coor173852 | 01–04,06 | Full, key caricata minima/run separato, timing sync/reload |
| D-07 CAS/desired/applied/readback | 01–06 | Full, attestation/router/cache coerenti |
| D-08 provisioning/ruoli/run | 01,02,04,06 | Full, gate fonte/design separato da implementazione |

6piani/5wave/15task (14auto+1livecheckpoint).03/05 condividono writer/Applica ma wave2/wave4 dipendenti, nessuna collisione parallela. Nuovi controlli prodotto futuri TDD+guasti causali; zero test prodotto eseguiti ora. Nuovo checker ha congelato i nuovi hash e dato VERIFICATION PASSED in60-PLAN-REVIEW.md, senza autorizzare esecuzione. C APPROVE documentale Chiavi non approva né esegue E5. Nessun commit planner, nessuna modifica STATE/config/harness/prodotto.
