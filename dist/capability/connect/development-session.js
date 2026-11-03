import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../capability-call-identity.js";
import { DeviceIdSchema } from "../../auth/device-signature.js";
/** Engines are independent of the local/cloud session target. */
export const DevelopmentSessionEngineSchema = z.enum(['claude', 'codex']);
export const DevelopmentSessionEnginesSchema = z.array(DevelopmentSessionEngineSchema).min(1).max(2)
    .refine((engines) => new Set(engines).size === engines.length, {
    message: 'Development session engines must be unique',
});
/** Public references only; local connections are initiated outbound by the device. */
export const DevelopmentSessionTargetSchema = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('local'), deviceId: DeviceIdSchema }).strict(),
    z.object({ kind: z.literal('cloud'), connectionRef: z.string().min(1) }).strict(),
]);
/** Configured reference only: neither online presence nor permission to execute. */
export const DevelopmentSessionBindingSchema = z.object({
    scope: z.lazy(() => CapabilityAgentScopeSchema),
    sessionId: z.string().min(1),
    target: DevelopmentSessionTargetSchema,
    engines: DevelopmentSessionEnginesSchema,
}).strict();
//# sourceMappingURL=development-session.js.map