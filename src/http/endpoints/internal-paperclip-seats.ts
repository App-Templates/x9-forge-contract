import { z } from 'zod';
import { ToolCallRequestSchema } from '../../capability/tool-call.js';
import { InboundEventDispositionSchema } from '../../capability/paperclip/inbound-event.js';
import { ParticipantAgentIdentitySchema } from '../../organization/participant-binding.js';
import { ReconciledMandateSchema } from '../../organization/business-unit-mandate.js';
import { RunIdSchema } from '../../organization/run-context.js';
import { SessionIdSchema } from '../../organization/asset-version.js';
import { devSessionContractDocumentKey } from '../../capability/dev/session-acceptance-paperclip.js';
import {
  PaperclipDocumentoChiaveSchema,
  PaperclipDocumentoScriviCorpoSchema,
} from '../../capability/paperclip-protocollo/wire-documenti.js';
import { CapabilityAgentScopeSchema } from '../../capability/capability-call-identity.js';
import { AgentRequestSchema } from '../../organization/agent-request.js';
import { AssetRefSchema, AssetSha256Schema } from '../../organization/asset.js';
import { DecisionOutcomeSchema, DecisionRequestIdSchema, DecisionRequestSchema } from '../../organization/decision-request.js';
import { ResearchIdSchema, ResearchStateSchema } from '../../capability/ricerca/research.js';
import {
  DevSessionAssignmentSchema,
  DevSessionCommitSchema,
  DevSessionResultSchema,
  parseDevSessionBlock,
} from '../../capability/dev/session-assignment.js';
import {
  PaperclipActivityInputSchema,
  PaperclipActivityOutputSchema,
  PaperclipIssueStatusSchema,
  PaperclipSearchInputSchema,
  PaperclipSearchKindSchema,
  PaperclipSearchOutputSchema,
} from '../../capability/paperclip/tools.js';

export const INTERNAL_PAPERCLIP_SEATS_PATH = '/internal/paperclip/seats' as const;

export const InternalPaperclipSeatsQuerySchema = z.strictObject({
  organizationId: z.string().min(1).max(64),
});

/** Read-only seat status. Credential values must never cross this boundary. */
export const InternalPaperclipSeatSchema = z.strictObject({
  identity: ParticipantAgentIdentitySchema,
  paperclipAgentId: z.uuid(),
  companyId: z.uuid(),
  reportsToPaperclipAgentId: z.uuid(),
  enrollment: z.strictObject({
    state: z.enum(['key_pending', 'enrolled']),
    attempts: z.int().min(0),
    lastReason: z.string().min(1).max(64).optional(),
    updatedAt: z.iso.datetime(),
  }),
});

export const InternalPaperclipSeatsResponseSchema = z.strictObject({
  seats: z.array(InternalPaperclipSeatSchema).max(200),
});

export const internalPaperclipSeatsReadContract = {
  method: 'GET' as const,
  path: INTERNAL_PAPERCLIP_SEATS_PATH,
  authType: 'secret' as const,
  querySchema: InternalPaperclipSeatsQuerySchema,
  responseSchema: InternalPaperclipSeatsResponseSchema,
} as const;

export const INTERNAL_PAPERCLIP_SEAT_ISSUES_PATH = '/internal/paperclip/seats/:paperclipAgentId/issues' as const;

export const InternalPaperclipSeatIssuesParamsSchema = z.strictObject({
  paperclipAgentId: z.uuid(),
});

export const InternalPaperclipSeatIssueSchema = z.strictObject({
  issueId: z.string().min(1).max(64),
  title: z.string().min(1).max(300),
  status: z.string().min(1).max(32),
  projectId: z.uuid().nullable(),
  goalId: z.uuid().nullable(),
  assigneeComments: z.int().min(0),
});

export const InternalPaperclipSeatIssuesResponseSchema = z.strictObject({
  paperclipAgentId: z.uuid(),
  issues: z.array(InternalPaperclipSeatIssueSchema).max(100),
});

export const internalPaperclipSeatIssuesReadContract = {
  method: 'GET' as const,
  path: INTERNAL_PAPERCLIP_SEAT_ISSUES_PATH,
  authType: 'secret' as const,
  paramsSchema: InternalPaperclipSeatIssuesParamsSchema,
  responseSchema: InternalPaperclipSeatIssuesResponseSchema,
} as const;

export const INTERNAL_PAPERCLIP_SEAT_SEARCH_PATH = '/internal/paperclip/seats/:paperclipAgentId/search' as const;

const SEARCH_KIND_ALTERNATION = PaperclipSearchKindSchema.options.join('|');
const SEARCH_KINDS_PATTERN = new RegExp(`^(?:${SEARCH_KIND_ALTERNATION})(?:,(?:${SEARCH_KIND_ALTERNATION}))*$`);

export const InternalPaperclipSeatSearchQuerySchema = z.strictObject({
  q: PaperclipSearchInputSchema.shape.query,
  kinds: z.string().regex(SEARCH_KINDS_PATTERN)
    .refine(value => new Set(value.split(',')).size === value.split(',').length, 'Search kinds must be unique')
    .optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const InternalPaperclipSeatSearchResponseSchema = z.strictObject({
  paperclipAgentId: z.uuid(),
  ...PaperclipSearchOutputSchema.shape,
});

export const internalPaperclipSeatSearchReadContract = {
  method: 'GET' as const,
  path: INTERNAL_PAPERCLIP_SEAT_SEARCH_PATH,
  authType: 'secret' as const,
  paramsSchema: InternalPaperclipSeatIssuesParamsSchema,
  querySchema: InternalPaperclipSeatSearchQuerySchema,
  responseSchema: InternalPaperclipSeatSearchResponseSchema,
} as const;

export type InternalPaperclipSeatSearchQuery = z.infer<typeof InternalPaperclipSeatSearchQuerySchema>;
export type InternalPaperclipSeatSearchResponse = z.infer<typeof InternalPaperclipSeatSearchResponseSchema>;

export const INTERNAL_PAPERCLIP_SEAT_ACTIVITY_PATH = '/internal/paperclip/seats/:paperclipAgentId/activity' as const;

export const InternalPaperclipSeatActivityQuerySchema = z.strictObject({
  since: PaperclipActivityInputSchema.shape.since,
  issueId: PaperclipActivityInputSchema.shape.issueId,
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const InternalPaperclipSeatActivityResponseSchema = z.strictObject({
  paperclipAgentId: z.uuid(),
  ...PaperclipActivityOutputSchema.shape,
});

export const internalPaperclipSeatActivityReadContract = {
  method: 'GET' as const,
  path: INTERNAL_PAPERCLIP_SEAT_ACTIVITY_PATH,
  authType: 'secret' as const,
  paramsSchema: InternalPaperclipSeatIssuesParamsSchema,
  querySchema: InternalPaperclipSeatActivityQuerySchema,
  responseSchema: InternalPaperclipSeatActivityResponseSchema,
} as const;

export type InternalPaperclipSeatActivityQuery = z.infer<typeof InternalPaperclipSeatActivityQuerySchema>;
export type InternalPaperclipSeatActivityResponse = z.infer<typeof InternalPaperclipSeatActivityResponseSchema>;

export const INTERNAL_PAPERCLIP_SEAT_REPLY_WAKE_PATH = '/internal/paperclip/seats/reply-wake' as const;

// Una risposta email esterna è arrivata a un agente dell'organizzazione: cap-paperclip lo sveglia sul Mandato
// che ha messo `blocked` con la propria attesa, e su nient'altro. `messageId` è la chiave di idempotenza.
export const InternalPaperclipSeatReplyWakeRequestSchema = z.strictObject({
  organizationId: InternalPaperclipSeatsQuerySchema.shape.organizationId,
  identity: ParticipantAgentIdentitySchema,
  messageId: z.string().min(1).max(998).refine(v => v.trim().length > 0, 'Non-blank message id required'),
  // The Paperclip run in which the agent sent the email this one answers; cap-paperclip reads the incarico from that run, never from the text.
  sourceRunId: RunIdSchema.optional(),
});

export const PAPERCLIP_SOURCE_RUN_REFUSALS = [
  'source_run_unknown', // The run does not exist for this agent.
  'source_run_without_issue', // The run has no incarico.
  'source_issue_not_agents', // The incarico does not belong to this agent.
  'source_issue_closed', // The incarico is closed.
] as const;

export const PAPERCLIP_SEAT_REPLY_WAKE_RESULTS = [
  'woken', 'skipped', 'duplicate', 'not_waiting', 'no_mandate', 'ambiguous', ...PAPERCLIP_SOURCE_RUN_REFUSALS,
] as const;
export const PaperclipSeatReplyWakeResultSchema = z.enum(PAPERCLIP_SEAT_REPLY_WAKE_RESULTS);

/**
 * How a `woken` answer reached the agent when no run id is known: `monitor_check` = cap-paperclip asked Paperclip to run the
 * issue's scheduled monitor now (POST /api/issues/:id/monitor/check-now) and Paperclip wakes the assignee with `issue_monitor_due`.
 */
export const PAPERCLIP_SEAT_REPLY_WAKE_VIA = ['monitor_check'] as const;
export const PaperclipSeatReplyWakeViaSchema = z.enum(PAPERCLIP_SEAT_REPLY_WAKE_VIA);
export type PaperclipSeatReplyWakeVia = z.infer<typeof PaperclipSeatReplyWakeViaSchema>;

export const InternalPaperclipSeatReplyWakeResponseSchema = z.strictObject({
  result: PaperclipSeatReplyWakeResultSchema,
  issueId: z.uuid().optional(),
  runId: z.uuid().optional(),
  disposition: InboundEventDispositionSchema.optional(),
  via: PaperclipSeatReplyWakeViaSchema.optional(),
}).superRefine((value, ctx) => {
  if (value.result === 'woken' && (value.issueId === undefined || (value.runId === undefined && value.via === undefined))) {
    ctx.addIssue({ code: 'custom', message: 'woken requires issueId and runId', path: ['runId'] });
  }
  if (value.via !== undefined && (value.result !== 'woken' || value.runId !== undefined || value.disposition !== undefined)) {
    ctx.addIssue({ code: 'custom', message: 'via monitor_check is only a woken answer without runId and disposition', path: ['via'] });
  }
  if (value.result !== 'woken' && value.runId !== undefined) {
    ctx.addIssue({ code: 'custom', message: 'runId is only allowed with woken', path: ['runId'] });
  }
  if ((value.result === 'skipped' || value.result === 'not_waiting' || value.result === 'source_issue_closed') && value.issueId === undefined) {
    ctx.addIssue({ code: 'custom', message: `${value.result} requires issueId`, path: ['issueId'] });
  }
  if (
    (value.result === 'no_mandate' || value.result === 'ambiguous' || value.result === 'source_run_unknown'
      || value.result === 'source_run_without_issue' || value.result === 'source_issue_not_agents')
    && value.issueId !== undefined
  ) {
    ctx.addIssue({ code: 'custom', message: `${value.result} must not carry issueId`, path: ['issueId'] });
  }
  const disposition = value.disposition;
  if (disposition?.outcome === 'commented' && disposition.woke) {
    if (value.result !== 'woken') {
      ctx.addIssue({ code: 'custom', message: 'A woken disposition requires result woken', path: ['result'] });
    }
    if (value.issueId !== disposition.issueId) {
      ctx.addIssue({ code: 'custom', message: 'Disposition issueId must match the response', path: ['disposition', 'issueId'] });
    }
    if (value.runId !== undefined && disposition.runId !== undefined && value.runId !== disposition.runId) {
      ctx.addIssue({ code: 'custom', message: 'Disposition runId must match the response', path: ['disposition', 'runId'] });
    }
  }
  if (disposition?.outcome === 'duplicate' && value.result !== 'duplicate') {
    ctx.addIssue({ code: 'custom', message: 'A duplicate disposition requires result duplicate', path: ['result'] });
  }
});

/**
 * Error codes of a failed seat wake. They name whose fault the failure is.
 * - `paperclip_unavailable`: Paperclip answered with an error or could not be reached.
 * - `wake_timeout`: OUR time limit ran out while Paperclip was answering; Paperclip is not in error.
 */
export const PAPERCLIP_SEAT_WAKE_ERROR_CODES = ['paperclip_unavailable', 'wake_timeout'] as const;
export const PaperclipSeatWakeErrorCodeSchema = z.enum(PAPERCLIP_SEAT_WAKE_ERROR_CODES);
export type PaperclipSeatWakeErrorCode = z.infer<typeof PaperclipSeatWakeErrorCodeSchema>;

export const InternalPaperclipSeatWakeErrorResponseSchema = z.strictObject({
  ok: z.literal(false),
  error: PaperclipSeatWakeErrorCodeSchema,
});
export type InternalPaperclipSeatWakeErrorResponse = z.infer<typeof InternalPaperclipSeatWakeErrorResponseSchema>;

export const internalPaperclipSeatReplyWakeContract = {
  method: 'POST' as const,
  path: INTERNAL_PAPERCLIP_SEAT_REPLY_WAKE_PATH,
  authType: 'secret' as const,
  bodySchema: InternalPaperclipSeatReplyWakeRequestSchema,
  responseSchema: InternalPaperclipSeatReplyWakeResponseSchema,
  errorResponseSchema: InternalPaperclipSeatWakeErrorResponseSchema,
} as const;

export type InternalPaperclipSeatReplyWakeRequest = z.infer<typeof InternalPaperclipSeatReplyWakeRequestSchema>;
export type InternalPaperclipSeatReplyWakeResponse = z.infer<typeof InternalPaperclipSeatReplyWakeResponseSchema>;
export type PaperclipSeatReplyWakeResult = z.infer<typeof PaperclipSeatReplyWakeResultSchema>;

export const INTERNAL_PAPERCLIP_SEAT_NATIVE_WAKE_PATH = '/internal/paperclip/seats/native-wake' as const;

export const PAPERCLIP_SEAT_NATIVE_WAKE_EMAIL_MODES = ['request', 'reply', 'decision'] as const;

export const PaperclipSeatResearchDoneDossierEntrySchema = z.strictObject({
  researchId: ResearchIdSchema,
  state: ResearchStateSchema,
});
export type PaperclipSeatResearchDoneDossierEntry = z.infer<typeof PaperclipSeatResearchDoneDossierEntrySchema>;

export const PAPERCLIP_APPROVED_UNITS_RETRY_HARD_CAP = 15;

const PaperclipApprovedUnitsRetryCountSchema = z.int().min(1).max(PAPERCLIP_APPROVED_UNITS_RETRY_HARD_CAP).describe('approved_units_failed retry count');

export const PaperclipSeatNativeWakeEventSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('email'),
    messageId: InternalPaperclipSeatReplyWakeRequestSchema.shape.messageId,
    threadKey: InternalPaperclipSeatReplyWakeRequestSchema.shape.messageId,
    mode: z.enum(PAPERCLIP_SEAT_NATIVE_WAKE_EMAIL_MODES),
    // Memory A project of the decision request this email answers, when cap-email knows it; never guessed.
    projectRef: DecisionRequestSchema.shape.projectId,
    // The Paperclip run in which the agent sent the email this one answers; cap-paperclip reads the incarico from that run, never from the text.
    sourceRunId: RunIdSchema.optional(),
    from: z.string().min(1).max(320),
    subject: z.string().min(1).max(300),
    receivedAt: z.iso.datetime(),
    excerpt: z.string().max(8000),
    attachments: z.array(z.strictObject({
      name: z.string().min(1).max(255),
      contentType: z.string().min(1).max(255),
      size: z.int().min(0),
    })).max(20),
    decision: z.strictObject({
      requestId: DecisionRequestIdSchema,
      outcome: z.union(DecisionOutcomeSchema.options.map(o => o.shape.outcome) as [
        (typeof DecisionOutcomeSchema.options)[0]['shape']['outcome'],
        (typeof DecisionOutcomeSchema.options)[1]['shape']['outcome'],
      ]),
    }).optional(),
  }),
  z.strictObject({
    kind: z.literal('research_done'),
    researchId: ResearchIdSchema,
    state: ResearchStateSchema,
    question: z.string().min(1).max(1000),
    // Tutte le ricerche del dossier chiuse da questa sveglia, l'evento compreso; senza dossier: la sola ricerca dell'evento.
    dossier: z.array(PaperclipSeatResearchDoneDossierEntrySchema).min(1).max(20).optional(),
  }),
  z.strictObject({
    kind: z.literal('dev_delivered'),
    sessionIssue: DevSessionResultSchema.shape.issue,
    commit: DevSessionCommitSchema,
    projectId: DevSessionAssignmentSchema.shape.projectId,
    // The Paperclip run in which the chief opened the session; cap-paperclip reads the issue from that run, never from the text.
    sourceRunId: RunIdSchema.optional(),
  }),
  // A session asks its chief for material (R73): the chief is woken on the session issue it opened. `requestKey` is the
  // sha256 of the request comment (id and text), one request = one key; the text never travels, the chief rereads `dev_session_status`.
  z.strictObject({
    kind: z.literal('dev_material_needed'),
    sessionIssue: DevSessionResultSchema.shape.issue,
    projectId: DevSessionAssignmentSchema.shape.projectId,
    requestKey: z.string().regex(/^[0-9a-f]{64}$/),
    // The Paperclip run in which the chief opened the session, as for `dev_delivered`; the issue is read from that run, never from the text.
    sourceRunId: RunIdSchema.optional(),
  }),
  z.strictObject({
    kind: z.literal('work_stalled'),
    issueId: z.uuid(),
    identifier: z.string().min(1).max(40),
    title: z.string().min(1).max(300),
    unitId: z.string().min(1).max(200),
    status: PaperclipIssueStatusSchema,
    stalledSince: z.iso.datetime({ offset: true }),
    reason: z.enum(['no_activity', 'waiting_too_long', 'queue_not_continued']),
  }),
  z.strictObject({
    kind: z.literal('approved_units_failed'),
    requestId: DecisionRequestIdSchema,
    directorIssueId: z.uuid(),
    units: z.array(z.strictObject({
      unitId: z.string().min(1).max(200),
      reason: z.string().min(1).max(200),
    })).min(1).max(20),
    attempt: PaperclipApprovedUnitsRetryCountSchema,
    maxAttempts: PaperclipApprovedUnitsRetryCountSchema,
  }).refine(e => e.attempt <= e.maxAttempts, { path: ['attempt'], message: 'attempt must not exceed maxAttempts' }),
  z.strictObject({ kind: z.literal('agent_request'), request: AgentRequestSchema }),
  // The final project delivery was sent and recorded (`ProjectDeliveryRecord` stage `sent`, kind `final`); `digest` is the
  // reconciliation digest and makes the event idempotent; sent by cap-email, never by the model.
  z.strictObject({
    kind: z.literal('project_delivered'),
    projectId: AssetRefSchema.shape.projectId,
    messageId: z.string().min(1).max(512),
    sentAt: z.iso.datetime({ offset: true }),
    digest: AssetSha256Schema,
  }),
  // The company spend cap no longer holds this agent back; sent by agent-core, once per agent, never by the model.
  z.strictObject({
    kind: z.literal('limit_lifted'),
    limit: z.literal('company_spend'),
    revision: z.int().min(1),
    liftedAt: z.iso.datetime({ offset: true }),
  }),
]);

// Un evento del prodotto (email ammessa, ricerca finita, consegna verificata) apre o risveglia l'incarico Paperclip
// dell'agente, come il canale email di Paperclip: incarico assegnato a sé (sveglia d'assegnazione) oppure commento
// più `wakeup` `automation`/`callback`. `eventId` è la chiave di idempotenza.
export const InternalPaperclipSeatNativeWakeRequestSchema = z.strictObject({
  scope: CapabilityAgentScopeSchema,
  eventId: z.string().min(1).max(200).refine(v => v.trim().length > 0, 'Non-blank event id required'),
  organizationId: InternalPaperclipSeatsQuerySchema.shape.organizationId.optional(),
  identity: ParticipantAgentIdentitySchema.optional(),
  event: PaperclipSeatNativeWakeEventSchema,
}).superRefine((value, ctx) => {
  if (value.event.kind !== 'research_done') {
    if (value.organizationId === undefined) {
      ctx.addIssue({ code: 'custom', message: `${value.event.kind} requires organizationId`, path: ['organizationId'] });
    }
    if (value.identity === undefined) {
      ctx.addIssue({ code: 'custom', message: `${value.event.kind} requires identity`, path: ['identity'] });
    }
  }
  if (value.identity !== undefined && value.identity.runtimeAgentId !== value.scope.agentId) {
    ctx.addIssue({ code: 'custom', message: 'identity.runtimeAgentId must equal scope.agentId', path: ['identity', 'runtimeAgentId'] });
  }
  if (value.event.kind === 'research_done' && value.event.dossier !== undefined) {
    const { researchId, state, dossier } = value.event;
    const own = dossier.find(d => d.researchId === researchId);
    if (own === undefined || own.state !== state) {
      ctx.addIssue({ code: 'custom', message: 'dossier must include the event research with the same state', path: ['event', 'dossier'] });
    }
    if (new Set(dossier.map(d => d.researchId)).size !== dossier.length) {
      ctx.addIssue({ code: 'custom', message: 'dossier must not repeat a researchId', path: ['event', 'dossier'] });
    }
  }
  if (value.event.kind === 'email') {
    if (value.event.mode === 'request' && value.event.sourceRunId !== undefined) {
      ctx.addIssue({ code: 'custom', message: 'sourceRunId needs a reply or a decision', path: ['event', 'sourceRunId'] });
    }
    const isDecision = value.event.mode === 'decision';
    if (isDecision && value.event.decision === undefined) {
      ctx.addIssue({ code: 'custom', message: 'decision mode requires decision', path: ['event', 'decision'] });
    }
    if (!isDecision && value.event.decision !== undefined) {
      ctx.addIssue({ code: 'custom', message: 'decision is only allowed with decision mode', path: ['event', 'decision'] });
    }
  }
});

// For `limit_lifted`, `deferred` (with the issueId) means "check requested from Paperclip" and `no_task` means "no issue waiting on the cap".
// For `dev_material_needed`, `deferred` (with the issueId) means "check requested from Paperclip", `not_waiting` means the check cannot
// run now, and `no_task` means "no issue waiting on the session".

/** Name of the monitor the chief leaves while it waits on a session; sibling of `LIMIT_WAIT_SERVICE_NAME`. */
export const DEV_SESSION_WAIT_SERVICE_NAME = 'dev-session';

/** Read the stored monitor tolerantly: Paperclip adds fields and nullable values to its policy. */
export function waitsOnDevSession(policy: unknown): boolean {
  return typeof policy === 'object' && policy !== null && 'monitor' in policy
    && typeof policy.monitor === 'object' && policy.monitor !== null && 'serviceName' in policy.monitor
    && policy.monitor.serviceName === DEV_SESSION_WAIT_SERVICE_NAME;
}

export const PAPERCLIP_SEAT_NATIVE_WAKE_RESULTS = [
  'opened', 'woken', 'deferred', 'duplicate', 'already_open', 'not_waiting', 'no_task', 'ambiguous', 'not_enabled', 'rate_limited',
  // The event belongs to an existing open incarico of the seat that waits on open blockers held by other agents;
  // Paperclip resumes it when they are done (`issue_blockers_resolved`), nothing was written and no run was started.
  'waiting_on_blockers',
  ...PAPERCLIP_SOURCE_RUN_REFUSALS,
] as const;
export const PaperclipSeatNativeWakeResultSchema = z.enum(PAPERCLIP_SEAT_NATIVE_WAKE_RESULTS);

export const InternalPaperclipSeatNativeWakeResponseSchema = z.strictObject({
  result: PaperclipSeatNativeWakeResultSchema,
  issueId: z.uuid().optional(),
  commentId: z.uuid().optional(),
  runId: z.uuid().optional(),
  disposition: InboundEventDispositionSchema.optional(),
}).superRefine((value, ctx) => {
  if (value.result === 'woken' && (value.issueId === undefined || value.runId === undefined)) {
    ctx.addIssue({ code: 'custom', message: 'woken requires issueId and runId', path: ['runId'] });
  }
  if (value.result !== 'woken' && value.runId !== undefined) {
    ctx.addIssue({ code: 'custom', message: 'runId is only allowed with woken', path: ['runId'] });
  }
  if (value.result !== 'woken' && value.commentId !== undefined) {
    ctx.addIssue({ code: 'custom', message: 'commentId is only allowed with woken', path: ['commentId'] });
  }
  if (
    (value.result === 'opened' || value.result === 'deferred' || value.result === 'already_open' || value.result === 'not_waiting'
      || value.result === 'waiting_on_blockers' || value.result === 'source_issue_closed')
    && value.issueId === undefined
  ) {
    ctx.addIssue({ code: 'custom', message: `${value.result} requires issueId`, path: ['issueId'] });
  }
  if (
    (value.result === 'no_task' || value.result === 'ambiguous' || value.result === 'not_enabled' || value.result === 'rate_limited'
      || value.result === 'source_run_unknown' || value.result === 'source_run_without_issue' || value.result === 'source_issue_not_agents')
    && value.issueId !== undefined
  ) {
    ctx.addIssue({ code: 'custom', message: `${value.result} must not carry issueId`, path: ['issueId'] });
  }
  const disposition = value.disposition;
  if (disposition?.outcome === 'commented' && disposition.woke) {
    if (value.result !== 'woken') {
      ctx.addIssue({ code: 'custom', message: 'A woken disposition requires result woken', path: ['result'] });
    }
    if (value.issueId !== disposition.issueId) {
      ctx.addIssue({ code: 'custom', message: 'Disposition issueId must match the response', path: ['disposition', 'issueId'] });
    }
    if (value.runId !== undefined && disposition.runId !== undefined && value.runId !== disposition.runId) {
      ctx.addIssue({ code: 'custom', message: 'Disposition runId must match the response', path: ['disposition', 'runId'] });
    }
  }
  if (disposition?.outcome === 'duplicate' && value.result !== 'duplicate') {
    ctx.addIssue({ code: 'custom', message: 'A duplicate disposition requires result duplicate', path: ['result'] });
  }
});

export const internalPaperclipSeatNativeWakeContract = {
  method: 'POST' as const,
  path: INTERNAL_PAPERCLIP_SEAT_NATIVE_WAKE_PATH,
  authType: 'secret' as const,
  bodySchema: InternalPaperclipSeatNativeWakeRequestSchema,
  responseSchema: InternalPaperclipSeatNativeWakeResponseSchema,
  errorResponseSchema: InternalPaperclipSeatWakeErrorResponseSchema,
} as const;

export type InternalPaperclipSeatNativeWakeRequest = z.infer<typeof InternalPaperclipSeatNativeWakeRequestSchema>;
export type InternalPaperclipSeatNativeWakeResponse = z.infer<typeof InternalPaperclipSeatNativeWakeResponseSchema>;
export type PaperclipSeatNativeWakeEvent = z.infer<typeof PaperclipSeatNativeWakeEventSchema>;
export type PaperclipSeatNativeWakeResult = z.infer<typeof PaperclipSeatNativeWakeResultSchema>;

export const INTERNAL_PAPERCLIP_SEAT_SESSION_CHILD_PATH = '/internal/paperclip/seats/session-child' as const;
// Paperclip takes up to 10 MB; the session block is larger than the 20000-character bridge creation body.
export const DEV_SESSION_PAPERCLIP_DESCRIPTION_MAX = 100000;

export const InternalPaperclipSeatSessionChildRequestSchema = z.strictObject({
  organizationId: InternalPaperclipSeatsQuerySchema.shape.organizationId,
  // cap-dev supplies the chief's identity from the verified call, never from the model.
  identity: ParticipantAgentIdentitySchema,
  // cap-paperclip reads the parent from the chief's run, never from the description.
  sourceRunId: RunIdSchema,
  sessionKey: z.string().min(1).max(255).regex(/^dev-session:[A-Za-z0-9._:-]+$/),
  title: DevSessionAssignmentSchema.shape.title,
  description: z.string().min(1).max(DEV_SESSION_PAPERCLIP_DESCRIPTION_MAX)
    .refine(description => parseDevSessionBlock(description).ok, 'session_block_invalid'),
});

export const PAPERCLIP_SEAT_SESSION_CHILD_RESULTS = [
  'opened', 'duplicate', 'executor_missing', 'executor_ambiguous', ...PAPERCLIP_SOURCE_RUN_REFUSALS,
] as const;
export const PaperclipSeatSessionChildResultSchema = z.enum(PAPERCLIP_SEAT_SESSION_CHILD_RESULTS);

// duplicate means Paperclip answered 200 with the same child; nothing was created.
export const InternalPaperclipSeatSessionChildResponseSchema = z.strictObject({
  result: PaperclipSeatSessionChildResultSchema,
  issueId: z.uuid().optional(),
  // This route returns a Paperclip child, so the legacy R<n> session form cannot identify it.
  identifier: SessionIdSchema.refine(identifier => identifier.includes('-'),
    'Paperclip identifier required').optional(),
  executorAgentId: z.uuid().optional(),
}).superRefine((value, ctx) => {
  const hasChild = value.result === 'opened' || value.result === 'duplicate';
  for (const field of ['issueId', 'identifier', 'executorAgentId'] as const) {
    if (hasChild && value[field] === undefined) {
      ctx.addIssue({ code: 'custom', message: `${value.result} requires ${field}`, path: [field] });
    }
    if (!hasChild && value[field] !== undefined) {
      ctx.addIssue({ code: 'custom', message: `${value.result} must not carry ${field}`, path: [field] });
    }
  }
});

/**
 * cap-paperclip writes POST /api/companies/:companyId/issues with
 * { title, description, parentId, assigneeAgentId, status: 'todo', idempotencyKey: sessionKey }.
 * Never use /issues/:id/children: that route silently ignores the idempotency key.
 * The key includes the chief's session number and attempt, and is company-wide for seven days.
 */
export const internalPaperclipSeatSessionChildContract = {
  method: 'POST' as const,
  path: INTERNAL_PAPERCLIP_SEAT_SESSION_CHILD_PATH,
  authType: 'secret' as const,
  bodySchema: InternalPaperclipSeatSessionChildRequestSchema,
  responseSchema: InternalPaperclipSeatSessionChildResponseSchema,
  errorResponseSchema: InternalPaperclipSeatWakeErrorResponseSchema,
} as const;

export type InternalPaperclipSeatSessionChildRequest = z.infer<typeof InternalPaperclipSeatSessionChildRequestSchema>;
export type InternalPaperclipSeatSessionChildResponse = z.infer<typeof InternalPaperclipSeatSessionChildResponseSchema>;
export type PaperclipSeatSessionChildResult = z.infer<typeof PaperclipSeatSessionChildResultSchema>;

export const INTERNAL_PAPERCLIP_SEAT_SESSION_CONTRACT_PATH = '/internal/paperclip/seats/session-contract' as const;

export const InternalPaperclipSeatSessionContractRequestSchema = z.strictObject({
  organizationId: InternalPaperclipSeatsQuerySchema.shape.organizationId,
  // The verified chief identity and run let cap-paperclip resolve the issue without trusting a model-supplied issue id.
  identity: ParticipantAgentIdentitySchema,
  sourceRunId: RunIdSchema,
  // Stop before deriving the document key: its shared helper throws for nonpositive numbers.
  issueNumber: z.int().refine(value => value > 0, { message: 'Positive issue number required', abort: true }),
  document: z.strictObject({
    key: PaperclipDocumentoChiaveSchema,
    title: PaperclipDocumentoScriviCorpoSchema.shape.title,
    body: PaperclipDocumentoScriviCorpoSchema.shape.body,
    changeSummary: PaperclipDocumentoScriviCorpoSchema.shape.changeSummary,
  }),
}).superRefine((value, ctx) => { if (value.document.key !== devSessionContractDocumentKey(value.issueNumber)) ctx.addIssue({ code: 'custom', path: ['document', 'key'], message: 'document_key_not_session_contract' }); });

export const PAPERCLIP_SEAT_SESSION_CONTRACT_RESULTS = [
  'written', 'unchanged', 'not_enabled', ...PAPERCLIP_SOURCE_RUN_REFUSALS,
] as const;
export const PaperclipSeatSessionContractResultSchema = z.enum(PAPERCLIP_SEAT_SESSION_CONTRACT_RESULTS);

export const InternalPaperclipSeatSessionContractResponseSchema = z.strictObject({
  result: PaperclipSeatSessionContractResultSchema,
  issueId: z.uuid().optional(),
  revisionNumber: z.int().min(1).optional(),
}).superRefine((value, ctx) => {
  // Both successful results identify the stored revision; refusals must not claim a document was found or written.
  const hasDocument = value.result === 'written' || value.result === 'unchanged';
  for (const field of ['issueId', 'revisionNumber'] as const) {
    if (hasDocument && value[field] === undefined) {
      ctx.addIssue({ code: 'custom', message: `${value.result} requires ${field}`, path: [field] });
    }
    if (!hasDocument && value[field] !== undefined) {
      ctx.addIssue({ code: 'custom', message: `${value.result} must not carry ${field}`, path: [field] });
    }
  }
});

// cap-paperclip reads the latest revision before PUT and uses the chief's source run as the Paperclip write context.
export const internalPaperclipSeatSessionContractContract = {
  method: 'POST' as const,
  path: INTERNAL_PAPERCLIP_SEAT_SESSION_CONTRACT_PATH,
  authType: 'secret' as const,
  bodySchema: InternalPaperclipSeatSessionContractRequestSchema,
  responseSchema: InternalPaperclipSeatSessionContractResponseSchema,
  errorResponseSchema: InternalPaperclipSeatWakeErrorResponseSchema,
} as const;

export type InternalPaperclipSeatSessionContractRequest = z.infer<typeof InternalPaperclipSeatSessionContractRequestSchema>;
export type InternalPaperclipSeatSessionContractResponse = z.infer<typeof InternalPaperclipSeatSessionContractResponseSchema>;
export type PaperclipSeatSessionContractResult = z.infer<typeof PaperclipSeatSessionContractResultSchema>;

export const INTERNAL_PAPERCLIP_SEAT_SESSION_MANDATE_PATH = '/internal/paperclip/seats/session-mandate' as const;

export const InternalPaperclipSeatSessionMandateRequestSchema = z.strictObject({
  organizationId: InternalPaperclipSeatsQuerySchema.shape.organizationId,
  // The verified chief identity and run resolve the issue; the caller selects a piece from the whole mandate.
  identity: ParticipantAgentIdentitySchema,
  sourceRunId: RunIdSchema,
});

export const PAPERCLIP_SEAT_SESSION_MANDATE_RESULTS = [
  'read', 'not_enabled', 'mandate_missing', 'mandate_invalid', ...PAPERCLIP_SOURCE_RUN_REFUSALS,
] as const;
export const PaperclipSeatSessionMandateResultSchema = z.enum(PAPERCLIP_SEAT_SESSION_MANDATE_RESULTS);

export const PAPERCLIP_SEAT_SESSION_MANDATE_BINDINGS = ['verified', 'criteria_only'] as const;
export const PaperclipSeatSessionMandateBindingSchema = z.enum(PAPERCLIP_SEAT_SESSION_MANDATE_BINDINGS);
export type PaperclipSeatSessionMandateBinding = z.infer<typeof PaperclipSeatSessionMandateBindingSchema>;

export const InternalPaperclipSeatSessionMandateResponseSchema = z.strictObject({
  result: PaperclipSeatSessionMandateResultSchema,
  issueId: z.uuid().optional(),
  mandate: ReconciledMandateSchema.optional(),
  mandateBinding: PaperclipSeatSessionMandateBindingSchema.optional(),
  reason: z.enum(['not_json', 'not_a_mandate']).optional(),
}).superRefine((value, ctx) => {
  // Only a verified source issue can carry a document outcome; refusals must not expose its identity or mandate.
  const hasIssue = value.result === 'read' || value.result === 'mandate_missing' || value.result === 'mandate_invalid';
  if (hasIssue && value.issueId === undefined) {
    ctx.addIssue({ code: 'custom', message: `${value.result} requires issueId`, path: ['issueId'] });
  }
  if (!hasIssue && value.issueId !== undefined) {
    ctx.addIssue({ code: 'custom', message: `${value.result} must not carry issueId`, path: ['issueId'] });
  }
  if (value.result === 'read' && value.mandate === undefined) {
    ctx.addIssue({ code: 'custom', message: 'read requires mandate', path: ['mandate'] });
  }
  if (value.result !== 'read' && value.mandate !== undefined) {
    ctx.addIssue({ code: 'custom', message: `${value.result} must not carry mandate`, path: ['mandate'] });
  }
  // An identity binding describes a read mandate, never a refusal or missing document.
  if (value.result !== 'read' && value.mandateBinding !== undefined) {
    ctx.addIssue({ code: 'custom', message: `${value.result} must not carry mandateBinding`, path: ['mandateBinding'] });
  }
  if (value.result === 'mandate_invalid' && value.reason === undefined) {
    ctx.addIssue({ code: 'custom', message: 'mandate_invalid requires reason', path: ['reason'] });
  }
  if (value.result !== 'mandate_invalid' && value.reason !== undefined) {
    ctx.addIssue({ code: 'custom', message: `${value.result} must not carry reason`, path: ['reason'] });
  }
});

export const internalPaperclipSeatSessionMandateContract = {
  method: 'POST' as const,
  path: INTERNAL_PAPERCLIP_SEAT_SESSION_MANDATE_PATH,
  authType: 'secret' as const,
  bodySchema: InternalPaperclipSeatSessionMandateRequestSchema,
  responseSchema: InternalPaperclipSeatSessionMandateResponseSchema,
  errorResponseSchema: InternalPaperclipSeatWakeErrorResponseSchema,
} as const;

export type InternalPaperclipSeatSessionMandateRequest = z.infer<typeof InternalPaperclipSeatSessionMandateRequestSchema>;
export type InternalPaperclipSeatSessionMandateResponse = z.infer<typeof InternalPaperclipSeatSessionMandateResponseSchema>;
export type PaperclipSeatSessionMandateResult = z.infer<typeof PaperclipSeatSessionMandateResultSchema>;

export function sessionMandateBinding(response: InternalPaperclipSeatSessionMandateResponse): PaperclipSeatSessionMandateBinding {
  // Stefano 21/11, decision 1; Codex point 2: a legacy response does not prove the identity binding.
  return response.result === 'read' && response.mandateBinding === 'verified' ? 'verified' : 'criteria_only';
}

export const INTERNAL_PAPERCLIP_SEAT_SESSION_PROOFS_PATH = '/internal/paperclip/seats/session-proofs' as const;

export const InternalPaperclipSeatSessionProofsRequestSchema = z.strictObject({
  organizationId: InternalPaperclipSeatsQuerySchema.shape.organizationId,
  // The verified chief identity and source run resolve the issue without trusting model input.
  identity: ParticipantAgentIdentitySchema,
  sourceRunId: RunIdSchema,
  sessionId: z.string().regex(/^R[1-9][0-9]{0,8}$/),
  call: ToolCallRequestSchema,
}).superRefine((value, ctx) => {
  // The session reader needs the turn envelope, but provider credentials must stay in the calling service.
  if (value.call.credentials !== undefined) {
    ctx.addIssue({ code: 'custom', path: ['call', 'credentials'], message: 'Provider credentials must not cross services' });
  }
});

export const PAPERCLIP_SEAT_SESSION_PROOFS_RESULTS = [
  'carried', 'incomplete', 'status_only', 'not_enabled', ...PAPERCLIP_SOURCE_RUN_REFUSALS,
] as const;
export const PaperclipSeatSessionProofsResultSchema = z.enum(PAPERCLIP_SEAT_SESSION_PROOFS_RESULTS);

export const InternalPaperclipSeatSessionProofsResponseSchema = z.strictObject({
  result: PaperclipSeatSessionProofsResultSchema,
  issueId: z.uuid().optional(),
  counts: z.strictObject({
    new: z.int().min(0),
    alreadyThere: z.int().min(0),
    failed: z.int().min(0),
    tooLarge: z.int().min(0),
  }).optional(),
}).superRefine((value, ctx) => {
  // Only a verified source issue carries upload counts; refusals must not claim an upload or expose the issue.
  const hasIssue = value.result === 'carried' || value.result === 'incomplete' || value.result === 'status_only';
  for (const field of ['issueId', 'counts'] as const) {
    if (hasIssue && value[field] === undefined) {
      ctx.addIssue({ code: 'custom', message: `${value.result} requires ${field}`, path: [field] });
    }
    if (!hasIssue && value[field] !== undefined) {
      ctx.addIssue({ code: 'custom', message: `${value.result} must not carry ${field}`, path: [field] });
    }
  }
  // A completed carry cannot hide proofs that failed or exceeded the attachment limit.
  if (value.result === 'carried' && value.counts !== undefined && (value.counts.failed > 0 || value.counts.tooLarge > 0)) {
    ctx.addIssue({ code: 'custom', message: 'carried must not have missing proofs', path: ['counts'] });
  }
});

export const internalPaperclipSeatSessionProofsContract = {
  method: 'POST' as const,
  path: INTERNAL_PAPERCLIP_SEAT_SESSION_PROOFS_PATH,
  authType: 'secret' as const,
  bodySchema: InternalPaperclipSeatSessionProofsRequestSchema,
  responseSchema: InternalPaperclipSeatSessionProofsResponseSchema,
  errorResponseSchema: InternalPaperclipSeatWakeErrorResponseSchema,
} as const;

export type InternalPaperclipSeatSessionProofsRequest = z.infer<typeof InternalPaperclipSeatSessionProofsRequestSchema>;
export type InternalPaperclipSeatSessionProofsResponse = z.infer<typeof InternalPaperclipSeatSessionProofsResponseSchema>;
export type PaperclipSeatSessionProofsResult = z.infer<typeof PaperclipSeatSessionProofsResultSchema>;
