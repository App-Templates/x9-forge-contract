"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalMemoryKnowledgeWithdrawContract = exports.internalMemoryKnowledgePublishContract = exports.InternalMemoryKnowledgeErrorResponseSchema = exports.InternalMemoryKnowledgeReceiptSchema = exports.InternalMemoryKnowledgeWithdrawRequestSchema = exports.InternalMemoryKnowledgePublishRequestSchema = exports.INTERNAL_MEMORY_KNOWLEDGE_WITHDRAW_PATH = exports.INTERNAL_MEMORY_KNOWLEDGE_PUBLISH_PATH = void 0;
exports.isKnowledgePublishReceiptForRequest = isKnowledgePublishReceiptForRequest;
exports.isKnowledgeWithdrawReceiptForRequest = isKnowledgeWithdrawReceiptForRequest;
const zod_1 = require("zod");
const run_context_js_1 = require("../../organization/run-context.cjs");
const knowledge_publication_js_1 = require("../../organization/knowledge-publication.cjs");
const publication_ref_js_1 = require("../../organization/publication-ref.cjs");
exports.INTERNAL_MEMORY_KNOWLEDGE_PUBLISH_PATH = '/internal/memory/knowledge/publish';
exports.INTERNAL_MEMORY_KNOWLEDGE_WITHDRAW_PATH = '/internal/memory/knowledge/withdraw';
exports.InternalMemoryKnowledgePublishRequestSchema = zod_1.z.strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
    publication: knowledge_publication_js_1.KnowledgePublicationSchema,
});
exports.InternalMemoryKnowledgeWithdrawRequestSchema = zod_1.z.strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
    ref: publication_ref_js_1.PublicationRefSchema,
    reason: zod_1.z.string().min(1),
});
exports.InternalMemoryKnowledgeReceiptSchema = zod_1.z.strictObject({
    slug: zod_1.z.string().regex(/^[a-z0-9-]+$/),
    version: zod_1.z.number().int().min(1),
    digest: zod_1.z.string().regex(/^[0-9a-f]{64}$/),
    disposition: zod_1.z.enum(['stored', 'duplicate']),
});
/**
 * Check this result before advancing publication reconciliation in the consumer.
 * Correlation does not authenticate the receipt or prove permission to publish.
 */
function isKnowledgePublishReceiptForRequest(raw, expected) {
    const receipt = exports.InternalMemoryKnowledgeReceiptSchema.safeParse(raw);
    const request = exports.InternalMemoryKnowledgePublishRequestSchema.safeParse(expected);
    return receipt.success && request.success
        && receipt.data.slug === request.data.publication.ref.slug
        && receipt.data.version === request.data.publication.ref.version
        && receipt.data.digest === request.data.publication.ref.digest;
}
/**
 * Check this result before advancing withdrawal reconciliation in the consumer.
 * Correlation does not authenticate the receipt or prove permission to withdraw.
 */
function isKnowledgeWithdrawReceiptForRequest(raw, expected) {
    const receipt = exports.InternalMemoryKnowledgeReceiptSchema.safeParse(raw);
    const request = exports.InternalMemoryKnowledgeWithdrawRequestSchema.safeParse(expected);
    return receipt.success && request.success
        && receipt.data.slug === request.data.ref.slug
        && receipt.data.version === request.data.ref.version
        && receipt.data.digest === request.data.ref.digest;
}
exports.InternalMemoryKnowledgeErrorResponseSchema = zod_1.z.strictObject({
    status: zod_1.z.literal('error'),
    code: zod_1.z.enum(['invalid_publication', 'identity_uncertain', 'knowledge_conflict', 'supersedes_missing']),
    message: zod_1.z.string().min(1).optional(),
});
exports.internalMemoryKnowledgePublishContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_KNOWLEDGE_PUBLISH_PATH,
    authType: 'secret',
    bodySchema: exports.InternalMemoryKnowledgePublishRequestSchema,
    responseSchema: exports.InternalMemoryKnowledgeReceiptSchema,
};
exports.internalMemoryKnowledgeWithdrawContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_KNOWLEDGE_WITHDRAW_PATH,
    authType: 'secret',
    bodySchema: exports.InternalMemoryKnowledgeWithdrawRequestSchema,
    responseSchema: exports.InternalMemoryKnowledgeReceiptSchema,
};
//# sourceMappingURL=internal-memory-knowledge.js.map