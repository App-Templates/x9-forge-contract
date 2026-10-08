# C5 Modelli Bridge — consegna locale B0

Prodotto `636f671`, allineamento al main 1.44 `05475816688d5e59fb09d62521193e2e79f08f2c`, branch `codex/c5-modelli-bridge`, worktree 140-1. Lotto 18:19:38–19:04:38 CEST, massimo 45 minuti e tre riparazioni; zero riparazioni al prodotto. Le modifiche sono additive, per la futura versione 1.45 gestita dalla coordinatrice.

## Fruibilità alla consegna (R-34)

Il contratto trasporta per ogni scelta l'origine Master o custom, l'identità completa della fonte, la sua versione e l'ambito owner/tenant/runtime. Il nuovo ingresso obbliga la provenienza e verifica la concordanza con identità e parentela 1.44. Una scelta custom uguale al Master resta custom. Il lettore precedente conserva il comportamento senza provenienza; quando il campo è presente, una dichiarazione malformata viene rifiutata.

Il catalogo separa gli ID scoperti ma non qualificati dalle entry selezionabili tramite `inventory`. Non inventa protocollo, adattatore, funzione o dimensione. Il produttore deve attestare risposta completa, accesso, revoca e generazione delle credenziali: il parser non può verificare questi fatti. Fonte ed eredità sono parametriche; il GlobalVault di gruppo non è costruito.

Questa consegna riguarda il contratto. Pagina Forge, Store, dotazione alla nascita, propagazione, installer e runtime richiedono ancora i lotti consumer. Prove dal vivo: **0**. Nessuna etichetta applied è ricavata dal salvataggio.

## Prove eseguite

- Mirati: **665/665** in **8/8 file**, con **216/216 nuovi** e **449/449 precedenti**, zero fallimenti o test pendenti.
- Prima del prodotto: provenienza **106/168** asserzioni rosse valide e **62/168** già verdi; inventario **32/45** rosse valide e **13/45** già verdi. Due errori Zod di fixture nei nuovi test sono esclusi, corretti nelle sole asserzioni positive e rieseguiti prima del prodotto. Tre ulteriori casi della provenienza sono qualificati con le mutazioni, senza sommarli alla baseline 168.
- Mutazioni sorgente: **30/30** provenienza e **11/11** inventario. Dopo ogni ripristino passano rispettivamente **171/171** e **45/45**. Ogni mutazione ha almeno un testimone AssertionError; nessun errore tecnico è accreditato. Hash originali ripristinati, invariati dopo il merge.
- Tipi e lint dei due sorgenti e due nuovi test: uscita **0**. Compilazione: uscita **0**; dichiarazioni portabili **358/358**.
- Controllo del pacchetto: uscita **0**, profilo invariato `node16 --ignore-rules false-cjs`. Rimane l'avviso noto sull'ambiguità dei tipi CJS dell'ingresso principale sotto import.
- Pacchetto pubblico ESM/CJS: **34/34** asserzioni; **2/2** rimozioni intenzionali dell'export producono AssertionError e, dopo il ripristino, **34/34** verdi.
- Tipi pubblici: **5/5** vincoli qualificati togliendo le direttive di errore atteso, cinque diagnostiche e ripristino verde. Primo avvio TS5112 escluso; TypeScript 6 richiede `--ignoreConfig` per file espliciti. Smoke CJS precedente: uscita **0**.

Prove compatte: FINAL-PROOF, PUBLIC-PROOF e le due MUTATION-PROOF nella fase. RAW-MANIFEST indica posizione e SHA256 di **199** report conservati nel workspace. Gli script delle mutazioni e i probe pubblici sono inclusi.

## Verifiche residue

La **suite completa non è stata eseguita in locale**: cinque posti del semaforo occupati. Su ordine 184810 la coordinatrice pubblicherà il ramo e aprirà una PR in bozza per eseguirla in CI. Finché l'esito non arriva, questa è una consegna locale qualificata, non un'approvazione completa. È inoltre necessaria la verifica indipendente di un altro Codex.

## Perimetro e ordine successivo

Due sorgenti model-router e due nuovi file di test; **0** test precedenti modificati e **0** file rimossi. Nessun consumer, endpoint, pin, gruppo o file segreto modificato. Il merge richiesto incorpora solo versione e CHANGELOG pubblicati, senza riscrivere la storia. Nessun push, merge GitHub, rilascio o deploy effettuato da F.

B0b preview/bind Chiavi alla nascita viene dopo B0; B0c Spesa viene dopo B0b. Nessuno dei due è realizzato qui. Eventuale migrazione Forge Modelli riservata **0014** dall'istruzione 185113; journal gestito dalla coordinatrice.

## Derivati e riproducibilità

Su risposta 185400, **72/72** file dist rigenerati sono conservati in una copia privata e ripristinati ai byte del main 1.44. DIST-RESTORE-PROOF riporta gli hash. Il ramo contiene solo source/test/docs; il dist canonico della 1.45 sarà rigenerato una volta dalla coordinatrice con Node 24.21. I controlli pubblici di questa consegna hanno usato il nuovo compilato, prima del ripristino, non il dist 1.44.
