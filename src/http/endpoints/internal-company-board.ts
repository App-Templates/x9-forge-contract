import { z } from 'zod';
import { AgentIdSchema, OwnerIdSchema } from '../../agent/agent-identity.js';
import { ActionPlanSchema } from '../../organization/action-plan.js';
import { AssetRefSchema } from '../../organization/asset.js';
import { CompanyBoardSchema, CompanyListSchema, CompanyOverviewSchema } from '../../organization/company-board.js';
import { DecisionOutcomeSchema, DecisionRequestSchema } from '../../organization/decision-request.js';

/**
 * Read contracts of the company board (1.113.0). All GET, internal secret only:
 * the reader (agent-core) has already recognised the company.
 */

export const INTERNAL_MEMORY_COMPANY_BOARD_SOURCES_PATH = '/internal/memory/company-board-sources' as const;
export const INTERNAL_PAPERCLIP_COMPANY_BOARD_PATH = '/internal/paperclip/company-board' as const;
export const INTERNAL_MEMORY_COMPANY_BOARD_PROJECTS_PATH = '/internal/memory/company-board-projects' as const;
export const INTERNAL_DEV_PROJECT_SESSIONS_PATH = '/internal/dev/project-sessions' as const;
export const INTERNAL_COMPANY_BOARD_COMPANIES_PATH = '/internal/company-board/companies' as const;
export const INTERNAL_COMPANY_BOARD_OVERVIEW_PATH = '/internal/company-board/overview' as const;
export const INTERNAL_COMPANY_BOARD_PROJECT_PATH = '/internal/company-board/project' as const;

const TenantIdSchema = z.string().min(1);
const OrganizationIdSchema = z.string().min(1).max(64);
const ClientIdSchema = AssetRefSchema.shape.companyId;
const ProjectIdSchema = z.string().min(1).max(100);
const BuSlugSchema = z.string().min(1).max(30).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const IsoSchema = z.iso.datetime({ offset: true });
const ShortTextSchema = z.string().min(1).max(500);

/** Errors shared by the composed reads (4-6). */
export const COMPANY_BOARD_READ_ERRORS = ['identity_uncertain', 'not_owner', 'not_director', 'source_unavailable'] as const;
export const CompanyBoardReadErrorSchema = z.enum(COMPANY_BOARD_READ_ERRORS);
export type CompanyBoardReadError = z.infer<typeof CompanyBoardReadErrorSchema>;

// 1. Memory sources: plan, decisions, materials.
export const InternalMemoryCompanyBoardSourcesQuerySchema = z.strictObject({
  tenantId: TenantIdSchema,
  organizationId: OrganizationIdSchema,
  clientId: ClientIdSchema,
  projectId: ProjectIdSchema,
});
export type InternalMemoryCompanyBoardSourcesQuery = z.infer<typeof InternalMemoryCompanyBoardSourcesQuerySchema>;

export const InternalMemoryCompanyBoardSourcesResponseSchema = z.strictObject({
  plan: ActionPlanSchema.nullable(),
  /** Units of the previous plan version, for «Piano v3 approvato il …: tolti …». */
  previousPlanUnits: z.array(BuSlugSchema).max(40).nullable(),
  decisions: z.array(z.strictObject({
    request: DecisionRequestSchema,
    outcome: DecisionOutcomeSchema.nullable(),
    mailSubject: z.string().min(1).max(998).nullable(),
  })).max(100),
  assets: z.array(z.strictObject({
    assetId: AssetRefSchema.shape.assetId,
    buSlug: BuSlugSchema.nullable(),
    kind: z.string().min(1).max(40),
    title: z.string().min(1).max(255),
    createdAt: IsoSchema,
  })).max(200),
});
export type InternalMemoryCompanyBoardSourcesResponse = z.infer<typeof InternalMemoryCompanyBoardSourcesResponseSchema>;

export const internalMemoryCompanyBoardSourcesContract = {
  method: 'GET' as const,
  path: INTERNAL_MEMORY_COMPANY_BOARD_SOURCES_PATH,
  authType: 'secret' as const,
  querySchema: InternalMemoryCompanyBoardSourcesQuerySchema,
  responseSchema: InternalMemoryCompanyBoardSourcesResponseSchema,
} as const;

// 2. Paperclip: native names (rev. 467125fa, constants.ts:16-24, 189-197, 204, 919).
export const PAPERCLIP_BOARD_AGENT_STATUSES = [
  'active', 'paused', 'idle', 'running', 'error', 'pending_approval', 'terminated',
] as const;
export const PaperclipBoardAgentStatusSchema = z.enum(PAPERCLIP_BOARD_AGENT_STATUSES);

export const PAPERCLIP_BOARD_ISSUE_STATUSES = [
  'backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled',
] as const;
export const PaperclipBoardIssueStatusSchema = z.enum(PAPERCLIP_BOARD_ISSUE_STATUSES);

export const PAPERCLIP_BOARD_PAUSE_REASONS = ['manual', 'budget', 'system'] as const;
export const PaperclipBoardPauseReasonSchema = z.enum(PAPERCLIP_BOARD_PAUSE_REASONS);

export const PAPERCLIP_BOARD_RUN_STATUSES = [
  'queued', 'running', 'succeeded', 'failed', 'error', 'timed_out', 'cancelled',
] as const;
export const PaperclipBoardRunStatusSchema = z.enum(PAPERCLIP_BOARD_RUN_STATUSES);

export const PAPERCLIP_BOARD_OWNER_PERSON = ['collegata', 'mancante', 'non_nota'] as const;
export const PaperclipBoardOwnerPersonSchema = z.enum(PAPERCLIP_BOARD_OWNER_PERSON);

export const InternalPaperclipCompanyBoardQuerySchema = z.strictObject({
  organizationId: OrganizationIdSchema,
  projectId: ProjectIdSchema.optional(),
  /** `true` on the project page: adds `blockedSince` and `replies`. */
  detail: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
  /** With it cap-paperclip checks the owner's person in Paperclip and fills `pausedByOwner`. */
  ownerId: OwnerIdSchema.optional(),
});
export type InternalPaperclipCompanyBoardQuery = z.infer<typeof InternalPaperclipCompanyBoardQuerySchema>;

export const InternalPaperclipCompanyBoardResponseSchema = z.strictObject({
  agents: z.array(z.strictObject({
    paperclipAgentId: z.uuid(),
    buSlug: BuSlugSchema.nullable(),
    role: z.string().min(1).max(100),
    status: PaperclipBoardAgentStatusSchema,
    pauseReason: PaperclipBoardPauseReasonSchema.nullable(),
    pausedAt: IsoSchema.nullable(),
    pausedByOwner: z.boolean().nullable(),
    projectCount: z.number().int().min(0),
    recentRuns: z.array(z.strictObject({
      status: PaperclipBoardRunStatusSchema,
      errorCode: z.string().min(1).max(100).nullable(),
      at: IsoSchema,
    })).max(20),
  })).max(200),
  issues: z.array(z.strictObject({
    issueId: z.string().min(1).max(64),
    identifier: z.string().min(1).max(64),
    title: z.string().min(1).max(300),
    status: PaperclipBoardIssueStatusSchema,
    parentId: z.string().min(1).max(64).nullable(),
    /** Project of the issue, same id as `projects[].projectId`; null when the issue has none. */
    projectId: ProjectIdSchema.nullable().optional(),
    assigneeAgentId: z.uuid().nullable(),
    blockedBy: z.array(z.string().min(1).max(64)).max(50),
    approvalMark: z.string().min(1).max(64).nullable(),
    updatedAt: IsoSchema,
    startedAt: IsoSchema.nullable(),
    completedAt: IsoSchema.nullable(),
    /** Only with `detail=true`. */
    blockedSince: IsoSchema.nullable().optional(),
    /** Only with `detail=true`. */
    replies: z.array(z.strictObject({ at: IsoSchema })).max(50).optional(),
    lastComment: z.strictObject({
      at: IsoSchema,
      excerpt: z.string().max(500),
      byAgent: z.boolean(),
    }).nullable(),
    /** Only with `detail=true`: the last comments of the issue, newest first, the person's and the agents' (`lastComment` is the first of them). */
    recentComments: z.array(z.strictObject({
      at: IsoSchema,
      excerpt: z.string().max(500),
      byAgent: z.boolean(),
    })).max(5).optional(),
  })).max(1000),
  /** X9 projects that have a project in Paperclip (for projects without a plan). */
  projects: z.array(z.strictObject({ projectId: ProjectIdSchema })).max(100),
  truncated: z.boolean(),
  ownerPerson: PaperclipBoardOwnerPersonSchema,
});
export type InternalPaperclipCompanyBoardResponse = z.infer<typeof InternalPaperclipCompanyBoardResponseSchema>;

export const internalPaperclipCompanyBoardContract = {
  method: 'GET' as const,
  path: INTERNAL_PAPERCLIP_COMPANY_BOARD_PATH,
  authType: 'secret' as const,
  querySchema: InternalPaperclipCompanyBoardQuerySchema,
  responseSchema: InternalPaperclipCompanyBoardResponseSchema,
} as const;

// 2b. Memory: projects of the organization, from the latest saved plan version.
export const InternalMemoryCompanyBoardProjectsQuerySchema = z.strictObject({
  tenantId: TenantIdSchema,
  organizationId: OrganizationIdSchema,
});
export type InternalMemoryCompanyBoardProjectsQuery = z.infer<typeof InternalMemoryCompanyBoardProjectsQuerySchema>;

export const InternalMemoryCompanyBoardProjectsResponseSchema = z.strictObject({
  projects: z.array(z.strictObject({
    projectId: ProjectIdSchema,
    clientId: ClientIdSchema,
    companyName: z.string().min(1).max(200).nullable(),
    projectName: z.string().min(1).max(200).nullable(),
    planVersion: z.number().int().min(1),
    updatedAt: IsoSchema,
  })).max(100),
});
export type InternalMemoryCompanyBoardProjectsResponse = z.infer<typeof InternalMemoryCompanyBoardProjectsResponseSchema>;

export const internalMemoryCompanyBoardProjectsContract = {
  method: 'GET' as const,
  path: INTERNAL_MEMORY_COMPANY_BOARD_PROJECTS_PATH,
  authType: 'secret' as const,
  querySchema: InternalMemoryCompanyBoardProjectsQuerySchema,
  responseSchema: InternalMemoryCompanyBoardProjectsResponseSchema,
} as const;

// 3. cap-dev sessions per project. Never assignment text, files, links or sha.
/** States of cap-dev `board/stato.ts:4`. */
export const DEV_PROJECT_SESSION_STATES = [
  'richiesta', 'analisi', 'report-pronto', 'approvato', 'in-lavorazione', 'revisione', 'chiuso', 'scartato', 'bloccato',
] as const;
export const DevProjectSessionStateSchema = z.enum(DEV_PROJECT_SESSION_STATES);

export const InternalDevProjectSessionsQuerySchema = z.strictObject({
  tenantId: TenantIdSchema,
  organizationId: OrganizationIdSchema,
  projectId: ProjectIdSchema,
});
export type InternalDevProjectSessionsQuery = z.infer<typeof InternalDevProjectSessionsQuerySchema>;

export const InternalDevProjectSessionsResponseSchema = z.strictObject({
  units: z.array(z.strictObject({
    buSlug: BuSlugSchema,
    sessions: z.array(z.strictObject({
      id: z.string().min(1).max(100),
      state: DevProjectSessionStateSchema,
      openedAt: IsoSchema,
      updatedAt: IsoSchema,
      closedAt: IsoSchema.nullable(),
      computerName: z.string().min(1).max(100).nullable(),
      title: ShortTextSchema.nullable(),
      scaletta: z.array(z.strictObject({ text: ShortTextSchema, done: z.boolean() })).max(50).optional(),
    })).max(200),
  })).max(40),
  unreadable: z.number().int().min(0),
});
export type InternalDevProjectSessionsResponse = z.infer<typeof InternalDevProjectSessionsResponseSchema>;

export const internalDevProjectSessionsContract = {
  method: 'GET' as const,
  path: INTERNAL_DEV_PROJECT_SESSIONS_PATH,
  authType: 'secret' as const,
  querySchema: InternalDevProjectSessionsQuerySchema,
  responseSchema: InternalDevProjectSessionsResponseSchema,
} as const;

// 4-6. Composed board, served by agent-core to Forge.
export const InternalCompanyBoardCompaniesQuerySchema = z.strictObject({
  tenantId: TenantIdSchema,
  ownerIds: z.string().transform((value) => value.split(',')).pipe(z.array(OwnerIdSchema).min(1).max(50)),
});
export type InternalCompanyBoardCompaniesQuery = z.infer<typeof InternalCompanyBoardCompaniesQuerySchema>;

export const internalCompanyBoardCompaniesContract = {
  method: 'GET' as const,
  path: INTERNAL_COMPANY_BOARD_COMPANIES_PATH,
  authType: 'secret' as const,
  querySchema: InternalCompanyBoardCompaniesQuerySchema,
  responseSchema: CompanyListSchema,
} as const;

export const InternalCompanyBoardOverviewQuerySchema = z.strictObject({
  tenantId: TenantIdSchema,
  ownerId: OwnerIdSchema,
  directorAgentId: AgentIdSchema,
});
export type InternalCompanyBoardOverviewQuery = z.infer<typeof InternalCompanyBoardOverviewQuerySchema>;

export const internalCompanyBoardOverviewContract = {
  method: 'GET' as const,
  path: INTERNAL_COMPANY_BOARD_OVERVIEW_PATH,
  authType: 'secret' as const,
  querySchema: InternalCompanyBoardOverviewQuerySchema,
  responseSchema: CompanyOverviewSchema,
} as const;

export const InternalCompanyBoardProjectQuerySchema = InternalCompanyBoardOverviewQuerySchema.extend({
  projectId: ProjectIdSchema,
});
export type InternalCompanyBoardProjectQuery = z.infer<typeof InternalCompanyBoardProjectQuerySchema>;

export const internalCompanyBoardProjectContract = {
  method: 'GET' as const,
  path: INTERNAL_COMPANY_BOARD_PROJECT_PATH,
  authType: 'secret' as const,
  querySchema: InternalCompanyBoardProjectQuerySchema,
  responseSchema: CompanyBoardSchema,
} as const;
