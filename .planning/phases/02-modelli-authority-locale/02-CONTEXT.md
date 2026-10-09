# Phase 2 — Modelli authority locale

Discussed2026-10-09, auto, onepass. TaskC5-MODELLI-CONSUMATORI-BRIDGE follow-up, coordinator105235/110409, roledecision110016. Baseeeddec2580571ab205e093362f56301b1e653c71; release1.45SHAa510 remains immutable for independentA review. Same assigned156worktree/branch; expandedperimeter allsrc/tests/dist/.planning confirmed110409. No consumer repository writes/push/tag/deploy.

## Decisions

- D01 [auto]: New internalagent-core GET contract returns only existingAgentModelSourceObservationSchema; identity/scope/sourceVersion/observedAt/validUntil, no role/selections/credentials/context. It is locally loaded generation, available before priming; no core→cap→core aggregate callback. Reuse canonicalINTERNAL_SECRET_HEADER andsecret auth, AgentManagementParamsSchema, standardHTTPbarrel andvalidatedpathhelper.
- D02 [lockedcoordinator]: Master role is asserted ONLY by firstForgeapply-config carryingmodelBootstrap/modelConfiguration. ExistingAgentModelBootstrapSourceSchema remainsstrictmaster-only; no environment/name inference, no weakening or newdefault. Complete topology includesdisabledservices; same loadedgeneration forpresent/excluded, everyunknown blockscomplete.
- D03 [proposedtoB110842, beforecode]: Add rolelessAgentModelInitialSourceSchema and optionalstate.initialSource so firstApplica can see actual selections without alreadyassertingMaster. Reuse existing canonicalloaded-source coverage/refinements/CAS; strictrejectrole/privatefields, boundidentity and allpersisted/runtimeversionsabsent. Finalfieldnaming/mapping toB firstApplica must be agreed inposta before task2 implementation. NevercopyDTOinForge/X9.
- D04 [auto]: Preserveoldbootstrap/state/modernsource defaults; additiveexports only. Nativefullsource beforebuild; testsredfirst, everynewguardcausalfault+exactrestore, completegenerateddist, publicESM/CJSprobes; separateotherCodexverification afterauthorGSDgoalcheck.
- D05 [auto]: Limit45min/3attemptspertask; any gap recordedandreviewedgapplan. Coordinator110501 authorizes autonomousgaplots insideGSDphase. Unknownruntime/live remainsunproved; phaseonlycanonicalcontracts.

## Trasversalità (R-31)

Bridgecanonicalproducer types feed ForgeB firstApplica, X9D agent-core localauthority and X9E SDK/cap consumerlookup. Localobservation breaks recursivecore→cap→core reading; initialsource separates loadedidentity/generation fromMasterauthorization. D ownsloadedtopology/generation andfirstapplypersistence, B ownsForgecommand/provenance, E ownsSDKandinstalledconsumers. This phase defines no handler/providercall and modifiesnoneoftheirrepos. Session/owner/tenantbinding andpostawaitCAS remainexplicitproducer duties, never proved byschema parsingalone. Auth/header importedcanonical, no secrets read.

## Esistente (R-35)

**Esiste già?** sì: sourceobservation roleless, fullbootstrapmaster-only, sourcecurrenthelpers, canonicalmanagementparams/auth/HTTPbarrels.
**Dove vive oggi:** src/model-router/agent-model-configuration.ts:85–139(schema/sourcehelpers),:143–170(statebinding);src/http/endpoints/internal-agent-model-catalog.ts:9(GETsecret/authHeader/params);src/http/endpoints/internal-agents-management.ts:26/68(params,state);src/auth/index.ts;src/http/endpoints/index.ts;tests/model-router/c5-model-consumers.test.ts:47–67(coverage34/master/sourceCAS);tests/model-router/c5-model-source-observation.test.ts.
**Come funziona oggi:** AgentModelsState.sourceObservation requires savedscopedauthority; bootstrapSource alreadyrequiresroleMaster. No standalone localrolelesssourceendpoint orpre-rolecompleteinitialsource. Readingaggregatecapstate toobtainlocalgeneration canrecurse; newGET returnsloadedlocalobservationonly.
**Vecchio Forge:** original4f3fc42bf26ef191642f7f8d0cc94153c1302fe0 web/src/pages/agent/Models.tsx:29/155,web/src/pages/GlobalModels.tsx:45,services/vault/src/routes/vault.ts:521(alreadymapped/read inapprovedC5PLANandphase1CONTEXT). Preserveactualselection/readback/firstapplysemantics; oldglobal/defaultmodel values cannot authorizeMaster orinventloadedgeneration.
**Comportamento da mantenere:** oldmaster-onlyparse/currenthelpers rejectroleless; statewithoutnewfields valid; oldmodernsource stillrequirespersistedprovenance; unknownconsumer neverdefaults; originalnamespace/cyclefix remainsvalid.
**Cosa si riusa:** existingSourceObservationresponse, canonicalfullsourcecoverage andregistry34, identity/scope/CAS/freshness, nativebuild/full/portable/publicmatrix.
**Si riscrive?** no: additiveendpoint/schema/statefield plus sharedrefinement factoredoncebeforeextension; noexistingDTOredefinition inotherrepo.
**Cambia come funziona lo stack?** sì: pre-bootstrap is nowdistinct fromdeclaredMaster andlocalgeneration no longerrequiresaggregateconsumerread. ExplicitStefano approval via coordinator110409: «Sì, X9 daForge(Consigliato)». FirstForgecommand remainsexclusiveMasterassignment.

## Fruibilità (R-34)

1. Di cosa sioccupa: canonicalmetadata boundary forlocalgeneration andfirstloadedmodelsource beforeMasterpriming.
2. Obiettivo: D/E importoneinternalGET andB/D importonepre-bootstrapfullsource withoutrolefabrication orweakenedMastercontract.
3. Cosa potràfare: coordinatedruntime release canreadactualmodelsbeforefirstApplica andinitializeprivateMaster withsamegenerationCAS; thispackagealone addsnoaction/UI.
4. Mancanze: producer/SDK/Forge runtimewiring areD/E/B tasks; qualifiedschema/publicpackageproofmandatoryhere,0/34liveflowsclaimed.

## Corrispondenza aspettativa e tavola (R-34)

**Aspettativa:** non serve: questa fase definisce contratti interni a supporto del percorso Modelli coordinato nei consumer, non un nuovo percorso utente autonomo.
**Tavola:** non serve: pacchetto di contratti senza interfaccia; nessun pulsante o colonna da costruire.

| Elemento | Cosa si costruisce | Come si prova |
| --- | --- | --- |
| Fonte localeprepriming | GETObservationroleless | Canonicalschema/auth/params/header/barrel/path andpublicformats |
| PrimoApplica conmodellireali | Initialsourcecomplete+statebinding | Coverage34/unknown/identity/freshness/CASred/green/faults; oldMasterremainsrequired |
| Canonicalpackage | Nativegenerateddistandexports | Fullnative/types/lint/build/dts/pack/publicprobes, independentreview |
