"use strict";
/**
 * Memory v2 internal HTTP path constants.
 * Phase 18 D3 closure — Option A. Adds path constants to enable R-14
 * cross-repo URL hygiene in forge-v2 memory-v2 routes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEMORY_CONSOLE_LIST_METHOD = exports.MEMORY_CONSOLE_LIST_PATH_TEMPLATE = exports.INTERNAL_MEMORY_INGEST_METHOD = exports.INTERNAL_MEMORY_INGEST_PATH = exports.MEMORY_CORRECT_METHOD = exports.MEMORY_CORRECT_PATH = void 0;
exports.MEMORY_CORRECT_PATH = '/internal/memory/correct';
exports.MEMORY_CORRECT_METHOD = 'POST';
/**
 * v1.13.1 (F-2 / D-1 unblock) — episode ingest endpoint path.
 * Consumers: agent-x9 memory tool-handlers (memory_capture forward),
 * agent-core chat-turn episode ingest (FOLLOW-UP D-1), Parallel canon
 * finalizer (flat-episode mirror).
 */
exports.INTERNAL_MEMORY_INGEST_PATH = '/internal/memory/ingest';
exports.INTERNAL_MEMORY_INGEST_METHOD = 'POST';
exports.MEMORY_CONSOLE_LIST_PATH_TEMPLATE = '/internal/memory/console/:kind';
exports.MEMORY_CONSOLE_LIST_METHOD = 'GET';
//# sourceMappingURL=paths.js.map