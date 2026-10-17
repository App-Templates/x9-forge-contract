---
phase: 01-modelli-bridge-145
plan: 02
subsystem: contracts
tags: [release, consumer-installation, gap-closure]
requires: [01-01]
provides: [Actual remote release SHA installation in Forge and X9]
affects: [ForgeFactory, ForgeWeb, X9core, X9SDK]
tech-stack:
  added: []
  patterns: [Native compiler profile per consumer, importer-bound Git SHA provenance]
key-files:
  created: [.planning/phases/01-modelli-bridge-145/01-FINAL-PROOF.json]
  modified: [.planning/phases/01-modelli-bridge-145/01-VERIFICATION.md]
key-decisions: [Preserve native TypeScript5 and6 profiles, use coordinator published immutable SHA]
patterns-established: [Negative provenance and canonical type probes with exact restoration]
requirements-completed: [M145-03]
completed: 2026-10-09
---

# Version 1.45 — final remote consumer installation qualified

Final release **a5103c97c39b6178e8d53f201f27352c0fb58220** was published by coordinator. Metadata commitf68b97c4 and test-only fixa510 retain approved6d canonical sources and1544distribution files byte-for-byte. GSDgap plan01-02 closes the actual provenance/compiler gap; coordinator105501 explicitly authorizes autonomous new gap lots inside this phase.

Observed final proof:3/3native GitHTTPS install roots (6/6lock-update/frozen commands),144/144fresh public loads (four contexts×18paths×ESM/CJS),632/632existing Models assertions,8/8separate NodeNext compilations. All four actual installed manifests identify1.45.0 and finalSHA; all6176/6176distribution-file comparisons match the candidate. Factory/core/SDK use nativeTypeScript6 with explicit standalone ignoreConfig; Web retains nativeTypeScript5 without that option. No sourcealias/NODE_PATH/localtarball/copieddist substitute.

Negative proof:19/19consumer provenance faults produce semantic AssertionError and fresh green after exact restoration;8/8canonical wrong-function type faults produce TS2322 then restore togreen;1/1metadata wrongversion red/green. Existing native default report remains36/36with identical bytes. Native retained baseline5036/5036in167files0pending, quality10/10,386/386portable declarations,1544/1544secondbuild parity. Fullsource precedes build; a510changes onlythe test, with followuplintgreen, no needto relabel/repeat source suite.

## Deviations and resolved gaps

01-01task3was SALTATO after3technicalattempts: pnpm truncates its foldername; TS6 standalone command needsignoreConfig; WebTS5 rejectsignoreConfig. All diagnostics preserved. Corrected test uses actualnativevirtualstore plus installed/rootlock equality, exactselectedimporter SHA, version/exportmap/fullhashes. Gap execution detects nativecompiler major percontext before choosingflags. No DTO/productcontract defect and no source rewrite.

Native pnpm lifecycle ran; its existingdependencybuild allowlist leaves unrelated scripts disabled as the nativepolicy dictates (no ignore-scripts added). prepare is husky-only; absent.git inisolatedsnapshots produces existing nonfatalnotice. check:pack passes under unchangedprofile with pre-existing CJS.types ambiguity warning. Neither warning is hidden or called warning-free.

Raw proof directory: workspace work/c5-bridge-145-gsd. Primary filesFINAL-PROOF.json,INSTALLS.json,CONSUMER-CHECKS.json,factory/web/core/sdk-entrypoints.json,TYPE-MUTATIONS.json,CONSUMER-MUTATIONS.json,full-native.json,QUALITY.json,BUILD-PARITY.json and namedlogs. Safe immutable snapshot manifests identify Forge8814f3c6 andX9f2cf34aa; externalauthor repositories untouched.

## Fruibilità alla consegna (R-34)

- **La feature è completa?** Sì, per il compito di preparazione e installabilità del pacchetto1.45: i tre requisiti M145 sono verificati. La feature Modelli nel suo insieme resta ai compiti consumer/runtime e alla prova dal vivo,0/34qui.
- **Cosa ne impedisce l'uso?** Nulla impedisce l'installazione e il caricamento del pacchetto dallo SHAa510pubblicato. Il rilascio coordinato dei consumer, la revisione indipendente e i flussi utente restano esterni a questa fase, senza affermarli conclusi.
- **Prova del percorso dell'utente:** eseguita l'importazione GitHTTPS dello SHAa510nelle copie isolate dei veri snapshotForge8814f3c6eX9f2cf34aa. Aggiornato il lock nativo, eseguite treinstallazioni frozen, aperto il pacchetto risolto daFactory/Web/core/SDK, confrontati versione1.45.0,exportmap e6176file contro il rilascio. I quattro contesti hanno poi caricato tutti18ingressi inESM/CJS e compilato i tipi canonici. Passi e risultati effettivi in INSTALLS.json,CONSUMER-CHECKS.json e quattroentrypoints.json nel pacchetto prove; nessun DTO/copia locale è stata usata come prova di installazione.

1. Cosa può fare: installare il contratto Modelli1.45.0 daSHAimmutabile nei consumerForge/X9 e caricare tutti18ingressi ESM/CJS con tipi coerenti.
2. Percorso provato: snapshotForge8814f3c6Factory/Web eX9f2cf34aa core/SDK → overrideGitHTTPSa510 → locknativo aggiornato → installfrozen → risoluzione pacchetto da ciascunconsumer → versione/export/dist verificati →144caricamenti,632assertionModelli,8compilazioni,guasti/ripristini.
3. Corrispondenza: identificazione1.45PASS;distribuzionecanonicaPASS1544/1544;installazioneconsumerPASS3/3root+4/4contesti. Tavola nonserve: pacchetto senzaUI.
4. Limiti:0/34percorsiModelli dalvivoverificati inquestafase; nessun producer/handler/deploy introdotto. Serve verifica indipendente di un altroCodex e rilascio coordinato dei consumer prima della prova utente complessiva. Fnonhaeseguito push/tag/merge/deploy.

## Self-Check: PASSED

All reported denominators are asserted by finish-proof.py against rawJSON; release/productcommits exist; canonicalsrc/dist/lock unchanged from6d; alltemporary installed/type faults restored exactly. Independentreview remains external to authorGSD verification.

Nativecompletion was executed on an isolated document copy because its progress-table regex matches archivedPhase1 globally. Only newrelease tracking was applied to authorrepo. Its first warning matched the literal historical gap-status narrative despite currentpassedfrontmatter; clarified that narrative and reran nativecompletion with0warnings. Originalrawdiagnostic retained. HistoricalShimCleanup notmarkedcomplete.

## Corrispondenza aspettativa e tavola (R-34)

**Aspettativa:** non serve: questa fase distribuisce un pacchetto di contratti già approvati; la decisione canonica è in01-CONTEXT.md, non introduce un nuovo percorso utente Modelli.
**Tavola:** non serve: il pacchetto non ha interfaccia, pulsanti o colonne; si verifica tramite la reale installazione nei consumer.

| Elemento | Cosa si costruisce | Come si prova | Esito |
| --- | --- | --- | --- |
| Identificare1.45.0 | Versione e changelog | Manifest reale e guardia versione | fatto:1/1metadatared/green,versioneinstallata1.45in4/4contesti |
| Distribuzione canonica | ESM/CJS e dichiarazioni | Buildnative e hashcompleti | fatto:1544/1544parità,386/386dichiarazioni |
| Installabile nei consumer | Dipendenza remotaSHA | Locknativo,risoluzionereale,ingressi e tipi | fatto:3/3root,144/144load,8/8TS,6176/6176file |
