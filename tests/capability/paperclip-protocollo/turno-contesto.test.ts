import { describe, expect, it } from 'vitest';
import {
  PaperclipTurnoContestoSchema,
  PaperclipTurnoIncaricoSintesiSchema,
  PaperclipTurnoRichiestaSchema,
  incaricoDelTurno,
  paperclipTurnoSoloDisposizione,
} from '../../../src/capability/paperclip-protocollo/turno.js';
import {
  PaperclipContestoTurnoSchema,
  PaperclipCursoreCommentiSchema,
  PaperclipObiettivoContestoSchema,
  PaperclipProgettoContestoSchema,
  PaperclipRiassuntoContinuazioneSchema,
} from '../../../src/capability/paperclip-protocollo/wire-letture.js';

const issueId = '11111111-1111-4111-8111-111111111111';
const childId = '22222222-2222-4222-8222-222222222222';
const agentId = '33333333-3333-4333-8333-333333333333';
const otherId = '44444444-4444-4444-8444-444444444444';
const runId = '55555555-5555-4555-8555-555555555555';
const summary = {
  id: childId, identifier: 'PAP-12', title: 'Review completed', status: 'done',
  assigneeAgentId: agentId, summary: 'Reviewed the delivery.', extra: 'retained',
};
const base = { issueId, wakeReason: 'issue_children_completed' };
const issue = { id: issueId, title: 'Coordinate delivery', status: 'blocked' };
const heartbeat = { issue, ancestors: [], wakeComment: null };

describe('Paperclip wake context', () => {
  it('s7415_figli_finiti', () => {
    const context = {
      ...base, source: 'issue.children.completed', wakeSource: 'automation',
      wakeTriggerDetail: 'system', completedChildIssueId: childId,
      childIssueIds: [childId, otherId],
      childIssueSummaries: [summary, {
        ...summary, id: otherId, status: 'cancelled', identifier: null,
        assigneeAgentId: null, summary: null,
      }],
      childIssueSummaryTruncated: false, onboardingCompletion: true,
    };
    expect(PaperclipTurnoContestoSchema.parse(context)).toEqual(context);
    const full = Array.from({ length: 20 }, () => summary);
    expect(PaperclipTurnoContestoSchema.parse({ ...context, childIssueSummaries: full })
      .childIssueSummaries).toHaveLength(20);
    const overflow = PaperclipTurnoContestoSchema.parse({
      ...context, childIssueSummaries: [...full, summary],
    });
    expect(overflow.childIssueSummaries).toBeUndefined();
    expect(overflow.issueId).toBe(issueId);
    expect(PaperclipTurnoIncaricoSintesiSchema.parse(summary)).toEqual(summary);
    expect(PaperclipTurnoIncaricoSintesiSchema.parse({
      id: childId, title: 'Closed', status: 'cancelled',
    })).toEqual({ id: childId, title: 'Closed', status: 'cancelled' });
    for (const invalid of [
      { id: 'bad' }, { title: 1 }, { status: 'unknown' },
      { identifier: 1 }, { assigneeAgentId: 'bad' }, { summary: 1 },
    ]) {
      const parsed = PaperclipTurnoContestoSchema.parse({
        ...base, childIssueSummaries: [{ ...summary, ...invalid }],
      });
      expect(parsed.childIssueSummaries).toBeUndefined();
    }
  });

  it('s7415_un_campo_storto_si_scarta', () => {
    const malformed: Record<string, unknown> = {
      source: 1, wakeSource: 1, wakeTriggerDetail: 1,
      resolvedBlockerIssueId: 'bad', blockerIssueIds: ['bad'],
      completedChildIssueId: 'bad', childIssueIds: ['bad'], childIssueSummaries: [{}],
      childIssueSummaryTruncated: 'yes', onboardingCompletion: 'yes',
      dependencyBlockedInteraction: 'yes', unresolvedBlockerIssueIds: ['bad'],
      unresolvedBlockerCount: '1', unresolvedBlockerSummaries: [{}],
      interactionId: 'bad', interactionKind: 1, interactionStatus: 1,
      taskWatchdog: { watchedIssueId: 'bad', stopFingerprint: 'stopped' },
    };
    for (const [key, value] of Object.entries(malformed)) {
      for (const invalid of [value, null]) {
        const parsed = PaperclipTurnoContestoSchema.parse({ ...base, [key]: invalid });
        expect(parsed[key], key).toBeUndefined();
        expect(parsed.issueId).toBe(issueId);
        expect(parsed.wakeReason).toBe(base.wakeReason);
      }
    }
    expect(PaperclipTurnoContestoSchema.safeParse({ ...base, issueId: 'bad' }).success)
      .toBe(false);
    expect(PaperclipTurnoContestoSchema.safeParse({ ...base, taskId: 12 }).success)
      .toBe(false);
    expect(PaperclipTurnoContestoSchema.parse({ ...base, futurePaperclipField: { ok: true } })
      .futurePaperclipField).toEqual({ ok: true });
    expect(PaperclipTurnoContestoSchema.parse({})).toEqual({});
  });

  it('s7415_blocchi_risolti_e_blocchi_aperti', () => {
    const resolved = {
      issueId, wakeReason: 'issue_blockers_resolved',
      resolvedBlockerIssueId: childId, blockerIssueIds: [childId, otherId],
    };
    const open = {
      issueId, wakeReason: 'issue_commented', dependencyBlockedInteraction: true,
      unresolvedBlockerIssueIds: [childId], unresolvedBlockerCount: 1,
      unresolvedBlockerSummaries: [{ ...summary, status: 'blocked' }],
    };
    expect(PaperclipTurnoContestoSchema.parse(resolved)).toEqual(resolved);
    expect(PaperclipTurnoContestoSchema.parse(open)).toEqual(open);
    expect(PaperclipTurnoContestoSchema.parse({ ...open, unresolvedBlockerCount: 0 })
      .unresolvedBlockerCount).toBe(0);
    for (const unresolvedBlockerCount of [-1, 1.5]) {
      const parsed = PaperclipTurnoContestoSchema.parse({ ...open, unresolvedBlockerCount });
      expect(parsed.unresolvedBlockerCount).toBeUndefined();
      expect(parsed.unresolvedBlockerSummaries).toEqual(open.unresolvedBlockerSummaries);
    }
  });

  it('s7415_carta_risolta_e_watchdog', () => {
    const card = {
      issueId, wakeReason: 'issue_commented', interactionId: childId,
      interactionKind: 'question', interactionStatus: 'resolved',
    };
    expect(PaperclipTurnoContestoSchema.parse(card)).toEqual(card);
    const watchdog = {
      taskId: issueId, issueId, wakeReason: 'task_watchdog_stopped_subtree',
      taskWatchdog: { watchedIssueId: otherId, stopFingerprint: 'subtree-stopped', extra: true },
    };
    const parsed = PaperclipTurnoContestoSchema.parse(watchdog);
    expect(parsed).toEqual(watchdog);
    expect(incaricoDelTurno(parsed)).toBe(issueId);
    expect(parsed.taskWatchdog?.watchedIssueId).toBe(otherId);
    for (const taskWatchdog of [
      { watchedIssueId: otherId }, { stopFingerprint: 'stopped' },
      { watchedIssueId: otherId, stopFingerprint: 1 },
    ]) {
      expect(PaperclipTurnoContestoSchema.parse({ ...watchdog, taskWatchdog }).taskWatchdog)
        .toBeUndefined();
    }
  });

  it('s7415_sorgenti_chiuse', () => {
    for (const wakeSource of ['timer', 'assignment', 'on_demand', 'automation']) {
      expect(PaperclipTurnoContestoSchema.parse({ ...base, wakeSource }).wakeSource)
        .toBe(wakeSource);
    }
    for (const wakeTriggerDetail of ['manual', 'ping', 'callback', 'system']) {
      expect(PaperclipTurnoContestoSchema.parse({ ...base, wakeTriggerDetail }).wakeTriggerDetail)
        .toBe(wakeTriggerDetail);
    }
    for (const invalid of ['', 'future_value', 'TIMER']) {
      const parsed = PaperclipTurnoContestoSchema.parse({
        ...base, source: invalid, wakeSource: invalid, wakeTriggerDetail: invalid,
      });
      expect(parsed.source).toBe(invalid);
      expect(parsed.wakeSource).toBeUndefined();
      expect(parsed.wakeTriggerDetail).toBeUndefined();
    }
  });

  it('s7415_corpo_http_intero', () => {
    const body = {
      runId, agentId, templateField: 'custom', paperclipRuntimeTools: [{ name: 'tool' }],
      context: {
        ...base, childIssueIds: [childId], childIssueSummaries: [summary],
        recoveryIntent: 'status_only', allowDeliverableWork: false,
        allowDocumentUpdates: false, resumeRequiresNormalModel: true, extra: 1,
      },
    };
    const parsed = PaperclipTurnoRichiestaSchema.parse(body);
    expect(parsed).toEqual(body);
    expect(paperclipTurnoSoloDisposizione(parsed.context)).toBe(true);
    const invalid = PaperclipTurnoRichiestaSchema.parse({
      ...body, context: {
        ...base, recoveryIntent: 'free_text', allowDeliverableWork: 'no',
        allowDocumentUpdates: 'no', resumeRequiresNormalModel: 'yes',
      },
    }).context;
    expect(invalid.recoveryIntent).toBeUndefined();
    expect(invalid.allowDeliverableWork).toBeUndefined();
    expect(invalid.allowDocumentUpdates).toBeUndefined();
    expect(invalid.resumeRequiresNormalModel).toBeUndefined();
    expect(paperclipTurnoSoloDisposizione(invalid)).toBe(false);
  });

  it('s7415_heartbeat_context_tipizza_cursore_progetto_obiettivo_sintesi', () => {
    const cursor = {
      totalComments: 2, latestCommentId: childId, latestCommentAt: '2026-11-18T10:00:00Z',
      extra: true,
    };
    const project = { id: otherId, name: 'Delivery', status: 'in_progress', targetDate: null };
    const goal = { id: otherId, title: 'Ship', status: 'active', level: 'team', parentId: null };
    const continuation = { key: 'handoff', title: null, body: 'Continue review', latestRevisionId: runId };
    const response = {
      ...heartbeat, commentCursor: cursor, project, goal, continuationSummary: continuation,
      attachments: [{ futureAttachmentShape: true }], scheduledRetry: { future: true },
    };
    expect(PaperclipContestoTurnoSchema.parse(response)).toEqual(response);
    expect(PaperclipCursoreCommentiSchema.parse(cursor)).toEqual(cursor);
    expect(PaperclipProgettoContestoSchema.parse(project)).toEqual(project);
    expect(PaperclipObiettivoContestoSchema.parse(goal)).toEqual(goal);
    expect(PaperclipRiassuntoContinuazioneSchema.parse(continuation)).toEqual(continuation);
    expect(PaperclipContestoTurnoSchema.parse({
      ...heartbeat, commentCursor: { totalComments: 0, latestCommentId: null },
      project: null, goal: null, continuationSummary: null,
    })).toEqual({
      ...heartbeat, commentCursor: { totalComments: 0, latestCommentId: null },
      project: null, goal: null, continuationSummary: null,
    });
    expect(PaperclipContestoTurnoSchema.parse(heartbeat)).toEqual(heartbeat);
    for (const invalid of [
      { totalComments: -1 }, { totalComments: 1.5 }, { latestCommentId: 'bad' },
      { latestCommentAt: 1 },
    ]) {
      const parsed = PaperclipContestoTurnoSchema.parse({
        ...response, commentCursor: { ...cursor, ...invalid },
      });
      expect(parsed.commentCursor).toBeUndefined();
      expect(parsed.issue).toEqual(issue);
    }
    const malformed = [
      ['commentCursor', null], ['commentCursor', {}],
      ['project', { ...project, id: 'bad' }], ['project', { ...project, name: 1 }],
      ['project', { ...project, status: 1 }], ['project', { ...project, targetDate: 1 }],
      ['goal', { ...goal, id: 'bad' }], ['goal', { ...goal, title: 1 }],
      ['goal', { ...goal, status: 1 }], ['goal', { ...goal, level: 1 }],
      ['goal', { ...goal, parentId: 'bad' }],
      ['continuationSummary', { ...continuation, key: 1 }],
      ['continuationSummary', { ...continuation, title: 1 }],
      ['continuationSummary', { ...continuation, body: 1 }],
      ['continuationSummary', { ...continuation, latestRevisionId: 'bad' }],
    ] as const;
    for (const [key, value] of malformed) {
      const parsed = PaperclipContestoTurnoSchema.parse({ ...response, [key]: value });
      expect(parsed[key], key).toBeUndefined();
      expect(parsed.issue).toEqual(issue);
    }
    expect(PaperclipContestoTurnoSchema.safeParse({ ancestors: [], commentCursor: cursor }).success)
      .toBe(false);
  });
});
