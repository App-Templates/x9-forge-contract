import { describe, expect, it } from 'vitest';
import {
  WEB_CONNECTION_CARDS_PATH,
  WebConnectionCardsNotFoundSchema,
  WebConnectionCardsQuerySchema,
  WebConnectionCardsResponseSchema,
  webConnectionCardsContract,
} from '../../src/http/endpoints/index.js';
import { ConnectProviderSchema } from '../../src/capability/connect/index.js';

const provider = ConnectProviderSchema.options[0];
const envelope = {
  type: 'connection_card',
  card: {
    cardId: 'card-1',
    provider,
    permissions: [],
    url: 'https://example.com/connect/abc',
    expiresAt: 1_800_000_000,
    state: 'pending',
    reason: 'Serve per leggere la posta',
  },
};

describe('web connection cards contract', () => {
  it('round-trips a valid response', () => {
    const parsed = WebConnectionCardsResponseSchema.parse({ cards: [envelope] });
    expect(parsed.cards[0]).toEqual(envelope);
    expect(WebConnectionCardsResponseSchema.parse({ cards: [] }).cards).toEqual([]);
  });

  it('rejects extra fields', () => {
    expect(WebConnectionCardsResponseSchema.safeParse({ cards: [], extra: 1 }).success).toBe(false);
    expect(WebConnectionCardsQuerySchema.safeParse({ session_id: 's', x: 1 }).success).toBe(false);
  });

  it('rejects a card without the envelope type', () => {
    expect(WebConnectionCardsResponseSchema.safeParse({ cards: [{ card: envelope.card }] }).success).toBe(false);
  });

  it('rejects a query without session_id', () => {
    expect(WebConnectionCardsQuerySchema.safeParse({}).success).toBe(false);
    expect(WebConnectionCardsQuerySchema.safeParse({ session_id: '' }).success).toBe(false);
  });

  it('exposes path, contract and not_found error', () => {
    expect(webConnectionCardsContract.path).toBe(WEB_CONNECTION_CARDS_PATH);
    expect(WebConnectionCardsNotFoundSchema.safeParse({ error: 'not_found' }).success).toBe(true);
    expect(WebConnectionCardsNotFoundSchema.safeParse({ error: 'other' }).success).toBe(false);
  });
});
