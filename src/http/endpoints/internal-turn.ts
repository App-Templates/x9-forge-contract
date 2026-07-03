import { z } from 'zod';

/**
 * POST /internal/turn — channel-agnostic synchronous turn.
 * Direction: X9 cap-glasses/cap-* -> X9 agent-core (internal)
 * Auth: X-Internal-Secret
 * Requirement: HTTP-04
 *
 * Real internalTurnSchema from agent-core (services/agent-core/src/index.ts:176-192):
 *   - channelId: regex /^[a-z0-9-]{1,64}$/
 *   - sessionId: regex /^[a-z0-9-]{1,64}$/
 *   - message: string min 1
 *   - history?: array of LLMMessage objects
 *   - attachment?: optional channel-attachment reference (TurnAttachmentSchema —
 *     photo/document/video + fileUrl) carried alongside the message when the
 *     inbound arrived with a file
 *
 * Response: `{ ok: true, reply: string, updatedHistory: LLMMessage[] }`
 *
 * LLMMessageSchema is shared with /internal/turn/stream (HTTP-05) and exposed
 * from the endpoints barrel for consumers (cap-glasses agent-bridge mirror type).
 */

/** LLM message shape as exchanged in turn history. */
export const LLMMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant', 'tool']),
  content: z.string(),
  toolCallId: z.string().optional(),
  toolName: z.string().optional(),
  toolCalls: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        input: z.record(z.string(), z.unknown()),
      }),
    )
    .optional(),
});
export type LLMMessage = z.infer<typeof LLMMessageSchema>;

/**
 * Optional channel-attachment carried alongside the turn message.
 * Direction-agnostic and consumer-agnostic: any caller forwarding an inbound
 * that arrived with a file (Telegram photo/document/video today; any channel
 * tomorrow) can attach the file reference. `fileUrl` may be provider-scoped
 * (e.g. Telegram bot-token file URLs) — consumers MUST treat it as sensitive:
 * internal use only, do not log at info level, do not persist verbatim.
 */
export const TurnAttachmentSchema = z.object({
  type: z.enum(['photo', 'document', 'video']),
  fileUrl: z.string().url(),
  mimeType: z.string().min(1).max(100).optional(),
  filename: z.string().min(1).max(255).optional(),
});
export type TurnAttachment = z.infer<typeof TurnAttachmentSchema>;

export const InternalTurnRequestSchema = z.object({
  channelId: z.string().regex(/^[a-z0-9-]{1,64}$/),
  sessionId: z.string().regex(/^[a-z0-9-]{1,64}$/),
  message: z.string().min(1),
  history: z.array(LLMMessageSchema).optional(),
  attachment: TurnAttachmentSchema.optional(),
});
export type InternalTurnRequest = z.infer<typeof InternalTurnRequestSchema>;

export const InternalTurnResponseSchema = z.object({
  ok: z.literal(true),
  reply: z.string(),
  updatedHistory: z.array(LLMMessageSchema),
});
export type InternalTurnResponse = z.infer<typeof InternalTurnResponseSchema>;

export const InternalTurnErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
});
export type InternalTurnErrorResponse = z.infer<typeof InternalTurnErrorResponseSchema>;

export const internalTurnContract = {
  method: 'POST' as const,
  path: '/internal/turn' as const,
  authType: 'secret' as const,
  bodySchema: InternalTurnRequestSchema,
  responseSchema: InternalTurnResponseSchema,
} as const;
