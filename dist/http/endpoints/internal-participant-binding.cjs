"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalParticipantBindingResolveContract = exports.internalParticipantBindingWithdrawContract = exports.internalParticipantBindingListContract = exports.internalParticipantBindingReadContract = exports.internalParticipantBindingApplyContract = exports.InternalParticipantBindingResolveResponseSchema = exports.InternalParticipantBindingResolveRequestSchema = exports.InternalParticipantBindingWithdrawResponseSchema = exports.InternalParticipantBindingWithdrawRequestSchema = exports.InternalParticipantBindingListResponseSchema = exports.InternalParticipantBindingListRequestSchema = exports.InternalParticipantBindingReadResponseSchema = exports.InternalParticipantBindingReadRequestSchema = exports.InternalParticipantBindingApplyResponseSchema = exports.InternalParticipantBindingApplyRequestSchema = exports.ParticipantBindingErrorCodeSchema = exports.INTERNAL_PARTICIPANT_BINDING_RESOLVE_PATH = exports.INTERNAL_PARTICIPANT_BINDING_WITHDRAW_PATH = exports.INTERNAL_PARTICIPANT_BINDING_LIST_PATH = exports.INTERNAL_PARTICIPANT_BINDING_READ_PATH = exports.INTERNAL_PARTICIPANT_BINDING_APPLY_PATH = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../../auth/index.cjs");
const participant_binding_js_1 = require("../../organization/participant-binding.cjs");
exports.INTERNAL_PARTICIPANT_BINDING_APPLY_PATH = '/internal/participant-binding/apply';
exports.INTERNAL_PARTICIPANT_BINDING_READ_PATH = '/internal/participant-binding/read';
exports.INTERNAL_PARTICIPANT_BINDING_LIST_PATH = '/internal/participant-binding/list';
exports.INTERNAL_PARTICIPANT_BINDING_WITHDRAW_PATH = '/internal/participant-binding/withdraw';
exports.INTERNAL_PARTICIPANT_BINDING_RESOLVE_PATH = '/internal/participant-binding/resolve';
/** Outcome codes of the binding resolution plus the operation-specific ones. */
exports.ParticipantBindingErrorCodeSchema = zod_1.z.enum([
    ...participant_binding_js_1.ParticipantBindingOutcomeSchema.options,
    'version_conflict',
    'person_required',
]);
const ErrorResponseSchema = zod_1.z.strictObject({
    ok: zod_1.z.literal(false),
    error: exports.ParticipantBindingErrorCodeSchema,
    reason: zod_1.z.string().min(1),
});
const BindingWithReceiptSchema = zod_1.z.strictObject({
    binding: participant_binding_js_1.ParticipantBindingSchema,
    receipt: participant_binding_js_1.ParticipantBindingReceiptSchema,
});
exports.InternalParticipantBindingApplyRequestSchema = zod_1.z
    .strictObject({
    key: participant_binding_js_1.ParticipantBindingKeySchema,
    binding: participant_binding_js_1.ParticipantBindingSchema,
    expectedVersion: zod_1.z.number().int().min(0),
})
    .refine(({ key, binding }) => key.tenantId === binding.tenantId &&
    key.ownerId === binding.ownerId &&
    key.personRef === binding.personRef &&
    JSON.stringify(participant_binding_js_1.ParticipantAgentIdentitySchema.parse(key.agentIdentity)) ===
        JSON.stringify(participant_binding_js_1.ParticipantAgentIdentitySchema.parse(binding.agentIdentity)), { message: 'key must match binding (tenant, owner, agent identity, person)', path: ['key'] });
exports.InternalParticipantBindingApplyResponseSchema = zod_1.z.union([
    zod_1.z.strictObject({ ok: zod_1.z.literal(true), receipt: participant_binding_js_1.ParticipantBindingReceiptSchema }),
    ErrorResponseSchema,
]);
exports.InternalParticipantBindingReadRequestSchema = zod_1.z.strictObject({
    key: participant_binding_js_1.ParticipantBindingKeySchema,
});
exports.InternalParticipantBindingReadResponseSchema = zod_1.z.union([
    zod_1.z.strictObject({ ok: zod_1.z.literal(true), ...BindingWithReceiptSchema.shape }),
    zod_1.z.strictObject({ ok: zod_1.z.literal(false), error: zod_1.z.literal('not_found'), reason: zod_1.z.string().min(1) }),
]);
exports.InternalParticipantBindingListRequestSchema = zod_1.z.strictObject({
    tenantId: participant_binding_js_1.ParticipantBindingSchema.shape.tenantId,
    ownerId: participant_binding_js_1.ParticipantBindingSchema.shape.ownerId,
    agentIdentity: participant_binding_js_1.ParticipantAgentIdentitySchema,
    organizationId: zod_1.z.string().min(1),
    cursor: zod_1.z.string().min(1).optional(),
    limit: zod_1.z.number().int().min(1).max(100),
});
exports.InternalParticipantBindingListResponseSchema = zod_1.z.strictObject({
    items: zod_1.z.array(BindingWithReceiptSchema),
    nextCursor: zod_1.z.string().min(1).optional(),
});
exports.InternalParticipantBindingWithdrawRequestSchema = zod_1.z.strictObject({
    key: participant_binding_js_1.ParticipantBindingKeySchema,
    expectedVersion: zod_1.z.number().int().positive(),
    reason: zod_1.z.string().min(1),
});
exports.InternalParticipantBindingWithdrawResponseSchema = zod_1.z.union([
    zod_1.z.strictObject({
        ok: zod_1.z.literal(true),
        receipt: participant_binding_js_1.ParticipantBindingReceiptSchema.extend({ withdrawnAt: zod_1.z.iso.datetime() }),
    }),
    ErrorResponseSchema,
]);
exports.InternalParticipantBindingResolveRequestSchema = participant_binding_js_1.ParticipantBindingSelectorSchema;
exports.InternalParticipantBindingResolveResponseSchema = zod_1.z.discriminatedUnion('outcome', [
    zod_1.z.strictObject({ outcome: zod_1.z.literal('bound'), ...BindingWithReceiptSchema.shape }),
    zod_1.z.strictObject({ outcome: zod_1.z.literal('not_found'), reason: zod_1.z.string().min(1) }),
    zod_1.z.strictObject({ outcome: zod_1.z.literal('ambiguous'), reason: zod_1.z.string().min(1) }),
]);
const base = {
    method: 'POST',
    authType: 'secret',
    authHeader: index_js_1.INTERNAL_SECRET_HEADER,
};
exports.internalParticipantBindingApplyContract = {
    ...base,
    path: exports.INTERNAL_PARTICIPANT_BINDING_APPLY_PATH,
    bodySchema: exports.InternalParticipantBindingApplyRequestSchema,
    responseSchema: exports.InternalParticipantBindingApplyResponseSchema,
};
exports.internalParticipantBindingReadContract = {
    ...base,
    path: exports.INTERNAL_PARTICIPANT_BINDING_READ_PATH,
    bodySchema: exports.InternalParticipantBindingReadRequestSchema,
    responseSchema: exports.InternalParticipantBindingReadResponseSchema,
};
exports.internalParticipantBindingListContract = {
    ...base,
    path: exports.INTERNAL_PARTICIPANT_BINDING_LIST_PATH,
    bodySchema: exports.InternalParticipantBindingListRequestSchema,
    responseSchema: exports.InternalParticipantBindingListResponseSchema,
};
exports.internalParticipantBindingWithdrawContract = {
    ...base,
    path: exports.INTERNAL_PARTICIPANT_BINDING_WITHDRAW_PATH,
    bodySchema: exports.InternalParticipantBindingWithdrawRequestSchema,
    responseSchema: exports.InternalParticipantBindingWithdrawResponseSchema,
};
exports.internalParticipantBindingResolveContract = {
    ...base,
    path: exports.INTERNAL_PARTICIPANT_BINDING_RESOLVE_PATH,
    bodySchema: exports.InternalParticipantBindingResolveRequestSchema,
    responseSchema: exports.InternalParticipantBindingResolveResponseSchema,
};
//# sourceMappingURL=internal-participant-binding.js.map