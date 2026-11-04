import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../capability-call-identity.js";
import { DevSessionCommitSchema, DevSessionGitHubLinkSchema, DevSessionRepoSchema } from "../dev/session-assignment.js";
import { VideoBriefRequestSchema, VideoPresetIdSchema, VideoProjectIdSchema } from "./brief.js";
import { VideoFootageChoiceSchema, VideoFootageIdSchema } from "./footage.js";
import { VideoGraphicHtmlSchema, VideoStoryOutroSchema, VideoStoryScenesSchema, } from "./story.js";
/**
 * Regia of a video (cap-video → cap-dev → session on the owner's laptop → cap-dev → cap-video).
 *
 * cap-video asks cap-dev for a `design` session on the existing session board; the session writes the script and the
 * graphic and delivers two files at the root of the delivery: `regia.json` and `grafica.html`. cap-dev reads the delivery
 * the way `dev_session_result` does (commit on the delivery branch, SHA-256 and size of every file) and hands both files
 * back to cap-video. Nothing here is a credential; the identity is the one cap-video's envelope admitted (R-33).
 */
/** The two files the session must deliver, at the root of the delivery. */
export const VIDEO_REGIA_FILE = 'regia.json';
export const VIDEO_REGIA_GRAPHIC_FILE = 'grafica.html';
/** `regia.json`: scenes with their voice tags, the chosen shots (absent for the pure infographic) and the closing. */
export const VideoRegiaDocumentSchema = z.strictObject({
    version: z.literal(1),
    scenes: VideoStoryScenesSchema,
    footage: VideoFootageChoiceSchema.optional(),
    outro: VideoStoryOutroSchema,
});
/** A reference the session reads: a GitHub link (preset file, example graphic, recipe), with a short note. */
export const VideoRegiaMaterialSchema = z.strictObject({
    url: DevSessionGitHubLinkSchema,
    note: z.string().trim().min(1).max(500).optional(),
});
export const VIDEO_REGIA_MAX_FOOTAGE_CANDIDATES = 50;
/**
 * cap-video → cap-dev: open the regia of one video project. `identity` is the requester cap-video admitted from the
 * agent-core envelope; cap-dev resolves it again against the platform inventory before writing it in the incarico.
 * `footage` is the shot the person chose (absent: the regia chooses among `footageCandidates`). `recipe` is the text
 * of the preset recipe when it has no GitHub link of its own.
 */
export const VideoRegiaRequestSchema = z.strictObject({
    identity: CapabilityAgentScopeSchema,
    videoProjectId: VideoProjectIdSchema,
    brief: VideoBriefRequestSchema.shape.brief,
    presetId: VideoPresetIdSchema,
    footageCandidates: z.array(VideoFootageIdSchema).max(VIDEO_REGIA_MAX_FOOTAGE_CANDIDATES),
    footage: VideoFootageChoiceSchema.optional(),
    recipe: z.string().min(1).max(12000).optional(),
    materials: z.array(VideoRegiaMaterialSchema).min(1).max(10),
});
/** Number of the incarico on the session board (issue `regiaId`, delivery branch `consegna/<regiaId>`). */
export const VideoRegiaIdSchema = z.number().int().min(1).max(1_000_000);
/** cap-dev → cap-video: the incarico opened (or the same one already open, `repeated`). */
export const VideoRegiaOpenResponseSchema = z.strictObject({
    regiaId: VideoRegiaIdSchema,
    repeated: z.boolean(),
    repo: DevSessionRepoSchema,
    branch: z.string().min(1).max(255),
});
/** cap-video → cap-dev: read the result of one regia, for the identity that opened it. */
export const VideoRegiaResultRequestSchema = z.strictObject({ identity: CapabilityAgentScopeSchema });
/** One delivered file as cap-dev verified it at the delivery commit (same shape as the session delivery). */
export const VideoRegiaFileSchema = z.strictObject({
    path: z.string().min(1).max(1024),
    sha256: z.string().regex(/^[0-9a-f]{64}$/),
    sizeBytes: z.number().int().min(0),
});
/**
 * The result of a regia: still `pending` (the session is working), `failed` (closed without a verifiable delivery, or
 * with files that do not respect the contract) or `delivered` with `regia.json` parsed and `grafica.html` as text.
 * The consumer checks `graphicHtml` against `graphicFile.sha256` again before using it.
 */
export const VideoRegiaResultSchema = z.discriminatedUnion('status', [
    z.strictObject({
        status: z.literal('pending'),
        regiaId: VideoRegiaIdSchema,
        boardState: z.string().max(64).nullable(),
    }),
    z.strictObject({
        status: z.literal('failed'),
        regiaId: VideoRegiaIdSchema,
        reason: z.string().min(1).max(500),
    }),
    z.strictObject({
        status: z.literal('delivered'),
        regiaId: VideoRegiaIdSchema,
        repo: DevSessionRepoSchema,
        branch: z.string().min(1).max(255),
        commit: DevSessionCommitSchema,
        link: z.string().max(2048),
        regia: VideoRegiaDocumentSchema,
        regiaFile: VideoRegiaFileSchema,
        graphicHtml: VideoGraphicHtmlSchema,
        graphicFile: VideoRegiaFileSchema,
    }),
]);
/** Error body of both regia routes. */
export const VideoRegiaErrorCodeSchema = z.enum(['invalid_request', 'identity_refused', 'not_found', 'unavailable', 'board_error']);
export const VideoRegiaErrorSchema = z.strictObject({
    code: VideoRegiaErrorCodeSchema,
    error: z.string().min(1).max(500),
});
//# sourceMappingURL=regia.js.map