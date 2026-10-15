"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionCardEnvelopeSchema = exports.CONNECTION_CARD_ENVELOPE_TYPE = exports.ConnectionCardSchema = exports.ConnectionCardStateSchema = void 0;
exports.parseConnectionCardEnvelope = parseConnectionCardEnvelope;
const zod_1 = require("zod");
const index_js_1 = require("../../capability/connect/index.cjs");
/**
 * "Scheda di collegamento": typed artifact carried in a tool result, in the
 * turn response and in web events. It never carries a token, permit or secret.
 */
exports.ConnectionCardStateSchema = zod_1.z.enum(['pending', 'connected', 'denied', 'expired', 'revoked']);
exports.ConnectionCardSchema = zod_1.z.object({
    cardId: zod_1.z.string().min(1).max(200),
    provider: index_js_1.ConnectProviderSchema,
    permissions: zod_1.z.array(index_js_1.ConnectScopeSchema).refine((scopes) => new Set(scopes).size === scopes.length, {
        message: 'Permissions must not contain duplicates',
    }),
    url: zod_1.z.string().url().max(2048).refine((value) => value.startsWith('https://'), {
        message: 'url must be https',
    }),
    expiresAt: zod_1.z.number().int().positive(),
    state: exports.ConnectionCardStateSchema,
    reason: zod_1.z.string().min(1).max(500),
}).strict();
exports.CONNECTION_CARD_ENVELOPE_TYPE = 'connection_card';
exports.ConnectionCardEnvelopeSchema = zod_1.z.object({
    type: zod_1.z.literal(exports.CONNECTION_CARD_ENVELOPE_TYPE),
    card: exports.ConnectionCardSchema,
}).strict();
/** Returns the envelope when `value` is a valid connection card, otherwise null. */
function parseConnectionCardEnvelope(value) {
    const parsed = exports.ConnectionCardEnvelopeSchema.safeParse(value);
    return parsed.success ? parsed.data : null;
}
//# sourceMappingURL=connection-card.js.map