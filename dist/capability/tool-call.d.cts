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
    organization: z.ZodOptional<z.ZodObject<{
        organizationRun: z.ZodObject<{
            schemaVersion: z.ZodLiteral<1>;
            runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
            organizationId: z.ZodString;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            personRef: z.ZodOptional<z.ZodString>;
            issuer: z.ZodEnum<{
                x9: "x9";
                forge: "forge";
                paperclip: "paperclip";
            }>;
            issuedAt: z.ZodISODateTime;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strict>;
        attempt: z.ZodObject<{
            runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
            attemptId: z.ZodString;
            attemptNumber: z.ZodNumber;
            startedAt: z.ZodISODateTime;
            idempotencyKey: z.ZodString;
        }, z.core.$strict>;
        tenantId: z.ZodString;
    }, z.core.$strict>>;
    tenantId: z.ZodOptional<z.ZodString>;
    ownerId: z.ZodOptional<z.ZodString>;
    vaultAgentId: z.ZodOptional<z.ZodNumber>;
    personRef: z.ZodOptional<z.ZodString>;
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
        }, z.core.$strict>>, z.ZodObject<{
            agent: z.ZodObject<{
                first_message: z.ZodString;
                language: z.ZodString;
                prompt: z.ZodObject<{
                    llm: z.ZodString;
                    reasoning_effort: z.ZodString;
                    temperature: z.ZodNumber;
                    backup_llm_config: z.ZodObject<{
                        preference: z.ZodLiteral<"override">;
                        order: z.ZodArray<z.ZodString>;
                    }, z.core.$strict>;
                    cascade_timeout_seconds: z.ZodNumber;
                    tools: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"client">;
                        expects_response: z.ZodBoolean;
                        response_timeout_secs: z.ZodNumber;
                        execution_mode: z.ZodOptional<z.ZodEnum<{
                            immediate: "immediate";
                            post_tool_speech: "post_tool_speech";
                        }>>;
                        interruption_mode: z.ZodOptional<z.ZodEnum<{
                            allow: "allow";
                            block: "block";
                        }>>;
                        parameters: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<import("./index.js").ElevenLabsNativeInputProperty, Record<string, unknown>>>;
                        name: z.ZodString;
                        description: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"webhook">;
                        response_timeout_secs: z.ZodNumber;
                        api_schema: z.ZodObject<{
                            method: z.ZodLiteral<"POST">;
                            path: z.ZodString;
                            request_body_schema: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<import("./index.js").ElevenLabsNativeInputProperty, Record<string, unknown>>>;
                            request_headers: z.ZodArray<z.ZodObject<{
                                name: z.ZodString;
                                source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                    kind: z.ZodLiteral<"credential">;
                                    key: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    kind: z.ZodLiteral<"session">;
                                    bindingId: z.ZodString;
                                }, z.core.$strict>], "kind">;
                            }, z.core.$strict>>;
                        }, z.core.$strict>;
                        name: z.ZodString;
                        description: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"system">;
                        params: z.ZodObject<{
                            system_tool_type: z.ZodEnum<{
                                end_call: "end_call";
                                skip_turn: "skip_turn";
                            }>;
                        }, z.core.$strict>;
                        name: z.ZodString;
                        description: z.ZodString;
                    }, z.core.$strict>], "type">>;
                }, z.core.$strict>;
            }, z.core.$strict>;
            tts: z.ZodObject<{
                model_id: z.ZodString;
                optimize_streaming_latency: z.ZodNumber;
                agent_output_audio_format: z.ZodString;
                supported_voices: z.ZodArray<z.ZodObject<{
                    label: z.ZodString;
                    description: z.ZodString;
                    voice_id: z.ZodString;
                    stability: z.ZodNumber;
                    speed: z.ZodNumber;
                    similarity_boost: z.ZodNumber;
                }, z.core.$strict>>;
                voice_id: z.ZodString;
                stability: z.ZodNumber;
                speed: z.ZodNumber;
                similarity_boost: z.ZodNumber;
            }, z.core.$strict>;
            turn: z.ZodObject<{
                turn_timeout: z.ZodNumber;
                interruption_ignore_terms: z.ZodArray<z.ZodString>;
                merge_with_default_ignore_terms: z.ZodBoolean;
                silence_end_call_timeout: z.ZodNumber;
            }, z.core.$strict>;
            conversation: z.ZodObject<{
                max_duration_seconds: z.ZodNumber;
                client_events: z.ZodArray<z.ZodEnum<{
                    audio: "audio";
                    interruption: "interruption";
                    agent_response: "agent_response";
                    user_transcript: "user_transcript";
                    agent_response_correction: "agent_response_correction";
                    agent_tool_response: "agent_tool_response";
                }>>;
            }, z.core.$strict>;
            platform_settings: z.ZodObject<{
                auth: z.ZodObject<{
                    enable_auth: z.ZodLiteral<true>;
                    allowlist: z.ZodArray<z.ZodURL>;
                    require_origin_header: z.ZodLiteral<true>;
                }, z.core.$strict>;
            }, z.core.$strict>;
        }, z.core.$strict>]>>;
    }, z.core.$strict>>;
}, z.core.$strip>;
export type ToolCallRequest = z.infer<typeof ToolCallRequestSchema>;
export declare const TOOL_ERROR_MODEL_REASON_MAX_CHARS = 400;
export declare const ToolErrorModelReasonSchema: z.ZodString;
export type ToolErrorModelReason = z.infer<typeof ToolErrorModelReasonSchema>;
export declare function toolErrorModelReasonOf(body: unknown): string | undefined;
export declare const ToolCallSuccessResponseSchema: z.ZodObject<{
    callId: z.ZodString;
    status: z.ZodLiteral<"success">;
    output: z.ZodUnknown;
    receipt: z.ZodOptional<z.ZodObject<{
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        attemptId: z.ZodString;
        callId: z.ZodString;
        status: z.ZodEnum<{
            succeeded: "succeeded";
            failed: "failed";
            uncertain: "uncertain";
        }>;
        consumption: z.ZodArray<z.ZodObject<{
            unit: z.ZodEnum<{
                usd_micros: "usd_micros";
                tokens: "tokens";
                seconds: "seconds";
            }>;
            quantity: z.ZodNumber;
            state: z.ZodEnum<{
                unknown: "unknown";
                reserved: "reserved";
                settled: "settled";
            }>;
            estimated: z.ZodBoolean;
        }, z.core.$strict>>;
        evidence: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                log: "log";
                artifact: "artifact";
                commit: "commit";
                document: "document";
                metric: "metric";
            }>;
            ref: z.ZodString;
            sha256: z.ZodOptional<z.ZodString>;
            grantsRead: z.ZodLiteral<false>;
        }, z.core.$strict>>;
        failureCode: z.ZodOptional<z.ZodString>;
        recordedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
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
    modelReason: z.ZodOptional<z.ZodString>;
    receipt: z.ZodOptional<z.ZodObject<{
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        attemptId: z.ZodString;
        callId: z.ZodString;
        status: z.ZodEnum<{
            succeeded: "succeeded";
            failed: "failed";
            uncertain: "uncertain";
        }>;
        consumption: z.ZodArray<z.ZodObject<{
            unit: z.ZodEnum<{
                usd_micros: "usd_micros";
                tokens: "tokens";
                seconds: "seconds";
            }>;
            quantity: z.ZodNumber;
            state: z.ZodEnum<{
                unknown: "unknown";
                reserved: "reserved";
                settled: "settled";
            }>;
            estimated: z.ZodBoolean;
        }, z.core.$strict>>;
        evidence: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                log: "log";
                artifact: "artifact";
                commit: "commit";
                document: "document";
                metric: "metric";
            }>;
            ref: z.ZodString;
            sha256: z.ZodOptional<z.ZodString>;
            grantsRead: z.ZodLiteral<false>;
        }, z.core.$strict>>;
        failureCode: z.ZodOptional<z.ZodString>;
        recordedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
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
    receipt: z.ZodOptional<z.ZodObject<{
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        attemptId: z.ZodString;
        callId: z.ZodString;
        status: z.ZodEnum<{
            succeeded: "succeeded";
            failed: "failed";
            uncertain: "uncertain";
        }>;
        consumption: z.ZodArray<z.ZodObject<{
            unit: z.ZodEnum<{
                usd_micros: "usd_micros";
                tokens: "tokens";
                seconds: "seconds";
            }>;
            quantity: z.ZodNumber;
            state: z.ZodEnum<{
                unknown: "unknown";
                reserved: "reserved";
                settled: "settled";
            }>;
            estimated: z.ZodBoolean;
        }, z.core.$strict>>;
        evidence: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                log: "log";
                artifact: "artifact";
                commit: "commit";
                document: "document";
                metric: "metric";
            }>;
            ref: z.ZodString;
            sha256: z.ZodOptional<z.ZodString>;
            grantsRead: z.ZodLiteral<false>;
        }, z.core.$strict>>;
        failureCode: z.ZodOptional<z.ZodString>;
        recordedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
}, z.core.$strip>, z.ZodObject<{
    callId: z.ZodString;
    status: z.ZodLiteral<"error">;
    error: z.ZodString;
    code: z.ZodEnum<{
        TOOL_NOT_FOUND: "TOOL_NOT_FOUND";
        TOOL_CALL_INVALID: "TOOL_CALL_INVALID";
        TOOL_EXEC_FAILED: "TOOL_EXEC_FAILED";
    }>;
    modelReason: z.ZodOptional<z.ZodString>;
    receipt: z.ZodOptional<z.ZodObject<{
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        attemptId: z.ZodString;
        callId: z.ZodString;
        status: z.ZodEnum<{
            succeeded: "succeeded";
            failed: "failed";
            uncertain: "uncertain";
        }>;
        consumption: z.ZodArray<z.ZodObject<{
            unit: z.ZodEnum<{
                usd_micros: "usd_micros";
                tokens: "tokens";
                seconds: "seconds";
            }>;
            quantity: z.ZodNumber;
            state: z.ZodEnum<{
                unknown: "unknown";
                reserved: "reserved";
                settled: "settled";
            }>;
            estimated: z.ZodBoolean;
        }, z.core.$strict>>;
        evidence: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                log: "log";
                artifact: "artifact";
                commit: "commit";
                document: "document";
                metric: "metric";
            }>;
            ref: z.ZodString;
            sha256: z.ZodOptional<z.ZodString>;
            grantsRead: z.ZodLiteral<false>;
        }, z.core.$strict>>;
        failureCode: z.ZodOptional<z.ZodString>;
        recordedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
}, z.core.$strip>], "status">;
export type ToolCallSuccessResponse = z.infer<typeof ToolCallSuccessResponseSchema>;
export type ToolCallErrorResponse = z.infer<typeof ToolCallErrorResponseSchema>;
export type ToolCallResponse = z.infer<typeof ToolCallResponseSchema>;
//# sourceMappingURL=tool-call.d.ts.map