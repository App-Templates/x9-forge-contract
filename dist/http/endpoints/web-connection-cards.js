import { z } from 'zod';
import { ConnectionCardEnvelopeSchema } from "./connection-card.js";
export const WEB_CONNECTION_CARDS_PATH = '/api/web/connection-cards';
export const WebConnectionCardsQuerySchema = z.strictObject({
    session_id: z.string().min(1).max(256),
});
export const WebConnectionCardsResponseSchema = z.strictObject({
    cards: z.array(ConnectionCardEnvelopeSchema),
});
export const WebConnectionCardsNotFoundSchema = z.strictObject({
    error: z.literal('not_found'),
});
export const webConnectionCardsContract = {
    method: 'GET',
    path: WEB_CONNECTION_CARDS_PATH,
    querySchema: WebConnectionCardsQuerySchema,
    responseSchema: WebConnectionCardsResponseSchema,
    notFoundSchema: WebConnectionCardsNotFoundSchema,
};
//# sourceMappingURL=web-connection-cards.js.map