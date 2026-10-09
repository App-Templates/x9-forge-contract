# C5-MODELLI-CONSUMATORI — SUMMARY

Consegna locale 09/10, lotto 08:10–08:55. Base e22e7a2d138be7120cd79800a7ada102183e7e74. Primo checkpoint source0524fff, definitivo con dist ricostruito in questo commit. PLAN prima del codice e autorizzazioni081537/082252/082438/082607/084204. Nessun push, merge, tag o deploy.

## Fruibilità alla consegna (R-34)

Implementato e testato il contratto di34/34 dichiarazioni C01–C34: metadata inventario, scope, confini, routing tiered/single/failover; dimensioni embedding; vision/webSearch. Fonte Master canonica strict con selections/missing/excluded osservati, complete>=1selection e nessun missing attivo; identità3ID/scope/generation/freschezza. Primo Store conserva assenza e versioni null, non inventa installed. Precondizione modelBootstrap CAS nel normale apply-config e idempotenza. Trasporto state/install/receipt dei servizi, JSON Schema shape-only, runtime matching comune senza quattro tier inventati. Source,classifier e voice requirements confermati dai proprietari D/E.

Il percorso utente completo resta da integrare: lettori, writer, installer e pagina nei lotti B/C/D/E. Vivo0/34. Non si dichiara Modelli100% né disponibilità dal registro. Nessun contesto privato, provider, segreto o dato vivo letto. Nuovo raccordo B083815: apply-config non porta ancora configurazione completa per successive modificheMaster; richiesta additiva alla coordinatrice084316, distinta da questo congelamento. Contratto e limiti operativi in CONTRATTO.md.

## Prove causali

Prima implementazione: vecchi42/42 verdi; nuovi155:143AssertionError semantici,2ZodError esclusi,10già verdi. Nuovo trasporto rosso55/55 semantici. Campagna finale263/263 test nuovi:72/72 guasti source qualificati con AssertionError,8/8hash ripristinati, fresh263/263. Due errori tecnici nel mutante definition-detached esclusi: il credito viene dalle35AssertionError di quel mutante. Tentativo precedente interrotto a32 e mutante mascherato non contato; aggiunta prova isolata e rerun finale72 completo.

Full nativo prima della build:4971/4971,165/165file,0skip,exit0,Node24.14.1,un worker,ambiente pulito,nessun filtro/alias/config modificato. Nuovi263,precedenti4708. Tipi/stile/build/pack-check/CJS nativo/CJS consumer/export pubblici/archive:8/8passi exit0; lint0warning;382/382declaration portabili. Check pack conserva profilo baseline node16 e avviso root CJS.types sotto ESM, nessuna esclusione aggiunta. Export reali root/router/http/agent ESM+CJS104/104controlli su8superfici. Due guasti compilati CAS ESM/CJS:2/2AssertionError,2/2hash ripristinati e104/104fresh dopo ciascun restore. Nuovo script pubblico incluso in tests/cjs.

## Perimetro e riproduzione

Solo perimetro autorizzato;4derivati web-catalog d.ts/d.cts+map autorizzati084204 e prodotti dalla build,fonte invariata.0cancellazioni. package/lock/config/reader web-catalog invariati. Vecchi assert cardinalità aggiornati intenzionalmente1→34, agent_chat e guardie mantenuti. FINAL-PROOF.json/MUTATIONS.json/QUALITY.json/COMPILED-FAULT.json contengono denominatori e witness; mutate.py/compiled-fault.py riproducono i guasti in serie con restore. Prove raw complete e tarball locale sono nel deliverable prove.zip, percorso esterno indicato nell'avanzamento. Revisione indipendente da A, integrazione coordinatrice.
