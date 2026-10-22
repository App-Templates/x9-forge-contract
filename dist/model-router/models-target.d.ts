import { z } from 'zod';
/** The platform defaults target the stack; execution identity remains in the configuration. */
export declare const ModelsTargetSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    scope: z.ZodLiteral<"stack">;
}, z.core.$strict>, z.ZodObject<{
    scope: z.ZodLiteral<"agent">;
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
}, z.core.$strict>], "scope">;
export type ModelsTarget = z.infer<typeof ModelsTargetSchema>;
export declare const ModelsApplyStateSchema: z.ZodEnum<{
    applied: "applied";
    failed: "failed";
    unchanged: "unchanged";
    queued: "queued";
    applying: "applying";
}>;
export type ModelsApplyState = z.infer<typeof ModelsApplyStateSchema>;
/** Public job progress includes child outcomes, never a reassignment of the stack's execution identity. */
export declare const ModelsApplyJobSchema: z.ZodObject<{
    requestId: z.ZodString;
    kind: z.ZodEnum<{
        initial: "initial";
        apply: "apply";
    }>;
    desiredVersion: z.ZodNumber;
    phase: z.ZodEnum<{
        failed: "failed";
        accepted: "accepted";
        installing: "installing";
        publishing: "publishing";
    }>;
    startedAt: z.ZodISODateTime;
    updatedAt: z.ZodISODateTime;
    slots: z.ZodArray<z.ZodObject<{
        slotId: z.ZodString;
        status: z.ZodEnum<{
            failed: "failed";
            pending: "pending";
            waiting: "waiting";
            installed: "installed";
            unchanged: "unchanged";
        }>;
        reason: z.ZodOptional<z.ZodObject<{
            code: z.ZodEnum<{
                unknown: "unknown";
                timeout: "timeout";
                "catalog-version-mismatch": "catalog-version-mismatch";
                "model-unavailable": "model-unavailable";
                "not-loaded": "not-loaded";
                "load-failed": "load-failed";
                "validation-failed": "validation-failed";
                "source-unavailable": "source-unavailable";
                "shared-runtime": "shared-runtime";
                "externally-owned": "externally-owned";
                "not-supported": "not-supported";
                "in-progress": "in-progress";
                "catalog-changed": "catalog-changed";
                "qualification-failed": "qualification-failed";
                "consumer-rejected": "consumer-rejected";
            }>;
            detail: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        calls: z.ZodOptional<z.ZodObject<{
            state: z.ZodNumber;
            install: z.ZodNumber;
        }, z.core.$strict>>;
        progress: z.ZodOptional<z.ZodObject<{
            completed: z.ZodNumber;
            total: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    modelsVersion: z.ZodOptional<z.ZodString>;
    failure: z.ZodOptional<z.ZodObject<{
        slotId: z.ZodNullable<z.ZodString>;
        code: z.ZodEnum<{
            unknown: "unknown";
            timeout: "timeout";
            "catalog-version-mismatch": "catalog-version-mismatch";
            "model-unavailable": "model-unavailable";
            "not-loaded": "not-loaded";
            "load-failed": "load-failed";
            "validation-failed": "validation-failed";
            "source-unavailable": "source-unavailable";
            "shared-runtime": "shared-runtime";
            "externally-owned": "externally-owned";
            "not-supported": "not-supported";
            "in-progress": "in-progress";
            "catalog-changed": "catalog-changed";
            "qualification-failed": "qualification-failed";
            "consumer-rejected": "consumer-rejected";
        }>;
    }, z.core.$strict>>;
    target: z.ZodDiscriminatedUnion<[z.ZodObject<{
        scope: z.ZodLiteral<"stack">;
    }, z.core.$strict>, z.ZodObject<{
        scope: z.ZodLiteral<"agent">;
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    }, z.core.$strict>], "scope">;
    state: z.ZodOptional<z.ZodEnum<{
        applied: "applied";
        failed: "failed";
        unchanged: "unchanged";
        queued: "queued";
        applying: "applying";
    }>>;
    result: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        ok: z.ZodLiteral<true>;
        agentId: z.ZodString;
        identity: z.ZodOptional<z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        requestId: z.ZodString;
        action: z.ZodEnum<{
            start: "start";
            stop: "stop";
            restart: "restart";
            reload: "reload";
            "apply-config": "apply-config";
        }>;
        replayed: z.ZodBoolean;
        outcome: z.ZodEnum<{
            error: "error";
            ok: "ok";
            partial: "partial";
            unmanageable: "unmanageable";
        }>;
        results: z.ZodArray<z.ZodObject<{
            target: z.ZodObject<{
                kind: z.ZodEnum<{
                    capability: "capability";
                    runtime: "runtime";
                    channel: "channel";
                }>;
                targetId: z.ZodString;
            }, z.core.$strict>;
            outcome: z.ZodEnum<{
                error: "error";
                ok: "ok";
                unmanageable: "unmanageable";
            }>;
            reason: z.ZodOptional<z.ZodObject<{
                code: z.ZodEnum<{
                    unknown: "unknown";
                    timeout: "timeout";
                    "catalog-version-mismatch": "catalog-version-mismatch";
                    "model-unavailable": "model-unavailable";
                    "not-loaded": "not-loaded";
                    "load-failed": "load-failed";
                    "validation-failed": "validation-failed";
                    "source-unavailable": "source-unavailable";
                    "shared-runtime": "shared-runtime";
                    "externally-owned": "externally-owned";
                    "not-supported": "not-supported";
                    "in-progress": "in-progress";
                    "catalog-changed": "catalog-changed";
                    "qualification-failed": "qualification-failed";
                    "consumer-rejected": "consumer-rejected";
                }>;
                detail: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strip>>;
        requestedVersion: z.ZodOptional<z.ZodNumber>;
        versions: z.ZodOptional<z.ZodObject<{
            desired: z.ZodNumber;
            applied: z.ZodNullable<z.ZodNumber>;
            failed: z.ZodNullable<z.ZodObject<{
                version: z.ZodNumber;
                reason: z.ZodObject<{
                    code: z.ZodEnum<{
                        unknown: "unknown";
                        timeout: "timeout";
                        "catalog-version-mismatch": "catalog-version-mismatch";
                        "model-unavailable": "model-unavailable";
                        "not-loaded": "not-loaded";
                        "load-failed": "load-failed";
                        "validation-failed": "validation-failed";
                        "source-unavailable": "source-unavailable";
                        "shared-runtime": "shared-runtime";
                        "externally-owned": "externally-owned";
                        "not-supported": "not-supported";
                        "in-progress": "in-progress";
                        "catalog-changed": "catalog-changed";
                        "qualification-failed": "qualification-failed";
                        "consumer-rejected": "consumer-rejected";
                    }>;
                    detail: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>;
            }, z.core.$strict>>;
        }, z.core.$strip>>;
        workspace: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            appliedVersion: z.ZodNumber;
            sha256: z.ZodString;
            loadedAt: z.ZodISODateTime;
        }, z.core.$strict>>>;
        completedAt: z.ZodISODateTime;
    }, z.core.$strip>>>;
    runtime: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>;
        configVersion: z.ZodNumber;
        requestId: z.ZodString;
        observedAt: z.ZodISODateTime;
        selections: z.ZodArray<z.ZodObject<{
            slotId: z.ZodString;
            capability: z.ZodString;
            function: z.ZodEnum<{
                reasoning: "reasoning";
                "memory-extraction": "memory-extraction";
                embedding: "embedding";
                tts: "tts";
                transcription: "transcription";
                voice: "voice";
            }>;
            tier: z.ZodEnum<{
                standard: "standard";
                advanced: "advanced";
                reasoning: "reasoning";
                fallback: "fallback";
                primary: "primary";
            }>;
            descriptor: z.ZodObject<{
                provider: z.ZodString;
                modelId: z.ZodString;
                protocol: z.ZodEnum<{
                    responses: "responses";
                    "chat-completions": "chat-completions";
                    messages: "messages";
                    "generate-content": "generate-content";
                    embeddings: "embeddings";
                    speech: "speech";
                    transcriptions: "transcriptions";
                    realtime: "realtime";
                    live: "live";
                }>;
                adapterId: z.ZodString;
            }, z.core.$strict>;
            embeddingDimensions: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>>;
    }, z.core.$strict>>>;
    children: z.ZodArray<z.ZodObject<{
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        state: z.ZodEnum<{
            applied: "applied";
            failed: "failed";
            unchanged: "unchanged";
            queued: "queued";
            applying: "applying";
        }>;
        reason: z.ZodOptional<z.ZodObject<{
            code: z.ZodEnum<{
                unknown: "unknown";
                timeout: "timeout";
                "catalog-version-mismatch": "catalog-version-mismatch";
                "model-unavailable": "model-unavailable";
                "not-loaded": "not-loaded";
                "load-failed": "load-failed";
                "validation-failed": "validation-failed";
                "source-unavailable": "source-unavailable";
                "shared-runtime": "shared-runtime";
                "externally-owned": "externally-owned";
                "not-supported": "not-supported";
                "in-progress": "in-progress";
                "catalog-changed": "catalog-changed";
                "qualification-failed": "qualification-failed";
                "consumer-rejected": "consumer-rejected";
            }>;
            detail: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        result: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            ok: z.ZodLiteral<true>;
            agentId: z.ZodString;
            identity: z.ZodOptional<z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
            requestId: z.ZodString;
            action: z.ZodEnum<{
                start: "start";
                stop: "stop";
                restart: "restart";
                reload: "reload";
                "apply-config": "apply-config";
            }>;
            replayed: z.ZodBoolean;
            outcome: z.ZodEnum<{
                error: "error";
                ok: "ok";
                partial: "partial";
                unmanageable: "unmanageable";
            }>;
            results: z.ZodArray<z.ZodObject<{
                target: z.ZodObject<{
                    kind: z.ZodEnum<{
                        capability: "capability";
                        runtime: "runtime";
                        channel: "channel";
                    }>;
                    targetId: z.ZodString;
                }, z.core.$strict>;
                outcome: z.ZodEnum<{
                    error: "error";
                    ok: "ok";
                    unmanageable: "unmanageable";
                }>;
                reason: z.ZodOptional<z.ZodObject<{
                    code: z.ZodEnum<{
                        unknown: "unknown";
                        timeout: "timeout";
                        "catalog-version-mismatch": "catalog-version-mismatch";
                        "model-unavailable": "model-unavailable";
                        "not-loaded": "not-loaded";
                        "load-failed": "load-failed";
                        "validation-failed": "validation-failed";
                        "source-unavailable": "source-unavailable";
                        "shared-runtime": "shared-runtime";
                        "externally-owned": "externally-owned";
                        "not-supported": "not-supported";
                        "in-progress": "in-progress";
                        "catalog-changed": "catalog-changed";
                        "qualification-failed": "qualification-failed";
                        "consumer-rejected": "consumer-rejected";
                    }>;
                    detail: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strip>>;
            requestedVersion: z.ZodOptional<z.ZodNumber>;
            versions: z.ZodOptional<z.ZodObject<{
                desired: z.ZodNumber;
                applied: z.ZodNullable<z.ZodNumber>;
                failed: z.ZodNullable<z.ZodObject<{
                    version: z.ZodNumber;
                    reason: z.ZodObject<{
                        code: z.ZodEnum<{
                            unknown: "unknown";
                            timeout: "timeout";
                            "catalog-version-mismatch": "catalog-version-mismatch";
                            "model-unavailable": "model-unavailable";
                            "not-loaded": "not-loaded";
                            "load-failed": "load-failed";
                            "validation-failed": "validation-failed";
                            "source-unavailable": "source-unavailable";
                            "shared-runtime": "shared-runtime";
                            "externally-owned": "externally-owned";
                            "not-supported": "not-supported";
                            "in-progress": "in-progress";
                            "catalog-changed": "catalog-changed";
                            "qualification-failed": "qualification-failed";
                            "consumer-rejected": "consumer-rejected";
                        }>;
                        detail: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>;
                }, z.core.$strict>>;
            }, z.core.$strip>>;
            workspace: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                appliedVersion: z.ZodNumber;
                sha256: z.ZodString;
                loadedAt: z.ZodISODateTime;
            }, z.core.$strict>>>;
            completedAt: z.ZodISODateTime;
        }, z.core.$strip>>>;
        runtime: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strict>;
            configVersion: z.ZodNumber;
            requestId: z.ZodString;
            observedAt: z.ZodISODateTime;
            selections: z.ZodArray<z.ZodObject<{
                slotId: z.ZodString;
                capability: z.ZodString;
                function: z.ZodEnum<{
                    reasoning: "reasoning";
                    "memory-extraction": "memory-extraction";
                    embedding: "embedding";
                    tts: "tts";
                    transcription: "transcription";
                    voice: "voice";
                }>;
                tier: z.ZodEnum<{
                    standard: "standard";
                    advanced: "advanced";
                    reasoning: "reasoning";
                    fallback: "fallback";
                    primary: "primary";
                }>;
                descriptor: z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                        live: "live";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>;
                embeddingDimensions: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strict>>;
        }, z.core.$strict>>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ModelsApplyJob = z.infer<typeof ModelsApplyJobSchema>;
//# sourceMappingURL=models-target.d.ts.map