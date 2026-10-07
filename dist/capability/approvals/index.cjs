"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approvalKeysContract = exports.ApprovalKeysResponseSchema = exports.ApprovalPublicKeySchema = exports.pendingApprovalsContract = exports.PendingApprovalsResponseSchema = exports.PendingApprovalSchema = exports.PendingApprovalsBodySchema = exports.deliverApprovalPermitContract = exports.DeliverApprovalPermitResponseSchema = exports.createApprovalRequestContract = exports.CreateApprovalRequestResponseSchema = exports.CreateApprovalRequestBodySchema = exports.ApprovalPermitRejectionSchema = exports.SignedApprovalPermitSchema = exports.ApprovalPermitSchema = exports.ApprovalSeveritySchema = exports.ApprovalInstantSchema = exports.ApprovalSignatureSchema = exports.ApprovalTextSha256Schema = exports.ApprovalKeyIdSchema = exports.ApprovalNonceSchema = exports.ApprovalRequestIdSchema = exports.ApprovalBindingsSchema = exports.ApprovalActionTypeSchema = exports.ApprovalClientSchema = exports.APPROVAL_TEXT_MAX = exports.APPROVAL_MAX_BINDINGS = exports.APPROVAL_CLOCK_SKEW_SEC = exports.APPROVAL_MAX_TTL_SEC = exports.APPROVAL_MIN_TTL_SEC = exports.APPROVAL_PERMIT_DOMAIN = exports.APPROVAL_PERMIT_VERSION = void 0;
exports.canonicalApprovalPermit = canonicalApprovalPermit;
exports.checkApprovalPermit = checkApprovalPermit;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
/**
 * Signed approvals (phase 59, cap-approvals) — the owner approves a sensitive action from the phone with a passkey.
 *
 * ONE shared capability for every sensitive action of every agent: VPS snapshots first, then cap-dev, releases,
 * merges, payments. cap-approvals knows nothing about VPS, reports or amounts: each CLIENT capability sends the text to
 * show, the data the approval is bound to (`bindings`) and the lifetime. After the passkey check (user verification
 * required) cap-approvals signs a canonical permit (Ed25519) and delivers it to the client, which verifies it alone.
 *
 * Split of duties:
 *   - this module: shapes, the canonical serialization, the pure checks a client runs on a permit;
 *   - the client: signature verification (node:crypto, public key from `approvalKeysContract`), one-time `nonce`
 *     storage, and re-reading its own preconditions before the effect;
 *   - cap-approvals: passkeys, links, notifications, signing, audit log.
 *
 * A permit for client A never satisfies client B (the type is prefixed by the client), nor another agent, request,
 * text or binding set, nor a moment outside [issuedAt, expiresAt].
 */
exports.APPROVAL_PERMIT_VERSION = 1;
/** Domain-separation prefix of the signed message: a permit signature cannot be replayed as any other signature. */
exports.APPROVAL_PERMIT_DOMAIN = 'x9-approval-permit-v1';
exports.APPROVAL_MIN_TTL_SEC = 60;
/** Hard ceiling of a permit lifetime; a panel may set a lower one, never a higher one. */
exports.APPROVAL_MAX_TTL_SEC = 900;
/** Clock skew tolerated on `issuedAt` by `checkApprovalPermit`. */
exports.APPROVAL_CLOCK_SKEW_SEC = 30;
exports.APPROVAL_MAX_BINDINGS = 16;
exports.APPROVAL_TEXT_MAX = 2000;
/** Client capability short name (`backup`, `dev`, …): the prefix of every action type it registers. */
exports.ApprovalClientSchema = zod_1.z.string().regex(/^[a-z][a-z0-9-]{0,31}$/);
/** `<client>.<action>`, e.g. `backup.create`, `backup.restore`, `dev.approve`. */
exports.ApprovalActionTypeSchema = zod_1.z.string().regex(/^[a-z][a-z0-9-]{0,31}\.[a-z][a-z0-9-]{0,47}$/);
const BindingKeySchema = zod_1.z.string().regex(/^[a-z][a-zA-Z0-9]{0,31}$/);
const BindingStringSchema = zod_1.z.string().min(1).max(256).regex(/^[^\u0000-\u001f\u007f]*$/);
const BindingValueSchema = zod_1.z.union([BindingStringSchema, zod_1.z.number().int().safe()]);
/**
 * What the approval is bound to, chosen by the client: snapshot → `{ resource, release, overwrites }`;
 * cap-dev → `{ board, issue, reportVersion, reportDigest, project, computer }`; payment → `{ payee, amount, currency }`.
 * Flat, 1..16 entries, strings or safe integers only, so the canonical form is identical in every language.
 */
exports.ApprovalBindingsSchema = zod_1.z
    .record(BindingKeySchema, BindingValueSchema)
    .refine((b) => {
    const n = Object.keys(b).length;
    return n >= 1 && n <= exports.APPROVAL_MAX_BINDINGS;
}, { message: `1..${exports.APPROVAL_MAX_BINDINGS} bindings` });
exports.ApprovalRequestIdSchema = zod_1.z.string().regex(/^[A-Za-z0-9_-]{16,64}$/);
/** 128 random bits, base64url without padding. */
exports.ApprovalNonceSchema = zod_1.z.string().regex(/^[A-Za-z0-9_-]{22}$/);
exports.ApprovalKeyIdSchema = zod_1.z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/);
/** Lower-case hex SHA-256 of the UTF-8 `text` exactly as sent in the approval request. */
exports.ApprovalTextSha256Schema = zod_1.z.string().regex(/^[0-9a-f]{64}$/);
/** Ed25519 signature: 64 bytes, base64url without padding. */
exports.ApprovalSignatureSchema = zod_1.z.string().regex(/^[A-Za-z0-9_-]{86}$/);
/** UTC instant to the second (`2026-10-07T19:05:09Z`), the only form allowed inside a permit. */
exports.ApprovalInstantSchema = zod_1.z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
    .refine((s) => !Number.isNaN(Date.parse(s)) && new Date(Date.parse(s)).toISOString().replace(/\.000Z$/, 'Z') === s, {
    message: 'invalid instant',
});
/** Severity drives the phone page: `strong` = red page and explicit loss warning (restore, overwrite unverified). */
exports.ApprovalSeveritySchema = zod_1.z.enum(['normal', 'strong']);
const ScopeShape = capability_call_context_js_1.CapabilityAgentScopeSchema.shape;
function typeMatchesClient(type, client) {
    return type.slice(0, type.indexOf('.')) === client;
}
exports.ApprovalPermitSchema = zod_1.z
    .object({
    v: zod_1.z.literal(exports.APPROVAL_PERMIT_VERSION),
    type: exports.ApprovalActionTypeSchema,
    client: exports.ApprovalClientSchema,
    tenantId: ScopeShape.tenantId,
    ownerId: ScopeShape.ownerId,
    agentId: ScopeShape.agentId,
    requestId: exports.ApprovalRequestIdSchema,
    textSha256: exports.ApprovalTextSha256Schema,
    bindings: exports.ApprovalBindingsSchema,
    issuedAt: exports.ApprovalInstantSchema,
    expiresAt: exports.ApprovalInstantSchema,
    nonce: exports.ApprovalNonceSchema,
})
    .strict()
    .superRefine((p, ctx) => {
    if (!typeMatchesClient(p.type, p.client)) {
        ctx.addIssue({ code: 'custom', path: ['type'], message: 'type must be prefixed by its client' });
    }
    const ttl = (Date.parse(p.expiresAt) - Date.parse(p.issuedAt)) / 1000;
    if (!(ttl >= exports.APPROVAL_MIN_TTL_SEC && ttl <= exports.APPROVAL_MAX_TTL_SEC)) {
        ctx.addIssue({ code: 'custom', path: ['expiresAt'], message: `lifetime must be ${exports.APPROVAL_MIN_TTL_SEC}..${exports.APPROVAL_MAX_TTL_SEC}s` });
    }
});
function canonicalJson(value) {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        const entries = Object.keys(value)
            .sort()
            .map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`);
        return `{${entries.join(',')}}`;
    }
    return JSON.stringify(value);
}
/**
 * The exact UTF-8 message that is signed and verified: domain prefix, newline, JSON with keys sorted at every level.
 * Throws on an invalid permit, so nothing malformed can ever be signed.
 */
function canonicalApprovalPermit(permit) {
    return `${exports.APPROVAL_PERMIT_DOMAIN}\n${canonicalJson(exports.ApprovalPermitSchema.parse(permit))}`;
}
exports.SignedApprovalPermitSchema = zod_1.z
    .object({
    permit: exports.ApprovalPermitSchema,
    keyId: exports.ApprovalKeyIdSchema,
    signature: exports.ApprovalSignatureSchema,
})
    .strict();
exports.ApprovalPermitRejectionSchema = zod_1.z.enum([
    'invalid',
    'client_mismatch',
    'type_mismatch',
    'scope_mismatch',
    'request_mismatch',
    'text_mismatch',
    'bindings_mismatch',
    'not_yet_valid',
    'expired',
]);
/**
 * Pure checks of a permit against the client's own expectation and the clock. Signature and one-time nonce are NOT
 * checked here (crypto and state belong to the client); a client accepts a permit only when this returns ok AND the
 * signature verifies AND the nonce was never seen AND its own preconditions still hold.
 */
function checkApprovalPermit(input, expected, nowMs) {
    const parsed = exports.ApprovalPermitSchema.safeParse(input);
    if (!parsed.success)
        return { ok: false, reason: 'invalid' };
    const p = parsed.data;
    if (p.client !== expected.client)
        return { ok: false, reason: 'client_mismatch' };
    if (p.type !== expected.type)
        return { ok: false, reason: 'type_mismatch' };
    if (p.tenantId !== expected.scope.tenantId || p.ownerId !== expected.scope.ownerId || p.agentId !== expected.scope.agentId) {
        return { ok: false, reason: 'scope_mismatch' };
    }
    if (p.requestId !== expected.requestId)
        return { ok: false, reason: 'request_mismatch' };
    if (p.textSha256 !== expected.textSha256)
        return { ok: false, reason: 'text_mismatch' };
    if (canonicalJson(p.bindings) !== canonicalJson(expected.bindings))
        return { ok: false, reason: 'bindings_mismatch' };
    if (nowMs + exports.APPROVAL_CLOCK_SKEW_SEC * 1000 < Date.parse(p.issuedAt))
        return { ok: false, reason: 'not_yet_valid' };
    if (nowMs >= Date.parse(p.expiresAt))
        return { ok: false, reason: 'expired' };
    return { ok: true, permit: p };
}
// ---------------------------------------------------------------------------------------------------------------
// Endpoints
/**
 * POST /internal/approvals/requests — a client capability asks the owner for an approval.
 * Direction: client capability (cap-backup, cap-dev, …) -> cap-approvals. Auth: X-Internal-Secret.
 * cap-approvals sends the link on the agent's channel; nothing happens until the passkey check.
 */
exports.CreateApprovalRequestBodySchema = zod_1.z
    .object({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    client: exports.ApprovalClientSchema,
    type: exports.ApprovalActionTypeSchema,
    text: zod_1.z.string().trim().min(1).max(exports.APPROVAL_TEXT_MAX),
    bindings: exports.ApprovalBindingsSchema,
    ttlSec: zod_1.z.number().int().min(exports.APPROVAL_MIN_TTL_SEC).max(exports.APPROVAL_MAX_TTL_SEC),
    severity: exports.ApprovalSeveritySchema,
})
    .strict()
    .refine((b) => typeMatchesClient(b.type, b.client), { path: ['type'], message: 'type must be prefixed by its client' });
exports.CreateApprovalRequestResponseSchema = zod_1.z.discriminatedUnion('ok', [
    zod_1.z.object({ ok: zod_1.z.literal(true), requestId: exports.ApprovalRequestIdSchema, expiresAt: exports.ApprovalInstantSchema, notified: zod_1.z.boolean() }).strict(),
    zod_1.z.object({ ok: zod_1.z.literal(false), error: zod_1.z.string().min(1).max(500) }).strict(),
]);
exports.createApprovalRequestContract = {
    method: 'POST',
    path: '/internal/approvals/requests',
    authType: 'secret',
    bodySchema: exports.CreateApprovalRequestBodySchema,
    responseSchema: exports.CreateApprovalRequestResponseSchema,
};
/**
 * POST /approvals/permit — cap-approvals delivers the signed permit to the client capability right after the passkey
 * check. Direction: cap-approvals -> client capability. Auth: X-Internal-Secret.
 * The client base URL comes from the capability registry entry of `permit.client`, never from the request.
 * `text` (short, plain) is shown on the phone page: what happened, or why nothing happened.
 */
exports.DeliverApprovalPermitResponseSchema = zod_1.z
    .object({ ok: zod_1.z.boolean(), text: zod_1.z.string().trim().min(1).max(500) })
    .strict();
exports.deliverApprovalPermitContract = {
    method: 'POST',
    path: '/approvals/permit',
    authType: 'secret',
    bodySchema: exports.SignedApprovalPermitSchema,
    responseSchema: exports.DeliverApprovalPermitResponseSchema,
};
/**
 * POST /internal/approvals/pending — approvals still waiting for the owner (e.g. X9 Live web shows the links).
 * Direction: X9 agent-core -> cap-approvals. Auth: X-Internal-Secret. Generalizes the dev-only pending confirmations.
 */
exports.PendingApprovalsBodySchema = zod_1.z.object({ scope: capability_call_context_js_1.CapabilityAgentScopeSchema }).strict();
exports.PendingApprovalSchema = zod_1.z
    .object({
    requestId: exports.ApprovalRequestIdSchema,
    type: exports.ApprovalActionTypeSchema,
    text: zod_1.z.string().min(1).max(exports.APPROVAL_TEXT_MAX),
    severity: exports.ApprovalSeveritySchema,
    expiresAt: exports.ApprovalInstantSchema,
    link: zod_1.z.url({ protocol: /^https$/ }),
})
    .strict();
exports.PendingApprovalsResponseSchema = zod_1.z.object({ approvals: zod_1.z.array(exports.PendingApprovalSchema).max(50) }).strict();
exports.pendingApprovalsContract = {
    method: 'POST',
    path: '/internal/approvals/pending',
    authType: 'secret',
    bodySchema: exports.PendingApprovalsBodySchema,
    responseSchema: exports.PendingApprovalsResponseSchema,
};
/**
 * GET /internal/approvals/keys — public keys a client uses to verify permits (rotation: several keys, by keyId).
 * Direction: client capability -> cap-approvals. Auth: X-Internal-Secret. Public material only.
 */
exports.ApprovalPublicKeySchema = zod_1.z
    .object({
    keyId: exports.ApprovalKeyIdSchema,
    /** DER SPKI of the Ed25519 public key, base64. */
    publicKeySpki: zod_1.z.string().regex(/^[A-Za-z0-9+/]+={0,2}$/).max(200),
    activeFrom: exports.ApprovalInstantSchema,
    retiredAt: exports.ApprovalInstantSchema.nullable(),
})
    .strict();
exports.ApprovalKeysResponseSchema = zod_1.z.object({ keys: zod_1.z.array(exports.ApprovalPublicKeySchema).min(1).max(8) }).strict();
exports.approvalKeysContract = {
    method: 'GET',
    path: '/internal/approvals/keys',
    authType: 'secret',
    responseSchema: exports.ApprovalKeysResponseSchema,
};
//# sourceMappingURL=index.js.map