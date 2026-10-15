import { z } from 'zod';
import { RunIdSchema } from './run-context.js';
import { RunOutcomeSchema } from './run-outcome.js';

const Sha256Hex = z.string().regex(/^[0-9a-fA-F]{64}$/);

/** Fields shared by every experience event. Tenant and organization are explicit. */
const experienceBase = {
  tenantId: z.string().min(1),
  organizationId: z.string().min(1),
  recordId: z.string().min(1),
  version: z.number().int().min(1),
  occurredAt: z.iso.datetime(),
  digest: Sha256Hex,
  visibility: z.literal('private_to_producer'),
};

/** Outcome of one attempt of a run, correlated by runId + attemptId. */
export const RunOutcomeExperienceEventSchema = z
  .strictObject({
    ...experienceBase,
    kind: z.literal('run_outcome'),
    runId: RunIdSchema,
    attemptId: z.string().min(1),
    outcome: RunOutcomeSchema,
  })
  .superRefine((e, ctx) => {
    if (e.outcome.runId !== e.runId) {
      ctx.addIssue({ code: 'custom', message: 'outcome.runId must match runId', path: ['outcome', 'runId'] });
    }
    if (e.outcome.attemptId !== e.attemptId) {
      ctx.addIssue({
        code: 'custom',
        message: 'outcome.attemptId must match attemptId',
        path: ['outcome', 'attemptId'],
      });
    }
  });
export type RunOutcomeExperienceEvent = z.infer<typeof RunOutcomeExperienceEventSchema>;

export const AuthoritativeDecisionStatusSchema = z.enum(['approved', 'superseded', 'revoked']);
export type AuthoritativeDecisionStatus = z.infer<typeof AuthoritativeDecisionStatusSchema>;

/** Verified identity that approved a decision. */
export const DecisionApproverSchema = z.strictObject({
  actorType: z.enum(['human', 'service']),
  actorId: z.string().min(1),
});
export type DecisionApprover = z.infer<typeof DecisionApproverSchema>;

/**
 * A decision approved by a verified identity. A complete `DecisionResponse`
 * is not an approved event: approval is a distinct, attributable act.
 */
export const AuthoritativeDecisionExperienceEventSchema = z
  .strictObject({
    ...experienceBase,
    kind: z.literal('authoritative_decision'),
    decisionRef: z.string().min(1),
    status: AuthoritativeDecisionStatusSchema,
    approvedBy: DecisionApproverSchema.optional(),
    approvalRef: z.string().min(1).optional(),
    supersedes: z.number().int().min(1).optional(),
  })
  .superRefine((e, ctx) => {
    if (e.status !== 'approved') return;
    if (e.approvedBy === undefined) {
      ctx.addIssue({ code: 'custom', message: "status 'approved' requires approvedBy", path: ['approvedBy'] });
    }
    if (e.approvalRef === undefined) {
      ctx.addIssue({ code: 'custom', message: "status 'approved' requires approvalRef", path: ['approvalRef'] });
    }
  });
export type AuthoritativeDecisionExperienceEvent = z.infer<
  typeof AuthoritativeDecisionExperienceEventSchema
>;

export const OrganizationExperienceEventSchema = z.discriminatedUnion('kind', [
  RunOutcomeExperienceEventSchema,
  AuthoritativeDecisionExperienceEventSchema,
]);
export type OrganizationExperienceEvent = z.infer<typeof OrganizationExperienceEventSchema>;

export const ExperienceReceiptSchema = z.strictObject({
  recordId: z.string().min(1),
  version: z.number().int().min(1),
  digest: Sha256Hex,
  disposition: z.enum(['stored', 'duplicate']),
});
export type ExperienceReceipt = z.infer<typeof ExperienceReceiptSchema>;

export const ExperienceConflictSchema = z.strictObject({
  code: z.literal('experience_conflict'),
  recordId: z.string().min(1),
  version: z.number().int().min(1),
});
export type ExperienceConflict = z.infer<typeof ExperienceConflictSchema>;
