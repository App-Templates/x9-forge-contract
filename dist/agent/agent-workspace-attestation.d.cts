import { z } from 'zod';
/**
 * X9 writes this only from the effective, verified workspace snapshot, never from saved desired files.
 * Forge compares it with the descriptor archived for this bundle/configVersion in workspace_context_snapshots.
 * appliedVersion is the bundle configuration snapshot version, not a single human file revision number.
 * The R7-2 loader requires descriptor.version === context.configVersion before creating the snapshot.
 * Absence supports legacy 1.38; explicit null means no loaded workspace has been attested.
 */
export declare const AgentWorkspaceAttestationSchema: z.ZodObject<{
    appliedVersion: z.ZodNumber;
    sha256: z.ZodString;
    loadedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type AgentWorkspaceAttestation = z.infer<typeof AgentWorkspaceAttestationSchema>;
//# sourceMappingURL=agent-workspace-attestation.d.ts.map