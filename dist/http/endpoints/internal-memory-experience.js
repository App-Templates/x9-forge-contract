import { z } from 'zod';
import { ExperienceConflictSchema, ExperienceReceiptSchema, OrganizationExperienceEventSchema, } from "../../organization/experience.js";
/**
 * POST /internal/memory/experience — ingest of one organization experience event.
 * POST /internal/memory/experience/query — structured read of stored experience.
 * Direction: X9 internal (agent-core / consumers -> memory-svc)
 * Auth: internal secret (INTERNAL_SECRET_HEADER)
 *
 * Ingest is idempotent: same recordId+version+digest answers 200 `duplicate`;
 * same recordId+version with another digest answers 409 `experience_conflict`.
 */
export const INTERNAL_MEMORY_EXPERIENCE_PATH = '/internal/memory/experience';
export const INTERNAL_MEMORY_EXPERIENCE_QUERY_PATH = '/internal/memory/experience/query';
export const InternalMemoryExperienceRequestSchema = OrganizationExperienceEventSchema;
export const InternalMemoryExperienceResponseSchema = ExperienceReceiptSchema;
/** Named failures shared by the experience and decision routes. */
export const ExperienceErrorCodeSchema = z.enum([
    'unauthenticated',
    'identity_uncertain',
    'experience_conflict',
    'invalid_event',
]);
export const ExperienceErrorResponseSchema = z.strictObject({
    code: ExperienceErrorCodeSchema,
    message: z.string().min(1),
});
export const ExperienceConflictResponseSchema = ExperienceConflictSchema;
export const ExperienceKindSchema = z.enum(['run_outcome', 'authoritative_decision']);
export const ExperienceRecordStateSchema = z.enum(['current', 'superseded', 'revoked']);
/** Provenance filter: the run that produced an outcome or the decision it refers to. */
export const InternalMemoryExperienceQuerySchema = z.strictObject({
    tenantId: z.string().min(1),
    organizationId: z.string().min(1),
    recordId: z.string().min(1).optional(),
    kind: ExperienceKindSchema.optional(),
    runId: z.string().min(1).optional(),
    decisionRef: z.string().min(1).optional(),
    limit: z.number().int().min(1).max(200).default(50),
});
export const ExperienceRecordViewSchema = z.strictObject({
    recordId: z.string().min(1),
    kind: ExperienceKindSchema,
    /** Version in force for this record. */
    version: z.number().int().min(1),
    state: ExperienceRecordStateSchema,
    digest: z.string().regex(/^[0-9a-fA-F]{64}$/),
    occurredAt: z.iso.datetime(),
});
export const InternalMemoryExperienceQueryResponseSchema = z.strictObject({
    records: z.array(ExperienceRecordViewSchema),
});
export const internalMemoryExperienceContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_EXPERIENCE_PATH,
    authType: 'secret',
    bodySchema: InternalMemoryExperienceRequestSchema,
    responseSchema: InternalMemoryExperienceResponseSchema,
};
export const internalMemoryExperienceQueryContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_EXPERIENCE_QUERY_PATH,
    authType: 'secret',
    bodySchema: InternalMemoryExperienceQuerySchema,
    responseSchema: InternalMemoryExperienceQueryResponseSchema,
};
//# sourceMappingURL=internal-memory-experience.js.map