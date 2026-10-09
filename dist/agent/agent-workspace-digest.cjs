"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canonicalAgentWorkspaceBytes = canonicalAgentWorkspaceBytes;
exports.digestAgentWorkspace = digestAgentWorkspace;
const agent_workspace_js_1 = require("./agent-workspace.cjs");
function canonicalValue(value) {
    if (Array.isArray(value))
        return value.map(canonicalValue);
    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).filter(([, child]) => child !== undefined)
            .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
            .map(([key, child]) => [key, canonicalValue(child)]));
    }
    return value;
}
/** Canonical UTF8 bytes of a validated descriptor, shared by snapshot writer and verifier. */
function canonicalAgentWorkspaceBytes(input) {
    return new TextEncoder().encode(JSON.stringify(canonicalValue(agent_workspace_js_1.AgentWorkspaceDescriptorSchema.parse(input))));
}
/** Hashes metadata only; callers must separately verify the files referenced by the descriptor. */
async function digestAgentWorkspace(input) {
    const workspace = agent_workspace_js_1.AgentWorkspaceDescriptorSchema.parse(input);
    const hash = await globalThis.crypto.subtle.digest('SHA-256', new Uint8Array(canonicalAgentWorkspaceBytes(workspace)));
    return { appliedVersion: workspace.version, sha256: Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('') };
}
//# sourceMappingURL=agent-workspace-digest.js.map