export declare const PAPERCLIP_TURNO_SEGRETO_HEADER: "X-X9-Paperclip-Turno-Segreto";
export declare const paperclipProtocolloTurnoContract: {
    readonly method: "POST";
    readonly path: "/webhook/paperclip/turno";
    readonly authType: "external_provider";
    readonly bodySchema: import("zod").ZodObject<{
        runId: import("zod").ZodGUID;
        agentId: import("zod").ZodGUID;
        context: import("zod").ZodObject<{
            taskId: import("zod").ZodOptional<import("zod").ZodGUID>;
            issueId: import("zod").ZodOptional<import("zod").ZodGUID>;
            wakeReason: import("zod").ZodOptional<import("zod").ZodString>;
            wakeCommentId: import("zod").ZodOptional<import("zod").ZodGUID>;
            commentId: import("zod").ZodOptional<import("zod").ZodGUID>;
        }, import("zod/v4/core").$loose>;
    }, import("zod/v4/core").$loose>;
    readonly responseSchema: import("zod").ZodObject<{
        ok: import("zod").ZodLiteral<true>;
        runId: import("zod").ZodGUID;
    }, import("zod/v4/core").$strict>;
};
//# sourceMappingURL=paperclip-protocollo-turno.d.ts.map