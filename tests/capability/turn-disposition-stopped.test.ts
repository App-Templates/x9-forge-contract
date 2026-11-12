import { expect, it } from 'vitest';
import { PaperclipControlloSchema, PaperclipDisposizioneCorpoSchema } from '../../src/capability/paperclip-protocollo/wire-scritture.js';
import {
  LIMIT_WAIT_SERVICE_NAME,
  TURN_STOP_CODES,
  TurnStopCodeSchema,
  TurnDispositionSchema,
  TurnEndSchema,
  dispositionForTurnEnd,
  paperclipBodyForDisposition,
  waitsOnLimit,
} from '../../src/capability/paperclip/turn-disposition.js';

it('s6518 attesa-del-tetto-con-nome: budget refusals and stops name their Paperclip monitor with and without a retry', () => {
  for (const kind of ['refused', 'stopped'] as const) {
    for (const retryAfterSeconds of [undefined, 900] as const) {
      const disposition = dispositionForTurnEnd(TurnEndSchema.parse({
        kind, code: 'budget_exhausted', ...(retryAfterSeconds === undefined ? {} : { retryAfterSeconds }),
      }));
      expect(disposition).toMatchObject({
        kind: 'check_later', runSucceeds: true, afterSeconds: retryAfterSeconds ?? 3600,
        serviceName: 'X9 company spend cap',
      });
      expect(LIMIT_WAIT_SERVICE_NAME).toBe('X9 company spend cap');
      expect(TurnDispositionSchema.parse(disposition)).toEqual(disposition);
      const body = paperclipBodyForDisposition(disposition, {
        now: new Date('2026-11-12T09:00:00.000Z'),
        agentId: '11111111-1111-4111-8111-111111111111',
      });
      expect(body?.executionPolicy?.monitor).toEqual({
        nextCheckAt: retryAfterSeconds === undefined ? '2026-11-12T10:00:00.000Z' : '2026-11-12T09:15:00.000Z',
        notes: kind === 'refused'
          ? 'Non adesso: budget_exhausted. Ricontrollo automatico.'
          : 'Fermato a metà turno: budget_exhausted. Il lavoro già fatto resta. Ricontrollo automatico.',
        serviceName: LIMIT_WAIT_SERVICE_NAME,
      });
      expect(waitsOnLimit(body?.executionPolicy)).toBe(true);
    }
  }
});

it('s6518 other admission waits and expired runs carry no service name', () => {
  for (const end of [
    { kind: 'refused', code: 'organization_binding_unavailable' },
    { kind: 'refused', code: 'organization_admission_unavailable' },
    { kind: 'stopped', code: 'run_expired' },
  ] as const) {
    const disposition = dispositionForTurnEnd(end);
    expect(disposition.kind).toBe('check_later');
    expect(disposition).not.toHaveProperty('serviceName');
    const body = paperclipBodyForDisposition(disposition, {
      now: new Date('2026-11-12T09:00:00.000Z'),
      agentId: '11111111-1111-4111-8111-111111111111',
    });
    expect(body?.executionPolicy?.monitor).toBeDefined();
    expect(body?.executionPolicy?.monitor).not.toHaveProperty('serviceName');
    expect(waitsOnLimit(body?.executionPolicy)).toBe(false);
  }
});

it('s6518 waitsOnLimit reads only the fixed name in a production-shaped policy', () => {
  const monitor = {
    kind: 'issue_monitor', nextCheckAt: '2026-11-12T10:00:00.000Z', notes: 'Stored monitor.',
    timeoutAt: null, externalRef: null, maxAttempts: null, scheduledBy: null,
    serviceName: 'X9 company spend cap', recoveryPolicy: null,
  };
  const policy = { mode: 'normal', monitor };
  const original = structuredClone(policy);
  expect(waitsOnLimit(policy)).toBe(true);
  expect(policy).toEqual(original);
  for (const value of [
    null, undefined, false, 42, 'X9 company spend cap', [], {},
    { monitor: null }, { monitor: 'X9 company spend cap' }, { monitor: {} },
    { serviceName: 'X9 company spend cap' },
    { monitor: { ...monitor, serviceName: null } },
    { monitor: { ...monitor, serviceName: 'AI provider quota' } },
    { monitor: { ...monitor, serviceName: ' X9 company spend cap ' } },
    { monitor: { notes: 'X9 company spend cap' } },
  ]) {
    expect(waitsOnLimit(value)).toBe(false);
  }
});

it('s6518 check_later reuses the optional Paperclip service name rule', () => {
  const disposition = { kind: 'check_later', runSucceeds: true, afterSeconds: 3600, notes: 'Check later.' };
  for (const serviceName of [undefined, 'X9 company spend cap', 'AI provider quota', 'x'.repeat(120), '', ' ', 'x'.repeat(121), null, 42]) {
    const expected = PaperclipControlloSchema.shape.serviceName.safeParse(serviceName);
    const actual = TurnDispositionSchema.safeParse({ ...disposition, serviceName });
    expect(actual.success).toBe(expected.success);
    if (actual.success && actual.data.kind === 'check_later' && expected.success) {
      expect(actual.data.serviceName).toBe(expected.data);
    }
  }
});

it('s6518 saved budget wait bodies and dispositions without a service name remain unchanged', () => {
  const body = {
    status: 'in_progress',
    executionPolicy: {
      monitor: {
        nextCheckAt: '2026-11-12T10:00:00.000Z',
        notes: 'Non adesso: budget_exhausted. Ricontrollo automatico.',
      },
    },
  };
  expect(PaperclipDisposizioneCorpoSchema.parse(body)).toEqual(body);
  const disposition = {
    kind: 'check_later', runSucceeds: true, afterSeconds: 3600,
    notes: body.executionPolicy.monitor.notes,
  } as const;
  expect(TurnDispositionSchema.parse(disposition)).toEqual(disposition);
  expect(paperclipBodyForDisposition(disposition, {
    now: new Date('2026-11-12T09:00:00.000Z'), agentId: '11111111-1111-4111-8111-111111111111',
  })).toEqual(body);
  expect(waitsOnLimit(body.executionPolicy)).toBe(false);
});

it('s6350 fine-per-limite: a turn stopped by a limit while working schedules a check with a succeeding run and a fixed note', () => {
  expect(TURN_STOP_CODES).toEqual(['budget_exhausted', 'run_expired']);
  for (const code of TURN_STOP_CODES) {
    expect(TurnStopCodeSchema.parse(code)).toBe(code);
    const end = { kind: 'stopped', code } as const;
    expect(TurnEndSchema.parse(end)).toEqual(end);
    for (const [retryAfterSeconds, afterSeconds] of [[undefined, 3600], [30, 60], [900, 900], [604800, 604800]] as const) {
      const parsed = TurnEndSchema.parse(retryAfterSeconds === undefined ? end : { ...end, retryAfterSeconds });
      const disposition = dispositionForTurnEnd(parsed);
      expect(disposition).toEqual({
        kind: 'check_later',
        runSucceeds: true,
        afterSeconds,
        notes: `Fermato a metà turno: ${code}. Il lavoro già fatto resta. Ricontrollo automatico.`,
        ...(code === 'budget_exhausted' ? { serviceName: LIMIT_WAIT_SERVICE_NAME } : {}),
      });
      expect(TurnDispositionSchema.parse(disposition)).toEqual(disposition);
    }
  }
});

it('s6350 a stopped turn writes the next check and preserves the existing execution policy', () => {
  const agentId = '11111111-1111-4111-8111-111111111111';
  const policy = {
    mode: 'normal',
    commentRequired: true,
    stages: [{
      id: '22222222-2222-4222-8222-222222222222',
      type: 'review',
      participants: [{ type: 'agent', agentId }],
    }],
    monitor: { nextCheckAt: '2026-11-12T09:01:00.000Z', notes: 'Previous check.' },
  };
  const original = structuredClone(policy);
  const disposition = dispositionForTurnEnd(TurnEndSchema.parse({ kind: 'stopped', code: 'budget_exhausted' }));
  const body = paperclipBodyForDisposition(disposition, {
    now: new Date('2026-11-12T09:00:00.000Z'),
    agentId,
    currentExecutionPolicy: policy,
  });
  expect(body).toEqual({
    status: 'in_progress',
    executionPolicy: {
      ...policy,
      monitor: {
        nextCheckAt: '2026-11-12T10:00:00.000Z',
        notes: 'Fermato a metà turno: budget_exhausted. Il lavoro già fatto resta. Ricontrollo automatico.',
        serviceName: LIMIT_WAIT_SERVICE_NAME,
      },
    },
  });
  expect(PaperclipDisposizioneCorpoSchema.parse(body)).toEqual(body);
  expect(policy).toEqual(original);
});

it('s6350 failed limit turns, uncertain and unavailable still fail the run', () => {
  for (const end of [
    { kind: 'failed', failureCode: 'budget_exhausted' },
    { kind: 'failed', failureCode: 'run_expired' },
    { kind: 'uncertain' },
    { kind: 'unavailable' },
  ]) {
    expect(dispositionForTurnEnd(TurnEndSchema.parse(end))).toEqual({ kind: 'fail_run', runSucceeds: false });
  }
});

it('s6350 stopped ends reject missing or invented codes, unknown keys and invalid retry seconds', () => {
  for (const end of [
    { kind: 'stopped' },
    { kind: 'stopped', code: 'invented' },
    { kind: 'stopped', code: 'budget_exhausted', extra: true },
    ...[0, -1, 1.5, 604801, '30', null].map((retryAfterSeconds) => ({
      kind: 'stopped', code: 'budget_exhausted', retryAfterSeconds,
    })),
  ]) {
    expect(TurnEndSchema.safeParse(end).success).toBe(false);
  }
});
