"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAPERCLIP_INGRESSO_RIFIUTI = exports.PAPERCLIP_VIE_REVISIONE = exports.PAPERCLIP_TRANSIZIONI = exports.PAPERCLIP_STATI_APERTI = exports.PAPERCLIP_STATI_TERMINALI = void 0;
exports.paperclipStatoTerminale = paperclipStatoTerminale;
exports.paperclipTransizioneAmmessa = paperclipTransizioneAmmessa;
exports.paperclipIngressoStato = paperclipIngressoStato;
// Paperclip doc/SPEC-implementation.md:290 (terminali); packages/shared/src/constants.ts:189-197 (i sette stati).
exports.PAPERCLIP_STATI_TERMINALI = ['done', 'cancelled'];
exports.PAPERCLIP_STATI_APERTI = [
    'backlog', 'todo', 'in_progress', 'in_review', 'blocked',
];
function paperclipStatoTerminale(stato) {
    return exports.PAPERCLIP_STATI_TERMINALI.includes(stato);
}
// Paperclip doc/SPEC-implementation.md:516-523. Il server NON la applica (services/issues.ts:304-309 controlla solo che
// lo stato esista): la applica il client. La riapertura di un incarico chiuso non è una transizione: ha il suo
// intento esplicito (`reopen`/`resume` con commento, vedi PaperclipCommentoCorpoEstesoSchema).
exports.PAPERCLIP_TRANSIZIONI = {
    backlog: ['todo', 'cancelled'],
    todo: ['in_progress', 'blocked', 'cancelled'],
    in_progress: ['in_review', 'blocked', 'done', 'cancelled'],
    in_review: ['in_progress', 'done', 'cancelled'],
    blocked: ['todo', 'in_progress', 'cancelled'],
    done: [],
    cancelled: [],
};
function paperclipTransizioneAmmessa(da, a) {
    if (da === a)
        return { ok: true, via: 'invariato' };
    if (exports.PAPERCLIP_TRANSIZIONI[da].includes(a))
        return { ok: true, via: 'matrice' };
    return { ok: false, motivo: paperclipStatoTerminale(da) ? 'stato_terminale' : 'transizione_non_ammessa' };
}
// Paperclip server/src/routes/issues.ts:4614-4630: le cinque strade valide per portare un incarico in `in_review`.
exports.PAPERCLIP_VIE_REVISIONE = [
    'pending_issue_thread_interaction',
    'linked_pending_approval',
    'human_assignee_user_id',
    'typed_execution_state_current_participant',
    'scheduled_issue_monitor',
];
exports.PAPERCLIP_INGRESSO_RIFIUTI = [
    'in_progress_senza_assegnatario',
    'in_progress_con_blocchi_non_risolti',
    'blocked_senza_percorso',
    'in_review_senza_strada',
];
/**
 * I prerequisiti che Paperclip controlla all'ingresso in uno stato (422): `in_progress` vuole un assegnatario
 * (services/issues.ts:9785-9791, 10731-10737) e nessun blocco non risolto (10738-10769); `blocked` vuole un percorso
 * (routes/issues.ts:13229-13290, solo se prima non lo era); `in_review` di un agente vuole una strada
 * (routes/issues.ts:4497-4632, 422 invalid_issue_disposition). Chi non cambia stato non è controllato.
 */
function paperclipIngressoStato(fatti) {
    if (fatti.da === fatti.a)
        return { ok: true };
    if (fatti.a === 'in_progress') {
        if (!fatti.haAssegnatario)
            return { ok: false, motivo: 'in_progress_senza_assegnatario' };
        if (fatti.bloccantiNonRisolti > 0)
            return { ok: false, motivo: 'in_progress_con_blocchi_non_risolti' };
    }
    if (fatti.a === 'blocked'
        && fatti.bloccantiNonRisolti === 0 && !fatti.haDescrittoreSblocco && !fatti.haInterazioneOApprovazionePendente) {
        return { ok: false, motivo: 'blocked_senza_percorso' };
    }
    if (fatti.a === 'in_review' && fatti.vieRevisione.length === 0)
        return { ok: false, motivo: 'in_review_senza_strada' };
    return { ok: true };
}
//# sourceMappingURL=stati.js.map