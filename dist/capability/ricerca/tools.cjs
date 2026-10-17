"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchExecuteInputSchema = exports.RICERCA_INTERNAL_TOOLS = exports.ResearchResultOutputSchema = exports.ResearchResultInputSchema = exports.ResearchStatusOutputSchema = exports.ResearchStatusInputSchema = exports.ResearchStartOutputSchema = exports.ResearchStartInputSchema = exports.RicercaToolErrorSchema = exports.RICERCA_TOOLS = void 0;
exports.researchExecutePath = researchExecutePath;
const zod_1 = require("zod");
const cap_tool_call_js_1 = require("../../http/endpoints/cap-tool-call.cjs");
const research_js_1 = require("./research.cjs");
/**
 * The tools of cap-ricerca (v1.28.0, Phase 54). The agent is the one of the tool call envelope. Agents and other
 * capabilities call them at `capToolCallPath(RICERCA_TOOLS.<tool>)` — never with a hand-written path.
 * Errors use the bridge tool-call codes (`TOOL_CALL_INVALID`, `TOOL_EXEC_FAILED`) with a {@link RicercaToolError}
 * as the error text.
 */
exports.RICERCA_TOOLS = {
    /** Queue a research; answers at once with its id. */
    start: 'research_start',
    /** Where a research is. */
    status: 'research_status',
    /** The findings of a finished research. */
    result: 'research_result',
};
/** Why a cap-ricerca tool call failed (the `error` text of a bridge tool-call error). */
exports.RicercaToolErrorSchema = zod_1.z.enum([
    'invalid_request',
    'not_configured',
    'max_usd_above_agent',
    'unknown_parent',
    'unknown_research',
    'not_ready',
]);
exports.ResearchStartInputSchema = research_js_1.ResearchRequestSchema;
exports.ResearchStartOutputSchema = zod_1.z.object({ researchId: research_js_1.ResearchIdSchema, state: research_js_1.ResearchStateSchema }).strict();
exports.ResearchStatusInputSchema = zod_1.z.object({ researchId: research_js_1.ResearchIdSchema }).strict();
exports.ResearchStatusOutputSchema = zod_1.z.object({ researchId: research_js_1.ResearchIdSchema, state: research_js_1.ResearchStateSchema }).strict();
exports.ResearchResultInputSchema = zod_1.z.object({ researchId: research_js_1.ResearchIdSchema }).strict();
exports.ResearchResultOutputSchema = research_js_1.ResearchResultSchema;
/** Worker-owned execution only: deliberately excluded from RICERCA_TOOLS and model manifests. */
exports.RICERCA_INTERNAL_TOOLS = { execute: 'research_execute' };
/** The receiver must compare this opaque token with the current SQL claim and agent ownership. */
exports.ResearchExecuteInputSchema = zod_1.z.strictObject({
    researchId: research_js_1.ResearchIdSchema,
    leaseToken: zod_1.z.uuid(),
});
function researchExecutePath() { return (0, cap_tool_call_js_1.capToolCallPath)(exports.RICERCA_INTERNAL_TOOLS.execute); }
//# sourceMappingURL=tools.js.map