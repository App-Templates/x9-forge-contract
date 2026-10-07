import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../capability-call-context.js';

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

export const APPROVAL_PERMIT_VERSION = 1 as const;
/** Domain-separation prefix of the signed message: a permit signature cannot be replayed as any other signature. */
export const APPROVAL_PERMIT_DOMAIN = 'x9-approval-permit-v1' as const;
export const APPROVAL_MIN_TTL_SEC = 60;
/** Hard ceiling of a permit lifetime; a panel may set a lower one, never a higher one. */
export const APPROVAL_MAX_TTL_SEC = 900;
/** Clock skew tolerated on `issuedAt` by `checkApprovalPermit`. */
export const APPROVAL_CLOCK_SKEW_SEC = 30;
export const APPROVAL_MAX_BINDINGS = 16;
export const APPROVAL_TEXT_MAX = 2000;

/** Client capability short name (`backup`, `dev`, …): the prefix of every action type it registers. */
export const ApprovalClientSchema = z.string().regex(/^[a-z][a-z0-9-]{0,31}$/);
export type ApprovalClient = z.infer<typeof ApprovalClientSchema>;

/** `<client>.<action>`, e.g. `backup.create`, `backup.restore`, `dev.approve`. */
export const ApprovalActionTypeSchema = z.string().regex(/^[a-z][a-z0-9-]{0,31}\.[a-z][a-z0-9-]{0,47}$/);
export type ApprovalActionType = z.infer<typeof ApprovalActionTypeSchema>;

const BindingKeySchema = z.string().regex(/^[a-z][a-zA-Z0-9]{0,31}$/);
const BindingStringSchema = z.string().min(1).max(256).regex(/^[^\u0000-\u001f\u007f]*$/);
const BindingValueSchema = z.union([BindingStringSchema, z.number().int().safe()]);

/**
 * What the approval is bound to, chosen by the client: snapshot → `{ resource, release, overwrites }`;
 * cap-dev → `{ board, issue, reportVersion, reportDigest, project, computer }`; payment → `{ payee, amount, currency }`.
 * Flat, 1..16 entries, strings or safe integers only, so the canonical form is identical in every language.
 */
export const ApprovalBindingsSchema = z
  .record(BindingKeySchema, BindingValueSchema)
  .refine((b) => {
    const n = Object.keys(b).length;
    return n >= 1 && n <= APPROVAL_MAX_BINDINGS;
  }, { message: `1..${APPROVAL_MAX_BINDINGS} bindings` });
export type ApprovalBindings = z.infer<typeof ApprovalBindingsSchema>;

export const ApprovalRequestIdSchema = z.string().regex(/^[A-Za-z0-9_-]{16,64}$/);
/** 128 random bits, base64url without padding. */
export const ApprovalNonceSchema = z.string().regex(/^[A-Za-z0-9_-]{22}$/);
export const ApprovalKeyIdSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/);
/** Lower-case hex SHA-256 of the UTF-8 `text` exactly as sent in the approval request. */
export const ApprovalTextSha256Schema = z.string().regex(/^[0-9a-f]{64}$/);
/** Ed25519 signature: 64 bytes, base64url without padding. */
export const ApprovalSignatureSchema = z.string().regex(/^[A-Za-z0-9_-]{86}$/);

/** UTC instant to the second (`2026-10-07T19:05:09Z`), the only form allowed inside a permit. */
export const ApprovalInstantSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
  .refine((s) => !Number.isNaN(Date.parse(s)) && new Date(Date.parse(s)).toISOString().replace(/\.000Z$/, 'Z') === s, {
    message: 'invalid instant',
  });

/** Severity drives the phone page: `strong` = red page and explicit loss warning (restore, overwrite unverified). */
export const ApprovalSeveritySchema = z.enum(['normal', 'strong']);
export type ApprovalSeverity = z.infer<typeof ApprovalSeveritySchema>;

const ScopeShape = CapabilityAgentScopeSchema.shape;

function typeMatchesClient(type: string, client: string): boolean {
  return type.slice(0, type.indexOf('.')) === client;
}

export const ApprovalPermitSchema = z
  .object({
    v: z.literal(APPROVAL_PERMIT_VERSION),
    type: ApprovalActionTypeSchema,
    client: ApprovalClientSchema,
    tenantId: ScopeShape.tenantId,
    ownerId: ScopeShape.ownerId,
    agentId: ScopeShape.agentId,
    requestId: ApprovalRequestIdSchema,
    textSha256: ApprovalTextSha256Schema,
    bindings: ApprovalBindingsSchema,
    issuedAt: ApprovalInstantSchema,
    expiresAt: ApprovalInstantSchema,
    nonce: ApprovalNonceSchema,
  })
  .strict()
  .superRefine((p, ctx) => {
    if (!typeMatchesClient(p.type, p.client)) {
      ctx.addIssue({ code: 'custom', path: ['type'], message: 'type must be prefixed by its client' });
    }
    const ttl = (Date.parse(p.expiresAt) - Date.parse(p.issuedAt)) / 1000;
    if (!(ttl >= APPROVAL_MIN_TTL_SEC && ttl <= APPROVAL_MAX_TTL_SEC)) {
      ctx.addIssue({ code: 'custom', path: ['expiresAt'], message: `lifetime must be ${APPROVAL_MIN_TTL_SEC}..${APPROVAL_MAX_TTL_SEC}s` });
    }
  });
export type ApprovalPermit = z.infer<typeof ApprovalPermitSchema>;

function canonicalJson(value: unknown): string {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.keys(value as Record<string, unknown>)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonicalJson((value as Record<string, unknown>)[k])}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value);
}

/**
 * The exact UTF-8 message that is signed and verified: domain prefix, newline, JSON with keys sorted at every level.
 * Throws on an invalid permit, so nothing malformed can ever be signed.
 */
export function canonicalApprovalPermit(permit: ApprovalPermit): string {
  return `${APPROVAL_PERMIT_DOMAIN}\n${canonicalJson(ApprovalPermitSchema.parse(permit))}`;
}

export const SignedApprovalPermitSchema = z
  .object({
    permit: ApprovalPermitSchema,
    keyId: ApprovalKeyIdSchema,
    signature: ApprovalSignatureSchema,
  })
  .strict();
export type SignedApprovalPermit = z.infer<typeof SignedApprovalPermitSchema>;

/** What the client expects, taken from the request IT created — never from the permit itself. */
export interface ApprovalPermitExpectation {
  type: ApprovalActionType;
  client: ApprovalClient;
  scope: { tenantId: string; ownerId: string; agentId: string };
  requestId: string;
  textSha256: string;
  bindings: ApprovalBindings;
}

export const ApprovalPermitRejectionSchema = z.enum([
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
export type ApprovalPermitRejection = z.infer<typeof ApprovalPermitRejectionSchema>;
export type ApprovalPermitCheck = { ok: true; permit: ApprovalPermit } | { ok: false; reason: ApprovalPermitRejection };

/**
 * Pure checks of a permit against the client's own expectation and the clock. Signature and one-time nonce are NOT
 * checked here (crypto and state belong to the client); a client accepts a permit only when this returns ok AND the
 * signature verifies AND the nonce was never seen AND its own preconditions still hold.
 */
export function checkApprovalPermit(input: unknown, expected: ApprovalPermitExpectation, nowMs: number): ApprovalPermitCheck {
  const parsed = ApprovalPermitSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: 'invalid' };
  const p = parsed.data;
  if (p.client !== expected.client) return { ok: false, reason: 'client_mismatch' };
  if (p.type !== expected.type) return { ok: false, reason: 'type_mismatch' };
  if (p.tenantId !== expected.scope.tenantId || p.ownerId !== expected.scope.ownerId || p.agentId !== expected.scope.agentId) {
    return { ok: false, reason: 'scope_mismatch' };
  }
  if (p.requestId !== expected.requestId) return { ok: false, reason: 'request_mismatch' };
  if (p.textSha256 !== expected.textSha256) return { ok: false, reason: 'text_mismatch' };
  if (canonicalJson(p.bindings) !== canonicalJson(expected.bindings)) return { ok: false, reason: 'bindings_mismatch' };
  if (nowMs + APPROVAL_CLOCK_SKEW_SEC * 1000 < Date.parse(p.issuedAt)) return { ok: false, reason: 'not_yet_valid' };
  if (nowMs >= Date.parse(p.expiresAt)) return { ok: false, reason: 'expired' };
  return { ok: true, permit: p };
}

// ---------------------------------------------------------------------------------------------------------------
// Endpoints

/**
 * POST /internal/approvals/requests — a client capability asks the owner for an approval.
 * Direction: client capability (cap-backup, cap-dev, …) -> cap-approvals. Auth: X-Internal-Secret.
 * cap-approvals sends the link on the agent's channel; nothing happens until the passkey check.
 */
export const CreateApprovalRequestBodySchema = z
  .object({
    scope: CapabilityAgentScopeSchema,
    client: ApprovalClientSchema,
    type: ApprovalActionTypeSchema,
    text: z.string().trim().min(1).max(APPROVAL_TEXT_MAX),
    bindings: ApprovalBindingsSchema,
    ttlSec: z.number().int().min(APPROVAL_MIN_TTL_SEC).max(APPROVAL_MAX_TTL_SEC),
    severity: ApprovalSeveritySchema,
  })
  .strict()
  .refine((b) => typeMatchesClient(b.type, b.client), { path: ['type'], message: 'type must be prefixed by its client' });
export type CreateApprovalRequestBody = z.infer<typeof CreateApprovalRequestBodySchema>;

export const CreateApprovalRequestResponseSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), requestId: ApprovalRequestIdSchema, expiresAt: ApprovalInstantSchema, notified: z.boolean() }).strict(),
  z.object({ ok: z.literal(false), error: z.string().min(1).max(500) }).strict(),
]);
export type CreateApprovalRequestResponse = z.infer<typeof CreateApprovalRequestResponseSchema>;

export const createApprovalRequestContract = {
  method: 'POST' as const,
  path: '/internal/approvals/requests' as const,
  authType: 'secret' as const,
  bodySchema: CreateApprovalRequestBodySchema,
  responseSchema: CreateApprovalRequestResponseSchema,
} as const;

/**
 * POST /approvals/permit — cap-approvals delivers the signed permit to the client capability right after the passkey
 * check. Direction: cap-approvals -> client capability. Auth: X-Internal-Secret.
 * The client base URL comes from the capability registry entry of `permit.client`, never from the request.
 * `text` (short, plain) is shown on the phone page: what happened, or why nothing happened.
 */
export const DeliverApprovalPermitResponseSchema = z
  .object({ ok: z.boolean(), text: z.string().trim().min(1).max(500) })
  .strict();
export type DeliverApprovalPermitResponse = z.infer<typeof DeliverApprovalPermitResponseSchema>;

export const deliverApprovalPermitContract = {
  method: 'POST' as const,
  path: '/approvals/permit' as const,
  authType: 'secret' as const,
  bodySchema: SignedApprovalPermitSchema,
  responseSchema: DeliverApprovalPermitResponseSchema,
} as const;

/**
 * POST /internal/approvals/pending — approvals still waiting for the owner (e.g. X9 Live web shows the links).
 * Direction: X9 agent-core -> cap-approvals. Auth: X-Internal-Secret. Generalizes the dev-only pending confirmations.
 */
export const PendingApprovalsBodySchema = z.object({ scope: CapabilityAgentScopeSchema }).strict();
export const PendingApprovalSchema = z
  .object({
    requestId: ApprovalRequestIdSchema,
    type: ApprovalActionTypeSchema,
    text: z.string().min(1).max(APPROVAL_TEXT_MAX),
    severity: ApprovalSeveritySchema,
    expiresAt: ApprovalInstantSchema,
    link: z.url({ protocol: /^https$/ }),
  })
  .strict();
export const PendingApprovalsResponseSchema = z.object({ approvals: z.array(PendingApprovalSchema).max(50) }).strict();
export type PendingApprovalsResponse = z.infer<typeof PendingApprovalsResponseSchema>;

export const pendingApprovalsContract = {
  method: 'POST' as const,
  path: '/internal/approvals/pending' as const,
  authType: 'secret' as const,
  bodySchema: PendingApprovalsBodySchema,
  responseSchema: PendingApprovalsResponseSchema,
} as const;

/**
 * GET /internal/approvals/keys — public keys a client uses to verify permits (rotation: several keys, by keyId).
 * Direction: client capability -> cap-approvals. Auth: X-Internal-Secret. Public material only.
 */
export const ApprovalPublicKeySchema = z
  .object({
    keyId: ApprovalKeyIdSchema,
    /** DER SPKI of the Ed25519 public key, base64. */
    publicKeySpki: z.string().regex(/^[A-Za-z0-9+/]+={0,2}$/).max(200),
    activeFrom: ApprovalInstantSchema,
    retiredAt: ApprovalInstantSchema.nullable(),
  })
  .strict();
export const ApprovalKeysResponseSchema = z.object({ keys: z.array(ApprovalPublicKeySchema).min(1).max(8) }).strict();
export type ApprovalKeysResponse = z.infer<typeof ApprovalKeysResponseSchema>;

export const approvalKeysContract = {
  method: 'GET' as const,
  path: '/internal/approvals/keys' as const,
  authType: 'secret' as const,
  responseSchema: ApprovalKeysResponseSchema,
} as const;
