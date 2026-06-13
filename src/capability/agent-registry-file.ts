import { z } from 'zod';
import { CapabilityRegistryEntrySchema } from './capability-registry-entry.js';

/**
 * Canonical shape of a per-agent `registry.json` FILE — the wrapper object
 * around the capability entries. Shared between Forge factory-svc (writer)
 * and X9 agent-core (reader).
 *
 * The per-ENTRY shape lives in {@link CapabilityRegistryEntrySchema}; THIS
 * schema fixes the FILE-level wrapper that previously drifted across the
 * boundary and was never contract-defined:
 *
 * - Forge `deploy.machine` write-registry wrote a **bare array**
 *   (`[]` when no capabilities were selected, `[{...}]` otherwise) and
 *   `capabilities.service` read/wrote the same bare array.
 * - X9 agent-core `loadRegistry` parsed with `z.object({ capabilities: [...] })`.
 *
 * Result: every factory-provisioned agent failed reload with Zod
 * `"expected object, received array"` (HTTP 500 → agent `degraded`). This is
 * a Bug #15-class cross-repo drift — the exact failure R-14 exists to prevent
 * (a shared on-disk shape that was never owned by the bridge). Defining the
 * wrapper here makes both sides import ONE contract.
 *
 * `capabilities: []` is valid — an agent with zero selected capabilities.
 *
 * Note: X9's runtime registry schema is a deliberate **superset** of this
 * (it also accepts legacy entries with `endpoint`+`tools` for the GLOBAL
 * `/app/registry.json`). Any value valid under THIS schema MUST parse green
 * under X9's reader — see the X9 compat-guard test.
 *
 * @see CapabilityRegistryEntrySchema — the per-entry shape
 * @since v1.15.0 (layer-4 registry-shape-drift fix, 2026-06-13)
 */
export const AgentRegistryFileSchema = z.object({
  capabilities: z.array(CapabilityRegistryEntrySchema),
});

export type AgentRegistryFile = z.infer<typeof AgentRegistryFileSchema>;
