import { describe, expect, it } from 'vitest';
import {
  DevelopmentSessionConsentSchema,
  DevelopmentSessionPairingChallengeSchema,
  isDevelopmentSessionConsentForChallenge,
} from '../../../src/capability/connect/index.js';
import * as capability from '../../../src/capability/index.js';

const challenge = {
  binding: {
    scope: { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' },
    sessionId: 'session-1',
    target: { kind: 'local', deviceId: 'device-1' },
    engines: ['claude', 'codex'],
  },
  pairingId: 'pairing-1',
  nonce: 'AAAAAAAAAAAAAAAAAAAAAA',
  issuedAt: '2026-10-16T10:00:00Z',
  expiresAt: '2026-10-16T10:10:00Z',
};
const cloudChallenge = { ...challenge, binding: {
  ...challenge.binding, target: { kind: 'cloud', connectionRef: 'connection-1' },
} };
const consent = { challenge, consentedAt: '2026-10-16T10:05:00Z' };
const nowMs = Date.parse(consent.consentedAt);

describe('development session pairing', () => {
  it('accepts local and cloud with each engine choice', () => {
    for (const base of [challenge, cloudChallenge]) {
      for (const engines of [['claude'], ['codex'], ['claude', 'codex']]) {
        const expected = { ...base, binding: { ...base.binding, engines } };
        expect(isDevelopmentSessionConsentForChallenge({ ...consent, challenge: expected }, expected, nowMs)).toBe(true);
      }
    }
  });
  it('accepts reordered keys and engine order', () => {
    const reordered = {
      expiresAt: challenge.expiresAt, nonce: challenge.nonce, issuedAt: challenge.issuedAt,
      pairingId: challenge.pairingId,
      binding: { engines: ['codex', 'claude'], target: { deviceId: 'device-1', kind: 'local' },
        sessionId: 'session-1', scope: { agentId: 'agent-1', ownerId: 'owner-1', tenantId: 'tenant-1' } },
    };
    expect(isDevelopmentSessionConsentForChallenge({ consentedAt: consent.consentedAt, challenge: reordered }, challenge, nowMs)).toBe(true);
  });
  it('accepts consent and clock at issuance', () => {
    expect(isDevelopmentSessionConsentForChallenge({ ...consent, consentedAt: challenge.issuedAt }, challenge, Date.parse(challenge.issuedAt))).toBe(true);
  });
  it('accepts the last millisecond before expiry', () => {
    const time = Date.parse(challenge.expiresAt) - 1;
    expect(isDevelopmentSessionConsentForChallenge({ ...consent, consentedAt: new Date(time).toISOString() }, challenge, time)).toBe(true);
  });
  it('exports through the capability barrel', () => {
    expect(capability.DevelopmentSessionConsentSchema === DevelopmentSessionConsentSchema
      && capability.DevelopmentSessionPairingChallengeSchema === DevelopmentSessionPairingChallengeSchema
      && capability.isDevelopmentSessionConsentForChallenge === isDevelopmentSessionConsentForChallenge).toBe(true);
  });
  it("rejects different pairingId", () => {
    expect(DevelopmentSessionConsentSchema.safeParse({ ...consent, challenge: { ...challenge, pairingId: 'pairing-other' } }).success).toBe(true);
    const rejected1 = isDevelopmentSessionConsentForChallenge({ ...consent, challenge: { ...challenge, pairingId: 'pairing-other' } }, challenge, nowMs);
    expect(rejected1).toBe(false);
  });
  it("rejects different nonce", () => {
    expect(DevelopmentSessionConsentSchema.safeParse({ ...consent, challenge: { ...challenge, nonce: 'BBBBBBBBBBBBBBBBBBBBBB' } }).success).toBe(true);
    const rejected2 = isDevelopmentSessionConsentForChallenge({ ...consent, challenge: { ...challenge, nonce: 'BBBBBBBBBBBBBBBBBBBBBB' } }, challenge, nowMs);
    expect(rejected2).toBe(false);
  });
  it("rejects different issuedAt", () => {
    expect(DevelopmentSessionConsentSchema.safeParse({ ...consent, challenge: { ...challenge, issuedAt: '2026-10-16T10:00:01Z' } }).success).toBe(true);
    const rejected3 = isDevelopmentSessionConsentForChallenge({ ...consent, challenge: { ...challenge, issuedAt: '2026-10-16T10:00:01Z' } }, challenge, nowMs);
    expect(rejected3).toBe(false);
  });
  it("rejects different expiresAt", () => {
    expect(DevelopmentSessionConsentSchema.safeParse({ ...consent, challenge: { ...challenge, expiresAt: '2026-10-16T10:09:59Z' } }).success).toBe(true);
    const rejected4 = isDevelopmentSessionConsentForChallenge({ ...consent, challenge: { ...challenge, expiresAt: '2026-10-16T10:09:59Z' } }, challenge, nowMs);
    expect(rejected4).toBe(false);
  });
  it("rejects different sessionId", () => {
    expect(DevelopmentSessionConsentSchema.safeParse({ ...consent, challenge: { ...challenge, binding: { ...challenge.binding, sessionId: 'session-other' } } }).success).toBe(true);
    const rejected5 = isDevelopmentSessionConsentForChallenge({ ...consent, challenge: { ...challenge, binding: { ...challenge.binding, sessionId: 'session-other' } } }, challenge, nowMs);
    expect(rejected5).toBe(false);
  });
  it("rejects different tenantId", () => {
    expect(DevelopmentSessionConsentSchema.safeParse({ ...consent, challenge: { ...challenge, binding: { ...challenge.binding, scope: { ...challenge.binding.scope, tenantId: 'identity-other' } } } }).success).toBe(true);
    const rejected6 = isDevelopmentSessionConsentForChallenge({ ...consent, challenge: { ...challenge, binding: { ...challenge.binding, scope: { ...challenge.binding.scope, tenantId: 'identity-other' } } } }, challenge, nowMs);
    expect(rejected6).toBe(false);
  });
  it("rejects different ownerId", () => {
    expect(DevelopmentSessionConsentSchema.safeParse({ ...consent, challenge: { ...challenge, binding: { ...challenge.binding, scope: { ...challenge.binding.scope, ownerId: 'identity-other' } } } }).success).toBe(true);
    const rejected7 = isDevelopmentSessionConsentForChallenge({ ...consent, challenge: { ...challenge, binding: { ...challenge.binding, scope: { ...challenge.binding.scope, ownerId: 'identity-other' } } } }, challenge, nowMs);
    expect(rejected7).toBe(false);
  });
  it("rejects different agentId", () => {
    expect(DevelopmentSessionConsentSchema.safeParse({ ...consent, challenge: { ...challenge, binding: { ...challenge.binding, scope: { ...challenge.binding.scope, agentId: 'identity-other' } } } }).success).toBe(true);
    const rejected8 = isDevelopmentSessionConsentForChallenge({ ...consent, challenge: { ...challenge, binding: { ...challenge.binding, scope: { ...challenge.binding.scope, agentId: 'identity-other' } } } }, challenge, nowMs);
    expect(rejected8).toBe(false);
  });
  it("rejects different target kind", () => {
    expect(DevelopmentSessionConsentSchema.safeParse({ ...consent, challenge: { ...challenge, binding: { ...challenge.binding, target: { kind: 'cloud', connectionRef: 'connection-1' } } } }).success).toBe(true);
    const rejected9 = isDevelopmentSessionConsentForChallenge({ ...consent, challenge: { ...challenge, binding: { ...challenge.binding, target: { kind: 'cloud', connectionRef: 'connection-1' } } } }, challenge, nowMs);
    expect(rejected9).toBe(false);
  });
  it("rejects different local device", () => {
    expect(DevelopmentSessionConsentSchema.safeParse({ ...consent, challenge: { ...challenge, binding: { ...challenge.binding, target: { kind: 'local', deviceId: 'device-2' } } } }).success).toBe(true);
    const rejected10 = isDevelopmentSessionConsentForChallenge({ ...consent, challenge: { ...challenge, binding: { ...challenge.binding, target: { kind: 'local', deviceId: 'device-2' } } } }, challenge, nowMs);
    expect(rejected10).toBe(false);
  });
  it("rejects different cloud reference", () => {
    expect(DevelopmentSessionConsentSchema.safeParse({ ...consent, challenge: { ...cloudChallenge, binding: { ...cloudChallenge.binding, target: { kind: 'cloud', connectionRef: 'connection-2' } } } }).success).toBe(true);
    const rejected11 = isDevelopmentSessionConsentForChallenge({ ...consent, challenge: { ...cloudChallenge, binding: { ...cloudChallenge.binding, target: { kind: 'cloud', connectionRef: 'connection-2' } } } }, cloudChallenge, nowMs);
    expect(rejected11).toBe(false);
  });
  it("rejects engine subset", () => {
    expect(DevelopmentSessionConsentSchema.safeParse({ ...consent, challenge: { ...challenge, binding: { ...challenge.binding, engines: ['claude'] } } }).success).toBe(true);
    const rejected12 = isDevelopmentSessionConsentForChallenge({ ...consent, challenge: { ...challenge, binding: { ...challenge.binding, engines: ['claude'] } } }, challenge, nowMs);
    expect(rejected12).toBe(false);
  });
  it("rejects a single different engine", () => {
    expect(DevelopmentSessionConsentSchema.safeParse({ ...consent, challenge: { ...challenge, binding: { ...challenge.binding, engines: ['codex'] } } }).success).toBe(true);
    const rejected13 = isDevelopmentSessionConsentForChallenge({ ...consent, challenge: { ...challenge, binding: { ...challenge.binding, engines: ['codex'] } } }, { ...challenge, binding: { ...challenge.binding, engines: ['claude'] } }, nowMs);
    expect(rejected13).toBe(false);
  });
  it("rejects malformed consent through parsing", () => {
    const rejected14 = isDevelopmentSessionConsentForChallenge({ ...consent, unexpected: true }, challenge, nowMs);
    expect(rejected14).toBe(false);
  });
  it("rejects malformed expected through parsing", () => {
    const rejected15 = isDevelopmentSessionConsentForChallenge(consent, { ...challenge, unexpected: true }, nowMs);
    expect(rejected15).toBe(false);
  });
  it("rejects nonfinite NaN", () => {
    const rejected16 = isDevelopmentSessionConsentForChallenge(consent, challenge, Number.NaN);
    expect(rejected16).toBe(false);
  });
  it("rejects expired clock", () => {
    const rejected17 = isDevelopmentSessionConsentForChallenge(consent, challenge, Date.parse(challenge.expiresAt) + 1);
    expect(rejected17).toBe(false);
  });
  it("rejects the exact clock expiry", () => {
    const rejected18 = isDevelopmentSessionConsentForChallenge(consent, challenge, Date.parse(challenge.expiresAt));
    expect(rejected18).toBe(false);
  });
  it("rejects future consent", () => {
    const rejected19 = isDevelopmentSessionConsentForChallenge({ ...consent, consentedAt: '2026-10-16T10:05:01Z' }, challenge, nowMs);
    expect(rejected19).toBe(false);
  });
  it("rejects challenge extra", () => {
    const rejected20 = DevelopmentSessionPairingChallengeSchema.safeParse({ ...challenge, extra: true }).success;
    expect(rejected20).toBe(false);
  });
  it("rejects consent extra", () => {
    const rejected21 = DevelopmentSessionConsentSchema.safeParse({ ...consent, extra: true }).success;
    expect(rejected21).toBe(false);
  });
  it("validates the reused binding", () => {
    const rejected22 = DevelopmentSessionPairingChallengeSchema.safeParse({ ...challenge, binding: { ...challenge.binding, engines: ['claude', 'claude'] } }).success;
    expect(rejected22).toBe(false);
  });
  it("requires a nonempty pairing id", () => {
    const rejected23 = DevelopmentSessionPairingChallengeSchema.safeParse({ ...challenge, pairingId: '' }).success;
    expect(rejected23).toBe(false);
  });
  it("reuses the device nonce format", () => {
    const rejected24 = DevelopmentSessionPairingChallengeSchema.safeParse({ ...challenge, nonce: 'short' }).success;
    expect(rejected24).toBe(false);
  });
  it("requires ISO issuedAt", () => {
    const rejected25 = DevelopmentSessionPairingChallengeSchema.safeParse({ ...challenge, issuedAt: '2026-10-16 10:00:00Z' }).success;
    expect(rejected25).toBe(false);
  });
  it("requires ISO expiresAt", () => {
    const rejected26 = DevelopmentSessionPairingChallengeSchema.safeParse({ ...challenge, expiresAt: '2026-10-16 10:10:00Z' }).success;
    expect(rejected26).toBe(false);
  });
  it("requires ISO consentedAt", () => {
    const rejected27 = DevelopmentSessionConsentSchema.safeParse({ ...consent, consentedAt: '2026-10-16 10:05:00Z' }).success;
    expect(rejected27).toBe(false);
  });
  it("rejects reversed challenge lifetime", () => {
    const rejected28 = DevelopmentSessionPairingChallengeSchema.safeParse({ ...challenge, expiresAt: '2026-10-16T09:59:59Z' }).success;
    expect(rejected28).toBe(false);
  });
  it("rejects equal challenge endpoints", () => {
    const rejected29 = DevelopmentSessionPairingChallengeSchema.safeParse({ ...challenge, expiresAt: challenge.issuedAt }).success;
    expect(rejected29).toBe(false);
  });
  it("validates the nested challenge", () => {
    const rejected30 = DevelopmentSessionConsentSchema.safeParse({ ...consent, challenge: { ...challenge, pairingId: '' } }).success;
    expect(rejected30).toBe(false);
  });
  it("rejects consent before issuance", () => {
    const rejected31 = DevelopmentSessionConsentSchema.safeParse({ ...consent, consentedAt: '2026-10-16T09:59:59Z' }).success;
    expect(rejected31).toBe(false);
  });
  it("rejects consent after expiry", () => {
    const rejected32 = DevelopmentSessionConsentSchema.safeParse({ ...consent, consentedAt: '2026-10-16T10:10:01Z' }).success;
    expect(rejected32).toBe(false);
  });
  it("rejects consent exactly at expiry", () => {
    const rejected33 = DevelopmentSessionConsentSchema.safeParse({ ...consent, consentedAt: challenge.expiresAt }).success;
    expect(rejected33).toBe(false);
  });
  it('rejects malformed and foreign inputs without throwing', () => {
    for (const raw of [null, false, 'yes', {}, [], { ...consent, challenge: null },
      { ...consent, challenge: { ...challenge, binding: { ...challenge.binding, scope: { ...challenge.binding.scope, userId: 'foreign' } } } }]) {
      expect(isDevelopmentSessionConsentForChallenge(raw, challenge, nowMs)).toBe(false);
      expect(isDevelopmentSessionConsentForChallenge(consent, raw, nowMs)).toBe(false);
    }
  });
  it('rejects infinite clocks and a clock before issuance', () => {
    for (const time of [Infinity, -Infinity, Date.parse(challenge.issuedAt) - 1]) {
      expect(isDevelopmentSessionConsentForChallenge(consent, challenge, time)).toBe(false);
    }
  });
  it('rejects invalid and missing schema fields', () => {
    for (const field of ['binding', 'pairingId', 'nonce', 'issuedAt', 'expiresAt']) {
      const incomplete: Record<string, unknown> = { ...challenge };
      delete incomplete[field];
      expect(DevelopmentSessionPairingChallengeSchema.safeParse(incomplete).success).toBe(false);
    }
    for (const time of ['nonsense', '2026-02-30T10:00:00Z']) {
      expect(DevelopmentSessionPairingChallengeSchema.safeParse({ ...challenge, issuedAt: time }).success).toBe(false);
      expect(DevelopmentSessionConsentSchema.safeParse({ ...consent, consentedAt: time }).success).toBe(false);
    }
    expect(DevelopmentSessionConsentSchema.safeParse({ challenge }).success).toBe(false);
    expect(DevelopmentSessionConsentSchema.safeParse({ consentedAt: consent.consentedAt }).success).toBe(false);
    expect(DevelopmentSessionPairingChallengeSchema.safeParse({ ...challenge, expiresAt: '2026-10-16T09:59:59Z' }).success).toBe(false);
  });
});
