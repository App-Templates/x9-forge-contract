"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.portableJsonSchema = portableJsonSchema;
exports.getPortableCapabilityContracts = getPortableCapabilityContracts;
exports.applyPortableCapabilityRules = applyPortableCapabilityRules;
exports.parsePortableAuthorityResponse = parsePortableAuthorityResponse;
exports.parsePortableRagToolCall = parsePortableRagToolCall;
exports.parsePortableLifecycleRequest = parsePortableLifecycleRequest;
exports.parsePortableOrdinaryToolCall = parsePortableOrdinaryToolCall;
const zod_1 = require("zod");
const lungo_fotogrammi_js_1 = require("./video/lungo-fotogrammi.cjs");
const lungo_produzione_js_1 = require("./video/lungo-produzione.cjs");
const officina_video_js_1 = require("../http/endpoints/officina-video.cjs");
const lungo_ricerca_js_1 = require("./video/lungo-ricerca.cjs");
const officina_video_js_2 = require("../http/endpoints/officina-video.cjs");
const parallel_personaggi_js_1 = require("../http/endpoints/parallel-personaggi.cjs");
const personaggio_parallel_js_1 = require("./video/personaggio-parallel.cjs");
const personaggio_parallel_import_js_1 = require("./video/personaggio-parallel-import.cjs");
const abito_stile_js_1 = require("./video/abito-stile.cjs");
const officina_video_js_3 = require("../http/endpoints/officina-video.cjs");
const lungo_js_1 = require("./video/lungo.cjs");
const lungo_bozza_js_1 = require("./video/lungo-bozza.cjs");
const costo_passi_js_1 = require("./video/costo-passi.cjs");
const officina_video_js_4 = require("../http/endpoints/officina-video.cjs");
const ordinary_configuration_js_1 = require("./ordinary-configuration.cjs");
const parameters_js_1 = require("./parameters.cjs");
const tool_call_js_1 = require("./tool-call.cjs");
const rag_query_js_1 = require("../rag/rag-query.cjs");
const engine_js_1 = require("./video/engine.cjs");
const story_js_1 = require("./video/story.cjs");
const footage_js_1 = require("./video/footage.cjs");
const ordinary_authority_js_1 = require("../agent/ordinary-authority.cjs");
const ordinary_lifecycle_js_1 = require("./ordinary-lifecycle.cjs");
const internal_agents_ordinary_authority_js_1 = require("../http/endpoints/internal-agents-ordinary-authority.cjs");
const internal_capability_agent_js_1 = require("../http/endpoints/internal-capability-agent.cjs");
const cap_tool_call_js_1 = require("../http/endpoints/cap-tool-call.cjs");
const officina_video_js_5 = require("../http/endpoints/officina-video.cjs");
const officina_video_js_6 = require("../http/endpoints/officina-video.cjs");
const modella_js_1 = require("./video/modella.cjs");
const ambiente_js_1 = require("./video/ambiente.cjs");
const abito_js_1 = require("./video/abito.cjs");
const produzione_modella_js_1 = require("./video/produzione-modella.cjs");
const preset_da_video_js_1 = require("./video/preset-da-video.cjs");
const regia_js_1 = require("./video/regia.cjs");
const auth_headers_js_1 = require("../auth/auth-headers.cjs");
// Narrow using canonical schemas, never copied definitions. Structured refinement portability is gated.
const snapshot = ordinary_configuration_js_1.CapabilityOrdinaryCallSnapshotSchema.safeExtend({ values: zod_1.z.record(parameters_js_1.CapabilityParameterKeySchema, parameters_js_1.CapabilityParameterValueSchema) });
const ordinaryCall = tool_call_js_1.ToolCallRequestSchema.safeExtend({
    tenantId: tool_call_js_1.ToolCallRequestSchema.shape.tenantId.unwrap(), ownerId: tool_call_js_1.ToolCallRequestSchema.shape.ownerId.unwrap(),
    ordinaryConfiguration: snapshot,
}).strict();
const emptyConfiguration = ordinary_configuration_js_1.CapabilityOrdinaryConfigurationSchema.safeExtend({ parameters: zod_1.z.array(zod_1.z.never()).max(0) });
const authorityResponse = ordinary_authority_js_1.AgentOrdinaryAuthoritySchema.safeExtend({ configuration: emptyConfiguration.nullable() });
const ragCall = tool_call_js_1.ToolCallRequestSchema.safeExtend({
    tenantId: tool_call_js_1.ToolCallRequestSchema.shape.tenantId.unwrap(), ownerId: tool_call_js_1.ToolCallRequestSchema.shape.ownerId.unwrap(), ordinaryConfiguration: snapshot.optional(),
}).strict();
const lifecycleRequest = ordinary_lifecycle_js_1.CapabilityOrdinaryLifecycleRequestSchema.safeExtend({ configuration: emptyConfiguration.optional() });
const emptyState = ordinary_configuration_js_1.CapabilityOrdinaryConfigStateSchema.safeExtend({ desired: emptyConfiguration.nullable(), applied: ordinary_configuration_js_1.CapabilityOrdinaryAppliedSchema.safeExtend({ configuration: emptyConfiguration }).nullable(), failed: zod_1.z.null(), effectiveParameters: zod_1.z.array(zod_1.z.never()).max(0) });
const lifecycleReceipt = ordinary_lifecycle_js_1.CapabilityOrdinaryLifecycleReceiptSchema.safeExtend({ request: lifecycleRequest, ordinaryState: emptyState });
const lifecycleTransaction = ordinary_lifecycle_js_1.CapabilityOrdinaryLifecycleTransactionSchema.safeExtend({
    request: lifecycleRequest, previousState: emptyState, receipts: zod_1.z.array(lifecycleReceipt).max(4),
});
const lifecycleAuthority = authorityResponse.safeExtend({ current: ordinary_lifecycle_js_1.CapabilityOrdinaryBundleReferenceSchema.nullable(), transaction: lifecycleTransaction.nullable() });
/** Probes on which `String.prototype.trim` is the only plausible overwrite: whitespace of every JS class, case, inner spaces. */
const TRIM_PROBES = [' a B ', '\t\n\u000b\f\r x\u00a0', '\ufeff\u1680\u2000\u200a\u2028\u2029\u202f\u205f\u3000y z\u3000', '\u001c q \u001c', 'Ab', ''];
/** True when a zod check is an overwrite that behaves exactly as `trim()` (portable as the `x-trim` keyword). */
function isTrimCheck(check) {
    const def = check?._zod?.def;
    if (def?.check !== 'overwrite' || typeof def.tx !== 'function')
        return false;
    const tx = def.tx;
    return TRIM_PROBES.every(probe => tx(probe) === probe.trim());
}
/** A string schema whose first check is trim: zod trims before every length/pattern check, as `x-trim` says. */
function hasLeadingTrim(schema) {
    const def = schema?._zod?.def;
    return def?.type === 'string' && isTrimCheck(def.checks?.[0]);
}
/**
 * JSON Schema of a canonical zod schema for the portable catalog. `trim()` has no standard keyword: it is carried
 * as `x-trim: true` (strip JS whitespace first, then check and return the trimmed text), so the generated Python
 * runtime admits exactly what zod admits.
 */
function portableJsonSchema(schema) {
    return zod_1.z.toJSONSchema(schema, {
        io: 'input', target: 'draft-2020-12',
        override: (ctx) => { if (hasLeadingTrim(ctx.zodSchema))
            ctx.jsonSchema['x-trim'] = true; },
    });
}
/** Count non-JSON custom checks so a newly added refinement cannot silently become portable. */
function customRefinements(schema, seen = new Set()) {
    if (seen.has(schema))
        return 0;
    seen.add(schema);
    const def = schema._zod.def;
    const checks = (def.checks ?? []);
    // A custom check, or an overwrite other than a leading trim, has no JSON Schema form: it must be gated, never dropped.
    let count = checks.filter((check, index) => check._zod.def.check === 'custom'
        || (check._zod.def.check === 'overwrite' && !(index === 0 && isTrimCheck(check)))).length;
    const visit = (value) => {
        if (value && typeof value === 'object' && '_zod' in value)
            count += customRefinements(value, seen);
        else if (Array.isArray(value))
            value.forEach(visit);
    };
    for (const key of ['innerType', 'element', 'keyType', 'valueType', 'in', 'out', 'catchall'])
        visit(def[key]);
    visit(def.options);
    if (def.shape)
        Object.values(def.shape).forEach(visit);
    if (def.type === 'lazy')
        visit(def.getter());
    return count;
}
const organizationRunRule = { op: 'equal_paths_if_present', left: 'organization.attempt.runId', right: 'organization.organizationRun.runId' };
const organizationExpiryRule = { op: 'timestamp_after_if_present', earlier: 'organization.organizationRun.issuedAt', later: 'organization.organizationRun.expiresAt' };
const callRules = [
    { op: 'max_properties', path: 'ordinaryConfiguration.values', max: 100 },
    ...['tenantId', 'ownerId', 'agentId'].map(key => ({ op: 'equal_paths', left: `ordinaryConfiguration.scope.${key}`, right: key })),
    { op: 'authority_equal', path: 'ordinaryConfiguration' },
    organizationRunRule,
    organizationExpiryRule,
];
const authorityRules = [
    { op: 'empty_configuration_target' },
    { op: 'equal_paths', left: 'scope.agentId', right: 'identity.runtimeAgentId' },
    { op: 'authority_lookup', identitySchema: zod_1.z.toJSONSchema(ordinary_authority_js_1.AgentOrdinaryAuthoritySchema.shape.identity), bindings: [
            { path: 'scope.tenantId', authorityPath: 'lookup.tenantId' },
            { path: 'scope.ownerId', authorityPath: 'lookup.ownerId' },
            { path: 'scope.agentId', authorityPath: 'lookup.runtimeAgentId' },
            { path: 'capability', authorityPath: 'lookup.capability' },
            { path: 'requestId', authorityPath: 'lookup.requestId' },
            { path: 'bundle.appliedVersion', authorityPath: 'lookup.bundleVersion' },
            { path: 'bundle.sha256', authorityPath: 'lookup.bundleSha256' },
            { path: 'identity', authorityPath: 'identity' },
        ] },
];
const receiptRule = { op: 'lifecycle_receipt',
    targetBindings: [['request.scope', 'ordinaryState.scope'], ['request.capability', 'ordinaryState.capability']],
    runtimeBinding: ['request.scope.agentId', 'request.identity.runtimeAgentId'],
    preparationPhases: ['prepare', 'suspend'], inactiveMemberships: ['disabled', 'removed'], fenceFields: ['operationId', 'fence'],
};
const lifecycleRules = [{ op: 'lifecycle_request', sameBundleActions: ['start', 'stop', 'restart'], reloadActions: ['reload'], phaseOrder: {
            prepare: [], suspend: ['prepared'], activate: ['suspended'], rollback: ['prepared', 'suspended', 'activated'],
        }, runtimeBinding: ['scope.agentId', 'identity.runtimeAgentId'],
        authorityBindings: [['scope', 'scope'], ['identity', 'identity'], ['capability', 'capability'], ['requestId', 'requestId'], ['transition.to', 'bundle'], ['targetMembership', 'membership'], ['operation', 'operation'], ['configuration', 'configuration']],
        nullishBindingFields: ['configuration', 'operation'],
        ignoredBindingFields: ['phase'], previousStateBindings: [['previousState.scope', 'scope'], ['previousState.capability', 'capability']],
        receiptFenceFields: ['operationId', 'fence'], ambiguousStates: ['pending', 'ambiguous'],
    }];
/** Export data consumed by the compiled generator. Gated schemas are documentation, never admission. */
function getPortableCapabilityContracts() {
    const contracts = {};
    const add = (name, schema, rules, expectedChecks, gates = []) => {
        const count = customRefinements(schema);
        if (expectedChecks !== null && count !== expectedChecks)
            throw new Error(`Uncovered refinement in portable contract ${name}`);
        let json = null;
        try {
            json = portableJsonSchema(schema);
        }
        catch {
            if (gates.length === 0)
                throw new Error(`Nonportable schema in ${name}`);
            gates = [...gates, 'JSON Schema conversion requires an explicit transform/recursive codec'];
        }
        contracts[name] = { supported: gates.length === 0, schema: json, rules, gates, customRefinements: count, limitations: [] };
    };
    add('ordinarySnapshot', snapshot, [{ op: 'max_properties', path: 'values', max: 100 }, { op: 'authority_equal', path: '' }], 1);
    add('ordinaryToolCall', ordinaryCall, callRules, 4);
    add('ragToolCall', ragCall, [{ op: 'membership_call', capability: 'rag' }, organizationRunRule, organizationExpiryRule], 4);
    add('ragQueryRequest', rag_query_js_1.RagQueryRequestSchema, [], 0);
    add('ragQueryResponse', rag_query_js_1.RagQueryResponseSchema, [], 0);
    add('videoEngineJob', engine_js_1.VideoEngineJobSchema, [], 0);
    add('videoEngineJobResponse', engine_js_1.VideoEngineJobResponseSchema, [], 0);
    add('videoEngineStoryRequest', story_js_1.VideoEngineStoryRequestSchema, [], 0);
    add('videoEngineStoryEstimate', story_js_1.VideoEngineStoryEstimateSchema, [], 0);
    add('videoEngineProject', engine_js_1.VideoEngineProjectSchema, [], 0);
    add('videoEnginePlanRequest', engine_js_1.VideoEngineRoutePlanRequestSchema, [], 0);
    add('videoEngineApproveRequest', engine_js_1.VideoEngineRouteApproveRequestSchema, [], 0);
    add('videoEngineRunRequest', engine_js_1.VideoEngineRouteRunRequestSchema, [], 0);
    add('videoEngineError', engine_js_1.VideoEngineErrorSchema, [], 0);
    add('videoEngineHealth', engine_js_1.VideoEngineHealthSchema, [], 0);
    add('videoEngineFootageAddQuery', footage_js_1.VideoFootageAddQuerySchema, [], 0);
    add('videoEngineFootageJobAccepted', footage_js_1.VideoFootageJobAcceptedSchema, [], 0);
    add('videoEngineFootageRejected', footage_js_1.VideoEngineFootageRejectedSchema, [], 0);
    add('videoEngineFootageJobQuery', footage_js_1.VideoFootageJobQuerySchema, [], 0);
    add('videoEngineFootageJob', footage_js_1.VideoFootageJobSchema, [], 0);
    add('videoEngineFootageListQuery', footage_js_1.VideoFootageListQuerySchema, [], 0);
    add('videoEngineFootageList', footage_js_1.VideoFootageListSchema, [], 0);
    add('videoEngineModelQuery', modella_js_1.VideoModelScopeQuerySchema, [], 0);
    add('parallelCharacterExportQuery', personaggio_parallel_js_1.VideoParallelExportQuerySchema, [], 0);
    add('parallelCharacterExport', personaggio_parallel_js_1.VideoParallelExportSchema, [], 0);
    add('parallelCharacterExportError', personaggio_parallel_js_1.VideoParallelExportErrorSchema, [], 0);
    add('videoEngineParallelImportRequest', personaggio_parallel_import_js_1.VideoParallelImportRequestSchema, [], 0);
    add('videoEngineParallelImportResult', personaggio_parallel_import_js_1.VideoParallelImportResultSchema, [], 0);
    add('videoEngineOutfitStyleRequest', abito_stile_js_1.VideoOutfitStyleRequestSchema, [], 0);
    add('videoEngineOutfitStyleResult', abito_stile_js_1.VideoOutfitStyleResultSchema, [], 0);
    add('videoEngineModelRefAddQuery', modella_js_1.VideoModelRefAddQuerySchema, [], 0);
    add('videoEngineModelCreateRequest', modella_js_1.VideoModelCreateRequestSchema, [], 0);
    add('videoEngineModelVersionCreateRequest', modella_js_1.VideoModelVersionCreateRequestSchema, [], 0);
    add('videoEngineModelApproveRequest', modella_js_1.VideoModelApproveRequestSchema, [], 0);
    add('videoEngineModel', modella_js_1.VideoModelSchema, [], 0);
    add('videoEngineModelList', modella_js_1.VideoModelListSchema, [], 0);
    add('videoEngineModelVersion', modella_js_1.VideoModelVersionSchema, [], 0);
    add('videoEngineModelProductionQuery', produzione_modella_js_1.VideoModelProductionQuerySchema, [], 0);
    add('videoEngineModelProductionCreated', produzione_modella_js_1.VideoModelProductionCreatedSchema, [], 0);
    add('videoEngineOutfitProductionQuery', abito_js_1.VideoOutfitProductionQuerySchema, [], 0);
    add('videoEngineOutfitProductionCreated', abito_js_1.VideoOutfitProductionCreatedSchema, [], 0);
    add('videoEngineLongQuery', lungo_js_1.VideoLongScopeQuerySchema, [], 0);
    add('videoEngineLongFramesDocument', lungo_fotogrammi_js_1.VideoLongFramesDocumentSchema, [], 0);
    add('videoEngineLongFrames', lungo_fotogrammi_js_1.VideoLongFramesSchema, [], 0);
    add('videoEngineLongFramesApproveRequest', lungo_fotogrammi_js_1.VideoLongFramesApproveRequestSchema, [], 0);
    add('videoEngineLongProductionSettings', lungo_produzione_js_1.VideoLongProductionSettingsSchema, [], 0);
    add('videoEngineLongProduction', lungo_produzione_js_1.VideoLongProductionSchema, [], 0);
    add('videoEngineLongRunQuoteRequest', lungo_produzione_js_1.VideoLongRunQuoteRequestSchema, [], 0);
    add('videoEngineLongRunQuote', lungo_produzione_js_1.VideoLongRunQuoteSchema, [], 0);
    add('videoEngineLongRunRequest', lungo_produzione_js_1.VideoLongRunRequestSchema, [], 0);
    add('videoEngineLongChapterRun', lungo_produzione_js_1.VideoLongChapterRunSchema, [], 0);
    add('videoEngineLongChapterFrames', lungo_produzione_js_1.VideoLongChapterFramesSchema, [], 0);
    add('videoEngineLongChapterFramesApproveRequest', lungo_produzione_js_1.VideoLongChapterFramesApproveRequestSchema, [], 0);
    add('videoEngineLongJoinRequest', lungo_produzione_js_1.VideoLongJoinRequestSchema, [], 0);
    add('videoEngineLongFinalVideo', lungo_produzione_js_1.VideoLongFinalVideoSchema, [], 0);
    add('videoEngineLongResearchStartRequest', lungo_ricerca_js_1.VideoLongResearchStartRequestSchema, [], 0);
    add('videoEngineLongResearch', lungo_ricerca_js_1.VideoLongResearchSchema, [], 0);
    add('videoEngineLongDossierDocument', lungo_ricerca_js_1.VideoLongDossierDocumentSchema, [], 0);
    add('videoEngineLongDossier', lungo_ricerca_js_1.VideoLongDossierSchema, [], 0);
    add('videoEngineLongChaptersDocument', lungo_ricerca_js_1.VideoLongChaptersDocumentSchema, [], 0);
    add('videoEngineLongChapters', lungo_ricerca_js_1.VideoLongChaptersSchema, [], 0);
    add('videoEngineLongChaptersApproveRequest', lungo_ricerca_js_1.VideoLongChaptersApproveRequestSchema, [], 0);
    add('videoEngineLongCreateRequest', lungo_js_1.VideoLongCreateRequestSchema, [], 0);
    add('videoEngineLongProject', lungo_js_1.VideoLongProjectSchema, [], 0);
    add('videoEngineLongProjectList', lungo_js_1.VideoLongProjectListSchema, [], 0);
    add('videoEngineLongDraftDocument', lungo_bozza_js_1.VideoLongDraftDocumentSchema, [], 0);
    add('videoEngineLongDraft', lungo_bozza_js_1.VideoLongDraftSchema, [], 0);
    add('videoEngineLongDraftApproveRequest', lungo_bozza_js_1.VideoLongDraftApproveRequestSchema, [], 0);
    add('videoEngineLongCostByStep', costo_passi_js_1.VideoCostByStepSchema, [], 0);
    add('videoEnginePresetFromVideoQuery', preset_da_video_js_1.VideoPresetFromVideoStartQuerySchema, [], 0);
    add('videoEnginePresetFromVideoStartRequest', preset_da_video_js_1.VideoPresetFromVideoStartRequestSchema, [], 0);
    add('videoEnginePresetFromVideoJob', preset_da_video_js_1.VideoPresetFromVideoJobSchema, [], 0);
    add('videoEngineUserPresetList', preset_da_video_js_1.VideoUserPresetListSchema, [], 0);
    add('videoEngineUserPreset', preset_da_video_js_1.VideoUserPresetSchema, [], 0);
    add('videoEnginePresetSaveRequest', preset_da_video_js_1.VideoPresetSaveRequestSchema, [], 0);
    add('videoEngineEnvironmentQuery', ambiente_js_1.VideoEnvironmentScopeQuerySchema, [], 0);
    add('videoEngineEnvironmentCreateRequest', ambiente_js_1.VideoEnvironmentCreateRequestSchema, [], 0);
    add('videoEngineEnvironment', ambiente_js_1.VideoEnvironmentSchema, [], 0);
    add('videoEngineEnvironmentList', ambiente_js_1.VideoEnvironmentListSchema, [], 0);
    add('videoEngineEnvironmentVersionCreateRequest', ambiente_js_1.VideoEnvironmentVersionCreateRequestSchema, [], 0);
    add('videoEngineEnvironmentVersion', ambiente_js_1.VideoEnvironmentVersionSchema, [], 0);
    add('videoEngineEnvironmentAngleRequest', ambiente_js_1.VideoEnvironmentAngleRequestSchema, [], 0);
    add('videoEngineEnvironmentApproveRequest', ambiente_js_1.VideoEnvironmentApproveRequestSchema, [], 0);
    add('videoEngineModelRegia', regia_js_1.VideoModelRegiaDocumentSchema, [], 0);
    add('videoEngineModelState', produzione_modella_js_1.VideoModelProductionStateSchema, [], 0);
    add('videoEngineModelFrameRequest', produzione_modella_js_1.VideoModelFrameRequestSchema, [], 0);
    add('videoEngineModelFrameApproveRequest', produzione_modella_js_1.VideoModelFrameApproveRequestSchema, [], 0);
    add('authorityQuery', ordinary_authority_js_1.AgentOrdinaryAuthorityQuerySchema, [{ op: 'normalize_integer', path: 'bundleVersion', schema: zod_1.z.toJSONSchema(ordinary_lifecycle_js_1.CapabilityOrdinaryBundleReferenceSchema.shape.appliedVersion) }], 0);
    add('authorityResponse', authorityResponse, authorityRules, 2);
    contracts.authorityResponse.limitations = ['Only null or frozen configurations with zero parameters; parameter/Master/structured semantics remain gated'];
    contracts.ordinaryToolCall.limitations = ['Only B1 primitive values; structured values require qualified portable codecs'];
    add('configuration', ordinary_configuration_js_1.CapabilityOrdinaryConfigurationSchema, [], null, ['Parameter declarations/resolutions/structured/Master semantics are not yet portable']);
    add('emptyConfiguration', emptyConfiguration, [], 1);
    add('ordinaryQuery', internal_capability_agent_js_1.ordinaryCapabilityAgentConfigGetContract.querySchema, [], 0);
    add('ordinaryState', emptyState, [{ op: 'ordinary_empty_state' }], 2);
    add('lifecycleRequest', lifecycleRequest, lifecycleRules, 2);
    add('lifecycleReceipt', lifecycleReceipt, [receiptRule], 4);
    add('lifecycleTransaction', lifecycleTransaction, [], 4, ['Internal shape: use lifecycle request/receipt admission for semantic validation']);
    add('lifecycleAuthority', lifecycleAuthority, [], 5, ['Internal shape: use lifecycle request admission for semantic validation']);
    for (const name of ['lifecycleRequest', 'lifecycleReceipt', 'lifecycleTransaction', 'lifecycleAuthority']) {
        contracts[name].limitations = ['Only null or frozen configurations with zero parameters; durable effects and reconciliation are consumer-owned'];
    }
    const transport = (contract) => ({
        method: contract.method, path: contract.path, authHeader: auth_headers_js_1.INTERNAL_SECRET_HEADER, paramsSchema: zod_1.z.toJSONSchema(contract.paramsSchema),
    });
    return { format: 'x9-capability-portable-v1', contracts, transports: {
            authority: { ...transport(internal_agents_ordinary_authority_js_1.agentOrdinaryAuthorityContract), queryContract: 'authorityQuery' },
            ordinaryGet: { ...transport(internal_capability_agent_js_1.ordinaryCapabilityAgentConfigGetContract), queryContract: 'ordinaryQuery' },
            lifecycle: transport(internal_capability_agent_js_1.ordinaryCapabilityLifecyclePutContract), call: transport(cap_tool_call_js_1.capToolCallContract),
            videoEngineJob: { ...transport(officina_video_js_5.officinaVideoJobContract), errorContract: 'videoEngineError' },
            videoEngineHealth: { ...transport(officina_video_js_5.officinaVideoHealthContract), responseContract: 'videoEngineHealth', errorContract: 'videoEngineError' },
            videoEngineStory: { ...transport(officina_video_js_5.officinaVideoStoryContract), requestContract: 'videoEngineStoryRequest', errorContract: 'videoEngineError' },
            videoEngineStoryEstimate: { ...transport(officina_video_js_5.officinaVideoStoryEstimateContract), requestContract: 'videoEngineStoryRequest', responseContract: 'videoEngineStoryEstimate', errorContract: 'videoEngineError' },
            videoEngineProjectGet: { ...transport(officina_video_js_5.officinaVideoProjectGetContract), responseContract: 'videoEngineProject', errorContract: 'videoEngineError' },
            videoEnginePlan: { ...transport(officina_video_js_5.officinaVideoPlanContract), requestContract: 'videoEnginePlanRequest', responseContract: 'videoEngineProject', errorContract: 'videoEngineError' },
            videoEngineApprove: { ...transport(officina_video_js_5.officinaVideoApproveContract), requestContract: 'videoEngineApproveRequest', responseContract: 'videoEngineProject', errorContract: 'videoEngineError' },
            videoEngineRun: { ...transport(officina_video_js_5.officinaVideoRunContract), requestContract: 'videoEngineRunRequest', responseContract: 'videoEngineProject', errorContract: 'videoEngineError' },
            videoEngineFootageAdd: {
                ...transport(officina_video_js_5.officinaVideoFootageAddContract), queryContract: 'videoEngineFootageAddQuery', responseContract: 'videoEngineFootageJobAccepted', errorContract: 'videoEngineError',
                bodyMediaTypes: officina_video_js_5.officinaVideoFootageAddContract.bodyMediaTypes, maxBodyBytes: officina_video_js_5.officinaVideoFootageAddContract.maxBodyBytes,
            },
            videoEngineFootageJobGet: { ...transport(officina_video_js_5.officinaVideoFootageJobGetContract), queryContract: 'videoEngineFootageJobQuery', responseContract: 'videoEngineFootageJob', errorContract: 'videoEngineError' },
            videoEngineFootageList: { ...transport(officina_video_js_5.officinaVideoFootageListContract), queryContract: 'videoEngineFootageListQuery', responseContract: 'videoEngineFootageList', errorContract: 'videoEngineError' },
            videoEngineModelCreate: { ...transport(officina_video_js_5.officinaVideoModelCreateContract), queryContract: 'videoEngineModelQuery', requestContract: 'videoEngineModelCreateRequest', responseContract: 'videoEngineModel', errorContract: 'videoEngineError' },
            videoEngineModelList: { ...transport(officina_video_js_5.officinaVideoModelListContract), queryContract: 'videoEngineModelQuery', responseContract: 'videoEngineModelList', errorContract: 'videoEngineError' },
            videoEngineModelGet: { ...transport(officina_video_js_5.officinaVideoModelGetContract), queryContract: 'videoEngineModelQuery', responseContract: 'videoEngineModel', errorContract: 'videoEngineError' },
            videoEngineModelVersionCreate: { ...transport(officina_video_js_5.officinaVideoModelVersionCreateContract), queryContract: 'videoEngineModelQuery', requestContract: 'videoEngineModelVersionCreateRequest', responseContract: 'videoEngineModelVersion', errorContract: 'videoEngineError' },
            videoEngineModelRefAdd: { ...transport(officina_video_js_5.officinaVideoModelRefAddContract), queryContract: 'videoEngineModelRefAddQuery', responseContract: 'videoEngineModelVersion', errorContract: 'videoEngineError', bodyMediaTypes: officina_video_js_5.officinaVideoModelRefAddContract.bodyMediaTypes, maxBodyBytes: officina_video_js_5.officinaVideoModelRefAddContract.maxBodyBytes },
            videoEngineModelRefGet: { ...transport(officina_video_js_5.officinaVideoModelRefGetContract), queryContract: 'videoEngineModelQuery', errorContract: 'videoEngineError' },
            videoEngineModelApprove: { ...transport(officina_video_js_5.officinaVideoModelApproveContract), queryContract: 'videoEngineModelQuery', requestContract: 'videoEngineModelApproveRequest', responseContract: 'videoEngineModelVersion', errorContract: 'videoEngineError' },
            videoEngineModelProductionCreate: {
                ...transport(officina_video_js_5.officinaVideoModelProductionCreateContract), queryContract: 'videoEngineModelProductionQuery', responseContract: 'videoEngineModelProductionCreated', errorContract: 'videoEngineError',
                bodyMediaTypes: officina_video_js_5.officinaVideoModelProductionCreateContract.bodyMediaTypes, maxBodyBytes: officina_video_js_5.officinaVideoModelProductionCreateContract.maxBodyBytes,
            },
            videoEngineOutfitProductionCreate: {
                ...transport(officina_video_js_5.officinaVideoOutfitProductionCreateContract), queryContract: 'videoEngineOutfitProductionQuery', responseContract: 'videoEngineOutfitProductionCreated', errorContract: 'videoEngineError',
                bodyMediaTypes: officina_video_js_5.officinaVideoOutfitProductionCreateContract.bodyMediaTypes, maxBodyBytes: officina_video_js_5.officinaVideoOutfitProductionCreateContract.maxBodyBytes,
            },
            videoEngineLongResearchStart: { ...transport(officina_video_js_2.officinaVideoLongResearchStartContract), queryContract: 'videoEngineLongQuery', requestContract: 'videoEngineLongResearchStartRequest', responseContract: 'videoEngineLongResearch', errorContract: 'videoEngineError' },
            videoEngineLongResearchGet: { ...transport(officina_video_js_2.officinaVideoLongResearchGetContract), queryContract: 'videoEngineLongQuery', responseContract: 'videoEngineLongResearch', errorContract: 'videoEngineError' },
            videoEngineLongDossierPut: { ...transport(officina_video_js_2.officinaVideoLongDossierPutContract), queryContract: 'videoEngineLongQuery', requestContract: 'videoEngineLongDossierDocument', responseContract: 'videoEngineLongDossier', errorContract: 'videoEngineError' },
            videoEngineLongDossierGet: { ...transport(officina_video_js_2.officinaVideoLongDossierGetContract), queryContract: 'videoEngineLongQuery', responseContract: 'videoEngineLongDossier', errorContract: 'videoEngineError' },
            videoEngineLongChaptersPut: { ...transport(officina_video_js_2.officinaVideoLongChaptersPutContract), queryContract: 'videoEngineLongQuery', requestContract: 'videoEngineLongChaptersDocument', responseContract: 'videoEngineLongChapters', errorContract: 'videoEngineError' },
            videoEngineLongChaptersGet: { ...transport(officina_video_js_2.officinaVideoLongChaptersGetContract), queryContract: 'videoEngineLongQuery', responseContract: 'videoEngineLongChapters', errorContract: 'videoEngineError' },
            videoEngineLongChaptersApprove: { ...transport(officina_video_js_2.officinaVideoLongChaptersApproveContract), queryContract: 'videoEngineLongQuery', requestContract: 'videoEngineLongChaptersApproveRequest', responseContract: 'videoEngineLongChapters', errorContract: 'videoEngineError' },
            videoEngineLongFramesPut: { ...transport(officina_video_js_1.officinaVideoLongFramesPutContract), queryContract: 'videoEngineLongQuery', requestContract: 'videoEngineLongFramesDocument', responseContract: 'videoEngineLongFrames', errorContract: 'videoEngineError' },
            videoEngineLongFramesGet: { ...transport(officina_video_js_1.officinaVideoLongFramesGetContract), queryContract: 'videoEngineLongQuery', responseContract: 'videoEngineLongFrames', errorContract: 'videoEngineError' },
            videoEngineLongFramesApprove: { ...transport(officina_video_js_1.officinaVideoLongFramesApproveContract), queryContract: 'videoEngineLongQuery', requestContract: 'videoEngineLongFramesApproveRequest', responseContract: 'videoEngineLongFrames', errorContract: 'videoEngineError' },
            videoEngineLongProductionSettingsPut: { ...transport(officina_video_js_1.officinaVideoLongProductionSettingsPutContract), queryContract: 'videoEngineLongQuery', requestContract: 'videoEngineLongProductionSettings', responseContract: 'videoEngineLongProduction', errorContract: 'videoEngineError' },
            videoEngineLongProductionGet: { ...transport(officina_video_js_1.officinaVideoLongProductionGetContract), queryContract: 'videoEngineLongQuery', responseContract: 'videoEngineLongProduction', errorContract: 'videoEngineError' },
            videoEngineLongRunQuote: { ...transport(officina_video_js_1.officinaVideoLongRunQuoteContract), queryContract: 'videoEngineLongQuery', requestContract: 'videoEngineLongRunQuoteRequest', responseContract: 'videoEngineLongRunQuote', errorContract: 'videoEngineError' },
            videoEngineLongRunStart: { ...transport(officina_video_js_1.officinaVideoLongRunStartContract), queryContract: 'videoEngineLongQuery', requestContract: 'videoEngineLongRunRequest', responseContract: 'videoEngineLongChapterRun', errorContract: 'videoEngineError' },
            videoEngineLongChapterFramesGet: { ...transport(officina_video_js_1.officinaVideoLongChapterFramesGetContract), queryContract: 'videoEngineLongQuery', responseContract: 'videoEngineLongChapterFrames', errorContract: 'videoEngineError' },
            videoEngineLongChapterFramesApprove: { ...transport(officina_video_js_1.officinaVideoLongChapterFramesApproveContract), queryContract: 'videoEngineLongQuery', requestContract: 'videoEngineLongChapterFramesApproveRequest', responseContract: 'videoEngineLongChapterFrames', errorContract: 'videoEngineError' },
            videoEngineLongChapterFrameImageGet: { ...transport(officina_video_js_1.officinaVideoLongChapterFrameImageGetContract), queryContract: 'videoEngineLongQuery', errorContract: 'videoEngineError' },
            videoEngineLongJoin: { ...transport(officina_video_js_1.officinaVideoLongJoinContract), queryContract: 'videoEngineLongQuery', requestContract: 'videoEngineLongJoinRequest', responseContract: 'videoEngineLongProduction', errorContract: 'videoEngineError' },
            videoEngineLongVideoGet: { ...transport(officina_video_js_1.officinaVideoLongVideoGetContract), queryContract: 'videoEngineLongQuery', responseContract: 'videoEngineLongFinalVideo', errorContract: 'videoEngineError' },
            videoEngineLongVideoFileGet: { ...transport(officina_video_js_1.officinaVideoLongVideoFileGetContract), queryContract: 'videoEngineLongQuery', errorContract: 'videoEngineError' },
            videoEngineLongCreate: { ...transport(officina_video_js_4.officinaVideoLongCreateContract), queryContract: 'videoEngineLongQuery', requestContract: 'videoEngineLongCreateRequest', responseContract: 'videoEngineLongProject', errorContract: 'videoEngineError' },
            videoEngineLongList: { ...transport(officina_video_js_4.officinaVideoLongListContract), queryContract: 'videoEngineLongQuery', responseContract: 'videoEngineLongProjectList', errorContract: 'videoEngineError' },
            videoEngineLongGet: { ...transport(officina_video_js_4.officinaVideoLongGetContract), queryContract: 'videoEngineLongQuery', responseContract: 'videoEngineLongProject', errorContract: 'videoEngineError' },
            videoEngineLongDraftPut: { ...transport(officina_video_js_4.officinaVideoLongDraftPutContract), queryContract: 'videoEngineLongQuery', requestContract: 'videoEngineLongDraftDocument', responseContract: 'videoEngineLongDraft', errorContract: 'videoEngineError' },
            videoEngineLongDraftGet: { ...transport(officina_video_js_4.officinaVideoLongDraftGetContract), queryContract: 'videoEngineLongQuery', responseContract: 'videoEngineLongDraft', errorContract: 'videoEngineError' },
            videoEngineLongDraftApprove: { ...transport(officina_video_js_4.officinaVideoLongDraftApproveContract), queryContract: 'videoEngineLongQuery', requestContract: 'videoEngineLongDraftApproveRequest', responseContract: 'videoEngineLongDraft', errorContract: 'videoEngineError' },
            videoEngineLongCostGet: { ...transport(officina_video_js_4.officinaVideoLongCostGetContract), queryContract: 'videoEngineLongQuery', responseContract: 'videoEngineLongCostByStep', errorContract: 'videoEngineError' },
            parallelCharacterExport: { ...transport(parallel_personaggi_js_1.parallelCharacterExportContract), queryContract: 'parallelCharacterExportQuery', responseContract: 'parallelCharacterExport', errorContract: 'parallelCharacterExportError' },
            videoEngineParallelImport: { ...transport(parallel_personaggi_js_1.officinaVideoParallelImportContract), queryContract: 'videoEngineModelQuery', requestContract: 'videoEngineParallelImportRequest', responseContract: 'videoEngineParallelImportResult', errorContract: 'videoEngineError' },
            videoEngineOutfitStyle: { ...transport(officina_video_js_3.officinaVideoModelOutfitStyleContract), queryContract: 'videoEngineModelQuery', requestContract: 'videoEngineOutfitStyleRequest', responseContract: 'videoEngineOutfitStyleResult', errorContract: 'videoEngineError' },
            videoEnginePresetFromVideoStart: { ...transport(officina_video_js_5.officinaVideoPresetFromVideoStartContract), queryContract: 'videoEnginePresetFromVideoQuery', requestContract: 'videoEnginePresetFromVideoStartRequest', responseContract: 'videoEnginePresetFromVideoJob', errorContract: 'videoEngineError' },
            videoEnginePresetFromVideoJobGet: { ...transport(officina_video_js_5.officinaVideoPresetFromVideoJobGetContract), queryContract: 'videoEnginePresetFromVideoQuery', responseContract: 'videoEnginePresetFromVideoJob', errorContract: 'videoEngineError' },
            videoEngineUserPresetList: { ...transport(officina_video_js_5.officinaVideoUserPresetListContract), queryContract: 'videoEnginePresetFromVideoQuery', responseContract: 'videoEngineUserPresetList', errorContract: 'videoEngineError' },
            videoEngineUserPresetGet: { ...transport(officina_video_js_5.officinaVideoUserPresetGetContract), queryContract: 'videoEnginePresetFromVideoQuery', responseContract: 'videoEngineUserPreset', errorContract: 'videoEngineError' },
            videoEngineUserPresetSave: { ...transport(officina_video_js_5.officinaVideoUserPresetSaveContract), queryContract: 'videoEnginePresetFromVideoQuery', requestContract: 'videoEnginePresetSaveRequest', responseContract: 'videoEngineUserPreset', errorContract: 'videoEngineError' },
            videoEngineEnvironmentCreate: { ...transport(officina_video_js_6.officinaVideoEnvironmentCreateContract), queryContract: 'videoEngineEnvironmentQuery', requestContract: 'videoEngineEnvironmentCreateRequest', responseContract: 'videoEngineEnvironment', errorContract: 'videoEngineError' },
            videoEngineEnvironmentList: { ...transport(officina_video_js_6.officinaVideoEnvironmentListContract), queryContract: 'videoEngineEnvironmentQuery', responseContract: 'videoEngineEnvironmentList', errorContract: 'videoEngineError' },
            videoEngineEnvironmentGet: { ...transport(officina_video_js_6.officinaVideoEnvironmentGetContract), queryContract: 'videoEngineEnvironmentQuery', responseContract: 'videoEngineEnvironment', errorContract: 'videoEngineError' },
            videoEngineEnvironmentVersionCreate: { ...transport(officina_video_js_6.officinaVideoEnvironmentVersionCreateContract), queryContract: 'videoEngineEnvironmentQuery', requestContract: 'videoEngineEnvironmentVersionCreateRequest', responseContract: 'videoEngineEnvironmentVersion', errorContract: 'videoEngineError' },
            videoEngineEnvironmentAngleAdd: { ...transport(officina_video_js_6.officinaVideoEnvironmentAngleAddContract), queryContract: 'videoEngineEnvironmentQuery', requestContract: 'videoEngineEnvironmentAngleRequest', responseContract: 'videoEngineEnvironmentVersion', errorContract: 'videoEngineError' },
            videoEngineEnvironmentAngleGet: { ...transport(officina_video_js_6.officinaVideoEnvironmentAngleGetContract), queryContract: 'videoEngineEnvironmentQuery', errorContract: 'videoEngineError' },
            videoEngineEnvironmentApprove: { ...transport(officina_video_js_6.officinaVideoEnvironmentApproveContract), queryContract: 'videoEngineEnvironmentQuery', requestContract: 'videoEngineEnvironmentApproveRequest', responseContract: 'videoEngineEnvironmentVersion', errorContract: 'videoEngineError' },
            videoEngineModelRegiaApply: { ...transport(officina_video_js_5.officinaVideoModelRegiaApplyContract), requestContract: 'videoEngineModelRegia', responseContract: 'videoEngineModelState', errorContract: 'videoEngineError' },
            videoEngineModelState: { ...transport(officina_video_js_5.officinaVideoModelStateContract), responseContract: 'videoEngineModelState', errorContract: 'videoEngineError' },
            videoEngineModelFrame: { ...transport(officina_video_js_5.officinaVideoModelFrameContract), requestContract: 'videoEngineModelFrameRequest', responseContract: 'videoEngineModelState', errorContract: 'videoEngineError' },
            videoEngineModelFrameApprove: { ...transport(officina_video_js_5.officinaVideoModelFrameApproveContract), requestContract: 'videoEngineModelFrameApproveRequest', responseContract: 'videoEngineModelState', errorContract: 'videoEngineError' },
            videoEngineMedia: {
                method: 'GET', path: '/media/:engineProjectId/:file', authHeader: auth_headers_js_1.INTERNAL_SECRET_HEADER, errorContract: 'videoEngineError',
                paramsSchema: zod_1.z.toJSONSchema(zod_1.z.object({ engineProjectId: engine_js_1.VideoEngineIdSchema, file: zod_1.z.string().regex(/^[A-Za-z0-9_-]+\.(png|jpg|jpeg|mp4|mov|srt|wav|mp3|m4a|aac|zip)$/) }).strict()),
            },
        } };
}
function at(value, path) {
    return path === '' ? value : path.split('.').reduce((current, key) => current !== null && typeof current === 'object' ? current[key] : undefined, value);
}
/** Pure IR binding used by TS and generated Python; authority must come from the authenticated loaded consumer. */
function applyPortableCapabilityRules(value, rules, authority) {
    for (const rule of rules) {
        switch (rule.op) {
            case 'empty_configuration_target':
                authorityResponse.parse(value);
                break;
            case 'ordinary_empty_state':
                emptyState.parse(value);
                break;
            case 'max_properties': {
                const target = at(value, rule.path);
                if (!target || typeof target !== 'object' || Array.isArray(target) || Object.keys(target).length > rule.max)
                    throw new Error('Portable ordinary key count mismatch');
                break;
            }
            case 'equal_paths':
                if (at(value, rule.left) === undefined || !(0, ordinary_configuration_js_1.sameOrdinaryData)(at(value, rule.left), at(value, rule.right)))
                    throw new Error('Portable ordinary scope mismatch');
                break;
            case 'equal_paths_if_present':
                if (at(value, rule.left) !== undefined && (at(value, rule.right) === undefined || !(0, ordinary_configuration_js_1.sameOrdinaryData)(at(value, rule.left), at(value, rule.right))))
                    throw new Error('Portable ordinary scope mismatch');
                break;
            case 'timestamp_after_if_present': {
                const earlier = at(value, rule.earlier);
                if (earlier !== undefined && !(Date.parse(String(at(value, rule.later))) > Date.parse(String(earlier))))
                    throw new Error('Portable ordinary time window mismatch');
                break;
            }
            case 'authority_equal':
                if (authority === undefined || !(0, ordinary_configuration_js_1.sameOrdinaryData)(at(value, rule.path), snapshot.parse(authority)))
                    throw new Error('Portable ordinary loaded authority mismatch');
                break;
            case 'normalize_integer':
                ordinary_lifecycle_js_1.CapabilityOrdinaryBundleReferenceSchema.shape.appliedVersion.parse(at(value, rule.path));
                break;
            case 'authority_lookup': {
                if (!authority || typeof authority !== 'object')
                    throw new Error('Authenticated lookup authority is required');
                const context = authority;
                const checked = { lookup: ordinary_authority_js_1.AgentOrdinaryAuthorityQuerySchema.parse(context.lookup), identity: ordinary_authority_js_1.AgentOrdinaryAuthoritySchema.shape.identity.parse(context.identity) };
                for (const binding of rule.bindings)
                    if (at(value, binding.path) === undefined || !(0, ordinary_configuration_js_1.sameOrdinaryData)(at(value, binding.path), at(checked, binding.authorityPath)))
                        throw new Error('Portable authority lookup binding mismatch');
                break;
            }
            case 'membership_call': {
                const context = authority;
                if (!context)
                    throw new Error('Authenticated membership authority is required');
                const reply = parsePortableAuthorityResponse(context.response, context.lookup, context.identity);
                const call = value;
                if (reply.membership !== 'enabled' || reply.capability !== rule.capability || call.ordinaryConfiguration !== undefined
                    || call.tenantId !== reply.scope.tenantId || call.ownerId !== reply.scope.ownerId || call.agentId !== reply.scope.agentId)
                    throw new Error('RAG membership or call scope mismatch');
                break;
            }
            case 'lifecycle_request':
                (0, ordinary_lifecycle_js_1.parseCapabilityOrdinaryLifecycle)(lifecycleRequest.parse(value), lifecycleAuthority.parse(authority));
                break;
            case 'lifecycle_receipt': {
                const context = authority;
                if (!context)
                    throw new Error('Lifecycle receipt binding authority required');
                (0, ordinary_lifecycle_js_1.parseCapabilityOrdinaryLifecycleReceipt)(lifecycleReceipt.parse(value), lifecycleRequest.parse(context.request), lifecycleTransaction.parse(context.transaction));
                break;
            }
            default: throw new Error('Unsupported portable semantic rule');
        }
    }
}
function parsePortableAuthorityResponse(response, lookup, expectedIdentity) {
    const parsed = authorityResponse.parse(response);
    (0, ordinary_authority_js_1.parseAgentOrdinaryAuthorityResponse)(parsed, lookup, expectedIdentity);
    applyPortableCapabilityRules(parsed, authorityRules, { lookup, identity: expectedIdentity });
    return parsed;
}
function parsePortableRagToolCall(value, authority) {
    const parsed = ragCall.parse(value);
    applyPortableCapabilityRules(parsed, [{ op: 'membership_call', capability: 'rag' }, organizationRunRule, organizationExpiryRule], authority);
    return parsed;
}
function parsePortableLifecycleRequest(value, authority) {
    return (0, ordinary_lifecycle_js_1.parseCapabilityOrdinaryLifecycle)(lifecycleRequest.parse(value), lifecycleAuthority.parse(authority));
}
function parsePortableOrdinaryToolCall(value, authoritativeLoadedSnapshot) {
    const parsed = ordinaryCall.parse(value);
    applyPortableCapabilityRules(parsed, callRules, authoritativeLoadedSnapshot);
    return parsed;
}
//# sourceMappingURL=portable-contracts.js.map