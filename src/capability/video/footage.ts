import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../capability-call-identity.js';

/** Id of one shot of the footage archive on the engine (e.g. `piante-02`). Never a path. */
export const VideoFootageIdSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/);
export type VideoFootageId = z.infer<typeof VideoFootageIdSchema>;

/** One or two shots of the same place (a single shot, or the wide/narrow pair of `ibrido-alternato`). */
export const VideoFootageChoiceSchema = z.array(VideoFootageIdSchema).min(1).max(2);
export type VideoFootageChoice = z.infer<typeof VideoFootageChoiceSchema>;

/** Largest shot the engine takes in one upload. */
export const VIDEO_FOOTAGE_MAX_BYTES = 256 * 1024 * 1024;
/** Containers the engine reads. */
export const VIDEO_FOOTAGE_MEDIA_TYPES = ['video/mp4', 'video/quicktime', 'video/x-m4v'] as const;

/** Riprese al massimo per tenant e persona, comprese quelle già nell'archivio. */
export const VIDEO_FOOTAGE_MAX_PER_PERSON = 20;

/** Who is filmed: a slug, never a path. */
export const VideoFootagePersonSchema = z.string().regex(/^[a-z][a-z0-9-]{0,31}$/);
export type VideoFootagePerson = z.infer<typeof VideoFootagePersonSchema>;
/** Where it was filmed; the shot id `<place>-NN` stays a `VideoFootageIdSchema`. */
export const VideoFootagePlaceSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,59}$/);
export type VideoFootagePlace = z.infer<typeof VideoFootagePlaceSchema>;
/** Values of `archivio.json`. */
export const VideoFootageFramingSchema = z.enum(['largo', 'medio', 'stretto']);
export type VideoFootageFraming = z.infer<typeof VideoFootageFramingSchema>;
export const VideoFootageFileNameSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9 ()._-]{0,119}\.(mp4|mov|m4v|MP4|MOV|M4V)$/);
export type VideoFootageFileName = z.infer<typeof VideoFootageFileNameSchema>;

/** Query of `POST /api/footage`: the identity and the metadata of the shot; the body is the video itself. */
export const VideoFootageAddQuerySchema = z.strictObject({
  ...CapabilityAgentScopeSchema.shape,
  person: VideoFootagePersonSchema,
  place: VideoFootagePlaceSchema,
  outfit: z.string().trim().min(1).max(80),
  group: VideoFootageIdSchema.optional(),
  framing: VideoFootageFramingSchema,
  note: z.string().max(500).optional(),
  fileName: VideoFootageFileNameSchema,
});
export type VideoFootageAddQuery = z.infer<typeof VideoFootageAddQuerySchema>;

// Same pattern as `VideoEngineIdSchema` and same `error` as `VideoEngineErrorSchema` (engine.ts): not imported, because
// engine.ts -> brief.ts -> this file would be a cycle; footage-add.test.ts pins the two to the engine ones.
/** Id of a footage job on the engine. */
export const VideoFootageJobIdSchema = z.string().regex(/^[a-f0-9]{32}$/);
export type VideoFootageJobId = z.infer<typeof VideoFootageJobIdSchema>;
const VideoFootageErrorTextSchema = z.string().min(1).max(2000);

export const VideoFootageJobAcceptedSchema = z.strictObject({ jobId: VideoFootageJobIdSchema });
export type VideoFootageJobAccepted = z.infer<typeof VideoFootageJobAcceptedSchema>;

/** Why the engine refuses a shot (`motivo` of `RipresaRifiutata`, `archivio.py`). */
export const VideoFootageRejectionReasonSchema = z.enum(['doppione', 'illeggibile', 'troppo_corta', 'risoluzione_bassa', 'senza_volto', 'nessuna_scena']);
export type VideoFootageRejectionReason = z.infer<typeof VideoFootageRejectionReasonSchema>;

/** Synchronous 422 (a duplicate): the reason is `code`; it is also a valid `VideoEngineErrorSchema`. */
export const VideoEngineFootageRejectedSchema = z.strictObject({
  error: VideoFootageErrorTextSchema,
  operation_state: z.literal('rejected'),
  code: VideoFootageRejectionReasonSchema,
});
export type VideoEngineFootageRejected = z.infer<typeof VideoEngineFootageRejectedSchema>;

export const VideoFootageAddedSchema = z.strictObject({
  id: VideoFootageIdSchema,
  scenes: z.number().int().positive(),
  durationSeconds: z.number().positive(),
});
export type VideoFootageAdded = z.infer<typeof VideoFootageAddedSchema>;

const jobBase = { jobId: VideoFootageJobIdSchema, fileName: VideoFootageFileNameSchema };
/** State of one footage job: `queued`/`running` = in progress, `completed` = done, `rejected` = refused with a reason. */
export const VideoFootageJobSchema = z.discriminatedUnion('status', [
  z.strictObject({ ...jobBase, status: z.literal('queued') }),
  z.strictObject({ ...jobBase, status: z.literal('running') }),
  z.strictObject({ ...jobBase, status: z.literal('completed'), footage: VideoFootageAddedSchema }),
  z.strictObject({ ...jobBase, status: z.literal('rejected'), code: VideoFootageRejectionReasonSchema, error: VideoFootageErrorTextSchema }),
  z.strictObject({ ...jobBase, status: z.literal('failed'), error: VideoFootageErrorTextSchema }),
  z.strictObject({ ...jobBase, status: z.literal('interrupted'), error: VideoFootageErrorTextSchema }),
]);
export type VideoFootageJob = z.infer<typeof VideoFootageJobSchema>;

export const VideoFootageJobQuerySchema = CapabilityAgentScopeSchema;
export type VideoFootageJobQuery = z.infer<typeof VideoFootageJobQuerySchema>;
