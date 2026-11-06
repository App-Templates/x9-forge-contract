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
const officina_video_js_1 = require("../http/endpoints/officina-video.cjs");
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
            videoEngineJob: { ...transport(officina_video_js_1.officinaVideoJobContract), errorContract: 'videoEngineError' },
            videoEngineHealth: { ...transport(officina_video_js_1.officinaVideoHealthContract), responseContract: 'videoEngineHealth', errorContract: 'videoEngineError' },
            videoEngineStory: { ...transport(officina_video_js_1.officinaVideoStoryContract), requestContract: 'videoEngineStoryRequest', errorContract: 'videoEngineError' },
            videoEngineStoryEstimate: { ...transport(officina_video_js_1.officinaVideoStoryEstimateContract), requestContract: 'videoEngineStoryRequest', responseContract: 'videoEngineStoryEstimate', errorContract: 'videoEngineError' },
            videoEngineProjectGet: { ...transport(officina_video_js_1.officinaVideoProjectGetContract), responseContract: 'videoEngineProject', errorContract: 'videoEngineError' },
            videoEnginePlan: { ...transport(officina_video_js_1.officinaVideoPlanContract), requestContract: 'videoEnginePlanRequest', responseContract: 'videoEngineProject', errorContract: 'videoEngineError' },
            videoEngineApprove: { ...transport(officina_video_js_1.officinaVideoApproveContract), requestContract: 'videoEngineApproveRequest', responseContract: 'videoEngineProject', errorContract: 'videoEngineError' },
            videoEngineRun: { ...transport(officina_video_js_1.officinaVideoRunContract), requestContract: 'videoEngineRunRequest', responseContract: 'videoEngineProject', errorContract: 'videoEngineError' },
            videoEngineFootageAdd: {
                ...transport(officina_video_js_1.officinaVideoFootageAddContract), queryContract: 'videoEngineFootageAddQuery', responseContract: 'videoEngineFootageJobAccepted', errorContract: 'videoEngineError',
                bodyMediaTypes: officina_video_js_1.officinaVideoFootageAddContract.bodyMediaTypes, maxBodyBytes: officina_video_js_1.officinaVideoFootageAddContract.maxBodyBytes,
            },
            videoEngineFootageJobGet: { ...transport(officina_video_js_1.officinaVideoFootageJobGetContract), queryContract: 'videoEngineFootageJobQuery', responseContract: 'videoEngineFootageJob', errorContract: 'videoEngineError' },
            videoEngineFootageList: { ...transport(officina_video_js_1.officinaVideoFootageListContract), queryContract: 'videoEngineFootageListQuery', responseContract: 'videoEngineFootageList', errorContract: 'videoEngineError' },
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