import { z } from 'zod';
/** Registry observation for one agent; never includes locations, credentials or tool configuration. */
export declare const AgentInventoryCapabilitySchema: z.ZodObject<{
    name: z.ZodString;
    enabled: z.ZodBoolean;
}, z.core.$strict>;
export type AgentInventoryCapability = z.infer<typeof AgentInventoryCapabilitySchema>;
export declare const AgentInventoryCapabilitiesSchema: z.ZodArray<z.ZodObject<{
    name: z.ZodString;
    enabled: z.ZodBoolean;
}, z.core.$strict>>;
/** Only the declared registry observation: [] is known empty, missing/null/invalid is unknown. */
export declare function agentCapabilitiesOf(row: unknown): AgentInventoryCapability[] | null;
//# sourceMappingURL=agent-inventory-metadata.d.ts.map