import { CapabilityContextRequestSchema, CapabilityContextResponseSchema } from "../../capability/capability-context.js";
/**
 * POST /context — what a capability knows about an agent, for the turn's context (v1.24.0).
 * Direction: X9 agent-core -> capability services that declare `context` in their manifest.
 * Auth: platform secret (`INTERNAL_SECRET_HEADER`), the same as `POST /call/:tool`.
 *
 * The capability identity is conveyed by the caller's `baseUrl`, not a path prefix.
 * @see ../../capability/capability-context.ts
 */
export const capContextContract = {
    method: 'POST',
    path: '/context',
    authType: 'secret',
    bodySchema: CapabilityContextRequestSchema,
    responseSchema: CapabilityContextResponseSchema,
};
export { CapabilityContextRequestSchema as CapContextRequestSchema, CapabilityContextResponseSchema as CapContextResponseSchema };
//# sourceMappingURL=cap-context.js.map