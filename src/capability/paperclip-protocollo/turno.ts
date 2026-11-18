import { z } from 'zod';

export const PAPERCLIP_MOTIVO_COMMENTO_MANCANTE = 'missing_issue_comment' as const;
export const PAPERCLIP_COMMENTO_OBBLIGATORIO_STATI = [
  'satisfied',
  'retry_queued',
  'retry_exhausted',
] as const;
export const PAPERCLIP_RECUPERO_INTENTI = ['status_only'] as const;
export const PAPERCLIP_COMMENTO_MANCANTE_RITENTATIVI = 1;

// Campi della sveglia: Paperclip server/dist/routes/issues.js:10263-10280,10526-10552.
export const PaperclipTurnoContestoSchema = z.looseObject({
  taskId: z.guid().optional(),
  issueId: z.guid().optional(),
  wakeReason: z.string().optional(),
  wakeCommentId: z.guid().optional(),
  commentId: z.guid().optional(),
  recoveryIntent: z.enum(PAPERCLIP_RECUPERO_INTENTI).optional().catch(undefined),
  allowDeliverableWork: z.boolean().optional().catch(undefined),
  allowDocumentUpdates: z.boolean().optional().catch(undefined),
  resumeRequiresNormalModel: z.boolean().optional().catch(undefined),
});
export type PaperclipTurnoContesto = z.infer<typeof PaperclipTurnoContestoSchema>;

export function paperclipTurnoSoloDisposizione(ctx: PaperclipTurnoContesto): boolean {
  return ctx.recoveryIntent === 'status_only' || ctx.allowDeliverableWork === false;
}

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
