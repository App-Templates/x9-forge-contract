import { z } from 'zod';
import { ConnectionCardEnvelopeSchema } from './connection-card.js';

export const WEB_CONNECTION_CARDS_PATH = '/api/web/connection-cards' as const;

export const WebConnectionCardsQuerySchema = z.strictObject({
  session_id: z.string().min(1).max(256),
});
export type WebConnectionCardsQuery = z.infer<typeof WebConnectionCardsQuerySchema>;

export const WebConnectionCardsResponseSchema = z.strictObject({
  cards: z.array(ConnectionCardEnvelopeSchema),
});
export type WebConnectionCardsResponse = z.infer<typeof WebConnectionCardsResponseSchema>;

export const WebConnectionCardsNotFoundSchema = z.strictObject({
  error: z.literal('not_found'),
});
export type WebConnectionCardsNotFound = z.infer<typeof WebConnectionCardsNotFoundSchema>;

export const webConnectionCardsContract = {
  method: 'GET' as const,
  path: WEB_CONNECTION_CARDS_PATH,
  querySchema: WebConnectionCardsQuerySchema,
  responseSchema: WebConnectionCardsResponseSchema,
  notFoundSchema: WebConnectionCardsNotFoundSchema,
} as const;
