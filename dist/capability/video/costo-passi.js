import { z } from 'zod';
import { VideoLongStepSchema, VideoLongProjectIdSchema } from "./lungo.js";
export const VideoCostUnitSchema = z.enum(['token', 'char', 'second', 'image', 'clip']);
export const VideoCostBasisSchema = z.enum(['misurato', 'stimato', 'non-misurato']);
export const VideoCostEntrySchema = z.strictObject({
    step: VideoLongStepSchema,
    provider: z.string().min(1).max(64),
    model: z.string().min(1).max(100),
    quantity: z.number().min(0).finite(),
    unit: VideoCostUnitSchema,
    costUsd: z.number().min(0).finite(),
    basis: VideoCostBasisSchema,
    at: z.string().min(1).max(40),
});
export const VideoCostStepSchema = z.strictObject({
    step: VideoLongStepSchema,
    estimatedUsd: z.number().min(0).finite(),
    confirmedUsd: z.number().min(0).finite(),
    entries: z.array(VideoCostEntrySchema).max(200),
});
/** The engine keeps usdPerMinute null until a finished video is available. */
export const VideoCostByStepSchema = z.strictObject({
    projectId: VideoLongProjectIdSchema,
    steps: z.array(VideoCostStepSchema).max(5),
    totalUsd: z.number().min(0).finite(),
    finishedSeconds: z.number().int().min(0).nullable(),
    usdPerMinute: z.number().min(0).finite().nullable(),
});
//# sourceMappingURL=costo-passi.js.map