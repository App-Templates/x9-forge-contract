import { it, expect } from 'vitest';
import { PaperclipQueueInputSchema as Queue, PaperclipIssueInputSchema as Issue,
  PaperclipTakeInputSchema as Take, PaperclipAssignInputSchema as Assign,
  PaperclipIssueViewSchema as View, PaperclipAgentBindingSchema as Binding,
  PAPERCLIP_TOOLS, PaperclipCreateIssueInputSchema as Create,
  PaperclipCommentsInputSchema as Comments, PaperclipCommentViewSchema as Comment,
  PaperclipCommentsOutputSchema as CommentsOutput, PaperclipReviewInputSchema as Review,
  PaperclipCreateBusinessUnitInputSchema as CreateBu, PaperclipCreateBusinessUnitOutputSchema as CreateBuOutput,
} from '../src/capability/paperclip/index.js';
const id = 'f13dd515-1bad-4e0d-a697-7d19bfac6100';
it('validates native operations without accepting caller-chosen identity', () => {
  for (const [schema, value] of [[Queue, { statuses: ['todo'], limit: 10 }], [Issue, { issueId: id }],
    [Take, { issueId: id, expectedStatuses: ['todo'] }], [Assign, { issueId: id, roleRef: 'reviewer' }]] as const) {
    expect(schema.safeParse(value).success).toBe(true);
    expect(schema.safeParse({ ...value, agentId: id }).success).toBe(false);
  }
});
it('validates delegation inputs and rejects caller identity and invalid comment limits', () => {
  expect(PAPERCLIP_TOOLS.createIssue).toBe('paperclip_create_issue');
  expect(PAPERCLIP_TOOLS.comments).toBe('paperclip_comments');
  expect(PAPERCLIP_TOOLS.review).toBe('paperclip_review');
  for (const [schema, value] of [
    [Create, { title: 'Prepare the data delivery', description: 'Deliver the verified dataset',
      assigneeRoleRef: 'data-head', parentIssueId: id, blockedByIssueIds: [id] }],
    [Comments, { issueId: id, limit: 50 }],
    [Review, { issueId: id, status: 'in_review', comment: 'Dataset ready for review' }],
  ] as const) {
    expect(schema.parse(value)).toEqual(value);
    for (const field of ['agentId', 'companyId']) {
      expect(schema.safeParse({ ...value, [field]: id }).success).toBe(false);
    }
  }
  for (const limit of [0, 51, 1.5]) {
    expect(Comments.safeParse({ issueId: id, limit }).success).toBe(false);
  }
});
it('accepts minimal delegation inputs and all review statuses', () => {
  expect(Create.parse({ title: 'Prepare the data delivery' })).toEqual({ title: 'Prepare the data delivery' });
  expect(Create.safeParse({ title: 'Task', description: '', blockedByIssueIds: [] }).success).toBe(true);
  expect(Comments.parse({ issueId: id })).toEqual({ issueId: id });
  expect(Comments.safeParse({ issueId: id, limit: 1 }).success).toBe(true);
  for (const status of ['in_review', 'done', 'blocked']) {
    expect(Review.parse({ issueId: id, status })).toEqual({ issueId: id, status });
  }
});
it.each([
  { title: '' }, { title: ' ' }, { title: 'x'.repeat(4097) },
  { title: 'Task', description: 'x'.repeat(16385) },
  { title: 'Task', assigneeRoleRef: ' ' }, { title: 'Task', assigneeRoleRef: 'x'.repeat(4097) },
  { title: 'Task', parentIssueId: 'invalid' },
  { title: 'Task', blockedByIssueIds: ['invalid'] },
  { title: 'Task', blockedByIssueIds: [id, id] },
])('rejects invalid issue creation %j', input => {
  expect(Create.safeParse(input).success).toBe(false);
});
it('bounds dependency count independently of uniqueness', () => {
  const blockedByIssueIds = Array.from({ length: 21 }, (_, index) =>
    `f13dd515-1bad-4e0d-a697-${index.toString(16).padStart(12, '0')}`);
  expect(Create.safeParse({ title: 'Task', blockedByIssueIds: blockedByIssueIds.slice(0, 20) }).success).toBe(true);
  expect(Create.safeParse({ title: 'Task', blockedByIssueIds }).success).toBe(false);
  expect(Create.safeParse({ title: 'x'.repeat(4096), description: 'x'.repeat(16384),
    assigneeRoleRef: 'x'.repeat(4096) }).success).toBe(true);
});
it('rejects invalid review status, issue IDs and blank review comments', () => {
  expect(Review.safeParse({ issueId: id, status: 'todo' }).success).toBe(false);
  expect(Review.safeParse({ issueId: id, status: 'done', comment: ' ' }).success).toBe(false);
  expect(Review.safeParse({ issueId: id, status: 'done', comment: 'x'.repeat(4097) }).success).toBe(false);
  expect(Review.safeParse({ issueId: id, status: 'done', comment: 'x'.repeat(4096) }).success).toBe(true);
  expect(Review.safeParse({ issueId: 'invalid', status: 'done' }).success).toBe(false);
  expect(Comments.safeParse({ issueId: 'invalid' }).success).toBe(false);
});
it('validates complete comment views and bounded comment output', () => {
  const comment = { id, issueId: id, authorAgentId: id, body: 'Dataset delivered',
    createdAt: '2026-10-18T18:00:00+02:00' };
  expect(Comment.parse(comment)).toEqual(comment);
  expect(Comment.safeParse({ ...comment, authorAgentId: null, body: '', createdAt: '2026-10-18T16:00:00Z' }).success).toBe(true);
  expect(Comment.safeParse({ ...comment, body: 'x'.repeat(16384) }).success).toBe(true);
  for (const invalid of [
    { id: 'invalid' }, { issueId: 'invalid' }, { authorAgentId: 'invalid' },
    { body: 'x'.repeat(16385) }, { createdAt: '2026-10-18T18:00:00' },
    { createdAt: '2026-02-30T18:00:00Z' }, { extra: true },
  ]) {
    expect(Comment.safeParse({ ...comment, ...invalid }).success).toBe(false);
  }
  const { authorAgentId: _authorAgentId, ...missingAuthor } = comment;
  expect(Comment.safeParse(missingAuthor).success).toBe(false);
  expect(CommentsOutput.parse({ comments: [] })).toEqual({ comments: [] });
  expect(CommentsOutput.safeParse({ comments: Array.from({ length: 50 }, () => comment) }).success).toBe(true);
  expect(CommentsOutput.safeParse({ comments: Array.from({ length: 51 }, () => comment) }).success).toBe(false);
  expect(CommentsOutput.safeParse({ comments: [{ ...comment, body: 123 }] }).success).toBe(false);
  expect(CommentsOutput.safeParse({ comments: [], extra: true }).success).toBe(false);
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
const buInput = () => ({
  requestId: 'birth-bu-research-1', tenantId: 'tenant-1', ownerId: 'owner-1',
  company: { companyId: 'company-1', name: 'Company One' },
  businessUnit: { slug: 'research', name: 'Research', briefSection: 'Research the market.' },
  profileTemplate: 'capo-bu', model: { tier: 'standard', llmModel: 'provider/model' },
  capabilities: ['cap-ricerca'], paperclipParticipant: { participantId: 'participant-1', roles: ['lead'] },
  unitName: 'Research unit',
});
const buOutput = () => ({
  unitId: 'unit-1', paperclipAgentId: id, replayed: false,
  agentIdentity: { managementAgentId: 'company-1-research', runtimeAgentId: 'runtime-research-1', vaultAgentId: 17 },
});
it('names the create-business-unit tool uniquely', () => {
  expect(PAPERCLIP_TOOLS.createBusinessUnit).toBe('paperclip_create_business_unit');
  const names = Object.values(PAPERCLIP_TOOLS);
  expect(new Set(names).size).toBe(names.length);
});
it('validates create-business-unit input and rejects extra fields and blank unitName', () => {
  expect(CreateBu.safeParse(buInput()).success).toBe(true);
  expect(CreateBu.safeParse({ ...buInput(), extra: true }).success).toBe(false);
  expect(CreateBu.safeParse({ ...buInput(), unitName: '' }).success).toBe(false);
  expect(CreateBu.safeParse({ ...buInput(), unitName: ' ' }).success).toBe(false);
  const { unitName: _unitName, ...missing } = buInput();
  expect(CreateBu.safeParse(missing).success).toBe(false);
});
it('validates create-business-unit output and requires the full agent identity', () => {
  expect(CreateBuOutput.safeParse(buOutput()).success).toBe(true);
  const { agentIdentity: _agentIdentity, ...missing } = buOutput();
  expect(CreateBuOutput.safeParse(missing).success).toBe(false);
  expect(CreateBuOutput.safeParse({ ...buOutput(), extra: true }).success).toBe(false);
  expect(CreateBuOutput.safeParse({ ...buOutput(), paperclipAgentId: 'invalid' }).success).toBe(false);
  expect(CreateBuOutput.safeParse({ ...buOutput(), replayed: 'no' }).success).toBe(false);
});
