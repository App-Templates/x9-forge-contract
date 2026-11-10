import { expect, it } from 'vitest';
import {
  PaperclipAggiornaCorpoSchema,
  PaperclipControlloSchema,
  PaperclipDescrittoreSbloccoSchema,
  PaperclipDisposizioneCorpoSchema,
  type PaperclipControllo,
  type PaperclipDescrittoreSblocco,
  type PaperclipDisposizioneCorpo,
} from '../../src/capability/paperclip-protocollo/wire-scritture.js';

const ISSUE_ID = '11111111-1111-4111-8111-111111111111';
const monitor: PaperclipControllo = {
  nextCheckAt: '2026-11-11T09:00:00.000Z',
  notes: 'Check whether the dependency is ready',
  serviceName: 'cap-paperclip',
};
const descriptor: PaperclipDescrittoreSblocco = { owner: 'board', action: 'Approve the plan' };

it('s6181 in-corso-senza-destinazione: PaperclipDisposizioneCorpoSchema refuses in_progress without a monitor and refuses a monitor on blocked', () => {
  const missing = PaperclipDisposizioneCorpoSchema.safeParse({ status: 'in_progress' });
  expect(missing.success).toBe(false);
  if (!missing.success) {
    expect(missing.error.issues).toContainEqual(expect.objectContaining({
      path: ['status'],
      message: 'in_progress is a disposition only with a scheduled check',
    }));
  }
  for (const status of ['blocked', 'done']) {
    expect(PaperclipDisposizioneCorpoSchema.safeParse({
      status,
      ...(status === 'blocked' ? { blockedByIssueIds: [ISSUE_ID] } : {}),
      executionPolicy: { monitor },
    }).success).toBe(false);
  }
  expect(PaperclipDisposizioneCorpoSchema.safeParse({ status: 'in_progress', executionPolicy: {} }).success).toBe(false);
  expect(PaperclipDisposizioneCorpoSchema.safeParse({
    status: 'in_progress', executionPolicy: { monitor, extra: true },
  }).success).toBe(false);
});

it('s6181 blocked needs blockers or an unblock descriptor, and both are refused outside blocked', () => {
  const missing = PaperclipDisposizioneCorpoSchema.safeParse({ status: 'blocked' });
  expect(missing.success).toBe(false);
  if (!missing.success) {
    expect(missing.error.issues).toContainEqual(expect.objectContaining({ path: ['status'] }));
  }
  expect(PaperclipDisposizioneCorpoSchema.safeParse({ status: 'blocked', blockedByIssueIds: [] }).success).toBe(false);
  expect(PaperclipDisposizioneCorpoSchema.safeParse({ status: 'blocked', blockedByIssueIds: ['invalid'] }).success).toBe(false);
  expect(PaperclipDisposizioneCorpoSchema.safeParse({ status: 'blocked', unblockDescriptor: descriptor }).success).toBe(true);
  expect(PaperclipDisposizioneCorpoSchema.safeParse({
    status: 'blocked', blockedByIssueIds: [ISSUE_ID], unblockDescriptor: descriptor,
  }).success).toBe(true);
  for (const status of ['done', 'in_review', 'in_progress']) {
    const base = { status, ...(status === 'in_progress' ? { executionPolicy: { monitor } } : {}) };
    expect(PaperclipDisposizioneCorpoSchema.safeParse({ ...base, blockedByIssueIds: [ISSUE_ID] }).success).toBe(false);
    expect(PaperclipDisposizioneCorpoSchema.safeParse({ ...base, unblockDescriptor: descriptor }).success).toBe(false);
  }
});

it('s6181 the four valid dispositions parse: done with comment, in_review, blocked on issues, in_progress with a monitor', () => {
  // Representative wire bodies from the task; the native-client production samples
  // are not available in this repository for an exact comparison.
  const bodies: PaperclipDisposizioneCorpo[] = [
    { status: 'done', comment: 'Delivered the result' },
    { status: 'in_review' },
    { status: 'blocked', blockedByIssueIds: [ISSUE_ID], comment: 'Waiting for the dependency' },
    { status: 'in_progress', executionPolicy: { monitor } },
  ];
  for (const body of bodies) expect(PaperclipDisposizioneCorpoSchema.parse(body)).toEqual(body);
  expect(PaperclipDisposizioneCorpoSchema.parse({ status: 'in_review', executionPolicy: { monitor } }))
    .toEqual({ status: 'in_review', executionPolicy: { monitor } });
  expect(PaperclipDisposizioneCorpoSchema.safeParse({ status: 'todo' }).success).toBe(false);
  expect(PaperclipDisposizioneCorpoSchema.safeParse({ status: 'done', extra: true }).success).toBe(false);
  expect(PaperclipDisposizioneCorpoSchema.safeParse({ status: 'done', comment: '  ' }).success).toBe(false);
});

it('s6181 the unblock descriptor is strict: an extra key or an empty action is refused', () => {
  for (const owner of ['board', { agentId: ISSUE_ID }, { userId: 'reviewer' }]) {
    expect(PaperclipDescrittoreSbloccoSchema.parse({ owner, action: '  Approve  ' }))
      .toEqual({ owner, action: 'Approve' });
  }
  for (const invalid of [
    { ...descriptor, extra: true },
    { ...descriptor, action: '' },
    { ...descriptor, action: '   ' },
    { ...descriptor, action: 'x'.repeat(2001) },
    { ...descriptor, owner: { agentId: ISSUE_ID, extra: true } },
    { ...descriptor, owner: { userId: 'reviewer', extra: true } },
    { ...descriptor, owner: { agentId: ISSUE_ID, userId: 'reviewer' } },
    { ...descriptor, owner: { userId: '' } },
    { ...descriptor, owner: { agentId: 'invalid' } },
    { ...descriptor, owner: 'someone' },
  ]) expect(PaperclipDescrittoreSbloccoSchema.safeParse(invalid).success).toBe(false);
  expect(PaperclipDescrittoreSbloccoSchema.safeParse({ ...descriptor, action: 'x'.repeat(2000) }).success).toBe(true);
});

it('s6181 nextCheckAt with an offset is refused, with Z is accepted', () => {
  for (const nextCheckAt of ['2026-11-11T09:00:00+01:00', '2026-11-11T09:00:00+00:00', '2026-11-11T09:00:00']) {
    expect(PaperclipControlloSchema.safeParse({ ...monitor, nextCheckAt }).success).toBe(false);
  }
  expect(PaperclipControlloSchema.parse(monitor)).toEqual(monitor);
  for (const nextCheckAt of ['2000-01-01T00:00:00Z', '2100-01-01T00:00:00Z']) {
    expect(PaperclipControlloSchema.safeParse({ ...monitor, nextCheckAt }).success).toBe(true);
  }
  expect(PaperclipControlloSchema.parse({ nextCheckAt: monitor.nextCheckAt, notes: '  Check  ' }))
    .toEqual({ nextCheckAt: monitor.nextCheckAt, notes: 'Check' });
  expect(PaperclipControlloSchema.parse({ ...monitor, serviceName: '  service  ' }).serviceName).toBe('service');
  for (const invalid of [
    { ...monitor, extra: true },
    { ...monitor, notes: ' ' },
    { ...monitor, notes: 'x'.repeat(501) },
    { ...monitor, serviceName: ' ' },
    { ...monitor, serviceName: 'x'.repeat(121) },
  ]) expect(PaperclipControlloSchema.safeParse(invalid).success).toBe(false);
  expect(PaperclipControlloSchema.safeParse({ ...monitor, notes: 'x'.repeat(500), serviceName: 'x'.repeat(120) }).success).toBe(true);
});

it('s6181 PaperclipAggiornaCorpoSchema still parses the bodies it parsed before', () => {
  for (const status of ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'blocked', 'cancelled']) {
    expect(PaperclipAggiornaCorpoSchema.parse({ status })).toEqual({ status });
    expect(PaperclipAggiornaCorpoSchema.parse({ status, comment: '  Updated  ' })).toEqual({ status, comment: 'Updated' });
  }
  expect(PaperclipAggiornaCorpoSchema.parse({ comment: '  Updated  ' })).toEqual({ comment: 'Updated' });
  expect(PaperclipAggiornaCorpoSchema.safeParse({}).success).toBe(false);
  expect(PaperclipAggiornaCorpoSchema.safeParse({ status: 'blocked', blockedByIssueIds: [ISSUE_ID] }).success).toBe(false);
});
