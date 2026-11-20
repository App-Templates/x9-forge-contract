/**
 * Linking words that cannot close a title nor count as a "full" word (D23).
 * Same words as `SOCIAL_TITLE_TRAILING_WORDS` in `import.ts`; a test keeps the two lists equal.
 */
export declare const SOCIAL_TITLE_LINKING_WORDS: ReadonlySet<string>;
export declare const SOCIAL_TOPIC_TITLE_ISSUES: readonly ["too_long", "dangling_word", "open_bracket", "too_few_words"];
export type SocialTopicTitleIssue = typeof SOCIAL_TOPIC_TITLE_ISSUES[number];
/** `null` when the title is informative (D23), otherwise the first problem found. */
export declare function socialTopicTitleIssue(title: string): SocialTopicTitleIssue | null;
export type SocialGroupIssue = {
    index: number;
    issue: `title:${SocialTopicTitleIssue}` | 'category_not_in_job' | 'post_not_in_job' | 'post_in_two_topics' | 'invalid_input';
};
/** Checks a model `group` result against its job input. Empty list = acceptable. Never throws. */
export declare function socialGroupResultIssues(input: unknown, result: unknown): SocialGroupIssue[];
//# sourceMappingURL=group.d.ts.map