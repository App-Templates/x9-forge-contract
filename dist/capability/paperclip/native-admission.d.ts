import { z } from 'zod';
/** Native process observations. Parsing does not prove native execution or assignment. */
export declare const PaperclipNativeRunIdentitySchema: z.ZodObject<{
    companyId: z.ZodUUID;
    paperclipAgentId: z.ZodUUID;
    runId: z.ZodUUID;
    issueId: z.ZodUUID;
}, z.core.$strict>;
export type PaperclipNativeRunIdentity = z.infer<typeof PaperclipNativeRunIdentitySchema>;
/** Fresh host-generated 32-byte random challenge, not a credential or a native lease. */
export declare const PaperclipAdmissionChallengeSchema: z.ZodString;
/** Host-issued metadata shared by prepare, immutable receipt and server dispatch. */
export declare const PaperclipAdmissionMetadataSchema: z.ZodObject<{
    admissionId: z.ZodUUID;
    challenge: z.ZodString;
    hostIssuedAt: z.ZodISODateTime;
    hostDeadlineAt: z.ZodISODateTime;
    companyId: z.ZodUUID;
    paperclipAgentId: z.ZodUUID;
    runId: z.ZodUUID;
    issueId: z.ZodUUID;
}, z.core.$strict>;
/** Exactly one immutable stdout record, echoed from prepare and read through native JSONL. */
export declare const PaperclipNativeRunReceiptSchema: z.ZodObject<{
    admissionId: z.ZodUUID;
    challenge: z.ZodString;
    hostIssuedAt: z.ZodISODateTime;
    hostDeadlineAt: z.ZodISODateTime;
    companyId: z.ZodUUID;
    paperclipAgentId: z.ZodUUID;
    runId: z.ZodUUID;
    issueId: z.ZodUUID;
    kind: z.ZodLiteral<"paperclip.x9-run-binding">;
    schemaVersion: z.ZodLiteral<1>;
}, z.core.$strict>;
export type PaperclipNativeRunReceipt = z.infer<typeof PaperclipNativeRunReceiptSchema>;
/** Same per-agent turn endpoint, dedicated authenticated native caller; no caller scope/revision. */
export declare const PaperclipAdmissionRequestSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    phase: z.ZodLiteral<"prepare">;
    native: z.ZodObject<{
        companyId: z.ZodUUID;
        paperclipAgentId: z.ZodUUID;
        runId: z.ZodUUID;
        issueId: z.ZodUUID;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    phase: z.ZodLiteral<"commit">;
    admissionId: z.ZodUUID;
}, z.core.$strict>], "phase">;
export type PaperclipAdmissionRequest = z.infer<typeof PaperclipAdmissionRequestSchema>;
export declare const PaperclipAdmissionPreparedSchema: z.ZodObject<{
    admissionId: z.ZodUUID;
    challenge: z.ZodString;
    hostIssuedAt: z.ZodISODateTime;
    hostDeadlineAt: z.ZodISODateTime;
    companyId: z.ZodUUID;
    paperclipAgentId: z.ZodUUID;
    runId: z.ZodUUID;
    issueId: z.ZodUUID;
    phase: z.ZodLiteral<"prepared">;
}, z.core.$strict>;
export declare const PaperclipAdmissionCommittedSchema: z.ZodObject<{
    phase: z.ZodLiteral<"committed">;
    admissionId: z.ZodUUID;
    runId: z.ZodUUID;
}, z.core.$strict>;
export declare const PaperclipAdmissionResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    admissionId: z.ZodUUID;
    challenge: z.ZodString;
    hostIssuedAt: z.ZodISODateTime;
    hostDeadlineAt: z.ZodISODateTime;
    companyId: z.ZodUUID;
    paperclipAgentId: z.ZodUUID;
    runId: z.ZodUUID;
    issueId: z.ZodUUID;
    phase: z.ZodLiteral<"prepared">;
}, z.core.$strict>, z.ZodObject<{
    phase: z.ZodLiteral<"committed">;
    admissionId: z.ZodUUID;
    runId: z.ZodUUID;
}, z.core.$strict>], "phase">;
export type PaperclipAdmissionPrepared = z.infer<typeof PaperclipAdmissionPreparedSchema>;
export type PaperclipAdmissionCommitted = z.infer<typeof PaperclipAdmissionCommittedSchema>;
export type PaperclipAdmissionResponse = z.infer<typeof PaperclipAdmissionResponseSchema>;
/** Exact echo correspondence only; the host still verifies the single immutable native log record. */
export declare function matchesPaperclipReceipt(rawPrepared: unknown, rawReceipt: unknown): boolean;
//# sourceMappingURL=native-admission.d.ts.map