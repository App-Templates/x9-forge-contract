import { z } from 'zod';
import { OrganizationRunContextSchema } from "./run-context.js";
import { PublicationRecipientSchema, PublicationRefSchema } from "./publication-ref.js";
/** Withdraw a publication. Tenant and owner come from the run context, never from the caller. */
export const WithdrawPublicationRequestSchema = z.strictObject({
    context: OrganizationRunContextSchema,
    ref: PublicationRefSchema,
});
const WithdrawRefusalBody = { message: z.string().min(1).optional() };
/** Idempotent: a second withdrawal returns the same receipt. */
export const WithdrawPublicationResponseSchema = z.discriminatedUnion('status', [
    z.strictObject({
        status: z.literal('withdrawn'),
        ref: PublicationRefSchema,
        withdrawnAt: z.string().datetime({ offset: true }),
    }),
    z.strictObject({ status: z.literal('not_authorized'), ...WithdrawRefusalBody }),
    z.strictObject({ status: z.literal('unknown_reference'), ...WithdrawRefusalBody }),
]);
export const LIST_PUBLICATIONS_MAX_LIMIT = 100;
export const ListPublicationsRequestSchema = z.strictObject({
    context: OrganizationRunContextSchema,
    recipient: PublicationRecipientSchema,
    cursor: z.string().min(1).optional(),
    limit: z.number().int().min(1).max(LIST_PUBLICATIONS_MAX_LIMIT).optional(),
});
export const ListPublicationsResponseSchema = z.strictObject({
    items: z.array(PublicationRefSchema).max(LIST_PUBLICATIONS_MAX_LIMIT),
    nextCursor: z.string().min(1).nullable(),
});
//# sourceMappingURL=publication-lookup.js.map