"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRuntimeSourceSchema = exports.AgentRuntimeCompletenessSchema = exports.AgentRuntimeAvailabilitySchema = void 0;
const zod_1 = require("zod");
exports.AgentRuntimeAvailabilitySchema = zod_1.z.enum(['available', 'unavailable', 'unknown']);
exports.AgentRuntimeCompletenessSchema = zod_1.z.enum(['complete', 'partial', 'unknown']);
/** Source observations describe inventory coverage, not an agent's readiness. */
exports.AgentRuntimeSourceSchema = zod_1.z.object({
    authority: zod_1.z.literal('x9'),
    availability: exports.AgentRuntimeAvailabilitySchema,
    completeness: exports.AgentRuntimeCompletenessSchema,
    observedAt: zod_1.z.iso.datetime().nullable(),
}).superRefine((source, ctx) => {
    if (source.completeness === 'complete' && source.availability !== 'available') {
        ctx.addIssue({ code: 'custom', path: ['completeness'], message: 'An unavailable or unknown source cannot prove a complete inventory' });
    }
    if (source.availability === 'available' && source.observedAt === null) {
        ctx.addIssue({ code: 'custom', path: ['observedAt'], message: 'An available source requires an observation timestamp' });
    }
});
//# sourceMappingURL=agent-runtime-source.js.map