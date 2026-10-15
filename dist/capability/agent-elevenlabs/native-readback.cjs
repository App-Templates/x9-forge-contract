"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevenLabsNativeConfigReadbackSchema = exports.ElevenLabsNativeResourceObservationSchema = void 0;
exports.isElevenLabsNativeConfigApplied = isElevenLabsNativeConfigApplied;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const shared_js_1 = require("../coach/shared.cjs");
const index_js_1 = require("./index.cjs");
const native_config_js_1 = require("./native-config.cjs");
exports.ElevenLabsNativeResourceObservationSchema = zod_1.z.object({ mapping: index_js_1.ElevenLabsAgentMappingSchema,
    observedAt: shared_js_1.Instant, source: zod_1.z.literal('provider-read'), presence: zod_1.z.enum(['present', 'missing', 'unknown']),
}).strict();
const fields = { requestId: shared_js_1.RefId, mapping: index_js_1.ElevenLabsAgentMappingSchema, observedAt: shared_js_1.Instant, source: zod_1.z.literal('provider-read') };
exports.ElevenLabsNativeConfigReadbackSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.object({ ...fields, status: zod_1.z.literal('known'), observed: native_config_js_1.ElevenLabsNativeDesiredConfigSchema }).strict().refine(x => (0, capability_call_context_js_1.sameCapabilityScope)(x.mapping.scope, x.observed.scope), 'Readback belongs to mapped agent'),
    zod_1.z.object({ ...fields, status: zod_1.z.enum(['missing', 'stale', 'mismatch', 'error', 'unknown']) }).strict(),
]);
/** Only a complete fresh readback can justify applied. Receipt and resource presence are insufficient. */
function isElevenLabsNativeConfigApplied(rawDesired, rawReadback, rawMapping, now, maxAgeSeconds = 60) {
    const desired = native_config_js_1.ElevenLabsNativeDesiredConfigSchema.safeParse(rawDesired), readback = exports.ElevenLabsNativeConfigReadbackSchema.safeParse(rawReadback);
    const mapping = index_js_1.ElevenLabsAgentMappingSchema.safeParse(rawMapping), time = now.getTime();
    if (!desired.success || !readback.success || !mapping.success || readback.data.status !== 'known' || !Number.isFinite(time)
        || !Number.isInteger(maxAgeSeconds) || maxAgeSeconds <= 0 || maxAgeSeconds > 60)
        return false;
    const observed = Date.parse(readback.data.observedAt);
    return observed <= time && time - observed <= maxAgeSeconds * 1000
        && (0, index_js_1.sameElevenLabsMapping)(readback.data.mapping, mapping.data) && (0, capability_call_context_js_1.sameCapabilityScope)(mapping.data.scope, desired.data.scope)
        && mapping.data.appliedConfigVersion === desired.data.configVersion && (0, shared_js_1.sameValue)(readback.data.observed, desired.data);
}
//# sourceMappingURL=native-readback.js.map