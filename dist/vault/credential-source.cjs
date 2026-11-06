"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialVersionRefSchema = exports.CredentialSourceIdSchema = void 0;
exports.credentialSourceOf = credentialSourceOf;
exports.compareCredentialVersions = compareCredentialVersions;
const zod_1 = require("zod");
/** Identity of the source that owns a credential version counter. */
exports.CredentialSourceIdSchema = zod_1.z.string().regex(/^(platform|(owner|agent|preset):[1-9][0-9]*)$/);
/** Reject missing or invalid identities instead of constructing an uncertain source. */
function credentialSourceOf(row) {
    switch (row.tier) {
        case 'platform':
            return 'platform';
        case 'owner':
            return exports.CredentialSourceIdSchema.parse(`owner:${row.ownerId}`);
        case 'agent':
            return exports.CredentialSourceIdSchema.parse(`agent:${row.agentId}`);
        case 'preset':
            return exports.CredentialSourceIdSchema.parse(`preset:${row.presetId}`);
    }
}
exports.CredentialVersionRefSchema = zod_1.z.object({
    source: exports.CredentialSourceIdSchema,
    counter: zod_1.z.number().int().positive(),
    revoked: zod_1.z.boolean().default(false),
}).strict();
/** Counters are comparable only within their source; revocation does not affect ordering. */
function compareCredentialVersions(a, b) {
    if (a.source !== b.source)
        return 'incomparable';
    if (a.counter > b.counter)
        return 'newer';
    if (a.counter < b.counter)
        return 'older';
    return 'same';
}
//# sourceMappingURL=credential-source.js.map