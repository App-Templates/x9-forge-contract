import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** BRIDGE-133: configVersion and its reader are published from ./agent in ESM and CJS (run after `pnpm build`). */
const root = new URL('../../', import.meta.url);
const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8')) as { exports: Record<string, { import: string; require: string }> };
const context = {
  agentId: 'x9', ownerId: 'owner-1', credentials: {}, llmConfig: { provider: 'openai', model: 'gpt-5' }, telegramAllowFrom: [],
  workspacePath: '/data/workspaces/x9', registryPath: '/data/agents/x9/registry.json', displayName: 'Master Chief',
};
type Agent = {
  appliedAgentConfigVersion: (ctx: { configVersion?: number }) => number | null;
  AgentContextFileSchema: { safeParse: (input: unknown) => { success: boolean } };
};

describe('1.33 configVersion published from ./agent', () => {
  it.each(['import', 'require'] as const)('%s build reads the applied version and rejects invalid ones', async (kind) => {
    const target = pkg.exports['./agent']![kind];
    const mod = (kind === 'import'
      ? await import(new URL(target, root).href)
      : createRequire(import.meta.url)(new URL(target, root).pathname)) as Agent;
    expect(mod.appliedAgentConfigVersion({ configVersion: 4 })).toBe(4);
    expect(mod.appliedAgentConfigVersion({})).toBeNull();
    expect(mod.AgentContextFileSchema.safeParse({ ...context, configVersion: 4 }).success).toBe(true);
    expect(mod.AgentContextFileSchema.safeParse({ ...context, configVersion: '4' }).success).toBe(false);
  });
});
