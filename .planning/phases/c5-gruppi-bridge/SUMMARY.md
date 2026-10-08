# C5-GRUPPI B0d — SUMMARY

08/10/2026,20:35 Europe/Rome. Worktree145-1,baseae7c464,branchcodex/c5-gruppi-bridge. Prodotto0dfbd9d. Pronto per revisione indipendente del SOLO contratto sorgente. Pacchetto1.44.0 e lock invariati; nessun dist nel commit. Consolidamento1.45/dist aF. Nessun push,merge,publish,migrazione o cancellazione reale.

## Implementato

Nuovo contratto POST interno di eliminazione logica definitiva, distinto da stop/archivio: secret-auth, indirizzo management, identità canonica completa, chiave canonica della richiesta e nome esatto. 8pezzi obbligatori unici, tombstone durevole prima degli effetti, ammissione drenata prima delle operazioni, canali/runtime isolati prima di caches e rimozioni durevoli. Ogni fallimento/blocco impedisce complete; errori a codici fissi senza diagnostica libera. Schema del singolo tombstone accetta soltanto completed/failed. Helper valida la risposta e la correla a indirizzo/richiesta/runtime/vault. Solo export additivi e README append.

Il produttore deve impedire resurrezione dopo restart, condividere mutex con lifecycle/apply, persistere prima/dopo effetti e riprendere solo passi non conclusi. La Factory deve autorizzare owner/SA, confrontare nome esatto e proteggere Master anche sotto gara. Gli schemi non attestano queste esecuzioni: sono compiti dei consumer CG7.

## Prove e qualifica

- 85/85 nuovi test in2/2file. Prima75/75rossi di presenza export tramite asserzione, poi75/75verde. Nuovi2/2rossi isolati del pezzo tombstone prima del vincolo;8ulteriori casi già verdi prima della qualifica. Ripristino finale85/85.
- UN giro finale mutazioni sorgenti:45/48candidati rilevati da asserzioni significative.3/48sopravvissuti sono le guardie singole ridondanti cardinalità/duplicati/completeness e NON sono contati. Due mutazioni composite a2modifiche per completezza/unicità scopes sono etichettate e contano una ciascuna. Primo giro44/48 aveva un punto cieco sul namespace: aggiunto caso di report internamente valido indirizzato al runtime della richiesta e ripetuto intero giro finale; report precedente conservato.
- 5/5mutazioni compilate:2/2CJS per asserzione e3/3tipi pubblici per TS2578 (guardie negative diventano inutilizzate). Ripristino SHA esatto di sorgenti e artefatti, nessun timeout/import/startup contato.
- Full nativa fresca4300/4300 in154/154file =4215precedenti+85nuovi. Nessun test precedente modificato.
- Build nativa ESM/CJS exit0,362/362dts portabili. Qualità finale7/7exit0: tipi,lint,pack,smoke CJS nativo,nuovo CJSNode20,nuovo CJSNode24,fixturetipiNodeNext. NuovoCJS27/27su entrambe le versioni; runnerprecedente36/36probes e moduli aggiuntivi exit0. Warning preesistente root typesCJS e risoluzioni node10 ignorate conservati, profilo pack invariato.
- Dipendenze assenti al primo avvio: errore di startup escluso, install frozen-lockfile riuscito. TS6 su file esplicito richiede ignoreConfig: TS5112 iniziale escluso; nessun alias/config Vitest privata. Una richiesta exec con NUL è stata rifiutata prima di eseguire comandi: corretta la costruzione del runner.

PROOF.json contiene hash dei sorgenti/report, tutti i candidati e classificazioni. B0D-MUTATE.py/B0D-COMPILED-MUTATE.py ricevono worktree e directory-prove; B0D-QUALITY.py idem. Comandi nativi, un worker e una suite pesante alla volta. Il nuovo fixture CJS va eseguito esplicitamente: il runner CJS precedente è fuori perimetro, F deve raccordarne l'esecuzione in consolidamento.

## Fruibilità alla consegna (R-34)

Il confine attraversa payload validi, errori parziali, pezzi mancanti/duplicati, durabilità non dimostrata, namespace sbagliato anche con risposta valida, mismatch runtime/vault/request, dati privati e metadati di autenticazione. Il vero percorso Apri/Archivia/Elimina definitivamente, job0014/guardie/audit Forge, tombstone/rimozione X9 e retry durevole non è ancora implementato da questo lotto. C5-GRUPPI NON consegnato e NON100%. Nessun agente o dato reale toccato. Prova reale/release solo coordinatrice/Stefano dopo revisione.

## Raccordi

CG6a Forge136-1 congelatoHEADb87fc9f4, prodotto0a206b49,12immagini locali; CG8 già2c07e470. X9144-1d65f6c91 solo nuovi file autorizzati, agganci manager/management/turn/index aspettanoD X3. Dopo revisione/release del contratto e base autorizzata, producerX9+consumerForge; migrazione0014 riservataE. Journal e parenting0013/0014 alla coordinatrice. Nessun header/endpoint/schema cross-repo duplicato nei consumer.
