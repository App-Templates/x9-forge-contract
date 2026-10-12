import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../capability-call-context.js";
import { AgentConfigVersionSchema } from "../ricerca/agent-config.js";
import { RefId, Instant } from "../coach/shared.js";
import { ElevenLabsNativeConfigSchema } from "./native-config-values.js";
import { ElevenLabsPromptBundleHashSchema } from "./native-session.js";
export { ElevenLabsNativeConfigSchema } from "./native-config-values.js";
export const ElevenLabsNativeDesiredConfigSchema = z.object({ scope: CapabilityAgentScopeSchema, configVersion: AgentConfigVersionSchema,
    promptBundleHash: ElevenLabsPromptBundleHashSchema, fingerprint: ElevenLabsPromptBundleHashSchema, config: ElevenLabsNativeConfigSchema,
}).strict();
/** An acknowledged command is not provider readback and never marks configuration applied. */
export const ElevenLabsNativeCommandReceiptSchema = z.object({ requestId: RefId, desired: ElevenLabsNativeDesiredConfigSchema,
    acceptedAt: Instant, status: z.enum(['accepted', 'reconcile_pending', 'rejected']) }).strict();
//# sourceMappingURL=native-config.js.map