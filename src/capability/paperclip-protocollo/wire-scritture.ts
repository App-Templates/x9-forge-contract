import { z } from 'zod';
import { PaperclipStatoIncaricoSchema } from './wire-letture.js';

// Paperclip docs/guides/agent-developer/heartbeat-protocol.md:53.
export const PAPERCLIP_CHECKOUT_STATI_ATTESI = ['todo', 'backlog', 'blocked', 'in_review'] as const;

// Paperclip packages/shared/dist/validators/issue.js:752-755.
export const PaperclipCheckoutCorpoSchema = z.strictObject({
  agentId: z.guid(),
  expectedStatuses: z.array(PaperclipStatoIncaricoSchema).nonempty(),
});

// Paperclip validators/issue.js:684-698; server/dist/services/issues.js:6109-6125;
// doc/execution-semantics.md:243-247. Il letterale `true` aggiunge il blocco figlio→padre.
export const PaperclipFiglioCorpoSchema = z.strictObject({
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1),
  assigneeAgentId: z.guid(),
  goalId: z.guid().nullable().optional(),
  blockParentUntilDone: z.literal(true),
});

// Paperclip validators/issue.js:714-730; docs/guides/execution-policy.md:152-161.
export const PaperclipAggiornaCorpoSchema = z
  .strictObject({
    status: PaperclipStatoIncaricoSchema.optional(),
    comment: z.string().trim().min(1).optional(),
  })
  .refine((v) => v.status !== undefined || v.comment !== undefined, {
    message: 'serve almeno uno fra status e comment',
  });

// Paperclip validators/issue.js:862-873.
export const PaperclipCommentoCorpoSchema = z.strictObject({
  body: z.string().trim().min(1),
});

// Paperclip validators/issue.js:1858-1866.
export const PaperclipPianoCorpoSchema = z.strictObject({
  format: z.literal('markdown'),
  body: z.string().trim().min(1).max(524288),
  changeSummary: z.string().trim().max(500).optional(),
});

// Paperclip server/dist/routes/issues.js:6900-7032 (risposta di PUT).
export const PaperclipDocumentoSchema = z.looseObject({
  id: z.guid(),
  key: z.string(),
  latestRevisionId: z.guid(),
  latestRevisionNumber: z.number().int().optional(),
});

// Paperclip validators/issue.js:1247-1254,1291-1311,1688-1720; heartbeat-protocol.md:73.
export const PaperclipConfermaCorpoSchema = z.strictObject({
  kind: z.literal('request_confirmation'),
  payload: z.strictObject({
    version: z.literal(1),
    prompt: z.string().trim().min(1).max(1000),
    target: z.strictObject({
      type: z.literal('issue_document'),
      key: z.literal('plan'),
      revisionId: z.guid(),
    }),
  }),
});

// Paperclip routes/issues.js:11271-11390 (201).
export const PaperclipInterazioneSchema = z.looseObject({
  id: z.guid(),
  kind: z.string(),
  status: z.string(),
});

export type PaperclipCheckoutCorpo = z.infer<typeof PaperclipCheckoutCorpoSchema>;
export type PaperclipFiglioCorpo = z.infer<typeof PaperclipFiglioCorpoSchema>;
export type PaperclipAggiornaCorpo = z.infer<typeof PaperclipAggiornaCorpoSchema>;
export type PaperclipCommentoCorpo = z.infer<typeof PaperclipCommentoCorpoSchema>;
export type PaperclipPianoCorpo = z.infer<typeof PaperclipPianoCorpoSchema>;
export type PaperclipDocumento = z.infer<typeof PaperclipDocumentoSchema>;
export type PaperclipConfermaCorpo = z.infer<typeof PaperclipConfermaCorpoSchema>;
export type PaperclipInterazione = z.infer<typeof PaperclipInterazioneSchema>;
