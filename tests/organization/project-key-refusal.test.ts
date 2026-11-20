import { describe, expect, it } from 'vitest';
import { ToolErrorModelReasonSchema } from '../../src/capability/index.js';
import * as organization from '../../src/organization/index.js';
import {
  PAPERCLIP_PROJECT_ID_REFUSAL,
  PAPERCLIP_PROJECT_ID_REFUSAL_REASON,
  isPaperclipProjectId,
} from '../../src/organization/asset.js';

const uuid = '38a950d2-4587-4378-bb98-0d9250000000';

describe('s6955 chiave-progetto', () => {
  it('is true for a UUID in either case', () => {
    expect(isPaperclipProjectId(uuid)).toBe(true);
    expect(isPaperclipProjectId(uuid.toUpperCase())).toBe(true);
  });

  it('is false for project keys, other strings and non-strings', () => {
    for (const value of [
      'scelta-giusta',
      'p1',
      'good-choice',
      'a-b-c-d-e-f-g-h-i-j-k',
      'zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz',
      '',
      undefined,
      123,
      null,
    ]) {
      expect(isPaperclipProjectId(value)).toBe(false);
    }
    expect('a-b-c-d-e-f-g-h-i-j-k'.length).toBe(21);
    expect('zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz'.length).toBe(36);
  });

  it('has a fixed refusal reason that starts with the code and never carries a UUID', () => {
    expect(PAPERCLIP_PROJECT_ID_REFUSAL).toBe('project_id_paperclip');
    expect(PAPERCLIP_PROJECT_ID_REFUSAL_REASON.startsWith(PAPERCLIP_PROJECT_ID_REFUSAL)).toBe(true);
    expect(ToolErrorModelReasonSchema.safeParse(PAPERCLIP_PROJECT_ID_REFUSAL_REASON).success).toBe(true);
    expect(isPaperclipProjectId(uuid)).toBe(true);
    expect(PAPERCLIP_PROJECT_ID_REFUSAL_REASON).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    );
    expect(PAPERCLIP_PROJECT_ID_REFUSAL_REASON).not.toContain(uuid);
  });

  it('is exported from organization/index', () => {
    expect(organization.PAPERCLIP_PROJECT_ID_REFUSAL).toBe(PAPERCLIP_PROJECT_ID_REFUSAL);
    expect(organization.PAPERCLIP_PROJECT_ID_REFUSAL_REASON).toBe(PAPERCLIP_PROJECT_ID_REFUSAL_REASON);
    expect(organization.isPaperclipProjectId).toBe(isPaperclipProjectId);
  });
});
