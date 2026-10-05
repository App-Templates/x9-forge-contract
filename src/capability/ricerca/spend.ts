import { z } from 'zod';
import { ProjectIdSchema } from './project.js';

/**
 * One project day of spend, as cap-ricerca counts it (v1.28.0, Phase 54). Read by the control panel (Forge).
 * `day` is the date in the project's time zone; `reservedUsd` is what running researches have reserved and not yet
 * settled (an unknown cost is never free: it stays reserved).
 */
export const ProjectDaySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const ProjectSpendDaySchema = z.object({
  projectId: ProjectIdSchema,
  day: ProjectDaySchema,
  spentUsd: z.number().nonnegative().finite(),
  reservedUsd: z.number().nonnegative().finite(),
  capUsd: z.number().positive().finite(),
  calls: z.number().int().nonnegative(),
  webCalls: z.number().int().nonnegative(),
}).strict();
export type ProjectSpendDay = z.infer<typeof ProjectSpendDaySchema>;
