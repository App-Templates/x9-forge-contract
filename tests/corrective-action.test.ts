import { describe, it, expect } from 'vitest';
import {
  MemoryCorrectiveActionRequestSchema,
  MemoryCorrectiveActionResponseSchema,
  MemoryActorTypeSchema,
  MemoryTargetTypeSchema,
  type MemoryCorrectiveActionRequest,
} from '../src/memory/corrective-action.js';
import { MemoryCorrectiveActionSchema } from '../src/memory/enums.js';

// ---------------------------------------------------------------------------
// Base fixture — used as spread base in all parametric tests
// ---------------------------------------------------------------------------

const baseValid: MemoryCorrectiveActionRequest = {
  tenant_id: 'tenant-001',
  owner_id: 'owner-abc',
  agent_id: 'agent-chief',
  actor_type: 'forge_user',
  actor_id: 'user_clerk_123',
  action: 'invalidate',
  target_type: 'episode',
  target_id: '550e8400-e29b-41d4-a716-446655440000',
};

// ---------------------------------------------------------------------------
// Enum round-trips
// ---------------------------------------------------------------------------

describe('MemoryCorrectiveActionRequestSchema — action enum round-trip (all 10)', () => {
  it.each(MemoryCorrectiveActionSchema.options)(
    'round-trips action "%s"',
    (action) => {
      const parsed = MemoryCorrectiveActionRequestSchema.safeParse({ ...baseValid, action });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.action).toBe(action);
      }
    },
  );
});

describe('MemoryCorrectiveActionRequestSchema — actor_type enum round-trip (all 3)', () => {
  it.each(MemoryActorTypeSchema.options)(
    'round-trips actor_type "%s"',
    (actor_type) => {
      const parsed = MemoryCorrectiveActionRequestSchema.safeParse({ ...baseValid, actor_type });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.actor_type).toBe(actor_type);
      }
    },
  );
});

describe('MemoryCorrectiveActionRequestSchema — target_type enum round-trip (all 5)', () => {
  it.each(MemoryTargetTypeSchema.options)(
    'round-trips target_type "%s"',
    (target_type) => {
      const parsed = MemoryCorrectiveActionRequestSchema.safeParse({ ...baseValid, target_type });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.target_type).toBe(target_type);
      }
    },
  );
});

// ---------------------------------------------------------------------------
// Invalid action value
// ---------------------------------------------------------------------------

describe('MemoryCorrectiveActionRequestSchema — invalid action', () => {
  it('rejects unknown action "nuke" and error references action field', () => {
    const parsed = MemoryCorrectiveActionRequestSchema.safeParse({
      ...baseValid,
      action: 'nuke',
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const actionError = parsed.error.issues.find((i) => i.path.includes('action'));
      expect(actionError).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Missing required fields (8 cases)
// ---------------------------------------------------------------------------

describe('MemoryCorrectiveActionRequestSchema — missing required fields', () => {
  const requiredFields: Array<keyof MemoryCorrectiveActionRequest> = [
    'tenant_id',
    'owner_id',
    'agent_id',
    'actor_type',
    'actor_id',
    'action',
    'target_type',
    'target_id',
  ];

  it.each(requiredFields)('rejects when "%s" is missing', (field) => {
    const payload = { ...baseValid } as Record<string, unknown>;
    delete payload[field];
    const parsed = MemoryCorrectiveActionRequestSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const fieldError = parsed.error.issues.find((i) => i.path.includes(field));
      expect(fieldError).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Optional fields
// ---------------------------------------------------------------------------

describe('MemoryCorrectiveActionRequestSchema — optional fields', () => {
  it('accepts request without user_id (optional)', () => {
    const { ...rest } = baseValid;
    const parsed = MemoryCorrectiveActionRequestSchema.safeParse(rest);
    expect(parsed.success).toBe(true);
  });

  it('accepts request with user_id present', () => {
    const parsed = MemoryCorrectiveActionRequestSchema.safeParse({
      ...baseValid,
      user_id: 'user-42',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.user_id).toBe('user-42');
    }
  });

  it('accepts request without reason (optional)', () => {
    const parsed = MemoryCorrectiveActionRequestSchema.safeParse(baseValid);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.reason).toBeUndefined();
    }
  });

  it('accepts reason within 1000 chars', () => {
    const parsed = MemoryCorrectiveActionRequestSchema.safeParse({
      ...baseValid,
      reason: 'a'.repeat(1000),
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects reason over 1000 chars', () => {
    const parsed = MemoryCorrectiveActionRequestSchema.safeParse({
      ...baseValid,
      reason: 'a'.repeat(1001),
    });
    expect(parsed.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Response schema
// ---------------------------------------------------------------------------

describe('MemoryCorrectiveActionResponseSchema', () => {
  it('accepts valid response with UUID feedback_id', () => {
    const parsed = MemoryCorrectiveActionResponseSchema.safeParse({
      ok: true,
      feedback_id: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.ok).toBe(true);
    }
  });

  it('rejects ok: false (literal mismatch)', () => {
    const parsed = MemoryCorrectiveActionResponseSchema.safeParse({
      ok: false,
      feedback_id: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects non-UUID feedback_id', () => {
    const parsed = MemoryCorrectiveActionResponseSchema.safeParse({
      ok: true,
      feedback_id: 'not-a-uuid',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects missing feedback_id', () => {
    const parsed = MemoryCorrectiveActionResponseSchema.safeParse({
      ok: true,
    });
    expect(parsed.success).toBe(false);
  });
});
