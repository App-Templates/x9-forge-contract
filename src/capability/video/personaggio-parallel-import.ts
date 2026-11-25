import { z } from 'zod';
import { VideoModelIdSchema, VideoModelNameSchema, VideoModelRefKindSchema } from './modella.js';
import { VideoParallelCharacterIdSchema, VideoParallelCommunityIdSchema } from './personaggio-parallel.js';

const Sha256Schema = z.string().regex(/^[0-9a-f]{64}$/);

/** Ask the engine to import a Parallel character as a fixed model. */
export const VideoParallelImportRequestSchema = z.strictObject({
  requestedBy: z.string().min(1).max(256),
  communityId: VideoParallelCommunityIdSchema,
  characterId: VideoParallelCharacterIdSchema,
  version: Sha256Schema.optional(),
  name: VideoModelNameSchema.optional(),
  modelId: VideoModelIdSchema.optional(),
});
export type VideoParallelImportRequest = z.infer<typeof VideoParallelImportRequestSchema>;

/** Missing views are reported, never invented. */
export const VideoParallelImportResultSchema = z.strictObject({
  modelId: VideoModelIdSchema,
  characterId: VideoParallelCharacterIdSchema,
  sourceVersion: Sha256Schema.nullable(),
  viewsPresent: z.array(VideoModelRefKindSchema).max(4),
  viewsMissing: z.array(VideoModelRefKindSchema).max(4),
  voiceAssigned: z.boolean(),
  importedAt: z.string().min(1).max(40),
});
export type VideoParallelImportResult = z.infer<typeof VideoParallelImportResultSchema>;

export const VideoParallelImportErrorSchema = z.strictObject({
  error: z.enum([
    'comunita_non_trovata', 'personaggio_non_trovato', 'senza_consenso', 'ritratto_illeggibile', 'motore_non_disponibile',
  ]),
});
export type VideoParallelImportError = z.infer<typeof VideoParallelImportErrorSchema>;
