import type { PaperclipStatoIncarico } from "./wire-letture.cjs";
export declare const PAPERCLIP_STATI_TERMINALI: readonly ["done", "cancelled"];
export declare const PAPERCLIP_STATI_APERTI: readonly ["backlog", "todo", "in_progress", "in_review", "blocked"];
export declare function paperclipStatoTerminale(stato: PaperclipStatoIncarico): boolean;
export declare const PAPERCLIP_TRANSIZIONI: Readonly<Record<PaperclipStatoIncarico, readonly PaperclipStatoIncarico[]>>;
export type PaperclipTransizioneEsito = {
    ok: true;
    via: 'invariato' | 'matrice';
} | {
    ok: false;
    motivo: 'stato_terminale' | 'transizione_non_ammessa';
};
export declare function paperclipTransizioneAmmessa(da: PaperclipStatoIncarico, a: PaperclipStatoIncarico): PaperclipTransizioneEsito;
export declare const PAPERCLIP_VIE_REVISIONE: readonly ["pending_issue_thread_interaction", "linked_pending_approval", "human_assignee_user_id", "typed_execution_state_current_participant", "scheduled_issue_monitor"];
export type PaperclipViaRevisione = (typeof PAPERCLIP_VIE_REVISIONE)[number];
export declare const PAPERCLIP_INGRESSO_RIFIUTI: readonly ["in_progress_senza_assegnatario", "in_progress_con_blocchi_non_risolti", "blocked_senza_percorso", "in_review_senza_strada"];
export type PaperclipIngressoRifiuto = (typeof PAPERCLIP_INGRESSO_RIFIUTI)[number];
export interface PaperclipIngressoFatti {
    da: PaperclipStatoIncarico;
    a: PaperclipStatoIncarico;
    haAssegnatario: boolean;
    bloccantiNonRisolti: number;
    haDescrittoreSblocco: boolean;
    haInterazioneOApprovazionePendente: boolean;
    vieRevisione: readonly PaperclipViaRevisione[];
}
/**
 * I prerequisiti che Paperclip controlla all'ingresso in uno stato (422): `in_progress` vuole un assegnatario
 * (services/issues.ts:9785-9791, 10731-10737) e nessun blocco non risolto (10738-10769); `blocked` vuole un percorso
 * (routes/issues.ts:13229-13290, solo se prima non lo era); `in_review` di un agente vuole una strada
 * (routes/issues.ts:4497-4632, 422 invalid_issue_disposition). Chi non cambia stato non è controllato.
 */
export declare function paperclipIngressoStato(fatti: PaperclipIngressoFatti): {
    ok: true;
} | {
    ok: false;
    motivo: PaperclipIngressoRifiuto;
};
//# sourceMappingURL=stati.d.ts.map