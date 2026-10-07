from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
r=Path('/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-63-1');p=r/'.planning/phases/bridge-134';p.mkdir(parents=True,exist_ok=True)
now=datetime.now(ZoneInfo('Europe/Rome')).strftime('%Y-%m-%d %H:%M')
(p/'BRIDGE-134-PLAN.md').write_text(f'''# BRIDGE-134 — execution\n\nStart {now}, coordinator06:58/06:59. Base1646b79, branchcodex/bridge-134, only63-1. Reuse board/piani/BRIDGE-134-PLAN.md and STATO, no local AGENTS found. ≤45min/3attempts, then SALTATO.\n\n1. Tests FIRST: read/write legacy context, scoped applied voice, malformed/version-incoherent voice; helper never guesses desired/default; register legacy+canonicalcaller, management-id binding, invalid caller; explicit voice_not_applied. AssertionError red before product.\n2. Add canonical optional fields and helper; reuse existing schemas. caller.agent.managementAgentId binds legacyagentId (documented numericForge ID); runtimeAgentId may differ and never aliases it. voiceConfiguration.agentId equals context.agentId as explicit plan decision.\n3. Deliberately break each new control, prove AssertionError with all new names covered, exact source SHA restore and green. Atomic source/test commit, immediate SUMMARY, reread plans.\n4. Full tests/maxWorkers1, native typecheck/lint, build/check:pack/CJS on exact private public copy: dist/package.json/CHANGELOG forbidden inworktree. No secret/.env/networkprovider/live/push/release. Final SUMMARY commit, deliver frozen SHA; release1.34 coordinator.\n''')
(p/'BRIDGE-134-SUMMARY.md').write_text(f'# BRIDGE-134 — SUMMARY\n\n{now}: tests about to run on unchanged product. Canonical slot/helper/caller assigned; no implementation or green claimed. Release/dist/package outside author perimeter. R2b d4cb8a7d frozen; R4-2 paused4545b956 until bridge.\n')
(r/'tests/agent/bridge134-voice-context.test.ts').write_text('''import { describe, expect, it } from 'vitest';
import * as agent from '../../src/agent/index.js';
import { AgentVoiceSettingsSchema } from '../../src/capability/voice/index.js';
import { context } from './r2-fixtures.js';

const voice = AgentVoiceSettingsSchema.parse({ mode: 'voice', provider: 'openai_live', protocol: 'websocket', transports: ['phone'], voiceId: 'synthetic-own-voice', model: 'synthetic-own-model' });
const text = AgentVoiceSettingsSchema.parse({ mode: 'text-only' });
const own = { agentId: context.agentId, versions: { desired: 4, applied: 3, failed: null }, desired: text, applied: voice };
const schemas = [['read', agent.AgentContextWithChannelsSchema], ['write', agent.AgentContextWithChannelsWriteSchema]] as const;

function applied(raw: unknown): unknown {
  const selected = Reflect.get(agent, 'appliedAgentVoiceSettings') as ((ctx: unknown) => unknown) | undefined;
  expect(typeof selected).toBe('function');
  return selected!(raw);
}

describe('BRIDGE-134 scoped applied voice context', () => {
  it.each(schemas)('preserves legacy %s context without inventing voice', (_label, schema) => {
    const parsed = schema.parse({ ...context, configVersion: 3 });
    expect(parsed).toEqual({ ...context, configVersion: 3 });
    expect(parsed).not.toHaveProperty('voiceConfiguration');
  });
  it.each(schemas)('preserves own applied voice and rejects foreign %s scope', (_label, schema) => {
    expect(schema.parse({ ...context, voiceConfiguration: own }).voiceConfiguration).toEqual(own);
    expect(schema.safeParse({ ...context, voiceConfiguration: { ...own, agentId: 'another-agent' } }).success).toBe(false);
  });
  for (const [label, schema] of schemas) {
    it.each([
      ['settings without version', { ...own, versions: { ...own.versions, applied: null } }],
      ['version without settings', { ...own, applied: null }],
      ['applied ahead of desired', { ...own, versions: { ...own.versions, applied: 5 } }],
      ['invalid applied voice', { ...own, applied: { ...voice, voiceId: '' } }],
      ['malformed configuration', 'synthetic-invalid'],
    ])(`rejects ${label} %s through the existing canonical voice schema`, (_reason, configuration) => {
      expect(schema.safeParse({ ...context, voiceConfiguration: own }).success).toBe(true);
      expect(schema.safeParse({ ...context, voiceConfiguration: configuration }).success).toBe(false);
    });
  }
  it('exports a helper returning null for a legacy context', () => expect(applied(agent.AgentContextWithChannelsSchema.parse(context))).toBeNull());
  it('returns null when desired voice has never been applied', () => {
    const parsed = agent.AgentContextWithChannelsSchema.parse({ ...context, voiceConfiguration: { ...own, desired: voice, applied: null, versions: { desired: 4, applied: null, failed: null } } });
    expect(applied(parsed)).toBeNull();
  });
  it('preserves applied text-only while desired voice is pending', () => {
    const parsed = agent.AgentContextWithChannelsSchema.parse({ ...context, voiceConfiguration: { ...own, desired: voice, applied: text } });
    expect(applied(parsed)).toEqual(text);
  });
  it('returns applied own voice rather than pending text-only desire', () => {
    const parsed = agent.AgentContextWithChannelsSchema.parse({ ...context, voiceConfiguration: own });
    expect(applied(parsed)).toEqual(voice);
  });
});
''')
(r/'tests/http/endpoints/bridge134-voice-register.test.ts').write_text('''import { describe, expect, it } from 'vitest';
import { VoiceRegisterRequestSchema } from '../../../src/http/endpoints/index.js';
import { OutboundCallerIdentitySchema, AgentVoiceErrorCodeSchema, outboundCallerIdentityFor } from '../../../src/capability/voice/index.js';

const caller = OutboundCallerIdentitySchema.parse({ agent: { runtimeAgentId: 'runtime-synthetic', managementAgentId: '42' }, displayName: 'Synthetic caller', persona: 'Synthetic persona', voice: { provider: 'openai_live', voiceId: 'synthetic-own-voice', model: 'synthetic-own-model' }, fromNumber: '+390212345678', settingsVersion: 3 });
const legacy = { agentId: '42', conversationId: 'synthetic-conversation' };

describe('BRIDGE-134 authoritative voice caller', () => {
  it('preserves legacy registration without a caller', () => expect(VoiceRegisterRequestSchema.parse(legacy)).toEqual(legacy));
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
    expect(() => { result = outboundCallerIdentityFor({ ...identity, settings: null! }); }).not.toThrow();
    expect(result).toEqual({ ok: false, error: 'voice_not_applied' });
    expect(outboundCallerIdentityFor({ ...identity, settings: { mode: 'text-only' } })).toEqual({ ok: false, error: 'voice_disabled' });
    expect(outboundCallerIdentityFor({ ...identity, settings: { mode: 'voice', provider: 'openai_live', protocol: 'websocket', transports: ['web'], voiceId: 'synthetic', model: 'synthetic' } })).toEqual({ ok: false, error: 'phone_not_enabled' });
  });
  it('publishes the fixed voice_not_applied error code', () => {
    expect(AgentVoiceErrorCodeSchema.safeParse('voice_not_applied').success).toBe(true);
    expect(AgentVoiceErrorCodeSchema.safeParse('synthetic-arbitrary-error').success).toBe(false);
  });
});
''')
print(now, 'prepared tests before product')
