import { describe, expect, it } from 'vitest';
import * as agent from '../../src/agent/index.js';

const channel = (overrides: Record<string, unknown> = {}) => ({
  channelId: 'web-coach', kind: 'web', state: 'loaded', loaded: true,
  readiness: 'ready', ...overrides,
});
const snapshot = (overrides: Record<string, unknown> = {}) => ({
  state: 'active', loadState: 'loaded', channelsComplete: true,
  channels: [channel()], ...overrides,
});

function expectState(input: Record<string, unknown>, state: string) {
  const parsed = agent.AgentRuntimeSnapshotSchema.parse({ ...input, state });
  expect(parsed.state).toBe(state);
  expect(agent.deriveAgentRuntimeState(parsed)).toBe(state);
}

describe('channel loading, pause and readiness', () => {
  it.each(['telegram', 'email', 'voice', 'whatsapp', 'web'])(
    'accepts the shared or additive %s channel kind', (kind) => {
      expect(agent.AgentRuntimeChannelSchema.parse(channel({ kind })).kind).toBe(kind);
    },
  );

  it('keeps readiness distinct when a loaded channel is not ready', () => {
    expectState(snapshot({ channels: [channel({ readiness: 'not-ready' })] }), 'active');
  });

  it('accepts an intentionally paused channel without calling it an error', () => {
    const paused = channel({ state: 'paused', loaded: false, readiness: 'ready' });
    expect(agent.AgentRuntimeChannelSchema.parse(paused)).toEqual(paused);
    expectState(snapshot({ channels: [paused] }), 'no-channel');
  });

  it('does not turn readiness into proof of channel loading', () => {
    expectState(snapshot({ channels: [channel({ state: 'unknown', loaded: null, readiness: 'ready' })] }), 'unknown');
  });

  it.each([
    { state: 'loaded', loaded: false },
    { state: 'loaded', loaded: null },
    { state: 'paused', loaded: true },
    { state: 'stopped', loaded: true },
    { state: 'unknown', loaded: false },
  ])('rejects contradictory channel observations %j', (observation) => {
    expect(agent.AgentRuntimeChannelSchema.safeParse(channel(observation)).success).toBe(false);
  });

  it('rejects missing loading evidence instead of defaulting to false', () => {
    const { loaded: _loaded, ...withoutLoaded } = channel();
    expect(agent.AgentRuntimeChannelSchema.safeParse(withoutLoaded).success).toBe(false);
  });

  it('rejects an unknown readiness value', () => {
    expect(agent.AgentRuntimeChannelSchema.safeParse(channel({ readiness: 'healthy' })).success).toBe(false);
  });
});

describe('canonical agent state from X9 runtime evidence', () => {
  it('marks an externally loaded web channel active even outside the agent loader', () => {
    expectState(snapshot({ loadState: 'unknown' }), 'active');
  });

  it('accepts positive loading evidence from a partial channel inventory', () => {
    expectState(snapshot({ channelsComplete: false }), 'active');
  });

  it('does not claim no-channel from an incomplete empty inventory', () => {
    expectState(snapshot({ channels: [], channelsComplete: false }), 'unknown');
  });

  it('does not claim no-channel from unknown agent loading', () => {
    expectState(snapshot({ loadState: 'unknown', channels: [] }), 'unknown');
  });

  it('marks complete empty channels on a loaded agent no-channel', () => {
    expectState(snapshot({ channels: [] }), 'no-channel');
  });

  it('keeps explicit stopped evidence distinct from an absent agent', () => {
    expectState(snapshot({ loadState: 'stopped', channels: [], channelsComplete: false }), 'stopped');
  });

  it('preserves an explicit agent loading error', () => {
    expectState(snapshot({ loadState: 'error', channels: [] }), 'error');
  });

  it('preserves a channel error when no loaded channel is demonstrated', () => {
    expectState(snapshot({ channels: [channel({ state: 'error', loaded: false, readiness: 'not-ready' })] }), 'error');
  });

  it('retains channel errors without hiding another positively loaded channel', () => {
    expectState(snapshot({ channels: [channel(), channel({ channelId: 'email', kind: 'email', state: 'error', loaded: false })] }), 'active');
  });

  it('does not confuse an error on a loaded channel with channel unloading', () => {
    expectState(snapshot({ channels: [channel({ state: 'error', loaded: true, readiness: 'not-ready' })] }), 'active');
  });

  it('rejects a stopped agent with a positively loaded channel', () => {
    expect(agent.AgentRuntimeSnapshotSchema.safeParse(snapshot({ loadState: 'stopped' })).success).toBe(false);
  });

  it('rejects duplicate channel identifiers while permitting distinct protocols', () => {
    expect(agent.AgentRuntimeSnapshotSchema.safeParse(snapshot({ channels: [channel(), channel()] })).success).toBe(false);
    expectState(snapshot({ channels: [channel(), channel({ channelId: 'web-rtc' })] }), 'active');
  });

  it.each(['active', 'stopped', 'no-channel', 'error'])(
    'rejects a false claimed %s state without supporting evidence', (state) => {
      expect(agent.AgentRuntimeSnapshotSchema.safeParse(snapshot({ state, loadState: 'unknown', channels: [], channelsComplete: false })).success).toBe(false);
    },
  );

  it('rejects an understated unknown state when a loaded channel is proven', () => {
    expect(agent.AgentRuntimeSnapshotSchema.safeParse(snapshot({ state: 'unknown' })).success).toBe(false);
  });
});
