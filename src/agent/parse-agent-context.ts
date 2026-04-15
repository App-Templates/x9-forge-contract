import { AgentContextCoreSchema, type AgentContextCore } from './agent-context-core.js';

/**
 * Parse and validate raw JSON into AgentContextCore.
 *
 * Fail-loud: throws ZodError on invalid input. Used at the boundary
 * where context.json is first loaded (X9 agent-manager, test fixtures).
 *
 * Extra fields (Runtime: workspacePath, registryPath, etc.) are preserved
 * in the parsed output thanks to `.passthrough()` on the schema — they
 * exist at runtime but are NOT part of the TypeScript type.
 *
 * @param json - Raw JSON value (typically from JSON.parse of context.json)
 * @returns Validated AgentContextCore with branded agentId and ownerId
 * @throws ZodError if validation fails
 *
 * @see AGNT-05
 */
export function parseAgentContext(json: unknown): AgentContextCore {
  return AgentContextCoreSchema.parse(json);
}
