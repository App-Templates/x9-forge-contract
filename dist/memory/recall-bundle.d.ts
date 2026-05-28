import { z } from 'zod';
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
export declare const MemoryEntrySchema: z.ZodObject<{
    id: z.ZodString;
    status: z.ZodEnum<{
        active: "active";
        rejected: "rejected";
        draft: "draft";
        invalidated: "invalidated";
        superseded: "superseded";
        redacted: "redacted";
        archived: "archived";
        needs_review: "needs_review";
    }>;
    type: z.ZodEnum<{
        profile: "profile";
        procedural: "procedural";
        episodic: "episodic";
        relationship: "relationship";
    }>;
    subtype: z.ZodOptional<z.ZodString>;
    confidence: z.ZodNumber;
    content: z.ZodUnknown;
    temporal: z.ZodObject<{
        validAt: z.ZodString;
        invalidAt: z.ZodOptional<z.ZodString>;
        supersedes: z.ZodOptional<z.ZodString>;
        supersededBy: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type MemoryEntry = z.infer<typeof MemoryEntrySchema>;
/**
 * AuditMeta — metadati di osservabilità del recall stesso.
 *
 * - `recalledAt`: quando è stata generata questa bundle.
 * - `latencyMs`: tempo elaborazione recall (diagnostico).
 * - `sourceStoreVersion`: versione del memory store che ha servito (stringa opaca).
 * - `policyApplied`: lista di nomi di policy applicate (scope filter, privacy filter,
 *   retention filter, ecc.). Utile per debug + audit GDPR.
 */
export declare const AuditMetaSchema: z.ZodObject<{
    recalledAt: z.ZodString;
    latencyMs: z.ZodNumber;
    sourceStoreVersion: z.ZodString;
    policyApplied: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type AuditMeta = z.infer<typeof AuditMetaSchema>;
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
export declare const RecallBundleSchema: z.ZodObject<{
    profile: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        status: z.ZodEnum<{
            active: "active";
            rejected: "rejected";
            draft: "draft";
            invalidated: "invalidated";
            superseded: "superseded";
            redacted: "redacted";
            archived: "archived";
            needs_review: "needs_review";
        }>;
        type: z.ZodEnum<{
            profile: "profile";
            procedural: "procedural";
            episodic: "episodic";
            relationship: "relationship";
        }>;
        subtype: z.ZodOptional<z.ZodString>;
        confidence: z.ZodNumber;
        content: z.ZodUnknown;
        temporal: z.ZodObject<{
            validAt: z.ZodString;
            invalidAt: z.ZodOptional<z.ZodString>;
            supersedes: z.ZodOptional<z.ZodString>;
            supersededBy: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    procedural: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        status: z.ZodEnum<{
            active: "active";
            rejected: "rejected";
            draft: "draft";
            invalidated: "invalidated";
            superseded: "superseded";
            redacted: "redacted";
            archived: "archived";
            needs_review: "needs_review";
        }>;
        type: z.ZodEnum<{
            profile: "profile";
            procedural: "procedural";
            episodic: "episodic";
            relationship: "relationship";
        }>;
        subtype: z.ZodOptional<z.ZodString>;
        confidence: z.ZodNumber;
        content: z.ZodUnknown;
        temporal: z.ZodObject<{
            validAt: z.ZodString;
            invalidAt: z.ZodOptional<z.ZodString>;
            supersedes: z.ZodOptional<z.ZodString>;
            supersededBy: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    relationships: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        status: z.ZodEnum<{
            active: "active";
            rejected: "rejected";
            draft: "draft";
            invalidated: "invalidated";
            superseded: "superseded";
            redacted: "redacted";
            archived: "archived";
            needs_review: "needs_review";
        }>;
        type: z.ZodEnum<{
            profile: "profile";
            procedural: "procedural";
            episodic: "episodic";
            relationship: "relationship";
        }>;
        subtype: z.ZodOptional<z.ZodString>;
        confidence: z.ZodNumber;
        content: z.ZodUnknown;
        temporal: z.ZodObject<{
            validAt: z.ZodString;
            invalidAt: z.ZodOptional<z.ZodString>;
            supersedes: z.ZodOptional<z.ZodString>;
            supersededBy: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    episodes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        status: z.ZodEnum<{
            active: "active";
            rejected: "rejected";
            draft: "draft";
            invalidated: "invalidated";
            superseded: "superseded";
            redacted: "redacted";
            archived: "archived";
            needs_review: "needs_review";
        }>;
        type: z.ZodEnum<{
            profile: "profile";
            procedural: "procedural";
            episodic: "episodic";
            relationship: "relationship";
        }>;
        subtype: z.ZodOptional<z.ZodString>;
        confidence: z.ZodNumber;
        content: z.ZodUnknown;
        temporal: z.ZodObject<{
            validAt: z.ZodString;
            invalidAt: z.ZodOptional<z.ZodString>;
            supersedes: z.ZodOptional<z.ZodString>;
            supersededBy: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    auditMeta: z.ZodObject<{
        recalledAt: z.ZodString;
        latencyMs: z.ZodNumber;
        sourceStoreVersion: z.ZodString;
        policyApplied: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type RecallBundle = z.infer<typeof RecallBundleSchema>;
//# sourceMappingURL=recall-bundle.d.ts.map