import { z } from 'zod';
export declare const PAPERCLIP_CREAZIONE_STATI: readonly ["backlog", "todo", "blocked"];
export declare const PaperclipCreazioneStatoSchema: z.ZodEnum<{
    blocked: "blocked";
    backlog: "backlog";
    todo: "todo";
}>;
export type PaperclipCreazioneStato = z.infer<typeof PaperclipCreazioneStatoSchema>;
/** Paperclip defaults to todo with an assignee and backlog without one when status is omitted. */
export declare function paperclipStatoCreazionePredefinito(haAssegnatario: boolean): 'todo' | 'backlog';
export declare const PAPERCLIP_IDEMPOTENZA_CHIAVE_MAX = 255;
export declare const PAPERCLIP_IDEMPOTENZA_GIORNI = 7;
export declare const PAPERCLIP_DEDUP_TITOLO_ORE = 48;
export declare const PAPERCLIP_DEDUP_MOTIVI: readonly ["idempotency_key", "recent_open_title"];
export declare const PaperclipDeduplicazioneMotivoSchema: z.ZodEnum<{
    idempotency_key: "idempotency_key";
    recent_open_title: "recent_open_title";
}>;
export type PaperclipDeduplicazioneMotivo = z.infer<typeof PaperclipDeduplicazioneMotivoSchema>;
export declare const PAPERCLIP_FIGLI_MASSIMI_PER_PADRE = 25;
export declare const PAPERCLIP_CRITERI_MASSIMI = 20;
export declare const PAPERCLIP_CRITERIO_MAX = 500;
export declare const PAPERCLIP_BLOCCHI_CREAZIONE_MASSIMI = 20;
/** Bridge limits, absent in Paperclip: title matches PUT /title, description matches pcp_affida. */
export declare const PAPERCLIP_TITOLO_MAX = 240;
export declare const PAPERCLIP_DESCRIZIONE_MAX = 20000;
export declare const PAPERCLIP_CORRIERE_DESCRIZIONE_MIN = 40;
/** POST /api/companies/:companyId/issues creates an issue with an assignee identified by id. */
export declare const PaperclipIncaricoCampiSchema: z.ZodObject<{
    parentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodGUID>;
    goalId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    blockedByIssueIds: z.ZodOptional<z.ZodArray<z.ZodGUID>>;
    unblockDescriptor: z.ZodOptional<z.ZodObject<{
        owner: z.ZodUnion<readonly [z.ZodObject<{
            agentId: z.ZodGUID;
        }, z.core.$strict>, z.ZodObject<{
            userId: z.ZodString;
        }, z.core.$strict>, z.ZodLiteral<"board">]>;
        action: z.ZodString;
    }, z.core.$strict>>;
    status: z.ZodOptional<z.ZodEnum<{
        blocked: "blocked";
        backlog: "backlog";
        todo: "todo";
    }>>;
    priority: z.ZodOptional<z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
        critical: "critical";
    }>>;
    assigneeAgentId: z.ZodOptional<z.ZodGUID>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
    allowDuplicate: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
export declare const PaperclipIncaricoCorpoSchema: z.ZodObject<{
    parentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodGUID>;
    goalId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    blockedByIssueIds: z.ZodOptional<z.ZodArray<z.ZodGUID>>;
    unblockDescriptor: z.ZodOptional<z.ZodObject<{
        owner: z.ZodUnion<readonly [z.ZodObject<{
            agentId: z.ZodGUID;
        }, z.core.$strict>, z.ZodObject<{
            userId: z.ZodString;
        }, z.core.$strict>, z.ZodLiteral<"board">]>;
        action: z.ZodString;
    }, z.core.$strict>>;
    status: z.ZodOptional<z.ZodEnum<{
        blocked: "blocked";
        backlog: "backlog";
        todo: "todo";
    }>>;
    priority: z.ZodOptional<z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
        critical: "critical";
    }>>;
    assigneeAgentId: z.ZodOptional<z.ZodGUID>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
    allowDuplicate: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
export type PaperclipIncaricoCorpo = z.infer<typeof PaperclipIncaricoCorpoSchema>;
/**
 * POST /api/issues/:id/children identifies the parent in the route, without parentId in the body.
 * Paperclip defaults blockParentUntilDone to false; callers waiting for the child must set true
 * explicitly (execution-semantics.md:247).
 */
export declare const PaperclipFiglioCreaCampiSchema: z.ZodObject<{
    acceptanceCriteria: z.ZodOptional<z.ZodArray<z.ZodString>>;
    blockParentUntilDone: z.ZodOptional<z.ZodBoolean>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodGUID>;
    goalId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    blockedByIssueIds: z.ZodOptional<z.ZodArray<z.ZodGUID>>;
    unblockDescriptor: z.ZodOptional<z.ZodObject<{
        owner: z.ZodUnion<readonly [z.ZodObject<{
            agentId: z.ZodGUID;
        }, z.core.$strict>, z.ZodObject<{
            userId: z.ZodString;
        }, z.core.$strict>, z.ZodLiteral<"board">]>;
        action: z.ZodString;
    }, z.core.$strict>>;
    status: z.ZodOptional<z.ZodEnum<{
        blocked: "blocked";
        backlog: "backlog";
        todo: "todo";
    }>>;
    priority: z.ZodOptional<z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
        critical: "critical";
    }>>;
    assigneeAgentId: z.ZodOptional<z.ZodGUID>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
    allowDuplicate: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
export declare const PaperclipFiglioCreaCorpoSchema: z.ZodObject<{
    acceptanceCriteria: z.ZodOptional<z.ZodArray<z.ZodString>>;
    blockParentUntilDone: z.ZodOptional<z.ZodBoolean>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodGUID>;
    goalId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    blockedByIssueIds: z.ZodOptional<z.ZodArray<z.ZodGUID>>;
    unblockDescriptor: z.ZodOptional<z.ZodObject<{
        owner: z.ZodUnion<readonly [z.ZodObject<{
            agentId: z.ZodGUID;
        }, z.core.$strict>, z.ZodObject<{
            userId: z.ZodString;
        }, z.core.$strict>, z.ZodLiteral<"board">]>;
        action: z.ZodString;
    }, z.core.$strict>>;
    status: z.ZodOptional<z.ZodEnum<{
        blocked: "blocked";
        backlog: "backlog";
        todo: "todo";
    }>>;
    priority: z.ZodOptional<z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
        critical: "critical";
    }>>;
    assigneeAgentId: z.ZodOptional<z.ZodGUID>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
    allowDuplicate: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
export type PaperclipFiglioCreaCorpo = z.infer<typeof PaperclipFiglioCreaCorpoSchema>;
/** Paperclip rejects creation beyond 25 children per parent with 422 (services/issues.ts:9275-9279). */
export declare function paperclipFiglioAncoraAmmesso(figliEsistenti: number): boolean;
/**
 * Lateral courier (execution-semantics.md:263-265): a new issue assigned to the destination agent by id.
 * Its description carries complete instructions because the recipient cannot see the sender's subtree.
 */
export declare const PaperclipCorriereCorpoSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    assigneeAgentId: z.ZodGUID;
    status: z.ZodOptional<z.ZodLiteral<"todo">>;
    priority: z.ZodOptional<z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
        critical: "critical";
    }>>;
    projectId: z.ZodOptional<z.ZodGUID>;
    goalId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
    allowDuplicate: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
export type PaperclipCorriereCorpo = z.infer<typeof PaperclipCorriereCorpoSchema>;
export declare const PaperclipCreazioneRispostaSchema: z.ZodObject<{
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
    deduplicated: z.ZodOptional<z.ZodLiteral<true>>;
    deduplicationReason: z.ZodOptional<z.ZodEnum<{
        idempotency_key: "idempotency_key";
        recent_open_title: "recent_open_title";
    }>>;
}, z.core.$loose>;
export type PaperclipCreazioneRisposta = z.infer<typeof PaperclipCreazioneRispostaSchema>;
export type PaperclipEsitoCreazione = {
    ok: true;
    nuovo: true;
    incarico: PaperclipCreazioneRisposta;
} | {
    ok: true;
    nuovo: false;
    motivo: PaperclipDeduplicazioneMotivo;
    incarico: PaperclipCreazioneRisposta;
} | {
    ok: false;
    motivo: 'stato_http_inatteso' | 'risposta_non_valida' | 'deduplica_incoerente';
};
/** A 200 response identifies an existing issue, so the body alone cannot establish a new creation. */
export declare function paperclipEsitoCreazione(statoHttp: number, corpo: unknown): PaperclipEsitoCreazione;
//# sourceMappingURL=wire-creazione.d.ts.map