import { z } from 'zod';
import { LabDossierSnapshotInputSchema, LabDossierSnapshotSchema } from "../../capability/lab/dossier.js";
import { OrganizationRunContextSchema } from "../../organization/run-context.js";
/** Named refusals of the dossier snapshot read. A refusal never carries a partial snapshot. */
export const LAB_DOSSIER_SNAPSHOT_ERRORS = [
    'scope_foreign',
    'dossier_empty',
    'cited_version_missing',
    'cited_version_ambiguous',
    'dossier_too_large',
    'snapshot_unavailable',
];
export const LabDossierSnapshotErrorCodeSchema = z.enum(LAB_DOSSIER_SNAPSHOT_ERRORS);
/** The signed run context names the organization; the dossier input must name the same one. */
export const InternalLabDossierSnapshotRequestSchema = z.strictObject({
    context: OrganizationRunContextSchema,
    input: LabDossierSnapshotInputSchema,
}).superRefine((request, ctx) => {
    if (request.context.organizationId !== request.input.organizationId) {
        ctx.addIssue({ code: 'custom', path: ['input', 'organizationId'], message: 'Dossier organization must match the run context' });
    }
});
/** The complete snapshot, or nothing: success never carries an error and never lists a part of the dossier. */
export const InternalLabDossierSnapshotResponseSchema = z.strictObject({
    ok: z.literal(true),
    snapshot: LabDossierSnapshotSchema,
});
export const InternalLabDossierSnapshotErrorSchema = z.strictObject({
    ok: z.literal(false),
    error: LabDossierSnapshotErrorCodeSchema,
    message: z.string().min(1).max(500).optional(),
});
export const internalLabDossierSnapshotPath = '/internal/capability/lab/dossier/snapshot';
/** Read the frozen dossier a Lab published for a client or project, under a signed run context. */
export const internalLabDossierSnapshotContract = {
    method: 'POST',
    path: internalLabDossierSnapshotPath,
    authType: 'secret',
    bodySchema: InternalLabDossierSnapshotRequestSchema,
    responseSchema: InternalLabDossierSnapshotResponseSchema,
    errorResponseSchema: InternalLabDossierSnapshotErrorSchema,
};
//# sourceMappingURL=internal-capability-lab-dossier.js.map