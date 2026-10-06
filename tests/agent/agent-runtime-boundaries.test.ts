import { describe, expect, it } from 'vitest';
import { AgentRuntimeChannelSchema, AgentRuntimeEvidenceSchema, AgentRuntimeStateSchema } from '../../src/agent/index.js';

const channel = { channelId: 'email', kind: 'email', state: 'error', loaded: false, readiness: 'unknown' };
const evidence = { loadState: 'unknown', channelsComplete: false, channels: [] };

describe('canonical runtime input boundaries', () => {
  it.each(['channelId', 'kind', 'state', 'loaded', 'readiness'])(
    'requires channel %s without a default', (key) => {
      const input: Record<string, unknown> = { ...channel };
      delete input[key];
      expect(AgentRuntimeChannelSchema.safeParse(input).success).toBe(false);
    },
  );

  it.each([
    ['channelId', ''], ['kind', 'carrier-pigeon'], ['state', 'active'],
    ['loaded', 'false'], ['readiness', 'healthy'],
  ])('rejects invalid channel %s', (key, value) => {
    expect(AgentRuntimeChannelSchema.safeParse({ ...channel, [key as string]: value }).success).toBe(false);
  });

  it.each(['loadState', 'channelsComplete', 'channels'])(
    'requires agent evidence %s without inferring absence', (key) => {
      const input: Record<string, unknown> = { ...evidence };
      delete input[key];
      expect(AgentRuntimeEvidenceSchema.safeParse(input).success).toBe(false);
    },
  );

  it.each([
    ['loadState', 'paused'], ['channelsComplete', 'false'], ['channels', {}],
  ])('rejects invalid agent evidence %s', (key, value) => {
    expect(AgentRuntimeEvidenceSchema.safeParse({ ...evidence, [key as string]: value }).success).toBe(false);
  });

  it('keeps paused a channel state rather than a sixth agent state', () => {
    expect(AgentRuntimeStateSchema.safeParse('paused').success).toBe(false);
  });
});
