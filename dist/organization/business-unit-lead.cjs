"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessUnitLeadBirthResultSchema = exports.BusinessUnitLeadBirthRequestSchema = exports.BusinessUnitLeadReferentSchema = exports.BusinessUnitLeadProfileTemplateSchema = exports.BUSINESS_UNIT_LEAD_PROFILE_TEMPLATE = void 0;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../agent/agent-identity.cjs");
const model_tier_js_1 = require("../model-router/model-tier.cjs");
const agent_role_js_1 = require("./agent-role.cjs");
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
//# sourceMappingURL=business-unit-lead.js.map