import { z } from 'zod';
import { type CapabilityAgentScope } from "./capability-call-context.cjs";
import { type CapabilityOrdinaryConfiguration } from "./ordinary-configuration.cjs";
import { type AgentRuntimeIdentity } from "../agent/agent-runtime-identity.cjs";
export declare const CapabilityOrdinaryBundleReferenceSchema: z.ZodObject<{
    appliedVersion: z.ZodNumber;
    sha256: z.ZodString;
}, z.core.$strict>;
export type CapabilityOrdinaryBundleReference = z.infer<typeof CapabilityOrdinaryBundleReferenceSchema>;
export declare const CapabilityOrdinaryMembershipSchema: z.ZodEnum<{
    enabled: "enabled";
    disabled: "disabled";
    removed: "removed";
}>;
/** Operational admission is separate from loaded configuration and membership. */
export declare const CapabilityOrdinaryExecutionSchema: z.ZodEnum<{
    stopped: "stopped";
    running: "running";
}>;
export declare const CapabilityOrdinaryOperationSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"apply-config">;
    execution: z.ZodEnum<{
        stopped: "stopped";
        running: "running";
    }>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"reload">;
    execution: z.ZodEnum<{
        stopped: "stopped";
        running: "running";
    }>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"start">;
    execution: z.ZodLiteral<"running">;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"stop">;
    execution: z.ZodLiteral<"stopped">;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"restart">;
    execution: z.ZodLiteral<"running">;
}, z.core.$strict>], "action">;
export type CapabilityOrdinaryOperation = z.infer<typeof CapabilityOrdinaryOperationSchema>;
export declare const CapabilityOrdinaryLifecycleRequestSchema: z.ZodObject<{
    format: z.ZodLiteral<"ordinary-lifecycle-v1">;
    requestId: z.ZodString;
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    capability: z.ZodString;
    phase: z.ZodEnum<{
        prepare: "prepare";
        suspend: "suspend";
        activate: "activate";
        rollback: "rollback";
    }>;
    transition: z.ZodObject<{
        from: z.ZodNullable<z.ZodObject<{
            appliedVersion: z.ZodNumber;
            sha256: z.ZodString;
        }, z.core.$strict>>;
        to: z.ZodObject<{
            appliedVersion: z.ZodNumber;
            sha256: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>;
    targetMembership: z.ZodEnum<{
        enabled: "enabled";
        disabled: "disabled";
        removed: "removed";
    }>;
    operation: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        action: z.ZodLiteral<"apply-config">;
        execution: z.ZodEnum<{
            stopped: "stopped";
            running: "running";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"reload">;
        execution: z.ZodEnum<{
            stopped: "stopped";
            running: "running";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"start">;
        execution: z.ZodLiteral<"running">;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"stop">;
        execution: z.ZodLiteral<"stopped">;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"restart">;
        execution: z.ZodLiteral<"running">;
    }, z.core.$strict>], "action">>;
    configuration: z.ZodOptional<z.ZodObject<{
        format: z.ZodLiteral<"ordinary-v2">;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        capability: z.ZodString;
        version: z.ZodNumber;
        parameters: z.ZodArray<z.ZodObject<{
            parameter: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
            }, z.core.$strict>]>;
            origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"platform_default">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"agent_override">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"needs_choice">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"master">;
                source: z.ZodObject<{
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                    masterId: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>], "kind">;
            value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
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
                condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type CapabilityOrdinaryLifecycleRequest = z.infer<typeof CapabilityOrdinaryLifecycleRequestSchema>;
export declare const CapabilityOrdinaryLifecycleReceiptSchema: z.ZodObject<{
    request: z.ZodObject<{
        format: z.ZodLiteral<"ordinary-lifecycle-v1">;
        requestId: z.ZodString;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        capability: z.ZodString;
        phase: z.ZodEnum<{
            prepare: "prepare";
            suspend: "suspend";
            activate: "activate";
            rollback: "rollback";
        }>;
        transition: z.ZodObject<{
            from: z.ZodNullable<z.ZodObject<{
                appliedVersion: z.ZodNumber;
                sha256: z.ZodString;
            }, z.core.$strict>>;
            to: z.ZodObject<{
                appliedVersion: z.ZodNumber;
                sha256: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>;
        targetMembership: z.ZodEnum<{
            enabled: "enabled";
            disabled: "disabled";
            removed: "removed";
        }>;
        operation: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            action: z.ZodLiteral<"apply-config">;
            execution: z.ZodEnum<{
                stopped: "stopped";
                running: "running";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            action: z.ZodLiteral<"reload">;
            execution: z.ZodEnum<{
                stopped: "stopped";
                running: "running";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            action: z.ZodLiteral<"start">;
            execution: z.ZodLiteral<"running">;
        }, z.core.$strict>, z.ZodObject<{
            action: z.ZodLiteral<"stop">;
            execution: z.ZodLiteral<"stopped">;
        }, z.core.$strict>, z.ZodObject<{
            action: z.ZodLiteral<"restart">;
            execution: z.ZodLiteral<"running">;
        }, z.core.$strict>], "action">>;
        configuration: z.ZodOptional<z.ZodObject<{
            format: z.ZodLiteral<"ordinary-v2">;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            capability: z.ZodString;
            version: z.ZodNumber;
            parameters: z.ZodArray<z.ZodObject<{
                parameter: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                }, z.core.$strict>]>;
                origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"platform_default">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"agent_override">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"needs_choice">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"master">;
                    source: z.ZodObject<{
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                        masterId: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>], "kind">;
                value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
            }, z.core.$strict>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    operationId: z.ZodString;
    fence: z.ZodNumber;
    status: z.ZodEnum<{
        complete: "complete";
        pending: "pending";
    }>;
    outcome: z.ZodEnum<{
        error: "error";
        ok: "ok";
        "in-progress": "in-progress";
    }>;
    replayed: z.ZodBoolean;
    ordinaryState: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        capability: z.ZodString;
        desired: z.ZodNullable<z.ZodObject<{
            format: z.ZodLiteral<"ordinary-v2">;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            capability: z.ZodString;
            version: z.ZodNumber;
            parameters: z.ZodArray<z.ZodObject<{
                parameter: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                }, z.core.$strict>]>;
                origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"platform_default">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"agent_override">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"needs_choice">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"master">;
                    source: z.ZodObject<{
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                        masterId: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>], "kind">;
                value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        runtimeState: z.ZodEnum<{
            unknown: "unknown";
            loaded: "loaded";
            unloaded: "unloaded";
        }>;
        applied: z.ZodNullable<z.ZodObject<{
            configuration: z.ZodObject<{
                format: z.ZodLiteral<"ordinary-v2">;
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                capability: z.ZodString;
                version: z.ZodNumber;
                parameters: z.ZodArray<z.ZodObject<{
                    parameter: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
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
                            condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                            condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                            condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                            condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                    }, z.core.$strict>]>;
                    origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"platform_default">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"agent_override">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"needs_choice">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"master">;
                        source: z.ZodObject<{
                            ownerId: z.ZodString;
                            tenantId: z.ZodString;
                            masterId: z.ZodString;
                            version: z.ZodNumber;
                        }, z.core.$strict>;
                    }, z.core.$strict>], "kind">;
                    value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                }, z.core.$strict>>;
            }, z.core.$strict>;
            loadedAt: z.ZodISODateTime;
        }, z.core.$strict>>;
        failed: z.ZodNullable<z.ZodObject<{
            version: z.ZodNumber;
            reason: z.ZodObject<{
                code: z.ZodEnum<{
                    unknown: "unknown";
                    "not-loaded": "not-loaded";
                    "load-failed": "load-failed";
                    "validation-failed": "validation-failed";
                    timeout: "timeout";
                    "source-unavailable": "source-unavailable";
                    "shared-runtime": "shared-runtime";
                    "externally-owned": "externally-owned";
                    "not-supported": "not-supported";
                    "in-progress": "in-progress";
                }>;
                detail: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>>;
        effectiveParameters: z.ZodArray<z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            capability: z.ZodString;
            key: z.ZodString;
            value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
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
                condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
            mode: z.ZodEnum<{
                immediate: "immediate";
                next_apply: "next_apply";
            }>;
            sourceConfigVersion: z.ZodNumber;
            observedAt: z.ZodISODateTime;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    membershipEffective: z.ZodEnum<{
        unknown: "unknown";
        enabled: "enabled";
        disabled: "disabled";
        removed: "removed";
    }>;
    executionEffective: z.ZodOptional<z.ZodEnum<{
        unknown: "unknown";
        stopped: "stopped";
        running: "running";
    }>>;
    observedAt: z.ZodNullable<z.ZodISODateTime>;
}, z.core.$strict>;
export type CapabilityOrdinaryLifecycleReceipt = z.infer<typeof CapabilityOrdinaryLifecycleReceiptSchema>;
export declare const CapabilityOrdinaryLifecycleTransactionSchema: z.ZodObject<{
    request: z.ZodObject<{
        format: z.ZodLiteral<"ordinary-lifecycle-v1">;
        requestId: z.ZodString;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        capability: z.ZodString;
        phase: z.ZodEnum<{
            prepare: "prepare";
            suspend: "suspend";
            activate: "activate";
            rollback: "rollback";
        }>;
        transition: z.ZodObject<{
            from: z.ZodNullable<z.ZodObject<{
                appliedVersion: z.ZodNumber;
                sha256: z.ZodString;
            }, z.core.$strict>>;
            to: z.ZodObject<{
                appliedVersion: z.ZodNumber;
                sha256: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>;
        targetMembership: z.ZodEnum<{
            enabled: "enabled";
            disabled: "disabled";
            removed: "removed";
        }>;
        operation: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            action: z.ZodLiteral<"apply-config">;
            execution: z.ZodEnum<{
                stopped: "stopped";
                running: "running";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            action: z.ZodLiteral<"reload">;
            execution: z.ZodEnum<{
                stopped: "stopped";
                running: "running";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            action: z.ZodLiteral<"start">;
            execution: z.ZodLiteral<"running">;
        }, z.core.$strict>, z.ZodObject<{
            action: z.ZodLiteral<"stop">;
            execution: z.ZodLiteral<"stopped">;
        }, z.core.$strict>, z.ZodObject<{
            action: z.ZodLiteral<"restart">;
            execution: z.ZodLiteral<"running">;
        }, z.core.$strict>], "action">>;
        configuration: z.ZodOptional<z.ZodObject<{
            format: z.ZodLiteral<"ordinary-v2">;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            capability: z.ZodString;
            version: z.ZodNumber;
            parameters: z.ZodArray<z.ZodObject<{
                parameter: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                }, z.core.$strict>]>;
                origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"platform_default">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"agent_override">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"needs_choice">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"master">;
                    source: z.ZodObject<{
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                        masterId: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>], "kind">;
                value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
            }, z.core.$strict>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    state: z.ZodEnum<{
        pending: "pending";
        prepared: "prepared";
        suspended: "suspended";
        activated: "activated";
        rolled_back: "rolled_back";
        ambiguous: "ambiguous";
    }>;
    operationId: z.ZodString;
    fence: z.ZodNumber;
    receipts: z.ZodArray<z.ZodObject<{
        request: z.ZodObject<{
            format: z.ZodLiteral<"ordinary-lifecycle-v1">;
            requestId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            capability: z.ZodString;
            phase: z.ZodEnum<{
                prepare: "prepare";
                suspend: "suspend";
                activate: "activate";
                rollback: "rollback";
            }>;
            transition: z.ZodObject<{
                from: z.ZodNullable<z.ZodObject<{
                    appliedVersion: z.ZodNumber;
                    sha256: z.ZodString;
                }, z.core.$strict>>;
                to: z.ZodObject<{
                    appliedVersion: z.ZodNumber;
                    sha256: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>;
            targetMembership: z.ZodEnum<{
                enabled: "enabled";
                disabled: "disabled";
                removed: "removed";
            }>;
            operation: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                action: z.ZodLiteral<"apply-config">;
                execution: z.ZodEnum<{
                    stopped: "stopped";
                    running: "running";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                action: z.ZodLiteral<"reload">;
                execution: z.ZodEnum<{
                    stopped: "stopped";
                    running: "running";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                action: z.ZodLiteral<"start">;
                execution: z.ZodLiteral<"running">;
            }, z.core.$strict>, z.ZodObject<{
                action: z.ZodLiteral<"stop">;
                execution: z.ZodLiteral<"stopped">;
            }, z.core.$strict>, z.ZodObject<{
                action: z.ZodLiteral<"restart">;
                execution: z.ZodLiteral<"running">;
            }, z.core.$strict>], "action">>;
            configuration: z.ZodOptional<z.ZodObject<{
                format: z.ZodLiteral<"ordinary-v2">;
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                capability: z.ZodString;
                version: z.ZodNumber;
                parameters: z.ZodArray<z.ZodObject<{
                    parameter: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
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
                            condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                            condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                            condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                            condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                    }, z.core.$strict>]>;
                    origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"platform_default">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"agent_override">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"needs_choice">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"master">;
                        source: z.ZodObject<{
                            ownerId: z.ZodString;
                            tenantId: z.ZodString;
                            masterId: z.ZodString;
                            version: z.ZodNumber;
                        }, z.core.$strict>;
                    }, z.core.$strict>], "kind">;
                    value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                }, z.core.$strict>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        operationId: z.ZodString;
        fence: z.ZodNumber;
        status: z.ZodEnum<{
            complete: "complete";
            pending: "pending";
        }>;
        outcome: z.ZodEnum<{
            error: "error";
            ok: "ok";
            "in-progress": "in-progress";
        }>;
        replayed: z.ZodBoolean;
        ordinaryState: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            capability: z.ZodString;
            desired: z.ZodNullable<z.ZodObject<{
                format: z.ZodLiteral<"ordinary-v2">;
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                capability: z.ZodString;
                version: z.ZodNumber;
                parameters: z.ZodArray<z.ZodObject<{
                    parameter: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
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
                            condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                            condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                            condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                            condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                    }, z.core.$strict>]>;
                    origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"platform_default">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"agent_override">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"needs_choice">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"master">;
                        source: z.ZodObject<{
                            ownerId: z.ZodString;
                            tenantId: z.ZodString;
                            masterId: z.ZodString;
                            version: z.ZodNumber;
                        }, z.core.$strict>;
                    }, z.core.$strict>], "kind">;
                    value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            runtimeState: z.ZodEnum<{
                unknown: "unknown";
                loaded: "loaded";
                unloaded: "unloaded";
            }>;
            applied: z.ZodNullable<z.ZodObject<{
                configuration: z.ZodObject<{
                    format: z.ZodLiteral<"ordinary-v2">;
                    scope: z.ZodObject<{
                        agentId: z.ZodString;
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                    }, z.core.$strict>;
                    capability: z.ZodString;
                    version: z.ZodNumber;
                    parameters: z.ZodArray<z.ZodObject<{
                        parameter: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
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
                                condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                                condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                                condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                                condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        }, z.core.$strict>]>;
                        origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"platform_default">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"agent_override">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"needs_choice">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"master">;
                            source: z.ZodObject<{
                                ownerId: z.ZodString;
                                tenantId: z.ZodString;
                                masterId: z.ZodString;
                                version: z.ZodNumber;
                            }, z.core.$strict>;
                        }, z.core.$strict>], "kind">;
                        value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
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
                            condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                            condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                            condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                            condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                    }, z.core.$strict>>;
                }, z.core.$strict>;
                loadedAt: z.ZodISODateTime;
            }, z.core.$strict>>;
            failed: z.ZodNullable<z.ZodObject<{
                version: z.ZodNumber;
                reason: z.ZodObject<{
                    code: z.ZodEnum<{
                        unknown: "unknown";
                        "not-loaded": "not-loaded";
                        "load-failed": "load-failed";
                        "validation-failed": "validation-failed";
                        timeout: "timeout";
                        "source-unavailable": "source-unavailable";
                        "shared-runtime": "shared-runtime";
                        "externally-owned": "externally-owned";
                        "not-supported": "not-supported";
                        "in-progress": "in-progress";
                    }>;
                    detail: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>;
            }, z.core.$strict>>;
            effectiveParameters: z.ZodArray<z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                capability: z.ZodString;
                key: z.ZodString;
                value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                mode: z.ZodEnum<{
                    immediate: "immediate";
                    next_apply: "next_apply";
                }>;
                sourceConfigVersion: z.ZodNumber;
                observedAt: z.ZodISODateTime;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        membershipEffective: z.ZodEnum<{
            unknown: "unknown";
            enabled: "enabled";
            disabled: "disabled";
            removed: "removed";
        }>;
        executionEffective: z.ZodOptional<z.ZodEnum<{
            unknown: "unknown";
            stopped: "stopped";
            running: "running";
        }>>;
        observedAt: z.ZodNullable<z.ZodISODateTime>;
    }, z.core.$strict>>;
    previousState: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        capability: z.ZodString;
        desired: z.ZodNullable<z.ZodObject<{
            format: z.ZodLiteral<"ordinary-v2">;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            capability: z.ZodString;
            version: z.ZodNumber;
            parameters: z.ZodArray<z.ZodObject<{
                parameter: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                }, z.core.$strict>]>;
                origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"platform_default">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"agent_override">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"needs_choice">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"master">;
                    source: z.ZodObject<{
                        ownerId: z.ZodString;
                        tenantId: z.ZodString;
                        masterId: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>], "kind">;
                value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                    condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        runtimeState: z.ZodEnum<{
            unknown: "unknown";
            loaded: "loaded";
            unloaded: "unloaded";
        }>;
        applied: z.ZodNullable<z.ZodObject<{
            configuration: z.ZodObject<{
                format: z.ZodLiteral<"ordinary-v2">;
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                capability: z.ZodString;
                version: z.ZodNumber;
                parameters: z.ZodArray<z.ZodObject<{
                    parameter: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
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
                            condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                            condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                            condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                            condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                    }, z.core.$strict>]>;
                    origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"platform_default">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"agent_override">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"needs_choice">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"master">;
                        source: z.ZodObject<{
                            ownerId: z.ZodString;
                            tenantId: z.ZodString;
                            masterId: z.ZodString;
                            version: z.ZodNumber;
                        }, z.core.$strict>;
                    }, z.core.$strict>], "kind">;
                    value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                        condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                }, z.core.$strict>>;
            }, z.core.$strict>;
            loadedAt: z.ZodISODateTime;
        }, z.core.$strict>>;
        failed: z.ZodNullable<z.ZodObject<{
            version: z.ZodNumber;
            reason: z.ZodObject<{
                code: z.ZodEnum<{
                    unknown: "unknown";
                    "not-loaded": "not-loaded";
                    "load-failed": "load-failed";
                    "validation-failed": "validation-failed";
                    timeout: "timeout";
                    "source-unavailable": "source-unavailable";
                    "shared-runtime": "shared-runtime";
                    "externally-owned": "externally-owned";
                    "not-supported": "not-supported";
                    "in-progress": "in-progress";
                }>;
                detail: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>>;
        effectiveParameters: z.ZodArray<z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            capability: z.ZodString;
            key: z.ZodString;
            value: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
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
                condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
                condition: z.ZodType<import("./index.js").Condition, unknown, z.core.$ZodTypeInternals<import("./index.js").Condition, unknown>>;
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
            mode: z.ZodEnum<{
                immediate: "immediate";
                next_apply: "next_apply";
            }>;
            sourceConfigVersion: z.ZodNumber;
            observedAt: z.ZodISODateTime;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    previousMembership: z.ZodEnum<{
        unknown: "unknown";
        enabled: "enabled";
        disabled: "disabled";
        removed: "removed";
    }>;
    previousExecution: z.ZodOptional<z.ZodEnum<{
        unknown: "unknown";
        stopped: "stopped";
        running: "running";
    }>>;
}, z.core.$strict>;
export type CapabilityOrdinaryLifecycleTransaction = z.infer<typeof CapabilityOrdinaryLifecycleTransactionSchema>;
/** Obtained from authenticated CoreApply lookup of the verified candidate, never from the request body. */
export type CapabilityOrdinaryLifecycleAuthority = {
    scope: CapabilityAgentScope;
    identity: AgentRuntimeIdentity;
    capability: string;
    requestId: string;
    bundle: CapabilityOrdinaryBundleReference;
    current: CapabilityOrdinaryBundleReference | null;
    membership: z.infer<typeof CapabilityOrdinaryMembershipSchema>;
    configuration: CapabilityOrdinaryConfiguration | null;
    transaction: CapabilityOrdinaryLifecycleTransaction | null;
    operation?: CapabilityOrdinaryOperation | undefined;
};
/** Validation is pure. The producer owns durable slot/receipt/fence storage and consumer reconciliation. */
export declare function parseCapabilityOrdinaryLifecycle(request: unknown, authority: CapabilityOrdinaryLifecycleAuthority): {
    request: CapabilityOrdinaryLifecycleRequest;
    replay: CapabilityOrdinaryLifecycleReceipt | null;
};
/** Validate server-produced evidence. This does not execute effects or manufacture consumer timestamps. */
export declare function parseCapabilityOrdinaryLifecycleReceipt(receipt: unknown, request: CapabilityOrdinaryLifecycleRequest, transaction: CapabilityOrdinaryLifecycleTransaction): CapabilityOrdinaryLifecycleReceipt;
//# sourceMappingURL=ordinary-lifecycle.d.ts.map