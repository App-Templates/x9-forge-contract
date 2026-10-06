import { z } from 'zod';
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
export declare const AgentRegistryFileSchema: z.ZodObject<{
    capabilities: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        enabled: z.ZodBoolean;
        host: z.ZodString;
        port: z.ZodNumber;
        version: z.ZodString;
        protocol: z.ZodOptional<z.ZodEnum<{
            http: "http";
            https: "https";
        }>>;
        tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            inputSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strip>>>;
        modelPolicy: z.ZodOptional<z.ZodObject<{
            min: z.ZodEnum<{
                standard: "standard";
                advanced: "advanced";
                reasoning: "reasoning";
            }>;
            max: z.ZodEnum<{
                standard: "standard";
                advanced: "advanced";
                reasoning: "reasoning";
            }>;
        }, z.core.$strip>>;
        requires: z.ZodOptional<z.ZodArray<z.ZodString>>;
        context: z.ZodOptional<z.ZodObject<{
            maxChars: z.ZodNumber;
        }, z.core.$strip>>;
        turnLead: z.ZodOptional<z.ZodObject<{}, z.core.$strict>>;
        parameters: z.ZodOptional<z.ZodObject<{
            parameters: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                type: z.ZodLiteral<"number">;
                min: z.ZodOptional<z.ZodNumber>;
                max: z.ZodOptional<z.ZodNumber>;
                platformDefault: z.ZodOptional<z.ZodNumber>;
                key: z.ZodString;
                label: z.ZodString;
                description: z.ZodString;
                explanation: z.ZodOptional<z.ZodString>;
                group: z.ZodOptional<z.ZodString>;
                unit: z.ZodOptional<z.ZodString>;
                status: z.ZodEnum<{
                    decided: "decided";
                    proposed: "proposed";
                }>;
                reference: z.ZodString;
                appliesWhen: z.ZodEnum<{
                    immediate: "immediate";
                    next_apply: "next_apply";
                }>;
                consumes: z.ZodBoolean;
                optional: z.ZodBoolean;
                editableBy: z.ZodArray<z.ZodEnum<{
                    superadmin: "superadmin";
                    owner: "owner";
                }>>;
            }, z.core.$strict>, z.ZodObject<{
                type: z.ZodLiteral<"integer">;
                min: z.ZodOptional<z.ZodNumber>;
                max: z.ZodOptional<z.ZodNumber>;
                platformDefault: z.ZodOptional<z.ZodNumber>;
                key: z.ZodString;
                label: z.ZodString;
                description: z.ZodString;
                explanation: z.ZodOptional<z.ZodString>;
                group: z.ZodOptional<z.ZodString>;
                unit: z.ZodOptional<z.ZodString>;
                status: z.ZodEnum<{
                    decided: "decided";
                    proposed: "proposed";
                }>;
                reference: z.ZodString;
                appliesWhen: z.ZodEnum<{
                    immediate: "immediate";
                    next_apply: "next_apply";
                }>;
                consumes: z.ZodBoolean;
                optional: z.ZodBoolean;
                editableBy: z.ZodArray<z.ZodEnum<{
                    superadmin: "superadmin";
                    owner: "owner";
                }>>;
            }, z.core.$strict>, z.ZodObject<{
                type: z.ZodLiteral<"string">;
                minLength: z.ZodOptional<z.ZodNumber>;
                maxLength: z.ZodOptional<z.ZodNumber>;
                pattern: z.ZodOptional<z.ZodString>;
                platformDefault: z.ZodOptional<z.ZodString>;
                key: z.ZodString;
                label: z.ZodString;
                description: z.ZodString;
                explanation: z.ZodOptional<z.ZodString>;
                group: z.ZodOptional<z.ZodString>;
                unit: z.ZodOptional<z.ZodString>;
                status: z.ZodEnum<{
                    decided: "decided";
                    proposed: "proposed";
                }>;
                reference: z.ZodString;
                appliesWhen: z.ZodEnum<{
                    immediate: "immediate";
                    next_apply: "next_apply";
                }>;
                consumes: z.ZodBoolean;
                optional: z.ZodBoolean;
                editableBy: z.ZodArray<z.ZodEnum<{
                    superadmin: "superadmin";
                    owner: "owner";
                }>>;
            }, z.core.$strict>, z.ZodObject<{
                type: z.ZodLiteral<"boolean">;
                platformDefault: z.ZodOptional<z.ZodBoolean>;
                key: z.ZodString;
                label: z.ZodString;
                description: z.ZodString;
                explanation: z.ZodOptional<z.ZodString>;
                group: z.ZodOptional<z.ZodString>;
                unit: z.ZodOptional<z.ZodString>;
                status: z.ZodEnum<{
                    decided: "decided";
                    proposed: "proposed";
                }>;
                reference: z.ZodString;
                appliesWhen: z.ZodEnum<{
                    immediate: "immediate";
                    next_apply: "next_apply";
                }>;
                consumes: z.ZodBoolean;
                optional: z.ZodBoolean;
                editableBy: z.ZodArray<z.ZodEnum<{
                    superadmin: "superadmin";
                    owner: "owner";
                }>>;
            }, z.core.$strict>, z.ZodObject<{
                type: z.ZodLiteral<"enum">;
                options: z.ZodArray<z.ZodObject<{
                    value: z.ZodString;
                    label: z.ZodString;
                }, z.core.$strict>>;
                platformDefault: z.ZodOptional<z.ZodString>;
                key: z.ZodString;
                label: z.ZodString;
                description: z.ZodString;
                explanation: z.ZodOptional<z.ZodString>;
                group: z.ZodOptional<z.ZodString>;
                unit: z.ZodOptional<z.ZodString>;
                status: z.ZodEnum<{
                    decided: "decided";
                    proposed: "proposed";
                }>;
                reference: z.ZodString;
                appliesWhen: z.ZodEnum<{
                    immediate: "immediate";
                    next_apply: "next_apply";
                }>;
                consumes: z.ZodBoolean;
                optional: z.ZodBoolean;
                editableBy: z.ZodArray<z.ZodEnum<{
                    superadmin: "superadmin";
                    owner: "owner";
                }>>;
            }, z.core.$strict>, z.ZodObject<{
                type: z.ZodLiteral<"string_list">;
                minItems: z.ZodOptional<z.ZodNumber>;
                maxItems: z.ZodOptional<z.ZodNumber>;
                options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    value: z.ZodString;
                    label: z.ZodString;
                }, z.core.$strict>>>;
                pattern: z.ZodOptional<z.ZodString>;
                platformDefault: z.ZodOptional<z.ZodArray<z.ZodString>>;
                key: z.ZodString;
                label: z.ZodString;
                description: z.ZodString;
                explanation: z.ZodOptional<z.ZodString>;
                group: z.ZodOptional<z.ZodString>;
                unit: z.ZodOptional<z.ZodString>;
                status: z.ZodEnum<{
                    decided: "decided";
                    proposed: "proposed";
                }>;
                reference: z.ZodString;
                appliesWhen: z.ZodEnum<{
                    immediate: "immediate";
                    next_apply: "next_apply";
                }>;
                consumes: z.ZodBoolean;
                optional: z.ZodBoolean;
                editableBy: z.ZodArray<z.ZodEnum<{
                    superadmin: "superadmin";
                    owner: "owner";
                }>>;
            }, z.core.$strict>], "type">>;
            consumes: z.ZodBoolean;
            spendLedger: z.ZodBoolean;
        }, z.core.$strict>>;
        presentation: z.ZodOptional<z.ZodObject<{
            outputs: z.ZodOptional<z.ZodObject<{
                label: z.ZodString;
                kinds: z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                }, z.core.$strict>>;
                fields: z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    label: z.ZodString;
                    type: z.ZodEnum<{
                        number: "number";
                        boolean: "boolean";
                        text: "text";
                        json: "json";
                    }>;
                    min: z.ZodOptional<z.ZodNumber>;
                    max: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            feedback: z.ZodOptional<z.ZodObject<{
                label: z.ZodString;
                kind: z.ZodEnum<{
                    rating: "rating";
                    approval: "approval";
                }>;
                attachments: z.ZodBoolean;
                sources: z.ZodArray<z.ZodEnum<{
                    project_view: "project_view";
                    domain_app: "domain_app";
                }>>;
            }, z.core.$strict>>;
            trends: z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                label: z.ZodString;
                unit: z.ZodString;
            }, z.core.$strict>>>;
        }, z.core.$strict>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type AgentRegistryFile = z.infer<typeof AgentRegistryFileSchema>;
//# sourceMappingURL=agent-registry-file.d.ts.map