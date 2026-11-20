"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCIAL_TOPIC_TITLE_ISSUES = exports.SOCIAL_TITLE_LINKING_WORDS = void 0;
exports.socialTopicTitleIssue = socialTopicTitleIssue;
exports.socialGroupResultIssues = socialGroupResultIssues;
const job_io_js_1 = require("./job-io.cjs");
const topic_js_1 = require("./topic.cjs");
/**
 * Linking words that cannot close a title nor count as a "full" word (D23).
 * Same words as `SOCIAL_TITLE_TRAILING_WORDS` in `import.ts`; a test keeps the two lists equal.
 */
exports.SOCIAL_TITLE_LINKING_WORDS = new Set(('a ad al allo alla ai agli alle con da dal dallo dalla dai dagli dalle di del dello della dei degli delle ' +
    'e ed il lo la i gli le in nel nello nella nei negli nelle o per su sul sullo sulla sui sugli sulle ' +
    'tra fra un uno una che come non').split(' '));
exports.SOCIAL_TOPIC_TITLE_ISSUES = ['too_long', 'dangling_word', 'open_bracket', 'too_few_words'];
/** Minimum number of full words (3+ letters, not linking) for an informative title. */
const SOCIAL_TITLE_MIN_FULL_WORDS = 2;
/** `null` when the title is informative (D23), otherwise the first problem found. */
function socialTopicTitleIssue(title) {
    if (!topic_js_1.SocialTopicTitleSchema.safeParse(title).success)
        return 'too_long';
    const trimmed = title.trim();
    if (/[\s:,;.\-–(]$/.test(trimmed))
        return 'dangling_word';
    const words = trimmed.split(/\s+/);
    const last = words[words.length - 1] ?? '';
    if (words.length > 1 && exports.SOCIAL_TITLE_LINKING_WORDS.has(last.toLowerCase()))
        return 'dangling_word';
    if (trimmed.lastIndexOf('(') > trimmed.lastIndexOf(')'))
        return 'open_bracket';
    const full = words.filter(w => {
        const letters = w.replace(/[^\p{L}\p{N}]/gu, '');
        return letters.length >= 3 && !exports.SOCIAL_TITLE_LINKING_WORDS.has(letters.toLowerCase());
    });
    if (full.length < SOCIAL_TITLE_MIN_FULL_WORDS)
        return 'too_few_words';
    return null;
}
/** Checks a model `group` result against its job input. Empty list = acceptable. Never throws. */
function socialGroupResultIssues(input, result) {
    try {
        const i = job_io_js_1.SocialJobInputSchema.safeParse(input);
        const r = job_io_js_1.SocialJobResultSchema.safeParse(result);
        if (!i.success || !r.success || i.data.kind !== 'group' || r.data.kind !== 'group') {
            return [{ index: -1, issue: 'invalid_input' }];
        }
        const categories = new Set(i.data.categories);
        const postIds = new Set(i.data.postIds);
        const used = new Set();
        const issues = [];
        r.data.topics.forEach((t, index) => {
            const titleIssue = socialTopicTitleIssue(t.title);
            if (titleIssue)
                issues.push({ index, issue: `title:${titleIssue}` });
            if (!categories.has(t.category))
                issues.push({ index, issue: 'category_not_in_job' });
            if (t.postIds.some(p => !postIds.has(p)))
                issues.push({ index, issue: 'post_not_in_job' });
            if (t.postIds.some(p => used.has(p)))
                issues.push({ index, issue: 'post_in_two_topics' });
            t.postIds.forEach(p => used.add(p));
        });
        return issues;
    }
    catch {
        return [{ index: -1, issue: 'invalid_input' }];
    }
}
//# sourceMappingURL=group.js.map