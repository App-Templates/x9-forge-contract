import { z } from 'zod';
import {
  LabDossierReferenceRequestSchema,
  LabDossierSnapshotInputSchema,
  LabDossierSnapshotSchema,
} from '../../capability/lab/dossier.js';
import { OrganizationRunContextSchema } from '../../organization/run-context.js';

/** Named refusals of the dossier snapshot read. A refusal never carries a partial snapshot. */
export const LAB_DOSSIER_SNAPSHOT_ERRORS = [
  'scope_foreign',
  'dossier_empty',
  'cited_version_missing',
  'cited_version_ambiguous',
  'dossier_too_large',
  'snapshot_unavailable',
] as const;
export const LabDossierSnapshotErrorCodeSchema = z.enum(LAB_DOSSIER_SNAPSHOT_ERRORS);
export type LabDossierSnapshotErrorCode = z.infer<typeof LabDossierSnapshotErrorCodeSchema>;

/**
 * The signed run context names the organization; the dossier input must name the same one.
 * The input is either the historical complete one or, additively, references only: no photograph owned by the caller.
 */
export const InternalLabDossierSnapshotRequestSchema = z.strictObject({
  context: OrganizationRunContextSchema,
  input: z.union([LabDossierSnapshotInputSchema, LabDossierReferenceRequestSchema]),
}).superRefine((request, ctx) => {
  const byReferences = 'references' in request.input;
  const references = 'references' in request.input ? request.input.references : request.input;
  if (request.context.organizationId !== references['organizationId']) {
    ctx.addIssue({
      code: 'custom',
      path: byReferences ? ['input', 'references', 'organizationId'] : ['input', 'organizationId'],
      message: 'Dossier organization must match the run context',
    });
  }
});
export type InternalLabDossierSnapshotRequest = z.infer<typeof InternalLabDossierSnapshotRequestSchema>;

/** The complete snapshot, or nothing: success never carries an error and never lists a part of the dossier. */
export const InternalLabDossierSnapshotResponseSchema = z.strictObject({
  ok: z.literal(true),
  snapshot: LabDossierSnapshotSchema,
});
export type InternalLabDossierSnapshotResponse = z.infer<typeof InternalLabDossierSnapshotResponseSchema>;

export const InternalLabDossierSnapshotErrorSchema = z.strictObject({
  ok: z.literal(false),
  error: LabDossierSnapshotErrorCodeSchema,
  message: z.string().min(1).max(500).optional(),
});
export type InternalLabDossierSnapshotError = z.infer<typeof InternalLabDossierSnapshotErrorSchema>;

export const internalLabDossierSnapshotPath = '/internal/capability/lab/dossier/snapshot';

/** Read the frozen dossier a Lab published for a client or project, under a signed run context. */
export const internalLabDossierSnapshotContract = {
  method: 'POST',
  path: internalLabDossierSnapshotPath,
  authType: 'secret',
  bodySchema: InternalLabDossierSnapshotRequestSchema,
  responseSchema: InternalLabDossierSnapshotResponseSchema,
  errorResponseSchema: InternalLabDossierSnapshotErrorSchema,
} as const;
