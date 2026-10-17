import { AgentWorkspaceDescriptorSchema } from './agent-workspace.js';

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).filter(([, child]) => child !== undefined)
      .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
      .map(([key, child]) => [key, canonicalValue(child)]));
  }
  return value;
}

/** Canonical UTF8 bytes of a validated descriptor, shared by snapshot writer and verifier. */
export function canonicalAgentWorkspaceBytes(input: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(canonicalValue(AgentWorkspaceDescriptorSchema.parse(input))));
}
/** Hashes metadata only; callers must separately verify the files referenced by the descriptor. */
export async function digestAgentWorkspace(input: unknown): Promise<{ appliedVersion: number; sha256: string }> {
  const workspace = AgentWorkspaceDescriptorSchema.parse(input);
  const hash = await globalThis.crypto.subtle.digest('SHA-256', new Uint8Array(canonicalAgentWorkspaceBytes(workspace)));
  return { appliedVersion: workspace.version, sha256: Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('') };
}
