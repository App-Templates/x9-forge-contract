"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const ordinary_authority_js_1 = require("../agent/ordinary-authority.cjs");
const ordinary_lifecycle_js_1 = require("./ordinary-lifecycle.cjs");
const internal_agents_ordinary_authority_js_1 = require("../http/endpoints/internal-agents-ordinary-authority.cjs");
const internal_capability_agent_js_1 = require("../http/endpoints/internal-capability-agent.cjs");
const cap_tool_call_js_1 = require("../http/endpoints/cap-tool-call.cjs");
const auth_headers_js_1 = require("../auth/auth-headers.cjs");
// Narrow using canonical schemas, never copied definitions. Structured refinement portability is gated.
const snapshot = ordinary_configuration_js_1.CapabilityOrdinaryCallSnapshotSchema.safeExtend({ values: zod_1.z.record(parameters_js_1.CapabilityParameterKeySchema, parameters_js_1.CapabilityParameterValueSchema) });
const ordinaryCall = tool_call_js_1.ToolCallRequestSchema.safeExtend({
    tenantId: tool_call_js_1.ToolCallRequestSchema.shape.tenantId.unwrap(), ownerId: tool_call_js_1.ToolCallRequestSchema.shape.ownerId.unwrap(),
    ordinaryConfiguration: snapshot,
}).strict();
const authorityResponse = ordinary_authority_js_1.AgentOrdinaryAuthoritySchema.safeExtend({ configuration: zod_1.z.null() });
const ragCall = tool_call_js_1.ToolCallRequestSchema.safeExtend({
    tenantId: tool_call_js_1.ToolCallRequestSchema.shape.tenantId.unwrap(), ownerId: tool_call_js_1.ToolCallRequestSchema.shape.ownerId.unwrap(), ordinaryConfiguration: snapshot.optional(),
}).strict();
const lifecycleRequest = ordinary_lifecycle_js_1.CapabilityOrdinaryLifecycleRequestSchema.safeExtend({ configuration: zod_1.z.never().optional() });
const emptyState = ordinary_configuration_js_1.CapabilityOrdinaryConfigStateSchema.safeExtend({ desired: zod_1.z.null(), applied: zod_1.z.null(), failed: zod_1.z.null(), effectiveParameters: zod_1.z.array(zod_1.z.never()).max(0) });
const lifecycleReceipt = ordinary_lifecycle_js_1.CapabilityOrdinaryLifecycleReceiptSchema.safeExtend({ request: lifecycleRequest, ordinaryState: emptyState });
const lifecycleTransaction = ordinary_lifecycle_js_1.CapabilityOrdinaryLifecycleTransactionSchema.safeExtend({
    request: lifecycleRequest, previousState: emptyState, receipts: zod_1.z.array(lifecycleReceipt).max(4),
});
const lifecycleAuthority = authorityResponse.safeExtend({ current: ordinary_lifecycle_js_1.CapabilityOrdinaryBundleReferenceSchema.nullable(), transaction: lifecycleTransaction.nullable() });
/** Count non-JSON custom checks so a newly added refinement cannot silently become portable. */
function customRefinements(schema, seen = new Set()) {
    if (seen.has(schema))
        return 0;
    seen.add(schema);
    const def = schema._zod.def;
    const checks = (def.checks ?? []);
    let count = checks.filter(check => check._zod.def.check === 'custom').length;
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
const callRules = [
    { op: 'max_properties', path: 'ordinaryConfiguration.values', max: 100 },
    ...['tenantId', 'ownerId', 'agentId'].map(key => ({ op: 'equal_paths', left: `ordinaryConfiguration.scope.${key}`, right: key })),
    { op: 'authority_equal', path: 'ordinaryConfiguration' },
];
const authorityRules = [
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
const lifecycleRules = [{ op: 'lifecycle_request', phaseOrder: {
            prepare: [], suspend: ['prepared'], activate: ['suspended'], rollback: ['prepared', 'suspended', 'activated'],
        }, runtimeBinding: ['scope.agentId', 'identity.runtimeAgentId'],
        authorityBindings: [['scope', 'scope'], ['identity', 'identity'], ['capability', 'capability'], ['requestId', 'requestId'], ['transition.to', 'bundle'], ['targetMembership', 'membership']],
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
            json = zod_1.z.toJSONSchema(schema, { io: 'input', target: 'draft-2020-12' });
        }
        catch {
            if (gates.length === 0)
                throw new Error(`Nonportable schema in ${name}`);
            gates = [...gates, 'JSON Schema conversion requires an explicit transform/recursive codec'];
        }
        contracts[name] = { supported: gates.length === 0, schema: json, rules, gates, customRefinements: count, limitations: [] };
    };
    add('ordinarySnapshot', snapshot, [{ op: 'max_properties', path: 'values', max: 100 }, { op: 'authority_equal', path: '' }], 1);
    add('ordinaryToolCall', ordinaryCall, callRules, 2);
    add('ragToolCall', ragCall, [{ op: 'membership_call', capability: 'rag' }], 2);
    add('ragQueryRequest', rag_query_js_1.RagQueryRequestSchema, [], 0);
    add('ragQueryResponse', rag_query_js_1.RagQueryResponseSchema, [], 0);
    add('authorityQuery', ordinary_authority_js_1.AgentOrdinaryAuthorityQuerySchema, [{ op: 'normalize_integer', path: 'bundleVersion', schema: zod_1.z.toJSONSchema(ordinary_lifecycle_js_1.CapabilityOrdinaryBundleReferenceSchema.shape.appliedVersion) }], 0);
    add('authorityResponse', authorityResponse, authorityRules, 1);
    contracts.authorityResponse.limitations = ['Only configuration:null: full configuration/Master/structured refinements remain gated'];
    contracts.ordinaryToolCall.limitations = ['Only B1 primitive values; structured values require qualified portable codecs'];
    add('configuration', ordinary_configuration_js_1.CapabilityOrdinaryConfigurationSchema, [], null, ['Parameter declarations/resolutions/structured/Master semantics are not yet portable']);
    add('lifecycleRequest', lifecycleRequest, lifecycleRules, 1);
    add('lifecycleReceipt', lifecycleReceipt, [receiptRule], 3);
    add('lifecycleTransaction', lifecycleTransaction, [], 3, ['Internal shape: use lifecycle request/receipt admission for semantic validation']);
    add('lifecycleAuthority', lifecycleAuthority, [], 4, ['Internal shape: use lifecycle request admission for semantic validation']);
    for (const name of ['lifecycleRequest', 'lifecycleReceipt', 'lifecycleTransaction', 'lifecycleAuthority']) {
        contracts[name].limitations = ['Only capabilities without ordinary configuration; durable effects and reconciliation are consumer-owned'];
    }
    const transport = (contract) => ({
        method: contract.method, path: contract.path, authHeader: auth_headers_js_1.INTERNAL_SECRET_HEADER, paramsSchema: zod_1.z.toJSONSchema(contract.paramsSchema),
    });
    return { format: 'x9-capability-portable-v1', contracts, transports: {
            authority: { ...transport(internal_agents_ordinary_authority_js_1.agentOrdinaryAuthorityContract), queryContract: 'authorityQuery' },
            lifecycle: transport(internal_capability_agent_js_1.ordinaryCapabilityLifecyclePutContract), call: transport(cap_tool_call_js_1.capToolCallContract),
        } };
}
function at(value, path) {
    return path === '' ? value : path.split('.').reduce((current, key) => current !== null && typeof current === 'object' ? current[key] : undefined, value);
}
/** Pure IR binding used by TS and generated Python; authority must come from the authenticated loaded consumer. */
function applyPortableCapabilityRules(value, rules, authority) {
    for (const rule of rules) {
        switch (rule.op) {
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
    applyPortableCapabilityRules(parsed, [{ op: 'membership_call', capability: 'rag' }], authority);
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