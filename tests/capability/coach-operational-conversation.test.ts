import { expect, it } from 'vitest';
import { CoachProgramInputEnvelopeSchema as Input, CoachConversationInputRequestSchema as Request, CoachConversationResultSchema as Result } from '../../src/capability/index.js';
import { metadata, projection, response } from './coach-operational-fixtures.js';
it.each(['meditation', 'breathwork', 'trainer'])('preserves %s domain JSON without promoting it to authority', kind => {
  const input = { kind, payload: { profile: { preference: 'synthetic' }, state: { intent: 'practice' }, pace: 1, silence: 3 } };
  expect(Input.parse(input)).toEqual(input); expect(Request.safeParse({ ...metadata, input }).success).toBe(true);
  expect(Result.parse({ ...response, draft: projection, decisionCodes: [] }).draft).toEqual(projection);
  expect(Result.safeParse({ ...response, draft: null, decisionCodes: ['no-space'] }).success).toBe(true);
});
it('bounds actual JSON before recursion and rejects unsafe structures', () => {
  const cyclic: Record<string, unknown> = {}; cyclic.self = cyclic;
  let deep: unknown = {}; for (let i = 0; i < 10; i++) deep = { child: deep };
  for (const payload of [{ x: 'x'.repeat(65537) }, deep, Object.fromEntries(Array.from({ length: 129 }, (_, i) => [i, 0])), { x: Array(501).fill(0) }, { x: undefined }, { x: Infinity }, { x: () => 1 }, cyclic, JSON.parse('{"__proto__":{}}'), new Date()]) expect(Input.safeParse({ kind: 'profile', payload }).success).toBe(false);
  expect(Request.safeParse({ ...metadata, input: { kind: 'profile', payload: {} }, elapsedSeconds: 1 }).success).toBe(false);
  expect(Result.safeParse({ ...response, draft: { ...projection, strategy: { ...projection.strategy, strategyVersion: 'foreign' } }, decisionCodes: [] }).success).toBe(false);
});
