"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalCompanyBoardProjectContract = exports.InternalCompanyBoardProjectQuerySchema = exports.internalCompanyBoardOverviewContract = exports.InternalCompanyBoardOverviewQuerySchema = exports.internalCompanyBoardCompaniesContract = exports.InternalCompanyBoardCompaniesQuerySchema = exports.internalDevProjectSessionsContract = exports.InternalDevProjectSessionsResponseSchema = exports.InternalDevProjectSessionsQuerySchema = exports.DevProjectSessionStateSchema = exports.DEV_PROJECT_SESSION_STATES = exports.internalMemoryCompanyBoardProjectsContract = exports.InternalMemoryCompanyBoardProjectsResponseSchema = exports.InternalMemoryCompanyBoardProjectsQuerySchema = exports.internalPaperclipCompanyBoardContract = exports.InternalPaperclipCompanyBoardResponseSchema = exports.InternalPaperclipCompanyBoardQuerySchema = exports.PaperclipBoardOwnerPersonSchema = exports.PAPERCLIP_BOARD_OWNER_PERSON = exports.PaperclipBoardRunStatusSchema = exports.PAPERCLIP_BOARD_RUN_STATUSES = exports.PaperclipBoardPauseReasonSchema = exports.PAPERCLIP_BOARD_PAUSE_REASONS = exports.PaperclipBoardIssueStatusSchema = exports.PAPERCLIP_BOARD_ISSUE_STATUSES = exports.PaperclipBoardAgentStatusSchema = exports.PAPERCLIP_BOARD_AGENT_STATUSES = exports.internalMemoryCompanyBoardSourcesContract = exports.InternalMemoryCompanyBoardSourcesResponseSchema = exports.InternalMemoryCompanyBoardSourcesQuerySchema = exports.CompanyBoardReadErrorSchema = exports.COMPANY_BOARD_READ_ERRORS = exports.INTERNAL_COMPANY_BOARD_PROJECT_PATH = exports.INTERNAL_COMPANY_BOARD_OVERVIEW_PATH = exports.INTERNAL_COMPANY_BOARD_COMPANIES_PATH = exports.INTERNAL_DEV_PROJECT_SESSIONS_PATH = exports.INTERNAL_MEMORY_COMPANY_BOARD_PROJECTS_PATH = exports.INTERNAL_PAPERCLIP_COMPANY_BOARD_PATH = exports.INTERNAL_MEMORY_COMPANY_BOARD_SOURCES_PATH = void 0;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../../agent/agent-identity.cjs");
const action_plan_js_1 = require("../../organization/action-plan.cjs");
const asset_js_1 = require("../../organization/asset.cjs");
const company_board_js_1 = require("../../organization/company-board.cjs");
const decision_request_js_1 = require("../../organization/decision-request.cjs");
/**
 * Read contracts of the company board (1.113.0). All GET, internal secret only:
 * the reader (agent-core) has already recognised the company.
 */
exports.INTERNAL_MEMORY_COMPANY_BOARD_SOURCES_PATH = '/internal/memory/company-board-sources';
exports.INTERNAL_PAPERCLIP_COMPANY_BOARD_PATH = '/internal/paperclip/company-board';
exports.INTERNAL_MEMORY_COMPANY_BOARD_PROJECTS_PATH = '/internal/memory/company-board-projects';
exports.INTERNAL_DEV_PROJECT_SESSIONS_PATH = '/internal/dev/project-sessions';
exports.INTERNAL_COMPANY_BOARD_COMPANIES_PATH = '/internal/company-board/companies';
exports.INTERNAL_COMPANY_BOARD_OVERVIEW_PATH = '/internal/company-board/overview';
exports.INTERNAL_COMPANY_BOARD_PROJECT_PATH = '/internal/company-board/project';
const TenantIdSchema = zod_1.z.string().min(1);
const OrganizationIdSchema = zod_1.z.string().min(1).max(64);
const ClientIdSchema = asset_js_1.AssetRefSchema.shape.companyId;
const ProjectIdSchema = zod_1.z.string().min(1).max(100);
const BuSlugSchema = zod_1.z.string().min(1).max(30).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const IsoSchema = zod_1.z.iso.datetime({ offset: true });
const ShortTextSchema = zod_1.z.string().min(1).max(500);
/** Errors shared by the composed reads (4-6). */
exports.COMPANY_BOARD_READ_ERRORS = ['identity_uncertain', 'not_owner', 'not_director', 'source_unavailable'];
exports.CompanyBoardReadErrorSchema = zod_1.z.enum(exports.COMPANY_BOARD_READ_ERRORS);
// 1. Memory sources: plan, decisions, materials.
exports.InternalMemoryCompanyBoardSourcesQuerySchema = zod_1.z.strictObject({
    tenantId: TenantIdSchema,
    organizationId: OrganizationIdSchema,
    clientId: ClientIdSchema,
    projectId: ProjectIdSchema,
});
exports.InternalMemoryCompanyBoardSourcesResponseSchema = zod_1.z.strictObject({
    plan: action_plan_js_1.ActionPlanSchema.nullable(),
    /** Units of the previous plan version, for «Piano v3 approvato il …: tolti …». */
    previousPlanUnits: zod_1.z.array(BuSlugSchema).max(40).nullable(),
    decisions: zod_1.z.array(zod_1.z.strictObject({
        request: decision_request_js_1.DecisionRequestSchema,
        outcome: decision_request_js_1.DecisionOutcomeSchema.nullable(),
        mailSubject: zod_1.z.string().min(1).max(998).nullable(),
    })).max(100),
    assets: zod_1.z.array(zod_1.z.strictObject({
        assetId: asset_js_1.AssetRefSchema.shape.assetId,
        buSlug: BuSlugSchema.nullable(),
        kind: zod_1.z.string().min(1).max(40),
        title: zod_1.z.string().min(1).max(255),
        createdAt: IsoSchema,
    })).max(200),
});
exports.internalMemoryCompanyBoardSourcesContract = {
    method: 'GET',
    path: exports.INTERNAL_MEMORY_COMPANY_BOARD_SOURCES_PATH,
    authType: 'secret',
    querySchema: exports.InternalMemoryCompanyBoardSourcesQuerySchema,
    responseSchema: exports.InternalMemoryCompanyBoardSourcesResponseSchema,
};
// 2. Paperclip: native names (rev. 467125fa, constants.ts:16-24, 189-197, 204, 919).
exports.PAPERCLIP_BOARD_AGENT_STATUSES = [
    'active', 'paused', 'idle', 'running', 'error', 'pending_approval', 'terminated',
];
exports.PaperclipBoardAgentStatusSchema = zod_1.z.enum(exports.PAPERCLIP_BOARD_AGENT_STATUSES);
exports.PAPERCLIP_BOARD_ISSUE_STATUSES = [
    'backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled',
];
exports.PaperclipBoardIssueStatusSchema = zod_1.z.enum(exports.PAPERCLIP_BOARD_ISSUE_STATUSES);
exports.PAPERCLIP_BOARD_PAUSE_REASONS = ['manual', 'budget', 'system'];
exports.PaperclipBoardPauseReasonSchema = zod_1.z.enum(exports.PAPERCLIP_BOARD_PAUSE_REASONS);
exports.PAPERCLIP_BOARD_RUN_STATUSES = [
    'queued', 'running', 'succeeded', 'failed', 'error', 'timed_out', 'cancelled',
];
exports.PaperclipBoardRunStatusSchema = zod_1.z.enum(exports.PAPERCLIP_BOARD_RUN_STATUSES);
exports.PAPERCLIP_BOARD_OWNER_PERSON = ['collegata', 'mancante', 'non_nota'];
exports.PaperclipBoardOwnerPersonSchema = zod_1.z.enum(exports.PAPERCLIP_BOARD_OWNER_PERSON);
exports.InternalPaperclipCompanyBoardQuerySchema = zod_1.z.strictObject({
    organizationId: OrganizationIdSchema,
    projectId: ProjectIdSchema.optional(),
    /** `true` on the project page: adds `blockedSince` and `replies`. */
    detail: zod_1.z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
    /** With it cap-paperclip checks the owner's person in Paperclip and fills `pausedByOwner`. */
    ownerId: agent_identity_js_1.OwnerIdSchema.optional(),
});
exports.InternalPaperclipCompanyBoardResponseSchema = zod_1.z.strictObject({
    agents: zod_1.z.array(zod_1.z.strictObject({
        paperclipAgentId: zod_1.z.uuid(),
        buSlug: BuSlugSchema.nullable(),
        role: zod_1.z.string().min(1).max(100),
        status: exports.PaperclipBoardAgentStatusSchema,
        pauseReason: exports.PaperclipBoardPauseReasonSchema.nullable(),
        pausedAt: IsoSchema.nullable(),
        pausedByOwner: zod_1.z.boolean().nullable(),
        projectCount: zod_1.z.number().int().min(0),
        recentRuns: zod_1.z.array(zod_1.z.strictObject({
            status: exports.PaperclipBoardRunStatusSchema,
            errorCode: zod_1.z.string().min(1).max(100).nullable(),
            at: IsoSchema,
        })).max(20),
    })).max(200),
    issues: zod_1.z.array(zod_1.z.strictObject({
        issueId: zod_1.z.string().min(1).max(64),
        identifier: zod_1.z.string().min(1).max(64),
        title: zod_1.z.string().min(1).max(300),
        status: exports.PaperclipBoardIssueStatusSchema,
        parentId: zod_1.z.string().min(1).max(64).nullable(),
        assigneeAgentId: zod_1.z.uuid().nullable(),
        blockedBy: zod_1.z.array(zod_1.z.string().min(1).max(64)).max(50),
        approvalMark: zod_1.z.string().min(1).max(64).nullable(),
        updatedAt: IsoSchema,
        startedAt: IsoSchema.nullable(),
        completedAt: IsoSchema.nullable(),
        /** Only with `detail=true`. */
        blockedSince: IsoSchema.nullable().optional(),
        /** Only with `detail=true`. */
        replies: zod_1.z.array(zod_1.z.strictObject({ at: IsoSchema })).max(50).optional(),
        lastComment: zod_1.z.strictObject({
            at: IsoSchema,
            excerpt: zod_1.z.string().max(500),
            byAgent: zod_1.z.boolean(),
        }).nullable(),
    })).max(1000),
    /** X9 projects that have a project in Paperclip (for projects without a plan). */
    projects: zod_1.z.array(zod_1.z.strictObject({ projectId: ProjectIdSchema })).max(100),
    truncated: zod_1.z.boolean(),
    ownerPerson: exports.PaperclipBoardOwnerPersonSchema,
});
exports.internalPaperclipCompanyBoardContract = {
    method: 'GET',
    path: exports.INTERNAL_PAPERCLIP_COMPANY_BOARD_PATH,
    authType: 'secret',
    querySchema: exports.InternalPaperclipCompanyBoardQuerySchema,
    responseSchema: exports.InternalPaperclipCompanyBoardResponseSchema,
};
// 2b. Memory: projects of the organization, from the latest saved plan version.
exports.InternalMemoryCompanyBoardProjectsQuerySchema = zod_1.z.strictObject({
    tenantId: TenantIdSchema,
    organizationId: OrganizationIdSchema,
});
exports.InternalMemoryCompanyBoardProjectsResponseSchema = zod_1.z.strictObject({
    projects: zod_1.z.array(zod_1.z.strictObject({
        projectId: ProjectIdSchema,
        clientId: ClientIdSchema,
        companyName: zod_1.z.string().min(1).max(200).nullable(),
        projectName: zod_1.z.string().min(1).max(200).nullable(),
        planVersion: zod_1.z.number().int().min(1),
        updatedAt: IsoSchema,
    })).max(100),
});
exports.internalMemoryCompanyBoardProjectsContract = {
    method: 'GET',
    path: exports.INTERNAL_MEMORY_COMPANY_BOARD_PROJECTS_PATH,
    authType: 'secret',
    querySchema: exports.InternalMemoryCompanyBoardProjectsQuerySchema,
    responseSchema: exports.InternalMemoryCompanyBoardProjectsResponseSchema,
};
// 3. cap-dev sessions per project. Never assignment text, files, links or sha.
/** States of cap-dev `board/stato.ts:4`. */
exports.DEV_PROJECT_SESSION_STATES = [
    'richiesta', 'analisi', 'report-pronto', 'approvato', 'in-lavorazione', 'revisione', 'chiuso', 'scartato', 'bloccato',
];
exports.DevProjectSessionStateSchema = zod_1.z.enum(exports.DEV_PROJECT_SESSION_STATES);
exports.InternalDevProjectSessionsQuerySchema = zod_1.z.strictObject({
    tenantId: TenantIdSchema,
    organizationId: OrganizationIdSchema,
    projectId: ProjectIdSchema,
});
exports.InternalDevProjectSessionsResponseSchema = zod_1.z.strictObject({
    units: zod_1.z.array(zod_1.z.strictObject({
        buSlug: BuSlugSchema,
        sessions: zod_1.z.array(zod_1.z.strictObject({
            id: zod_1.z.string().min(1).max(100),
            state: exports.DevProjectSessionStateSchema,
            openedAt: IsoSchema,
            updatedAt: IsoSchema,
            closedAt: IsoSchema.nullable(),
            computerName: zod_1.z.string().min(1).max(100).nullable(),
            title: ShortTextSchema.nullable(),
            scaletta: zod_1.z.array(zod_1.z.strictObject({ text: ShortTextSchema, done: zod_1.z.boolean() })).max(50).optional(),
        })).max(200),
    })).max(40),
    unreadable: zod_1.z.number().int().min(0),
});
exports.internalDevProjectSessionsContract = {
    method: 'GET',
    path: exports.INTERNAL_DEV_PROJECT_SESSIONS_PATH,
    authType: 'secret',
    querySchema: exports.InternalDevProjectSessionsQuerySchema,
    responseSchema: exports.InternalDevProjectSessionsResponseSchema,
};
// 4-6. Composed board, served by agent-core to Forge.
exports.InternalCompanyBoardCompaniesQuerySchema = zod_1.z.strictObject({
    tenantId: TenantIdSchema,
    ownerIds: zod_1.z.string().transform((value) => value.split(',')).pipe(zod_1.z.array(agent_identity_js_1.OwnerIdSchema).min(1).max(50)),
});
exports.internalCompanyBoardCompaniesContract = {
    method: 'GET',
    path: exports.INTERNAL_COMPANY_BOARD_COMPANIES_PATH,
    authType: 'secret',
    querySchema: exports.InternalCompanyBoardCompaniesQuerySchema,
    responseSchema: company_board_js_1.CompanyListSchema,
};
exports.InternalCompanyBoardOverviewQuerySchema = zod_1.z.strictObject({
    tenantId: TenantIdSchema,
    ownerId: agent_identity_js_1.OwnerIdSchema,
    directorAgentId: agent_identity_js_1.AgentIdSchema,
});
exports.internalCompanyBoardOverviewContract = {
    method: 'GET',
    path: exports.INTERNAL_COMPANY_BOARD_OVERVIEW_PATH,
    authType: 'secret',
    querySchema: exports.InternalCompanyBoardOverviewQuerySchema,
    responseSchema: company_board_js_1.CompanyOverviewSchema,
};
exports.InternalCompanyBoardProjectQuerySchema = exports.InternalCompanyBoardOverviewQuerySchema.extend({
    projectId: ProjectIdSchema,
});
exports.internalCompanyBoardProjectContract = {
    method: 'GET',
    path: exports.INTERNAL_COMPANY_BOARD_PROJECT_PATH,
    authType: 'secret',
    querySchema: exports.InternalCompanyBoardProjectQuerySchema,
    responseSchema: company_board_js_1.CompanyBoardSchema,
};
//# sourceMappingURL=internal-company-board.js.map