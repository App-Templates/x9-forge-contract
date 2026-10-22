import { z } from 'zod';
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
export const MODEL_PROVIDERS = ['openai', 'anthropic', 'google'];
export const ModelProviderSchema = z.enum(MODEL_PROVIDERS);
//# sourceMappingURL=model-provider.js.map