import { z } from 'zod';
export declare const PAPERCLIP_CORSA_STATI: readonly ["queued", "scheduled_retry", "running", "succeeded", "interrupted", "failed", "cancelled", "timed_out"];
export declare const PaperclipCorsaStatoSchema: z.ZodEnum<{
    succeeded: "succeeded";
    failed: "failed";
    cancelled: "cancelled";
    queued: "queued";
    running: "running";
    interrupted: "interrupted";
    scheduled_retry: "scheduled_retry";
    timed_out: "timed_out";
}>;
export type PaperclipCorsaStato = z.infer<typeof PaperclipCorsaStatoSchema>;
export declare const PAPERCLIP_CORSA_STATI_FINALI: readonly ["succeeded", "failed", "cancelled", "timed_out"];
export declare const PAPERCLIP_ANNULLO_STATO_RICHIESTO: "requested";
/** GET /api/heartbeat-runs/:runId (server/src/routes/agents.ts:6969): preserves fields the bridge does not read. */
export declare const PaperclipCorsaSchema: z.ZodObject<{
    id: z.ZodGUID;
    agentId: z.ZodGUID;
    companyId: z.ZodGUID;
    status: z.ZodEnum<{
        succeeded: "succeeded";
        failed: "failed";
        cancelled: "cancelled";
        queued: "queued";
        running: "running";
        interrupted: "interrupted";
        scheduled_retry: "scheduled_retry";
        timed_out: "timed_out";
    }>;
    resultJson: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        executionCancellation: z.ZodOptional<z.ZodObject<{
            state: z.ZodString;
        }, z.core.$loose>>;
    }, z.core.$loose>>>;
}, z.core.$loose>;
export type PaperclipCorsa = z.infer<typeof PaperclipCorsaSchema>;
/**
 * Issue writes require a running run without a cancellation request. Paperclip revokes writes as soon as
 * cancellation is requested (agent-run-cancellation.ts:6-13: agent_run_cancelled, HTTP 403 on methods other than
 * GET/HEAD/OPTIONS). Agent writes also require a persistent run bound to that agent (doc/SPEC-implementation.md:631-634).
 * Reads remain allowed.
 */
export declare function paperclipCorsaPuoScrivere(corsa: Pick<PaperclipCorsa, 'status' | 'resultJson'>): boolean;
/** Run cancellation requires a board actor (assertBoard, routes/agents.ts:6986-7014). */
export declare const PAPERCLIP_ANNULLO_CORSA_ATTORI: readonly ["board"];
export declare function paperclipAnnulloCorsaAmmesso(attore: 'board' | 'agent' | 'user'): {
    ok: true;
} | {
    ok: false;
    motivo: 'solo_board';
};
/**
 * Cancellation returns the run itself (routes/agents.ts:7014; public API 467125f returns { id, status }).
 * Only the requested run in the cancelled state confirms cancellation. Additional fields are preserved.
 */
export declare const PaperclipCorsaAnnullataSchema: z.ZodObject<{
    id: z.ZodGUID;
    status: z.ZodLiteral<"cancelled">;
}, z.core.$loose>;
export declare function paperclipAnnulloCorsaConfermato(runIdChiesto: string, risposta: unknown): boolean;
//# sourceMappingURL=corsa.d.ts.map