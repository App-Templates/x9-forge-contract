import { describe, expect, it } from 'vitest';
import * as http from '../../../src/http/index.js';
import { runtimeList, runtimeRow } from './agent-runtime-fixtures.js';

const legacy = { agentId: 'x9', displayName: 'Master Chief', ownerId: 'owner-1' };

describe('additive canonical runtime list', () => {
  it('round trips the old payload without inventing identity, source or runtime', () => {
    const payload = { agents: [legacy] };
    expect(http.ListAgentsResponseSchema.parse(payload)).toEqual(payload);
  });

  it.each(['running', 'degraded', 'starting', 'stopped', 'bot-less'])(
    'preserves legacy %s fields without synthesizing canonical state', (runtimeStatus) => {
      const payload = { agents: [{ ...legacy, runtimeStatus, loaded: true, errorKind: null, lastError: null }] };
      expect(http.ListAgentsResponseSchema.parse(payload)).toEqual(payload);
    },
  );

  it('round trips new identity, runtime and source metadata through the HTTP subpath', () => {
    const payload = runtimeList();
    expect(http.ListAgentsResponseSchema.parse(payload)).toEqual(payload);
    expect(http.listAgentsContract.responseSchema.parse(payload)).toEqual(payload);
  });

  it('accepts an available partial list with positive runtime observations', () => {
    const payload = runtimeList();
    const partial = { ...payload, source: { ...payload.source, completeness: 'partial' } };
    expect(http.ListAgentsResponseSchema.parse(partial)).toEqual(partial);
  });

  it('accepts unavailable source metadata explicitly distinct from an empty complete list', () => {
    const payload = { agents: [], source: { authority: 'x9', availability: 'unavailable', completeness: 'unknown', observedAt: null } };
    expect(http.ListAgentsResponseSchema.parse(payload)).toEqual(payload);
  });

  it.each(['unavailable', 'unknown'])(
    'rejects a complete inventory from an %s source', (availability) => {
      const payload = runtimeList();
      expect(http.ListAgentsResponseSchema.safeParse({ ...payload, source: { ...payload.source, availability } }).success).toBe(false);
    },
  );

  it('rejects an available source without an observation time', () => {
    const payload = runtimeList();
    expect(http.ListAgentsResponseSchema.safeParse({ ...payload, source: { ...payload.source, observedAt: null } }).success).toBe(false);
  });

  it('rejects malformed observation timestamps', () => {
    const payload = runtimeList();
    expect(http.ListAgentsResponseSchema.safeParse({ ...payload, source: { ...payload.source, observedAt: 'yesterday' } }).success).toBe(false);
  });

  it('rejects source metadata attributed to stored Forge database status', () => {
    const payload = runtimeList();
    expect(http.ListAgentsResponseSchema.safeParse({ ...payload, source: { ...payload.source, authority: 'forge-db' } }).success).toBe(false);
  });

  it.each(['authority', 'availability', 'completeness', 'observedAt'])(
    'requires %s when source metadata is supplied', (key) => {
      const source: Record<string, unknown> = { ...runtimeList().source, completeness: 'partial' };
      delete source[key];
      expect(http.ListAgentsResponseSchema.safeParse({ agents: [], source }).success).toBe(false);
    },
  );

  it('rejects runtime identity that targets a different agent than the list row', () => {
    expect(http.ListAgentsAgentSchema.safeParse({ ...runtimeRow(), agentId: 'another-runtime' }).success).toBe(false);
  });

  it('rejects unsupported claimed agent state inside list rows', () => {
    const row = runtimeRow();
    expect(http.ListAgentsAgentSchema.safeParse({ ...row, runtime: { ...row.runtime, channels: [] } }).success).toBe(false);
  });

  it('rejects duplicate legacy rows as ambiguous targets', () => {
    expect(http.ListAgentsResponseSchema.safeParse({ agents: [legacy, legacy] }).success).toBe(false);
  });

  it('rejects an explicit management identity colliding with a legacy runtime row', () => {
    expect(http.ListAgentsResponseSchema.safeParse({ agents: [runtimeRow(), { ...legacy, agentId: 'x9-staging' }] }).success).toBe(false);
  });

  it('rejects duplicate explicit management identities', () => {
    const second = { ...runtimeRow(), agentId: 'x9-other', identity: { managementAgentId: 'x9-staging', runtimeAgentId: 'x9-other' } };
    expect(http.ListAgentsResponseSchema.safeParse({ agents: [runtimeRow(), second] }).success).toBe(false);
  });

  it('does not reject distinct rows just because their display names are identical', () => {
    const payload = { agents: [runtimeRow(), { ...legacy, agentId: 'x9-extra' }] };
    expect(http.ListAgentsResponseSchema.parse(payload)).toEqual(payload);
  });
});
