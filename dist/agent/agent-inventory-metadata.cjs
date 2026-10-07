"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentInventoryCapabilitiesSchema = exports.AgentInventoryCapabilitySchema = void 0;
exports.agentCapabilitiesOf = agentCapabilitiesOf;
const zod_1 = require("zod");
const capability_registry_entry_js_1 = require("../capability/capability-registry-entry.cjs");
/** Registry observation for one agent; never includes locations, credentials or tool configuration. */
exports.AgentInventoryCapabilitySchema = capability_registry_entry_js_1.CapabilityRegistryEntrySchema.pick({ name: true, enabled: true }).strict();
exports.AgentInventoryCapabilitiesSchema = zod_1.z.array(exports.AgentInventoryCapabilitySchema);
/** Only the declared registry observation: [] is known empty, missing/null/invalid is unknown. */
function agentCapabilitiesOf(row) {
    if (row === null || typeof row !== 'object')
        return null;
    const selected = exports.AgentInventoryCapabilitiesSchema.safeParse(row.capabilities);
    return selected.success ? selected.data : null;
}
//# sourceMappingURL=agent-inventory-metadata.js.map