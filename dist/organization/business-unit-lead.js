import { z } from 'zod';
import { OwnerIdSchema } from "../agent/agent-identity.js";
import { AgentPresetAttachmentSchema } from "../model-router/model-preset.js";
import { ModelTierSchema } from "../model-router/model-tier.js";
import { BUSINESS_UNIT_LEAD_ROLE } from "./agent-role.js";
import { BusinessUnitTypeCardSchema } from "./business-unit-type.js";
import { ParticipantAgentIdentitySchema, ParticipantRoleSchema } from "./participant-binding.js";
/** The only birth profile Forge provisions for a business unit lead. */
export const BUSINESS_UNIT_LEAD_PROFILE_TEMPLATE = BUSINESS_UNIT_LEAD_ROLE;
export const BusinessUnitLeadProfileTemplateSchema = z.literal(BUSINESS_UNIT_LEAD_PROFILE_TEMPLATE);
/** A person the business unit writes to by email (the unit's referent). */
export const BusinessUnitLeadReferentSchema = z.strictObject({
    referentRef: z.string().min(1).max(40).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    name: z.string().min(1).max(120),
    role: z.string().min(1).max(120),
    email: z.email(),
});
/** Director request to create the lead of a company business unit. */
export const BusinessUnitLeadBirthRequestSchema = z.strictObject({
    requestId: z.string().min(1).max(128),
    tenantId: z.string().min(1),
    ownerId: OwnerIdSchema,
    /** Organization of the Director whose company map holds the referents; absent = the client company (as before). */
    organizationId: z.string().min(1).max(64).optional(),
    /** Project of the unit, so the receiver can apply `referentForUnit`; absent = client level, as before 1.175.0. */
    projectId: z.string().min(1).max(64).optional(),
    company: z.strictObject({
        companyId: z.string().min(1).max(64),
        name: z.string().min(1).max(120),
    }),
    businessUnit: z.strictObject({
        slug: z.string().min(1).max(30).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
        /** The business unit type from which Forge takes capabilities, model level and profile. */
        typeId: BusinessUnitTypeCardSchema.shape.typeId,
        name: z.string().min(1).max(120),
        briefSection: z.string().min(1).max(4000),
        competencies: z.array(z.string().min(1).max(200)).min(1).max(20).refine((competencies) => new Set(competencies).size === competencies.length, { message: 'Competencies must be unique' }),
        referents: z.array(BusinessUnitLeadReferentSchema).min(1).max(10).refine((referents) => new Set(referents.map((referent) => referent.referentRef)).size === referents.length, { message: 'Referent references must be unique' }),
    }),
    profileTemplate: BusinessUnitLeadProfileTemplateSchema,
    model: z.strictObject({
        tier: ModelTierSchema,
        llmModel: z.string().min(1).optional(),
    }),
    capabilities: z.array(z.string().regex(/^cap-[a-z0-9-]+$/)).refine((capabilities) => new Set(capabilities).size === capabilities.length, { message: 'Capability names must be unique' }),
    paperclipParticipant: z.strictObject({
        participantId: z.string().min(1),
        roles: z.array(ParticipantRoleSchema).min(1),
    }),
});
/** Forge receipt containing the complete identity of the created agent. */
export const BusinessUnitLeadBirthResultSchema = z.strictObject({
    ok: z.literal(true),
    replayed: z.boolean(),
    tenantId: BusinessUnitLeadBirthRequestSchema.shape.tenantId,
    companyId: BusinessUnitLeadBirthRequestSchema.shape.company.shape.companyId,
    businessUnitSlug: BusinessUnitLeadBirthRequestSchema.shape.businessUnit.shape.slug,
    agentIdentity: ParticipantAgentIdentitySchema,
    /**
     * Absent in receipts written before the preset existed (R-37); present = the factory attached the agent to this
     * preset at birth.
     */
    modelPreset: AgentPresetAttachmentSchema.optional(),
}).superRefine((receipt, ctx) => {
    const attachment = receipt.modelPreset;
    if (attachment === undefined)
        return;
    if (attachment.tenantId !== receipt.tenantId) {
        ctx.addIssue({ code: 'custom', path: ['modelPreset', 'tenantId'], message: 'The preset attachment must belong to the receipt tenant' });
    }
    for (const field of ['managementAgentId', 'runtimeAgentId', 'vaultAgentId']) {
        if (attachment.identity[field] !== receipt.agentIdentity[field]) {
            ctx.addIssue({ code: 'custom', path: ['modelPreset', 'identity', field], message: 'The preset attachment must be for the agent of the receipt' });
        }
    }
    if (attachment.resolvedBy === 'company' && attachment.preset.companyId !== receipt.companyId) {
        ctx.addIssue({ code: 'custom', path: ['modelPreset', 'preset', 'companyId'], message: 'A company preset must belong to the receipt company' });
    }
});
/** Forge HTTP 202 receipt: birth is pending, with the public reason preserved verbatim. */
export const BusinessUnitLeadBirthPendingSchema = z.strictObject({
    ok: z.literal(false),
    error: z.literal('in_corso'),
    reason: z.string().min(1).max(500).regex(/\S/),
    /**
     * Absent for historical producers that do not expose a step; null when an updated producer cannot identify one;
     * otherwise the public key of the actual step. No default or inference from the reason, and no local step catalog.
     */
    step: z.string().min(1).max(128).regex(/\S/).nullable().optional(),
});
/** Forge names the agent of a business unit lead `capo-<slug>--<code>` (management and runtime id alike); old leads are `capo-<slug>`. */
export const BUSINESS_UNIT_LEAD_AGENT_ID_PREFIX = 'capo-';
export const BUSINESS_UNIT_LEAD_PROJECT_SEPARATOR = '--';
export const BUSINESS_UNIT_LEAD_PROJECT_CODE_LENGTH = 5;
/** 30 (agent slug maximum) - 5 (prefix) - 2 (separator) - 5 (project code). */
export const BUSINESS_UNIT_LEAD_PROJECT_UNIT_SLUG_MAX = 18;
/** One refusal code per cause of a lead birth that cannot name the lead after its project. */
export const BUSINESS_UNIT_LEAD_BIRTH_REFUSAL = {
    projectMissing: 'progetto_mancante',
    unitTooLongForProject: 'reparto_troppo_lungo_per_progetto',
    leadWithoutProjectGroup: 'capo_senza_gruppo_progetto',
    projectGroupMissing: 'gruppo_progetto_assente',
};
const LEAD_SLUG = BusinessUnitLeadBirthRequestSchema.shape.businessUnit.shape.slug;
const PROJECT_CODE_MODULUS = 36 ** BUSINESS_UNIT_LEAD_PROJECT_CODE_LENGTH;
const PROJECT_CODE_PATTERN = new RegExp(`^(.+)${BUSINESS_UNIT_LEAD_PROJECT_SEPARATOR}([a-z0-9]{${BUSINESS_UNIT_LEAD_PROJECT_CODE_LENGTH}})$`);
/** Five-character code of a project (FNV-1a 32 bit over `owner/company/project`, base 36). Pure. */
export function businessUnitLeadProjectCode(scope) {
    const text = `${scope.ownerId}/${scope.companyId}/${scope.projectId}`;
    let hash = 0x811c9dc5;
    for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return (hash % PROJECT_CODE_MODULUS).toString(36).padStart(BUSINESS_UNIT_LEAD_PROJECT_CODE_LENGTH, '0');
}
/**
 * Agent id Forge gives to the lead of the business unit `slug`. Without `project` the old `capo-<slug>`; with it
 * `capo-<slug>--<code>` (throws when the slug is longer than the maximum for a project; no truncation).
 */
export function businessUnitLeadAgentId(slug, project) {
    const unit = LEAD_SLUG.parse(slug);
    if (project === undefined)
        return `${BUSINESS_UNIT_LEAD_AGENT_ID_PREFIX}${unit}`;
    if (unit.length > BUSINESS_UNIT_LEAD_PROJECT_UNIT_SLUG_MAX) {
        throw new Error(`Business unit slug "${unit}" is longer than ${BUSINESS_UNIT_LEAD_PROJECT_UNIT_SLUG_MAX} characters`);
    }
    return `${BUSINESS_UNIT_LEAD_AGENT_ID_PREFIX}${unit}${BUSINESS_UNIT_LEAD_PROJECT_SEPARATOR}${businessUnitLeadProjectCode(project)}`;
}
/** Splits the part after the prefix into unit and project code; does not check the prefix. */
function splitLeadIdBody(body) {
    const match = PROJECT_CODE_PATTERN.exec(body);
    if (match === null)
        return { unit: body, code: null };
    const unit = match[1];
    if (unit.length > BUSINESS_UNIT_LEAD_PROJECT_UNIT_SLUG_MAX)
        return null;
    return { unit, code: match[2] };
}
/**
 * The business unit slug of a lead agent id (old `capo-<slug>` or new `capo-<slug>--<code>`), or `null` when the id is
 * not the id of a business unit lead. The id is assigned by Forge at birth, so a consumer that has verified the agent
 * identity can read the slug from it instead of trusting a slug written by the model.
 */
export function businessUnitSlugOfLeadAgentId(agentId) {
    if (!agentId.startsWith(BUSINESS_UNIT_LEAD_AGENT_ID_PREFIX))
        return null;
    const parsed = LEAD_SLUG.safeParse(splitLeadIdBody(agentId.slice(BUSINESS_UNIT_LEAD_AGENT_ID_PREFIX.length))?.unit);
    return parsed.success ? parsed.data : null;
}
/** The project code of a new-form lead id; `null` for the old form or an id that is not a lead. */
export function businessUnitLeadProjectCodeOfAgentId(agentId) {
    if (businessUnitSlugOfLeadAgentId(agentId) === null)
        return null;
    return splitLeadIdBody(agentId.slice(BUSINESS_UNIT_LEAD_AGENT_ID_PREFIX.length))?.code ?? null;
}
//# sourceMappingURL=business-unit-lead.js.map