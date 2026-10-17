import { z } from 'zod';
import { DeviceNonceSchema } from "../../auth/device-signature.js";
import { DevelopmentSessionBindingSchema } from "./development-session.js";
/** The same pairing lifecycle applies locally and in the cloud. Keep provider
 * credentials on the owner's device or cloud, never in this public contract. */
export const DevelopmentSessionPairingChallengeSchema = z.object({
    binding: DevelopmentSessionBindingSchema,
    pairingId: z.string().min(1),
    nonce: DeviceNonceSchema,
    issuedAt: z.string().datetime(),
    expiresAt: z.string().datetime(),
}).strict().refine((challenge) => Date.parse(challenge.expiresAt) > Date.parse(challenge.issuedAt), { message: 'Challenge must expire after issuance', path: ['expiresAt'] });
export const DevelopmentSessionConsentSchema = z.object({
    challenge: DevelopmentSessionPairingChallengeSchema,
    consentedAt: z.string().datetime(),
}).strict().refine((consent) => Date.parse(consent.consentedAt) >= Date.parse(consent.challenge.issuedAt)
    && Date.parse(consent.consentedAt) < Date.parse(consent.challenge.expiresAt), { message: 'Consent must fall within the challenge lifetime', path: ['consentedAt'] });
/**
 * `expected` must come from an authenticated registry. The service must verify
 * signature/possession, session consent, single-use nonce consumption and revocation.
 * This pure helper proves format, correlation and time only; client data never
 * becomes authority. Use the same local/cloud lifecycle and keep provider
 * credentials on the owner's device/cloud.
 */
export function isDevelopmentSessionConsentForChallenge(raw, expected, nowMs) {
    const consent = DevelopmentSessionConsentSchema.safeParse(raw);
    const challenge = DevelopmentSessionPairingChallengeSchema.safeParse(expected);
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