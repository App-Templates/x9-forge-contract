"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentWorkspaceAttestationSchema = void 0;
const zod_1 = require("zod");
const agent_config_js_1 = require("../capability/ricerca/agent-config.cjs");
/**
 * X9 writes this only from the effective, verified workspace snapshot, never from saved desired files.
 * Forge compares it with the descriptor archived for this bundle/configVersion in workspace_context_snapshots.
 * appliedVersion is the bundle configuration snapshot version, not a single human file revision number.
 * The R7-2 loader requires descriptor.version === context.configVersion before creating the snapshot.
 * Absence supports legacy 1.38; explicit null means no loaded workspace has been attested.
 */
exports.AgentWorkspaceAttestationSchema = zod_1.z.object({
    appliedVersion: agent_config_js_1.AgentConfigVersionSchema,
    /** Lowercase SHA-256 of the verified effective bundle, never a hash of the current desired projection. */
    sha256: zod_1.z.string().regex(/^[a-f0-9]{64}$/),
    /** Time the attested snapshot was loaded, with an explicit ISO timezone. */
    loadedAt: zod_1.z.iso.datetime({ offset: true }),
}).strict();
//# sourceMappingURL=agent-workspace-attestation.js.map