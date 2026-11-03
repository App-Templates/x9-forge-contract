"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentContextWithWorkspaceWriteSchema = exports.AgentContextWithWorkspaceSchema = exports.AgentWorkspaceRollbackValidationSchema = exports.AgentWorkspaceRollbackRequestSchema = exports.AgentWorkspaceDescriptorSchema = exports.AgentWorkspaceSkillSchema = exports.AgentWorkspaceToolsSchema = exports.AgentWorkspaceHumanFileSchema = exports.AgentWorkspaceFileRevisionSchema = exports.AgentWorkspaceOriginSchema = exports.AgentWorkspaceHumanFileNameSchema = exports.AGENT_WORKSPACE_LIMITS = exports.AGENT_WORKSPACE_TOOLS_FILE = exports.AGENT_WORKSPACE_HUMAN_FILES = exports.AgentWorkspaceAttestationSchema = void 0;
exports.agentWorkspaceSkillPath = agentWorkspaceSkillPath;
exports.parseAgentWorkspaceRollbackRequest = parseAgentWorkspaceRollbackRequest;
exports.appliedWorkspaceVersion = appliedWorkspaceVersion;
exports.attestedWorkspaceVersionOf = attestedWorkspaceVersionOf;
const zod_1 = require("zod");
const agent_workspace_attestation_js_1 = require("./agent-workspace-attestation.cjs");
var agent_workspace_attestation_js_2 = require("./agent-workspace-attestation.cjs");
Object.defineProperty(exports, "AgentWorkspaceAttestationSchema", { enumerable: true, get: function () { return agent_workspace_attestation_js_2.AgentWorkspaceAttestationSchema; } });
const agent_identity_js_1 = require("./agent-identity.cjs");
const agent_channel_configuration_js_1 = require("./agent-channel-configuration.cjs");
const agent_management_js_1 = require("./agent-management.cjs");
const agent_config_js_1 = require("../capability/ricerca/agent-config.cjs");
const agent_registry_file_js_1 = require("../capability/agent-registry-file.cjs");
const parameters_js_1 = require("../capability/parameters.cjs");
const ordinary_configuration_js_1 = require("../capability/ordinary-configuration.cjs");
/** D-A9: these exact root-relative names replace Forge's temporary CORE_MODEL_FILES list. */
exports.AGENT_WORKSPACE_HUMAN_FILES = ['IDENTITY.md', 'SOUL.md', 'POLICIES.md', 'USER.md'];
exports.AGENT_WORKSPACE_TOOLS_FILE = 'TOOLS.md';
/** Wire safety bounds in UTF-8 bytes, not a claim about prompt tokens or the old L1 budget. */
exports.AGENT_WORKSPACE_LIMITS = {
    humanFileBytes: 16_384,
    toolsBytes: 65_536,
    skillDescriptionBytes: 512,
    skillProcedureBytes: 32_768,
    historyEntries: 100,
    skills: 128,
};
exports.AgentWorkspaceHumanFileNameSchema = zod_1.z.enum(exports.AGENT_WORKSPACE_HUMAN_FILES);
const HashSchema = zod_1.z.string().regex(/^[a-f0-9]{64}$/);
const DateSchema = zod_1.z.iso.datetime({ offset: true });
const CapabilityNameSchema = parameters_js_1.CapabilityAgentParametersSchema.shape.capability.regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/, 'Capability must be a safe path segment');
/** Origin is explicit; an override does not erase the earlier master/template revisions. */
exports.AgentWorkspaceOriginSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.object({ kind: zod_1.z.literal('master'), source: agent_identity_js_1.AgentIdentitySchema, version: agent_config_js_1.AgentConfigVersionSchema }).strict(),
    zod_1.z.object({ kind: zod_1.z.literal('template'), templateId: zod_1.z.string().trim().min(1).max(128),
        ownerId: agent_identity_js_1.OwnerIdSchema.nullable(), version: agent_config_js_1.AgentConfigVersionSchema }).strict(),
    zod_1.z.object({ kind: zod_1.z.literal('agent') }).strict(),
]);
exports.AgentWorkspaceFileRevisionSchema = zod_1.z.object({
    version: agent_config_js_1.AgentConfigVersionSchema,
    origin: exports.AgentWorkspaceOriginSchema,
    hash: HashSchema,
    bytes: zod_1.z.number().int().nonnegative().max(exports.AGENT_WORKSPACE_LIMITS.humanFileBytes),
    updatedAt: DateSchema,
}).strict();
/** History contains metadata only. Content belongs to the scoped workspace service, never this context DTO. */
exports.AgentWorkspaceHumanFileSchema = zod_1.z.object({
    name: exports.AgentWorkspaceHumanFileNameSchema,
    load: zod_1.z.literal('always'),
    versions: agent_management_js_1.AgentConfigVersionStateSchema,
    history: zod_1.z.array(exports.AgentWorkspaceFileRevisionSchema).min(1).max(exports.AGENT_WORKSPACE_LIMITS.historyEntries),
}).strict().superRefine((file, ctx) => {
    for (let index = 1; index < file.history.length; index++) {
        const previous = file.history[index - 1], current = file.history[index];
        if (current.version <= previous.version)
            ctx.addIssue({ code: 'custom', path: ['history', index, 'version'], message: 'History versions must strictly increase' });
        if (Date.parse(current.updatedAt) < Date.parse(previous.updatedAt))
            ctx.addIssue({ code: 'custom', path: ['history', index, 'updatedAt'], message: 'History dates must not go backwards' });
    }
    if (file.history.at(-1)?.version !== file.versions.desired)
        ctx.addIssue({ code: 'custom', path: ['versions', 'desired'], message: 'Saved version must be the latest revision' });
    if (file.versions.applied !== null && !file.history.some(entry => entry.version === file.versions.applied))
        ctx.addIssue({ code: 'custom', path: ['versions', 'applied'], message: 'Applied revision must exist in history' });
    if (file.versions.failed && !file.history.some(entry => entry.version === file.versions.failed?.version))
        ctx.addIssue({ code: 'custom', path: ['versions', 'failed'], message: 'Failed revision must exist in history' });
});
/** TOOLS is generated from the frozen registry. A human override or editable flag is invalid. */
exports.AgentWorkspaceToolsSchema = zod_1.z.object({
    name: zod_1.z.literal(exports.AGENT_WORKSPACE_TOOLS_FILE),
    origin: zod_1.z.literal('generated'),
    editable: zod_1.z.literal(false),
    load: zod_1.z.literal('always'),
    version: agent_config_js_1.AgentConfigVersionSchema,
    hash: HashSchema,
    bytes: zod_1.z.number().int().nonnegative().max(exports.AGENT_WORKSPACE_LIMITS.toolsBytes),
    updatedAt: DateSchema,
}).strict();
/** One canonical relative procedure path per enabled capability; consumers still enforce filesystem containment. */
function agentWorkspaceSkillPath(capability) {
    return `skills/${CapabilityNameSchema.parse(capability)}/SKILL.md`;
}
exports.AgentWorkspaceSkillSchema = zod_1.z.object({
    capability: CapabilityNameSchema,
    /** Always loaded. Opening the procedure never enables a capability or grants permission. */
    description: zod_1.z.string().trim().min(1).refine(value => new TextEncoder().encode(value).length <= exports.AGENT_WORKSPACE_LIMITS.skillDescriptionBytes, 'Skill description exceeds its UTF-8 byte limit'),
    procedure: zod_1.z.object({
        path: zod_1.z.string().min(1),
        load: zod_1.z.literal('on-demand'),
        editable: zod_1.z.literal(false),
        version: agent_config_js_1.AgentConfigVersionSchema,
        hash: HashSchema,
        bytes: zod_1.z.number().int().nonnegative().max(exports.AGENT_WORKSPACE_LIMITS.skillProcedureBytes),
    }).strict(),
}).strict().superRefine((skill, ctx) => {
    if (skill.procedure.path !== agentWorkspaceSkillPath(skill.capability))
        ctx.addIssue({ code: 'custom', path: ['procedure', 'path'], message: 'Procedure path must belong to this capability' });
});
/**
 * Applied core bundle descriptor. File versions track editing independently of the bundle's applied `version`.
 * To read the effective human text, select its `versions.applied` revision, never the latest saved revision.
 * Registry and generated references are the validated snapshot used at Apply, not a second discovery on GET.
 * Permissions come ONLY from the enclosing context's canonical BRIDGE-134 scopePolicy, never file prose.
 */
exports.AgentWorkspaceDescriptorSchema = zod_1.z.object({
    agentId: agent_identity_js_1.AgentIdSchema,
    ownerId: agent_identity_js_1.OwnerIdSchema,
    tenantId: zod_1.z.string().min(1).optional(),
    version: agent_config_js_1.AgentConfigVersionSchema,
    files: zod_1.z.array(exports.AgentWorkspaceHumanFileSchema).length(exports.AGENT_WORKSPACE_HUMAN_FILES.length),
    tools: exports.AgentWorkspaceToolsSchema,
    registry: agent_registry_file_js_1.AgentRegistryFileSchema,
    skills: zod_1.z.array(exports.AgentWorkspaceSkillSchema).max(exports.AGENT_WORKSPACE_LIMITS.skills),
    ordinaryConfigurations: zod_1.z.array(ordinary_configuration_js_1.CapabilityOrdinaryConfigurationSchema).max(exports.AGENT_WORKSPACE_LIMITS.skills).optional(),
}).strict().superRefine((workspace, ctx) => {
    if (new Set(workspace.files.map(file => file.name)).size !== exports.AGENT_WORKSPACE_HUMAN_FILES.length)
        ctx.addIssue({ code: 'custom', path: ['files'], message: 'Exactly one of each human file is required' });
    for (const [index, file] of workspace.files.entries()) {
        for (const [revision, entry] of file.history.entries()) {
            const originOwner = entry.origin.kind === 'master' ? entry.origin.source.ownerId : entry.origin.kind === 'template' ? entry.origin.ownerId : workspace.ownerId;
            if (file.name === 'USER.md' && originOwner !== workspace.ownerId)
                ctx.addIssue({ code: 'custom', path: ['files', index, 'history', revision, 'origin'], message: 'A USER profile cannot cross owner boundaries' });
        }
    }
    const names = workspace.registry.capabilities.map(entry => entry.name);
    if (new Set(names).size !== names.length)
        ctx.addIssue({ code: 'custom', path: ['registry'], message: 'Registry capability names must be unique' });
    const enabled = new Set(workspace.registry.capabilities.filter(entry => entry.enabled).map(entry => entry.name));
    const ordinary = workspace.ordinaryConfigurations ?? [];
    if (new Set(ordinary.map(config => config.capability)).size !== ordinary.length)
        ctx.addIssue({ code: 'custom', path: ['ordinaryConfigurations'], message: 'One frozen configuration per capability' });
    for (const [index, config] of ordinary.entries()) {
        if (!enabled.has(config.capability) || config.scope.agentId !== workspace.agentId || config.scope.ownerId !== workspace.ownerId || config.scope.tenantId !== workspace.tenantId)
            ctx.addIssue({ code: 'custom', path: ['ordinaryConfigurations', index], message: 'Frozen ordinary configuration must belong to this enabled target' });
    }
    const declared = new Set(workspace.skills.map(skill => skill.capability));
    if (declared.size !== workspace.skills.length)
        ctx.addIssue({ code: 'custom', path: ['skills'], message: 'One progressive skill per capability' });
    for (const [index, skill] of workspace.skills.entries()) {
        if (!enabled.has(skill.capability))
            ctx.addIssue({ code: 'custom', path: ['skills', index, 'capability'], message: 'Skill capability must be enabled' });
        if (skill.procedure.version !== workspace.version)
            ctx.addIssue({ code: 'custom', path: ['skills', index, 'procedure', 'version'], message: 'Procedure must match the applied bundle version' });
    }
    if (enabled.size !== declared.size || [...enabled].some(name => !declared.has(name)))
        ctx.addIssue({ code: 'custom', path: ['skills'], message: 'Every enabled capability needs its short skill description' });
    if (workspace.tools.version !== workspace.version)
        ctx.addIssue({ code: 'custom', path: ['tools', 'version'], message: 'TOOLS must match the applied bundle version' });
});
/** Request selects a previous revision as a NEW desired revision; it never directly changes the applied version. */
exports.AgentWorkspaceRollbackRequestSchema = zod_1.z.object({
    file: exports.AgentWorkspaceHumanFileNameSchema,
    expectedVersion: agent_config_js_1.AgentConfigVersionSchema,
    targetVersion: agent_config_js_1.AgentConfigVersionSchema,
}).strict();
/** Server-owned current descriptor + untrusted request: always validate this binding, not just request syntax. */
exports.AgentWorkspaceRollbackValidationSchema = zod_1.z.object({
    workspace: exports.AgentWorkspaceDescriptorSchema,
    request: exports.AgentWorkspaceRollbackRequestSchema,
}).strict().superRefine(({ workspace, request }, ctx) => {
    const file = workspace.files.find(entry => entry.name === request.file);
    if (request.expectedVersion !== file.versions.desired)
        ctx.addIssue({ code: 'custom', path: ['request', 'expectedVersion'], message: 'Saved file version changed (CAS conflict)' });
    if (!file.history.some(entry => entry.version === request.targetVersion))
        ctx.addIssue({ code: 'custom', path: ['request', 'targetVersion'], message: 'Rollback revision does not exist' });
    if (request.targetVersion >= request.expectedVersion)
        ctx.addIssue({ code: 'custom', path: ['request', 'targetVersion'], message: 'Rollback selects a previous revision' });
});
function parseAgentWorkspaceRollbackRequest(request, authoritativeWorkspace) {
    return exports.AgentWorkspaceRollbackValidationSchema.parse({ request, workspace: authoritativeWorkspace }).request;
}
function checkWorkspaceScope(context, ctx) {
    const workspace = context.workspace;
    if (workspace && (workspace.agentId !== context.agentId || workspace.ownerId !== context.ownerId || workspace.tenantId !== context.tenantId)) {
        ctx.addIssue({ code: 'custom', path: ['workspace'], message: 'Workspace belongs to another context scope' });
    }
}
/** Additive reader/writer extension. Legacy absence is valid; channel and canonical scopePolicy guards are inherited. */
exports.AgentContextWithWorkspaceSchema = agent_channel_configuration_js_1.AgentContextWithChannelsSchema.safeExtend({ workspace: exports.AgentWorkspaceDescriptorSchema.optional() }).superRefine(checkWorkspaceScope);
exports.AgentContextWithWorkspaceWriteSchema = agent_channel_configuration_js_1.AgentContextWithChannelsWriteSchema.safeExtend({ workspace: exports.AgentWorkspaceDescriptorSchema.optional() }).superRefine(checkWorkspaceScope);
/** Version comes only from a validated applied bundle; never guess from file histories or configVersion. */
function appliedWorkspaceVersion(ctx) {
    return ctx.workspace?.version ?? null;
}
/**
 * Read only a validated wire attestation. Never derive readiness/version from configVersion, desired files,
 * file histories, registry metadata or another row. Forge compares this bundle with the archived descriptor
 * for its configuration snapshot; X9 supplies it only after loading the effective verified snapshot.
 */
function attestedWorkspaceVersionOf(row) {
    if (row === null || typeof row !== 'object')
        return null;
    const selected = agent_workspace_attestation_js_1.AgentWorkspaceAttestationSchema.safeParse(row.workspace);
    return selected.success ? selected.data.appliedVersion : null;
}
//# sourceMappingURL=agent-workspace.js.map