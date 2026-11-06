"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoFootageListSchema = exports.VideoFootageShotSchema = exports.VideoFootageListQuerySchema = exports.VideoFootageJobQuerySchema = exports.VideoFootageJobSchema = exports.VideoFootageAddedSchema = exports.VideoEngineFootageRejectedSchema = exports.VideoFootageRejectionReasonSchema = exports.VideoFootageJobAcceptedSchema = exports.VideoFootageJobIdSchema = exports.VideoFootageAddQuerySchema = exports.VideoFootageFileNameSchema = exports.VideoFootageFramingSchema = exports.VideoFootagePlaceSchema = exports.VideoFootagePersonSchema = exports.VIDEO_FOOTAGE_MAX_PER_PERSON = exports.VIDEO_FOOTAGE_MEDIA_TYPES = exports.VIDEO_FOOTAGE_MAX_BYTES = exports.VideoFootageChoiceSchema = exports.VideoFootageIdSchema = void 0;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
/** Id of one shot of the footage archive on the engine (e.g. `piante-02`). Never a path. */
exports.VideoFootageIdSchema = zod_1.z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/);
/** One or two shots of the same place (a single shot, or the wide/narrow pair of `ibrido-alternato`). */
exports.VideoFootageChoiceSchema = zod_1.z.array(exports.VideoFootageIdSchema).min(1).max(2);
/** Largest shot the engine takes in one upload. */
exports.VIDEO_FOOTAGE_MAX_BYTES = 256 * 1024 * 1024;
/** Containers the engine reads. */
exports.VIDEO_FOOTAGE_MEDIA_TYPES = ['video/mp4', 'video/quicktime', 'video/x-m4v'];
/** Riprese al massimo per tenant e persona, comprese quelle già nell'archivio. */
exports.VIDEO_FOOTAGE_MAX_PER_PERSON = 20;
/** Who is filmed: a slug, never a path. */
exports.VideoFootagePersonSchema = zod_1.z.string().regex(/^[a-z][a-z0-9-]{0,31}$/);
/** Where it was filmed; the shot id `<place>-NN` stays a `VideoFootageIdSchema`. */
exports.VideoFootagePlaceSchema = zod_1.z.string().regex(/^[a-z0-9][a-z0-9-]{0,59}$/);
/** Values of `archivio.json`. */
exports.VideoFootageFramingSchema = zod_1.z.enum(['largo', 'medio', 'stretto']);
exports.VideoFootageFileNameSchema = zod_1.z.string().regex(/^[A-Za-z0-9][A-Za-z0-9 ()._-]{0,119}\.(mp4|mov|m4v|MP4|MOV|M4V)$/);
/** Query of `POST /api/footage`: the identity and the metadata of the shot; the body is the video itself. */
exports.VideoFootageAddQuerySchema = zod_1.z.strictObject({
    ...capability_call_identity_js_1.CapabilityAgentScopeSchema.shape,
    person: exports.VideoFootagePersonSchema,
    place: exports.VideoFootagePlaceSchema,
    outfit: zod_1.z.string().trim().min(1).max(80),
    group: exports.VideoFootageIdSchema.optional(),
    framing: exports.VideoFootageFramingSchema,
    note: zod_1.z.string().max(500).optional(),
    fileName: exports.VideoFootageFileNameSchema,
});
// Same pattern as `VideoEngineIdSchema` and same `error` as `VideoEngineErrorSchema` (engine.ts): not imported, because
// engine.ts -> brief.ts -> this file would be a cycle; footage-add.test.ts pins the two to the engine ones.
/** Id of a footage job on the engine. */
exports.VideoFootageJobIdSchema = zod_1.z.string().regex(/^[a-f0-9]{32}$/);
const VideoFootageErrorTextSchema = zod_1.z.string().min(1).max(2000);
exports.VideoFootageJobAcceptedSchema = zod_1.z.strictObject({ jobId: exports.VideoFootageJobIdSchema });
/** Why the engine refuses a shot (`motivo` of `RipresaRifiutata`, `archivio.py`). */
exports.VideoFootageRejectionReasonSchema = zod_1.z.enum(['doppione', 'illeggibile', 'troppo_corta', 'risoluzione_bassa', 'senza_volto', 'nessuna_scena']);
/** Synchronous 422 (a duplicate): the reason is `code`; it is also a valid `VideoEngineErrorSchema`. */
exports.VideoEngineFootageRejectedSchema = zod_1.z.strictObject({
    error: VideoFootageErrorTextSchema,
    operation_state: zod_1.z.literal('rejected'),
    code: exports.VideoFootageRejectionReasonSchema,
});
exports.VideoFootageAddedSchema = zod_1.z.strictObject({
    id: exports.VideoFootageIdSchema,
    scenes: zod_1.z.number().int().positive(),
    durationSeconds: zod_1.z.number().positive(),
});
const jobBase = { jobId: exports.VideoFootageJobIdSchema, fileName: exports.VideoFootageFileNameSchema };
/** State of one footage job: `queued`/`running` = in progress, `completed` = done, `rejected` = refused with a reason. */
exports.VideoFootageJobSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ ...jobBase, status: zod_1.z.literal('queued') }),
    zod_1.z.strictObject({ ...jobBase, status: zod_1.z.literal('running') }),
    zod_1.z.strictObject({ ...jobBase, status: zod_1.z.literal('completed'), footage: exports.VideoFootageAddedSchema }),
    zod_1.z.strictObject({ ...jobBase, status: zod_1.z.literal('rejected'), code: exports.VideoFootageRejectionReasonSchema, error: VideoFootageErrorTextSchema }),
    zod_1.z.strictObject({ ...jobBase, status: zod_1.z.literal('failed'), error: VideoFootageErrorTextSchema }),
    zod_1.z.strictObject({ ...jobBase, status: zod_1.z.literal('interrupted'), error: VideoFootageErrorTextSchema }),
]);
exports.VideoFootageJobQuerySchema = capability_call_identity_js_1.CapabilityAgentScopeSchema;
/** Query of `GET /api/footage`: the identity and the person whose archive is read. */
exports.VideoFootageListQuerySchema = zod_1.z.strictObject({
    ...capability_call_identity_js_1.CapabilityAgentScopeSchema.shape,
    person: exports.VideoFootagePersonSchema,
});
/** One shot of the archive (`id`, `posto`, `abito`, `inquadratura`, `gruppo`, `durata`, `sha256`, `originale` of `archivio.json`). */
exports.VideoFootageShotSchema = zod_1.z.strictObject({
    id: exports.VideoFootageIdSchema,
    place: exports.VideoFootagePlaceSchema,
    outfit: zod_1.z.string().min(1).max(80),
    framing: exports.VideoFootageFramingSchema,
    group: exports.VideoFootageIdSchema.optional(),
    durationSeconds: zod_1.z.number().positive(),
    scenes: zod_1.z.number().int().nonnegative(),
    sha256: zod_1.z.string().regex(/^[0-9a-f]{64}$/),
    fileName: zod_1.z.string().min(1).max(300),
});
exports.VideoFootageListSchema = zod_1.z.strictObject({
    person: exports.VideoFootagePersonSchema,
    shots: zod_1.z.array(exports.VideoFootageShotSchema).max(500),
});
//# sourceMappingURL=footage.js.map