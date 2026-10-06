import { describe, expect, it } from 'vitest';
import {
  ElevenLabsAgentConfigSchema,
  ElevenLabsChannelStatusSchema,
  ElevenLabsProvisionErrorResponseSchema,
  ElevenLabsProvisionRequestSchema,
  ElevenLabsProvisionResultSchema,
} from '../../src/capability/index.js';
import {
  capElevenLabsAgentPath,
  elevenLabsProvisionContract,
  elevenLabsStatusContract,
  ricercaAgentConfigPutContract,
} from '../../src/http/index.js';
import { deriveAgentRuntimeState } from '../../src/agent/index.js';

const scope = { tenantId: 't-1', ownerId: '2', agentId: 'x9-meditazione' };
const config = {
  displayName: 'Luna', voiceId: 'EXAVITQu4vr4xnSDxMaL', model: 'eleven_flash_v2_5', llm: 'gpt-6', language: 'it',
  firstMessage: 'Ciao, sono Luna.', promptVersion: 'workspace@7',
  tools: [
    { name: 'coach_session_start', kind: 'webhook', description: 'Avvia la seduta' },
    { name: 'ui_show_timer', kind: 'client', description: 'Mostra il timer' },
  ],
};
const request = { requestId: 'apply-0000001', scope, configVersion: 3, config, desiredState: 'active' };
const mapping = { scope, providerAgentId: 'agent_01jabc', origin: 'provisioned', createdAt: '2026-10-07T01:00:00Z', appliedConfigVersion: 3 };
const loaded = { channelId: 'elevenlabs', kind: 'voice', state: 'loaded', loaded: true, readiness: 'ready' };
const status = { scope, mapping, desiredState: 'active', channel: loaded, observedAt: '2026-10-07T01:01:00Z' };

describe('R6 cap-agent-elevenlabs provisioning on Apply', () => {
  it('accepts an idempotent apply with versioned config', () => {
    expect(ElevenLabsProvisionRequestSchema.safeParse(request).success).toBe(true);
    expect(ElevenLabsProvisionRequestSchema.safeParse({ ...request, adoptProviderAgentId: 'agent_legacy01', desiredState: 'paused' }).success).toBe(true);
  });

  it.each([
    ['missing request key', { requestId: undefined }],
    ['missing config version', { configVersion: undefined }],
    ['scope without tenant', { scope: { ownerId: '2', agentId: 'x9-meditazione' } }],
    ['person in agent scope', { scope: { ...scope, userId: 'u-1' } }],
    ['api key in request', { apiKey: 'xi-123' }],
    ['malformed provider id', { adoptProviderAgentId: 'agent 01' }],
    ['unknown desired state', { desiredState: 'deleted' }],
  ])('rejects %s', (_label, patch) => {
    expect(ElevenLabsProvisionRequestSchema.safeParse({ ...request, ...patch }).success).toBe(false);
  });

  it.each([
    ['duplicate tool', { tools: [config.tools[0], config.tools[0]] }],
    ['unknown tool kind', { tools: [{ ...config.tools[0], kind: 'server' }] }],
    ['tool name outside the /call rule', { tools: [{ ...config.tools[0], name: 'Coach Start' }] }],
    ['empty display name', { displayName: ' ' }],
    ['missing prompt version', { promptVersion: undefined }],
  ])('rejects config with %s', (_label, patch) => {
    expect(ElevenLabsAgentConfigSchema.safeParse({ ...config, ...patch }).success).toBe(false);
  });
});

describe('R6 mapping and external channel state', () => {
  it('reports the provider resource and a channel X9 state can count', () => {
    const parsed = ElevenLabsChannelStatusSchema.parse(status);
    expect(deriveAgentRuntimeState({ loadState: 'stopped', channelsComplete: true, channels: [] })).toBe('stopped');
    expect(deriveAgentRuntimeState({ loadState: 'unknown', channelsComplete: true, channels: [parsed.channel] })).toBe('active');
  });

  it('accepts a not-yet-provisioned agent and a paused channel', () => {
    expect(ElevenLabsChannelStatusSchema.safeParse({ ...status, mapping: null, channel: { ...loaded, state: 'stopped', loaded: false, readiness: 'not-ready' } }).success).toBe(true);
    expect(ElevenLabsChannelStatusSchema.safeParse({ ...status, desiredState: 'paused', channel: { ...loaded, state: 'paused', loaded: false } }).success).toBe(true);
  });

  it.each([
    ['active channel without provider resource', { mapping: null }],
    ['unobserved channel claiming a state', { observedAt: null }],
    ['telegram as provider channel', { channel: { ...loaded, kind: 'telegram' } }],
    ['mapping for another agent', { mapping: { ...mapping, scope: { ...scope, agentId: 'x9' } } }],
  ])('rejects %s', (_label, patch) => {
    expect(ElevenLabsChannelStatusSchema.safeParse({ ...status, ...patch }).success).toBe(false);
  });

  it('accepts an unobserved channel as unknown', () => {
    expect(ElevenLabsChannelStatusSchema.safeParse({ ...status, observedAt: null, channel: { ...loaded, state: 'unknown', loaded: null, readiness: 'unknown' } }).success).toBe(true);
  });
});

describe('R6 provisioning result and errors', () => {
  const result = { ok: true, requestId: 'apply-0000001', replayed: false, outcome: 'created', mapping, status };

  it('creates once and reports a replay without a second resource', () => {
    expect(ElevenLabsProvisionResultSchema.safeParse(result).success).toBe(true);
    expect(ElevenLabsProvisionResultSchema.safeParse({ ...result, replayed: true }).success).toBe(true);
    expect(ElevenLabsProvisionResultSchema.safeParse({ ...result, outcome: 'adopted', mapping: { ...mapping, origin: 'adopted' }, status: { ...status, mapping: { ...mapping, origin: 'adopted' } } }).success).toBe(true);
  });

  it.each([
    ['created over an adopted resource', { outcome: 'created', mapping: { ...mapping, origin: 'adopted' } }],
    ['adopted over a provisioned resource', { outcome: 'adopted' }],
    ['status pointing at another resource', { status: { ...status, mapping: { ...mapping, providerAgentId: 'agent_other' } } }],
    ['status without the mapping', { status: { ...status, mapping: null, channel: { ...loaded, state: 'stopped', loaded: false } } }],
  ])('rejects %s', (_label, patch) => {
    expect(ElevenLabsProvisionResultSchema.safeParse({ ...result, ...patch }).success).toBe(false);
  });

  it('marks which failures may be retried', () => {
    expect(ElevenLabsProvisionErrorResponseSchema.safeParse({ ok: false, error: 'provider_unavailable', retryable: true }).success).toBe(true);
    expect(ElevenLabsProvisionErrorResponseSchema.safeParse({ ok: false, error: 'reconcile_pending', retryable: true }).success).toBe(true);
    expect(ElevenLabsProvisionErrorResponseSchema.safeParse({ ok: false, error: 'stale_version', retryable: false, currentVersion: 4 }).success).toBe(true);
    expect(ElevenLabsProvisionErrorResponseSchema.safeParse({ ok: false, error: 'provider_unavailable', retryable: false }).success).toBe(false);
    expect(ElevenLabsProvisionErrorResponseSchema.safeParse({ ok: false, error: 'idempotency_conflict', retryable: true }).success).toBe(false);
    expect(ElevenLabsProvisionErrorResponseSchema.safeParse({ ok: false, error: 'stale_version', retryable: false }).success).toBe(false);
  });
});

describe('R6 cap-agent-elevenlabs routes', () => {
  it('lives with the other per-agent capability routes', () => {
    expect(elevenLabsProvisionContract).toMatchObject({ method: 'PUT', path: '/internal/capability/agents/:agentId/elevenlabs', authType: 'secret' });
    expect(elevenLabsStatusContract).toMatchObject({ method: 'GET', path: '/internal/capability/agents/:agentId/elevenlabs', authType: 'secret' });
    expect(elevenLabsProvisionContract.paramsSchema).toBe(ricercaAgentConfigPutContract.paramsSchema);
    expect(capElevenLabsAgentPath('x9-meditazione')).toBe('/internal/capability/agents/x9-meditazione/elevenlabs');
    expect(() => capElevenLabsAgentPath('../x')).toThrow();
  });
});

describe('R6 provisioning result describes exactly one binding (review C, P1)', () => {
  const bScope = { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'agent-a' };
  const bMapping = { scope: bScope, providerAgentId: 'resource_shared', origin: 'provisioned', createdAt: '2026-10-07T00:00:00Z', appliedConfigVersion: 3 };
  const bStatus = { scope: bScope, mapping: bMapping, desiredState: 'active', channel: { channelId: 'provider', kind: 'voice', state: 'loaded', loaded: true, readiness: 'ready' }, observedAt: '2026-10-07T00:01:00Z' };
  const bResult = { ok: true, requestId: 'review-00001', replayed: false, outcome: 'created', mapping: bMapping, status: bStatus };

  it('accepts coherent scope and versions', () => {
    expect(ElevenLabsProvisionResultSchema.safeParse(bResult).success).toBe(true);
  });

  it('accepts a coherent replay', () => {
    expect(ElevenLabsProvisionResultSchema.safeParse({ ...bResult, replayed: true }).success).toBe(true);
  });

  it.each(['tenantId', 'ownerId', 'agentId'] as const)('rejects status of another %s even for the same provider id', (field) => {
    const foreign = { ...bScope, [field]: `${field}-foreign` };
    const body = { ...bResult, status: { ...bStatus, scope: foreign, mapping: { ...bMapping, scope: foreign } } };
    expect(ElevenLabsProvisionResultSchema.safeParse(body).success).toBe(false);
  });

  it.each([
    ['two applied versions', { appliedConfigVersion: 2 }],
    ['two origins', { origin: 'adopted' }],
    ['two creation times', { createdAt: '2026-10-07T00:00:30Z' }],
  ])('rejects %s for the same binding', (_label, patch) => {
    expect(ElevenLabsProvisionResultSchema.safeParse({ ...bResult, status: { ...bStatus, mapping: { ...bMapping, ...patch } } }).success).toBe(false);
  });
});
