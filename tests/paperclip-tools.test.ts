import { it, expect } from 'vitest';
import { PaperclipQueueInputSchema as Queue, PaperclipIssueInputSchema as Issue,
  PaperclipTakeInputSchema as Take, PaperclipAssignInputSchema as Assign,
  PaperclipIssueViewSchema as View, PaperclipAgentBindingSchema as Binding,
} from '../src/capability/paperclip/index.js';
const id = 'f13dd515-1bad-4e0d-a697-7d19bfac6100';
it('validates native operations without accepting caller-chosen identity', () => {
  for (const [schema, value] of [[Queue, { statuses: ['todo'], limit: 10 }], [Issue, { issueId: id }],
    [Take, { issueId: id, expectedStatuses: ['todo'] }], [Assign, { issueId: id, roleRef: 'reviewer' }]] as const) {
    expect(schema.safeParse(value).success).toBe(true);
    expect(schema.safeParse({ ...value, agentId: id }).success).toBe(false);
  }
});
it.each([0, 101, 1.5])('refuses invalid limit %s', limit => expect(Queue.safeParse({ limit }).success).toBe(false));
it.each([[], ['todo', 'todo'], ['invented']].map(expectedStatuses => ({ expectedStatuses })))('refuses ambiguous or empty status gates $expectedStatuses', ({ expectedStatuses }) => {
  expect(Take.safeParse({ issueId: id, expectedStatuses }).success).toBe(false);
});
it('requires a native issue ID and explicit role', () => {
  expect(Issue.safeParse({ issueId: '../other' }).success).toBe(false);
  expect(Assign.safeParse({ issueId: id, roleRef: ' ' }).success).toBe(false);
});
it('validates a complete queue item and operator binding', () => {
  expect(View.safeParse({ id, companyId: id, identifier: 'TASK-1', title: 'Review material', description: null,
    status: 'todo', assigneeAgentId: null }).success).toBe(true);
  expect(Binding.safeParse({ scope: { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' },
    unitId: 'unit-1', companyId: id, paperclipAgentId: id, enabled: true, roleAgents: { reviewer: id } }).success).toBe(true);
  expect(Binding.safeParse({ scope: { agentId: 'agent-1' }, unitId: 'unit-1', companyId: id,
    paperclipAgentId: id, enabled: true, roleAgents: {} }).success).toBe(false);
});
