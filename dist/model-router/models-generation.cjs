"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelsEtagIdentitySchema = exports.ModelsGenerationSchema = exports.ModelsModeSchema = void 0;
exports.compareModelsGeneration = compareModelsGeneration;
exports.modelsEtag = modelsEtag;
exports.parseModelsEtag = parseModelsEtag;
const node_crypto_1 = require("node:crypto");
const zod_1 = require("zod");
const agent_identity_js_1 = require("../agent/agent-identity.cjs");
exports.ModelsModeSchema = zod_1.z.enum(['v1', 'v2']);
/**
 * Order of the effective-models copies of one agent. `presetId: null` = no preset yet (then `presetGeneration` is 0).
 * Two `presetGeneration` counters of different presets are never compared: see `compareModelsGeneration`.
 */
exports.ModelsGenerationSchema = zod_1.z.object({
    presetId: zod_1.z.number().int().positive().nullable(),
    agentGeneration: zod_1.z.number().int().nonnegative(),
    presetGeneration: zod_1.z.number().int().nonnegative(),
}).strict().refine(({ presetId, presetGeneration }) => presetId !== null || presetGeneration === 0, {
    path: ['presetGeneration'],
    message: 'presetGeneration must be 0 while the agent has no preset',
});
/**
 * How `next` (just received) relates to `current` (held). The receiver accepts only `newer`;
 * `same` = nothing to do, `older` = discard, `incomparable` = re-read from the vault.
 */
function compareModelsGeneration(next, current) {
    const agent = Math.sign(next.agentGeneration - current.agentGeneration);
    if (next.presetId !== current.presetId) {
        // Attaching another preset raises the agent counter, which alone decides.
        return agent > 0 ? 'newer' : agent < 0 ? 'older' : 'incomparable';
    }
    const preset = Math.sign(next.presetGeneration - current.presetGeneration);
    if (agent === 0 && preset === 0)
        return 'same';
    if (agent >= 0 && preset >= 0)
        return 'newer';
    if (agent <= 0 && preset <= 0)
        return 'older';
    return 'incomparable';
}
exports.ModelsEtagIdentitySchema = zod_1.z.object({
    managementAgentId: agent_identity_js_1.AgentIdSchema,
    runtimeAgentId: agent_identity_js_1.AgentIdSchema,
    vaultAgentId: zod_1.z.number().int().positive(),
}).strict();
/** `m2-<mode>-<vaultAgentId>-<presetId>-<agentGeneration>-<presetGeneration>-<hash>` (no HTTP quotes); `presetId` null prints `null`. */
function modelsEtag(input) {
    const mode = exports.ModelsModeSchema.parse(input.mode);
    const identity = exports.ModelsEtagIdentitySchema.parse(input.identity);
    const generation = exports.ModelsGenerationSchema.parse(input.generation);
    // Fixed key order: the hash does not depend on how the caller built the objects.
    const canonical = JSON.stringify({
        mode,
        managementAgentId: identity.managementAgentId,
        runtimeAgentId: identity.runtimeAgentId,
        vaultAgentId: identity.vaultAgentId,
        presetId: generation.presetId,
        agentGeneration: generation.agentGeneration,
        presetGeneration: generation.presetGeneration,
    });
    const hash = (0, node_crypto_1.createHash)('sha256').update(canonical).digest('hex').slice(0, 16);
    return `m2-${mode}-${identity.vaultAgentId}-${generation.presetId ?? 'null'}-${generation.agentGeneration}-${generation.presetGeneration}-${hash}`;
}
const ETAG_PATTERN = /^m2-(v1|v2)-(\d+)-(null|\d+)-(\d+)-(\d+)-([0-9a-f]{16})$/;
/** The fields readable from an ETag (the hash cannot be re-checked without the identity); `null` if it is not ours. */
function parseModelsEtag(value) {
    if (typeof value !== 'string')
        return null;
    const match = ETAG_PATTERN.exec(value);
    if (match === null)
        return null;
    const parsed = exports.ModelsGenerationSchema.safeParse({
        presetId: match[3] === 'null' ? null : Number(match[3]),
        agentGeneration: Number(match[4]),
        presetGeneration: Number(match[5]),
    });
    const vaultAgentId = Number(match[2]);
    if (!parsed.success || !Number.isSafeInteger(vaultAgentId) || vaultAgentId < 1)
        return null;
    return { mode: match[1], vaultAgentId, generation: parsed.data };
}
//# sourceMappingURL=models-generation.js.map