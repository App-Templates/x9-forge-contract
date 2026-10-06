import { describe, expect, it } from 'vitest';
import {
  AgentVoiceConfigSchema,
  AgentVoiceErrorCodeSchema,
  AgentVoiceSettingsSchema,
  KNOWN_AGENT_VOICE_PROVIDERS,
  OutboundCallerIdentitySchema,
  VoiceProviderCatalogSchema,
  outboundCallerIdentityFor,
  validateAgentVoiceSettings,
} from '../../../src/capability/voice/index.js';

const gpt = {
  mode: 'voice', provider: 'openai_live', protocol: 'websocket', transports: ['phone'],
  voiceId: 'marin', model: 'gpt-live-1', locale: 'it-IT',
} as const;
const eleven = {
  mode: 'voice', provider: 'elevenlabs', protocol: 'webrtc', transports: ['web', 'phone'],
  voiceId: 'EXAVITQu4vr4xnSDxMaL', model: 'eleven_flash_v2_5', params: { stability: 0.5 },
} as const;
const catalog = {
  version: '2026-10-07',
  providers: [
    {
      provider: 'openai_live', label: 'GPT Live', protocols: ['websocket'], transports: ['phone', 'web'],
      models: [{ id: 'gpt-live-1', label: 'GPT Live 1' }],
      voices: { kind: 'menu', options: [{ id: 'marin', label: 'Marin' }, { id: 'cedar', label: 'Cedar' }] },
    },
    {
      provider: 'elevenlabs', label: 'ElevenLabs', protocols: ['webrtc', 'websocket', 'sip'], transports: ['phone', 'web'],
      models: [{ id: 'eleven_flash_v2_5', label: 'Flash 2.5' }],
      voices: { kind: 'id', pattern: '^[A-Za-z0-9]{20}$' },
    },
  ],
};

describe('R4 per-agent voice settings', () => {
  it('is text-only or voice with provider, protocol, transport, voice and model', () => {
    expect(AgentVoiceSettingsSchema.safeParse({ mode: 'text-only' }).success).toBe(true);
    expect(AgentVoiceSettingsSchema.safeParse(gpt).success).toBe(true);
    expect(AgentVoiceSettingsSchema.safeParse(eleven).success).toBe(true);
  });

  it('stays open to future providers while knowing the current ones', () => {
    expect(KNOWN_AGENT_VOICE_PROVIDERS).toEqual(['elevenlabs', 'openai_live']);
    expect(AgentVoiceSettingsSchema.safeParse({ ...gpt, provider: 'future_voice' }).success).toBe(true);
  });

  it.each([
    ['text-only with a voice', { mode: 'text-only', voiceId: 'marin' }],
    ['voice without provider', { ...gpt, provider: undefined }],
    ['voice without voice id', { ...gpt, voiceId: '' }],
    ['voice without model', { ...gpt, model: undefined }],
    ['no transport', { ...gpt, transports: [] }],
    ['duplicate transport', { ...gpt, transports: ['phone', 'phone'] }],
    ['unknown protocol', { ...gpt, protocol: 'carrier-pigeon' }],
    ['provider id with spaces', { ...gpt, provider: 'Open AI' }],
    ['credential in settings', { ...gpt, apiKey: 'sk' }],
  ])('rejects %s', (_label, input) => {
    expect(AgentVoiceSettingsSchema.safeParse(input).success).toBe(false);
  });

  it('keeps saved and applied settings with their versions', () => {
    const config = { agentId: 'agent-7', versions: { desired: 3, applied: 2, failed: null }, desired: eleven, applied: gpt };
    expect(AgentVoiceConfigSchema.safeParse(config).success).toBe(true);
    expect(AgentVoiceConfigSchema.safeParse({ ...config, versions: { desired: 1, applied: null, failed: null }, applied: null }).success).toBe(true);
    expect(AgentVoiceConfigSchema.safeParse({ ...config, applied: null }).success).toBe(false);
    expect(AgentVoiceConfigSchema.safeParse({ ...config, versions: { desired: 1, applied: null, failed: null } }).success).toBe(false);
  });
});

describe('R4 provider catalog', () => {
  it('parses a producer catalog', () => {
    expect(VoiceProviderCatalogSchema.safeParse(catalog).success).toBe(true);
  });

  it.each([
    ['duplicate provider', { ...catalog, providers: [catalog.providers[0], catalog.providers[0]] }],
    ['empty voice menu', { ...catalog, providers: [{ ...catalog.providers[0], voices: { kind: 'menu', options: [] } }] }],
    ['invalid voice id pattern', { ...catalog, providers: [{ ...catalog.providers[1], voices: { kind: 'id', pattern: '([' } }] }],
    ['provider without models', { ...catalog, providers: [{ ...catalog.providers[0], models: [] }] }],
  ])('rejects %s', (_label, input) => {
    expect(VoiceProviderCatalogSchema.safeParse(input).success).toBe(false);
  });

  it('accepts only combinations the catalog supports', () => {
    const parsed = VoiceProviderCatalogSchema.parse(catalog);
    expect(validateAgentVoiceSettings(AgentVoiceSettingsSchema.parse(gpt), parsed)).toEqual([]);
    expect(validateAgentVoiceSettings(AgentVoiceSettingsSchema.parse(eleven), parsed)).toEqual([]);
    expect(validateAgentVoiceSettings({ mode: 'text-only' }, parsed)).toEqual([]);
  });

  it.each([
    [{ ...gpt, provider: 'future_voice' }, ['provider_unsupported']],
    [{ ...gpt, protocol: 'webrtc' }, ['protocol_unsupported']],
    [{ ...gpt, model: 'gpt-4o' }, ['model_unsupported']],
    [{ ...gpt, voiceId: 'nova' }, ['voice_unknown']],
    [{ ...eleven, voiceId: 'short' }, ['voice_unknown']],
    [{ ...gpt, protocol: 'sip', voiceId: 'nova' }, ['protocol_unsupported', 'voice_unknown']],
  ])('reports unsupported choices', (settings, issues) => {
    expect(validateAgentVoiceSettings(AgentVoiceSettingsSchema.parse(settings), VoiceProviderCatalogSchema.parse(catalog))).toEqual(issues);
  });

  it('reports a transport the provider does not offer', () => {
    const narrow = { ...catalog, providers: [{ ...catalog.providers[0], transports: ['web'] }] };
    expect(validateAgentVoiceSettings(AgentVoiceSettingsSchema.parse(gpt), VoiceProviderCatalogSchema.parse(narrow))).toEqual(['transport_unsupported']);
  });
});

describe('R4 caller identity on the single outbound Telnyx number', () => {
  const input = {
    agent: { managementAgentId: 'agent-7', runtimeAgentId: 'agent-7' },
    displayName: 'Francesca',
    persona: 'Assistente dello studio, tono cordiale',
    fromNumber: '+390212345678',
    settingsVersion: 3,
  };

  it('derives a coherent identity from voice settings', () => {
    const result = outboundCallerIdentityFor({ ...input, settings: AgentVoiceSettingsSchema.parse(gpt) });
    expect(result).toEqual({ ok: true, identity: { ...input, voice: { provider: 'openai_live', voiceId: 'marin', model: 'gpt-live-1' } } });
    if (result.ok) expect(OutboundCallerIdentitySchema.safeParse(result.identity).success).toBe(true);
  });

  it('refuses text-only agents and agents without the phone transport', () => {
    expect(outboundCallerIdentityFor({ ...input, settings: { mode: 'text-only' } })).toEqual({ ok: false, error: 'voice_disabled' });
    expect(outboundCallerIdentityFor({ ...input, settings: AgentVoiceSettingsSchema.parse({ ...gpt, transports: ['web'] }) })).toEqual({ ok: false, error: 'phone_not_enabled' });
    expect(AgentVoiceErrorCodeSchema.options).toEqual(expect.arrayContaining(['voice_disabled', 'phone_not_enabled', 'voice_unknown']));
  });

  it.each([
    ['non E.164 number', { fromNumber: '02 1234 5678' }],
    ['empty name', { displayName: ' ' }],
    ['missing runtime identity', { agent: { managementAgentId: 'agent-7' } }],
  ])('rejects %s', (_label, patch) => {
    const identity = { ...input, voice: { provider: 'openai_live', voiceId: 'marin', model: 'gpt-live-1' }, ...patch };
    expect(OutboundCallerIdentitySchema.safeParse(identity).success).toBe(false);
  });
});
