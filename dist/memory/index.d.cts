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
export * from "./console.cjs";
export * from "./corrective-action.cjs";
export * from "./delete.cjs";
export * from "./enums.cjs";
export * from "./identity.cjs";
export * from "./recall-bundle.cjs";
export * from "./retention.cjs";
export * from "./temporal.cjs";
export * from "./write-candidate.cjs";
/**
 * Phase 45.2 Task 1 — memory voice-ingest endpoint path constant.
 *
 * Cap-voice calls MEMORY_VOICE_INGEST_PATH (not /internal/ingest) for
 * voice-call memory handoff so the memory service can route to the
 * voice-specific extraction pipeline. R-14: callers MUST import this
 * constant — hardcoded path literals are forbidden.
 *
 * @see docs/adr/ADR-cap-voice.md §15 (D-21 memory handoff)
 */
export declare const MEMORY_VOICE_INGEST_PATH: "/internal/memory/voice-ingest";
/**
 * Phase 18 D3 closure — memory v2 HTTP path constants.
 * MEMORY_CORRECT_PATH, MEMORY_CORRECT_METHOD, MEMORY_CONSOLE_LIST_PATH_TEMPLATE,
 * MEMORY_CONSOLE_LIST_METHOD — see src/memory/paths.ts.
 */
export * from "./paths.cjs";
//# sourceMappingURL=index.d.ts.map