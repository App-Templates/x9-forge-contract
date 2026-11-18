import { z } from 'zod';

// Paperclip packages/shared/dist/constants.js:165-173.
export const PAPERCLIP_STATI_INCARICO = [
  'backlog',
  'todo',
  'in_progress',
  'in_review',
  'done',
  'blocked',
  'cancelled',
] as const;

export const PaperclipStatoIncaricoSchema = z.enum(PAPERCLIP_STATI_INCARICO);

// Paperclip packages/shared/src/constants.ts:210 (ISSUE_PRIORITIES); validators/issue.ts:709 (default medium).
export const PAPERCLIP_PRIORITA = ['critical', 'high', 'medium', 'low'] as const;
export const PaperclipPrioritaSchema = z.enum(PAPERCLIP_PRIORITA);
export const PAPERCLIP_PRIORITA_PREDEFINITA = 'medium' as const satisfies (typeof PAPERCLIP_PRIORITA)[number];
export type PaperclipPriorita = z.infer<typeof PaperclipPrioritaSchema>;

// Paperclip server/dist/routes/issues.js:5806-5807.
export const PaperclipBloccoSchema = z.looseObject({
  id: z.guid(),
  status: PaperclipStatoIncaricoSchema,
  title: z.string().optional(),
  identifier: z.string().nullable().optional(),
  assigneeAgentId: z.guid().nullable().optional(),
});

// Paperclip server/dist/routes/issues.js:5790-5810.
export const PaperclipIncaricoSchema = z.looseObject({
  id: z.guid(),
  title: z.string(),
  description: z.string().nullable().optional(),
  status: PaperclipStatoIncaricoSchema,
  parentId: z.guid().nullable().optional(),
  goalId: z.guid().nullable().optional(),
  assigneeAgentId: z.guid().nullable().optional(),
  blockedBy: z.array(PaperclipBloccoSchema).optional(),
  // Paperclip GET /issues/:id: creator, execution ownership and outgoing blockers.
  identifier: z.string().nullable().optional(),
  companyId: z.guid().optional(),
  priority: PaperclipPrioritaSchema.optional(),
  createdByAgentId: z.guid().nullable().optional(),
  executionRunId: z.guid().nullable().optional(),
  blocks: z.array(PaperclipBloccoSchema).optional(),
  updatedAt: z.string().optional(),
});

// Paperclip server/src/services/issues.ts:211-212 limits issue lists to 1000 entries.
export const PaperclipElencoIncarichiSchema = z.array(PaperclipIncaricoSchema).max(1000);

// Paperclip server/dist/routes/issues.js:10826-10855.
export const PaperclipCommentoSchema = z.looseObject({
  id: z.guid(),
  body: z.string(),
  authorAgentId: z.guid().nullable().optional(),
  authorUserId: z.string().nullable().optional(),
  createdAt: z.string().optional(),
});

export const PaperclipCommentiSchema = z.array(PaperclipCommentoSchema);

/** Select the newest valid timestamp, falling back to the API's requested order (descending by default). */
export function paperclipCommentoPiuRecente(
  commenti: readonly z.infer<typeof PaperclipCommentoSchema>[],
  ordine: 'asc' | 'desc' = 'desc',
): z.infer<typeof PaperclipCommentoSchema> | null {
  let scelto: z.infer<typeof PaperclipCommentoSchema> | null = null;
  let istante = -Infinity;
  for (const commento of commenti) {
    const data = Date.parse(commento.createdAt ?? '');
    if (Number.isFinite(data) && data > istante) {
      scelto = commento;
      istante = data;
    }
  }
  if (scelto !== null) return scelto;
  return (ordine === 'desc' ? commenti[0] : commenti.at(-1)) ?? null;
}

// Paperclip server/dist/routes/issues.js:5728-5870.
export const PaperclipContestoTurnoSchema = z.looseObject({
  issue: PaperclipIncaricoSchema,
  ancestors: z.array(z.looseObject({
    id: z.guid(),
    title: z.string().optional(),
    status: PaperclipStatoIncaricoSchema.optional(),
  })),
  wakeComment: PaperclipCommentoSchema.nullable().optional(),
});

// Paperclip docs/guides/agent-developer/heartbeat-protocol.md:12-18;
// server/dist/routes/agents.js:3368.
export const PaperclipAgenteMeSchema = z.looseObject({
  id: z.guid(),
  companyId: z.guid(),
});

// Paperclip server/dist/routes/issues.js:3290,10654-10659.
export const PaperclipErroreRispostaSchema = z.looseObject({
  error: z.string(),
});

export type PaperclipStatoIncarico = z.infer<typeof PaperclipStatoIncaricoSchema>;
export type PaperclipBlocco = z.infer<typeof PaperclipBloccoSchema>;
export type PaperclipIncarico = z.infer<typeof PaperclipIncaricoSchema>;
export type PaperclipCommento = z.infer<typeof PaperclipCommentoSchema>;
export type PaperclipCommenti = z.infer<typeof PaperclipCommentiSchema>;
export type PaperclipContestoTurno = z.infer<typeof PaperclipContestoTurnoSchema>;
export type PaperclipAgenteMe = z.infer<typeof PaperclipAgenteMeSchema>;
export type PaperclipErroreRisposta = z.infer<typeof PaperclipErroreRispostaSchema>;
