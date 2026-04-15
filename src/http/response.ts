import { z } from 'zod';

/**
 * Standardized error response shape for all bridge HTTP endpoints.
 * Requirement: HTTP-13.
 */
export const BridgeErrorResponseSchema = z.object({
  ok: z.literal(false),
  code: z.string().min(1),
  message: z.string(),
  details: z.unknown().optional(),
});
export type BridgeErrorResponse = z.infer<typeof BridgeErrorResponseSchema>;

/**
 * Standardized success response shape for all bridge HTTP endpoints.
 * Requirement: HTTP-14.
 * The `data` field is typed as `unknown` in the base schema;
 * endpoint-specific schemas (Phase 4) will narrow it.
 */
export const BridgeSuccessResponseSchema = z.object({
  ok: z.literal(true),
  data: z.unknown(),
});
export type BridgeSuccessResponse = z.infer<typeof BridgeSuccessResponseSchema>;

/**
 * Union response type: every bridge endpoint returns either success or error.
 */
export const BridgeResponseSchema = z.discriminatedUnion('ok', [
  BridgeSuccessResponseSchema,
  BridgeErrorResponseSchema,
]);
export type BridgeResponse = z.infer<typeof BridgeResponseSchema>;
