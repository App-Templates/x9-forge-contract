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
export * from "./internal-agents-management.js"; // v1.31.0 — R1b commands + management state
export * from "./internal-turn.js";
export * from "./internal-turn-stream.js";
export * from "./internal-agent-turn.js"; // v1.22.0 — EA M0 per-agent turn
export * from "./internal-query.js";
export * from "./internal-model-config.js"; // Phase 6 — MDRT-05 / D-15
export * from "./internal-model-config-version.js"; // Phase 6 — MDRT-07 polling (06-01 decision)
export * from "./internal-memory-extract.js"; // Phase 36.9 — async extraction pipeline
export * from "./internal-capability-agent.js"; // v1.28.0 — Phase 54 per-agent capability routes (cap-ricerca / cap-lab)
export * from "./internal-capability-elevenlabs.js"; // v1.31.0 — R6 cap-agent-elevenlabs provisioning + channel state
export * from "./internal-capability-coach.js"; // v1.31.0 — R6 cap-coach programs, sessions, person snapshot
// Token-auth endpoints (cross-repo voice/webhook)
export * from "./webhook-post-call.js";
export * from "./voice-register.js";
export * from "./vault-resolve.js"; // Phase 38 — HTTP-12 / R-14 closure
export * from "./capability-call-context.js"; // v1.31.0 — R3 per-call capability context
export * from "./voice.js"; // Phase 42 — CAP-Voice v2.2 path + method constants
export * from "./voice-live.js"; // Phase 50 — cap-voice-live (Telnyx ⇄ GPT-Live) paths
export * from "./internal-factory-deploy.js"; // Wave 2 (v1.11.0) — Parallel S2S agent deploy
export * from "./internal-factory-telegram-token.js"; // Phase 21 (v1.16.0) — TOKROT-01 token rotate S2S
// No-auth endpoints (capability discovery)
export * from "./cap-manifest.js";
export * from "./cap-context.js";
export * from "./cap-env-schema.js";
export * from "./cap-health.js";
// Memory v2 internal endpoints (Phase 18 D3 — R-14 closure)
export * from "./memory-correct.js"; // POST /internal/memory/correct, secret auth
export * from "./memory-console.js"; // GET /internal/memory/console/:kind, secret auth
export * from "./internal-memory-recall-bundle.js"; // POST /internal/memory/recall/bundle, secret auth (v1.11.2)
// Inbound messaging webhooks (Phase 11.A — external_provider auth)
export * from "./webhook-inbound-telegram.js"; // POST /webhook/inbound/telegram, telegram-router-svc
export * from "./webhook-inbound-email.js"; // POST /webhook/agentmail/inbound, X9 cap-email
export * from "./cap-turn-lead.js";
export * from "./internal-factory-creation.js"; // R2 opt-in replayable deploy, legacy contract unchanged.
export * from "./internal-channel-attestation.js";
export * from "./voice-catalog.js";
export * from "./internal-agent-model-catalog.js";
export * from "./internal-models-batch.js";
export * from "./forge-models.js";
export * from "./internal-agent-channel-access.js";
export * from "./forge-agent-channel-access.js";
// C2 phone door boundaries; provider webhooks and voice writers stay separate.
export * from "./internal-agent-phone-channel.js";
export * from "./forge-agent-phone-channel.js";
export * from "./internal-capability-elevenlabs-web.js";
export * from "./capability-elevenlabs-web-context.js";
// C5 existing-agent resource operations, browser session only.
export * from "./forge-agent-channel-resource.js";
// C5 permanent single-agent deletion, separate from lifecycle and archival.
export * from "./internal-agents-deletion.js";
export * from "./internal-agent-channel-history.js";
export * from "./forge-agent-channel-history.js";
export * from "./internal-agent-tool-dispatch.js";
export * from "./internal-agent-model-source-observation.js";
export * from "./internal-agents-ordinary-authority.js";
//# sourceMappingURL=index.js.map