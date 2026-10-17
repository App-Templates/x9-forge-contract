"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalMemoryDecisionContract = exports.InternalMemoryDecisionResponseSchema = exports.InternalMemoryDecisionRequestSchema = exports.INTERNAL_MEMORY_DECISIONS_PATH = void 0;
const experience_js_1 = require("../../organization/experience.cjs");
/**
 * POST /internal/memory/decisions — receipt of one authoritative decision event.
 * Direction: X9 internal (agent-core -> memory-svc)
 * Auth: internal secret (INTERNAL_SECRET_HEADER)
 *
 * Same answers as the experience ingest: 200 receipt (idempotent on equal
 * digest) or 409 `experience_conflict`. Error bodies are
 * `ExperienceErrorResponseSchema` from internal-memory-experience.
 */
exports.INTERNAL_MEMORY_DECISIONS_PATH = '/internal/memory/decisions';
exports.InternalMemoryDecisionRequestSchema = experience_js_1.AuthoritativeDecisionExperienceEventSchema;
exports.InternalMemoryDecisionResponseSchema = experience_js_1.ExperienceReceiptSchema;
exports.internalMemoryDecisionContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_DECISIONS_PATH,
    authType: 'secret',
    bodySchema: exports.InternalMemoryDecisionRequestSchema,
    responseSchema: exports.InternalMemoryDecisionResponseSchema,
};
//# sourceMappingURL=internal-memory-decisions.js.map