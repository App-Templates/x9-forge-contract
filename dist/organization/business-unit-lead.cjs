"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUSINESS_UNIT_LEAD_BIRTH_REFUSAL = exports.BUSINESS_UNIT_LEAD_PROJECT_UNIT_SLUG_MAX = exports.BUSINESS_UNIT_LEAD_PROJECT_CODE_LENGTH = exports.BUSINESS_UNIT_LEAD_PROJECT_SEPARATOR = exports.BUSINESS_UNIT_LEAD_AGENT_ID_PREFIX = exports.BusinessUnitLeadBirthPendingSchema = exports.BusinessUnitLeadBirthResultSchema = exports.BusinessUnitLeadBirthRequestSchema = exports.BusinessUnitLeadReferentSchema = exports.BusinessUnitLeadProfileTemplateSchema = exports.BUSINESS_UNIT_LEAD_PROFILE_TEMPLATE = void 0;
exports.businessUnitLeadProjectCode = businessUnitLeadProjectCode;
exports.businessUnitLeadAgentId = businessUnitLeadAgentId;
exports.businessUnitSlugOfLeadAgentId = businessUnitSlugOfLeadAgentId;
exports.businessUnitLeadProjectCodeOfAgentId = businessUnitLeadProjectCodeOfAgentId;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../agent/agent-identity.cjs");
const model_preset_js_1 = require("../model-router/model-preset.cjs");
const model_tier_js_1 = require("../model-router/model-tier.cjs");
const agent_role_js_1 = require("./agent-role.cjs");
const business_unit_type_js_1 = require("./business-unit-type.cjs");
const participant_binding_js_1 = require("./participant-binding.cjs");
/** The only birth profile Forge provisions for a business unit lead. */
exports.BUSINESS_UNIT_LEAD_PROFILE_TEMPLATE = agent_role_js_1.BUSINESS_UNIT_LEAD_ROLE;
exports.BusinessUnitLeadProfileTemplateSchema = zod_1.z.literal(exports.BUSINESS_UNIT_LEAD_PROFILE_TEMPLATE);
/** A person the business unit writes to by email (the unit's referent). */
exports.BusinessUnitLeadReferentSchema = zod_1.z.strictObject({
    referentRef: zod_1.z.string().min(1).max(40).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    name: zod_1.z.string().min(1).max(120),
    role: zod_1.z.string().min(1).max(120),
    email: zod_1.z.email(),
});
/** Director request to create the lead of a company business unit. */
exports.BusinessUnitLeadBirthRequestSchema = zod_1.z.strictObject({
    requestId: zod_1.z.string().min(1).max(128),
    tenantId: zod_1.z.string().min(1),
    ownerId: agent_identity_js_1.OwnerIdSchema,
    /** Organization of the Director whose company map holds the referents; absent = the client company (as before). */
    organizationId: zod_1.z.string().min(1).max(64).optional(),
    /** Project of the unit, so the receiver can apply `referentForUnit`; absent = client level, as before 1.175.0. */
    projectId: zod_1.z.string().min(1).max(64).optional(),
    company: zod_1.z.strictObject({
        companyId: zod_1.z.string().min(1).max(64),
        name: zod_1.z.string().min(1).max(120),
    }),
    businessUnit: zod_1.z.strictObject({
        slug: zod_1.z.string().min(1).max(30).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
        /** The business unit type from which Forge takes capabilities, model level and profile. */
        typeId: business_unit_type_js_1.BusinessUnitTypeCardSchema.shape.typeId,
        name: zod_1.z.string().min(1).max(120),
        briefSection: zod_1.z.string().min(1).max(4000),
        competencies: zod_1.z.array(zod_1.z.string().min(1).max(200)).min(1).max(20).refine((competencies) => new Set(competencies).size === competencies.length, { message: 'Competencies must be unique' }),
        referents: zod_1.z.array(exports.BusinessUnitLeadReferentSchema).min(1).max(10).refine((referents) => new Set(referents.map((referent) => referent.referentRef)).size === referents.length, { message: 'Referent references must be unique' }),
    }),
    profileTemplate: exports.BusinessUnitLeadProfileTemplateSchema,
    model: zod_1.z.strictObject({
        tier: model_tier_js_1.ModelTierSchema,
        llmModel: zod_1.z.string().min(1).optional(),
    }),
    capabilities: zod_1.z.array(zod_1.z.string().regex(/^cap-[a-z0-9-]+$/)).refine((capabilities) => new Set(capabilities).size === capabilities.length, { message: 'Capability names must be unique' }),
    paperclipParticipant: zod_1.z.strictObject({
        participantId: zod_1.z.string().min(1),
        roles: zod_1.z.array(participant_binding_js_1.ParticipantRoleSchema).min(1),
    }),
});
/** Forge receipt containing the complete identity of the created agent. */
exports.BusinessUnitLeadBirthResultSchema = zod_1.z.strictObject({
    ok: zod_1.z.literal(true),
    replayed: zod_1.z.boolean(),
    tenantId: exports.BusinessUnitLeadBirthRequestSchema.shape.tenantId,
    companyId: exports.BusinessUnitLeadBirthRequestSchema.shape.company.shape.companyId,
    businessUnitSlug: exports.BusinessUnitLeadBirthRequestSchema.shape.businessUnit.shape.slug,
    agentIdentity: participant_binding_js_1.ParticipantAgentIdentitySchema,
    /**
     * Absent in receipts written before the preset existed (R-37); present = the factory attached the agent to this
     * preset at birth.
     */
    modelPreset: model_preset_js_1.AgentPresetAttachmentSchema.optional(),
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
exports.BusinessUnitLeadBirthPendingSchema = zod_1.z.strictObject({
    ok: zod_1.z.literal(false),
    error: zod_1.z.literal('in_corso'),
    reason: zod_1.z.string().min(1).max(500).regex(/\S/),
    /**
     * Absent for historical producers that do not expose a step; null when an updated producer cannot identify one;
     * otherwise the public key of the actual step. No default or inference from the reason, and no local step catalog.
     */
    step: zod_1.z.string().min(1).max(128).regex(/\S/).nullable().optional(),
});
/** Forge names the agent of a business unit lead `capo-<slug>--<code>` (management and runtime id alike); old leads are `capo-<slug>`. */
exports.BUSINESS_UNIT_LEAD_AGENT_ID_PREFIX = 'capo-';
exports.BUSINESS_UNIT_LEAD_PROJECT_SEPARATOR = '--';
exports.BUSINESS_UNIT_LEAD_PROJECT_CODE_LENGTH = 5;
/** 30 (agent slug maximum) - 5 (prefix) - 2 (separator) - 5 (project code). */
exports.BUSINESS_UNIT_LEAD_PROJECT_UNIT_SLUG_MAX = 18;
/** One refusal code per cause of a lead birth that cannot name the lead after its project. */
exports.BUSINESS_UNIT_LEAD_BIRTH_REFUSAL = {
    projectMissing: 'progetto_mancante',
    unitTooLongForProject: 'reparto_troppo_lungo_per_progetto',
    leadWithoutProjectGroup: 'capo_senza_gruppo_progetto',
    projectGroupMissing: 'gruppo_progetto_assente',
};
const LEAD_SLUG = exports.BusinessUnitLeadBirthRequestSchema.shape.businessUnit.shape.slug;
const PROJECT_CODE_MODULUS = 36 ** exports.BUSINESS_UNIT_LEAD_PROJECT_CODE_LENGTH;
const PROJECT_CODE_PATTERN = new RegExp(`^(.+)${exports.BUSINESS_UNIT_LEAD_PROJECT_SEPARATOR}([a-z0-9]{${exports.BUSINESS_UNIT_LEAD_PROJECT_CODE_LENGTH}})$`);
/** Five-character code of a project (FNV-1a 32 bit over `owner/company/project`, base 36). Pure. */
function businessUnitLeadProjectCode(scope) {
    const text = `${scope.ownerId}/${scope.companyId}/${scope.projectId}`;
    let hash = 0x811c9dc5;
    for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return (hash % PROJECT_CODE_MODULUS).toString(36).padStart(exports.BUSINESS_UNIT_LEAD_PROJECT_CODE_LENGTH, '0');
}
/**
 * Agent id Forge gives to the lead of the business unit `slug`. Without `project` the old `capo-<slug>`; with it
 * `capo-<slug>--<code>` (throws when the slug is longer than the maximum for a project; no truncation).
 */
function businessUnitLeadAgentId(slug, project) {
    const unit = LEAD_SLUG.parse(slug);
    if (project === undefined)
        return `${exports.BUSINESS_UNIT_LEAD_AGENT_ID_PREFIX}${unit}`;
    if (unit.length > exports.BUSINESS_UNIT_LEAD_PROJECT_UNIT_SLUG_MAX) {
        throw new Error(`Business unit slug "${unit}" is longer than ${exports.BUSINESS_UNIT_LEAD_PROJECT_UNIT_SLUG_MAX} characters`);
    }
    return `${exports.BUSINESS_UNIT_LEAD_AGENT_ID_PREFIX}${unit}${exports.BUSINESS_UNIT_LEAD_PROJECT_SEPARATOR}${businessUnitLeadProjectCode(project)}`;
}
/** Splits the part after the prefix into unit and project code; does not check the prefix. */
function splitLeadIdBody(body) {
    const match = PROJECT_CODE_PATTERN.exec(body);
    if (match === null)
        return { unit: body, code: null };
    const unit = match[1];
    if (unit.length > exports.BUSINESS_UNIT_LEAD_PROJECT_UNIT_SLUG_MAX)
        return null;
    return { unit, code: match[2] };
}
/**
 * The business unit slug of a lead agent id (old `capo-<slug>` or new `capo-<slug>--<code>`), or `null` when the id is
 * not the id of a business unit lead. The id is assigned by Forge at birth, so a consumer that has verified the agent
 * identity can read the slug from it instead of trusting a slug written by the model.
 */
function businessUnitSlugOfLeadAgentId(agentId) {
    if (!agentId.startsWith(exports.BUSINESS_UNIT_LEAD_AGENT_ID_PREFIX))
        return null;
    const parsed = LEAD_SLUG.safeParse(splitLeadIdBody(agentId.slice(exports.BUSINESS_UNIT_LEAD_AGENT_ID_PREFIX.length))?.unit);
    return parsed.success ? parsed.data : null;
}
/** The project code of a new-form lead id; `null` for the old form or an id that is not a lead. */
function businessUnitLeadProjectCodeOfAgentId(agentId) {
    if (businessUnitSlugOfLeadAgentId(agentId) === null)
        return null;
    return splitLeadIdBody(agentId.slice(exports.BUSINESS_UNIT_LEAD_AGENT_ID_PREFIX.length))?.code ?? null;
}
//# sourceMappingURL=business-unit-lead.js.map