"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRIMARY_FORGE_PROVIDER_KEYS = exports.internalVaultResolvedContract = exports.VaultResolvedResponseSchema = exports.VaultResolvedEntrySchema = void 0;
exports.vaultResolvedPath = vaultResolvedPath;
const zod_1 = require("zod");
const index_js_1 = require("../auth/index.cjs");
const credential_key_js_1 = require("./credential-key.cjs");
const vault_tier_js_1 = require("./vault-tier.cjs");
exports.VaultResolvedEntrySchema = zod_1.z.object({
    key: credential_key_js_1.CredentialKeySchema,
    value: zod_1.z.string(),
    tier: vault_tier_js_1.VaultCascadeTierSchema,
    secret: zod_1.z.boolean(),
}).strict();
exports.VaultResolvedResponseSchema = zod_1.z.object({
    agentId: zod_1.z.number().int().positive(),
    entries: zod_1.z.array(exports.VaultResolvedEntrySchema),
}).strict();
exports.internalVaultResolvedContract = {
    method: 'GET',
    path: '/api/internal/vault/agents/:agentId/resolved',
    authType: 'token',
    authHeader: index_js_1.INTERNAL_TOKEN_HEADER,
    responseSchema: exports.VaultResolvedResponseSchema,
};
function vaultResolvedPath(vaultAgentId) {
    const agentId = exports.VaultResolvedResponseSchema.shape.agentId.parse(vaultAgentId);
    return exports.internalVaultResolvedContract.path.replace(':agentId', String(agentId));
}
/**
 * The only provider keys the primary agent reads from Forge.
 * Infrastructure credentials remain in the stack environment (R-17).
 */
exports.PRIMARY_FORGE_PROVIDER_KEYS = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'GOOGLE_API_KEY',
    'ELEVENLABS_API_KEY',
];
//# sourceMappingURL=vault-resolved.js.map