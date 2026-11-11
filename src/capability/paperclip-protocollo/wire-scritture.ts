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

// Paperclip validators/issue.ts:693-704: strict {owner, action}; an agent may name only itself (403).
export const PaperclipDescrittoreSbloccoSchema = z.strictObject({
  owner: z.union([
    z.strictObject({ agentId: z.guid() }),
    z.strictObject({ userId: z.string().min(1) }),
    z.literal('board'),
  ]),
  action: z.string().trim().min(1).max(2000),
});

// One-shot monitor, consumed by an issue_monitor_due wake; valid only in in_progress or
// in_review (issue-execution-policy.ts:74,265-267); Paperclip sets no time bounds.
export const PaperclipControlloSchema = z.strictObject({
  nextCheckAt: z.iso.datetime(),
  notes: z.string().trim().min(1).max(500),
  serviceName: z.string().trim().min(1).max(120).optional(),
});

// Paperclip replaces the whole execution policy on an update (routes/issues.ts:13103-13105),
// so the body carries the policy intact: only the monitor is ours, the rest passes through.
export const PaperclipPoliticaConControlloSchema = z.looseObject({ monitor: PaperclipControlloSchema });

export const PaperclipDisposizioneCorpoSchema = z
  .strictObject({
    status: z.enum(['done', 'in_review', 'blocked', 'in_progress']),
    comment: z.string().trim().min(1).optional(),
    blockedByIssueIds: z.array(z.guid()).min(1).optional(),
    unblockDescriptor: PaperclipDescrittoreSbloccoSchema.optional(),
    executionPolicy: PaperclipPoliticaConControlloSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.status === 'blocked') {
      if (value.blockedByIssueIds === undefined && value.unblockDescriptor === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['status'],
          message: 'blocked requires blocking issues or an unblock descriptor',
        });
      }
    } else {
      if (value.blockedByIssueIds !== undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['blockedByIssueIds'],
          message: 'blocking issues are allowed only with blocked',
        });
      }
      if (value.unblockDescriptor !== undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['unblockDescriptor'],
          message: 'an unblock descriptor is allowed only with blocked',
        });
      }
    }
    if (value.executionPolicy !== undefined && value.status !== 'in_progress' && value.status !== 'in_review') {
      ctx.addIssue({
        code: 'custom',
        path: ['executionPolicy'],
        message: 'a scheduled check is allowed only with in_progress or in_review',
      });
    }
    if (value.status === 'in_progress' && value.executionPolicy === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['status'],
        message: 'in_progress is a disposition only with a scheduled check',
      });
    }
  });

export type PaperclipDescrittoreSblocco = z.infer<typeof PaperclipDescrittoreSbloccoSchema>;
export type PaperclipControllo = z.infer<typeof PaperclipControlloSchema>;
export type PaperclipPoliticaConControllo = z.infer<typeof PaperclipPoliticaConControlloSchema>;
export type PaperclipDisposizioneCorpo =z.infer<typeof PaperclipDisposizioneCorpoSchema>;
