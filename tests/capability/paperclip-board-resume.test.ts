import { describe, expect, it } from 'vitest';
import {
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
  boardResumeAgentStatusAllowed,
  boardResumeComment,
  boardResumeCommentKind,
  boardResumeNeedsPersonComment,
  renderBoardResumeLog,
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
