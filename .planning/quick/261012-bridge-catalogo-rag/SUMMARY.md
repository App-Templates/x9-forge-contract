# BRIDGE-CATALOGO-RAG-1210

Confrontati e45f815 (C) ed ee648e11 (composto), rigenerando entrambi con lo stesso generatore/template del composto.
**Forme supported → unsupported: nessuna (0/12).** Tutte le 12 forme supportate hanno descrittori identici.
Restano supportate: ordinarySnapshot, ordinaryToolCall, ragToolCall, ragQueryRequest, ragQueryResponse,
authorityQuery, authorityResponse, emptyConfiguration, ordinaryQuery, ordinaryState, lifecycleRequest, lifecycleReceipt.
Restano escluse (3/3): configuration, lifecycleTransaction, lifecycleAuthority, già gated sulla linea C.
Solo configuration cambia: schema da oggetto a null, customRefinements 11→21 e un ulteriore gate esplicito.
Causa: aggiunta del codec agent-elevenlabs.nativeConfig in `src/capability/ordinary-configuration.ts:13`;
`src/capability/agent-elevenlabs/native-tools.ts:31` usa z.custom/pipe/transform, non convertibili in JSON Schema.
Il catch in `src/capability/portable-contracts.ts:118` registra il limite; configuration era già gated a riga 134.
Generatore, template e codice del runtime sono identici; cambiano solo catalogo incorporato e digest (righe Python 11–12).
Gli artefatti rigenerati coincidono byte per byte con i rispettivi dist e con il file consumer C letto in sola lettura.
Nessun errore di composizione dimostrato: nessuna modifica a sorgenti, dist, versione, pin o consumatori.
Proposta a C: allineare l’artefatto generato al bridge composto quando lo integra, mantenendo il confronto byte-identico;
C conferma: rosso su cataloghash, nessuna regressione eseguibile; dopo riallineamento del solo artefatto riferisce 22/22 ordinary.
Prove: `vitest run tests/capability/portable-contracts.test.ts --maxWorkers=1 --testTimeout=60000`: 5/5.
`python3 tests/python/test_generated_capabilities.py <artefatto-composto>`: 15/15.
`tsc --noEmit --tsBuildInfoFile /private/tmp/bridge-catalogo-rag-1210/types.tsbuildinfo`: uscita 0.
Confronto cataloghi: 14/15 descrittori identici, 12/12 supportati identici; confronto runtime: codice identico.

## Fruibilità (R-34)
**Aspettativa:** rag_query e lifecycle ordinario conservano le forme portabili approvate. **Tavola:** non serve.
| Aspettativa | Esito |
| --- | --- |
| rag_query e lifecycle invariati | Provati localmente: test TS 5/5 e Python 15/15; nessuna verifica dal vivo |
**La feature è completa?** Verifica bridge completata; integrazione consumer e rilascio restano alla coordinatrice/C.
**Cosa ne impedisce l’uso?** Il consumer deve incorporare l’artefatto del bridge che seleziona; configuration resta esclusa.
**Prova del percorso dell’utente:** import Python e validazione RAG/lifecycle con dati sintetici canonici.
Righe scritte oggi: prodotto 0, test 0, documenti 48. Review indipendente richiesta a F.
