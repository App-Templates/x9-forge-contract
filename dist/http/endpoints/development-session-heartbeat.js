import { z } from 'zod';
import { AuthDeviceSignatureSchema } from "../../auth/device-signature.js";
import { DevelopmentSessionBindingSchema } from "../../capability/connect/development-session.js";
import { DevelopmentSessionLeaseSchema } from "../../capability/connect/development-session-state.js";
import { DevelopmentSessionParamsSchema } from "./internal-development-sessions.js";
export const DevelopmentSessionHeartbeatSchema = z.object({
    binding: DevelopmentSessionBindingSchema,
    leaseId: DevelopmentSessionLeaseSchema.shape.leaseId,
    consentRef: DevelopmentSessionLeaseSchema.shape.consentRef,
    availableEngines: DevelopmentSessionLeaseSchema.shape.availableEngines,
}).strict().refine((heartbeat) => heartbeat.availableEngines.every((engine) => heartbeat.binding.engines.includes(engine)), { message: 'Available engines must be authorized by the binding', path: ['availableEngines'] });
/**
 * The service must verify the signature and nonce and a device registered for this
 * binding, including for cloud adapters. Header parsing only validates format.
 * Correlate path sessionId, binding, leaseId and consentRef with trusted registry
 * records; reject revoked sessions and never reactivate an expired lease with a
 * heartbeat (a new pairing is required). The service chooses all new timestamps
 * and expiry. This grants no A11 authorization and does not renew productive work.
 */
export const heartbeatDevelopmentSessionContract = {
    method: 'POST',
    path: '/connect/development-sessions/:sessionId/heartbeat',
    authType: 'device_signature',
    headersSchema: AuthDeviceSignatureSchema,
    paramsSchema: DevelopmentSessionParamsSchema,
    bodySchema: DevelopmentSessionHeartbeatSchema,
    responseSchema: DevelopmentSessionLeaseSchema,
};
//# sourceMappingURL=development-session-heartbeat.js.map