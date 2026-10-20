import { z } from 'zod';
import { OwnerIdSchema } from '../agent/agent-identity.js';
import { ParticipantAgentIdentitySchema } from './participant-binding.js';

/** Channels through which an agent asks the owner for a decision. */
export const DECISION_REQUEST_CHANNELS = ['email', 'x9_conversation', 'forge_panel'] as const;
export const DecisionRequestChannelSchema = z.enum(DECISION_REQUEST_CHANNELS);
export type DecisionRequestChannel = z.infer<typeof DecisionRequestChannelSchema>;

export const DecisionRequestIdSchema = z.string().regex(/^[A-Za-z0-9_-]{6,64}$/);
export type DecisionRequestId = z.infer<typeof DecisionRequestIdSchema>;

const OptionIdSchema = z
  .string()
  .max(40)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

export const DecisionRequestOptionSchema = z.strictObject({
  optionId: OptionIdSchema,
  label: z.string().min(1).max(200),
  detail: z.string().min(1).max(2000).optional(),
});
export type DecisionRequestOption = z.infer<typeof DecisionRequestOptionSchema>;

/** Open question an agent puts to the owner, with the options to choose from. */
export const DecisionRequestSchema = z.strictObject({
  requestId: DecisionRequestIdSchema,
  tenantId: z.string().min(1),
  organizationId: z.string().min(1).max(64),
  projectId: z.string().min(1).max(64).optional(),
  question: z.string().min(1).max(4000),
  options: z
    .array(DecisionRequestOptionSchema)
    .min(1)
    .max(10)
    .refine((options) => new Set(options.map((o) => o.optionId)).size === options.length, {
      message: 'optionId must be unique within a request',
    }),
  requestedBy: ParticipantAgentIdentitySchema,
  addressedTo: z.strictObject({ ownerId: OwnerIdSchema }),
  channel: DecisionRequestChannelSchema,
  createdAt: z.iso.datetime({ offset: true }),
});
export type DecisionRequest = z.infer<typeof DecisionRequestSchema>;

const outcomeBase = {
  requestId: DecisionRequestIdSchema,
  decidedBy: z.strictObject({ kind: z.literal('owner'), ownerId: OwnerIdSchema }),
  decidedAt: z.iso.datetime({ offset: true }),
  channel: DecisionRequestChannelSchema,
  sourceRef: z.string().min(1).max(512),
};

/** Recorded owner answer to a decision request. */
export const DecisionOutcomeSchema = z.discriminatedUnion('outcome', [
  z.strictObject({ ...outcomeBase, outcome: z.literal('approved'), optionId: OptionIdSchema }),
  z.strictObject({ ...outcomeBase, outcome: z.literal('rejected'), reason: z.string().min(3).max(2000) }),
]);
export type DecisionOutcome = z.infer<typeof DecisionOutcomeSchema>;
