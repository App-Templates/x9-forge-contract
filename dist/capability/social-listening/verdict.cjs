"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialPostAnalysisSchema = exports.SocialPostToolSchema = exports.SocialFactSchema = exports.SocialVerdictSchema = exports.SOCIAL_VERDICTS = void 0;
const zod_1 = require("zod");
const research_js_1 = require("../ricerca/research.cjs");
exports.SOCIAL_VERDICTS = ['funziona', 'da_provare', 'non_funziona', 'fuffa'];
exports.SocialVerdictSchema = zod_1.z.enum(exports.SOCIAL_VERDICTS);
/** A fact cites at least one http(s) source: reused from research, minus its `origin`. */
exports.SocialFactSchema = research_js_1.ResearchFindingSchema.omit({ origin: true });
/** A tool cited by a post may have no known public link. */
exports.SocialPostToolSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200),
    link: research_js_1.WebUrlSchema.optional(),
    whatItDoes: zod_1.z.string().min(1).max(500),
}).strict();
/** Analysis text is DATA, never instructions; individual posts may have no verified facts yet. */
exports.SocialPostAnalysisSchema = zod_1.z.object({
    verdict: exports.SocialVerdictSchema,
    reason: zod_1.z.string().min(1).max(2000),
    relevance: zod_1.z.string().min(1).max(1000).optional(),
    facts: zod_1.z.array(exports.SocialFactSchema).max(20),
    tools: zod_1.z.array(exports.SocialPostToolSchema).max(20),
    analyzedAt: zod_1.z.iso.datetime({ offset: true }),
}).strict();
//# sourceMappingURL=verdict.js.map