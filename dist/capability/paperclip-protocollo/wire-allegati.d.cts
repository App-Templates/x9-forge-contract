import { z } from 'zod';
export declare const PAPERCLIP_ATTACHMENT_MAX_BYTES_DEFAULT: number;
export declare const PAPERCLIP_ATTACHMENT_MAX_BYTES_ENV: "PAPERCLIP_ATTACHMENT_MAX_BYTES";
export declare const PAPERCLIP_ATTACHMENT_ALLOWED_TYPES_ENV: "PAPERCLIP_ALLOWED_ATTACHMENT_TYPES";
export declare const PAPERCLIP_ATTACHMENT_FORM_FIELD: "file";
export declare const PAPERCLIP_ATTACHMENT_DEFAULT_ALLOWED_TYPES: readonly ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence", "audio/mpeg", "audio/mp4", "audio/ogg", "audio/wav", "audio/webm", "application/pdf", "application/zip", "text/markdown", "text/plain", "application/json", "text/csv", "text/html", "application/msword", "application/vnd.ms-excel", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "video/mp4", "video/webm", "video/quicktime", "video/x-m4v"];
export declare const PAPERCLIP_ATTACHMENT_GENERIC_TYPES: readonly ["application/octet-stream", "binary/octet-stream", "application/x-binary"];
export declare const PAPERCLIP_ATTACHMENT_INLINE_TYPES: readonly ["image/*", "application/pdf", "text/plain", "text/markdown", "application/json", "text/csv", "video/mp4", "video/webm", "video/quicktime", "video/x-m4v"];
/** Lowercase type without parameters, as compared by Paperclip (attachment-types.ts:100-110). */
export declare function paperclipAttachmentTypeEssence(contentType: string): string;
/** Whether the type belongs to the default asset/chat list, not the issue upload policy. */
export declare function isPaperclipAttachmentTypeInDefaultList(contentType: string): boolean;
/**
 * Client checks before POST: one nonempty file within the instance limit (default 10 MiB).
 * issueCommentId must belong to the same run, otherwise Paperclip returns
 * 422 issue_attachment_parent_run_mismatch.
 */
export declare function paperclipAllegatoCaricaSchema(maxBytes?: number): z.ZodObject<{
    filename: z.ZodString;
    contentType: z.ZodString;
    byteSize: z.ZodNumber;
    issueCommentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
}, z.core.$strict>;
export declare const PaperclipAllegatoCaricaSchema: z.ZodObject<{
    filename: z.ZodString;
    contentType: z.ZodString;
    byteSize: z.ZodNumber;
    issueCommentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
}, z.core.$strict>;
export declare const PaperclipAllegatoSchema: z.ZodObject<{
    id: z.ZodGUID;
    companyId: z.ZodGUID;
    issueId: z.ZodGUID;
    issueCommentId: z.ZodNullable<z.ZodGUID>;
    originatingRunId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    assetId: z.ZodGUID;
    provider: z.ZodString;
    objectKey: z.ZodString;
    contentType: z.ZodString;
    byteSize: z.ZodNumber;
    sha256: z.ZodString;
    originalFilename: z.ZodNullable<z.ZodString>;
    createdByAgentId: z.ZodNullable<z.ZodGUID>;
    createdByUserId: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    contentPath: z.ZodString;
    openPath: z.ZodString;
    downloadPath: z.ZodString;
}, z.core.$loose>;
export declare const PaperclipAllegatiSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodGUID;
    companyId: z.ZodGUID;
    issueId: z.ZodGUID;
    issueCommentId: z.ZodNullable<z.ZodGUID>;
    originatingRunId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    assetId: z.ZodGUID;
    provider: z.ZodString;
    objectKey: z.ZodString;
    contentType: z.ZodString;
    byteSize: z.ZodNumber;
    sha256: z.ZodString;
    originalFilename: z.ZodNullable<z.ZodString>;
    createdByAgentId: z.ZodNullable<z.ZodGUID>;
    createdByUserId: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    contentPath: z.ZodString;
    openPath: z.ZodString;
    downloadPath: z.ZodString;
}, z.core.$loose>>;
export declare const PaperclipAllegatoContestoSchema: z.ZodObject<{
    id: z.ZodGUID;
    filename: z.ZodNullable<z.ZodString>;
    contentType: z.ZodString;
    byteSize: z.ZodNumber;
    contentPath: z.ZodString;
    createdAt: z.ZodString;
}, z.core.$loose>;
export declare const PaperclipContestoConAllegatiSchema: z.ZodObject<{
    issue: z.ZodObject<{
        id: z.ZodGUID;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        status: z.ZodEnum<{
            cancelled: "cancelled";
            done: "done";
            blocked: "blocked";
            backlog: "backlog";
            todo: "todo";
            in_progress: "in_progress";
            in_review: "in_review";
        }>;
        parentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
        goalId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
        assigneeAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
        blockedBy: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodGUID;
            status: z.ZodEnum<{
                cancelled: "cancelled";
                done: "done";
                blocked: "blocked";
                backlog: "backlog";
                todo: "todo";
                in_progress: "in_progress";
                in_review: "in_review";
            }>;
            title: z.ZodOptional<z.ZodString>;
            identifier: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            assigneeAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
        }, z.core.$loose>>>;
        identifier: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        companyId: z.ZodOptional<z.ZodGUID>;
        priority: z.ZodOptional<z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
            critical: "critical";
        }>>;
        createdByAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
        executionRunId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
        blocks: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodGUID;
            status: z.ZodEnum<{
                cancelled: "cancelled";
                done: "done";
                blocked: "blocked";
                backlog: "backlog";
                todo: "todo";
                in_progress: "in_progress";
                in_review: "in_review";
            }>;
            title: z.ZodOptional<z.ZodString>;
            identifier: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            assigneeAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
        }, z.core.$loose>>>;
        updatedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>;
    ancestors: z.ZodArray<z.ZodObject<{
        id: z.ZodGUID;
        title: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            cancelled: "cancelled";
            done: "done";
            blocked: "blocked";
            backlog: "backlog";
            todo: "todo";
            in_progress: "in_progress";
            in_review: "in_review";
        }>>;
    }, z.core.$loose>>;
    wakeComment: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodGUID;
        body: z.ZodString;
        authorAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
        authorUserId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>>>;
    commentCursor: z.ZodCatch<z.ZodOptional<z.ZodObject<{
        totalComments: z.ZodNumber;
        latestCommentId: z.ZodNullable<z.ZodGUID>;
        latestCommentAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$loose>>>;
    project: z.ZodCatch<z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodGUID;
        name: z.ZodString;
        status: z.ZodString;
        targetDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$loose>>>>;
    goal: z.ZodCatch<z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodGUID;
        title: z.ZodString;
        status: z.ZodString;
        level: z.ZodString;
        parentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    }, z.core.$loose>>>>;
    continuationSummary: z.ZodCatch<z.ZodOptional<z.ZodNullable<z.ZodObject<{
        key: z.ZodString;
        title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        body: z.ZodString;
        latestRevisionId: z.ZodOptional<z.ZodGUID>;
    }, z.core.$loose>>>>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodGUID;
        filename: z.ZodNullable<z.ZodString>;
        contentType: z.ZodString;
        byteSize: z.ZodNumber;
        contentPath: z.ZodString;
        createdAt: z.ZodString;
    }, z.core.$loose>>>;
}, z.core.$loose>;
export declare const PaperclipAllegatoRimossoSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
}, z.core.$strict>;
export type PaperclipAllegatoCarica = z.infer<typeof PaperclipAllegatoCaricaSchema>;
export type PaperclipAllegato = z.infer<typeof PaperclipAllegatoSchema>;
export type PaperclipAllegatoContesto = z.infer<typeof PaperclipAllegatoContestoSchema>;
//# sourceMappingURL=wire-allegati.d.ts.map