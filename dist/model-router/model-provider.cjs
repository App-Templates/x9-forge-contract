"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelProviderSchema = exports.MODEL_PROVIDERS = void 0;
const zod_1 = require("zod");
/**
 * LLM provider enum — v1 supports OpenAI, Anthropic, and Google (Gemini).
 *
 * `'google'` is reserved for Gemini tier — no live consumer in Phase 35 initial
 * cut; add matching credential key to AGENT_CREDENTIAL_KEYS when consumed.
 *
 * Extending this enum is a breaking change for consumers that pattern-match.
 *
 * @status greenfield — consumers planned, no live endpoint yet
 * @see agent-x9/.planning/ROADMAP.md (Phase 35 Model Router ROUTER-01 examples)
 * @see CONTEXT D-08
 */
exports.MODEL_PROVIDERS = ['openai', 'anthropic', 'google'];
exports.ModelProviderSchema = zod_1.z.enum(exports.MODEL_PROVIDERS);
//# sourceMappingURL=model-provider.js.map