"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentTurnMoveIdSchema = exports.CapabilityTurnLeadResponseSchema = exports.CapabilityTurnLeadRequestSchema = exports.CapabilityTurnLeadDeclarationSchema = exports.AgentTurnSchema = exports.CAPABILITY_TURN_LEAD_TIMEOUT_MS = exports.CAPABILITY_TURN_LEAD_MAX_CHARS = exports.AGENT_TURN_MAX_TEXT_CHARS = void 0;
const zod_1 = require("zod");
const capability_context_js_1 = require("./capability-context.cjs");
/** MVP turn leading, opt-in per agent. No voice budget or version negotiation. */
exports.AGENT_TURN_MAX_TEXT_CHARS = 32000;
exports.CAPABILITY_TURN_LEAD_MAX_CHARS = 6000;
/** Interpreter, one repair and formatter (45 seconds each), with transport margin. */
exports.CAPABILITY_TURN_LEAD_TIMEOUT_MS = 150000;
const id = zod_1.z.string().min(1).max(120);
const sourceText = zod_1.z.string().max(exports.AGENT_TURN_MAX_TEXT_CHARS);
/** Runtime-owned source, never a model tool argument. Preserve transcript whitespace verbatim. */
exports.AgentTurnSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.object({ kind: zod_1.z.literal('opening'), turnId: id, text: zod_1.z.literal('') }).strict(),
    zod_1.z.object({ kind: zod_1.z.literal('answer'), turnId: id,
        text: sourceText.refine((text) => text.trim().length > 0, 'Expected spoken words') }).strict(),
    zod_1.z.object({ kind: zod_1.z.literal('incomplete'), turnId: id, text: sourceText }).strict(),
    zod_1.z.object({ kind: zod_1.z.literal('delivery'), turnId: id, text: zod_1.z.literal(''),
        moveId: id, spokenText: sourceText }).strict(),
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
]);
/** Correlates voice delivery on the per-agent route; never added to the personal route. */
exports.AgentTurnMoveIdSchema = id;
//# sourceMappingURL=capability-turn-lead.js.map