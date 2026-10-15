"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgePublicationSchema = exports.KnowledgeEvidenceRefSchema = exports.KnowledgeKindSchema = exports.KnowledgeStatusSchema = void 0;
const zod_1 = require("zod");
const publication_ref_js_1 = require("./publication-ref.cjs");
/** Lifecycle of a published piece of knowledge. */
exports.KnowledgeStatusSchema = zod_1.z.enum(['proposed', 'current', 'withdrawn']);
exports.KnowledgeKindSchema = zod_1.z.enum(['knowledge', 'decision', 'procedure']);
/** Proof a publication stands on: a reference with its digest, never content. */
exports.KnowledgeEvidenceRefSchema = zod_1.z.strictObject({
    kind: zod_1.z.enum(['run_receipt', 'experience', 'decision', 'source']),
    id: zod_1.z.string().min(1),
    digest: zod_1.z.string().regex(/^[0-9a-f]{64}$/),
});
/**
 * Publication of knowledge with provenance and version chain. Strict: no field
 * can enable tools or permissions.
 */
exports.KnowledgePublicationSchema = zod_1.z
    .strictObject({
    ref: publication_ref_js_1.PublicationRefSchema,
    kind: exports.KnowledgeKindSchema,
    status: exports.KnowledgeStatusSchema,
    evidence: zod_1.z.array(exports.KnowledgeEvidenceRefSchema).min(1),
    supersedes: zod_1.z.number().int().min(1).optional(),
    validFrom: zod_1.z.iso.datetime(),
    validUntil: zod_1.z.iso.datetime().optional(),
    contradicts: zod_1.z.array(zod_1.z.string().min(1).regex(/^[a-z0-9-]+$/)).optional(),
    reason: zod_1.z.string().min(1).optional(),
})
    .superRefine((pub, ctx) => {
    if (pub.supersedes !== undefined && pub.supersedes >= pub.ref.version) {
        ctx.addIssue({
            code: 'custom',
            message: 'supersedes must be lower than ref.version',
            path: ['supersedes'],
        });
    }
    if (pub.validUntil !== undefined && Date.parse(pub.validUntil) < Date.parse(pub.validFrom)) {
        ctx.addIssue({
            code: 'custom',
            message: 'validUntil must not precede validFrom',
            path: ['validUntil'],
        });
    }
    if (pub.status === 'withdrawn' && pub.reason === undefined) {
        ctx.addIssue({
            code: 'custom',
            message: 'A withdrawn publication requires a reason',
            path: ['reason'],
        });
    }
});
//# sourceMappingURL=knowledge-publication.js.map