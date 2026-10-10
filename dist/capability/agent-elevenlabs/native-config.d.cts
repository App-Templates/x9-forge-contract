import { z } from 'zod';
/** Concrete provider fields only. Prompt content and credential values live outside this descriptor. */
export declare const ElevenLabsNativeConfigSchema: z.ZodObject<{
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
                parameters: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<import("./native-tools.js").ElevenLabsNativeInputProperty, Record<string, unknown>>>;
                name: z.ZodString;
                description: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                type: z.ZodLiteral<"webhook">;
                response_timeout_secs: z.ZodNumber;
                api_schema: z.ZodObject<{
                    method: z.ZodLiteral<"POST">;
                    path: z.ZodString;
                    request_body_schema: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<import("./native-tools.js").ElevenLabsNativeInputProperty, Record<string, unknown>>>;
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
}, z.core.$strict>;
export type ElevenLabsNativeConfig = z.infer<typeof ElevenLabsNativeConfigSchema>;
export declare const ElevenLabsNativeDesiredConfigSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    configVersion: z.ZodNumber;
    promptBundleHash: z.ZodString;
    fingerprint: z.ZodString;
    config: z.ZodObject<{
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
                    parameters: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<import("./native-tools.js").ElevenLabsNativeInputProperty, Record<string, unknown>>>;
                    name: z.ZodString;
                    description: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"webhook">;
                    response_timeout_secs: z.ZodNumber;
                    api_schema: z.ZodObject<{
                        method: z.ZodLiteral<"POST">;
                        path: z.ZodString;
                        request_body_schema: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<import("./native-tools.js").ElevenLabsNativeInputProperty, Record<string, unknown>>>;
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
    }, z.core.$strict>;
}, z.core.$strict>;
export type ElevenLabsNativeDesiredConfig = z.infer<typeof ElevenLabsNativeDesiredConfigSchema>;
/** An acknowledged command is not provider readback and never marks configuration applied. */
export declare const ElevenLabsNativeCommandReceiptSchema: z.ZodObject<{
    requestId: z.ZodString;
    desired: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        configVersion: z.ZodNumber;
        promptBundleHash: z.ZodString;
        fingerprint: z.ZodString;
        config: z.ZodObject<{
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
                        parameters: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<import("./native-tools.js").ElevenLabsNativeInputProperty, Record<string, unknown>>>;
                        name: z.ZodString;
                        description: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"webhook">;
                        response_timeout_secs: z.ZodNumber;
                        api_schema: z.ZodObject<{
                            method: z.ZodLiteral<"POST">;
                            path: z.ZodString;
                            request_body_schema: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<import("./native-tools.js").ElevenLabsNativeInputProperty, Record<string, unknown>>>;
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
        }, z.core.$strict>;
    }, z.core.$strict>;
    acceptedAt: z.ZodISODateTime;
    status: z.ZodEnum<{
        rejected: "rejected";
        reconcile_pending: "reconcile_pending";
        accepted: "accepted";
    }>;
}, z.core.$strict>;
export type ElevenLabsNativeCommandReceipt = z.infer<typeof ElevenLabsNativeCommandReceiptSchema>;
//# sourceMappingURL=native-config.d.ts.map