"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalLabDossierSnapshotContract = exports.internalLabDossierSnapshotPath = exports.InternalLabDossierSnapshotErrorSchema = exports.InternalLabDossierSnapshotResponseSchema = exports.InternalLabDossierSnapshotRequestSchema = exports.LabDossierSnapshotErrorCodeSchema = exports.LAB_DOSSIER_SNAPSHOT_ERRORS = void 0;
const zod_1 = require("zod");
const dossier_js_1 = require("../../capability/lab/dossier.cjs");
const run_context_js_1 = require("../../organization/run-context.cjs");
/** Named refusals of the dossier snapshot read. A refusal never carries a partial snapshot. */
exports.LAB_DOSSIER_SNAPSHOT_ERRORS = [
    'scope_foreign',
    'dossier_empty',
    'cited_version_missing',
    'cited_version_ambiguous',
    'dossier_too_large',
    'snapshot_unavailable',
];
exports.LabDossierSnapshotErrorCodeSchema = zod_1.z.enum(exports.LAB_DOSSIER_SNAPSHOT_ERRORS);
/**
 * The signed run context names the organization; the dossier input must name the same one.
 * The input is either the historical complete one or, additively, references only: no photograph owned by the caller.
 */
exports.InternalLabDossierSnapshotRequestSchema = zod_1.z.strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
    input: zod_1.z.union([dossier_js_1.LabDossierSnapshotInputSchema, dossier_js_1.LabDossierReferenceRequestSchema]),
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
/** The complete snapshot, or nothing: success never carries an error and never lists a part of the dossier. */
exports.InternalLabDossierSnapshotResponseSchema = zod_1.z.strictObject({
    ok: zod_1.z.literal(true),
    snapshot: dossier_js_1.LabDossierSnapshotSchema,
});
exports.InternalLabDossierSnapshotErrorSchema = zod_1.z.strictObject({
    ok: zod_1.z.literal(false),
    error: exports.LabDossierSnapshotErrorCodeSchema,
    message: zod_1.z.string().min(1).max(500).optional(),
});
exports.internalLabDossierSnapshotPath = '/internal/capability/lab/dossier/snapshot';
/** Read the frozen dossier a Lab published for a client or project, under a signed run context. */
exports.internalLabDossierSnapshotContract = {
    method: 'POST',
    path: exports.internalLabDossierSnapshotPath,
    authType: 'secret',
    bodySchema: exports.InternalLabDossierSnapshotRequestSchema,
    responseSchema: exports.InternalLabDossierSnapshotResponseSchema,
    errorResponseSchema: exports.InternalLabDossierSnapshotErrorSchema,
};
//# sourceMappingURL=internal-capability-lab-dossier.js.map