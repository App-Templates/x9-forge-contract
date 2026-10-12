# BRIDGE-CATALOGO-RAG-1210

## Esistente (R-35)
**Esiste già?** Sì: generatore Python, catalogo canonico e test portabili.
**Dove vive oggi:** `scripts/generate-portable-capability-contracts.mjs:1`, `src/capability/portable-contracts.ts:112`.
**Come funziona oggi:** il generatore incorpora catalogo e digest nel template Python; le forme gated restano escluse.
**Vecchio Forge:** non esisteva: il catalogo portabile Python è un artefatto del bridge, senza pagina Forge.
**Comportamento da mantenere:** tutte le forme RAG/lifecycle portabili già approvate restano ammesse con gli stessi vincoli.
**Cosa si riusa:** generatore, template e test canonici portabili del bridge.
**Si riscrive?** no: si riusa il generatore e il runtime canonico già esistente.
**Cambia come funziona lo stack?** no: verifica della composizione approvata.

## Fruibilità (R-34)
**Aspettativa:** rag_query e lifecycle ordinario mantengono le forme portabili già approvate.
**Tavola:** non serve, nessuna UI nuova.
**Prova del percorso dell’utente:** cataloghi rigenerati con identico generatore, import Python e test canonici RAG/lifecycle.

## Passi
1. Confrontare e45f815 e ee648e11: supporto, schema, regole, template e artefatti.
2. Correggere solo una regressione dimostrata; altrimenti documentare la causa e la proposta al consumer.
3. Eseguire test portabili e tipi, consegnare a F per review e alla coordinatrice per controllo 2.
