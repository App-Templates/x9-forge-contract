"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentTurnMoveIdSchema = exports.CapabilityTurnLeadResponseSchema = exports.CapabilityTurnLeadRequestSchema = exports.CapabilityTurnLeadDeclarationSchema = exports.AgentTurnSchema = exports.CapabilityNoteSchema = exports.CapabilityLeadInstructionsSchema = exports.CAPABILITY_NOTE_MAX_CHARS = exports.CAPABILITY_LEAD_MAX_INSTRUCTIONS_CHARS = exports.CAPABILITY_TURN_LEAD_TIMEOUT_MS = exports.CAPABILITY_TURN_LEAD_MAX_CHARS = exports.AGENT_TURN_MAX_TEXT_CHARS = void 0;
const zod_1 = require("zod");
const capability_context_js_1 = require("./capability-context.cjs");
/** MVP turn leading, opt-in per agent. No voice budget or version negotiation. */
exports.AGENT_TURN_MAX_TEXT_CHARS = 32000;
exports.CAPABILITY_TURN_LEAD_MAX_CHARS = 6000;
/** Interpreter, one repair and formatter (45 seconds each), with transport margin. */
exports.CAPABILITY_TURN_LEAD_TIMEOUT_MS = 150000;
/** Voice-led sessions (v1.27.0): instructions for the whole session and short in-session notes. */
exports.CAPABILITY_LEAD_MAX_INSTRUCTIONS_CHARS = 16000;
exports.CAPABILITY_NOTE_MAX_CHARS = 1200;
const id = zod_1.z.string().min(1).max(120);
/** Whole-session instructions for a voice-led session (v1.27.0). */
exports.CapabilityLeadInstructionsSchema = zod_1.z.string().max(exports.CAPABILITY_LEAD_MAX_INSTRUCTIONS_CHARS)
    .refine((text) => text.trim().length > 0, 'Expected instructions');
/** In-session context for the voice, never words to say (v1.27.0). */
exports.CapabilityNoteSchema = zod_1.z.string().max(exports.CAPABILITY_NOTE_MAX_CHARS)
    .refine((text) => text.trim().length > 0, 'Expected a note');
const sourceText = zod_1.z.string().max(exports.AGENT_TURN_MAX_TEXT_CHARS);
/** Runtime-owned source, never a model tool argument. Preserve transcript whitespace verbatim. */
exports.AgentTurnSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.object({ kind: zod_1.z.literal('opening'), turnId: id, text: zod_1.z.literal('') }).strict(),
    zod_1.z.object({ kind: zod_1.z.literal('answer'), turnId: id,
        text: sourceText.refine((text) => text.trim().length > 0, 'Expected spoken words') }).strict(),
    zod_1.z.object({ kind: zod_1.z.literal('incomplete'), turnId: id, text: sourceText }).strict(),
    zod_1.z.object({ kind: zod_1.z.literal('delivery'), turnId: id, text: zod_1.z.literal(''),
        moveId: id, spokenText: sourceText }).strict(),
    /** Before the voice session exists: may the capability lead it? No words, no side effects. */
    zod_1.z.object({ kind: zod_1.z.literal('prepare'), turnId: id, text: zod_1.z.literal('') }).strict(),
    /** Voice-led session: what the voice said, then the person's own words; `ended` closes the session. */
    zod_1.z.object({ kind: zod_1.z.literal('exchange'), turnId: id, text: sourceText, spokenText: sourceText,
        ended: zod_1.z.boolean() }).strict(),
]);
/** Presence opts in; absence is legacy. Forge copies this declaration without inventing defaults. */
exports.CapabilityTurnLeadDeclarationSchema = zod_1.z.object({}).strict();
/** Identity comes from the authenticated runtime; the single-company MVP uses the existing context envelope. */
exports.CapabilityTurnLeadRequestSchema = capability_context_js_1.CapabilityContextRequestSchema.extend({
    turn: exports.AgentTurnSchema,
}).strict();
exports.CapabilityTurnLeadResponseSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.object({ kind: zod_1.z.literal('speak'), moveId: id,
        text: zod_1.z.string().max(exports.CAPABILITY_TURN_LEAD_MAX_CHARS)
            .refine((text) => text.trim().length > 0, 'Expected a question or message') }).strict(),
    zod_1.z.object({ kind: zod_1.z.literal('release') }).strict(),
    /** Reply to `prepare`: the voice conducts the session itself with these instructions. */
    zod_1.z.object({ kind: zod_1.z.literal('lead'), instructions: exports.CapabilityLeadInstructionsSchema }).strict(),
    /** Reply to `exchange`: received; an optional note is context for the voice, never words to say. */
    zod_1.z.object({ kind: zod_1.z.literal('noted'), note: exports.CapabilityNoteSchema.optional() }).strict(),
]);
/** Correlates voice delivery on the per-agent route; never added to the personal route. */
exports.AgentTurnMoveIdSchema = id;
//# sourceMappingURL=capability-turn-lead.js.map