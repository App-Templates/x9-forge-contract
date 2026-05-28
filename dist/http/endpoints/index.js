/**
 * HTTP endpoint contracts — all 11 cross-repo endpoints typed with
 * Zod request/response schemas and auth requirements.
 *
 * @module @x9-forge/contracts/http (endpoints sub-module)
 */
// Secret-auth endpoints (Forge -> X9 agent-core /internal/*)
export * from "./internal-agents-list.js";
export * from "./internal-agents-reload.js";
export * from "./internal-agents-stop.js";
export * from "./internal-turn.js";
export * from "./internal-turn-stream.js";
export * from "./internal-query.js";
export * from "./internal-model-config.js"; // Phase 6 — MDRT-05 / D-15
export * from "./internal-model-config-version.js"; // Phase 6 — MDRT-07 polling (06-01 decision)
export * from "./internal-memory-extract.js"; // Phase 36.9 — async extraction pipeline
// Token-auth endpoints (cross-repo voice/webhook)
export * from "./webhook-post-call.js";
export * from "./voice-register.js";
export * from "./vault-resolve.js"; // Phase 38 — HTTP-12 / R-14 closure
export * from "./voice.js"; // Phase 42 — CAP-Voice v2.2 path + method constants
// No-auth endpoints (capability discovery)
export * from "./cap-manifest.js";
export * from "./cap-env-schema.js";
export * from "./cap-health.js";
// Memory v2 internal endpoints (Phase 18 D3 — R-14 closure)
export * from "./memory-correct.js"; // POST /internal/memory/correct, secret auth
export * from "./memory-console.js"; // GET /internal/memory/console/:kind, secret auth
// Inbound messaging webhooks (Phase 11.A — external_provider auth)
export * from "./webhook-inbound-telegram.js"; // POST /webhook/inbound/telegram, telegram-router-svc
export * from "./webhook-inbound-email.js"; // POST /webhook/agentmail/inbound, X9 cap-email
//# sourceMappingURL=index.js.map