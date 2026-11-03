"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectReturnContract = exports.openConnectLinkContract = exports.ConnectReturnResponseSchema = exports.ConnectReturnErrorReasonSchema = exports.ConnectReturnQuerySchema = exports.OpenConnectLinkResponseSchema = exports.OpenConnectLinkErrorReasonSchema = exports.OpenConnectLinkParamsSchema = exports.CONNECT_RETURN_PATH = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../../capability/connect/index.cjs");
/**
 * Public pages of the Connessioni service (cap-connect), opened from a browser.
 * Auth: none. Safety comes from the one-time link token and the single-use
 * OAuth `state` (PKCE), not from the fleet secret.
 *
 * No response ever carries a Google code, access token or refresh token.
 */
/** Path of the Google return page; used to build the registered redirect URI. */
exports.CONNECT_RETURN_PATH = '/connect/return';
exports.OpenConnectLinkParamsSchema = zod_1.z.object({
    token: zod_1.z.string().min(32).max(128).regex(/^[A-Za-z0-9_-]+$/),
}).strict();
exports.OpenConnectLinkErrorReasonSchema = zod_1.z.enum(['expired', 'invalid', 'used']);
exports.OpenConnectLinkResponseSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.object({
        kind: zod_1.z.literal('redirect'),
        location: zod_1.z.string().url().refine((u) => u.startsWith('https://'), { message: 'location must be https' }),
    }).strict(),
    zod_1.z.object({
        kind: zod_1.z.literal('error'),
        reason: exports.OpenConnectLinkErrorReasonSchema,
    }).strict(),
]);
exports.ConnectReturnQuerySchema = zod_1.z.object({
    state: zod_1.z.string().min(32),
    code: zod_1.z.string().min(1).optional(),
    error: zod_1.z.string().min(1).optional(),
}).strict();
exports.ConnectReturnErrorReasonSchema = zod_1.z.enum([
    'invalid_state',
    'denied',
    'exchange_failed',
    'vault_error',
]);
exports.ConnectReturnResponseSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.object({
        kind: zod_1.z.literal('done'),
        accountLabel: zod_1.z.string().min(1).max(200).optional(),
        scopes: zod_1.z.array(index_js_1.ConnectScopeSchema),
    }).strict(),
    zod_1.z.object({
        kind: zod_1.z.literal('error'),
        reason: exports.ConnectReturnErrorReasonSchema,
    }).strict(),
]);
exports.openConnectLinkContract = {
    method: 'GET',
    path: '/connect/link/:token',
    authType: 'none',
    paramsSchema: exports.OpenConnectLinkParamsSchema,
    responseSchema: exports.OpenConnectLinkResponseSchema,
};
exports.connectReturnContract = {
    method: 'GET',
    path: exports.CONNECT_RETURN_PATH,
    authType: 'none',
    querySchema: exports.ConnectReturnQuerySchema,
    responseSchema: exports.ConnectReturnResponseSchema,
};
//# sourceMappingURL=connect-public.js.map