import { z } from 'zod';
import { InboundEventDispositionSchema } from '../../capability/paperclip/inbound-event.js';
import { ParticipantAgentIdentitySchema } from '../../organization/participant-binding.js';
import { CapabilityAgentScopeSchema } from '../../capability/capability-call-identity.js';
import { AgentRequestSchema } from '../../organization/agent-request.js';
import { DecisionOutcomeSchema, DecisionRequestIdSchema, DecisionRequestSchema } from '../../organization/decision-request.js';
import { ResearchIdSchema, ResearchStateSchema } from '../../capability/ricerca/research.js';
import {
  DevSessionAssignmentSchema,
  DevSessionCommitSchema,
  DevSessionResultSchema,
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
});

export const PAPERCLIP_SEAT_REPLY_WAKE_RESULTS = ['woken', 'skipped', 'duplicate', 'not_waiting', 'no_mandate', 'ambiguous'] as const;
export const PaperclipSeatReplyWakeResultSchema = z.enum(PAPERCLIP_SEAT_REPLY_WAKE_RESULTS);

export const InternalPaperclipSeatReplyWakeResponseSchema = z.strictObject({
  result: PaperclipSeatReplyWakeResultSchema,
  issueId: z.uuid().optional(),
  runId: z.uuid().optional(),
  disposition: InboundEventDispositionSchema.optional(),
}).superRefine((value, ctx) => {
  if (value.result === 'woken' && (value.issueId === undefined || value.runId === undefined)) {
    ctx.addIssue({ code: 'custom', message: 'woken requires issueId and runId', path: ['runId'] });
  }
  if (value.result !== 'woken' && value.runId !== undefined) {
    ctx.addIssue({ code: 'custom', message: 'runId is only allowed with woken', path: ['runId'] });
  }
  if ((value.result === 'skipped' || value.result === 'not_waiting') && value.issueId === undefined) {
    ctx.addIssue({ code: 'custom', message: `${value.result} requires issueId`, path: ['issueId'] });
  }
  if ((value.result === 'no_mandate' || value.result === 'ambiguous') && value.issueId !== undefined) {
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

export const internalPaperclipSeatReplyWakeContract = {
  method: 'POST' as const,
  path: INTERNAL_PAPERCLIP_SEAT_REPLY_WAKE_PATH,
  authType: 'secret' as const,
  bodySchema: InternalPaperclipSeatReplyWakeRequestSchema,
  responseSchema: InternalPaperclipSeatReplyWakeResponseSchema,
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

export const PaperclipSeatNativeWakeEventSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('email'),
    messageId: InternalPaperclipSeatReplyWakeRequestSchema.shape.messageId,
    threadKey: InternalPaperclipSeatReplyWakeRequestSchema.shape.messageId,
    mode: z.enum(PAPERCLIP_SEAT_NATIVE_WAKE_EMAIL_MODES),
    // Memory A project of the decision request this email answers, when cap-email knows it; never guessed.
    projectRef: DecisionRequestSchema.shape.projectId,
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
    attempt: z.int().min(1).max(10),
    maxAttempts: z.int().min(1).max(10),
  }).refine(e => e.attempt <= e.maxAttempts, { path: ['attempt'], message: 'attempt must not exceed maxAttempts' }),
  z.strictObject({ kind: z.literal('agent_request'), request: AgentRequestSchema }),
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
    const isDecision = value.event.mode === 'decision';
    if (isDecision && value.event.decision === undefined) {
      ctx.addIssue({ code: 'custom', message: 'decision mode requires decision', path: ['event', 'decision'] });
    }
    if (!isDecision && value.event.decision !== undefined) {
      ctx.addIssue({ code: 'custom', message: 'decision is only allowed with decision mode', path: ['event', 'decision'] });
    }
  }
});

export const PAPERCLIP_SEAT_NATIVE_WAKE_RESULTS = [
  'opened', 'woken', 'deferred', 'duplicate', 'already_open', 'not_waiting', 'no_task', 'ambiguous', 'not_enabled', 'rate_limited',
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
    (value.result === 'opened' || value.result === 'deferred' || value.result === 'already_open' || value.result === 'not_waiting')
    && value.issueId === undefined
  ) {
    ctx.addIssue({ code: 'custom', message: `${value.result} requires issueId`, path: ['issueId'] });
  }
  if (
    (value.result === 'no_task' || value.result === 'ambiguous' || value.result === 'not_enabled' || value.result === 'rate_limited')
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
} as const;

export type InternalPaperclipSeatNativeWakeRequest = z.infer<typeof InternalPaperclipSeatNativeWakeRequestSchema>;
export type InternalPaperclipSeatNativeWakeResponse = z.infer<typeof InternalPaperclipSeatNativeWakeResponseSchema>;
export type PaperclipSeatNativeWakeEvent = z.infer<typeof PaperclipSeatNativeWakeEventSchema>;
export type PaperclipSeatNativeWakeResult = z.infer<typeof PaperclipSeatNativeWakeResultSchema>;
