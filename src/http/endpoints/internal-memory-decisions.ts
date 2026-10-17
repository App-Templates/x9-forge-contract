import type { z } from 'zod';
import {
  AuthoritativeDecisionExperienceEventSchema,
  ExperienceReceiptSchema,
} from '../../organization/experience.js';

/**
 * POST /internal/memory/decisions — receipt of one authoritative decision event.
 * Direction: X9 internal (agent-core -> memory-svc)
 * Auth: internal secret (INTERNAL_SECRET_HEADER)
 *
 * Same answers as the experience ingest: 200 receipt (idempotent on equal
 * digest) or 409 `experience_conflict`. Error bodies are
 * `ExperienceErrorResponseSchema` from internal-memory-experience.
 */

export const INTERNAL_MEMORY_DECISIONS_PATH = '/internal/memory/decisions' as const;

export const InternalMemoryDecisionRequestSchema = AuthoritativeDecisionExperienceEventSchema;
export type InternalMemoryDecisionRequest = z.infer<typeof InternalMemoryDecisionRequestSchema>;

export const InternalMemoryDecisionResponseSchema = ExperienceReceiptSchema;
export type InternalMemoryDecisionResponse = z.infer<typeof InternalMemoryDecisionResponseSchema>;

export const internalMemoryDecisionContract = {
  method: 'POST' as const,
  path: INTERNAL_MEMORY_DECISIONS_PATH,
  authType: 'secret' as const,
  bodySchema: InternalMemoryDecisionRequestSchema,
  responseSchema: InternalMemoryDecisionResponseSchema,
} as const;
