import { describe, it, expect } from 'vitest';
import {
  agentWorkspacePath,
  agentRegistryPath,
  agentContextJsonPath,
} from '../../src/agent/agent-paths.js';

describe('agent path helpers (Bug #15 path-drift fix)', () => {
  it('agentWorkspacePath derives the canonical /data/workspaces/<id>', () => {
    expect(agentWorkspacePath('/data', 'char-aurelio')).toBe('/data/workspaces/char-aurelio');
  });

  it('agentRegistryPath derives /data/agents/<id>/registry.json', () => {
    expect(agentRegistryPath('/data', 'char-aurelio')).toBe(
      '/data/agents/char-aurelio/registry.json',
    );
  });

  it('agentContextJsonPath derives /data/agents/<id>/context.json', () => {
    expect(agentContextJsonPath('/data', 'char-aurelio')).toBe(
      '/data/agents/char-aurelio/context.json',
    );
  });

  it('tolerates a dataDir with a trailing slash (no double slash)', () => {
    expect(agentWorkspacePath('/data/', 'x9')).toBe('/data/workspaces/x9');
    expect(agentRegistryPath('/data//', 'x9')).toBe('/data/agents/x9/registry.json');
  });

  it('honors a non-default data root (env X9_DATA_DIR override)', () => {
    expect(agentWorkspacePath('/opt/x9/data', 'a')).toBe('/opt/x9/data/workspaces/a');
  });

  it('factory writer and a pre-seeder agree on the path for the same (dataDir, id)', () => {
    // The whole point: two independent consumers can never disagree.
    const factory = agentWorkspacePath('/data', 'char-aurelio');
    const seeder = agentWorkspacePath('/data', 'char-aurelio');
    expect(factory).toBe(seeder);
    expect(factory).not.toContain('owner-'); // the old seeder drift
  });
});
