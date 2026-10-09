"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentModelsBatchResultSchema = exports.AgentModelsBatchOutcomeSchema = exports.AgentModelsBatchStatusSchema = exports.AgentModelsBatchPreviewSchema = exports.AgentModelsBatchIntentSchema = exports.AgentModelsBatchRequestSchema = exports.AgentModelsBatchPreviewRequestSchema = exports.AgentModelSlotChangeSchema = exports.AgentModelsOverviewSchema = exports.AgentModelsOverviewCoverageSchema = exports.AgentModelOverviewRowSchema = exports.ModelEmbeddingRebuildSchema = exports.ModelCostMetadataSchema = void 0;
exports.validateAgentModelsBatch = validateAgentModelsBatch;
exports.isAgentModelsBatchPreviewCurrent = isAgentModelsBatchPreviewCurrent;
exports.deriveAgentModelsBatchOutcome = deriveAgentModelsBatchOutcome;
exports.isAgentModelsBatchResultConsistent = isAgentModelsBatchResultConsistent;
exports.sameAgentModelsBatchRequest = sameAgentModelsBatchRequest;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../agent/agent-identity.cjs");
const agent_runtime_identity_js_1 = require("../agent/agent-runtime-identity.cjs");
const agent_management_js_1 = require("../agent/agent-management.cjs");
const agent_config_js_1 = require("../capability/ricerca/agent-config.cjs");
const parameters_js_1 = require("../capability/parameters.cjs");
const capability_model_settings_js_1 = require("./capability-model-settings.cjs");
const model_catalog_js_1 = require("./model-catalog.cjs");
const agent_model_configuration_js_1 = require("./agent-model-configuration.cjs");
exports.ModelCostMetadataSchema = zod_1.z.discriminatedUnion('state', [
    zod_1.z.object({ state: zod_1.z.literal('unknown'), reason: zod_1.z.string().min(1).max(500) }).strict(),
    zod_1.z.object({
        state: zod_1.z.literal('known'), currency: zod_1.z.string().regex(/^[A-Z]{3}$/),
        rates: zod_1.z.array(zod_1.z.object({ unit: zod_1.z.enum(['million-input-tokens', 'million-output-tokens', 'character', 'minute', 'call']), amount: zod_1.z.number().nonnegative() }).strict()).min(1),
        source: zod_1.z.string().min(1).max(500), observedAt: zod_1.z.iso.datetime({ offset: true }),
    }).strict(),
]);
/** A rebuild never claims that the target model is active before completion. */
exports.ModelEmbeddingRebuildSchema = zod_1.z.object({
    state: zod_1.z.enum(['pending', 'running', 'failed', 'completed']),
    previous: model_catalog_js_1.ModelDescriptorSchema, active: model_catalog_js_1.ModelDescriptorSchema, target: model_catalog_js_1.ModelDescriptorSchema,
    progress: zod_1.z.object({ completed: zod_1.z.number().int().nonnegative(), total: zod_1.z.number().int().positive() }).strict(),
    reason: zod_1.z.string().min(1).max(500).nullable(),
}).strict().superRefine((rebuild, ctx) => {
    if (rebuild.progress.completed > rebuild.progress.total)
        ctx.addIssue({ code: 'custom', path: ['progress'], message: 'Progress exceeds its denominator' });
    if ((rebuild.state === 'failed') !== (rebuild.reason !== null))
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'Reason is present exactly on failure' });
    if (rebuild.state === 'completed' && rebuild.progress.completed !== rebuild.progress.total)
        ctx.addIssue({ code: 'custom', path: ['progress'], message: 'Completed rebuild requires complete progress' });
    const expected = rebuild.state === 'completed' ? rebuild.target : rebuild.previous;
    if (!(0, model_catalog_js_1.sameModelDescriptor)(rebuild.active, expected))
        ctx.addIssue({ code: 'custom', path: ['active'], message: 'Active model changes only after rebuild completion' });
});
exports.AgentModelOverviewRowSchema = zod_1.z.object({
    identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.strict(), ownerId: agent_identity_js_1.OwnerIdSchema, slotId: agent_model_configuration_js_1.ModelSlotIdSchema,
    capability: parameters_js_1.CapabilityAgentParametersSchema.shape.capability, function: model_catalog_js_1.ModelFunctionSchema,
    channelId: zod_1.z.string().min(1).max(128).nullable(),
    installation: zod_1.z.enum(['installed', 'absent', 'unknown']),
    editability: zod_1.z.enum(['editable', 'readonly']), reason: zod_1.z.string().min(1).max(500).nullable(),
    origin: zod_1.z.enum(['master', 'custom', 'unknown']), masterAgentId: agent_identity_js_1.AgentIdSchema.nullable(), masterConfigVersion: agent_config_js_1.AgentConfigVersionSchema.nullable(),
    requirements: model_catalog_js_1.ModelFeaturesSchema,
    default: capability_model_settings_js_1.CapabilityModelSettingsSchema.nullable(), saved: capability_model_settings_js_1.CapabilityModelSettingsSchema.nullable(), applied: capability_model_settings_js_1.CapabilityModelSettingsSchema.nullable(),
    versions: agent_management_js_1.AgentConfigVersionStateSchema.nullable(), catalogVersion: model_catalog_js_1.ModelCatalogVersionSchema.nullable(),
    cost: exports.ModelCostMetadataSchema, embedding: exports.ModelEmbeddingRebuildSchema.nullable(),
}).strict().superRefine((row, ctx) => {
    if ((row.editability === 'readonly') !== (row.reason !== null))
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'Readonly rows require a reason' });
    if (row.origin === 'master' && (row.masterAgentId === null || row.masterConfigVersion === null))
        ctx.addIssue({ code: 'custom', path: ['masterAgentId'], message: 'Master inheritance requires an explicit source agent' });
    if (row.origin === 'unknown' && (row.masterAgentId !== null || row.masterConfigVersion !== null || row.editability !== 'readonly' || row.reason === null || row.reason.trim().length === 0))
        ctx.addIssue({ code: 'custom', path: ['origin'], message: 'Unknown provenance is readonly without a claimed Master' });
    for (const field of ['default', 'saved', 'applied']) {
        const value = row[field];
        if (value !== null && (value.capability !== row.capability || value.function !== row.function))
            ctx.addIssue({ code: 'custom', path: [field], message: 'Selection must belong to the displayed capability/function' });
    }
    if (row.applied !== null && row.versions?.applied == null)
        ctx.addIssue({ code: 'custom', path: ['applied'], message: 'An applied selection requires an attested applied version' });
    if (row.embedding !== null && row.function !== 'embedding')
        ctx.addIssue({ code: 'custom', path: ['embedding'], message: 'Rebuild metadata belongs only to embedding slots' });
});
/** Read-side inventory evidence; absence on old producers is not an attestation of zero. */
exports.AgentModelsOverviewCoverageSchema = zod_1.z.object({
    identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.strict(), ownerId: agent_identity_js_1.OwnerIdSchema,
    status: zod_1.z.enum(['complete', 'partial', 'unavailable']),
    missingSlots: zod_1.z.array(agent_model_configuration_js_1.ModelSlotIdSchema), reason: zod_1.z.string().trim().min(1).max(500).nullable(),
}).strict().superRefine((coverage, ctx) => {
    if (coverage.status === 'complete' && (coverage.missingSlots.length !== 0 || coverage.reason !== null))
        ctx.addIssue({ code: 'custom', path: ['status'], message: 'Complete inventory has no missing slots or reason' });
    if (coverage.status !== 'complete' && coverage.reason === null)
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'Incomplete inventory requires a public reason' });
    if (new Set(coverage.missingSlots).size !== coverage.missingSlots.length)
        ctx.addIssue({ code: 'custom', path: ['missingSlots'], message: 'Duplicate missing slot' });
});
exports.AgentModelsOverviewSchema = zod_1.z.object({
    version: model_catalog_js_1.ModelCatalogVersionSchema, observedAt: zod_1.z.iso.datetime({ offset: true }),
    rows: zod_1.z.array(exports.AgentModelOverviewRowSchema).max(2048),
    coverage: zod_1.z.array(exports.AgentModelsOverviewCoverageSchema).max(2048).optional(),
}).strict().superRefine((overview, ctx) => {
    const owners = new Map();
    const versions = new Map();
    const identities = new Map();
    const slots = new Set();
    const bind = (entry, path) => {
        const agentId = entry.identity.managementAgentId;
        const known = identities.get(agentId);
        if (known !== undefined && !(0, agent_model_configuration_js_1.sameModelAgentIdentity)(known, entry.identity))
            ctx.addIssue({ code: 'custom', path: [...path, 'identity'], message: 'Inconsistent agent identity' });
        identities.set(agentId, entry.identity);
        if (owners.has(agentId) && owners.get(agentId) !== entry.ownerId)
            ctx.addIssue({ code: 'custom', path: [...path, 'ownerId'], message: 'An agent has exactly one owner' });
        owners.set(agentId, entry.ownerId);
    };
    for (const [index, row] of overview.rows.entries()) {
        bind(row, ['rows', index]);
        const agentId = row.identity.managementAgentId;
        const version = JSON.stringify(row.versions);
        if (versions.has(agentId) && versions.get(agentId) !== version)
            ctx.addIssue({ code: 'custom', path: ['rows', index, 'versions'], message: 'All slots use the same agent configuration versions' });
        versions.set(agentId, version);
        const key = `${agentId}:${row.slotId}`;
        if (slots.has(key))
            ctx.addIssue({ code: 'custom', path: ['rows', index, 'slotId'], message: 'Duplicate agent/slot row' });
        slots.add(key);
    }
    const covered = new Set();
    for (const [index, coverage] of (overview.coverage ?? []).entries()) {
        bind(coverage, ['coverage', index]);
        const agentId = coverage.identity.managementAgentId;
        if (covered.has(agentId))
            ctx.addIssue({ code: 'custom', path: ['coverage', index, 'identity'], message: 'Duplicate agent coverage' });
        covered.add(agentId);
        if (coverage.missingSlots.some(slot => slots.has(`${agentId}:${slot}`)))
            ctx.addIssue({ code: 'custom', path: ['coverage', index, 'missingSlots'], message: 'A slot cannot be both present and missing' });
    }
    if (!agent_runtime_identity_js_1.AgentRuntimeIdentitiesSchema.safeParse([...identities.values()]).success)
        ctx.addIssue({ code: 'custom', path: ['rows'], message: 'Ambiguous agent identities' });
    const vaultIds = new Set();
    for (const identity of identities.values()) {
        if (identity.vaultAgentId === undefined)
            continue;
        if (vaultIds.has(identity.vaultAgentId))
            ctx.addIssue({ code: 'custom', path: ['rows'], message: 'Ambiguous vault identities' });
        vaultIds.add(identity.vaultAgentId);
    }
});
exports.AgentModelSlotChangeSchema = zod_1.z.discriminatedUnion('action', [
    zod_1.z.object({ action: zod_1.z.literal('set'), slotId: agent_model_configuration_js_1.ModelSlotIdSchema, settings: capability_model_settings_js_1.CapabilityModelSettingsSchema }).strict(),
    zod_1.z.object({ action: zod_1.z.literal('reset-master'), slotId: agent_model_configuration_js_1.ModelSlotIdSchema }).strict(),
]);
const BatchAgentChangeSchema = zod_1.z.object({ identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.strict(), expectedVersion: agent_config_js_1.AgentConfigVersionSchema, changes: zod_1.z.array(exports.AgentModelSlotChangeSchema).min(1).max(64) }).strict().superRefine((agent, ctx) => {
    if (new Set(agent.changes.map(change => change.slotId)).size !== agent.changes.length)
        ctx.addIssue({ code: 'custom', path: ['changes'], message: 'Duplicate changed slot' });
});
exports.AgentModelsBatchPreviewRequestSchema = zod_1.z.object({ requestId: agent_management_js_1.AgentManagementRequestIdSchema, overviewVersion: model_catalog_js_1.ModelCatalogVersionSchema, agents: zod_1.z.array(BatchAgentChangeSchema).min(1).max(64) }).strict().superRefine((request, ctx) => {
    if (!agent_runtime_identity_js_1.AgentRuntimeIdentitiesSchema.safeParse(request.agents.map(agent => agent.identity)).success)
        ctx.addIssue({ code: 'custom', path: ['agents'], message: 'Duplicate or ambiguous batch agents' });
});
exports.AgentModelsBatchRequestSchema = exports.AgentModelsBatchPreviewRequestSchema.safeExtend({ previewId: agent_management_js_1.AgentManagementRequestIdSchema });
exports.AgentModelsBatchIntentSchema = zod_1.z.union([exports.AgentModelsBatchRequestSchema, exports.AgentModelsBatchPreviewRequestSchema]);
const sameSettings = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const normalizedConfiguration = (config) => JSON.stringify({ ...config, selections: [...config.selections].sort((left, right) => left.slotId.localeCompare(right.slotId)) });
const normalizedRequest = (request) => JSON.stringify({ ...request, agents: request.agents.map(agent => ({ ...agent, changes: [...agent.changes].sort((a, b) => a.slotId.localeCompare(b.slotId)) })).sort((a, b) => a.identity.managementAgentId.localeCompare(b.identity.managementAgentId)) });
exports.AgentModelsBatchPreviewSchema = zod_1.z.object({
    previewId: agent_management_js_1.AgentManagementRequestIdSchema, request: exports.AgentModelsBatchPreviewRequestSchema,
    expiresAt: zod_1.z.iso.datetime({ offset: true }),
    agents: zod_1.z.array(zod_1.z.object({ identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.strict(), expectedVersion: agent_config_js_1.AgentConfigVersionSchema, next: agent_model_configuration_js_1.AgentModelsConfigurationSchema, impact: zod_1.z.array(zod_1.z.string().min(1).max(500)).max(64) }).strict()).min(1).max(64),
}).strict().superRefine((preview, ctx) => {
    if (preview.agents.length !== preview.request.agents.length || new Set(preview.agents.map(agent => agent.identity.managementAgentId)).size !== preview.agents.length)
        ctx.addIssue({ code: 'custom', path: ['agents'], message: 'Preview must cover each requested agent exactly once' });
    for (const [index, agent] of preview.agents.entries()) {
        const request = preview.request.agents.find(entry => entry.identity.managementAgentId === agent.identity.managementAgentId);
        if (request === undefined || !(0, agent_model_configuration_js_1.sameModelAgentIdentity)(agent.identity, request.identity) || !(0, agent_model_configuration_js_1.sameModelAgentIdentity)(agent.identity, agent.next.identity)) {
            ctx.addIssue({ code: 'custom', path: ['agents', index, 'identity'], message: 'Preview identity must match request and next configuration' });
            continue;
        }
        if (agent.expectedVersion !== request.expectedVersion || agent.next.configVersion !== agent.expectedVersion + 1)
            ctx.addIssue({ code: 'custom', path: ['agents', index, 'next', 'configVersion'], message: 'CAS preview advances the requested version exactly once' });
        for (const change of request.changes) {
            const selection = agent.next.selections.find(entry => entry.slotId === change.slotId);
            if (selection === undefined || (change.action === 'set' && !sameSettings(selection.settings, change.settings)))
                ctx.addIssue({ code: 'custom', path: ['agents', index, 'next'], message: 'Preview must include every proposed selection' });
        }
    }
});
/** Producer-only validation against its own authenticated overview/catalogs; no writes and no permission inferred from the request. */
function validateAgentModelsBatch(input, serverOverview, serverCatalogs, now = new Date()) {
    const parsed = exports.AgentModelsBatchIntentSchema.safeParse(input);
    if (!parsed.success)
        return ['invalid-request'];
    const source = exports.AgentModelsOverviewSchema.safeParse(serverOverview);
    if (!source.success)
        return ['invalid-overview'];
    const request = parsed.data;
    const overview = source.data;
    if (request.overviewVersion !== overview.version)
        return ['overview-version-mismatch'];
    const catalogs = serverCatalogs.map(value => model_catalog_js_1.ModelCatalogSchema.safeParse(value)).flatMap(value => value.success ? [value.data] : []);
    const issues = new Set();
    for (const agent of request.agents) {
        const coverage = overview.coverage?.find(entry => (0, agent_model_configuration_js_1.sameModelAgentIdentity)(entry.identity, agent.identity));
        if (coverage !== undefined && coverage.status !== 'complete')
            issues.add('slot-unavailable');
        for (const change of agent.changes) {
            const row = overview.rows.find(entry => entry.identity.managementAgentId === agent.identity.managementAgentId && entry.slotId === change.slotId);
            if (row === undefined) {
                issues.add('slot-not-found');
                continue;
            }
            if (!(0, agent_model_configuration_js_1.sameModelAgentIdentity)(row.identity, agent.identity)) {
                issues.add('identity-mismatch');
                continue;
            }
            if (row.versions === null)
                issues.add('version-unknown');
            else if (row.versions.desired !== agent.expectedVersion)
                issues.add('version-conflict');
            if (row.installation !== 'installed')
                issues.add('slot-unavailable');
            if (row.editability !== 'editable' || row.origin === 'unknown')
                issues.add('slot-readonly');
            const settings = change.action === 'set' ? change.settings : row.default;
            if (change.action === 'reset-master' && (row.masterAgentId === null || row.masterConfigVersion === null || settings === null)) {
                issues.add('master-default-unavailable');
                continue;
            }
            if (settings === null)
                continue;
            if (settings.capability !== row.capability || settings.function !== row.function)
                issues.add('slot-function-mismatch');
            const required = row.requirements;
            if ((required.tools !== settings.requirements.tools || required.stream !== settings.requirements.stream || required.structuredOutput !== settings.requirements.structuredOutput || (required.vision ?? false) !== (settings.requirements.vision ?? false) || (required.webSearch ?? false) !== (settings.requirements.webSearch ?? false)))
                issues.add('requirements-mismatch');
            const matching = catalogs.filter(entry => entry.agentId === agent.identity.managementAgentId);
            const catalog = matching[0];
            if (matching.length !== 1 || catalog === undefined || row.catalogVersion !== catalog.version) {
                issues.add('catalog-unavailable');
                continue;
            }
            if ((0, capability_model_settings_js_1.validateCapabilityModels)(settings, catalog, agent.identity.managementAgentId, now).length > 0)
                issues.add('model-selection-invalid');
        }
    }
    return [...issues];
}
/** Submit rechecks CAS/catalog separately with validateAgentModelsBatch; a preview is neither a write nor apply evidence. */
function isAgentModelsBatchPreviewCurrent(input, serverPreview, serverOverview, now = new Date()) {
    const request = exports.AgentModelsBatchRequestSchema.safeParse(input);
    const preview = exports.AgentModelsBatchPreviewSchema.safeParse(serverPreview);
    const overview = exports.AgentModelsOverviewSchema.safeParse(serverOverview);
    if (!request.success || !preview.success || !overview.success)
        return false;
    const { previewId, ...changes } = request.data;
    if (previewId !== preview.data.previewId || changes.overviewVersion !== overview.data.version)
        return false;
    if (!Number.isFinite(now.getTime()) || now.getTime() >= Date.parse(preview.data.expiresAt))
        return false;
    for (const agent of preview.data.agents) {
        const intent = changes.agents.find(entry => (0, agent_model_configuration_js_1.sameModelAgentIdentity)(entry.identity, agent.identity));
        if (intent === undefined)
            return false;
        for (const change of intent.changes)
            if (change.action === 'reset-master') {
                const row = overview.data.rows.find(entry => (0, agent_model_configuration_js_1.sameModelAgentIdentity)(entry.identity, agent.identity) && entry.slotId === change.slotId);
                const selection = agent.next.selections.find(entry => entry.slotId === change.slotId);
                if (row?.default == null || selection === undefined || !sameSettings(selection.settings, row.default))
                    return false;
            }
    }
    return normalizedRequest(changes) === normalizedRequest(preview.data.request);
}
exports.AgentModelsBatchStatusSchema = zod_1.z.enum(['applied', 'pending', 'failed', 'conflict']);
exports.AgentModelsBatchOutcomeSchema = zod_1.z.enum(['applied', 'partial', 'pending', 'failed']);
function deriveAgentModelsBatchOutcome(statuses) {
    if (statuses.length > 0 && statuses.every(status => status === 'applied'))
        return 'applied';
    if (statuses.some(status => status === 'applied'))
        return 'partial';
    if (statuses.some(status => status === 'pending'))
        return 'pending';
    return 'failed';
}
exports.AgentModelsBatchResultSchema = zod_1.z.object({
    requestId: agent_management_js_1.AgentManagementRequestIdSchema, previewId: agent_management_js_1.AgentManagementRequestIdSchema,
    outcome: exports.AgentModelsBatchOutcomeSchema,
    results: zod_1.z.array(zod_1.z.object({ configuration: agent_model_configuration_js_1.AgentModelsConfigurationSchema, savedVersion: agent_config_js_1.AgentConfigVersionSchema.nullable(), status: exports.AgentModelsBatchStatusSchema, result: agent_management_js_1.AgentManagementCommandResultSchema.nullable(), runtime: agent_model_configuration_js_1.AgentModelRuntimeAttestationSchema.nullable(), reason: agent_management_js_1.AgentManagementReasonSchema.nullable() }).strict()).min(1).max(64),
}).strict().superRefine((batch, ctx) => {
    if (!agent_runtime_identity_js_1.AgentRuntimeIdentitiesSchema.safeParse(batch.results.map(entry => entry.configuration.identity)).success)
        ctx.addIssue({ code: 'custom', path: ['results'], message: 'Duplicate or ambiguous result agents' });
    if (batch.outcome !== deriveAgentModelsBatchOutcome(batch.results.map(entry => entry.status)))
        ctx.addIssue({ code: 'custom', path: ['outcome'], message: 'Batch outcome must account for every agent' });
    for (const [index, entry] of batch.results.entries()) {
        if (entry.savedVersion !== null && entry.savedVersion !== entry.configuration.configVersion)
            ctx.addIssue({ code: 'custom', path: ['results', index, 'savedVersion'], message: 'Saved version must match the proposed configuration' });
        if (entry.status === 'conflict' && entry.savedVersion !== null)
            ctx.addIssue({ code: 'custom', path: ['results', index, 'savedVersion'], message: 'A CAS conflict never reports a new saved version' });
        if (entry.status === 'applied' && entry.savedVersion === null)
            ctx.addIssue({ code: 'custom', path: ['results', index, 'savedVersion'], message: 'An applied configuration must also be saved' });
        if ((entry.status === 'applied') !== (entry.reason === null))
            ctx.addIssue({ code: 'custom', path: ['results', index, 'reason'], message: 'Non-applied agents require a reason' });
        if (entry.status === 'applied' && !(0, agent_model_configuration_js_1.isAgentModelApplyConfirmed)(entry.configuration, { action: 'apply-config', requestId: batch.requestId, desiredVersion: entry.configuration.configVersion }, entry.result, entry.runtime, new Date(entry.runtime?.observedAt ?? NaN)))
            ctx.addIssue({ code: 'custom', path: ['results', index], message: 'Applied status requires matching per-agent runtime evidence' });
    }
});
/** Match the response to the exact accepted preview, and recheck freshness of every claimed applied agent. */
function isAgentModelsBatchResultConsistent(input, serverPreview, processedResult, now = new Date()) {
    const request = exports.AgentModelsBatchRequestSchema.safeParse(input);
    const preview = exports.AgentModelsBatchPreviewSchema.safeParse(serverPreview);
    const result = exports.AgentModelsBatchResultSchema.safeParse(processedResult);
    if (!request.success || !preview.success || !result.success)
        return false;
    const { previewId, ...changes } = request.data;
    if (previewId !== preview.data.previewId || result.data.previewId !== previewId || result.data.requestId !== request.data.requestId || normalizedRequest(changes) !== normalizedRequest(preview.data.request))
        return false;
    if (result.data.results.length !== preview.data.agents.length)
        return false;
    return result.data.results.every(entry => {
        const expected = preview.data.agents.find(agent => (0, agent_model_configuration_js_1.sameModelAgentIdentity)(agent.identity, entry.configuration.identity));
        if (expected === undefined || normalizedConfiguration(expected.next) !== normalizedConfiguration(entry.configuration))
            return false;
        return entry.status !== 'applied' || (0, agent_model_configuration_js_1.isAgentModelApplyConfirmed)(entry.configuration, { action: 'apply-config', requestId: result.data.requestId, desiredVersion: entry.configuration.configVersion }, entry.result, entry.runtime, now);
    });
}
/** Idempotency-store comparison before CAS: replay returns the stored result; changed intent is a conflict. */
function sameAgentModelsBatchRequest(left, right) {
    const first = exports.AgentModelsBatchRequestSchema.safeParse(left);
    const second = exports.AgentModelsBatchRequestSchema.safeParse(right);
    if (!first.success || !second.success)
        return false;
    const { previewId: firstPreview, ...firstIntent } = first.data;
    const { previewId: secondPreview, ...secondIntent } = second.data;
    return firstPreview === secondPreview && normalizedRequest(firstIntent) === normalizedRequest(secondIntent);
}
//# sourceMappingURL=models-batch.js.map