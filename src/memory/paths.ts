/**
 * Memory v2 internal HTTP path constants.
 * Phase 18 D3 closure — Option A. Adds path constants to enable R-14
 * cross-repo URL hygiene in forge-v2 memory-v2 routes.
 */

export const MEMORY_CORRECT_PATH = '/internal/memory/correct' as const;
export const MEMORY_CORRECT_METHOD = 'POST' as const;

export const MEMORY_CONSOLE_LIST_PATH_TEMPLATE = '/internal/memory/console/:kind' as const;
export const MEMORY_CONSOLE_LIST_METHOD = 'GET' as const;
