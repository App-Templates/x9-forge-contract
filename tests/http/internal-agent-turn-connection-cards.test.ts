import { describe, expect, it } from 'vitest';
import { InternalAgentTurnResponseSchema } from '../../src/http/endpoints/internal-agent-turn.js';

const base = InternalAgentTurnResponseSchema.parse({ ok: true, reply: 'ok', updatedHistory: [] });
const card = {
  cardId: 'card-1',
  provider: 'google',
  permissions: ['calendar_events'],
  url: 'https://connect.example.com/l/abc',
  expiresAt: 1760000000,
  state: 'pending',
  reason: 'Per leggere il calendario',
};

describe('InternalAgentTurnResponseSchema connectionCards', () => {
  it('accepts a response with a valid card', () => {
    const r = InternalAgentTurnResponseSchema.safeParse({ ...base, connectionCards: [card] });
    expect(r.success).toBe(true);
    expect(r.success && r.data.connectionCards).toEqual([card]);
  });

  it('rejects a malformed card', () => {
    expect(InternalAgentTurnResponseSchema.safeParse({ ...base, connectionCards: [{ ...card, url: 'http://x.test' }] }).success).toBe(false);
    expect(InternalAgentTurnResponseSchema.safeParse({ ...base, connectionCards: [{ ...card, token: 't' }] }).success).toBe(false);
  });

  it('rejects more than 5 cards', () => {
    expect(InternalAgentTurnResponseSchema.safeParse({ ...base, connectionCards: Array(6).fill(card) }).success).toBe(false);
  });

  it('accepts a response without the field', () => {
    const r = InternalAgentTurnResponseSchema.safeParse(base);
    expect(r.success).toBe(true);
    expect(r.success && r.data.connectionCards).toBeUndefined();
  });
});
