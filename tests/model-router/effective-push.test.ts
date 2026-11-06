import { describe, expect, it } from 'vitest';
import { INTERNAL_SECRET_HEADER } from '../../src/auth/index.js';
import { CompleteModelIdentitySchema } from '../../src/model-router/agent-model-configuration-values.js';
import {
  ModelsPushAckSchema,
  ModelsReturnWindowRequestSchema,
  internalModelsInvalidateContract,
  internalModelsPushContract,
  internalModelsReturnWindowContract,
  modelsEtag,
  modelsInvalidatePath,
  modelsReturnWindowPath,
} from '../../src/model-router/index.js';

const identity = CompleteModelIdentitySchema.parse({
  managementAgentId: 'x9-staging', runtimeAgentId: 'x9', vaultAgentId: 1,
});

function pushBody() {
  const mode = 'v2' as const;
  const generation = { presetId: 3, agentGeneration: 5, presetGeneration: 7 };
  return {
    identity: { ...identity },
    scope: { agentId: 'x9', ownerId: '1', tenantId: '1' },
    mode,
    generation,
    etag: modelsEtag({ mode, identity, generation }),
    slots: {},
  };
}

describe('ModelsPushAckSchema', () => {
  it('accepts every outcome, with an etag or null', () => {
    for (const outcome of ['accepted', 'same', 'older', 'incomparable']) {
      expect(ModelsPushAckSchema.safeParse({ ok: true, outcome, etag: 'abc' }).success).toBe(true);
    }
    expect(ModelsPushAckSchema.safeParse({ ok: true, outcome: 'older', etag: null }).success).toBe(true);
  });

  it('rejects an unknown outcome, extra fields, an empty etag and ok:false', () => {
    expect(ModelsPushAckSchema.safeParse({ ok: true, outcome: 'invalid', etag: 'abc' }).success).toBe(false);
    expect(ModelsPushAckSchema.safeParse({ ok: true, outcome: 'same', etag: 'abc', extra: 1 }).success).toBe(false);
    expect(ModelsPushAckSchema.safeParse({ ok: true, outcome: 'same', etag: '' }).success).toBe(false);
    expect(ModelsPushAckSchema.safeParse({ ok: false, outcome: 'same', etag: 'abc' }).success).toBe(false);
    expect(ModelsPushAckSchema.safeParse({ ok: true, outcome: 'same' }).success).toBe(false);
  });
});

describe('internalModelsPushContract', () => {
  it('takes a valid effective response as body and rejects a wrong etag', () => {
    const body = pushBody();
    expect(internalModelsPushContract.bodySchema.safeParse(body).success).toBe(true);
    expect(internalModelsPushContract.bodySchema.safeParse({ ...body, etag: 'wrong' }).success).toBe(false);
  });

  it('is a secret-authenticated POST on the effective path', () => {
    expect(internalModelsPushContract.method).toBe('POST');
    expect(internalModelsPushContract.path).toBe('/internal/models/effective');
    expect(internalModelsPushContract.authType).toBe('secret');
  });
});

describe('modelsInvalidatePath', () => {
  it('builds the path for a valid agent and refuses a traversal', () => {
    expect(modelsInvalidatePath('x9')).toBe('/internal/models/invalidate/x9');
    expect(() => modelsInvalidatePath('../x')).toThrow();
  });

  it('answers only ok:true', () => {
    expect(internalModelsInvalidateContract.responseSchema.safeParse({ ok: true }).success).toBe(true);
    expect(internalModelsInvalidateContract.responseSchema.safeParse({ ok: true, x: 1 }).success).toBe(false);
  });
});

describe('return window', () => {
  it('bounds ttlMs to 1000..900000 and requires a positive integer vaultAgentId', () => {
    expect(ModelsReturnWindowRequestSchema.safeParse({ vaultAgentId: 1, ttlMs: 1000 }).success).toBe(true);
    expect(ModelsReturnWindowRequestSchema.safeParse({ vaultAgentId: 1, ttlMs: 900000 }).success).toBe(true);
    expect(ModelsReturnWindowRequestSchema.safeParse({ vaultAgentId: 1, ttlMs: 500 }).success).toBe(false);
    expect(ModelsReturnWindowRequestSchema.safeParse({ vaultAgentId: 1, ttlMs: 900001 }).success).toBe(false);
    expect(ModelsReturnWindowRequestSchema.safeParse({ vaultAgentId: 0, ttlMs: 5000 }).success).toBe(false);
    expect(ModelsReturnWindowRequestSchema.safeParse({ vaultAgentId: 1, ttlMs: 5000, x: 1 }).success).toBe(false);
  });

  it('builds its path and requires a datetime in the answer', () => {
    expect(modelsReturnWindowPath('x9')).toBe('/internal/models/return-window/x9');
    expect(() => modelsReturnWindowPath('../x')).toThrow();
    const schema = internalModelsReturnWindowContract.responseSchema;
    expect(schema.safeParse({ ok: true, until: '2026-11-06T10:00:00.000Z' }).success).toBe(true);
    expect(schema.safeParse({ ok: true, until: 'tomorrow' }).success).toBe(false);
  });
});

describe('auth header', () => {
  it('is INTERNAL_SECRET_HEADER on all three contracts', () => {
    expect(internalModelsPushContract.authHeader).toBe(INTERNAL_SECRET_HEADER);
    expect(internalModelsInvalidateContract.authHeader).toBe(INTERNAL_SECRET_HEADER);
    expect(internalModelsReturnWindowContract.authHeader).toBe(INTERNAL_SECRET_HEADER);
  });
});
