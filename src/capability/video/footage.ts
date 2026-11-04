import { z } from 'zod';

/** Id of one shot of the footage archive on the engine (e.g. `piante-02`). Never a path. */
export const VideoFootageIdSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/);
export type VideoFootageId = z.infer<typeof VideoFootageIdSchema>;

/** One or two shots of the same place (a single shot, or the wide/narrow pair of `ibrido-alternato`). */
export const VideoFootageChoiceSchema = z.array(VideoFootageIdSchema).min(1).max(2);
export type VideoFootageChoice = z.infer<typeof VideoFootageChoiceSchema>;
