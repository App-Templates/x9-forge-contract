"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperclipAllegatoRimossoSchema = exports.PaperclipContestoConAllegatiSchema = exports.PaperclipAllegatoContestoSchema = exports.PaperclipAllegatiSchema = exports.PaperclipAllegatoSchema = exports.PaperclipAllegatoCaricaSchema = exports.PAPERCLIP_ATTACHMENT_INLINE_TYPES = exports.PAPERCLIP_ATTACHMENT_GENERIC_TYPES = exports.PAPERCLIP_ATTACHMENT_DEFAULT_ALLOWED_TYPES = exports.PAPERCLIP_ATTACHMENT_FORM_FIELD = exports.PAPERCLIP_ATTACHMENT_ALLOWED_TYPES_ENV = exports.PAPERCLIP_ATTACHMENT_MAX_BYTES_ENV = exports.PAPERCLIP_ATTACHMENT_MAX_BYTES_DEFAULT = void 0;
exports.paperclipAttachmentTypeEssence = paperclipAttachmentTypeEssence;
exports.isPaperclipAttachmentTypeInDefaultList = isPaperclipAttachmentTypeInDefaultList;
exports.paperclipAllegatoCaricaSchema = paperclipAllegatoCaricaSchema;
const zod_1 = require("zod");
const wire_letture_js_1 = require("./wire-letture.cjs");
// Paperclip server/src/attachment-types.ts:164-165: instance size limit.
exports.PAPERCLIP_ATTACHMENT_MAX_BYTES_DEFAULT = 10 * 1024 * 1024;
exports.PAPERCLIP_ATTACHMENT_MAX_BYTES_ENV = 'PAPERCLIP_ATTACHMENT_MAX_BYTES';
exports.PAPERCLIP_ATTACHMENT_ALLOWED_TYPES_ENV = 'PAPERCLIP_ALLOWED_ATTACHMENT_TYPES';
// Paperclip server/src/routes/issues.ts:4754-4768: multer upload.single("file"), files: 1.
exports.PAPERCLIP_ATTACHMENT_FORM_FIELD = 'file';
// Paperclip server/src/attachment-types.ts:17-49. This list applies to company assets
// (routes/assets.ts:152) and chat channels (services/chat-channels.ts:10959).
// Issue attachment POST only enforces the size limit (routes/issues.ts:18402-18409),
// without applying this MIME allowlist.
exports.PAPERCLIP_ATTACHMENT_DEFAULT_ALLOWED_TYPES = [
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
];
// Paperclip attachment-types.ts:51-56: generic types corrected using the filename.
exports.PAPERCLIP_ATTACHMENT_GENERIC_TYPES = [
    'application/octet-stream', 'binary/octet-stream', 'application/x-binary',
];
// Paperclip attachment-types.ts:58-69: types served inline by GET .../content.
exports.PAPERCLIP_ATTACHMENT_INLINE_TYPES = [
    'image/*', 'application/pdf', 'text/plain', 'text/markdown', 'application/json', 'text/csv',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v',
];
/** Lowercase type without parameters, as compared by Paperclip (attachment-types.ts:100-110). */
function paperclipAttachmentTypeEssence(contentType) {
    return (contentType.split(';', 1)[0] ?? '').trim().toLowerCase();
}
/** Whether the type belongs to the default asset/chat list, not the issue upload policy. */
function isPaperclipAttachmentTypeInDefaultList(contentType) {
    return exports.PAPERCLIP_ATTACHMENT_DEFAULT_ALLOWED_TYPES.includes(paperclipAttachmentTypeEssence(contentType));
}
/**
 * Client checks before POST: one nonempty file within the instance limit (default 10 MiB).
 * issueCommentId must belong to the same run, otherwise Paperclip returns
 * 422 issue_attachment_parent_run_mismatch.
 */
function paperclipAllegatoCaricaSchema(maxBytes = exports.PAPERCLIP_ATTACHMENT_MAX_BYTES_DEFAULT) {
    return zod_1.z.strictObject({
        filename: zod_1.z.string().min(1).max(255),
        contentType: zod_1.z.string().min(1).max(255),
        byteSize: zod_1.z.number().int().min(1).max(maxBytes),
        // Paperclip packages/shared/src/validators/issue.ts:2154-2156.
        issueCommentId: zod_1.z.guid().nullable().optional(),
    });
}
exports.PaperclipAllegatoCaricaSchema = paperclipAllegatoCaricaSchema();
// POST 201 and list rows: Paperclip services/issues.ts:12999-13019,13024-13045;
// contentPath/openPath/downloadPath: routes/issues.ts:4355-4362. POST does not expose
// artifactWorkProductId (routes/issues.ts:18527-18530).
exports.PaperclipAllegatoSchema = zod_1.z.looseObject({
    id: zod_1.z.guid(),
    companyId: zod_1.z.guid(),
    issueId: zod_1.z.guid(),
    issueCommentId: zod_1.z.guid().nullable(),
    originatingRunId: zod_1.z.guid().nullable().optional(),
    assetId: zod_1.z.guid(),
    provider: zod_1.z.string().min(1),
    objectKey: zod_1.z.string().min(1),
    contentType: zod_1.z.string().min(1),
    byteSize: zod_1.z.number().int().min(0),
    sha256: zod_1.z.string().regex(/^[a-f0-9]{64}$/),
    originalFilename: zod_1.z.string().nullable(),
    createdByAgentId: zod_1.z.guid().nullable(),
    createdByUserId: zod_1.z.string().nullable(),
    createdAt: zod_1.z.string().min(1),
    updatedAt: zod_1.z.string().min(1),
    contentPath: zod_1.z.string().min(1),
    openPath: zod_1.z.string().min(1),
    downloadPath: zod_1.z.string().min(1),
}).superRefine((row, ctx) => {
    const content = `/api/attachments/${row.id}/content`;
    if (row.contentPath !== content)
        ctx.addIssue({ code: 'custom', path: ['contentPath'], message: 'contentPath must be the attachment content route' });
    if (row.openPath !== content)
        ctx.addIssue({ code: 'custom', path: ['openPath'], message: 'openPath must be the attachment content route' });
    if (row.downloadPath !== `${content}?download=1`)
        ctx.addIssue({ code: 'custom', path: ['downloadPath'], message: 'downloadPath must be the content route with download=1' });
});
exports.PaperclipAllegatiSchema = zod_1.z.array(exports.PaperclipAllegatoSchema);
// Paperclip routes/issues.ts:8563-8570: compact list in the wake context.
exports.PaperclipAllegatoContestoSchema = zod_1.z.looseObject({
    id: zod_1.z.guid(),
    filename: zod_1.z.string().nullable(),
    contentType: zod_1.z.string().min(1),
    byteSize: zod_1.z.number().int().min(0),
    contentPath: zod_1.z.string().min(1),
    createdAt: zod_1.z.string().min(1),
});
exports.PaperclipContestoConAllegatiSchema = wire_letture_js_1.PaperclipContestoTurnoSchema.extend({
    attachments: zod_1.z.array(exports.PaperclipAllegatoContestoSchema).optional(),
});
// DELETE /api/attachments/:id (routes/issues.ts:18628-18681) preserves the linked work product.
exports.PaperclipAllegatoRimossoSchema = zod_1.z.strictObject({ ok: zod_1.z.literal(true) });
//# sourceMappingURL=wire-allegati.js.map