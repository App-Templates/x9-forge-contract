# Research draft — phase 02 Modelli authority locale

Read-only research,2026-10-09. Base inspected: `/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-156-1` HEAD **eeddec2580571ab205e093362f56301b1e653c71**. Phase2 planning directory/ROADMAP are being created by the parent; researcher made no author repository changes and ran no tests/build/install. Only this workspace report is written. No consumer DTO or runtime implementation assumed. Await B/coordination before freezing new endpoint name/path and consumption semantics.

## Minimum additive change

Add a roleless **AgentModelInitialSourceSchema** and optional/null `AgentModelsStateSchema.initialSource`, while preserving the exact existing **AgentModelBootstrapSourceSchema** requirement `role:'master'`. Add one internal core endpoint returning the already canonical **AgentModelSourceObservationSchema** before priming: that schema is already roleless and already provides complete identity/scope/generation/freshness fields. It does not require relaxing the aggregate state's modern `sourceObservation` requirement for saved authority.

These solve different purposes: `initialSource` conveys observed selections/coverage before saved/bootstrap authority; a standalone source-observation endpoint provides the generation precondition for reads/CAS. Neither proves a runtime handler exists, that a provider is reachable or that a model is installed. Never promote roleless local evidence into Master inheritance authority.

## Current contract and exact reuse points

All relative paths refer to the bridge above.

| Existing behavior | Evidence and reuse |
|---|---|
| Initial bootstrap source is explicitly Master-only | `src/model-router/agent-model-configuration.ts:86–109`, especially`:88` role literalmaster. Keep this exported schema and inferred type intact. |
| Full identity requires management/runtime/Vault IDs; nonblank management/runtime and positiveintegerVault | `src/model-router/agent-model-configuration-values.ts:12–16`. Reuse CompleteModelIdentitySchema. |
| Identity equality compares all three fields exactly | `agent-model-configuration-values.ts:94–95`. MissingVault in state cannot silently match complete initial identity. |
| Source scope is canonical capabilityscope, nonblankowner/tenant/agent | `agent-model-configuration.ts:85`. Reuse ModelSourceScopeSchema; no consumer DTO duplication. |
| Opaque sourcegeneration is distinct from saved configversion | `agent-model-configuration.ts:89`,`:110`; current observation`:123–129`. |
| Bootstrap shared checks | `agent-model-configuration.ts:96–106`: runtime-scopebinding; validUntil>observedAt; allregistered slots exactlyonce in selection/missing/excluded;complete iffno missing,plusnonemptyselection; canonicalcapability/function/requirements/routing. |
| Bootstrap fresh helper | `agent-model-configuration.ts:113–119`: rejects malformed/partial/empty,invalidclock,futurebeyond5s,expiry; comparesgeneration/allidentity/scope. **It does not impose the observation helper's separate60second maximumage.** |
| Roleless observation helper | `agent-model-configuration.ts:123–138`: strict completeidentity/scope/sourceversion/observedAt/validUntil; scope matchesruntime; validinterval; current helper rejects>60sold,>5sfuture,expired/invalidclock and generation/identity/scope mismatch. |
| Aggregate modern observation requires saved scoped authority | `agent-model-configuration.ts:149–156`. Keep unchanged; do not let initialSource make sourceObservation appear saved. |
| Bootstrap state must have saved/runtime/versionsnull andsameidentity | `agent-model-configuration.ts:158–160`. Keep unchanged; add analogous explicitinitialSource invariants. |
| Existing saved/runtime stateidentity/version guards | `agent-model-configuration.ts:162–169`. Keep unchanged. |
| Existing CAShelper consumes modern observation OR trusted direct expectation | `agent-model-configuration.ts:212–218`. It requires apply-config, canonicalconfiguration andmodelExpectedSourceVersion; timed observation branch uses existingfresh helper. Do not broaden this to arbitrary initialpayload silently. |
| Existing internal core state endpoint/auth | `src/http/endpoints/internal-models-batch.ts:27–33`: GET `/internal/agents/:agentId/models/state`, AgentManagementParamsSchema, authType secret, canonicalINTERNAL_SECRET_HEADER; pathhelper validatesparams. Reuse pattern for additiveendpoint. |
| Auth header | `src/auth/auth-headers.ts:5–11`: Forge→X9/internal uses secret,distinct from inter-service token. Import canonicalconstant, never literalduplicate. |
| Public export wiring | `src/model-router/index.ts:51` reexportsagent-model-configuration; root `src/index.ts:10` reexportsmodel-router. `src/http/endpoints/index.ts:57` reexportsinternal-models-batch; `src/http/index.ts:40` reexportsendpoints. No newpackageexportkeyrequired. |

## Refactor without weakening old refinements

Extract an **unrefined strict base object** containing every current bootstrap field exceptrole. Keep the same nested canonical schemas/limits. Extract the existing refinement body lines96–106 into one shared typed checker over that base's inferredtype. Construct:

1. New initial schema = strictbase.superRefine(sharedchecker).
2. Existing bootstrap schema = strictbase.extend({role:literalMaster}).superRefine(samesharedchecker).

Do this **before** applying refinements. Do not omitrole from an already refinedschema: Zod object transforms can drop/refuse refinements, and safeExtend would retain Masterrole unless explicitly changed. Do not parse bootstrap and striprole; initial strict schema must reject **any** explicitrole, includingmaster/erede/unknown, rather than erase it. Preserve old validation messages/paths and membership/routing checks. No new dependency imports are needed for the shared checker; avoid moving the base into a module that imports contextwrappers.

Initial schema shape should retain schemaVersion1,fullidentity,scope,authorityruntime-loaded,opaquegeneration,timestamps,coverage,selections/missing/excluded. Field absence/null in state is additive-compatible. A nonnullinitialSource requires:

- fullsameidentity with outerstate;
- saved===null, runtime===null, versions===null (an object with allnullcounters still is **not** absentversions);
- bootstrapSource==null andsourceObservation==null, so distinct authorities cannot coexist;
- shared source coverage/exclusion/selection rules unchanged;
- no newrole/default/configVersion/credential/privatecontext accepted.

Optional new freshhelper can reuse the existing bootstrap checker behavior on the roleless schema and canonical expectation without changing oldbootstrap semantics. Decide its exact name/window with B. If newinitial evidence is meant to carry the stricter HTTP60second lifetime, state that separately and test it; **do not silently add60seconds to oldbootstrap helper**, whose approved contract differs. The standalone endpoint returns canonicalobservation and therefore naturally uses the existing60second helper and existingCAS semantics.

InitialSource object has extra fields relative to strict observation/expectation; passing it directly into existingcommandCAS helper currentlyfails. Prefer using the standalone observation response or an explicitly canonical projection with producerrecheck. Any directinitial acceptance would need separate authorizedcontract/tests; it is not implied by this research.

## Test architecture: preserve old behavior first

Read existing `tests/model-router/c5-model-consumers.test.ts:46–67` B01–B20 in full. They exercise strict Masterrole andrequiredfields;3ID/3scopes;34registeredslotcoverage;duplicates/unknown/overlaps;capability/function/requirements;races;invalidfuture/expiredclock;validinterval;partialwithallmissing;observedexclusions;all-excludedincomplete;activeunknownremainsmissing;stateidentity andnosaved/appliedclaims. Keep these tests intact and run them against the refactor. Add regression that roleless payload stillfails oldbootstrap andMasterrole stillpassesoldbootstrap.

New roleless tests should mirror each shared invariant, includingper-slotcoverage over **34/34**registrychoices, complete/nonempty versuspartial, excludedunavailable distinctions, canonicalsingle/failover/tiered settings andembeddingdimension via existingselection schema. Add explicitstateauthority combinations: initial with saved/runtime/versionsobject/bootstrap/modernobservation mustfail; initial with eachidentityfield changed mustfail; absent/nullinitial mustpreservelegacyparse exactly. Test missing requiredfields, roleinjection,privatefieldinjection anddetachedparse.

Keep modernobservation tests `tests/model-router/c5-model-source-observation.test.ts:16–24` O01–O09 unchanged: especially O08 requiring saved scopedauthority, and O06 rejectinglongexpirybutstaleobservation. Standalone endpoint response should accept the same validobservation **without** constructing a savedaggregate. Add endpointmetadata tests for method/path/params/response/authconstant/pathhelper; nohandlerclaim.

Newhelper tests needinvalidclock,exactexpiry,5sfutureboundary,identity3IDs,scope3fields,generationrace,partial/empty. ExistingCAS tests must continue acceptingfreshobservation/directexpectation and rejectingexpired/wronggeneration. Producer still rechecks actualgeneration afterawaits; a schema cannot prove that operation.

Each new guard must be deliberately broken and observedsemanticred before crediting it; restoreexactbytes andfreshgreen. Proposed faults: removeMasterroleoldguard; allowroleinnewsource;skipsharedcoverage/identity/time/routing;allowinitial+saved/versions/bootstrap/modernobservation;ignoregeneration/scopefreshness;wrongendpointresponse/auth/path. Reports need distinctcase/mutationdenominators; parameterized34slotcases are34cases,not34independentmutations unlessactuallyrunasdistinctfaults. No networkerrors countedred.

## Build/export/cycle risks

The import graph is already sensitive: agent-model-configuration imports capability-call-context plus agent-management; context/management/vault reach back into modelconfiguration. Prior6d fixed canonicalcredentialkey first-loadcycles with lazyrefs. `agent-model-configuration-values.ts:34` deliberately lazily references CapabilityAgentScopeSchema. Preserve these boundaries; moving sourcebase into values must not create eagerimports back tocontext/management. Prefer existingmodule-localbase/checker.

Nativefullsource must precede nativebuild; runexisting type/lint/build/dts/check:pack and fullregression. Distgenerateddeclarations will propagate throughhttpendpoint androot/model-router; inspect complete generatedperimeter, do not handeditdist. Existingpublicfirst-loadmatrix covers **18paths×2formats=36**; rerun freshprocesses afterbuild, especiallyvault-first,root/router/http. Add compiled ESM/CJS probes asserting newexports and oldMaster-onlybehavior; deliberatecompiledfaults/restore. No newpublicsubpath is necessary or desirable.

Currentrelease1.45a510distribution was qualified before this phase; adding contracts changes the authoritativeSHA. Do not reuse that earlierinstalledrelease as proof of the newsource. Coordinate version/releasepublication andconsumerpinwork separately after qualification; do not write B/D/E repos or install unpublishedSHA as thoughpublished.

## Cross-stack, existing Forge and coordination

OldForge mapping was already recorded in phase1 `01-CONTEXT.md` R35: original4f3fc42bf26ef191642f7f8d0cc94153c1302fe0 Models/GlobalModels/Vault paths; selection/reset/readback andoriginsemantics preserved. This additivebridge phase does not change thosewriters or roleauthority. Parent should carry the specific mapping into phase2 CONTEXT rather than treating absence of a UIchange as absence of cross-stack analysis.

Await B agreement on endpointname/path, error/unavailable representation andwhenlocalinitialsource is exposed versusMasterbootstrap. Reuse currentsecret-auth corepattern; no newprovider/defaultrole inferred. D owns actuallocalreader/generation; B owns Forgeconsumption; their runtime implementation cannot be assumed fromschema. Productlivecoverage remains **0/34 verified by this research**. No testresult is claimed here.
