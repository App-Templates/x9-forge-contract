"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialPostAnalysisSchema = exports.SocialPostToolSchema = exports.SocialFactSchema = exports.SocialTopicSchema = exports.SocialTopicCostSchema = exports.SocialTopicSourceSchema = exports.SocialTopicFactSchema = exports.SocialTopicTitleSchema = exports.SOCIAL_TOPIC_TITLE_MAX = exports.SocialTrackSchema = exports.SOCIAL_TRACKS = exports.SOCIAL_VERDICT_TRUTH_SCORE = exports.SocialVerdictSchema = exports.SOCIAL_VERDICTS = exports.socialCategoryInVertical = exports.SocialVerticalSchema = exports.SocialCategorySchema = exports.SocialCategorySlugSchema = exports.SocialPostFilterSchema = exports.SocialPostSchema = exports.SocialPostKindSchema = exports.SOCIAL_POST_KINDS = exports.SocialFollowedProfileSchema = exports.SocialVerticalIdSchema = exports.SocialHandleSchema = exports.SocialProviderSchema = exports.SOCIAL_PROVIDERS = void 0;
/**
 * social-listening contracts — sub-path `@x9-forge/contracts/capability/social-listening`.
 *
 * Base vocabulary of the social listening capability: followed profiles, source posts, verticals with their
 * category vocabulary, and topics with verdict, sources, cost and track. Tenant, owner and agent on every row (R-33).
 *
 * Consumers (planned): agent-x9 services/cap-social-listening, forge-v2 Ascolto page.
 *
 * STRICT (internal boundary, R-14): no `.passthrough()`.
 */
var post_js_1 = require("./post.cjs");
Object.defineProperty(exports, "SOCIAL_PROVIDERS", { enumerable: true, get: function () { return post_js_1.SOCIAL_PROVIDERS; } });
Object.defineProperty(exports, "SocialProviderSchema", { enumerable: true, get: function () { return post_js_1.SocialProviderSchema; } });
Object.defineProperty(exports, "SocialHandleSchema", { enumerable: true, get: function () { return post_js_1.SocialHandleSchema; } });
Object.defineProperty(exports, "SocialVerticalIdSchema", { enumerable: true, get: function () { return post_js_1.SocialVerticalIdSchema; } });
Object.defineProperty(exports, "SocialFollowedProfileSchema", { enumerable: true, get: function () { return post_js_1.SocialFollowedProfileSchema; } });
Object.defineProperty(exports, "SOCIAL_POST_KINDS", { enumerable: true, get: function () { return post_js_1.SOCIAL_POST_KINDS; } });
Object.defineProperty(exports, "SocialPostKindSchema", { enumerable: true, get: function () { return post_js_1.SocialPostKindSchema; } });
Object.defineProperty(exports, "SocialPostSchema", { enumerable: true, get: function () { return post_js_1.SocialPostSchema; } });
Object.defineProperty(exports, "SocialPostFilterSchema", { enumerable: true, get: function () { return post_js_1.SocialPostFilterSchema; } });
var topic_js_1 = require("./topic.cjs");
Object.defineProperty(exports, "SocialCategorySlugSchema", { enumerable: true, get: function () { return topic_js_1.SocialCategorySlugSchema; } });
Object.defineProperty(exports, "SocialCategorySchema", { enumerable: true, get: function () { return topic_js_1.SocialCategorySchema; } });
Object.defineProperty(exports, "SocialVerticalSchema", { enumerable: true, get: function () { return topic_js_1.SocialVerticalSchema; } });
Object.defineProperty(exports, "socialCategoryInVertical", { enumerable: true, get: function () { return topic_js_1.socialCategoryInVertical; } });
Object.defineProperty(exports, "SOCIAL_VERDICTS", { enumerable: true, get: function () { return topic_js_1.SOCIAL_VERDICTS; } });
Object.defineProperty(exports, "SocialVerdictSchema", { enumerable: true, get: function () { return topic_js_1.SocialVerdictSchema; } });
Object.defineProperty(exports, "SOCIAL_VERDICT_TRUTH_SCORE", { enumerable: true, get: function () { return topic_js_1.SOCIAL_VERDICT_TRUTH_SCORE; } });
Object.defineProperty(exports, "SOCIAL_TRACKS", { enumerable: true, get: function () { return topic_js_1.SOCIAL_TRACKS; } });
Object.defineProperty(exports, "SocialTrackSchema", { enumerable: true, get: function () { return topic_js_1.SocialTrackSchema; } });
Object.defineProperty(exports, "SOCIAL_TOPIC_TITLE_MAX", { enumerable: true, get: function () { return topic_js_1.SOCIAL_TOPIC_TITLE_MAX; } });
Object.defineProperty(exports, "SocialTopicTitleSchema", { enumerable: true, get: function () { return topic_js_1.SocialTopicTitleSchema; } });
Object.defineProperty(exports, "SocialTopicFactSchema", { enumerable: true, get: function () { return topic_js_1.SocialTopicFactSchema; } });
Object.defineProperty(exports, "SocialTopicSourceSchema", { enumerable: true, get: function () { return topic_js_1.SocialTopicSourceSchema; } });
Object.defineProperty(exports, "SocialTopicCostSchema", { enumerable: true, get: function () { return topic_js_1.SocialTopicCostSchema; } });
Object.defineProperty(exports, "SocialTopicSchema", { enumerable: true, get: function () { return topic_js_1.SocialTopicSchema; } });
__exportStar(require("./tools.cjs"), exports);
__exportStar(require("./queue.cjs"), exports);
__exportStar(require("./config.cjs"), exports);
__exportStar(require("./config-ordinary.cjs"), exports);
__exportStar(require("./import.cjs"), exports);
__exportStar(require("./import-analysis.cjs"), exports);
__exportStar(require("./job-io.cjs"), exports);
__exportStar(require("./generic-job-map.cjs"), exports);
__exportStar(require("./group.cjs"), exports);
__exportStar(require("./fact-memory.cjs"), exports);
__exportStar(require("./routes.cjs"), exports);
__exportStar(require("./cap.cjs"), exports);
__exportStar(require("./handover.cjs"), exports);
__exportStar(require("./creators.cjs"), exports);
__exportStar(require("./favorites.cjs"), exports);
__exportStar(require("./costs.cjs"), exports);
var verdict_js_1 = require("./verdict.cjs");
Object.defineProperty(exports, "SocialFactSchema", { enumerable: true, get: function () { return verdict_js_1.SocialFactSchema; } });
Object.defineProperty(exports, "SocialPostToolSchema", { enumerable: true, get: function () { return verdict_js_1.SocialPostToolSchema; } });
Object.defineProperty(exports, "SocialPostAnalysisSchema", { enumerable: true, get: function () { return verdict_js_1.SocialPostAnalysisSchema; } });
__exportStar(require("./video-brief.cjs"), exports);
__exportStar(require("./save-wiki.cjs"), exports);
__exportStar(require("./topic-research.cjs"), exports);
__exportStar(require("./topic-research-result.cjs"), exports);
//# sourceMappingURL=index.js.map