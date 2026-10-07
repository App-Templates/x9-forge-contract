# CANALI-C1-B — consegna del bridge

08/10/2026 01:35 Europe/Rome · Codex B. Worktree `/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-109-1`, branch `codex/canali-c1-b`, base `5034eef5e54698b16e97466b0f2ac416cf861e66` (1.41.0). Piano approvato dalla coordinatrice nella posta 004234; build privata approvata nella posta 005304. Perimetro `perimetri/codex_canali-c1-b.txt` letto prima del lavoro. Nessun AGENTS.md nel repository; regole globali di Stefano rispettate.

Pronti e testati i contratti canonici di accesso Telegram/email, le richieste metadata-only, gli snapshot e le ricevute, le rotte interne e la facciata Forge. **Questo lotto non installa handler, non abilita la UI e non prova un messaggio reale.** La release 1.42, il collegamento X9/Forge e il producer Rubrica sono passi successivi della coordinatrice. TOS-INSTALL resta al checkpoint precedente per la priorità Canali della bacheca.

Prodotto finale `adb430ddc00fde76ebfcd82afe32f2139fb05b91`; commit delle prove `b59081a31dc15ed41c4a6e062a59388c0e8e61ac`. Il commit successivo contiene solo questo SUMMARY e l'audit. Nessun push, merge, deploy o cambio versione/pin. Pubblicazione ed integrazione attendono la revisione indipendente di un altro Codex.

## Componenti, riferimento e stati

| Componente | Elemento del prototipo | Stati rappresentati e vincoli |
|---|---|---|
| Policy Telegram, `agent-channel-access.ts` | Configura.dc.html: «Chi può scrivergli», chat ammesse e Rimuovi | `approved-chats` / `anyone`; lista esplicita vuota chiusa, identità numerica private/group/supergroup, nomi solo di presentazione. La lista rimane disponibile quando si sceglie Chiunque. |
| Policy email e fonte Rubrica, stesso modulo | ConfiguraEmail.dc.html: «Solo i mittenti nella Rubrica» / «Chiunque» | `address-book` / `anyone`; fonte complete/partial/unavailable con scope, identità, versione e data. Solo match esatto normalizzato; fonte assente/scaduta/incoerente non ammette. |
| Campo additivo `configuration.access` | «Cosa cambia se salvi», Attivo/Pausa | Policy desiderata separata dall'effettiva precedente o null; versioni e osservazione reale già canoniche. Con policy esplicita la risorsa deve appartenere anche alla stessa identità vault. I vecchi context senza access restano leggibili. |
| Richieste/snapshot, `agent-channel-access-requests.ts` | `/start`, Richieste, Ammetti/Ignora | Available / unavailable / not-applicable; id/chat/update unici, limiti finiti, CAS della coda. Nessun messaggio ordinario o credenziale nel DTO. Le operazioni sono intenzioni staged. |
| Comando e ricevuta, stesso modulo | «Salva e applica» della singola porta | Applied / pending / failed, replay esplicito e correlazione completa di scope, porta, id richiesta, versioni e operazioni. Applied richiede evidenza effettiva, non una copia dell'intenzione. L'idempotenza dello store sarà responsabilità del producer. |
| Endpoint interni | Applicazione senza riavvio dell'agente | GET snapshot e POST apply, autenticazione di servizio esistente, parametri strict e percorsi validati; soli contratti, nessun nuovo client/handler. |
| Facciata Forge | Anteprima, «Lascia com'era», «Salva e applica» | Sessione Forge SA/owner+tenant da fonte fidata, draft strict/CAS, preview distinta dall'applicazione. Nessun writer o effetto nel parser; annullare non invia un comando. Handler/401/403 da provare nel consumer. |

I tipi condivisi restano nel bridge e sono esportati dai subpath pubblici `/agent` e `/http`. Il root mantiene i suoi export esistenti. Nessuno schema locale nei consumer, nessun header duplicato, nessuna eccezione per x9-staging, meditation, un owner o un id fisso. Le fixture sono sintetiche e non accedono a dati runtime.

## Commit e prove prima del codice

| Lotto | Commit | Rosso osservato | Verde finale dedicato | Controprove finali |
|---|---|---|---|---|
| B1 policy/config | `575303e6a799482ff902e17ce6c1061940adbf9a` | 52/56 con AssertionError; quattro invalidi già respinti dal vecchio contratto | 64/64, incluso Q1 | 50/50 |
| B2 richieste/snapshot/ricevute | `bef8f8c8a9840884ad90b5140b8247abb3d5609f` | 57/57 con AssertionError | 73/73 | 83/83 |
| B3a HTTP interno | `ccd3f2e` | 10/10 con AssertionError | 10/10 | 18/18 |
| B3b facciata Forge | `fe9a8fd` | 19/19 con AssertionError | 29/29 | 54/54 |
| Q1 identità della risorsa | `adb430ddc00fde76ebfcd82afe32f2139fb05b91` | 1/64 con AssertionError, gli altri 63 già verdi | 64/64 (stesso file B1, non sommare) | 1/1 |
| Q2 distribuzione/prove finali | `b59081a31dc15ed41c4a6e062a59388c0e8e61ac` | Consumer reale rosso AssertionError sul pacchetto 1.41 precedente alla build | 102/102 verifiche ESM/CJS | 2/2 guasti sugli artefatti privati, separati dai 206 source |

Un commit per modulo con i suoi test, più correzione puntuale e prove finali; PLAN/SUMMARY riletti dopo ogni checkpoint. Tempi reali e deadline in CHECKPOINTS.json: tutti i lotti entro 45 minuti. Il primo generatore HTTP interno e il primo generatore Forge si sono fermati prima di creare la campagna per errori del generatore (selettore ambiguo/import json mancante): non sono prove rosse del prodotto, né mutazioni accreditate.

I primi giri incompleti sono conservati: policy 49/50 (enum mascherato dal segno), requests 83/84 (maxsafe duplicava Zod4.int), Forge 51/54 (CAS/versione/preview mascherati dalla monotonicità). I witness sono stati isolati, il limite duplicato rimosso, poi ripetuti giri completi. Il giro **finale unico sul prodotto adb430d è 206/206**: 50+83+18+54+1, senza sommare giri precedenti o controprove degli artefatti. Ogni mutante ha una AssertionError, ripristino verde senza skip e SHA identico. Request-sign nel finale apre il gate e viene rilevato direttamente dal caso negativo. Import error, timeout e soli ZodError non sono accreditati.

## Verifiche complessive

- Suite Vitest nativa del bridge: **3185/3185** casi in **137/137** file, zero falliti e zero saltati. Include **176/176** nuovi casi in quattro file; non sommare al totale.
- `pnpm -C <worktree> typecheck` e `lint`: exit 0, lint senza warning. La configurazione nativa di typecheck verifica i sorgenti; i test passano nel runner nativo. Nessuna nuova harness o modifica ai test originali.
- Build nativa ESM/CommonJS nella copia privata: exit 0. Portable DTS: **332/332** file verificati. Consumo dei **45/45** nuovi export runtime in entrambi i loader: **102/102** verifiche.
- Smoke CommonJS originali sul pacchetto costruito: **36/36**, **6/6**, **15/15**, **16/16**, **39/39**, ciascuno con il proprio denominatore e senza duplicarli nella suite Vitest.
- `check:pack` nativo (publint + attw, profilo node16): exit 0. **Un warning publint** sulla condizione types del root; il manifest e gli export root sono invariati. Il profilo originale esclude node10 e ignora false-cjs: non si dichiara compatibilità fuori da quel profilo. Non corretto perché package/manifest sono fuori perimetro.
- Un comando pesante alla volta, worker 1, senza parallelismo dei file né cache Vitest. Nessun provider, server o UI dal vivo esercitato.

QUALITY-PROOF.json lega comandi/esiti/log e artefatti ai **12/12** input source/test identici tra worktree e copia compilata. FINAL-MUTATIONS.json lega le campagne agli SHA finali; i singoli *-mutation-proof.json conservano witness e ripristini. Raw log in `/private/tmp/codex-b-canali-c1-b-mutations` e `/private/tmp/codex-b-canali-c1-b-build-20261008`; le prove essenziali sono committate nel worktree.

## Perimetro e file protetti

FINAL-AUDIT.json confronta la base con il commit delle prove: **0** percorsi fuori perimetro; **3011/3011** blob pubblici protetti identici; **246/246** file originali sotto tests identici. Nessun file sensibile letto. `git diff` sui manifest, lock, workspace, dist, root index, context e attestation non ha differenze. `git diff adb430d -- src` è vuoto: il codice testato non è cambiato dopo il giro finale. L'audit successivo aggiunge solo SUMMARY/FINAL-AUDIT nel perimetro.

La build e le sue pulizie/riscritture operano soltanto nella copia privata approvata; il dist del worktree e la versione 1.41 non cambiano. La coordinatrice rigenererà gli artefatti e pubblicherà 1.42 dopo revisione indipendente. Nessuna scrittura nel checkout principale o in worktree di altri Codex.

## Scelte da confermare e residui

1. **Rubrica:** il contratto della fonte è pronto; Conoscenza deve produrre una Rubrica scoped/versionata autorizzativa. Non si usa CONTACTS.md, memoria o Google Contacts come permesso implicito. Fino al producer, address-book resta unavailable e non ammette nessuno.
2. **Consumer:** X9 deve implementare gate dinamico, coda persistita, applicazione selettiva e fence dopo await; Forge deve collegare salvataggio/applica e guardie sessione/ownership. Le rotte di questo lotto sono descrittori canonici; i controlli della UI C1 rimangono disattivati fino al collegamento.
3. **Legacy:** assenza del nuovo access conserva il percorso precedente; un access esplicito vuoto o invalido non apre la porta. Il vincolo aggiunto sulla risorsa vale per access esplicito, senza alterare il vecchio schema.
4. **Applicato e live:** helper e ricevute provano coerenza dell'evidenza; non sostituiscono l'evidenza prodotta da bot/email reali. Zero prove utente/provider in questo lotto, niente dichiarazione Canali 100%.
5. **Packaging:** warning root su manifest invariato lasciato alla coordinatrice, così come versione/package/dist e allineamento dei consumer. Snapshot costruito per composizione di config/attestation già canonici, senza edit ai loro file fuori perimetro.

## Diario dei checkpoint

### Checkpoint iniziale

08/10 00:45 · B1 preso, scadenza01:30. Base5034eef5, branchcodex/canali-c1-b, albero iniziale pulito; perimetro letto. Nessun AGENTS.md nel repo. Versione1.41 invariata. Piano approvato via posta004234. Test prima del codice, seguiti da mutazioni semantiche e ripristino. Nessun prodotto implementato/testato/live nel checkpoint iniziale.

## B1 — policy/configurazione, 00:56

Implementato: policy Telegram/email esplicite, binding canonico strict, lista vuota chiusa, fonte Rubrica metadata-only scoped/versionata e validità temporale, helper admission; campo access facoltativo dentro la configurazione canonica. Vecchi context privi di access conservati, politica esplicita invalida rifiutata; versione desiderata distinta dalla policy effettiva precedente.

Rosso iniziale:52/56casi falliti con AssertionError per schema/helper mancanti o nuovo campo rifiutato. Poi63/63casi verdi,0skip. Primo giro49/50:chat-type sopravviveva perché il segno dell'id mascherava il controllo enum; esito preservato in policy-first-campaign.json. Aggiunto witness con tipo channel e id negativo; secondo giro **50/50**mutazioni semantiche in UN giro completo, ogni mutante seguito da ripristino63/63 e SHA identici. Prova policy-mutation-proof.json, runner mutate.py/casi policy-mutations.json, lograw privati /private/tmp/codex-b-canali-c1-b-mutations/policy.

Regressione contratti agente **1093/1093**casi, nessun fallimento/skip; typecheck e lint mirato exit0. Non sommare la regressione alle63nuove prove giàincluse. Build completo e suite totale solo alla chiusuraB3. Tutti i conteggi da JSON runner; nessun provider/live eseguito.

Scelte da confermare: Rubrica completa oggi è un contratto per il producer futuro, non sorgente implementata. Membership esatta/normalizzata, partial/unavailable non autorizzano nessuno. Lo snapshot riuserà attestation/config via composizione nel nuovo requests.ts (nessun edit fuori perimetro). Build nativa in copia privata approvata posta005304; dist/versione/package restano alla coordinatrice.

CommitB1 575303e6a799482ff902e17ce6c1061940adbf9a, albero pulito dopo commit. PLAN/SUMMARY riletti. B2preso00:57, scadenza01:42:requests/snapshot/apply receipts prima i test, policyB1noncambia.

## B2 — richieste, snapshot e ricevute

Rosso57/57 conAssertionError per schemi/helper mancanti; poi73/73,0skip. Coda metadata-only con id/update/chat unici, versione e date coerenti; operazioni Ammetti/Ignora staged e CAS; snapshot compositivo con attestation email reale obbligatoria per osservazione; applied/pending/failed distinti, ricevuta completa correlata a scope/porta/versioni/requestId/operazioni. Ruoli/auth lato produttore, non dichiarati nel body.

Primo giro83/84:il maxsafe suupdateId sopravviveva perché Zod4.int giàimpone limite safe. Vincolo duplicato rimosso, prove negativo/frazionario/unsafe int conservate. Secondo giro completo **83/83** con ripristino73/73 e hash, non somma con il primo; requests-first-campaign.json preserva il vincolo sopravvissuto. Prove requests-mutation-proof.json e requests-mutations.json. Uno dei mutanti del secondo giro rendeva il gate sign sempre falso: osservato via AssertionError nei consumer (e ZodError sul parse positivo, non accreditato come witness). Nel giro finale Q il mutante sarà sempre true, per un witness negativo diretto sul gruppo. Tipi e lint mirato exit0. Test full e build nativa previsti dopo i moduli HTTP, nessun provider/live.

Ora registrato correttamente: B2 è iniziato col rosso00:55, prima della nota che diceva00:57; durata effettiva inferiore a45min, deadline01:40. I tempi di prossimi checkpoint verranno letti dall'orologio, non anticipati.

## B3a — rotte interne, 01:15

Rosso10/10conAssertionError, verde10/10. Contratti GETsnapshot e POSTapply sotto/internal/agents/:agentId/channels/:kind/access, auth secret esistente; params strict validati prima della costruzione path, schemi canonici agent e errori riusati. **18/18**mutazioni semantiche, ogni ripristino10/10 eSHAidentici (http-internal-mutation-proof.json). Tipi/lint mirato exit0. Il primo generatore dei casi si è fermato su un selettore ambiguo prima di modificare fonti; corretto il selettore, unico giro completo18/18. Sono descrittori e parser, nessun handler installato, nessuna prova live.

## B3b — facciata Forge, 01:22

Rosso19/19conAssertionError, primo verde19/19, finale29/29senza skip. Sessione Forge SA/owner+tenant soltanto da fonte fidata, distinto dall'auth interna; draft strict conCAS desired/applied eoperazioni della coda; preview con evidenza reale, nessun falso applied. Parser/path/schema riusati, nessunwriter/handler/URLprovider nuovo. Primo giro **51/54**:desired-version schema/CAS epreview-current mascherati dalla monotonicità del draft4vsapplied5. Aggiunti witness con appliednull e versione negativa/frazionaria, e desiredfuture6compatibile col vincolo monotono. Secondo giro unico **54/54**semantico, ripristini29/29eSHAidentici, http-forge-first-campaign.json preserva i sopravvissuti; http-forge-mutation-proof.json riporta il giro completo. Tipi/lintmirato exit0. Test di consumo ESM/CJS scritto e visto rosso AssertionError sulla dist1.41; verrà verificato/committato nel lottoQ dopo build privata. Nessuna prova browser/provider/live.

## Q1 — coerenza della risorsa con policy esplicita

Controprova prima del codice:1/64rosso per risorsa con vaultAgentId diverso dalla configurazione;63/64verdi già. Aggiunto vincolo soltanto dentro access esplicito, preservando il contratto legacy senza questo campo. Verde64/64 e **1/1**mutazione semantica del nuovo gate, ripristino64/64eSHAidentico (resource-mutation-proof.json). Tipi/lint exit0.

## Q2 — giro finale e pacchetto, 01:33

Prodotto adb430ddc00fde76ebfcd82afe32f2139fb05b91: **206/206**mutazioni semantiche inun giro finale sequenziale completo (policy50,requests83,HTTPinterno18,Forge54,resource1). Ogni ripristino verde, hashidentici; FINAL-MUTATIONS.json e singoli proof. Request-sign ora apre il gate, rilevato dal witness negativo diretto. Witness riportati soloAssertionError, rawlog integrali conservati.

Suite nativa completa **3185/3185**test in137file,0skip; include176nuovi in4file, non sommare. Typecheck/lintglobali exit0 senza warning. Build nativa soltanto nella copia privata approvata dalla coordinatrice: ESM+CJS, portable DTS332/332file, publint+attwprofilonode16exit0 (node10fuori profilo), nessuna pubblicazione. SmokeCJSoriginali36/36,6/6,15/15,16/16,39/39. Nuovo consumer pubblico dei45exportruntime: **102/102**assert ESM/CJS; rossoAssertionError sulla dist1.41 prebuild→verde dopo build. Inoltre **2/2**guasti semantici sugli artefatti privati CJS/ESM (lista vuota aperta) rilevati, hash byte ripristinati e102/102verdi per loader. PACKAGE-MUTATIONS.json; questi2non si sommano ai206source. QUALITY-PROOF.json contiene comandi, esiti, SHA diinput/artefatti/log.
