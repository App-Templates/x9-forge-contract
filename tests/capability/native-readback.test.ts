import { expect, it } from 'vitest';
import { ElevenLabsNativeConfigSchema as Config, ElevenLabsNativeDesiredConfigSchema as Desired,
 ElevenLabsNativeConfigReadbackSchema as Readback, ElevenLabsNativeCommandReceiptSchema as Receipt,
 isElevenLabsNativeConfigApplied as applied } from '../../src/capability/index.js';
import { nativeConfig } from './native-fixtures.js';
import { opening } from './coach-operational-fixtures.js';
import { fixtures as f } from './meditation-contract-fixtures.js';
const mapping = { ...f.ElevenLabsCoachSessionBinding.mapping, appliedConfigVersion: opening.appliedConfigVersion };
const desired = { scope: opening.program.scope, configVersion: opening.appliedConfigVersion, promptBundleHash: 'a'.repeat(64), fingerprint: 'b'.repeat(64), config: nativeConfig };
const readback = { requestId: 'synthetic-native-read', mapping, source: 'provider-read', observedAt: opening.openedAt, status: 'known', observed: desired };
const now = new Date(Date.parse(opening.openedAt) + 1000);
it('retains complete concrete settings and intentional empty first message without raw prompt/settings bags', () => {
 expect(Config.parse(nativeConfig)).toEqual(nativeConfig); expect(nativeConfig.agent.first_message).toBe(''); expect(Desired.safeParse(desired).success).toBe(true);
 for (const raw of [{ ...nativeConfig, arbitrary: {} }, { ...nativeConfig, agent: { ...nativeConfig.agent, prompt: { ...nativeConfig.agent.prompt, prompt: 'content' } } },
  { ...nativeConfig, platform_settings: { auth: { ...nativeConfig.platform_settings.auth, enable_auth: false } } }]) expect(Config.safeParse(raw).success).toBe(false);
});
it('requires complete matching fresh readback, not command acknowledgment or resource presence', () => {
 expect(Readback.safeParse(readback).success).toBe(true); expect(applied(desired, readback, mapping, now)).toBe(true);
 const receipt = { requestId: readback.requestId, desired, status: 'accepted', acceptedAt: opening.openedAt };
 expect(Receipt.safeParse(receipt).success).toBe(true); expect(applied(desired, receipt, mapping, now)).toBe(false);
 for (const status of ['missing', 'stale', 'mismatch', 'error', 'unknown']) expect(applied(desired, { ...readback, status, observed: undefined }, mapping, now)).toBe(false);
 for (const field of ['configVersion', 'promptBundleHash', 'fingerprint']) expect(applied(desired, { ...readback, observed: { ...desired, [field]: field === 'configVersion' ? 99 : 'c'.repeat(64) } }, mapping, now)).toBe(false);
 expect(applied(desired, { ...readback, observed: { ...desired, config: { ...nativeConfig, turn: { ...nativeConfig.turn, turn_timeout: 99 } } } }, mapping, now)).toBe(false);
 expect(applied(desired, readback, { ...mapping, providerAgentId: 'foreign-provider' }, now)).toBe(false);
 for (const time of [new Date(NaN), new Date(Date.parse(opening.openedAt) - 1), new Date(Date.parse(opening.openedAt) + 61000)]) expect(applied(desired, readback, mapping, time)).toBe(false);
});
