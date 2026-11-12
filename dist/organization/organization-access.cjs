"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationAccessDecisionSchema = exports.OrganizationAccessRefusalSchema = exports.ORGANIZATION_ACCESS_REFUSALS = exports.OrganizationAccessNeedSchema = exports.ORGANIZATION_ACCESS_NEEDS = void 0;
exports.organizationAccess = organizationAccess;
const zod_1 = require("zod");
const agent_role_js_1 = require("./agent-role.cjs");
const participant_binding_js_1 = require("./participant-binding.cjs");
/**
 * One access rule for the organization, shared by every service (R-14), in two levels as in Paperclip:
 * - level 1 `read`: every active member of the organization reads (Paperclip `allow_company_agent`);
 * - level 2 `manage`: only the Director manages (Paperclip: CEO over other agents' work).
 *
 * The organization is always the one of the resource being read, taken by the caller from the resource itself,
 * never declared by the agent or the model. The actor's three ids come from the verified run context. The
 * function is pure: no clock, no I/O, no agent names.
 */
exports.ORGANIZATION_ACCESS_NEEDS = ['read', 'manage'];
exports.OrganizationAccessNeedSchema = zod_1.z.enum(exports.ORGANIZATION_ACCESS_NEEDS);
exports.ORGANIZATION_ACCESS_REFUSALS = [
    'foreign_tenant',
    'foreign_owner',
    'foreign_organization',
    'not_member',
    'role_unknown',
    'role_ambiguous',
    'director_only',
];
exports.OrganizationAccessRefusalSchema = zod_1.z.enum(exports.ORGANIZATION_ACCESS_REFUSALS);
exports.OrganizationAccessDecisionSchema = zod_1.z.discriminatedUnion('allowed', [
    zod_1.z.strictObject({
        allowed: zod_1.z.literal(true),
        level: exports.OrganizationAccessNeedSchema,
        grant: zod_1.z.enum(['allow_organization_member', 'allow_organization_director']),
        role: agent_role_js_1.AgentRoleSchema.nullable(),
    }),
    zod_1.z.strictObject({
        allowed: zod_1.z.literal(false),
        refusal: exports.OrganizationAccessRefusalSchema,
        reason: zod_1.z.string().min(1),
    }),
]);
function refuse(refusal, reason) {
    return { allowed: false, refusal, reason };
}
function sameIdentity(a, b) {
    return (a.managementAgentId === b.managementAgentId &&
        a.runtimeAgentId === b.runtimeAgentId &&
        a.vaultAgentId === b.vaultAgentId);
}
/** Decides whether the actor may read or manage the organization of the resource. */
function organizationAccess(input) {
    const { resource, need } = input;
    const actor = {
        tenantId: input.actor.tenantId,
        ownerId: input.actor.ownerId,
        agentIdentity: participant_binding_js_1.ParticipantAgentIdentitySchema.parse(input.actor.agentIdentity),
    };
    if (actor.tenantId !== resource.tenantId) {
        return refuse('foreign_tenant', 'The resource belongs to another tenant.');
    }
    if (actor.ownerId !== resource.ownerId) {
        return refuse('foreign_owner', 'The resource belongs to another owner.');
    }
    const live = input.bindings.filter(({ receipt }) => receipt.withdrawnAt === undefined);
    for (const { binding, receipt } of live) {
        const coherent = binding.tenantId === actor.tenantId &&
            binding.ownerId === actor.ownerId &&
            sameIdentity(binding.agentIdentity, actor.agentIdentity) &&
            receipt.key.tenantId === actor.tenantId &&
            receipt.key.ownerId === actor.ownerId &&
            sameIdentity(receipt.key.agentIdentity, actor.agentIdentity) &&
            receipt.appliedVersion === binding.appliedVersion;
        if (!coherent) {
            return refuse('not_member', 'The binding list is inconsistent with the acting agent.');
        }
    }
    const active = live.filter(({ binding, receipt }) => receipt.key.organizationId === resource.organizationId &&
        binding.recipients.some((r) => r.kind === 'organization' && r.id === resource.organizationId));
    if (active.length === 0) {
        const elsewhere = live.some(({ receipt }) => receipt.key.organizationId !== resource.organizationId);
        return elsewhere
            ? refuse('foreign_organization', 'The agent belongs only to other organizations.')
            : refuse('not_member', 'The agent is not an active member of the organization.');
    }
    const roles = [...new Set(active.map(({ binding }) => binding.agentRole ?? null))];
    const commonRole = roles.length === 1 ? roles[0] : null;
    if (need === 'read') {
        return { allowed: true, level: 'read', grant: 'allow_organization_member', role: commonRole };
    }
    if (roles.includes(null)) {
        return refuse('role_unknown', 'A binding of the agent carries no role: the role cannot be established.');
    }
    if (roles.length > 1) {
        return refuse('role_ambiguous', 'The bindings of the agent carry different roles.');
    }
    if (commonRole !== agent_role_js_1.DIRECTOR_ROLE) {
        return refuse('director_only', 'Only the Director manages the organization.');
    }
    return { allowed: true, level: 'manage', grant: 'allow_organization_director', role: agent_role_js_1.DIRECTOR_ROLE };
}
//# sourceMappingURL=organization-access.js.map