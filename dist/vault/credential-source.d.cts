import { z } from 'zod';
import type { VaultCascadeTier } from "./vault-tier.cjs";
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
export declare const CredentialVersionRefSchema: z.ZodObject<{
    source: z.ZodString;
    counter: z.ZodNumber;
    revoked: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>;
export type CredentialVersionRef = z.infer<typeof CredentialVersionRefSchema>;
/** Counters are comparable only within their source; revocation does not affect ordering. */
export declare function compareCredentialVersions(a: CredentialVersionRef, b: CredentialVersionRef): 'same' | 'newer' | 'older' | 'incomparable';
//# sourceMappingURL=credential-source.d.ts.map