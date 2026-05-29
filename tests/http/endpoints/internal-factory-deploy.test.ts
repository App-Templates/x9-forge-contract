import { describe, it, expect } from 'vitest';
import {
  InternalFactoryDeployRequestSchema,
  InternalFactoryDeployResponseSchema,
  InternalFactoryDeployErrorResponseSchema,
  internalFactoryDeployContract,
} from '../../../src/http/endpoints/internal-factory-deploy.js';

describe('InternalFactoryDeployRequestSchema', () => {
  it('parses a minimal valid request (name only)', () => {
    const r = InternalFactoryDeployRequestSchema.parse({ name: 'Giovanni Bellotti' });
    expect(r.name).toBe('Giovanni Bellotti');
    expect(r.selectedCapabilities).toEqual([]); // default
  });

  it('parses a full Parallel character deploy request', () => {
    const r = InternalFactoryDeployRequestSchema.parse({
      name: 'Giovanni Bellotti',
      slug: 'char-bellotti-abc123',
      ownerId: 'owner-1',
      selectedCapabilities: ['cap-email'],
      inboundForwardUrl: 'http://parallel-prod-inbound-router-svc:4034/webhook/inbound',
      telegram_allow_from: ['6244251507'],
    });
    expect(r.slug).toBe('char-bellotti-abc123');
    expect(r.inboundForwardUrl).toBe(
      'http://parallel-prod-inbound-router-svc:4034/webhook/inbound',
    );
    expect(r.selectedCapabilities).toEqual(['cap-email']);
  });

  it('accepts null inboundForwardUrl (explicit no-forward)', () => {
    const r = InternalFactoryDeployRequestSchema.parse({ name: 'X', inboundForwardUrl: null });
    expect(r.inboundForwardUrl).toBeNull();
  });

  it('accepts absent inboundForwardUrl (non-forwarding agent)', () => {
    const r = InternalFactoryDeployRequestSchema.parse({ name: 'X' });
    expect(r.inboundForwardUrl).toBeUndefined();
  });

  it('rejects a malformed inboundForwardUrl', () => {
    expect(() =>
      InternalFactoryDeployRequestSchema.parse({ name: 'X', inboundForwardUrl: 'not-a-url' }),
    ).toThrow();
  });

  it('rejects an uppercase/invalid slug', () => {
    expect(() =>
      InternalFactoryDeployRequestSchema.parse({ name: 'X', slug: 'Char_Bellotti' }),
    ).toThrow();
  });

  it('rejects an empty name', () => {
    expect(() => InternalFactoryDeployRequestSchema.parse({ name: '' })).toThrow();
  });

  it('rejects a non-slug capability hostname', () => {
    expect(() =>
      InternalFactoryDeployRequestSchema.parse({ name: 'X', selectedCapabilities: ['Cap Email'] }),
    ).toThrow();
  });
});

describe('InternalFactoryDeployResponseSchema', () => {
  it('parses a valid success response', () => {
    const r = InternalFactoryDeployResponseSchema.parse({
      ok: true,
      slug: 'char-bellotti-abc123',
      agentId: 'char-bellotti-abc123',
      email: 'char-bellotti-abc123@agentmail.to',
      telegramBotUsername: 'char_bellotti_abc123_bot',
    });
    expect(r.ok).toBe(true);
    expect(r.telegramBotUsername).toBe('char_bellotti_abc123_bot');
  });

  it('accepts null email + absent telegramBotUsername', () => {
    const r = InternalFactoryDeployResponseSchema.parse({
      ok: true,
      slug: 's',
      agentId: 's',
      email: null,
    });
    expect(r.email).toBeNull();
  });

  it('rejects a response missing agentId', () => {
    expect(() =>
      InternalFactoryDeployResponseSchema.parse({ ok: true, slug: 's', email: null }),
    ).toThrow();
  });
});

describe('InternalFactoryDeployErrorResponseSchema', () => {
  it('parses a valid error response', () => {
    const r = InternalFactoryDeployErrorResponseSchema.parse({ ok: false, error: 'slug taken' });
    expect(r.ok).toBe(false);
    expect(r.error).toBe('slug taken');
  });
});

describe('internalFactoryDeployContract', () => {
  it('declares POST /api/internal/factory/deploy with token auth', () => {
    expect(internalFactoryDeployContract.method).toBe('POST');
    expect(internalFactoryDeployContract.path).toBe('/api/internal/factory/deploy');
    expect(internalFactoryDeployContract.authType).toBe('token');
  });

  it('binds the request + response schemas', () => {
    expect(internalFactoryDeployContract.bodySchema).toBe(InternalFactoryDeployRequestSchema);
    expect(internalFactoryDeployContract.responseSchema).toBe(InternalFactoryDeployResponseSchema);
  });
});
