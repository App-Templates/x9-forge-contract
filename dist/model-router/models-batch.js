import { z } from 'zod';
import { AgentIdSchema, OwnerIdSchema } from "../agent/agent-identity.js";
import { AgentRuntimeIdentitySchema, AgentRuntimeIdentitiesSchema } from "../agent/agent-runtime-identity.js";
import { AgentConfigVersionStateSchema, AgentManagementCommandResultSchema, AgentManagementReasonSchema, AgentManagementRequestIdSchema } from "../agent/agent-management.js";
import { AgentConfigVersionSchema } from "../capability/ricerca/agent-config.js";
import { CapabilityAgentParametersSchema } from "../capability/parameters.js";
import { CapabilityModelSettingsSchema, validateCapabilityModels } from "./capability-model-settings.js";
import { ModelCatalogSchema, ModelCatalogVersionSchema, ModelDescriptorSchema, ModelFunctionSchema, ModelFeaturesSchema, sameModelDescriptor } from "./model-catalog.js";
import { AgentModelsConfigurationSchema, AgentModelRuntimeAttestationSchema, ModelSlotIdSchema, isAgentModelApplyConfirmed, sameModelAgentIdentity } from "./agent-model-configuration.js";
export const ModelCostMetadataSchema = z.discriminatedUnion('state', [
    z.object({ state: z.literal('unknown'), reason: z.string().min(1).max(500) }).strict(),
    z.object({
        state: z.literal('known'), currency: z.string().regex(/^[A-Z]{3}$/),
        rates: z.array(z.object({ unit: z.enum(['million-input-tokens', 'million-output-tokens', 'character', 'minute', 'call']), amount: z.number().nonnegative() }).strict()).min(1),
        source: z.string().min(1).max(500), observedAt: z.iso.datetime({ offset: true }),
    }).strict(),
]);
/** A rebuild never claims that the target model is active before completion. */
export const ModelEmbeddingRebuildSchema = z.object({
    state: z.enum(['pending', 'running', 'failed', 'completed']),
    previous: ModelDescriptorSchema, active: ModelDescriptorSchema, target: ModelDescriptorSchema,
    progress: z.object({ completed: z.number().int().nonnegative(), total: z.number().int().positive() }).strict(),
    reason: z.string().min(1).max(500).nullable(),
}).strict().superRefine((rebuild, ctx) => {
    if (rebuild.progress.completed > rebuild.progress.total)
        ctx.addIssue({ code: 'custom', path: ['progress'], message: 'Progress exceeds its denominator' });
    if ((rebuild.state === 'failed') !== (rebuild.reason !== null))
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'Reason is present exactly on failure' });
    if (rebuild.state === 'completed' && rebuild.progress.completed !== rebuild.progress.total)
        ctx.addIssue({ code: 'custom', path: ['progress'], message: 'Completed rebuild requires complete progress' });
    const expected = rebuild.state === 'completed' ? rebuild.target : rebuild.previous;
    if (!sameModelDescriptor(rebuild.active, expected))
        ctx.addIssue({ code: 'custom', path: ['active'], message: 'Active model changes only after rebuild completion' });
});
export const AgentModelOverviewRowSchema = z.object({
    identity: AgentRuntimeIdentitySchema.strict(), ownerId: OwnerIdSchema, slotId: ModelSlotIdSchema,
    capability: CapabilityAgentParametersSchema.shape.capability, function: ModelFunctionSchema,
    channelId: z.string().min(1).max(128).nullable(),
    installation: z.enum(['installed', 'absent', 'unknown']),
    editability: z.enum(['editable', 'readonly']), reason: z.string().min(1).max(500).nullable(),
    origin: z.enum(['master', 'custom']), masterAgentId: AgentIdSchema.nullable(), masterConfigVersion: AgentConfigVersionSchema.nullable(),
    requirements: ModelFeaturesSchema,
    default: CapabilityModelSettingsSchema.nullable(), saved: CapabilityModelSettingsSchema.nullable(), applied: CapabilityModelSettingsSchema.nullable(),
    versions: AgentConfigVersionStateSchema.nullable(), catalogVersion: ModelCatalogVersionSchema.nullable(),
    cost: ModelCostMetadataSchema, embedding: ModelEmbeddingRebuildSchema.nullable(),
}).strict().superRefine((row, ctx) => {
    if ((row.editability === 'readonly') !== (row.reason !== null))
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'Readonly rows require a reason' });
    if (row.origin === 'master' && (row.masterAgentId === null || row.masterConfigVersion === null))
        ctx.addIssue({ code: 'custom', path: ['masterAgentId'], message: 'Master inheritance requires an explicit source agent' });
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
export const AgentModelsOverviewSchema = z.object({ version: ModelCatalogVersionSchema, observedAt: z.iso.datetime({ offset: true }), rows: z.array(AgentModelOverviewRowSchema).max(2048) }).strict().superRefine((overview, ctx) => {
    const owners = new Map();
    const versions = new Map();
    const identities = new Map();
    const slots = new Set();
    for (const [index, row] of overview.rows.entries()) {
        const agentId = row.identity.managementAgentId;
        const known = identities.get(agentId);
        if (known !== undefined && !sameModelAgentIdentity(known, row.identity))
            ctx.addIssue({ code: 'custom', path: ['rows', index, 'identity'], message: 'Inconsistent agent identity' });
        identities.set(agentId, row.identity);
        if (owners.has(agentId) && owners.get(agentId) !== row.ownerId)
            ctx.addIssue({ code: 'custom', path: ['rows', index, 'ownerId'], message: 'An agent has exactly one owner' });
        owners.set(agentId, row.ownerId);
        const version = JSON.stringify(row.versions);
        if (versions.has(agentId) && versions.get(agentId) !== version)
            ctx.addIssue({ code: 'custom', path: ['rows', index, 'versions'], message: 'All slots use the same agent configuration versions' });
        versions.set(agentId, version);
        const key = `${agentId}:${row.slotId}`;
        if (slots.has(key))
            ctx.addIssue({ code: 'custom', path: ['rows', index, 'slotId'], message: 'Duplicate agent/slot row' });
        slots.add(key);
    }
    if (!AgentRuntimeIdentitiesSchema.safeParse([...identities.values()]).success)
        ctx.addIssue({ code: 'custom', path: ['rows'], message: 'Ambiguous agent identities' });
});
export const AgentModelSlotChangeSchema = z.discriminatedUnion('action', [
    z.object({ action: z.literal('set'), slotId: ModelSlotIdSchema, settings: CapabilityModelSettingsSchema }).strict(),
    z.object({ action: z.literal('reset-master'), slotId: ModelSlotIdSchema }).strict(),
]);
const BatchAgentChangeSchema = z.object({ identity: AgentRuntimeIdentitySchema.strict(), expectedVersion: AgentConfigVersionSchema, changes: z.array(AgentModelSlotChangeSchema).min(1).max(64) }).strict().superRefine((agent, ctx) => {
    if (new Set(agent.changes.map(change => change.slotId)).size !== agent.changes.length)
        ctx.addIssue({ code: 'custom', path: ['changes'], message: 'Duplicate changed slot' });
});
export const AgentModelsBatchPreviewRequestSchema = z.object({ requestId: AgentManagementRequestIdSchema, overviewVersion: ModelCatalogVersionSchema, agents: z.array(BatchAgentChangeSchema).min(1).max(64) }).strict().superRefine((request, ctx) => {
    if (!AgentRuntimeIdentitiesSchema.safeParse(request.agents.map(agent => agent.identity)).success)
        ctx.addIssue({ code: 'custom', path: ['agents'], message: 'Duplicate or ambiguous batch agents' });
});
export const AgentModelsBatchRequestSchema = AgentModelsBatchPreviewRequestSchema.safeExtend({ previewId: AgentManagementRequestIdSchema });
export const AgentModelsBatchIntentSchema = z.union([AgentModelsBatchRequestSchema, AgentModelsBatchPreviewRequestSchema]);
const sameSettings = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const normalizedConfiguration = (config) => JSON.stringify({ ...config, selections: [...config.selections].sort((left, right) => left.slotId.localeCompare(right.slotId)) });
const normalizedRequest = (request) => JSON.stringify({ ...request, agents: request.agents.map(agent => ({ ...agent, changes: [...agent.changes].sort((a, b) => a.slotId.localeCompare(b.slotId)) })).sort((a, b) => a.identity.managementAgentId.localeCompare(b.identity.managementAgentId)) });
export const AgentModelsBatchPreviewSchema = z.object({
    previewId: AgentManagementRequestIdSchema, request: AgentModelsBatchPreviewRequestSchema,
    expiresAt: z.iso.datetime({ offset: true }),
    agents: z.array(z.object({ identity: AgentRuntimeIdentitySchema.strict(), expectedVersion: AgentConfigVersionSchema, next: AgentModelsConfigurationSchema, impact: z.array(z.string().min(1).max(500)).max(64) }).strict()).min(1).max(64),
}).strict().superRefine((preview, ctx) => {
    if (preview.agents.length !== preview.request.agents.length || new Set(preview.agents.map(agent => agent.identity.managementAgentId)).size !== preview.agents.length)
        ctx.addIssue({ code: 'custom', path: ['agents'], message: 'Preview must cover each requested agent exactly once' });
    for (const [index, agent] of preview.agents.entries()) {
        const request = preview.request.agents.find(entry => entry.identity.managementAgentId === agent.identity.managementAgentId);
        if (request === undefined || !sameModelAgentIdentity(agent.identity, request.identity) || !sameModelAgentIdentity(agent.identity, agent.next.identity)) {
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
export function validateAgentModelsBatch(input, serverOverview, serverCatalogs, now = new Date()) {
    const parsed = AgentModelsBatchIntentSchema.safeParse(input);
    if (!parsed.success)
        return ['invalid-request'];
    const source = AgentModelsOverviewSchema.safeParse(serverOverview);
    if (!source.success)
        return ['invalid-overview'];
    const request = parsed.data;
    const overview = source.data;
    if (request.overviewVersion !== overview.version)
        return ['overview-version-mismatch'];
    const catalogs = serverCatalogs.map(value => ModelCatalogSchema.safeParse(value)).flatMap(value => value.success ? [value.data] : []);
    const issues = new Set();
    for (const agent of request.agents)
        for (const change of agent.changes) {
            const row = overview.rows.find(entry => entry.identity.managementAgentId === agent.identity.managementAgentId && entry.slotId === change.slotId);
            if (row === undefined) {
                issues.add('slot-not-found');
                continue;
            }
            if (!sameModelAgentIdentity(row.identity, agent.identity)) {
                issues.add('identity-mismatch');
                continue;
            }
            if (row.versions === null)
                issues.add('version-unknown');
            else if (row.versions.desired !== agent.expectedVersion)
                issues.add('version-conflict');
            if (row.installation !== 'installed')
                issues.add('slot-unavailable');
            if (row.editability !== 'editable')
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
            if ((required.tools !== settings.requirements.tools || required.stream !== settings.requirements.stream || required.structuredOutput !== settings.requirements.structuredOutput))
                issues.add('requirements-mismatch');
            const matching = catalogs.filter(entry => entry.agentId === agent.identity.managementAgentId);
            const catalog = matching[0];
            if (matching.length !== 1 || catalog === undefined || row.catalogVersion !== catalog.version) {
                issues.add('catalog-unavailable');
                continue;
            }
            if (validateCapabilityModels(settings, catalog, agent.identity.managementAgentId, now).length > 0)
                issues.add('model-selection-invalid');
        }
    return [...issues];
}
/** Submit rechecks CAS/catalog separately with validateAgentModelsBatch; a preview is neither a write nor apply evidence. */
export function isAgentModelsBatchPreviewCurrent(input, serverPreview, serverOverview, now = new Date()) {
    const request = AgentModelsBatchRequestSchema.safeParse(input);
    const preview = AgentModelsBatchPreviewSchema.safeParse(serverPreview);
    const overview = AgentModelsOverviewSchema.safeParse(serverOverview);
    if (!request.success || !preview.success || !overview.success)
        return false;
    const { previewId, ...changes } = request.data;
    if (previewId !== preview.data.previewId || changes.overviewVersion !== overview.data.version)
        return false;
    if (!Number.isFinite(now.getTime()) || now.getTime() >= Date.parse(preview.data.expiresAt))
        return false;
    for (const agent of preview.data.agents) {
        const intent = changes.agents.find(entry => sameModelAgentIdentity(entry.identity, agent.identity));
        if (intent === undefined)
            return false;
        for (const change of intent.changes)
            if (change.action === 'reset-master') {
                const row = overview.data.rows.find(entry => sameModelAgentIdentity(entry.identity, agent.identity) && entry.slotId === change.slotId);
                const selection = agent.next.selections.find(entry => entry.slotId === change.slotId);
                if (row?.default == null || selection === undefined || !sameSettings(selection.settings, row.default))
                    return false;
            }
    }
    return normalizedRequest(changes) === normalizedRequest(preview.data.request);
}
export const AgentModelsBatchStatusSchema = z.enum(['applied', 'pending', 'failed', 'conflict']);
export const AgentModelsBatchOutcomeSchema = z.enum(['applied', 'partial', 'pending', 'failed']);
export function deriveAgentModelsBatchOutcome(statuses) {
    if (statuses.length > 0 && statuses.every(status => status === 'applied'))
        return 'applied';
    if (statuses.some(status => status === 'applied'))
        return 'partial';
    if (statuses.some(status => status === 'pending'))
        return 'pending';
    return 'failed';
}
export const AgentModelsBatchResultSchema = z.object({
    requestId: AgentManagementRequestIdSchema, previewId: AgentManagementRequestIdSchema,
    outcome: AgentModelsBatchOutcomeSchema,
    results: z.array(z.object({ configuration: AgentModelsConfigurationSchema, savedVersion: AgentConfigVersionSchema.nullable(), status: AgentModelsBatchStatusSchema, result: AgentManagementCommandResultSchema.nullable(), runtime: AgentModelRuntimeAttestationSchema.nullable(), reason: AgentManagementReasonSchema.nullable() }).strict()).min(1).max(64),
}).strict().superRefine((batch, ctx) => {
    if (!AgentRuntimeIdentitiesSchema.safeParse(batch.results.map(entry => entry.configuration.identity)).success)
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
        if (entry.status === 'applied' && !isAgentModelApplyConfirmed(entry.configuration, { action: 'apply-config', requestId: batch.requestId, desiredVersion: entry.configuration.configVersion }, entry.result, entry.runtime, new Date(entry.runtime?.observedAt ?? NaN)))
            ctx.addIssue({ code: 'custom', path: ['results', index], message: 'Applied status requires matching per-agent runtime evidence' });
    }
});
/** Match the response to the exact accepted preview, and recheck freshness of every claimed applied agent. */
export function isAgentModelsBatchResultConsistent(input, serverPreview, processedResult, now = new Date()) {
    const request = AgentModelsBatchRequestSchema.safeParse(input);
    const preview = AgentModelsBatchPreviewSchema.safeParse(serverPreview);
    const result = AgentModelsBatchResultSchema.safeParse(processedResult);
    if (!request.success || !preview.success || !result.success)
        return false;
    const { previewId, ...changes } = request.data;
    if (previewId !== preview.data.previewId || result.data.previewId !== previewId || result.data.requestId !== request.data.requestId || normalizedRequest(changes) !== normalizedRequest(preview.data.request))
        return false;
    if (result.data.results.length !== preview.data.agents.length)
        return false;
    return result.data.results.every(entry => {
        const expected = preview.data.agents.find(agent => sameModelAgentIdentity(agent.identity, entry.configuration.identity));
        if (expected === undefined || normalizedConfiguration(expected.next) !== normalizedConfiguration(entry.configuration))
            return false;
        return entry.status !== 'applied' || isAgentModelApplyConfirmed(entry.configuration, { action: 'apply-config', requestId: result.data.requestId, desiredVersion: entry.configuration.configVersion }, entry.result, entry.runtime, now);
    });
}
/** Idempotency-store comparison before CAS: replay returns the stored result; changed intent is a conflict. */
export function sameAgentModelsBatchRequest(left, right) {
    const first = AgentModelsBatchRequestSchema.safeParse(left);
    const second = AgentModelsBatchRequestSchema.safeParse(right);
    if (!first.success || !second.success)
        return false;
    const { previewId: firstPreview, ...firstIntent } = first.data;
    const { previewId: secondPreview, ...secondIntent } = second.data;
    return firstPreview === secondPreview && normalizedRequest(firstIntent) === normalizedRequest(secondIntent);
}
//# sourceMappingURL=models-batch.js.map