"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialVersionRefSchema = exports.CredentialVersionThresholdSchema = exports.CredentialSourceIdSchema = void 0;
exports.credentialSourceOf = credentialSourceOf;
exports.compareCredentialVersions = compareCredentialVersions;
exports.withinRevocationThreshold = withinRevocationThreshold;
exports.credentialVersionRevoked = credentialVersionRevoked;
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
/** A version of a key within its source; never carries a threshold of its own. */
exports.CredentialVersionThresholdSchema = zod_1.z.object({
    source: exports.CredentialSourceIdSchema,
    counter: zod_1.z.number().int().positive(),
    revoked: zod_1.z.boolean().default(false),
}).strict();
/** A version of a key; `revokedThrough` is the revocation threshold and is absent when nothing was revoked. */
exports.CredentialVersionRefSchema = exports.CredentialVersionThresholdSchema.extend({
    revokedThrough: exports.CredentialVersionThresholdSchema.optional(),
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
/**
 * True when `version` is revoked by `threshold`: the threshold is present, comes from the same source,
 * and the version is at or below it. A threshold from another source never applies.
 */
function withinRevocationThreshold(version, threshold) {
    if (threshold === undefined)
        return false;
    const order = compareCredentialVersions(version, threshold);
    return order === 'older' || order === 'same';
}
/**
 * Whether the version a session was opened with is revoked, given the current version of the key.
 * A revocation closes the session even when an ordinary rotation followed it (the threshold covers the opened
 * version); a plain rotation or a key from another source lets the session continue. When the current version is
 * revoked, anything not strictly newer from the same source closes, including another source (prudent).
 */
function credentialVersionRevoked(opened, current) {
    if (current === null || current === undefined)
        return false;
    if (opened === null || opened === undefined)
        return current.revoked === true;
    if (withinRevocationThreshold(opened, current.revokedThrough))
        return true;
    return current.revoked === true && compareCredentialVersions(opened, current) !== 'newer';
}
//# sourceMappingURL=credential-source.js.map