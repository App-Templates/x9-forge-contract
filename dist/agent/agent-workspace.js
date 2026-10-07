import { z } from 'zod';
import { AgentIdSchema, AgentIdentitySchema, OwnerIdSchema } from "./agent-identity.js";
import { AgentContextWithChannelsSchema, AgentContextWithChannelsWriteSchema } from "./agent-channel-configuration.js";
import { AgentConfigVersionStateSchema } from "./agent-management.js";
import { AgentConfigVersionSchema } from "../capability/ricerca/agent-config.js";
import { AgentRegistryFileSchema } from "../capability/agent-registry-file.js";
import { CapabilityAgentParametersSchema } from "../capability/parameters.js";
/** D-A9: these exact root-relative names replace Forge's temporary CORE_MODEL_FILES list. */
export const AGENT_WORKSPACE_HUMAN_FILES = ['IDENTITY.md', 'SOUL.md', 'POLICIES.md', 'USER.md'];
export const AGENT_WORKSPACE_TOOLS_FILE = 'TOOLS.md';
/** Wire safety bounds in UTF-8 bytes, not a claim about prompt tokens or the old L1 budget. */
export const AGENT_WORKSPACE_LIMITS = {
    humanFileBytes: 16_384,
    toolsBytes: 65_536,
    skillDescriptionBytes: 512,
    skillProcedureBytes: 32_768,
    historyEntries: 100,
    skills: 128,
};
export const AgentWorkspaceHumanFileNameSchema = z.enum(AGENT_WORKSPACE_HUMAN_FILES);
const HashSchema = z.string().regex(/^[a-f0-9]{64}$/);
const DateSchema = z.iso.datetime({ offset: true });
const CapabilityNameSchema = CapabilityAgentParametersSchema.shape.capability.regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/, 'Capability must be a safe path segment');
/** Origin is explicit; an override does not erase the earlier master/template revisions. */
export const AgentWorkspaceOriginSchema = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('master'), source: AgentIdentitySchema, version: AgentConfigVersionSchema }).strict(),
    z.object({ kind: z.literal('template'), templateId: z.string().trim().min(1).max(128),
        ownerId: OwnerIdSchema.nullable(), version: AgentConfigVersionSchema }).strict(),
    z.object({ kind: z.literal('agent') }).strict(),
]);
export const AgentWorkspaceFileRevisionSchema = z.object({
    version: AgentConfigVersionSchema,
    origin: AgentWorkspaceOriginSchema,
    hash: HashSchema,
    bytes: z.number().int().nonnegative().max(AGENT_WORKSPACE_LIMITS.humanFileBytes),
    updatedAt: DateSchema,
}).strict();
/** History contains metadata only. Content belongs to the scoped workspace service, never this context DTO. */
export const AgentWorkspaceHumanFileSchema = z.object({
    name: AgentWorkspaceHumanFileNameSchema,
    load: z.literal('always'),
    versions: AgentConfigVersionStateSchema,
    history: z.array(AgentWorkspaceFileRevisionSchema).min(1).max(AGENT_WORKSPACE_LIMITS.historyEntries),
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
export const AgentWorkspaceToolsSchema = z.object({
    name: z.literal(AGENT_WORKSPACE_TOOLS_FILE),
    origin: z.literal('generated'),
    editable: z.literal(false),
    load: z.literal('always'),
    version: AgentConfigVersionSchema,
    hash: HashSchema,
    bytes: z.number().int().nonnegative().max(AGENT_WORKSPACE_LIMITS.toolsBytes),
    updatedAt: DateSchema,
}).strict();
/** One canonical relative procedure path per enabled capability; consumers still enforce filesystem containment. */
export function agentWorkspaceSkillPath(capability) {
    return `skills/${CapabilityNameSchema.parse(capability)}/SKILL.md`;
}
export const AgentWorkspaceSkillSchema = z.object({
    capability: CapabilityNameSchema,
    /** Always loaded. Opening the procedure never enables a capability or grants permission. */
    description: z.string().trim().min(1).refine(value => new TextEncoder().encode(value).length <= AGENT_WORKSPACE_LIMITS.skillDescriptionBytes, 'Skill description exceeds its UTF-8 byte limit'),
    procedure: z.object({
        path: z.string().min(1),
        load: z.literal('on-demand'),
        editable: z.literal(false),
        version: AgentConfigVersionSchema,
        hash: HashSchema,
        bytes: z.number().int().nonnegative().max(AGENT_WORKSPACE_LIMITS.skillProcedureBytes),
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
export const AgentWorkspaceDescriptorSchema = z.object({
    agentId: AgentIdSchema,
    ownerId: OwnerIdSchema,
    tenantId: z.string().min(1).optional(),
    version: AgentConfigVersionSchema,
    files: z.array(AgentWorkspaceHumanFileSchema).length(AGENT_WORKSPACE_HUMAN_FILES.length),
    tools: AgentWorkspaceToolsSchema,
    registry: AgentRegistryFileSchema,
    skills: z.array(AgentWorkspaceSkillSchema).max(AGENT_WORKSPACE_LIMITS.skills),
}).strict().superRefine((workspace, ctx) => {
    if (new Set(workspace.files.map(file => file.name)).size !== AGENT_WORKSPACE_HUMAN_FILES.length)
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
export const AgentWorkspaceRollbackRequestSchema = z.object({
    file: AgentWorkspaceHumanFileNameSchema,
    expectedVersion: AgentConfigVersionSchema,
    targetVersion: AgentConfigVersionSchema,
}).strict();
/** Server-owned current descriptor + untrusted request: always validate this binding, not just request syntax. */
export const AgentWorkspaceRollbackValidationSchema = z.object({
    workspace: AgentWorkspaceDescriptorSchema,
    request: AgentWorkspaceRollbackRequestSchema,
}).strict().superRefine(({ workspace, request }, ctx) => {
    const file = workspace.files.find(entry => entry.name === request.file);
    if (request.expectedVersion !== file.versions.desired)
        ctx.addIssue({ code: 'custom', path: ['request', 'expectedVersion'], message: 'Saved file version changed (CAS conflict)' });
    if (!file.history.some(entry => entry.version === request.targetVersion))
        ctx.addIssue({ code: 'custom', path: ['request', 'targetVersion'], message: 'Rollback revision does not exist' });
    if (request.targetVersion >= request.expectedVersion)
        ctx.addIssue({ code: 'custom', path: ['request', 'targetVersion'], message: 'Rollback selects a previous revision' });
});
export function parseAgentWorkspaceRollbackRequest(request, authoritativeWorkspace) {
    return AgentWorkspaceRollbackValidationSchema.parse({ request, workspace: authoritativeWorkspace }).request;
}
function checkWorkspaceScope(context, ctx) {
    const workspace = context.workspace;
    if (workspace && (workspace.agentId !== context.agentId || workspace.ownerId !== context.ownerId || workspace.tenantId !== context.tenantId)) {
        ctx.addIssue({ code: 'custom', path: ['workspace'], message: 'Workspace belongs to another context scope' });
    }
}
/** Additive reader/writer extension. Legacy absence is valid; channel and canonical scopePolicy guards are inherited. */
export const AgentContextWithWorkspaceSchema = AgentContextWithChannelsSchema.safeExtend({ workspace: AgentWorkspaceDescriptorSchema.optional() }).superRefine(checkWorkspaceScope);
export const AgentContextWithWorkspaceWriteSchema = AgentContextWithChannelsWriteSchema.safeExtend({ workspace: AgentWorkspaceDescriptorSchema.optional() }).superRefine(checkWorkspaceScope);
/** Version comes only from a validated applied bundle; never guess from file histories or configVersion. */
export function appliedWorkspaceVersion(ctx) {
    return ctx.workspace?.version ?? null;
}
//# sourceMappingURL=agent-workspace.js.map