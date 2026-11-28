import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import * as seats from '../../../src/http/endpoints/internal-paperclip-seats.js';
import * as http from '../../../src/http/index.js';
import { canonicalJson } from '../../../src/organization/action-plan.js';

// Only requestId and counters are attested by 629. Scope, identity, units and
// the UUID representing GOO-177 are reconstructed from the existing 5884 shape.
function body(attempt = 12, maxAttempts = 15) {
  return {
    scope: { tenantId: 't1', ownerId: 'o1', agentId: 'director-a' },
    eventId: `approved-units:dec_da4e8384:${attempt}`,
    organizationId: 'org-a',
    identity: { managementAgentId: 'director-a', runtimeAgentId: 'director-a', vaultAgentId: 7 },
    event: {
      kind: 'approved_units_failed' as const,
      requestId: 'dec_da4e8384',
      directorIssueId: '11111111-1111-4111-8111-111111111111',
      units: [{ unitId: 'area-1', reason: 'factory refused: 409' }],
      attempt,
      maxAttempts,
    },
  };
}

const bodySchemas = [
  seats.InternalPaperclipSeatNativeWakeRequestSchema,
  seats.internalPaperclipSeatNativeWakeContract.bodySchema,
];

function expectRejected(input: unknown, path: (string | number)[]) {
  for (const schema of bodySchemas) {
    const result = schema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues.map(issue => issue.path)).toContainEqual(path);
  }
}

describe('s8705 retry ceiling', () => {
  it('s8705 accepts production counters', () => {
    const input = body();
    const result = seats.InternalPaperclipSeatNativeWakeRequestSchema.safeParse(input);
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
    for (const schema of bodySchemas) expect(schema.parse(input)).toStrictEqual(input);
    expect(seats.PaperclipSeatNativeWakeEventSchema.parse(input.event)).toStrictEqual(input.event);
  });

  it('s8705 exports the shared literal ceiling through HTTP', () => {
    expect(Reflect.get(seats, 'PAPERCLIP_APPROVED_UNITS_RETRY_HARD_CAP')).toBe(15);
    expect(Reflect.get(http, 'PAPERCLIP_APPROVED_UNITS_RETRY_HARD_CAP')).toBe(15);
  });

  it.each([[15, 15], [1, 5], [5, 5], [10, 10]])(
    's8705 accepts unchanged counters %i/%i', (attempt, maxAttempts) => {
      const input = body(attempt, maxAttempts);
      for (const schema of bodySchemas) expect(schema.parse(input)).toStrictEqual(input);
      expect(seats.PaperclipSeatNativeWakeEventSchema.parse(input.event)).toStrictEqual(input.event);
    },
  );

  it('s8705 refuses counters above ceiling', () => {
    for (const [attempt, maxAttempts, field] of [
      [12, 16, 'maxAttempts'],
      [16, 15, 'attempt'],
    ] as const) {
      const input = body(attempt, maxAttempts);
      expectRejected(input, ['event', field]);
      const result = seats.PaperclipSeatNativeWakeEventSchema.safeParse(input.event);
      expect(result.success).toBe(false);
      expect(result.error?.issues.map(issue => issue.path)).toContainEqual([field]);
    }
  });

  it('s8705 preserves the relative attempt bound', () => {
    const input = body(13, 12);
    expectRejected(input, ['event', 'attempt']);
    const result = seats.PaperclipSeatNativeWakeEventSchema.safeParse(input.event);
    expect(result.success).toBe(false);
    expect(result.error?.issues.map(issue => issue.path)).toContainEqual(['attempt']);
  });

  it.each(['attempt', 'maxAttempts'] as const)('s8705 rejects invalid %s types and ranges', field => {
    for (const value of [0, -1, 1.5, '12']) {
      const input = body();
      const event = { ...input.event, [field]: value };
      expectRejected({ ...input, event }, ['event', field]);
      const result = seats.PaperclipSeatNativeWakeEventSchema.safeParse(event);
      expect(result.success).toBe(false);
      expect(result.error?.issues.map(issue => issue.path)).toContainEqual([field]);
    }
  });

  it('s8705 preserves strictness, units and identity requirements', () => {
    const input = body();
    expectRejected({ ...input, extra: true }, []);
    for (const [event, path] of [
      [{ ...input.event, extra: true }, []],
      [{ ...input.event, units: [] }, ['units']],
      [{ ...input.event, units: [{ ...input.event.units[0], extra: true }] }, ['units', 0]],
    ] as const) {
      expectRejected({ ...input, event }, ['event', ...path]);
      const result = seats.PaperclipSeatNativeWakeEventSchema.safeParse(event);
      expect(result.success).toBe(false);
      expect(result.error?.issues.map(issue => issue.path)).toContainEqual([...path]);
    }
    expectRejected({ ...input, organizationId: undefined }, ['organizationId']);
    expectRejected({ ...input, identity: undefined }, ['identity']);
    expectRejected({ ...input, scope: undefined }, ['scope']);
    expectRejected({ ...input, identity: { ...input.identity, runtimeAgentId: 'other-agent' } },
      ['identity', 'runtimeAgentId']);
  });

  it('s8705 saved body unchanged', () => {
    // Local saved JSON only: no production registry is read or written.
    for (const [attempt, maxAttempts] of [[12, 15], [15, 15], [1, 5], [5, 5], [10, 10]]) {
      const input = body(attempt, maxAttempts);
      const saved = JSON.stringify(input);
      const canonical = canonicalJson(input);
      const digest = createHash('sha256').update(canonical).digest('hex');
      Object.freeze(input.scope);
      Object.freeze(input.identity);
      input.event.units.forEach(Object.freeze);
      Object.freeze(input.event.units);
      Object.freeze(input.event);
      Object.freeze(input);
      for (const schema of bodySchemas) {
        const reread: unknown = JSON.parse(saved);
        const parsed = schema.parse(reread);
        expect(schema.parse(input)).toStrictEqual(input);
        expect(parsed).toStrictEqual(input);
        expect(JSON.stringify(parsed)).toBe(saved);
        expect(canonicalJson(parsed)).toBe(canonical);
        expect(createHash('sha256').update(canonicalJson(parsed)).digest('hex')).toBe(digest);
        expect(JSON.stringify(input)).toBe(saved);
      }
    }
  });
});
