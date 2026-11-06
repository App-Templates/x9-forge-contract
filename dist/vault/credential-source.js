import { z } from 'zod';
/** Identity of the source that owns a credential version counter. */
export const CredentialSourceIdSchema = z.string().regex(/^(platform|(owner|agent|preset):[1-9][0-9]*)$/);
/** Reject missing or invalid identities instead of constructing an uncertain source. */
export function credentialSourceOf(row) {
    switch (row.tier) {
        case 'platform':
            return 'platform';
        case 'owner':
            return CredentialSourceIdSchema.parse(`owner:${row.ownerId}`);
        case 'agent':
            return CredentialSourceIdSchema.parse(`agent:${row.agentId}`);
        case 'preset':
            return CredentialSourceIdSchema.parse(`preset:${row.presetId}`);
    }
}
export const CredentialVersionRefSchema = z.object({
    source: CredentialSourceIdSchema,
    counter: z.number().int().positive(),
    revoked: z.boolean().default(false),
}).strict();
/** Counters are comparable only within their source; revocation does not affect ordering. */
export function compareCredentialVersions(a, b) {
    if (a.source !== b.source)
        return 'incomparable';
    if (a.counter > b.counter)
        return 'newer';
    if (a.counter < b.counter)
        return 'older';
    return 'same';
}
//# sourceMappingURL=credential-source.js.map