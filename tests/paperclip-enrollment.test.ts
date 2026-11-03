import { it, expect } from 'vitest';
import {
  PaperclipEnrollmentSchema as Enrollment, paperclipEnrollmentComplete as complete,
  internalPaperclipEnrollmentResolveContract as contract, INTERNAL_PAPERCLIP_ENROLLMENT_RESOLVE_PATH as PATH,
  PAPERCLIP_AGENT_KEY_NAME,
} from '../src/capability/paperclip/index.js';

const seatId = '11111111-1111-4111-8111-111111111111';
const directorId = '22222222-2222-4222-8222-222222222222';
const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const record = () => ({
  seat: { scope, unitId: 'unit-1', companyId: directorId, paperclipAgentId: seatId, enabled: true, roleAgents: {} },
  organizationId: 'org-1', role: 'capo-bu', reportsToPaperclipAgentId: directorId,
  participantBinding: 'applied', agentKey: { key: 'PAPERCLIP_API_KEY', store: 'vault', status: 'stored' },
  enrolledAt: '2026-10-22T12:00:00Z',
});

it('accepts a complete enrollment and names the Vault key', () => {
  const parsed = Enrollment.safeParse(record());
  expect(parsed.success).toBe(true);
  expect(PAPERCLIP_AGENT_KEY_NAME).toBe('PAPERCLIP_API_KEY');
  expect(PATH).toBe('/internal/paperclip/enrollments/resolve');
  if (parsed.success) expect(complete(parsed.data)).toBe(true);
});

it('rejects a capo-bu without reportsToPaperclipAgentId', () => {
  const { reportsToPaperclipAgentId: _drop, ...rest } = record();
  expect(Enrollment.safeParse(rest).success).toBe(false);
});

it('rejects a capo-bu reporting to itself', () => {
  expect(Enrollment.safeParse({ ...record(), reportsToPaperclipAgentId: seatId }).success).toBe(false);
});

it('rejects a key carrying a value', () => {
  const r = record();
  expect(Enrollment.safeParse({ ...r, agentKey: { ...r.agentKey, value: 'secret' } }).success).toBe(false);
});

it('is not complete with a pending binding or a pending key', () => {
  const r = record();
  const pendingBinding = Enrollment.parse({ ...r, participantBinding: 'pending' });
  const pendingKey = Enrollment.parse({ ...r, agentKey: { ...r.agentKey, status: 'pending' } });
  expect(complete(pendingBinding)).toBe(false);
  expect(complete(pendingKey)).toBe(false);
});

it('resolve contract: request union and discriminated response', () => {
  expect(contract.path).toBe(PATH);
  expect(contract.bodySchema.safeParse({ paperclipAgentId: seatId }).success).toBe(true);
  expect(contract.bodySchema.safeParse({ scope }).success).toBe(true);
  expect(contract.bodySchema.safeParse({ scope, paperclipAgentId: seatId }).success).toBe(false);
  expect(contract.responseSchema.safeParse({ outcome: 'found', enrollment: record() }).success).toBe(true);
  expect(contract.responseSchema.safeParse({ outcome: 'not_found' }).success).toBe(true);
  expect(contract.responseSchema.safeParse({ outcome: 'boh' }).success).toBe(false);
});
