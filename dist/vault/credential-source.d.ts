import { z } from 'zod';
import type { VaultCascadeTier } from "./vault-tier.js";
/** Identity of the source that owns a credential version counter. */
export declare const CredentialSourceIdSchema: z.ZodString;
export type CredentialSourceId = z.infer<typeof CredentialSourceIdSchema>;
/** Reject missing or invalid identities instead of constructing an uncertain source. */
export declare function credentialSourceOf(row: {
    tier: VaultCascadeTier;
    agentId: number | null;
    ownerId: number | null;
    presetId?: number | null;
}): CredentialSourceId;
/** A version of a key within its source; never carries a threshold of its own. */
export declare const CredentialVersionThresholdSchema: z.ZodObject<{
    source: z.ZodString;
    counter: z.ZodNumber;
    revoked: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>;
export type CredentialVersionThreshold = z.infer<typeof CredentialVersionThresholdSchema>;
/** A version of a key; `revokedThrough` is the revocation threshold and is absent when nothing was revoked. */
export declare const CredentialVersionRefSchema: z.ZodObject<{
    source: z.ZodString;
    counter: z.ZodNumber;
    revoked: z.ZodDefault<z.ZodBoolean>;
    revokedThrough: z.ZodOptional<z.ZodObject<{
        source: z.ZodString;
        counter: z.ZodNumber;
        revoked: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type CredentialVersionRef = z.infer<typeof CredentialVersionRefSchema>;
/** Counters are comparable only within their source; revocation does not affect ordering. */
export declare function compareCredentialVersions(a: CredentialVersionThreshold, b: CredentialVersionThreshold): 'same' | 'newer' | 'older' | 'incomparable';
/**
 * True when `version` is revoked by `threshold`: the threshold is present, comes from the same source,
 * and the version is at or below it. A threshold from another source never applies.
 */
export declare function withinRevocationThreshold(version: CredentialVersionThreshold, threshold: CredentialVersionThreshold | undefined): boolean;
/**
 * Whether the version a session was opened with is revoked, given the current version of the key.
 * A revocation closes the session even when an ordinary rotation followed it (the threshold covers the opened
 * version); a plain rotation or a key from another source lets the session continue. When the current version is
 * revoked, anything not strictly newer from the same source closes, including another source (prudent).
 */
export declare function credentialVersionRevoked(opened: CredentialVersionRef | null | undefined, current: CredentialVersionRef | null | undefined): boolean;
//# sourceMappingURL=credential-source.d.ts.map