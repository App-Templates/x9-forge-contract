import { z } from 'zod';
import { EnvSchemaDocSchema } from '../../capability/env-schema.js';

/**
 * GET /env-schema — capability env schema discovery.
 * Direction: Forge factory-svc -> X9 capability services
 * Auth: None
 * Requirement: HTTP-09
 *
 * Response is the EnvSchemaDoc schema (already defined in Phase 1).
 * The capability identity is conveyed by the caller's `baseUrl`, not a path prefix.
 */

export const capEnvSchemaContract = {
  method: 'GET' as const,
  path: '/env-schema' as const,
  authType: 'none' as const,
  responseSchema: EnvSchemaDocSchema,
} as const;

export { EnvSchemaDocSchema as CapEnvSchemaResponseSchema };
export type { EnvSchemaDoc as CapEnvSchemaResponse } from '../../capability/env-schema.js';
