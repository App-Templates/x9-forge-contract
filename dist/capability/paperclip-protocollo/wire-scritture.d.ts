import { z } from 'zod';
export declare const PAPERCLIP_CHECKOUT_STATI_ATTESI: readonly ["todo", "backlog", "blocked", "in_review"];
export declare const PaperclipCheckoutCorpoSchema: z.ZodObject<{
    agentId: z.ZodGUID;
    expectedStatuses: z.ZodArray<z.ZodEnum<{
        cancelled: "cancelled";
        done: "done";
        blocked: "blocked";
        backlog: "backlog";
        todo: "todo";
        in_progress: "in_progress";
        in_review: "in_review";
    }>>;
}, z.core.$strict>;
export declare const PaperclipFiglioCorpoSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    assigneeAgentId: z.ZodGUID;
    goalId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    blockParentUntilDone: z.ZodLiteral<true>;
}, z.core.$strict>;
export declare const PaperclipAggiornaCorpoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        cancelled: "cancelled";
        done: "done";
        blocked: "blocked";
        backlog: "backlog";
        todo: "todo";
        in_progress: "in_progress";
        in_review: "in_review";
    }>>;
    comment: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const PaperclipCommentoCorpoSchema: z.ZodObject<{
    body: z.ZodString;
}, z.core.$strict>;
export declare const PaperclipPianoCorpoSchema: z.ZodObject<{
    format: z.ZodLiteral<"markdown">;
    body: z.ZodString;
    changeSummary: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const PaperclipDocumentoSchema: z.ZodObject<{
    id: z.ZodGUID;
    key: z.ZodString;
    latestRevisionId: z.ZodGUID;
    latestRevisionNumber: z.ZodOptional<z.ZodNumber>;
}, z.core.$loose>;
export declare const PaperclipConfermaCorpoSchema: z.ZodObject<{
    kind: z.ZodLiteral<"request_confirmation">;
    payload: z.ZodObject<{
        version: z.ZodLiteral<1>;
        prompt: z.ZodString;
        target: z.ZodObject<{
            type: z.ZodLiteral<"issue_document">;
            key: z.ZodLiteral<"plan">;
            revisionId: z.ZodGUID;
        }, z.core.$strict>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const PaperclipInterazioneSchema: z.ZodObject<{
    id: z.ZodGUID;
    kind: z.ZodString;
    status: z.ZodString;
}, z.core.$loose>;
export type PaperclipCheckoutCorpo = z.infer<typeof PaperclipCheckoutCorpoSchema>;
export type PaperclipFiglioCorpo = z.infer<typeof PaperclipFiglioCorpoSchema>;
export type PaperclipAggiornaCorpo = z.infer<typeof PaperclipAggiornaCorpoSchema>;
export type PaperclipCommentoCorpo = z.infer<typeof PaperclipCommentoCorpoSchema>;
export type PaperclipPianoCorpo = z.infer<typeof PaperclipPianoCorpoSchema>;
export type PaperclipDocumento = z.infer<typeof PaperclipDocumentoSchema>;
export type PaperclipConfermaCorpo = z.infer<typeof PaperclipConfermaCorpoSchema>;
export type PaperclipInterazione = z.infer<typeof PaperclipInterazioneSchema>;
//# sourceMappingURL=wire-scritture.d.ts.map