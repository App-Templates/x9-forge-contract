import { z } from 'zod';
import type { PaperclipAllegato } from "./wire-allegati.cjs";
export declare const PAPERCLIP_WORK_PRODUCT_TYPES: readonly ["preview_url", "runtime_service", "pull_request", "branch", "commit", "artifact", "document"];
export declare const PAPERCLIP_WORK_PRODUCT_STATUSES: readonly ["active", "ready_for_review", "approved", "changes_requested", "merged", "closed", "failed", "archived", "draft"];
export declare const PAPERCLIP_WORK_PRODUCT_REVIEW_STATES: readonly ["none", "needs_board_review", "approved", "changes_requested"];
export declare const PAPERCLIP_WORK_PRODUCT_HEALTH: readonly ["unknown", "healthy", "unhealthy"];
export declare const PaperclipProdottoTipoSchema: z.ZodEnum<{
    artifact: "artifact";
    commit: "commit";
    document: "document";
    preview_url: "preview_url";
    runtime_service: "runtime_service";
    pull_request: "pull_request";
    branch: "branch";
}>;
export declare const PaperclipProdottoStatoSchema: z.ZodEnum<{
    failed: "failed";
    active: "active";
    approved: "approved";
    draft: "draft";
    changes_requested: "changes_requested";
    archived: "archived";
    closed: "closed";
    ready_for_review: "ready_for_review";
    merged: "merged";
}>;
export declare const PaperclipProdottoRevisioneSchema: z.ZodEnum<{
    approved: "approved";
    none: "none";
    changes_requested: "changes_requested";
    needs_board_review: "needs_board_review";
}>;
export declare const PaperclipProdottoMetadatiAllegatoSchema: z.ZodObject<{
    attachmentId: z.ZodGUID;
}, z.core.$strict>;
export declare const PaperclipProdottoCreaCorpoSchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    executionWorkspaceId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    runtimeServiceId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    type: z.ZodEnum<{
        artifact: "artifact";
        commit: "commit";
        document: "document";
        preview_url: "preview_url";
        runtime_service: "runtime_service";
        pull_request: "pull_request";
        branch: "branch";
    }>;
    provider: z.ZodString;
    externalId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    title: z.ZodString;
    url: z.ZodOptional<z.ZodNullable<z.ZodURL>>;
    status: z.ZodOptional<z.ZodEnum<{
        failed: "failed";
        active: "active";
        approved: "approved";
        draft: "draft";
        changes_requested: "changes_requested";
        archived: "archived";
        closed: "closed";
        ready_for_review: "ready_for_review";
        merged: "merged";
    }>>;
    reviewState: z.ZodOptional<z.ZodEnum<{
        approved: "approved";
        none: "none";
        changes_requested: "changes_requested";
        needs_board_review: "needs_board_review";
    }>>;
    isPrimary: z.ZodOptional<z.ZodBoolean>;
    healthStatus: z.ZodOptional<z.ZodEnum<{
        unknown: "unknown";
        healthy: "healthy";
        unhealthy: "unhealthy";
    }>>;
    summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodObject<{}, z.core.$loose>>>;
    createdByRunId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
}, z.core.$strict>;
export declare const PaperclipProdottoAggiornaCorpoSchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodGUID>>>;
    executionWorkspaceId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodGUID>>>;
    runtimeServiceId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodGUID>>>;
    type: z.ZodOptional<z.ZodEnum<{
        artifact: "artifact";
        commit: "commit";
        document: "document";
        preview_url: "preview_url";
        runtime_service: "runtime_service";
        pull_request: "pull_request";
        branch: "branch";
    }>>;
    provider: z.ZodOptional<z.ZodString>;
    externalId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    title: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodURL>>>;
    status: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        failed: "failed";
        active: "active";
        approved: "approved";
        draft: "draft";
        changes_requested: "changes_requested";
        archived: "archived";
        closed: "closed";
        ready_for_review: "ready_for_review";
        merged: "merged";
    }>>>;
    reviewState: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        approved: "approved";
        none: "none";
        changes_requested: "changes_requested";
        needs_board_review: "needs_board_review";
    }>>>;
    isPrimary: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    healthStatus: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        unknown: "unknown";
        healthy: "healthy";
        unhealthy: "unhealthy";
    }>>>;
    summary: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    metadata: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodObject<{}, z.core.$loose>>>>;
    createdByRunId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodGUID>>>;
}, z.core.$strict>;
export declare const PaperclipProdottoSchema: z.ZodObject<{
    id: z.ZodGUID;
    companyId: z.ZodGUID;
    issueId: z.ZodGUID;
    projectId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    executionWorkspaceId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    runtimeServiceId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    type: z.ZodEnum<{
        artifact: "artifact";
        commit: "commit";
        document: "document";
        preview_url: "preview_url";
        runtime_service: "runtime_service";
        pull_request: "pull_request";
        branch: "branch";
    }>;
    provider: z.ZodString;
    externalId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    title: z.ZodString;
    url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodEnum<{
        failed: "failed";
        active: "active";
        approved: "approved";
        draft: "draft";
        changes_requested: "changes_requested";
        archived: "archived";
        closed: "closed";
        ready_for_review: "ready_for_review";
        merged: "merged";
    }>;
    reviewState: z.ZodEnum<{
        approved: "approved";
        none: "none";
        changes_requested: "changes_requested";
        needs_board_review: "needs_board_review";
    }>;
    isPrimary: z.ZodBoolean;
    healthStatus: z.ZodEnum<{
        unknown: "unknown";
        healthy: "healthy";
        unhealthy: "unhealthy";
    }>;
    summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodObject<{}, z.core.$loose>>>;
    createdByRunId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$loose>;
export declare const PaperclipProdottiSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodGUID;
    companyId: z.ZodGUID;
    issueId: z.ZodGUID;
    projectId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    executionWorkspaceId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    runtimeServiceId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    type: z.ZodEnum<{
        artifact: "artifact";
        commit: "commit";
        document: "document";
        preview_url: "preview_url";
        runtime_service: "runtime_service";
        pull_request: "pull_request";
        branch: "branch";
    }>;
    provider: z.ZodString;
    externalId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    title: z.ZodString;
    url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodEnum<{
        failed: "failed";
        active: "active";
        approved: "approved";
        draft: "draft";
        changes_requested: "changes_requested";
        archived: "archived";
        closed: "closed";
        ready_for_review: "ready_for_review";
        merged: "merged";
    }>;
    reviewState: z.ZodEnum<{
        approved: "approved";
        none: "none";
        changes_requested: "changes_requested";
        needs_board_review: "needs_board_review";
    }>;
    isPrimary: z.ZodBoolean;
    healthStatus: z.ZodEnum<{
        unknown: "unknown";
        healthy: "healthy";
        unhealthy: "unhealthy";
    }>;
    summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodObject<{}, z.core.$loose>>>;
    createdByRunId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$loose>>;
export declare const PaperclipIncaricoConProdottiSchema: z.ZodObject<{
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
    workProducts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodGUID;
        companyId: z.ZodGUID;
        issueId: z.ZodGUID;
        projectId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
        executionWorkspaceId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
        runtimeServiceId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
        type: z.ZodEnum<{
            artifact: "artifact";
            commit: "commit";
            document: "document";
            preview_url: "preview_url";
            runtime_service: "runtime_service";
            pull_request: "pull_request";
            branch: "branch";
        }>;
        provider: z.ZodString;
        externalId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        title: z.ZodString;
        url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        status: z.ZodEnum<{
            failed: "failed";
            active: "active";
            approved: "approved";
            draft: "draft";
            changes_requested: "changes_requested";
            archived: "archived";
            closed: "closed";
            ready_for_review: "ready_for_review";
            merged: "merged";
        }>;
        reviewState: z.ZodEnum<{
            approved: "approved";
            none: "none";
            changes_requested: "changes_requested";
            needs_board_review: "needs_board_review";
        }>;
        isPrimary: z.ZodBoolean;
        healthStatus: z.ZodEnum<{
            unknown: "unknown";
            healthy: "healthy";
            unhealthy: "unhealthy";
        }>;
        summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        metadata: z.ZodOptional<z.ZodNullable<z.ZodObject<{}, z.core.$loose>>>;
        createdByRunId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$loose>>>;
}, z.core.$loose>;
/**
 * Il prodotto durevole di un file gia' caricato (caso vero 2): `artifact` + `paperclip` + `{attachmentId}`.
 * Titolo dal nome del file come fa il server (services/issues.ts:12938-12966); nasce `active`, non primario.
 */
export declare function paperclipProdottoDaAllegato(allegato: Pick<PaperclipAllegato, 'id' | 'originalFilename'>, opzioni?: {
    title?: string;
    status?: (typeof PAPERCLIP_WORK_PRODUCT_STATUSES)[number];
    reviewState?: (typeof PAPERCLIP_WORK_PRODUCT_REVIEW_STATES)[number];
    isPrimary?: boolean;
    summary?: string;
    createdByRunId?: string;
}): z.infer<typeof PaperclipProdottoCreaCorpoSchema>;
/** Paperclip routes/issues.ts:6331-6336: `createdByRunId` deve essere la corsa autenticata (403 altrimenti). */
export declare function paperclipProdottoDellaCorsa(corpo: {
    createdByRunId?: string | null | undefined;
}, runIdAutenticata: string): boolean;
export type PaperclipProdottoCreaCorpo = z.infer<typeof PaperclipProdottoCreaCorpoSchema>;
export type PaperclipProdottoAggiornaCorpo = z.infer<typeof PaperclipProdottoAggiornaCorpoSchema>;
export type PaperclipProdotto = z.infer<typeof PaperclipProdottoSchema>;
//# sourceMappingURL=wire-prodotti.d.ts.map