import { z } from 'zod';
import { DecisionRequestIdSchema } from './decision-request.js';
import { PaperclipCreateIssueAgentInputSchema } from '../capability/paperclip/tools.js';
import { PaperclipNativeCreateIssueAgentInputSchema } from '../capability/paperclip/native-wait.js';

export const AGENT_REQUEST_TARGET_KINDS = ['director', 'lab', 'business_unit'] as const;
export const AgentRequestTargetKindSchema = z.enum(AGENT_REQUEST_TARGET_KINDS);
export type AgentRequestTargetKind = z.infer<typeof AgentRequestTargetKindSchema>;

export const AgentRequestIdSchema = z.string().regex(/^areq_[A-Za-z0-9_-]{8,64}$/)
  .describe('Identificativo della richiesta: areq_ più 8-64 caratteri');

const TextSchema = z.string().trim().min(1).max(2000);

export const AGENT_QUESTION_TRIED_MIN = 1;

/** The asker supplies the classification and attempts; consumers must never infer them from prose. */
export const AgentQuestionDetailsSchema = z.strictObject({
  kind: z.enum(['clarification', 'scope_decision', 'technical_fault', 'clearance']),
  cause: z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('question') }),
    z.strictObject({
      kind: z.literal('refusal'),
      code: z.string().trim().min(1).max(120),
      tried: z.array(z.string().trim().min(1).max(500)).min(AGENT_QUESTION_TRIED_MIN).max(10),
    }),
  ]),
});
export type AgentQuestionDetails = z.infer<typeof AgentQuestionDetailsSchema>;

// Keep general creation additive; the service requires question when the resolved recipient is the Director.
export const PaperclipDirectorCreateInputSchema = PaperclipCreateIssueAgentInputSchema.extend({
  question: AgentQuestionDetailsSchema.optional(),
});
export const PaperclipDirectorNativeCreateInputSchema = PaperclipNativeCreateIssueAgentInputSchema.safeExtend({
  question: AgentQuestionDetailsSchema.optional(),
});
export type PaperclipDirectorCreateInput = z.infer<typeof PaperclipDirectorCreateInputSchema>;
export type PaperclipDirectorNativeCreateInput = z.infer<typeof PaperclipDirectorNativeCreateInputSchema>;

/** A lead asks the Director, the Lab or another unit for something only they can give. */
export const AgentRequestSchema = z.strictObject({
  schemaVersion: z.literal(1),
  requestId: AgentRequestIdSchema,
  from: z.strictObject({
    unitId: z.string().min(1).max(200).describe('Reparto di chi chiede'),
    paperclipAgentId: z.uuid().describe('Agente Paperclip di chi chiede'),
  }),
  to: z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal(AGENT_REQUEST_TARGET_KINDS[0]) }),
    z.strictObject({ kind: z.literal(AGENT_REQUEST_TARGET_KINDS[1]) }),
    z.strictObject({
      kind: z.literal(AGENT_REQUEST_TARGET_KINDS[2]),
      unitId: z.string().min(1).max(200).describe('Reparto a cui si chiede'),
    }),
  ]),
  need: TextSchema.describe('Cosa serve'),
  why: TextSchema.describe('Perché serve'),
  mandate: z.strictObject({
    issueId: z.uuid(),
    identifier: z.string().min(1).max(40),
  }).describe('Il Mandato di origine'),
  plan: z.strictObject({
    planId: DecisionRequestIdSchema,
    version: z.int().min(1),
  }).optional().describe('Il piano del Mandato; assente se il Mandato non ha intestazione di piano'),
  details: AgentQuestionDetailsSchema.optional(),
  requestedAt: z.iso.datetime({ offset: true }),
}).superRefine((value, ctx) => {
  // Historical requests stay readable; only new detailed questions require the exact source plan.
  if (value.details !== undefined && value.plan === undefined) {
    ctx.addIssue({ code: 'custom', message: 'A detailed question requires its source plan', path: ['plan'] });
  }
  if (value.to.kind === 'business_unit' && value.to.unitId === value.from.unitId) {
    ctx.addIssue({ code: 'custom', message: 'a unit cannot ask itself', path: ['to', 'unitId'] });
  }
});
export type AgentRequest = z.infer<typeof AgentRequestSchema>;

const QUESTION_MARKER = 'x9-agent-question:v1';
const QUESTION_OPEN = '```' + QUESTION_MARKER;

/** The record is service-owned: model prose may not impersonate its delimiter. */
export function agentQuestionFreeTextProblem(text: string): string | undefined {
  return text.includes(QUESTION_MARKER) ? 'Reserved agent question marker in free text' : undefined;
}

/** Schema parsing fixes field order so equivalent requests produce the same complete record. */
export function agentQuestionRecord(request: AgentRequest): string {
  const json = JSON.stringify(AgentRequestSchema.parse(request));
  const problem = agentQuestionFreeTextProblem(json);
  if (problem !== undefined) throw new Error(problem);
  return `${QUESTION_OPEN}\n${json}\n\`\`\``;
}

/** A reserved marker commits the reader to strict parsing, never fallback to a historical description. */
export function parseAgentQuestionRecord(text: string): AgentRequest | undefined {
  const count = text.split(QUESTION_MARKER).length - 1;
  if (count === 0) return undefined;
  if (count !== 1) throw new Error('Expected exactly one agent question record');
  const match = /(?:^|\r?\n)```x9-agent-question:v1\r?\n([\s\S]*?)\r?\n```(?=\r?\n|$)/.exec(text);
  if (match === null) throw new Error('Malformed agent question record');
  return AgentRequestSchema.parse(JSON.parse(match[1]!));
}
