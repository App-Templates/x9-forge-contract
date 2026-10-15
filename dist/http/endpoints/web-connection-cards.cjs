"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webConnectionCardsContract = exports.WebConnectionCardsNotFoundSchema = exports.WebConnectionCardsResponseSchema = exports.WebConnectionCardsQuerySchema = exports.WEB_CONNECTION_CARDS_PATH = void 0;
const zod_1 = require("zod");
const connection_card_js_1 = require("./connection-card.cjs");
exports.WEB_CONNECTION_CARDS_PATH = '/api/web/connection-cards';
exports.WebConnectionCardsQuerySchema = zod_1.z.strictObject({
    session_id: zod_1.z.string().min(1).max(256),
});
exports.WebConnectionCardsResponseSchema = zod_1.z.strictObject({
    cards: zod_1.z.array(connection_card_js_1.ConnectionCardEnvelopeSchema),
});
exports.WebConnectionCardsNotFoundSchema = zod_1.z.strictObject({
    error: zod_1.z.literal('not_found'),
});
exports.webConnectionCardsContract = {
    method: 'GET',
    path: exports.WEB_CONNECTION_CARDS_PATH,
    querySchema: exports.WebConnectionCardsQuerySchema,
    responseSchema: exports.WebConnectionCardsResponseSchema,
    notFoundSchema: exports.WebConnectionCardsNotFoundSchema,
};
//# sourceMappingURL=web-connection-cards.js.map