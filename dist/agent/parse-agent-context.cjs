"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAgentContext = parseAgentContext;
const agent_context_core_js_1 = require("./agent-context-core.cjs");
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
function parseAgentContext(json) {
    return agent_context_core_js_1.AgentContextCoreSchema.parse(json);
}
//# sourceMappingURL=parse-agent-context.js.map