import { z } from 'zod';
import { CapabilityContextRequestSchema } from "./capability-context.js";
/** MVP turn leading, opt-in per agent. No voice budget or version negotiation. */
export const AGENT_TURN_MAX_TEXT_CHARS = 32000;
export const CAPABILITY_TURN_LEAD_MAX_CHARS = 6000;
/** Interpreter, one repair and formatter (45 seconds each), with transport margin. */
export const CAPABILITY_TURN_LEAD_TIMEOUT_MS = 150000;
const id = z.string().min(1).max(120);
const sourceText = z.string().max(AGENT_TURN_MAX_TEXT_CHARS);
/** Runtime-owned source, never a model tool argument. Preserve transcript whitespace verbatim. */
export const AgentTurnSchema = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('opening'), turnId: id, text: z.literal('') }).strict(),
    z.object({ kind: z.literal('answer'), turnId: id,
        text: sourceText.refine((text) => text.trim().length > 0, 'Expected spoken words') }).strict(),
    z.object({ kind: z.literal('incomplete'), turnId: id, text: sourceText }).strict(),
    z.object({ kind: z.literal('delivery'), turnId: id, text: z.literal(''),
        moveId: id, spokenText: sourceText }).strict(),
]);
/** Presence opts in; absence is legacy. Forge copies this declaration without inventing defaults. */
export const CapabilityTurnLeadDeclarationSchema = z.object({}).strict();
/** Identity comes from the authenticated runtime; the single-company MVP uses the existing context envelope. */
export const CapabilityTurnLeadRequestSchema = CapabilityContextRequestSchema.extend({
    turn: AgentTurnSchema,
}).strict();
export const CapabilityTurnLeadResponseSchema = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('speak'), moveId: id,
        text: z.string().max(CAPABILITY_TURN_LEAD_MAX_CHARS)
            .refine((text) => text.trim().length > 0, 'Expected a question or message') }).strict(),
    z.object({ kind: z.literal('release') }).strict(),
]);
/** Correlates voice delivery on the per-agent route; never added to the personal route. */
export const AgentTurnMoveIdSchema = id;
//# sourceMappingURL=capability-turn-lead.js.map