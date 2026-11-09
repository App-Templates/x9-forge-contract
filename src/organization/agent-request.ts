import { z } from 'zod';
import { DecisionRequestIdSchema } from './decision-request.js';

export const AGENT_REQUEST_TARGET_KINDS = ['director', 'lab', 'business_unit'] as const;
export const AgentRequestTargetKindSchema = z.enum(AGENT_REQUEST_TARGET_KINDS);
export type AgentRequestTargetKind = z.infer<typeof AgentRequestTargetKindSchema>;

export const AgentRequestIdSchema = z.string().regex(/^areq_[A-Za-z0-9_-]{8,64}$/)
  .describe('Identificativo della richiesta: areq_ più 8-64 caratteri');

const TextSchema = z.string().trim().min(1).max(2000);

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
  requestedAt: z.iso.datetime({ offset: true }),
}).superRefine((value, ctx) => {
  if (value.to.kind === 'business_unit' && value.to.unitId === value.from.unitId) {
    ctx.addIssue({ code: 'custom', message: 'a unit cannot ask itself', path: ['to', 'unitId'] });
  }
});
export type AgentRequest = z.infer<typeof AgentRequestSchema>;
