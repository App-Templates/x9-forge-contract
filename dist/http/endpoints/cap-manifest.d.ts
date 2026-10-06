import { z } from 'zod';
import { CapabilityManifestSchema } from "../../capability/capability-manifest.js";
/**
 * GET /manifest — capability manifest discovery.
 * Direction: Forge factory-svc -> X9 capability services (or any -> cap-svc)
 * Auth: None (public discovery endpoint)
 * Requirement: HTTP-08
 *
 * Response is the CapabilityManifest schema (already defined in Phase 1).
 * The capability identity is conveyed by the caller's `baseUrl` (Docker hostname),
 * not by a path segment — each capability service mounts this route at root.
 */
export declare const capManifestContract: {
    readonly method: "GET";
    readonly path: "/manifest";
    readonly authType: "none";
    readonly responseSchema: z.ZodObject<{
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
};
export { CapabilityManifestSchema as CapManifestResponseSchema };
export type { CapabilityManifest as CapManifestResponse } from "../../capability/capability-manifest.js";
//# sourceMappingURL=cap-manifest.d.ts.map