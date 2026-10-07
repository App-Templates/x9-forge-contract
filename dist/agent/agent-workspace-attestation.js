import { z } from 'zod';
import { AgentConfigVersionSchema } from "../capability/ricerca/agent-config.js";
/**
 * X9 writes this only from the effective, verified workspace snapshot, never from saved desired files.
 * Forge compares it with the descriptor archived for this bundle/configVersion in workspace_context_snapshots.
 * appliedVersion is the bundle configuration snapshot version, not a single human file revision number.
 * The R7-2 loader requires descriptor.version === context.configVersion before creating the snapshot.
 * Absence supports legacy 1.38; explicit null means no loaded workspace has been attested.
 */
export const AgentWorkspaceAttestationSchema = z.object({
    appliedVersion: AgentConfigVersionSchema,
    /** Lowercase SHA-256 of the verified effective bundle, never a hash of the current desired projection. */
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    /** Time the attested snapshot was loaded, with an explicit ISO timezone. */
    loadedAt: z.iso.datetime({ offset: true }),
}).strict();
//# sourceMappingURL=agent-workspace-attestation.js.map