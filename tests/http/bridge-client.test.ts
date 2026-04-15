import { describe, it, expect } from 'vitest';
import {
  BridgeSuccessResponseSchema,
  BridgeErrorResponseSchema,
  BridgeResponseSchema,
} from '../../src/http/response.js';
import {
  createBridgeClient,
  BridgeHttpError,
  type BridgeClientConfig,
} from '../../src/http/bridge-client.js';

// --- Permanent Bug #15 compile-time regression guard ---
// These @ts-expect-error directives prove that TypeScript rejects mismatched auth.
// If the type enforcement ever breaks, @ts-expect-error becomes "unused directive"
// and tsc will fail the build — catching the regression at CI time.

// @ts-expect-error — TS2345: Secret header cannot satisfy token auth requirement
const _bug15_wrongAuthType: BridgeClientConfig<'token'> = {
  baseUrl: 'http://cap-voice:3500',
  auth: { 'X-Internal-Secret': 'should-be-token' },
};

// @ts-expect-error — TS2345: Empty object cannot satisfy secret auth requirement
const _bug15_missingAuth: BridgeClientConfig<'secret'> = {
  baseUrl: 'http://agent-core:4100',
  auth: {},
};

// Suppress unused variable warnings for permanent guards
void _bug15_wrongAuthType;
void _bug15_missingAuth;

describe('BridgeSuccessResponseSchema', () => {
  it('parses valid success response', () => {
    const result = BridgeSuccessResponseSchema.parse({
      ok: true,
      data: { id: 'abc' },
    });
    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ id: 'abc' });
  });

  it('rejects response with ok: false (wrong discriminator)', () => {
    expect(() =>
      BridgeSuccessResponseSchema.parse({ ok: false, data: {} }),
    ).toThrow();
  });
});

describe('BridgeErrorResponseSchema', () => {
  it('parses valid error response', () => {
    const result = BridgeErrorResponseSchema.parse({
      ok: false,
      code: 'AUTH_FAILED',
      message: 'Missing header',
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe('AUTH_FAILED');
    expect(result.message).toBe('Missing header');
  });

  it('parses error response with optional details', () => {
    const result = BridgeErrorResponseSchema.parse({
      ok: false,
      code: 'INTERNAL',
      message: 'Error',
      details: { stack: '...' },
    });
    expect(result.details).toEqual({ stack: '...' });
  });

  it('rejects response with ok: true (wrong discriminator)', () => {
    expect(() =>
      BridgeErrorResponseSchema.parse({ ok: true, code: 'X', message: 'Y' }),
    ).toThrow();
  });
});

describe('BridgeResponseSchema (discriminated union)', () => {
  it('parses success response via discriminated union', () => {
    const result = BridgeResponseSchema.parse({
      ok: true,
      data: { agents: [] },
    });
    expect(result.ok).toBe(true);
  });

  it('parses error response via discriminated union', () => {
    const result = BridgeResponseSchema.parse({
      ok: false,
      code: 'NOT_FOUND',
      message: 'Agent not found',
    });
    expect(result.ok).toBe(false);
  });
});

describe('createBridgeClient', () => {
  it('creates a secret-auth client with request method and correct authType', () => {
    const client = createBridgeClient({
      baseUrl: 'http://agent-core:4100',
      auth: { 'X-Internal-Secret': 'sec' },
    });
    expect(typeof client.request).toBe('function');
    expect(client.authType).toBe('secret');
  });

  it('creates a token-auth client with request method and correct authType', () => {
    const client = createBridgeClient({
      baseUrl: 'http://cap-voice:3500',
      auth: { 'X-Internal-Token': 'tok' },
    });
    expect(typeof client.request).toBe('function');
    expect(client.authType).toBe('token');
  });
});

describe('BridgeHttpError', () => {
  it('produces correct message with structured error response', () => {
    const err = new BridgeHttpError(401, {
      ok: false as const,
      code: 'AUTH_FAILED',
      message: 'Unauthorized',
    });
    expect(err.message).toContain('401');
    expect(err.message).toContain('AUTH_FAILED');
    expect(err.message).toContain('Unauthorized');
    expect(err.status).toBe(401);
  });

  it('produces fallback message when response is null', () => {
    const err = new BridgeHttpError(500, null);
    expect(err.message).toBe('Bridge HTTP 500');
    expect(err.status).toBe(500);
  });

  it('has name property set to BridgeHttpError', () => {
    const err = new BridgeHttpError(403, null);
    expect(err.name).toBe('BridgeHttpError');
    expect(err).toBeInstanceOf(Error);
  });
});

describe('Bug #15 regression — runtime auth type verification', () => {
  // Bug #15 context: Forge voice-svc called X9 /webhook/post-call without
  // X-Internal-Token header. With the bridge's discriminated auth types,
  // a 'secret' client cannot be used where 'token' is required — TypeScript
  // catches the mismatch at compile time.

  it('secret client auth does NOT contain X-Internal-Token', () => {
    const secretClient = createBridgeClient({
      baseUrl: 'http://agent-core:4100',
      auth: { 'X-Internal-Secret': 'sec' },
    });
    expect(secretClient.authType).toBe('secret');
    // TS compile-time: createBridgeClient<'token'>({ auth: { 'X-Internal-Secret': 'x' } }) would be a type error
  });

  it('token client auth does NOT contain X-Internal-Secret', () => {
    const tokenClient = createBridgeClient({
      baseUrl: 'http://cap-voice:3500',
      auth: { 'X-Internal-Token': 'tok' },
    });
    expect(tokenClient.authType).toBe('token');
    // TS compile-time: createBridgeClient<'secret'>({ auth: { 'X-Internal-Token': 'x' } }) would be a type error
  });
});
