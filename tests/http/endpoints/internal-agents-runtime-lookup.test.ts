import { describe, expect, it } from 'vitest';
import * as http from '../../../src/http/index.js';
import * as agent from '../../../src/agent/index.js';
import { runtimeList, runtimeRow } from './agent-runtime-fixtures.js';

const legacy = { agentId: 'x9', displayName: 'Master Chief', ownerId: 'owner-1' };

describe('canonical list state lookup', () => {
  it.each(['x9-staging', 'x9'])(
    'targets the same explicitly identified agent using %s', (id) => {
      expect(http.getListAgentsRuntimeState(runtimeList(), id)).toBe('active');
    },
  );

  it.each(['x9-stag', 'x9-staging-extra', 'X9', '1'])(
    'never uses fuzzy names, case folding or database ID inference for %s', (id) => {
      expect(http.getListAgentsRuntimeState(runtimeList(), id)).toBe('unknown');
    },
  );

  it.each(['running', 'degraded', 'starting', 'stopped', 'bot-less'])(
    'keeps legacy %s unknown even when the source is available', (runtimeStatus) => {
      const payload = { agents: [{ ...legacy, runtimeStatus, loaded: true }], source: runtimeList().source };
      expect(http.getListAgentsRuntimeState(payload, 'x9')).toBe('unknown');
    },
  );

  it('keeps a bare 1.29 list unknown', () => {
    expect(http.getListAgentsRuntimeState({ agents: [legacy] }, 'x9')).toBe('unknown');
  });

  it('keeps new runtime observations unknown when source metadata is missing', () => {
    expect(http.getListAgentsRuntimeState({ agents: [runtimeRow()] }, 'x9')).toBe('unknown');
  });

  it.each(['unavailable', 'unknown'])(
    'does not trust cached active observations from an %s source', (availability) => {
      const payload = runtimeList();
      const unavailable = { ...payload, source: { ...payload.source, availability, completeness: 'partial' } };
      expect(http.getListAgentsRuntimeState(unavailable, 'x9-staging')).toBe('unknown');
    },
  );

  it('trusts positive loaded-channel evidence from an available partial list', () => {
    const payload = runtimeList();
    expect(http.getListAgentsRuntimeState({ ...payload, source: { ...payload.source, completeness: 'partial' } }, 'x9')).toBe('active');
  });

  it.each(['complete', 'partial', 'unknown'])(
    'never turns an absent row in a %s inventory into stopped', (completeness) => {
      const payload = runtimeList();
      expect(http.getListAgentsRuntimeState({ ...payload, agents: [], source: { ...payload.source, completeness } }, 'x9')).toBe('unknown');
    },
  );

  it('does not invent a management alias for a row missing identity metadata', () => {
    const { identity: _identity, ...row } = runtimeRow();
    const payload = { agents: [row], source: runtimeList().source };
    expect(http.getListAgentsRuntimeState(payload, 'x9-staging')).toBe('unknown');
    expect(http.getListAgentsRuntimeState(payload, 'x9')).toBe('active');
  });

  it.each([
    { state: 'no-channel', loadState: 'loaded', channelsComplete: true },
    { state: 'stopped', loadState: 'stopped', channelsComplete: false },
    { state: 'error', loadState: 'error', channelsComplete: false },
    { state: 'unknown', loadState: 'unknown', channelsComplete: false },
  ])('preserves supported canonical state $state', (runtime) => {
    const payload = runtimeList();
    const row = { ...runtimeRow(), runtime: { ...runtime, channels: [] } };
    expect(http.getListAgentsRuntimeState({ ...payload, agents: [row] }, 'x9-staging')).toBe(runtime.state);
  });

  it('rejects ambiguous identity before selecting an agent', () => {
    const payload = runtimeList();
    expect(() => http.getListAgentsRuntimeState({ ...payload, agents: [runtimeRow(), { ...legacy, agentId: 'x9-staging' }] }, 'x9-staging')).toThrow(/Duplicate or ambiguous agent identifier/);
  });

  it('rejects forged active state before using an available source', () => {
    const payload = runtimeList();
    const row = runtimeRow();
    expect(() => http.getListAgentsRuntimeState({ ...payload, agents: [{ ...row, runtime: { ...row.runtime, channels: [] } }] }, 'x9')).toThrow(/Agent state is not supported by runtime evidence/);
  });

  it('does not regress the legacy HTTP path or authentication', () => {
    expect(http.listAgentsContract).toMatchObject({ method: 'GET', path: '/internal/agents', authType: 'secret' });
  });

  it('exports canonical schemas and derivation from the public agent subpath', () => {
    expect(agent.AgentRuntimeIdentitySchema.parse(runtimeRow().identity)).toEqual(runtimeRow().identity);
    expect(agent.AgentRuntimeStateSchema.options).toEqual(['active', 'no-channel', 'stopped', 'error', 'unknown']);
    expect(agent.AgentRuntimeSourceSchema.parse(runtimeList().source)).toEqual(runtimeList().source);
    expect(agent.deriveAgentRuntimeState(agent.AgentRuntimeSnapshotSchema.parse(runtimeRow().runtime))).toBe('active');
  });
});
