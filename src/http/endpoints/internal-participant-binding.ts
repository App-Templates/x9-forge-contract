import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from '../../auth/index.js';
import {
  ParticipantAgentIdentitySchema,
  ParticipantBindingKeySchema,
  ParticipantBindingOutcomeSchema,
  ParticipantBindingReceiptSchema,
  ParticipantBindingSchema,
  ParticipantBindingSelectorSchema,
} from '../../organization/participant-binding.js';

export const INTERNAL_PARTICIPANT_BINDING_APPLY_PATH = '/internal/participant-binding/apply' as const;
export const INTERNAL_PARTICIPANT_BINDING_READ_PATH = '/internal/participant-binding/read' as const;
export const INTERNAL_PARTICIPANT_BINDING_LIST_PATH = '/internal/participant-binding/list' as const;
export const INTERNAL_PARTICIPANT_BINDING_WITHDRAW_PATH = '/internal/participant-binding/withdraw' as const;
export const INTERNAL_PARTICIPANT_BINDING_RESOLVE_PATH = '/internal/participant-binding/resolve' as const;

/** Outcome codes of the binding resolution plus the operation-specific ones. */
export const ParticipantBindingErrorCodeSchema = z.enum([
  ...ParticipantBindingOutcomeSchema.options,
  'version_conflict',
  'person_required',
]);
export type ParticipantBindingErrorCode = z.infer<typeof ParticipantBindingErrorCodeSchema>;

const ErrorResponseSchema = z.strictObject({
  ok: z.literal(false),
  error: ParticipantBindingErrorCodeSchema,
  reason: z.string().min(1),
});

const BindingWithReceiptSchema = z.strictObject({
  binding: ParticipantBindingSchema,
  receipt: ParticipantBindingReceiptSchema,
});

export const InternalParticipantBindingApplyRequestSchema = z
  .strictObject({
    key: ParticipantBindingKeySchema,
    binding: ParticipantBindingSchema,
    expectedVersion: z.number().int().min(0),
  })
  .refine(
    ({ key, binding }) =>
      key.tenantId === binding.tenantId &&
      key.ownerId === binding.ownerId &&
      key.personRef === binding.personRef &&
      JSON.stringify(ParticipantAgentIdentitySchema.parse(key.agentIdentity)) ===
        JSON.stringify(ParticipantAgentIdentitySchema.parse(binding.agentIdentity)),
    { message: 'key must match binding (tenant, owner, agent identity, person)', path: ['key'] },
  );
export type InternalParticipantBindingApplyRequest = z.infer<
  typeof InternalParticipantBindingApplyRequestSchema
>;

export const InternalParticipantBindingApplyResponseSchema = z.union([
  z.strictObject({ ok: z.literal(true), receipt: ParticipantBindingReceiptSchema }),
  ErrorResponseSchema,
]);
export type InternalParticipantBindingApplyResponse = z.infer<
  typeof InternalParticipantBindingApplyResponseSchema
>;

export const InternalParticipantBindingReadRequestSchema = z.strictObject({
  key: ParticipantBindingKeySchema,
});
export type InternalParticipantBindingReadRequest = z.infer<
  typeof InternalParticipantBindingReadRequestSchema
>;

export const InternalParticipantBindingReadResponseSchema = z.union([
  z.strictObject({ ok: z.literal(true), ...BindingWithReceiptSchema.shape }),
  z.strictObject({ ok: z.literal(false), error: z.literal('not_found'), reason: z.string().min(1) }),
]);
export type InternalParticipantBindingReadResponse = z.infer<
  typeof InternalParticipantBindingReadResponseSchema
>;

export const InternalParticipantBindingListRequestSchema = z.strictObject({
  tenantId: ParticipantBindingSchema.shape.tenantId,
  ownerId: ParticipantBindingSchema.shape.ownerId,
  agentIdentity: ParticipantAgentIdentitySchema,
  organizationId: z.string().min(1),
  cursor: z.string().min(1).optional(),
  limit: z.number().int().min(1).max(100),
});
export type InternalParticipantBindingListRequest = z.infer<
  typeof InternalParticipantBindingListRequestSchema
>;

export const InternalParticipantBindingListResponseSchema = z.strictObject({
  items: z.array(BindingWithReceiptSchema),
  nextCursor: z.string().min(1).optional(),
});
export type InternalParticipantBindingListResponse = z.infer<
  typeof InternalParticipantBindingListResponseSchema
>;

export const InternalParticipantBindingWithdrawRequestSchema = z.strictObject({
  key: ParticipantBindingKeySchema,
  expectedVersion: z.number().int().positive(),
  reason: z.string().min(1),
});
export type InternalParticipantBindingWithdrawRequest = z.infer<
  typeof InternalParticipantBindingWithdrawRequestSchema
>;

export const InternalParticipantBindingWithdrawResponseSchema = z.union([
  z.strictObject({
    ok: z.literal(true),
    receipt: ParticipantBindingReceiptSchema.extend({ withdrawnAt: z.iso.datetime() }),
  }),
  ErrorResponseSchema,
]);
export type InternalParticipantBindingWithdrawResponse = z.infer<
  typeof InternalParticipantBindingWithdrawResponseSchema
>;

export const InternalParticipantBindingResolveRequestSchema = ParticipantBindingSelectorSchema;
export type InternalParticipantBindingResolveRequest = z.infer<
  typeof InternalParticipantBindingResolveRequestSchema
>;

export const InternalParticipantBindingResolveResponseSchema = z.discriminatedUnion('outcome', [
  z.strictObject({ outcome: z.literal('bound'), ...BindingWithReceiptSchema.shape }),
  z.strictObject({ outcome: z.literal('not_found'), reason: z.string().min(1) }),
  z.strictObject({ outcome: z.literal('ambiguous'), reason: z.string().min(1) }),
]);
export type InternalParticipantBindingResolveResponse = z.infer<
  typeof InternalParticipantBindingResolveResponseSchema
>;

const base = {
  method: 'POST' as const,
  authType: 'secret' as const,
  authHeader: INTERNAL_SECRET_HEADER,
};

export const internalParticipantBindingApplyContract = {
  ...base,
  path: INTERNAL_PARTICIPANT_BINDING_APPLY_PATH,
  bodySchema: InternalParticipantBindingApplyRequestSchema,
  responseSchema: InternalParticipantBindingApplyResponseSchema,
} as const;

export const internalParticipantBindingReadContract = {
  ...base,
  path: INTERNAL_PARTICIPANT_BINDING_READ_PATH,
  bodySchema: InternalParticipantBindingReadRequestSchema,
  responseSchema: InternalParticipantBindingReadResponseSchema,
} as const;

export const internalParticipantBindingListContract = {
  ...base,
  path: INTERNAL_PARTICIPANT_BINDING_LIST_PATH,
  bodySchema: InternalParticipantBindingListRequestSchema,
  responseSchema: InternalParticipantBindingListResponseSchema,
} as const;

export const internalParticipantBindingWithdrawContract = {
  ...base,
  path: INTERNAL_PARTICIPANT_BINDING_WITHDRAW_PATH,
  bodySchema: InternalParticipantBindingWithdrawRequestSchema,
  responseSchema: InternalParticipantBindingWithdrawResponseSchema,
} as const;

export const internalParticipantBindingResolveContract = {
  ...base,
  path: INTERNAL_PARTICIPANT_BINDING_RESOLVE_PATH,
  bodySchema: InternalParticipantBindingResolveRequestSchema,
  responseSchema: InternalParticipantBindingResolveResponseSchema,
} as const;
