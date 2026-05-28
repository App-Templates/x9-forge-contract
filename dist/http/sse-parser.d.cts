import { type SseFrame } from "./sse-frames.cjs";
/**
 * Parsed SSE event from the text/event-stream protocol.
 * Either a typed frame (Zod-validated) or a heartbeat/unknown.
 */
export type ParsedSseEvent = {
    kind: 'frame';
    frame: SseFrame;
} | {
    kind: 'heartbeat';
} | {
    kind: 'parse_error';
    raw: string;
    error: string;
};
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
export declare function parseSseFrame(rawFrame: string): ParsedSseEvent;
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
export declare function parseSseStream(stream: ReadableStream<Uint8Array>): AsyncGenerator<ParsedSseEvent>;
//# sourceMappingURL=sse-parser.d.ts.map