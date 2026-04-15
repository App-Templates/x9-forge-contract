import { describe, it, expect } from 'vitest';
import { parseSseFrame, parseSseStream } from '../../src/http/sse-parser.js';
import type { ParsedSseEvent } from '../../src/http/sse-parser.js';

/**
 * Helper: build a ReadableStream<Uint8Array> from a plain string for testing
 * parseSseStream() without spinning up an HTTP server.
 */
function stringToStream(text: string): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
}

async function collect(stream: ReadableStream<Uint8Array>): Promise<ParsedSseEvent[]> {
  const events: ParsedSseEvent[] = [];
  for await (const ev of parseSseStream(stream)) {
    events.push(ev);
  }
  return events;
}

describe('parseSseFrame (pure function)', () => {
  it('parses a text frame with `data: ` prefix (space)', () => {
    const result = parseSseFrame('data: {"type":"text","delta":"Hello "}');
    expect(result.kind).toBe('frame');
    if (result.kind === 'frame' && result.frame.type === 'text') {
      expect(result.frame.delta).toBe('Hello ');
    }
  });

  it('parses a data: frame with no space after colon (SSE spec-valid)', () => {
    const result = parseSseFrame('data:{"type":"done","reply":"Hi","updatedHistory":[]}');
    expect(result.kind).toBe('frame');
    if (result.kind === 'frame' && result.frame.type === 'done') {
      expect(result.frame.reply).toBe('Hi');
    }
  });

  it('returns heartbeat for an SSE comment line', () => {
    const result = parseSseFrame(': heartbeat');
    expect(result.kind).toBe('heartbeat');
  });

  it('returns heartbeat for an empty frame (no data lines)', () => {
    const result = parseSseFrame('');
    expect(result.kind).toBe('heartbeat');
  });

  it('WR-04: returns heartbeat for event:-only frame (dataless but non-empty)', () => {
    // An `event: ping` frame with no `data:` lines is spec-valid SSE
    // (see: https://html.spec.whatwg.org/multipage/server-sent-events.html).
    // Pre-fix, a non-data line set isHeartbeatOnly=false and frames were not
    // classified as heartbeat; post-fix, dataLines.length===0 short-circuits
    // to heartbeat regardless of event:/id:/retry: presence.
    const result = parseSseFrame('event: ping');
    expect(result.kind).toBe('heartbeat');
  });

  it('WR-04: returns heartbeat for id:-only frame (dataless but non-empty)', () => {
    const result = parseSseFrame('id: 42');
    expect(result.kind).toBe('heartbeat');
  });

  it('WR-04: returns heartbeat for retry:-only frame (dataless but non-empty)', () => {
    const result = parseSseFrame('retry: 5000');
    expect(result.kind).toBe('heartbeat');
  });

  it('returns parse_error for invalid JSON in data line', () => {
    const result = parseSseFrame('data: not-valid-json');
    expect(result.kind).toBe('parse_error');
    if (result.kind === 'parse_error') {
      expect(result.error).toMatch(/Invalid JSON/);
    }
  });

  it('returns parse_error for unknown frame type (fails Zod discriminated union)', () => {
    const result = parseSseFrame('data: {"type":"unknown_thing"}');
    expect(result.kind).toBe('parse_error');
    if (result.kind === 'parse_error') {
      expect(result.error).toMatch(/Schema validation/);
    }
  });

  it('joins multiple data: lines into a single JSON payload', () => {
    const raw = 'data: {"type":\ndata: "text","delta":"x"}';
    const result = parseSseFrame(raw);
    expect(result.kind).toBe('frame');
    if (result.kind === 'frame' && result.frame.type === 'text') {
      expect(result.frame.delta).toBe('x');
    }
  });
});

describe('parseSseStream (async generator)', () => {
  it('yields frames + heartbeat in order for a multi-frame SSE stream', async () => {
    const sse =
      'data: {"type":"text","delta":"Hello "}\n\n' +
      ': heartbeat\n\n' +
      'data: {"type":"text","delta":"world"}\n\n' +
      'data: {"type":"done","reply":"Hello world","updatedHistory":[]}\n\n';

    const events = await collect(stringToStream(sse));

    expect(events).toHaveLength(4);
    expect(events[0]?.kind).toBe('frame');
    expect(events[1]?.kind).toBe('heartbeat');
    expect(events[2]?.kind).toBe('frame');
    expect(events[3]?.kind).toBe('frame');

    const e0 = events[0];
    if (e0 && e0.kind === 'frame' && e0.frame.type === 'text') {
      expect(e0.frame.delta).toBe('Hello ');
    }
    const e3 = events[3];
    if (e3 && e3.kind === 'frame' && e3.frame.type === 'done') {
      expect(e3.frame.reply).toBe('Hello world');
    }
  });

  it('yields no events for an empty stream', async () => {
    const events = await collect(stringToStream(''));
    expect(events).toHaveLength(0);
  });

  it('yields only heartbeat events for a heartbeat-only stream', async () => {
    const sse = ': heartbeat\n\n: heartbeat\n\n: heartbeat\n\n';
    const events = await collect(stringToStream(sse));
    expect(events).toHaveLength(3);
    for (const e of events) {
      expect(e.kind).toBe('heartbeat');
    }
  });

  it('yields parse_error for malformed frame and continues parsing subsequent frames', async () => {
    const sse =
      'data: not-valid-json\n\n' +
      'data: {"type":"text","delta":"after-error"}\n\n';

    const events = await collect(stringToStream(sse));
    expect(events).toHaveLength(2);
    expect(events[0]?.kind).toBe('parse_error');
    expect(events[1]?.kind).toBe('frame');
    const e1 = events[1];
    if (e1 && e1.kind === 'frame' && e1.frame.type === 'text') {
      expect(e1.frame.delta).toBe('after-error');
    }
  });

  it('handles a trailing frame without \\n\\n terminator', async () => {
    const sse = 'data: {"type":"text","delta":"tail"}';
    const events = await collect(stringToStream(sse));
    expect(events).toHaveLength(1);
    expect(events[0]?.kind).toBe('frame');
  });

  it('WR-05: normalizes CRLF frame boundaries (proxy-rewritten streams)', async () => {
    // Some HTTP proxies rewrite \n to \r\n on text/event-stream. The SSE spec
    // accepts \r\n\r\n (and \r\r) as frame delimiters equivalently to \n\n.
    // Pre-fix, parseSseStream only looked for \n\n so CRLF streams were buffered
    // as a single never-terminating frame. Post-fix, the reader normalizes
    // \r\n and \r to \n before the boundary scan.
    const sse =
      'data: {"type":"text","delta":"a"}\r\n\r\n' +
      'data: {"type":"text","delta":"b"}\r\n\r\n';

    const events = await collect(stringToStream(sse));
    expect(events).toHaveLength(2);
    expect(events[0]?.kind).toBe('frame');
    expect(events[1]?.kind).toBe('frame');
    if (events[0]?.kind === 'frame' && events[0].frame.type === 'text') {
      expect(events[0].frame.delta).toBe('a');
    }
    if (events[1]?.kind === 'frame' && events[1].frame.type === 'text') {
      expect(events[1].frame.delta).toBe('b');
    }
  });

  it('WR-05: normalizes lone CR frame boundaries', async () => {
    // SSE spec also accepts \r\r (lone CR) as frame delimiter — rare but legal.
    const sse =
      'data: {"type":"text","delta":"x"}\r\r' +
      'data: {"type":"text","delta":"y"}\r\r';

    const events = await collect(stringToStream(sse));
    expect(events).toHaveLength(2);
    expect(events[0]?.kind).toBe('frame');
    expect(events[1]?.kind).toBe('frame');
  });
});
