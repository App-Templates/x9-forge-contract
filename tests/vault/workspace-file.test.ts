import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WorkspaceFileSchema } from '../../src/vault/workspace-file.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const loadFixture = (name: string): Record<string, unknown> =>
  JSON.parse(readFileSync(join(__dirname, 'fixtures', name), 'utf8')) as Record<
    string,
    unknown
  >;

describe('WorkspaceFileSchema', () => {
  it('parses platform fixture with content=null and agentId=null', () => {
    const parsed = WorkspaceFileSchema.parse(loadFixture('workspace-file-platform.json'));
    expect(parsed.content).toBeNull();
    expect(parsed.agentId).toBeNull();
    expect(parsed.tier).toBe('platform');
  });

  it('parses agent fixture with isCustomized=true', () => {
    const parsed = WorkspaceFileSchema.parse(loadFixture('workspace-file-agent.json'));
    expect(parsed.isCustomized).toBe(true);
    expect(parsed.agentId).toBe(42);
    expect(parsed.content).toBe('# Custom agent override');
  });

  it('rejects unknown tier', () => {
    const fx = loadFixture('workspace-file-platform.json');
    expect(
      WorkspaceFileSchema.safeParse({ ...fx, tier: 'tenant' }).success,
    ).toBe(false);
  });

  it('rejects non-datetime updatedAt', () => {
    const fx = loadFixture('workspace-file-agent.json');
    expect(
      WorkspaceFileSchema.safeParse({ ...fx, updatedAt: 'not-a-date' }).success,
    ).toBe(false);
  });
});
