import { z } from 'zod';
/** Stable conversation slot; syntax remains open for legacy custom slots. */
export declare const AGENT_CHAT_MODEL_SLOT_ID = "agent_chat";
export declare const ModelSlotIdSchema: z.ZodString;
/** Runtime generation is independent of Forge's numeric configuration version. */
export declare const AgentModelBootstrapSourceVersionSchema: z.ZodString;
export declare const AgentModelBootstrapPreconditionSchema: z.ZodObject<{
    expectedSourceVersion: z.ZodString;
    expectedAbsent: z.ZodLiteral<true>;
}, z.core.$strict>;
//# sourceMappingURL=model-slot.d.ts.map