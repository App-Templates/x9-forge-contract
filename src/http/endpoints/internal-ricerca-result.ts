import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../../capability/capability-call-identity.js';
import { ResearchIdSchema, ResearchResultSchema } from '../../capability/ricerca/research.js';
import { RicercaToolErrorSchema } from '../../capability/ricerca/tools.js';
import { ParticipantAgentIdentitySchema } from '../../organization/participant-binding.js';

export const INTERNAL_RICERCA_RESULT_PATH = '/internal/capability/ricerca/result' as const;

/**
 * cap-lab reads the complete research result for `lab_ingest {researchId}`. cap-ricerca only returns research
 * from the same tenant and owner (`scope_foreign` otherwise), and only when `completed` (`not_ready` otherwise).
 * cap-lab checks that the author is the Ricerca of the calling Lab's organization (`caller`), using the existing
 * author rule for `lab_ingest {result}`.
 */
export const InternalRicercaResultRequestSchema = z.strictObject({
  tenantId: CapabilityAgentScopeSchema.shape.tenantId,
  ownerId: CapabilityAgentScopeSchema.shape.ownerId,
  organizationId: z.string().min(1).max(64),
  caller: ParticipantAgentIdentitySchema,
  researchId: ResearchIdSchema,
});

export const InternalRicercaResultResponseSchema = ResearchResultSchema.refine(r => r.state === 'completed', {
  message: 'only a completed research can be ingested',
  path: ['state'],
});

export const InternalRicercaResultErrorSchema = z.strictObject({
  ok: z.literal(false),
  error: z.enum([
    ...RicercaToolErrorSchema.extract(['invalid_request', 'unknown_research', 'not_ready']).options,
    'scope_foreign',
  ]),
});

export const internalRicercaResultContract = {
  method: 'POST',
  path: INTERNAL_RICERCA_RESULT_PATH,
  authType: 'secret',
  bodySchema: InternalRicercaResultRequestSchema,
  responseSchema: InternalRicercaResultResponseSchema,
  errorResponseSchema: InternalRicercaResultErrorSchema,
} as const;

export type InternalRicercaResultRequest = z.infer<typeof InternalRicercaResultRequestSchema>;
export type InternalRicercaResultResponse = z.infer<typeof InternalRicercaResultResponseSchema>;
export type InternalRicercaResultError = z.infer<typeof InternalRicercaResultErrorSchema>;
