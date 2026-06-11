/**
 * Memory v2 internal HTTP path constants.
 * Phase 18 D3 closure — Option A. Adds path constants to enable R-14
 * cross-repo URL hygiene in forge-v2 memory-v2 routes.
 */
export const MEMORY_CORRECT_PATH = '/internal/memory/correct';
export const MEMORY_CORRECT_METHOD = 'POST';
/**
 * v1.13.1 (F-2 / D-1 unblock) — episode ingest endpoint path.
 * Consumers: agent-x9 memory tool-handlers (memory_capture forward),
 * agent-core chat-turn episode ingest (FOLLOW-UP D-1), Parallel canon
 * finalizer (flat-episode mirror).
 */
export const INTERNAL_MEMORY_INGEST_PATH = '/internal/memory/ingest';
export const INTERNAL_MEMORY_INGEST_METHOD = 'POST';
export const MEMORY_CONSOLE_LIST_PATH_TEMPLATE = '/internal/memory/console/:kind';
export const MEMORY_CONSOLE_LIST_METHOD = 'GET';
//# sourceMappingURL=paths.js.map