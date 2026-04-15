import { describe, it, expect } from 'vitest';
import {
  INTERNAL_SECRET_HEADER,
  INTERNAL_TOKEN_HEADER,
  AuthInternalSecretSchema,
  AuthInternalTokenSchema,
} from '../../src/auth/auth-headers.js';

describe('INTERNAL_SECRET_HEADER', () => {
  it('equals X-Internal-Secret', () => {
    expect(INTERNAL_SECRET_HEADER).toBe('X-Internal-Secret');
  });
});

describe('INTERNAL_TOKEN_HEADER', () => {
  it('equals X-Internal-Token', () => {
    expect(INTERNAL_TOKEN_HEADER).toBe('X-Internal-Token');
  });
});

describe('AuthInternalSecretSchema', () => {
  it('parses valid secret header', () => {
    const result = AuthInternalSecretSchema.parse({
      'X-Internal-Secret': 'my-secret-value',
    });
    expect(result['X-Internal-Secret']).toBe('my-secret-value');
  });

  it('rejects wrong header name (X-Internal-Token instead of X-Internal-Secret)', () => {
    expect(() =>
      AuthInternalSecretSchema.parse({ 'X-Internal-Token': 'wrong-key' }),
    ).toThrow();
  });

  it('rejects empty object (missing header)', () => {
    expect(() => AuthInternalSecretSchema.parse({})).toThrow();
  });

  it('rejects empty string value (min(1) violation)', () => {
    expect(() =>
      AuthInternalSecretSchema.parse({ 'X-Internal-Secret': '' }),
    ).toThrow();
  });

  it('rejects non-string value', () => {
    expect(() =>
      AuthInternalSecretSchema.parse({ 'X-Internal-Secret': 123 }),
    ).toThrow();
  });
});

describe('AuthInternalTokenSchema', () => {
  it('parses valid token header', () => {
    const result = AuthInternalTokenSchema.parse({
      'X-Internal-Token': 'my-token-value',
    });
    expect(result['X-Internal-Token']).toBe('my-token-value');
  });

  it('rejects wrong header name (X-Internal-Secret instead of X-Internal-Token)', () => {
    expect(() =>
      AuthInternalTokenSchema.parse({ 'X-Internal-Secret': 'wrong-key' }),
    ).toThrow();
  });

  it('rejects empty object (missing header)', () => {
    expect(() => AuthInternalTokenSchema.parse({})).toThrow();
  });

  it('rejects empty string value (min(1) violation)', () => {
    expect(() =>
      AuthInternalTokenSchema.parse({ 'X-Internal-Token': '' }),
    ).toThrow();
  });
});

// Type-level documentation: assigning AuthInternalSecret to a variable
// typed as AuthInternalToken is a TypeScript error — they are structurally
// distinct (different key names in the object type).
