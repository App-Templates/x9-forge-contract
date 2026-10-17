import { describe, it, expect } from 'vitest';
import * as managedVoice from '../../src/capability/voice-live/index.js';
const managedApi = managedVoice;
import {
  CAP_VOICE_LIVE_DEFAULT_PORT,
  VoiceLiveCallStartRequestSchema,
  VoiceLiveCallStartResponseSchema,
  VoiceLiveTranscriptTurnSchema,
  VoiceLiveCallEndReasonSchema,
  VoiceLiveWebSessionRequestSchema,
  VoiceLiveWebSessionResponseSchema,
} from '../../src/capability/voice-live/index.js';
import {
  VoiceProviderSchema,
  OPENAI_LIVE_MODEL,
  OPENAI_LIVE_DEFAULT_VOICE,
} from '../../src/capability/voice/provider.js';
import { ForgeVoiceWebhookNormalizedEventSchema } from '../../src/capability/voice/normalized-event.js';
import { VoiceToolCallSourceSchema } from '../../src/capability/voice/tool-log.js';
import { VoiceCallStartResponseSchema } from '../../src/capability/voice/call-start.js';
import { PostCallPayloadSchema } from '../../src/http/endpoints/webhook-post-call.js';
import {
  CAP_VOICE_LIVE_CALL_START_PATH,
  CAP_VOICE_LIVE_STREAM_PATH,
  CAP_VOICE_LIVE_TELNYX_WEBHOOK_PATH,
  CAP_VOICE_LIVE_WEB_SESSION_PATH,
  CAP_VOICE_LIVE_WEB_PAGE_PATH,
} from '../../src/http/endpoints/voice-live.js';

const validStart = {
  call_id: 'call_1',
  agent_id: '1',
  to_number: '+393331234567',
  contact_name: 'Mario Rossi',
  instructions: 'Sei l\'assistente.',
  backend_instructions: 'Sei l\'assistente (backend).',
  tools: [
    { name: 'search_context', description: 'cerca', parameters: { type: 'object', properties: {} }, mutating: false },
  ],
  voice: 'marin',
  backend_model: 'gpt-5.6-terra',
};

describe('Phase 50 — VoiceProviderSchema + defaults', () => {
  it('accepts exactly elevenlabs | openai_live', () => {
    expect(VoiceProviderSchema.parse('elevenlabs')).toBe('elevenlabs');
    expect(VoiceProviderSchema.parse('openai_live')).toBe('openai_live');
    expect(() => VoiceProviderSchema.parse('openai')).toThrow();
    expect(() => VoiceProviderSchema.parse('twilio')).toThrow();
  });
  it('model + voice constants match the OpenAI docs', () => {
    expect(OPENAI_LIVE_MODEL).toBe('gpt-live-1');
    expect(OPENAI_LIVE_DEFAULT_VOICE).toBe('marin');
  });
});

describe('Phase 50 — widened voice schemas stay backward compatible', () => {
  it('normalized event accepts openai_live AND still accepts elevenlabs', () => {
    const base = {
      call_id: 'c', agent_id: 'a', owner_id: 'o', tenant_id: 't', conversation_id: 'x',
      event_type: 'post_call_transcription', received_at: '2026-09-12T10:00:00+02:00',
      raw_event_hash: 'h', signature_valid: true, payload: {},
    };
    expect(ForgeVoiceWebhookNormalizedEventSchema.parse({ ...base, provider: 'elevenlabs' }).provider).toBe('elevenlabs');
    expect(ForgeVoiceWebhookNormalizedEventSchema.parse({ ...base, provider: 'openai_live' }).provider).toBe('openai_live');
    expect(() => ForgeVoiceWebhookNormalizedEventSchema.parse({ ...base, provider: 'nope' })).toThrow();
  });
  it('tool_call_source gains openai_live', () => {
    expect(VoiceToolCallSourceSchema.parse('openai_live')).toBe('openai_live');
    expect(VoiceToolCallSourceSchema.options).toContain('elevenlabs');
  });
  it('call-start response: elevenlabs_agent_id optional, provider optional (pre-50 producers still validate)', () => {
    const pre50 = { call_id: 'c', conversation_id: 'x', elevenlabs_agent_id: 'ag', started_at: '2026-09-12T10:00:00Z' };
    expect(VoiceCallStartResponseSchema.parse(pre50).provider).toBeUndefined();
    const live = { call_id: 'c', conversation_id: 'v2:abc', provider: 'openai_live', started_at: '2026-09-12T10:00:00Z' };
    expect(VoiceCallStartResponseSchema.parse(live).provider).toBe('openai_live');
  });
  it('PostCallPayload accepts an optional provider stamp', () => {
    expect(PostCallPayloadSchema.parse({ type: 'post_call_transcription', provider: 'openai_live' }).provider).toBe('openai_live');
    expect(() => PostCallPayloadSchema.parse({ type: 'post_call_transcription', provider: 'bogus' })).toThrow();
  });
});

describe('Phase 50 — capability/voice-live contracts', () => {
  it('port + endpoint constants', () => {
    expect(CAP_VOICE_LIVE_DEFAULT_PORT).toBe(3217);
    expect(CAP_VOICE_LIVE_CALL_START_PATH).toBe('/internal/live/call-start');
    expect(CAP_VOICE_LIVE_STREAM_PATH('call 1')).toBe('/live/stream/call%201');
    expect(CAP_VOICE_LIVE_TELNYX_WEBHOOK_PATH).toBe('/webhook/telnyx');
  });
  it('call-start request: strict, E.164 enforced, locale defaults to it', () => {
    const parsed = VoiceLiveCallStartRequestSchema.parse(validStart);
    expect(parsed.locale).toBe('it');
    expect(parsed.tools[0]?.mutating).toBe(false);
    expect(() => VoiceLiveCallStartRequestSchema.parse({ ...validStart, to_number: '3331234567' })).toThrow();
    expect(() => VoiceLiveCallStartRequestSchema.parse({ ...validStart, extra: 1 })).toThrow();
    expect(() => VoiceLiveCallStartRequestSchema.parse({ ...validStart, tools: [{ name: 'x' }] })).toThrow();
  });
  it('call-start response requires provider + conversation reference', () => {
    const ok = { call_id: 'c', provider: 'openai_live', conversation_id: 'v2:tel', started_at: '2026-09-12T10:00:00+02:00' };
    expect(VoiceLiveCallStartResponseSchema.parse(ok).provider).toBe('openai_live');
    expect(() => VoiceLiveCallStartResponseSchema.parse({ ...ok, conversation_id: '' })).toThrow();
  });
  it('web ingress (50-06): strict request, response shape, endpoint constants', () => {
    expect(VoiceLiveWebSessionRequestSchema.parse({ sdp: 'v=0...' }).conversation_id).toBeUndefined();
    expect(() => VoiceLiveWebSessionRequestSchema.parse({ sdp: 'v=0', extra: 1 })).toThrow();
    expect(() => VoiceLiveWebSessionRequestSchema.parse({ sdp: 'v=0', conversation_id: 'Bad_ID' })).toThrow();
    expect(VoiceLiveWebSessionResponseSchema.parse({ session_id: 'live_1', conversation_id: 'web-1', sdp: 'v=0', voice: 'marin', model: 'gpt-live-1' }).session_id).toBe('live_1');
    expect(CAP_VOICE_LIVE_WEB_SESSION_PATH).toBe('/live/web/session');
    expect(CAP_VOICE_LIVE_WEB_PAGE_PATH).toBe('/live/web/');
  });

  it('transcript turn + end reasons', () => {
    expect(VoiceLiveTranscriptTurnSchema.parse({ role: 'agent', message: 'Pronto', time_in_call_secs: 0.5 }).role).toBe('agent');
    expect(() => VoiceLiveTranscriptTurnSchema.parse({ role: 'assistant', message: 'x', time_in_call_secs: 0 })).toThrow();
    expect(VoiceLiveCallEndReasonSchema.options).toContain('no_answer');
  });
});

const managedIdentity = { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: '1' };
const managedCredentials = { OPENAI_API_KEY: 'fixture', TELNYX_API_KEY: 'fixture', TELNYX_CONNECTION_ID: 'fixture', TELNYX_FROM_NUMBER: '+393331234567', TELNYX_PUBLIC_KEY: 'fixture' };
const managedStart = { ...validStart, credentialPolicy: 'managed', identity: managedIdentity, credentials: managedCredentials };
describe('managed live voice handoff', () => {
  it('accepts only explicit standalone policy without managed material', () => {
    expect(managedApi.StandaloneVoiceLiveCallStartRequestSchema?.safeParse({ ...validStart, credentialPolicy: 'standalone' }).success).toBe(true);
    expect(managedApi.StandaloneVoiceLiveCallStartRequestSchema?.safeParse({ ...validStart, credentialPolicy: 'standalone' }).success).toBe(true);
    expect(VoiceLiveCallStartRequestSchema.safeParse(validStart).success).toBe(true);
    expect(managedApi.StandaloneVoiceLiveCallStartRequestSchema.safeParse(validStart).success).toBe(false);
    const legacy = validStart;
    expect(managedApi.ManagedVoiceLiveCallStartRequestSchema?.safeParse(legacy).success).toBe(false);
    expect(managedApi.ManagedVoiceLiveCallStartRequestSchema?.safeParse({ ...validStart, credentials: managedCredentials }).success).toBe(false);
  });
  it('accepts managed canonical identity and the minimal OpenAI/Telnyx bundle', () => {
    expect(managedApi.ManagedVoiceLiveCallStartRequestSchema?.safeParse(managedStart).success).toBe(true);
  });
  it.each(['tenantId', 'ownerId', 'agentId'])('requires managed identity %s', key => {
    const identity: Record<string, string> = { ...managedIdentity }; delete identity[key];
    expect(managedApi.ManagedVoiceLiveCallStartRequestSchema?.safeParse({ ...managedStart, identity }).success).toBe(false);
  });
  it('requires matching agent identity and never infers ownership', () => {
    expect(managedApi.ManagedVoiceLiveCallStartRequestSchema?.safeParse({ ...managedStart, identity: { ...managedIdentity, agentId: 'foreign' } }).success).toBe(false);
    expect(managedApi.ManagedVoiceLiveCallStartRequestSchema?.safeParse({ ...validStart, credentialPolicy: 'managed' }).success).toBe(false);
  });
  it.each(Object.keys(managedCredentials))('requires nonempty admitted %s', key => {
    const credentials: Record<string, string> = { ...managedCredentials }; delete credentials[key];
    expect(managedApi.ManagedVoiceLiveCallStartRequestSchema?.safeParse({ ...managedStart, credentials }).success).toBe(false);
    expect(managedApi.ManagedVoiceLiveCallStartRequestSchema?.safeParse({ ...managedStart, credentials: { ...managedCredentials, [key]: '' } }).success).toBe(false);
  });
  it.each(['ANTHROPIC_API_KEY', 'INTERNAL_SECRET', 'ELEVENLABS_API_KEY', 'unknown'])('rejects unrelated bundle field %s', key => {
    expect(managedApi.ManagedVoiceLiveCallStartRequestSchema?.safeParse({ ...managedStart, credentials: { ...managedCredentials, [key]: 'fixture' } }).success).toBe(false);
  });
  it('rejects credentials in call-start responses', () => {
    expect(managedApi.ManagedVoiceLiveCallStartResponseSchema?.safeParse({ call_id: 'c', provider: 'openai_live', conversation_id: 'r', started_at: '2026-09-12T10:00:00Z', credentials: {} }).success).toBe(false);
  });
});

it('loads the managed handoff through the actual compiled ESM subpath', async () => {
  const compiled = await import('@x9-forge/contracts/capability/voice-live');
  expect(compiled.ManagedVoiceLiveCallStartRequestSchema?.safeParse(managedStart).success).toBe(true);
  expect(compiled.VoiceLiveCallStartRequestSchema.safeParse(validStart).success).toBe(true);
});
