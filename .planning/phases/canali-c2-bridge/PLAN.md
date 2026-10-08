# CANALI-C2-BRIDGE — PLAN

Codex F · 08/10/2026 · Piano prima del codice. Assegnazione posta20261008-113654: worktree `/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-122-1`, branch `codex/canali-c2-bridge`, base **a251bbc9451381a67afa10f330fa5a3b501e8ba4**, versione1.43.0. Inizialmente pulito; codice non autorizzato ancora, perimetro iniziale solo .planning/phases/canali-c2-bridge. Forge120-1 congelato: F0 consegnato separatamente HEAD71be142c/prodotto08f9d900. Coordinatrice114105 accetta F0 con causa nota full (1testfile non raccolto per fastify web; lo corregge A); non dichiarato full verde o C2 completo. Lavoro solo nel bridge; consumer e producer in successivi worktree assegnati.

## Obiettivo

Contratto canonico della porta Telefono per ogni agente: numero condiviso/stato globale, binding/routing inbound per identità, ammissione Solo rubrica/Chiunque, outbound soltanto su richiesta autorizzata, pausa indipendente, configurazione desiderata/applicata e ricevute correlate. Il bridge dichiara schemi e descrittori, non chiama provider, assegna numeri, installa handler o prova la produzione. Voce/modello restano R4, un solo writer in Capacità. Numero dedicato rimane non supportato. Release/versione/push/merge a coordinatrice, non al Codex.

## Inventario R-26 / riuso con fonti

- STATO.md letto: storico fino1.29; package.json e sorgenti della base1.43 sono autorità attuale. Nessun AGENTS.md di repo trovato; regole globali già lette.
- `src/agent/agent-channel-access.ts:6`: AgentChannelAccessBindingSchema + sameAgentChannelAccessBinding, scope runtime/management/vault e owner/tenant. Fonte Rubrica AgentChannelAddressBookSchema oggi email-only, completa/parziale/indisponibile con versione/data. NON alterare o duplicare la Rubrica; proprietario D, domanda114211.
- `src/agent/agent-channel-configuration.ts:17,47,62,108`: nascita tg/email, risorse possedute bot/inbox, configurazioni di nascita length(2). NON aggiungere phone all'enum di nascita né cambiare le2porte obbligatorie. Riutilizzare AgentChannelDesiredStateSchema, AgentChannelVersionedStateSchema, AgentChannelFailureSchema, AgentContextWithChannelsSchema/Write e helper di identità; estensione telefonica opzionale separata nel contesto canonico, assenza non equivale a public/active.
- `src/agent/agent-channel-access-requests.ts`: command requestId/CAS, errori fissi e ricevuta applied/pending/failed, correlazione e freshness. Componenti riusabili; richiesta/queue Telegram rimane fuori dal telefono. In C2 nessuna start-request queue inventata.
- `src/agent/agent-channel-attestation.ts`: AgentChannelAttestationSchema supporta voice ed email, con applied state/version/data, errori fissi. Il telefono usa attestation VOICE con mapping esplicito dal door phone, non osservazione kind inventata o falsa readiness dal profilo.
- `src/capability/voice/agent-voice-settings.ts`: AgentVoiceConfigSchema/Settings, OutboundCallerIdentitySchema/outboundCallerIdentityFor e numero E.164 riusato da VoiceLiveCallStartRequestSchema.shape.to_number; nessun nuovo regex/provider list/default. APPLIED voice resta indispensabile, desired non autorizza una chiamata.
- `src/capability/voice/{prepare-call,call-start,brief,authorized-actions}.ts`: contratti outbound già presenti. Nuova autorizzazione/receipt di porta avvolge o correla i tipi esistenti, non ricrea call brief, matrice azioni o risposta provider.
- `src/http/endpoints/{voice,voice-live,voice-register}.ts`: endpoint outbound/post-call/Telnyx/media già canonici; nessun duplicato di path/header.
- `src/http/endpoints/{internal-agent-channel-access,forge-agent-channel-access}.ts`: pattern consumer secret vs session/owner, preview/CAS e correlazione. Sono birth-only tramite AgentBirthChannelKindSchema; C2 usa descrittori dedicati al segmento fisso phone, senza ampliare le rotte di nascita/Telegram/email. Autorizzazione server derivata, mai scope/owner/role nel body browser.
- `src/agent/index.ts` e `src/http/endpoints/index.ts`: barrel esistenti; nessun subpath/package export nuovo necessario. Schema `.strict`, errori enumerati e parsing nelle funzioni pure.
- Dist versionata nella base; rigenerazione ESM/CJS/d.ts soltanto da build nativa, nessun edit manuale. package scripts: build + portability, typecheck, lint, test nativi + CJS e check:pack. Dipendenze frozen senza aggiunte; test loopback/sintetici, mai provider live.

## Trasversalità R-31

Un percorso unico per qualsiasi agente/owner/tenant/provider supportato. Nessun ramo per X9/Meditation, owner/id/numero/persona fissi; i disegni non diventano default. Credenziale del Master non autorizza accesso a Rubrica, numero o porta di altro agente. Scope runtime e identità management/vault vengono validati prima degli effetti e della correlazione; shared number è globale ma il suo binding/ammissione è per agente. Disponibile globalmente non significa loaded/ready per l'agente.

Fixture con A/B distinti per tenant/owner e stesso owner/due agenti, managementId diverso da runtime/vault. Identico requestId in scope diversi non concede replay; esito/risorsa/contatto di B non valida A. SA e owner proprio possono operare in Forge solo dopo guard server; owner altrui/anonimo zero chiamate/writer/provider. Inbound chiunque è una scelta applicata esplicita per chiamanti telefonici; non è un permesso browser anonimo né servizio interno senza auth.

Capability/voce/rubrica sono trasversali; la porta gestisce ammissioni, instradamento e pausa. Config/persona/progetti/prompt/modelli e i contratti outbound precedenti rimangono protetti. Pausa di A non spegne numero condiviso, capacità voce o altre porte/agenti. Config della chiamata già partita mantiene il pin voce R4; nessuna promessa di chiudere chiamate in corso senza specifica producer. Gate e revoca durante preparazione negano effetti ancora non iniziati.

## Modello previsto e confini

1. **Numero globale e binding attestato.** Numero E.164 da schema esistente, id risorsa del producer e osservazione/versione/data/source availability esplicite. Unknown/unavailable non diventano empty/ready. Binding canonico scope+identity, routingIdentity derivata dal producer e distinta da id provider. Configurazione attiva non provata da disponibilità numero. Un numero dedicato non è rappresentato come capability operativa. Nessuna credenziale, URL arbitraria, nome persona o token nel metadata.
2. **Configurazione telefonica separata dalla nascita.** AgentPhoneChannelConfigurationSchema riusa campi-schema e helper C1 di binding/stato/versione/failure e conserva desired/appliedPolicy separati. kind phone mappa a attestation kind voice. Config/policy applicate e binding devono appartenere allo stesso scope/management/vault; osservazione e timestamp accoppiati, desired>=applied, stato e policy coerenti per la stessa versione. Estensione facoltativa AgentContextWithPhoneSchema/Write sopra C1, con scope e identità del contesto verificati; legacy tg/email invariati e assenza phone non autorizza ammissioni pubbliche.
3. **Policy e Rubrica.** Inbound address-book|anyone, outbound permesso esplicito sempre vincolato a richiesta e contatto autorizzato, pausa tramite stato di porta C1. D possiede fonte e numeri/scoping/freshness della Rubrica. C2 non aggiunge una lista di contatti locale o copia della Rubrica; consumer address-book fails closed se fonte incompleta/assente/stale/scope diverso. Simboli della fonte telefonica da concordare con D prima del lotto ammissioni. Non scrivere phone fields dentro agent-channel-access.ts senza accordo.
4. **Routing e ammissione prima degli effetti.** Envelope interno per evento inbound già verificato dal producer: numero/selector agente/call-id/time vengono dati, non autorità; il server risolve binding canonico e restituisce decisione scoped senza creare sessione/turno se sconosciuto/collidente/archiviato/pausa. Forge non invia un caller verification flag per aggirare il gate. Helper pure ricevono clock/evidenza corrente. Endpoint vendor firmato/media stream resta quello canonico esistente: nessuna nuova rotta pubblica dal bridge.
5. **Comandi e ricevute.** CAS expected desired/applied + requestId C1; apply state/policy con receipt applied solo se effettivamente attestato, pending/failed distinti, niente errori provider raw. Outbound su richiesta esplicita correlata al contratto VoicePrepareCall/VoiceCallStart esistente, con destinatario risolto dalla fonte autorizzata. Nessun numero/scoping/provider arbitrario nel draft browser. Replay/collisione e clock invalidi negati. Il producer X9, non il bridge, rende durevoli e idempotenti le operazioni.
6. **HTTP.** Descrittori internal secret per snapshot/apply/routing e consumer Forge session+sa-or-owner per snapshot/preview/apply e richiesta outbound. Param agente canonico management; phone segmento statico, body e response strict. Autorizzazione server-derived riusa ForgeAgentChannelAccessAuthorizationSchema; parsing+scope del nuovo snapshot sono necessari, non riusare helper che parsea soltanto config birth. Path builders canonici, autenticazione distinta e guard dei ruoli testato nei consumer futuri. Nessuna nuova gestione header/credenziali.

## Lotti <=45min o3tentativi falliti

- **B0 piano/perimetro (corrente):** inventario, riuso, decisione D e file esatti. Solo documenti;0nuovi test/prodotto. Non claim implementazione.
- **B1 numero/binding/config/context:** test prima di schemi/helper, composizione C1/R4 e regressioni di contesti legacy. Primo lotto indipendente dalla fonte Rubrica. Null/unknown, scope/identity/vault, version/state/policy/observation incoerenti devono diventare rossi. Mutazione per ogni nuovo gate/refinement, fresh green e hash restored.
- **B2 comandi/routing/receipts:** primitive C1 e outbound esistenti, strictness/CAS/idempotency-correlazione/binding/freshness/clock. Nessun provider. Test di zero effects come obbligo del producer nel lotto X9, non attribuiti al solo schema.
- **B3 ammissioni/Rubrica:** dopo simboli/source concordati con D; se dipendenza non disponibile checkpoint e parte indipendente. Non inventare una fonte temporanea. Anyone richiede versione applicata ed evidenza; address-book/outbound richiedono contatto canonico nello stesso scope e source completa corrente.
- **B4 HTTP/export/CJS:** descrittori builders, auth metadata, param/body/response, scope autorizzazione server, input SQL/path injection e payload tecnici respinti; nomi del provider non sono permessi. CJS/ESM consumer reale dei dist generati, read/write context roundtrip e rejection casi avversari.
- **BQ qualità/review:** test completo nativo (worker1, semaforo se richiesto dalla bacheca/regola corrente), vecchio smoke CJS + nuovo smoke, typecheck/lint/build/dts/check:pack, audit source/dist/export/pin/protected. Un comando pesante alla volta. SUMMARY incrementale dopo ogni commit, rileggi PLAN/SUMMARY; numeri con denominatore e solo mutazioni con assertion/diff semantico, import/timeout non qualificati. Consegna pronta per review, release coordinatrice; X9/F1 in worktree successivi. Nessuna prova live dal solo contratto.

## Matrice prove specifiche

- Due tenant/owner/agenti, stesso owner due agenti, management/runtime/vault scambiati, numero globale diverso, identity selector sconosciuto/collisione: reject. Mutazioni ogni binding/scope/correlation.
- Saved non applied, applied ahead/state o policy incoerente, missing observation/date, error/rawdetails, active senza binding, global availability con agente notready, stanza disabled/paused: nessun false-applied. Mutazioni version/gate/evidence.
- inbound anyone esplicito vs address-book complete/empty/partial/unavailable/stale/future/wrongscope; outbound permission false, richiesta assente, contact non autorizzato, voce solo desired/web-only/text-only: reject. Mutazioni ciascun admission/phone/voice/request guard.
- Apply CAS/replay stessoid differenteconfig, risultati fuoriordine, pending senzaapplied, failedsenzaerrorefisso, appliedreceipt wrongscope/request/versions/routingnumber, responsepredates snapshot: reject. Mutazioni ciascun correlatore.
- Parsing strict su nested owner/tenant/url/credential/providererrordetail, boundarylength/canonical E.164 riusata. Legacy schema/output e2config birth conservate byte/behavior; phone optional non rende obbligatorio un terzo canale.
- HTTPinternal/browser: metadataauth corretto, encoded params, bad kind impossibile nel percorso statico, foreign snapshot/preview/riceipt rifiutati dalle helper; ruoli runtime e firma provider saranno test X9/Forge, non simulati come implementati dal bridge.

## Perimetro codice proposto (prima dell'approvazione)

Sorgenti esatti:
- src/agent/agent-phone-channel.ts
- src/agent/agent-phone-admission.ts
- src/agent/agent-phone-commands.ts
- src/agent/index.ts (soli nuovi export phone)
- src/http/endpoints/internal-agent-phone-channel.ts
- src/http/endpoints/forge-agent-phone-channel.ts
- src/http/endpoints/index.ts (soli nuovi export phone)

Test esatti:
- tests/agent/agent-phone-channel.test.ts
- tests/agent/agent-phone-admission.test.ts
- tests/agent/agent-phone-commands.test.ts
- tests/http/endpoints/agent-phone-http-internal.test.ts
- tests/http/endpoints/agent-phone-http-forge.test.ts
- tests/cjs/agent-phone-channel-smoke.mjs

Documenti/prove .planning/phases/canali-c2-bridge/**. `dist/**` esclusivamente output della build nativa e audit di source map/d.ts/CJS/ESM, zero edit manuali. Nessun package/version/lock/CHANGELOG, Rubrica/C1/source outbound/protocollo/header/test precedenti modificato. Qualunque file necessario diverso da questi richiede nuova richiesta. Prima del codice B3 serve accordo sulla fonte di D, eventualmente delta perimetro senza contatti duplicati.

## Decisioni aperte

Approvazione del perimetro sopra, fonte/nomi/schema telefonico Rubrica di D (domanda114211) e ordine d'integrazione, review indipendente e regola semaforo applicabile a suite bridge. Se la composizione phone richiede modifica a un helper C1 anziché un nuovo wrapper, proporre il delta motivato prima, non allargare il perimetro. Il codice B1 può partire indipendentemente dopo approvazione; B3 mai con una fonte sostitutiva.

## Vincolo sprint114734

C2 non entra nel rilascio13: continuare secondo piano, senza suite completa12:00-12:30. Posti riservati alle verifiche di rilascio. Richiesta perimetro114719 ancora pendente alla scrittura; frozen install0 e hookperimetro conservato.
