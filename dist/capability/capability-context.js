import { z } from 'zod';
import { InternalMemoryExtractRequestSchema } from "../http/endpoints/internal-memory-extract.js";
/**
 * Capability context — what a capability knows about the agent it serves, put in front of the model by the runtime
 * at every turn (v1.24.0).
 *
 * Why: the conversation history is per session, and a tool the model MAY call to read back what a capability holds
 * is not a guarantee (the model may not call it). Incident 2026-10-01 (Enterprise Adoption): an onboarding agent
 * asked its person again, at every new call, what she had already told it, while the capability held all of it.
 * With this contract the runtime (X9 agent-core) asks each capability that declares `context` for the agent's
 * context before the model answers, and inserts it in the turn's context.
 *
 * Protocol:
 * - The capability declares `context: { maxChars }` in its manifest (`CapabilityManifestSchema.context`); Forge
 *   copies it into the agent's registry entry (`CapabilityRegistryEntrySchema.context`), like `tools`.
 * - The runtime calls `POST <endpoint>/context` (`capContextContract`) with the platform secret header, the same
 *   auth as `POST /call/:tool`, body {@link CapabilityContextRequestSchema}.
 * - The capability answers {@link CapabilityContextResponseSchema}: `text: null` when it knows nothing about this
 *   agent (the runtime then adds nothing); `version` is a fingerprint of `text`, so the runtime inserts the text in
 *   a session only when it changed.
 * - Never blocking: the runtime bounds the call with {@link CAPABILITY_CONTEXT_TIMEOUT_MS} and goes on without the
 *   block on any error. The text is data about the agent's work, never instructions to the runtime.
 */
/** Hard ceiling of one capability's context text, characters. A manifest may declare less, never more. */
export const CAPABILITY_CONTEXT_MAX_CHARS = 6000;
/** How long the runtime waits for a capability's context before going on without it, milliseconds. */
export const CAPABILITY_CONTEXT_TIMEOUT_MS = 1500;
export const CapabilityContextDeclarationSchema = z.object({
    /** The longest text this capability returns (≤ {@link CAPABILITY_CONTEXT_MAX_CHARS}). */
    maxChars: z.number().int().positive().max(CAPABILITY_CONTEXT_MAX_CHARS),
});
export const CapabilityContextRequestSchema = z.object({
    agentId: z.string().min(1),
    /** Full agent scope for managed consumers; both fields are present or absent. */
    tenantId: InternalMemoryExtractRequestSchema.shape.tenantId.optional(),
    ownerId: InternalMemoryExtractRequestSchema.shape.ownerId.optional(),
    sessionId: z.string().min(1),
    /** Scope of the authenticated end user's context; absent preserves agent scope. */
    userId: InternalMemoryExtractRequestSchema.shape.userId,
    channelId: z.string().min(1).optional(),
}).refine(value => (value.tenantId === undefined) === (value.ownerId === undefined), { message: 'Incomplete managed context scope' });
export const CapabilityContextResponseSchema = z.object({
    /** null: nothing to add for this agent. */
    text: z.string().min(1).max(CAPABILITY_CONTEXT_MAX_CHARS).nullable(),
    /** Fingerprint of `text` (for example a hash): equal versions mean equal texts. */
    version: z.string().min(1).max(128),
});
//# sourceMappingURL=capability-context.js.map