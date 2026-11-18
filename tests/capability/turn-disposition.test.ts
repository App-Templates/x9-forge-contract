import { expect, it } from 'vitest';
import {
  ORGANIZATION_ADMISSION_REFUSAL_CODES,
  InternalAgentTurnRunErrorResponseSchema,
  type OrganizationAdmissionRefusalCode,
} from '../../src/http/endpoints/internal-agent-turn.js';
import { PaperclipDisposizioneCorpoSchema } from '../../src/capability/paperclip-protocollo/wire-scritture.js';
import { LimitNoticeSchema, renderLimitNotice } from '../../src/capability/paperclip/limit-notice.js';
import {
  ADMISSION_REFUSAL_CLASS,
  INTERRUPTED_RETRY_SECONDS,
  LIMIT_WAIT_SERVICE_NAME,
  NOT_NOW_DEFAULT_RETRY_SECONDS,
  TurnDispositionSchema,
  TurnEndSchema,
  TURN_DISPOSITION_TEXT,
  TURN_UNAVAILABLE_CAUSES,
  turnFailRun,
  dispositionForTurnEnd,
  paperclipBodyForDisposition,
  waitsOnLimit,
  type TurnEnd,
} from '../../src/capability/paperclip/turn-disposition.js';

const AGENT_ID = '11111111-1111-4111-8111-111111111111';
const NOW = new Date('2026-11-11T09:00:00.000Z');
const refused = (code: OrganizationAdmissionRefusalCode, retryAfterSeconds?: number): TurnEnd =>
  retryAfterSeconds === undefined ? { kind: 'refused', code } : { kind: 'refused', code, retryAfterSeconds };

const INTERRUPTED_NOTE = 'Turno interrotto: il servizio non ha risposto. Prima di rifare qualcosa guarda cosa è già stato fatto su questo incarico (commenti, file, incarichi aperti) e non ripeterlo. Ricontrollo automatico tra 30 minuti.';

it('s7204 (a) unavailable schedules a successful check without a limit service', () => {
  expect(INTERRUPTED_RETRY_SECONDS).toBe(1800);
  expect(TURN_DISPOSITION_TEXT.interruptedNote(INTERRUPTED_RETRY_SECONDS)).toBe(INTERRUPTED_NOTE);
  expect(TURN_DISPOSITION_TEXT.interruptedNote(125)).toBe(INTERRUPTED_NOTE.replace('30 minuti.', '2 minuti.'));
  const disposition = dispositionForTurnEnd({ kind: 'unavailable' });
  expect(disposition).toEqual({
    kind: 'check_later', runSucceeds: true, afterSeconds: 1800, notes: INTERRUPTED_NOTE,
  });
  expect(TurnDispositionSchema.safeParse(disposition).success).toBe(true);
  expect(disposition).not.toHaveProperty('serviceName');
  expect(disposition.kind === 'check_later' && disposition.notes.startsWith('Turno interrotto:')).toBe(true);
});

it('s7204 (b) only uncertain and failed fail, covering every schema kind', () => {
  const examples: Record<string, TurnEnd> = {
    succeeded: { kind: 'succeeded' },
    refused: refused('budget_exhausted'),
    failed: { kind: 'failed', failureCode: 'tool_error' },
    uncertain: { kind: 'uncertain' },
    unavailable: { kind: 'unavailable' },
    cancelled: { kind: 'cancelled' },
    stopped: { kind: 'stopped', code: 'budget_exhausted' },
  };
  const kinds = TurnEndSchema.options.map((option) => option.shape.kind.value);
  expect(kinds.slice().sort()).toEqual(Object.keys(examples).sort());
  for (const kind of kinds) {
    const disposition = dispositionForTurnEnd(TurnEndSchema.parse(examples[kind]));
    if (kind === 'uncertain' || kind === 'failed') {
      expect(disposition, kind).toEqual(kind === 'failed'
        ? { kind: 'fail_run', runSucceeds: false, cause: 'turn_failed', detail: 'Turno fallito: tool_error.' }
        : { kind: 'fail_run', runSucceeds: false, cause: 'outcome_uncertain', detail: TURN_DISPOSITION_TEXT.uncertainNote() });
    } else {
      expect(disposition.runSucceeds, kind).toBe(true);
    }
  }
});

it('s7204 (c) unavailable writes an in-progress task and a UTC check in thirty minutes', () => {
  const body = paperclipBodyForDisposition(dispositionForTurnEnd({ kind: 'unavailable' }), {
    now: NOW, agentId: AGENT_ID,
  });
  expect(body).toEqual({
    status: 'in_progress',
    executionPolicy: { monitor: { nextCheckAt: '2026-11-11T09:30:00.000Z', notes: INTERRUPTED_NOTE } },
  });
  expect(PaperclipDisposizioneCorpoSchema.safeParse(body).success).toBe(true);
  expect(body?.executionPolicy?.monitor.nextCheckAt).toMatch(/Z$/);
  expect(body?.executionPolicy?.monitor.notes).toBe(INTERRUPTED_NOTE);
});

it('s7204 (d) a production-shaped policy keeps extra fields and replaces its limit monitor without mutation', () => {
  const policy = {
    mode: 'normal',
    commentRequired: true,
    stages: [{
      id: '22222222-2222-4222-8222-222222222222',
      type: 'review',
      participants: [{ type: 'agent', agentId: AGENT_ID }],
    }],
    additionalPolicyField: { enabled: true },
    monitor: {
      nextCheckAt: '2026-11-11T10:00:00.000Z',
      notes: 'Previous spend-cap check.',
      serviceName: LIMIT_WAIT_SERVICE_NAME,
    },
  };
  const original = structuredClone(policy);
  expect(waitsOnLimit(policy)).toBe(true);
  const body = paperclipBodyForDisposition(dispositionForTurnEnd({ kind: 'unavailable' }), {
    now: NOW, agentId: AGENT_ID, currentExecutionPolicy: policy,
  });
  expect(body).toEqual({
    status: 'in_progress',
    executionPolicy: {
      ...policy,
      monitor: { nextCheckAt: '2026-11-11T09:30:00.000Z', notes: INTERRUPTED_NOTE },
    },
  });
  expect(body?.executionPolicy?.monitor).not.toHaveProperty('serviceName');
  expect(waitsOnLimit(body?.executionPolicy)).toBe(false);
  expect(PaperclipDisposizioneCorpoSchema.safeParse(body).success).toBe(true);
  expect(policy).toEqual(original);
});

it('s6182 non-adesso-come-guasto: dispositionForTurnEnd never fails the run for an admission refusal, and budget_exhausted becomes a check_later', () => {
  for (const code of ORGANIZATION_ADMISSION_REFUSAL_CODES) {
    expect(dispositionForTurnEnd(refused(code)).runSucceeds).toBe(true);
  }
  expect(dispositionForTurnEnd(refused('budget_exhausted')).kind).toBe('check_later');
  expect(dispositionForTurnEnd(refused('organization_binding_unavailable')).kind).toBe('check_later');
  expect(dispositionForTurnEnd(refused('organization_admission_unavailable')).kind).toBe('check_later');
});

it('s6182 every admission refusal code has a class', () => {
  for (const code of ORGANIZATION_ADMISSION_REFUSAL_CODES) {
    expect(['definitive', 'not_now']).toContain(ADMISSION_REFUSAL_CLASS[code]);
  }
  expect(Object.keys(ADMISSION_REFUSAL_CLASS).sort()).toEqual([...ORGANIZATION_ADMISSION_REFUSAL_CODES].sort());
  const notNow = ORGANIZATION_ADMISSION_REFUSAL_CODES.filter((c) => ADMISSION_REFUSAL_CLASS[c] === 'not_now');
  expect(notNow.sort()).toEqual(
    ['budget_exhausted', 'organization_admission_unavailable', 'organization_binding_unavailable', 'rd_paused'].sort(),
  );
});

it('s6182 retryAfterSeconds drives the check, the default is one hour, the floor is 60 seconds', () => {
  expect(NOT_NOW_DEFAULT_RETRY_SECONDS).toBe(3600);
  expect(dispositionForTurnEnd(refused('budget_exhausted'))).toMatchObject({ afterSeconds: 3600 });
  expect(dispositionForTurnEnd(refused('budget_exhausted', 7200))).toMatchObject({ afterSeconds: 7200 });
  expect(dispositionForTurnEnd(refused('budget_exhausted', 5))).toMatchObject({ afterSeconds: 60 });
  expect(dispositionForTurnEnd(refused('budget_exhausted', 604800))).toMatchObject({ afterSeconds: 604800 });
  expect(dispositionForTurnEnd(refused('budget_exhausted'))).toMatchObject({
    notes: 'Non adesso: budget_exhausted. Ricontrollo automatico.',
  });
});

it('s6182 rd_paused closes the task as not executed, never cancelled', () => {
  const d = dispositionForTurnEnd(refused('rd_paused'));
  expect(d).toEqual({ kind: 'close_not_executed', runSucceeds: true, comment: 'Non eseguito: R&D in pausa.' });
  expect(paperclipBodyForDisposition(d, { now: NOW, agentId: AGENT_ID })).toEqual({
    status: 'done',
    comment: 'Non eseguito: R&D in pausa.',
  });
});

it('s6182 a definitive refusal blocks for the owner and the run still succeeds', () => {
  const d = dispositionForTurnEnd(refused('organization_binding_missing'));
  expect(d).toMatchObject({ kind: 'block_for_owner', runSucceeds: true });
  expect(paperclipBodyForDisposition(d, { now: NOW, agentId: AGENT_ID })).toEqual({
    status: 'blocked',
    unblockDescriptor: {
      owner: { agentId: AGENT_ID },
      action:
        "Turno rifiutato: organization_binding_missing. Correggere il legame o l'identità dell'agente, poi commentare qui per riaprire.",
    },
  });
});

it('s6182 failed and uncertain are the only ends that fail the run', () => {
  const ends: TurnEnd[] = [
    { kind: 'succeeded' },
    { kind: 'cancelled' },
    { kind: 'failed', failureCode: 'tool_error' },
    { kind: 'uncertain' },
    { kind: 'unavailable' },
    ...ORGANIZATION_ADMISSION_REFUSAL_CODES.map((code) => refused(code)),
  ];
  const failing = ends.filter((e) => !dispositionForTurnEnd(e).runSucceeds).map((e) => e.kind);
  expect(failing).toEqual(['failed', 'uncertain']);
  expect(dispositionForTurnEnd({ kind: 'succeeded' }).kind).toBe('leave');
  expect(dispositionForTurnEnd({ kind: 'cancelled' }).kind).toBe('leave');
  expect(paperclipBodyForDisposition(dispositionForTurnEnd({ kind: 'uncertain' }), { now: NOW, agentId: AGENT_ID })).toBeNull();
  expect(paperclipBodyForDisposition(dispositionForTurnEnd({ kind: 'unavailable' }), { now: NOW, agentId: AGENT_ID })).not.toBeNull();
  expect(paperclipBodyForDisposition(dispositionForTurnEnd({ kind: 'succeeded' }), { now: NOW, agentId: AGENT_ID })).toBeNull();
  expect(TurnEndSchema.safeParse({ kind: 'refused', code: 'nope' }).success).toBe(false);
  expect(TurnEndSchema.safeParse({ kind: 'refused', code: 'rd_paused', retryAfterSeconds: 0 }).success).toBe(false);
  expect(TurnDispositionSchema.safeParse({ kind: 'fail_run', runSucceeds: true }).success).toBe(false);
});

it('s6182 every body built by paperclipBodyForDisposition parses with PaperclipDisposizioneCorpoSchema, and nextCheckAt is UTC with Z', () => {
  const ends: TurnEnd[] = [
    { kind: 'succeeded' },
    { kind: 'failed', failureCode: 'x' },
    ...ORGANIZATION_ADMISSION_REFUSAL_CODES.flatMap((code) => [refused(code), refused(code, 90)]),
  ];
  let withBody = 0;
  for (const end of ends) {
    const d = dispositionForTurnEnd(end);
    expect(TurnDispositionSchema.safeParse(d).success).toBe(true);
    const body = paperclipBodyForDisposition(d, { now: NOW, agentId: AGENT_ID });
    if (body === null) continue;
    withBody++;
    expect(PaperclipDisposizioneCorpoSchema.safeParse(body).success).toBe(true);
    if (body.executionPolicy) expect(body.executionPolicy.monitor.nextCheckAt).toMatch(/Z$/);
  }
  expect(withBody).toBeGreaterThan(0);
  const body = paperclipBodyForDisposition(dispositionForTurnEnd(refused('budget_exhausted', 120)), {
    now: NOW,
    agentId: AGENT_ID,
  });
  expect(body?.executionPolicy?.monitor.nextCheckAt).toBe('2026-11-11T09:02:00.000Z');
});

it('s6182 dry run on production bodies: today budget_exhausted body is a check_later, binding_missing blocks', () => {
  const real = InternalAgentTurnRunErrorResponseSchema.parse({
    ok: false,
    error: 'run_failed',
    code: 'budget_exhausted',
    outcome: {
      runId: 'run-6171',
      attemptId: 'attempt-6171',
      status: 'failed',
      failureCode: 'budget_exhausted',
      evidence: [],
      consumption: [],
      recordedAt: '2026-11-10T10:00:00.000Z',
    },
  });
  const parsed = OrgCode(real.code);
  expect(dispositionForTurnEnd({ kind: 'refused', code: parsed }).kind).toBe('check_later');
  expect(dispositionForTurnEnd({ kind: 'refused', code: OrgCode('organization_binding_missing') }).kind).toBe(
    'block_for_owner',
  );
});

function OrgCode(code: string | undefined): OrganizationAdmissionRefusalCode {
  const found = ORGANIZATION_ADMISSION_REFUSAL_CODES.find((c) => c === code);
  if (found === undefined) throw new Error(`not an admission refusal code: ${String(code)}`);
  return found;
}

const capSentence = renderLimitNotice(
  LimitNoticeSchema.parse({
    limit: 'company_spend',
    limitValue: 108_000_000,
    observedValue: 108_450_000,
    threshold: 'reached',
    event: 'turn_refused',
    organizationId: 'good-choice',
    observedAt: '2026-11-11T19:40:00.000Z',
    recipients: ['owner'],
    spend: { scopeName: 'Good Choice', windowStart: '2026-11-10T13:00:00.000Z', usdPerEur: 1.08 },
  }),
);
const withMessage = (code: OrganizationAdmissionRefusalCode, message: string, retryAfterSeconds?: number): TurnEnd =>
  retryAfterSeconds === undefined
    ? { kind: 'refused', code, message }
    : { kind: 'refused', code, message, retryAfterSeconds };

it('s6543 nota-con-la-frase-del-tetto: a spend-cap refusal with its sentence leaves it on the note with the minutes to the next check', () => {
  const d = dispositionForTurnEnd(withMessage('budget_exhausted', capSentence));
  expect(TurnDispositionSchema.safeParse(d).success).toBe(true);
  expect(d).toMatchObject({
    kind: 'check_later',
    afterSeconds: 3600,
    serviceName: LIMIT_WAIT_SERVICE_NAME,
    notes: `Non adesso: budget_exhausted. ${capSentence} Ricontrollo automatico tra 60 minuti.`,
  });
  expect(PaperclipDisposizioneCorpoSchema.safeParse(paperclipBodyForDisposition(d, { now: NOW, agentId: AGENT_ID })).success).toBe(true);
});

it('s6543 the minutes follow retryAfterSeconds', () => {
  const d = dispositionForTurnEnd(withMessage('budget_exhausted', capSentence, 7200));
  expect(d).toMatchObject({ afterSeconds: 7200 });
  expect(d.kind === 'check_later' && d.notes.endsWith('Ricontrollo automatico tra 120 minuti.')).toBe(true);
});

it('s6543 without a sentence the note is the old one, and the stored body still parses', () => {
  const d = dispositionForTurnEnd(refused('budget_exhausted'));
  expect(d).toMatchObject({ notes: 'Non adesso: budget_exhausted. Ricontrollo automatico.' });
  expect(PaperclipDisposizioneCorpoSchema.safeParse(paperclipBodyForDisposition(d, { now: NOW, agentId: AGENT_ID })).success).toBe(true);
});

it('s6543 no other refusal code uses the sentence', () => {
  for (const code of ['organization_binding_unavailable', 'rd_paused', 'organization_admission_unavailable'] as const) {
    expect(dispositionForTurnEnd(withMessage(code, capSentence))).toEqual(dispositionForTurnEnd(refused(code)));
  }
});

it('s6543 a sentence too long for the note falls back to the old note', () => {
  const d = dispositionForTurnEnd(withMessage('budget_exhausted', 'x'.repeat(480)));
  expect(TurnDispositionSchema.safeParse(d).success).toBe(true);
  expect(d).toMatchObject({ notes: 'Non adesso: budget_exhausted. Ricontrollo automatico.' });
});

it('s7419_failed_porta_causa_e_testo', () => {
  const d = dispositionForTurnEnd({ kind: 'failed', failureCode: 'tool_error' });
  expect(d).toMatchObject({ kind: 'fail_run', cause: 'turn_failed', detail: 'Turno fallito: tool_error.' });
  expect(TurnDispositionSchema.safeParse(d).success).toBe(true);
  const long = dispositionForTurnEnd({ kind: 'failed', failureCode: 'e'.repeat(300) });
  expect(long.kind === 'fail_run' && long.detail.length <= 2000 && long.detail.includes('e'.repeat(200))).toBe(true);
  expect(long.kind === 'fail_run' && long.detail.includes('e'.repeat(201))).toBe(false);
});

it('s7419_uncertain_porta_causa_e_testo', () => {
  const d = dispositionForTurnEnd({ kind: 'uncertain' });
  expect(d).toMatchObject({ kind: 'fail_run', cause: 'outcome_uncertain', detail: TURN_DISPOSITION_TEXT.uncertainNote() });
  expect(d.kind === 'fail_run' && d.detail).toContain('non è chiaro se il lavoro è stato fatto');
  expect(TurnDispositionSchema.safeParse(d).success).toBe(true);
});

it('s7419_fail_run_senza_causa_rifiutato', () => {
  const ok = { kind: 'fail_run', runSucceeds: false, cause: 'turn_failed', detail: 'x' };
  expect(TurnDispositionSchema.safeParse(ok).success).toBe(true);
  expect(TurnDispositionSchema.safeParse({ kind: 'fail_run', runSucceeds: false }).success).toBe(false);
  expect(TurnDispositionSchema.safeParse({ ...ok, cause: 'altro' }).success).toBe(false);
  expect(TurnDispositionSchema.safeParse({ ...ok, detail: '' }).success).toBe(false);
  expect(TurnDispositionSchema.safeParse({ ...ok, extra: 1 }).success).toBe(false);
});

it('s7419_turnFailRun', () => {
  for (const cause of ['turn_failed', 'outcome_uncertain', 'restart_count_unreadable'] as const) {
    const d = turnFailRun(cause, 'x');
    expect(d.cause).toBe(cause);
    expect(TurnDispositionSchema.safeParse(d).success).toBe(true);
  }
  expect(turnFailRun('restart_count_unreadable').detail).toBe(TURN_DISPOSITION_TEXT.restartCountNote());
  expect(() => turnFailRun('x' as never)).toThrow();
});

it('s7419_unavailable_con_causa', () => {
  const frasi = new Set<string>();
  for (const cause of TURN_UNAVAILABLE_CAUSES) {
    const d = dispositionForTurnEnd(TurnEndSchema.parse({ kind: 'unavailable', cause }));
    expect(d.kind).toBe('check_later');
    if (d.kind !== 'check_later') continue;
    expect(d.notes.startsWith('Turno interrotto: il servizio non ha risposto (')).toBe(true);
    expect(d.notes.length).toBeLessThanOrEqual(500);
    expect(d.afterSeconds).toBe(1800);
    expect(d).not.toHaveProperty('serviceName');
    expect(TurnDispositionSchema.safeParse(d).success).toBe(true);
    frasi.add(TURN_DISPOSITION_TEXT.unavailableCause[cause]);
    expect(d.notes).toContain(`(${TURN_DISPOSITION_TEXT.unavailableCause[cause]})`);
  }
  expect(frasi.size).toBe(5);
  const senza = dispositionForTurnEnd({ kind: 'unavailable' });
  expect(senza.kind === 'check_later' && senza.notes).toBe(INTERRUPTED_NOTE);
  expect(TurnEndSchema.safeParse({ kind: 'unavailable', cause: 'altro' }).success).toBe(false);
  expect(TurnEndSchema.options).toHaveLength(7);
});

it('s7419_solo_fail_run_ha_la_causa', () => {
  expect(TurnDispositionSchema.safeParse({ kind: 'leave', runSucceeds: true, cause: 'turn_failed' }).success).toBe(false);
  expect(TurnDispositionSchema.safeParse({
    kind: 'check_later', runSucceeds: true, afterSeconds: 1800, notes: 'n', cause: 'turn_failed',
  }).success).toBe(false);
});

it('s7419_corpo_di_fail_run_ancora_nullo', () => {
  expect(paperclipBodyForDisposition(turnFailRun('turn_failed', 'x'), { now: NOW, agentId: AGENT_ID })).toBeNull();
});
