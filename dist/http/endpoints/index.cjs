"use strict";
/**
 * HTTP endpoint contracts — all 11 cross-repo endpoints typed with
 * Zod request/response schemas and auth requirements.
 *
 * @module @x9-forge/contracts/http (endpoints sub-module)
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Secret-auth endpoints (Forge -> X9 agent-core /internal/*)
__exportStar(require("./internal-agents-list.cjs"), exports);
__exportStar(require("./internal-agents-reload.cjs"), exports);
__exportStar(require("./internal-agents-stop.cjs"), exports);
__exportStar(require("./internal-run-stop.cjs"), exports);
__exportStar(require("./internal-run-native-stop.cjs"), exports);
__exportStar(require("./internal-publication.cjs"), exports);
__exportStar(require("./internal-participant-binding.cjs"), exports); // POST /internal/participant-binding/{apply,read,list,withdraw,resolve}, secret auth
__exportStar(require("./internal-publication-read.cjs"), exports);
__exportStar(require("./internal-agents-management.cjs"), exports); // v1.31.0 — R1b commands + management state
__exportStar(require("./internal-turn.cjs"), exports);
__exportStar(require("./internal-turn-stream.cjs"), exports);
__exportStar(require("./internal-agent-turn.cjs"), exports); // v1.22.0 — EA M0 per-agent turn
__exportStar(require("./internal-agent-turn-jobs.cjs"), exports);
__exportStar(require("./internal-query.cjs"), exports);
__exportStar(require("./internal-model-config.cjs"), exports); // Phase 6 — MDRT-05 / D-15
__exportStar(require("./internal-model-config-version.cjs"), exports); // Phase 6 — MDRT-07 polling (06-01 decision)
__exportStar(require("./internal-memory-extract.cjs"), exports); // Phase 36.9 — async extraction pipeline
__exportStar(require("./internal-capability-agent.cjs"), exports); // v1.28.0 — Phase 54 per-agent capability routes (cap-ricerca / cap-lab)
__exportStar(require("./internal-capability-elevenlabs.cjs"), exports); // v1.31.0 — R6 cap-agent-elevenlabs provisioning + channel state
__exportStar(require("./internal-capability-coach.cjs"), exports); // v1.31.0 — R6 cap-coach programs, sessions, person snapshot
__exportStar(require("./internal-capability-dev.cjs"), exports); // P04-d — cap-dev get/put config and get state
__exportStar(require("./internal-dev-progress.cjs"), exports);
__exportStar(require("./internal-dev-jobs.cjs"), exports);
__exportStar(require("./internal-dev-cancel.cjs"), exports);
__exportStar(require("./internal-dev-production.cjs"), exports);
__exportStar(require("./internal-capability-lab.cjs"), exports);
__exportStar(require("./internal-rd-observations.cjs"), exports);
// Token-auth endpoints (cross-repo voice/webhook)
__exportStar(require("./webhook-post-call.cjs"), exports);
__exportStar(require("./voice-register.cjs"), exports);
__exportStar(require("./vault-resolve.cjs"), exports); // Phase 38 — HTTP-12 / R-14 closure
__exportStar(require("./capability-call-context.cjs"), exports); // v1.31.0 — R3 per-call capability context
__exportStar(require("./voice.cjs"), exports); // Phase 42 — CAP-Voice v2.2 path + method constants
__exportStar(require("./voice-live.cjs"), exports); // Phase 50 — cap-voice-live (Telnyx ⇄ GPT-Live) paths
__exportStar(require("./internal-factory-deploy.cjs"), exports); // Wave 2 (v1.11.0) — Parallel S2S agent deploy
__exportStar(require("./internal-business-unit-lead.cjs"), exports); // AZB-04 — Director S2S business unit lead birth
__exportStar(require("./internal-business-unit-membership.cjs"), exports); // PBB-01 — lettura dell'appartenenza capo/BU
__exportStar(require("./internal-company-rd.cjs"), exports); // P1L-05 — Director S2S company R&D (Ricerca + Lab) birth
__exportStar(require("./internal-factory-telegram-token.cjs"), exports); // Phase 21 (v1.16.0) — TOKROT-01 token rotate S2S
// No-auth endpoints (capability discovery)
__exportStar(require("./cap-manifest.cjs"), exports);
__exportStar(require("./cap-context.cjs"), exports);
__exportStar(require("./cap-env-schema.cjs"), exports);
__exportStar(require("./cap-health.cjs"), exports);
// Memory v2 internal endpoints (Phase 18 D3 — R-14 closure)
__exportStar(require("./memory-correct.cjs"), exports); // POST /internal/memory/correct, secret auth
__exportStar(require("./memory-console.cjs"), exports); // GET /internal/memory/console/:kind, secret auth
__exportStar(require("./internal-memory-recall-bundle.cjs"), exports); // POST /internal/memory/recall/bundle, secret auth (v1.11.2)
// Inbound messaging webhooks (Phase 11.A — external_provider auth)
__exportStar(require("./webhook-inbound-telegram.cjs"), exports); // POST /webhook/inbound/telegram, telegram-router-svc
__exportStar(require("./webhook-inbound-email.cjs"), exports); // POST /webhook/agentmail/inbound, X9 cap-email
__exportStar(require("./cap-turn-lead.cjs"), exports);
__exportStar(require("./internal-factory-creation.cjs"), exports); // R2 opt-in replayable deploy, legacy contract unchanged.
__exportStar(require("./internal-channel-attestation.cjs"), exports);
__exportStar(require("./internal-agent-creation-by-email.cjs"), exports);
__exportStar(require("./voice-catalog.cjs"), exports);
__exportStar(require("./internal-agent-model-catalog.cjs"), exports);
__exportStar(require("./internal-models-batch.cjs"), exports);
__exportStar(require("./forge-models.cjs"), exports);
__exportStar(require("./internal-agent-channel-access.cjs"), exports);
__exportStar(require("./forge-agent-channel-access.cjs"), exports);
// C2 phone door boundaries; provider webhooks and voice writers stay separate.
__exportStar(require("./internal-agent-phone-channel.cjs"), exports);
__exportStar(require("./forge-agent-phone-channel.cjs"), exports);
__exportStar(require("./internal-capability-elevenlabs-web.cjs"), exports);
__exportStar(require("./capability-elevenlabs-web-context.cjs"), exports);
// C5 existing-agent resource operations, browser session only.
__exportStar(require("./forge-agent-channel-resource.cjs"), exports);
// C5 permanent single-agent deletion, separate from lifecycle and archival.
__exportStar(require("./internal-agents-deletion.cjs"), exports);
__exportStar(require("./internal-agent-channel-history.cjs"), exports);
__exportStar(require("./forge-agent-channel-history.cjs"), exports);
__exportStar(require("./internal-agent-tool-dispatch.cjs"), exports);
__exportStar(require("./internal-agent-voice-source.cjs"), exports);
__exportStar(require("./internal-agent-model-source-observation.cjs"), exports);
__exportStar(require("./forge-master-model-authority.cjs"), exports);
__exportStar(require("./internal-models-apply.cjs"), exports);
__exportStar(require("./internal-vault-connection.cjs"), exports);
// F1B-04 — porta Vault delle chiavi agente
__exportStar(require("./internal-vault-agent-credentials.cjs"), exports);
__exportStar(require("./internal-connect.cjs"), exports);
__exportStar(require("./internal-development-sessions.cjs"), exports);
__exportStar(require("./connection-card.cjs"), exports);
__exportStar(require("./web-connection-cards.cjs"), exports);
__exportStar(require("./internal-memory-experience.cjs"), exports);
__exportStar(require("./internal-memory-decisions.cjs"), exports);
__exportStar(require("./internal-memory-decision-requests.cjs"), exports);
__exportStar(require("./internal-paperclip-seats.cjs"), exports);
__exportStar(require("./internal-paperclip-rd-enrollment.cjs"), exports); // ROPB-02 — iscrizione Paperclip di Ricerca e Lab
__exportStar(require("./internal-memory-assets.cjs"), exports);
// F1B-03 — mappa dell'azienda cliente nella memoria A
__exportStar(require("./internal-memory-company-map.cjs"), exports);
__exportStar(require("./internal-memory-company-content.cjs"), exports);
__exportStar(require("./internal-memory-action-plans.cjs"), exports);
__exportStar(require("./internal-company-spend.cjs"), exports);
// F3X-03 — riconciliazione minima delle fonti del mandato nella memoria A
__exportStar(require("./internal-memory-mandate-reconcile.cjs"), exports);
__exportStar(require("./internal-memory-mandate-observations.cjs"), exports);
__exportStar(require("./internal-memory-vertical-plan-observations.cjs"), exports);
__exportStar(require("./internal-memory-knowledge.cjs"), exports);
__exportStar(require("./connect-public.cjs"), exports);
__exportStar(require("./internal-connection-completed.cjs"), exports);
__exportStar(require("./internal-agents-ordinary-authority.cjs"), exports);
__exportStar(require("./forge-elevenlabs-web.cjs"), exports);
__exportStar(require("./internal-agent-address-book.cjs"), exports);
__exportStar(require("./native-binding-read.cjs"), exports);
__exportStar(require("./coach-person-program-read.cjs"), exports);
__exportStar(require("./coach-browser.cjs"), exports);
__exportStar(require("./development-session-models.cjs"), exports);
__exportStar(require("./internal-development-session-list.cjs"), exports);
__exportStar(require("./development-session-heartbeat.cjs"), exports);
__exportStar(require("./internal-dev-artifact-content.cjs"), exports);
__exportStar(require("./internal-dev-session-asset-content.cjs"), exports);
//# sourceMappingURL=index.js.map