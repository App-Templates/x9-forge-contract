/**
 * Canonical on-disk path derivation for X9 agents.
 *
 * WHY THIS EXISTS (Bug #15 class — 2026-06-13): the agent workspace path was
 * only DOCUMENTED in a comment ("Forge: /data/workspaces/{agentId}") but never
 * enforced. Three writers/readers derived it independently:
 *   - Forge factory `deploy.machine` wrote `/data/workspaces/{slug}` and set
 *     `context.workspacePath` to it.
 *   - X9 agent-core READ `context.workspacePath` (correct).
 *   - Parallel workspace-seeder WROTE to `/data/workspaces/owner-{id}/{slug}`
 *     — a silent DRIFT from the documented convention → the seeded workspace
 *     landed where agent-core never looked → every character agent failed to
 *     boot ("IDENTITY.md not found").
 *
 * Promoting the convention from a comment to an ENFORCED shared helper is
 * exactly what the bridge is for. Every consumer that writes or locates an
 * agent's workspace/registry MUST use these — no hand-built paths.
 *
 * `dataDir` is the X9 data root (env `X9_DATA_DIR`, default `/data`).
 */
/** Strip trailing slashes so join never produces a double slash. */
function trimTrailing(p) {
    return p.replace(/\/+$/, '');
}
/**
 * Absolute path to an agent's workspace directory.
 * Forge writes the workspace here AND sets `context.workspacePath` to it;
 * X9 agent-core reads `IDENTITY.md` (and the rest of the persona) from here;
 * any pre-seeder (Parallel workspace-seeder) MUST write to this exact path.
 *
 * @example agentWorkspacePath('/data', 'char-aurelio') // → '/data/workspaces/char-aurelio'
 */
export function agentWorkspacePath(dataDir, agentId) {
    return `${trimTrailing(dataDir)}/workspaces/${agentId}`;
}
/**
 * Absolute path to an agent's registry.json (the agent-core tool registry the
 * agent boots with). Forge writes it; `context.registryPath` points to it.
 *
 * @example agentRegistryPath('/data', 'char-aurelio') // → '/data/agents/char-aurelio/registry.json'
 */
export function agentRegistryPath(dataDir, agentId) {
    return `${trimTrailing(dataDir)}/agents/${agentId}/registry.json`;
}
/** Absolute path to an agent's context.json (sibling of registry.json). */
export function agentContextJsonPath(dataDir, agentId) {
    return `${trimTrailing(dataDir)}/agents/${agentId}/context.json`;
}
//# sourceMappingURL=agent-paths.js.map