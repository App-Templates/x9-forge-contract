import { expect, it } from 'vitest';
import {
  ORGANIZATION_ADMISSION_REFUSAL_CODES,
  InternalAgentTurnRunErrorResponseSchema,
  type OrganizationAdmissionRefusalCode,
} from '../../src/http/endpoints/internal-agent-turn.js';
import { PaperclipDisposizioneCorpoSchema } from '../../src/capability/paperclip-protocollo/wire-scritture.js';
import {
  ADMISSION_REFUSAL_CLASS,
  NOT_NOW_DEFAULT_RETRY_SECONDS,
  TurnDispositionSchema,
  TurnEndSchema,
  dispositionForTurnEnd,
  paperclipBodyForDisposition,
  type TurnEnd,
} from '../../src/capability/paperclip/turn-disposition.js';

const AGENT_ID = '11111111-1111-4111-8111-111111111111';
const NOW = new Date('2026-11-11T09:00:00.000Z');
const refused = (code: OrganizationAdmissionRefusalCode, retryAfterSeconds?: number): TurnEnd =>
  retryAfterSeconds === undefined ? { kind: 'refused', code } : { kind: 'refused', code, retryAfterSeconds };

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

it('s6182 failed, uncertain and unavailable are the only ends that fail the run', () => {
  const ends: TurnEnd[] = [
    { kind: 'succeeded' },
    { kind: 'cancelled' },
    { kind: 'failed', failureCode: 'tool_error' },
    { kind: 'uncertain' },
    { kind: 'unavailable' },
    ...ORGANIZATION_ADMISSION_REFUSAL_CODES.map((code) => refused(code)),
  ];
  const failing = ends.filter((e) => !dispositionForTurnEnd(e).runSucceeds).map((e) => e.kind);
  expect(failing).toEqual(['failed', 'uncertain', 'unavailable']);
  expect(dispositionForTurnEnd({ kind: 'succeeded' }).kind).toBe('leave');
  expect(dispositionForTurnEnd({ kind: 'cancelled' }).kind).toBe('leave');
  expect(paperclipBodyForDisposition(dispositionForTurnEnd({ kind: 'uncertain' }), { now: NOW, agentId: AGENT_ID })).toBeNull();
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
