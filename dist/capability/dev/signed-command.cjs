"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevSignedCommandV2Schema = exports.DEV_SIGNED_COMMAND_V2_DOMAIN = void 0;
exports.canonicalizeDevSignedCommandV2 = canonicalizeDevSignedCommandV2;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
exports.DEV_SIGNED_COMMAND_V2_DOMAIN = 'x9.cap-dev.command';
/** The complete scope is signed; omitted report digests are encoded as null. */
exports.DevSignedCommandV2Schema = zod_1.z.strictObject({
    version: zod_1.z.literal(2),
    domain: zod_1.z.literal(exports.DEV_SIGNED_COMMAND_V2_DOMAIN),
    tenantId: capability_call_identity_js_1.CapabilityCallIdentitySchema.shape.tenantId,
    ownerId: capability_call_identity_js_1.CapabilityCallIdentitySchema.shape.ownerId,
    agentId: capability_call_identity_js_1.CapabilityCallIdentitySchema.shape.agentId,
    boardId: zod_1.z.string().min(1),
    computerId: zod_1.z.string().min(1),
    projectId: zod_1.z.string().min(1),
    issueId: zod_1.z.string().min(1),
    command: zod_1.z.enum(['status', 'plan', 'start', 'stop', 'report']),
    reportDigest: zod_1.z.string().regex(/^[0-9a-fA-F]{64}$/).nullable().default(null),
    configVersion: zod_1.z.number().int().min(0),
    keyVersion: zod_1.z.number().int().min(1),
    requestId: zod_1.z.string().min(1),
    nonce: zod_1.z.string().min(16),
    expiresAt: zod_1.z.iso.datetime(),
});
/** Encode the returned compact JSON string as UTF-8 before signing/verifying. */
function canonicalizeDevSignedCommandV2(msg) {
    const parsed = exports.DevSignedCommandV2Schema.parse(msg);
    return JSON.stringify(Object.fromEntries(Object.entries(parsed).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)));
}
//# sourceMappingURL=signed-command.js.map