import { z } from 'zod';
export declare const PAPERCLIP_PROTOCOLLO_TOOLS: {
    readonly prendi: "pcp_prendi";
    readonly leggi: "pcp_leggi";
    readonly commenta: "pcp_commenta";
    readonly affida: "pcp_affida";
    readonly concludi: "pcp_concludi";
    readonly piano: "pcp_scrivi_piano";
};
export declare const PcpPrendiIngressoSchema: z.ZodObject<{
    issueId: z.ZodGUID;
}, z.core.$strict>;
export declare const PcpLeggiIngressoSchema: z.ZodObject<{
    issueId: z.ZodGUID;
}, z.core.$strict>;
export declare const PcpCommentaIngressoSchema: z.ZodObject<{
    issueId: z.ZodGUID;
    testo: z.ZodString;
}, z.core.$strict>;
export declare const PcpAffidaIngressoSchema: z.ZodObject<{
    issueId: z.ZodGUID;
    a: z.ZodEnum<{
        ricerca: "ricerca";
        lab: "lab";
        capo: "capo";
    }>;
    titolo: z.ZodString;
    istruzioni: z.ZodString;
}, z.core.$strict>;
export declare const PcpConcludiIngressoSchema: z.ZodObject<{
    issueId: z.ZodGUID;
    risultato: z.ZodString;
}, z.core.$strict>;
export declare const PcpPianoIngressoSchema: z.ZodObject<{
    issueId: z.ZodGUID;
    piano: z.ZodString;
}, z.core.$strict>;
export declare const PcpLeggiUscitaSchema: z.ZodObject<{
    incarico: z.ZodObject<{
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
    commenti: z.ZodArray<z.ZodObject<{
        id: z.ZodGUID;
        body: z.ZodString;
        authorAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
        authorUserId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>>;
    commentoSveglia: z.ZodNullable<z.ZodObject<{
        id: z.ZodGUID;
        body: z.ZodString;
        authorAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
        authorUserId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>>;
    risultatiBlocchi: z.ZodArray<z.ZodObject<{
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
        risultato: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const PcpEsitoSchema: z.ZodObject<{
    issueId: z.ZodGUID;
    stato: z.ZodEnum<{
        cancelled: "cancelled";
        done: "done";
        blocked: "blocked";
        backlog: "backlog";
        todo: "todo";
        in_progress: "in_progress";
        in_review: "in_review";
    }>;
    figlioId: z.ZodOptional<z.ZodGUID>;
}, z.core.$strict>;
export declare const PAPERCLIP_PROTOCOLLO_ERRORI: readonly ["feature_off", "turno_assente", "identity_mismatch", "credential_missing", "incarico_non_preso", "delega_non_ammessa", "conflitto_proprietario", "non_autorizzato", "non_trovato", "risposta_non_valida", "errore_paperclip"];
export declare const PaperclipProtocolloErroreSchema: z.ZodEnum<{
    credential_missing: "credential_missing";
    identity_mismatch: "identity_mismatch";
    feature_off: "feature_off";
    turno_assente: "turno_assente";
    incarico_non_preso: "incarico_non_preso";
    delega_non_ammessa: "delega_non_ammessa";
    conflitto_proprietario: "conflitto_proprietario";
    non_autorizzato: "non_autorizzato";
    non_trovato: "non_trovato";
    risposta_non_valida: "risposta_non_valida";
    errore_paperclip: "errore_paperclip";
}>;
export type PcpPrendiIngresso = z.infer<typeof PcpPrendiIngressoSchema>;
export type PcpLeggiIngresso = z.infer<typeof PcpLeggiIngressoSchema>;
export type PcpCommentaIngresso = z.infer<typeof PcpCommentaIngressoSchema>;
export type PcpAffidaIngresso = z.infer<typeof PcpAffidaIngressoSchema>;
export type PcpConcludiIngresso = z.infer<typeof PcpConcludiIngressoSchema>;
export type PcpPianoIngresso = z.infer<typeof PcpPianoIngressoSchema>;
export type PcpLeggiUscita = z.infer<typeof PcpLeggiUscitaSchema>;
export type PcpEsito = z.infer<typeof PcpEsitoSchema>;
export type PaperclipProtocolloErrore = z.infer<typeof PaperclipProtocolloErroreSchema>;
//# sourceMappingURL=strumenti.d.ts.map