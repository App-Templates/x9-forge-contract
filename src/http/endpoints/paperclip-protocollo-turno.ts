import {
  PaperclipTurnoRichiestaSchema,
  PaperclipTurnoRispostaSchema,
} from '../../capability/paperclip-protocollo/turno.js';

export const PAPERCLIP_TURNO_SEGRETO_HEADER = 'X-X9-Paperclip-Turno-Segreto' as const;

export const paperclipProtocolloTurnoContract = {
  method: 'POST' as const,
  path: '/webhook/paperclip/turno' as const,
  authType: 'external_provider' as const,
  bodySchema: PaperclipTurnoRichiestaSchema,
  responseSchema: PaperclipTurnoRispostaSchema,
} as const;
