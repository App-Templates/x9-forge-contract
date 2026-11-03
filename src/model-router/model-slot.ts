import { z } from 'zod';

/** Stable conversation slot; syntax remains open for legacy custom slots. */
export const AGENT_CHAT_MODEL_SLOT_ID = 'agent_chat';
export const ModelSlotIdSchema = z.string().regex(/^[a-z][a-z0-9._-]{0,63}$/);

/** Runtime generation is independent of Forge's numeric configuration version. */
export const AgentModelBootstrapSourceVersionSchema = z.string().trim().min(1).max(128);
export const AgentModelBootstrapPreconditionSchema = z.object({
  expectedSourceVersion: AgentModelBootstrapSourceVersionSchema, expectedAbsent: z.literal(true),
}).strict();
