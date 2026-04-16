/**
 * HTTP endpoint contracts — all 11 cross-repo endpoints typed with
 * Zod request/response schemas and auth requirements.
 *
 * @module @x9-forge/contracts/http (endpoints sub-module)
 */

// Secret-auth endpoints (Forge -> X9 agent-core /internal/*)
export * from './internal-agents-list.js';
export * from './internal-agents-reload.js';
export * from './internal-agents-stop.js';
export * from './internal-turn.js';
export * from './internal-turn-stream.js';
export * from './internal-query.js';
export * from './internal-model-config.js'; // Phase 6 — MDRT-05 / D-15
export * from './internal-model-config-version.js'; // Phase 6 — MDRT-07 polling (06-01 decision)

// Token-auth endpoints (cross-repo voice/webhook)
export * from './webhook-post-call.js';
export * from './voice-register.js';

// No-auth endpoints (capability discovery)
export * from './cap-manifest.js';
export * from './cap-env-schema.js';
export * from './cap-health.js';
