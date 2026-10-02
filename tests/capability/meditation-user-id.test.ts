import { describe, expect, it } from 'vitest';
import { ToolCallRequestSchema, CapabilityContextRequestSchema } from '../../src/capability/index.js';
import { InternalAgentTurnRequestSchema } from '../../src/http/endpoints/internal-agent-turn.js';
import { InternalTurnRequestSchema } from '../../src/http/endpoints/internal-turn.js';
import { InternalMemoryExtractRequestSchema } from '../../src/http/endpoints/internal-memory-extract.js';
import { InternalMemoryRecallBundleRequestSchema } from '../../src/http/endpoints/internal-memory-recall-bundle.js';

// All identities and messages in these fixtures are synthetic.
const turn = { channelId: 'meditation-test', sessionId: 'synthetic-session', message: 'Synthetic greeting' };
const envelopes = [
  ['agent turn', InternalAgentTurnRequestSchema, turn],
  ['tool dispatch', ToolCallRequestSchema, { callId: 'synthetic-call', tool: 'synthetic_tool', input: {}, agentId: 'synthetic-agent', sessionId: 'synthetic-session' }],
  ['capability context', CapabilityContextRequestSchema, { agentId: 'synthetic-agent', sessionId: 'synthetic-session', channelId: 'meditation-test' }],
] as const;

describe.each(envelopes)('B1 authenticated userId: %s', (_name, schema, legacy) => {
  it('preserves the exact legacy JSON bytes without userId', () => {
    const parsed = schema.parse(legacy);
    expect(JSON.stringify(parsed)).toBe(JSON.stringify(legacy));
    expect(Object.hasOwn(parsed, 'userId')).toBe(false);
  });

  it('keeps two distinct users and accepts both length boundaries', () => {
    for (const userId of ['clerk:synthetic-a', 'clerk:synthetic-b', 'x', 'x'.repeat(256)]) {
      expect(schema.parse({ ...legacy, userId }).userId).toBe(userId);
    }
  });

  it('enforces the memory bounds and rejects empty, oversized and non-string identities', () => {
    for (const userId of ['', 'x'.repeat(257), 7, null, {}, []]) {
      expect(schema.safeParse({ ...legacy, userId }).success).toBe(false);
      expect(InternalMemoryRecallBundleRequestSchema.shape.userId.safeParse(userId).success).toBe(false);
      expect(InternalMemoryExtractRequestSchema.shape.userId.safeParse(userId).success).toBe(false);
    }
  });
});

it('does not introduce userId into the personal turn contract', () => {
  expect(JSON.stringify(InternalTurnRequestSchema.parse({ ...turn, userId: 'clerk:synthetic-a' }))).toBe(JSON.stringify(turn));
  expect(Object.hasOwn(InternalTurnRequestSchema.shape, 'userId')).toBe(false);
});
