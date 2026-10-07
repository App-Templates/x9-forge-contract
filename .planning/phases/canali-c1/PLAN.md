# CANALI-C1-X9 — pausa e accessi delle porte Telegram ed email

Codex B · 08/10/2026, 00:41 Europe/Rome. Piano prima del codice. Base immutabile agent-x9 **188d94be3b2c14aebc4ac90fc87dd8659a5a8ef1**, indicata dalla coordinatrice; nessuna modifica al worktree di D. Prima richiesta: contratti mancanti nel bridge e perimetro/worktree dedicati; i consumer non devono inventare contratti locali.

## Risultato e riferimento

Telegram riceve solo le chat ammesse oppure chiunque, secondo la scelta esplicita; `/start` di una chat non ammessa crea una richiesta, mai un permesso automatico. Ammetti, Ignora, Rimuovi e Lascia com'era preparano la revisione che diventa effettiva solo con Salva e applica. Nessun riavvio dell'agente o rigenerazione del bot per cambiare accessi. La pausa ferma lettura e risposte della sola porta, conservando risorsa e credenziali. Email: Solo i mittenti nella Rubrica oppure Chiunque; in pausa le email restano nella casella, senza turno o risposta. Gli altri canali restano attivi.

Fonti di prodotto: [Configura.dc.html](/Users/admintemp/Downloads/Claude/forge-v2-bacheca/design/forge-tavole-0710/project/Configura.dc.html), sezioni Chi può scrivergli, Cosa cambia se salvi e Pausa; [ConfiguraEmail.dc.html](/Users/admintemp/Downloads/Claude/forge-v2-bacheca/design/forge-tavole-0710/project/ConfiguraEmail.dc.html), stesse sezioni; riga C1 di [DESIGN-RIALLINEAMENTO.md](/Users/admintemp/Downloads/Claude/forge-v2-bacheca/piani/DESIGN-RIALLINEAMENTO.md); [FORGE-ARCHITETTURA-IMPOSTAZIONI.md](/Users/admintemp/Downloads/Claude/forge-v2-bacheca/piani/FORGE-ARCHITETTURA-IMPOSTAZIONI.md). Porta/ammissioni/pausa in Canali; modello/voce/budget in Capacità e Modelli; credenziali in Chiavi.

Non comprende creazione o rigenerazione bot/casella (F2/F3), Telefono (C2), voce web (C3), storico completo o prove utente (H1/H2), editor modelli o cambi ai prompt. Il core C1 approvato è entrato nella build Forge **3567f634**; i controlli ancora disattivati non diventano funzionanti pubblicando soltanto X9. Serve anche il lotto consumer Forge qui identificato.

## Fonti congelate e riuso

Le copie sono codice pubblico da oggetti Git, non dati runtime. [SOURCES.json](/private/tmp/codex-b-canali-c1-x9-plan-20261008/SOURCES.json) contiene percorso, base e SHA256 di ogni copia. Letture del worktree M2 solo sulla base fissata; nessun file corrente di D copiato per errore, nessuna scrittura nel suo checkout. STATO.md di root e agent-core letti prima del piano.

| Fonte nella base X9 | Già presente | Cambio necessario |
|---|---|---|
| `vendor/x9-forge-contract-bridge/src/agent/agent-channel-configuration.ts` | Scope/identity, desired/applied versionate, risorse possedute, validazione, gate `shouldLoadAgentChannel`. Assenza configurazioni conserva legacy. | Policy ammissioni e operazioni per singola porta assenti: prima contratto canonico, non extend locale. |
| `vendor/.../agent/agent-channel-attestation.ts`, `http/endpoints/internal-channel-attestation.ts` | Osservazione effettiva con identità/versione/data, endpoint e header canonici. | Estensione additiva per policy effettiva/richieste e comando applica porta; non copiare desired in applied senza evidenza. |
| `services/agent-core/src/channel/telegram.ts:194` | Filtro chat su testo/documento/foto/voce prima degli effetti. Lista vuota o `*` legacy apre a tutti. | Snapshot di accesso effettivo aggiornabile, `/start` intercettato prima del filtro normale, isolamento/revoca anche nei callback sospesi. Nessuna modifica ai prompt. |
| `services/agent-core/src/core/bot-supervisor.ts:161` | Pausa attestata solo dopo rimozione handler; onStart/getMe attestano il bot reale. | Riuso ciclo pausa/ripresa e osservazione. Cambio policy aggiorna il gate senza sostituire bot o inventare getMe come prova utente. |
| `services/agent-core/src/tests/telegram-channel-pause.test.ts` | Pausa/ripresa su reload, risorsa conservata, web ancora attivo, rifiuto context incoerente. | Test originali intatti; nuove prove comando selettivo e policy dal prossimo messaggio. |
| `services/agent-core/src/core/agent-manager.ts:202`, `core/agent-management.ts`, `routes/internal-agent-management.ts` | Identità risolta, loaded context, auth interna, drain e ricevute. | Riutilizzare resolver/auth e serializzazione; non chiamare Stop o reload completo per cambiare una porta. |
| `services/agent-core/src/core/channel-inventory.ts` | Fonte runtime vera e attestation email; unknown su fonte assente/incoerente. | Integrare evidenza del gate selettivo, senza un secondo inventario concorrente. |
| `services/cap-email/src/webhooks/agentmail-inbound.ts:69` | Rilegge context canonico, controlla inbox+destinatario+scope, pausa prima di forward/client provider, legacy primario, firma/dedup del webhook. | Filtro mittente prima del turno/risposta; sola fonte Rubrica autorizzata, niente fallback alle credenziali globali per una porta scoped. |
| `services/cap-email/tests/agent-channel-runtime.test.ts` | Pause/resume e inbox proprie provate con context e provider sintetici. | Aggiungere test in nuovo file; suite esistente invariata. |
| `packages/types/src/agent-context.schema.ts` | Re-export del bridge, nessun schema locale duplicato. | Eventuale re-export additivo solo se il bridge lo richiede, non cambiare ownership dello schema. |

Forge già possiede l'autorità di salvataggio: `services/factory/src/routes/telegram-allow.routes.ts` aggiorna DB desiderato, Applica costruisce e scrive context, X9 legge. La funzione attuale allow-owner è una scorciatoia verso una sola chat, non editor della lista completa o coda `/start`. Non introdurre un secondo writer di context in X9. Questi riferimenti sono copie della revisione C1 verificata in `/private/tmp/codex-b-canali-c1-review-20261008/candidate`, non autorizzazione a editarla.

Ricerca bridge eseguita nei moduli agent/http/messaging della1.41: esistono allowFromCount e telegramAllowFrom, non policy email, lista richieste o comando per porta. La vecchia capability Google Contacts è una sorgente di tool: non dimostra una Rubrica autorizzativa per agente/owner. CONTACTS.md e memoria non sono fonti di permesso. Si mantiene esplicito il gate Rubrica finché il producer canonico di Conoscenza è collegato.

## Contratti prima dei consumer (R-14)

**C1-B · bridge canonico, repository/worktree separato assegnato dalla coordinatrice.** Lotti piccoli per: (a) policy Telegram/email e snapshot di accesso; (b) richieste `/start` e ricevute/operazioni; (c) endpoint interni e facciata Forge. Riusare CapabilityScope, AgentRuntimeIdentity, channel config/attestation e INTERNAL_SECRET_HEADER; nomi finali e percorsi si definiscono nel bridge e i consumer li importano. Le proposte seguenti sono requisiti del contratto, non nuovi DTO X9 o header scritti a mano.

- Telegram: modalità esplicita `approved-chats` o `anyone`; id chat numerico canonico come stringa, tipo private/group/supergroup, nome visuale limitato. Lista esplicita vuota in approved-chats significa nessuno. Policy assente conserva esattamente il legacy; policy esplicita invalida non ricade nel legacy. Le chat ammesse, le richieste e il conteggio appartengono alla medesima identità/versione, mai al token o al processo.
- Email: modalità `address-book` o `anyone`; binding della fonte Rubrica alla medesima scope/identità con versione, completezza e data. Fonte non raggiungibile, scaduta, parziale o incoerente resta unavailable e non autorizza nessuno. Nessuna allowlist testuale parallela alla Rubrica. Il produttore può inizialmente dichiarare unavailable con causa canonica: questo non conta come email Rubrica completata.
- Snapshot distingue salvato da applicato, policy/versione effettiva, observedAt, stato paused/open/unknown e richieste disponibili/unknown. Codici errore finiti sanitizzati, nessun raw payload/provider/stack/credenziale. Assenza fonte non equivale a zero richieste o zero chat.
- Apply della porta usa identità risolta e versione di configurazione già salvata, più versione applicata attesa e requestId. Non accetta credenziali, URL, nuova risorsa, desired context completo, ruolo nel body o arbitrarie liste non salvate. Compare-and-swap, requestId replay/conflict e risposta correlata a porta/scope/versione. Risultato pending/failed non conferma applied; retry della stessa operazione è idempotente.
- Richiesta `/start`: solo id della chat, tipo/nome di presentazione e data; scope server, identificatore e versione monotona della coda. Nessun testo ordinario/allegato/prompt/token memorizzato. Ammetti si finalizza insieme al salvataggio/applicazione della lista desiderata; Ignora chiude la richiesta esplicita. Versione attesa evita di agire su una richiesta o una lista ormai sostituita. Nessun side effect quando la revisione viene annullata.
- Facciata Forge autenticata SA/owner, altro owner403 e anonimo401; endpoint X9 solo auth di servizio e scope verificata. Per consenso/non-leak, le risposte non espongono elenco richieste a un owner diverso. Vecchi context/payload senza campi nuovi continuano a essere validi; campi espliciti non validi restano rifiutati, senza silently stripping.

Nessuna modifica manuale a vendor, pin, lock o manifest consumer. Dopo rilascio/verifica del bridge la coordinatrice allinea la base X9 e il consumer Forge con i perimetri necessari. Non copiare shape future dal piano in packages/types per aggirare questa precedenza.

## Applicazione selettiva nel runtime

**C1-X0 · fonte/identità.** Nuovo modulo di controllo delle porte riceve il resolver management e la lettura canonica del context salvato. Verifica identity/runtime/owner/tenant/kind/version/resource contro l'agente effettivo prima di qualsiasi effetto. Cattura solo la configurazione della porta e policy; non sostituisce modello, chiavi, workspace, turn dependencies, scope policy, memoria o le altre porte. Versione del singolo canale applicata distinta dalla versione generale dell'agente: non attestare un apply globale che non è avvenuto. Se per applicare occorre mutare un contesto completo o reload globale, fermare quel lotto e chiedere estensione precisa.

**C1-X1 · Telegram ammissioni.** Opzione interna al bot fornisce snapshot effettivo dal gate della porta, mantenendo l'attuale bot, adapter e session store. Prima di testo, typing, download, trascrizione, forward, sessione, tool o turno verificare policy e gestione agente. Revoca/pausa arrivata durante un await non autorizza effetti successivi: fence della revisione nei punti di invio/forward. Le operazioni già iniziate non vengono chiamate retroattivamente cancellate; applicazione attesta confine d'ammissione e stato dei lavori in corso. Preservare ammissione management/drain e paths legacy.

**C1-X2 · `/start` e coda.** Riconoscere comando Telegram autentico, incluso suffisso del bot corretto nei gruppi, senza interpretare `/starter` o testo citato come richiesta. Nome è solo presentazione; autorità è chat.id, non username/display name/from.id. Per chat non ammessa e porta aperta salvare richiesta metadata-only prima del filtro del testo, poi terminare senza risposta, forward, LLM o sessione. Chat ammessa mantiene il comportamento del comando già esistente, verificato nella baseline; non creare richieste duplicate. Update replay/repeat non moltiplica la coda. Una chat ignorata può richiedere di nuovo con un successivo `/start` autentico; retry dello stesso update non la riapre. Non inventare un blocco permanente non presente nel prototipo.

Coda persistita in store proprio sotto il dataDir configurato, separata dal context scritto da Forge, con id/scoping server e nomi di file non scelti dall'utente. Scrittura atomica, limiti finiti, per-agente serializzazione e metadati validati al caricamento. File malformato/fonte non leggibile dà unknown/errore, non vuoto. Nessun file runtime reale letto o creato durante lo sviluppo: tutte le prove usano tmpdir sintetici. Nessuna history di conversazione usata per ricostruire permessi.

**C1-X3 · pausa/ripresa Telegram.** Chiudere subito il gate della sola porta prima di attendere lo stop del polling posseduto; usare supervisor/activeBots già esistenti senza restart dell'agente. Conservare token e bot resource, annullare watchdog/restart tardivi. Applicazione paused solo dopo stop riuscito e assenza handler. Resume riusa la stessa risorsa e genera al massimo un handler; stato starting prima di onStart, loaded solo con evidenza reale del bot atteso. Fallimento stop/start resta failed/unknown, senza applied finto o nuova risorsa. Web/email/altro agente e management admission non vengono fermati. Pausa non fa polling per raccogliere richieste `/start`: i messaggi eventualmente trattenuti da Telegram saranno soggetti a gate e dedup alla ripresa, senza promettere cancellazione della coda provider.

**C1-X4 · email.** Preservare verifica firma, dedup, inbox+destinatario+scope e rilettura fresca già implementati. Filtro del mittente normalizzato da envelope firmato prima di forward, tool/client/send: anyone esplicito ammette; address-book richiede risoluzione canonica della Rubrica dello stesso agente. Nessun match fuzzy, display-name o dominio come prova d'identità. Unknown/errore di Rubrica non apre la porta; non inviare risposte a chi è escluso. Nessuna cancellazione email o nuova inbox. Riconfermare snapshot/versione prima della risposta dopo il turno per non inviare dopo pausa/revoca. Contratto e producer Rubrica mancanti devono essere collegati nel lotto Conoscenza, con gate esplicito fino ad allora; preservare il primario legacy solo quando manca la nuova policy e senza fallback da una policy esplicita.

**C1-X5 · route/bootstrap/inventario.** Registrazione in composizione reale, auth interna con controllo assente/errato/multiplo; parser canonici per params/body/response. Backend risolve management→runtime, non fallback al primario. Lettura effettiva dal gate Telegram e resolver email; non trasformare semplice presenza di indirizzo/token/config in salute o ammissione applicata. Email resta producer della sua attestation; agent-core orchestra e valida la ricevuta canonica, senza inventare che l'handler remoto ha applicato una versione.

## Trasversalità (R-31)

Identico percorso per qualunque agente, owner e dominio supportato; nessuno slug x9-staging/meditation, id55, owner fisso, email personale o eccezione di progetto. Il primario usa soltanto il mapping canonico dichiarato già nel management; un legame con le chiavi del Master non concede accesso alla sua porta o alla sua coda. Gli esempi visuali del prototipo non diventano valori di runtime. Procedure/persona/prompt, confini Guided-Meditation, tool consentiti e memoria restano fuori dal perimetro.

Fixture A/B con due owner e tenant distinti, più caso stesso owner/due agenti: stessa chat o mittente può essere ammesso su A e negato su B. Operazione su A non modifica risorsa, policy, request queue o readiness di B; anche con requestId uguale. Test sul mapping primario distinto dal runtime, collisioni e identità incoerenti. Un altro dominio usa il medesimo pipeline e contratti, senza riavviare o bypassare gate.

Ruoli si provano nel consumer Forge: SA, owner proprio, altro owner, anonimo; gli ultimi due producono zero chiamate X9/DB writer/provider. X9 autentica il servizio e verifica scope salvata/effettiva, non inventa Clerk o ruolo dal body. Callback/UI stantie non possono applicare una nuova identità/versione. La Rubrica è autorizzata allo stesso scope, non globale perché la capability dispone di una credenziale.

## Lotti, prove rosso→verde e mutazioni

Ogni lotto massimo45min o3 tentativi falliti: checkpoint/SALTATO con motivo e residuo, poi parte indipendente successiva. Test prima del codice e osservati rossi, una mutazione semantica per ciascun controllo nuovo con AssertionError/prova d'effetto, ripristino SHA e verde. Errore d'import, timeout o test che sopravvive non accreditato. Un solo comando pesante, worker1, niente file parallelism/cache del runner; suite originali conservate. PLAN/SUMMARY riletti dopo ogni commit, uno per modulo/controllo atomico con i suoi test. Niente test mirroring o nuove soglie percentuali senza denominatore.

| Lotto | Test pianificati | Mutazioni pianificate |
|---|---|---|
| B1/B2/B3 bridge · ciascuno≤45min | Schema additivo/legacy, identity/scope/version, policy vuota/anyone, strict unknown, request duplicate/CAS/replay, safe errors, endpoint/headers, response correlation. | Togliere ogni nuovo refinement/gate/auth/correlation uno alla volta; verdi inutili esclusi. |
| X0 fonte/apply ·≤45min | Fonte desiderata diversa da effettiva, versione stantia, unknown, identity A/B, nonchannel fields invariati, idempotenza e conflitto requestId, fallimento fonte senza side effect. | Bypass scope/CAS/schema/overlay/correlation e associare test concreto. |
| X1 admission ·≤45min | Testo/documento/foto/voce ammessi/negati/anyone/esplicita lista vuota/legacy, next-message senza bot replacement, revoca durante await, agente fermo. | Saltare filtro per ciascun ingresso, fallback legacy invalido, fence/agent gate. |
| X2 requests/store ·≤45min | `/start`, suffix corretto/errato, gruppi/private, replay/repeat/ignore/re-request, store restart/malformed/limiti/crossscope, zero turno/forward/session/reply. | Auto-admit, parser troppo largo, dedup, namespace, stale queue, metadata/body leak, falso vuoto. |
| X3 pause/resume ·≤45min | Stop ritardato/fallito, start fail/late onStart/restart watchdog, request replay, altre porte/agente invariati, risorsa preservata, paused boot. | Applied prima stop/onStart, globale stop, resume duplicato, resource replacement, callback stantia. |
| X4 email ·≤45min | Firmato vs invalido, exact inbox/recipient, mittente proprio/estraneo, source incomplete/stale/down, legacy, pausa/revoca prima reply, due owner, zero creazione/distruzione. | Bypass signature/binding/paused/admission/freshness, fallback globale, risposta dopo revoca. |
| X5 integrazione ·≤45min | Fastify reale e bootstrap: auth missing/wrong/multiple, params/body invalidi, unknown agent, policy reads e apply canonici, inventario unknown distinto da empty, botless e scoped primary. | Togliere route registration/auth/parser/resolver/effective-observation e vedere la specifica prova rossa. |
| F consumer separato ·≤45min per modulo | SA/owner/altroowner/anon, lettura lista/coda, preview/annulla/CAS/Salva e applica, pending/failed/retry, focus/tastiera, niente switch identità durante async. | Ownership, CAS, busy/fence, pending→fake applied, editor duplicato. |
| Q qualità ·≤45min | Complete agent-core/cap-email e build/tsc/lint nativi previsti dai manifest; scope/protected/hash/pin, mutazioni finali legate al SHA prodotto, review indipendente. | Nessuna nuova prova dichiarata senza ultimo SHA verificato. |

Questa è una matrice futura: **0 test prodotto nuovi eseguiti nel lotto piano**. Numero di casi/controlli e denominatori si ricavano dall'implementazione, non da questo elenco. Le prove già consegnate C1/U3U4 non vengono risommate come copertura runtime o live.

## Perimetri proposti e precedenze

**Bridge prima**, solo repo canonico con worktree/perimetro assegnato separatamente: nuovi moduli `src/agent/agent-channel-access.ts`, `src/agent/agent-channel-access-requests.ts`, `src/http/endpoints/internal-agent-channel-access.ts`, `src/http/endpoints/forge-agent-channel-access.ts`, export index relativi, estensioni additive channel config/attestation/context e test dedicati, `.planning/phases/canali-c1/**`. Se la definizione finale riusa meno file si restringe. La release/versione/package è della coordinatrice salvo incarico preciso; X9 non scrive vendor o pin. Eventuale contrato Rubrica producer deve essere assegnato/concordato con Conoscenza, non simulato dal prompt.

**X9 dopo bridge**, branch `codex/canali-c1-x9`, base188d94be più allineamento bridge curato dalla coordinatrice:

```
services/agent-core/src/channels/**
services/agent-core/src/routes/internal-agent-channel-access.ts
services/agent-core/src/channel/telegram.ts
services/agent-core/src/core/bot-supervisor.ts
services/agent-core/src/core/channel-inventory.ts
services/agent-core/src/index.ts
services/agent-core/src/tests/canali-c1/**
services/cap-email/src/channels/**
services/cap-email/src/webhooks/agentmail-inbound.ts
services/cap-email/src/app.ts
services/cap-email/tests/canali-c1/**
.planning/phases/canali-c1-x9/**
```

Limitazioni dei file esistenti: telegram.ts solo opzione/gate/comando `/start`/fence, non turno/prompt; supervisor solo collegamento applicazione porta e callback tardive; inventory solo evidenza gate; index solo composizione/registrazione/hook di Telegram. Quest'ultimo si sovrappone al perimetro M2 di D: integrazioni coordinate, nessuna fusione/copertura manuale delle sue modifiche. Email webhook solo invocazione gate/fence prima degli effetti, app solo registrazione. Preferire nuovi moduli con responsabilità limitata. agent-manager, management, turn processor, adapters, model cache/router, existing tests/harness, packages/types, package/lock/workspace config, env, manifests, workspace/procedure/memory e vendor restano protetti. Se un hook necessario ricade altrove, chiedere file/hunk preciso e continuare il lotto indipendente.

**Forge consumer distinto**, worktree nuovo dopo X9 verificato, dalla build C1 integrata. Proporre separatamente web channels/client canonico/tests e server factory/workspace channel access routes/services/repositories + riuso Apply/context writer, scoping e migrations solo se necessarie e concordate. Non editarli nel lotto X9 né riaprire il worktree103-1 congelato. Senza consumer/persistenza autorevole collegati, le azioni C1 restano disattivate con causa. Senza producer Rubrica, email address-book resta gate esplicito; non si dice Canali100%.

## Scelte da confermare e consegna del piano

1. **Precedenza concreta:** bridge access/policy/requests mancante; chiedo alla coordinatrice worktree canonico prima, poi X9. Scelta di chi realizza i contratti e release nella sua risposta. Intanto analisi/lotti indipendenti possibili, nessun tipo shared locale.
2. **Rubrica:** il prototipo richiede la fonte Conoscenza. Oggi non attestata nella base letta; serve producer scoped/versionato condiviso con il lotto Conoscenza. Fino a quel collegamento, address-book è unavailable, senza ammissioni inventate.
3. **Pausa e `/start`:** riuso del polling fermato già esistente. Nessuna promessa di raccolta mentre pausato o cancellazione update provider. Retry stesso update deduplicato; nuovo `/start` dopo Ignora può creare nuova richiesta, come richiesta esplicita del prototipo.
4. **Nessun riavvio per policy:** l'attuale allowFrom catturato al boot non basta. Il gate dinamico deve applicare solo policy della porta e attestare questa versione; le altre configurazioni desiderate non diventano applicate accidentalmente.
5. **100% e live:** completamento include bridge+X9+Forge+Rubrica e verifica indipendente. Le prove utente/provider reali sono lotti H1/H2/integrazione autorizzati; nessun messaggio/email/chiamata inviato, nessuna credenziale o dato personale letto in questo sviluppo.

Implementato nel lotto piano: documento e manifest di fonti pubbliche. Test/build/lint prodotto: non eseguiti e non richiesti per un piano di sola lettura. Verifiche documentali e relative prove contrarie stanno in `/private/tmp/codex-b-canali-c1-x9-plan-20261008/PLAN-PROOF.json`, con denominatori effettivi. Richiesta-perimetro via posta prima del codice. Nessun push, merge, deploy o scrittura in altri worktree.


## Assegnazione bridge 00:42

Worktree109-1, branchcodex/canali-c1-b, base5034eef5. Perimetro perimetri/codex_canali-c1-b.txt della bacheca. La policy viene aggiunta facoltativamente nella configurazione della porta: la schema context WithChannels già la contiene. Snapshot compositivo riusa configurazione/attestation esistenti, senza modificare file attestation/context fuori perimetro. Release/versione1.42 della coordinatrice. B1policy/config; B2requests/snapshot/receipts; B3HTTPfacade, ciascuno≤45min. PianoC2 solo preanalisi in tmp, fermato dopo assegnazioneBridge.
