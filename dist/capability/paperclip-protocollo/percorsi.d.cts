import { z } from 'zod';
export declare const PAPERCLIP_RUN_ID_HEADER: "X-Paperclip-Run-Id";
export declare const PAPERCLIP_PREFISSO_API: "/api";
export declare const PAPERCLIP_ELENCO_LIMITE_PREDEFINITO = 500;
export declare const PAPERCLIP_ELENCO_LIMITE_MASSIMO = 1000;
export declare const PAPERCLIP_COMMENTI_LIMITE_MASSIMO = 500;
export declare const PaperclipElencoIncarichiFiltriSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        cancelled: "cancelled";
        done: "done";
        blocked: "blocked";
        backlog: "backlog";
        todo: "todo";
        in_progress: "in_progress";
        in_review: "in_review";
    }>>>;
    assigneeAgentId: z.ZodOptional<z.ZodUnion<readonly [z.ZodGUID, z.ZodLiteral<"null">]>>;
    participantAgentId: z.ZodOptional<z.ZodGUID>;
    projectId: z.ZodOptional<z.ZodGUID>;
    parentId: z.ZodOptional<z.ZodGUID>;
    descendantOf: z.ZodOptional<z.ZodGUID>;
    createdFromIssueId: z.ZodOptional<z.ZodGUID>;
    q: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodInt>;
    offset: z.ZodOptional<z.ZodInt>;
    afterId: z.ZodOptional<z.ZodGUID>;
    sortField: z.ZodOptional<z.ZodEnum<{
        id: "id";
        updated: "updated";
    }>>;
    sortDir: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    attention: z.ZodOptional<z.ZodLiteral<"blocked">>;
}, z.core.$strict>;
export type PaperclipElencoIncarichiFiltri = z.infer<typeof PaperclipElencoIncarichiFiltriSchema>;
export declare const PaperclipCommentiQuerySchema: z.ZodObject<{
    after: z.ZodOptional<z.ZodGUID>;
    order: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    limit: z.ZodOptional<z.ZodInt>;
}, z.core.$strict>;
export type PaperclipCommentiQuery = z.infer<typeof PaperclipCommentiQuerySchema>;
/** I percorsi di Paperclip portano `/api`; un client con base URL già terminata in `/api` usa questo. */
export declare function paperclipPercorsoSenzaPrefisso(percorso: string): string;
export declare const paperclipPercorsi: {
    agenteMe(): string;
    contesto(id: string, wakeCommentId?: string): string;
    commenti(id: string, query?: PaperclipCommentiQuery): string;
    commento(id: string, commentId: string): string;
    checkout(id: string): string;
    figli(id: string): string;
    incarico(id: string): string;
    piano(id: string): string;
    interazioni(id: string): string;
    incarichiAzienda(companyId: string): string;
    elencoIncarichi(companyId: string, filtri?: PaperclipElencoIncarichiFiltri): string;
    agente(agentId: string): string;
    rilascio(id: string): string;
    titolo(id: string): string;
    monitorCheckNow(id: string): string;
    watchdog(id: string): string;
    corsa(runId: string): string;
    annullaCorsa(runId: string): string;
    documento(issueId: string, key: string): string;
    approvazioni(companyId: string): string;
};
//# sourceMappingURL=percorsi.d.ts.map