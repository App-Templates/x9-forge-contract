# Changelog — @x9-forge/contracts

## 1.46.0-capabilities-c.0 — local development

- Add scoped ordinary configuration, Master provenance, per-key effective observations and remote lifecycle on existing per-agent routes. Preserve B1/legacy formats.
- Add canonical workspace digests and retained single-capability authority lookup, plus typed structured settings and generated Python admission contracts.
- Consumers tracked in Capabilities phase35: X9 capability-sdk/agent-core/services and Forge factory/web. Local package only; no release or live claim.

All notable changes to the bridge package. This project adheres to [Semantic Versioning](https://semver.org/) at the milestone level (v1.0, v1.1, etc.); within a milestone, distribution is via SHA-pinned `git+https#<sha>` (no per-feature versioning).

## How releases work in this repo

- **No npm registry.** Consumers (agent-x9, forge-v2) depend via `git+https://github.com/App-Templates/x9-forge-contract.git#<sha>` with a `prepare` build script.
- **Atomic SHA bump.** Breaking contract changes require atomic SHA bump in BOTH consumer repos in the same step (RLSE-02). Never one consumer at a time.
- **Deprecation workflow** (RLSE-03): When deprecating a public symbol, add `/** @deprecated <reason — removal in v<X.Y>> */` JSDoc with explicit removal milestone. Minimum 1 milestone-cycle grace period before removal.

---

## v1.44.0 — voce, telefono, canale web e identità esplicita del contesto agente

### Added (additive)

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
