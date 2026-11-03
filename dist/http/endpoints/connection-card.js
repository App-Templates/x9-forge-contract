import { z } from 'zod';
import { ConnectProviderSchema, ConnectScopeSchema } from "../../capability/connect/index.js";
/**
 * "Scheda di collegamento": typed artifact carried in a tool result, in the
 * turn response and in web events. It never carries a token, permit or secret.
 */
export const ConnectionCardStateSchema = z.enum(['pending', 'connected', 'denied', 'expired', 'revoked']);
export const ConnectionCardSchema = z.object({
    cardId: z.string().min(1).max(200),
    provider: ConnectProviderSchema,
    permissions: z.array(ConnectScopeSchema).refine((scopes) => new Set(scopes).size === scopes.length, {
        message: 'Permissions must not contain duplicates',
    }),
    url: z.string().url().max(2048).refine((value) => value.startsWith('https://'), {
        message: 'url must be https',
    }),
    expiresAt: z.number().int().positive(),
    state: ConnectionCardStateSchema,
    reason: z.string().min(1).max(500),
}).strict();
export const CONNECTION_CARD_ENVELOPE_TYPE = 'connection_card';
export const ConnectionCardEnvelopeSchema = z.object({
    type: z.literal(CONNECTION_CARD_ENVELOPE_TYPE),
    card: ConnectionCardSchema,
}).strict();
/** Returns the envelope when `value` is a valid connection card, otherwise null. */
export function parseConnectionCardEnvelope(value) {
    const parsed = ConnectionCardEnvelopeSchema.safeParse(value);
    return parsed.success ? parsed.data : null;
}
//# sourceMappingURL=connection-card.js.map