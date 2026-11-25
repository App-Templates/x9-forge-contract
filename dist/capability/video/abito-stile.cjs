"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoOutfitStyleResultSchema = exports.VideoOutfitStyleRulesSchema = exports.VideoOutfitStyleRequestSchema = exports.VIDEO_OUTFIT_STYLE_MAX_DESCRIPTION = exports.VIDEO_OUTFIT_STYLE_MAX_REQUEST = void 0;
const zod_1 = require("zod");
const personaggio_parallel_js_1 = require("./personaggio-parallel.cjs");
/** Same ceiling as the outfit description in abito.ts. */
exports.VIDEO_OUTFIT_STYLE_MAX_REQUEST = 300;
exports.VIDEO_OUTFIT_STYLE_MAX_DESCRIPTION = 500;
exports.VideoOutfitStyleRequestSchema = zod_1.z.strictObject({
    request: zod_1.z.string().trim().min(1).max(exports.VIDEO_OUTFIT_STYLE_MAX_REQUEST),
});
/** How completely the character's style rules backed the composed outfit. */
exports.VideoOutfitStyleRulesSchema = zod_1.z.enum(['complete', 'senza_regole', 'senza_stile']);
/** `constraints` are Parallel's wardrobeRules, verbatim and in the same type. */
exports.VideoOutfitStyleResultSchema = zod_1.z.strictObject({
    description: zod_1.z.string().trim().min(1).max(exports.VIDEO_OUTFIT_STYLE_MAX_DESCRIPTION),
    constraints: personaggio_parallel_js_1.VideoParallelStyleSchema.shape.wardrobeRules.unwrap(),
    rules: exports.VideoOutfitStyleRulesSchema,
});
//# sourceMappingURL=abito-stile.js.map