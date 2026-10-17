"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevelopmentSessionBindingSchema = exports.DevelopmentSessionTargetSchema = exports.DevelopmentSessionEnginesSchema = exports.DevelopmentSessionEngineSchema = void 0;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
const device_signature_js_1 = require("../../auth/device-signature.cjs");
/** Engines are independent of the local/cloud session target. */
exports.DevelopmentSessionEngineSchema = zod_1.z.enum(['claude', 'codex']);
exports.DevelopmentSessionEnginesSchema = zod_1.z.array(exports.DevelopmentSessionEngineSchema).min(1).max(2)
    .refine((engines) => new Set(engines).size === engines.length, {
    message: 'Development session engines must be unique',
});
/** Public references only; local connections are initiated outbound by the device. */
exports.DevelopmentSessionTargetSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.object({ kind: zod_1.z.literal('local'), deviceId: device_signature_js_1.DeviceIdSchema }).strict(),
    zod_1.z.object({ kind: zod_1.z.literal('cloud'), connectionRef: zod_1.z.string().min(1) }).strict(),
]);
/** Configured reference only: neither online presence nor permission to execute. */
exports.DevelopmentSessionBindingSchema = zod_1.z.object({
    scope: zod_1.z.lazy(() => capability_call_identity_js_1.CapabilityAgentScopeSchema),
    sessionId: zod_1.z.string().min(1),
    target: exports.DevelopmentSessionTargetSchema,
    engines: exports.DevelopmentSessionEnginesSchema,
}).strict();
//# sourceMappingURL=development-session.js.map