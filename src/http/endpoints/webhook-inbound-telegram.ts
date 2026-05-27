import { z } from 'zod';
import { IncomingMessageEnvelopeSchema } from '../../messaging/incoming-message-envelope.js';

/**
 * POST /webhook/inbound/telegram — Telegram bot update receiver, mounted on
 * the Phase 11 `telegram-router-svc`. Telegram delivers a raw `Update`
 * object via long-poll OR webhook (router-svc supports both modes
 * internally); after grammy validates the secret-token header
 * (`X-Telegram-Bot-Api-Secret-Token`), the update is normalized into an
 * `IncomingMessageEnvelope` and forwarded to agent-core
 * `/internal/turn` for processing.
 *
 * Direction:   Telegram → X9 telegram-router-svc
 * Auth:        `external_provider` — secret-token header set by Telegram
 *              per-bot via setWebhook `secret_token` param (NOT bridge-typed
 *              because it's a provider-set header, not an X9 internal token;
 *              dilutes Bug #15 semantics to reuse `'token'` here).
 * Body:        Raw Telegram `Update` JSON (`z.unknown()` — lenient external
 *              shape; router-svc narrows internally via grammy types).
 * Response:    `{ received: true }` — fire-and-forget; the actual agent
 *              turn happens asynchronously inside router-svc.
 *
 * This endpoint contract is REGISTERED in the bridge so consumers (router-svc,
 * any future inspector) share the path constant + response shape, but the
 * body remains lenient because Telegram's `Update` schema is sprawling and
 * evolves quickly.
 */
export const WebhookInboundTelegramRequestSchema = z.unknown();

export const WebhookInboundTelegramResponseSchema = z.object({
  received: z.literal(true),
});
export type WebhookInboundTelegramResponse = z.infer<typeof WebhookInboundTelegramResponseSchema>;

/**
 * Optional STRICT shape that router-svc uses INTERNALLY after normalization
 * (re-exported for symmetry with the email contract — not the wire body).
 */
export const WebhookInboundTelegramNormalizedSchema = IncomingMessageEnvelopeSchema;
export type WebhookInboundTelegramNormalized = z.infer<
  typeof WebhookInboundTelegramNormalizedSchema
>;

export const webhookInboundTelegramContract = {
  method: 'POST' as const,
  path: '/webhook/inbound/telegram' as const,
  /** Telegram's secret-token header — provider-managed, not bridge-typed. */
  authType: 'external_provider' as const,
  bodySchema: WebhookInboundTelegramRequestSchema,
  responseSchema: WebhookInboundTelegramResponseSchema,
} as const;
