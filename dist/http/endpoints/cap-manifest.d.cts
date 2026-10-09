import { z } from 'zod';
import { CapabilityManifestSchema } from "../../capability/capability-manifest.cjs";
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
        ordinaryParameters: z.ZodOptional<z.ZodObject<{
            parameters: z.ZodArray<z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
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
            }, z.core.$strict>], "type">, z.ZodObject<{
                optional: z.ZodBoolean;
                key: z.ZodString;
                status: z.ZodEnum<{
                    decided: "decided";
                    proposed: "proposed";
                }>;
                label: z.ZodString;
                description: z.ZodString;
                explanation: z.ZodOptional<z.ZodString>;
                group: z.ZodOptional<z.ZodString>;
                unit: z.ZodOptional<z.ZodString>;
                reference: z.ZodString;
                appliesWhen: z.ZodEnum<{
                    immediate: "immediate";
                    next_apply: "next_apply";
                }>;
                consumes: z.ZodBoolean;
                editableBy: z.ZodArray<z.ZodEnum<{
                    superadmin: "superadmin";
                    owner: "owner";
                }>>;
                type: z.ZodLiteral<"structured">;
                schemaKey: z.ZodEnum<{
                    "briefing.feeds": "briefing.feeds";
                    "briefing.categoryWeights": "briefing.categoryWeights";
                    "news.feeds": "news.feeds";
                    "rules.briefing": "rules.briefing";
                    "rules.news": "rules.news";
                    "rules.netatmo": "rules.netatmo";
                    "rules.security": "rules.security";
                    "security.cameraPolicies": "security.cameraPolicies";
                }>;
                schemaVersion: z.ZodLiteral<1>;
                platformDefault: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
                    url: z.ZodString;
                    category: z.ZodString;
                    maxPerCategory: z.ZodOptional<z.ZodNumber>;
                    label: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    url: z.ZodString;
                    category: z.ZodString;
                    weight: z.ZodDefault<z.ZodNumber>;
                }, z.core.$strict>>, z.ZodRecord<z.ZodString, z.ZodNumber>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"briefing">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"skip_section">;
                        section: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_section">;
                        section: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_tone">;
                        tone: z.ZodEnum<{
                            formal: "formal";
                            terse: "terse";
                            friendly: "friendly";
                        }>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_maxWords">;
                        maxWords: z.ZodNumber;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_greeting">;
                        greeting: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_feed_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"skip_feed_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_closing">;
                        text: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_cronSchedule">;
                        cron: z.ZodString;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"news">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"skip_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"add_category">;
                        category: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_hours_back">;
                        hours: z.ZodNumber;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_max_per_category">;
                        category: z.ZodString;
                        max: z.ZodNumber;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"netatmo">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"auto_light_on">;
                        module_id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"auto_light_off">;
                        module_id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"suppress_automation">;
                        module_id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_is_dark_offset">;
                        offset_minutes: z.ZodNumber;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    skill: z.ZodLiteral<"security">;
                    condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
                    action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"set_pir">;
                        enabled: z.ZodBoolean;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_sleep">;
                        enabled: z.ZodBoolean;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_ir">;
                        mode: z.ZodEnum<{
                            on: "on";
                            off: "off";
                            auto: "auto";
                        }>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"set_floodlight">;
                        enabled: z.ZodBoolean;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"auto_patrol">;
                    }, z.core.$strict>], "type">;
                    priority: z.ZodNumber;
                    created_by: z.ZodEnum<{
                        user: "user";
                        operator: "operator";
                    }>;
                    created_at: z.ZodString;
                    description: z.ZodString;
                    locked: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strict>>, z.ZodArray<z.ZodObject<{
                    uid: z.ZodString;
                    name: z.ZodString;
                    role: z.ZodEnum<{
                        primary: "primary";
                        secondary: "secondary";
                    }>;
                    enabled: z.ZodBoolean;
                    ptz_presets: z.ZodObject<{
                        left: z.ZodNumber;
                        center: z.ZodNumber;
                        right: z.ZodNumber;
                    }, z.core.$strict>;
                    siren: z.ZodBoolean;
                    battery: z.ZodBoolean;
                }, z.core.$strict>>]>>;
            }, z.core.$strict>]>>;
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
    }, z.core.$strip>;
};
export { CapabilityManifestSchema as CapManifestResponseSchema };
export type { CapabilityManifest as CapManifestResponse } from "../../capability/capability-manifest.cjs";
//# sourceMappingURL=cap-manifest.d.ts.map