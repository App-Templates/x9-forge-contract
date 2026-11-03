import { z } from 'zod';
import { sameCapabilityScope } from "../capability-call-context.js";
import { Instant, RefId, sameValue } from "../coach/shared.js";
import { ElevenLabsAgentMappingSchema, sameElevenLabsMapping } from "./index.js";
import { ElevenLabsNativeDesiredConfigSchema } from "./native-config.js";
export const ElevenLabsNativeResourceObservationSchema = z.object({ mapping: ElevenLabsAgentMappingSchema,
    observedAt: Instant, source: z.literal('provider-read'), presence: z.enum(['present', 'missing', 'unknown']),
}).strict();
const fields = { requestId: RefId, mapping: ElevenLabsAgentMappingSchema, observedAt: Instant, source: z.literal('provider-read') };
export const ElevenLabsNativeConfigReadbackSchema = z.discriminatedUnion('status', [
    z.object({ ...fields, status: z.literal('known'), observed: ElevenLabsNativeDesiredConfigSchema }).strict().refine(x => sameCapabilityScope(x.mapping.scope, x.observed.scope), 'Readback belongs to mapped agent'),
    z.object({ ...fields, status: z.enum(['missing', 'stale', 'mismatch', 'error', 'unknown']) }).strict(),
]);
/** Only a complete fresh readback can justify applied. Receipt and resource presence are insufficient. */
export function isElevenLabsNativeConfigApplied(rawDesired, rawReadback, rawMapping, now, maxAgeSeconds = 60) {
    const desired = ElevenLabsNativeDesiredConfigSchema.safeParse(rawDesired), readback = ElevenLabsNativeConfigReadbackSchema.safeParse(rawReadback);
    const mapping = ElevenLabsAgentMappingSchema.safeParse(rawMapping), time = now.getTime();
    if (!desired.success || !readback.success || !mapping.success || readback.data.status !== 'known' || !Number.isFinite(time)
        || !Number.isInteger(maxAgeSeconds) || maxAgeSeconds <= 0 || maxAgeSeconds > 60)
        return false;
    const observed = Date.parse(readback.data.observedAt);
    return observed <= time && time - observed <= maxAgeSeconds * 1000
        && sameElevenLabsMapping(readback.data.mapping, mapping.data) && sameCapabilityScope(mapping.data.scope, desired.data.scope)
        && mapping.data.appliedConfigVersion === desired.data.configVersion && sameValue(readback.data.observed, desired.data);
}
//# sourceMappingURL=native-readback.js.map