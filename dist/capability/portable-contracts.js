import { z } from 'zod';
import { CapabilityOrdinaryCallSnapshotSchema, CapabilityOrdinaryConfigurationSchema, CapabilityOrdinaryConfigStateSchema, CapabilityOrdinaryAppliedSchema, sameOrdinaryData } from "./ordinary-configuration.js";
import { CapabilityParameterKeySchema, CapabilityParameterValueSchema } from "./parameters.js";
import { ToolCallRequestSchema } from "./tool-call.js";
import { RagQueryRequestSchema, RagQueryResponseSchema } from "../rag/rag-query.js";
import { VideoEngineJobSchema, VideoEngineJobResponseSchema, VideoEngineProjectSchema, VideoEngineRoutePlanRequestSchema, VideoEngineRouteApproveRequestSchema, VideoEngineRouteRunRequestSchema, VideoEngineErrorSchema, VideoEngineHealthSchema, VideoEngineIdSchema } from "./video/engine.js";
import { VideoEngineStoryRequestSchema, VideoEngineStoryEstimateSchema } from "./video/story.js";
import { VideoFootageAddQuerySchema, VideoFootageJobAcceptedSchema, VideoEngineFootageRejectedSchema, VideoFootageJobQuerySchema, VideoFootageJobSchema, VideoFootageListQuerySchema, VideoFootageListSchema } from "./video/footage.js";
import { AgentOrdinaryAuthorityQuerySchema, AgentOrdinaryAuthoritySchema, parseAgentOrdinaryAuthorityResponse } from "../agent/ordinary-authority.js";
import { CapabilityOrdinaryBundleReferenceSchema, CapabilityOrdinaryLifecycleRequestSchema, CapabilityOrdinaryLifecycleReceiptSchema, CapabilityOrdinaryLifecycleTransactionSchema, parseCapabilityOrdinaryLifecycle, parseCapabilityOrdinaryLifecycleReceipt } from "./ordinary-lifecycle.js";
import { agentOrdinaryAuthorityContract } from "../http/endpoints/internal-agents-ordinary-authority.js";
import { ordinaryCapabilityLifecyclePutContract, ordinaryCapabilityAgentConfigGetContract } from "../http/endpoints/internal-capability-agent.js";
import { capToolCallContract } from "../http/endpoints/cap-tool-call.js";
import { officinaVideoJobContract, officinaVideoHealthContract, officinaVideoStoryContract, officinaVideoStoryEstimateContract, officinaVideoProjectGetContract, officinaVideoPlanContract, officinaVideoApproveContract, officinaVideoRunContract, officinaVideoFootageAddContract, officinaVideoFootageJobGetContract, officinaVideoFootageListContract } from "../http/endpoints/officina-video.js";
import { INTERNAL_SECRET_HEADER } from "../auth/auth-headers.js";
// Narrow using canonical schemas, never copied definitions. Structured refinement portability is gated.
const snapshot = CapabilityOrdinaryCallSnapshotSchema.safeExtend({ values: z.record(CapabilityParameterKeySchema, CapabilityParameterValueSchema) });
const ordinaryCall = ToolCallRequestSchema.safeExtend({
    tenantId: ToolCallRequestSchema.shape.tenantId.unwrap(), ownerId: ToolCallRequestSchema.shape.ownerId.unwrap(),
    ordinaryConfiguration: snapshot,
}).strict();
const emptyConfiguration = CapabilityOrdinaryConfigurationSchema.safeExtend({ parameters: z.array(z.never()).max(0) });
const authorityResponse = AgentOrdinaryAuthoritySchema.safeExtend({ configuration: emptyConfiguration.nullable() });
const ragCall = ToolCallRequestSchema.safeExtend({
    tenantId: ToolCallRequestSchema.shape.tenantId.unwrap(), ownerId: ToolCallRequestSchema.shape.ownerId.unwrap(), ordinaryConfiguration: snapshot.optional(),
}).strict();
const lifecycleRequest = CapabilityOrdinaryLifecycleRequestSchema.safeExtend({ configuration: emptyConfiguration.optional() });
const emptyState = CapabilityOrdinaryConfigStateSchema.safeExtend({ desired: emptyConfiguration.nullable(), applied: CapabilityOrdinaryAppliedSchema.safeExtend({ configuration: emptyConfiguration }).nullable(), failed: z.null(), effectiveParameters: z.array(z.never()).max(0) });
const lifecycleReceipt = CapabilityOrdinaryLifecycleReceiptSchema.safeExtend({ request: lifecycleRequest, ordinaryState: emptyState });
const lifecycleTransaction = CapabilityOrdinaryLifecycleTransactionSchema.safeExtend({
    request: lifecycleRequest, previousState: emptyState, receipts: z.array(lifecycleReceipt).max(4),
});
const lifecycleAuthority = authorityResponse.safeExtend({ current: CapabilityOrdinaryBundleReferenceSchema.nullable(), transaction: lifecycleTransaction.nullable() });
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
export function portableJsonSchema(schema) {
    return z.toJSONSchema(schema, {
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
    { op: 'authority_lookup', identitySchema: z.toJSONSchema(AgentOrdinaryAuthoritySchema.shape.identity), bindings: [
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
export function getPortableCapabilityContracts() {
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
    add('ragQueryRequest', RagQueryRequestSchema, [], 0);
    add('ragQueryResponse', RagQueryResponseSchema, [], 0);
    add('videoEngineJob', VideoEngineJobSchema, [], 0);
    add('videoEngineJobResponse', VideoEngineJobResponseSchema, [], 0);
    add('videoEngineStoryRequest', VideoEngineStoryRequestSchema, [], 0);
    add('videoEngineStoryEstimate', VideoEngineStoryEstimateSchema, [], 0);
    add('videoEngineProject', VideoEngineProjectSchema, [], 0);
    add('videoEnginePlanRequest', VideoEngineRoutePlanRequestSchema, [], 0);
    add('videoEngineApproveRequest', VideoEngineRouteApproveRequestSchema, [], 0);
    add('videoEngineRunRequest', VideoEngineRouteRunRequestSchema, [], 0);
    add('videoEngineError', VideoEngineErrorSchema, [], 0);
    add('videoEngineHealth', VideoEngineHealthSchema, [], 0);
    add('videoEngineFootageAddQuery', VideoFootageAddQuerySchema, [], 0);
    add('videoEngineFootageJobAccepted', VideoFootageJobAcceptedSchema, [], 0);
    add('videoEngineFootageRejected', VideoEngineFootageRejectedSchema, [], 0);
    add('videoEngineFootageJobQuery', VideoFootageJobQuerySchema, [], 0);
    add('videoEngineFootageJob', VideoFootageJobSchema, [], 0);
    add('videoEngineFootageListQuery', VideoFootageListQuerySchema, [], 0);
    add('videoEngineFootageList', VideoFootageListSchema, [], 0);
    add('authorityQuery', AgentOrdinaryAuthorityQuerySchema, [{ op: 'normalize_integer', path: 'bundleVersion', schema: z.toJSONSchema(CapabilityOrdinaryBundleReferenceSchema.shape.appliedVersion) }], 0);
    add('authorityResponse', authorityResponse, authorityRules, 2);
    contracts.authorityResponse.limitations = ['Only null or frozen configurations with zero parameters; parameter/Master/structured semantics remain gated'];
    contracts.ordinaryToolCall.limitations = ['Only B1 primitive values; structured values require qualified portable codecs'];
    add('configuration', CapabilityOrdinaryConfigurationSchema, [], null, ['Parameter declarations/resolutions/structured/Master semantics are not yet portable']);
    add('emptyConfiguration', emptyConfiguration, [], 1);
    add('ordinaryQuery', ordinaryCapabilityAgentConfigGetContract.querySchema, [], 0);
    add('ordinaryState', emptyState, [{ op: 'ordinary_empty_state' }], 2);
    add('lifecycleRequest', lifecycleRequest, lifecycleRules, 2);
    add('lifecycleReceipt', lifecycleReceipt, [receiptRule], 4);
    add('lifecycleTransaction', lifecycleTransaction, [], 4, ['Internal shape: use lifecycle request/receipt admission for semantic validation']);
    add('lifecycleAuthority', lifecycleAuthority, [], 5, ['Internal shape: use lifecycle request admission for semantic validation']);
    for (const name of ['lifecycleRequest', 'lifecycleReceipt', 'lifecycleTransaction', 'lifecycleAuthority']) {
        contracts[name].limitations = ['Only null or frozen configurations with zero parameters; durable effects and reconciliation are consumer-owned'];
    }
    const transport = (contract) => ({
        method: contract.method, path: contract.path, authHeader: INTERNAL_SECRET_HEADER, paramsSchema: z.toJSONSchema(contract.paramsSchema),
    });
    return { format: 'x9-capability-portable-v1', contracts, transports: {
            authority: { ...transport(agentOrdinaryAuthorityContract), queryContract: 'authorityQuery' },
            ordinaryGet: { ...transport(ordinaryCapabilityAgentConfigGetContract), queryContract: 'ordinaryQuery' },
            lifecycle: transport(ordinaryCapabilityLifecyclePutContract), call: transport(capToolCallContract),
            videoEngineJob: { ...transport(officinaVideoJobContract), errorContract: 'videoEngineError' },
            videoEngineHealth: { ...transport(officinaVideoHealthContract), responseContract: 'videoEngineHealth', errorContract: 'videoEngineError' },
            videoEngineStory: { ...transport(officinaVideoStoryContract), requestContract: 'videoEngineStoryRequest', errorContract: 'videoEngineError' },
            videoEngineStoryEstimate: { ...transport(officinaVideoStoryEstimateContract), requestContract: 'videoEngineStoryRequest', responseContract: 'videoEngineStoryEstimate', errorContract: 'videoEngineError' },
            videoEngineProjectGet: { ...transport(officinaVideoProjectGetContract), responseContract: 'videoEngineProject', errorContract: 'videoEngineError' },
            videoEnginePlan: { ...transport(officinaVideoPlanContract), requestContract: 'videoEnginePlanRequest', responseContract: 'videoEngineProject', errorContract: 'videoEngineError' },
            videoEngineApprove: { ...transport(officinaVideoApproveContract), requestContract: 'videoEngineApproveRequest', responseContract: 'videoEngineProject', errorContract: 'videoEngineError' },
            videoEngineRun: { ...transport(officinaVideoRunContract), requestContract: 'videoEngineRunRequest', responseContract: 'videoEngineProject', errorContract: 'videoEngineError' },
            videoEngineFootageAdd: {
                ...transport(officinaVideoFootageAddContract), queryContract: 'videoEngineFootageAddQuery', responseContract: 'videoEngineFootageJobAccepted', errorContract: 'videoEngineError',
                bodyMediaTypes: officinaVideoFootageAddContract.bodyMediaTypes, maxBodyBytes: officinaVideoFootageAddContract.maxBodyBytes,
            },
            videoEngineFootageJobGet: { ...transport(officinaVideoFootageJobGetContract), queryContract: 'videoEngineFootageJobQuery', responseContract: 'videoEngineFootageJob', errorContract: 'videoEngineError' },
            videoEngineFootageList: { ...transport(officinaVideoFootageListContract), queryContract: 'videoEngineFootageListQuery', responseContract: 'videoEngineFootageList', errorContract: 'videoEngineError' },
            videoEngineMedia: {
                method: 'GET', path: '/media/:engineProjectId/:file', authHeader: INTERNAL_SECRET_HEADER, errorContract: 'videoEngineError',
                paramsSchema: z.toJSONSchema(z.object({ engineProjectId: VideoEngineIdSchema, file: z.string().regex(/^[A-Za-z0-9_-]+\.(png|jpg|jpeg|mp4|mov|srt|wav|mp3|m4a|aac|zip)$/) }).strict()),
            },
        } };
}
function at(value, path) {
    return path === '' ? value : path.split('.').reduce((current, key) => current !== null && typeof current === 'object' ? current[key] : undefined, value);
}
/** Pure IR binding used by TS and generated Python; authority must come from the authenticated loaded consumer. */
export function applyPortableCapabilityRules(value, rules, authority) {
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
                if (at(value, rule.left) === undefined || !sameOrdinaryData(at(value, rule.left), at(value, rule.right)))
                    throw new Error('Portable ordinary scope mismatch');
                break;
            case 'equal_paths_if_present':
                if (at(value, rule.left) !== undefined && (at(value, rule.right) === undefined || !sameOrdinaryData(at(value, rule.left), at(value, rule.right))))
                    throw new Error('Portable ordinary scope mismatch');
                break;
            case 'timestamp_after_if_present': {
                const earlier = at(value, rule.earlier);
                if (earlier !== undefined && !(Date.parse(String(at(value, rule.later))) > Date.parse(String(earlier))))
                    throw new Error('Portable ordinary time window mismatch');
                break;
            }
            case 'authority_equal':
                if (authority === undefined || !sameOrdinaryData(at(value, rule.path), snapshot.parse(authority)))
                    throw new Error('Portable ordinary loaded authority mismatch');
                break;
            case 'normalize_integer':
                CapabilityOrdinaryBundleReferenceSchema.shape.appliedVersion.parse(at(value, rule.path));
                break;
            case 'authority_lookup': {
                if (!authority || typeof authority !== 'object')
                    throw new Error('Authenticated lookup authority is required');
                const context = authority;
                const checked = { lookup: AgentOrdinaryAuthorityQuerySchema.parse(context.lookup), identity: AgentOrdinaryAuthoritySchema.shape.identity.parse(context.identity) };
                for (const binding of rule.bindings)
                    if (at(value, binding.path) === undefined || !sameOrdinaryData(at(value, binding.path), at(checked, binding.authorityPath)))
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
                parseCapabilityOrdinaryLifecycle(lifecycleRequest.parse(value), lifecycleAuthority.parse(authority));
                break;
            case 'lifecycle_receipt': {
                const context = authority;
                if (!context)
                    throw new Error('Lifecycle receipt binding authority required');
                parseCapabilityOrdinaryLifecycleReceipt(lifecycleReceipt.parse(value), lifecycleRequest.parse(context.request), lifecycleTransaction.parse(context.transaction));
                break;
            }
            default: throw new Error('Unsupported portable semantic rule');
        }
    }
}
export function parsePortableAuthorityResponse(response, lookup, expectedIdentity) {
    const parsed = authorityResponse.parse(response);
    parseAgentOrdinaryAuthorityResponse(parsed, lookup, expectedIdentity);
    applyPortableCapabilityRules(parsed, authorityRules, { lookup, identity: expectedIdentity });
    return parsed;
}
export function parsePortableRagToolCall(value, authority) {
    const parsed = ragCall.parse(value);
    applyPortableCapabilityRules(parsed, [{ op: 'membership_call', capability: 'rag' }, organizationRunRule, organizationExpiryRule], authority);
    return parsed;
}
export function parsePortableLifecycleRequest(value, authority) {
    return parseCapabilityOrdinaryLifecycle(lifecycleRequest.parse(value), lifecycleAuthority.parse(authority));
}
export function parsePortableOrdinaryToolCall(value, authoritativeLoadedSnapshot) {
    const parsed = ordinaryCall.parse(value);
    applyPortableCapabilityRules(parsed, callRules, authoritativeLoadedSnapshot);
    return parsed;
}
//# sourceMappingURL=portable-contracts.js.map