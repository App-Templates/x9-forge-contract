import { z } from 'zod';
/** Caller-chosen idempotency key, unique per intended command (e.g. a UUID). */
export declare const AgentManagementRequestIdSchema: z.ZodString;
export type AgentManagementRequestId = z.infer<typeof AgentManagementRequestIdSchema>;
//# sourceMappingURL=agent-management-request-id.d.ts.map