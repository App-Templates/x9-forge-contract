# C5 Canali Telefono/Web — SUMMARY incrementale

Ultimo aggiornamento: 08/10/2026 20:13. Worktree143-1, branch codex/c5-canali-bridge, base27749e4.

## Stato

B0a e B0b implementati e testati nel solo bridge. Il task generale resta IN CORSO: facciate/inviti/storico B0c, producer X9, consumer Forge, montaggio e accettazione dal vivo ancora da completare. Nessun canale dichiarato al100%. File comuni della scheda Canali riservati a B. Spesa135-1/141-1 congelata, esclusa dal rilascio.

Installazione nativa Node24/pnpm9 frozen:235/235 dipendenze riusate,0download. Suite full finale4351/4351 in155/155file,0skip. Qualità nativa typecheck/lint/build/check:pack exit0, configurazione originale; compiled ESM+CJS34/34, smoke CJS originale36/36 e probe originali. Prove JSON/runner in proof/. Nessun bump/pin/tag/push/merge/deploy.

## B0a Rubrica e ammissione

Prodotti b6984d4 (Rubrica) e7df114386ac8544a68464b1b0684f1dc57c692c0 (gate). Nuovi105/105test (21Rubrica+84ammissione), full precedente4320/4320 in154/154file. Campagna finale unica38/38source (6Rubrica+32gate) e2/2compiled con6/6file source/test identici prima/dopo. Baseline Rubrica4rossi/17giàverdi; baseline gate9assertrossi,0errorisecondari sullo scaffold fail-closed con fixture valida.

phones?:E164[]|null non inventa telefoni per il libro email legacy: null/assenza fonte non attestata,[]fonte completa vuota. E.164 esatta/univoca, limite2048 e completezza/freshness/scope/management/runtime/vault. Gate inbound usa policy e voce APPLICATE, lifecycle loaded/nonarchived e attestazione corrente di linea/selettore. Un edit desired pending/failed non sostituisce l'applicato operativo. Outbound solo Rubrica, richiesta esplicita server-owned correlata e TTL<=60sec, generazioni phone/linea/selettore correnti. Public inbound non concede outbound; caller hidden/null negato conservativamente.

Prima campagna327test:7positive invalide per failed:null mancante nella fixture R4; corretta solo fixture, asserzioni intatte, poi327/327. Mutante active-application:2asserzioni funzionali qualificano;2TypeError collaterali ESCLUSI. Nessun import/transform/timeout conta come mutazione funzionale.

## B0b identità web — lotto20:00→20:45

Riusa AgentContextIdentitySchema verificato di D: tenant/owner/runtime esatti, management/vault e Master dell'erede confrontati con identità corrente ricaricata dal server. Response discriminata ammette successo solo con identità nonnull e lifecycle active, richiesta/scope/link/fase correlati. Failurelegacy e helpercurrent conservati: un diagnostic identitynull può essere corrente come correlazione, ma NON è autorità utilizzabile. Nuovo isElevenLabsWebAuthorityUsable richiede anche viewer/origin/versione/tempo correnti e identità canonica identica. Non autorizza da solo politica, invito o risorsa provider: issuer deve ricaricare tutto prima/dopo ogni await.

31/31nuovi test, baseline21verdi/10assertrossi funzionali; regressione mirata168/168 in3/3file. Full finale4351/4351 in155/155file. 14/14mutazioni source qualificate con0errorisecondari e2/2compiled su ESM/CJS; sourceSHA7b57a2666918a4d7aba7544985c9439967b271da763a342c109dc24b9344ff09 ripristinato. Prima mutazione compiled false&& non compilava per narrowing TypeScript: SCARTATA,0qualifica, report preservato; sostituita da negazione compilabile, rosso AssertionError su entrambe le distribuzioni e34/34 dopo ripristino/build. Test expectedIdentityundefined chiamato direttamente per evitare il default JavaScript della fixture, nessuna asserzione indebolita.

## Artefatti generati e perimetro

Su posta coordinatrice200112, dist viene rigenerato una sola volta da F all'integrazione1.45. Dopo prove B0b,100file dist tracked riportati aHEAD e8nuovi generated preservati in/private/tmp/c5-canali-143-generated-0mvo_kdf; distDiffAfter vuoto,0dist committati. B0a ripristinato prima con stessa autorizzazione. Non usare dist HEAD vecchio come prova del nuovo gate: le prove compilate riguardano le build native registrate, la distribuzione finale compete all'integrazione.

## Prossimo passo

B0c: contratti canonici facciata browser separata da S2S, anteprima/applica, inviti email risolti dal server, test-call/outbound, history comune di TUTTI4kind telegram/email/phone/web (B consuma lo stesso DTO). Prima test/scaffold chiuso e rosso funzionale; singola correzione, mutazioni e ripristino. Poi nuovi worktree X9/Forge e pin da coordinatrice. LeaseC fino20:44:38,1commandopesante/worker1; rinnovo prima di altra suite oltre scadenza.

## Fruibilità alla consegna (R-34)

Pronti solo B0a/B0b del bridge per revisione. Piano42/42requisiti mappati;0/42verifiche live,0/2percorsi Telefono/Web completi dalvivo. I gate non autenticano utente/firma provider, non emettono effetti/sessioni, non gestiscono idempotenza o storico: producer e montaggio ancora mancanti. Vecchio Forge e provider esistenti da riusare come PLAN; nessuna risorsa a pagamento creata, nessun dato reale inventato. Il task resta IN CORSO, non CONSEGNATO globale.
