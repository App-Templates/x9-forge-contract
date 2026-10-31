import { z } from 'zod';

// Campi della sveglia: Paperclip server/dist/routes/issues.js:10263-10280,10526-10552.
export const PaperclipTurnoContestoSchema = z.looseObject({
  taskId: z.guid().optional(),
  issueId: z.guid().optional(),
  wakeReason: z.string().optional(),
  wakeCommentId: z.guid().optional(),
  commentId: z.guid().optional(),
});
export type PaperclipTurnoContesto = z.infer<typeof PaperclipTurnoContestoSchema>;

// Corpo dell'adattatore http: server/dist/adapters/http/execute.js:9-60; docs/adapters/http.md:27-51.
// Il corpo compilato non ha companyId.
export const PaperclipTurnoRichiestaSchema = z.looseObject({
  runId: z.guid(),
  agentId: z.guid(),
  context: PaperclipTurnoContestoSchema,
});
export type PaperclipTurnoRichiesta = z.infer<typeof PaperclipTurnoRichiestaSchema>;

export const PaperclipTurnoRispostaSchema = z.strictObject({
  ok: z.literal(true),
  runId: z.guid(),
});
export type PaperclipTurnoRisposta = z.infer<typeof PaperclipTurnoRispostaSchema>;

export const PAPERCLIP_TURNO_ERRORI = [
  'feature_off',
  'segreto_non_valido',
  'richiesta_non_valida',
  'agente_sconosciuto',
  'turno_gia_aperto',
  'turno_fallito',
] as const;

export const PaperclipTurnoErroreSchema = z.strictObject({
  ok: z.literal(false),
  error: z.enum(PAPERCLIP_TURNO_ERRORI),
});
export type PaperclipTurnoErrore = z.infer<typeof PaperclipTurnoErroreSchema>;

export function incaricoDelTurno(ctx: PaperclipTurnoContesto): string | null {
  return ctx.taskId ?? ctx.issueId ?? null;
}
