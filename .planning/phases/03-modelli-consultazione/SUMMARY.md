---
phase: 03-modelli-consultazione
plan: "01"
subsystem: contracts
status: locally_qualified_pending_independent_review
requirements-completed: []
key-files:
  created: [tests/model-router/models-overview-coverage.test.ts]
  modified: [src/model-router/models-batch.ts, src/http/endpoints/forge-models.ts, dist]
---
# Bridge — lettura configurato con copertura attestata

Autorizzazione Stefano/coordinatrice150615, piano a4cae50 APPROVE C. Task01.1 source028c863, task01.2 distribuzione3c84de6b58652fab5bfe7dd5353b728a9479e1d3. Package1.45.0 identificato da SHA; nessun nuovo tag/rilascio. Pubblicazione richiesta151942, no push F.

Overview coverage opzionale complete/partial/unavailable per identità completa+owner; origine unknown soltanto nella riga readonly, senza falsoMaster. Guardie identità/owner anchefra coverage e righe, collisioni management/runtime e vault esplicita, slots mancanti unici/noncontraddittori. Il writer applica la nuova semantica soltanto agli agenti richiesti; B estraneo incompleto non blocca A. Binding e intent non ammettono unknown. Vecchi producer senza coverage restano nonattestati.

## Prove

- Baseline105/105,2/2file. REDprima codice12asserzioni fallite/31casi;19passate per guardie preesistenti, non attribuite a nuove funzionalità.
- GREENiniziale136/136. Mutazione incomplete-reason inizialmente sopravvive: il test copriva stringa vuota ma nonnull. Aggiunti2casi null: finali33/33nuovi,5086/5086in169file,0skip.
-18/18guasti sorgente rilevati conAssertionError e freshrestoreverde dopo ciascuno; source bytehash identico. Rawprecedente con mutazione sopravvissuta conservato come diagnostico, nonpass.
-7/7comandi native:fullsource/typecheck/lint/build/dts/pack/CJS. Tipidts388file, CJS36/36sonde base più smokeinclusi. Distgenerato, diffcheckverde.
-56/56asserzioni pubbliche (14x4:distESM/CJS e tarESM/CJS);4/4guasti deliberati in package e restoreverde. Prova tipinuovaAPI verde; bindingunknown rossoTS2322, ripristino. Primo fixturetipi nonusava brandedID e falliva: corretto usando schema canonico, rawdiagnosticoconservato.
-Local-source vecchiafase02: ora incluso indistgenerato,17/17source nella full e contrattopath/auth/response nei formati pubblici. InitialSource ancora nonimplementato, vecchiafase02 nonchiusa.

## Deviazioni e decisioni

Mandato150615 sostituisce il gate di sola preparazione/chiusurabootstrap dei documenti10; esecuzioneinline nel worktree assegnato, nessun subagent. Extra exportSchema/type di coverage per evitare duplicazioniDTO. Non modificati header/endpointbrowser/DB/schema/runtime. Reviewautore non rileva altri difetti; revisione indipendente richiesta al raccordo finale, nonautoAPPROVE.

## Fruibilità alla consegna (R-34)

Implementato e testato solo pacchetto. Candidato integrato0/1, rilascio0/1, percorso reale0/1. I consumer devono adottare lo stessoSHA prima di emettere i campi nuovi: parserstrictvecchi non sono compatibili per presunzione. Cpageavviata indipendentemente. X9/Forge prossimi in157-1/150-1, un repo alla volta. Nessuna chiamataprovider, segreto reale o scrittura runtime.

## Self-Check: PASSED

2/2task del contratto localmente qualificati; source/dist/package coerenti e prove conservate in PROOF.json e proof/. Nessuna AC prodotto globale dichiarata completata dal solo bridge. Nessun deploy/push/merge.
