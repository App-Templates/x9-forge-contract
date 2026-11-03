"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformOwnerAuthorizationSchema = exports.CreationActorAttestationSchema = void 0;
exports.isCreationAuthorityCurrent = isCreationAuthorityCurrent;
const zod_1 = require("zod");
const channel_type_js_1 = require("../messaging/channel-type.cjs");
const isoInstant = zod_1.z.iso.datetime({ offset: true });
/** Forge-issued proof of who is asking a channel to create an agent; never names the target owner or agent. */
exports.CreationActorAttestationSchema = zod_1.z.object({
    tenantId: zod_1.z.string().min(1),
    actorId: zod_1.z.string().min(1),
    channel: channel_type_js_1.ChannelTypeSchema,
    issuer: zod_1.z.literal('forge'),
    issuedAt: isoInstant,
    expiresAt: isoInstant,
    nonce: zod_1.z.string().min(1),
}).strict().refine((a) => Date.parse(a.expiresAt) > Date.parse(a.issuedAt), {
    path: ['expiresAt'], message: 'expiresAt must be after issuedAt',
});
exports.PlatformOwnerAuthorizationSchema = zod_1.z.object({
    tenantId: zod_1.z.string().min(1),
    actorId: zod_1.z.string().min(1),
    decision: zod_1.z.enum(['granted', 'denied']),
    reason: zod_1.z.string().optional(),
    attestation: exports.CreationActorAttestationSchema,
}).strict().superRefine((auth, ctx) => {
    if (auth.decision === 'denied' && (auth.reason ?? '').length < 1) {
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'A denied authorization requires a reason' });
    }
    if (auth.attestation.tenantId !== auth.tenantId || auth.attestation.actorId !== auth.actorId) {
        ctx.addIssue({ code: 'custom', path: ['attestation'], message: 'Attestation must match tenant and actor' });
    }
});
/** Validity window only; clock injected (epoch ms). Not yet valid, expired or malformed → false. */
function isCreationAuthorityCurrent(rawAttestation, now) {
    const parsed = exports.CreationActorAttestationSchema.safeParse(rawAttestation);
    if (!parsed.success || !Number.isFinite(now))
        return false;
    return now >= Date.parse(parsed.data.issuedAt) && now < Date.parse(parsed.data.expiresAt);
}
//# sourceMappingURL=agent-creation-authority.js.map