import { describe, expect, it } from 'vitest';
import { CoachProgramVersionRefSchema as Program, CoachStrategyRefSchema as Strategy, CoachProgramSchema } from '../../src/capability/index.js';
import { fixtures as f } from './meditation-contract-fixtures.js';
describe('versioned generic programs', () => {
  it.each(['meditation', 'breathwork', 'trainer'])('pins %s without domain enums', (kind) => {
    const ref = { ...f.CoachProgramVersionRef, programId: kind, programVersion: kind === 'meditation' ? 1 : kind === 'breathwork' ? 2 : 3, strategy: { strategyId: kind, strategyVersion: 'v2' } };
    expect(Program.parse(ref)).toEqual(ref);
  });
  it.each(['scope', 'programVersion', 'strategy', 'catalogRevision', 'policyRevision', 'progressionRevision', 'measureDefinitionRevision'])('requires %s', key => {
    expect(Program.safeParse({ ...f.CoachProgramVersionRef, [key]: undefined }).success).toBe(false);
  });
  it('keeps versions and strict legacy programs distinct', () => {
    expect(Strategy.safeParse({ strategyId: 'open-domain', strategyVersion: '' }).success).toBe(false);
    expect(Program.safeParse({ ...f.CoachProgramVersionRef, configVersion: 1 }).success).toBe(false);
    expect(Program.safeParse({ ...f.CoachProgramVersionRef, programVersion: '2' }).success).toBe(false);
    expect(Program.safeParse({ ...f.CoachProgramVersionRef, policyRevision: '' }).success).toBe(false);
    const legacy = { scope: f.CoachProgramVersionRef.scope, programId: 'legacy', kind: 'legacy', title: 'Legacy', locale: 'it', version: 1, steps: [{ stepId: 'one', order: 0, title: 'One' }] };
    expect(CoachProgramSchema.safeParse(legacy).success).toBe(true);
    expect(CoachProgramSchema.safeParse({ ...legacy, programVersion: 1 }).success).toBe(false);
  });
});
