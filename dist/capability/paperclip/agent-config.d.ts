import { z } from 'zod';
/** Ordinary desired settings. Parsing never grants native identity or authorizes a role. */
export declare const PaperclipAgentConfigSchema: z.ZodObject<{
    agentId: z.ZodString;
    version: z.ZodNumber;
    unitId: z.ZodString;
    roleRef: z.ZodString;
}, z.core.$strict>;
export type PaperclipAgentConfig = z.infer<typeof PaperclipAgentConfigSchema>;
/** SHA256 of non-secret configuration/inventory, never a credential fingerprint. */
export declare const PaperclipConfigFingerprintSchema: z.ZodString;
/** Operator inventory provenance is evidence to verify, not authority conferred by parsing. */
export declare const PaperclipProvisioningProvenanceSchema: z.ZodObject<{
    source: z.ZodLiteral<"native_operator_inventory">;
    inventoryFingerprint: z.ZodString;
}, z.core.$strict>;
export declare const PaperclipAppliedAgentBindingSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    unitId: z.ZodString;
    companyId: z.ZodUUID;
    paperclipAgentId: z.ZodUUID;
    enabled: z.ZodBoolean;
    roleAgents: z.ZodRecord<z.ZodString, z.ZodUUID>;
    callerRoleRef: z.ZodString;
    provisioningRevision: z.ZodNumber;
    provenance: z.ZodObject<{
        source: z.ZodLiteral<"native_operator_inventory">;
        inventoryFingerprint: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type PaperclipAppliedAgentBinding = z.infer<typeof PaperclipAppliedAgentBindingSchema>;
/** Internal trusted installation intent. The cap derives native IDs from its inventory. */
export declare const PaperclipAgentInstallRequestSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    version: z.ZodNumber;
    enabled: z.ZodBoolean;
    registryFingerprint: z.ZodString;
}, z.core.$strict>;
export type PaperclipAgentInstallRequest = z.infer<typeof PaperclipAgentInstallRequestSchema>;
/** Actual installed metadata. It attests neither a native run nor provider/key readiness. */
export declare const PaperclipAgentReadbackSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    unitId: z.ZodString;
    companyId: z.ZodUUID;
    paperclipAgentId: z.ZodUUID;
    enabled: z.ZodBoolean;
    roleAgents: z.ZodRecord<z.ZodString, z.ZodUUID>;
    callerRoleRef: z.ZodString;
    provisioningRevision: z.ZodNumber;
    provenance: z.ZodObject<{
        source: z.ZodLiteral<"native_operator_inventory">;
        inventoryFingerprint: z.ZodString;
    }, z.core.$strict>;
    appliedVersion: z.ZodNumber;
    registryFingerprint: z.ZodString;
    configFingerprint: z.ZodString;
}, z.core.$strict>;
export type PaperclipAgentReadback = z.infer<typeof PaperclipAgentReadbackSchema>;
/** Correspondence only: the consumer still authenticates, installs and observes current state. */
export declare function matchesPaperclipInstallation(rawRequest: unknown, rawReadback: unknown): boolean;
/** One Paperclip installation per agent. Other capabilities retain their legacy context fields. */
export declare const PaperclipCapabilityInstallationSchema: z.ZodObject<{
    capability: z.ZodLiteral<"paperclip">;
    installation: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        version: z.ZodNumber;
        enabled: z.ZodBoolean;
        registryFingerprint: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const PaperclipCapabilityAttestationSchema: z.ZodObject<{
    capability: z.ZodLiteral<"paperclip">;
    readback: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        unitId: z.ZodString;
        companyId: z.ZodUUID;
        paperclipAgentId: z.ZodUUID;
        enabled: z.ZodBoolean;
        roleAgents: z.ZodRecord<z.ZodString, z.ZodUUID>;
        callerRoleRef: z.ZodString;
        provisioningRevision: z.ZodNumber;
        provenance: z.ZodObject<{
            source: z.ZodLiteral<"native_operator_inventory">;
            inventoryFingerprint: z.ZodString;
        }, z.core.$strict>;
        appliedVersion: z.ZodNumber;
        registryFingerprint: z.ZodString;
        configFingerprint: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type PaperclipCapabilityInstallation = z.infer<typeof PaperclipCapabilityInstallationSchema>;
export type PaperclipCapabilityAttestation = z.infer<typeof PaperclipCapabilityAttestationSchema>;
//# sourceMappingURL=agent-config.d.ts.map