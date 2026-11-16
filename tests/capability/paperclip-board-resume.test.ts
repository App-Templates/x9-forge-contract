import { describe, expect, it } from 'vitest';
import {
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
