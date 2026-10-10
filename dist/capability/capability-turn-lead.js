import { z } from 'zod';
import { CapabilityContextRequestSchema } from "./capability-context.js";
/** MVP turn leading, opt-in per agent. No voice budget or version negotiation. */
export const AGENT_TURN_MAX_TEXT_CHARS = 32000;
export const CAPABILITY_TURN_LEAD_MAX_CHARS = 6000;
/** Interpreter, one repair and formatter (45 seconds each), with transport margin. */
export const CAPABILITY_TURN_LEAD_TIMEOUT_MS = 150000;
/** Voice-led sessions (v1.27.0): instructions for the whole session and short in-session notes. */
export const CAPABILITY_LEAD_MAX_INSTRUCTIONS_CHARS = 16000;
export const CAPABILITY_NOTE_MAX_CHARS = 1200;
const id = z.string().min(1).max(120);
/** Whole-session instructions for a voice-led session (v1.27.0). */
export const CapabilityLeadInstructionsSchema = z.string().max(CAPABILITY_LEAD_MAX_INSTRUCTIONS_CHARS)
    .refine((text) => text.trim().length > 0, 'Expected instructions');
/** In-session context for the voice, never words to say (v1.27.0). */
export const CapabilityNoteSchema = z.string().max(CAPABILITY_NOTE_MAX_CHARS)
    .refine((text) => text.trim().length > 0, 'Expected a note');
const sourceText = z.string().max(AGENT_TURN_MAX_TEXT_CHARS);
/** Runtime-owned source, never a model tool argument. Preserve transcript whitespace verbatim. */
export const AgentTurnSchema = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('opening'), turnId: id, text: z.literal('') }).strict(),
    z.object({ kind: z.literal('answer'), turnId: id,
        text: sourceText.refine((text) => text.trim().length > 0, 'Expected spoken words') }).strict(),
    z.object({ kind: z.literal('incomplete'), turnId: id, text: sourceText }).strict(),
    z.object({ kind: z.literal('delivery'), turnId: id, text: z.literal(''),
        moveId: id, spokenText: sourceText }).strict(),
    /** Before the voice session exists: may the capability lead it? No words, no side effects. */
    z.object({ kind: z.literal('prepare'), turnId: id, text: z.literal('') }).strict(),
    /** Voice-led session: what the voice said, then the person's own words; `ended` closes the session. */
    z.object({ kind: z.literal('exchange'), turnId: id, text: sourceText, spokenText: sourceText,
        ended: z.boolean() }).strict(),
]);
/** Presence opts in; absence is legacy. Forge copies this declaration without inventing defaults. */
export const CapabilityTurnLeadDeclarationSchema = z.object({}).strict();
/** Identity comes from the authenticated runtime; the single-company MVP uses the existing context envelope. */
export const CapabilityTurnLeadRequestSchema = CapabilityContextRequestSchema.safeExtend({
    turn: AgentTurnSchema,
}).strict();
export const CapabilityTurnLeadResponseSchema = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('speak'), moveId: id,
        text: z.string().max(CAPABILITY_TURN_LEAD_MAX_CHARS)
            .refine((text) => text.trim().length > 0, 'Expected a question or message') }).strict(),
    z.object({ kind: z.literal('release') }).strict(),
    /** Reply to `prepare`: the voice conducts the session itself with these instructions. */
    z.object({ kind: z.literal('lead'), instructions: CapabilityLeadInstructionsSchema }).strict(),
    /** Reply to `exchange`: received; an optional note is context for the voice, never words to say. */
    z.object({ kind: z.literal('noted'), note: CapabilityNoteSchema.optional() }).strict(),
]);
/** Correlates voice delivery on the per-agent route; never added to the personal route. */
export const AgentTurnMoveIdSchema = id;
//# sourceMappingURL=capability-turn-lead.js.map