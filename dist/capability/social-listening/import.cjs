"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialLegacyClusterRowSchema = exports.SocialLegacyAnalysisRowSchema = exports.SocialMetaMediaSchema = exports.SOCIAL_META_MEDIA_FIELDS = exports.SOCIAL_LEGACY_VERDICTS = exports.SOCIAL_LEGACY_CLUSTER_SCHEMA = exports.SOCIAL_LEGACY_ANALYSIS_SCHEMA = void 0;
exports.socialImportTimestamp = socialImportTimestamp;
exports.socialMetaBusinessDiscoveryFields = socialMetaBusinessDiscoveryFields;
exports.socialPostFromMetaMedia = socialPostFromMetaMedia;
exports.socialImportVerdict = socialImportVerdict;
exports.socialImportKind = socialImportKind;
exports.shortenSocialTopicTitle = shortenSocialTopicTitle;
exports.socialImportPost = socialImportPost;
exports.socialImportTopic = socialImportTopic;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
const research_js_1 = require("../ricerca/research.cjs");
const post_js_1 = require("./post.cjs");
const topic_js_1 = require("./topic.cjs");
exports.SOCIAL_LEGACY_ANALYSIS_SCHEMA = 'ig-ascolto-analisi-v1';
exports.SOCIAL_LEGACY_CLUSTER_SCHEMA = 'ig-ascolto-cluster-v1';
const SocialLegacyVerdictSchema = zod_1.z.enum(['funzionale', 'da provare', 'non funzionale', 'fuffa']);
exports.SOCIAL_LEGACY_VERDICTS = {
    funzionale: 'funziona',
    'da provare': 'da_provare',
    'non funzionale': 'non_funziona',
    fuffa: 'fuffa',
};
const SocialLegacyKindSchema = zod_1.z.enum(['VIDEO', 'CAROUSEL_ALBUM', 'IMAGE']);
const SOCIAL_LEGACY_KINDS = {
    VIDEO: 'video',
    CAROUSEL_ALBUM: 'carousel',
    IMAGE: 'image',
};
const IsoDateTimeSchema = zod_1.z.iso.datetime({ offset: true });
/** Preserve local time and offset; only the missing offset colon is repaired. */
function socialImportTimestamp(value) {
    if (!/[+-]\d{2}:?\d{2}$/.test(value))
        return null;
    const normalized = value.replace(/([+-]\d{2})(\d{2})$/, '$1:$2');
    return IsoDateTimeSchema.safeParse(normalized).success ? normalized : null;
}
const LegacyTimestampSchema = zod_1.z.string().refine(value => socialImportTimestamp(value) !== null, 'expected a date-time with a valid numeric offset');
exports.SOCIAL_META_MEDIA_FIELDS = [
    'id', 'caption', 'media_type', 'media_product_type', 'media_url',
    'permalink', 'timestamp', 'like_count', 'comments_count',
];
/** A field selection only: credentials and the request URL belong to the caller. */
function socialMetaBusinessDiscoveryFields(handle, limit) {
    const parsedHandle = post_js_1.SocialHandleSchema.safeParse(handle);
    if (!parsedHandle.success || !Number.isInteger(limit) || limit < 1 || limit > 50) {
        throw new TypeError('invalid_meta_query');
    }
    return `business_discovery.username(${parsedHandle.data}){media.limit(${limit}){${exports.SOCIAL_META_MEDIA_FIELDS.join(',')}}}`;
}
exports.SocialMetaMediaSchema = zod_1.z.strictObject({
    id: zod_1.z.string().regex(/^\d{1,30}$/),
    caption: zod_1.z.string().max(5000).optional(),
    media_type: SocialLegacyKindSchema,
    media_product_type: zod_1.z.string().min(1).max(30).optional(),
    media_url: research_js_1.WebUrlSchema.optional(),
    permalink: research_js_1.WebUrlSchema,
    timestamp: LegacyTimestampSchema,
    like_count: zod_1.z.number().int().nonnegative().optional(),
    comments_count: zod_1.z.number().int().nonnegative().optional(),
});
const SocialMetaPostSchema = post_js_1.SocialPostSchema.omit({ identity: true }).strict();
/** Keep the Meta id shared with the Mac; only a video file can be transcribed. */
function socialPostFromMetaMedia(raw, context) {
    try {
        const parsed = exports.SocialMetaMediaSchema.safeParse(raw);
        if (!parsed.success)
            return { ok: false, error: 'invalid_media' };
        const media = parsed.data;
        const { handle, collectedAt } = context;
        const post = SocialMetaPostSchema.safeParse({
            postId: media.id,
            provider: 'instagram',
            handle,
            link: media.permalink,
            publishedAt: socialImportTimestamp(media.timestamp),
            kind: socialImportKind(media.media_type),
            caption: media.caption ?? '',
            collectedAt,
        });
        if (!post.success)
            return { ok: false, error: 'invalid_media' };
        return {
            ok: true,
            post: post.data,
            ...(media.media_type === 'VIDEO' && media.media_url !== undefined ? { videoUrl: media.media_url } : {}),
        };
    }
    catch {
        // Untrusted objects can throw from accessors during parsing or context reads.
        return { ok: false, error: 'invalid_media' };
    }
}
const LegacyPostIdSchema = zod_1.z.string().min(1).max(100);
/** Historical web text is data. Unknown fields must stop the import rather than disappear. */
exports.SocialLegacyAnalysisRowSchema = zod_1.z.object({
    schema: zod_1.z.literal(exports.SOCIAL_LEGACY_ANALYSIS_SCHEMA),
    analizzato_il: LegacyTimestampSchema,
    pubblicato_il: LegacyTimestampSchema,
    post_id: LegacyPostIdSchema,
    profilo: post_js_1.SocialHandleSchema,
    tipo: SocialLegacyKindSchema,
    link: research_js_1.WebUrlSchema,
    ripubblicazioni: zod_1.z.array(research_js_1.WebUrlSchema).max(50),
    didascalia: zod_1.z.string().max(5000),
    trascrizione: zod_1.z.string().max(60000).nullable(),
    titolo: zod_1.z.string().min(1).max(300),
    strumenti: zod_1.z.array(zod_1.z.object({
        nome: zod_1.z.string(),
        link: zod_1.z.union([research_js_1.WebUrlSchema, zod_1.z.literal('')]),
        cosa_fa: zod_1.z.string(),
    }).strict()).max(20),
    verdetto: SocialLegacyVerdictSchema,
    perche: zod_1.z.string(),
    per_stefano: zod_1.z.string(),
    verticale: post_js_1.SocialVerticalIdSchema.optional(),
}).strict();
exports.SocialLegacyClusterRowSchema = zod_1.z.object({
    schema: zod_1.z.literal(exports.SOCIAL_LEGACY_CLUSTER_SCHEMA),
    argomento: zod_1.z.string().min(1).max(200),
    post_ids: zod_1.z.array(LegacyPostIdSchema).min(1).max(100),
    sintesi: zod_1.z.string().min(1).max(2000),
    fatti: zod_1.z.array(zod_1.z.string().min(1).max(2000)).max(20),
    link: zod_1.z.array(research_js_1.WebUrlSchema).min(1).max(50),
    verdetto: SocialLegacyVerdictSchema,
    angolo_story: zod_1.z.string(),
    verticale: post_js_1.SocialVerticalIdSchema,
    destinazioni: zod_1.z.array(zod_1.z.string()),
    creator: zod_1.z.array(post_js_1.SocialHandleSchema).min(1).max(50),
    n_post: zod_1.z.number().int().min(1),
    ultimo_post: LegacyTimestampSchema,
    calcolato_il: LegacyTimestampSchema,
    hype: zod_1.z.number().min(0).max(10),
    post: zod_1.z.array(zod_1.z.object({
        post_id: LegacyPostIdSchema,
        profilo: post_js_1.SocialHandleSchema,
        link: research_js_1.WebUrlSchema,
    }).strict()),
}).strict();
function socialImportVerdict(verdict) {
    return exports.SOCIAL_LEGACY_VERDICTS[verdict];
}
function socialImportKind(kind) {
    return SOCIAL_LEGACY_KINDS[kind];
}
const SOCIAL_TITLE_TRAILING_WORDS = new Set(('a ad al allo alla ai agli alle con da dal dallo dalla dai dagli dalle di del dello della dei degli delle ' +
    'e ed il lo la i gli le in nel nello nella nei negli nelle o per su sul sullo sulla sui sugli sulle ' +
    'tra fra un uno una che come non').split(' '));
/** No ellipsis: close on the last full word, dropping dangling parentheses, punctuation and linking words. */
function shortenSocialTopicTitle(text) {
    const trimmed = text.trim();
    if (trimmed.length <= topic_js_1.SOCIAL_TOPIC_TITLE_MAX)
        return trimmed || 'Argomento';
    const hardCut = trimmed.slice(0, topic_js_1.SOCIAL_TOPIC_TITLE_MAX);
    const lastSpace = trimmed.lastIndexOf(' ', topic_js_1.SOCIAL_TOPIC_TITLE_MAX);
    let cut = lastSpace > 0 ? trimmed.slice(0, lastSpace) : hardCut;
    const open = cut.lastIndexOf('(');
    if (open > 0 && cut.indexOf(')', open) === -1)
        cut = cut.slice(0, open);
    for (;;) {
        const stripped = cut.replace(/[\s:,;.\-–(]+$/, '');
        const space = stripped.lastIndexOf(' ');
        if (space > 0 && SOCIAL_TITLE_TRAILING_WORDS.has(stripped.slice(space + 1).toLowerCase())) {
            cut = stripped.slice(0, space);
            continue;
        }
        cut = stripped;
        break;
    }
    return cut || hardCut;
}
/** Identity comes exclusively from the caller, and is checked even for already parsed rows. */
function socialImportPost(row, { identity }) {
    const legacy = exports.SocialLegacyAnalysisRowSchema.parse(row);
    return post_js_1.SocialPostSchema.parse({
        identity: capability_call_identity_js_1.CapabilityAgentScopeSchema.parse(identity),
        postId: legacy.post_id,
        provider: 'instagram',
        handle: legacy.profilo,
        link: legacy.link,
        publishedAt: socialImportTimestamp(legacy.pubblicato_il),
        kind: socialImportKind(legacy.tipo),
        caption: legacy.didascalia,
        ...(legacy.trascrizione !== null && legacy.trascrizione !== '' ? { transcript: legacy.trascrizione } : {}),
        collectedAt: socialImportTimestamp(legacy.analizzato_il),
    });
}
function socialImportTopic(row, ctx) {
    const parsed = exports.SocialLegacyClusterRowSchema.safeParse(row);
    if (!parsed.success) {
        const timestampError = parsed.error.issues.some(issue => issue.path[0] === 'calcolato_il' || issue.path[0] === 'ultimo_post');
        return { ok: false, error: timestampError ? 'invalid_timestamp' : 'invalid_topic' };
    }
    const legacy = parsed.data;
    if (legacy.verticale !== ctx.vertical.id)
        return { ok: false, error: 'vertical_mismatch' };
    if (!(0, topic_js_1.socialCategoryInVertical)(ctx.vertical, ctx.category))
        return { ok: false, error: 'category_not_in_vertical' };
    const identity = capability_call_identity_js_1.CapabilityAgentScopeSchema.safeParse(ctx.identity);
    if (!identity.success)
        return { ok: false, error: 'invalid_topic' };
    const computedAt = socialImportTimestamp(legacy.calcolato_il);
    if (computedAt === null)
        return { ok: false, error: 'invalid_timestamp' };
    const topic = topic_js_1.SocialTopicSchema.safeParse({
        identity: identity.data,
        topicId: ctx.topicId,
        verticalId: ctx.vertical.id,
        day: computedAt.slice(0, 10),
        title: shortenSocialTopicTitle(legacy.argomento),
        category: ctx.category,
        summary: legacy.sintesi,
        verdict: socialImportVerdict(legacy.verdetto),
        facts: legacy.fatti.map(text => ({ text, sourceUrls: legacy.link.slice(0, 20) })),
        sources: legacy.link.map(url => ({ url, opened: true })),
        heat: legacy.hype,
        postIds: legacy.post_ids,
        creators: legacy.creator,
        cost: { usd: 0, track: 'mac', uncertain: true },
        computedAt,
    });
    return topic.success ? { ok: true, topic: topic.data } : { ok: false, error: 'invalid_topic' };
}
//# sourceMappingURL=import.js.map