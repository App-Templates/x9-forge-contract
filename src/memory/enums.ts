import { z } from 'zod';

/**
 * MemoryScope — contesto di visibilità della memoria.
 *
 * - `platform`: visibile a tutta la piattaforma (cross-tenant, cross-owner). Es. configurazioni globali.
 * - `owner`: visibile a tutti gli agenti di un owner (cross-agent, stesso tenant). Es. preferenze owner.
 * - `agent`: visibile solo ad UN agent (scoping di runtime). Es. skill per quell'agente.
 * - `user`: visibile solo ad una conversazione utente (finest grain). Es. preferenze chat utente.
 */
export const MemoryScopeSchema = z.enum(['platform', 'owner', 'agent', 'user']);
export type MemoryScope = z.infer<typeof MemoryScopeSchema>;

/**
 * MemoryType — tassonomia semantica del contenuto.
 *
 * - `profile`: fatti stabili sull'entità (nome, preferenze durature, timezone).
 * - `procedural`: how-to / workflow / skill ("quando X, fai Y").
 * - `episodic`: eventi datati (meeting, conversazioni, fatti occorrenti).
 * - `relationship`: legami tra entità (agent ↔ user, user ↔ user, ecc.).
 */
export const MemoryTypeSchema = z.enum(['profile', 'procedural', 'episodic', 'relationship']);
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
export const MemoryStatusSchema = z.enum([
  'draft',
  'active',
  'invalidated',
  'superseded',
  'redacted',
  'archived',
  'rejected',
  'needs_review',
]);
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
export const MemoryCorrectiveActionSchema = z.enum([
  'invalidate',
  'forget',
  'redact',
  'pin',
  'promote',
  'demote',
  'merge_entity',
  'split_entity',
  'mark_sensitive',
  'change_retention',
]);
export type MemoryCorrectiveAction = z.infer<typeof MemoryCorrectiveActionSchema>;
