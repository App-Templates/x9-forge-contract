/** Canonical UTF8 bytes of a validated descriptor, shared by snapshot writer and verifier. */
export declare function canonicalAgentWorkspaceBytes(input: unknown): Uint8Array;
/** Hashes metadata only; callers must separately verify the files referenced by the descriptor. */
export declare function digestAgentWorkspace(input: unknown): Promise<{
    appliedVersion: number;
    sha256: string;
}>;
//# sourceMappingURL=agent-workspace-digest.d.ts.map