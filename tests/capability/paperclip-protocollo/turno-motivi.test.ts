import { describe, expect, it } from 'vitest';
import {
  PAPERCLIP_ENV_NAMES,
  PAPERCLIP_ENV_SECRET_NAMES,
  PAPERCLIP_MOTIVO_COMMENTO_MANCANTE,
  PAPERCLIP_WAKE_REASONS,
  PAPERCLIP_WAKE_REASONS_DROPPED,
  PAPERCLIP_WAKE_REASONS_END_OF_CHILD_WAIT,
  PAPERCLIP_WAKE_REASONS_OTHER_FAMILIES,
  PAPERCLIP_WAKE_REASONS_RECOVERY,
  PAPERCLIP_WAKE_REASONS_WORK,
  PAPERCLIP_WAKE_SOURCES,
  PAPERCLIP_WAKE_TRIGGER_DETAILS,
  PAPERCLIP_X9_WAKE_REASON_PREFIXES,
  PaperclipWakeReasonSchema,
  paperclipWakeEndsChildWait,
  paperclipWakeReasonKind,
} from '../../../src/capability/paperclip-protocollo/turno.js';

const X9 = [
  'x9_referent_reply', 'x9_approval_standby', 'x9_binding_repaired', 'x9_director_ask_resume', 'x9_email_received',
  'x9_research_done', 'x9_dev_delivered', 'x9_project_delivered', 'x9_work_stalled', 'x9_approved_units_failed',
  'x9-delivery:11111111-1111-4111-8111-111111111111:22222222-2222-4222-8222-222222222222',
];

describe('motivi di sveglia Paperclip', () => {
  it('s7414_tre_elenchi_disgiunti_e_una_unione', () => {
    const w = new Set<string>(PAPERCLIP_WAKE_REASONS_WORK);
    const r = new Set<string>(PAPERCLIP_WAKE_REASONS_RECOVERY);
    const o = new Set<string>(PAPERCLIP_WAKE_REASONS_OTHER_FAMILIES);
    expect([w.size, r.size, o.size]).toEqual([16, 13, 14]);
    expect(PAPERCLIP_WAKE_REASONS.length).toBe(43);
    expect(new Set<string>(PAPERCLIP_WAKE_REASONS).size).toBe(43);
    for (const a of w) expect(r.has(a) || o.has(a)).toBe(false);
    for (const a of r) expect(o.has(a)).toBe(false);
    for (const ok of ['issue_assigned', 'issue_commented', 'interaction_pending', 'missing_issue_comment', 'approval_approved']) {
      expect(PaperclipWakeReasonSchema.safeParse(ok).success).toBe(true);
    }
    for (const no of ['interaction_answered', 'interaction_resolved', 'issue_comment_mentioned', X9[0], 'motivo_inventato', '']) {
      expect(PaperclipWakeReasonSchema.safeParse(no).success).toBe(false);
    }
    expect(PAPERCLIP_WAKE_REASONS_DROPPED).toEqual(['issue_comment_mentioned']);
    expect(PAPERCLIP_WAKE_SOURCES).toEqual(['timer', 'assignment', 'on_demand', 'automation']);
    expect(PAPERCLIP_WAKE_TRIGGER_DETAILS).toEqual(['manual', 'ping', 'callback', 'system']);
    expect(PAPERCLIP_WAKE_REASONS).toContain(PAPERCLIP_MOTIVO_COMMENTO_MANCANTE);
  });

  it('s7414_un_motivo_x9_non_e_di_paperclip', () => {
    expect(PAPERCLIP_X9_WAKE_REASON_PREFIXES).toEqual(['x9_', 'x9-delivery:']);
    for (const m of PAPERCLIP_WAKE_REASONS) expect(paperclipWakeReasonKind(m)).toBe('paperclip');
    for (const m of X9) {
      expect(paperclipWakeReasonKind(m)).toBe('x9_own');
      expect((PAPERCLIP_WAKE_REASONS as readonly string[]).includes(m)).toBe(false);
    }
    for (const m of ['x9', 'X9_work_stalled', 'issue_comment_mentioned', undefined, null]) {
      expect(paperclipWakeReasonKind(m)).toBe('other');
    }
  });

  it('s7414_due_sveglie_chiudono_l_attesa_di_un_figlio', () => {
    expect([...PAPERCLIP_WAKE_REASONS_END_OF_CHILD_WAIT]).toEqual(['issue_blockers_resolved', 'issue_children_completed']);
    expect(paperclipWakeEndsChildWait('issue_blockers_resolved')).toBe(true);
    expect(paperclipWakeEndsChildWait('issue_children_completed')).toBe(true);
    for (const m of ['issue_commented', 'issue_monitor_due', X9[0], '', undefined, null]) {
      expect(paperclipWakeEndsChildWait(m)).toBe(false);
    }
  });

  it('s7414_variabili_d_ambiente', () => {
    expect([...PAPERCLIP_ENV_NAMES].sort()).toEqual([
      'PAPERCLIP_AGENT_ID', 'PAPERCLIP_API_KEY', 'PAPERCLIP_API_URL', 'PAPERCLIP_APPROVAL_ID', 'PAPERCLIP_APPROVAL_STATUS',
      'PAPERCLIP_COMPANY_ID', 'PAPERCLIP_LINKED_ISSUE_IDS', 'PAPERCLIP_RUN_ID', 'PAPERCLIP_TASK_ID',
      'PAPERCLIP_WAKE_COMMENT_ID', 'PAPERCLIP_WAKE_REASON',
    ]);
    for (const n of PAPERCLIP_ENV_NAMES) expect(n.startsWith('PAPERCLIP_')).toBe(true);
    expect([...PAPERCLIP_ENV_SECRET_NAMES]).toEqual(['PAPERCLIP_API_KEY']);
    for (const s of PAPERCLIP_ENV_SECRET_NAMES) expect(PAPERCLIP_ENV_NAMES).toContain(s);
  });
});
