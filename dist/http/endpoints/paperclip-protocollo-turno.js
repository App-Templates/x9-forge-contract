import { PaperclipTurnoRichiestaSchema, PaperclipTurnoRispostaSchema, } from "../../capability/paperclip-protocollo/turno.js";
export const PAPERCLIP_TURNO_SEGRETO_HEADER = 'X-X9-Paperclip-Turno-Segreto';
export const paperclipProtocolloTurnoContract = {
    method: 'POST',
    path: '/webhook/paperclip/turno',
    authType: 'external_provider',
    bodySchema: PaperclipTurnoRichiestaSchema,
    responseSchema: PaperclipTurnoRispostaSchema,
};
//# sourceMappingURL=paperclip-protocollo-turno.js.map