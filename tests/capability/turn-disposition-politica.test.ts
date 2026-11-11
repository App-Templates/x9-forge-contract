import { expect, it } from 'vitest';
import { ZodError } from 'zod';
import {
  TurnEndSchema,
  paperclipBodyForDisposition,
  type TurnDisposition,
} from '../../src/capability/paperclip/turn-disposition.js';

const AGENT_ID = '11111111-1111-4111-8111-111111111111';
const NOW = new Date('2026-11-11T09:00:00.000Z');
const CHECK_LATER: TurnDisposition = {
  kind: 'check_later',
  runSucceeds: true,
  afterSeconds: 120,
  notes: 'Waiting for budget renewal.',
};
const MONITOR = { nextCheckAt: '2026-11-11T09:02:00.000Z', notes: CHECK_LATER.notes };

it('s6193 controllo-cancella-le-fasi: paperclipBodyForDisposition keeps the stages and mode of the current execution policy when it adds the monitor', () => {
  // Hand-copied Paperclip policy shape; simulated data, without an X9 dependency.
  const policy = {
    mode: 'normal',
    commentRequired: true,
    stages: [{
      id: '22222222-2222-4222-8222-222222222222',
      type: 'review',
      participants: [{ type: 'agent', agentId: AGENT_ID }],
    }],
    monitor: { nextCheckAt: '2026-11-11T09:01:00.000Z', notes: 'Previous check.' },
  };
  const original = structuredClone(policy);
  expect(paperclipBodyForDisposition(CHECK_LATER, {
    now: NOW, agentId: AGENT_ID, currentExecutionPolicy: policy,
  })).toEqual({ status: 'in_progress', executionPolicy: { ...policy, monitor: MONITOR } });
  expect(policy).toEqual(original);
});

it('s6193 without a current policy the body carries only the monitor', () => {
  const expected = { status: 'in_progress', executionPolicy: { monitor: MONITOR } };
  expect(paperclipBodyForDisposition(CHECK_LATER, { now: NOW, agentId: AGENT_ID })).toEqual(expected);
  for (const currentExecutionPolicy of [undefined, null, {}]) {
    expect(paperclipBodyForDisposition(CHECK_LATER, {
      now: NOW, agentId: AGENT_ID, currentExecutionPolicy,
    })).toEqual(expected);
  }
  const ctx = { now: NOW, agentId: AGENT_ID, currentExecutionPolicy: { mode: 'normal' } };
  expect(paperclipBodyForDisposition({ kind: 'leave', runSucceeds: true }, ctx)).toBeNull();
  expect(paperclipBodyForDisposition({ kind: 'fail_run', runSucceeds: false }, ctx)).toBeNull();
  expect(paperclipBodyForDisposition({ kind: 'close_not_executed', runSucceeds: true, comment: 'Paused.' }, ctx))
    .toEqual({ status: 'done', comment: 'Paused.' });
  expect(paperclipBodyForDisposition({ kind: 'block_for_owner', runSucceeds: true, action: 'Review.' }, ctx))
    .toEqual({ status: 'blocked', unblockDescriptor: { owner: { agentId: AGENT_ID }, action: 'Review.' } });
});

it('s6193 a new monitor replaces the old one of the current policy', () => {
  const oldMonitor = {
    nextCheckAt: '2026-11-11T09:01:00.000Z', notes: 'Old check.', serviceName: 'old-service',
  };
  const policy = { monitor: oldMonitor };
  expect(paperclipBodyForDisposition(CHECK_LATER, {
    now: NOW, agentId: AGENT_ID, currentExecutionPolicy: policy,
  })).toEqual({ status: 'in_progress', executionPolicy: { monitor: MONITOR } });
  expect(policy.monitor).toEqual(oldMonitor);
});

it('s6193 a refused turn end accepts a message and still rejects unknown keys', () => {
  const refused = { kind: 'refused', code: 'budget_exhausted' };
  expect(TurnEndSchema.parse(refused)).toEqual(refused);
  for (const message of ['Budget exhausted.', 'x', 'x'.repeat(2000)]) {
    expect(TurnEndSchema.parse({ ...refused, message })).toEqual({ ...refused, message });
  }
  for (const message of ['', 'x'.repeat(2001), 42, null]) {
    expect(TurnEndSchema.safeParse({ ...refused, message }).success).toBe(false);
  }
  expect(TurnEndSchema.safeParse({ ...refused, message: 'Budget exhausted.', extra: true }).success).toBe(false);
});

it('s6193 an agentId that is not a guid makes paperclipBodyForDisposition throw for block_for_owner', () => {
  const disposition: TurnDisposition = { kind: 'block_for_owner', runSucceeds: true, action: 'Review identity.' };
  expect(paperclipBodyForDisposition(disposition, { now: NOW, agentId: AGENT_ID })).toEqual({
    status: 'blocked', unblockDescriptor: { owner: { agentId: AGENT_ID }, action: disposition.action },
  });
  expect(() => paperclipBodyForDisposition(disposition, { now: NOW, agentId: 'not-a-guid' })).toThrow(ZodError);
});
