import { z } from 'zod';
import { OwnerIdSchema } from '../agent/agent-identity.js';
import { AgentRuntimeIdentitySchema } from '../agent/agent-runtime-identity.js';

/** Branded identifier of one run of an organization (agentic team). */
export const RunIdSchema = z.string().min(1).brand<'RunId'>();
export type RunId = z.infer<typeof RunIdSchema>;

/** Who issued the run context. */
export const OrganizationRunIssuerSchema = z.enum(['x9', 'forge', 'paperclip']);
export type OrganizationRunIssuer = z.infer<typeof OrganizationRunIssuerSchema>;

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
    /** Attested person this run acts for, set by the context issuer (runtime), never the model.
     * Absent for group turns and runs without a person. */
    personRef: z.string().min(1).optional(),
    issuer: OrganizationRunIssuerSchema,
    issuedAt: z.iso.datetime(),
    expiresAt: z.iso.datetime(),
  })
  .refine((ctx) => Date.parse(ctx.expiresAt) > Date.parse(ctx.issuedAt), {
    message: 'expiresAt must be after issuedAt',
    path: ['expiresAt'],
  });
export type OrganizationRunContext = z.infer<typeof OrganizationRunContextSchema>;
