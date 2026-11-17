import { z } from 'zod';
import { type SocialPost, type SocialPostKind } from "./post.js";
import { type SocialTopic, type SocialVerdict, type SocialVertical } from "./topic.js";
export declare const SOCIAL_LEGACY_ANALYSIS_SCHEMA = "ig-ascolto-analisi-v1";
export declare const SOCIAL_LEGACY_CLUSTER_SCHEMA = "ig-ascolto-cluster-v1";
declare const SocialLegacyVerdictSchema: z.ZodEnum<{
    fuffa: "fuffa";
    funzionale: "funzionale";
    "da provare": "da provare";
    "non funzionale": "non funzionale";
}>;
export type SocialLegacyVerdict = z.infer<typeof SocialLegacyVerdictSchema>;
export declare const SOCIAL_LEGACY_VERDICTS: {
    funzionale: "funziona";
    'da provare': "da_provare";
    'non funzionale': "non_funziona";
    fuffa: "fuffa";
};
declare const SocialLegacyKindSchema: z.ZodEnum<{
    VIDEO: "VIDEO";
    CAROUSEL_ALBUM: "CAROUSEL_ALBUM";
    IMAGE: "IMAGE";
}>;
export type SocialLegacyKind = z.infer<typeof SocialLegacyKindSchema>;
/** Preserve local time and offset; only the missing offset colon is repaired. */
export declare function socialImportTimestamp(value: string): string | null;
/** Historical web text is data. Unknown fields must stop the import rather than disappear. */
export declare const SocialLegacyAnalysisRowSchema: z.ZodObject<{
    schema: z.ZodLiteral<"ig-ascolto-analisi-v1">;
    analizzato_il: z.ZodString;
    pubblicato_il: z.ZodString;
    post_id: z.ZodString;
    profilo: z.ZodString;
    tipo: z.ZodEnum<{
        VIDEO: "VIDEO";
        CAROUSEL_ALBUM: "CAROUSEL_ALBUM";
        IMAGE: "IMAGE";
    }>;
    link: z.ZodString;
    ripubblicazioni: z.ZodArray<z.ZodString>;
    didascalia: z.ZodString;
    trascrizione: z.ZodNullable<z.ZodString>;
    titolo: z.ZodString;
    strumenti: z.ZodArray<z.ZodObject<{
        nome: z.ZodString;
        link: z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>;
        cosa_fa: z.ZodString;
    }, z.core.$strict>>;
    verdetto: z.ZodEnum<{
        fuffa: "fuffa";
        funzionale: "funzionale";
        "da provare": "da provare";
        "non funzionale": "non funzionale";
    }>;
    perche: z.ZodString;
    per_stefano: z.ZodString;
    verticale: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type SocialLegacyAnalysisRow = z.infer<typeof SocialLegacyAnalysisRowSchema>;
export declare const SocialLegacyClusterRowSchema: z.ZodObject<{
    schema: z.ZodLiteral<"ig-ascolto-cluster-v1">;
    argomento: z.ZodString;
    post_ids: z.ZodArray<z.ZodString>;
    sintesi: z.ZodString;
    fatti: z.ZodArray<z.ZodString>;
    link: z.ZodArray<z.ZodString>;
    verdetto: z.ZodEnum<{
        fuffa: "fuffa";
        funzionale: "funzionale";
        "da provare": "da provare";
        "non funzionale": "non funzionale";
    }>;
    angolo_story: z.ZodString;
    verticale: z.ZodString;
    destinazioni: z.ZodArray<z.ZodString>;
    creator: z.ZodArray<z.ZodString>;
    n_post: z.ZodNumber;
    ultimo_post: z.ZodString;
    calcolato_il: z.ZodString;
    hype: z.ZodNumber;
    post: z.ZodArray<z.ZodObject<{
        post_id: z.ZodString;
        profilo: z.ZodString;
        link: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type SocialLegacyClusterRow = z.infer<typeof SocialLegacyClusterRowSchema>;
export declare function socialImportVerdict(verdict: SocialLegacyVerdict): SocialVerdict;
export declare function socialImportKind(kind: SocialLegacyKind): SocialPostKind;
/** No ellipsis: close on the last full word, dropping dangling parentheses, punctuation and linking words. */
export declare function shortenSocialTopicTitle(text: string): string;
/** Identity comes exclusively from the caller, and is checked even for already parsed rows. */
export declare function socialImportPost(row: unknown, { identity }: {
    identity: unknown;
}): SocialPost;
export type SocialImportTopicContext = {
    /** Untrusted at runtime; the capability scope schema is the admission boundary. */
    identity: unknown;
    topicId: string;
    vertical: Pick<SocialVertical, 'id' | 'categories'>;
    category: string;
};
export type SocialImportTopicResult = {
    ok: true;
    topic: SocialTopic;
} | {
    ok: false;
    error: 'vertical_mismatch' | 'category_not_in_vertical' | 'invalid_timestamp' | 'invalid_topic';
};
export declare function socialImportTopic(row: unknown, ctx: SocialImportTopicContext): SocialImportTopicResult;
export {};
//# sourceMappingURL=import.d.ts.map