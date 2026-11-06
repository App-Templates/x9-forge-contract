import { describe, expect, it } from 'vitest';
import {
  EffectiveSlotReadRequestSchema, EffectiveSlotStateSchema, slotFallback,
  type EffectiveSlotState,
} from '../../src/model-router/index.js';

const standard = {
  provider: 'openai', modelId: 'gpt-5.6-luna', protocol: 'responses', adapterId: 'openai-live-delegation',
} as const;
const configured: EffectiveSlotState = {
  state: 'configured',
  choice: {
    capability: 'agent-core', function: 'reasoning', mode: 'automatic',
    tiers: { standard, advanced: standard, reasoning: standard }, fallback: standard,
  },
  generation: { presetId: 3, agentGeneration: 5, presetGeneration: 7 },
  credentialKey: 'OPENAI_API_KEY', credentialVersion: 4, etag: 'm2-v2-1-3-5-7-abcdef0123456789',
};
const states: EffectiveSlotState[] = [
  { state: 'disabled' },
  configured,
  { state: 'unconfigured' },
  { state: 'unavailable' },
  { state: 'identity_mismatch', field: 'ownerId' },
  { state: 'capability_disabled' },
];

describe('EffectiveSlotStateSchema', () => {
  it.each(states.map((s) => [s.state, s] as const))('accetta %s', (_n, s) => {
    expect(EffectiveSlotStateSchema.safeParse(s).success).toBe(true);
  });
  it.each(states.map((s) => [s.state, s] as const))('rifiuta campi in più in %s', (_n, s) => {
    expect(EffectiveSlotStateSchema.safeParse({ ...s, extra: 1 }).success).toBe(false);
  });
  it('rifiuta identity_mismatch senza field o con field sconosciuto', () => {
    expect(EffectiveSlotStateSchema.safeParse({ state: 'identity_mismatch' }).success).toBe(false);
    expect(EffectiveSlotStateSchema.safeParse({ state: 'identity_mismatch', field: 'userId' }).success).toBe(false);
  });
  it('accetta configured senza credenziale ma rifiuta versione zero', () => {
    expect(EffectiveSlotStateSchema.safeParse({ ...configured, credentialKey: null, credentialVersion: null }).success).toBe(true);
    expect(EffectiveSlotStateSchema.safeParse({ ...configured, credentialVersion: 0 }).success).toBe(false);
  });
  it('rifiuta uno stato sconosciuto', () => {
    expect(EffectiveSlotStateSchema.safeParse({ state: 'maybe' }).success).toBe(false);
  });
});

describe('EffectiveSlotReadRequestSchema', () => {
  const scope = { tenantId: '1', ownerId: '1', agentId: 'x9' };
  it('accetta la terna e il posto', () => {
    expect(EffectiveSlotReadRequestSchema.safeParse({ scope, slotId: 'agent_chat' }).success).toBe(true);
  });
  it('rifiuta campi in più, terna incompleta e posto non valido', () => {
    expect(EffectiveSlotReadRequestSchema.safeParse({ scope, slotId: 'agent_chat', x: 1 }).success).toBe(false);
    expect(EffectiveSlotReadRequestSchema.safeParse({ scope: { tenantId: '1', ownerId: '1' }, slotId: 'agent_chat' }).success).toBe(false);
    expect(EffectiveSlotReadRequestSchema.safeParse({ scope, slotId: 'Agent Chat' }).success).toBe(false);
  });
});

describe('slotFallback', () => {
  const lastKnowns = [null, { sameIdentity: true }, { sameIdentity: false }] as const;
  const expected: Record<string, [string, string, string]> = {
    disabled: ['v1', 'v1', 'v1'],
    configured: ['choice', 'choice', 'choice'],
    unconfigured: ['refuse', 'refuse', 'refuse'],
    unavailable: ['refuse', 'last-known', 'refuse'],
    identity_mismatch: ['refuse', 'refuse', 'refuse'],
    capability_disabled: ['refuse', 'refuse', 'refuse'],
  };
  for (const s of states) {
    it.each(lastKnowns.map((l, i) => [JSON.stringify(l), l, expected[s.state]![i]!] as const))(
      `${s.state} con lastKnown %s -> %s`,
      (_n, l, out) => { expect(slotFallback(s, l)).toBe(out); },
    );
  }
});
