import { z } from 'zod';
import { AgentChannelEmailAddressSchema } from '../../agent/agent-channel-access.js';
import { CapabilityAgentScopeSchema } from '../../capability/capability-call-context.js';
import { ProjectIdSchema } from './internal-project-create.js';

/** Lifetime of a «parlane a voce» link; same as DEV_DELIVERY_LINK_TTL_MS. */
export const COLLOQUIO_LINK_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const COLLOQUIO_TOPIC_SUBJECT_MAX = 300;
export const COLLOQUIO_TOPIC_EXCERPT_MAX = 500;
export const COLLOQUIO_LINK_CODE_PATTERN = /^[A-Za-z0-9]{11}$/;
export const COLLOQUIO_LINK_REFUSALS = ['capability_disabled', 'identity_mismatch', 'recipient_not_referente', 'unavailable'] as const;

// Same limits as the mail references of a decision request.
const MailRefSchema = z.string().min(1).max(998).refine((v) => v.trim().length > 0, 'Non-blank reference required');

// References cap-email already knows BEFORE sending the mail.
const ColloquioEmailRefSchema = z.strictObject({
  threadKey: MailRefSchema.optional(),
  messageId: MailRefSchema.optional(),
}).refine((email) => email.threadKey !== undefined || email.messageId !== undefined, 'Thread key or message id required');

const ColloquioTopicSchema = z.strictObject({
  subject: z.string().trim().min(1).max(COLLOQUIO_TOPIC_SUBJECT_MAX),
  excerpt: z.string().trim().min(1).max(COLLOQUIO_TOPIC_EXCERPT_MAX).optional(),
});

export const ColloquioLinkRequestSchema = z.strictObject({
  scope: CapabilityAgentScopeSchema,
  recipient: AgentChannelEmailAddressSchema,
  email: ColloquioEmailRefSchema,
  projectId: ProjectIdSchema.optional(),
  topic: ColloquioTopicSchema,
});
export type ColloquioLinkRequest = z.infer<typeof ColloquioLinkRequestSchema>;

export const ColloquioLinkResponseSchema = z.strictObject({
  url: z.url().refine((url) => url.startsWith('https://'), 'https only'),
  code: z.string().regex(COLLOQUIO_LINK_CODE_PATTERN),
  expiresAt: z.iso.datetime({ offset: true }),
});
export type ColloquioLinkResponse = z.infer<typeof ColloquioLinkResponseSchema>;

export const ColloquioLinkRefusalSchema = z.strictObject({ error: z.enum(COLLOQUIO_LINK_REFUSALS) });
export type ColloquioLinkRefusal = z.infer<typeof ColloquioLinkRefusalSchema>;

/**
 * Link «parlane a voce» for the referent of a mail: cap-email asks cap-colloquio.
 * cap-email calls with the bridge INTERNAL_SECRET_HEADER header (never a literal).
 * cap-colloquio compares `scope` with `params.agentId` and with the capability
 * context of the agent (sameCapabilityScope, R-33): the body is a declaration to
 * verify. A disabled or not installed capability answers `capability_disabled`;
 * a recipient that is not the referent of the project/thread answers
 * `recipient_not_referente`. The link is valid for COLLOQUIO_LINK_TTL_MS
 * (30 days, as DEV_DELIVERY_LINK_TTL_MS). For cap-email a refusal, a response that
 * does not parse or a network error mean only «no link»: the mail goes out unchanged.
 */
export const colloquioLinkContract = {
  method: 'POST',
  path: '/internal/capability/agents/:agentId/colloquio/links',
  authType: 'secret',
  paramsSchema: z.strictObject({ agentId: CapabilityAgentScopeSchema.shape.agentId }),
  bodySchema: ColloquioLinkRequestSchema,
  responseSchema: ColloquioLinkResponseSchema,
  refusalSchema: ColloquioLinkRefusalSchema,
} as const;
