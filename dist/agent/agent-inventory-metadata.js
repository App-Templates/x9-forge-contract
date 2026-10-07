import { z } from 'zod';
import { CapabilityRegistryEntrySchema } from "../capability/capability-registry-entry.js";
/** Registry observation for one agent; never includes locations, credentials or tool configuration. */
export const AgentInventoryCapabilitySchema = CapabilityRegistryEntrySchema.pick({ name: true, enabled: true }).strict();
export const AgentInventoryCapabilitiesSchema = z.array(AgentInventoryCapabilitySchema);
/** Only the declared registry observation: [] is known empty, missing/null/invalid is unknown. */
export function agentCapabilitiesOf(row) {
    if (row === null || typeof row !== 'object')
        return null;
    const selected = AgentInventoryCapabilitiesSchema.safeParse(row.capabilities);
    return selected.success ? selected.data : null;
}
//# sourceMappingURL=agent-inventory-metadata.js.map