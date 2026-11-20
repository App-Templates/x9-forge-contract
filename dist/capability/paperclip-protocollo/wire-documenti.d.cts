import { z } from 'zod';
export declare const PAPERCLIP_DOCUMENT_KEY_PATTERN: RegExp;
export declare const PaperclipDocumentoChiaveSchema: z.ZodString;
export declare const PAPERCLIP_DOCUMENT_FORMATS: readonly ["markdown"];
export declare const PAPERCLIP_DOCUMENT_BODY_MAX = 524288;
export declare const PaperclipDocumentoScriviCorpoSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    format: z.ZodEnum<{
        markdown: "markdown";
    }>;
    body: z.ZodString;
    changeSummary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    baseRevisionId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
}, z.core.$strict>;
export declare const PaperclipDocumentoCreaCorpoSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    format: z.ZodEnum<{
        markdown: "markdown";
    }>;
    body: z.ZodString;
    changeSummary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    baseRevisionId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
}, z.core.$strict>;
export declare const PaperclipDocumentoAggiornaCorpoSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    format: z.ZodEnum<{
        markdown: "markdown";
    }>;
    body: z.ZodString;
    changeSummary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    baseRevisionId: z.ZodGUID;
}, z.core.$strict>;
export declare const PaperclipDocumentoLettoSchema: z.ZodObject<{
    id: z.ZodGUID;
    companyId: z.ZodGUID;
    issueId: z.ZodGUID;
    key: z.ZodString;
    title: z.ZodNullable<z.ZodString>;
    format: z.ZodEnum<{
        markdown: "markdown";
    }>;
    body: z.ZodOptional<z.ZodString>;
    latestRevisionId: z.ZodNullable<z.ZodGUID>;
    latestRevisionNumber: z.ZodNumber;
    lockedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    lockedByAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    lockedByUserId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, z.core.$loose>;
export declare const PaperclipPianoLegacySchema: z.ZodObject<{
    key: z.ZodLiteral<"plan">;
    body: z.ZodString;
    source: z.ZodLiteral<"issue_description">;
}, z.core.$loose>;
export declare const PaperclipIncaricoConDocumentiSchema: z.ZodObject<{
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
    planDocument: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodGUID;
        companyId: z.ZodGUID;
        issueId: z.ZodGUID;
        key: z.ZodString;
        title: z.ZodNullable<z.ZodString>;
        format: z.ZodEnum<{
            markdown: "markdown";
        }>;
        body: z.ZodOptional<z.ZodString>;
        latestRevisionId: z.ZodNullable<z.ZodGUID>;
        latestRevisionNumber: z.ZodNumber;
        lockedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        lockedByAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
        lockedByUserId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodOptional<z.ZodString>;
        updatedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>>>;
    documentSummaries: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodGUID;
        companyId: z.ZodGUID;
        issueId: z.ZodGUID;
        key: z.ZodString;
        title: z.ZodNullable<z.ZodString>;
        format: z.ZodEnum<{
            markdown: "markdown";
        }>;
        body: z.ZodOptional<z.ZodString>;
        latestRevisionId: z.ZodNullable<z.ZodGUID>;
        latestRevisionNumber: z.ZodNumber;
        lockedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        lockedByAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
        lockedByUserId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodOptional<z.ZodString>;
        updatedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>>>;
    legacyPlanDocument: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        key: z.ZodLiteral<"plan">;
        body: z.ZodString;
        source: z.ZodLiteral<"issue_description">;
    }, z.core.$loose>>>;
}, z.core.$loose>;
export declare const PaperclipDocumentoConflittoSchema: z.ZodObject<{
    error: z.ZodString;
    details: z.ZodOptional<z.ZodObject<{
        currentRevisionId: z.ZodOptional<z.ZodGUID>;
    }, z.core.$loose>>;
}, z.core.$loose>;
export declare function paperclipDocumentoScritto(chiaveChiesta: string, risposta: {
    key: string;
}): {
    key: string;
    rediretto: boolean;
};
export declare function paperclipConfermaPianoIdempotencyKey(issueId: string, latestRevisionId: string): string;
export declare const PAPERCLIP_CONFERMA_CONTINUATION_POLICIES: readonly ["none", "wake_assignee", "wake_assignee_on_accept"];
export declare const PaperclipConfermaDocumentoCorpoSchema: z.ZodObject<{
    kind: z.ZodLiteral<"request_confirmation">;
    idempotencyKey: z.ZodString;
    continuationPolicy: z.ZodEnum<{
        none: "none";
        wake_assignee: "wake_assignee";
        wake_assignee_on_accept: "wake_assignee_on_accept";
    }>;
    title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    payload: z.ZodObject<{
        version: z.ZodLiteral<1>;
        prompt: z.ZodString;
        acceptLabel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        rejectLabel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        rejectRequiresReason: z.ZodOptional<z.ZodBoolean>;
        detailsMarkdown: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        supersedeOnUserComment: z.ZodOptional<z.ZodBoolean>;
        target: z.ZodObject<{
            type: z.ZodLiteral<"issue_document">;
            key: z.ZodString;
            revisionId: z.ZodGUID;
            issueId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
            documentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
            revisionNumber: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            href: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strict>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type PaperclipDocumentoScriviCorpo = z.infer<typeof PaperclipDocumentoScriviCorpoSchema>;
export type PaperclipDocumentoLetto = z.infer<typeof PaperclipDocumentoLettoSchema>;
export type PaperclipConfermaDocumentoCorpo = z.infer<typeof PaperclipConfermaDocumentoCorpoSchema>;
//# sourceMappingURL=wire-documenti.d.ts.map