import { z } from 'zod';
export declare const PAPERCLIP_STATI_INCARICO: readonly ["backlog", "todo", "in_progress", "in_review", "done", "blocked", "cancelled"];
export declare const PaperclipStatoIncaricoSchema: z.ZodEnum<{
    cancelled: "cancelled";
    done: "done";
    blocked: "blocked";
    backlog: "backlog";
    todo: "todo";
    in_progress: "in_progress";
    in_review: "in_review";
}>;
export declare const PaperclipBloccoSchema: z.ZodObject<{
    id: z.ZodGUID;
    status: z.ZodEnum<{
        cancelled: "cancelled";
        done: "done";
        blocked: "blocked";
        backlog: "backlog";
        todo: "todo";
        in_progress: "in_progress";
        in_review: "in_review";
    }>;
    title: z.ZodOptional<z.ZodString>;
    identifier: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    assigneeAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
}, z.core.$loose>;
export declare const PaperclipIncaricoSchema: z.ZodObject<{
    id: z.ZodGUID;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodEnum<{
        cancelled: "cancelled";
        done: "done";
        blocked: "blocked";
        backlog: "backlog";
        todo: "todo";
        in_progress: "in_progress";
        in_review: "in_review";
    }>;
    parentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    goalId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    assigneeAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    blockedBy: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodGUID;
        status: z.ZodEnum<{
            cancelled: "cancelled";
            done: "done";
            blocked: "blocked";
            backlog: "backlog";
            todo: "todo";
            in_progress: "in_progress";
            in_review: "in_review";
        }>;
        title: z.ZodOptional<z.ZodString>;
        identifier: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        assigneeAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    }, z.core.$loose>>>;
}, z.core.$loose>;
export declare const PaperclipCommentoSchema: z.ZodObject<{
    id: z.ZodGUID;
    body: z.ZodString;
    authorAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    authorUserId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodString>;
}, z.core.$loose>;
export declare const PaperclipCommentiSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodGUID;
    body: z.ZodString;
    authorAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    authorUserId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodString>;
}, z.core.$loose>>;
export declare const PaperclipContestoTurnoSchema: z.ZodObject<{
    issue: z.ZodObject<{
        id: z.ZodGUID;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        status: z.ZodEnum<{
            cancelled: "cancelled";
            done: "done";
            blocked: "blocked";
            backlog: "backlog";
            todo: "todo";
            in_progress: "in_progress";
            in_review: "in_review";
        }>;
        parentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
        goalId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
        assigneeAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
        blockedBy: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodGUID;
            status: z.ZodEnum<{
                cancelled: "cancelled";
                done: "done";
                blocked: "blocked";
                backlog: "backlog";
                todo: "todo";
                in_progress: "in_progress";
                in_review: "in_review";
            }>;
            title: z.ZodOptional<z.ZodString>;
            identifier: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            assigneeAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
    ancestors: z.ZodArray<z.ZodObject<{
        id: z.ZodGUID;
        title: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            cancelled: "cancelled";
            done: "done";
            blocked: "blocked";
            backlog: "backlog";
            todo: "todo";
            in_progress: "in_progress";
            in_review: "in_review";
        }>>;
    }, z.core.$loose>>;
    wakeComment: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodGUID;
        body: z.ZodString;
        authorAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
        authorUserId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>>>;
}, z.core.$loose>;
export declare const PaperclipAgenteMeSchema: z.ZodObject<{
    id: z.ZodGUID;
    companyId: z.ZodGUID;
}, z.core.$loose>;
export declare const PaperclipErroreRispostaSchema: z.ZodObject<{
    error: z.ZodString;
}, z.core.$loose>;
export type PaperclipStatoIncarico = z.infer<typeof PaperclipStatoIncaricoSchema>;
export type PaperclipBlocco = z.infer<typeof PaperclipBloccoSchema>;
export type PaperclipIncarico = z.infer<typeof PaperclipIncaricoSchema>;
export type PaperclipCommento = z.infer<typeof PaperclipCommentoSchema>;
export type PaperclipCommenti = z.infer<typeof PaperclipCommentiSchema>;
export type PaperclipContestoTurno = z.infer<typeof PaperclipContestoTurnoSchema>;
export type PaperclipAgenteMe = z.infer<typeof PaperclipAgenteMeSchema>;
export type PaperclipErroreRisposta = z.infer<typeof PaperclipErroreRispostaSchema>;
//# sourceMappingURL=wire-letture.d.ts.map