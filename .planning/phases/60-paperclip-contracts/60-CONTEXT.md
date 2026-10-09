# Phase 60: cap-paperclip da Forge — contesto E5

Data: 2026-10-09. Stato: pianificazione soltanto, approvazione coordinatrice obbligatoria prima del codice.
Mandato: posta coor164126; ruoli GSD nuovamente attivi coor164450. Questa fase documentale nel168-1 sostituisce per E5 l'adattamento inline storico E3/E4; E3/E4 restano congelati f3164d8.

## Confine e decisioni bloccate
- D-01: qualunque agente Forge può abilitare paperclip dal pannello Capacità esistente, identità/chiave/ruolo da Vault e contesto autorevole. Nessun nome, indirizzo, UUID, ruolo o agente preferito nel codice.
- D-02: riusare discovery, selectedCapabilities, registro desired, Applica, diagnostica Chiavi e moduli E3/E4. Niente nuovo catalogo, schermata, framework, provider email o installer parallelo.
- D-03: solo piano in .planning nel worktree168-1; niente codice Forge prima di approvazione, niente push/deploy/VPS. Una fase futura per repo in worktree proprio, owner e perimetro assegnati prima di eseguire.
- D-04: contratti wire solo @x9-forge/contracts. Bridge/runtime cap di D, Forge/agent-core da assegnare dopo approvazione. Nessun DTO/header/endpoint copiato localmente. Modelli resta parcheggiato.
- D-05: identità tenant/owner/runtimeAgentId/managementAgentId/vaultAgentId trusted e distinta; nessuna conversione arbitraria slug→ID numerico, nessun campo tool/browser concede identità o ruolo.
- D-06: chiave nativa propria per agente consegnata da Forge in AgentContext.credentials durante sync e caricamento/reload; al dispatch proiettare solo PAPERCLIP_API_KEY nell’envelope esistente, senza risoluzione remota per-call o fallback process.env/Master. Revisione caricata/readback non attesta freshness Vault pre-reload. Verifica /agents/me coerente companyId/paperclipAgentId. Il runId deve essere un run Paperclip reale del chiamante, effimero e trusted, mai una chiave persistita o UUID inventato.
- D-07: desired/enabled non equivale a installed/effective. Configurazione versionata CAS e readback, Apply standard, errori/assenze unknown o non pronto. Disabilitazione applicata e revoca sincronizzata bloccano dopo reload riuscito; prima non dichiarare efficacia immediata senza attestazione nativa/provider. Nessuna ricreazione cap dedicata al singolo agente.
- D-08: ruolo/unità validati su inventario autorevole; roleAgents indica destinatari di assegnazione, non ruolo del chiamante. paperclipAgentId/companyId da provisioning verificato, non input libero che concede diritti. Assente provisioning/inventario/run autorevole blocca il gate funzionale; non costruire un altro orchestratore.

## Discrezione tecnica
Ordine dei lotti, suddivisione documentale, store durabile CAS, adattatori generici minimi. Proposta: configurazione ordinaria unitId e roleRef; identità nativa e mappa ruoli risolte server-side. Dichiarare esplicitamente quali contratti sono proposti e quali rilasciati. Nessun nuovo spend endpoint Paperclip: adattatore separa spend opzionale dalla configurazione.

## Requisiti e accettazione
- PC-01: servizio registrato nella discovery esistente e quattro tool manifest D5 disponibili per qualsiasi agente selezionato; chiavi mancanti diagnosticate dal flusso esistente.
- PC-02: due agenti con scope, unità, ruolo e UUID nativi distinti; configurazione persistita CAS e readback; nessun accesso incrociato.
- PC-03: sync Forge→AgentContext.credentials e proiezione minima nell’envelope; key propria, no fallback globale; rotazione/revoca effettive dopo sync/reload riuscito e revisione applicata verificata; fonte down in sync/reload fallito non diventano applied; nessun segreto in prompt/log/risposta/config ordinaria.
- PC-04: selezione/add/toggle/save/Applica/readback sul percorso Forge esistente; stato pronto solo con binding/config/revisione realmente applicati, errore visibile sullo stesso pannello.
- PC-05: quattro strumenti nativi mantenuti; queue/issue verificano identità, take/assign usano run reale e target autorizzato; timeout mutazione resta ambiguo senza retry cieco. E3/E4 e conferma umana invariati.
- PC-06: prove locali integrate a due agenti, regressione e guasti causali per ogni nuovo controllo; review indipendente sullo SHA, distinta prova dal vivo autorizzata prima di affermare fruibilità. Il solo piano non verifica il prodotto.

## Esistente, corrispondenza e riscrittura (R-31/R-35)
Fonti di lettura soltanto, non perimetri di scrittura attuali:
- Forge /Users/admintemp/Downloads/Claude/forge-v2-integra-chiavi @568d4924e7456229bfe4d5c50dc655bdc3e277c8; main Forge è più vecchio e non è la base del piano.
- D /Users/admintemp/Downloads/Claude/agent-x9-codex-167-1 @d22fe0736f57e548252bcddb7acf29da9eff74f3: D5 manifest/app/native-client, E3/E4 integrati. runtime.ts/index.ts/compose D7 osservati WIP, non consegnati: dipendenza, non riscrittura.
- Bridge /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-169-1 @854f36a8f88280bad6c5b19249e8ababeee5bb44: PaperclipAgentBinding, tool e CapabilityCallContext.
- E /Users/admintemp/Downloads/Claude/agent-x9-codex-168-1 @f3164d8d1729f2a001558e4415be6c4ec1735408: routing/decisioni approvati.

## Riferimenti canonici obbligatori
- /Users/admintemp/Downloads/Claude/forge-v2-bacheca/piani/FILIERA-BOOTSTRAP.md e FILIERA-BOOTSTRAP-SPEC.md: percorso e comunicazione.
- Forge568d services/factory/src/services/x9.client.ts:225 discovery allowlist; capabilities.service.ts:107 dettaglio,150 save,223 add,244 toggle,324 metadata.
- Forge568d services/factory/src/services/capability-agent-contracts.ts:8: solo Ricerca/Lab; web/src/features/capabilities/CapabilityEditor.tsx:126 Applica; deploy.machine.ts:606–680 selectedCapabilities e registro dai manifest.
- Forge568d services/factory/src/services/agent-context.writer.ts:108/161 identità trusted; key-requirements.service.ts:73/107 diagnostica dinamica; services/vault/src/routes/vault.ts:95 resolve numerico.
- Bridge854 src/capability/capability-call-context.ts:51/110/131 e src/http/endpoints/capability-call-context.ts: contratto esistente non implica producer o uso HTTP da implementare, architettura ritirata da coor173852.
- Bridge854 src/capability/paperclip/tools.ts:24 binding; src/capability/parameters.ts: impostazioni non segrete.
- D167 services/cap-paperclip/src/manifest.ts:8, app.ts:16/23/30/57, native-client.ts:45/78. Niente config agent routes nel congelato.
- D167 services/agent-core/src/core/tool-router.ts:464 envelope senza credentials: raccordare al ctx già caricato, nessun client remoto. POST/context per prompt non contiene segreti.

## Fruibilità (R-34)
Owner apre agente A → Capacità → aggiunge Paperclip → configura unità/ruolo autorizzati → collega chiave per A in Chiavi → Applica → readback coerente → legge coda e prende/assegna un task su run nativo reale. Ripete per B con altra unità/ruolo/chiave, verifica isolamento. Disabilita A e verifica rifiuto successivo senza influire B. Senza run/provisioning reale si dichiara testato localmente, non verificato dal vivo. Non eseguire ora chiamate reali o deployment.

## Raccordo confermato durante ricerca
F165108 resta riscontro storico; producer CapabilityCallContext non più richiesto per coor173852. Non attribuire prove Modelli a E5. Vault568d dispone invece di credentialWinners (lib/credential-resolver.ts:5), credential-link.service.ts:220 winners,228 observeVersions e272 versionOf: riusare fonte/versione esistenti senza seconda cascata o contatore. D env-schema optional PAPERCLIP_RUN_ID viene proiettato fra Chiavi da key-requirements.service.ts:91–94: il piano deve correggere la classificazione; il run è contesto effimero, mai credenziale salvata.

## Fonti native A ricevute durante la pianificazione (posta165652)
Fonte read-only /Users/admintemp/Downloads/Claude/filiera-codex-161-1/a-paperclip: provisioning61da2a9 src/provision.mjs e BOOTSTRAP-VPS.md, runauthority d3f5d26 REST-S12.md e8c7b6fb RUN-HOLDER.md/src/native-run-holder.mjs (reviewC ancora in corso). Provisioning usa schemi @paperclipai/shared e ID restituiti da POST/api/companies e POST/api/companies/{companyId}/agents. Il suo helper è bootstrap specifico (7agenti+portavoce), NON un installer generico da eseguire per qualunque agenteForge. Riutilizzare fonte/API e schemi, non quel vincolo o un nuovo orchestratore.
GET/api/agents/me e GET/api/heartbeat-runs/{runId} verificano company/agent/running/contextissue; RUN-HOLDER descrive ricevuta nativa immutabile run/issue/nonce. unitKey/agentKey/nonce sono marker di correlazione, NON tenant/scope/unitId/roleRef o identità. contextSnapshot.wakeReason può essere sovrascritto, non è autorità sufficiente. Resta da implementare e qualificare il mapping server-side sessioneX9↔run reale e bindingcanonico, con invalidazione/checkpercall. Queste prove A non diventano prove E5 né attestazione della deadline adapter; non eseguire ora chiamate native mutanti.

## Aggiornamento dipendenza D7 (postaD170709)
D ha congelato candidato HEAD7e3aee635b2f8e4b4fae1b682676c758488435fc nel167-1 (runtimee604b74e/configf8648beb), prove proprie in .planning/phases/filiera-cap-paperclip. La precedente osservazione WIP resta storica. Confine invariato: bindingfileoperatore non segreto, call.credentials perinvocazione, nessun provisioning/Vaultproducer/Forgecore; composeprofilopaperclip qualificato solo staticamente. Il candidato richiede ancora review indipendente D7; non accreditarlo APPROVE o deploy. La revisione E5 non cambia: integrare dopo SHA/prove/review qualificati e correggere run-context transitorio nei lotti previsti.

## Revisione vincolante coor173852
Approvazione172248 RITIRATA. Flusso esistente Forge writer→AgentContext.credentials→load/reload→call.credentials, sola PAPERCLIP_API_KEY propria. Nessuna nuova rotta internal-capability-context/snapshot Factory, producer/client Vault per-call o nuova frequenza risoluzione. Decisione letterale/fonti/hash storici/superfici escluse in60-REVISION-TRACE.md. Install/readback/config CAS/run mapping e ownergates restano; nuova review e approvazione pendenti.
