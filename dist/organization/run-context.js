import { z } from 'zod';
import { OwnerIdSchema } from "../agent/agent-identity.js";
import { AgentRuntimeIdentitySchema } from "../agent/agent-runtime-identity.js";
/** Branded identifier of one run of an organization (agentic team). */
export const RunIdSchema = z.string().min(1).brand();
/** Who issued the run context. */
export const OrganizationRunIssuerSchema = z.enum(['x9', 'forge', 'paperclip']);
/**
 * Trusted context of one organization run. Carries identity and validity only:
 * no secrets, no private content, no free-form fields (strictObject).
 */
export const OrganizationRunContextSchema = z
    .strictObject({
    schemaVersion: z.literal(1),
    runId: RunIdSchema,
    organizationId: z.string().min(1),
    ownerId: OwnerIdSchema,
    identity: AgentRuntimeIdentitySchema,
    issuer: OrganizationRunIssuerSchema,
    issuedAt: z.iso.datetime(),
    expiresAt: z.iso.datetime(),
})
    .refine((ctx) => Date.parse(ctx.expiresAt) > Date.parse(ctx.issuedAt), {
    message: 'expiresAt must be after issuedAt',
    path: ['expiresAt'],
});
//# sourceMappingURL=run-context.js.map