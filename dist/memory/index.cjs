"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEMORY_VOICE_INGEST_PATH = void 0;
__exportStar(require("./console.cjs"), exports);
__exportStar(require("./corrective-action.cjs"), exports);
__exportStar(require("./delete.cjs"), exports);
__exportStar(require("./enums.cjs"), exports);
__exportStar(require("./identity.cjs"), exports);
__exportStar(require("./recall-bundle.cjs"), exports);
__exportStar(require("./retention.cjs"), exports);
__exportStar(require("./temporal.cjs"), exports);
__exportStar(require("./write-candidate.cjs"), exports);
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
exports.MEMORY_VOICE_INGEST_PATH = '/internal/memory/voice-ingest';
/**
 * Phase 18 D3 closure — memory v2 HTTP path constants.
 * MEMORY_CORRECT_PATH, MEMORY_CORRECT_METHOD, MEMORY_CONSOLE_LIST_PATH_TEMPLATE,
 * MEMORY_CONSOLE_LIST_METHOD — see src/memory/paths.ts.
 */
__exportStar(require("./paths.cjs"), exports);
//# sourceMappingURL=index.js.map