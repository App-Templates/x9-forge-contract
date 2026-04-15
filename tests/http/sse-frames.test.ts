import { describe, it, expect } from 'vitest';
import {
  SseTextFrameSchema,
  SseToolCallStartFrameSchema,
  SseToolCallEndFrameSchema,
  SseDoneFrameSchema,
  SseErrorFrameSchema,
  SseAbortedFrameSchema,
  SseFrameSchema,
} from '../../src/http/sse-frames.js';

// Fixtures derived from agent-core turn-processor.ts TurnChunk (lines 41-46)
// and agent-core index.ts writeEvent shapes (lines 476-500).

describe('SseTextFrameSchema', () => {
  it('parses a text delta frame', () => {
    const result = SseTextFrameSchema.safeParse({ type: 'text', delta: 'Hello ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ type: 'text', delta: 'Hello ' });
    }
  });

  it('accepts an empty delta (model may emit zero-length chunks)', () => {
    const result = SseTextFrameSchema.safeParse({ type: 'text', delta: '' });
    expect(result.success).toBe(true);
  });

  it('rejects when delta is missing', () => {
    const result = SseTextFrameSchema.safeParse({ type: 'text' });
    expect(result.success).toBe(false);
  });
});

describe('SseToolCallStartFrameSchema', () => {
  it('parses a tool_call_start frame', () => {
    const frame = { type: 'tool_call_start', name: 'calendar_today', callId: 'call-123' };
    const result = SseToolCallStartFrameSchema.safeParse(frame);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual(frame);
  });

  it('rejects empty name', () => {
    const result = SseToolCallStartFrameSchema.safeParse({
      type: 'tool_call_start',
      name: '',
      callId: 'call-123',
    });
    expect(result.success).toBe(false);
  });
});

describe('SseToolCallEndFrameSchema', () => {
  it('parses a tool_call_end frame with ok:true', () => {
    const frame = {
      type: 'tool_call_end',
      name: 'calendar_today',
      callId: 'call-123',
      ok: true,
    };
    const result = SseToolCallEndFrameSchema.safeParse(frame);
    expect(result.success).toBe(true);
  });

  it('parses a tool_call_end frame with ok:false (tool failure)', () => {
    const frame = {
      type: 'tool_call_end',
      name: 'calendar_today',
      callId: 'call-123',
      ok: false,
    };
    const result = SseToolCallEndFrameSchema.safeParse(frame);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.ok).toBe(false);
  });
});

describe('SseDoneFrameSchema', () => {
  it('parses a done frame with final reply + updatedHistory', () => {
    const frame = {
      type: 'done',
      reply: 'You have 3 meetings.',
      updatedHistory: [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'You have 3 meetings.' },
      ],
    };
    const result = SseDoneFrameSchema.safeParse(frame);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.reply).toBe('You have 3 meetings.');
      expect(result.data.updatedHistory).toHaveLength(2);
    }
  });

  it('rejects when updatedHistory is missing', () => {
    const result = SseDoneFrameSchema.safeParse({ type: 'done', reply: 'Hi' });
    expect(result.success).toBe(false);
  });

  it('accepts an LLMMessage with toolCalls array inside updatedHistory', () => {
    const frame = {
      type: 'done',
      reply: 'Done',
      updatedHistory: [
        {
          role: 'assistant',
          content: '',
          toolCalls: [
            { id: 'call-1', name: 'calendar_today', input: { date: '2026-04-15' } },
          ],
        },
      ],
    };
    const result = SseDoneFrameSchema.safeParse(frame);
    expect(result.success).toBe(true);
  });
});

describe('SseErrorFrameSchema', () => {
  it('parses an error frame with message', () => {
    const result = SseErrorFrameSchema.safeParse({
      type: 'error',
      message: 'Internal server error',
    });
    expect(result.success).toBe(true);
  });
});

describe('SseAbortedFrameSchema', () => {
  it('parses an aborted frame with reason: client-disconnect', () => {
    const result = SseAbortedFrameSchema.safeParse({
      type: 'aborted',
      reason: 'client-disconnect',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.reason).toBe('client-disconnect');
  });

  it('parses an aborted frame with reason omitted (optional)', () => {
    const result = SseAbortedFrameSchema.safeParse({ type: 'aborted' });
    expect(result.success).toBe(true);
  });
});

describe('SseFrameSchema (discriminated union)', () => {
  it('accepts every frame type through the union', () => {
    const fixtures: unknown[] = [
      { type: 'text', delta: 'hello' },
      { type: 'tool_call_start', name: 'x', callId: 'c1' },
      { type: 'tool_call_end', name: 'x', callId: 'c1', ok: true },
      { type: 'done', reply: 'r', updatedHistory: [] },
      { type: 'error', message: 'boom' },
      { type: 'aborted', reason: 'client-disconnect' },
    ];

    for (const fixture of fixtures) {
      const result = SseFrameSchema.safeParse(fixture);
      expect(result.success).toBe(true);
    }
  });

  it('rejects an unknown frame type not in the union', () => {
    const result = SseFrameSchema.safeParse({ type: 'unknown_type', foo: 'bar' });
    expect(result.success).toBe(false);
  });

  it('rejects a frame missing the type discriminator', () => {
    const result = SseFrameSchema.safeParse({ delta: 'hello' });
    expect(result.success).toBe(false);
  });
});
