import { z } from 'zod';
import { InvalidationReasonSchema } from "./enums.js";
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
// ---------------------------------------------------------------------------
// Phase 41 — Graphiti Alignment additions (ADR-MEM-GRAPHITI-ALIGNMENT)
// ---------------------------------------------------------------------------
/**
 * RecallTemporalMode — modalità di query temporale per il recall bundle.
 *
 * - `current`: fatti attivi ora (default, zero behavior change).
 * - `valid_at`: fatti validi nel mondo a un dato istante.
 * - `known_at`: fatti registrati/accettati da X9 a un dato istante.
 * - `valid_between`: fatti/eventi validi in un intervallo.
 * - `history`: catena di supersession/invalidation per slot/entity.
 */
export const RecallTemporalModeSchema = z.enum([
    'current',
    'valid_at',
    'known_at',
    'valid_between',
    'history',
]);
/**
 * RecallTemporalFilter — filtro temporale per richieste recall bundle.
 *
 * `mode` seleziona la semantica; i campi opzionali forniscono i parametri
 * necessari per ciascuna modalità (validazione a livello applicativo).
 */
export const RecallTemporalFilterSchema = z.object({
    mode: RecallTemporalModeSchema,
    validAt: z.string().datetime({ offset: true }).optional(),
    knownAt: z.string().datetime({ offset: true }).optional(),
    validFrom: z.string().datetime({ offset: true }).optional(),
    validTo: z.string().datetime({ offset: true }).optional(),
    includeInvalidated: z.boolean().optional(),
    includeSuperseded: z.boolean().optional(),
});
/**
 * BitemporalFields — campi bitemporali aggiunti a facts/rules/edges.
 *
 * Due assi temporali:
 * 1. **Validity time** (valid_from / valid_to): quando il fatto è vero nel mondo.
 * 2. **Transaction time** (recorded_at / record_invalidated_at): quando X9 lo ha registrato/invalidato.
 *
 * `asserted_at` e `source_observed_at` sono metadati ausiliari opzionali.
 */
export const BitemporalFieldsSchema = z.object({
    validFrom: z.string().datetime({ offset: true }).nullable(),
    validTo: z.string().datetime({ offset: true }).nullable(),
    recordedAt: z.string().datetime({ offset: true }),
    recordInvalidatedAt: z.string().datetime({ offset: true }).nullable(),
    assertedAt: z.string().datetime({ offset: true }).nullable(),
    sourceObservedAt: z.string().datetime({ offset: true }).nullable(),
});
/**
 * InvalidationMetadata — metadati strutturati associati all'invalidazione di una memoria.
 *
 * Cattura il motivo (enum), la sorgente che ha causato l'invalidazione,
 * l'attore e una nota opzionale.
 */
export const InvalidationMetadataSchema = z.object({
    reason: InvalidationReasonSchema,
    sourceId: z.string().min(1).optional(),
    actor: z.string().min(1).optional(),
    note: z.string().max(500).optional(),
});
//# sourceMappingURL=temporal.js.map