"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetentionPolicyMetadataSchema = exports.ArchivalPolicySchema = exports.RetentionClassSchema = void 0;
const zod_1 = require("zod");
/**
 * RetentionClass — categorie canoniche di retention policy.
 *
 * - `short`: TTL breve (tipicamente ore/giorni). Es. stato conversazionale ephemero.
 * - `standard`: TTL medio (settimane/mesi). Default per memoria episodic.
 * - `long`: TTL esteso (anni). Profile + procedural.
 * - `permanent`: nessun purge automatico. Compliance-driven.
 * - `compliance-hold`: retention forzata per legal/audit. Non purgabile finché flag attivo.
 */
exports.RetentionClassSchema = zod_1.z.enum([
    'short',
    'standard',
    'long',
    'permanent',
    'compliance-hold',
]);
/**
 * ArchivalPolicy — cosa succede quando TTL scade o entry diventa "cold".
 *
 * - `delete`: purge hard (distruttivo).
 * - `archive-cold`: move a storage cold, accessibile ma fuori recall attivo.
 * - `anonymize`: strip PII, mantieni pattern aggregabili.
 * - `redact-preserve`: redact content, preserve metadata per audit.
 */
exports.ArchivalPolicySchema = zod_1.z.enum([
    'delete',
    'archive-cold',
    'anonymize',
    'redact-preserve',
]);
/**
 * RetentionPolicyMetadata — contratto retention associato a una memoria.
 *
 * - `retentionClass`: categoria (vedi enum).
 * - `ttlSeconds`: opzionale. Se presente, override esplicito del TTL implicito della class.
 * - `archivalPolicy`: azione a TTL expire.
 * - `purgeEligible`: flag computato (retention class NON è compliance-hold E TTL scaduto).
 *   Il bridge modella il FLAG, non la computation — il consumer imposta true/false.
 */
exports.RetentionPolicyMetadataSchema = zod_1.z.object({
    retentionClass: exports.RetentionClassSchema,
    ttlSeconds: zod_1.z.number().int().positive().optional(),
    archivalPolicy: exports.ArchivalPolicySchema,
    purgeEligible: zod_1.z.boolean(),
});
//# sourceMappingURL=retention.js.map