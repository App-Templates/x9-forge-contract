"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalMemoryExperienceQueryContract = exports.internalMemoryExperienceContract = exports.InternalMemoryExperienceQueryResponseSchema = exports.ExperienceRecordViewSchema = exports.InternalMemoryExperienceQuerySchema = exports.ExperienceRecordStateSchema = exports.ExperienceKindSchema = exports.ExperienceConflictResponseSchema = exports.ExperienceErrorResponseSchema = exports.ExperienceErrorCodeSchema = exports.InternalMemoryExperienceResponseSchema = exports.InternalMemoryExperienceRequestSchema = exports.INTERNAL_MEMORY_EXPERIENCE_QUERY_PATH = exports.INTERNAL_MEMORY_EXPERIENCE_PATH = void 0;
const zod_1 = require("zod");
const experience_js_1 = require("../../organization/experience.cjs");
/**
 * POST /internal/memory/experience — ingest of one organization experience event.
 * POST /internal/memory/experience/query — structured read of stored experience.
 * Direction: X9 internal (agent-core / consumers -> memory-svc)
 * Auth: internal secret (INTERNAL_SECRET_HEADER)
 *
 * Ingest is idempotent: same recordId+version+digest answers 200 `duplicate`;
 * same recordId+version with another digest answers 409 `experience_conflict`.
 */
exports.INTERNAL_MEMORY_EXPERIENCE_PATH = '/internal/memory/experience';
exports.INTERNAL_MEMORY_EXPERIENCE_QUERY_PATH = '/internal/memory/experience/query';
exports.InternalMemoryExperienceRequestSchema = experience_js_1.OrganizationExperienceEventSchema;
exports.InternalMemoryExperienceResponseSchema = experience_js_1.ExperienceReceiptSchema;
/** Named failures shared by the experience and decision routes. */
exports.ExperienceErrorCodeSchema = zod_1.z.enum([
    'unauthenticated',
    'identity_uncertain',
    'experience_conflict',
    'invalid_event',
]);
exports.ExperienceErrorResponseSchema = zod_1.z.strictObject({
    code: exports.ExperienceErrorCodeSchema,
    message: zod_1.z.string().min(1),
});
exports.ExperienceConflictResponseSchema = experience_js_1.ExperienceConflictSchema;
exports.ExperienceKindSchema = zod_1.z.enum(['run_outcome', 'authoritative_decision']);
exports.ExperienceRecordStateSchema = zod_1.z.enum(['current', 'superseded', 'revoked']);
/** Provenance filter: the run that produced an outcome or the decision it refers to. */
exports.InternalMemoryExperienceQuerySchema = zod_1.z.strictObject({
    tenantId: zod_1.z.string().min(1),
    organizationId: zod_1.z.string().min(1),
    recordId: zod_1.z.string().min(1).optional(),
    kind: exports.ExperienceKindSchema.optional(),
    runId: zod_1.z.string().min(1).optional(),
    decisionRef: zod_1.z.string().min(1).optional(),
    limit: zod_1.z.number().int().min(1).max(200).default(50),
});
exports.ExperienceRecordViewSchema = zod_1.z.strictObject({
    recordId: zod_1.z.string().min(1),
    kind: exports.ExperienceKindSchema,
    /** Version in force for this record. */
    version: zod_1.z.number().int().min(1),
    state: exports.ExperienceRecordStateSchema,
    digest: zod_1.z.string().regex(/^[0-9a-fA-F]{64}$/),
    occurredAt: zod_1.z.iso.datetime(),
});
exports.InternalMemoryExperienceQueryResponseSchema = zod_1.z.strictObject({
    records: zod_1.z.array(exports.ExperienceRecordViewSchema),
});
exports.internalMemoryExperienceContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_EXPERIENCE_PATH,
    authType: 'secret',
    bodySchema: exports.InternalMemoryExperienceRequestSchema,
    responseSchema: exports.InternalMemoryExperienceResponseSchema,
};
exports.internalMemoryExperienceQueryContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_EXPERIENCE_QUERY_PATH,
    authType: 'secret',
    bodySchema: exports.InternalMemoryExperienceQuerySchema,
    responseSchema: exports.InternalMemoryExperienceQueryResponseSchema,
};
//# sourceMappingURL=internal-memory-experience.js.map