import { z } from 'zod';
export declare const PAPERCLIP_TURNO_SEGRETO_HEADER: "X-X9-Paperclip-Turno-Segreto";
export declare const paperclipProtocolloTurnoContract: {
    readonly method: "POST";
    readonly path: "/webhook/paperclip/turno";
    readonly authType: "external_provider";
    readonly bodySchema: z.ZodObject<{
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
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        runId: z.ZodGUID;
    }, z.core.$strict>;
};
//# sourceMappingURL=paperclip-protocollo-turno.d.ts.map