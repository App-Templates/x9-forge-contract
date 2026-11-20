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
export { SOCIAL_PROVIDERS, SocialProviderSchema, SocialHandleSchema, SocialVerticalIdSchema, SocialFollowedProfileSchema, SOCIAL_POST_KINDS, SocialPostKindSchema, SocialPostSchema, SocialPostFilterSchema, type SocialPostFilter, type SocialProvider, type SocialHandle, type SocialVerticalId, type SocialFollowedProfile, type SocialPostKind, type SocialPost, } from "./post.js";
export { SocialCategorySlugSchema, SocialCategorySchema, SocialVerticalSchema, socialCategoryInVertical, SOCIAL_VERDICTS, SocialVerdictSchema, SOCIAL_VERDICT_TRUTH_SCORE, SOCIAL_TRACKS, SocialTrackSchema, SOCIAL_TOPIC_TITLE_MAX, SocialTopicTitleSchema, SocialTopicFactSchema, SocialTopicSourceSchema, SocialTopicCostSchema, SocialTopicSchema, type SocialCategorySlug, type SocialCategory, type SocialVertical, type SocialVerdict, type SocialTrack, type SocialTopicFact, type SocialTopicSource, type SocialTopicCost, type SocialTopic, } from "./topic.js";
export * from "./tools.js";
export * from "./queue.js";
export * from "./config.js";
export * from "./config-ordinary.js";
export * from "./import.js";
export * from "./import-analysis.js";
export * from "./job-io.js";
export * from "./generic-job-map.js";
export * from "./group.js";
export * from "./fact-memory.js";
export * from "./routes.js";
export * from "./cap.js";
export * from "./handover.js";
export * from "./creators.js";
export * from "./favorites.js";
export { SocialFactSchema, SocialPostToolSchema, SocialPostAnalysisSchema, type SocialFact, type SocialPostTool, type SocialPostAnalysis } from "./verdict.js";
export * from "./video-brief.js";
export * from "./save-wiki.js";
export * from "./topic-research.js";
//# sourceMappingURL=index.d.ts.map