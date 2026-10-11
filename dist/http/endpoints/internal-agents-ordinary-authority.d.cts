import type { z } from 'zod';
/** Internal services only. The Core handler requires configured authentication before reading retained state. */
export declare const agentOrdinaryAuthorityContract: {
    readonly querySchema: z.ZodObject<{
        view: z.ZodLiteral<"ordinary-authority">;
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        runtimeAgentId: z.ZodString;
        capability: z.ZodString;
        requestId: z.ZodString;
        bundleVersion: z.ZodUnion<readonly [z.ZodNumber, z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>]>;
        bundleSha256: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>;
        capability: z.ZodString;
        requestId: z.ZodString;
        bundle: z.ZodObject<{
            appliedVersion: z.ZodNumber;
            sha256: z.ZodString;
        }, z.core.$strict>;
        membership: z.ZodEnum<{
            enabled: "enabled";
            disabled: "disabled";
            removed: "removed";
        }>;
        configuration: z.ZodNullable<z.ZodObject<{
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
                        "agent-elevenlabs.nativeConfig": "agent-elevenlabs.nativeConfig";
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
                                    parameters: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<import("../../capability/index.js").ElevenLabsNativeInputProperty, Record<string, unknown>>>;
                                    name: z.ZodString;
                                    description: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"webhook">;
                                    response_timeout_secs: z.ZodNumber;
                                    api_schema: z.ZodObject<{
                                        method: z.ZodLiteral<"POST">;
                                        path: z.ZodString;
                                        request_body_schema: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<import("../../capability/index.js").ElevenLabsNativeInputProperty, Record<string, unknown>>>;
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
                                parameters: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<import("../../capability/index.js").ElevenLabsNativeInputProperty, Record<string, unknown>>>;
                                name: z.ZodString;
                                description: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"webhook">;
                                response_timeout_secs: z.ZodNumber;
                                api_schema: z.ZodObject<{
                                    method: z.ZodLiteral<"POST">;
                                    path: z.ZodString;
                                    request_body_schema: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<import("../../capability/index.js").ElevenLabsNativeInputProperty, Record<string, unknown>>>;
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
        }, z.core.$strict>>;
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
    }, z.core.$strict>;
    readonly method: "GET";
    readonly path: "/internal/agents/:agentId/management";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
};
export declare function agentOrdinaryAuthorityPath(managementAgentId: string, query: unknown): string;
//# sourceMappingURL=internal-agents-ordinary-authority.d.ts.map