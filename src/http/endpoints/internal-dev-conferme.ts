import { z } from 'zod';
import type { EndpointContract } from '../endpoint-contract.js';

/**
 * POST /internal/dev/conferme-in-attesa — pending confirmations for X9 Live web.
 * Direction: cap-voice-live's authenticated web server -> cap-dev.
 * Auth: the existing internal secret header (INTERNAL_SECRET_HEADER).
 *
 * Consumers bind sessionId to the authenticated owner on the server. cap-dev
 * owns the five-minute lifetime and one-time delivery. This response is sent
 * directly to that web session, never to a model, transcript, log or browser storage.
 */
export const InternalDevConfermeRequestSchema = z.object({
  sessionId: z.string().min(1),
}).strict();
export type InternalDevConfermeRequest = z.infer<typeof InternalDevConfermeRequestSchema>;

export const InternalDevConfermeResponseSchema = z.object({
  conferme: z.array(z.object({
    richiesta: z.number().int().positive(),
    titolo: z.string(),
    comando: z.enum(['APPROVATO', 'SCARTATO', 'RIPRENDI']),
    link: z.url({ protocol: /^https$/ }),
  }).strict()),
}).strict();
export type InternalDevConfermeResponse = z.infer<typeof InternalDevConfermeResponseSchema>;

export const internalDevConfermeContract = {
  method: 'POST',
  path: '/internal/dev/conferme-in-attesa',
  authType: 'secret',
  bodySchema: InternalDevConfermeRequestSchema,
  responseSchema: InternalDevConfermeResponseSchema,
} as const satisfies EndpointContract<
  'POST',
  '/internal/dev/conferme-in-attesa',
  'secret',
  z.ZodUndefined,
  typeof InternalDevConfermeRequestSchema,
  typeof InternalDevConfermeResponseSchema
>;
