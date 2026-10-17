"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevelopmentSessionLeaseSchema = void 0;
exports.isDevelopmentSessionUsable = isDevelopmentSessionUsable;
const zod_1 = require("zod");
const development_session_js_1 = require("./development-session.cjs");
/** Trusted-registry attestation, never a model's self-reported availability.
 * Services must apply real revocation and reread the registry before effects (S2/S3).
 * A configured binding or DevAgentStatus alone does not attest a usable session.
 */
exports.DevelopmentSessionLeaseSchema = zod_1.z.object({
    binding: development_session_js_1.DevelopmentSessionBindingSchema,
    leaseId: zod_1.z.string().min(1),
    consentRef: zod_1.z.string().min(1),
    status: zod_1.z.enum(['connected', 'offline', 'revoked']),
    issuedAt: zod_1.z.string().datetime(),
    lastSeenAt: zod_1.z.string().datetime(),
    expiresAt: zod_1.z.string().datetime(),
    availableEngines: zod_1.z.array(development_session_js_1.DevelopmentSessionEngineSchema).max(2)
        .refine((engines) => new Set(engines).size === engines.length, {
        message: 'Available engines must be unique',
    }),
}).strict()
    .refine((lease) => Date.parse(lease.issuedAt) <= Date.parse(lease.lastSeenAt), {
    message: 'Last seen must be at or after issuance', path: ['lastSeenAt'],
})
    .refine((lease) => Date.parse(lease.lastSeenAt) < Date.parse(lease.expiresAt), {
    message: 'Last seen must precede expiry', path: ['expiresAt'],
})
    .refine((lease) => lease.availableEngines.every((engine) => lease.binding.engines.includes(engine)), {
    message: 'Available engines must be authorized by the binding', path: ['availableEngines'],
});
/** Pure format/correlation/freshness check; both lease and expected binding must
 * come from trusted service state. This does not verify passkeys or wire revocation.
 * Engine order is irrelevant; the caller must inject its current clock.
 */
function isDevelopmentSessionUsable(raw, expectedBinding, engine, nowMs) {
    const lease = exports.DevelopmentSessionLeaseSchema.safeParse(raw);
    const binding = development_session_js_1.DevelopmentSessionBindingSchema.safeParse(expectedBinding);
    const selected = development_session_js_1.DevelopmentSessionEngineSchema.safeParse(engine);
    if (!lease.success || !binding.success || !selected.success)
        return false;
    if (!Number.isFinite(nowMs))
        return false;
    const actual = lease.data;
    const a = actual.binding;
    const b = binding.data;
    if (actual.status !== 'connected')
        return false;
    if (nowMs < Date.parse(actual.lastSeenAt))
        return false;
    if (nowMs >= Date.parse(actual.expiresAt))
        return false;
    // Attestation is a subset of authorized engines, so this also checks permission.
    if (!actual.availableEngines.includes(selected.data))
        return false;
    if (a.target.kind !== b.target.kind)
        return false;
    if (a.target.kind === 'local' && b.target.kind === 'local'
        && a.target.deviceId !== b.target.deviceId)
        return false;
    if (a.target.kind === 'cloud' && b.target.kind === 'cloud'
        && a.target.connectionRef !== b.target.connectionRef)
        return false;
    return a.sessionId === b.sessionId
        && a.scope.tenantId === b.scope.tenantId
        && a.scope.ownerId === b.scope.ownerId
        && a.scope.agentId === b.scope.agentId
        && a.engines.length === b.engines.length
        && a.engines.every((allowed) => b.engines.includes(allowed));
}
//# sourceMappingURL=development-session-state.js.map