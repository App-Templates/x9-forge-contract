import { z } from 'zod';
import { CapabilityRegistryEntrySchema } from '../capability/capability-registry-entry.js';

/** Registry observation for one agent; never includes locations, credentials or tool configuration. */
export const AgentInventoryCapabilitySchema = CapabilityRegistryEntrySchema.pick({ name: true, enabled: true }).strict();
export type AgentInventoryCapability = z.infer<typeof AgentInventoryCapabilitySchema>;
export const AgentInventoryCapabilitiesSchema = z.array(AgentInventoryCapabilitySchema);

/** Only the declared registry observation: [] is known empty, missing/null/invalid is unknown. */
export function agentCapabilitiesOf(row: unknown): AgentInventoryCapability[] | null {
  if (row === null || typeof row !== 'object') return null;
  const selected = AgentInventoryCapabilitiesSchema.safeParse((row as { capabilities?: unknown }).capabilities);
  return selected.success ? selected.data : null;
}
