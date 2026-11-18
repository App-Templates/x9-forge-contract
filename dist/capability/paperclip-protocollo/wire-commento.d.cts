import { z } from 'zod';
import { type PaperclipStatoIncarico } from "./wire-letture.cjs";
export declare const PAPERCLIP_ALLEGATI_MASSIMI_PER_COMMENTO = 20;
/** Fields accepted by Paperclip but forbidden to agents; strict schemas reject each one. */
export declare const PAPERCLIP_CAMPI_COMMENTO_VIETATI: {
    readonly clientRequestId: "per un attore agente Paperclip lo ignora (routes/issues.ts:17739): un reinvio crea due commenti";
    readonly commentClientRequestId: "per un attore agente Paperclip lo ignora (routes/issues.ts:17739)";
    readonly interrupt: "solo utenti board, 403 (routes/issues.ts:13025-13038,17520-17527)";
    readonly onBehalfOfUserId: "respinto come spoof dell'attribuzione (issue_write_attribution_spoof_rejected; packages/shared/src/issue-write-denial.ts:26-35)";
    readonly authorType: "deve combaciare con l'attore autenticato (services/issues.ts:6765-6779): lo mette il server";
    readonly presentation: "solo utenti board, 403 (routes/issues.ts:6369-6390)";
    readonly metadata: "solo utenti board, 403 (routes/issues.ts:6369-6390)";
};
/** POST comment: text, previously uploaded attachments and an explicit reopen/resume intent. */
export declare const PaperclipCommentoCorpoEstesoSchema: z.ZodObject<{
    body: z.ZodString;
    attachmentIds: z.ZodOptional<z.ZodArray<z.ZodUUID>>;
    reopen: z.ZodOptional<z.ZodLiteral<true>>;
    resume: z.ZodOptional<z.ZodLiteral<true>>;
}, z.core.$strict>;
export type PaperclipCommentoCorpoEsteso = z.infer<typeof PaperclipCommentoCorpoEstesoSchema>;
/** PATCH issue: status, comment, assignee ID, attachments and an explicit reopen/resume intent. */
export declare const PaperclipAggiornaConCommentoCorpoSchema: z.ZodObject<{
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
    assigneeAgentId: z.ZodOptional<z.ZodGUID>;
    attachmentIds: z.ZodOptional<z.ZodArray<z.ZodUUID>>;
    reopen: z.ZodOptional<z.ZodLiteral<true>>;
    resume: z.ZodOptional<z.ZodLiteral<true>>;
}, z.core.$strict>;
export type PaperclipAggiornaConCommentoCorpo = z.infer<typeof PaperclipAggiornaConCommentoCorpoSchema>;
export declare const PAPERCLIP_STATI_RIPRENDIBILI: readonly ["done", "cancelled", "blocked", "todo", "in_progress"];
export declare const PAPERCLIP_RIPRESA_RIFIUTI: readonly ["non_riprendibile", "cancellato_serve_resume", "blocchi_non_risolti", "sottoalbero_in_pausa", "senza_assegnatario"];
export type PaperclipRipresaRifiuto = (typeof PAPERCLIP_RIPRESA_RIFIUTI)[number];
export interface PaperclipRipresaFatti {
    via: 'reopen' | 'resume';
    stato: PaperclipStatoIncarico;
    bloccantiNonRisolti: number;
    sottoalberoInPausa: boolean;
    haAssegnatarioAgente: boolean;
}
/**
 * Paperclip's 409 resume refusals (routes/issues.ts:6409-6514): backlog and in_review cannot resume;
 * cancelled requires resume; unresolved blockers, a paused subtree or no agent assignee prevent resuming.
 */
export declare function paperclipRipresaAmmessa(fatti: PaperclipRipresaFatti): {
    ok: true;
} | {
    ok: false;
    motivo: PaperclipRipresaRifiuto;
};
export declare const PaperclipCambiamentiSchema: z.ZodRecord<z.ZodString, z.ZodObject<{
    from: z.ZodUnknown;
    to: z.ZodUnknown;
}, z.core.$strict>>;
export declare const PaperclipAggiornaRispostaMinimaSchema: z.ZodObject<{
    id: z.ZodGUID;
    identifier: z.ZodNullable<z.ZodString>;
    updatedAt: z.ZodString;
    changes: z.ZodRecord<z.ZodString, z.ZodObject<{
        from: z.ZodUnknown;
        to: z.ZodUnknown;
    }, z.core.$strict>>;
    comment: z.ZodNullable<z.ZodObject<{
        id: z.ZodGUID;
    }, z.core.$loose>>;
}, z.core.$strict>;
export declare const PaperclipAggiornaRispostaCompletaSchema: z.ZodObject<{
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
    changes: z.ZodRecord<z.ZodString, z.ZodObject<{
        from: z.ZodUnknown;
        to: z.ZodUnknown;
    }, z.core.$strict>>;
    comment: z.ZodNullable<z.ZodObject<{
        id: z.ZodGUID;
    }, z.core.$loose>>;
}, z.core.$loose>;
export declare const PaperclipAggiornaRispostaSchema: z.ZodUnion<readonly [z.ZodObject<{
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
    changes: z.ZodRecord<z.ZodString, z.ZodObject<{
        from: z.ZodUnknown;
        to: z.ZodUnknown;
    }, z.core.$strict>>;
    comment: z.ZodNullable<z.ZodObject<{
        id: z.ZodGUID;
    }, z.core.$loose>>;
}, z.core.$loose>, z.ZodObject<{
    id: z.ZodGUID;
    identifier: z.ZodNullable<z.ZodString>;
    updatedAt: z.ZodString;
    changes: z.ZodRecord<z.ZodString, z.ZodObject<{
        from: z.ZodUnknown;
        to: z.ZodUnknown;
    }, z.core.$strict>>;
    comment: z.ZodNullable<z.ZodObject<{
        id: z.ZodGUID;
    }, z.core.$loose>>;
}, z.core.$strict>]>;
export type PaperclipAggiornaRisposta = z.infer<typeof PaperclipAggiornaRispostaSchema>;
/**
 * Paperclip ignores clientRequestId for agents (routes/issues.ts:17739), so retries can duplicate comments.
 * After an uncertain result, read recent comments in descending order before deciding whether to write again.
 */
export declare function paperclipCommentoGiaScritto(commentiRecenti: readonly {
    body: string;
    authorAgentId?: string | null | undefined;
}[], authorAgentId: string, body: string): boolean;
//# sourceMappingURL=wire-commento.d.ts.map