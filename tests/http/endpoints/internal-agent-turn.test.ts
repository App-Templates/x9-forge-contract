import { describe, it, expect, afterEach } from 'vitest';
import {
  InternalAgentTurnParamsSchema,
  InternalAgentTurnRequestSchema,
  InternalAgentTurnResponseSchema,
  InternalAgentTurnErrorResponseSchema,
  INTERNAL_AGENT_TURN_UNKNOWN_AGENT,
  INTERNAL_AGENT_TURN_PRIMARY_FORBIDDEN,
  internalAgentTurnContract,
  internalAgentTurnPath,
} from '../../../src/http/endpoints/internal-agent-turn.js';
import {
  InternalTurnRequestSchema,
  InternalTurnResponseSchema,
} from '../../../src/http/endpoints/internal-turn.js';
import { StopAgentParamsSchema } from '../../../src/http/endpoints/internal-agents-stop.js';
import { createBridgeClient } from '../../../src/http/bridge-client.js';
import { VoiceLiveWebSessionRequestSchema } from '../../../src/capability/voice-live/index.js';
import * as httpBarrel from '../../../src/http/index.js';

const validBody = { channelId: 'live-web', sessionId: 'web-abc12345', message: 'Ciao', history: [] };
const validResponse = { ok: true as const, reply: 'Ciao!', updatedHistory: [{ role: 'assistant' as const, content: 'Ciao!' }] };

describe('InternalAgentTurnParamsSchema', () => {
  it('accepts a Forge slug', () => {
    expect(InternalAgentTurnParamsSchema.parse({ agentId: 'mario-rossi-2' }).agentId).toBe('mario-rossi-2');
  });

  it('rejects uppercase, path traversal and empty ids', () => {
    for (const agentId of ['Mario', '../x9', 'a/b', '', 'a_b']) {
      expect(() => InternalAgentTurnParamsSchema.parse({ agentId })).toThrow();
    }
  });

  it('uses the same agentId rule as /internal/agents/:agentId/stop', () => {
    for (const agentId of ['x9', 'mario-rossi', 'A', 'a_b', '']) {
      expect(InternalAgentTurnParamsSchema.safeParse({ agentId }).success).toBe(
        StopAgentParamsSchema.safeParse({ agentId }).success,
      );
    }
  });
});

describe('InternalAgentTurn body/response', () => {
  it('legacy body parses identically and success response IS the /internal/turn schema', () => {
    expect(JSON.stringify(InternalAgentTurnRequestSchema.parse(validBody))).toBe(JSON.stringify(InternalTurnRequestSchema.parse(validBody)));
    expect(InternalAgentTurnResponseSchema).toBe(InternalTurnResponseSchema);
  });

  it('parses a valid body and rejects a bad channelId', () => {
    expect(InternalAgentTurnRequestSchema.parse(validBody).message).toBe('Ciao');
    expect(() => InternalAgentTurnRequestSchema.parse({ ...validBody, channelId: 'Live_Web' })).toThrow();
  });

  it('error response carries the documented codes', () => {
    expect(InternalAgentTurnErrorResponseSchema.parse({ ok: false, error: INTERNAL_AGENT_TURN_UNKNOWN_AGENT }).error).toBe('unknown_agent');
    expect(INTERNAL_AGENT_TURN_PRIMARY_FORBIDDEN).toBe('primary_agent_forbidden');
  });
});

describe('internalAgentTurnContract', () => {
  it('is POST /internal/agents/:agentId/turn with secret auth', () => {
    expect(internalAgentTurnContract.method).toBe('POST');
    expect(internalAgentTurnContract.path).toBe('/internal/agents/:agentId/turn');
    expect(internalAgentTurnContract.authType).toBe('secret');
  });

  it('internalAgentTurnPath builds the concrete path and refuses unsafe ids', () => {
    expect(internalAgentTurnPath('mario-rossi')).toBe('/internal/agents/mario-rossi/turn');
    expect(() => internalAgentTurnPath('../turn')).toThrow();
  });

  it('is exported from the http barrel', () => {
    expect(httpBarrel.internalAgentTurnContract).toBe(internalAgentTurnContract);
    expect(typeof httpBarrel.internalAgentTurnPath).toBe('function');
  });
});

describe('SecretBridgeClient.internalAgentTurn', () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('POSTs the body to /internal/agents/<id>/turn with the secret header and parses the reply', async () => {
    const captured: { url?: string; init?: RequestInit } = {};
    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      captured.url = String(url);
      captured.init = init;
      return new Response(JSON.stringify(validResponse), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }) as typeof fetch;
    const client = createBridgeClient({ baseUrl: 'http://agent-core:4100/', auth: { 'X-Internal-Secret': 'sec' } });
    const res = await client.internalAgentTurn('mario-rossi', validBody);
    expect(res.reply).toBe('Ciao!');
    expect(captured.url).toBe('http://agent-core:4100/internal/agents/mario-rossi/turn');
    expect(captured.init?.method).toBe('POST');
    expect((captured.init?.headers as Record<string, string>)['X-Internal-Secret']).toBe('sec');
    expect(JSON.parse(String(captured.init?.body))).toEqual(validBody);
  });

  it('rejects an unsafe agentId before any network call', async () => {
    let called = false;
    globalThis.fetch = (async () => {
      called = true;
      return new Response('{}');
    }) as typeof fetch;
    const client = createBridgeClient({ baseUrl: 'http://agent-core:4100', auth: { 'X-Internal-Secret': 'sec' } });
    await expect(client.internalAgentTurn('../x9', validBody)).rejects.toThrow();
    expect(called).toBe(false);
  });

  it('rejects an invalid body before any network call', async () => {
    let called = false;
    globalThis.fetch = (async () => {
      called = true;
      return new Response('{}');
    }) as typeof fetch;
    const client = createBridgeClient({ baseUrl: 'http://agent-core:4100', auth: { 'X-Internal-Secret': 'sec' } });
    await expect(client.internalAgentTurn('mario-rossi', { ...validBody, message: '' })).rejects.toThrow();
    expect(called).toBe(false);
  });
});

describe('VoiceLiveWebSessionRequestSchema.agent_id (v1.22.0)', () => {
  it('is optional: v1.21 payloads parse unchanged', () => {
    const parsed = VoiceLiveWebSessionRequestSchema.parse({ sdp: 'v=0', conversation_id: 'web-1' });
    expect(parsed).toEqual({ sdp: 'v=0', conversation_id: 'web-1' });
    expect('agent_id' in parsed).toBe(false);
  });

  it('accepts a valid agent id and rejects an invalid one', () => {
    expect(VoiceLiveWebSessionRequestSchema.parse({ sdp: 'v=0', agent_id: 'mario-rossi' }).agent_id).toBe('mario-rossi');
    expect(() => VoiceLiveWebSessionRequestSchema.parse({ sdp: 'v=0', agent_id: 'Mario Rossi' })).toThrow();
    expect(() => VoiceLiveWebSessionRequestSchema.parse({ sdp: 'v=0', agent_id: '' })).toThrow();
  });
});
