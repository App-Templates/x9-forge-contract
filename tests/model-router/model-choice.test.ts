import { describe, expect, it } from 'vitest';
import { CapabilityModelSettingsSchema, ModelChoiceSchema, sameCapabilityModelSettings, toCapabilityModelSettings, toModelChoice } from '../../src/model-router/index.js';

const d = { provider: 'openai', modelId: 'synthetic-model', protocol: 'chat-completions', adapterId: 'synthetic-adapter' };
const other = { ...d, modelId: 'synthetic-other' };
const requirements = { tools: true, stream: false, structuredOutput: false };
const catalogVersion = 'synthetic-catalog';
const head = { capability: 'agent-core', function: 'reasoning', catalogVersion, requirements };
const tiers = { standard: d, advanced: d, reasoning: d };
const settings = {
  automatic: { ...head, mode: 'automatic', tiers, fallback: d },
  pin: { ...head, mode: 'pin', pin: d, tiers, fallback: d },
  single: { ...head, mode: 'single', descriptor: d },
  failover: { ...head, mode: 'failover', primary: d, fallback: other },
} as const;
const modes = Object.keys(settings) as Array<keyof typeof settings>;
function choiceOf(mode: keyof typeof settings): Record<string, unknown> {
  const { catalogVersion: _c, requirements: _r, ...rest } = structuredClone(settings[mode]) as Record<string, unknown>;
  return rest;
}
function messages(result: { success: boolean; error?: { issues: Array<{ path: PropertyKey[]; message: string }> } }): string[] {
  return (result.error?.issues ?? []).map(i => `${i.path.join('.')}: ${i.message}`);
}

describe('ModelChoiceSchema', () => {
  it.each(modes)('%s choice passes and keeps its shape', mode => { expect(ModelChoiceSchema.parse(choiceOf(mode))).toEqual(choiceOf(mode)); });
  it.each(modes)('%s choice with catalogVersion is rejected (strict)', mode => { expect(ModelChoiceSchema.safeParse({ ...choiceOf(mode), catalogVersion }).success).toBe(false); });
  it.each(modes)('%s choice with requirements is rejected (strict)', mode => { expect(ModelChoiceSchema.safeParse({ ...choiceOf(mode), requirements }).success).toBe(false); });

  it('pin with a different tier is rejected at tiers.<tier> like the settings schema', () => {
    const bad = { ...choiceOf('pin'), tiers: { ...tiers, advanced: other } };
    const result = ModelChoiceSchema.safeParse(bad);
    expect(result.success).toBe(false);
    expect(result.error?.issues.some(i => i.path.join('.') === 'tiers.advanced')).toBe(true);
    expect(messages(result)).toEqual(messages(CapabilityModelSettingsSchema.safeParse({ ...bad, catalogVersion, requirements })));
  });
  it('pin with a different fallback is rejected at fallback', () => {
    const result = ModelChoiceSchema.safeParse({ ...choiceOf('pin'), fallback: other });
    expect(result.error?.issues.some(i => i.path.join('.') === 'fallback')).toBe(true);
  });
  it('single embedding without embeddingDimensions is rejected, same message as settings', () => {
    const bad = { ...choiceOf('single'), function: 'embedding' };
    const result = ModelChoiceSchema.safeParse(bad);
    expect(result.success).toBe(false);
    expect(messages(result)).toEqual(messages(CapabilityModelSettingsSchema.safeParse({ ...bad, catalogVersion, requirements })));
    expect(ModelChoiceSchema.safeParse({ ...bad, embeddingDimensions: 1536 }).success).toBe(true);
    expect(ModelChoiceSchema.safeParse({ ...choiceOf('single'), embeddingDimensions: 1536 }).success).toBe(false);
  });
  it('failover embedding is rejected, same message as settings', () => {
    const bad = { ...choiceOf('failover'), function: 'embedding' };
    const result = ModelChoiceSchema.safeParse(bad);
    expect(result.success).toBe(false);
    expect(messages(result)).toEqual(messages(CapabilityModelSettingsSchema.safeParse({ ...bad, catalogVersion, requirements })));
  });
});

describe('model choice conversions', () => {
  it.each(modes)('%s round trips to equivalent settings', mode => {
    const s = CapabilityModelSettingsSchema.parse(settings[mode]);
    const back = toCapabilityModelSettings(toModelChoice(s), { catalogVersion: s.catalogVersion, requirements: s.requirements });
    expect(sameCapabilityModelSettings(back, s)).toBe(true);
  });
  it('toModelChoice drops the two fields and returns a detached copy', () => {
    const s = CapabilityModelSettingsSchema.parse(settings.automatic);
    const choice = toModelChoice(s);
    expect(choice).not.toHaveProperty('catalogVersion');
    expect(choice).not.toHaveProperty('requirements');
    if (choice.mode === 'automatic') choice.fallback.modelId = 'changed';
    expect(s.mode === 'automatic' && s.fallback.modelId).toBe('synthetic-model');
  });
  it('toCapabilityModelSettings refuses an invalid result', () => {
    expect(() => toCapabilityModelSettings(choiceOf('single') as never, { catalogVersion: '', requirements })).toThrow();
  });
});

// Master selections captured from production on 2026-10-13 (no secrets).
const savedRows = [
  {
    "slotId": "agent_chat",
    "settings": {
      "mode": "automatic",
      "tiers": {
        "advanced": {
          "modelId": "gpt-5.6-terra",
          "protocol": "responses",
          "provider": "openai",
          "adapterId": "openai-live-delegation"
        },
        "standard": {
          "modelId": "gpt-5.6-luna",
          "protocol": "responses",
          "provider": "openai",
          "adapterId": "openai-live-delegation"
        },
        "reasoning": {
          "modelId": "gpt-5.6-terra",
          "protocol": "responses",
          "provider": "openai",
          "adapterId": "openai-live-delegation"
        }
      },
      "fallback": {
        "modelId": "gpt-5.6-luna",
        "protocol": "responses",
        "provider": "openai",
        "adapterId": "openai-live-delegation"
      },
      "function": "reasoning",
      "capability": "agent-core",
      "requirements": {
        "tools": true,
        "stream": false,
        "structuredOutput": false
      },
      "catalogVersion": "m2.metadata.20261011.5"
    }
  },
  {
    "slotId": "agent_classifier",
    "settings": {
      "mode": "single",
      "function": "reasoning",
      "capability": "agent-core",
      "descriptor": {
        "modelId": "gpt-4.1-mini",
        "protocol": "chat-completions",
        "provider": "openai",
        "adapterId": "openai-chat"
      },
      "requirements": {
        "tools": false,
        "stream": false,
        "structuredOutput": false
      },
      "catalogVersion": "m2.metadata.20261011.5"
    }
  }
] as Array<{ slotId: string; settings: unknown }>;
describe('saved production selections (R-37)', () => {
  it('has the automatic and the single row', () => { expect(savedRows.map(r => (r.settings as { mode: string }).mode)).toEqual(['automatic', 'single']); });
  it.each(savedRows.map(r => [r.slotId, r.settings] as const))('%s passes toModelChoice and ModelChoiceSchema', (_slot, raw) => {
    const s = CapabilityModelSettingsSchema.parse(raw);
    const choice = toModelChoice(s);
    expect(ModelChoiceSchema.safeParse(choice).success).toBe(true);
    expect(sameCapabilityModelSettings(toCapabilityModelSettings(choice, { catalogVersion: s.catalogVersion, requirements: s.requirements }), s)).toBe(true);
  });
});
