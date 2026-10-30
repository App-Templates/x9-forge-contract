import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  PAPERCLIP_NATIVE_WAIT_TOOLS, PAPERCLIP_TOOLS, PaperclipCheckLaterInputSchema as CheckLater,
  PaperclipCheckLaterOutputSchema as CheckLaterOutput, PaperclipCreateIssueInputSchema as Create,
  PaperclipNativeCreateIssueInputSchema as NativeCreate, PaperclipNativeReviewInputSchema as NativeReview,
  PaperclipReviewInputSchema as Review,
} from '../src/capability/paperclip/index.js';

const issueId = 'f13dd515-1bad-4e0d-a697-7d19bfac6100';
const child = 'f13dd515-1bad-4e0d-a697-7d19bfac6101';
const other = 'f13dd515-1bad-4e0d-a697-7d19bfac6102';

describe('native review: blocked says what it waits for (P-04)', () => {
  it('accepts every input of the existing review unchanged', () => {
    for (const input of [{ issueId, status: 'done' }, { issueId, status: 'in_review', comment: 'Fatto' },
      { issueId, status: 'blocked' }]) {
      expect(Review.parse(input)).toEqual(input);
      expect(NativeReview.parse(input)).toEqual(input);
    }
  });
  it('accepts blocked with the tasks it waits for or with the action the agent owns', () => {
    const blockers = { issueId, status: 'blocked', blockedByIssueIds: [child, other] };
    expect(NativeReview.parse(blockers)).toEqual(blockers);
    const external = { issueId, status: 'blocked', waitingFor: { action: 'Il referente manda gli accessi' }, comment: 'In attesa' };
    expect(NativeReview.parse(external)).toEqual(external);
  });
  it('refuses a wait reason without blocked', () => {
    for (const status of ['done', 'in_review']) {
      expect(NativeReview.safeParse({ issueId, status, blockedByIssueIds: [child] }).success).toBe(false);
      expect(NativeReview.safeParse({ issueId, status, waitingFor: { action: 'x' } }).success).toBe(false);
    }
  });
  it('refuses duplicate, empty, too many, malformed or self blockers', () => {
    for (const blockedByIssueIds of [[child, child], [], Array.from({ length: 21 }, () => crypto.randomUUID()), ['SOC-1'], [issueId]]) {
      expect(NativeReview.safeParse({ issueId, status: 'blocked', blockedByIssueIds }).success).toBe(false);
    }
  });
  it('refuses blank, oversized or extra-keyed actions and unknown keys', () => {
    for (const waitingFor of [{ action: '  ' }, { action: 'x'.repeat(2001) }, { action: 'x', owner: 'board' }, {}]) {
      expect(NativeReview.safeParse({ issueId, status: 'blocked', waitingFor }).success).toBe(false);
    }
    expect(NativeReview.safeParse({ issueId, status: 'blocked', unblockDescriptor: {} }).success).toBe(false);
  });
  it('leaves the existing review strict', () => {
    expect(Review.safeParse({ issueId, status: 'blocked', blockedByIssueIds: [child] }).success).toBe(false);
  });
});

describe('native create: delegate and declare the wait in one call (P-03, P-04)', () => {
  const base = { title: 'Verifica le lacune', assigneeRoleRef: 'rd-lab', parentIssueId: issueId };
  it('accepts waitForChild with a parent and an assignee, and every existing create input', () => {
    expect(NativeCreate.parse({ ...base, waitForChild: true })).toEqual({ ...base, waitForChild: true });
    expect(NativeCreate.parse(base)).toEqual(Create.parse(base));
    expect(NativeCreate.parse({ title: 'Solo titolo' })).toEqual({ title: 'Solo titolo' });
  });
  it('refuses waitForChild without parent or without assignee', () => {
    const { parentIssueId: _p, ...noParent } = base;
    const { assigneeRoleRef: _a, ...noAssignee } = base;
    expect(NativeCreate.safeParse({ ...noParent, waitForChild: true }).success).toBe(false);
    expect(NativeCreate.safeParse({ ...noAssignee, waitForChild: true }).success).toBe(false);
    expect(NativeCreate.safeParse({ ...noParent, waitForChild: false }).success).toBe(true);
  });
  it('leaves the existing create strict', () => {
    expect(Create.safeParse({ ...base, waitForChild: true }).success).toBe(false);
  });
});

describe('check later: a one-shot Paperclip monitor (P-15)', () => {
  it('accepts a bounded delay and Paperclip-sized notes', () => {
    const input = { issueId, afterSeconds: 120, notes: 'Controllo lo stato della ricerca', serviceName: 'cap-ricerca' };
    expect(CheckLater.parse(input)).toEqual(input);
  });
  it('refuses delays outside 30..3600 s, oversized notes or service names, extra keys', () => {
    for (const afterSeconds of [29, 3601, 1.5]) {
      expect(CheckLater.safeParse({ issueId, afterSeconds, notes: 'x' }).success).toBe(false);
    }
    expect(CheckLater.safeParse({ issueId, afterSeconds: 60, notes: 'x'.repeat(501) }).success).toBe(false);
    expect(CheckLater.safeParse({ issueId, afterSeconds: 60, notes: 'x', serviceName: 'y'.repeat(121) }).success).toBe(false);
    expect(CheckLater.safeParse({ issueId, afterSeconds: 60, notes: 'x', externalRef: 'secret' }).success).toBe(false);
  });
  it('returns the task and the scheduled check', () => {
    const issue = { id: issueId, companyId: issueId, identifier: 'SOC-1', title: 'Ricerca', description: null,
      status: 'in_progress', assigneeAgentId: child };
    expect(CheckLaterOutput.parse({ issue, nextCheckAt: '2026-10-30T18:00:00.000Z' })).toEqual({ issue, nextCheckAt: '2026-10-30T18:00:00.000Z' });
  });
  it('keeps the tool name out of the existing tool list', () => {
    expect(Object.values(PAPERCLIP_TOOLS)).not.toContain(PAPERCLIP_NATIVE_WAIT_TOOLS.checkLater);
    expect(PAPERCLIP_NATIVE_WAIT_TOOLS.checkLater).toMatch(/^paperclip_[a-z_]+$/);
  });
  it('produces JSON schemas for a manifest', () => {
    for (const schema of [NativeReview, NativeCreate, CheckLater]) {
      expect(z.toJSONSchema(schema)).toMatchObject({ type: 'object' });
    }
  });
});
