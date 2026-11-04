import { z } from 'zod';
/** Id of one shot of the footage archive on the engine (e.g. `piante-02`). Never a path. */
export declare const VideoFootageIdSchema: z.ZodString;
export type VideoFootageId = z.infer<typeof VideoFootageIdSchema>;
/** One or two shots of the same place (a single shot, or the wide/narrow pair of `ibrido-alternato`). */
export declare const VideoFootageChoiceSchema: z.ZodArray<z.ZodString>;
export type VideoFootageChoice = z.infer<typeof VideoFootageChoiceSchema>;
//# sourceMappingURL=footage.d.ts.map