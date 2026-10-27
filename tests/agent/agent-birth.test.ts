import { describe, expect, it } from 'vitest';
import {
  AgentBirthDeployJobIdSchema,
  AgentBirthModelsReceiptSchema,
  AgentBirthSignalSchema,
  AgentManagementCommandSchema,
  sameAgentCommand,
} from '../../src/agent/index.js';
import {
  ReloadAgentBodySchema,
  ReloadAgentResponseSchema,
  reloadAgentContract,
} from '../../src/http/endpoints/internal-agents-reload.js';
import { createBridgeClient } from '../../src/http/bridge-client.js';

const birth = { deployJobId: 'job-7f3a', configVersion: 2 };
const reload = { action: 'reload' as const, requestId: 'request-birth-1' };

describe('birth signal (v1.75.0)', () => {
  it('accepts a deploy job id and a configuration version', () => {
    expect(AgentBirthSignalSchema.parse(birth)).toEqual(birth);
    expect(AgentBirthDeployJobIdSchema.parse('0d3f6c9e-1b2a-4c5d-8e7f-0123456789ab')).toBe('0d3f6c9e-1b2a-4c5d-8e7f-0123456789ab');
  });

  it('refuses an unknown field, an empty job id, a job id with a path and a version that is not positive', () => {
    expect(() => AgentBirthSignalSchema.parse({ ...birth, extra: true })).toThrow();
    expect(() => AgentBirthSignalSchema.parse({ ...birth, deployJobId: '' })).toThrow();
    expect(() => AgentBirthSignalSchema.parse({ ...birth, deployJobId: '../job' })).toThrow();
    expect(() => AgentBirthSignalSchema.parse({ ...birth, deployJobId: 'a'.repeat(101) })).toThrow();
    expect(() => AgentBirthSignalSchema.parse({ ...birth, configVersion: 0 })).toThrow();
    expect(() => AgentBirthSignalSchema.parse({ deployJobId: 'job-1' })).toThrow();
  });

  it('is an optional field of the reload command', () => {
    expect(AgentManagementCommandSchema.parse(reload)).toEqual(reload);
    expect(AgentManagementCommandSchema.parse({ ...reload, birth })).toEqual({ ...reload, birth });
  });

  it('is refused on every other lifecycle action and on apply-config', () => {
    for (const action of ['start', 'stop', 'restart'] as const) {
      expect(() => AgentManagementCommandSchema.parse({ action, requestId: 'request-birth-1', birth })).toThrow(/only valid for a reload/);
    }
    expect(() => AgentManagementCommandSchema.parse({ action: 'apply-config', requestId: 'request-birth-1', desiredVersion: 2, birth })).toThrow();
  });

  it('a replay is the same command only with the same signal', () => {
    const a = AgentManagementCommandSchema.parse({ ...reload, birth });
    expect(sameAgentCommand(a, AgentManagementCommandSchema.parse({ ...reload, birth: { configVersion: 2, deployJobId: 'job-7f3a' } }))).toBe(true);
    expect(sameAgentCommand(a, AgentManagementCommandSchema.parse(reload))).toBe(false);
    expect(sameAgentCommand(AgentManagementCommandSchema.parse(reload), a)).toBe(false);
    expect(sameAgentCommand(a, AgentManagementCommandSchema.parse({ ...reload, birth: { ...birth, configVersion: 3 } }))).toBe(false);
    expect(sameAgentCommand(a, AgentManagementCommandSchema.parse({ ...reload, birth: { ...birth, deployJobId: 'job-other' } }))).toBe(false);
    expect(sameAgentCommand(AgentManagementCommandSchema.parse(reload), AgentManagementCommandSchema.parse(reload))).toBe(true);
  });

  it('the models receipt names the request and the version, nothing else', () => {
    expect(AgentBirthModelsReceiptSchema.parse({ requestId: 'request-birth-1', configVersion: 2 })).toEqual({ requestId: 'request-birth-1', configVersion: 2 });
    expect(() => AgentBirthModelsReceiptSchema.parse({ requestId: 'short', configVersion: 2 })).toThrow();
    expect(() => AgentBirthModelsReceiptSchema.parse({ requestId: 'request-birth-1' })).toThrow();
    expect(() => AgentBirthModelsReceiptSchema.parse({ requestId: 'request-birth-1', configVersion: 2, token: 'x' })).toThrow();
  });
});

describe('reload endpoint with a birth signal (v1.75.0)', () => {
  it('declares an optional body and an optional receipt, and a request without body stays valid', () => {
    expect(reloadAgentContract.bodySchema).toBe(ReloadAgentBodySchema);
    expect(ReloadAgentBodySchema.parse({})).toEqual({});
    expect(ReloadAgentBodySchema.parse({ birth })).toEqual({ birth });
    expect(() => ReloadAgentBodySchema.parse({ birth, other: 1 })).toThrow();
    expect(ReloadAgentResponseSchema.parse({ ok: true, agentId: 'ricerca-1' })).toEqual({ ok: true, agentId: 'ricerca-1' });
    expect(ReloadAgentResponseSchema.parse({ ok: true, agentId: 'ricerca-1', birthModels: { requestId: 'request-birth-1', configVersion: 2 } }).birthModels)
      .toEqual({ requestId: 'request-birth-1', configVersion: 2 });
    expect(() => ReloadAgentResponseSchema.parse({ ok: true, agentId: 'ricerca-1', birthModels: { requestId: 'request-birth-1' } })).toThrow();
  });

  it('the secret client sends the signal as the body, and no body when there is none', async () => {
    const originalFetch = globalThis.fetch;
    const sent: Array<{ url: string; body: unknown }> = [];
    globalThis.fetch = (async (url: string, init?: RequestInit) => {
      sent.push({ url: String(url), body: init?.body === undefined ? undefined : JSON.parse(String(init.body)) });
      return new Response(JSON.stringify({ ok: true, agentId: 'ricerca-1', birthModels: { requestId: 'request-birth-1', configVersion: 2 } }), { status: 200, headers: { 'content-type': 'application/json' } });
    }) as typeof fetch;
    try {
      const client = createBridgeClient({ baseUrl: 'http://agent-core:4100', auth: { 'X-Internal-Secret': 'sec' } });
      const withBirth = await client.reloadAgent('ricerca-1', { birth });
      const without = await client.reloadAgent('ricerca-1');
      expect(withBirth.birthModels).toEqual({ requestId: 'request-birth-1', configVersion: 2 });
      expect(sent).toEqual([
        { url: 'http://agent-core:4100/internal/agents/ricerca-1/reload', body: { birth } },
        { url: 'http://agent-core:4100/internal/agents/ricerca-1/reload', body: undefined },
      ]);
      expect(without.ok).toBe(true);
      await expect(client.reloadAgent('ricerca-1', { birth: { deployJobId: '', configVersion: 1 } })).rejects.toThrow();
      expect(sent).toHaveLength(2);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
