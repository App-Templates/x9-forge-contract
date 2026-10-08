import { describe, expect, it } from 'vitest';
import * as voice from '../../../src/capability/voice/index.js';
import type { ModelDescriptor, ModelFunction } from '../../../src/model-router/model-catalog.js';
import type { AgentVoiceEnabledSettings, VoiceProviderCatalog } from '../../../src/capability/voice/agent-voice-settings.js';

type Input = {
  descriptor: ModelDescriptor;
  role: ModelFunction;
  choices: Omit<AgentVoiceEnabledSettings, 'mode' | 'provider' | 'model'>;
  catalog: VoiceProviderCatalog;
};
type Result = { ok: true; settings: AgentVoiceEnabledSettings } | { ok: false; error: 'unsupported_voice_model' };
const convert = (voice as unknown as { agentVoiceSettingsFromModelDescriptor: (input: Input) => Result }).agentVoiceSettingsFromModelDescriptor;
const unsupported = { ok: false, error: 'unsupported_voice_model' };
function fixture(provider = 'openai', protocol: ModelDescriptor['protocol'] = 'realtime'): Input {
  const target = provider === 'openai' ? 'openai_live' : 'elevenlabs';
  return {
    descriptor: { provider, protocol, modelId: 'Synthetic/model:second', adapterId: 'registered-voice' },
    role: 'voice',
    choices: { protocol: 'sip', transports: ['phone', 'web'], voiceId: 'synthetic-voice-second', locale: 'it-IT', params: { speed: 1.1 } },
    catalog: { version: 'synthetic-v1', providers: [{ provider: target, label: 'Synthetic provider', protocols: ['websocket', 'webrtc', 'sip'], transports: ['phone', 'web'], models: [{ id: 'first-model', label: 'First' }, { id: 'Synthetic/model:second', label: 'Second' }], voices: { kind: 'menu', options: [{ id: 'first-voice', label: 'First' }, { id: 'synthetic-voice-second', label: 'Second' }] } }] },
  };
}
function reject(input: unknown): void {
  expect(convert(input as Input)).toEqual(unsupported);
}

describe('agentVoiceSettingsFromModelDescriptor', () => {
  it('exports the public conversion', () => { expect(convert).toBeTypeOf('function'); });
  it.each([
    ['openai', 'realtime', 'openai_live'],
    ['elevenlabs', 'speech', 'elevenlabs'],
    ['elevenlabs', 'realtime', 'elevenlabs'],
  ] as const)('maps %s/%s explicitly to %s and validates every success', (provider, protocol, target) => {
    const input = fixture(provider, protocol);
    const result = convert(input);
    expect(result).toEqual({ ok: true, settings: { ...input.choices, mode: 'voice', provider: target, model: input.descriptor.modelId } });
    if (!result.ok) throw new Error('Expected supported voice model');
    expect(voice.AgentVoiceSettingsSchema.safeParse(result.settings).success).toBe(true);
    expect(voice.validateAgentVoiceSettings(result.settings, input.catalog)).toEqual([]);
  });
  it.each(['reasoning', 'memory-extraction', 'embedding', 'tts', 'transcription'] as const)('rejects non-voice role %s', role => { reject({ ...fixture(), role }); });
  it.each(['future_provider', 'constructor', 'openai_live', 'anthropic', 'google'])('rejects unsupported provider %s even when its voice catalog supports it', provider => {
    const input = fixture(provider);
    input.catalog.providers[0]!.provider = provider;
    input.catalog.providers.push(fixture().catalog.providers[0]!);
    reject(input);
  });
  it.each(['responses', 'chat-completions', 'speech', 'transcriptions'] as const)('rejects incompatible OpenAI API protocol %s', protocol => { reject(fixture('openai', protocol)); });
  it('rejects incompatible ElevenLabs API protocol', () => { reject(fixture('elevenlabs', 'responses')); });
  it.each([null, {}, { ...fixture(), role: 'future-role' }, { ...fixture(), extra: true }])('rejects malformed input %j', input => { reject(input); });
  it.each([
    { provider: 'claude' }, { modelId: '' }, { adapterId: 'https://invalid.example' }, { protocol: 'sip' }, { extra: true },
  ])('rejects malformed descriptor %j', patch => { const input = fixture(); reject({ ...input, descriptor: { ...input.descriptor, ...patch } }); });
  it('rejects malformed catalog including duplicate providers', () => {
    const input = fixture(); input.catalog.providers.push(structuredClone(input.catalog.providers[0]!)); reject(input);
  });
  it('rejects invalid voice id patterns without throwing', () => {
    const input = fixture('elevenlabs'); input.catalog.providers[0]!.voices = { kind: 'id', pattern: '[' }; reject(input);
  });
  it.each([
    { protocol: 'realtime' }, { transports: [] }, { transports: ['phone', 'phone'] }, { voiceId: '' }, { locale: 'invalid_locale' }, { params: { speed: { invalid: true } } }, { provider: 'elevenlabs' }, { model: 'first-model' }, { mode: 'text-only' },
  ])('rejects malformed or overriding choices %j', patch => { const input = fixture(); reject({ ...input, choices: { ...input.choices, ...patch } }); });
  it.each(['protocol', 'transports', 'voiceId'] as const)('requires explicit %s instead of choosing a default', field => {
    const input = fixture(); const choices: Record<string, unknown> = { ...input.choices }; delete choices[field]; reject({ ...input, choices });
  });
  it('rejects catalog provider absence', () => { const input = fixture(); input.catalog.providers = []; reject(input); });
  it('rejects catalog protocol mismatch', () => { const input = fixture(); input.catalog.providers[0]!.protocols = ['websocket']; reject(input); });
  it('rejects catalog transport mismatch', () => { const input = fixture(); input.catalog.providers[0]!.transports = ['web']; reject(input); });
  it('rejects catalog model mismatch', () => { const input = fixture(); input.catalog.providers[0]!.models = [{ id: 'first-model', label: 'First' }]; reject(input); });
  it('rejects catalog menu voice mismatch', () => { const input = fixture(); input.catalog.providers[0]!.voices = { kind: 'menu', options: [{ id: 'first-voice', label: 'First' }] }; reject(input); });
  it('accepts matching ElevenLabs id pattern and rejects mismatches', () => {
    const input = fixture('elevenlabs', 'speech'); input.catalog.providers[0]!.voices = { kind: 'id', pattern: '^synthetic-voice-second$' };
    expect(convert(input).ok).toBe(true); input.choices.voiceId = 'different'; reject(input);
  });
  it.each(['websocket', 'webrtc', 'sip'] as const)('keeps explicit media protocol %s distinct from API realtime', protocol => {
    const input = fixture(); input.choices.protocol = protocol;
    const result = convert(input); expect(result.ok && result.settings.protocol).toBe(protocol);
  });
  it('preserves exact model and optional choices without mutating inputs or sharing output arrays', () => {
    const input = fixture(); const before = structuredClone(input);
    const result = convert(input); expect(input).toEqual(before);
    expect(result.ok).toBe(true); if (!result.ok) throw new Error('Expected supported voice model');
    expect(result.settings.model).toBe(input.descriptor.modelId);
    result.settings.transports.reverse(); result.settings.params!.speed = 9;
    expect(input).toEqual(before);
    const minimal = fixture(); delete minimal.choices.locale; delete minimal.choices.params;
    const converted = convert(minimal); expect(converted.ok).toBe(true);
    if (converted.ok) { expect(converted.settings).not.toHaveProperty('locale'); expect(converted.settings).not.toHaveProperty('params'); }
  });
});
