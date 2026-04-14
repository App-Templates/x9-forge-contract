import { z } from 'zod';

/**
 * RetentionClass — categorie canoniche di retention policy.
 *
 * - `short`: TTL breve (tipicamente ore/giorni). Es. stato conversazionale ephemero.
 * - `standard`: TTL medio (settimane/mesi). Default per memoria episodic.
 * - `long`: TTL esteso (anni). Profile + procedural.
 * - `permanent`: nessun purge automatico. Compliance-driven.
 * - `compliance-hold`: retention forzata per legal/audit. Non purgabile finché flag attivo.
 */
export const RetentionClassSchema = z.enum([
  'short',
  'standard',
  'long',
  'permanent',
  'compliance-hold',
]);
export type RetentionClass = z.infer<typeof RetentionClassSchema>;

/**
 * ArchivalPolicy — cosa succede quando TTL scade o entry diventa "cold".
 *
 * - `delete`: purge hard (distruttivo).
 * - `archive-cold`: move a storage cold, accessibile ma fuori recall attivo.
 * - `anonymize`: strip PII, mantieni pattern aggregabili.
 * - `redact-preserve`: redact content, preserve metadata per audit.
 */
export const ArchivalPolicySchema = z.enum([
  'delete',
  'archive-cold',
  'anonymize',
  'redact-preserve',
]);
export type ArchivalPolicy = z.infer<typeof ArchivalPolicySchema>;

/**
 * RetentionPolicyMetadata — contratto retention associato a una memoria.
 *
 * - `retentionClass`: categoria (vedi enum).
 * - `ttlSeconds`: opzionale. Se presente, override esplicito del TTL implicito della class.
 * - `archivalPolicy`: azione a TTL expire.
 * - `purgeEligible`: flag computato (retention class NON è compliance-hold E TTL scaduto).
 *   Il bridge modella il FLAG, non la computation — il consumer imposta true/false.
 */
export const RetentionPolicyMetadataSchema = z.object({
  retentionClass: RetentionClassSchema,
  ttlSeconds: z.number().int().positive().optional(),
  archivalPolicy: ArchivalPolicySchema,
  purgeEligible: z.boolean(),
});

export type RetentionPolicyMetadata = z.infer<typeof RetentionPolicyMetadataSchema>;
