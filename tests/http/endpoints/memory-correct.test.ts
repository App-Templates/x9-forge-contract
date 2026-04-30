import { describe, it, expect } from 'vitest';
import {
  memoryCorrectContract,
} from '../../../src/http/endpoints/memory-correct.js';
import {
  MemoryCorrectiveActionRequestSchema,
  MemoryCorrectiveActionResponseSchema,
} from '../../../src/memory/corrective-action.js';

// Valid corrective-action request fixture
const validRequest = {
  tenant_id: 'tenant-001',
  owner_id: 'owner-001',
  agent_id: 'agent-001',
  actor_type: 'forge_user' as const,
  actor_id: 'clerk_user_abc123',
  action: 'invalidate' as const,
  target_type: 'episode' as const,
  target_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
};

const validResponse = {
  ok: true as const,
  feedback_id: 'f1a2b3c4-d5e6-7890-abcd-ef1234567890',
};

describe('memoryCorrectContract', () => {
  it('declares POST /internal/memory/correct with secret auth', () => {
    expect(memoryCorrectContract.method).toBe('POST');
    expect(memoryCorrectContract.path).toBe('/internal/memory/correct');
    expect(memoryCorrectContract.authType).toBe('secret');
  });
});

describe('MemoryCorrectiveActionRequestSchema', () => {
  it('parses a valid corrective-action request', () => {
    const result = MemoryCorrectiveActionRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tenant_id).toBe('tenant-001');
      expect(result.data.actor_type).toBe('forge_user');
      expect(result.data.action).toBe('invalidate');
    }
  });

  it('rejects request with missing required tenant_id', () => {
    const bad = { ...validRequest };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (bad as any).tenant_id;
    const result = MemoryCorrectiveActionRequestSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it('rejects request with invalid actor_type', () => {
    const result = MemoryCorrectiveActionRequestSchema.safeParse({
      ...validRequest,
      actor_type: 'unknown_actor',
    });
    expect(result.success).toBe(false);
  });

  it('rejects request with invalid target_type', () => {
    const result = MemoryCorrectiveActionRequestSchema.safeParse({
      ...validRequest,
      target_type: 'not_a_valid_type',
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional reason field', () => {
    const result = MemoryCorrectiveActionRequestSchema.safeParse({
      ...validRequest,
      reason: 'User requested deletion of outdated fact',
    });
    expect(result.success).toBe(true);
  });
});

describe('MemoryCorrectiveActionResponseSchema', () => {
  it('parses a valid success response', () => {
    const result = MemoryCorrectiveActionResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ok).toBe(true);
      expect(result.data.feedback_id).toBe('f1a2b3c4-d5e6-7890-abcd-ef1234567890');
    }
  });

  it('rejects response with ok: false', () => {
    const result = MemoryCorrectiveActionResponseSchema.safeParse({
      ok: false,
      feedback_id: 'f1a2b3c4-d5e6-7890-abcd-ef1234567890',
    });
    expect(result.success).toBe(false);
  });

  it('rejects response with non-uuid feedback_id', () => {
    const result = MemoryCorrectiveActionResponseSchema.safeParse({
      ok: true,
      feedback_id: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });
});
