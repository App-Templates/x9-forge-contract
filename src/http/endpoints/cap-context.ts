// eslint-disable-next-line @typescript-eslint/no-unused-vars -- intentional: in-scope `z` is required for TS to emit portable .d.ts (`z.ZodObject<...>` named ref instead of synthesized `import("zod").ZodObject<...>`). See scripts/check-portable-dts.mjs (v1.6.3 fix, commit 6df26a1, Phase 19-00).
import { z } from 'zod';
import { CapabilityContextRequestSchema, CapabilityContextResponseSchema } from '../../capability/capability-context.js';

/**
 * POST /context — what a capability knows about an agent, for the turn's context (v1.24.0).
 * Direction: X9 agent-core -> capability services that declare `context` in their manifest.
 * Auth: platform secret (`INTERNAL_SECRET_HEADER`), the same as `POST /call/:tool`.
 *
 * The capability identity is conveyed by the caller's `baseUrl`, not a path prefix.
 * @see ../../capability/capability-context.ts
 */
export const capContextContract = {
  method: 'POST' as const,
  path: '/context' as const,
  authType: 'secret' as const,
  bodySchema: CapabilityContextRequestSchema,
  responseSchema: CapabilityContextResponseSchema,
} as const;

export { CapabilityContextRequestSchema as CapContextRequestSchema, CapabilityContextResponseSchema as CapContextResponseSchema };
export type { CapabilityContextRequest as CapContextRequest, CapabilityContextResponse as CapContextResponse } from '../../capability/capability-context.js';
