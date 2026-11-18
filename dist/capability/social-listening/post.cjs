"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialPostSchema = exports.SocialPostFilterSchema = exports.SocialPostKindSchema = exports.SOCIAL_POST_KINDS = exports.SocialFollowedProfileSchema = exports.SocialVerticalIdSchema = exports.SocialHandleSchema = exports.SocialProviderSchema = exports.SOCIAL_PROVIDERS = void 0;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
const research_js_1 = require("../ricerca/research.cjs");
const verdict_js_1 = require("./verdict.cjs");
/**
 * Social providers. The provider sits behind an interface: TikTok, YouTube, LinkedIn are added here
 * without changing the tools. Instagram collection goes through the Mac, never from the server with cookies.
 */
exports.SOCIAL_PROVIDERS = ['instagram'];
exports.SocialProviderSchema = zod_1.z.enum(exports.SOCIAL_PROVIDERS);
/** A real account name, e.g. `alassafi.ai`, `davi.d_roberts`. */
exports.SocialHandleSchema = zod_1.z.string().trim().min(1).max(100).regex(/^[A-Za-z0-9._-]+$/);
const IsoDateTimeSchema = zod_1.z.iso.datetime({ offset: true });
/** Slug of a vertical (same rule as video preset ids). */
exports.SocialVerticalIdSchema = zod_1.z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/);
exports.SocialFollowedProfileSchema = zod_1.z.object({
    provider: exports.SocialProviderSchema,
    handle: exports.SocialHandleSchema,
    verticalId: exports.SocialVerticalIdSchema,
    addedAt: IsoDateTimeSchema,
}).strict();
exports.SOCIAL_POST_KINDS = ['video', 'image', 'carousel'];
exports.SocialPostKindSchema = zod_1.z.enum(exports.SOCIAL_POST_KINDS);
/** Outcome of the `filter` job on a post: kept or dropped, why, and when the service applied it. */
exports.SocialPostFilterSchema = zod_1.z.object({
    keep: zod_1.z.boolean(),
    reason: zod_1.z.string().min(1).max(300).optional(),
    filteredAt: IsoDateTimeSchema,
}).strict();
/** Web text (caption, transcript) is DATA, never instructions: bounded in length. */
exports.SocialPostSchema = zod_1.z.object({
    identity: capability_call_identity_js_1.CapabilityAgentScopeSchema,
    postId: zod_1.z.string().min(1).max(100),
    provider: exports.SocialProviderSchema,
    handle: exports.SocialHandleSchema,
    link: research_js_1.WebUrlSchema,
    publishedAt: IsoDateTimeSchema,
    kind: exports.SocialPostKindSchema,
    caption: zod_1.z.string().max(5000),
    transcript: zod_1.z.string().max(60000).optional(),
    analysis: verdict_js_1.SocialPostAnalysisSchema.optional(),
    filter: exports.SocialPostFilterSchema.optional(),
    collectedAt: IsoDateTimeSchema,
}).strict();
//# sourceMappingURL=post.js.map