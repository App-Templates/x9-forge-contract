import { z } from 'zod';
import { OrganizationRunContextSchema } from '../../organization/run-context.js';
import { KnowledgePublicationSchema } from '../../organization/knowledge-publication.js';
import { PublicationRefSchema } from '../../organization/publication-ref.js';

export const INTERNAL_MEMORY_KNOWLEDGE_PUBLISH_PATH = '/internal/memory/knowledge/publish' as const;
export const INTERNAL_MEMORY_KNOWLEDGE_WITHDRAW_PATH = '/internal/memory/knowledge/withdraw' as const;

export const InternalMemoryKnowledgePublishRequestSchema = z.strictObject({
  context: OrganizationRunContextSchema,
  publication: KnowledgePublicationSchema,
});
export type InternalMemoryKnowledgePublishRequest = z.infer<typeof InternalMemoryKnowledgePublishRequestSchema>;

export const InternalMemoryKnowledgeWithdrawRequestSchema = z.strictObject({
  context: OrganizationRunContextSchema,
  ref: PublicationRefSchema,
  reason: z.string().min(1),
});
export type InternalMemoryKnowledgeWithdrawRequest = z.infer<typeof InternalMemoryKnowledgeWithdrawRequestSchema>;

export const InternalMemoryKnowledgeReceiptSchema = z.strictObject({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  version: z.number().int().min(1),
  digest: z.string().regex(/^[0-9a-f]{64}$/),
  disposition: z.enum(['stored', 'duplicate']),
});
export type InternalMemoryKnowledgeReceipt = z.infer<typeof InternalMemoryKnowledgeReceiptSchema>;

export const InternalMemoryKnowledgeErrorResponseSchema = z.strictObject({
  status: z.literal('error'),
  code: z.enum(['invalid_publication', 'identity_uncertain', 'knowledge_conflict', 'supersedes_missing']),
  message: z.string().min(1).optional(),
});
export type InternalMemoryKnowledgeErrorResponse = z.infer<typeof InternalMemoryKnowledgeErrorResponseSchema>;

export const internalMemoryKnowledgePublishContract = {
  method: 'POST' as const,
  path: INTERNAL_MEMORY_KNOWLEDGE_PUBLISH_PATH,
  authType: 'secret' as const,
  bodySchema: InternalMemoryKnowledgePublishRequestSchema,
  responseSchema: InternalMemoryKnowledgeReceiptSchema,
} as const;

export const internalMemoryKnowledgeWithdrawContract = {
  method: 'POST' as const,
  path: INTERNAL_MEMORY_KNOWLEDGE_WITHDRAW_PATH,
  authType: 'secret' as const,
  bodySchema: InternalMemoryKnowledgeWithdrawRequestSchema,
  responseSchema: InternalMemoryKnowledgeReceiptSchema,
} as const;
