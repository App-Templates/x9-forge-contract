import { z } from 'zod';
/**
 * Request sent by X9 agent-core to a capability service.
 *
 * Endpoint: POST /call/:tool — mounted at the capability service root
 * (e.g. `http://cap-news:3000/call/news_digest`). The capability identity is
 * conveyed by the caller's `baseUrl`, not a path prefix — each X9 capability
 * service registers `app.post("/call/<toolName>", ...)` directly at root
 * (see `agent-x9/services/cap-<name>/src/tools/`).
 *
 * Auth: X-Internal-Secret (platform secret) — typed in Phase 3 auth contracts.
 *
 * `credentials`: per-request vault credentials injected by Forge at dispatch
 * time. Optional: not all capability calls require credentials.
 */
export declare const ToolCallRequestSchema: z.ZodObject<{
    callId: z.ZodString;
    tool: z.ZodString;
    input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    agentId: z.ZodString;
    sessionId: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    credentials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    tenantId: z.ZodOptional<z.ZodString>;
    ownerId: z.ZodOptional<z.ZodString>;
    ordinaryConfiguration: z.ZodOptional<z.ZodObject<{
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
    }, z.core.$strict>>;
}, z.core.$strip>;
export type ToolCallRequest = z.infer<typeof ToolCallRequestSchema>;
export declare const ToolCallSuccessResponseSchema: z.ZodObject<{
    callId: z.ZodString;
    status: z.ZodLiteral<"success">;
    output: z.ZodUnknown;
}, z.core.$strip>;
export declare const ToolCallErrorResponseSchema: z.ZodObject<{
    callId: z.ZodString;
    status: z.ZodLiteral<"error">;
    error: z.ZodString;
    code: z.ZodEnum<{
        TOOL_NOT_FOUND: "TOOL_NOT_FOUND";
        TOOL_CALL_INVALID: "TOOL_CALL_INVALID";
        TOOL_EXEC_FAILED: "TOOL_EXEC_FAILED";
    }>;
}, z.core.$strip>;
/**
 * Discriminated union on `status`. Use `.parse()` at the X9 tool-router
 * response boundary to catch silent contract violations at compile time.
 *
 * Phase 3 note: This schema is the compile-time enforcement for Bug #15
 * (silent 401 that was never caught because no type-level contract existed).
 */
export declare const ToolCallResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    callId: z.ZodString;
    status: z.ZodLiteral<"success">;
    output: z.ZodUnknown;
}, z.core.$strip>, z.ZodObject<{
    callId: z.ZodString;
    status: z.ZodLiteral<"error">;
    error: z.ZodString;
    code: z.ZodEnum<{
        TOOL_NOT_FOUND: "TOOL_NOT_FOUND";
        TOOL_CALL_INVALID: "TOOL_CALL_INVALID";
        TOOL_EXEC_FAILED: "TOOL_EXEC_FAILED";
    }>;
}, z.core.$strip>], "status">;
export type ToolCallSuccessResponse = z.infer<typeof ToolCallSuccessResponseSchema>;
export type ToolCallErrorResponse = z.infer<typeof ToolCallErrorResponseSchema>;
export type ToolCallResponse = z.infer<typeof ToolCallResponseSchema>;
//# sourceMappingURL=tool-call.d.ts.map