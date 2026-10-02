import { describe, expect, it } from 'vitest';
import { createServer } from 'node:http';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import {
  AgentTurnSchema, CapabilityTurnLeadRequestSchema, CapabilityTurnLeadResponseSchema,
  CAPABILITY_LEAD_MAX_INSTRUCTIONS_CHARS, CAPABILITY_NOTE_MAX_CHARS,
} from '../../src/capability/index.js';
import { InternalAgentTurnRequestSchema, InternalAgentTurnResponseSchema, InternalTurnResponseSchema,
  internalAgentTurnPath, createBridgeClient } from '../../src/http/index.js';
import { INTERNAL_SECRET_HEADER } from '../../src/auth/index.js';

const prepare = { kind: 'prepare', turnId: 'synthetic-prepare-1', text: '' };
const exchange = { kind: 'exchange', turnId: 'synthetic-exchange-1', text: ' TEST seguo i lanci. ', spokenText: 'TEST di cosa ti occupi?', ended: false };
const body = { channelId: 'live-web', sessionId: 'synthetic-session', message: '[exchange]' };
const reply = { ok: true, reply: '', updatedHistory: [] };

describe('voice-led onboarding turns (synthetic, v1.27.0)', () => {
  it('prepare carries no words and no extra fields', () => {
    expect(AgentTurnSchema.parse(prepare)).toEqual(prepare);
    expect(AgentTurnSchema.safeParse({ ...prepare, text: 'TEST parole' }).success).toBe(false);
    expect(AgentTurnSchema.safeParse({ ...prepare, instructions: 'TEST injected' }).success).toBe(false);
    expect(AgentTurnSchema.safeParse({ ...prepare, turnId: '' }).success).toBe(false);
  });
  it('an exchange keeps both sides verbatim, allows a silent side and must say whether the session ended', () => {
    expect(AgentTurnSchema.parse(exchange)).toEqual(exchange);
    expect(AgentTurnSchema.parse({ ...exchange, text: '', spokenText: '', ended: true })).toMatchObject({ ended: true });
    for (const key of ['text', 'spokenText', 'ended']) expect(AgentTurnSchema.safeParse({ ...exchange, [key]: undefined }).success).toBe(false);
    expect(AgentTurnSchema.safeParse({ ...exchange, ended: 'yes' }).success).toBe(false);
    for (const key of ['text', 'spokenText']) {
      expect(AgentTurnSchema.parse({ ...exchange, [key]: 'x'.repeat(32000) })).toHaveProperty(key);
      expect(AgentTurnSchema.safeParse({ ...exchange, [key]: 'x'.repeat(32001) }).success).toBe(false);
    }
    expect(AgentTurnSchema.safeParse({ ...exchange, moveId: 'synthetic-move' }).success).toBe(false);
    const request = { agentId: 'synthetic-agent', sessionId: 'synthetic-session', turn: exchange };
    expect(CapabilityTurnLeadRequestSchema.parse(request)).toEqual(request);
  });
  it('lead brings bounded nonblank instructions; noted may carry a bounded nonblank note', () => {
    expect(CAPABILITY_LEAD_MAX_INSTRUCTIONS_CHARS).toBe(16000);expect(CAPABILITY_NOTE_MAX_CHARS).toBe(1200);
    const lead = { kind: 'lead', instructions: 'TEST guida' };
    expect(CapabilityTurnLeadResponseSchema.parse(lead)).toEqual(lead);
    expect(CapabilityTurnLeadResponseSchema.parse({ ...lead, instructions: 'x'.repeat(16000) })).toHaveProperty('instructions');
    for (const instructions of ['', ' \n', 'x'.repeat(16001), undefined])
      expect(CapabilityTurnLeadResponseSchema.safeParse({ ...lead, instructions }).success).toBe(false);
    expect(CapabilityTurnLeadResponseSchema.safeParse({ ...lead, moveId: 'synthetic-move' }).success).toBe(false);
    expect(CapabilityTurnLeadResponseSchema.parse({ kind: 'noted' })).toEqual({ kind: 'noted' });
    expect(CapabilityTurnLeadResponseSchema.parse({ kind: 'noted', note: 'TEST mancano gli strumenti' })).toHaveProperty('note');
    expect(CapabilityTurnLeadResponseSchema.parse({ kind: 'noted', note: 'x'.repeat(1200) })).toHaveProperty('note');
    for (const note of ['', ' ', 'x'.repeat(1201)]) expect(CapabilityTurnLeadResponseSchema.safeParse({ kind: 'noted', note }).success).toBe(false);
    expect(CapabilityTurnLeadResponseSchema.safeParse({ kind: 'noted', text: 'TEST words to say' }).success).toBe(false);
  });
  it('the per-agent response may carry lead or note; the personal route never does', () => {
    expect(InternalAgentTurnRequestSchema.parse({ ...body, turn: exchange })).toEqual({ ...body, turn: exchange });
    for (const extra of [{ lead: 'TEST guida' }, { note: 'TEST nota' }, {}])
      expect(InternalAgentTurnResponseSchema.parse({ ...reply, ...extra })).toEqual({ ...reply, ...extra });
    for (const extra of [{ lead: '' }, { lead: 'x'.repeat(16001) }, { note: ' ' }, { note: 'x'.repeat(1201) }])
      expect(InternalAgentTurnResponseSchema.safeParse({ ...reply, ...extra }).success).toBe(false);
    expect(InternalTurnResponseSchema.parse({ ...reply, lead: 'TEST guida', note: 'TEST nota' })).toEqual(reply);
  });
  it('lead and note travel through the real bridge HTTP client', async () => {
    const received: { path?: string; body?: unknown } = {};
    const server = createServer(async (req, res) => {
      const chunks: Buffer[] = []; for await (const chunk of req) chunks.push(Buffer.from(chunk));
      received.path = req.url; received.body = JSON.parse(Buffer.concat(chunks).toString());
      res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ ...reply, note: 'TEST nota' }));
    });
    server.listen(0, '127.0.0.1'); await once(server, 'listening');
    try {
      const client = createBridgeClient({ baseUrl: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
        auth: { [INTERNAL_SECRET_HEADER]: 'synthetic-test-only' } });
      const result = await client.internalAgentTurn('synthetic-agent', { ...body, turn: AgentTurnSchema.parse(exchange) });
      expect(received).toEqual({ path: internalAgentTurnPath('synthetic-agent'), body: { ...body, turn: exchange } });
      expect(result).toEqual({ ...reply, note: 'TEST nota' });
    } finally { await new Promise<void>((resolve, reject) => server.close((e) => e ? reject(e) : resolve())); }
  });
});
