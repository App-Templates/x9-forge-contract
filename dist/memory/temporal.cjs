"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidationMetadataSchema = exports.BitemporalFieldsSchema = exports.RecallTemporalFilterSchema = exports.RecallTemporalModeSchema = exports.TemporalSemanticsSchema = void 0;
const zod_1 = require("zod");
const enums_js_1 = require("./enums.cjs");
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
exports.TemporalSemanticsSchema = zod_1.z.object({
    validAt: zod_1.z.string().datetime({ offset: true }),
    invalidAt: zod_1.z.string().datetime({ offset: true }).optional(),
    supersedes: zod_1.z.string().min(1).optional(),
    supersededBy: zod_1.z.string().min(1).optional(),
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
exports.RecallTemporalModeSchema = zod_1.z.enum([
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
exports.RecallTemporalFilterSchema = zod_1.z.object({
    mode: exports.RecallTemporalModeSchema,
    validAt: zod_1.z.string().datetime({ offset: true }).optional(),
    knownAt: zod_1.z.string().datetime({ offset: true }).optional(),
    validFrom: zod_1.z.string().datetime({ offset: true }).optional(),
    validTo: zod_1.z.string().datetime({ offset: true }).optional(),
    includeInvalidated: zod_1.z.boolean().optional(),
    includeSuperseded: zod_1.z.boolean().optional(),
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
exports.BitemporalFieldsSchema = zod_1.z.object({
    validFrom: zod_1.z.string().datetime({ offset: true }).nullable(),
    validTo: zod_1.z.string().datetime({ offset: true }).nullable(),
    recordedAt: zod_1.z.string().datetime({ offset: true }),
    recordInvalidatedAt: zod_1.z.string().datetime({ offset: true }).nullable(),
    assertedAt: zod_1.z.string().datetime({ offset: true }).nullable(),
    sourceObservedAt: zod_1.z.string().datetime({ offset: true }).nullable(),
});
/**
 * InvalidationMetadata — metadati strutturati associati all'invalidazione di una memoria.
 *
 * Cattura il motivo (enum), la sorgente che ha causato l'invalidazione,
 * l'attore e una nota opzionale.
 */
exports.InvalidationMetadataSchema = zod_1.z.object({
    reason: enums_js_1.InvalidationReasonSchema,
    sourceId: zod_1.z.string().min(1).optional(),
    actor: zod_1.z.string().min(1).optional(),
    note: zod_1.z.string().max(500).optional(),
});
//# sourceMappingURL=temporal.js.map