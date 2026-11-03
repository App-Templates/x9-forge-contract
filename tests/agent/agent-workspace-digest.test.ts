import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { canonicalAgentWorkspaceBytes, digestAgentWorkspace } from '../../src/agent/agent-workspace-digest.js';

import { workspace } from './ordinary-workspace-fixture.js';

function reverseKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(reverseKeys);
  if (value !== null && typeof value === 'object') return Object.fromEntries(Object.entries(value).reverse().map(([key, child]) => [key, reverseKeys(child)]));
  return value;
}
describe('canonical workspace digest', () => {
  it('produces identical bytes independent of object insertion order', () => {
    expect(canonicalAgentWorkspaceBytes(workspace())).toEqual(canonicalAgentWorkspaceBytes(reverseKeys(workspace())));
    expect(new TextDecoder().decode(canonicalAgentWorkspaceBytes(workspace()))).toMatch(/^\{"agentId":"agent-1","files":/);
  });
  it('matches SHA256 of canonical UTF8 bytes on the shared WebCrypto implementation', async () => {
    const expected = createHash('sha256').update(canonicalAgentWorkspaceBytes(workspace())).digest('hex');
    expect(await digestAgentWorkspace(workspace())).toEqual({ appliedVersion: 7, sha256: expected });
  });
  it('binds tenant, owner, runtime identity and bundle content', async () => {
    const before = await digestAgentWorkspace(workspace());
    for (const field of ['tenantId', 'ownerId', 'agentId'] as const) {
      const changed = workspace(); changed[field] += '-other';
      expect((await digestAgentWorkspace(changed)).sha256).not.toBe(before.sha256);
    }
    const changed = workspace(); changed.files[0]!.history[0]!.hash = 'b'.repeat(64);
    expect((await digestAgentWorkspace(changed)).sha256).not.toBe(before.sha256);
  });
  it('rejects invalid descriptors before hashing and does not mutate its input', async () => {
    const input = workspace(); const before = structuredClone(input);
    await digestAgentWorkspace(input); expect(input).toEqual(before);
    await expect(digestAgentWorkspace({ ...input, version: 0 })).rejects.toThrow();
    expect(() => canonicalAgentWorkspaceBytes({ ...input, credentials: {} })).toThrow();
  });
});
