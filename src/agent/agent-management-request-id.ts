import { z } from 'zod';

/** Caller-chosen idempotency key, unique per intended command (e.g. a UUID). */
export const AgentManagementRequestIdSchema = z.string().min(8).max(128).regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/);
export type AgentManagementRequestId = z.infer<typeof AgentManagementRequestIdSchema>;