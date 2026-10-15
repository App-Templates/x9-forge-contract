import { z } from 'zod';
import {
  ExperienceConflictSchema,
  ExperienceReceiptSchema,
  OrganizationExperienceEventSchema,
} from '../../organization/experience.js';

/**
 * POST /internal/memory/experience — ingest of one organization experience event.
 * POST /internal/memory/experience/query — structured read of stored experience.
 * Direction: X9 internal (agent-core / consumers -> memory-svc)
 * Auth: internal secret (INTERNAL_SECRET_HEADER)
 *
 * Ingest is idempotent: same recordId+version+digest answers 200 `duplicate`;
 * same recordId+version with another digest answers 409 `experience_conflict`.
 */

export const INTERNAL_MEMORY_EXPERIENCE_PATH = '/internal/memory/experience' as const;
export const INTERNAL_MEMORY_EXPERIENCE_QUERY_PATH = '/internal/memory/experience/query' as const;

export const InternalMemoryExperienceRequestSchema = OrganizationExperienceEventSchema;
export type InternalMemoryExperienceRequest = z.infer<typeof InternalMemoryExperienceRequestSchema>;

export const InternalMemoryExperienceResponseSchema = ExperienceReceiptSchema;
export type InternalMemoryExperienceResponse = z.infer<typeof InternalMemoryExperienceResponseSchema>;

/** Named failures shared by the experience and decision routes. */
export const ExperienceErrorCodeSchema = z.enum([
  'unauthenticated',
  'identity_uncertain',
  'experience_conflict',
  'invalid_event',
]);
export type ExperienceErrorCode = z.infer<typeof ExperienceErrorCodeSchema>;

export const ExperienceErrorResponseSchema = z.strictObject({
  code: ExperienceErrorCodeSchema,
  message: z.string().min(1),
});
export type ExperienceErrorResponse = z.infer<typeof ExperienceErrorResponseSchema>;

export const ExperienceConflictResponseSchema = ExperienceConflictSchema;

export const ExperienceKindSchema = z.enum(['run_outcome', 'authoritative_decision']);
export type ExperienceKind = z.infer<typeof ExperienceKindSchema>;

export const ExperienceRecordStateSchema = z.enum(['current', 'superseded', 'revoked']);
export type ExperienceRecordState = z.infer<typeof ExperienceRecordStateSchema>;

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
export type InternalMemoryExperienceQuery = z.infer<typeof InternalMemoryExperienceQuerySchema>;

export const ExperienceRecordViewSchema = z.strictObject({
  recordId: z.string().min(1),
  kind: ExperienceKindSchema,
  /** Version in force for this record. */
  version: z.number().int().min(1),
  state: ExperienceRecordStateSchema,
  digest: z.string().regex(/^[0-9a-fA-F]{64}$/),
  occurredAt: z.iso.datetime(),
});
export type ExperienceRecordView = z.infer<typeof ExperienceRecordViewSchema>;

export const InternalMemoryExperienceQueryResponseSchema = z.strictObject({
  records: z.array(ExperienceRecordViewSchema),
});
export type InternalMemoryExperienceQueryResponse = z.infer<
  typeof InternalMemoryExperienceQueryResponseSchema
>;

export const internalMemoryExperienceContract = {
  method: 'POST' as const,
  path: INTERNAL_MEMORY_EXPERIENCE_PATH,
  authType: 'secret' as const,
  bodySchema: InternalMemoryExperienceRequestSchema,
  responseSchema: InternalMemoryExperienceResponseSchema,
} as const;

export const internalMemoryExperienceQueryContract = {
  method: 'POST' as const,
  path: INTERNAL_MEMORY_EXPERIENCE_QUERY_PATH,
  authType: 'secret' as const,
  bodySchema: InternalMemoryExperienceQuerySchema,
  responseSchema: InternalMemoryExperienceQueryResponseSchema,
} as const;
