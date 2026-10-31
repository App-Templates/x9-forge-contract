import { describe, expect, it } from 'vitest';
import {
  TOOL_ERROR_MODEL_REASON_MAX_CHARS,
  ToolErrorModelReasonSchema,
  ToolCallResponseSchema,
  toolErrorModelReasonOf,
  type ToolErrorModelReason,
} from '../../src/capability/index.js';

const modelReason: ToolErrorModelReason = 'blocked_requires_wait_reason: pass blockedByIssueIds (the tasks) or waitingFor.action';
const errorBody = {
  callId: 'call-model-reason',
  status: 'error',
  error: 'Internal failure details',
  code: 'TOOL_EXEC_FAILED',
};

describe('ToolErrorModelReasonSchema', () => {
  it('accepts a service explanation and a bare code', () => {
    expect(ToolErrorModelReasonSchema.parse(modelReason)).toBe(modelReason);
    expect(ToolErrorModelReasonSchema.parse('native_issue_changed')).toBe('native_issue_changed');
  });

  it('accepts 400 characters and rejects 401 characters', () => {
    expect(TOOL_ERROR_MODEL_REASON_MAX_CHARS).toBe(400);
    const atLimit = 'reason: ' + 'a '.repeat(196);
    expect(atLimit.length).toBe(400);
    expect(ToolErrorModelReasonSchema.safeParse(atLimit).success).toBe(true);
    expect(ToolErrorModelReasonSchema.safeParse(atLimit + 'a').success).toBe(false);
  });

  it('rejects newlines and control characters', () => {
    for (const control of ['\n', '\r', '\t', '\u0000', '\u001f', '\u007f']) {
      expect(ToolErrorModelReasonSchema.safeParse(`reason: first${control}second`).success).toBe(false);
      expect(ToolErrorModelReasonSchema.safeParse(`reason: explanation${control}`).success).toBe(false);
    }
  });

  it('rejects addresses including an otherwise valid code', () => {
    for (const reason of ['x: see https://example.invalid', 'reason: see https://example.invalid']) {
      expect(ToolErrorModelReasonSchema.safeParse(reason).success).toBe(false);
    }
  });

  it('rejects bearer credentials regardless of case', () => {
    for (const reason of ['auth_failed: Bearer abc', 'auth_failed: bEaReR abc']) {
      expect(ToolErrorModelReasonSchema.safeParse(reason).success).toBe(false);
    }
  });

  it('rejects long secret-like sequences', () => {
    expect(ToolErrorModelReasonSchema.safeParse('leak: ' + 'A'.repeat(40)).success).toBe(false);
    expect(ToolErrorModelReasonSchema.safeParse('leak: ' + 'A'.repeat(32)).success).toBe(false);
    expect(ToolErrorModelReasonSchema.safeParse('leak: ' + 'a0+/='.repeat(7)).success).toBe(false);
    expect(ToolErrorModelReasonSchema.safeParse('leak: ' + 'A'.repeat(31)).success).toBe(true);
  });

  it('requires a code and the declared explanation format', () => {
    for (const reason of ['', 'Capability failed', 'ab', 'Upper_case', 'bad-code', 'reason:no space', 'reason: ', 'a_'.repeat(33)]) {
      expect(ToolErrorModelReasonSchema.safeParse(reason).success).toBe(false);
    }
  });
});

describe('ToolCallResponseSchema modelReason', () => {
  it('preserves a valid modelReason and accepts legacy errors', () => {
    expect(ToolCallResponseSchema.parse({ ...errorBody, modelReason })).toEqual({ ...errorBody, modelReason });
    expect(ToolCallResponseSchema.parse(errorBody)).toEqual(errorBody);
  });

  it('rejects errors with an invalid modelReason', () => {
    expect(() => ToolCallResponseSchema.parse({ ...errorBody, modelReason: 'Capability failed' })).toThrow();
  });
});

describe('toolErrorModelReasonOf', () => {
  it('returns only a validated reason on an error body', () => {
    expect(toolErrorModelReasonOf({ ...errorBody, modelReason })).toBe(modelReason);
    expect(toolErrorModelReasonOf({ status: 'error', modelReason })).toBe(modelReason);
    for (const body of [
      { callId: 'call-success', status: 'success', output: {}, modelReason },
      null,
      'error',
      { ...errorBody, modelReason: 'Capability failed' },
      { ...errorBody, modelReason: 'leak: ' + 'A'.repeat(40) },
      { ...errorBody, modelReason: 42 },
      errorBody,
      { ...errorBody, error: modelReason },
    ]) {
      expect(toolErrorModelReasonOf(body)).toBeUndefined();
    }
  });

  it('returns undefined when untrusted property access throws', () => {
    const body = {
      status: 'error',
      get modelReason(): string {
        throw new Error('Unreadable modelReason');
      },
    };
    expect(toolErrorModelReasonOf(body)).toBeUndefined();
  });
});
