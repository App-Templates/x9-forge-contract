import { z } from 'zod';
/**
 * Regia of a video (cap-video → cap-dev → session on the owner's laptop → cap-dev → cap-video).
 *
 * cap-video asks cap-dev for a `design` session on the existing session board; the session writes the script and the
 * graphic and delivers two files at the root of the delivery: `regia.json` and `grafica.html`. cap-dev reads the delivery
 * the way `dev_session_result` does (commit on the delivery branch, SHA-256 and size of every file) and hands both files
 * back to cap-video. Nothing here is a credential; the identity is the one cap-video's envelope admitted (R-33).
 */
/** The two files the session must deliver, at the root of the delivery. */
export declare const VIDEO_REGIA_FILE: "regia.json";
export declare const VIDEO_REGIA_GRAPHIC_FILE: "grafica.html";
/** `regia.json`: scenes with their voice tags, the chosen shots (absent for the pure infographic) and the closing. */
export declare const VideoRegiaDocumentSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    scenes: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>>;
    footage: z.ZodOptional<z.ZodArray<z.ZodString>>;
    outro: z.ZodObject<{
        title: z.ZodString;
        line: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type VideoRegiaDocument = z.infer<typeof VideoRegiaDocumentSchema>;
/** A reference the session reads: a GitHub link (preset file, example graphic, recipe), with a short note. */
export declare const VideoRegiaMaterialSchema: z.ZodObject<{
    url: z.ZodString;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type VideoRegiaMaterial = z.infer<typeof VideoRegiaMaterialSchema>;
export declare const VIDEO_REGIA_MAX_FOOTAGE_CANDIDATES = 50;
/**
 * cap-video → cap-dev: open the regia of one video project. `identity` is the requester cap-video admitted from the
 * agent-core envelope; cap-dev resolves it again against the platform inventory before writing it in the incarico.
 * `footage` is the shot the person chose (absent: the regia chooses among `footageCandidates`). `recipe` is the text
 * of the preset recipe when it has no GitHub link of its own.
 */
export declare const VideoRegiaRequestSchema: z.ZodObject<{
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    videoProjectId: z.ZodString;
    brief: z.ZodString;
    presetId: z.ZodString;
    footageCandidates: z.ZodArray<z.ZodString>;
    footage: z.ZodOptional<z.ZodArray<z.ZodString>>;
    recipe: z.ZodOptional<z.ZodString>;
    materials: z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        note: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type VideoRegiaRequest = z.infer<typeof VideoRegiaRequestSchema>;
/** Number of the incarico on the session board (issue `regiaId`, delivery branch `consegna/<regiaId>`). */
export declare const VideoRegiaIdSchema: z.ZodNumber;
/** cap-dev → cap-video: the incarico opened (or the same one already open, `repeated`). */
export declare const VideoRegiaOpenResponseSchema: z.ZodObject<{
    regiaId: z.ZodNumber;
    repeated: z.ZodBoolean;
    repo: z.ZodString;
    branch: z.ZodString;
}, z.core.$strict>;
export type VideoRegiaOpenResponse = z.infer<typeof VideoRegiaOpenResponseSchema>;
/** cap-video → cap-dev: read the result of one regia, for the identity that opened it. */
export declare const VideoRegiaResultRequestSchema: z.ZodObject<{
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type VideoRegiaResultRequest = z.infer<typeof VideoRegiaResultRequestSchema>;
/** One delivered file as cap-dev verified it at the delivery commit (same shape as the session delivery). */
export declare const VideoRegiaFileSchema: z.ZodObject<{
    path: z.ZodString;
    sha256: z.ZodString;
    sizeBytes: z.ZodNumber;
}, z.core.$strict>;
export type VideoRegiaFile = z.infer<typeof VideoRegiaFileSchema>;
/**
 * The result of a regia: still `pending` (the session is working), `failed` (closed without a verifiable delivery, or
 * with files that do not respect the contract) or `delivered` with `regia.json` parsed and `grafica.html` as text.
 * The consumer checks `graphicHtml` against `graphicFile.sha256` again before using it.
 */
export declare const VideoRegiaResultSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"pending">;
    regiaId: z.ZodNumber;
    boardState: z.ZodNullable<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"failed">;
    regiaId: z.ZodNumber;
    reason: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"delivered">;
    regiaId: z.ZodNumber;
    repo: z.ZodString;
    branch: z.ZodString;
    commit: z.ZodString;
    link: z.ZodString;
    regia: z.ZodObject<{
        version: z.ZodLiteral<1>;
        scenes: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>>;
        footage: z.ZodOptional<z.ZodArray<z.ZodString>>;
        outro: z.ZodObject<{
            title: z.ZodString;
            line: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>;
    regiaFile: z.ZodObject<{
        path: z.ZodString;
        sha256: z.ZodString;
        sizeBytes: z.ZodNumber;
    }, z.core.$strict>;
    graphicHtml: z.ZodString;
    graphicFile: z.ZodObject<{
        path: z.ZodString;
        sha256: z.ZodString;
        sizeBytes: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>], "status">;
export type VideoRegiaResult = z.infer<typeof VideoRegiaResultSchema>;
/** Error body of both regia routes. */
export declare const VideoRegiaErrorCodeSchema: z.ZodEnum<{
    unavailable: "unavailable";
    invalid_request: "invalid_request";
    not_found: "not_found";
    identity_refused: "identity_refused";
    board_error: "board_error";
}>;
export declare const VideoRegiaErrorSchema: z.ZodObject<{
    code: z.ZodEnum<{
        unavailable: "unavailable";
        invalid_request: "invalid_request";
        not_found: "not_found";
        identity_refused: "identity_refused";
        board_error: "board_error";
    }>;
    error: z.ZodString;
}, z.core.$strict>;
export type VideoRegiaError = z.infer<typeof VideoRegiaErrorSchema>;
//# sourceMappingURL=regia.d.ts.map