"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectToolPermitSchema = exports.ConnectRevokeResponseSchema = exports.ConnectRevokeRequestSchema = exports.ConnectStateResponseSchema = exports.ConnectStatusSchema = exports.ConnectStartResponseSchema = exports.ConnectStartRequestSchema = exports.CONNECT_PERMIT_MAX_TTL_SECONDS = exports.CONNECT_LINK_LIMITS = exports.ConnectScopeSchema = exports.ConnectProviderSchema = void 0;
const zod_1 = require("zod");
/** Providers a person can connect (provider list is configuration; Google first). */
exports.ConnectProviderSchema = zod_1.z.enum(['google']);
/** Separate permissions for mailbox and Drive reading. `mail_draft` creates drafts, it never reads mail. */
exports.ConnectScopeSchema = zod_1.z.enum(['calendar_events', 'contacts_read', 'mail_send', 'mail_draft', 'mail_read', 'drive_read']);
/** One-time link limits: the link expires in 10 minutes. */
exports.CONNECT_LINK_LIMITS = { ttlSeconds: 600, stateBytes: 32 };
/** Maximum lifetime of a tool permit, in seconds. */
exports.CONNECT_PERMIT_MAX_TTL_SECONDS = 3600;
const ScopesSchema = zod_1.z.array(exports.ConnectScopeSchema).min(1).refine((scopes) => new Set(scopes).size === scopes.length, {
    message: 'Scopes must not contain duplicates',
});
const ScopesListSchema = zod_1.z.array(exports.ConnectScopeSchema).refine((scopes) => new Set(scopes).size === scopes.length, {
    message: 'Scopes must not contain duplicates',
});
const UnixSecondsSchema = zod_1.z.number().int().positive();
/** Request to start a connection from a conversation. */
exports.ConnectStartRequestSchema = zod_1.z.object({
    agentId: zod_1.z.string().min(1),
    personRef: zod_1.z.string().min(1),
    conversationId: zod_1.z.string().min(1),
    provider: exports.ConnectProviderSchema,
    scopes: ScopesSchema,
}).strict();
/** One-time https link, or an explicit failure reason. */
exports.ConnectStartResponseSchema = zod_1.z.discriminatedUnion('ok', [
    zod_1.z.object({
        ok: zod_1.z.literal(true),
        linkUrl: zod_1.z.string().url().refine((url) => url.startsWith('https://'), { message: 'Link must be https' }),
        expiresAt: UnixSecondsSchema,
    }).strict(),
    zod_1.z.object({ ok: zod_1.z.literal(false), error: zod_1.z.string().min(1).max(500) }).strict(),
]);
/** State of a connection. */
exports.ConnectStatusSchema = zod_1.z.enum(['not_connected', 'connected', 'needs_reconnect', 'revoked']);
/** Connection state; never carries a token, code or value. */
exports.ConnectStateResponseSchema = zod_1.z.object({
    agentId: zod_1.z.string().min(1),
    provider: exports.ConnectProviderSchema,
    status: exports.ConnectStatusSchema,
    accountLabel: zod_1.z.string().max(200).optional(),
    scopes: ScopesListSchema,
    connectedAt: UnixSecondsSchema.optional(),
}).strict();
/** Request to revoke a connection. */
exports.ConnectRevokeRequestSchema = zod_1.z.object({
    agentId: zod_1.z.string().min(1),
    provider: exports.ConnectProviderSchema,
}).strict();
/** Revocation result. */
exports.ConnectRevokeResponseSchema = zod_1.z.object({
    ok: zod_1.z.boolean(),
    status: exports.ConnectStatusSchema,
}).strict();
/** Time-limited permit for tools to use a connection. */
exports.ConnectToolPermitSchema = zod_1.z.object({
    agentId: zod_1.z.string().min(1),
    provider: exports.ConnectProviderSchema,
    scopes: ScopesSchema,
    issuedAt: UnixSecondsSchema,
    expiresAt: UnixSecondsSchema,
}).strict().refine((permit) => permit.expiresAt > permit.issuedAt && permit.expiresAt - permit.issuedAt <= exports.CONNECT_PERMIT_MAX_TTL_SECONDS, { message: `Permit lifetime must be between 1 and ${exports.CONNECT_PERMIT_MAX_TTL_SECONDS} seconds`, path: ['expiresAt'] });
__exportStar(require("./development-session.cjs"), exports);
__exportStar(require("./development-session-pairing.cjs"), exports);
__exportStar(require("./development-session-state.cjs"), exports);
//# sourceMappingURL=index.js.map