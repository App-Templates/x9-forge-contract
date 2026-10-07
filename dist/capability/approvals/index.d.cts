import { z } from 'zod';
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
export declare const APPROVAL_PERMIT_VERSION: 1;
/** Domain-separation prefix of the signed message: a permit signature cannot be replayed as any other signature. */
export declare const APPROVAL_PERMIT_DOMAIN: "x9-approval-permit-v1";
export declare const APPROVAL_MIN_TTL_SEC = 60;
/** Hard ceiling of a permit lifetime; a panel may set a lower one, never a higher one. */
export declare const APPROVAL_MAX_TTL_SEC = 900;
/** Clock skew tolerated on `issuedAt` by `checkApprovalPermit`. */
export declare const APPROVAL_CLOCK_SKEW_SEC = 30;
export declare const APPROVAL_MAX_BINDINGS = 16;
export declare const APPROVAL_TEXT_MAX = 2000;
/** Client capability short name (`backup`, `dev`, …): the prefix of every action type it registers. */
export declare const ApprovalClientSchema: z.ZodString;
export type ApprovalClient = z.infer<typeof ApprovalClientSchema>;
/** `<client>.<action>`, e.g. `backup.create`, `backup.restore`, `dev.approve`. */
export declare const ApprovalActionTypeSchema: z.ZodString;
export type ApprovalActionType = z.infer<typeof ApprovalActionTypeSchema>;
/**
 * What the approval is bound to, chosen by the client: snapshot → `{ resource, release, overwrites }`;
 * cap-dev → `{ board, issue, reportVersion, reportDigest, project, computer }`; payment → `{ payee, amount, currency }`.
 * Flat, 1..16 entries, strings or safe integers only, so the canonical form is identical in every language.
 */
export declare const ApprovalBindingsSchema: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
export type ApprovalBindings = z.infer<typeof ApprovalBindingsSchema>;
export declare const ApprovalRequestIdSchema: z.ZodString;
/** 128 random bits, base64url without padding. */
export declare const ApprovalNonceSchema: z.ZodString;
export declare const ApprovalKeyIdSchema: z.ZodString;
/** Lower-case hex SHA-256 of the UTF-8 `text` exactly as sent in the approval request. */
export declare const ApprovalTextSha256Schema: z.ZodString;
/** Ed25519 signature: 64 bytes, base64url without padding. */
export declare const ApprovalSignatureSchema: z.ZodString;
/** UTC instant to the second (`2026-10-07T19:05:09Z`), the only form allowed inside a permit. */
export declare const ApprovalInstantSchema: z.ZodString;
/** Severity drives the phone page: `strong` = red page and explicit loss warning (restore, overwrite unverified). */
export declare const ApprovalSeveritySchema: z.ZodEnum<{
    normal: "normal";
    strong: "strong";
}>;
export type ApprovalSeverity = z.infer<typeof ApprovalSeveritySchema>;
export declare const ApprovalPermitSchema: z.ZodObject<{
    v: z.ZodLiteral<1>;
    type: z.ZodString;
    client: z.ZodString;
    tenantId: z.ZodString;
    ownerId: z.ZodString;
    agentId: z.ZodString;
    requestId: z.ZodString;
    textSha256: z.ZodString;
    bindings: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    issuedAt: z.ZodString;
    expiresAt: z.ZodString;
    nonce: z.ZodString;
}, z.core.$strict>;
export type ApprovalPermit = z.infer<typeof ApprovalPermitSchema>;
/**
 * The exact UTF-8 message that is signed and verified: domain prefix, newline, JSON with keys sorted at every level.
 * Throws on an invalid permit, so nothing malformed can ever be signed.
 */
export declare function canonicalApprovalPermit(permit: ApprovalPermit): string;
export declare const SignedApprovalPermitSchema: z.ZodObject<{
    permit: z.ZodObject<{
        v: z.ZodLiteral<1>;
        type: z.ZodString;
        client: z.ZodString;
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        agentId: z.ZodString;
        requestId: z.ZodString;
        textSha256: z.ZodString;
        bindings: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        issuedAt: z.ZodString;
        expiresAt: z.ZodString;
        nonce: z.ZodString;
    }, z.core.$strict>;
    keyId: z.ZodString;
    signature: z.ZodString;
}, z.core.$strict>;
export type SignedApprovalPermit = z.infer<typeof SignedApprovalPermitSchema>;
/** What the client expects, taken from the request IT created — never from the permit itself. */
export interface ApprovalPermitExpectation {
    type: ApprovalActionType;
    client: ApprovalClient;
    scope: {
        tenantId: string;
        ownerId: string;
        agentId: string;
    };
    requestId: string;
    textSha256: string;
    bindings: ApprovalBindings;
}
export declare const ApprovalPermitRejectionSchema: z.ZodEnum<{
    expired: "expired";
    invalid: "invalid";
    client_mismatch: "client_mismatch";
    type_mismatch: "type_mismatch";
    scope_mismatch: "scope_mismatch";
    request_mismatch: "request_mismatch";
    text_mismatch: "text_mismatch";
    bindings_mismatch: "bindings_mismatch";
    not_yet_valid: "not_yet_valid";
}>;
export type ApprovalPermitRejection = z.infer<typeof ApprovalPermitRejectionSchema>;
export type ApprovalPermitCheck = {
    ok: true;
    permit: ApprovalPermit;
} | {
    ok: false;
    reason: ApprovalPermitRejection;
};
/**
 * Pure checks of a permit against the client's own expectation and the clock. Signature and one-time nonce are NOT
 * checked here (crypto and state belong to the client); a client accepts a permit only when this returns ok AND the
 * signature verifies AND the nonce was never seen AND its own preconditions still hold.
 */
export declare function checkApprovalPermit(input: unknown, expected: ApprovalPermitExpectation, nowMs: number): ApprovalPermitCheck;
/**
 * POST /internal/approvals/requests — a client capability asks the owner for an approval.
 * Direction: client capability (cap-backup, cap-dev, …) -> cap-approvals. Auth: X-Internal-Secret.
 * cap-approvals sends the link on the agent's channel; nothing happens until the passkey check.
 */
export declare const CreateApprovalRequestBodySchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    client: z.ZodString;
    type: z.ZodString;
    text: z.ZodString;
    bindings: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    ttlSec: z.ZodNumber;
    severity: z.ZodEnum<{
        normal: "normal";
        strong: "strong";
    }>;
}, z.core.$strict>;
export type CreateApprovalRequestBody = z.infer<typeof CreateApprovalRequestBodySchema>;
export declare const CreateApprovalRequestResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    ok: z.ZodLiteral<true>;
    requestId: z.ZodString;
    expiresAt: z.ZodString;
    notified: z.ZodBoolean;
}, z.core.$strict>, z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodString;
}, z.core.$strict>], "ok">;
export type CreateApprovalRequestResponse = z.infer<typeof CreateApprovalRequestResponseSchema>;
export declare const createApprovalRequestContract: {
    readonly method: "POST";
    readonly path: "/internal/approvals/requests";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        client: z.ZodString;
        type: z.ZodString;
        text: z.ZodString;
        bindings: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        ttlSec: z.ZodNumber;
        severity: z.ZodEnum<{
            normal: "normal";
            strong: "strong";
        }>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        ok: z.ZodLiteral<true>;
        requestId: z.ZodString;
        expiresAt: z.ZodString;
        notified: z.ZodBoolean;
    }, z.core.$strict>, z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodString;
    }, z.core.$strict>], "ok">;
};
/**
 * POST /approvals/permit — cap-approvals delivers the signed permit to the client capability right after the passkey
 * check. Direction: cap-approvals -> client capability. Auth: X-Internal-Secret.
 * The client base URL comes from the capability registry entry of `permit.client`, never from the request.
 * `text` (short, plain) is shown on the phone page: what happened, or why nothing happened.
 */
export declare const DeliverApprovalPermitResponseSchema: z.ZodObject<{
    ok: z.ZodBoolean;
    text: z.ZodString;
}, z.core.$strict>;
export type DeliverApprovalPermitResponse = z.infer<typeof DeliverApprovalPermitResponseSchema>;
export declare const deliverApprovalPermitContract: {
    readonly method: "POST";
    readonly path: "/approvals/permit";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        permit: z.ZodObject<{
            v: z.ZodLiteral<1>;
            type: z.ZodString;
            client: z.ZodString;
            tenantId: z.ZodString;
            ownerId: z.ZodString;
            agentId: z.ZodString;
            requestId: z.ZodString;
            textSha256: z.ZodString;
            bindings: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
            issuedAt: z.ZodString;
            expiresAt: z.ZodString;
            nonce: z.ZodString;
        }, z.core.$strict>;
        keyId: z.ZodString;
        signature: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodBoolean;
        text: z.ZodString;
    }, z.core.$strict>;
};
/**
 * POST /internal/approvals/pending — approvals still waiting for the owner (e.g. X9 Live web shows the links).
 * Direction: X9 agent-core -> cap-approvals. Auth: X-Internal-Secret. Generalizes the dev-only pending confirmations.
 */
export declare const PendingApprovalsBodySchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const PendingApprovalSchema: z.ZodObject<{
    requestId: z.ZodString;
    type: z.ZodString;
    text: z.ZodString;
    severity: z.ZodEnum<{
        normal: "normal";
        strong: "strong";
    }>;
    expiresAt: z.ZodString;
    link: z.ZodURL;
}, z.core.$strict>;
export declare const PendingApprovalsResponseSchema: z.ZodObject<{
    approvals: z.ZodArray<z.ZodObject<{
        requestId: z.ZodString;
        type: z.ZodString;
        text: z.ZodString;
        severity: z.ZodEnum<{
            normal: "normal";
            strong: "strong";
        }>;
        expiresAt: z.ZodString;
        link: z.ZodURL;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type PendingApprovalsResponse = z.infer<typeof PendingApprovalsResponseSchema>;
export declare const pendingApprovalsContract: {
    readonly method: "POST";
    readonly path: "/internal/approvals/pending";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        approvals: z.ZodArray<z.ZodObject<{
            requestId: z.ZodString;
            type: z.ZodString;
            text: z.ZodString;
            severity: z.ZodEnum<{
                normal: "normal";
                strong: "strong";
            }>;
            expiresAt: z.ZodString;
            link: z.ZodURL;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
/**
 * GET /internal/approvals/keys — public keys a client uses to verify permits (rotation: several keys, by keyId).
 * Direction: client capability -> cap-approvals. Auth: X-Internal-Secret. Public material only.
 */
export declare const ApprovalPublicKeySchema: z.ZodObject<{
    keyId: z.ZodString;
    publicKeySpki: z.ZodString;
    activeFrom: z.ZodString;
    retiredAt: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export declare const ApprovalKeysResponseSchema: z.ZodObject<{
    keys: z.ZodArray<z.ZodObject<{
        keyId: z.ZodString;
        publicKeySpki: z.ZodString;
        activeFrom: z.ZodString;
        retiredAt: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ApprovalKeysResponse = z.infer<typeof ApprovalKeysResponseSchema>;
export declare const approvalKeysContract: {
    readonly method: "GET";
    readonly path: "/internal/approvals/keys";
    readonly authType: "secret";
    readonly responseSchema: z.ZodObject<{
        keys: z.ZodArray<z.ZodObject<{
            keyId: z.ZodString;
            publicKeySpki: z.ZodString;
            activeFrom: z.ZodString;
            retiredAt: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
//# sourceMappingURL=index.d.ts.map