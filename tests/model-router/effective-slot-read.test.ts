import { describe, expect, it } from 'vitest';
import { INTERNAL_SECRET_HEADER } from '../../src/auth/index.js';
import {
  EffectiveSlotPathParamsSchema,
  EffectiveSlotReadRequestSchema,
  EffectiveSlotStateSchema,
  agentModelSlotPath,
  internalAgentModelSlotContract,
  slotRequestMatchesPath,
  type EffectiveSlotState,
} from '../../src/model-router/index.js';

const params = { agentId: 'x9', slotId: 'memory_extraction' };
const body = {
  scope: { tenantId: '1', ownerId: '1', agentId: 'x9' },
  slotId: 'memory_extraction',
};

describe('effective slot read contract', () => {
  it('exports the POST contract and shared schemas through the barrel', () => {
    expect(internalAgentModelSlotContract.method).toBe('POST');
    expect(internalAgentModelSlotContract.path).toBe('/internal/agents/:agentId/models/slots/:slotId');
    expect(internalAgentModelSlotContract.authType).toBe('secret');
    expect(internalAgentModelSlotContract.authHeader).toBe(INTERNAL_SECRET_HEADER);
    expect(internalAgentModelSlotContract.paramsSchema).toBe(EffectiveSlotPathParamsSchema);
    expect(internalAgentModelSlotContract.bodySchema).toBe(EffectiveSlotReadRequestSchema);
    expect(internalAgentModelSlotContract.responseSchema).toBe(EffectiveSlotStateSchema);
  });

  it('builds the x9 memory extraction path', () => {
    expect(agentModelSlotPath('x9', 'memory_extraction'))
      .toBe('/internal/agents/x9/models/slots/memory_extraction');
  });

  it.each(['unknown slot', 'memory/extraction', ''])('rejects invalid slot id %j', (slotId) => {
    expect(() => agentModelSlotPath('x9', slotId)).toThrow();
  });

  it('validates the agent and rejects extra path parameters', () => {
    expect(() => agentModelSlotPath('x9/other', 'memory_extraction')).toThrow();
    expect(EffectiveSlotPathParamsSchema.safeParse({ ...params, extra: true }).success).toBe(false);
  });

  it('requires the complete identity triple in the body', () => {
    expect(internalAgentModelSlotContract.bodySchema.safeParse(body).success).toBe(true);
    expect(internalAgentModelSlotContract.bodySchema.safeParse({
      ...body, scope: { tenantId: '1', agentId: 'x9' },
    }).success).toBe(false);
  });

  it('matches both the agent and slot without changing the request', () => {
    expect(slotRequestMatchesPath(params, body)).toBe(true);
    expect(slotRequestMatchesPath({ ...params, agentId: 'other' }, body)).toBe(false);
    expect(slotRequestMatchesPath(params, { ...body, slotId: 'agent_chat' })).toBe(false);
    expect(params).toEqual({ agentId: 'x9', slotId: 'memory_extraction' });
    expect(body).toEqual({
      scope: { tenantId: '1', ownerId: '1', agentId: 'x9' }, slotId: 'memory_extraction',
    });
  });

  it('requires an etag for a valid configured state', () => {
    const descriptor = {
      provider: 'openai', modelId: 'gpt-5.6-luna', protocol: 'responses', adapterId: 'openai-live-delegation',
    } as const;
    const configured: EffectiveSlotState = {
      state: 'configured',
      choice: {
        capability: 'agent-core', function: 'reasoning', mode: 'automatic',
        tiers: { standard: descriptor, advanced: descriptor, reasoning: descriptor }, fallback: descriptor,
      },
      generation: { presetId: 3, agentGeneration: 5, presetGeneration: 7 },
      credentialKey: null, credentialVersion: null, etag: 'effective-slot-1',
    };
    expect(internalAgentModelSlotContract.responseSchema.safeParse(configured).success).toBe(true);
    const { etag: _etag, ...withoutEtag } = configured;
    expect(internalAgentModelSlotContract.responseSchema.safeParse(withoutEtag).success).toBe(false);
  });
});
