import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { internalFactoryDeployContract, InternalFactoryDeployRequestSchema, internalFactoryReplayableDeployContract } from '../../src/http/index.js';
import { AgentContextFileSchema, AgentCreationRequestSchema } from '../../src/agent/index.js';
import { context, request } from '../agent/r2-fixtures.js';
describe('R2 preserves 1.30 contracts and publishes opt-in contracts', () => {
  it('keeps legacy deploy payload and route unchanged', () => {
    const legacy = { name: 'Legacy', ownerId: 1, email_enabled: false, telegram_enabled: false };
    expect(InternalFactoryDeployRequestSchema.parse(legacy)).toEqual({ ...legacy, selectedCapabilities: [], telegram_allow_from: [] });
    expect(internalFactoryReplayableDeployContract.path).toBe(internalFactoryDeployContract.path);
    expect(internalFactoryReplayableDeployContract.authType).toBe(internalFactoryDeployContract.authType);
    expect(internalFactoryReplayableDeployContract.bodySchema).toBe(AgentCreationRequestSchema);
    expect(internalFactoryReplayableDeployContract.bodySchema.parse(request)).toEqual(request);
    expect(AgentContextFileSchema.parse(context)).toEqual(context);
  });
  const root = new URL('../../', import.meta.url);
  const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8')) as { exports: Record<string, { import: string; require: string }> };
  for (const [path, symbols] of Object.entries({
    './agent': ['AgentChannelConfigurationSchema', 'AgentOwnedChannelResourceSchema', 'AgentContextWithChannelsSchema', 'AgentContextWithChannelsWriteSchema', 'AgentCreationRequestSchema', 'AgentCreationCheckpointSchema', 'creationReplay', 'shouldLoadAgentChannel', 'channelFailure'],
    './http': ['internalFactoryReplayableDeployContract'],
  })) {
    it(`publishes ${symbols.length} new symbols from ${path} in ESM and CJS`, async () => {
      const target = pkg.exports[path]!;
      const esm = await import(new URL(target.import, root).href) as Record<string, unknown>;
      const cjs = createRequire(import.meta.url)(new URL(target.require, root).pathname) as Record<string, unknown>;
      expect(symbols.filter((name) => !(name in esm))).toEqual([]);
      expect(symbols.filter((name) => !(name in cjs))).toEqual([]);
    });
  }
});
