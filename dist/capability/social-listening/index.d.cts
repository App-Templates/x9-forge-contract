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
export { SOCIAL_PROVIDERS, SocialProviderSchema, SocialHandleSchema, SocialVerticalIdSchema, SocialFollowedProfileSchema, SOCIAL_POST_KINDS, SocialPostKindSchema, SocialPostSchema, type SocialProvider, type SocialHandle, type SocialVerticalId, type SocialFollowedProfile, type SocialPostKind, type SocialPost, } from "./post.cjs";
export { SocialCategorySlugSchema, SocialCategorySchema, SocialVerticalSchema, socialCategoryInVertical, SOCIAL_VERDICTS, SocialVerdictSchema, SOCIAL_VERDICT_TRUTH_SCORE, SOCIAL_TRACKS, SocialTrackSchema, SOCIAL_TOPIC_TITLE_MAX, SocialTopicTitleSchema, SocialTopicFactSchema, SocialTopicSourceSchema, SocialTopicCostSchema, SocialTopicSchema, type SocialCategorySlug, type SocialCategory, type SocialVertical, type SocialVerdict, type SocialTrack, type SocialTopicFact, type SocialTopicSource, type SocialTopicCost, type SocialTopic, } from "./topic.cjs";
export * from "./tools.cjs";
export * from "./queue.cjs";
export * from "./config.cjs";
export * from "./config-ordinary.cjs";
export * from "./import.cjs";
export * from "./import-analysis.cjs";
export * from "./job-io.cjs";
export * from "./group.cjs";
export * from "./fact-memory.cjs";
export * from "./routes.cjs";
export * from "./cap.cjs";
export * from "./handover.cjs";
export * from "./creators.cjs";
export * from "./favorites.cjs";
export { SocialFactSchema, SocialPostToolSchema, SocialPostAnalysisSchema, type SocialFact, type SocialPostTool, type SocialPostAnalysis } from "./verdict.cjs";
export * from "./video-brief.cjs";
export * from "./save-wiki.cjs";
export * from "./topic-research.cjs";
//# sourceMappingURL=index.d.ts.map