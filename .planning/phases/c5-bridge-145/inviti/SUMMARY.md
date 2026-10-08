# Bridge 1.45 inviti — SUMMARY

Ultimo aggiornamento: 22:07 CEST. APPROVE limitato al lotto SDK dell’autore 062dab3175665e91d60591530da6c574538ff67e. Merge locale 35f6e7d sopra 92e669a senza conflitti. Zero riparazioni di prodotto; timer 21:57:19–22:42:19 rispettato. Consegna finale dopo commit di distribuzioni e prove.

## Fruibilità alla consegna (R-34)

Lookup registrato/non registrato/indisponibile separati; pending non conferisce accesso. Draft stretti senza autorità dal browser; lista correlata al binding completo e al tempo; destinatario, revisione, scadenza e revoca riusano C3. Proiezione pubblica senza principal/scope privato. Queste prove sono sintetiche. Zero handler, storage, account, mint o percorsi dal vivo aggiunti: funzionalità utente non completa. I producer devono autenticare il chiamante, risolvere il destinatario dal registro e riattestare scope/revisione/policy dopo ogni attesa prima degli effetti. “Active” nella lista indica stato del record, non prova di ammissione o salute del provider.

## Verifica indipendente

Full nativa: 4708/4708 test, 163/163 file, zero saltati. Incremento di 30 rispetto ai 4678 precedenti. Build finale: 378/378 dichiarazioni portabili. Tipi, lint, pack, probe tipi NodeNext e tutti gli smoke compilati finali: 16/16 comandi oltre full/build, configurazioni originali. Node24.14.1 in ambiente vuoto e worker singolo; compatibilità Node20.20.2. Per ciascun Node: inviti24/24, telefono/Web88/88, history roundtrip16/16, risorse29/29, cancellazione27/27, CJS originale36/36 con fixture annesse.

Campioni F: 5/5 candidati qualificati. Quattro guardie sorgente (binding completo, email destinatario, freschezza lookup, filtro pubblico) hanno prodotto AssertionError funzionali, zero altri errori. Un export mancante ha prodotto AssertionError in 2/2 formati ESM/CJS con build riuscita. Baseline e ripristino sorgenti30/30; ripristino esatto di modulo e barrel2/2. Le 32 mutazioni sorgente e due compilate dichiarate dall’autore non sono tutte ripetute da F; i cinque campioni F sono distinti dalle 15 verifiche F del lotto precedente.

## Integrità e rilascio

Modulo, nuovi test e fixture pubblica esattamente uguali all’autore; barrel esattamente base92 più nuovo export. Altri sorgenti e test uguali alla base92, package/lock/configurazioni intatti; perimetro senza violazioni. Solo16 file dist nuovi/modificati rigenerati, nessuna cancellazione finale. PROOF/SOURCE-MANIFEST conservano comandi, esiti e hash dei raw in cartella nuova; le prove del lotto precedente restano intatte, compresa la sua rettifica sulla sovrascrittura del primo full.

Push/versione/CI/rilascio/pin consumer: coordinatrice, non eseguiti da F. Modelli Forge globale ancora aperto: F0B checkpoint77359d12, baseline132/132 sul pin1.40, zero codice moderno o prove live; richiede pin pubblico1.45 e perimetro relativo. Nessun nuovo lotto C non pronto incluso.
