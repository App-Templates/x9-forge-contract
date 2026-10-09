import { z } from 'zod';
import { type CapabilityAgentScope } from "./capability-call-context.cjs";
import { type CapabilityParameter } from "./parameters.cjs";
import { type CapabilityRulesWriteAuthority } from "./configuration/rules.cjs";
import { type CameraPoliciesWriteAuthority } from "./configuration/camera-policy.cjs";
export declare const CapabilityOrdinaryStructuredCodecs: {
    readonly 'briefing.feeds': z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        category: z.ZodString;
        weight: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strict>>;
    readonly 'briefing.categoryWeights': z.ZodRecord<z.ZodString, z.ZodNumber>;
    readonly 'news.feeds': z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        category: z.ZodString;
        maxPerCategory: z.ZodOptional<z.ZodNumber>;
        label: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    readonly 'rules.briefing': z.ZodArray<z.ZodObject<{
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
    }, z.core.$strict>>;
    readonly 'rules.news': z.ZodArray<z.ZodObject<{
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
    }, z.core.$strict>>;
    readonly 'rules.netatmo': z.ZodArray<z.ZodObject<{
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
    }, z.core.$strict>>;
    readonly 'rules.security': z.ZodArray<z.ZodObject<{
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
    }, z.core.$strict>>;
    readonly 'security.cameraPolicies': z.ZodArray<z.ZodObject<{
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
    }, z.core.$strict>>;
};
export declare const CapabilityOrdinaryStructuredSchemaKeySchema: z.ZodEnum<{
    "briefing.feeds": "briefing.feeds";
    "briefing.categoryWeights": "briefing.categoryWeights";
    "news.feeds": "news.feeds";
    "rules.briefing": "rules.briefing";
    "rules.news": "rules.news";
    "rules.netatmo": "rules.netatmo";
    "rules.security": "rules.security";
    "security.cameraPolicies": "security.cameraPolicies";
}>;
export declare const CapabilityOrdinaryValueSchema: z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
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
}, z.core.$strict>>]>;
export declare const CapabilityOrdinaryStructuredParameterSchema: z.ZodObject<{
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
}, z.core.$strict>;
export declare const CapabilityOrdinaryDefinitionSchema: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export type CapabilityOrdinaryDefinition = z.infer<typeof CapabilityOrdinaryDefinitionSchema>;
export declare const CapabilityOrdinaryOriginSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export declare const CapabilityOrdinaryParameterSchema: z.ZodObject<{
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
}, z.core.$strict>;
export declare const CapabilityOrdinaryConfigurationSchema: z.ZodObject<{
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
export type CapabilityOrdinaryConfiguration = z.infer<typeof CapabilityOrdinaryConfigurationSchema>;
export type CapabilityOrdinaryParameter = z.infer<typeof CapabilityOrdinaryParameterSchema>;
export type CapabilityOrdinaryOrigin = z.infer<typeof CapabilityOrdinaryOriginSchema>;
/** Structural comparison ignores object insertion order, preserving exact arrays and primitive values. */
export declare function sameOrdinaryData(left: unknown, right: unknown): boolean;
export declare const CapabilityOrdinaryConfigWriteSchema: z.ZodObject<{
    requestId: z.ZodString;
    expectedVersion: z.ZodNullable<z.ZodNumber>;
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
}, z.core.$strict>;
export type CapabilityOrdinaryConfigWrite = z.infer<typeof CapabilityOrdinaryConfigWriteSchema>;
export type CapabilityOrdinaryTarget = {
    scope: CapabilityAgentScope;
    capability: string;
    parameters: readonly (CapabilityParameter | CapabilityOrdinaryDefinition)[];
    structuredAuthorities?: Readonly<Record<string, {
        rules?: CapabilityRulesWriteAuthority;
        cameras?: CameraPoliciesWriteAuthority;
    }>>;
};
/** Authenticate and resolve declarations/Masters server-side; durable requestId replay precedes this CAS check. */
export declare function parseCapabilityOrdinaryWrite(request: unknown, authority: CapabilityOrdinaryTarget, currentVersion: number | null, masters?: readonly CapabilityOrdinaryConfiguration[]): CapabilityOrdinaryConfigWrite;
export declare const CapabilityOrdinaryAppliedSchema: z.ZodObject<{
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
}, z.core.$strict>;
export declare const CapabilityOrdinaryEffectiveParameterSchema: z.ZodObject<{
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
}, z.core.$strict>;
export declare const CapabilityOrdinaryConfigStateSchema: z.ZodObject<{
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
export type CapabilityOrdinaryConfigState = z.infer<typeof CapabilityOrdinaryConfigStateSchema>;
export type CapabilityOrdinaryApplied = z.infer<typeof CapabilityOrdinaryAppliedSchema>;
export type CapabilityOrdinaryEffectiveParameter = z.infer<typeof CapabilityOrdinaryEffectiveParameterSchema>;
export declare const CapabilityOrdinaryCallSnapshotSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    capability: z.ZodString;
    version: z.ZodNumber;
    values: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>, z.ZodArray<z.ZodObject<{
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
}, z.core.$strict>;
export type CapabilityOrdinaryCallSnapshot = z.infer<typeof CapabilityOrdinaryCallSnapshotSchema>;
/** Only next_apply values from the server-owned active snapshot are dispatched; immediate is consumer-owned. */
export declare function parseCapabilityOrdinaryCall(snapshot: unknown, authoritative: CapabilityOrdinaryConfiguration): CapabilityOrdinaryCallSnapshot;
//# sourceMappingURL=ordinary-configuration.d.ts.map