import { expect, it } from 'vitest';
import { z } from 'zod';
import {
  PAPERCLIP_ISSUE_IDENTIFIER_PATTERN, PaperclipIssueIdentifierSchema, PaperclipIssueRefSchema,
  paperclipIssueRefKind, PaperclipIssueInputSchema, PaperclipTakeInputSchema,
  PaperclipCommentsInputSchema, PaperclipIssueRefInputSchema, PaperclipTakeRefInputSchema,
  PaperclipAssignRefInputSchema, PaperclipCommentsRefInputSchema, PaperclipReviewRefInputSchema,
} from '../src/capability/paperclip/index.js';

const uuid = 'f13dd515-1bad-4e0d-a697-7d19bfac6100';

it('s6341 identificativi: a Paperclip issue reference is a uuid or an identifier such as GOO-104, the reference input schemas accept both while the existing uuid-only input schemas are unchanged', () => {
  for (const issueId of ['GOO-104', uuid]) {
    expect(PaperclipCommentsRefInputSchema.parse({ issueId })).toEqual({ issueId });
  }
  expect(paperclipIssueRefKind('GOO-104')).toBe('identifier');
  expect(paperclipIssueRefKind(uuid)).toBe('uuid');
  expect(PaperclipCommentsInputSchema.safeParse({ issueId: 'GOO-104' }).success).toBe(false);
  expect(PaperclipIssueInputSchema.safeParse({ issueId: 'GOO-104' }).success).toBe(false);
  const savedInput = { issueId: uuid, expectedStatuses: ['todo'] };
  expect(PaperclipTakeInputSchema.parse(savedInput)).toEqual(savedInput);
  expect(PaperclipTakeRefInputSchema.parse(savedInput)).toEqual(savedInput);
});

it('accepts issue identifiers including the exact prefix and number limits', () => {
  for (const ref of ['X-1', 'GOOA-12', 'PAP-99', `${'A'.repeat(16)}-123456789`]) {
    expect(PAPERCLIP_ISSUE_IDENTIFIER_PATTERN.test(ref)).toBe(true);
    expect(PaperclipIssueIdentifierSchema.parse(ref)).toBe(ref);
    expect(PaperclipIssueRefSchema.parse(ref)).toBe(ref);
    expect(paperclipIssueRefKind(ref)).toBe('identifier');
  }
});

it('rejects malformed issue references without trimming or accepting case identifiers', () => {
  for (const ref of ['goo-104', 'GOO104', 'GOO-', '-104', 'GOO-C12', 'GOO-104 ',
    `${'A'.repeat(17)}-1`, 'GOO-1234567890', '', '1GO-104', 'GOO-104\n', 'invalid-uuid']) {
    expect(PaperclipIssueIdentifierSchema.safeParse(ref).success, ref).toBe(false);
    expect(PaperclipIssueRefSchema.safeParse(ref).success, ref).toBe(false);
    expect(() => paperclipIssueRefKind(ref), ref).toThrow();
  }
});

it('preserves every reference input field and rejects extra keys for both reference kinds', () => {
  for (const issueId of ['GOO-104', uuid]) {
    const cases = [
      { schema: PaperclipIssueRefInputSchema, input: { issueId } },
      { schema: PaperclipTakeRefInputSchema, input: { issueId, expectedStatuses: ['todo'] } },
      { schema: PaperclipAssignRefInputSchema, input: { issueId, roleRef: 'rd-lab', comment: 'Please resume the delivery.' } },
      { schema: PaperclipCommentsRefInputSchema, input: { issueId, limit: 50 } },
      { schema: PaperclipReviewRefInputSchema, input: { issueId, status: 'in_review', comment: 'Ready for review.' } },
    ];
    for (const { schema, input } of cases) {
      expect(schema.parse(input)).toEqual(input);
      expect(schema.safeParse({ ...input, extra: true }).success).toBe(false);
    }
  }
});

it('retains validation of non-reference fields in the derived inputs', () => {
  for (const expectedStatuses of [[], ['todo', 'todo'], ['unknown']]) {
    expect(PaperclipTakeRefInputSchema.safeParse({ issueId: 'GOO-104', expectedStatuses }).success).toBe(false);
  }
  for (const patch of [{ roleRef: '' }, { comment: ' ' }, { comment: 'x'.repeat(4001) }]) {
    expect(PaperclipAssignRefInputSchema.safeParse({ issueId: 'GOO-104', roleRef: 'rd-lab', ...patch }).success).toBe(false);
  }
  for (const limit of [0, 51, 1.5]) {
    expect(PaperclipCommentsRefInputSchema.safeParse({ issueId: 'GOO-104', limit }).success).toBe(false);
  }
  expect(PaperclipReviewRefInputSchema.safeParse({ issueId: 'GOO-104', status: 'todo' }).success).toBe(false);
  expect(PaperclipReviewRefInputSchema.safeParse({ issueId: 'GOO-104', status: 'done', comment: ' ' }).success).toBe(false);
});

it('renders the reference input as JSON Schema for tool manifests', () => {
  expect(() => z.toJSONSchema(PaperclipCommentsRefInputSchema)).not.toThrow();
  expect(z.toJSONSchema(PaperclipCommentsRefInputSchema)).toMatchObject({
    type: 'object', additionalProperties: false, required: ['issueId'],
  });
});
