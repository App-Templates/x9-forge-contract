import { describe, expect, it } from 'vitest';
import { VoiceRegisterRequestSchema } from '../../../src/http/endpoints/index.js';
import { OutboundCallerIdentitySchema, AgentVoiceErrorCodeSchema, outboundCallerIdentityFor } from '../../../src/capability/voice/index.js';

const caller = OutboundCallerIdentitySchema.parse({ agent: { runtimeAgentId: 'runtime-synthetic', managementAgentId: '42' }, displayName: 'Synthetic caller', persona: 'Synthetic persona', voice: { provider: 'openai_live', voiceId: 'synthetic-own-voice', model: 'synthetic-own-model' }, fromNumber: '+390212345678', settingsVersion: 3 });
const legacy = { agentId: '42', conversationId: 'synthetic-conversation' };

describe('BRIDGE-134 authoritative voice caller', () => {
  it('preserves legacy registration without a caller', () => {
    expect(VoiceRegisterRequestSchema.safeParse(legacy).success).toBe(true);
    expect(VoiceRegisterRequestSchema.parse(legacy)).toEqual(legacy);
  });
  it('keeps canonical caller with a different runtime id and matching management id', () => {
    const input = { ...legacy, caller };
    expect(VoiceRegisterRequestSchema.parse(input)).toEqual(input);
    expect(input.caller).toEqual(caller);
  });
  it.each(['another-management-agent', caller.agent.runtimeAgentId])('rejects legacy id %s that differs from caller management identity', agentId => {
    expect(VoiceRegisterRequestSchema.safeParse({ ...legacy, caller }).success).toBe(true);
    expect(VoiceRegisterRequestSchema.safeParse({ ...legacy, agentId, caller }).success).toBe(false);
  });
  it.each([
    ['invalid outbound number', { ...caller, fromNumber: 'not-an-e164-number' }],
    ['missing caller name', { ...caller, displayName: undefined }],
  ])('rejects %s with canonical caller validation', (_reason, invalid) => {
    expect(VoiceRegisterRequestSchema.safeParse({ ...legacy, caller }).success).toBe(true);
    expect(VoiceRegisterRequestSchema.safeParse({ ...legacy, caller: invalid }).success).toBe(false);
  });
  it('distinguishes unapplied voice before text-only and phone admission', () => {
    const { voice: _voice, ...identity } = caller;
    let result: unknown;
    expect(() => { result = outboundCallerIdentityFor({ ...identity, settings: null }); }).not.toThrow();
    expect(result).toEqual({ ok: false, error: 'voice_not_applied' });
    expect(outboundCallerIdentityFor({ ...identity, settings: { mode: 'text-only' } })).toEqual({ ok: false, error: 'voice_disabled' });
    expect(outboundCallerIdentityFor({ ...identity, settings: { mode: 'voice', provider: 'openai_live', protocol: 'websocket', transports: ['web'], voiceId: 'synthetic', model: 'synthetic' } })).toEqual({ ok: false, error: 'phone_not_enabled' });
  });
  it('publishes the fixed voice_not_applied error code', () => {
    expect(AgentVoiceErrorCodeSchema.safeParse('voice_not_applied').success).toBe(true);
    expect(AgentVoiceErrorCodeSchema.safeParse('synthetic-arbitrary-error').success).toBe(false);
  });
});
