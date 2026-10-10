import { z } from 'zod';
import { CapabilityOrdinaryCallSnapshotSchema, CapabilityOrdinaryConfigurationSchema, CapabilityOrdinaryConfigStateSchema, sameOrdinaryData } from "./ordinary-configuration.js";
import { CapabilityParameterKeySchema, CapabilityParameterValueSchema } from "./parameters.js";
import { ToolCallRequestSchema } from "./tool-call.js";
import { RagQueryRequestSchema, RagQueryResponseSchema } from "../rag/rag-query.js";
import { AgentOrdinaryAuthorityQuerySchema, AgentOrdinaryAuthoritySchema, parseAgentOrdinaryAuthorityResponse } from "../agent/ordinary-authority.js";
import { CapabilityOrdinaryBundleReferenceSchema, CapabilityOrdinaryLifecycleRequestSchema, CapabilityOrdinaryLifecycleReceiptSchema, CapabilityOrdinaryLifecycleTransactionSchema, parseCapabilityOrdinaryLifecycle, parseCapabilityOrdinaryLifecycleReceipt } from "./ordinary-lifecycle.js";
import { agentOrdinaryAuthorityContract } from "../http/endpoints/internal-agents-ordinary-authority.js";
import { ordinaryCapabilityLifecyclePutContract } from "../http/endpoints/internal-capability-agent.js";
import { capToolCallContract } from "../http/endpoints/cap-tool-call.js";
import { INTERNAL_SECRET_HEADER } from "../auth/auth-headers.js";
// Narrow using canonical schemas, never copied definitions. Structured refinement portability is gated.
const snapshot = CapabilityOrdinaryCallSnapshotSchema.safeExtend({ values: z.record(CapabilityParameterKeySchema, CapabilityParameterValueSchema) });
const ordinaryCall = ToolCallRequestSchema.safeExtend({
    tenantId: ToolCallRequestSchema.shape.tenantId.unwrap(), ownerId: ToolCallRequestSchema.shape.ownerId.unwrap(),
    ordinaryConfiguration: snapshot,
}).strict();
const authorityResponse = AgentOrdinaryAuthoritySchema.safeExtend({ configuration: z.null() });
const ragCall = ToolCallRequestSchema.safeExtend({
    tenantId: ToolCallRequestSchema.shape.tenantId.unwrap(), ownerId: ToolCallRequestSchema.shape.ownerId.unwrap(), ordinaryConfiguration: snapshot.optional(),
}).strict();
const lifecycleRequest = CapabilityOrdinaryLifecycleRequestSchema.safeExtend({ configuration: z.never().optional() });
const emptyState = CapabilityOrdinaryConfigStateSchema.safeExtend({ desired: z.null(), applied: z.null(), failed: z.null(), effectiveParameters: z.array(z.never()).max(0) });
const lifecycleReceipt = CapabilityOrdinaryLifecycleReceiptSchema.safeExtend({ request: lifecycleRequest, ordinaryState: emptyState });
const lifecycleTransaction = CapabilityOrdinaryLifecycleTransactionSchema.safeExtend({
    request: lifecycleRequest, previousState: emptyState, receipts: z.array(lifecycleReceipt).max(4),
});
const lifecycleAuthority = authorityResponse.safeExtend({ current: CapabilityOrdinaryBundleReferenceSchema.nullable(), transaction: lifecycleTransaction.nullable() });
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
        authorityBindings: [['scope', 'scope'], ['identity', 'identity'], ['capability', 'capability'], ['requestId', 'requestId'], ['transition.to', 'bundle'], ['targetMembership', 'membership'], ['operation', 'operation']],
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
            json = z.toJSONSchema(schema, { io: 'input', target: 'draft-2020-12' });
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
    add('ragQueryRequest', RagQueryRequestSchema, [], 0);
    add('ragQueryResponse', RagQueryResponseSchema, [], 0);
    add('authorityQuery', AgentOrdinaryAuthorityQuerySchema, [{ op: 'normalize_integer', path: 'bundleVersion', schema: z.toJSONSchema(CapabilityOrdinaryBundleReferenceSchema.shape.appliedVersion) }], 0);
    add('authorityResponse', authorityResponse, authorityRules, 1);
    contracts.authorityResponse.limitations = ['Only configuration:null: full configuration/Master/structured refinements remain gated'];
    contracts.ordinaryToolCall.limitations = ['Only B1 primitive values; structured values require qualified portable codecs'];
    add('configuration', CapabilityOrdinaryConfigurationSchema, [], null, ['Parameter declarations/resolutions/structured/Master semantics are not yet portable']);
    add('lifecycleRequest', lifecycleRequest, lifecycleRules, 1);
    add('lifecycleReceipt', lifecycleReceipt, [receiptRule], 3);
    add('lifecycleTransaction', lifecycleTransaction, [], 3, ['Internal shape: use lifecycle request/receipt admission for semantic validation']);
    add('lifecycleAuthority', lifecycleAuthority, [], 4, ['Internal shape: use lifecycle request admission for semantic validation']);
    for (const name of ['lifecycleRequest', 'lifecycleReceipt', 'lifecycleTransaction', 'lifecycleAuthority']) {
        contracts[name].limitations = ['Only capabilities without ordinary configuration; durable effects and reconciliation are consumer-owned'];
    }
    const transport = (contract) => ({
        method: contract.method, path: contract.path, authHeader: INTERNAL_SECRET_HEADER, paramsSchema: z.toJSONSchema(contract.paramsSchema),
    });
    return { format: 'x9-capability-portable-v1', contracts, transports: {
            authority: { ...transport(agentOrdinaryAuthorityContract), queryContract: 'authorityQuery' },
            lifecycle: transport(ordinaryCapabilityLifecyclePutContract), call: transport(capToolCallContract),
        } };
}
function at(value, path) {
    return path === '' ? value : path.split('.').reduce((current, key) => current !== null && typeof current === 'object' ? current[key] : undefined, value);
}
/** Pure IR binding used by TS and generated Python; authority must come from the authenticated loaded consumer. */
export function applyPortableCapabilityRules(value, rules, authority) {
    for (const rule of rules) {
        switch (rule.op) {
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
    applyPortableCapabilityRules(parsed, [{ op: 'membership_call', capability: 'rag' }], authority);
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