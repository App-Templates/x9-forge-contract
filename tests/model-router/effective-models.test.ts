import { describe, expect, it } from 'vitest';
import { INTERNAL_TOKEN_HEADER } from '../../src/auth/index.js';
import { CompleteModelIdentitySchema } from '../../src/model-router/agent-model-configuration-values.js';
import {
  EffectiveModelSlotSchema,
  EffectiveModelsParamsSchema,
  EffectiveModelsResponseSchema,
  internalModelsEffectiveContract,
  modelsEffectivePath,
  modelsEtag,
  type EffectiveModelSlot,
  type EffectiveModelsResponse,
} from '../../src/model-router/index.js';

// Master identity and scope captured on 2026-10-13; credential names are references only.
const identity = CompleteModelIdentitySchema.parse({
  managementAgentId: 'x9-staging', runtimeAgentId: 'x9', vaultAgentId: 1,
});
const standard = {
  provider: 'openai', modelId: 'gpt-5.6-luna', protocol: 'responses', adapterId: 'openai-live-delegation',
} as const;
const advanced = { ...standard, modelId: 'gpt-5.6-terra' };

function response(): EffectiveModelsResponse {
  const mode = 'v2';
  const generation = { presetId: 3, agentGeneration: 5, presetGeneration: 7 };
  return {
    identity: { ...identity },
    scope: { agentId: 'x9', ownerId: '1', tenantId: '1' },
    mode,
    generation,
    etag: modelsEtag({ mode, identity, generation }),
    slots: {
      agent_chat: {
        choice: {
          capability: 'agent-core', function: 'reasoning', mode: 'automatic',
          tiers: { standard, advanced, reasoning: advanced }, fallback: standard,
        },
        origin: 'preset', version: 2, status: 'active',
        credentialKey: 'OPENAI_API_KEY', credentialVersion: 4,
      },
      memory_extraction: {
        choice: {
          capability: 'memory', function: 'memory-extraction', mode: 'single',
          descriptor: {
            provider: 'openai', modelId: 'gpt-4.1-mini', protocol: 'chat-completions', adapterId: 'openai-chat',
          },
        },
        origin: 'agent', version: 1, status: 'active', credentialKey: null, credentialVersion: null,
      },
    },
  };
}

function chatSlot(): EffectiveModelSlot {
  return response().slots.agent_chat!;
}

describe('EffectiveModelsResponseSchema', () => {
  it('accepts the captured Master identity with preset chat and agent memory choices', () => {
    const input = response();
    expect(EffectiveModelsResponseSchema.parse(input)).toEqual(input);
    expect(Object.keys(input.slots)).toEqual(['agent_chat', 'memory_extraction']);
  });

  it('rejects a scope naming another runtime agent', () => {
    const input = response();
    input.scope.agentId = 'other-agent';
    expect(EffectiveModelsResponseSchema.safeParse(input).success).toBe(false);
  });

  it('requires vaultAgentId in the complete identity', () => {
    const input = response();
    const { vaultAgentId: _vaultAgentId, ...incomplete } = input.identity;
    expect(EffectiveModelsResponseSchema.safeParse({ ...input, identity: incomplete }).success).toBe(false);
  });

  it('rejects an ETag calculated with another presetGeneration', () => {
    const input = response();
    input.etag = modelsEtag({ ...input, generation: { ...input.generation, presetGeneration: 8 } });
    expect(EffectiveModelsResponseSchema.safeParse(input).success).toBe(false);
  });

  it('rejects an unregistered slot even with a valid choice', () => {
    const input = response();
    input.slots = { inventato: chatSlot() };
    expect(EffectiveModelsResponseSchema.safeParse(input).success).toBe(false);
  });

  it('rejects memory_embedding with a reasoning choice', () => {
    const input = response();
    input.slots = {
      memory_embedding: { ...input.slots.memory_extraction!, choice: {
        capability: 'memory', function: 'reasoning', mode: 'single', descriptor: standard,
      } },
    };
    expect(EffectiveModelsResponseSchema.safeParse(input).success).toBe(false);
  });

  it('rejects a choice belonging to another capability', () => {
    const input = response();
    input.slots.agent_chat = { ...chatSlot(), choice: { ...chatSlot().choice, capability: 'memory' } };
    expect(EffectiveModelsResponseSchema.safeParse(input).success).toBe(false);
  });

  it('rejects v1 with a registered slot and a matching v1 ETag', () => {
    const input = response();
    input.mode = 'v1';
    input.generation = { presetId: null, agentGeneration: 5, presetGeneration: 0 };
    input.slots = { agent_chat: chatSlot() };
    input.etag = modelsEtag(input);
    expect(EffectiveModelsResponseSchema.safeParse(input).success).toBe(false);
  });

  it('accepts v1 with no slots and a matching ETag', () => {
    const input = response();
    input.mode = 'v1';
    input.generation = { presetId: null, agentGeneration: 5, presetGeneration: 0 };
    input.slots = {};
    input.etag = modelsEtag(input);
    expect(EffectiveModelsResponseSchema.parse(input)).toEqual(input);
  });

  it('rejects invalid nested generation without throwing from safeParse', () => {
    const input = response();
    input.generation = { presetId: null, agentGeneration: 5, presetGeneration: 1 };
    expect(EffectiveModelsResponseSchema.safeParse(input).success).toBe(false);
  });

  it('rejects credentialKey without credentialVersion in the response', () => {
    const input = response();
    input.slots.agent_chat = { ...chatSlot(), credentialVersion: null };
    expect(EffectiveModelsResponseSchema.safeParse(input).success).toBe(false);
  });

  it('rejects extra response fields', () => {
    expect(EffectiveModelsResponseSchema.safeParse({ ...response(), extra: true }).success).toBe(false);
  });
});

describe('EffectiveModelSlotSchema', () => {
  it.each(['active', 'retired', 'retired-no-successor'])('accepts status %s and upgrade metadata', status => {
    const retirement = status === 'active'
      ? {}
      : { retirement: { modelId: 'previous-model', reason: 'registry', observedAt: '2026-11-06T01:00:00+01:00' } };
    expect(EffectiveModelSlotSchema.safeParse({ ...chatSlot(), status, upgradedFrom: 'previous-model', ...retirement }).success).toBe(true);
  });

  it.each([
    { credentialVersion: null },
    { credentialKey: null },
    { credentialKey: 'invalid key' },
    { credentialVersion: 0 },
    { version: 0 },
    { version: 1.5 },
    { origin: 'master' },
    { status: 'unknown' },
    { upgradedFrom: '' },
    { upgradedFrom: 'x'.repeat(257) },
    { extra: true },
  ])('rejects invalid slot metadata %j', patch => {
    expect(EffectiveModelSlotSchema.safeParse({ ...chatSlot(), ...patch }).success).toBe(false);
  });

  it('requires both credential reference fields even when no credential is used', () => {
    const { credentialVersion: _version, ...withoutVersion } = chatSlot();
    const { credentialKey: _key, ...withoutKey } = chatSlot();
    expect(EffectiveModelSlotSchema.safeParse(withoutVersion).success).toBe(false);
    expect(EffectiveModelSlotSchema.safeParse(withoutKey).success).toBe(false);
    expect(EffectiveModelSlotSchema.safeParse({ ...chatSlot(), credentialKey: null, credentialVersion: null }).success).toBe(true);
  });
});

describe('internalModelsEffectiveContract', () => {
  it('declares token authentication and the exported schemas', () => {
    expect(internalModelsEffectiveContract.method).toBe('GET');
    expect(internalModelsEffectiveContract.path).toBe('/internal/models/effective/:vaultAgentId');
    expect(internalModelsEffectiveContract.authType).toBe('token');
    expect(internalModelsEffectiveContract.authHeader).toBe(INTERNAL_TOKEN_HEADER);
    expect(internalModelsEffectiveContract.paramsSchema).toBe(EffectiveModelsParamsSchema);
    expect(internalModelsEffectiveContract.responseSchema).toBe(EffectiveModelsResponseSchema);
  });

  it('builds a path for Vault agent 7', () => {
    expect(modelsEffectivePath(7)).toBe('/internal/models/effective/7');
  });

  it.each([0, -1, 1.5, NaN, Infinity, 10_000_000_000])('rejects invalid numeric Vault agent ID %s', id => {
    expect(() => modelsEffectivePath(id)).toThrow();
  });

  it('accepts the ten-digit upper bound', () => {
    expect(EffectiveModelsParamsSchema.parse({ vaultAgentId: '9999999999' })).toEqual({ vaultAgentId: '9999999999' });
    expect(modelsEffectivePath(9_999_999_999)).toBe('/internal/models/effective/9999999999');
  });

  it.each(['0', '07', '-1', '1.5', '10000000000', '7/other', ' 7'])('rejects malformed path ID %j', vaultAgentId => {
    expect(EffectiveModelsParamsSchema.safeParse({ vaultAgentId }).success).toBe(false);
  });

  it('requires a string ID and rejects extra params', () => {
    expect(EffectiveModelsParamsSchema.safeParse({ vaultAgentId: 7 }).success).toBe(false);
    expect(EffectiveModelsParamsSchema.safeParse({ vaultAgentId: '7', extra: true }).success).toBe(false);
  });
});
