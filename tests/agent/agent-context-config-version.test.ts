import { describe, expect, it } from 'vitest';
import {
  AgentContextFileSchema,
  AgentContextFileWriteSchema,
  AgentContextWithChannelsSchema,
  AgentContextWithChannelsWriteSchema,
  appliedAgentConfigVersion,
  parseAgentContextFile,
} from '../../src/agent/index.js';

/** BRIDGE-133: version of the whole saved agent configuration, written by Forge on Apply, read by X9. */
const context132 = {
  agentId: 'x9',
  ownerId: 'owner-1',
  tenantId: '1',
  credentials: { OPENAI_API_KEY: 'sk-test' },
  llmConfig: { provider: 'openai', model: 'gpt-5' },
  telegramAllowFrom: [],
  workspacePath: '/data/workspaces/x9',
  registryPath: '/data/agents/x9/registry.json',
  telegramBotToken: '',
  displayName: 'Master Chief',
};

const variants = [
  ['AgentContextFileSchema', AgentContextFileSchema],
  ['AgentContextFileWriteSchema', AgentContextFileWriteSchema],
  ['AgentContextWithChannelsSchema', AgentContextWithChannelsSchema],
  ['AgentContextWithChannelsWriteSchema', AgentContextWithChannelsWriteSchema],
] as const;

describe('configVersion in context.json', () => {
  it.each(variants)('%s keeps a 1.32 context valid and unchanged', (_name, schema) => {
    expect(schema.parse(context132)).toEqual(context132);
  });

  it.each(variants)('%s accepts the applied version', (_name, schema) => {
    expect(schema.parse({ ...context132, configVersion: 7 }).configVersion).toBe(7);
  });

  it.each(variants.flatMap(([name, schema]) => [0, -1, 2.5, '7', null, Number.POSITIVE_INFINITY].map((value) => [name, String(value), value, schema] as const)))(
    '%s rejects configVersion %s', (_name, _label, value, schema) => {
      expect(schema.safeParse({ ...context132, configVersion: value }).success).toBe(false);
    },
  );
});

describe('appliedAgentConfigVersion', () => {
  it('reads the validated version', () => {
    expect(appliedAgentConfigVersion(parseAgentContextFile({ ...context132, configVersion: 3 }))).toBe(3);
  });

  it('reports never applied (null) when absent, never a guessed value', () => {
    expect(appliedAgentConfigVersion(parseAgentContextFile(context132))).toBeNull();
  });
});
