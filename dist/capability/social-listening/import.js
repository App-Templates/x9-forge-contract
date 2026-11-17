import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../capability-call-identity.js";
import { WebUrlSchema } from "../ricerca/research.js";
import { SocialHandleSchema, SocialPostSchema, SocialVerticalIdSchema, } from "./post.js";
import { SOCIAL_TOPIC_TITLE_MAX, SocialTopicSchema, socialCategoryInVertical, } from "./topic.js";
export const SOCIAL_LEGACY_ANALYSIS_SCHEMA = 'ig-ascolto-analisi-v1';
export const SOCIAL_LEGACY_CLUSTER_SCHEMA = 'ig-ascolto-cluster-v1';
const SocialLegacyVerdictSchema = z.enum(['funzionale', 'da provare', 'non funzionale', 'fuffa']);
export const SOCIAL_LEGACY_VERDICTS = {
    funzionale: 'funziona',
    'da provare': 'da_provare',
    'non funzionale': 'non_funziona',
    fuffa: 'fuffa',
};
const SocialLegacyKindSchema = z.enum(['VIDEO', 'CAROUSEL_ALBUM', 'IMAGE']);
const SOCIAL_LEGACY_KINDS = {
    VIDEO: 'video',
    CAROUSEL_ALBUM: 'carousel',
    IMAGE: 'image',
};
const IsoDateTimeSchema = z.iso.datetime({ offset: true });
/** Preserve local time and offset; only the missing offset colon is repaired. */
export function socialImportTimestamp(value) {
    if (!/[+-]\d{2}:?\d{2}$/.test(value))
        return null;
    const normalized = value.replace(/([+-]\d{2})(\d{2})$/, '$1:$2');
    return IsoDateTimeSchema.safeParse(normalized).success ? normalized : null;
}
const LegacyTimestampSchema = z.string().refine(value => socialImportTimestamp(value) !== null, 'expected a date-time with a valid numeric offset');
const LegacyPostIdSchema = z.string().min(1).max(100);
/** Historical web text is data. Unknown fields must stop the import rather than disappear. */
export const SocialLegacyAnalysisRowSchema = z.object({
    schema: z.literal(SOCIAL_LEGACY_ANALYSIS_SCHEMA),
    analizzato_il: LegacyTimestampSchema,
    pubblicato_il: LegacyTimestampSchema,
    post_id: LegacyPostIdSchema,
    profilo: SocialHandleSchema,
    tipo: SocialLegacyKindSchema,
    link: WebUrlSchema,
    ripubblicazioni: z.array(WebUrlSchema).max(50),
    didascalia: z.string().max(5000),
    trascrizione: z.string().max(60000).nullable(),
    titolo: z.string().min(1).max(300),
    strumenti: z.array(z.object({
        nome: z.string(),
        link: z.union([WebUrlSchema, z.literal('')]),
        cosa_fa: z.string(),
    }).strict()).max(20),
    verdetto: SocialLegacyVerdictSchema,
    perche: z.string(),
    per_stefano: z.string(),
    verticale: SocialVerticalIdSchema.optional(),
}).strict();
export const SocialLegacyClusterRowSchema = z.object({
    schema: z.literal(SOCIAL_LEGACY_CLUSTER_SCHEMA),
    argomento: z.string().min(1).max(200),
    post_ids: z.array(LegacyPostIdSchema).min(1).max(100),
    sintesi: z.string().min(1).max(2000),
    fatti: z.array(z.string().min(1).max(2000)).max(20),
    link: z.array(WebUrlSchema).min(1).max(50),
    verdetto: SocialLegacyVerdictSchema,
    angolo_story: z.string(),
    verticale: SocialVerticalIdSchema,
    destinazioni: z.array(z.string()),
    creator: z.array(SocialHandleSchema).min(1).max(50),
    n_post: z.number().int().min(1),
    ultimo_post: LegacyTimestampSchema,
    calcolato_il: LegacyTimestampSchema,
    hype: z.number().min(0).max(10),
    post: z.array(z.object({
        post_id: LegacyPostIdSchema,
        profilo: SocialHandleSchema,
        link: WebUrlSchema,
    }).strict()),
}).strict();
export function socialImportVerdict(verdict) {
    return SOCIAL_LEGACY_VERDICTS[verdict];
}
export function socialImportKind(kind) {
    return SOCIAL_LEGACY_KINDS[kind];
}
const SOCIAL_TITLE_TRAILING_WORDS = new Set(('a ad al allo alla ai agli alle con da dal dallo dalla dai dagli dalle di del dello della dei degli delle ' +
    'e ed il lo la i gli le in nel nello nella nei negli nelle o per su sul sullo sulla sui sugli sulle ' +
    'tra fra un uno una che come non').split(' '));
/** No ellipsis: close on the last full word, dropping dangling parentheses, punctuation and linking words. */
export function shortenSocialTopicTitle(text) {
    const trimmed = text.trim();
    if (trimmed.length <= SOCIAL_TOPIC_TITLE_MAX)
        return trimmed || 'Argomento';
    const hardCut = trimmed.slice(0, SOCIAL_TOPIC_TITLE_MAX);
    const lastSpace = trimmed.lastIndexOf(' ', SOCIAL_TOPIC_TITLE_MAX);
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
export function socialImportPost(row, { identity }) {
    const legacy = SocialLegacyAnalysisRowSchema.parse(row);
    return SocialPostSchema.parse({
        identity: CapabilityAgentScopeSchema.parse(identity),
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
export function socialImportTopic(row, ctx) {
    const parsed = SocialLegacyClusterRowSchema.safeParse(row);
    if (!parsed.success) {
        const timestampError = parsed.error.issues.some(issue => issue.path[0] === 'calcolato_il' || issue.path[0] === 'ultimo_post');
        return { ok: false, error: timestampError ? 'invalid_timestamp' : 'invalid_topic' };
    }
    const legacy = parsed.data;
    if (legacy.verticale !== ctx.vertical.id)
        return { ok: false, error: 'vertical_mismatch' };
    if (!socialCategoryInVertical(ctx.vertical, ctx.category))
        return { ok: false, error: 'category_not_in_vertical' };
    const identity = CapabilityAgentScopeSchema.safeParse(ctx.identity);
    if (!identity.success)
        return { ok: false, error: 'invalid_topic' };
    const computedAt = socialImportTimestamp(legacy.calcolato_il);
    if (computedAt === null)
        return { ok: false, error: 'invalid_timestamp' };
    const topic = SocialTopicSchema.safeParse({
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