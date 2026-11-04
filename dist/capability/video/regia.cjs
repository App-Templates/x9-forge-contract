"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoRegiaErrorSchema = exports.VideoRegiaErrorCodeSchema = exports.VideoRegiaResultSchema = exports.VideoRegiaFileSchema = exports.VideoRegiaResultRequestSchema = exports.VideoRegiaOpenResponseSchema = exports.VideoRegiaIdSchema = exports.VideoRegiaRequestSchema = exports.VIDEO_REGIA_MAX_FOOTAGE_CANDIDATES = exports.VideoRegiaMaterialSchema = exports.VideoRegiaDocumentSchema = exports.VIDEO_REGIA_GRAPHIC_FILE = exports.VIDEO_REGIA_FILE = void 0;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
const session_assignment_js_1 = require("../dev/session-assignment.cjs");
const brief_js_1 = require("./brief.cjs");
const footage_js_1 = require("./footage.cjs");
const story_js_1 = require("./story.cjs");
/**
 * Regia of a video (cap-video → cap-dev → session on the owner's laptop → cap-dev → cap-video).
 *
 * cap-video asks cap-dev for a `design` session on the existing session board; the session writes the script and the
 * graphic and delivers two files at the root of the delivery: `regia.json` and `grafica.html`. cap-dev reads the delivery
 * the way `dev_session_result` does (commit on the delivery branch, SHA-256 and size of every file) and hands both files
 * back to cap-video. Nothing here is a credential; the identity is the one cap-video's envelope admitted (R-33).
 */
/** The two files the session must deliver, at the root of the delivery. */
exports.VIDEO_REGIA_FILE = 'regia.json';
exports.VIDEO_REGIA_GRAPHIC_FILE = 'grafica.html';
/** `regia.json`: scenes with their voice tags, the chosen shots (absent for the pure infographic) and the closing. */
exports.VideoRegiaDocumentSchema = zod_1.z.strictObject({
    version: zod_1.z.literal(1),
    scenes: story_js_1.VideoStoryScenesSchema,
    footage: footage_js_1.VideoFootageChoiceSchema.optional(),
    outro: story_js_1.VideoStoryOutroSchema,
});
/** A reference the session reads: a GitHub link (preset file, example graphic, recipe), with a short note. */
exports.VideoRegiaMaterialSchema = zod_1.z.strictObject({
    url: session_assignment_js_1.DevSessionGitHubLinkSchema,
    note: zod_1.z.string().trim().min(1).max(500).optional(),
});
exports.VIDEO_REGIA_MAX_FOOTAGE_CANDIDATES = 50;
/**
 * cap-video → cap-dev: open the regia of one video project. `identity` is the requester cap-video admitted from the
 * agent-core envelope; cap-dev resolves it again against the platform inventory before writing it in the incarico.
 * `footage` is the shot the person chose (absent: the regia chooses among `footageCandidates`). `recipe` is the text
 * of the preset recipe when it has no GitHub link of its own.
 */
exports.VideoRegiaRequestSchema = zod_1.z.strictObject({
    identity: capability_call_identity_js_1.CapabilityAgentScopeSchema,
    videoProjectId: brief_js_1.VideoProjectIdSchema,
    brief: brief_js_1.VideoBriefRequestSchema.shape.brief,
    presetId: brief_js_1.VideoPresetIdSchema,
    footageCandidates: zod_1.z.array(footage_js_1.VideoFootageIdSchema).max(exports.VIDEO_REGIA_MAX_FOOTAGE_CANDIDATES),
    footage: footage_js_1.VideoFootageChoiceSchema.optional(),
    recipe: zod_1.z.string().min(1).max(12000).optional(),
    materials: zod_1.z.array(exports.VideoRegiaMaterialSchema).min(1).max(10),
});
/** Number of the incarico on the session board (issue `regiaId`, delivery branch `consegna/<regiaId>`). */
exports.VideoRegiaIdSchema = zod_1.z.number().int().min(1).max(1_000_000);
/** cap-dev → cap-video: the incarico opened (or the same one already open, `repeated`). */
exports.VideoRegiaOpenResponseSchema = zod_1.z.strictObject({
    regiaId: exports.VideoRegiaIdSchema,
    repeated: zod_1.z.boolean(),
    repo: session_assignment_js_1.DevSessionRepoSchema,
    branch: zod_1.z.string().min(1).max(255),
});
/** cap-video → cap-dev: read the result of one regia, for the identity that opened it. */
exports.VideoRegiaResultRequestSchema = zod_1.z.strictObject({ identity: capability_call_identity_js_1.CapabilityAgentScopeSchema });
/** One delivered file as cap-dev verified it at the delivery commit (same shape as the session delivery). */
exports.VideoRegiaFileSchema = zod_1.z.strictObject({
    path: zod_1.z.string().min(1).max(1024),
    sha256: zod_1.z.string().regex(/^[0-9a-f]{64}$/),
    sizeBytes: zod_1.z.number().int().min(0),
});
/**
 * The result of a regia: still `pending` (the session is working), `failed` (closed without a verifiable delivery, or
 * with files that do not respect the contract) or `delivered` with `regia.json` parsed and `grafica.html` as text.
 * The consumer checks `graphicHtml` against `graphicFile.sha256` again before using it.
 */
exports.VideoRegiaResultSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({
        status: zod_1.z.literal('pending'),
        regiaId: exports.VideoRegiaIdSchema,
        boardState: zod_1.z.string().max(64).nullable(),
    }),
    zod_1.z.strictObject({
        status: zod_1.z.literal('failed'),
        regiaId: exports.VideoRegiaIdSchema,
        reason: zod_1.z.string().min(1).max(500),
    }),
    zod_1.z.strictObject({
        status: zod_1.z.literal('delivered'),
        regiaId: exports.VideoRegiaIdSchema,
        repo: session_assignment_js_1.DevSessionRepoSchema,
        branch: zod_1.z.string().min(1).max(255),
        commit: session_assignment_js_1.DevSessionCommitSchema,
        link: zod_1.z.string().max(2048),
        regia: exports.VideoRegiaDocumentSchema,
        regiaFile: exports.VideoRegiaFileSchema,
        graphicHtml: story_js_1.VideoGraphicHtmlSchema,
        graphicFile: exports.VideoRegiaFileSchema,
    }),
]);
/** Error body of both regia routes. */
exports.VideoRegiaErrorCodeSchema = zod_1.z.enum(['invalid_request', 'identity_refused', 'not_found', 'unavailable', 'board_error']);
exports.VideoRegiaErrorSchema = zod_1.z.strictObject({
    code: exports.VideoRegiaErrorCodeSchema,
    error: zod_1.z.string().min(1).max(500),
});
//# sourceMappingURL=regia.js.map