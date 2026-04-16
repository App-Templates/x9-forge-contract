/**
 * Memory Engine v2 cross-repo contracts.
 *
 * Sede: `@x9-forge/contracts/memory` (sub-path export).
 * Consumer attesi: X9 (producer via estrattori + consumer via agent-core),
 * Forge (persistence layer + recall orchestrator), eventuali future UI
 * ispezionabili.
 *
 * Principio: **shape stabile, implementazione libera**. Il bridge fissa
 * le semantiche cross-repo (envelope, enum, discriminator) ma NON prescrive
 * come X9/Forge organizzano la memoria internamente (store, indicizzazione,
 * embedding model, ecc.).
 *
 * Non importare da qui in produzione prima che Memory Engine v2 refactor
 * sia iniziato — per ora questo modulo è "contratto anticipato", pubblicato
 * ora per evitare drift al T0 del refactor.
 */

export * from './console.js';
export * from './corrective-action.js';
export * from './enums.js';
export * from './identity.js';
export * from './recall-bundle.js';
export * from './retention.js';
export * from './temporal.js';
export * from './write-candidate.js';
