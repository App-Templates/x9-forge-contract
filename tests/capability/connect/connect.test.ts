import { describe, expect, it } from 'vitest';
import {
  CONNECT_LINK_LIMITS,
  CONNECT_PERMIT_MAX_TTL_SECONDS,
  ConnectRevokeRequestSchema,
  ConnectRevokeResponseSchema,
  ConnectStartRequestSchema,
  ConnectStartResponseSchema,
  ConnectStateResponseSchema,
  ConnectScopeSchema,
  ConnectToolPermitSchema,
} from '../../../src/capability/index.js';

const start = { agentId: 'a1', personRef: 'p1', conversationId: 'c1', provider: 'google', scopes: ['calendar_events'] };
const state = { agentId: 'a1', provider: 'google', status: 'connected', accountLabel: 'x@y.it', scopes: ['mail_send'], connectedAt: 1760000000 };
const permit = { agentId: 'a1', provider: 'google', scopes: ['calendar_events'], issuedAt: 1760000000, expiresAt: 1760003600 };

describe('connect contracts', () => {
  // Mutation: changing CONNECT_LINK_LIMITS values fails this.
  it('exposes the link limits', () => {
    expect(CONNECT_LINK_LIMITS).toEqual({ ttlSeconds: 600, stateBytes: 32 });
    expect(CONNECT_PERMIT_MAX_TTL_SECONDS).toBe(3600);
  });

  // Mutation: removing .strict() from the start request fails the extra-field case.
  it('accepts a valid start request and rejects extra fields', () => {
    expect(ConnectStartRequestSchema.safeParse(start).success).toBe(true);
    expect(ConnectStartRequestSchema.safeParse({ ...start, extra: 1 }).success).toBe(false);
  });

  // Mutation: removing min(1) fails the empty case; removing the duplicate refine fails the duplicate case; widening the enum fails the unknown case.
  it('rejects empty, duplicate and unknown scopes', () => {
    expect(ConnectStartRequestSchema.safeParse({ ...start, scopes: [] }).success).toBe(false);
    expect(ConnectStartRequestSchema.safeParse({ ...start, scopes: ['mail_send', 'mail_send'] }).success).toBe(false);
    expect(ConnectStartRequestSchema.safeParse({ ...start, scopes: ['mail_write'] }).success).toBe(false);
  });

  // Mutation: dropping the https refine fails the http case; dropping the discriminated error branch fails the failure case.
  it('validates the start response: https only, explicit failure', () => {
    const ok = { ok: true, linkUrl: 'https://connect.example.com/l/abc', expiresAt: 1760000600 };
    expect(ConnectStartResponseSchema.safeParse(ok).success).toBe(true);
    expect(ConnectStartResponseSchema.safeParse({ ...ok, linkUrl: 'http://connect.example.com/l/abc' }).success).toBe(false);
    expect(ConnectStartResponseSchema.safeParse({ ...ok, expiresAt: 1.5 }).success).toBe(false);
    expect(ConnectStartResponseSchema.safeParse({ ok: false, error: 'provider_unavailable' }).success).toBe(true);
    expect(ConnectStartResponseSchema.safeParse({ ok: false }).success).toBe(false);
  });

  // Mutation: removing .strict() from the state schema lets token fields through and fails this.
  it('accepts a valid state and rejects token-like fields', () => {
    expect(ConnectStateResponseSchema.safeParse(state).success).toBe(true);
    for (const field of ['accessToken', 'refreshToken', 'value', 'code']) {
      expect(ConnectStateResponseSchema.safeParse({ ...state, [field]: 'secret' }).success).toBe(false);
    }
  });

  // Mutation: removing max(200) from accountLabel fails the long label case; widening the status enum fails the unknown status.
  it('bounds the account label and status', () => {
    expect(ConnectStateResponseSchema.safeParse({ ...state, accountLabel: 'a'.repeat(201) }).success).toBe(false);
    expect(ConnectStateResponseSchema.safeParse({ ...state, status: 'pending' }).success).toBe(false);
  });

  // Mutation: removing .strict() from the revoke schemas fails the extra-field cases.
  it('validates revoke request and response', () => {
    expect(ConnectRevokeRequestSchema.safeParse({ agentId: 'a1', provider: 'google' }).success).toBe(true);
    expect(ConnectRevokeRequestSchema.safeParse({ agentId: 'a1', provider: 'google', x: 1 }).success).toBe(false);
    expect(ConnectRevokeResponseSchema.safeParse({ ok: true, status: 'revoked' }).success).toBe(true);
    expect(ConnectRevokeResponseSchema.safeParse({ ok: true, status: 'revoked', x: 1 }).success).toBe(false);
  });

  // Mutation: removing the scope min/duplicate checks or .strict() fails the cases below.
  it('validates the tool permit', () => {
    expect(ConnectToolPermitSchema.safeParse(permit).success).toBe(true);
    expect(ConnectToolPermitSchema.safeParse({ ...permit, extra: 1 }).success).toBe(false);
    expect(ConnectToolPermitSchema.safeParse({ ...permit, scopes: [] }).success).toBe(false);
  });

  // Mutation: removing any supported scope fails its acceptance checks at every boundary.
  it('accepts draft and read scopes and rejects unsupported permissions', () => {
    for (const scope of ['calendar_events', 'contacts_read', 'mail_send', 'mail_draft', 'mail_read', 'drive_read']) {
      expect(ConnectScopeSchema.safeParse(scope).success).toBe(true);
      expect(ConnectStartRequestSchema.safeParse({ ...start, scopes: [scope] }).success).toBe(true);
      expect(ConnectToolPermitSchema.safeParse({ ...permit, scopes: [scope] }).success).toBe(true);
      expect(ConnectStateResponseSchema.safeParse({ ...state, scopes: [scope] }).success).toBe(true);
    }
    // Mutation: widening the enum to admit any unsupported permission fails these rejections.
    for (const scope of ['mail_write', 'drive_write', 'docs_read', 'gmail.readonly']) {
      expect(ConnectScopeSchema.safeParse(scope).success).toBe(false);
      expect(ConnectStartRequestSchema.safeParse({ ...start, scopes: [scope] }).success).toBe(false);
      expect(ConnectToolPermitSchema.safeParse({ ...permit, scopes: [scope] }).success).toBe(false);
      expect(ConnectStateResponseSchema.safeParse({ ...state, scopes: [scope] }).success).toBe(false);
    }
  });

  // Mutation: removing the TTL refine fails the 3601 s case; removing the expiresAt > issuedAt check fails the past-expiry case.
  it('rejects a permit longer than 3600 seconds or already expired', () => {
    expect(ConnectToolPermitSchema.safeParse({ ...permit, expiresAt: permit.issuedAt + 3601 }).success).toBe(false);
    expect(ConnectToolPermitSchema.safeParse({ ...permit, expiresAt: permit.issuedAt }).success).toBe(false);
  });
});
