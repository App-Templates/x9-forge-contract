# C5-MODELLI-CONSUMATORI-BRIDGE — SUMMARY

Consegna locale del contratto e del delta Master privato, 09/10. Base34consumatori27107045e253ce68b5a791b472c1604c5cce5651 già APPROVE indipendente daA085928. Delta separato autorizzato084357/084806/090653, PLAN5eb96cf prima del codice, termine09:31. Nessun push/merge/tag/deploy daF.

## Fruibilità alla consegna (R-34)

**La feature è completa?** Il contratto assegnato del ponte è implementato e testato localmente. La feature Modelli nel prodotto non è dichiarata completa: pagina, writer, lettori e installer dei consumer devono essere integrati e provati dagli altri proprietari.

**Cosa ne impedisce l'uso?** Il ponte non contiene handler o un'interfaccia utente. B/C/D/E devono collegare lettura e salvataggio Master, writer privato, servizi e pagina; integrazione e prova dal vivo restano necessarie. Installazioni verificate dal vivo0/34. Il delta richiede revisione indipendente diA.

**Prova del percorso dell'utente:** Non eseguita dal vivo in questo lotto di contratto: nessun dato in produzione è stato letto o modificato. Il percorso «apri Modelli, leggi la fonte osservata, cambia scelta Master, salva/applica e rileggi quella effettiva» si deve provare nell'integrazione diB/C/D/E. Qui la prova locale usa fixture sintetiche nella stessa forma canonica delle risposte, import pubblici e guasti mirati; non è spacciata per percorso utente in produzione.

## Corrispondenza aspettativa e tavola (R-34)

**Aspettativa:** non serve: il lotto è un contratto del ponte senza pagina; l'aspettativa dell'utente si verifica nella pagina diC e nell'integrazione conB/D/E. Il PLAN mantiene comunque la corrispondenza delle34funzioni C01–C34.

**Tavola:** non serve: questo contratto non costruisce un'interfaccia visiva; la tavola e il percorso reale appartengono alla pagina Modelli diC e ai suoi consumer.

## Contratto consegnato

34/34dichiarazioni del censimento, requisiti scope/confine/routing, single/failover oltre tiered, dimensione embedding, vision/webSearch; fonte iniziale Master complete con missing/excluded osservati; service install/state/receipt con CAS/readback; JSON Schema shape-only (refinements e osservazione reale restano ai producer). Registrazione non equivale a installazione. Classificatore e voice requisiti confermatiD/E. PrimoStore usa normale modelBootstrap expectedAbsent:true e generation reale, non versione inventata.

Delta: modelConfiguration opzionale sul normale apply-config riusa configurazione canonica con identità3ID e provenance; configVersion===desiredVersion. modelExpectedSourceVersion obbligatoria esattamente con configurazione, uguale bootstrap.expectedSourceVersion se presente; opaca, indipendente dalle versioni numeriche. Scelta/provenance/generation fanno parte dell'idempotenza, ordine oggetti e selections/bindings irrilevante. isAgentModelApplyConfirmed confronta anche la scelta effettivamente trasmessa con autorità salvata/readback. state.sourceObservation opzionale/null espone generation moderna solo con saved/provenance e identità/scope coerenti, observedAt/validUntil e helperfresh(max60s,futuro5s,scadenza). SourceCurrent accetta HTTPobservationfresca o generation letta dal producer, sempre CAS dopoawait prima writer. Nessuna sourceVersion derivata da configVersion. CONTRATTO.md spiega tutti gli export e i limiti.

Schema canonico isolato in agent-model-configuration-values, riesportato dagli entrypoint esistenti; Scope lazy evita cicli di inizializzazione. Managementvalues estratti4/4blocchi byte-identici. Nessun contratto Vault riscritto, nessun DTO dei consumer copiato, nessun provider/default o contesto privato esportato.

## Prove con denominatori

Base congelata:4971/4971native,165/165file,0skip;263nuovi/4708precedenti;72/72fault source e2/2compiled con restore;104/104public8entrypoint;quality8/8exit0. A ha rifatto full4971,10source+2distfault indipendenti,4263/4263byteparity e199/199manifest, APPROVE senzaP1/P2. Non copre il delta.

Delta: testprima comando27:8/27AssertionError,19/27già verdi; fonte31:25/31AssertionError e6/31già verdi. Testfinali65/65(34comando+31fonte). Guasti32/32semantici(17comando+15fonte), ogni mutante con AssertionError; restore e fresh34/34+31/31. I tentativi con guardie mascherate dal diverso errore provenance/shape non sono accreditati: corretti i test isolati e ripetuta tutta la campagna. Primo full con67importfailure tecnici non accreditato; schema isolato, regressioni native186/186nei percorsi coinvolti; full definitivo prima build5036/5036,167/167file,0skip,Node24.14.1,un worker,ambiente pulito,nessun filtro/alias/config modificato.263base+65delta=328nuovi,4708precedenti.

Tipi/lint/build/pack-check/CJS nativo/CJS consumer/export pubblici/archive:8/8exit0,lint0warning,386/386declaration portabili. Avviso pack root CJS.types sotto ESM e profilo originale node16 restano espliciti, nessuna esclusione nuova. Export reali ESM/CJS root/router/http/agent158/158controlli su8superfici. Compilati:6/6fault(replay/generation/expiry per ESM/CJS),6/6restore+fresh158/158 dopo ogni ripristino. Nuove fixture canoniche sono sintetiche e non attestano alcun provider/runtime installato.

## Perimetro, prove e residui

Solo perimetro autorizzato,0cancellazioni.12derivati fuori modello autorizzati091018 e prodotti dalla build,4web-catalog autorizzati084204; sorgenti Backup/Memory/Vault/Elevencatalog invariati. package/lock/config invariati. Nessun segreto letto o modificato. DELTA-FINAL-PROOF.json/DELTA-MUTATIONS.json/OBS-MUTATIONS.json/DELTA-COMPILED-FAULT.json contengono witness/denominatori/hash; script di mutazione e manifest con lograw completi negli output della chat. Prove del primo lotto conservate separate in prove-base.zip, prove.zip include anche il delta. PLAN e SUMMARY riletti; gate fruibilità compilato con le etichette richieste, nessun bypass. Revisione delta adA e integrazione alla coordinatrice.

## Rettifica formale 09:20

Prodotto congelato f364f3b175e082cd755125614a18680830daf5b2, codice/dist invariati. Il gate di consegna ha rifiutato il titolo PLAN «Esistente (R-35), con Vecchio Forge»: richiedeva l'intestazione esatta e le etichette in grassetto. Riformattati i contenuti già presenti nel PLAN iniziale, conservati riferimenti e decisioni approvate; verifiche R34/R35 ora0mancanze. Questo è un commit soltanto documentale, nessun controllo del prodotto ripetuto o aggirato.
