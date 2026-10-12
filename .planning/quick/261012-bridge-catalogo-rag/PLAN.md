# BRIDGE-CATALOGO-RAG-1210

## Esistente (R-35)
**Esiste già?** Sì: generatore Python, catalogo canonico e test portabili.
**Dove vive oggi:** `scripts/generate-portable-capability-contracts.mjs:1`, `src/capability/portable-contracts.ts:112`.
**Come funziona oggi:** il generatore incorpora catalogo e digest nel template Python; le forme gated restano escluse.
**Vecchio Forge:** non pertinente, nessuna pagina o flusso UI cambia.
**Si riscrive?** No. **Cambia come funziona lo stack?** No: verifica della composizione approvata.

## Fruibilità (R-34)
**Aspettativa:** rag_query e lifecycle ordinario mantengono le forme portabili già approvate.
**Tavola:** non serve, nessuna UI nuova.
**Prova del percorso dell’utente:** cataloghi rigenerati con identico generatore, import Python e test canonici RAG/lifecycle.

## Passi
1. Confrontare e45f815 e ee648e11: supporto, schema, regole, template e artefatti.
2. Correggere solo una regressione dimostrata; altrimenti documentare la causa e la proposta al consumer.
3. Eseguire test portabili e tipi, consegnare a F per review e alla coordinatrice per controllo 2.
