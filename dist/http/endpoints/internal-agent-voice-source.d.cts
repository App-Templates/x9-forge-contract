import { z } from 'zod';
/**
 * The applied voice source of a LOADED agent, as agent-core holds it.
 *
 * Capabilities that speak for an agent (cap-voice: admission of a call, channel attestation, caller identity) take its
 * applied voice from the one place that holds every loaded agent — agent-core — instead of scanning another service's
 * disk. The answer has the same shape for an agent loaded from its context file and for the primary agent loaded from
 * its stack environment: the consumer never knows which, and there is no per-agent special case.
 *
 * Non-secret projection only: no credentials, no keys, no tokens. `voiceConfiguration` is the agent's applied/desired
 * voice with its versions, or null when none was ever applied («unconfigured», never an invented default).
 */
export declare const AgentVoiceSourceSchema: z.ZodObject<{
    /** Runtime id of the loaded agent (the key agent-core holds it by). */
    agentId: z.ZodString;
    ownerId: z.ZodString;
    tenantId: z.ZodString;
    /** Forge's explicit root identity: management id, runtime id, vault id. A context without it has no source. */
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    /** As written in the context; the caller identity is validated by the capability (name rules are its own). */
    displayName: z.ZodString;
    voiceConfiguration: z.ZodNullable<z.ZodObject<{
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        versions: z.ZodObject<{
            desired: z.ZodNumber;
            applied: z.ZodNullable<z.ZodNumber>;
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
        }, z.core.$strip>;
        desired: z.ZodDiscriminatedUnion<[z.ZodObject<{
            mode: z.ZodLiteral<"text-only">;
        }, z.core.$strict>, z.ZodObject<{
            mode: z.ZodLiteral<"voice">;
            provider: z.ZodString;
            protocol: z.ZodEnum<{
                websocket: "websocket";
                webrtc: "webrtc";
                sip: "sip";
            }>;
            transports: z.ZodArray<z.ZodEnum<{
                web: "web";
                phone: "phone";
            }>>;
            voiceId: z.ZodString;
            model: z.ZodString;
            locale: z.ZodOptional<z.ZodString>;
            params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>>>;
        }, z.core.$strict>], "mode">;
        applied: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
            mode: z.ZodLiteral<"text-only">;
        }, z.core.$strict>, z.ZodObject<{
            mode: z.ZodLiteral<"voice">;
            provider: z.ZodString;
            protocol: z.ZodEnum<{
                websocket: "websocket";
                webrtc: "webrtc";
                sip: "sip";
            }>;
            transports: z.ZodArray<z.ZodEnum<{
                web: "web";
                phone: "phone";
            }>>;
            voiceId: z.ZodString;
            model: z.ZodString;
            locale: z.ZodOptional<z.ZodString>;
            params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>>>;
        }, z.core.$strict>], "mode">>;
    }, z.core.$strip>>;
    /** Applied workspace attestation + its path, only when the agent has one (the primary agent has none). */
    workspace: z.ZodOptional<z.ZodObject<{
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        tenantId: z.ZodOptional<z.ZodString>;
        version: z.ZodNumber;
        files: z.ZodArray<z.ZodObject<{
            name: z.ZodEnum<{
                "IDENTITY.md": "IDENTITY.md";
                "SOUL.md": "SOUL.md";
                "POLICIES.md": "POLICIES.md";
                "USER.md": "USER.md";
            }>;
            load: z.ZodLiteral<"always">;
            versions: z.ZodObject<{
                desired: z.ZodNumber;
                applied: z.ZodNullable<z.ZodNumber>;
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
            }, z.core.$strip>;
            history: z.ZodArray<z.ZodObject<{
                version: z.ZodNumber;
                origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"master">;
                    source: z.ZodObject<{
                        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                    }, z.core.$strip>;
                    version: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"template">;
                    templateId: z.ZodString;
                    ownerId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "OwnerId", "out">>;
                    version: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"agent">;
                }, z.core.$strict>], "kind">;
                hash: z.ZodString;
                bytes: z.ZodNumber;
                updatedAt: z.ZodISODateTime;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        tools: z.ZodObject<{
            name: z.ZodLiteral<"TOOLS.md">;
            origin: z.ZodLiteral<"generated">;
            editable: z.ZodLiteral<false>;
            load: z.ZodLiteral<"always">;
            version: z.ZodNumber;
            hash: z.ZodString;
            bytes: z.ZodNumber;
            updatedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        registry: z.ZodObject<{
            capabilities: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                enabled: z.ZodBoolean;
                host: z.ZodString;
                port: z.ZodNumber;
                version: z.ZodString;
                protocol: z.ZodOptional<z.ZodEnum<{
                    http: "http";
                    https: "https";
                }>>;
                tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    description: z.ZodString;
                    inputSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                }, z.core.$strip>>>;
                modelPolicy: z.ZodOptional<z.ZodObject<{
                    min: z.ZodEnum<{
                        standard: "standard";
                        advanced: "advanced";
                        reasoning: "reasoning";
                    }>;
                    max: z.ZodEnum<{
                        standard: "standard";
                        advanced: "advanced";
                        reasoning: "reasoning";
                    }>;
                }, z.core.$strip>>;
                requires: z.ZodOptional<z.ZodArray<z.ZodString>>;
                credentialRequirements: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodLazy<z.ZodString>;
                    required: z.ZodBoolean;
                }, z.core.$strict>>>;
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
            }, z.core.$strip>>;
        }, z.core.$strip>;
        skills: z.ZodArray<z.ZodObject<{
            capability: z.ZodString;
            description: z.ZodString;
            procedure: z.ZodObject<{
                path: z.ZodString;
                load: z.ZodLiteral<"on-demand">;
                editable: z.ZodLiteral<false>;
                version: z.ZodNumber;
                hash: z.ZodString;
                bytes: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    workspacePath: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type AgentVoiceSource = z.infer<typeof AgentVoiceSourceSchema>;
/** `:agentId` is the RUNTIME id of the loaded agent: the one capabilities receive in their call envelope. */
export declare const AgentVoiceSourceParamsSchema: z.ZodObject<{
    agentId: z.ZodString;
}, z.core.$strip>;
export declare function internalAgentVoiceSourcePath(runtimeAgentId: string): string;
/** capability → agent-core, X-Internal-Secret as every internal call. Answers 404 for an agent that is not loaded. */
export declare const internalAgentVoiceSourceContract: {
    readonly method: "GET";
    readonly path: "/internal/agents/:agentId/voice-source";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        /** Runtime id of the loaded agent (the key agent-core holds it by). */
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        /** Forge's explicit root identity: management id, runtime id, vault id. A context without it has no source. */
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        /** As written in the context; the caller identity is validated by the capability (name rules are its own). */
        displayName: z.ZodString;
        voiceConfiguration: z.ZodNullable<z.ZodObject<{
            agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            versions: z.ZodObject<{
                desired: z.ZodNumber;
                applied: z.ZodNullable<z.ZodNumber>;
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
            }, z.core.$strip>;
            desired: z.ZodDiscriminatedUnion<[z.ZodObject<{
                mode: z.ZodLiteral<"text-only">;
            }, z.core.$strict>, z.ZodObject<{
                mode: z.ZodLiteral<"voice">;
                provider: z.ZodString;
                protocol: z.ZodEnum<{
                    websocket: "websocket";
                    webrtc: "webrtc";
                    sip: "sip";
                }>;
                transports: z.ZodArray<z.ZodEnum<{
                    web: "web";
                    phone: "phone";
                }>>;
                voiceId: z.ZodString;
                model: z.ZodString;
                locale: z.ZodOptional<z.ZodString>;
                params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>>>;
            }, z.core.$strict>], "mode">;
            applied: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
                mode: z.ZodLiteral<"text-only">;
            }, z.core.$strict>, z.ZodObject<{
                mode: z.ZodLiteral<"voice">;
                provider: z.ZodString;
                protocol: z.ZodEnum<{
                    websocket: "websocket";
                    webrtc: "webrtc";
                    sip: "sip";
                }>;
                transports: z.ZodArray<z.ZodEnum<{
                    web: "web";
                    phone: "phone";
                }>>;
                voiceId: z.ZodString;
                model: z.ZodString;
                locale: z.ZodOptional<z.ZodString>;
                params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>>>;
            }, z.core.$strict>], "mode">>;
        }, z.core.$strip>>;
        /** Applied workspace attestation + its path, only when the agent has one (the primary agent has none). */
        workspace: z.ZodOptional<z.ZodObject<{
            agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            tenantId: z.ZodOptional<z.ZodString>;
            version: z.ZodNumber;
            files: z.ZodArray<z.ZodObject<{
                name: z.ZodEnum<{
                    "IDENTITY.md": "IDENTITY.md";
                    "SOUL.md": "SOUL.md";
                    "POLICIES.md": "POLICIES.md";
                    "USER.md": "USER.md";
                }>;
                load: z.ZodLiteral<"always">;
                versions: z.ZodObject<{
                    desired: z.ZodNumber;
                    applied: z.ZodNullable<z.ZodNumber>;
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
                }, z.core.$strip>;
                history: z.ZodArray<z.ZodObject<{
                    version: z.ZodNumber;
                    origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"master">;
                        source: z.ZodObject<{
                            agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                        }, z.core.$strip>;
                        version: z.ZodNumber;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"template">;
                        templateId: z.ZodString;
                        ownerId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "OwnerId", "out">>;
                        version: z.ZodNumber;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"agent">;
                    }, z.core.$strict>], "kind">;
                    hash: z.ZodString;
                    bytes: z.ZodNumber;
                    updatedAt: z.ZodISODateTime;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            tools: z.ZodObject<{
                name: z.ZodLiteral<"TOOLS.md">;
                origin: z.ZodLiteral<"generated">;
                editable: z.ZodLiteral<false>;
                load: z.ZodLiteral<"always">;
                version: z.ZodNumber;
                hash: z.ZodString;
                bytes: z.ZodNumber;
                updatedAt: z.ZodISODateTime;
            }, z.core.$strict>;
            registry: z.ZodObject<{
                capabilities: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    enabled: z.ZodBoolean;
                    host: z.ZodString;
                    port: z.ZodNumber;
                    version: z.ZodString;
                    protocol: z.ZodOptional<z.ZodEnum<{
                        http: "http";
                        https: "https";
                    }>>;
                    tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        name: z.ZodString;
                        description: z.ZodString;
                        inputSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                    }, z.core.$strip>>>;
                    modelPolicy: z.ZodOptional<z.ZodObject<{
                        min: z.ZodEnum<{
                            standard: "standard";
                            advanced: "advanced";
                            reasoning: "reasoning";
                        }>;
                        max: z.ZodEnum<{
                            standard: "standard";
                            advanced: "advanced";
                            reasoning: "reasoning";
                        }>;
                    }, z.core.$strip>>;
                    requires: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    credentialRequirements: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        key: z.ZodLazy<z.ZodString>;
                        required: z.ZodBoolean;
                    }, z.core.$strict>>>;
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
                }, z.core.$strip>>;
            }, z.core.$strip>;
            skills: z.ZodArray<z.ZodObject<{
                capability: z.ZodString;
                description: z.ZodString;
                procedure: z.ZodObject<{
                    path: z.ZodString;
                    load: z.ZodLiteral<"on-demand">;
                    editable: z.ZodLiteral<false>;
                    version: z.ZodNumber;
                    hash: z.ZodString;
                    bytes: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        workspacePath: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
};
/**
 * The source of ONE loaded agent, from its validated context. Used by agent-core to answer the contract above and by
 * consumers' fixtures, so the projection exists once: whitelisted fields only, no credential, no token, no raw context.
 *
 * Returns null — «no source», never a reconstruction — when the context is not a valid one, has no tenant, or has no
 * Forge management identity (explicit, or the concordant pair of its channel configurations). The runtime id is the
 * id the agent is loaded by; the vault id is only carried when Forge wrote it.
 */
export declare function agentVoiceSourceOf(context: unknown): AgentVoiceSource | null;
//# sourceMappingURL=internal-agent-voice-source.d.ts.map