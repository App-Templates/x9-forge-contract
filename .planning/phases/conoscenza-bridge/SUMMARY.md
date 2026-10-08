# CONOSCENZA-U — consegna del solo L1 bridge Rubrica

Ultimo aggiornamento: 16:30. **IMPLEMENTATO e TESTATO localmente; PRONTO PER REVISIONE indipendente.** Prodotto `8652688bf55b06bc691dbd273f8de9171e658907`, branch `codex/conoscenza-bridge`, worktree130-1, base `da99501d14a98ff1a2fa194301fc856eb57aacd0`. Preparazione chiusa16:10; lotto applicativo iniziato16:10:47, limite16:55:47/3 tentativi. Prove finite prima del limite; lotto aggiuntivo di sola qualifica autorizzato162031 non utilizzato.

## Comportamento

Forge Conoscenza è la fonte autorevole della Rubrica. `AgentKnowledgeAddressBookSchema` riusa il book C1 e i campi dell'identità moderna: scope agente/owner/tenant, management/runtime distinti e Vault obbligatorio. Email normalizzate e uniche; `phoneNumbers` obbligatorio array|null, max2048 e unicità, schema E.164 importato dalla voce senza copiare regex. Completo richiede entrambe le liste e versione/data; liste complete vuote sono valide. Partial/unavailable hanno entrambe listeNULL e non autorizzano accesso.

`createAgentKnowledgeAddressBook` è il writer tipizzato senza default; `toAgentChannelAddressBook` valida e proietta sul book C1, conservando identità/metadati/email. `isAgentKnowledgeAddressBookCurrent` richiede fonte completa, binding fidato identico e data corrente: clock e TTL finiti, TTL nonnegativo, nessuna data futura o scaduta. Default60000ms; versione Rubrica propria, distinta dalla versione del canale. Il consumer deve ricontrollare revoche dopo await prima degli effetti.

GET `/internal/agents/:agentId/channels/:kind/address-book`, `kind=email|phone`, autenticazione token e `INTERNAL_TOKEN_HEADER`; `agentId` nel percorso è management ID. Risposta strict `{kind,addressBook}`, correlata da `isAgentAddressBookResponseForRequest` con canale, percorso, fullbinding e freshness. Errori fissi riusati dal C1. X9 non conserva copia persistente della Rubrica; Telegram mantiene lista chat C1. Nessun handler installato da questi descrittori.

## Prove

- Nuovi116/116 casi visti rossi con AssertionError prima codice;116/116 verdi in copia privata e worktree autore. Suite nativa finale env-i Node24.21.0 worker1 **3516/3516 in141file**,0falliti/pending, configurazione/setup/inclusioni storiche invariati. Include3400casi della base +116nuovi, senza sommare le esecuzioni mirate.
- Campagna finale **42/42 guasti sorgente**,100esecuzioni AssertionError; **4872/4872 esecuzioni test dopo ripristino** =42×116, fresh process eSHA di2moduli dopo ogni restore. Le42ricette sono disegnate qui; nessuna somma di tentativi precedenti. Primo taglio scopeagentId era equivalente: nonblank è già imposto dalla identità e uguaglianza runtime; escluso e non accreditato. Secondo tentativo fermato sull'uso partial() incompatibile con schema raffinato: corrette solo ricette del harness e rieseguite tutte42. Rafforzati i soli nuovi test di proiezione con not.toThrow, senza togliere assert. Prodotto immutato durante qualifica.
- **2/2 guasti compilati** distinti JS/CJS, attraverso il vero subpath package: AssertionError e **28/28 controlli freschi dopo ciascun ripristino**, hash compilati identici. Probe pubblico ESM+CJS28/28, nessuna chiamata provider.
- **5/5 chiamate negative TypeScript**,5diagnostici, compilazione valida iniziale e ripristino0. Il primo TS5112 era setup del consumer privato; corretto --ignoreConfig solo su quel comando, non accreditato come rosso semantico.
- Qualità nativa **6/6 exit0**: tipi, lint, build, dichiarazioni portabili, controllo del pacchetto nel profilo storico invariato, CJS storico112/112. Tipo/lint ripetuti sui nuovi test finali conexit0. **340/340 dichiarazioni .d.ts/.d.cts portabili** e1360/1360dist identici alla build qualificata.
- Perimetro **38/38 percorsi prodotto** (6app/test e32dist modificati), **1776/1776 file protetti nondist** e **254/254vecchi test** immutati dalla base. I vecchi test sono compresi nei protetti, non si sommano.1344/1344vecchi percorsi dist preservati,16dist nuovi e16barrel rigenerati. Package/lock/versione1.43 invariati,0file cancellati. **7/7 guasti dell'audit** rilevati con AssertionError e ripristino valido: inventario/cancellazione, perimetro, manifest, vecchi test, protetti, SHAapp eSHAdist.

Primo full3514/3516 aveva solo2listenEPERM nei vecchi test HTTP locali: rieseguito con permesso loopback, finale3516/3516. Rawlog e rapporti restano in `/private/tmp/d-conoscenza-bridge-20261008`; proof compatto/ricette/MUTATIONS/COMPILED/TYPES/QUALITY committati in questa fase. Nessun test storico, C1policy, bridge-client, manifest o copia DTO consumer modificato.

## Resta da fare

Revisione indipendente altroCodex e rilascio bridge della coordinatrice; poi producer Forge, lettori cap-email/X9/telefono e CRUD/CSV/UI Conoscenza in lotti assegnati separatamente. **CONOSCENZA-U complessiva e Canali100% non sono completati. Producer/consumer/UI/live0.** M3 rimane in pausa; Forge106-1 e worktree consegnati128-1/122-1 intatti. Nessun push/merge/tag/versione/deploy. Il posto CodexD-Rubrica viene rilasciato alla consegna.
