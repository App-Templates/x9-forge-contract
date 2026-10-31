"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paperclipProtocolloTurnoContract = exports.PAPERCLIP_TURNO_SEGRETO_HEADER = void 0;
const turno_js_1 = require("../../capability/paperclip-protocollo/turno.cjs");
exports.PAPERCLIP_TURNO_SEGRETO_HEADER = 'X-X9-Paperclip-Turno-Segreto';
exports.paperclipProtocolloTurnoContract = {
    method: 'POST',
    path: '/webhook/paperclip/turno',
    authType: 'external_provider',
    bodySchema: turno_js_1.PaperclipTurnoRichiestaSchema,
    responseSchema: turno_js_1.PaperclipTurnoRispostaSchema,
};
//# sourceMappingURL=paperclip-protocollo-turno.js.map