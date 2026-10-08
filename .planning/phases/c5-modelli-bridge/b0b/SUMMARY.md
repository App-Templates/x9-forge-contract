# Chiavi alla nascita — checkpoint sospeso

B0b sospeso alle 19:14 dopo lo stop dei consumer della nascita comunicato da A e B. Richiesta 191422 alla coordinatrice per confermare il congelamento. Tutti i sorgenti sono ripristinati; il ramo Modelli torna pulito a `27749e4`. Il lavoro privato è conservato integralmente nel workspace, senza cancellazioni o pubblicazione.

Implementati i contratti metadata-only preview/bind/receipt, autenticazione interna canonica, scope e tre ID, snapshot opaco, confronto dell'intero intento e birthId UUID distinto da jobId. Nessun valore di chiave o applicazione al runtime.

Prove: 562/562 mirati in tre file (354 nuovi e208 precedenti); baseline iniziale303/338 asserzioni rosse e35 già verdi. Correzione UUID:8/8 asserzioni rosse prima del cambiamento. Mutazioni valide60/62, due residue: primi30controlli su354test, altri30su357test dopo tre nuove prove di correlazione coerente della fonte. Ogni controllo accreditato è rosso per asserzione e verde dopo ripristino, con hash intatti. La mutazione61 è interrotta e non accreditata.

Tipi/lint del primo prodotto verdi; controlli finali, build, pacchetto, prove pubbliche e suite completa **non eseguiti** per la sospensione. Prove dal vivo:0. Nessun consumer, pin, endpoint attivo, push o rilascio. Il lotto Spesa B0c è cancellato per ordine Stefano19:05.
