"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityOrdinaryCallSnapshotSchema = exports.CapabilityOrdinaryConfigStateSchema = exports.CapabilityOrdinaryEffectiveParameterSchema = exports.CapabilityOrdinaryAppliedSchema = exports.CapabilityOrdinaryConfigWriteSchema = exports.CapabilityOrdinaryConfigurationSchema = exports.CapabilityOrdinaryParameterSchema = exports.CapabilityOrdinaryOriginSchema = exports.CapabilityOrdinaryDefinitionSchema = exports.CapabilityOrdinaryStructuredParameterSchema = exports.CapabilityOrdinaryValueSchema = exports.CapabilityOrdinaryStructuredSchemaKeySchema = exports.CapabilityOrdinaryStructuredCodecs = void 0;
exports.sameOrdinaryData = sameOrdinaryData;
exports.parseCapabilityOrdinaryWrite = parseCapabilityOrdinaryWrite;
exports.parseCapabilityOrdinaryCall = parseCapabilityOrdinaryCall;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("./capability-call-context.cjs");
const parameters_js_1 = require("./parameters.cjs");
const agent_config_js_1 = require("./ricerca/agent-config.cjs");
const agent_model_management_values_js_1 = require("../agent/agent-model-management-values.cjs");
const feeds_js_1 = require("./configuration/feeds.cjs");
const briefing_js_1 = require("./configuration/briefing.cjs");
const rules_js_1 = require("./configuration/rules.cjs");
const camera_policy_js_1 = require("./configuration/camera-policy.cjs");
exports.CapabilityOrdinaryStructuredCodecs = { 'briefing.feeds': feeds_js_1.BriefingFeedsSchema, 'briefing.categoryWeights': briefing_js_1.BriefingCategoryWeightsSchema, 'news.feeds': feeds_js_1.NewsFeedsSchema, 'rules.briefing': rules_js_1.BriefingRulesSchema, 'rules.news': rules_js_1.NewsRulesSchema, 'rules.netatmo': rules_js_1.NetatmoRulesSchema, 'rules.security': rules_js_1.SecurityRulesSchema, 'security.cameraPolicies': camera_policy_js_1.CameraPoliciesSchema };
exports.CapabilityOrdinaryStructuredSchemaKeySchema = zod_1.z.enum(Object.keys(exports.CapabilityOrdinaryStructuredCodecs));
exports.CapabilityOrdinaryValueSchema = zod_1.z.union([parameters_js_1.CapabilityParameterValueSchema, feeds_js_1.NewsFeedsSchema, feeds_js_1.BriefingFeedsSchema, briefing_js_1.BriefingCategoryWeightsSchema, rules_js_1.BriefingRulesSchema, rules_js_1.NewsRulesSchema, rules_js_1.NetatmoRulesSchema, rules_js_1.SecurityRulesSchema, camera_policy_js_1.CameraPoliciesSchema]);
exports.CapabilityOrdinaryStructuredParameterSchema = parameters_js_1.CapabilityParameterSchema.options[0].omit({ type: true, min: true, max: true, platformDefault: true }).extend({ type: zod_1.z.literal('structured'), schemaKey: exports.CapabilityOrdinaryStructuredSchemaKeySchema, schemaVersion: zod_1.z.literal(1), platformDefault: exports.CapabilityOrdinaryValueSchema.optional() }).strict().superRefine((definition, ctx) => {
    if (definition.platformDefault !== undefined && !exports.CapabilityOrdinaryStructuredCodecs[definition.schemaKey].safeParse(definition.platformDefault).success)
        ctx.addIssue({ code: 'custom', path: ['platformDefault'], message: 'Structured default violates codec' });
});
exports.CapabilityOrdinaryDefinitionSchema = zod_1.z.union([parameters_js_1.CapabilityParameterSchema, exports.CapabilityOrdinaryStructuredParameterSchema]);
const NameSchema = parameters_js_1.CapabilityAgentParametersSchema.shape.capability;
const DateSchema = zod_1.z.iso.datetime({ offset: true });
const MasterReferenceSchema = capability_call_context_js_1.CapabilityAgentScopeSchema.omit({ agentId: true }).extend({ masterId: capability_call_context_js_1.CapabilityAgentScopeSchema.shape.agentId, version: agent_config_js_1.AgentConfigVersionSchema }).strict();
exports.CapabilityOrdinaryOriginSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.object({ kind: zod_1.z.literal('platform_default') }).strict(),
    zod_1.z.object({ kind: zod_1.z.literal('agent_override') }).strict(),
    zod_1.z.object({ kind: zod_1.z.literal('needs_choice') }).strict(),
    zod_1.z.object({ kind: zod_1.z.literal('master'), source: MasterReferenceSchema }).strict(),
]);
exports.CapabilityOrdinaryParameterSchema = zod_1.z.object({
    parameter: exports.CapabilityOrdinaryDefinitionSchema,
    origin: exports.CapabilityOrdinaryOriginSchema,
    value: exports.CapabilityOrdinaryValueSchema.optional(),
}).strict().superRefine((entry, ctx) => {
    if (entry.parameter.type === 'structured') {
        const definition = entry.parameter;
        if (entry.origin.kind === 'needs_choice') {
            if (entry.value !== undefined || definition.platformDefault !== undefined)
                ctx.addIssue({ code: 'custom', message: 'needs_choice has no value or default' });
        }
        else if (!(definition.optional && entry.value === undefined && entry.origin.kind !== 'platform_default') && !exports.CapabilityOrdinaryStructuredCodecs[definition.schemaKey].safeParse(entry.value).success)
            ctx.addIssue({ code: 'custom', path: ['value'], message: 'Structured value violates codec' });
        if (entry.origin.kind === 'platform_default' && (definition.platformDefault === undefined || !sameOrdinaryData(entry.value, definition.platformDefault)))
            ctx.addIssue({ code: 'custom', path: ['value'], message: 'Structured platform default mismatch' });
        return;
    }
    const checked = parameters_js_1.CapabilityAgentParameterSchema.safeParse({ ...entry, origin: entry.origin.kind === 'master' ? 'agent_override' : entry.origin.kind });
    if (!checked.success)
        for (const issue of checked.error.issues)
            ctx.addIssue({ code: 'custom', path: [...issue.path], message: issue.message });
});
exports.CapabilityOrdinaryConfigurationSchema = zod_1.z.object({
    format: zod_1.z.literal('ordinary-v2'),
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    capability: NameSchema,
    version: agent_config_js_1.AgentConfigVersionSchema,
    parameters: zod_1.z.array(exports.CapabilityOrdinaryParameterSchema).max(100),
}).strict().superRefine((config, ctx) => {
    if (new Set(config.parameters.map(entry => entry.parameter.key)).size !== config.parameters.length)
        ctx.addIssue({ code: 'custom', path: ['parameters'], message: 'Parameter keys must be unique' });
    for (const [index, entry] of config.parameters.entries())
        if (entry.origin.kind === 'master' && (entry.origin.source.tenantId !== config.scope.tenantId || entry.origin.source.ownerId !== config.scope.ownerId))
            ctx.addIssue({ code: 'custom', path: ['parameters', index, 'origin'], message: 'Master cannot cross tenant or owner' });
});
/** Structural comparison ignores object insertion order, preserving exact arrays and primitive values. */
function sameOrdinaryData(left, right) {
    if (left === right)
        return true;
    if (Array.isArray(left))
        return Array.isArray(right) && left.length === right.length && left.every((item, index) => sameOrdinaryData(item, right[index]));
    if (left === null || right === null || typeof left !== 'object' || typeof right !== 'object' || Array.isArray(right))
        return false;
    const a = Object.keys(left).sort(), b = Object.keys(right).sort();
    return a.length === b.length && a.every((key, index) => key === b[index] && sameOrdinaryData(left[key], right[key]));
}
exports.CapabilityOrdinaryConfigWriteSchema = zod_1.z.object({
    requestId: agent_model_management_values_js_1.AgentManagementRequestIdSchema,
    expectedVersion: agent_config_js_1.AgentConfigVersionSchema.nullable(),
    configuration: exports.CapabilityOrdinaryConfigurationSchema,
}).strict();
/** Authenticate and resolve declarations/Masters server-side; durable requestId replay precedes this CAS check. */
function parseCapabilityOrdinaryWrite(request, authority, currentVersion, masters = []) {
    const parsed = exports.CapabilityOrdinaryConfigWriteSchema.parse(request), config = parsed.configuration;
    capability_call_context_js_1.CapabilityAgentScopeSchema.parse(authority.scope);
    if (!(0, capability_call_context_js_1.sameCapabilityScope)(config.scope, authority.scope) || config.capability !== authority.capability)
        throw new Error('Ordinary target mismatch');
    if (currentVersion !== null)
        agent_config_js_1.AgentConfigVersionSchema.parse(currentVersion);
    if (parsed.expectedVersion !== currentVersion || config.version !== (currentVersion ?? 0) + 1)
        throw new Error('Ordinary CAS conflict');
    if (new Set(authority.parameters.map(p => p.key)).size !== authority.parameters.length || config.parameters.length !== authority.parameters.length)
        throw new Error('Ordinary declarations mismatch');
    for (const entry of config.parameters) {
        const definition = authority.parameters.find(p => p.key === entry.parameter.key);
        if (!definition || !sameOrdinaryData(exports.CapabilityOrdinaryDefinitionSchema.parse(definition), entry.parameter))
            throw new Error('Ordinary declaration mismatch');
        if (entry.parameter.type === 'structured' && entry.value !== undefined) {
            const schemaKey = entry.parameter.schemaKey, permission = authority.structuredAuthorities?.[entry.parameter.key];
            if (schemaKey.startsWith('rules.')) {
                if (!permission?.rules)
                    throw new Error('Structured rules authority required');
                (0, rules_js_1.parseCapabilityRulesWrite)(schemaKey.slice(6), entry.value, permission.rules);
            }
            if (schemaKey === 'security.cameraPolicies') {
                if (!permission?.cameras)
                    throw new Error('Structured camera authority required');
                (0, camera_policy_js_1.parseCameraPoliciesWrite)(entry.value, permission.cameras);
            }
        }
        if (entry.origin.kind !== 'master')
            continue;
        const source = entry.origin.source;
        const candidates = masters.filter(master => master.scope.tenantId === source.tenantId && master.scope.ownerId === source.ownerId && master.scope.agentId === source.masterId && master.capability === config.capability);
        if (candidates.length !== 1)
            throw new Error('Master authority missing or ambiguous');
        const master = exports.CapabilityOrdinaryConfigurationSchema.parse(candidates[0]);
        const inherited = master.parameters.find(p => p.parameter.key === entry.parameter.key);
        if (master.version !== source.version || !inherited || inherited.origin.kind === 'needs_choice' || !sameOrdinaryData(inherited.parameter, entry.parameter) || !sameOrdinaryData(inherited.value, entry.value))
            throw new Error('Master revision or inherited value mismatch');
    }
    return parsed;
}
exports.CapabilityOrdinaryAppliedSchema = zod_1.z.object({ configuration: exports.CapabilityOrdinaryConfigurationSchema, loadedAt: DateSchema }).strict();
exports.CapabilityOrdinaryEffectiveParameterSchema = zod_1.z.object({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    capability: NameSchema,
    key: parameters_js_1.CapabilityParameterKeySchema,
    value: exports.CapabilityOrdinaryValueSchema.optional(),
    mode: parameters_js_1.CapabilityParameterApplicationSchema,
    sourceConfigVersion: agent_config_js_1.AgentConfigVersionSchema,
    observedAt: DateSchema,
}).strict();
exports.CapabilityOrdinaryConfigStateSchema = zod_1.z.object({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    capability: NameSchema,
    desired: exports.CapabilityOrdinaryConfigurationSchema.nullable(),
    runtimeState: zod_1.z.enum(['loaded', 'unloaded', 'unknown']),
    applied: exports.CapabilityOrdinaryAppliedSchema.nullable(),
    failed: agent_model_management_values_js_1.AgentConfigVersionStateSchema.shape.failed,
    effectiveParameters: zod_1.z.array(exports.CapabilityOrdinaryEffectiveParameterSchema).max(100),
}).strict().superRefine((state, ctx) => {
    const issue = (message) => ctx.addIssue({ code: 'custom', message });
    if (state.runtimeState !== 'loaded' && (state.applied !== null || state.effectiveParameters.length > 0))
        issue('Unloaded or unknown consumer cannot attest effective configuration');
    for (const config of [state.desired, state.applied?.configuration])
        if (config && (!(0, capability_call_context_js_1.sameCapabilityScope)(config.scope, state.scope) || config.capability !== state.capability))
            issue('Configuration target mismatch');
    if (state.applied && (!state.desired || state.applied.configuration.version > state.desired.version))
        issue('Applied cannot be ahead of desired');
    if (state.failed && (!state.desired || state.failed.version > state.desired.version || state.failed.version <= (state.applied?.configuration.version ?? 0)))
        issue('Failed version must be pending within desired history');
    if (new Set(state.effectiveParameters.map(entry => entry.key)).size !== state.effectiveParameters.length)
        issue('Effective keys must be unique');
    for (const entry of state.effectiveParameters) {
        if (!(0, capability_call_context_js_1.sameCapabilityScope)(entry.scope, state.scope) || entry.capability !== state.capability)
            issue('Effective parameter target mismatch');
        if (!state.desired || entry.sourceConfigVersion > state.desired.version)
            issue('Effective version cannot be ahead of desired');
        const desiredEntry = state.desired?.parameters.find(p => p.parameter.key === entry.key);
        const definition = desiredEntry?.parameter;
        if (state.desired && entry.sourceConfigVersion === state.desired.version && (!desiredEntry || desiredEntry.origin.kind === 'needs_choice' || !sameOrdinaryData(entry.value, desiredEntry.value)))
            issue('Effective value differs from its authoritative source revision');
        if (!definition || definition.appliesWhen !== entry.mode || !exports.CapabilityOrdinaryParameterSchema.safeParse({ parameter: definition, origin: { kind: 'agent_override' }, ...(entry.value !== undefined ? { value: entry.value } : {}) }).success)
            issue('Effective parameter must match declaration and value constraints');
    }
    if (state.applied) {
        const config = state.applied.configuration;
        const resolved = config.parameters.filter(p => p.origin.kind !== 'needs_choice');
        if (resolved.length !== config.parameters.length || resolved.length !== state.effectiveParameters.length || resolved.some(p => !state.effectiveParameters.some(e => e.key === p.parameter.key && e.mode === p.parameter.appliesWhen && e.sourceConfigVersion === config.version && sameOrdinaryData(e.value, p.value))))
            issue('Applied requires the whole authoritative revision to be effective');
        if (state.desired?.version === config.version && !sameOrdinaryData(state.desired, config))
            issue('One revision cannot have different desired and applied values');
    }
});
exports.CapabilityOrdinaryCallSnapshotSchema = zod_1.z.object({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    capability: NameSchema,
    version: agent_config_js_1.AgentConfigVersionSchema,
    values: zod_1.z.record(parameters_js_1.CapabilityParameterKeySchema, exports.CapabilityOrdinaryValueSchema),
}).strict().refine(snapshot => Object.keys(snapshot.values).length <= 100, 'Too many ordinary values');
/** Only next_apply values from the server-owned active snapshot are dispatched; immediate is consumer-owned. */
function parseCapabilityOrdinaryCall(snapshot, authoritative) {
    const value = exports.CapabilityOrdinaryCallSnapshotSchema.parse(snapshot), config = exports.CapabilityOrdinaryConfigurationSchema.parse(authoritative);
    if (!(0, capability_call_context_js_1.sameCapabilityScope)(value.scope, config.scope) || value.capability !== config.capability || value.version !== config.version)
        throw new Error('Ordinary call target or version mismatch');
    const expected = Object.fromEntries(config.parameters.filter(entry => entry.parameter.appliesWhen === 'next_apply' && entry.origin.kind !== 'needs_choice' && entry.value !== undefined).map(entry => [entry.parameter.key, entry.value]));
    if (!sameOrdinaryData(value.values, expected))
        throw new Error('Ordinary call keyset or values mismatch');
    if (config.parameters.some(entry => entry.parameter.appliesWhen === 'next_apply' && entry.origin.kind === 'needs_choice'))
        throw new Error('Ordinary call requires resolved next_apply values');
    return value;
}
//# sourceMappingURL=ordinary-configuration.js.map