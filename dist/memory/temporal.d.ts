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
export declare const TemporalSemanticsSchema: z.ZodObject<{
    validAt: z.ZodString;
    invalidAt: z.ZodOptional<z.ZodString>;
    supersedes: z.ZodOptional<z.ZodString>;
    supersededBy: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type TemporalSemantics = z.infer<typeof TemporalSemanticsSchema>;
/**
 * RecallTemporalMode — modalità di query temporale per il recall bundle.
 *
 * - `current`: fatti attivi ora (default, zero behavior change).
 * - `valid_at`: fatti validi nel mondo a un dato istante.
 * - `known_at`: fatti registrati/accettati da X9 a un dato istante.
 * - `valid_between`: fatti/eventi validi in un intervallo.
 * - `history`: catena di supersession/invalidation per slot/entity.
 */
export declare const RecallTemporalModeSchema: z.ZodEnum<{
    history: "history";
    current: "current";
    valid_at: "valid_at";
    known_at: "known_at";
    valid_between: "valid_between";
}>;
export type RecallTemporalMode = z.infer<typeof RecallTemporalModeSchema>;
/**
 * RecallTemporalFilter — filtro temporale per richieste recall bundle.
 *
 * `mode` seleziona la semantica; i campi opzionali forniscono i parametri
 * necessari per ciascuna modalità (validazione a livello applicativo).
 */
export declare const RecallTemporalFilterSchema: z.ZodObject<{
    mode: z.ZodEnum<{
        history: "history";
        current: "current";
        valid_at: "valid_at";
        known_at: "known_at";
        valid_between: "valid_between";
    }>;
    validAt: z.ZodOptional<z.ZodString>;
    knownAt: z.ZodOptional<z.ZodString>;
    validFrom: z.ZodOptional<z.ZodString>;
    validTo: z.ZodOptional<z.ZodString>;
    includeInvalidated: z.ZodOptional<z.ZodBoolean>;
    includeSuperseded: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type RecallTemporalFilter = z.infer<typeof RecallTemporalFilterSchema>;
/**
 * BitemporalFields — campi bitemporali aggiunti a facts/rules/edges.
 *
 * Due assi temporali:
 * 1. **Validity time** (valid_from / valid_to): quando il fatto è vero nel mondo.
 * 2. **Transaction time** (recorded_at / record_invalidated_at): quando X9 lo ha registrato/invalidato.
 *
 * `asserted_at` e `source_observed_at` sono metadati ausiliari opzionali.
 */
export declare const BitemporalFieldsSchema: z.ZodObject<{
    validFrom: z.ZodNullable<z.ZodString>;
    validTo: z.ZodNullable<z.ZodString>;
    recordedAt: z.ZodString;
    recordInvalidatedAt: z.ZodNullable<z.ZodString>;
    assertedAt: z.ZodNullable<z.ZodString>;
    sourceObservedAt: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type BitemporalFields = z.infer<typeof BitemporalFieldsSchema>;
/**
 * InvalidationMetadata — metadati strutturati associati all'invalidazione di una memoria.
 *
 * Cattura il motivo (enum), la sorgente che ha causato l'invalidazione,
 * l'attore e una nota opzionale.
 */
export declare const InvalidationMetadataSchema: z.ZodObject<{
    reason: z.ZodEnum<{
        superseded_by_new_fact: "superseded_by_new_fact";
        user_correction: "user_correction";
        admin_correction: "admin_correction";
        source_deleted: "source_deleted";
        privacy_redaction: "privacy_redaction";
        retention_expired: "retention_expired";
        entity_merge: "entity_merge";
        entity_split: "entity_split";
        low_confidence_rejected: "low_confidence_rejected";
        conflict_unresolved: "conflict_unresolved";
    }>;
    sourceId: z.ZodOptional<z.ZodString>;
    actor: z.ZodOptional<z.ZodString>;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type InvalidationMetadata = z.infer<typeof InvalidationMetadataSchema>;
//# sourceMappingURL=temporal.d.ts.map