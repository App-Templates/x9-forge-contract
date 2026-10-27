"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUSINESS_UNIT_LEAD_AGENT_ID_PREFIX = exports.BusinessUnitLeadBirthResultSchema = exports.BusinessUnitLeadBirthRequestSchema = exports.BusinessUnitLeadReferentSchema = exports.BusinessUnitLeadProfileTemplateSchema = exports.BUSINESS_UNIT_LEAD_PROFILE_TEMPLATE = void 0;
exports.businessUnitLeadAgentId = businessUnitLeadAgentId;
exports.businessUnitSlugOfLeadAgentId = businessUnitSlugOfLeadAgentId;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../agent/agent-identity.cjs");
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
});
/** Forge names the agent of a business unit lead `capo-<slug>` (management and runtime id alike). */
exports.BUSINESS_UNIT_LEAD_AGENT_ID_PREFIX = 'capo-';
const LEAD_SLUG = exports.BusinessUnitLeadBirthRequestSchema.shape.businessUnit.shape.slug;
/** Agent id Forge gives to the lead of the business unit `slug`. */
function businessUnitLeadAgentId(slug) {
    return `${exports.BUSINESS_UNIT_LEAD_AGENT_ID_PREFIX}${LEAD_SLUG.parse(slug)}`;
}
/**
 * The business unit slug of a lead agent id, or `null` when the id is not the id of a business unit lead. The id is
 * assigned by Forge at birth, so a consumer that has verified the agent identity can read the slug from it instead of
 * trusting a slug written by the model.
 */
function businessUnitSlugOfLeadAgentId(agentId) {
    if (!agentId.startsWith(exports.BUSINESS_UNIT_LEAD_AGENT_ID_PREFIX))
        return null;
    const parsed = LEAD_SLUG.safeParse(agentId.slice(exports.BUSINESS_UNIT_LEAD_AGENT_ID_PREFIX.length));
    return parsed.success ? parsed.data : null;
}
//# sourceMappingURL=business-unit-lead.js.map