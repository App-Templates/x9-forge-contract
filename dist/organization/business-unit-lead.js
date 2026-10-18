import { z } from 'zod';
import { OwnerIdSchema } from "../agent/agent-identity.js";
import { ModelTierSchema } from "../model-router/model-tier.js";
import { ParticipantAgentIdentitySchema, ParticipantRoleSchema } from "./participant-binding.js";
/** Director request to create the lead of a company business unit. */
export const BusinessUnitLeadBirthRequestSchema = z.strictObject({
    requestId: z.string().min(1).max(128),
    tenantId: z.string().min(1),
    ownerId: OwnerIdSchema,
    company: z.strictObject({
        companyId: z.string().min(1).max(64),
        name: z.string().min(1).max(120),
    }),
    businessUnit: z.strictObject({
        slug: z.string().min(1).max(30).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
        name: z.string().min(1).max(120),
        briefSection: z.string().min(1).max(4000),
    }),
    profileTemplate: z.string().min(1).max(64).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
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
});
//# sourceMappingURL=business-unit-lead.js.map