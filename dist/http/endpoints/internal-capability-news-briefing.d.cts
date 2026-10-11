import { z } from 'zod';
import { type CapabilityAgentScope } from "../../capability/capability-call-context.cjs";
export declare const NewsBriefingQuerySchema: z.ZodObject<{
    ownerId: z.ZodString;
    tenantId: z.ZodString;
    family: z.ZodEnum<{
        briefing: "briefing";
        news: "news";
    }>;
}, z.core.$strict>;
export declare const NewsBriefingCommandResultSchema: z.ZodObject<{
    requestId: z.ZodString;
    replayed: z.ZodBoolean;
    state: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
}, z.core.$strict>;
export declare const capNewsBriefingSettingsPath: (agentId: string) => string;
export declare const newsBriefingSettingsGetContract: {
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/settings";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly querySchema: z.ZodObject<{
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        family: z.ZodEnum<{
            briefing: "briefing";
            news: "news";
        }>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
};
export declare const newsBriefingSettingsPostContract: {
    readonly method: "POST";
    readonly path: "/internal/capability/agents/:agentId/settings";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly bodySchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
                condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
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
                condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
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
                condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
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
                condition: z.ZodType<import("../../capability/index.js").Condition, unknown, z.core.$ZodTypeInternals<import("../../capability/index.js").Condition, unknown>>;
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
    readonly responseSchema: z.ZodObject<{
        requestId: z.ZodString;
        replayed: z.ZodBoolean;
        state: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
    }, z.core.$strict>;
};
/** Resolve identity and scope on the server; check durable request replay before calling this CAS validator. */
export declare function parseNewsBriefingCommand(input: unknown, authority: {
    scope: CapabilityAgentScope;
    family: 'news' | 'briefing';
    currentVersion: number | null;
}): {
    family: "news";
    changes: ({
        type: "settings.patch";
        settings: {
            hoursBack?: number | undefined;
            cronSchedule?: string | undefined;
        };
    } | {
        type: "feeds.replace";
        feeds: {
            url: string;
            category: string;
            maxPerCategory?: number | undefined;
            label?: string | undefined;
        }[];
    } | {
        type: "rule.add";
        rule: {
            description: string;
            action: {
                type: "skip_category";
                category: string;
            } | {
                type: "add_category";
                category: string;
            } | {
                type: "set_hours_back";
                hours: number;
            } | {
                type: "set_max_per_category";
                category: string;
                max: number;
            };
            condition: import("../../capability/index.js").Condition;
        };
    } | {
        type: "rule.update";
        id: string;
        rule: {
            description: string;
            action: {
                type: "skip_category";
                category: string;
            } | {
                type: "add_category";
                category: string;
            } | {
                type: "set_hours_back";
                hours: number;
            } | {
                type: "set_max_per_category";
                category: string;
                max: number;
            };
            condition: import("../../capability/index.js").Condition;
        };
    } | {
        type: "rule.remove";
        id: string;
    } | {
        type: "legacy.adopt";
    })[];
    scope: {
        agentId: string;
        ownerId: string;
        tenantId: string;
    };
    requestId: string;
    expectedVersion: number | null;
} | {
    family: "briefing";
    changes: ({
        type: "rule.remove";
        id: string;
    } | {
        type: "legacy.adopt";
    } | {
        type: "settings.patch";
        settings: {
            categoryWeights?: Record<string, number> | undefined;
            greeting?: string | undefined;
            tone?: "formal" | "terse" | "friendly" | undefined;
            maxWords?: number | undefined;
            promptStyle?: string | undefined;
            structure?: string[] | undefined;
            cronSchedule?: string | undefined;
            newsCronSchedule?: string | undefined;
        };
    } | {
        type: "feeds.replace";
        feeds: {
            url: string;
            category: string;
            weight: number;
        }[];
    } | {
        type: "rule.add";
        rule: {
            description: string;
            action: {
                type: "skip_section";
                section: string;
            } | {
                type: "add_section";
                section: string;
            } | {
                type: "set_tone";
                tone: "formal" | "terse" | "friendly";
            } | {
                type: "set_maxWords";
                maxWords: number;
            } | {
                type: "set_greeting";
                greeting: string;
            } | {
                type: "add_feed_category";
                category: string;
            } | {
                type: "skip_feed_category";
                category: string;
            } | {
                type: "add_closing";
                text: string;
            } | {
                type: "set_cronSchedule";
                cron: string;
            };
            condition: import("../../capability/index.js").Condition;
        };
    } | {
        type: "rule.update";
        id: string;
        rule: {
            description: string;
            action: {
                type: "skip_section";
                section: string;
            } | {
                type: "add_section";
                section: string;
            } | {
                type: "set_tone";
                tone: "formal" | "terse" | "friendly";
            } | {
                type: "set_maxWords";
                maxWords: number;
            } | {
                type: "set_greeting";
                greeting: string;
            } | {
                type: "add_feed_category";
                category: string;
            } | {
                type: "skip_feed_category";
                category: string;
            } | {
                type: "add_closing";
                text: string;
            } | {
                type: "set_cronSchedule";
                cron: string;
            };
            condition: import("../../capability/index.js").Condition;
        };
    })[];
    scope: {
        agentId: string;
        ownerId: string;
        tenantId: string;
    };
    requestId: string;
    expectedVersion: number | null;
};
//# sourceMappingURL=internal-capability-news-briefing.d.ts.map