import { describe, it, expect } from 'vitest';
import {
  makeListResponseSchema,
  MemoryConsoleEpisodeSchema,
  MemoryConsoleFactSchema,
  MemoryConsoleRuleSchema,
  MemoryConsoleAliasSchema,
  MemoryConsoleFeedbackSchema,
  MemoryConsoleEpisodesResponseSchema,
  type MemoryConsoleEpisode,
  type MemoryConsoleFact,
  type MemoryConsoleRule,
  type MemoryConsoleAlias,
  type MemoryConsoleFeedback,
} from '../src/memory/console.js';

// ---------------------------------------------------------------------------
// Fixture builders — minimally-valid objects per row type
// ---------------------------------------------------------------------------

function makeEpisode(overrides: Partial<MemoryConsoleEpisode> = {}): MemoryConsoleEpisode {
  return {
    id: '550e8400-e29b-41d4-a716-446655440001',
    tenantId: 'tenant-001',
    ownerId: 'owner-abc',
    agentId: 'agent-chief',
    userId: null,
    createdAt: '2026-04-16T10:00:00Z',
    contentType: 'chat-message',
    privacyLevel: 'standard',
    contentSummary: 'User discussed morning routine preferences.',
    status: 'active',
    ...overrides,
  };
}

function makeFact(overrides: Partial<MemoryConsoleFact> = {}): MemoryConsoleFact {
  return {
    id: '550e8400-e29b-41d4-a716-446655440002',
    tenantId: 'tenant-001',
    ownerId: 'owner-abc',
    agentId: 'agent-chief',
    subjectEntityId: null,
    predicate: 'prefers_language',
    objectValue: 'Italian',
    privacyLevel: 'standard',
    status: 'active',
    createdAt: '2026-04-16T10:00:00Z',
    ...overrides,
  };
}

function makeRule(overrides: Partial<MemoryConsoleRule> = {}): MemoryConsoleRule {
  return {
    id: '550e8400-e29b-41d4-a716-446655440003',
    tenantId: 'tenant-001',
    ownerId: 'owner-abc',
    agentId: 'agent-chief',
    ruleText: 'When user says buongiorno, respond in Italian.',
    privacyLevel: 'standard',
    priority: 100,
    status: 'active',
    createdAt: '2026-04-16T10:00:00Z',
    ...overrides,
  };
}

function makeAlias(overrides: Partial<MemoryConsoleAlias> = {}): MemoryConsoleAlias {
  return {
    id: '550e8400-e29b-41d4-a716-446655440004',
    tenantId: 'tenant-001',
    ownerId: 'owner-abc',
    agentId: 'agent-chief',
    alias: 'Stefano',
    canonicalEntityId: '550e8400-e29b-41d4-a716-999999999999',
    createdAt: '2026-04-16T10:00:00Z',
    ...overrides,
  };
}

function makeFeedback(overrides: Partial<MemoryConsoleFeedback> = {}): MemoryConsoleFeedback {
  return {
    id: '550e8400-e29b-41d4-a716-446655440005',
    tenantId: 'tenant-001',
    ownerId: 'owner-abc',
    agentId: 'agent-chief',
    userId: null,
    actorType: 'forge_user',
    actorId: 'user_clerk_123',
    action: 'invalidate',
    targetType: 'episode',
    targetId: '550e8400-e29b-41d4-a716-446655440001',
    reason: null,
    beforeSnapshot: null,
    afterSnapshot: null,
    createdAt: '2026-04-16T10:00:00Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Row schema validation
// ---------------------------------------------------------------------------

describe('MemoryConsoleEpisodeSchema', () => {
  it('parses a minimally-valid episode row', () => {
    const parsed = MemoryConsoleEpisodeSchema.safeParse(makeEpisode());
    expect(parsed.success).toBe(true);
  });

  it('parses episode with all nullable fields as null', () => {
    const parsed = MemoryConsoleEpisodeSchema.safeParse(
      makeEpisode({ ownerId: null, agentId: null, userId: null, contentSummary: null }),
    );
    expect(parsed.success).toBe(true);
  });

  it('parses a redacted episode (contentSummary = "[redacted]", status = "redacted")', () => {
    const parsed = MemoryConsoleEpisodeSchema.safeParse(
      makeEpisode({ status: 'redacted', contentSummary: '[redacted]' }),
    );
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.contentSummary).toBe('[redacted]');
    }
  });

  it('rejects episode with invalid UUID id', () => {
    const parsed = MemoryConsoleEpisodeSchema.safeParse(makeEpisode({ id: 'not-a-uuid' }));
    expect(parsed.success).toBe(false);
  });
});

describe('MemoryConsoleFactSchema', () => {
  it('parses a minimally-valid fact row', () => {
    const parsed = MemoryConsoleFactSchema.safeParse(makeFact());
    expect(parsed.success).toBe(true);
  });

  it('parses fact with nullable subjectEntityId as null', () => {
    const parsed = MemoryConsoleFactSchema.safeParse(makeFact({ subjectEntityId: null }));
    expect(parsed.success).toBe(true);
  });

  it('parses fact with subjectEntityId present', () => {
    const parsed = MemoryConsoleFactSchema.safeParse(
      makeFact({ subjectEntityId: '550e8400-e29b-41d4-a716-000000000001' }),
    );
    expect(parsed.success).toBe(true);
  });
});

describe('MemoryConsoleRuleSchema', () => {
  it('parses a minimally-valid rule row', () => {
    const parsed = MemoryConsoleRuleSchema.safeParse(makeRule());
    expect(parsed.success).toBe(true);
  });

  it('parses rule with priority integer', () => {
    const parsed = MemoryConsoleRuleSchema.safeParse(makeRule({ priority: 50 }));
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.priority).toBe(50);
    }
  });
});

describe('MemoryConsoleAliasSchema', () => {
  it('parses a minimally-valid alias row', () => {
    const parsed = MemoryConsoleAliasSchema.safeParse(makeAlias());
    expect(parsed.success).toBe(true);
  });

  it('has no privacyLevel field (aliases inherit from canonical entity)', () => {
    // Aliases intentionally have no privacyLevel — schema should not require it
    const aliasWithoutPrivacy = makeAlias();
    // @ts-expect-error — privacyLevel is not in the type
    expect((aliasWithoutPrivacy as Record<string, unknown>).privacyLevel).toBeUndefined();
    const parsed = MemoryConsoleAliasSchema.safeParse(aliasWithoutPrivacy);
    expect(parsed.success).toBe(true);
  });
});

describe('MemoryConsoleFeedbackSchema', () => {
  it('parses a minimally-valid feedback row (all nullable fields as null)', () => {
    const parsed = MemoryConsoleFeedbackSchema.safeParse(makeFeedback());
    expect(parsed.success).toBe(true);
  });

  it('parses feedback with beforeSnapshot and afterSnapshot as records', () => {
    const parsed = MemoryConsoleFeedbackSchema.safeParse(
      makeFeedback({
        beforeSnapshot: { status: 'active', privacyLevel: 'standard' },
        afterSnapshot: { status: 'invalidated', privacyLevel: 'standard' },
      }),
    );
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.beforeSnapshot).toEqual({ status: 'active', privacyLevel: 'standard' });
      expect(parsed.data.afterSnapshot).toEqual({
        status: 'invalidated',
        privacyLevel: 'standard',
      });
    }
  });

  it('parses feedback with reason string', () => {
    const parsed = MemoryConsoleFeedbackSchema.safeParse(
      makeFeedback({ reason: 'Data was incorrect per user request.' }),
    );
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.reason).toBe('Data was incorrect per user request.');
    }
  });

  it('parses feedback with userId present', () => {
    const parsed = MemoryConsoleFeedbackSchema.safeParse(makeFeedback({ userId: 'user-42' }));
    expect(parsed.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// List envelope
// ---------------------------------------------------------------------------

describe('makeListResponseSchema + MemoryConsoleEpisodesResponseSchema', () => {
  it('parses a list with one entry and non-null nextCursor', () => {
    const parsed = MemoryConsoleEpisodesResponseSchema.safeParse({
      ok: true,
      entries: [makeEpisode()],
      nextCursor: 'eyJjcmVhdGVkQXQiOiIyMDI2LTA0LTE2IiwiaWQiOiIxMjMifQ==',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.entries).toHaveLength(1);
      expect(parsed.data.nextCursor).toBe(
        'eyJjcmVhdGVkQXQiOiIyMDI2LTA0LTE2IiwiaWQiOiIxMjMifQ==',
      );
    }
  });

  it('parses an empty list with null nextCursor', () => {
    const parsed = MemoryConsoleEpisodesResponseSchema.safeParse({
      ok: true,
      entries: [],
      nextCursor: null,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.entries).toHaveLength(0);
      expect(parsed.data.nextCursor).toBeNull();
    }
  });

  it('rejects nextCursor: undefined (must be string | null only)', () => {
    // nextCursor must be explicitly null, not undefined — the field is required
    const parsed = MemoryConsoleEpisodesResponseSchema.safeParse({
      ok: true,
      entries: [],
      // nextCursor missing → Zod required field absent
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects ok: false', () => {
    const parsed = MemoryConsoleEpisodesResponseSchema.safeParse({
      ok: false,
      entries: [],
      nextCursor: null,
    });
    expect(parsed.success).toBe(false);
  });

  it('makeListResponseSchema generic helper works with MemoryConsoleFactSchema', () => {
    const FactsResponseSchema = makeListResponseSchema(MemoryConsoleFactSchema);
    const parsed = FactsResponseSchema.safeParse({
      ok: true,
      entries: [makeFact()],
      nextCursor: null,
    });
    expect(parsed.success).toBe(true);
  });
});
