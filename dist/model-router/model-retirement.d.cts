import { z } from 'zod';
/**
 * The error code each provider answers with when the model no longer exists.
 * openai: `error.code`; anthropic: `error.type`; google: `error.status` (google.rpc);
 * elevenlabs: `detail.type` of the 404 body.
 */
export declare const RETIRED_PROVIDER_ERROR_CODES: {
    readonly openai: readonly ["model_not_found"];
    readonly anthropic: readonly ["not_found_error"];
    readonly google: readonly ["NOT_FOUND"];
    readonly elevenlabs: readonly ["not_found"];
};
export declare const RetiredProviderErrorSchema: z.ZodEnum<{
    model_not_found: "model_not_found";
    not_found_error: "not_found_error";
    NOT_FOUND: "NOT_FOUND";
    not_found: "not_found";
}>;
export type RetiredProviderError = z.infer<typeof RetiredProviderErrorSchema>;
/** True only when `code` is in the provider's own row; an unknown provider never fits. */
export declare function retiredProviderErrorFits(provider: string, code: string): boolean;
/** `provider-error`: a call was refused; `provider-inventory`: the provider's catalog no longer lists the model. */
export declare const RETIREMENT_SOURCES: readonly ["provider-error", "provider-inventory"];
export declare const RetirementSourceSchema: z.ZodEnum<{
    "provider-inventory": "provider-inventory";
    "provider-error": "provider-error";
}>;
export type RetirementSource = z.infer<typeof RetirementSourceSchema>;
/**
 * What a service saw when a model no longer exists: a provider refused a call
 * (`provider-error`, the default when `source` is absent, carries `providerError`) or the
 * provider's catalog stopped listing it (`provider-inventory`, no `providerError`).
 * The provider/code pair is checked by whoever recognises the error, with `retiredProviderErrorFits`.
 * Never carries the raw provider error text or any credential.
 */
export declare const RetiredModelObservationSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    slotId: z.ZodString;
    model: z.ZodObject<{
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
    source: z.ZodOptional<z.ZodEnum<{
        "provider-inventory": "provider-inventory";
        "provider-error": "provider-error";
    }>>;
    providerError: z.ZodOptional<z.ZodEnum<{
        model_not_found: "model_not_found";
        not_found_error: "not_found_error";
        NOT_FOUND: "NOT_FOUND";
        not_found: "not_found";
    }>>;
}, z.core.$strict>;
export type RetiredModelObservation = z.infer<typeof RetiredModelObservationSchema>;
/** The vault writes this as the `reason` of the notice. */
export declare function retirementSource(observation: RetiredModelObservation): RetirementSource;
/**
 * `scheduled`: the vault runs its retirement pass now. `not-in-table`: the model has no row in the
 * succession table, so only a notice is produced and never an upgrade. `duplicate`: already known.
 */
export declare const RetiredObservedAckSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    outcome: z.ZodEnum<{
        duplicate: "duplicate";
        "not-in-table": "not-in-table";
        scheduled: "scheduled";
    }>;
}, z.core.$strict>;
export type RetiredObservedAck = z.infer<typeof RetiredObservedAckSchema>;
/** Service → agent-core: a call found its model retired. */
export declare const internalModelsRetiredObservedContract: {
    readonly method: "POST";
    readonly path: "/internal/models/retired-observed";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly bodySchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        slotId: z.ZodString;
        model: z.ZodObject<{
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
        source: z.ZodOptional<z.ZodEnum<{
            "provider-inventory": "provider-inventory";
            "provider-error": "provider-error";
        }>>;
        providerError: z.ZodOptional<z.ZodEnum<{
            model_not_found: "model_not_found";
            not_found_error: "not_found_error";
            NOT_FOUND: "NOT_FOUND";
            not_found: "not_found";
        }>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        outcome: z.ZodEnum<{
            duplicate: "duplicate";
            "not-in-table": "not-in-table";
            scheduled: "scheduled";
        }>;
    }, z.core.$strict>;
};
/** Agent-core → vault: the same observation, for the declared Vault agent. */
export declare const vaultModelsRetiredObservedContract: {
    readonly method: "POST";
    readonly path: "/internal/models/retired-observed/:vaultAgentId";
    readonly authType: "token";
    readonly authHeader: "X-Internal-Token";
    readonly paramsSchema: z.ZodObject<{
        vaultAgentId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        slotId: z.ZodString;
        model: z.ZodObject<{
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
        source: z.ZodOptional<z.ZodEnum<{
            "provider-inventory": "provider-inventory";
            "provider-error": "provider-error";
        }>>;
        providerError: z.ZodOptional<z.ZodEnum<{
            model_not_found: "model_not_found";
            not_found_error: "not_found_error";
            NOT_FOUND: "NOT_FOUND";
            not_found: "not_found";
        }>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        outcome: z.ZodEnum<{
            duplicate: "duplicate";
            "not-in-table": "not-in-table";
            scheduled: "scheduled";
        }>;
    }, z.core.$strict>;
};
export declare function vaultModelsRetiredObservedPath(vaultAgentId: number): string;
/** Same values as the `model_upgrade_events_target` check in Forge. */
export declare const MODEL_UPGRADE_TARGETS: readonly ["preset", "agent"];
export declare const ModelUpgradeTargetSchema: z.ZodEnum<{
    agent: "agent";
    preset: "preset";
}>;
export type ModelUpgradeTarget = z.infer<typeof ModelUpgradeTargetSchema>;
/** A retired model was replaced by its successor. */
export declare const ModelUpgradedNoticeSchema: z.ZodObject<{
    toModel: z.ZodString;
    whilePinned: z.ZodBoolean;
    target: z.ZodEnum<{
        agent: "agent";
        preset: "preset";
    }>;
    targetId: z.ZodNumber;
    slotId: z.ZodString;
    previousVersion: z.ZodNumber;
    fromModel: z.ZodString;
    reason: z.ZodEnum<{
        registry: "registry";
        "provider-inventory": "provider-inventory";
        "provider-error": "provider-error";
    }>;
    at: z.ZodISODateTime;
    kind: z.ZodLiteral<"upgraded">;
}, z.core.$strict>;
/** A retired model has no usable successor: red row and notification, choice menu stays enabled. */
export declare const ModelNoSuccessorNoticeSchema: z.ZodObject<{
    cause: z.ZodEnum<{
        "not-in-table": "not-in-table";
        "end-of-line": "end-of-line";
        "none-usable": "none-usable";
    }>;
    target: z.ZodEnum<{
        agent: "agent";
        preset: "preset";
    }>;
    targetId: z.ZodNumber;
    slotId: z.ZodString;
    previousVersion: z.ZodNumber;
    fromModel: z.ZodString;
    reason: z.ZodEnum<{
        registry: "registry";
        "provider-inventory": "provider-inventory";
        "provider-error": "provider-error";
    }>;
    at: z.ZodISODateTime;
    kind: z.ZodLiteral<"no-successor">;
}, z.core.$strict>;
export declare const ModelRetirementNoticeSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    toModel: z.ZodString;
    whilePinned: z.ZodBoolean;
    target: z.ZodEnum<{
        agent: "agent";
        preset: "preset";
    }>;
    targetId: z.ZodNumber;
    slotId: z.ZodString;
    previousVersion: z.ZodNumber;
    fromModel: z.ZodString;
    reason: z.ZodEnum<{
        registry: "registry";
        "provider-inventory": "provider-inventory";
        "provider-error": "provider-error";
    }>;
    at: z.ZodISODateTime;
    kind: z.ZodLiteral<"upgraded">;
}, z.core.$strict>, z.ZodObject<{
    cause: z.ZodEnum<{
        "not-in-table": "not-in-table";
        "end-of-line": "end-of-line";
        "none-usable": "none-usable";
    }>;
    target: z.ZodEnum<{
        agent: "agent";
        preset: "preset";
    }>;
    targetId: z.ZodNumber;
    slotId: z.ZodString;
    previousVersion: z.ZodNumber;
    fromModel: z.ZodString;
    reason: z.ZodEnum<{
        registry: "registry";
        "provider-inventory": "provider-inventory";
        "provider-error": "provider-error";
    }>;
    at: z.ZodISODateTime;
    kind: z.ZodLiteral<"no-successor">;
}, z.core.$strict>], "kind">;
export type ModelRetirementNotice = z.infer<typeof ModelRetirementNoticeSchema>;
/**
 * One notice per row and version, the same as Forge's unique
 * `(target, target_id, slot_id, previous_version)` on `model_upgrade_events`.
 */
export declare function retirementNoticeKey(notice: Pick<ModelRetirementNotice, 'target' | 'targetId' | 'slotId' | 'previousVersion'>): string;
//# sourceMappingURL=model-retirement.d.ts.map