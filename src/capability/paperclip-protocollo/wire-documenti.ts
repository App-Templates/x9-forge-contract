import { z } from 'zod';
import { PaperclipIncaricoSchema } from './wire-letture.js';

// Paperclip validators/issue.ts:1153-1161. Require the already lowercase wire key.
export const PAPERCLIP_DOCUMENT_KEY_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
export const PaperclipDocumentoChiaveSchema = z.string().trim().min(1).max(64).regex(PAPERCLIP_DOCUMENT_KEY_PATTERN);

// Paperclip validators/issue.ts:2158-2172.
export const PAPERCLIP_DOCUMENT_FORMATS = ['markdown'] as const;
export const PAPERCLIP_DOCUMENT_BODY_MAX = 524288;

// PUT document: creation has no base; updates use the latest revision just read.
export const PaperclipDocumentoScriviCorpoSchema = z.strictObject({
  title: z.string().trim().max(200).nullable().optional(),
  format: z.enum(PAPERCLIP_DOCUMENT_FORMATS),
  body: z.string().max(PAPERCLIP_DOCUMENT_BODY_MAX),
  changeSummary: z.string().trim().max(500).nullable().optional(),
  baseRevisionId: z.guid().nullable().optional(),
});

export const PaperclipDocumentoCreaCorpoSchema = PaperclipDocumentoScriviCorpoSchema.refine(
  (corpo) => corpo.baseRevisionId === undefined || corpo.baseRevisionId === null,
  { message: 'a creation has no baseRevisionId', path: ['baseRevisionId'] },
);

export const PaperclipDocumentoAggiornaCorpoSchema = PaperclipDocumentoScriviCorpoSchema.extend({
  baseRevisionId: z.guid(),
});

// Paperclip services/documents.ts:60-84: summaries omit body; unrevised documents have a null revision.
export const PaperclipDocumentoLettoSchema = z.looseObject({
  id: z.guid(),
  companyId: z.guid(),
  issueId: z.guid(),
  key: PaperclipDocumentoChiaveSchema,
  title: z.string().nullable(),
  format: z.enum(PAPERCLIP_DOCUMENT_FORMATS),
  body: z.string().optional(),
  latestRevisionId: z.guid().nullable(),
  latestRevisionNumber: z.number().int().min(0),
  lockedAt: z.string().nullable().optional(),
  lockedByAgentId: z.guid().nullable().optional(),
  lockedByUserId: z.string().nullable().optional(),
  createdAt: z.string().min(1).optional(),
  updatedAt: z.string().min(1).optional(),
});

// Paperclip services/documents.ts:116-148; routes/issues.ts:8833-8842.
export const PaperclipPianoLegacySchema = z.looseObject({
  key: z.literal('plan'),
  body: z.string(),
  source: z.literal('issue_description'),
});
export const PaperclipIncaricoConDocumentiSchema = PaperclipIncaricoSchema.extend({
  planDocument: PaperclipDocumentoLettoSchema.nullable().optional(),
  documentSummaries: z.array(PaperclipDocumentoLettoSchema).optional(),
  legacyPlanDocument: PaperclipPianoLegacySchema.nullable().optional(),
});

// Paperclip services/documents.ts:350-359: revision conflicts carry the current revision in details.
export const PaperclipDocumentoConflittoSchema = z.looseObject({
  error: z.string(),
  details: z.looseObject({ currentRevisionId: z.guid().optional() }).optional(),
});

// Paperclip services/documents.ts:19-31,219-259: writing a locked document creates a new key.
export function paperclipDocumentoScritto(
  chiaveChiesta: string,
  risposta: { key: string },
): { key: string; rediretto: boolean } {
  const chiesta = PaperclipDocumentoChiaveSchema.parse(chiaveChiesta);
  const key = PaperclipDocumentoChiaveSchema.parse(risposta.key);
  return { key, rediretto: key !== chiesta };
}

export function paperclipConfermaPianoIdempotencyKey(issueId: string, latestRevisionId: string): string {
  return `confirmation:${z.guid().parse(issueId)}:plan:${z.guid().parse(latestRevisionId)}`;
}

// Paperclip constants.ts:342-346; require an explicit policy instead of the server default 'none'.
export const PAPERCLIP_CONFERMA_CONTINUATION_POLICIES = ['none', 'wake_assignee', 'wake_assignee_on_accept'] as const;

// Paperclip validators/issue.ts:1467-1476: anchors, local paths and HTTP(S) URLs only.
const PaperclipConfermaHrefSchema = z.string().trim().min(1).max(2000).refine(
  (valore) => valore.startsWith('#') || (valore.startsWith('/') && !valore.startsWith('//')) || /^https?:\/\//i.test(valore),
  { message: 'href must be an anchor, a path or an http(s) URL' },
);

// Paperclip validators/issue.ts:1483-1492,1534-1552,1972-1982.
export const PaperclipConfermaDocumentoCorpoSchema = z.strictObject({
  kind: z.literal('request_confirmation'),
  idempotencyKey: z.string().trim().min(1).max(255),
  continuationPolicy: z.enum(PAPERCLIP_CONFERMA_CONTINUATION_POLICIES),
  title: z.string().trim().max(240).nullable().optional(),
  summary: z.string().trim().max(1000).nullable().optional(),
  payload: z.strictObject({
    version: z.literal(1),
    prompt: z.string().trim().min(1).max(1000),
    acceptLabel: z.string().trim().min(1).max(80).nullable().optional(),
    rejectLabel: z.string().trim().min(1).max(80).nullable().optional(),
    rejectRequiresReason: z.boolean().optional(),
    detailsMarkdown: z.string().max(20000).nullable().optional(),
    supersedeOnUserComment: z.boolean().optional(),
    target: z.strictObject({
      type: z.literal('issue_document'),
      key: PaperclipDocumentoChiaveSchema,
      revisionId: z.guid(),
      issueId: z.guid().nullable().optional(),
      documentId: z.guid().nullable().optional(),
      revisionNumber: z.number().int().positive().nullable().optional(),
      label: z.string().trim().min(1).max(120).nullable().optional(),
      href: PaperclipConfermaHrefSchema.nullable().optional(),
    }),
  }),
});

export type PaperclipDocumentoScriviCorpo = z.infer<typeof PaperclipDocumentoScriviCorpoSchema>;
export type PaperclipDocumentoLetto = z.infer<typeof PaperclipDocumentoLettoSchema>;
export type PaperclipConfermaDocumentoCorpo = z.infer<typeof PaperclipConfermaDocumentoCorpoSchema>;
