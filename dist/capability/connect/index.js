import { z } from 'zod';
/** Providers a person can connect (provider list is configuration; Google first). */
export const ConnectProviderSchema = z.enum(['google']);
/** Separate permissions for mailbox and Drive reading. `mail_draft` creates drafts, it never reads mail. */
export const ConnectScopeSchema = z.enum(['calendar_events', 'contacts_read', 'mail_send', 'mail_draft', 'mail_read', 'drive_read']);
/** One-time link limits: the link expires in 10 minutes. */
export const CONNECT_LINK_LIMITS = { ttlSeconds: 600, stateBytes: 32 };
/** Maximum lifetime of a tool permit, in seconds. */
export const CONNECT_PERMIT_MAX_TTL_SECONDS = 3600;
const ScopesSchema = z.array(ConnectScopeSchema).min(1).refine((scopes) => new Set(scopes).size === scopes.length, {
    message: 'Scopes must not contain duplicates',
});
const ScopesListSchema = z.array(ConnectScopeSchema).refine((scopes) => new Set(scopes).size === scopes.length, {
    message: 'Scopes must not contain duplicates',
});
const UnixSecondsSchema = z.number().int().positive();
/** Request to start a connection from a conversation. */
export const ConnectStartRequestSchema = z.object({
    agentId: z.string().min(1),
    personRef: z.string().min(1),
    conversationId: z.string().min(1),
    provider: ConnectProviderSchema,
    scopes: ScopesSchema,
}).strict();
/** One-time https link, or an explicit failure reason. */
export const ConnectStartResponseSchema = z.discriminatedUnion('ok', [
    z.object({
        ok: z.literal(true),
        linkUrl: z.string().url().refine((url) => url.startsWith('https://'), { message: 'Link must be https' }),
        expiresAt: UnixSecondsSchema,
    }).strict(),
    z.object({ ok: z.literal(false), error: z.string().min(1).max(500) }).strict(),
]);
/** State of a connection. */
export const ConnectStatusSchema = z.enum(['not_connected', 'connected', 'needs_reconnect', 'revoked']);
/** Connection state; never carries a token, code or value. */
export const ConnectStateResponseSchema = z.object({
    agentId: z.string().min(1),
    provider: ConnectProviderSchema,
    status: ConnectStatusSchema,
    accountLabel: z.string().max(200).optional(),
    scopes: ScopesListSchema,
    connectedAt: UnixSecondsSchema.optional(),
}).strict();
/** Request to revoke a connection. */
export const ConnectRevokeRequestSchema = z.object({
    agentId: z.string().min(1),
    provider: ConnectProviderSchema,
}).strict();
/** Revocation result. */
export const ConnectRevokeResponseSchema = z.object({
    ok: z.boolean(),
    status: ConnectStatusSchema,
}).strict();
/** Time-limited permit for tools to use a connection. */
export const ConnectToolPermitSchema = z.object({
    agentId: z.string().min(1),
    provider: ConnectProviderSchema,
    scopes: ScopesSchema,
    issuedAt: UnixSecondsSchema,
    expiresAt: UnixSecondsSchema,
}).strict().refine((permit) => permit.expiresAt > permit.issuedAt && permit.expiresAt - permit.issuedAt <= CONNECT_PERMIT_MAX_TTL_SECONDS, { message: `Permit lifetime must be between 1 and ${CONNECT_PERMIT_MAX_TTL_SECONDS} seconds`, path: ['expiresAt'] });
//# sourceMappingURL=index.js.map