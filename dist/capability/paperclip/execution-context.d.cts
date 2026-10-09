import { z } from 'zod';
/** Key NAMES only. Both values come from the existing per-agent writer/load pipeline. */
export declare const PAPERCLIP_API_KEY: "PAPERCLIP_API_KEY";
export declare const PAPERCLIP_X9_ADAPTER_SECRET: "PAPERCLIP_X9_ADAPTER_SECRET";
/**
 * Server-produced dispatch metadata after single-use native admission. The cap must still
 * authenticate the host, compare its current binding and revalidate native state before mutation.
 * Host timestamps bound host work only; they never attest effective native adapter timeout.
 */
export declare const PaperclipExecutionContextSchema: z.ZodObject<{
    admissionId: z.ZodUUID;
    challenge: z.ZodString;
    hostIssuedAt: z.ZodISODateTime;
    hostDeadlineAt: z.ZodISODateTime;
    companyId: z.ZodUUID;
    paperclipAgentId: z.ZodUUID;
    runId: z.ZodUUID;
    issueId: z.ZodUUID;
    capability: z.ZodLiteral<"paperclip">;
    source: z.ZodLiteral<"x9_native_admission">;
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    configVersion: z.ZodNumber;
    provisioningRevision: z.ZodNumber;
    sessionId: z.ZodString;
}, z.core.$strict>;
export type PaperclipExecutionContext = z.infer<typeof PaperclipExecutionContextSchema>;
/** Pure correspondence with an actual readback, not admission, CAS, native state or freshness. */
export declare function matchesPaperclipExecution(rawReadback: unknown, rawExecution: unknown): boolean;
/** Host-clock budget check only. A true result says nothing about native run activity/lease. */
export declare function isPaperclipHostWindowOpen(rawExecution: unknown, nowMs: number): boolean;
//# sourceMappingURL=execution-context.d.ts.map