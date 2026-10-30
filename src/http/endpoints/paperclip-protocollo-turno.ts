// eslint-disable-next-line @typescript-eslint/no-unused-vars -- intentional: in-scope `z` is required for TS to emit portable .d.ts (`z.ZodObject<...>` named ref instead of synthesized `import("zod").ZodObject<...>`). See scripts/check-portable-dts.mjs (v1.6.3 fix, commit 6df26a1, Phase 19-00).
import { z } from 'zod';
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
