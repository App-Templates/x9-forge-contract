"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecallBundleSchema = exports.AuditMetaSchema = exports.MemoryEntrySchema = void 0;
const zod_1 = require("zod");
const enums_js_1 = require("./enums.cjs");
const temporal_js_1 = require("./temporal.cjs");
/**
 * MemoryEntry — forma serializzata di UNA entry recuperata dal recall.
 *
 * Superset comune tra tutti i type (profile/procedural/episodic/relationship).
 * Il `content` resta opaque `z.unknown()` — il consumer applica una shape specifica
 * per type/subtype usando Zod parse al suo layer.
 *
 * - `id`: identifier opaque persistito (ULID/UUID, formato non prescritto).
 * - `status`: stato ciclo di vita (tipicamente `active` nel bundle, ma `superseded`
 *   può emergere se il recall richiede versioni storiche).
 * - `type`: ridondante col raggruppamento (profile/procedural/...) ma utile
 *   per deserializzazione unificata.
 * - `subtype`: refinement opaque.
 * - `confidence`: 0-1 float.
 * - `content`: payload opaco (vedi sopra).
 * - `temporal`: timestamp canonici.
 */
exports.MemoryEntrySchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    status: enums_js_1.MemoryStatusSchema,
    type: enums_js_1.MemoryTypeSchema,
    subtype: zod_1.z.string().min(1).optional(),
    confidence: zod_1.z.number().min(0).max(1),
    content: zod_1.z.unknown(),
    temporal: temporal_js_1.TemporalSemanticsSchema,
});
/**
 * AuditMeta — metadati di osservabilità del recall stesso.
 *
 * - `recalledAt`: quando è stata generata questa bundle.
 * - `latencyMs`: tempo elaborazione recall (diagnostico).
 * - `sourceStoreVersion`: versione del memory store che ha servito (stringa opaca).
 * - `policyApplied`: lista di nomi di policy applicate (scope filter, privacy filter,
 *   retention filter, ecc.). Utile per debug + audit GDPR.
 */
exports.AuditMetaSchema = zod_1.z.object({
    recalledAt: zod_1.z.string().datetime({ offset: true }),
    latencyMs: zod_1.z.number().int().nonnegative(),
    sourceStoreVersion: zod_1.z.string().min(1),
    policyApplied: zod_1.z.array(zod_1.z.string().min(1)),
});
/**
 * RecallBundle — payload strutturato restituito dal memory-svc verso agent-core
 * in risposta a una richiesta di recall (memoria rilevante per il turn corrente).
 *
 * Partizione per **type** (profile / procedural / relationships / episodes),
 * che è il criterio di taxonomia principale. Separatare per type permette
 * all'LLM di comporre il prompt con sezioni semanticamente distinte:
 * - "Cosa so dell'utente" (profile)
 * - "Cosa l'utente mi ha insegnato / preferenze operative" (procedural)
 * - "Con chi si relaziona / dinamiche sociali" (relationships)
 * - "Cosa è successo di rilevante" (episodes)
 *
 * Ordinamento dentro ogni sezione non prescritto dal bridge — il memory-svc
 * decide (tipicamente per confidence desc + temporal recency).
 *
 * - `auditMeta`: diagnostica del recall stesso (non i singoli recuperi).
 */
exports.RecallBundleSchema = zod_1.z.object({
    profile: zod_1.z.array(exports.MemoryEntrySchema),
    procedural: zod_1.z.array(exports.MemoryEntrySchema),
    relationships: zod_1.z.array(exports.MemoryEntrySchema),
    episodes: zod_1.z.array(exports.MemoryEntrySchema),
    auditMeta: exports.AuditMetaSchema,
});
//# sourceMappingURL=recall-bundle.js.map