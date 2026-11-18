import { z } from 'zod';
import { PaperclipContestoTurnoSchema } from './wire-letture.js';

// Paperclip server/src/attachment-types.ts:164-165: instance size limit.
export const PAPERCLIP_ATTACHMENT_MAX_BYTES_DEFAULT = 10 * 1024 * 1024;
export const PAPERCLIP_ATTACHMENT_MAX_BYTES_ENV = 'PAPERCLIP_ATTACHMENT_MAX_BYTES' as const;
export const PAPERCLIP_ATTACHMENT_ALLOWED_TYPES_ENV = 'PAPERCLIP_ALLOWED_ATTACHMENT_TYPES' as const;

// Paperclip server/src/routes/issues.ts:4754-4768: multer upload.single("file"), files: 1.
export const PAPERCLIP_ATTACHMENT_FORM_FIELD = 'file' as const;

// Paperclip server/src/attachment-types.ts:17-49. This list applies to company assets
// (routes/assets.ts:152) and chat channels (services/chat-channels.ts:10959).
// Issue attachment POST only enforces the size limit (routes/issues.ts:18402-18409),
// without applying this MIME allowlist.
export const PAPERCLIP_ATTACHMENT_DEFAULT_ALLOWED_TYPES = [
  'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif',
  'image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence',
  'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/webm',
  'application/pdf', 'application/zip',
  'text/markdown', 'text/plain', 'application/json', 'text/csv', 'text/html',
  'application/msword', 'application/vnd.ms-excel', 'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v',
] as const;

// Paperclip attachment-types.ts:51-56: generic types corrected using the filename.
export const PAPERCLIP_ATTACHMENT_GENERIC_TYPES = [
  'application/octet-stream', 'binary/octet-stream', 'application/x-binary',
] as const;

// Paperclip attachment-types.ts:58-69: types served inline by GET .../content.
export const PAPERCLIP_ATTACHMENT_INLINE_TYPES = [
  'image/*', 'application/pdf', 'text/plain', 'text/markdown', 'application/json', 'text/csv',
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v',
] as const;

/** Lowercase type without parameters, as compared by Paperclip (attachment-types.ts:100-110). */
export function paperclipAttachmentTypeEssence(contentType: string): string {
  return (contentType.split(';', 1)[0] ?? '').trim().toLowerCase();
}

/** Whether the type belongs to the default asset/chat list, not the issue upload policy. */
export function isPaperclipAttachmentTypeInDefaultList(contentType: string): boolean {
  return (PAPERCLIP_ATTACHMENT_DEFAULT_ALLOWED_TYPES as readonly string[]).includes(
    paperclipAttachmentTypeEssence(contentType),
  );
}

/**
 * Client checks before POST: one nonempty file within the instance limit (default 10 MiB).
 * issueCommentId must belong to the same run, otherwise Paperclip returns
 * 422 issue_attachment_parent_run_mismatch.
 */
export function paperclipAllegatoCaricaSchema(maxBytes: number = PAPERCLIP_ATTACHMENT_MAX_BYTES_DEFAULT) {
  return z.strictObject({
    filename: z.string().min(1).max(255),
    contentType: z.string().min(1).max(255),
    byteSize: z.number().int().min(1).max(maxBytes),
    // Paperclip packages/shared/src/validators/issue.ts:2154-2156.
    issueCommentId: z.guid().nullable().optional(),
  });
}
export const PaperclipAllegatoCaricaSchema = paperclipAllegatoCaricaSchema();

// POST 201 and list rows: Paperclip services/issues.ts:12999-13019,13024-13045;
// contentPath/openPath/downloadPath: routes/issues.ts:4355-4362. POST does not expose
// artifactWorkProductId (routes/issues.ts:18527-18530).
export const PaperclipAllegatoSchema = z.looseObject({
  id: z.guid(),
  companyId: z.guid(),
  issueId: z.guid(),
  issueCommentId: z.guid().nullable(),
  originatingRunId: z.guid().nullable().optional(),
  assetId: z.guid(),
  provider: z.string().min(1),
  objectKey: z.string().min(1),
  contentType: z.string().min(1),
  byteSize: z.number().int().min(0),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  originalFilename: z.string().nullable(),
  createdByAgentId: z.guid().nullable(),
  createdByUserId: z.string().nullable(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  contentPath: z.string().min(1),
  openPath: z.string().min(1),
  downloadPath: z.string().min(1),
}).superRefine((row, ctx) => {
  const content = `/api/attachments/${row.id}/content`;
  if (row.contentPath !== content) ctx.addIssue({ code: 'custom', path: ['contentPath'], message: 'contentPath must be the attachment content route' });
  if (row.openPath !== content) ctx.addIssue({ code: 'custom', path: ['openPath'], message: 'openPath must be the attachment content route' });
  if (row.downloadPath !== `${content}?download=1`) ctx.addIssue({ code: 'custom', path: ['downloadPath'], message: 'downloadPath must be the content route with download=1' });
});
export const PaperclipAllegatiSchema = z.array(PaperclipAllegatoSchema);

// Paperclip routes/issues.ts:8563-8570: compact list in the wake context.
export const PaperclipAllegatoContestoSchema = z.looseObject({
  id: z.guid(),
  filename: z.string().nullable(),
  contentType: z.string().min(1),
  byteSize: z.number().int().min(0),
  contentPath: z.string().min(1),
  createdAt: z.string().min(1),
});
export const PaperclipContestoConAllegatiSchema = PaperclipContestoTurnoSchema.extend({
  attachments: z.array(PaperclipAllegatoContestoSchema).optional(),
});

// DELETE /api/attachments/:id (routes/issues.ts:18628-18681) preserves the linked work product.
export const PaperclipAllegatoRimossoSchema = z.strictObject({ ok: z.literal(true) });

export type PaperclipAllegatoCarica = z.infer<typeof PaperclipAllegatoCaricaSchema>;
export type PaperclipAllegato = z.infer<typeof PaperclipAllegatoSchema>;
export type PaperclipAllegatoContesto = z.infer<typeof PaperclipAllegatoContestoSchema>;
