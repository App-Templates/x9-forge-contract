import { z } from 'zod';
export declare const PaperclipTurnoContestoSchema: z.ZodObject<{
    taskId: z.ZodOptional<z.ZodGUID>;
    issueId: z.ZodOptional<z.ZodGUID>;
    wakeReason: z.ZodOptional<z.ZodString>;
    wakeCommentId: z.ZodOptional<z.ZodGUID>;
    commentId: z.ZodOptional<z.ZodGUID>;
}, z.core.$loose>;
export type PaperclipTurnoContesto = z.infer<typeof PaperclipTurnoContestoSchema>;
export declare const PaperclipTurnoRichiestaSchema: z.ZodObject<{
    runId: z.ZodGUID;
    agentId: z.ZodGUID;
    context: z.ZodObject<{
        taskId: z.ZodOptional<z.ZodGUID>;
        issueId: z.ZodOptional<z.ZodGUID>;
        wakeReason: z.ZodOptional<z.ZodString>;
        wakeCommentId: z.ZodOptional<z.ZodGUID>;
        commentId: z.ZodOptional<z.ZodGUID>;
    }, z.core.$loose>;
}, z.core.$loose>;
export type PaperclipTurnoRichiesta = z.infer<typeof PaperclipTurnoRichiestaSchema>;
export declare const PaperclipTurnoRispostaSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    runId: z.ZodGUID;
}, z.core.$strict>;
export type PaperclipTurnoRisposta = z.infer<typeof PaperclipTurnoRispostaSchema>;
export declare const PAPERCLIP_TURNO_ERRORI: readonly ["feature_off", "segreto_non_valido", "richiesta_non_valida", "agente_sconosciuto", "turno_gia_aperto", "turno_fallito"];
export declare const PaperclipTurnoErroreSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        feature_off: "feature_off";
        segreto_non_valido: "segreto_non_valido";
        richiesta_non_valida: "richiesta_non_valida";
        agente_sconosciuto: "agente_sconosciuto";
        turno_gia_aperto: "turno_gia_aperto";
        turno_fallito: "turno_fallito";
    }>;
}, z.core.$strict>;
export type PaperclipTurnoErrore = z.infer<typeof PaperclipTurnoErroreSchema>;
export declare function incaricoDelTurno(ctx: PaperclipTurnoContesto): string | null;
//# sourceMappingURL=turno.d.ts.map