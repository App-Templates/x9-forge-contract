"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevelopmentSessionConsentSchema = exports.DevelopmentSessionPairingChallengeSchema = void 0;
exports.isDevelopmentSessionConsentForChallenge = isDevelopmentSessionConsentForChallenge;
const zod_1 = require("zod");
const device_signature_js_1 = require("../../auth/device-signature.cjs");
const development_session_js_1 = require("./development-session.cjs");
/** The same pairing lifecycle applies locally and in the cloud. Keep provider
 * credentials on the owner's device or cloud, never in this public contract. */
exports.DevelopmentSessionPairingChallengeSchema = zod_1.z.object({
    binding: development_session_js_1.DevelopmentSessionBindingSchema,
    pairingId: zod_1.z.string().min(1),
    nonce: device_signature_js_1.DeviceNonceSchema,
    issuedAt: zod_1.z.string().datetime(),
    expiresAt: zod_1.z.string().datetime(),
}).strict().refine((challenge) => Date.parse(challenge.expiresAt) > Date.parse(challenge.issuedAt), { message: 'Challenge must expire after issuance', path: ['expiresAt'] });
exports.DevelopmentSessionConsentSchema = zod_1.z.object({
    challenge: exports.DevelopmentSessionPairingChallengeSchema,
    consentedAt: zod_1.z.string().datetime(),
}).strict().refine((consent) => Date.parse(consent.consentedAt) >= Date.parse(consent.challenge.issuedAt)
    && Date.parse(consent.consentedAt) < Date.parse(consent.challenge.expiresAt), { message: 'Consent must fall within the challenge lifetime', path: ['consentedAt'] });
/**
 * `expected` must come from an authenticated registry. The service must verify
 * signature/possession, session consent, single-use nonce consumption and revocation.
 * This pure helper proves format, correlation and time only; client data never
 * becomes authority. Use the same local/cloud lifecycle and keep provider
 * credentials on the owner's device/cloud.
 */
function isDevelopmentSessionConsentForChallenge(raw, expected, nowMs) {
    const consent = exports.DevelopmentSessionConsentSchema.safeParse(raw);
    const challenge = exports.DevelopmentSessionPairingChallengeSchema.safeParse(expected);
    if (!consent.success || !challenge.success)
        return false;
    if (!Number.isFinite(nowMs))
        return false;
    const actual = consent.data.challenge;
    const wanted = challenge.data;
    if (nowMs >= Date.parse(wanted.expiresAt))
        return false;
    // Validated consent is at/after issuance, so rejecting future consent also
    // rejects a clock before issuance without a redundant lower-bound guard.
    if (Date.parse(consent.data.consentedAt) > nowMs)
        return false;
    const a = actual.binding;
    const b = wanted.binding;
    if (a.target.kind !== b.target.kind)
        return false;
    if (a.target.kind === 'local' && b.target.kind === 'local'
        && a.target.deviceId !== b.target.deviceId)
        return false;
    if (a.target.kind === 'cloud' && b.target.kind === 'cloud'
        && a.target.connectionRef !== b.target.connectionRef)
        return false;
    return actual.pairingId === wanted.pairingId
        && actual.nonce === wanted.nonce
        && actual.issuedAt === wanted.issuedAt
        && actual.expiresAt === wanted.expiresAt
        && a.sessionId === b.sessionId
        && a.scope.tenantId === b.scope.tenantId
        && a.scope.ownerId === b.scope.ownerId
        && a.scope.agentId === b.scope.agentId
        && a.engines.length === b.engines.length
        && a.engines.every((engine) => b.engines.includes(engine));
}
//# sourceMappingURL=development-session-pairing.js.map