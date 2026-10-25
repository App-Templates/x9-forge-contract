import { z } from 'zod';
import { ParticipantAgentIdentitySchema } from '../../organization/participant-binding.js';
import {
  PaperclipActivityInputSchema,
  PaperclipActivityOutputSchema,
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
