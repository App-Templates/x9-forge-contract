import { describe, expect, it } from 'vitest';
import {
  BOARD_RECONCILE_REFUSALS,
  BOARD_RECONCILE_REFUSAL_TEXT,
  BOARD_RECONCILIATION_FINISHED_RUN_STATUSES,
  BoardReconcileRefusalLogSchema,
  boardClosedHoldReconciliation,
  boardReconcileRefusalCode,
  renderBoardReconcileRefusalLog,
  BOARD_CLOSED_HOLD_CAUSES,
  BOARD_CLOSED_HOLD_MAX_AGE_SECONDS_DEFAULT,
  BOARD_CLOSED_HOLD_MAX_AGE_SECONDS_MIN,
  BOARD_CLOSED_HOLD_MAX_AGE_SECONDS_MAX,
  BOARD_CLOSED_HOLD_MAX_PER_ROUND_DEFAULT,
  BOARD_CLOSED_HOLD_MAX_PER_ROUND_MIN,
  BOARD_CLOSED_HOLD_MAX_PER_ROUND_MAX,
  BOARD_CLOSED_HOLD_REASONS,
  BOARD_CLOSED_HOLD_TEXT,
  BoardClosedHoldCauseSchema,
  BoardClosedHoldReasonSchema,
  BOARD_HOLD_SKIP_REASONS,
  BOARD_HOLD_SKIP_LOG_REPEAT_SECONDS,
  BoardHoldSkipReasonSchema,
  BoardHoldSkipLogSchema,
  BOARD_RESUME_AGENT_STATUSES,
  BOARD_RESUME_CAUSES,
  BOARD_RESUME_COMMENT_PREFIX,
  BOARD_RESUME_KEEP_REASONS,
  BOARD_RESUME_KEEP_TEXT,
  BOARD_RESUME_MAX_PER_ISSUE_DEFAULT,
  BOARD_RESUME_MIN_GAP_SECONDS_DEFAULT,
  BOARD_RESUME_MIN_RUNS_LEFT,
  BOARD_RESUME_NEEDS_PERSON_PREFIX,
  BoardResumeLogSchema,
  boardClosedHoldComment,
  boardHoldSkipLogDue,
  boardResumeAgentStatusAllowed,
  boardResumeComment,
  boardResumeCommentKind,
  boardResumeNeedsPersonComment,
  renderBoardResumeLog,
  renderBoardHoldSkipLog,
} from '../../src/capability/paperclip/board-resume.js';

const COMPANY = '11111111-1111-4111-8111-111111111111';
const AGENT = '22222222-2222-4222-8222-222222222222';
const baseLog = {
  companyId: COMPANY,
  issueIdentifier: 'AZI-42',
  paperclipAgentId: AGENT,
  cause: 'refused_turn' as const,
  attempt: 1,
  max: 2,
};

describe('s7212 ripartenza-board-forme', () => {
  it('s7212 (a) the causes are a closed list and every keep reason has a sentence', () => {
    expect([...BOARD_RESUME_CAUSES]).toEqual(['refused_turn', 'stranded_infrastructure', 'interrupted_turn']);
    expect(BOARD_RESUME_KEEP_REASONS.length).toBe(14);
    for (const reason of BOARD_RESUME_KEEP_REASONS) {
      expect(BOARD_RESUME_KEEP_TEXT[reason].trim().length).toBeGreaterThan(0);
    }
    expect(Object.keys(BOARD_RESUME_KEEP_TEXT).sort()).toEqual([...BOARD_RESUME_KEEP_REASONS].sort());
    expect(BOARD_RESUME_MAX_PER_ISSUE_DEFAULT).toBe(2);
    expect(BOARD_RESUME_MIN_GAP_SECONDS_DEFAULT).toBe(1800);
    expect(BOARD_RESUME_MIN_RUNS_LEFT).toBe(2);
  });

  it('s7212 (b) the log line carries the fields, identita only when present', () => {
    expect(renderBoardResumeLog(baseLog)).toBe(
      `incarico_ripreso azienda=${COMPANY} incarico=AZI-42 agente=${AGENT} causa=refused_turn n=1/2`,
    );
    expect(renderBoardResumeLog({ ...baseLog, runtimeAgentId: 'ceo-x9' })).toBe(
      `incarico_ripreso azienda=${COMPANY} incarico=AZI-42 agente=${AGENT} causa=refused_turn n=1/2 identita=ceo-x9`,
    );
  });

  it('s7212 (b) the log schema refuses extra fields, attempt > max, bad uuid, unknown cause', () => {
    expect(BoardResumeLogSchema.safeParse(baseLog).success).toBe(true);
    expect(BoardResumeLogSchema.safeParse({ ...baseLog, token: 'secret' }).success).toBe(false);
    expect(BoardResumeLogSchema.safeParse({ ...baseLog, attempt: 3, max: 2 }).success).toBe(false);
    expect(BoardResumeLogSchema.safeParse({ ...baseLog, attempt: 0 }).success).toBe(false);
    expect(BoardResumeLogSchema.safeParse({ ...baseLog, companyId: 'not-a-uuid' }).success).toBe(false);
    expect(BoardResumeLogSchema.safeParse({ ...baseLog, cause: 'product_reason' }).success).toBe(false);
  });

  it('s7212 (c) the resume comment is fixed for every cause', () => {
    const seen = new Set<string>();
    for (const cause of BOARD_RESUME_CAUSES) {
      const text = boardResumeComment({ cause, attempt: 1, max: 2 });
      expect(text).not.toContain('undefined');
      seen.add(text);
      expect(text.startsWith(BOARD_RESUME_COMMENT_PREFIX)).toBe(true);
      expect(text).toContain('riapertura 1 di 2');
      expect(text).toContain('non ripeterlo');
      expect(text.length).toBeLessThanOrEqual(500);
    }
    expect(seen.size).toBe(BOARD_RESUME_CAUSES.length);
    const needs = boardResumeNeedsPersonComment({ max: 2 });
    expect(needs.startsWith(BOARD_RESUME_NEEDS_PERSON_PREFIX)).toBe(true);
    expect(needs).toContain('2 volte');
  });

  it('s7212 (d) the comment kind is read from the prefix only at the start', () => {
    expect(boardResumeCommentKind(boardResumeComment({ cause: 'interrupted_turn', attempt: 1, max: 2 }))).toBe('resume');
    expect(boardResumeCommentKind(boardResumeNeedsPersonComment({ max: 2 }))).toBe('needs_person');
    expect(boardResumeCommentKind('un commento qualunque')).toBeNull();
    expect(boardResumeCommentKind(` ${BOARD_RESUME_COMMENT_PREFIX}x`)).toBeNull();
    expect(boardResumeCommentKind(`ciao ${BOARD_RESUME_NEEDS_PERSON_PREFIX}x`)).toBeNull();
  });
});

describe('s7221 ripartenza-board-agente-e-ora', () => {
  it('s7221 (a) an unavailable agent has a keep reason and a fixed explanation', () => {
    expect(BOARD_RESUME_KEEP_REASONS).toContain('agent_not_available');
    expect(BOARD_RESUME_KEEP_REASONS.at(-1)).toBe('agent_not_available');
    expect(BOARD_RESUME_KEEP_TEXT.agent_not_available).toContain('non riapro');
    expect(BOARD_RESUME_KEEP_TEXT.agent_not_available).toContain('in pausa');
  });

  it('s7221 (b) only the four invokable agent statuses allow a resume', () => {
    expect(BOARD_RESUME_AGENT_STATUSES).toEqual(['active', 'idle', 'running', 'error']);
    for (const status of ['active', 'idle', 'running', 'error']) {
      expect(boardResumeAgentStatusAllowed(status), `allowed: ${status}`).toBe(true);
    }
    for (const status of ['paused', 'terminated', 'pending_approval', 'Idle', ' idle', 'archived', '', null, undefined]) {
      expect(boardResumeAgentStatusAllowed(status), `refused: ${status}`).toBe(false);
    }
  });

  it('s7221 (c) the optional UTC timestamp is last and refuses other text or offsets', () => {
    const at = '2026-11-16T12:00:00.000Z';
    const log = { ...baseLog, at };
    expect(BoardResumeLogSchema.safeParse(log).success).toBe(true);
    expect(renderBoardResumeLog(log)).toBe(
      `incarico_ripreso azienda=${COMPANY} incarico=AZI-42 agente=${AGENT} causa=refused_turn n=1/2 ora=${at}`,
    );
    const identifiedLog = { ...log, runtimeAgentId: 'ceo-x9' };
    expect(BoardResumeLogSchema.safeParse(identifiedLog).success).toBe(true);
    expect(renderBoardResumeLog(identifiedLog)).toBe(
      `incarico_ripreso azienda=${COMPANY} incarico=AZI-42 agente=${AGENT} causa=refused_turn n=1/2 identita=ceo-x9 ora=${at}`,
    );
    for (const invalid of ['yesterday', '2026-11-16', '2026-11-16T12:00:00.000+02:00', `${at} token=abc`]) {
      expect(BoardResumeLogSchema.safeParse({ ...baseLog, at: invalid }).success, `refused: ${invalid}`).toBe(false);
    }
    expect(BoardResumeLogSchema.safeParse({ ...log, extra: 'text' }).success).toBe(false);
  });
});

describe('s7235 fermo-gia-chiuso-forme', () => {
  it('s7235 (a) closed holds have separate causes, limits and exhaustive reasons', () => {
    expect(BOARD_CLOSED_HOLD_CAUSES).toEqual(['closed_hold_infrastructure', 'closed_hold_after_writes']);
    expect(BoardClosedHoldCauseSchema.options).toEqual([...BOARD_CLOSED_HOLD_CAUSES]);
    expect(BoardClosedHoldCauseSchema.safeParse('closed_hold').success).toBe(false);
    expect([
      BOARD_CLOSED_HOLD_MAX_AGE_SECONDS_DEFAULT,
      BOARD_CLOSED_HOLD_MAX_AGE_SECONDS_MIN,
      BOARD_CLOSED_HOLD_MAX_AGE_SECONDS_MAX,
    ]).toEqual([259200, 3600, 432000]);
    expect([
      BOARD_CLOSED_HOLD_MAX_PER_ROUND_DEFAULT,
      BOARD_CLOSED_HOLD_MAX_PER_ROUND_MIN,
      BOARD_CLOSED_HOLD_MAX_PER_ROUND_MAX,
    ]).toEqual([3, 1, 20]);
    expect(BOARD_CLOSED_HOLD_REASONS).toEqual([
      'other_recovery_action', 'no_blocked_hold', 'already_resolved', 'issue_changed',
      'hold_too_old', 'run_not_found', 'run_not_infrastructure_failure', 'activity_unreadable',
      'binding_not_verified', 'paperclip_no_change', 'paperclip_refused', 'round_cap_reached',
    ]);
    expect(BoardClosedHoldReasonSchema.options).toEqual([...BOARD_CLOSED_HOLD_REASONS]);
    expect(BoardClosedHoldReasonSchema.safeParse('unknown').success).toBe(false);
    for (const reason of BOARD_CLOSED_HOLD_REASONS) {
      expect(BOARD_CLOSED_HOLD_TEXT[reason].trim().length).toBeGreaterThan(0);
      expect(BOARD_RESUME_KEEP_REASONS).not.toContain(reason);
    }
    expect(Object.keys(BOARD_CLOSED_HOLD_TEXT).sort()).toEqual([...BOARD_CLOSED_HOLD_REASONS].sort());
    expect(BOARD_RESUME_CAUSES).toEqual(['refused_turn', 'stranded_infrastructure', 'interrupted_turn']);
    expect(BOARD_RESUME_KEEP_REASONS).toEqual([
      'cause_not_recognised', 'cause_disabled', 'open_blockers', 'declared_wait', 'person_touched',
      'run_in_flight', 'daily_cap_reached', 'daily_cap_unreadable', 'max_resumes_reached', 'too_soon',
      'history_unreadable', 'trace_failed', 'agent_error_not_cleared', 'agent_not_available',
    ]);
  });

  it('s7235 (b) closed hold comments count as resumes and warn about previous writes', () => {
    for (const cause of BOARD_CLOSED_HOLD_CAUSES) {
      const text = boardClosedHoldComment({ cause, attempt: 1, max: 2 });
      expect(text.startsWith(BOARD_RESUME_COMMENT_PREFIX)).toBe(true);
      expect(boardResumeCommentKind(text)).toBe('resume');
      expect(text).toContain('riapertura 1 di 2');
      expect(text).not.toContain('undefined');
      expect(text.length).toBeLessThanOrEqual(500);
      if (cause === 'closed_hold_after_writes') {
        expect(text).toContain('DOPO aver scritto');
        expect(text).toContain('Rileggi i commenti e lo stato');
      } else {
        expect(text).not.toContain('DOPO aver scritto');
        expect(text).not.toContain('Rileggi i commenti e lo stato');
      }
    }
  });

  it('s7235 (c) closed hold log causes carry UTC time and reject the generic cause', () => {
    const at = '2026-11-17T12:00:00.000Z';
    for (const cause of BOARD_CLOSED_HOLD_CAUSES) {
      const log = BoardResumeLogSchema.parse({ ...baseLog, cause, at });
      expect(renderBoardResumeLog(log)).toBe(
        `incarico_ripreso azienda=${COMPANY} incarico=AZI-42 agente=${AGENT} causa=${cause} n=1/2 ora=${at}`,
      );
      expect(BoardResumeLogSchema.safeParse({ ...log, extra: 'text' }).success).toBe(false);
    }
    expect(BoardResumeLogSchema.safeParse({ ...baseLog, cause: 'closed_hold', at }).success).toBe(false);
  });
});

describe('s7236 fermo-non-riaperto-riga', () => {
  const log = {
    companyId: COMPANY,
    issueIdentifier: 'AZI-42',
    paperclipAgentId: AGENT,
    reason: 'hold_too_old' as const,
    at: '2026-11-17T12:00:00.000Z',
  };

  it('s7236 (a) skip reasons unite both closed lists without duplicates', () => {
    expect(BOARD_HOLD_SKIP_REASONS).toEqual([...BOARD_RESUME_KEEP_REASONS, ...BOARD_CLOSED_HOLD_REASONS]);
    expect(BOARD_HOLD_SKIP_REASONS).toHaveLength(26);
    expect(new Set(BOARD_HOLD_SKIP_REASONS).size).toBe(26);
    expect(BoardHoldSkipReasonSchema.options).toEqual([...BOARD_HOLD_SKIP_REASONS]);
    for (const reason of BOARD_HOLD_SKIP_REASONS) {
      expect(BoardHoldSkipReasonSchema.safeParse(reason).success, reason).toBe(true);
    }
    expect(BoardHoldSkipReasonSchema.safeParse('free text').success).toBe(false);
  });

  it('s7236 (b) skip logs render a strict identified UTC line and reject invalid data', () => {
    expect(BoardHoldSkipLogSchema.safeParse(log).success).toBe(true);
    expect(renderBoardHoldSkipLog(log)).toBe(
      `fermo_non_riaperto azienda=${COMPANY} incarico=AZI-42 agente=${AGENT} motivo=hold_too_old ora=2026-11-17T12:00:00.000Z`,
    );
    for (const invalid of [
      { ...log, extra: 'text' },
      { ...log, at: '2026-11-17T12:00:00.000+02:00' },
      { ...log, at: 'yesterday' },
      { ...log, companyId: 'not-a-uuid' },
      { ...log, paperclipAgentId: 'not-a-uuid' },
      { ...log, issueIdentifier: '' },
      { ...log, issueIdentifier: 'A'.repeat(65) },
    ]) {
      expect(BoardHoldSkipLogSchema.safeParse(invalid).success).toBe(false);
      expect(() => renderBoardHoldSkipLog(invalid)).toThrow();
    }
    expect(BoardHoldSkipLogSchema.safeParse({ ...log, reason: 'free text' }).success).toBe(false);
    expect(BoardHoldSkipLogSchema.safeParse({ ...log, at: undefined }).success).toBe(false);
    expect(BoardHoldSkipLogSchema.safeParse({ ...log, issueIdentifier: 'A'.repeat(64) }).success).toBe(true);
  });

  it('s7236 (c) skip log repetition is due first, on reason change or after one hour', () => {
    const nowMs = Date.parse(log.at);
    expect(BOARD_HOLD_SKIP_LOG_REPEAT_SECONDS).toBe(3_600);
    expect(boardHoldSkipLogDue(undefined, log.reason, nowMs)).toBe(true);
    expect(boardHoldSkipLogDue(log, log.reason, nowMs)).toBe(false);
    expect(boardHoldSkipLogDue(log, log.reason, nowMs + 3_599_000)).toBe(false);
    expect(boardHoldSkipLogDue(log, log.reason, nowMs + 3_600_000)).toBe(true);
    expect(boardHoldSkipLogDue(log, log.reason, nowMs + 3_601_000)).toBe(true);
    expect(boardHoldSkipLogDue(log, 'declared_wait', nowMs + 1_000)).toBe(true);
  });
});

describe('s7243 dichiarazione-fermo-chiuso', () => {
  const runId = '11111111-1111-4111-8111-111111111111';
  const base = { runId, runStatus: 'failed', runErrorCode: 'adapter_failed', commentsByRun: 0, writes: [] as { action: string; count: number }[] };

  it('(a) declares from facts and refuses what facts do not support', () => {
    const none = boardClosedHoldReconciliation({ ...base, cause: 'closed_hold_infrastructure' });
    expect(none).toMatchObject({ runId, providerStopped: true, actionOutcome: 'not_performed' });
    expect(none.outcomeEvidence).toContain('adapter_failed');
    expect(none.outcomeEvidence).toContain('Gli effetti fuori da Paperclip non sono verificabili da questo operatore');
    const mixed = boardClosedHoldReconciliation({
      ...base,
      cause: 'closed_hold_after_writes',
      commentsByRun: 1,
      writes: [{ action: 'issue.cross_issue_influence_observed', count: 2 }],
    });
    expect(mixed.actionOutcome).toBe('mixed');
    expect(mixed.outcomeEvidence).toContain('issue.cross_issue_influence_observed: 2');
    expect(mixed.outcomeEvidence).toContain('commenti: 1');
    expect(mixed.outcomeEvidence).toContain('rilegge commenti e stato');
    for (const runStatus of ['running', 'queued', 'succeeded']) {
      expect(() => boardClosedHoldReconciliation({ ...base, runStatus, cause: 'closed_hold_infrastructure' })).toThrow();
    }
    expect(() => boardClosedHoldReconciliation({ ...base, cause: 'closed_hold_infrastructure', commentsByRun: 1 })).toThrow();
    expect(() => boardClosedHoldReconciliation({ ...base, cause: 'closed_hold_after_writes' })).toThrow();
    expect(() =>
      boardClosedHoldReconciliation({ ...base, cause: 'closed_hold_after_writes', writes: [{ action: 'bad name', count: 1 }] }),
    ).toThrow();
    for (const runStatus of BOARD_RECONCILIATION_FINISHED_RUN_STATUSES) {
      expect(boardClosedHoldReconciliation({ ...base, runStatus, cause: 'closed_hold_infrastructure' }).providerStopped).toBe(true);
    }
  });

  it('(b) classifies Paperclip refusals into the closed list', () => {
    const cases: Array<[string, string]> = [
      ['provider is not stopped', 'provider_not_stopped'],
      ['execution is not settled', 'execution_not_settled'],
      ['recovery owner or source changed', 'owner_or_source_changed'],
      ['run does not match the action', 'run_mismatch'],
      ['workspace repair is required', 'workspace_repair_required'],
      ['another recovery action is active', 'other_active_action'],
    ];
    for (const [message, code] of cases) expect(boardReconcileRefusalCode(409, message)).toBe(code);
    expect(boardReconcileRefusalCode(404, 'x')).toBe('action_not_found');
    expect(boardReconcileRefusalCode(400, 'x')).toBe('bad_request');
    expect(boardReconcileRefusalCode(409, 'something new')).toBe('other_refusal');
    expect(boardReconcileRefusalCode(409, undefined)).toBe('other_refusal');
    for (const code of BOARD_RECONCILE_REFUSALS) expect(BOARD_RECONCILE_REFUSAL_TEXT[code].length).toBeGreaterThan(0);
    expect(BOARD_RECONCILE_REFUSALS).toHaveLength(9);
  });

  it('(c) refusal log line is exact and strict', () => {
    const log = {
      companyId: '22222222-2222-4222-8222-222222222222',
      issueIdentifier: 'ABC-12',
      paperclipAgentId: '33333333-3333-4333-8333-333333333333',
      status: 409,
      code: 'run_mismatch' as const,
      at: '2026-11-17T10:00:00.000Z',
    };
    expect(renderBoardReconcileRefusalLog(log)).toBe(
      'riapertura_rifiutata azienda=22222222-2222-4222-8222-222222222222 incarico=ABC-12 agente=33333333-3333-4333-8333-333333333333 stato=409 codice=run_mismatch ora=2026-11-17T10:00:00.000Z',
    );
    for (const bad of [{ ...log, status: 500 }, { ...log, code: 'free text' }, { ...log, extra: 1 }]) {
      expect(BoardReconcileRefusalLogSchema.safeParse(bad).success).toBe(false);
      expect(() => renderBoardReconcileRefusalLog(bad as never)).toThrow();
    }
  });
});
