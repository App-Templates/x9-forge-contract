"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentCreationResultSchema = exports.AgentCreationCheckpointSchema = exports.AgentCreationFirstCheckSchema = exports.AgentCreationFailureSchema = exports.AgentCreationPhaseSchema = exports.AgentCreationRequestSchema = exports.AgentCreationIntentSchema = void 0;
exports.creationReplay = creationReplay;
const zod_1 = require("zod");
const internal_factory_deploy_js_1 = require("../http/endpoints/internal-factory-deploy.cjs");
const capability_call_context_js_1 = require("../capability/capability-call-context.cjs");
const agent_config_js_1 = require("../capability/ricerca/agent-config.cjs");
const agent_runtime_identity_js_1 = require("./agent-runtime-identity.cjs");
const agent_runtime_state_js_1 = require("./agent-runtime-state.cjs");
const agent_management_js_1 = require("./agent-management.cjs");
const agent_channel_configuration_js_1 = require("./agent-channel-configuration.cjs");
/** The producer assigns stable IDs BEFORE persisting this intent; the authenticated scope partitions key lookup. */
exports.AgentCreationIntentSchema = zod_1.z.object({
    idempotencyKey: agent_management_js_1.AgentManagementRequestIdSchema,
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema,
    source: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema,
    configVersion: agent_config_js_1.AgentConfigVersionSchema,
    channels: zod_1.z.object({ telegram: agent_channel_configuration_js_1.AgentChannelDesiredStateSchema, email: agent_channel_configuration_js_1.AgentChannelDesiredStateSchema }).strict(),
}).strict().refine((intent) => intent.identity.runtimeAgentId === intent.scope.agentId, { message: 'Creation scope must match runtime identity' });
/** Existing non-secret deploy fields; legacy schemas are unchanged. No raw channel credential is persisted in a job. */
exports.AgentCreationRequestSchema = internal_factory_deploy_js_1.InternalFactoryDeployRequestSchema.omit({
    telegram_bot_token: true, ownerId: true, email_enabled: true, telegram_enabled: true,
}).extend({ intent: exports.AgentCreationIntentSchema }).strict().refine((request) => request.slug === undefined || request.slug === request.intent.identity.managementAgentId, { message: 'Explicit slug must be the management identity' });
exports.AgentCreationPhaseSchema = zod_1.z.enum(['pending', 'running', 'incomplete', 'completed']);
exports.AgentCreationFailureSchema = zod_1.z.object({
    step: zod_1.z.enum(['resources', 'workspace', 'context', 'runtime', 'first-check', 'save']),
    error: agent_channel_configuration_js_1.AgentChannelFailureSchema,
}).strict();
exports.AgentCreationFirstCheckSchema = zod_1.z.object({
    checkedAt: zod_1.z.iso.datetime({ offset: true }), channel: agent_runtime_state_js_1.AgentRuntimeChannelSchema, error: agent_channel_configuration_js_1.AgentChannelFailureSchema.nullable(),
}).strict();
exports.AgentCreationCheckpointSchema = zod_1.z.object({
    jobId: agent_management_js_1.AgentManagementRequestIdSchema,
    request: exports.AgentCreationRequestSchema,
    agentRecordId: zod_1.z.number().int().positive().nullable(),
    phase: exports.AgentCreationPhaseSchema,
    channels: zod_1.z.array(agent_channel_configuration_js_1.AgentChannelConfigurationSchema).max(2),
    firstCheck: exports.AgentCreationFirstCheckSchema.nullable(),
    failure: exports.AgentCreationFailureSchema.nullable(),
}).strict().superRefine((job, ctx) => {
    const issue = (path, message) => ctx.addIssue({ code: 'custom', path, message });
    const intent = job.request.intent;
    const kinds = new Set();
    for (const [index, config] of job.channels.entries()) {
        if (kinds.has(config.kind))
            issue(['channels', index], 'Duplicate birth channel');
        kinds.add(config.kind);
        if (!(0, capability_call_context_js_1.sameCapabilityScope)(config.scope, intent.scope)
            || config.identity.managementAgentId !== intent.identity.managementAgentId)
            issue(['channels', index, 'scope'], 'Channel belongs to another creation');
        if (config.desired.version !== intent.configVersion || config.desired.state !== intent.channels[config.kind])
            issue(['channels', index, 'desired'], 'Channel intention differs from the stored request');
    }
    if ((job.phase === 'incomplete') !== (job.failure !== null))
        issue(['failure'], 'An incomplete job states its failed step');
    if (job.phase === 'completed') {
        if (job.agentRecordId === null)
            issue(['agentRecordId'], 'Completed creation has a database record');
        if (job.channels.length !== 2 || !job.channels.every(agent_channel_configuration_js_1.isChannelConfigurationApplied))
            issue(['channels'], 'Every birth channel must have applied its intention');
        if (job.firstCheck === null || job.firstCheck.error !== null || job.firstCheck.channel.loaded !== true
            || job.firstCheck.channel.readiness !== 'ready')
            issue(['firstCheck'], 'Completed creation needs a successful check on a loaded channel');
        const checkedBirthChannel = job.channels.find((entry) => entry.kind === job.firstCheck?.channel.kind);
        if (job.firstCheck?.channel.kind !== 'web' && (!checkedBirthChannel || checkedBirthChannel.desired.state !== 'active'
            || checkedBirthChannel.observation?.loaded !== true
            || checkedBirthChannel.observation.readiness !== 'ready'
            || checkedBirthChannel.observation.channelId !== job.firstCheck?.channel.channelId)) {
            issue(['firstCheck'], 'A textual check must be ready web or match an active applied ready birth channel');
        }
    }
});
exports.AgentCreationResultSchema = zod_1.z.object({ ok: zod_1.z.literal(true), replayed: zod_1.z.boolean(), checkpoint: exports.AgentCreationCheckpointSchema }).strict();
/** Validated schemas normalize field order and defaults before comparing EVERY request field.
 * Pure replay decision, no resource creation. Consumers must atomically lookup/save by authenticated scope + key. */
function creationReplay(previous, incoming) {
    const request = exports.AgentCreationRequestSchema.parse(incoming);
    if (previous === null)
        return { action: 'create' };
    const checkpoint = exports.AgentCreationCheckpointSchema.parse(previous);
    if (JSON.stringify(checkpoint.request) !== JSON.stringify(request))
        return { action: 'conflict', error: 'idempotency_conflict' };
    return { action: checkpoint.phase === 'completed' ? 'completed' : 'resume', replayed: true, checkpoint };
}
//# sourceMappingURL=agent-creation-replay.js.map