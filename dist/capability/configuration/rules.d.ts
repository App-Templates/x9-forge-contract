import { z } from 'zod';
export declare const BriefingActionSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export declare const NewsActionSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export declare const NetatmoActionSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export declare const SecurityActionSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export declare function makeCapabilityRuleSchema<S extends string, A extends z.ZodType>(skill: S, action: A): z.ZodObject<{
    id: z.ZodString;
    skill: z.ZodLiteral<S>;
    condition: z.ZodType<import("./conditions.js").Condition, unknown, z.core.$ZodTypeInternals<import("./conditions.js").Condition, unknown>>;
    action: A;
    priority: z.ZodNumber;
    created_by: z.ZodEnum<{
        user: "user";
        operator: "operator";
    }>;
    created_at: z.ZodString;
    description: z.ZodString;
    locked: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
export declare const BriefingRuleSchema: z.ZodObject<{
    id: z.ZodString;
    skill: z.ZodLiteral<"briefing">;
    condition: z.ZodType<import("./conditions.js").Condition, unknown, z.core.$ZodTypeInternals<import("./conditions.js").Condition, unknown>>;
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
}, z.core.$strict>;
export declare const NewsRuleSchema: z.ZodObject<{
    id: z.ZodString;
    skill: z.ZodLiteral<"news">;
    condition: z.ZodType<import("./conditions.js").Condition, unknown, z.core.$ZodTypeInternals<import("./conditions.js").Condition, unknown>>;
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
}, z.core.$strict>;
export declare const NetatmoRuleSchema: z.ZodObject<{
    id: z.ZodString;
    skill: z.ZodLiteral<"netatmo">;
    condition: z.ZodType<import("./conditions.js").Condition, unknown, z.core.$ZodTypeInternals<import("./conditions.js").Condition, unknown>>;
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
}, z.core.$strict>;
export declare const SecurityRuleSchema: z.ZodObject<{
    id: z.ZodString;
    skill: z.ZodLiteral<"security">;
    condition: z.ZodType<import("./conditions.js").Condition, unknown, z.core.$ZodTypeInternals<import("./conditions.js").Condition, unknown>>;
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
}, z.core.$strict>;
export declare const BriefingRulesSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    skill: z.ZodLiteral<"briefing">;
    condition: z.ZodType<import("./conditions.js").Condition, unknown, z.core.$ZodTypeInternals<import("./conditions.js").Condition, unknown>>;
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
export declare const NewsRulesSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    skill: z.ZodLiteral<"news">;
    condition: z.ZodType<import("./conditions.js").Condition, unknown, z.core.$ZodTypeInternals<import("./conditions.js").Condition, unknown>>;
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
export declare const NetatmoRulesSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    skill: z.ZodLiteral<"netatmo">;
    condition: z.ZodType<import("./conditions.js").Condition, unknown, z.core.$ZodTypeInternals<import("./conditions.js").Condition, unknown>>;
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
export declare const SecurityRulesSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    skill: z.ZodLiteral<"security">;
    condition: z.ZodType<import("./conditions.js").Condition, unknown, z.core.$ZodTypeInternals<import("./conditions.js").Condition, unknown>>;
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
declare const ruleSchemas: {
    briefing: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        skill: z.ZodLiteral<"briefing">;
        condition: z.ZodType<import("./conditions.js").Condition, unknown, z.core.$ZodTypeInternals<import("./conditions.js").Condition, unknown>>;
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
    news: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        skill: z.ZodLiteral<"news">;
        condition: z.ZodType<import("./conditions.js").Condition, unknown, z.core.$ZodTypeInternals<import("./conditions.js").Condition, unknown>>;
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
    netatmo: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        skill: z.ZodLiteral<"netatmo">;
        condition: z.ZodType<import("./conditions.js").Condition, unknown, z.core.$ZodTypeInternals<import("./conditions.js").Condition, unknown>>;
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
    security: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        skill: z.ZodLiteral<"security">;
        condition: z.ZodType<import("./conditions.js").Condition, unknown, z.core.$ZodTypeInternals<import("./conditions.js").Condition, unknown>>;
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
};
export type CapabilityRuleFamily = keyof typeof ruleSchemas;
export type CapabilityRule = z.infer<typeof BriefingRuleSchema | typeof NewsRuleSchema | typeof NetatmoRuleSchema | typeof SecurityRuleSchema>;
export interface CapabilityRulesWriteAuthority {
    /** Authenticated server baseline; record creation remains in the existing producer. */
    current: readonly unknown[];
    authorizedResourceIds: ReadonlySet<string>;
}
/** An ordinary configuration write cannot manufacture operator/audit authority or devices. */
export declare function parseCapabilityRulesWrite(family: CapabilityRuleFamily, value: unknown, authority: CapabilityRulesWriteAuthority): CapabilityRule[];
/** Existing security detector: opposing values of the same action conflict. */
export declare function detectSecurityRuleConflicts(candidate: unknown, existing: readonly unknown[]): z.infer<typeof SecurityRuleSchema>[];
export {};
//# sourceMappingURL=rules.d.ts.map