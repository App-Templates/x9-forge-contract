import { z } from 'zod';
import { CompanyMapEntryKindSchema } from "./company-map.js";
import { DecisionRequestIdSchema } from "./decision-request.js";
import { PublicationRefSchema } from "./publication-ref.js";
/** Lifecycle of a published piece of knowledge. */
export const KnowledgeStatusSchema = z.enum(['proposed', 'current', 'withdrawn']);
export const KnowledgeKindSchema = z.enum(['knowledge', 'decision', 'procedure']);
/** Proof a publication stands on: a reference with its digest, never content. */
export const KnowledgeEvidenceRefSchema = z.strictObject({
    kind: z.enum(['run_receipt', 'experience', 'decision', 'source']),
    id: z.string().min(1),
    digest: z.string().regex(/^[0-9a-f]{64}$/),
});
/** Typed target a page can contradict: an approved decision (with its plan version) or a map entry version. */
export const KnowledgeContradictionTargetSchema = z.discriminatedUnion('target', [
    z.strictObject({
        target: z.literal('decision'),
        requestId: DecisionRequestIdSchema,
        planVersion: z.number().int().min(1),
    }),
    z.strictObject({
        target: z.literal('map_entry'),
        kind: CompanyMapEntryKindSchema,
        key: z.string().min(1).max(64).regex(/^[A-Za-z0-9_-]+$/),
        version: z.number().int().min(1),
    }),
]);
/** What a publication contradicts: another page slug (as before) or a typed target. */
export const KnowledgeContradictionSchema = z.union([
    z.string().min(1).regex(/^[a-z0-9-]+$/),
    KnowledgeContradictionTargetSchema,
]);
/**
 * Publication of knowledge with provenance and version chain. Strict: no field
 * can enable tools or permissions.
 */
export const KnowledgePublicationSchema = z
    .strictObject({
    ref: PublicationRefSchema,
    kind: KnowledgeKindSchema,
    status: KnowledgeStatusSchema,
    evidence: z.array(KnowledgeEvidenceRefSchema).min(1),
    supersedes: z.number().int().min(1).optional(),
    validFrom: z.iso.datetime(),
    validUntil: z.iso.datetime().optional(),
    contradicts: z.array(KnowledgeContradictionSchema).max(50).optional(),
    reason: z.string().min(1).optional(),
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