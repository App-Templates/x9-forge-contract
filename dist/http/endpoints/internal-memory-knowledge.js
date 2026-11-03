import { z } from 'zod';
import { OrganizationRunContextSchema } from "../../organization/run-context.js";
import { KnowledgePublicationSchema } from "../../organization/knowledge-publication.js";
import { PublicationRefSchema } from "../../organization/publication-ref.js";
export const INTERNAL_MEMORY_KNOWLEDGE_PUBLISH_PATH = '/internal/memory/knowledge/publish';
export const INTERNAL_MEMORY_KNOWLEDGE_WITHDRAW_PATH = '/internal/memory/knowledge/withdraw';
export const InternalMemoryKnowledgePublishRequestSchema = z.strictObject({
    context: OrganizationRunContextSchema,
    publication: KnowledgePublicationSchema,
});
export const InternalMemoryKnowledgeWithdrawRequestSchema = z.strictObject({
    context: OrganizationRunContextSchema,
    ref: PublicationRefSchema,
    reason: z.string().min(1),
});
export const InternalMemoryKnowledgeReceiptSchema = z.strictObject({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    version: z.number().int().min(1),
    digest: z.string().regex(/^[0-9a-f]{64}$/),
    disposition: z.enum(['stored', 'duplicate']),
});
/**
 * Check this result before advancing publication reconciliation in the consumer.
 * Correlation does not authenticate the receipt or prove permission to publish.
 */
export function isKnowledgePublishReceiptForRequest(raw, expected) {
    const receipt = InternalMemoryKnowledgeReceiptSchema.safeParse(raw);
    const request = InternalMemoryKnowledgePublishRequestSchema.safeParse(expected);
    return receipt.success && request.success
        && receipt.data.slug === request.data.publication.ref.slug
        && receipt.data.version === request.data.publication.ref.version
        && receipt.data.digest === request.data.publication.ref.digest;
}
/**
 * Check this result before advancing withdrawal reconciliation in the consumer.
 * Correlation does not authenticate the receipt or prove permission to withdraw.
 */
export function isKnowledgeWithdrawReceiptForRequest(raw, expected) {
    const receipt = InternalMemoryKnowledgeReceiptSchema.safeParse(raw);
    const request = InternalMemoryKnowledgeWithdrawRequestSchema.safeParse(expected);
    return receipt.success && request.success
        && receipt.data.slug === request.data.ref.slug
        && receipt.data.version === request.data.ref.version
        && receipt.data.digest === request.data.ref.digest;
}
export const InternalMemoryKnowledgeErrorResponseSchema = z.strictObject({
    status: z.literal('error'),
    code: z.enum(['invalid_publication', 'identity_uncertain', 'knowledge_conflict', 'supersedes_missing']),
    message: z.string().min(1).optional(),
});
export const internalMemoryKnowledgePublishContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_KNOWLEDGE_PUBLISH_PATH,
    authType: 'secret',
    bodySchema: InternalMemoryKnowledgePublishRequestSchema,
    responseSchema: InternalMemoryKnowledgeReceiptSchema,
};
export const internalMemoryKnowledgeWithdrawContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_KNOWLEDGE_WITHDRAW_PATH,
    authType: 'secret',
    bodySchema: InternalMemoryKnowledgeWithdrawRequestSchema,
    responseSchema: InternalMemoryKnowledgeReceiptSchema,
};
//# sourceMappingURL=internal-memory-knowledge.js.map