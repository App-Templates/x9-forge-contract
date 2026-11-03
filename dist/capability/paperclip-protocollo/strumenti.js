import { z } from 'zod';
import { PaperclipProtocolloRuoloSchema } from "./agenti.js";
import { PaperclipCommentiSchema, PaperclipCommentoSchema, PaperclipIncaricoSchema, PaperclipStatoIncaricoSchema, } from "./wire-letture.js";
export const PAPERCLIP_PROTOCOLLO_TOOLS = {
    prendi: 'pcp_prendi',
    leggi: 'pcp_leggi',
    commenta: 'pcp_commenta',
    affida: 'pcp_affida',
    concludi: 'pcp_concludi',
    piano: 'pcp_scrivi_piano',
};
export const PcpPrendiIngressoSchema = z.strictObject({ issueId: z.guid() });
export const PcpLeggiIngressoSchema = z.strictObject({ issueId: z.guid() });
export const PcpCommentaIngressoSchema = z.strictObject({
    issueId: z.guid(),
    testo: z.string().trim().min(1).max(10000),
});
export const PcpAffidaIngressoSchema = z.strictObject({
    issueId: z.guid(),
    a: PaperclipProtocolloRuoloSchema,
    titolo: z.string().trim().min(1).max(240),
    // Paperclip doc/execution-semantics.md:265: a child must be self-contained.
    istruzioni: z.string().trim().min(40).max(20000),
});
export const PcpConcludiIngressoSchema = z.strictObject({
    issueId: z.guid(),
    risultato: z.string().trim().min(1).max(20000),
});
export const PcpPianoIngressoSchema = z.strictObject({
    issueId: z.guid(),
    // Paperclip validators/issue.js:1863.
    piano: z.string().trim().min(300).max(524288),
});
export const PcpLeggiUscitaSchema = z.strictObject({
    incarico: PaperclipIncaricoSchema,
    commenti: PaperclipCommentiSchema,
    commentoSveglia: PaperclipCommentoSchema.nullable(),
    risultatiBlocchi: z.array(z.strictObject({
        id: z.guid(),
        status: PaperclipStatoIncaricoSchema,
        // Paperclip doc/execution-semantics.md:253: the child's thread is its result.
        risultato: z.string().nullable(),
    })),
});
export const PcpEsitoSchema = z.strictObject({
    issueId: z.guid(),
    stato: PaperclipStatoIncaricoSchema,
    figlioId: z.guid().optional(),
});
export const PAPERCLIP_PROTOCOLLO_ERRORI = [
    'feature_off',
    'turno_assente',
    'identity_mismatch',
    'credential_missing',
    'incarico_non_preso',
    'delega_non_ammessa',
    // Paperclip heartbeat-protocol.md:56: an ownership conflict (409) is not retried.
    'conflitto_proprietario',
    'non_autorizzato',
    'non_trovato',
    'risposta_non_valida',
    'errore_paperclip',
];
export const PaperclipProtocolloErroreSchema = z.enum(PAPERCLIP_PROTOCOLLO_ERRORI);
//# sourceMappingURL=strumenti.js.map