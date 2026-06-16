import { describe, it, expect } from 'vitest';
import type { EndpointContract } from '../../../src/http/endpoint-contract.js';
import {
  InternalFactoryTelegramTokenParamsSchema,
  InternalFactoryTelegramTokenRequestSchema,
  InternalFactoryTelegramTokenResponseSchema,
  InternalFactoryTelegramTokenErrorResponseSchema,
  internalFactoryTelegramTokenContract,
} from '../../../src/http/endpoints/internal-factory-telegram-token.js';

describe('internalFactoryTelegramTokenContract', () => {
  // Test 1
  it("declares method PATCH", () => {
    expect(internalFactoryTelegramTokenContract.method).toBe('PATCH');
  });

  // Test 2
  it('declares path /api/internal/factory/agents/:slug/telegram-token', () => {
    expect(internalFactoryTelegramTokenContract.path).toBe(
      '/api/internal/factory/agents/:slug/telegram-token',
    );
  });

  // Test 3
  it('declares token auth', () => {
    expect(internalFactoryTelegramTokenContract.authType).toBe('token');
  });

  // Test 11 — union widen: the contract is assignable where a PATCH-method
  // EndpointContract is expected. This is a typecheck-only assertion; if the
  // EndpointContract TMethod union did NOT admit 'PATCH', `tsc --noEmit` would
  // reject this annotation (no ts-expect-error needed — it must COMPILE).
  it('conforms to the widened EndpointContract doc-type with method PATCH', () => {
    const typed: EndpointContract<
      'PATCH',
      typeof internalFactoryTelegramTokenContract.path,
      'token',
      typeof InternalFactoryTelegramTokenParamsSchema,
      typeof InternalFactoryTelegramTokenRequestSchema,
      typeof InternalFactoryTelegramTokenResponseSchema
    > = internalFactoryTelegramTokenContract;
    expect(typed.method).toBe('PATCH');
  });
});

describe('InternalFactoryTelegramTokenParamsSchema', () => {
  // Test 4
  it('parses a valid slug', () => {
    expect(InternalFactoryTelegramTokenParamsSchema.parse({ slug: 'lauragri' }).slug).toBe(
      'lauragri',
    );
  });

  // Test 5
  it('rejects an uppercase/underscore/bang slug', () => {
    expect(
      InternalFactoryTelegramTokenParamsSchema.safeParse({ slug: 'Bad_Slug!' }).success,
    ).toBe(false);
  });
});

describe('InternalFactoryTelegramTokenRequestSchema', () => {
  // Test 6
  it('parses a request with token only (username optional)', () => {
    const r = InternalFactoryTelegramTokenRequestSchema.parse({ telegram_bot_token: '123:ABC' });
    expect(r.telegram_bot_token).toBe('123:ABC');
    expect(r.telegram_bot_username).toBeUndefined();
  });

  // Test 7
  it('rejects an empty token (rotate REQUIRES a non-empty token)', () => {
    expect(
      InternalFactoryTelegramTokenRequestSchema.safeParse({ telegram_bot_token: '' }).success,
    ).toBe(false);
  });

  // Test 8
  it('parses a request with token + username', () => {
    const r = InternalFactoryTelegramTokenRequestSchema.parse({
      telegram_bot_token: '123:ABC',
      telegram_bot_username: 'lauragri_bot',
    });
    expect(r.telegram_bot_username).toBe('lauragri_bot');
  });
});

describe('InternalFactoryTelegramTokenResponseSchema', () => {
  // Test 9
  it('parses a valid success response with reloaded boolean', () => {
    const r = InternalFactoryTelegramTokenResponseSchema.parse({
      ok: true,
      slug: 'lauragri',
      reloaded: true,
    });
    expect(r.ok).toBe(true);
    expect(r.slug).toBe('lauragri');
    expect(r.reloaded).toBe(true);
    expect(r.telegramBotUsername).toBeUndefined();
  });

  it('accepts null telegramBotUsername + reloaded false (bot-less / skipped)', () => {
    const r = InternalFactoryTelegramTokenResponseSchema.parse({
      ok: true,
      slug: 'lauragri',
      telegramBotUsername: null,
      reloaded: false,
    });
    expect(r.telegramBotUsername).toBeNull();
    expect(r.reloaded).toBe(false);
  });

  // Test 10
  it('rejects an error-shaped payload against the SUCCESS schema', () => {
    expect(
      InternalFactoryTelegramTokenResponseSchema.safeParse({ ok: false, error: 'x' }).success,
    ).toBe(false);
  });
});

describe('InternalFactoryTelegramTokenErrorResponseSchema', () => {
  it('parses a valid error response (distinct error shape, deploy convention)', () => {
    const r = InternalFactoryTelegramTokenErrorResponseSchema.parse({
      ok: false,
      error: 'agent not found',
    });
    expect(r.ok).toBe(false);
    expect(r.error).toBe('agent not found');
  });
});
