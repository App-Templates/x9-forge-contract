import { describe, expect, it } from 'vitest';
import type { ZodType } from 'zod';
import * as agent from '../../src/agent/index.js';
import { ListAgentsAgentSchema, ListAgentsResponseSchema } from '../../src/http/endpoints/internal-agents-list.js';

function preserves(schema: ZodType, value: unknown): void { const result = schema.safeParse(value); expect(result.success).toBe(true); if (result.success) expect(result.data).toEqual(value); }

const attestation = { appliedVersion: 8, sha256: 'a'.repeat(64), loadedAt: '2026-10-07T13:00:00+02:00' };
const runtime = { kind: 'runtime', targetId: 'agent-synthetic' };
const failed = { target: runtime, outcome: 'error', reason: { code: 'load-failed' } };
const command = { ok: true, agentId: 'agent-synthetic', requestId: 'req-synthetic-139', action: 'apply-config', replayed: false, outcome: 'ok', results: [{ target: runtime, outcome: 'ok' }], requestedVersion: 8, versions: { desired: 8, applied: 8, failed: null }, completedAt: '2026-10-07T11:00:00Z' };
const state = { agentId: 'agent-synthetic', versions: { desired: 9, applied: 8, failed: null }, targets: [{ target: runtime, actions: ['start'] }] };
const list = { agentId: 'agent-synthetic', displayName: 'Synthetic', ownerId: 'owner-synthetic' };
const schemas = [['command', agent.AgentManagementCommandResultSchema, command], ['state', agent.AgentManagementStateSchema, state], ['list', ListAgentsAgentSchema, list]] as const;
const invalid = [
  ['zero', { ...attestation, appliedVersion: 0 }], ['negative', { ...attestation, appliedVersion: -1 }], ['fraction', { ...attestation, appliedVersion: 1.5 }], ['numeric string', { ...attestation, appliedVersion: '8' }], ['unsafe integer', { ...attestation, appliedVersion: Number.MAX_SAFE_INTEGER + 1 }], ['infinite', { ...attestation, appliedVersion: Infinity }], ['NaN', { ...attestation, appliedVersion: NaN }], ['boolean version', { ...attestation, appliedVersion: true }],
  ['short hash', { ...attestation, sha256: 'a'.repeat(63) }], ['long hash', { ...attestation, sha256: 'a'.repeat(65) }], ['nonhex hash', { ...attestation, sha256: 'g'.repeat(64) }], ['uppercase hash', { ...attestation, sha256: 'A'.repeat(64) }], ['numeric hash', { ...attestation, sha256: 8 }],
  ['date only', { ...attestation, loadedAt: '2026-10-07' }], ['no timezone', { ...attestation, loadedAt: '2026-10-07T13:00:00' }], ['invalid calendar', { ...attestation, loadedAt: '2026-02-30T13:00:00Z' }], ['invalid hour', { ...attestation, loadedAt: '2026-10-07T25:00:00Z' }], ['empty date', { ...attestation, loadedAt: '' }], ['numeric date', { ...attestation, loadedAt: 8 }],
  ['missing version', { sha256: attestation.sha256, loadedAt: attestation.loadedAt }], ['missing hash', { appliedVersion: 8, loadedAt: attestation.loadedAt }], ['missing date', { appliedVersion: 8, sha256: attestation.sha256 }], ['unknown field', { ...attestation, desiredVersion: 99 }], ['array', [attestation]], ['string', 'synthetic'], ['boolean', true],
] as const;
for (const [label, schema, base] of schemas) {
  describe(`workspace attestation ${label}`, () => {
    it('preserves a legacy payload exactly without inventing an attestation', () => preserves(schema, base));
    it('retains the complete attestation rather than stripping it', () => preserves(schema, { ...base, workspace: attestation }));
    it('accepts UTC as well as explicit timezone offsets', () => { const value = { ...base, workspace: { ...attestation, loadedAt: '2026-10-07T11:00:00Z' } }; preserves(schema, value); });
    it.each(invalid)('rejects %s instead of silently stripping workspace', (_name, workspace) => expect(schema.safeParse({ ...base, workspace }).success).toBe(false));
  });
}
function version(input: unknown): number | null {
  const helper = Reflect.get(agent, 'attestedWorkspaceVersionOf') as ((row: unknown) => number | null) | undefined;
  expect(typeof helper).toBe('function');
  try { return helper ? helper(input) : null; } catch { return NaN; }
}
describe('public attested workspace selector', () => {
  it('selects the validated wire attestation', () => expect(version({ workspace: attestation })).toBe(8));
  it.each([undefined, null, {}, { workspace: null }, { workspace: undefined }, { configVersion: 99 }, { versions: { desired: 99, applied: 77 } }, { appliedWorkspaceVersion: 66 }, { workspace: { version: 44 } }, { identity: { workspace: attestation } }, { agents: [{ workspace: attestation }] }])('returns null without a canonical root attestation at case %#', input => expect(version(input)).toBeNull());
  it.each(invalid)('never selects invalid metadata %s', (_name, workspace) => expect(version({ workspace })).toBeNull());
  it('reads each row freshly and ignores desired or config fallback values', () => { expect(version({ workspace: attestation, configVersion: 99, versions: { desired: 99, applied: 77 } })).toBe(8); expect(version({ workspace: { ...attestation, appliedVersion: 9 } })).toBe(9); expect(version({ workspace: null })).toBeNull(); });
  it('exports the shared schema from the public agent subpath', () => { const schema = Reflect.get(agent, 'AgentWorkspaceAttestationSchema'); expect(typeof schema?.safeParse).toBe('function'); expect(schema?.safeParse(attestation).success).toBe(true); });
});
describe('explicit absence and management evidence', () => {
  it('preserves state and list null without inventing an outcome', () => { preserves(agent.AgentManagementStateSchema, { ...state, workspace: null }); preserves(ListAgentsAgentSchema, { ...list, workspace: null }); });
  it('accepts an incomplete command with an explicit failed runtime and retains null', () => { const value = { ...command, workspace: null, outcome: 'error', results: [failed], versions: { desired: 8, applied: 7, failed: { version: 8, reason: { code: 'load-failed' } } } }; preserves(agent.AgentManagementCommandResultSchema, value); });
  it('rejects null hidden behind global success', () => expect(agent.AgentManagementCommandResultSchema.safeParse({ ...command, workspace: null }).success).toBe(false));
  it('rejects null when only a capability failed and the runtime was successful', () => { const value = { ...command, action: 'restart', requestedVersion: undefined, versions: undefined, workspace: null, outcome: 'partial', results: [{ target: runtime, outcome: 'ok' }, { ...failed, target: { kind: 'capability', targetId: 'cap-synthetic' } }] }; expect(agent.AgentManagementCommandResultSchema.safeParse(value).success).toBe(false); });
  it('accepts null with partial outcome when the runtime actually failed', () => { const value = { ...command, action: 'restart', requestedVersion: undefined, versions: undefined, workspace: null, outcome: 'partial', results: [failed, { target: { kind: 'capability', targetId: 'cap-synthetic' }, outcome: 'ok' }] }; const result = agent.AgentManagementCommandResultSchema.safeParse(value); expect(result.success).toBe(true); if (result.success) expect(result.data).toHaveProperty('workspace', null); });
  it('rejects null without a runtime result even when overall outcome is error', () => { const value = { ...command, action: 'restart', requestedVersion: undefined, versions: undefined, workspace: null, outcome: 'error', results: [{ ...failed, target: { kind: 'capability', targetId: 'cap-synthetic' } }] }; expect(agent.AgentManagementCommandResultSchema.safeParse(value).success).toBe(false); });
  it.each([7, 9])('rejects command attestation contradicting applied config %s', appliedVersion => expect(agent.AgentManagementCommandResultSchema.safeParse({ ...command, workspace: { ...attestation, appliedVersion } }).success).toBe(false));
  it.each([7, 9])('rejects state attestation contradicting applied config %s', appliedVersion => expect(agent.AgentManagementStateSchema.safeParse({ ...state, workspace: { ...attestation, appliedVersion } }).success).toBe(false));
  it('accepts a failed apply retaining the previous attested bundle rather than desired', () => { const value = { ...command, requestedVersion: 9, workspace: attestation, outcome: 'error', results: [failed], versions: { desired: 9, applied: 8, failed: { version: 9, reason: { code: 'load-failed' } } } }; preserves(agent.AgentManagementCommandResultSchema, value); });
  it('does not infer a comparison when state version tracking is unavailable', () => { const value = { ...state, versions: null, workspace: attestation }; preserves(agent.AgentManagementStateSchema, value); });
  it('does not infer a comparison when the applied configuration is explicitly unknown', () => { const value = { ...state, versions: { desired: 9, applied: null, failed: null }, workspace: attestation }; preserves(agent.AgentManagementStateSchema, value); });
  it('preserves attestation independently for each inventory row', () => { const value = { agents: [{ ...list, workspace: attestation }, { ...list, agentId: 'other-synthetic', workspace: { ...attestation, appliedVersion: 9 } }] }; preserves(ListAgentsResponseSchema, value); });
});
