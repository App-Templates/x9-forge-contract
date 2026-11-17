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
export { SOCIAL_PROVIDERS, SocialProviderSchema, SocialHandleSchema, SocialVerticalIdSchema, SocialFollowedProfileSchema, SOCIAL_POST_KINDS, SocialPostKindSchema, SocialPostSchema, } from "./post.js";
export { SocialCategorySlugSchema, SocialCategorySchema, SocialVerticalSchema, socialCategoryInVertical, SOCIAL_VERDICTS, SocialVerdictSchema, SOCIAL_VERDICT_TRUTH_SCORE, SOCIAL_TRACKS, SocialTrackSchema, SOCIAL_TOPIC_TITLE_MAX, SocialTopicTitleSchema, SocialTopicFactSchema, SocialTopicSourceSchema, SocialTopicCostSchema, SocialTopicSchema, } from "./topic.js";
export * from "./tools.js";
export * from "./queue.js";
export * from "./config.js";
export * from "./import.js";
export * from "./import-analysis.js";
export * from "./job-io.js";
export * from "./cap.js";
export * from "./handover.js";
export { SocialFactSchema, SocialPostToolSchema, SocialPostAnalysisSchema } from "./verdict.js";
//# sourceMappingURL=index.js.map