import { z } from 'zod';

/**
 * TemporalSemantics — campi canonici della validità temporale di una memoria.
 *
 * Modella due dimensioni:
 * 1. **Validity window**: intervallo [validAt, invalidAt] in cui la memoria
 *    è considerata "vera nel mondo". `invalidAt` assente = ancora valida.
 * 2. **Versioning chain**: collegamento tra versioni successive della stessa
 *    entità logica. `supersedes` punta alla precedente, `supersededBy` alla
 *    successiva. Al più uno dei due per versione corrente (supersedes sull'ultima).
 *
 * Note shape:
 * - `validAt` è OBBLIGATORIO — ogni memoria deve avere un istante iniziale.
 * - `invalidAt`, `supersedes`, `supersededBy` sono opzionali (unset = current/head).
 * - Gli identificatori di versione (`supersedes`, `supersededBy`) sono branded string
 *   semantici (opaque id). Il bridge NON prescrive il formato (ULID, UUID, ecc.) —
 *   implementazione libera X9/Forge.
 */
export const TemporalSemanticsSchema = z.object({
  validAt: z.string().datetime({ offset: true }),
  invalidAt: z.string().datetime({ offset: true }).optional(),
  supersedes: z.string().min(1).optional(),
  supersededBy: z.string().min(1).optional(),
});

export type TemporalSemantics = z.infer<typeof TemporalSemanticsSchema>;
