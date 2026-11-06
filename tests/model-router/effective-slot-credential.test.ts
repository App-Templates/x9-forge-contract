import { describe, expect, it } from 'vitest';
import { EffectiveSlotStateSchema } from '../../src/model-router/index.js';

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

describe('configured con credential', () => {
  it('il formato 1.104.0 senza credential resta valido', () => {
    expect(EffectiveSlotStateSchema.safeParse(configured).success).toBe(true);
  });
  it('accetta una versione con sorgente', () => {
    const r = EffectiveSlotStateSchema.safeParse({ ...configured, credential: { source: 'preset:2', counter: 4, revoked: false } });
    expect(r.success).toBe(true);
  });
  it('accetta credential null', () => {
    expect(EffectiveSlotStateSchema.safeParse({ ...configured, credential: null }).success).toBe(true);
  });
  it('rifiuta una sorgente sconosciuta', () => {
    expect(EffectiveSlotStateSchema.safeParse({ ...configured, credential: { source: 'company:2', counter: 4 } }).success).toBe(false);
  });
  it('revoked assente diventa false dopo il parse', () => {
    const r = EffectiveSlotStateSchema.parse({ ...configured, credential: { source: 'preset:2', counter: 4 } });
    expect(r.state === 'configured' && r.credential?.revoked).toBe(false);
  });
  it('revoked true è conservato', () => {
    const r = EffectiveSlotStateSchema.parse({ ...configured, credential: { source: 'agent:9', counter: 1, revoked: true } });
    expect(r.state === 'configured' && r.credential?.revoked).toBe(true);
  });
  it.each([
    [{ state: 'disabled' }],
    [{ state: 'unconfigured' }],
    [{ state: 'unavailable' }],
    [{ state: 'identity_mismatch', field: 'ownerId' }],
    [{ state: 'capability_disabled' }],
  ])('gli altri stati non accettano credential: %j', (s) => {
    expect(EffectiveSlotStateSchema.safeParse({ ...s, credential: { source: 'platform', counter: 1 } }).success).toBe(false);
  });
});
