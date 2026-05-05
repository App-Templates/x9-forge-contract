"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSseFrame = parseSseFrame;
exports.parseSseStream = parseSseStream;
const sse_frames_js_1 = require("./sse-frames.cjs");
/**
 * Parse a single raw SSE frame (text between \n\n delimiters) into a typed event.
 *
 * SSE protocol:
 * - Lines starting with `:` are comments (heartbeats). Return { kind: 'heartbeat' }.
 * - Lines starting with `data:` contain JSON payload. Multiple data: lines are joined.
 * - Other lines (event:, id:, retry:) are ignored.
 *
 * @param rawFrame - Raw text of one SSE frame (between \n\n boundaries)
 * @returns Parsed event with Zod-validated frame or heartbeat/error
 */
function parseSseFrame(rawFrame) {
    const lines = rawFrame.split('\n');
    const dataLines = [];
    for (const line of lines) {
        if (line.startsWith('data:')) {
            dataLines.push(line.slice(5).trimStart());
        }
        // Other line types (`:` comments, `event:`, `id:`, `retry:`, blank) are
        // ignored for payload purposes — the dataLines.length check below
        // decides frame vs heartbeat.
    }
    if (dataLines.length === 0) {
        // Dataless frames (only event:/id:/retry: or comments) are spec-valid; treat as heartbeat.
        return { kind: 'heartbeat' };
    }
    const jsonStr = dataLines.join('\n');
    let parsed;
    try {
        parsed = JSON.parse(jsonStr);
    }
    catch {
        return { kind: 'parse_error', raw: rawFrame, error: `Invalid JSON: ${jsonStr.slice(0, 100)}` };
    }
    const result = sse_frames_js_1.SseFrameSchema.safeParse(parsed);
    if (result.success) {
        return { kind: 'frame', frame: result.data };
    }
    return {
        kind: 'parse_error',
        raw: rawFrame,
        error: `Schema validation failed: ${result.error.message.slice(0, 200)}`,
    };
}
/**
 * Async generator that reads a ReadableStream<Uint8Array> (from fetch Response.body)
 * and yields typed SSE events. Handles buffering, frame splitting on \n\n,
 * heartbeat detection, and JSON parse + Zod validation.
 *
 * This replaces the manual buffer management in cap-glasses agent-bridge.ts.
 *
 * @param stream - The Response.body ReadableStream from a fetch() call to /internal/turn/stream
 * @yields ParsedSseEvent for each SSE frame
 *
 * @example
 * ```typescript
 * const res = await fetch(url, init);
 * for await (const event of parseSseStream(res.body!)) {
 *   if (event.kind === 'frame') {
 *     switch (event.frame.type) {
 *       case 'text': process.stdout.write(event.frame.delta); break;
 *       case 'done': console.log('Done:', event.frame.reply); break;
 *       case 'error': console.error('Error:', event.frame.message); break;
 *     }
 *   }
 * }
 * ```
 */
async function* parseSseStream(stream) {
    const reader = stream.getReader();
    const decoder = new TextDecoder('utf-8');
    const MAX_FRAME_BYTES = 1 << 20; // 1 MB cap to prevent unbounded buffer growth
    let buffer = '';
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            // Normalize CRLF / CR to LF so frame-boundary scan works for proxies that rewrite line endings (SSE spec accepts \r\n\r\n and \r\r).
            buffer += decoder.decode(value, { stream: true }).replace(/\r\n|\r/g, '\n');
            if (buffer.length > MAX_FRAME_BYTES) {
                throw new Error(`SSE frame exceeded ${MAX_FRAME_BYTES} bytes without terminator`);
            }
            let frameEnd;
            while ((frameEnd = buffer.indexOf('\n\n')) !== -1) {
                const rawFrame = buffer.slice(0, frameEnd);
                buffer = buffer.slice(frameEnd + 2);
                if (rawFrame.trim().length === 0)
                    continue;
                yield parseSseFrame(rawFrame);
            }
        }
        // Process any remaining buffer (stream ended without trailing \n\n)
        if (buffer.trim().length > 0) {
            yield parseSseFrame(buffer);
        }
    }
    finally {
        reader.releaseLock();
    }
}
//# sourceMappingURL=sse-parser.js.map