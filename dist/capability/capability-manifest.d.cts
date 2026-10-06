import { z } from 'zod';
/**
 * Manifest served by each capability service at GET /manifest
 * (capability identity is conveyed by the caller's baseUrl, not a path prefix).
 *
 * - `endpoint`: full URL as reported by the service itself (e.g. "http://cap-calendar:3000").
 *   Reflects Docker hostname + port. Used by X9 generate-registry to seed CapabilityRegistryEntry.
 * - `serviceName`: Docker hostname added by Forge X9Client.discoverCapabilities() at discovery
 *   time. Absent when the manifest is served directly by the capability itself.
 * - `tools`: list of tools the capability exposes. Used by X9 at boot to build tool definitions.
 */
export declare const CapabilityManifestSchema: z.ZodObject<{
    name: z.ZodString;
    version: z.ZodString;
    endpoint: z.ZodString;
    serviceName: z.ZodOptional<z.ZodString>;
    tools: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        inputSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
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
        }, z.core.$strict>, z.ZodObject<{
            type: z.ZodLiteral<"string">;
            minLength: z.ZodOptional<z.ZodNumber>;
            maxLength: z.ZodOptional<z.ZodNumber>;
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
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        feedback: z.ZodOptional<z.ZodObject<{
            label: z.ZodString;
            kind: z.ZodLiteral<"rating">;
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
}, z.core.$strip>;
export type CapabilityManifest = z.infer<typeof CapabilityManifestSchema>;
//# sourceMappingURL=capability-manifest.d.ts.map