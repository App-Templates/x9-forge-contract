"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperclipProtocolloErroreSchema = exports.PAPERCLIP_PROTOCOLLO_ERRORI = exports.PcpEsitoSchema = exports.PcpLeggiUscitaSchema = exports.PcpPianoIngressoSchema = exports.PcpConcludiIngressoSchema = exports.PcpAffidaIngressoSchema = exports.PcpCommentaIngressoSchema = exports.PcpLeggiIngressoSchema = exports.PcpPrendiIngressoSchema = exports.PAPERCLIP_PROTOCOLLO_TOOLS = void 0;
const zod_1 = require("zod");
const agenti_js_1 = require("./agenti.cjs");
const wire_letture_js_1 = require("./wire-letture.cjs");
exports.PAPERCLIP_PROTOCOLLO_TOOLS = {
    prendi: 'pcp_prendi',
    leggi: 'pcp_leggi',
    commenta: 'pcp_commenta',
    affida: 'pcp_affida',
    concludi: 'pcp_concludi',
    piano: 'pcp_scrivi_piano',
};
exports.PcpPrendiIngressoSchema = zod_1.z.strictObject({ issueId: zod_1.z.guid() });
exports.PcpLeggiIngressoSchema = zod_1.z.strictObject({ issueId: zod_1.z.guid() });
exports.PcpCommentaIngressoSchema = zod_1.z.strictObject({
    issueId: zod_1.z.guid(),
    testo: zod_1.z.string().trim().min(1).max(10000),
});
exports.PcpAffidaIngressoSchema = zod_1.z.strictObject({
    issueId: zod_1.z.guid(),
    a: agenti_js_1.PaperclipProtocolloRuoloSchema,
    titolo: zod_1.z.string().trim().min(1).max(240),
    // Paperclip doc/execution-semantics.md:265: a child must be self-contained.
    istruzioni: zod_1.z.string().trim().min(40).max(20000),
});
exports.PcpConcludiIngressoSchema = zod_1.z.strictObject({
    issueId: zod_1.z.guid(),
    risultato: zod_1.z.string().trim().min(1).max(20000),
});
exports.PcpPianoIngressoSchema = zod_1.z.strictObject({
    issueId: zod_1.z.guid(),
    // Paperclip validators/issue.js:1863.
    piano: zod_1.z.string().trim().min(300).max(524288),
});
exports.PcpLeggiUscitaSchema = zod_1.z.strictObject({
    incarico: wire_letture_js_1.PaperclipIncaricoSchema,
    commenti: wire_letture_js_1.PaperclipCommentiSchema,
    commentoSveglia: wire_letture_js_1.PaperclipCommentoSchema.nullable(),
    risultatiBlocchi: zod_1.z.array(zod_1.z.strictObject({
        id: zod_1.z.guid(),
        status: wire_letture_js_1.PaperclipStatoIncaricoSchema,
        // Paperclip doc/execution-semantics.md:253: the child's thread is its result.
        risultato: zod_1.z.string().nullable(),
    })),
});
exports.PcpEsitoSchema = zod_1.z.strictObject({
    issueId: zod_1.z.guid(),
    stato: wire_letture_js_1.PaperclipStatoIncaricoSchema,
    figlioId: zod_1.z.guid().optional(),
});
exports.PAPERCLIP_PROTOCOLLO_ERRORI = [
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
exports.PaperclipProtocolloErroreSchema = zod_1.z.enum(exports.PAPERCLIP_PROTOCOLLO_ERRORI);
//# sourceMappingURL=strumenti.js.map