import { describe, expect, it } from 'vitest';
import {
  ConnectionCardEnvelopeSchema,
  ConnectionCardSchema,
  parseConnectionCardEnvelope,
} from '../../../src/http/endpoints/connection-card.js';

const card = {
  cardId: 'card-1',
  provider: 'google',
  permissions: ['calendar_events', 'contacts_read'],
  url: 'https://connect.example.com/c/abc',
  expiresAt: 1_800_000_000,
  state: 'pending',
  reason: 'Per leggere il calendario serve il tuo consenso.',
};
const envelope = { type: 'connection_card', card };

describe('connection card contract', () => {
  it('round-trips a valid envelope', () => {
    const parsed = ConnectionCardEnvelopeSchema.parse(JSON.parse(JSON.stringify(envelope)));
    expect(parsed).toEqual(envelope);
    expect(parseConnectionCardEnvelope(envelope)).toEqual(envelope);
  });

  it('rejects an extra field', () => {
    expect(ConnectionCardSchema.safeParse({ ...card, note: 'x' }).success).toBe(false);
  });

  it.each(['token', 'permit', 'secret'])('rejects a %s field', (field) => {
    expect(ConnectionCardSchema.safeParse({ ...card, [field]: 'v'.repeat(40) }).success).toBe(false);
    expect(parseConnectionCardEnvelope({ type: 'connection_card', card: { ...card, [field]: 'v' } })).toBeNull();
  });

  it('rejects a non-https url', () => {
    expect(ConnectionCardSchema.safeParse({ ...card, url: 'http://connect.example.com/c' }).success).toBe(false);
  });

  it('rejects an unknown state, provider or scope', () => {
    expect(ConnectionCardSchema.safeParse({ ...card, state: 'done' }).success).toBe(false);
    expect(ConnectionCardSchema.safeParse({ ...card, provider: 'acme' }).success).toBe(false);
    expect(ConnectionCardSchema.safeParse({ ...card, permissions: ['drive_all'] }).success).toBe(false);
  });

  it('accepts every declared state', () => {
    for (const state of ['pending', 'connected', 'denied', 'expired', 'revoked']) {
      expect(ConnectionCardSchema.safeParse({ ...card, state }).success).toBe(true);
    }
  });

  it('does not turn generic output into a card', () => {
    expect(parseConnectionCardEnvelope({ ok: true, data: 'hello' })).toBeNull();
    expect(parseConnectionCardEnvelope(card)).toBeNull();
    expect(parseConnectionCardEnvelope('connection_card')).toBeNull();
    expect(parseConnectionCardEnvelope(null)).toBeNull();
    expect(parseConnectionCardEnvelope({ ...envelope, extra: 1 })).toBeNull();
  });
});
