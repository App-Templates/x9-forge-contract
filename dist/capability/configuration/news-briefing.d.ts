import { z } from 'zod';
/** Only these two producers expose the configurable resource boundary. */
export declare const NewsBriefingFamilySchema: z.ZodEnum<{
    briefing: "briefing";
    news: "news";
}>;
export declare const NewsManagedFeedsSchema: z.ZodArray<z.ZodObject<{
    url: z.ZodString;
    category: z.ZodString;
    maxPerCategory: z.ZodOptional<z.ZodNumber>;
    label: z.ZodOptional<z.ZodString>;
}, z.core.$strict>>;
export declare const BriefingManagedFeedsSchema: z.ZodArray<z.ZodObject<{
    url: z.ZodString;
    category: z.ZodString;
    weight: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>>;
export declare const NewsSettingsSchema: z.ZodObject<{
    feeds: z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        category: z.ZodString;
        maxPerCategory: z.ZodOptional<z.ZodNumber>;
        label: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    hoursBack: z.ZodNumber;
    cronSchedule: z.ZodString;
    rules: z.ZodArray<z.ZodObject<{
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
}, z.core.$strict>;
export declare const BriefingManagedSettingsSchema: z.ZodObject<{
    greeting: z.ZodString;
    tone: z.ZodEnum<{
        formal: "formal";
        terse: "terse";
        friendly: "friendly";
    }>;
    maxWords: z.ZodNumber;
    promptStyle: z.ZodString;
    categoryWeights: z.ZodRecord<z.ZodString, z.ZodNumber>;
    structure: z.ZodArray<z.ZodString>;
    feeds: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        category: z.ZodString;
        weight: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strict>>>;
    cronSchedule: z.ZodString;
    newsCronSchedule: z.ZodString;
    rules: z.ZodArray<z.ZodObject<{
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
}, z.core.$strict>;
/** IDs, timestamps, priorities and operator authority are created only by the producer. */
export declare const NewsRuleDraftSchema: z.ZodObject<{
    description: z.ZodString;
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
    condition: z.ZodType<import("./conditions.js").Condition, unknown, z.core.$ZodTypeInternals<import("./conditions.js").Condition, unknown>>;
}, z.core.$strict>;
export declare const BriefingRuleDraftSchema: z.ZodObject<{
    description: z.ZodString;
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
    condition: z.ZodType<import("./conditions.js").Condition, unknown, z.core.$ZodTypeInternals<import("./conditions.js").Condition, unknown>>;
}, z.core.$strict>;
export declare const NewsChangeSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"settings.patch">;
    settings: z.ZodObject<{
        hoursBack: z.ZodOptional<z.ZodNumber>;
        cronSchedule: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"feeds.replace">;
    feeds: z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        category: z.ZodString;
        maxPerCategory: z.ZodOptional<z.ZodNumber>;
        label: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"rule.add">;
    rule: z.ZodObject<{
        description: z.ZodString;
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
        condition: z.ZodType<import("./conditions.js").Condition, unknown, z.core.$ZodTypeInternals<import("./conditions.js").Condition, unknown>>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"rule.update">;
    id: z.ZodString;
    rule: z.ZodObject<{
        description: z.ZodString;
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
        condition: z.ZodType<import("./conditions.js").Condition, unknown, z.core.$ZodTypeInternals<import("./conditions.js").Condition, unknown>>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"rule.remove">;
    id: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"legacy.adopt">;
}, z.core.$strict>], "type">;
export declare const BriefingChangeSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"settings.patch">;
    settings: z.ZodObject<{
        categoryWeights: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        greeting: z.ZodOptional<z.ZodString>;
        tone: z.ZodOptional<z.ZodEnum<{
            formal: "formal";
            terse: "terse";
            friendly: "friendly";
        }>>;
        maxWords: z.ZodOptional<z.ZodNumber>;
        promptStyle: z.ZodOptional<z.ZodString>;
        structure: z.ZodOptional<z.ZodArray<z.ZodString>>;
        cronSchedule: z.ZodOptional<z.ZodString>;
        newsCronSchedule: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"feeds.replace">;
    feeds: z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        category: z.ZodString;
        weight: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"rule.add">;
    rule: z.ZodObject<{
        description: z.ZodString;
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
        condition: z.ZodType<import("./conditions.js").Condition, unknown, z.core.$ZodTypeInternals<import("./conditions.js").Condition, unknown>>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"rule.update">;
    id: z.ZodString;
    rule: z.ZodObject<{
        description: z.ZodString;
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
        condition: z.ZodType<import("./conditions.js").Condition, unknown, z.core.$ZodTypeInternals<import("./conditions.js").Condition, unknown>>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"rule.remove">;
    id: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"legacy.adopt">;
}, z.core.$strict>], "type">;
export declare const NewsBriefingCommandSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    family: z.ZodLiteral<"news">;
    changes: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"settings.patch">;
        settings: z.ZodObject<{
            hoursBack: z.ZodOptional<z.ZodNumber>;
            cronSchedule: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"feeds.replace">;
        feeds: z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            category: z.ZodString;
            maxPerCategory: z.ZodOptional<z.ZodNumber>;
            label: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"rule.add">;
        rule: z.ZodObject<{
            description: z.ZodString;
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
            condition: z.ZodType<import("./conditions.js").Condition, unknown, z.core.$ZodTypeInternals<import("./conditions.js").Condition, unknown>>;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"rule.update">;
        id: z.ZodString;
        rule: z.ZodObject<{
            description: z.ZodString;
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
            condition: z.ZodType<import("./conditions.js").Condition, unknown, z.core.$ZodTypeInternals<import("./conditions.js").Condition, unknown>>;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"rule.remove">;
        id: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"legacy.adopt">;
    }, z.core.$strict>], "type">>;
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    requestId: z.ZodString;
    expectedVersion: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>, z.ZodObject<{
    family: z.ZodLiteral<"briefing">;
    changes: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"settings.patch">;
        settings: z.ZodObject<{
            categoryWeights: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
            greeting: z.ZodOptional<z.ZodString>;
            tone: z.ZodOptional<z.ZodEnum<{
                formal: "formal";
                terse: "terse";
                friendly: "friendly";
            }>>;
            maxWords: z.ZodOptional<z.ZodNumber>;
            promptStyle: z.ZodOptional<z.ZodString>;
            structure: z.ZodOptional<z.ZodArray<z.ZodString>>;
            cronSchedule: z.ZodOptional<z.ZodString>;
            newsCronSchedule: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"feeds.replace">;
        feeds: z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            category: z.ZodString;
            weight: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"rule.add">;
        rule: z.ZodObject<{
            description: z.ZodString;
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
            condition: z.ZodType<import("./conditions.js").Condition, unknown, z.core.$ZodTypeInternals<import("./conditions.js").Condition, unknown>>;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"rule.update">;
        id: z.ZodString;
        rule: z.ZodObject<{
            description: z.ZodString;
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
            condition: z.ZodType<import("./conditions.js").Condition, unknown, z.core.$ZodTypeInternals<import("./conditions.js").Condition, unknown>>;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"rule.remove">;
        id: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"legacy.adopt">;
    }, z.core.$strict>], "type">>;
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    requestId: z.ZodString;
    expectedVersion: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>], "family">;
/** Recorded with the producer journal revision, never supplied by a browser command. */
export declare const NewsBriefingAdoptionSchema: z.ZodObject<{
    version: z.ZodNumber;
    requestId: z.ZodString;
    fields: z.ZodArray<z.ZodObject<{
        key: z.ZodEnum<{
            feeds: "feeds";
            hoursBack: "hoursBack";
            categoryWeights: "categoryWeights";
            greeting: "greeting";
            tone: "tone";
            maxWords: "maxWords";
            promptStyle: "promptStyle";
            structure: "structure";
            cronSchedule: "cronSchedule";
            newsCronSchedule: "newsCronSchedule";
            rules: "rules";
        }>;
        source: z.ZodEnum<{
            "legacy-file": "legacy-file";
            "declared-default": "declared-default";
        }>;
        reason: z.ZodOptional<z.ZodLiteral<"invalid-legacy-value">>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type NewsBriefingAdoption = z.infer<typeof NewsBriefingAdoptionSchema>;
export declare const NewsBriefingStateSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    family: z.ZodLiteral<"news">;
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    version: z.ZodNumber;
    settings: z.ZodObject<{
        feeds: z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            category: z.ZodString;
            maxPerCategory: z.ZodOptional<z.ZodNumber>;
            label: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        hoursBack: z.ZodNumber;
        cronSchedule: z.ZodString;
        rules: z.ZodArray<z.ZodObject<{
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
    }, z.core.$strict>;
    effective: z.ZodNullable<z.ZodObject<{
        version: z.ZodNumber;
        settings: z.ZodObject<{
            feeds: z.ZodArray<z.ZodObject<{
                url: z.ZodString;
                category: z.ZodString;
                maxPerCategory: z.ZodOptional<z.ZodNumber>;
                label: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            hoursBack: z.ZodNumber;
            cronSchedule: z.ZodString;
            rules: z.ZodArray<z.ZodObject<{
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
        }, z.core.$strict>;
        observedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
    execution: z.ZodEnum<{
        unknown: "unknown";
        stopped: "stopped";
        running: "running";
    }>;
    adoption: z.ZodOptional<z.ZodObject<{
        version: z.ZodNumber;
        requestId: z.ZodString;
        fields: z.ZodArray<z.ZodObject<{
            key: z.ZodEnum<{
                feeds: "feeds";
                hoursBack: "hoursBack";
                categoryWeights: "categoryWeights";
                greeting: "greeting";
                tone: "tone";
                maxWords: "maxWords";
                promptStyle: "promptStyle";
                structure: "structure";
                cronSchedule: "cronSchedule";
                newsCronSchedule: "newsCronSchedule";
                rules: "rules";
            }>;
            source: z.ZodEnum<{
                "legacy-file": "legacy-file";
                "declared-default": "declared-default";
            }>;
            reason: z.ZodOptional<z.ZodLiteral<"invalid-legacy-value">>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    family: z.ZodLiteral<"briefing">;
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    version: z.ZodNumber;
    settings: z.ZodObject<{
        greeting: z.ZodString;
        tone: z.ZodEnum<{
            formal: "formal";
            terse: "terse";
            friendly: "friendly";
        }>;
        maxWords: z.ZodNumber;
        promptStyle: z.ZodString;
        categoryWeights: z.ZodRecord<z.ZodString, z.ZodNumber>;
        structure: z.ZodArray<z.ZodString>;
        feeds: z.ZodOptional<z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            category: z.ZodString;
            weight: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strict>>>;
        cronSchedule: z.ZodString;
        newsCronSchedule: z.ZodString;
        rules: z.ZodArray<z.ZodObject<{
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
    }, z.core.$strict>;
    effective: z.ZodNullable<z.ZodObject<{
        version: z.ZodNumber;
        settings: z.ZodObject<{
            greeting: z.ZodString;
            tone: z.ZodEnum<{
                formal: "formal";
                terse: "terse";
                friendly: "friendly";
            }>;
            maxWords: z.ZodNumber;
            promptStyle: z.ZodString;
            categoryWeights: z.ZodRecord<z.ZodString, z.ZodNumber>;
            structure: z.ZodArray<z.ZodString>;
            feeds: z.ZodOptional<z.ZodArray<z.ZodObject<{
                url: z.ZodString;
                category: z.ZodString;
                weight: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>>>;
            cronSchedule: z.ZodString;
            newsCronSchedule: z.ZodString;
            rules: z.ZodArray<z.ZodObject<{
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
        }, z.core.$strict>;
        observedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
    execution: z.ZodEnum<{
        unknown: "unknown";
        stopped: "stopped";
        running: "running";
    }>;
    adoption: z.ZodOptional<z.ZodObject<{
        version: z.ZodNumber;
        requestId: z.ZodString;
        fields: z.ZodArray<z.ZodObject<{
            key: z.ZodEnum<{
                feeds: "feeds";
                hoursBack: "hoursBack";
                categoryWeights: "categoryWeights";
                greeting: "greeting";
                tone: "tone";
                maxWords: "maxWords";
                promptStyle: "promptStyle";
                structure: "structure";
                cronSchedule: "cronSchedule";
                newsCronSchedule: "newsCronSchedule";
                rules: "rules";
            }>;
            source: z.ZodEnum<{
                "legacy-file": "legacy-file";
                "declared-default": "declared-default";
            }>;
            reason: z.ZodOptional<z.ZodLiteral<"invalid-legacy-value">>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>], "family">;
export type NewsBriefingCommand = z.infer<typeof NewsBriefingCommandSchema>;
export type NewsBriefingState = z.infer<typeof NewsBriefingStateSchema>;
//# sourceMappingURL=news-briefing.d.ts.map