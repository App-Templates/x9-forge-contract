import { describe, expect, it, vi } from 'vitest';
import {
  AgentTurnSchema, CapabilityTurnLeadDeclarationSchema, CapabilityTurnLeadRequestSchema,
  CapabilityTurnLeadResponseSchema, AGENT_TURN_MAX_TEXT_CHARS, CAPABILITY_TURN_LEAD_MAX_CHARS,
  CAPABILITY_TURN_LEAD_TIMEOUT_MS,
} from '../../src/capability/capability-turn-lead.js';
import { CapabilityManifestSchema, CapabilityRegistryEntrySchema } from '../../src/capability/index.js';
import { InternalAgentTurnRequestSchema, InternalAgentTurnResponseSchema, internalAgentTurnPath,
  InternalTurnRequestSchema, InternalTurnResponseSchema, capTurnLeadContract, createBridgeClient,
} from '../../src/http/index.js';
import { INTERNAL_SECRET_HEADER } from '../../src/auth/index.js';

const answer = { kind: 'answer', turnId: 'synthetic-turn-1', text: '  TEST sì.\nTEST no.  ' };
const delivery = { kind: 'delivery', turnId: 'synthetic-receipt-1', text: '', moveId: 'synthetic-move-1', spokenText: ' TEST domanda? ' };
const body = { channelId: 'live-web', sessionId: 'synthetic-session', message: 'TEST legacy message' };
const reply = { ok: true, reply: 'TEST domanda?', updatedHistory: [] };
const manifest = { name: 'synthetic-cap', version: '1.0.0', endpoint: 'http://synthetic-cap:3240', tools: [] };
const registry = { name: 'synthetic-cap', version: '1.0.0', host: 'synthetic-cap', port: 3240, enabled: true };

describe('MVP guided turns (synthetic)', () => {
  it('accepts exactly the four MVP kinds and preserves the original words', () => {
    for (const turn of [answer, delivery, { kind: 'opening', turnId: answer.turnId, text: '' },
      { kind: 'incomplete', turnId: answer.turnId, text: '' }, { kind: 'incomplete', turnId: answer.turnId, text: answer.text }]) {
      expect(AgentTurnSchema.parse(turn)).toEqual(turn);
    }
    for (const kind of ['resume', 'other']) expect(AgentTurnSchema.safeParse({ ...answer, kind }).success).toBe(false);
    for (const text of ['', ' \n ']) expect(AgentTurnSchema.safeParse({ ...answer, text }).success).toBe(false);
    expect(AgentTurnSchema.safeParse({ kind: 'opening', turnId: answer.turnId, text: 'TEST person already spoke' }).success).toBe(false);
    expect(AgentTurnSchema.parse({ ...answer, text: '[apertura] TEST parole della persona' }).kind).toBe('answer');
  });
  it('requires bounded turn and move identifiers', () => {
    for (const turn of [answer, delivery]) for (const turnId of ['', 'x'.repeat(121), undefined])
      expect(AgentTurnSchema.safeParse({ ...turn, turnId }).success).toBe(false);
    for (const moveId of ['', 'x'.repeat(121), undefined]) {
      expect(AgentTurnSchema.safeParse({ ...delivery, moveId }).success).toBe(false);
      expect(CapabilityTurnLeadResponseSchema.safeParse({ kind: 'speak', moveId, text: 'TEST?' }).success).toBe(false);
    }
    expect(AgentTurnSchema.parse({ ...answer, turnId: 'x'.repeat(120) }).turnId).toHaveLength(120);
  });
  it('bounds source and spoken text without truncating or manufacturing a delivery', () => {
    expect(AGENT_TURN_MAX_TEXT_CHARS).toBe(32000);
    for (const kind of ['answer', 'incomplete']) {
      expect(AgentTurnSchema.parse({ ...answer, kind, text: 'x'.repeat(32000) }).text).toHaveLength(32000);
      expect(AgentTurnSchema.safeParse({ ...answer, kind, text: 'x'.repeat(32001) }).success).toBe(false);
    }
    expect(AgentTurnSchema.parse({ ...delivery, spokenText: '' })).toEqual({ ...delivery, spokenText: '' });
    expect(AgentTurnSchema.parse({ ...delivery, spokenText: 'x'.repeat(32000) }).kind).toBe('delivery');
    expect(AgentTurnSchema.safeParse({ ...delivery, spokenText: 'x'.repeat(32001) }).success).toBe(false);
    expect(AgentTurnSchema.safeParse({ ...delivery, spokenText: undefined }).success).toBe(false);
    expect(AgentTurnSchema.safeParse({ ...delivery, text: 'TEST not the person' }).success).toBe(false);
  });
  it('rejects undeclared payload fields rather than silently accepting beta semantics', () => {
    for (const turn of [answer, delivery, { kind: 'opening', turnId: answer.turnId, text: '' },
      { kind: 'incomplete', turnId: answer.turnId, text: '' }])
      expect(AgentTurnSchema.safeParse({ ...turn, organizationId: 'synthetic-injected' }).success).toBe(false);
    expect(CapabilityTurnLeadDeclarationSchema.safeParse({ budget: true }).success).toBe(false);
  });
  it('opts in only with a valid explicit declaration in both manifest and registry', () => {
    for (const [schema, legacy] of [[CapabilityManifestSchema, manifest], [CapabilityRegistryEntrySchema, registry]] as const) {
      expect(schema.parse(legacy)).not.toHaveProperty('turnLead');
      expect(schema.parse({ ...legacy, turnLead: {} })).toHaveProperty('turnLead', {});
      for (const turnLead of [null, false, true, { contractVersion: 'beta' }])
        expect(schema.safeParse({ ...legacy, turnLead }).success).toBe(false);
    }
  });
  it('requires runtime identity and a structured turn on the capability endpoint', () => {
    const request = { agentId: 'synthetic-agent', sessionId: 'synthetic-session', channelId: 'live-web', turn: answer };
    expect(CapabilityTurnLeadRequestSchema.parse(request)).toEqual(request);
    for (const key of ['agentId', 'sessionId', 'turn']) {
      expect(CapabilityTurnLeadRequestSchema.safeParse({ ...request, [key]: undefined }).success).toBe(false);
    }
    expect(CapabilityTurnLeadRequestSchema.safeParse({ ...request, organizationId: 'synthetic-injected' }).success).toBe(false);
    expect(capTurnLeadContract).toMatchObject({ path: '/turn', method: 'POST', authType: 'secret',
      bodySchema: CapabilityTurnLeadRequestSchema, responseSchema: CapabilityTurnLeadResponseSchema });
    expect(CAPABILITY_TURN_LEAD_TIMEOUT_MS).toBe(150000);
  });
  it('accepts speak or release only, with bounded nonblank speech', () => {
    const speak = { kind: 'speak', moveId: 'synthetic-move-1', text: ' TEST domanda? ' };
    expect(CapabilityTurnLeadResponseSchema.parse(speak)).toEqual(speak);
    expect(CapabilityTurnLeadResponseSchema.parse({ kind: 'release' })).toEqual({ kind: 'release' });
    expect(CAPABILITY_TURN_LEAD_MAX_CHARS).toBe(6000);
    expect(CapabilityTurnLeadResponseSchema.parse({ ...speak, text: 'x'.repeat(6000) })).toHaveProperty('text');
    for (const text of ['', ' \n ', 'x'.repeat(6001)]) expect(CapabilityTurnLeadResponseSchema.safeParse({ ...speak, text }).success).toBe(false);
    for (const invalid of [{ kind: 'ack' }, { ...speak, budget: 1 }, { kind: 'release', text: 'TEST not a release message' }])
      expect(CapabilityTurnLeadResponseSchema.safeParse(invalid).success).toBe(false);
  });
  it('extends the per-agent route without changing the personal route or legacy payloads', () => {
    expect(InternalAgentTurnRequestSchema.parse(body)).toEqual(body);
    expect(InternalAgentTurnResponseSchema.parse(reply)).toEqual(reply);
    expect(InternalAgentTurnRequestSchema.parse({ ...body, turn: answer })).toEqual({ ...body, turn: answer });
    expect(InternalAgentTurnResponseSchema.parse({ ...reply, moveId: delivery.moveId })).toEqual({ ...reply, moveId: delivery.moveId });
    expect(InternalAgentTurnRequestSchema.safeParse({ ...body, turn: { ...answer, kind: 'bogus' } }).success).toBe(false);
    expect(InternalAgentTurnResponseSchema.safeParse({ ...reply, moveId: '' }).success).toBe(false);
    expect(InternalTurnRequestSchema.parse({ ...body, turn: answer })).toEqual(body);
    expect(InternalTurnResponseSchema.parse({ ...reply, moveId: delivery.moveId })).toEqual(reply);
  });
  it('carries source and move ID through the real bridge HTTP client without losing fields', async () => {
    const received: { path?: string; auth?: string | string[]; body?: unknown } = {};
    const transport = vi.fn<typeof fetch>(async (input, init) => {
      received.path = new URL(String(input)).pathname; received.auth = new Headers(init?.headers).get(INTERNAL_SECRET_HEADER) ?? undefined;
      received.body = JSON.parse(String(init?.body));
      return Response.json({ ...reply, moveId: delivery.moveId });
    });
    vi.stubGlobal('fetch', transport);
    try {
      const client = createBridgeClient({ baseUrl: 'http://bridge.invalid',
        auth: { [INTERNAL_SECRET_HEADER]: 'synthetic-test-only' } });
      const result = await client.internalAgentTurn('synthetic-agent', { ...body, turn: AgentTurnSchema.parse(answer) });
      expect(received).toEqual({ path: internalAgentTurnPath('synthetic-agent'), auth: 'synthetic-test-only', body: { ...body, turn: answer } });
      expect(result).toEqual({ ...reply, moveId: delivery.moveId });
      expect(transport).toHaveBeenCalledTimes(1);
    } finally { vi.unstubAllGlobals(); }
  });
});
