# C5-CANALI-TEL-WEB — piano di completamento

Data: 08/10/2026. Autore: Codex C. Fase 1: analisi in sola lettura; nessuna feature consegnata, nessuna verifica dal vivo. Decisioni di riferimento: coordinatrice 190721 (Spesa congelata, priorità Telefono/Web), 191632 (bridge a C, base `27749e4`, integrazione unica 1.45), Codex B 191452 (comune Canali/header/modal/actions a B).

## Fruibilità (R-34)

1. **Chi e da dove?** Stefano, SA oppure owner dei suoi agenti, apre Agenti → X9 e Meditation → Canali. Vede numero condiviso, selettore agente, voce effettivamente applicata e accesso Telefono; vede link stabile, voce ElevenLabs e accesso Web. Gli altri owner vedono solo i propri agenti. La decisione corrente assegna tutti i 15 agenti a Stefano owner 1: il vecchio esempio della tavola che nasconde Master X9 a ogni owner non prevale sulla proprietà vera. Non si inventano nomi o configurazioni degli altri 13.
2. **Che percorso deve completare?** Configura → cambia chi può entrare → anteprima leggibile → salva e applica → attende la conferma correlata di X9. Telefono: chiama il numero condiviso, seleziona l'agente, viene ammesso secondo la Rubrica vera, parla con quella identità; chiamata uscente solo se abilitata, destinatario in Rubrica e richiesta esplicita. Web: copia/apre `/parla/:linkId`, si autentica se richiesto, avvia/parla/chiude la sessione ElevenLabs; invitato e pubblico rispettano la politica effettivamente applicata. Pausa del solo canale conserva numero/link e non spegne gli altri canali.
3. **Che prova serve?** Per ogni riga della matrice seguente: controllo nativo inizialmente rosso, verde dopo la singola correzione, mutazione funzionale qualificata e ripristino SHA; prova del percorso browser con rete canonica; infine prova dal vivo su X9 e Meditation a cura della coordinatrice/operatore autorizzato. Un mapping provider, una vecchia chiamata o un HTTP 200 non provano una conversazione riuscita. Numeratore e denominatore vanno riportati separatamente per test, file, mutazioni e percorsi.
4. **Che cosa manca oggi?** Alla base analizzata mancano ammissione telefonica operativa, selettore inbound, applicazione C2 e stato linea; web C3 ha autorità chiusa con identità null, nessuna facciata browser/inviti né pagina Forge pubblica. Audio, testo e durata dello storico non sono forniti dal vecchio endpoint Forge. Perciò 0/2 percorsi completi Telefono/Web sono attestati dal vivo in questa fase; non si dichiara Canali al 100% dopo il solo bridge o pannello.

## Fonti e basi fissate

- Forge: `00a468e02ac57b0baf4f6ae750d92d463f581dee`; vecchio `origin/main` `4f3fc42bf26ef191642f7f8d0cc94153c1302fe0`, letti via Git dal worktree proprio congelato 135-1. Nessuna modifica al checkout condiviso o ai worktree altrui.
- X9: `d65f6c91f11df4482f0d845d25f089c86b0b8df8`, build/fabbrica-x9, non prova della versione rilasciata. Analisi via Git dal worktree proprio congelato 141-1. Vendor attuale non contiene ancora tutta C2/C3: la coordinatrice riallinea i consumer una volta sola sulla 1.45. Prima di allora i nuovi import non si simulano con alias, copie o tipi locali.
- Bridge rilasciato v1.44.0: `2f38decb83d007a245f5f74765f2c9a9fca7ba70`; nuova base decisa `27749e4` di codex/c5-modelli-bridge. Canonico letto dal tag/commit, non dalla vecchia copia nel checkout. Il lotto Modelli di F resta separato.
- Brief approvato: `piani/DESIGN-CANALI-BRIEF.md`; tavole in `design/forge-tavole-0710/project/`. Etichette, esempi di numeri, persone, date e voci nelle tavole sono esempi: non seed di produzione.
- Checkpoint riusabili: Phone F0 `08f9d900` (documenti `71be142c`); Web F0 `2a22b3dc` (documenti `48a8c48b`); C1 Forge B `c677d93e` + quattro WIP congelati, non producer pronto; ElevenLabs X1 `cffa52b6` (documenti `5c622f53`); identità D `8a7aac0` (documenti `da99501d`); Conoscenza bridge `8652688` e preparazione Forge T0 `b6915ea2`. Il riuso effettivo/cherry-pick spetta alla coordinatrice, mai modifiche nel worktree dell'autore.

SHA256 delle cinque tavole lette (testo HTML estratto senza esecuzione):

| Tavola | SHA256 |
|---|---|
| Main.dc.html | 7f3eb096e10d4e70c5eb0ac05f82e1b4def5842126220e1b1d564dcb2f119a20 |
| Agente.dc.html | 32d99bb947035cf231288cb5c95fbc5b64a60e5c87b66f6b1dfc9dcb96ac1764 |
| Stati.dc.html | 1472e9c2d111ae8bbf01a67386596d8f5cb111fe25a2c0bc7e4cc17e5971b3e8 |
| ConfiguraTelefono.dc.html | 8838aa8e0308dc401563afc19e98bc01889a19e0a2ac6c4d45ccafd8e906242f |
| ConfiguraWeb.dc.html | dd38ef0cbd12e10b08f3e060a641ee64a15657a4fa50902f884c091561308cbc |

## Corrispondenza aspettativa/tavola → elemento → prova

42 righe di accettazione, da eseguire in fase 2. Le righe comuni sono responsabilità di B; C gli fornisce fatti canonici e moduli isolati. Nessuna riga è dichiarata provata dal vivo qui.

| ID / fonte | Elemento e comportamento | Prova richiesta |
|---|---|---|
| M01 Main | Quattro porte e contatore funzionanti; verifica tutti | B conta solo prove correnti, isola fallimento di una porta; C restituisce due esiti reali |
| M02 Main | Numero condiviso, copia, identità/ID dell'agente | Metadati linea/versione correnti, selettore univoco; copia reale e nessun numero inventato |
| M03 Main | Risponde e si presenta come agente scelto | Inbound selector → binding management/runtime/vault → voce applicata; prova X9 e Meditation |
| M04 Main | Ultima verifica telefonica riuscita e data | Chiamata completata attestata, timeout successivo produce Non verificato, non Funziona |
| M05 Main | Rubrica e voce applicata, Cambia in Capacità | Rubrica Conoscenza corrente; lettore R4/C2, nessun secondo writer del modello |
| M06 Main | Ultime chiamate nome/direzione/durata/Ascolta | Identità posseduta + evento concluso; audio solo se conservato e autorizzato, assenza esplicita |
| M07 Main | Configura, Chiamami per una prova, dettagli tecnici | Prova esplicita al numero dell'owner attestato, stessa pipeline ammissione; dettagli solo espandibili |
| M08 Main | Link stabile copia/apri/parla | HTTPS origin configurata, link non provider, cambio politica non cambia link |
| M09 Main | Ultima conversazione web avviata e chiusa normalmente | Correlazione sessione/evento/provider e durata; mapping esistente da solo insufficiente |
| M10 Main | Accesso owner predefinito dichiarato dalla configurazione | Nessun public implicito su assenza; sessione autenticata server-resolved |
| M11 Main | Voce ElevenLabs applicata e Cambia in Capacità | Mapping/profile/versione correnti; catalogo discovery non scambiato per voce applicata |
| M12 Main | Conversazioni/Rileggi/Tutte | Storico per agente/owner/tenant, transcript autorizzato e scadenza; nessun JSON tecnico frontale |
| A01 Agente | Solo agenti propri, SA può amministrare | 401/403 e isolamento browser; Stefano owner 1 vede i suoi X9/Meditation |
| A02 Agente | Serve capacità e Aggiungi capacità | Assenza capability distinta da errore fonte; catalogo autorizzato e raccordo task Modelli |
| A03 Agente | Owner vede linea comune ma non la cambia | Mutazione del controllo SA e rifiuto server del tentativo owner |
| A04 Agente | Nessuna richiesta di credenziali nel percorso Canali | Riusa Chiavi/Vault; la UI non chiede token né li restituisce |
| T01 Stati | Agente spento ferma tutti, conserva configurazione | Stato runtime/lifecycle vero; azione Accendi comune di B, nessuna accensione da C |
| T02 Stati | Pausa una porta e riattiva solo quella | Versione/receipt applicati; altre porte e voce restano invariate |
| T03 Stati | Salvato non applicato, vecchia politica resta efficace | CAS con response tardiva/cambio slug/versione; nessun successo ottimistico |
| T04 Stati | Dopo due minuti non applicato, motivo/riprova | Timer reale e ricevuta correlata; niente date simulate o retry silenzioso |
| T05 Stati | Non verificato e ultima prova precedente | Timeout non prova porta disattiva; diagnosi sana/sorgente assente distinte |
| T06 Stati | Numero non attivo globale, gestione SA | Attestazione unica linea per tutti; owner read-only; nessun pulsante senza writer reale |
| T07 Stati | Web non funziona/link 404 e riprova | Errore letto dalla fonte e sessione negata; contatore guasti solo se realmente misurato |
| T08 Stati | Ordine severità comune | B: non funziona → linea non attiva → non verificato → pending → configura → capacità → pausa → spento → funziona |
| T09 Stati | Autore/orario delle transizioni | Solo dato attestato; non attribuire all'owner un evento tecnico senza evidenza |
| P01 ConfiguraTelefono | Numero condiviso, dedicato disabilitato | Nessuna falsa scelta dedicata; routing ID visibile, indisponibilità esplicita |
| P02 ConfiguraTelefono | Voce/provider/modello sola lettura | Read di configurazione applicata e link Capacità/Modelli; writer unico R4 |
| P03 ConfiguraTelefono | Solo Rubrica / chiunque | E.164 esatto e fonte completa/fresca; chiunque solo politica esplicita applicata |
| P04 ConfiguraTelefono | Non ammesso sente messaggio e chiamata chiusa | Firma provider verificata prima routing; nessun turno agente né effetto pagato dopo rifiuto |
| P05 ConfiguraTelefono | Chiamate uscenti abilitate solo Rubrica + richiesta | Comando correlato e consenso/richiesta server, numero attestato, recheck dopo ogni await |
| P06 ConfiguraTelefono | Anteprima effetti leggibile | Diff canonica versione; descrive ingresso/uscita, niente DTO in interfaccia |
| P07 ConfiguraTelefono | Salva/applica, annulla, prossima chiamata | CAS/receipt/versione, annulla senza effetto, in-flight non applica al nuovo agente |
| P08 ConfiguraTelefono | Pausa indipendente | Pausa applicabile anche linea giù, preserva policy/routing; riattiva richiede linea pronta |
| W01 ConfiguraWeb | Attivo/disattivo, link non disponibile se off | Semantica attività distinta da pausa; nessuna sessione nuova con canale off |
| W02 ConfiguraWeb | Link stabile copia e apri | /parla/:linkId canonico, pagina fuori guard globale Login ma autentica secondo policy |
| W03 ConfiguraWeb | Solo owner autenticato | Identità D, membership owner/tenant risolta lato Forge; body viewer ignorato/rifiutato |
| W04 ConfiguraWeb | Invitati autenticati, email e revoca | Email risolve utente specifico, record scoped/versionato/scadente; revoca durante await nega emissione |
| W05 ConfiguraWeb | Pubblico con avviso costo | Accesso pubblico esplicito, bearer mint solo al server e dopo autorità corrente |
| W06 ConfiguraWeb | Solo ElevenLabs, voce applicata | Risorsa esistente privata e mapping agente, nessuna sostituzione con vecchio Live OpenAI |
| W07 ConfiguraWeb | Diff/Salva/Applica/Annulla | CAS prima/dopo await, identity/policy/invito/mapping cambiati negano vecchia richiesta |
| W08 ConfiguraWeb | Pausa conserva link e mostra pagina in pausa | Nega nuove sessioni; non promette revoca retroattiva del bearer già emesso |
| W09 ConfiguraWeb | Microfono, avvia/parla/chiude, errori | HTTPS/browser permission e adapter ElevenLabs, cleanup stream/socket, errore chiaro; evento terminale persiste |

## Vecchio Forge

`origin/main:web/src/pages/agent/Voice.tsx` e `web/src/lib/api.ts` hanno una lista delle sessioni via `/agents/:slug/voice/sessions` (id, agentId, conversationId, status, created/updated). Si riusano l'ownership, la registrazione e lo storico, non si presenta quella lista come prova di chiamata sana. Non contiene configurazione Telefono/Web, durata/direzione, audio o transcript, né widget `/parla`.

`services/voice/src/routes/voice.ts`, `services/voice/src/services/voice.service.ts` e repository verificano HMAC sul raw body ElevenLabs, risolvono l'agente dalla conversazione registrata, persistono prima dell'inoltro X9, usano Vault per agente. Riutilizzare tale pipeline e la registrazione canonica. Non sostituire routing con agent_id dichiarato nel webhook. La lettura storica richiede auth e proprietà, la callback tecnica solo auth interna canonica.

La scheda attuale `ChannelsStatus/ChannelsView/channel-doors.ts` separa carico/runtime/storia e usa scope utente/slug/revisione; estenderla è lavoro di B. PhoneConfiguration F0 fornisce lettura R4 e numero/routing sconosciuti; WebVoiceConfiguration F0 fornisce la proiezione di osservazioni runtime, non link o sessione. C riusa funzioni pubbliche/checkpoint assegnati, non riscrive il kit, i drawer o lo shell.

Vecchio X9 Live `/live/web/` + `/live/web/session` è WebRTC OpenAI con bearer globale e agent_id opzionale. Riusare dove pertinente cleanup, ciclo audio, riconciliazione, prompt/context/voice_call e provider adapter; non equivale alla tavola ElevenLabs owner/invitati/pubblico. X1 ElevenLabs `cffa52b6` riusa HttpElevenLabsProvider per discovery e verifica/preparazione della risorsa privata esistente; non crea una risorsa nuova. Ha test nativi ma qualifica mutazioni incompleta (6/68 nel checkpoint letto): assegnare la chiusura prima di dichiarare quel lotto completo.

## Catena Forge + X9 e difetti verificati

**Telefono.** Forge auth/ownership → snapshot C2 trustedAccess → cap-voice configurazione/receipt → runtime agent-core (identità, loaded, archivio) → linea/routing cap-voice-live → ammissione Rubrica corrente → pipeline esistente cap-voice brief/identity/provider → media → post-call voice-svc/riconciliazione. C2 attuale contiene sharedNumber, routing, snapshot, preview/apply CAS e routeResult. Non contiene B3 Rubrica telefonica/outbound. AgentChannelAddressBookSchema ha solo emails. L'evento route C2 presume firma già verificata: il Telnyx webhook esistente verifica Ed25519 ma non implementa selettore inbound né ammissione. Il selettore agente deve avere meccanismo operativo attestato (DTMF/IVR reale, non mapping inventato); prima del turno si risolvono linea/routing univoco e numero, poi gate. Nessun fallback al Master.

**Web.** Browser → facade Forge/sessione/login/membership/invito → tentativo server-owned → issuer cap-agent-elevenlabs → callback Forge prima e dopo await → identità D/lifecycle/origin/policy/link/provider mapping freschi → signed URL breve → browser → registrazione/storico finale. In v1.44 `web-context.ts` sostituisce identità con z.null e la response ammette solo ok:false; successo impossibile. Gli endpoint C3 sono S2S e non definiscono facciata browser o HTTP inviti. Il link pubblico è già canonico `/parla/:linkId`. App.tsx ora è interamente dietro Login: B deve montare la pagina pubblica e non applicare lo stesso gate a policy public. Il browser non invia un viewer/owner autoritativo, Forge lo ricarica dal proprio server. Signed URL è un bearer: si trasmette solo nella risposta all'ammesso, non in log, storico, screenshot o URL stabile.

**Identità e parsers.** Importare AgentContextIdentitySchema verificato di D, correlare tenant/owner/runtime/management/vault; usare ruoli Master/erede senza inventare tenant/global env. La composizione VoicePrepareCall legacy usa env.FORGE_AGENT_ID anche per owner: il ramo moderno deve consumare la stessa autorità per-call della pipeline voice_call, mantenendo legacy separato e negando configurazioni moderne incomplete. `packages/types/src/agent-context.schema.ts`, agent-manager e i reader channel-access devono validare/preservare optional phoneConfiguration senza riscrivere schema. I campi extras passthrough non attestano autorità.

**Storico.** calls/voice-webhook-events e riconciliazione sono writer esistenti; audio_retention_allowed=false non autorizza audio. Snapshot pubblico storico separato, limitato/scoped, no raw analysis/segreti. Direzione/durata/conclusione necessitano eventi reali. Se un provider non offre il contenuto o retention lo elimina, UI esplicita l'assenza senza bottone finto; il percorso Ascolta/Rileggi va verificato quando il contenuto esiste.

## Ordine di esecuzione e lotti

Ogni lotto massimo 45 minuti/3 tentativi, un solo repo e worktree assegnato per volta. Prima di test X9 install --frozen-lockfile --prefer-offline; toolchain nativa Node24; test nativi worker1 e un comando pesante alla volta. Nessun deploy, chiamata vera o provisioning a pagamento da C.

1. **B0a bridge telefonico:** aggiunta compatibile phones opzionale al libro contatti; completezza telefonica non dedotta dalla sola email; E.164 stretta, univocità, freshness/scope; ammissione inbound/outbound che richiede snapshot applicato, lifecycle/loaded, attestation/line/routing e richiesta uscente esplicita correlata. No controller duplicato, no tipi HTTP locali.
2. **B0b bridge identità web:** sostituire il placeholder con schema D; response successo/discriminata e helper di correlazione coerente; failure legacy e diagnosi senza falso successo. Test per tutte le identità/tenant/owner/role e cambi dopo await.
3. **B0c bridge facciate/inviti/storico:** contratti browser separati da S2S, preview/apply scoped, issuer/sessione pubblico con solo link/correlation dal browser, inviti email→record server autenticato, proiezione pubblica senza autorità o bearer superfluo. Contratti storia/test-call; riuso chiamate canoniche. Review indipendente; nessun bump package/tag da C, 1.45 integrata con F dalla coordinatrice.
4. **X1 telefono:** producer C2 in cap-voice + gates alla pipeline già esistente, cap-voice-live firma/linea/selector/media, sources/receipt come C1; core lifecycle/identità. Snapshot+receipt sono fonte UI, non dichiarazioni optimistic. Test/qualifica prima consumers.
5. **X2 web:** riuso X1provider verificato, mappingStore persistente per policy/link/inviti/tentativi dove competente, auth client callback Forge per-call, sessione/retention/status/policy/catalogo reali. Recheck dopo ogni await, niente creazione risorsa implicita per un semplice GET.
6. **F1 Forge server:** facciate canoniche ownership/CSRF/rate-limit/sessione, authority callback su server-owned attempt persistente; source Rubrica Conoscenza integrato senza secondo address book; history riusata. Timeouts/abort e ricevute validati prima risposta/UI.
7. **F2 Forge web:** PhoneChannel/WebChannel isolati, moduli configurazione/sessione/storico e client canonici; mount/header/drawer comuni B. UI corrispondente alle 42 righe, desktop/mobile/keyboard e risposta rete; Browser fixture distinta dal vivo.
8. **Accettazione integrata:** controllo 2 su nuovi pin/versioni da coordinatrice, review altro Codex, fatti reali e prova live X9+Meditation; poi SUMMARY R-34 con evidenze di ogni riga. Canali non consegnato al 100% prima di questo.

## Elenco ESATTO file — bridge da assegnare subito

Questo elenco è la proposta di perimetro richiesta dalla coordinatrice 191632, non permesso a scrivere nel checkout attuale. Le nuove definizioni viaggiano esclusivamente negli export del bridge; modifiche ai barrel sono soltanto righe C, unite dalla coordinatrice. Nessun vault index necessario. F non tocca i file C, C non tocca Modelli.

```text
src/agent/agent-channel-access.ts
src/agent/agent-phone-admission.ts
src/agent/agent-channel-history.ts
src/agent/index.ts
src/capability/agent-elevenlabs/web-context.ts
src/capability/agent-elevenlabs/web-browser.ts
src/capability/agent-elevenlabs/web-invitations.ts
src/capability/agent-elevenlabs/index.ts
src/http/endpoints/forge-agent-phone-channel.ts
src/http/endpoints/internal-agent-phone-channel.ts
src/http/endpoints/forge-elevenlabs-web.ts
src/http/endpoints/internal-capability-elevenlabs-web.ts
src/http/endpoints/forge-agent-channel-history.ts
src/http/endpoints/internal-agent-channel-history.ts
src/http/endpoints/index.ts
tests/agent/c5-phone-address-book.test.ts
tests/agent/c5-phone-admission.test.ts
tests/agent/c5-channel-history.test.ts
tests/http/c5-web-identity.test.ts
tests/capability/c5-web-browser.test.ts
tests/capability/c5-web-invitations.test.ts
tests/http/endpoints/c5-phone-outbound.test.ts
tests/http/endpoints/c5-web-forge.test.ts
tests/http/endpoints/c5-web-invitations.test.ts
tests/http/endpoints/c5-channel-history.test.ts
tests/cjs/c5-phone-web-smoke.mjs
.planning/phases/c5-canali-tel-web/PLAN.md
.planning/phases/c5-canali-tel-web/SUMMARY.md
.planning/phases/c5-canali-tel-web/proof/**
```

File già presenti agent-phone-channel/commands, web-channel/session/catalog e identità D si **importano**, non si riscrivono. Se il contratto browser richiede semantica attività che non può essere espressa senza modificare web-channel, prima richiesta puntuale di estensione perimetro; non confondere off e pausa.

## Elenco ESATTO file — proposta X9 successiva, da assegnare dopo bridge

Questo elenco identifica i moduli del percorso completo. Nessun permesso X9 fase2 finché la coordinatrice non stabilisce base/perimetro e pin disponibili. Read-only Env.ts solo per i nomi non segreti, nessun .env letto o modificato; configurazione nuova eventuale richiede perimetro.

```text
services/cap-voice/src/app.ts
services/cap-voice/src/index.ts
services/cap-voice/src/routes/phone-channel.ts
services/cap-voice/src/channels/phone-channel-source.ts
services/cap-voice/src/channels/phone-channel-backend.ts
services/cap-voice/src/channels/phone-receipt-store.ts
services/cap-voice/src/channels/phone-admission-client.ts
services/cap-voice/src/routes/voice-prepare-call.ts
services/cap-voice/src/tools/voice-call.ts
services/cap-voice/src/routes/channel-history.ts
services/cap-voice/src/persistence/channel-history.ts
services/cap-voice/src/__tests__/c5-phone/**
services/cap-voice-live/src/app.ts
services/cap-voice-live/src/routes/telnyx-webhook.ts
services/cap-voice-live/src/routes/call-start.ts
services/cap-voice-live/src/routes/stream.ts
services/cap-voice-live/src/phone/inbound-router.ts
services/cap-voice-live/src/phone/shared-number-source.ts
services/cap-voice-live/src/__tests__/c5-phone/**
services/agent-core/src/core/agent-manager.ts
services/agent-core/src/core/channel-inventory.ts
services/agent-core/src/channels/channel-access-source.ts
services/agent-core/src/tests/c5-phone-context.test.ts
services/cap-agent-elevenlabs/src/app.ts
services/cap-agent-elevenlabs/src/index.ts
services/cap-agent-elevenlabs/src/web-provider.ts
services/cap-agent-elevenlabs/src/web-authority-client.ts
services/cap-agent-elevenlabs/src/web-channel-service.ts
services/cap-agent-elevenlabs/src/web-channel-store.ts
services/cap-agent-elevenlabs/src/web-session-issuer.ts
services/cap-agent-elevenlabs/src/__tests__/c5-web/**
.planning/phases/c5-canali-tel-web/PLAN.md
.planning/phases/c5-canali-tel-web/SUMMARY.md
.planning/phases/c5-canali-tel-web/proof/**
```

Nuovi moduli storici interrogano writer esistenti, non nuova tabella speculare. Schema/retention/migrazione solo se lacuna provata e autorizzata separatamente. AgentContext type package non si tocca se import canonico e passthrough conservano correttamente; eventuale estensione con prova rossa prima richiesta. Provider.ts X1 già riusabile, evitare modifica se web-provider può usare call protetta. Env, manifest, compose e vendor non compresi: nomi/config/pin a cura coordinatrice.

## Elenco ESATTO file — proposta Forge successiva

```text
services/workspace/src/routes/phone-channel.ts
services/workspace/src/routes/web-channel.ts
services/workspace/src/services/phone-channel.client.ts
services/workspace/src/services/web-channel.client.ts
services/workspace/src/services/web-admission.service.ts
services/workspace/src/repositories/web-admission.repo.ts
services/workspace/tests/c5-phone/**
services/workspace/tests/c5-web/**
services/voice/src/routes/channel-history.ts
services/voice/src/services/channel-history.service.ts
services/voice/tests/c5-channel-history.test.ts
web/src/features/channels/PhoneChannel.tsx
web/src/features/channels/WebChannel.tsx
web/src/features/channels/PhoneConfiguration.tsx
web/src/features/channels/WebVoiceConfiguration.tsx
web/src/features/channels/phone-channel-presentation.ts
web/src/features/channels/web-channel-presentation.ts
web/src/features/channels/ChannelConversationHistory.tsx
web/src/lib/api/phone-channel.ts
web/src/lib/api/web-channel.ts
web/src/pages/WebVoiceSession.tsx
web/src/features/voice-web/elevenlabs-session.ts
web/tests/c5-phone/**
web/tests/c5-web/**
.planning/phases/c5-canali-tel-web/PLAN.md
.planning/phases/c5-canali-tel-web/SUMMARY.md
.planning/phases/c5-canali-tel-web/proof/**
```

PhoneConfiguration/WebVoiceConfiguration preesistenti di F/A richiedono assegnazione/riuso esplicito da coordinatrice nel nuovo worktree C. Registrazione dei moduli server nei rispettivi index è raccordo coordinatrice (aggiunte C solo dopo estensione perimetro). Persistenza tentativo/inviti necessaria, repo proposto non dà permesso a inventare storage: riusare DB e source Conoscenza, tabella/migrazione specifica approvata se necessaria. Le rotte sono quelle del nuovo bridge, nessun endpoint/header condiviso scritto a mano.

File comuni riservati a B, **mai edit da C**: `web/src/features/channels/ChannelsView.tsx`, `ChannelsStatus.tsx`, `channel-doors.ts`, comuni drawer/header/actions, `web/src/lib/api/channels.ts`, mount `web/src/App.tsx`; backend comune `services/workspace/src/routes/channels.ts` / `services/workspace/src/services/channels.service.ts` si coordina prima del nuovo perimetro. C propone interfaccia moduli `{slug, source canonica, onRefresh}` senza DTO nuovo: read/write client specifici e mount a B dopo scelta dello scope. Le prove di B devono coprire montaggio vero e route pubblica, non solo import.

## Strategia prove e limiti di produzione

- Contratti: tutte le forme valide e avversarie, compat email/C1/legacy; rejection scope/ID/versione/futuro/freshness/duplicati/numero non canonico/fonti parziali. Ogni controllo nuovo deve essere rotto intenzionalmente; campagne non qualificano errori import, compilazione, timeout, runner o `is not a function` come mutazione funzionale.
- Telefono: HTTP interno/browsers auth, owner/SA/foreign, CAS, linea/selector incompleto, archived/removed/unloaded, firma prima routing, Rubrica stale/change-after-await, richiesta uscente esplicita, idempotenza, nessun side effect nel ramo negato, pause isolata. Chiamata completa significa media aperti e chiusi, identità corretta, evento finale riconciliato.
- Web: owner/invitato/pubblico, sessione scaduta/rubrica e inviti cambiati, origin/link foreign, provider non privato o mapping cambiato, snapshot authority prima/dopo await, timeout/abort, bearer non loggato, nuova policy non cambia link. Browser microfono negato/retry/disconnessione/chiudi/doppio avvio e storia vera; cleanup e no aggiornamento componenti smontati.
- Full native e quality per pacchetto effettivamente modificato, ESM/CJS/consumer; stessa lista SHA prima e dopo mutazioni. Non dichiarare suite non eseguite. Rilettura PLAN/SUMMARY dopo ogni commit.
- Fatti da coordinatrice: versione effettivamente rilasciata X9/Forge, numero globale disponibile, binding/selettore reale X9/Meditation, fonte telefonica Rubrica, callback/pubblicazione `/parla`, HTTPS origin, mapping ElevenLabs privato e credenziali per agente (solo stato/nomi, mai valori), retention/storico. Nessuna chiamata o cambi di produzione da C. Deploy/push/merge e pin rimangono alla coordinatrice con le autorizzazioni di Stefano.

## SUMMARY — consegna sola fase 1

Inventariati codice esistente, cinque tavole, contratti tag v1.44 e base 27749e4; identificate lacune operative e separata preparazione da funzionamento. Riuso Vecchio Forge e X1/C1/R4 esplicito. Definite 42/42 righe della matrice, ordine produttore→consumatori, elenco file per bridge subito e proposte successive Forge/X9. Nessun nuovo codice, nessun test, nessun live, nessun commit applicativo in fase 1. Spesa 135-1 `86066999` e X9 141-1 `2e2f3e1a` restano congelati. Successivo lavoro autorizzato: bridge nel nuovo worktree/perimetro preparato dalla coordinatrice, B0a per primo; task generale resta IN CORSO.

## Fruibilità alla consegna (R-34)

Consegnato il piano del percorso, non il percorso funzionante. 42/42 requisiti mappati nel documento, 0/42 verifiche dal vivo in questa fase. Telefono/Web non ancora al 100%; nessun falso verde per mapping, UI F0 o response schema senza handler. Accettazione finale solo dopo producer, consumer, montaggio, dati veri e prova X9/Meditation.

## Esistente (R-35)

Ricontrollato08/10 alle20:35–20:37 su posta203245. Bridge27749e4 più soli lottiC; Forgeattuale00a468e e vecchio origin/main4f3fc42 letti via Git dai propri worktree congelati135-1/141-1; X9d65f6c91 è build analizzata, non attestazione di rilascio. Prima delle prossime decisioni verificare nuovamente il codice della base producer assegnata.

- **Esiste già?** In parte: C2/C3, voceR4, identitàD, Conoscenza/Rubrica, CAS e correlazione esistenti. B0a/B0b aggiungono telefoni/gate/identitysuccess; B0c1 proiezione4kind, non persistenza; enabled/off assente prima, estensione autorizzata201558. Handler/produttori effettivi non ancora montati.
- **Dove vive oggi:** bridge `src/agent/agent-channel-access.ts:63` libro unico; `src/agent/agent-phone-admission.ts:35,62,75` gate puri sopra C2/R4 importati; `src/capability/agent-elevenlabs/web-channel.ts:9,20,54` policy/change/invitation; `web-session.ts:62,116` gate/sessioncurrent già esistenti; `web-context.ts:5,37,113` identitàD; `src/agent/agent-channel-history.ts:12,64,67,80` nuova proiezione, non writer.
- **Come funziona oggi:** Forge00a468e `services/voice/src/routes/voice.ts:73,88,95,138` firma rawbody→registeredconversationownership→endSession→post-callX9 con credenziali per agente. `services/voice/src/services/voice.service.ts:34,47,54,60` registerResolved usa agenti veri; `repositories/voice.repo.ts:21,36,48,67` registra/chiude/leggevoiceSessions. X9d65 `services/cap-voice/src/app.ts:51,54,57` registra postcall,voice_call,voice_prepare_call; `routes/voice-prepare-call.ts:12,34,36` riusa composeBrief. `services/cap-voice-live/src/routes/telnyx-webhook.ts:38,44,52` verifica firma prima routing. `services/cap-agent-elevenlabs/src/app.ts:24,39` provisioning/status autenticati, non issuerC3 in questa base. X1providercheckpointcffa52b6 si riusa dopo integrazione, non nel worktreeA.
- **Vecchio Forge:** origin/main4f3fc42 `web/src/pages/agent/Voice.tsx:42,89,97` legge sessioni e mostra conversationId; `web/src/lib/api.ts:311,312` usa /agents/:slug/voice/sessions. `services/voice/src/routes/voice.ts:78,93,104,105,139,176,189,210,233,238` firma→sessione registrata→Vaultper-agent→post-callX9, registerautenticato e lettura del proprio agente. `voice.service.ts:17,37` vieta riattribuzione conversationId; `voice.repo.ts:21,46,65` writer/reader esistenti. Non conteneva configurazioneC2/C3 o pagina/parla; una vecchia sessioneactive non prova il canale. Letti solo nomi/metodi nel codice, nessun valoreVault/credenziale.
- **Cosa si riusa:** libro cap-email/Conoscenza unico, identityD, voce applicataR4/C2, policy/link/inviti/sessioneC3, providerX1, firma/rawbody, registeredconversationownership, registrazione/post-callwriter esistenti, guard sessione e authcanonical. Niente nuove tabelle mirrored, parser locale o secondo provider.
- **Cambia come funziona lo stack?** No nei lotti bridge già eseguiti e enabled201558: schemi/gate/lettura dichiarata,0handler/nuoviwriter/effetti. Pathhistory sono contratti nuovi da montare, non flusso operativo. Proposte future web-channel-store/web-admission.repo/persistence/channel-history richiedono decisione coordinatrice/StefanoR35 prima di creare o spostare fonti. Non decidere dove vive policy/link/inviti/tentativi né spostarevoiceSessions dalvoice-svc o duplicare call/post-call. Elenchi file proposti restano subordinati a quella decisione. Domanda203655 inviata; si continua il bridge autorizzato senza inventare storage/producer.
