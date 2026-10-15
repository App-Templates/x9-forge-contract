import { AuthoritativeDecisionExperienceEventSchema, ExperienceReceiptSchema, } from "../../organization/experience.js";
/**
 * POST /internal/memory/decisions — receipt of one authoritative decision event.
 * Direction: X9 internal (agent-core -> memory-svc)
 * Auth: internal secret (INTERNAL_SECRET_HEADER)
 *
 * Same answers as the experience ingest: 200 receipt (idempotent on equal
 * digest) or 409 `experience_conflict`. Error bodies are
 * `ExperienceErrorResponseSchema` from internal-memory-experience.
 */
export const INTERNAL_MEMORY_DECISIONS_PATH = '/internal/memory/decisions';
export const InternalMemoryDecisionRequestSchema = AuthoritativeDecisionExperienceEventSchema;
export const InternalMemoryDecisionResponseSchema = ExperienceReceiptSchema;
export const internalMemoryDecisionContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_DECISIONS_PATH,
    authType: 'secret',
    bodySchema: InternalMemoryDecisionRequestSchema,
    responseSchema: InternalMemoryDecisionResponseSchema,
};
//# sourceMappingURL=internal-memory-decisions.js.map