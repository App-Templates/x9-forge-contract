import { z } from 'zod';
/**
 * POST /internal/model-config — Forge → X9 model config push.
 *
 * Auth: X-Internal-Secret (same direction as reloadAgentContract; D-16).
 * Endpoint is declared here but NOT implemented in Phase 6 — X9 Phase 35 wires
 * the runtime; Forge Phase 10 builds the UI.
 *
 * @status greenfield — consumers planned, no live endpoint yet
 * @see CONTEXT D-13, D-14, D-15, D-16
 * @see src/http/endpoints/internal-agents-reload.ts (pattern template)
 */
export declare const ModelPushRequestSchema: z.ZodObject<{
    providers: z.ZodRecord<z.ZodEnum<{
        openai: "openai";
        anthropic: "anthropic";
        google: "google";
    }>, z.ZodOptional<z.ZodRecord<z.ZodEnum<{
        standard: "standard";
        advanced: "advanced";
        reasoning: "reasoning";
    }>, z.ZodOptional<z.ZodString>>>>;
    perCapPolicies: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
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
    }, z.core.$strip>>>;
    perAgentOverrides: z.ZodOptional<z.ZodArray<z.ZodObject<{
        agentId: z.ZodObject<{
            agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        }, z.core.$strip>;
        policy: z.ZodOptional<z.ZodObject<{
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
        tierMapping: z.ZodOptional<z.ZodRecord<z.ZodEnum<{
            standard: "standard";
            advanced: "advanced";
            reasoning: "reasoning";
        }>, z.ZodOptional<z.ZodString>>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type ModelPushRequest = z.infer<typeof ModelPushRequestSchema>;
/**
 * Model push response — discriminated union on `ok` (D-14 / 06-RESEARCH
 * §Discriminated response shape). Success arm carries `applied` count and
 * optional `reloadVersion` for correlation with ModelHotReloadNotification.
 * Error arm carries a typed `code` from 4 values + human `message` + optional
 * per-capability `details[]`.
 */
export declare const ModelPushSuccessSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    applied: z.ZodNumber;
    reloadVersion: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ModelPushErrorSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    code: z.ZodEnum<{
        INVALID_POLICY: "INVALID_POLICY";
        UNKNOWN_CAP: "UNKNOWN_CAP";
        INVALID_MAPPING: "INVALID_MAPPING";
        INTERNAL_ERROR: "INTERNAL_ERROR";
    }>;
    message: z.ZodString;
    details: z.ZodOptional<z.ZodArray<z.ZodObject<{
        capName: z.ZodOptional<z.ZodString>;
        reason: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const ModelPushResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    ok: z.ZodLiteral<true>;
    applied: z.ZodNumber;
    reloadVersion: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    ok: z.ZodLiteral<false>;
    code: z.ZodEnum<{
        INVALID_POLICY: "INVALID_POLICY";
        UNKNOWN_CAP: "UNKNOWN_CAP";
        INVALID_MAPPING: "INVALID_MAPPING";
        INTERNAL_ERROR: "INTERNAL_ERROR";
    }>;
    message: z.ZodString;
    details: z.ZodOptional<z.ZodArray<z.ZodObject<{
        capName: z.ZodOptional<z.ZodString>;
        reason: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>], "ok">;
export type ModelPushResponse = z.infer<typeof ModelPushResponseSchema>;
/**
 * Contract for POST /internal/model-config (D-15). Pattern mirrors
 * reloadAgentContract (Phase 4).
 */
export declare const pushModelConfigContract: {
    readonly method: "POST";
    readonly path: "/internal/model-config";
    readonly authType: "secret";
    readonly requestSchema: z.ZodObject<{
        providers: z.ZodRecord<z.ZodEnum<{
            openai: "openai";
            anthropic: "anthropic";
            google: "google";
        }>, z.ZodOptional<z.ZodRecord<z.ZodEnum<{
            standard: "standard";
            advanced: "advanced";
            reasoning: "reasoning";
        }>, z.ZodOptional<z.ZodString>>>>;
        perCapPolicies: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
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
        }, z.core.$strip>>>;
        perAgentOverrides: z.ZodOptional<z.ZodArray<z.ZodObject<{
            agentId: z.ZodObject<{
                agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strip>;
            policy: z.ZodOptional<z.ZodObject<{
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
            tierMapping: z.ZodOptional<z.ZodRecord<z.ZodEnum<{
                standard: "standard";
                advanced: "advanced";
                reasoning: "reasoning";
            }>, z.ZodOptional<z.ZodString>>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        ok: z.ZodLiteral<true>;
        applied: z.ZodNumber;
        reloadVersion: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        ok: z.ZodLiteral<false>;
        code: z.ZodEnum<{
            INVALID_POLICY: "INVALID_POLICY";
            UNKNOWN_CAP: "UNKNOWN_CAP";
            INVALID_MAPPING: "INVALID_MAPPING";
            INTERNAL_ERROR: "INTERNAL_ERROR";
        }>;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodArray<z.ZodObject<{
            capName: z.ZodOptional<z.ZodString>;
            reason: z.ZodString;
        }, z.core.$strip>>>;
    }, z.core.$strip>], "ok">;
};
//# sourceMappingURL=model-push.d.ts.map