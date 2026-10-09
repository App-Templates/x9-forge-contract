# Phase 60: cap-paperclip da Forge — ricerca E5

Data: 2026-10-09. Ambito: piano soltanto. Confidenza alta sul codice congelato, media sulla composizione futura; nessuna prova di prodotto eseguita da questa ricerca.

## User Constraints (from 60-CONTEXT.md)

### Confine e decisioni bloccate
- D-01: qualunque agente Forge può abilitare paperclip dal pannello Capacità esistente, identità/chiave/ruolo da Vault e contesto autorevole. Nessun nome, indirizzo, UUID, ruolo o agente preferito nel codice.
- D-02: riusare discovery, selectedCapabilities, registro desired, Applica, diagnostica Chiavi e moduli E3/E4. Niente nuovo catalogo, schermata, framework, provider email o installer parallelo.
- D-03: solo piano in .planning nel worktree168-1; niente codice Forge prima di approvazione, niente push/deploy/VPS. Una fase futura per repo in worktree proprio, owner e perimetro assegnati prima di eseguire.
- D-04: contratti wire solo @x9-forge/contracts. Bridge/runtime cap di D, Forge/agent-core da assegnare dopo approvazione. Nessun DTO/header/endpoint copiato localmente. Modelli resta parcheggiato.
- D-05: identità tenant/owner/runtimeAgentId/managementAgentId/vaultAgentId trusted e distinta; nessuna conversione arbitraria slug→ID numerico, nessun campo tool/browser concede identità o ruolo.
- D-06: chiave nativa propria per agente consegnata da Forge in AgentContext.credentials durante sync e caricamento/reload; al dispatch proiettare solo PAPERCLIP_API_KEY nell’envelope esistente, senza risoluzione remota per-call o fallback process.env/Master. Revisione caricata/readback non attesta freshness Vault pre-reload. Verifica /agents/me coerente companyId/paperclipAgentId. Il runId deve essere un run Paperclip reale del chiamante, effimero e trusted, mai una chiave persistita o UUID inventato.
- D-07: desired/enabled non equivale a installed/effective. Configurazione versionata CAS e readback, Apply standard, errori/assenze unknown o non pronto. Disabilitazione applicata e revoca sincronizzata bloccano dopo reload riuscito; prima non dichiarare efficacia immediata senza attestazione nativa/provider. Nessuna ricreazione cap dedicata al singolo agente.
- D-08: ruolo/unità validati su inventario autorevole; roleAgents indica destinatari di assegnazione, non ruolo del chiamante. paperclipAgentId/companyId da provisioning verificato, non input libero che concede diritti. Assente provisioning/inventario/run autorevole blocca il gate funzionale; non costruire un altro orchestratore.

### Discrezione tecnica
Ordine dei lotti, suddivisione documentale, store durabile CAS, adattatori generici minimi. Proposta: configurazione ordinaria unitId e roleRef; identità nativa e mappa ruoli risolte server-side. Dichiarare esplicitamente quali contratti sono proposti e quali rilasciati. Nessun nuovo spend endpoint Paperclip: adattatore separa spend opzionale dalla configurazione.

### Project Constraints
[VERIFIED: mandato e 60-CONTEXT.md] Piano nel solo worktree E; codice futuro in worktree e branch per task. Niente deploy, SSH, compose su ambienti condivisi, push/merge senza OK. Niente lettura di .env, segreti, chiavi effettive o ~/.claude. Contratti condivisi importati dal bridge. Ogni nuovo controllo richiede prova causale rossa e ripristino verde con denominatore. Comunicazione alla coordinatrice solo tramite posta.py; nessuna modifica alla bacheca.

## Sintesi e raccomandazione

[VERIFIED: Forge568d x9.client.ts:225–247; capabilities.service.ts:223–256; CapabilityEditor.tsx:126–172; deploy.machine.ts:606–680] Il catalogo, aggiunta/toggle per agente, selectedCapabilities alla nascita, registro dai manifest e Applica esistono già. Il manifest D5 dichiara quattro tool e il nome canonico `paperclip`; il servizio si chiama `cap-paperclip` e ascolta su3225. Non costruire nuovi cataloghi o percorsi UI. Registrare il servizio nella allowlist esistente è una dipendenza di configurazione del runtime D7, da qualificare separatamente.

[VERIFIED: Forge568d capability-agent-contracts.ts:8–15; D167 app.ts:16–87; bridge854 tools.ts:24–26] Il pezzo mancante comprende configurazione ordinaria per agente con contratto canonico, binding autorevole versionato/applicato, raccordo writer/ctx caricato e proiezione minima nell’envelope agent-core. L'app D5 riceve una lista di binding all'avvio e un callback credenziali; non espone GET/PUT config. Il binding rilasciato non possiede il ruolo del chiamante: `roleAgents` rappresenta i destinatari dell'assegnazione.

[CORREZIONE VINCOLANTE: coor173852] Producer CapabilityCallContext assente non è un gap da colmare. Lo schema esistente non autorizza nuovo flusso. E5 completa solo proiezione PAPERCLIP_API_KEY dal ctx caricato nell’envelope, scope/revisione/install/run canonici e reload/cache coerenti. Nuova review richiesta; conclusioni producer/consumer per-call ritirate.

## Baseline e fonti

| Sigla | Checkout di lettura | SHA congelato |
|---|---|---|
| Forge568d | /Users/admintemp/Downloads/Claude/forge-v2-integra-chiavi | 568d4924e7456229bfe4d5c50dc655bdc3e277c8 |
| D167 | /Users/admintemp/Downloads/Claude/agent-x9-codex-167-1 | d22fe0736f57e548252bcddb7acf29da9eff74f3 |
| bridge854 | /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-169-1 | 854f36a8f88280bad6c5b19249e8ababeee5bb44 |
| E168 | /Users/admintemp/Downloads/Claude/agent-x9-codex-168-1 | f3164d8d1729f2a001558e4415be6c4ec1735408 |

[VERIFIED: git show congelato D167 e osservazione worktree] runtime.ts/index.ts/compose D7 sono lavoro in corso al momento della ricerca, non una release approvata. I riferimenti D5 app/manifest/native-client sono stati riscontrati sul congelato. Questa fase non sostituisce D7 e non modifica E3/E4.

[VERIFIED: posta D165419, comunicata dall'orchestratore] D conferma D6 d22fe073 immutabile e D7 ancora WIP, con obiettivo freeze entro17:23. D7 prevede file operatore non segreto di binding canonici (massimo1000), endpoint nativo `http://aa-paperclip-api:3100/api`, key/run soltanto da call.credentials per invocazione; produttore/provisioning non implementati e nessuna modifica Forge/core. Questi dati sono una dichiarazione di dipendenza, non prova finale né autorizzazione a hardcodare endpoint o binding nella UI. Esigere consegna SHA e qualificazione prima di integrare.

## Standard Stack

[VERIFIED: package.json nei checkout] Riutilizzare TypeScript, Fastify, Zod, bridge e infrastruttura di test esistenti. Forge factory/vault dichiarano Fastify ^5.8.4, Zod ^4.0.0, TypeScript ^6.0.2, Vitest ^4.1.2; web dichiara Vitest ^4.1.4 e Testing Library. D cap-paperclip dichiara Node >=24, Fastify ^5.3.2, Zod ^4.0.0 e Vitest ^3.1.1. Sono range dichiarati, non versioni installate misurate. Non è proposta alcuna nuova dipendenza né un aggiornamento pacchetti; la ricerca non richiede interrogare npm per scegliere nuove librerie.

## Architecture Patterns / Don't Hand-Roll

| Problema | Riutilizzare | Raccordo minimo proposto |
|---|---|---|
| Catalogo/discovery | Forge568d x9.client.ts:225–247, resolveCapability | registrazione servizio3225 nella configurazione allowlist D7; test indisponibilità |
| Installazione per agente | capabilities.service.ts:223–256; deploy.machine.ts:606–680 | manifest D5 senza nomi tool copiati; add/toggle continuano a produrre pending |
| Parametri ordinari | capability-agent-contracts.ts:8–15; capabilities.service.ts:107–201; ParameterRows esistente | contratto Paperclip GET/PUT rilasciato dal bridge; adapter config con spend opzionale, nessuna finta contabilità |
| Diagnostica Chiavi | key-requirements.service.ts:73–95,107–173; CapabilityReadouts | `PAPERCLIP_API_KEY` già discoverable da env-schema; nessun secondo validatore/campo segreto in Capacità |
| Identità | agent-context.writer.ts:161–190; bridge CapabilityCallIdentity | lookup server trusted runtime/management/Vault, niente parseInt dello slug |
| Credenziali caricate | writer.ts:99–120/146, apply.service.ts:236–310, keys.ts:233–242 tier | sola key Paperclip tier agent nel ctx; altre chiavi conservate; bag replacement; no nuova risoluzione per-call |
| Envelope chiamata | tool-router.ts:464–478, ToolCallRequest.credentials esistente | proiezione minima dal ctx; solo configVersion/executionContext indispensabili canonici; nessun endpoint nuovo |
| Apply/readback | apply.service.ts:321–367; capability-config-fingerprint test | registrare applicato solo su revisione runtime verificata; mai dedurre readiness da health globale |

Tutte le righe sono [VERIFIED: fonti di codice indicate] per l'esistente; la colonna raccordo contiene decisioni di piano [PROPOSTA], da approvare prima di implementare.

### Contesto caricato e envelope di chiamata esistenti
[VERIFIED: Forge568d writer:65–69,99–120,146,161–190; Apply236–310/347–367; keys.ts:233–242] Resolved interno contiene key/value/tier; writer sostituisce credentials, non merge. Raccordo minimo: solo PAPERCLIP_API_KEY tier agent dal resolved dell'agente, nessun owner/Master/env fallback. Altre chiavi mantengono cascata e fonte. Applica risolve in keys, scrive tramite writer unico, richiede reload standard.
[VERIFIED: X9 index.ts:58–81/230; manager:66–82; router:464–478] Adattatore già usa ctx.credentials. Router trasporta scope ma non credentials: aggiungere soltanto PAPERCLIP_API_KEY dal medesimo ctx trusted in memoria. LLM/prompt/POST context non sono fonti. Load/reload valida file; internal-agent-turn/primary/botless/router cache devono aggiornarsi o fallire chiuso; env legacy primary non diventa authority Paperclip.
[DECISIONE: coor173852] CapabilityCallContext e relativo endpoint esistono come contratti, non mandato a implementare producer/client. E5 esclude snapshot Factory, internal-capability-context, nuovo Vault producer/client, timer/canale invalidazione. Bridge estende solo wire indispensabile install/readback/configVersion/run; credentials esiste già. Niente freshness o versioni Vault inventate.
[LIMITE] Rotazione/rimozione effettiva dopo sync/reload riuscito; prima può restare ctx precedente. Revoca nativa può rifiutare una key caricata ma richiede prova separata, no fallback401/403. Source down/reload fallito resta failure/pending; file scritto non prova loaded/applied. Requisito immediato pre-reload non riscontrato va motivato alla coordinatrice, senza cambiare stack.

### Binding, ruolo e provisioning

[VERIFIED: bridge854 tools.ts:23–26; D167 native-client.ts:78–84,125–132] Binding server-owned contiene scope, unitId, companyId, paperclipAgentId, enabled e roleAgents. `/agents/me` valida identità nativa/company prima delle operazioni; assign valida il target nel binding e la company del destinatario. Questi controlli restano, non vengono rimpiazzati dalla configurazione UI.

[VERIFIED: rg unitId/roleRef/companyId/paperclipAgentId/roleAgents su Forge568d services/factory/src+services/vault/src+web/src, nessuna occorrenza] Una fonte Forge già consegnata per provisioning nativo, inventario unità e ruolo del chiamante non è stata identificata nel baseline. **Gate obbligatorio prima dell'esecuzione funzionale:** owner designato consegna fonte/API e SHA qualificato che lega scope Forge a unità, ruolo autorizzato, companyId e UUID Paperclip verificati. Se manca, tenere non pronto e richiedere la dipendenza tramite coordinatrice; non inserire placeholder, UUID manuali o un orchestratore nuovo. Parametri ordinari unitId/roleRef sono una proposta, non fonte di autorità.

### Run attivo: gate separato

[VERIFIED: D167 native-client.ts:45–47,118–132] take/assign richiedono un UUID run e lo inviano con X-Paperclip-Run-Id. Il controllo locale verifica il formato UUID; non dimostra da solo che il run sia attivo, del chiamante e della company corretta.

[VERIFIED: D167 app.ts:23–26; Forge568d key-requirements.service.ts:91–94,138–141] D5 dichiara PAPERCLIP_RUN_ID tra gli optional dell'env-schema e la diagnostica può proiettare optional in metadata Chiavi. **Gate obbligatorio:** definire raccordo canonico dal run host nativo che prova scope+agent/company+stato attivo e non esponga il run come credenziale persistente nella UI. La fonte autorevole non è stata riscontrata nei baseline. Fino alla sua consegna le mutazioni restano indisponibili; letture native si provano separatamente. Mai salvare run in Vault, costruire UUID o usare env come fallback.

## Common Pitfalls

- [VERIFIED: capabilities.service.ts:255; CapabilityEditor.tsx:143–158] `enabled` è desired, non prova runtime. Separare aggiunto, pending, applicato e pronto; health del servizio condiviso può essere sano anche se manca il binding dell'agente.
- [VERIFIED: D167 app.ts:30–35,57–60] Binding caricati in memoria all'avvio: configurare dal pannello richiede store/applicazione/readback coerenti; il save da solo non aggiorna il runtime congelato.
- [VERIFIED: Forge568d credential-resolver.ts; credential-link.service.ts:225–239] Non creare secondo resolver, contatore versione o cascata. Conservare sync esistente e bag replacement; non imporre lookup remoto al dispatch o freshness prima del reload.
- [VERIFIED: bridge854 tools.ts:24–26] roleAgents non è ruolo del chiamante. Un campo ruolo libero non deve concedere assegnazioni arbitrarie.
- [VERIFIED: D167 native-client.ts:58–75,110–116] Timeout, 5xx o esito mutazione incoerente possono essere unknown: conservare riconciliazione senza retry cieco.
- [VERIFIED: bridge854 capability-call-context.ts:12–17] Non inviare intero bag credenziali, segreti in prompt/log/traces/browser o fallback globale dopo errore.

## Phase Requirements → Research Support

| ID | Supporto e gap |
|---|---|
| PC-01 | Discovery/install/selectedCapabilities/Chiavi già presenti; dipendenza registrazione runtime D7 e manifest metadata |
| PC-02 | binding canonico scope+nativo già presente; mancano config CAS applicata, caller-role e autorità provisioning/inventario |
| PC-03 | writer/sync/ctx esistenti; proiezione minima e key propria, efficacia rotate/remove dopo reload; no producer/client nuovo |
| PC-04 | editor/Applica/fingerprints esistenti; adapter Paperclip e readback effettivo mancanti |
| PC-05 | quattro tool e controlli nativi presenti; run reale fonte autorevole è gate aperto; E3/E4 invariati |
| PC-06 | test infrastructure già presente; nuovi casi due agenti/causali e review SHA da eseguire solo dopo approvazione |

## Validation Architecture

[VERIFIED: .planning/config.json] workflow.nyquist_validation e security_enforcement non sono impostati a false: ricerca include entrambi. Nessun test eseguito o conteggio verde rivendicato in questo documento.

### Test Framework

| Ambito | Framework/config | Comando futuro locale |
|---|---|---|
| Forge factory | Vitest dichiarato ^4.1.2; infrastruttura tests esistente | `pnpm --filter @forge/factory-svc exec vitest run tests/capability-install.test.ts tests/capability-config.test.ts tests/capability-toggle-pending.test.ts` |
| Forge vault | Vitest dichiarato ^4.1.2; tests esistenti | `pnpm --filter @forge/vault-svc exec vitest run tests/credential-link-concurrency.test.ts tests/credential-link-rotate-master.test.ts` |
| Forge web | Vitest dichiarato ^4.1.4; Testing Library | `pnpm --filter web exec vitest run tests/r2-5/capability-editor.test.tsx tests/r2-5/capability-readouts.test.tsx` |
| X9 SDK/router | Vitest; packages/capability-sdk/vitest.config.ts, services/agent-core/vitest.config.ts | comando mirato sui nuovi file dopo assegnazione, quindi `pnpm --filter @x9/capability-sdk test` e suite router del package effettivo |
| cap-paperclip | Vitest dichiarato ^3.1.1; native/client test esistenti | `pnpm --filter @x9/cap-paperclip test` più runner E3/E4 qualificati invariati |

Sono comandi proposti per la fase esecutiva, non prove già svolte. Durata <30secondi non misurata: scegliere subset rapido dopo raccolta baseline, non promettere tempi non verificati. Full suite per wave: typecheck + suite di tutti i package modificati, bridge tests se cambia un contratto, regressione E3/E4. Nessun Docker/shared deploy richiesto.

### Mappa requisiti/casi causali

| ID | Prove automatiche future | Guasto intenzionale che deve produrre rosso |
|---|---|---|
| PC-01 | discovery manifest D5 quattro tool, add A/B, nodo non raggiungibile, selectedCapabilities, missing key | togliere manifest/registrazione o sostituire tool hardcoded: disponibilità/installazione deve fallire |
| PC-02 | scope A/B distinti, riavvio store, CAS concorrente, cross-agent/tenant/owner, ruolo/unità non autorizzati | scambiare binding A/B o rimuovere CAS/lookup inventario: test isolamento/conflitto deve fallire |
| PC-03 | sola key dal ctx proprio; rotate/remove prima-dopo reload, source failure in sync, primary/botless/cache | bag completo, ctx stale dopo reload, fallback globale, falsa revoca pre-reload o fetch Vault al dispatch: rosso causale |
| PC-04 | add/save pending, Apply riuscito/readback versione, reload/readback fallito resta pending/non pronto, B non cambia | segnare applied prima del riscontro o confondere health condiviso e binding: test stato deve fallire |
| PC-05 | /me errato blocca; queue/issue separati da mutazioni; run assente/chiuso/altrui rifiutato; target fuori unità/company; timeout unknown senza replay | accettare UUID arbitrario come run, saltare /me o retry mutazione: test relativo deve fallire |
| PC-06 | matrice locale integrata due agenti, tutti i tool, prova browser mediante trasporti simulati e regressione E3/E4 | ogni nuovo guard va mutato isolatamente; registrare rosso/ripristino verde sul medesimo SHA base |

### Wave 0 Gaps

- Estendere writer/Applica: tier agent Paperclip, bag replacement, rotate/remove sincronizzate, reload failure/pending. Nessun test nuovo producer Vault, componente escluso.
- Test router/envelope dal ctx, zero fetch Vault/Factory al dispatch, ingressi Telegram/primary/botless/internal-turn e cache dopo reload; nessun client SDK Vault nuovo.
- Nuovi test config Paperclip CAS/durable/readback e fixture inventario/provisioning/run autorevole; fixture non equivale a integrazione live.
- Estendere test factory config/install/fingerprint e web editor/readouts esistenti invece di replicare intere suite.
- Per-task commit: subset del comportamento modificato + causale nuova guardia. Per-wave: package typecheck/suite e ripristino pulito. Gate fase: review indipendente su SHA congelato, conteggi pass/total/skip, prova live separata ed esplicitamente autorizzata.

## Security Domain

[VERIFIED: bridge contratti e codice locale citati] Controlli applicativi rilevanti: autenticazione interna distinta token/secret, accesso tenant/owner/agent, input Zod strict, provenance/versioni Vault, segreti minimizzati, redazione log. Categorie ASVS V2/V4/V5/V6/V7 sono una mappa di minacce per il piano, non un'attestazione di conformità normativa. Riutilizzare crittografia Vault esistente, non introdurne una nuova.

| Minaccia | Mitigazione proposta e verifica |
|---|---|
| Confusione identità/tenant e deputy privilegiato | lookup trusted e binding scope+nativo; test A/B, header interno assente e /me mismatch |
| Escalation ruolo/unità | inventario server autorevole, nessuna identità nativa scrivibile dal browser; test roleRef non autorizzato |
| Esfiltrazione credenziali | min key set bridge, nessun browser/prompt/log/traces; canary sintetico nei test e assert assenza |
| Stale key/config o falsa revoca | Bag replacement, sync/reload/readback attestati, router invalidati; limite pre-reload, no claim immediato |
| Replay mutazioni e run non autentico | run host scope/active gate; unknown senza retry; test run altrui/chiuso/assente |

## Environment Availability e gate aperti

[VERIFIED: mandato piano-only] Non sono stati interrogati servizi, segreti o VPS. I test futuri usano trasporti locali e credenziali sintetiche. L'operatività Paperclip reale non è stata verificata. Prima di eseguire: approvazione coordinatrice, assegnazione owner/worktree, SHA D7 qualificato con registrazione servizio, source/provisioning/inventario/run verificati, raccordo writer/sync/core envelope qualificato sul flusso esistente. Nessuna di queste dipendenze viene rappresentata da un placeholder verde.

## Assumptions Log

Nessuna assunzione di disponibilità o comportamento esterno viene trasformata in decisione bloccata: le fonti autorevoli non riscontrate sono gate espliciti. I raccordi di questa ricerca sono proposte da approvare. Il codice condiviso e la UI esistenti sono verificati sui baseline elencati; cambiamenti successivi richiedono riallineamento SHA prima di eseguire.

## Sources / confidenza

Fonti primarie: i file e le righe nei quattro checkout congelati indicati, letti durante questa ricerca; 60-CONTEXT.md e .planning/config.json E168. Confidenza alta sui raccordi esistenti e gap dei baseline. Confidenza media sull'architettura proposta finché D/F non consegnano le dipendenze; disponibilità live/provisioning/run non determinata. Validità: riallineare alla prima consegna D7/F successiva, senza riusare automaticamente le conclusioni negative su nuovi SHA.

## Fonti native A ricevute durante la pianificazione (posta165652)
Fonte read-only /Users/admintemp/Downloads/Claude/filiera-codex-161-1/a-paperclip: provisioning61da2a9 src/provision.mjs e BOOTSTRAP-VPS.md, runauthority d3f5d26 REST-S12.md e8c7b6fb RUN-HOLDER.md/src/native-run-holder.mjs (reviewC ancora in corso). Provisioning usa schemi @paperclipai/shared e ID restituiti da POST/api/companies e POST/api/companies/{companyId}/agents. Il suo helper è bootstrap specifico (7agenti+portavoce), NON un installer generico da eseguire per qualunque agenteForge. Riutilizzare fonte/API e schemi, non quel vincolo o un nuovo orchestratore.
GET/api/agents/me e GET/api/heartbeat-runs/{runId} verificano company/agent/running/contextissue; RUN-HOLDER descrive ricevuta nativa immutabile run/issue/nonce. unitKey/agentKey/nonce sono marker di correlazione, NON tenant/scope/unitId/roleRef o identità. contextSnapshot.wakeReason può essere sovrascritto, non è autorità sufficiente. Resta da implementare e qualificare il mapping server-side sessioneX9↔run reale e bindingcanonico, con invalidazione/checkpercall. Queste prove A non diventano prove E5 né attestazione della deadline adapter; non eseguire ora chiamate native mutanti.

## Aggiornamento dipendenza D7 (postaD170709)
D ha congelato candidato HEAD7e3aee635b2f8e4b4fae1b682676c758488435fc nel167-1 (runtimee604b74e/configf8648beb), prove proprie in .planning/phases/filiera-cap-paperclip. La precedente osservazione WIP resta storica. Confine invariato: bindingfileoperatore non segreto, call.credentials perinvocazione, nessun provisioning/Vaultproducer/Forgecore; composeprofilopaperclip qualificato solo staticamente. Il candidato richiede ancora review indipendente D7; non accreditarlo APPROVE o deploy. La revisione E5 non cambia: integrare dopo SHA/prove/review qualificati e correggere run-context transitorio nei lotti previsti.

## Rettifica della ricerca
Nuovo snapshot Factory e producer/client per-call ritirati da coor173852. Proposte attuali seguono ctx caricato. Decisione/fonti in60-REVISION-TRACE.md. Vecchio PASSED e hash storici non approvano revisione corrente.
