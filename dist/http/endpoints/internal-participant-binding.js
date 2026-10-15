// eslint-disable-next-line @typescript-eslint/no-unused-vars -- intentional: in-scope `z` is required for TS to emit portable .d.ts (`z.ZodObject<...>` named ref instead of synthesized `import("zod").ZodObject<...>`). See scripts/check-portable-dts.mjs (v1.6.3 fix, commit 6df26a1, Phase 19-00).
import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from "../../auth/index.js";
import { ParticipantAgentIdentitySchema, ParticipantBindingKeySchema, ParticipantBindingOutcomeSchema, ParticipantBindingReceiptSchema, ParticipantBindingSchema, ParticipantBindingSelectorSchema, } from "../../organization/participant-binding.js";
export const INTERNAL_PARTICIPANT_BINDING_APPLY_PATH = '/internal/participant-binding/apply';
export const INTERNAL_PARTICIPANT_BINDING_READ_PATH = '/internal/participant-binding/read';
export const INTERNAL_PARTICIPANT_BINDING_LIST_PATH = '/internal/participant-binding/list';
export const INTERNAL_PARTICIPANT_BINDING_WITHDRAW_PATH = '/internal/participant-binding/withdraw';
export const INTERNAL_PARTICIPANT_BINDING_RESOLVE_PATH = '/internal/participant-binding/resolve';
/** Outcome codes of the binding resolution plus the operation-specific ones. */
export const ParticipantBindingErrorCodeSchema = z.enum([
    ...ParticipantBindingOutcomeSchema.options,
    'version_conflict',
    'person_required',
]);
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
    .refine(({ key, binding }) => key.tenantId === binding.tenantId &&
    key.ownerId === binding.ownerId &&
    key.personRef === binding.personRef &&
    JSON.stringify(ParticipantAgentIdentitySchema.parse(key.agentIdentity)) ===
        JSON.stringify(ParticipantAgentIdentitySchema.parse(binding.agentIdentity)), { message: 'key must match binding (tenant, owner, agent identity, person)', path: ['key'] });
export const InternalParticipantBindingApplyResponseSchema = z.union([
    z.strictObject({ ok: z.literal(true), receipt: ParticipantBindingReceiptSchema }),
    ErrorResponseSchema,
]);
export const InternalParticipantBindingReadRequestSchema = z.strictObject({
    key: ParticipantBindingKeySchema,
});
export const InternalParticipantBindingReadResponseSchema = z.union([
    z.strictObject({ ok: z.literal(true), ...BindingWithReceiptSchema.shape }),
    z.strictObject({ ok: z.literal(false), error: z.literal('not_found'), reason: z.string().min(1) }),
]);
export const InternalParticipantBindingListRequestSchema = z.strictObject({
    tenantId: ParticipantBindingSchema.shape.tenantId,
    ownerId: ParticipantBindingSchema.shape.ownerId,
    agentIdentity: ParticipantAgentIdentitySchema,
    organizationId: z.string().min(1),
    cursor: z.string().min(1).optional(),
    limit: z.number().int().min(1).max(100),
});
export const InternalParticipantBindingListResponseSchema = z.strictObject({
    items: z.array(BindingWithReceiptSchema),
    nextCursor: z.string().min(1).optional(),
});
export const InternalParticipantBindingWithdrawRequestSchema = z.strictObject({
    key: ParticipantBindingKeySchema,
    expectedVersion: z.number().int().positive(),
    reason: z.string().min(1),
});
export const InternalParticipantBindingWithdrawResponseSchema = z.union([
    z.strictObject({
        ok: z.literal(true),
        receipt: ParticipantBindingReceiptSchema.extend({ withdrawnAt: z.iso.datetime() }),
    }),
    ErrorResponseSchema,
]);
export const InternalParticipantBindingResolveRequestSchema = ParticipantBindingSelectorSchema;
export const InternalParticipantBindingResolveResponseSchema = z.discriminatedUnion('outcome', [
    z.strictObject({ outcome: z.literal('bound'), ...BindingWithReceiptSchema.shape }),
    z.strictObject({ outcome: z.literal('not_found'), reason: z.string().min(1) }),
    z.strictObject({ outcome: z.literal('ambiguous'), reason: z.string().min(1) }),
]);
const base = {
    method: 'POST',
    authType: 'secret',
    authHeader: INTERNAL_SECRET_HEADER,
};
export const internalParticipantBindingApplyContract = {
    ...base,
    path: INTERNAL_PARTICIPANT_BINDING_APPLY_PATH,
    bodySchema: InternalParticipantBindingApplyRequestSchema,
    responseSchema: InternalParticipantBindingApplyResponseSchema,
};
export const internalParticipantBindingReadContract = {
    ...base,
    path: INTERNAL_PARTICIPANT_BINDING_READ_PATH,
    bodySchema: InternalParticipantBindingReadRequestSchema,
    responseSchema: InternalParticipantBindingReadResponseSchema,
};
export const internalParticipantBindingListContract = {
    ...base,
    path: INTERNAL_PARTICIPANT_BINDING_LIST_PATH,
    bodySchema: InternalParticipantBindingListRequestSchema,
    responseSchema: InternalParticipantBindingListResponseSchema,
};
export const internalParticipantBindingWithdrawContract = {
    ...base,
    path: INTERNAL_PARTICIPANT_BINDING_WITHDRAW_PATH,
    bodySchema: InternalParticipantBindingWithdrawRequestSchema,
    responseSchema: InternalParticipantBindingWithdrawResponseSchema,
};
export const internalParticipantBindingResolveContract = {
    ...base,
    path: INTERNAL_PARTICIPANT_BINDING_RESOLVE_PATH,
    bodySchema: InternalParticipantBindingResolveRequestSchema,
    responseSchema: InternalParticipantBindingResolveResponseSchema,
};
//# sourceMappingURL=internal-participant-binding.js.map