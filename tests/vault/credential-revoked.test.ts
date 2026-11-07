import { describe, expect, it } from 'vitest';
import { EffectiveSlotStateSchema } from '../../src/model-router/index.js';
import {
  CredentialVersionRefSchema,
  credentialVersionRevoked,
  withinRevocationThreshold,
  type CredentialVersionRef,
} from '../../src/vault/index.js';

const standard = {
  provider: 'openai', modelId: 'gpt-5.6-luna', protocol: 'responses', adapterId: 'openai-live-delegation',
} as const;
const configured = {
  state: 'configured',
  choice: {
    capability: 'agent-core', function: 'reasoning', mode: 'automatic',
    tiers: { standard, advanced: standard, reasoning: standard }, fallback: standard,
  },
  generation: { presetId: 3, agentGeneration: 5, presetGeneration: 7 },
  credentialKey: 'OPENAI_API_KEY', credentialVersion: 4, etag: 'm2-v2-1-3-5-7-abcdef0123456789',
} as const;

const ref = (source: string, counter: number, extra: Partial<CredentialVersionRef> = {}): CredentialVersionRef =>
  CredentialVersionRefSchema.parse({ source, counter, ...extra });

describe('CredentialVersionRefSchema con soglia', () => {
  it('accetta un riferimento con soglia', () => {
    const r = CredentialVersionRefSchema.safeParse({
      source: 'preset:2', counter: 5, revoked: false, revokedThrough: { source: 'preset:2', counter: 4 },
    });
    expect(r.success).toBe(true);
    expect(r.success && r.data.revokedThrough).toEqual({ source: 'preset:2', counter: 4, revoked: false });
  });
  it('rifiuta una soglia dentro la soglia', () => {
    const r = CredentialVersionRefSchema.safeParse({
      source: 'preset:2', counter: 5,
      revokedThrough: { source: 'preset:2', counter: 4, revokedThrough: { source: 'preset:2', counter: 3 } },
    });
    expect(r.success).toBe(false);
  });
  it('un riferimento di oggi esce identico dal parse', () => {
    expect(CredentialVersionRefSchema.parse({ source: 'agent:9', counter: 2 })).toEqual({
      source: 'agent:9', counter: 2, revoked: false,
    });
    expect(Object.keys(CredentialVersionRefSchema.parse({ source: 'agent:9', counter: 2 }))).toEqual([
      'source', 'counter', 'revoked',
    ]);
  });
});

describe('EffectiveSlotStateSchema con soglia', () => {
  it('accetta configured con la soglia', () => {
    const credential = {
      source: 'preset:2', counter: 5, revoked: false, revokedThrough: { source: 'preset:2', counter: 4 },
    };
    expect(EffectiveSlotStateSchema.safeParse({ ...configured, credential }).success).toBe(true);
  });
  it('accetta configured come oggi', () => {
    const credential = { source: 'preset:2', counter: 5, revoked: false };
    expect(EffectiveSlotStateSchema.safeParse({ ...configured, credential }).success).toBe(true);
  });
});

describe('withinRevocationThreshold', () => {
  it('senza soglia è false', () => {
    expect(withinRevocationThreshold(ref('preset:2', 1), undefined)).toBe(false);
  });
  it('sorgente diversa è false', () => {
    expect(withinRevocationThreshold(ref('preset:2', 1), ref('preset:3', 9))).toBe(false);
  });
  it('alla soglia o sotto è true, sopra è false', () => {
    expect(withinRevocationThreshold(ref('preset:2', 4), ref('preset:2', 4))).toBe(true);
    expect(withinRevocationThreshold(ref('preset:2', 3), ref('preset:2', 4))).toBe(true);
    expect(withinRevocationThreshold(ref('preset:2', 5), ref('preset:2', 4))).toBe(false);
  });
});

describe('credentialVersionRevoked', () => {
  const current = ref('preset:2', 5, { revokedThrough: { source: 'preset:2', counter: 4, revoked: false } });

  it('aperta alla soglia e corrente ruotata: true', () => {
    expect(credentialVersionRevoked(ref('preset:2', 4), current)).toBe(true);
  });
  it('aperta sotto la soglia: true', () => {
    expect(credentialVersionRevoked(ref('preset:2', 3), current)).toBe(true);
  });
  it('aperta alla versione corrente: false', () => {
    expect(credentialVersionRevoked(ref('preset:2', 5), current)).toBe(false);
  });
  it('rotazione ordinaria senza soglia: false', () => {
    expect(credentialVersionRevoked(ref('preset:2', 4), ref('preset:2', 5))).toBe(false);
  });
  it('corrente revocata nella stessa sorgente: true', () => {
    expect(credentialVersionRevoked(ref('preset:2', 5), ref('preset:2', 5, { revoked: true }))).toBe(true);
  });
  it('corrente revocata con aperta più vecchia: true', () => {
    expect(credentialVersionRevoked(ref('preset:2', 4), ref('preset:2', 5, { revoked: true }))).toBe(true);
  });
  it('corrente revocata e aperta più nuova: false', () => {
    expect(credentialVersionRevoked(ref('preset:2', 6), ref('preset:2', 5, { revoked: true }))).toBe(false);
  });
  it('corrente revocata con altra sorgente: true (prudente)', () => {
    expect(credentialVersionRevoked(ref('agent:9', 1), ref('preset:2', 5, { revoked: true }))).toBe(true);
  });
  it('la soglia di un altro preset non vale: false', () => {
    const other = ref('preset:2', 5, { revokedThrough: { source: 'preset:3', counter: 9, revoked: false } });
    expect(credentialVersionRevoked(ref('preset:2', 4), other)).toBe(false);
  });
  it('corrente assente: false', () => {
    expect(credentialVersionRevoked(ref('preset:2', 4), null)).toBe(false);
    expect(credentialVersionRevoked(ref('preset:2', 4), undefined)).toBe(false);
  });
  it('aperta assente: dipende da revoked della corrente', () => {
    expect(credentialVersionRevoked(null, ref('preset:2', 5, { revoked: true }))).toBe(true);
    expect(credentialVersionRevoked(null, ref('preset:2', 5))).toBe(false);
  });
});
