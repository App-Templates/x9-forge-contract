"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchResultOutputSchema = exports.ResearchResultInputSchema = exports.ResearchStatusOutputSchema = exports.ResearchStatusInputSchema = exports.ResearchStartOutputSchema = exports.ResearchStartInputSchema = exports.RICERCA_TOOLS = void 0;
const zod_1 = require("zod");
const research_js_1 = require("./research.cjs");
/**
 * The tools of cap-ricerca (v1.28.0, Phase 54). Agents and other capabilities call them at
 * `capToolCallPath(RICERCA_TOOLS.<tool>)` — never with a hand-written path.
 */
exports.RICERCA_TOOLS = {
    /** Queue a research; answers at once with its id. */
    start: 'research_start',
    /** Where a research is. */
    status: 'research_status',
    /** The findings of a completed research. */
    result: 'research_result',
};
exports.ResearchStartInputSchema = research_js_1.ResearchRequestSchema;
exports.ResearchStartOutputSchema = zod_1.z.object({ researchId: research_js_1.ResearchIdSchema, state: research_js_1.ResearchStateSchema }).strict();
exports.ResearchStatusInputSchema = zod_1.z.object({ researchId: research_js_1.ResearchIdSchema }).strict();
exports.ResearchStatusOutputSchema = zod_1.z.object({ researchId: research_js_1.ResearchIdSchema, state: research_js_1.ResearchStateSchema }).strict();
exports.ResearchResultInputSchema = zod_1.z.object({ researchId: research_js_1.ResearchIdSchema }).strict();
exports.ResearchResultOutputSchema = research_js_1.ResearchResultSchema;
//# sourceMappingURL=tools.js.map