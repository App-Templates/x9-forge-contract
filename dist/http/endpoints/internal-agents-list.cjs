"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAgentsContract = exports.ListAgentsResponseSchema = exports.ListAgentsAgentSchema = exports.RuntimeErrorKindSchema = exports.ForgeRuntimeStatusSchema = exports.RuntimeAgentStatusSchema = void 0;
exports.getListAgentsRuntimeState = getListAgentsRuntimeState;
exports.getListAgentsCapabilities = getListAgentsCapabilities;
const zod_1 = require("zod");
const agent_inventory_metadata_js_1 = require("../../agent/agent-inventory-metadata.cjs");
const agent_workspace_attestation_js_1 = require("../../agent/agent-workspace-attestation.cjs");
const agent_runtime_identity_js_1 = require("../../agent/agent-runtime-identity.cjs");
const agent_runtime_state_js_1 = require("../../agent/agent-runtime-state.cjs");
const agent_runtime_source_js_1 = require("../../agent/agent-runtime-source.cjs");
/**
 * GET /internal/agents — list all loaded agents.
 * Direction: Forge factory-svc -> X9 agent-core
 * Auth: X-Internal-Secret
 * Requirement: HTTP-03
 *
 * Real response shape from agent-core (services/agent-core/src/index.ts:328-333):
 *   { agents: [{ agentId: string, displayName: string, ownerId: string }] }
 *
 * Consumers:
 *   - forge-v2 factory `X9Client.listAgents()` reads `data.agents.map(a => a.agentId)`
 *   - forge-v2 factory health route checks `data.agents.some(a => a.agentId === slug)`
 *
 * NOTE: This is the current shape. Does NOT yet conform to standard
 * BridgeSuccessResponse format. Standardization tracked for 04-03.
 *
 * Phase 22 (additive, MINOR): per-agent runtime status. agent-core enriches each
 * entry with `runtimeStatus` (+ `loaded`/`errorKind`/`lastError`) read live from
 * its AgentManager + BotSupervisor, so the Forge admin panel reflects the REAL
 * runtime state instead of the stale stored `agents.status`. All new fields are
 * `.optional()` — an OLD agent-core (pre-deploy) response without them still
 * validates, and a NEW Forge reading an old agent-core treats them as absent.
 *
 * Two status vocabularies (intentional, D2/D3):
 *   - `RuntimeAgentStatusSchema` — the 5 REAL wire states agent-core emits.
 *     agent-core imports THIS; it can never emit `unknown`.
 *   - `ForgeRuntimeStatusSchema` — the 5 states + `unknown`. Forge-side overlay
 *     value produced when agent-core is unreachable (never falls back to the
 *     stale stored value). Forge imports THIS.
 */
/**
 * The 5 real per-agent runtime states agent-core emits on the wire.
 * `bot-less` = agent loaded for internal-turn/proactive but with no Telegram bot
 * (empty token). Mirrors agent-core BotState + the bot-less discriminator.
 */
exports.RuntimeAgentStatusSchema = zod_1.z.enum([
    'running',
    'degraded',
    'starting',
    'stopped',
    'bot-less',
]);
/**
 * Forge-side overlay union: the 5 wire states plus `unknown`. `unknown` is
 * produced by the Forge consumer when agent-core is unreachable — it is NEVER
 * emitted by agent-core and is NOT part of the wire enum above.
 */
exports.ForgeRuntimeStatusSchema = zod_1.z.enum([
    'running',
    'degraded',
    'starting',
    'stopped',
    'bot-less',
    'unknown',
]);
/**
 * Why a `degraded` bot is in error — mirrors agent-core BotErrorKind. Nullable:
 * a healthy/non-degraded agent carries `null`.
 */
exports.RuntimeErrorKindSchema = zod_1.z
    .enum(['auth', 'poll-death', 'transient'])
    .nullable();
exports.ListAgentsAgentSchema = zod_1.z.object({
    agentId: zod_1.z.string().min(1),
    displayName: zod_1.z.string(),
    ownerId: zod_1.z.string(),
    // Phase 22 — additive-optional runtime status (agent-core enriched).
    runtimeStatus: exports.RuntimeAgentStatusSchema.optional(),
    loaded: zod_1.z.boolean().optional(),
    errorKind: exports.RuntimeErrorKindSchema.optional(),
    lastError: zod_1.z.string().nullable().optional(),
    // Canonical metadata is additive; legacy bot status is never channel evidence.
    identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.optional(),
    runtime: agent_runtime_state_js_1.AgentRuntimeSnapshotSchema.optional(),
    /** Effective snapshot only; absent is legacy, null is not attested, never desired-file fallback. */
    workspace: agent_workspace_attestation_js_1.AgentWorkspaceAttestationSchema.nullable().optional(),
    /** Registry metadata actually observed by X9 for this agent; null is unknown, [] is known empty. */
    capabilities: agent_inventory_metadata_js_1.AgentInventoryCapabilitiesSchema.nullable().optional(),
}).superRefine((agent, ctx) => {
    if (agent.identity && agent.agentId !== agent.identity.runtimeAgentId) {
        ctx.addIssue({ code: 'custom', path: ['identity', 'runtimeAgentId'], message: 'Runtime identity must match the list row agentId' });
    }
});
exports.ListAgentsResponseSchema = zod_1.z.object({
    agents: zod_1.z.array(exports.ListAgentsAgentSchema),
    source: agent_runtime_source_js_1.AgentRuntimeSourceSchema.optional(),
}).superRefine((response, ctx) => {
    // A legacy runtime ID occupies one name for collision detection only.
    // This does not supply a missing management identity to consumers.
    const identities = response.agents.map((agent) => agent.identity ?? {
        managementAgentId: agent.agentId, runtimeAgentId: agent.agentId,
    });
    const result = agent_runtime_identity_js_1.AgentRuntimeIdentitiesSchema.safeParse(identities);
    if (!result.success) {
        for (const issue of result.error.issues) {
            ctx.addIssue({ ...issue, path: ['agents', ...issue.path] });
        }
    }
});
/**
 * Resolve an exact declared management/runtime ID using current X9 evidence.
 * Missing rows, legacy bot status and unavailable sources remain unknown.
 * Invalid or ambiguous payloads throw rather than select an arbitrary agent.
 */
function getListAgentsRuntimeState(input, agentId) {
    const response = exports.ListAgentsResponseSchema.parse(input);
    if (response.source?.availability !== 'available')
        return 'unknown';
    const agent = response.agents.find((candidate) => candidate.agentId === agentId
        || candidate.identity?.managementAgentId === agentId);
    return agent?.runtime?.state ?? 'unknown';
}
/**
 * Select an exact agent's registry observation from a validated available X9 source.
 * Missing, invalid or unavailable observations remain unknown. Freshness is a consumer
 * policy using source.observedAt; this helper does not invent a maximum age or readiness.
 */
function getListAgentsCapabilities(input, agentId) {
    const response = exports.ListAgentsResponseSchema.safeParse(input);
    if (!response.success || response.data.source?.availability !== 'available')
        return null;
    const agent = response.data.agents.find((candidate) => candidate.agentId === agentId
        || candidate.identity?.managementAgentId === agentId);
    return (0, agent_inventory_metadata_js_1.agentCapabilitiesOf)(agent);
}
exports.listAgentsContract = {
    method: 'GET',
    path: '/internal/agents',
    authType: 'secret',
    responseSchema: exports.ListAgentsResponseSchema,
};
//# sourceMappingURL=internal-agents-list.js.map