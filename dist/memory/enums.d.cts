import { z } from 'zod';
/**
 * MemoryScope — contesto di visibilità della memoria.
 *
 * - `platform`: visibile a tutta la piattaforma (cross-tenant, cross-owner). Es. configurazioni globali.
 * - `owner`: visibile a tutti gli agenti di un owner (cross-agent, stesso tenant). Es. preferenze owner.
 * - `agent`: visibile solo ad UN agent (scoping di runtime). Es. skill per quell'agente.
 * - `user`: visibile solo ad una conversazione utente (finest grain). Es. preferenze chat utente.
 */
export declare const MemoryScopeSchema: z.ZodEnum<{
    user: "user";
    platform: "platform";
    owner: "owner";
    agent: "agent";
}>;
export type MemoryScope = z.infer<typeof MemoryScopeSchema>;
/**
 * MemoryType — tassonomia semantica del contenuto.
 *
 * - `profile`: fatti stabili sull'entità (nome, preferenze durature, timezone).
 * - `procedural`: how-to / workflow / skill ("quando X, fai Y").
 * - `episodic`: eventi datati (meeting, conversazioni, fatti occorrenti).
 * - `relationship`: legami tra entità (agent ↔ user, user ↔ user, ecc.).
 */
export declare const MemoryTypeSchema: z.ZodEnum<{
    profile: "profile";
    procedural: "procedural";
    episodic: "episodic";
    relationship: "relationship";
}>;
export type MemoryType = z.infer<typeof MemoryTypeSchema>;
/**
 * MemoryStatus — stato del ciclo di vita della memoria.
 *
 * - `draft`: scritta ma non ancora promossa ad attiva (extraction candidate in attesa di conflict resolution o gate).
 * - `active`: in uso, recuperabile dal recall.
 * - `invalidated`: rigettata (dato errato / contraddetto). Non più recuperabile ma conservata per audit.
 * - `superseded`: sostituita da una versione successiva (vedi TemporalSemantics.supersededBy).
 * - `redacted`: contenuto rimosso per privacy / compliance, metadata ritenuti.
 * - `archived`: fuori da recall attivo ma preservata (retention policy cold).
 * - `rejected`: classificata ma NON promossa — contenuto banale / low-confidence / assistant self-talk.
 * - `needs_review`: ambigua — entity ambiguity, conflict unresolved, privacy uncertain; richiede admin review.
 *
 * Phase 36.1 (Memory Engine v2): +3 values (`draft`, `rejected`, `needs_review`) per ADR §5.1.
 * Consumers con exhaustive switch devono aggiornare per evitare TS narrowing errors.
 */
export declare const MemoryStatusSchema: z.ZodEnum<{
    active: "active";
    rejected: "rejected";
    draft: "draft";
    invalidated: "invalidated";
    superseded: "superseded";
    redacted: "redacted";
    archived: "archived";
    needs_review: "needs_review";
}>;
export type MemoryStatus = z.infer<typeof MemoryStatusSchema>;
/**
 * MemoryCorrectiveAction — operazioni correttive applicabili a una memory entry.
 *
 * Allineato 1:1 con ADR §14.3 `POST /internal/memory/correct` e ADR §8.7
 * `memory_feedback.action` allowed values.
 *
 * - `invalidate`: marca come `invalidated` (contraddetta).
 * - `forget`: hard delete (compliance / erasure request). Distruttivo.
 * - `redact`: rimuove contenuto, mantiene metadata (compliance / GDPR).
 * - `pin`: forza alta priorità nel recall.
 * - `promote`: innalza scope (es. agent → owner) quando emerge rilevanza cross-agent.
 * - `demote`: abbassa scope.
 * - `merge_entity`: consolida due entity canoniche in una (entity resolution admin action).
 * - `split_entity`: separa un'entity erroneamente mergiata in due distinte.
 * - `mark_sensitive`: eleva `privacy_level` a `sensitive`/`secret` — disattiva Qdrant projection se policy lo richiede.
 * - `change_retention`: modifica `retention_class` / `ttl_days` su una memory entry specifica.
 */
export declare const MemoryCorrectiveActionSchema: z.ZodEnum<{
    invalidate: "invalidate";
    forget: "forget";
    redact: "redact";
    pin: "pin";
    promote: "promote";
    demote: "demote";
    merge_entity: "merge_entity";
    split_entity: "split_entity";
    mark_sensitive: "mark_sensitive";
    change_retention: "change_retention";
}>;
export type MemoryCorrectiveAction = z.infer<typeof MemoryCorrectiveActionSchema>;
/**
 * InvalidationReason — motivazione strutturata per l'invalidazione di una memoria.
 *
 * Allineato con ADR-MEM-GRAPHITI-ALIGNMENT §4.4.
 *
 * - `superseded_by_new_fact`: fatto sostituito da uno più recente (conflict resolution).
 * - `user_correction`: l'utente ha corretto esplicitamente il fatto.
 * - `admin_correction`: correzione da admin/forge console.
 * - `source_deleted`: la sorgente originale è stata rimossa.
 * - `privacy_redaction`: redazione per privacy/compliance.
 * - `retention_expired`: scaduta per retention policy (TTL / archive lifecycle).
 * - `entity_merge`: invalidata a seguito di merge di due entità.
 * - `entity_split`: invalidata a seguito di split di un'entità.
 * - `low_confidence_rejected`: rigettata per confidenza insufficiente all'extraction.
 * - `conflict_unresolved`: conflitto non risolvibile automaticamente.
 */
export declare const InvalidationReasonSchema: z.ZodEnum<{
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
export type InvalidationReason = z.infer<typeof InvalidationReasonSchema>;
//# sourceMappingURL=enums.d.ts.map