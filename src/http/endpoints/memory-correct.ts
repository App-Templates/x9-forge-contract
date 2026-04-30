/**
 * POST /internal/memory/correct — corrective action endpoint contract.
 * Direction: Forge factory-svc -> X9/memory-svc
 * Auth: X-Internal-Secret (INTERNAL_SECRET_HEADER)
 * Phase 18 D3 — Option A bridge extension.
 *
 * Security: `authType: 'secret' as const` narrows the literal type so a
 * consumer destructuring `{authType}` and pairing with the wrong header
 * (e.g. INTERNAL_TOKEN_HEADER) mismatches the literal at compile time
 * (T-18-00-03 mitigation). Const-narrowing only — no structural `satisfies`
 * check, matching repo precedent in voice-register.ts and vault-resolve.ts.
 */
import {
  MemoryCorrectiveActionRequestSchema,
  MemoryCorrectiveActionResponseSchema,
} from '../../memory/corrective-action.js';
import { MEMORY_CORRECT_PATH, MEMORY_CORRECT_METHOD } from '../../memory/paths.js';

export const memoryCorrectContract = {
  method: MEMORY_CORRECT_METHOD,
  path: MEMORY_CORRECT_PATH,
  authType: 'secret' as const,
  bodySchema: MemoryCorrectiveActionRequestSchema,
  responseSchema: MemoryCorrectiveActionResponseSchema,
} as const;
