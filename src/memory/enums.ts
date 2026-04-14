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
 * - `active`: in uso, recuperabile dal recall.
 * - `invalidated`: rigettata (dato errato / contraddetto). Non più recuperabile ma conservata per audit.
 * - `superseded`: sostituita da una versione successiva (vedi TemporalSemantics.supersededBy).
 * - `redacted`: contenuto rimosso per privacy / compliance, metadata ritenuti.
 * - `archived`: fuori da recall attivo ma preservata (retention policy cold).
 */
export const MemoryStatusSchema = z.enum([
  'active',
  'invalidated',
  'superseded',
  'redacted',
  'archived',
]);
export type MemoryStatus = z.infer<typeof MemoryStatusSchema>;

/**
 * MemoryCorrectiveAction — operazioni correttive applicabili a una memory entry.
 *
 * - `invalidate`: marca come `invalidated` (contraddetta).
 * - `pin`: forza alta priorità nel recall.
 * - `promote`: innalza scope (es. agent → owner) quando emerge rilevanza cross-agent.
 * - `demote`: abbassa scope.
 * - `redact`: rimuove contenuto, mantiene metadata (compliance / GDPR).
 * - `merge`: consolida N entry in 1 (deduplicazione semantica).
 * - `forget`: hard delete (compliance / erasure request). Distruttivo.
 */
export const MemoryCorrectiveActionSchema = z.enum([
  'invalidate',
  'pin',
  'promote',
  'demote',
  'redact',
  'merge',
  'forget',
]);
export type MemoryCorrectiveAction = z.infer<typeof MemoryCorrectiveActionSchema>;
