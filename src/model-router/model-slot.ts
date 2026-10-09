import { z } from 'zod';

/** Stable conversation slot; syntax remains open for legacy custom slots. */
export const AGENT_CHAT_MODEL_SLOT_ID = 'agent_chat';
export const ModelSlotIdSchema = z.string().regex(/^[a-z][a-z0-9._-]{0,63}$/);
