import { describe, expect, it } from 'vitest';
import { AgentCreationRequestSchema, AgentCreationCheckpointSchema, AgentCreationResultSchema, creationReplay } from '../../src/agent/agent-creation-replay.js';
import { request, checkpoint, channel, scope, identity } from './r2-fixtures.js';
describe('R2 replayable creation request', () => {
  it('reuses deploy fields and explicit paused intentions', () => expect(AgentCreationRequestSchema.parse(request)).toEqual(request));
  it.each([
    ['unknown request field', { rawError: 'synthetic' }],
    ['unknown intent field', { intent: { ...request.intent, rawError: 'synthetic' } }],
    ['unknown intention field', { intent: { ...request.intent, channels: { ...request.intent.channels, token: 'synthetic' } } }],
    ['missing key', { intent: { ...request.intent, idempotencyKey: undefined } }],
    ['short key', { intent: { ...request.intent, idempotencyKey: 'tiny' } }],
    ['missing telegram intention', { intent: { ...request.intent, channels: { email: 'paused' } } }],
    ['missing channel intention', { intent: { ...request.intent, channels: { telegram: 'paused' } } }],
    ['runtime mismatch', { intent: { ...request.intent, identity: { ...identity, runtimeAgentId: 'other' } } }],
    ['slug mismatch', { slug: 'other' }],
    ['raw token', { telegram_bot_token: 'synthetic' }],
    ['legacy owner', { ownerId: 1 }],
    ['legacy email flag', { email_enabled: false }],
    ['legacy flags', { telegram_enabled: true }],
  ])('rejects %s', (_label, patch) => expect(AgentCreationRequestSchema.safeParse({ ...request, ...patch }).success).toBe(false));
});
describe('R2 checkpoint keeps one agent and its resources', () => {
  it('accepts completed checkpoint with first real check and both pauses applied', () => expect(AgentCreationCheckpointSchema.safeParse(checkpoint()).success).toBe(true));
  it.each([
    ['unknown phase', { phase: 'unexpected' }],
    ['undated first check', { firstCheck: { ...checkpoint().firstCheck, checkedAt: undefined } }],
    ['unknown first check field', { firstCheck: { ...checkpoint().firstCheck, token: 'synthetic' } }],
    ['unknown checkpoint field', { privateDetail: 'synthetic' }],
    ['no database record', { agentRecordId: null }],
    ['no first check', { firstCheck: null }],
    ['check failure', { firstCheck: { ...checkpoint().firstCheck, error: { code: 'first_check_failed', retryable: false } } }],
    ['unloaded check channel', { firstCheck: { ...checkpoint().firstCheck, channel: { ...checkpoint().firstCheck.channel, state: 'paused', loaded: false, readiness: 'ready' } } }],
    ['not-ready check', { firstCheck: { ...checkpoint().firstCheck, channel: { ...checkpoint().firstCheck.channel, readiness: 'not-ready' } } }],
    ['check on a paused birth channel', { firstCheck: { ...checkpoint().firstCheck, channel: { ...checkpoint().firstCheck.channel, kind: 'telegram', channelId: 'telegram' } } }],
    ['missing channel snapshot', { channels: [channel()] }],
    ['unapplied channel', { channels: [{ ...channel(), applied: null, observation: null, observedAt: null }, channel('email')] }],
    ['failed channel', { channels: [{ ...channel(), error: { code: 'source_unavailable', retryable: true } }, channel('email')] }],
    ['duplicate channel', { channels: [channel(), channel()] }],
    ['foreign scope', { channels: [{ ...channel(), scope: { ...scope, ownerId: 'foreign' }, resource: null }, channel('email')] }],
    ['foreign management identity', { channels: [{ ...channel(), identity: { ...identity, managementAgentId: 'other' }, resource: null }, channel('email')] }],
    ['another desired version', { channels: [{ ...channel(), desired: { version: 3, state: 'paused' } }, channel('email')] }],
    ['another desired state', { channels: [{ ...channel(), desired: { version: 3, state: 'active' } }, channel('email')] }],
    ['completed with failure', { failure: { step: 'first-check', error: { code: 'first_check_failed', retryable: false } } }],
  ])('rejects %s', (_label, patch) => expect(AgentCreationCheckpointSchema.safeParse({ ...checkpoint(), ...patch }).success).toBe(false));
  it('checks the same active birth channel and supports explicit replay results', () => {
    const active = { ...channel(), desired: { version: 2, state: 'active' }, applied: { version: 2, state: 'active' }, observation: { ...channel().observation, state: 'loaded', loaded: true, readiness: 'ready' } };
    const job = { ...checkpoint(), request: { ...request, intent: { ...request.intent, channels: { telegram: 'active', email: 'paused' } } }, channels: [active, channel('email')], firstCheck: { ...checkpoint().firstCheck, channel: active.observation } };
    expect(AgentCreationCheckpointSchema.safeParse(job).success).toBe(true);
    expect(AgentCreationCheckpointSchema.safeParse({ ...job, firstCheck: { ...job.firstCheck, channel: { ...active.observation, channelId: 'other' } } }).success).toBe(false);
    expect(AgentCreationResultSchema.safeParse({ ok: true, replayed: true, checkpoint: job }).success).toBe(true);
    expect(AgentCreationResultSchema.safeParse({ ok: true, checkpoint: job }).success).toBe(false);
    expect(AgentCreationResultSchema.safeParse({ ok: false, replayed: true, checkpoint: job }).success).toBe(false);
    expect(AgentCreationResultSchema.safeParse({ ok: true, replayed: true, checkpoint: job, token: 'synthetic' }).success).toBe(false);
  });
  it('records an incomplete step without inventing readiness', () => {
    const incomplete = { ...checkpoint(), phase: 'incomplete', firstCheck: null, failure: { step: 'runtime', error: { code: 'load_failed', retryable: false } } };
    expect(AgentCreationCheckpointSchema.safeParse(incomplete).success).toBe(true);
    expect(AgentCreationCheckpointSchema.safeParse({ ...incomplete, failure: null }).success).toBe(false);
    expect(AgentCreationCheckpointSchema.safeParse({ ...incomplete, failure: { ...incomplete.failure, detail: 'synthetic' } }).success).toBe(false);
  });
  it.each([
    ['version', { ...channel(), desired: { version: 3, state: 'paused' } }],
    ['state', { ...channel(), desired: { version: 2, state: 'active' }, applied: { version: 1, state: 'paused' } }],
  ])('checks stored %s intention even before completion', (_label, config) => {
    expect(AgentCreationCheckpointSchema.safeParse({ ...checkpoint(), phase: 'pending', firstCheck: null, channels: [config, channel('email')] }).success).toBe(false);
  });
  it('rejects arbitrary step and failure text', () => {
    const failed = { ...checkpoint(), phase: 'incomplete', firstCheck: null, failure: { step: 'external private error', error: { code: 'load_failed', retryable: false } } };
    expect(AgentCreationCheckpointSchema.safeParse(failed).success).toBe(false);
  });
  it('allows a pending job before resources and agent exist', () => expect(AgentCreationCheckpointSchema.safeParse({ ...checkpoint(), phase: 'pending', agentRecordId: null, channels: [], firstCheck: null }).success).toBe(true));
});
describe('R2 replay disposition', () => {
  it('fails loudly on invalid requests or stored checkpoints', () => {
    expect(() => creationReplay(null, { ...request, intent: undefined })).toThrow();
    expect(() => creationReplay({}, request)).toThrow();
  });
  it('creates only with no previous checkpoint', () => expect(creationReplay(null, request)).toEqual({ action: 'create' }));
  it('returns completed same job, database record, resources and source without mutation', () => {
    const previous = checkpoint(); const before = structuredClone(previous);
    const result = creationReplay(previous, request);
    expect(result).toEqual({ action: 'completed', replayed: true, checkpoint: previous });
    expect(previous).toEqual(before);
    expect(creationReplay(previous, { ...request, intent: { ...request.intent }, name: 'Review' })).toEqual(result);
  });
  it('resumes incomplete and running same checkpoint', () => {
    for (const phase of ['pending', 'running', 'incomplete']) {
      const previous = { ...checkpoint(), phase, firstCheck: null, failure: phase === 'incomplete' ? { step: 'runtime', error: { code: 'load_failed', retryable: false } } : null };
      expect(creationReplay(previous, request)).toEqual({ action: 'resume', replayed: true, checkpoint: previous });
    }
  });
  it.each([
    ['key', { intent: { ...request.intent, idempotencyKey: 'another-00001' } }],
    ['tenant', { intent: { ...request.intent, scope: { ...scope, tenantId: 'other' } } }],
    ['owner', { intent: { ...request.intent, scope: { ...scope, ownerId: 'other' } } }],
    ['source', { intent: { ...request.intent, source: { managementAgentId: 'other', runtimeAgentId: 'other' } } }],
    ['version', { intent: { ...request.intent, configVersion: 3 } }],
    ['channel', { intent: { ...request.intent, channels: { telegram: 'active', email: 'paused' } } }],
    ['objective', { objective: 'different' }],
    ['capabilities', { selectedCapabilities: [] }],
    ['name', { name: 'Other' }],
  ])('conflicts on changed %s even with same job', (_label, patch) => expect(creationReplay(checkpoint(), { ...request, ...patch })).toEqual({ action: 'conflict', error: 'idempotency_conflict' }));
  it('ignores property order but not payload changes', () => {
    expect(creationReplay(checkpoint(), { intent: request.intent, telegram_allow_from: [], selectedCapabilities: request.selectedCapabilities, name: request.name }).action).toBe('completed');
  });
});

// Regression from the independent R27 review of e318fe9; web is textual per the coordinator's clarification.
describe('R2 completed creation requires an applied ready textual channel', () => {
  const activeEmail = () => {
    const email = { ...channel('email'), desired: { version: 2, state: 'active' }, applied: { version: 2, state: 'active' },
      observation: { channelId: 'synthetic-email', kind: 'email', state: 'loaded', loaded: true, readiness: 'ready' } };
    return { ...checkpoint(), request: { ...request, intent: { ...request.intent, channels: { telegram: 'paused', email: 'active' } } },
      channels: [channel(), email], firstCheck: { ...checkpoint().firstCheck, channel: email.observation } };
  };
  const readyVoice = { channelId: 'synthetic-voice', kind: 'voice', state: 'loaded', loaded: true, readiness: 'ready' };
  it('rejects voice-only completion when both textual birth channels are paused (R27)', () => {
    const job = checkpoint();
    expect(AgentCreationCheckpointSchema.safeParse({ ...job, firstCheck: { ...job.firstCheck, channel: readyVoice } }).success).toBe(false);
  });
  it('rejects ready voice when the only active textual handler is not ready (R27)', () => {
    const job = activeEmail();
    const email = { ...job.channels[1], observation: { ...job.channels[1].observation, readiness: 'not-ready' } };
    expect(AgentCreationCheckpointSchema.safeParse({ ...job, channels: [channel(), email],
      firstCheck: { ...job.firstCheck, channel: readyVoice } }).success).toBe(false);
  });
  it('accepts an attested ready web check when both birth channels are paused', () => {
    expect(AgentCreationCheckpointSchema.safeParse(checkpoint()).success).toBe(true);
  });
  it('rejects a ready first check that hides a degraded applied textual observation', () => {
    const job = activeEmail();
    expect(AgentCreationCheckpointSchema.safeParse({ ...job, channels: [channel(),
      { ...job.channels[1], observation: { ...job.channels[1].observation, readiness: 'not-ready' } }] }).success).toBe(false);
  });
  it('accepts ready email while Telegram is paused and preserves replay identity', () => {
    const job = activeEmail();
    expect(creationReplay(job, job.request)).toEqual({ action: 'completed', replayed: true, checkpoint: job });
  });
  it('accepts paused creation intent before completion without inventing readiness', () => {
    expect(AgentCreationCheckpointSchema.safeParse({ ...checkpoint(), phase: 'pending', firstCheck: null }).success).toBe(true);
  });
});
