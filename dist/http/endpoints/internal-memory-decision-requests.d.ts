import { z } from 'zod';
export declare const INTERNAL_MEMORY_DECISION_REQUESTS_PATH: "/internal/memory/decision-requests";
export declare const INTERNAL_MEMORY_DECISION_REQUEST_PATH: "/internal/memory/decision-requests/:requestId";
export declare const INTERNAL_MEMORY_DECISION_REQUEST_OUTCOME_PATH: "/internal/memory/decision-requests/:requestId/outcome";
export declare const InternalMemoryDecisionRequestParamsSchema: z.ZodObject<{
    requestId: z.ZodString;
}, z.core.$strict>;
export type InternalMemoryDecisionRequestParams = z.infer<typeof InternalMemoryDecisionRequestParamsSchema>;
export declare const InternalMemoryDecisionRequestQuerySchema: z.ZodObject<{
    tenantId: z.ZodString;
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
}, z.core.$strict>;
export type InternalMemoryDecisionRequestQuery = z.infer<typeof InternalMemoryDecisionRequestQuerySchema>;
export declare const InternalMemoryDecisionRequestCreateResponseSchema: z.ZodObject<{
    requestId: z.ZodString;
    state: z.ZodLiteral<"open">;
}, z.core.$strict>;
export type InternalMemoryDecisionRequestCreateResponse = z.infer<typeof InternalMemoryDecisionRequestCreateResponseSchema>;
export declare const InternalMemoryDecisionRequestReadResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    request: z.ZodObject<{
        requestId: z.ZodString;
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        projectId: z.ZodOptional<z.ZodString>;
        subject: z.ZodOptional<z.ZodObject<{
            kind: z.ZodEnum<{
                action_plan: "action_plan";
                vertical_plan: "vertical_plan";
                confirmation: "confirmation";
            }>;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>>;
        question: z.ZodString;
        options: z.ZodArray<z.ZodObject<{
            optionId: z.ZodString;
            label: z.ZodString;
            detail: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        requestedBy: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        addressedTo: z.ZodObject<{
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        }, z.core.$strict>;
        channel: z.ZodEnum<{
            email: "email";
            x9_conversation: "x9_conversation";
            forge_panel: "forge_panel";
        }>;
        createdAt: z.ZodISODateTime;
    }, z.core.$strict>;
    state: z.ZodLiteral<"open">;
    outcome: z.ZodNull;
}, z.core.$strict>, z.ZodObject<{
    request: z.ZodObject<{
        requestId: z.ZodString;
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        projectId: z.ZodOptional<z.ZodString>;
        subject: z.ZodOptional<z.ZodObject<{
            kind: z.ZodEnum<{
                action_plan: "action_plan";
                vertical_plan: "vertical_plan";
                confirmation: "confirmation";
            }>;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>>;
        question: z.ZodString;
        options: z.ZodArray<z.ZodObject<{
            optionId: z.ZodString;
            label: z.ZodString;
            detail: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        requestedBy: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        addressedTo: z.ZodObject<{
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        }, z.core.$strict>;
        channel: z.ZodEnum<{
            email: "email";
            x9_conversation: "x9_conversation";
            forge_panel: "forge_panel";
        }>;
        createdAt: z.ZodISODateTime;
    }, z.core.$strict>;
    state: z.ZodLiteral<"decided">;
    outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
        outcome: z.ZodLiteral<"approved">;
        optionId: z.ZodString;
        requestId: z.ZodString;
        decidedBy: z.ZodObject<{
            kind: z.ZodLiteral<"owner">;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        }, z.core.$strict>;
        decidedAt: z.ZodISODateTime;
        channel: z.ZodEnum<{
            email: "email";
            x9_conversation: "x9_conversation";
            forge_panel: "forge_panel";
        }>;
        sourceRef: z.ZodString;
        subject: z.ZodOptional<z.ZodObject<{
            kind: z.ZodEnum<{
                action_plan: "action_plan";
                vertical_plan: "vertical_plan";
                confirmation: "confirmation";
            }>;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        outcome: z.ZodLiteral<"rejected">;
        reason: z.ZodString;
        requestId: z.ZodString;
        decidedBy: z.ZodObject<{
            kind: z.ZodLiteral<"owner">;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        }, z.core.$strict>;
        decidedAt: z.ZodISODateTime;
        channel: z.ZodEnum<{
            email: "email";
            x9_conversation: "x9_conversation";
            forge_panel: "forge_panel";
        }>;
        sourceRef: z.ZodString;
        subject: z.ZodOptional<z.ZodObject<{
            kind: z.ZodEnum<{
                action_plan: "action_plan";
                vertical_plan: "vertical_plan";
                confirmation: "confirmation";
            }>;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>], "outcome">;
}, z.core.$strict>], "state">;
export type InternalMemoryDecisionRequestReadResponse = z.infer<typeof InternalMemoryDecisionRequestReadResponseSchema>;
/**
 * List (1.66.0, stage probes T3/T7 and readers that do not know the request id): the requests opened by one agent,
 * optionally only those whose subject is one plan, newest first. Same scope rule as the read: tenant and agent.
 */
export declare const InternalMemoryDecisionRequestListQuerySchema: z.ZodObject<{
    tenantId: z.ZodString;
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    planId: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strict>;
export type InternalMemoryDecisionRequestListQuery = z.infer<typeof InternalMemoryDecisionRequestListQuerySchema>;
export declare const InternalMemoryDecisionRequestListResponseSchema: z.ZodObject<{
    requests: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        request: z.ZodObject<{
            requestId: z.ZodString;
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            projectId: z.ZodOptional<z.ZodString>;
            subject: z.ZodOptional<z.ZodObject<{
                kind: z.ZodEnum<{
                    action_plan: "action_plan";
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>>;
            question: z.ZodString;
            options: z.ZodArray<z.ZodObject<{
                optionId: z.ZodString;
                label: z.ZodString;
                detail: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            requestedBy: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            addressedTo: z.ZodObject<{
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>;
        state: z.ZodLiteral<"open">;
        outcome: z.ZodNull;
    }, z.core.$strict>, z.ZodObject<{
        request: z.ZodObject<{
            requestId: z.ZodString;
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            projectId: z.ZodOptional<z.ZodString>;
            subject: z.ZodOptional<z.ZodObject<{
                kind: z.ZodEnum<{
                    action_plan: "action_plan";
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>>;
            question: z.ZodString;
            options: z.ZodArray<z.ZodObject<{
                optionId: z.ZodString;
                label: z.ZodString;
                detail: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            requestedBy: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            addressedTo: z.ZodObject<{
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>;
        state: z.ZodLiteral<"decided">;
        outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
            outcome: z.ZodLiteral<"approved">;
            optionId: z.ZodString;
            requestId: z.ZodString;
            decidedBy: z.ZodObject<{
                kind: z.ZodLiteral<"owner">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>;
            decidedAt: z.ZodISODateTime;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            sourceRef: z.ZodString;
            subject: z.ZodOptional<z.ZodObject<{
                kind: z.ZodEnum<{
                    action_plan: "action_plan";
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            outcome: z.ZodLiteral<"rejected">;
            reason: z.ZodString;
            requestId: z.ZodString;
            decidedBy: z.ZodObject<{
                kind: z.ZodLiteral<"owner">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>;
            decidedAt: z.ZodISODateTime;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            sourceRef: z.ZodString;
            subject: z.ZodOptional<z.ZodObject<{
                kind: z.ZodEnum<{
                    action_plan: "action_plan";
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>], "outcome">;
    }, z.core.$strict>], "state">>;
}, z.core.$strict>;
export type InternalMemoryDecisionRequestListResponse = z.infer<typeof InternalMemoryDecisionRequestListResponseSchema>;
export declare const InternalMemoryDecisionRequestOutcomeResponseSchema: z.ZodObject<{
    result: z.ZodEnum<{
        duplicate: "duplicate";
        recorded: "recorded";
    }>;
}, z.core.$strict>;
export type InternalMemoryDecisionRequestOutcomeResponse = z.infer<typeof InternalMemoryDecisionRequestOutcomeResponseSchema>;
export declare const DecisionRequestErrorCodeSchema: z.ZodEnum<{
    decision_request_conflict: "decision_request_conflict";
    decision_request_not_found: "decision_request_not_found";
    decision_already_taken: "decision_already_taken";
}>;
export type DecisionRequestErrorCode = z.infer<typeof DecisionRequestErrorCodeSchema>;
export declare const DecisionRequestErrorResponseSchema: z.ZodObject<{
    code: z.ZodEnum<{
        decision_request_conflict: "decision_request_conflict";
        decision_request_not_found: "decision_request_not_found";
        decision_already_taken: "decision_already_taken";
    }>;
    message: z.ZodString;
}, z.core.$strict>;
export type DecisionRequestErrorResponse = z.infer<typeof DecisionRequestErrorResponseSchema>;
/**
 * Create: 201 for a new request, 200 for an identical replay (same receipt),
 * 409 decision_request_conflict for the same ID with different content.
 */
export declare const internalMemoryDecisionRequestCreateContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/decision-requests";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        requestId: z.ZodString;
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        projectId: z.ZodOptional<z.ZodString>;
        subject: z.ZodOptional<z.ZodObject<{
            kind: z.ZodEnum<{
                action_plan: "action_plan";
                vertical_plan: "vertical_plan";
                confirmation: "confirmation";
            }>;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>>;
        question: z.ZodString;
        options: z.ZodArray<z.ZodObject<{
            optionId: z.ZodString;
            label: z.ZodString;
            detail: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        requestedBy: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        addressedTo: z.ZodObject<{
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        }, z.core.$strict>;
        channel: z.ZodEnum<{
            email: "email";
            x9_conversation: "x9_conversation";
            forge_panel: "forge_panel";
        }>;
        createdAt: z.ZodISODateTime;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        requestId: z.ZodString;
        state: z.ZodLiteral<"open">;
    }, z.core.$strict>;
};
/**
 * Read: 200 with the current state; 404 decision_request_not_found for a missing
 * request or a different tenant/agent. The service must check the authenticated
 * scope before returning data; query parameters alone authorize nobody.
 */
export declare const internalMemoryDecisionRequestReadContract: {
    readonly method: "GET";
    readonly path: "/internal/memory/decision-requests/:requestId";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        requestId: z.ZodString;
    }, z.core.$strict>;
    readonly querySchema: z.ZodObject<{
        tenantId: z.ZodString;
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        request: z.ZodObject<{
            requestId: z.ZodString;
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            projectId: z.ZodOptional<z.ZodString>;
            subject: z.ZodOptional<z.ZodObject<{
                kind: z.ZodEnum<{
                    action_plan: "action_plan";
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>>;
            question: z.ZodString;
            options: z.ZodArray<z.ZodObject<{
                optionId: z.ZodString;
                label: z.ZodString;
                detail: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            requestedBy: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            addressedTo: z.ZodObject<{
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>;
        state: z.ZodLiteral<"open">;
        outcome: z.ZodNull;
    }, z.core.$strict>, z.ZodObject<{
        request: z.ZodObject<{
            requestId: z.ZodString;
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            projectId: z.ZodOptional<z.ZodString>;
            subject: z.ZodOptional<z.ZodObject<{
                kind: z.ZodEnum<{
                    action_plan: "action_plan";
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>>;
            question: z.ZodString;
            options: z.ZodArray<z.ZodObject<{
                optionId: z.ZodString;
                label: z.ZodString;
                detail: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            requestedBy: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            addressedTo: z.ZodObject<{
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>;
        state: z.ZodLiteral<"decided">;
        outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
            outcome: z.ZodLiteral<"approved">;
            optionId: z.ZodString;
            requestId: z.ZodString;
            decidedBy: z.ZodObject<{
                kind: z.ZodLiteral<"owner">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>;
            decidedAt: z.ZodISODateTime;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            sourceRef: z.ZodString;
            subject: z.ZodOptional<z.ZodObject<{
                kind: z.ZodEnum<{
                    action_plan: "action_plan";
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            outcome: z.ZodLiteral<"rejected">;
            reason: z.ZodString;
            requestId: z.ZodString;
            decidedBy: z.ZodObject<{
                kind: z.ZodLiteral<"owner">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>;
            decidedAt: z.ZodISODateTime;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            sourceRef: z.ZodString;
            subject: z.ZodOptional<z.ZodObject<{
                kind: z.ZodEnum<{
                    action_plan: "action_plan";
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>], "outcome">;
    }, z.core.$strict>], "state">;
};
/**
 * Outcome: 200 recorded or duplicate for an identical replay; 409
 * decision_already_taken for a different outcome on an already decided request.
 * The service must correlate body.requestId with params.requestId and validate
 * the authenticated scope and owner against the stored request before writing.
 */
export declare const internalMemoryDecisionRequestOutcomeContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/decision-requests/:requestId/outcome";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        requestId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        outcome: z.ZodLiteral<"approved">;
        optionId: z.ZodString;
        requestId: z.ZodString;
        decidedBy: z.ZodObject<{
            kind: z.ZodLiteral<"owner">;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        }, z.core.$strict>;
        decidedAt: z.ZodISODateTime;
        channel: z.ZodEnum<{
            email: "email";
            x9_conversation: "x9_conversation";
            forge_panel: "forge_panel";
        }>;
        sourceRef: z.ZodString;
        subject: z.ZodOptional<z.ZodObject<{
            kind: z.ZodEnum<{
                action_plan: "action_plan";
                vertical_plan: "vertical_plan";
                confirmation: "confirmation";
            }>;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        outcome: z.ZodLiteral<"rejected">;
        reason: z.ZodString;
        requestId: z.ZodString;
        decidedBy: z.ZodObject<{
            kind: z.ZodLiteral<"owner">;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        }, z.core.$strict>;
        decidedAt: z.ZodISODateTime;
        channel: z.ZodEnum<{
            email: "email";
            x9_conversation: "x9_conversation";
            forge_panel: "forge_panel";
        }>;
        sourceRef: z.ZodString;
        subject: z.ZodOptional<z.ZodObject<{
            kind: z.ZodEnum<{
                action_plan: "action_plan";
                vertical_plan: "vertical_plan";
                confirmation: "confirmation";
            }>;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>], "outcome">;
    readonly responseSchema: z.ZodObject<{
        result: z.ZodEnum<{
            duplicate: "duplicate";
            recorded: "recorded";
        }>;
    }, z.core.$strict>;
};
/** List: 200 with the agent's requests (newest first); an unknown agent answers an empty list, never another's. */
export declare const internalMemoryDecisionRequestListContract: {
    readonly method: "GET";
    readonly path: "/internal/memory/decision-requests";
    readonly authType: "secret";
    readonly querySchema: z.ZodObject<{
        tenantId: z.ZodString;
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        planId: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        requests: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            request: z.ZodObject<{
                requestId: z.ZodString;
                tenantId: z.ZodString;
                organizationId: z.ZodString;
                projectId: z.ZodOptional<z.ZodString>;
                subject: z.ZodOptional<z.ZodObject<{
                    kind: z.ZodEnum<{
                        action_plan: "action_plan";
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>>;
                question: z.ZodString;
                options: z.ZodArray<z.ZodObject<{
                    optionId: z.ZodString;
                    label: z.ZodString;
                    detail: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
                requestedBy: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodNumber;
                }, z.core.$strict>;
                addressedTo: z.ZodObject<{
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>;
                channel: z.ZodEnum<{
                    email: "email";
                    x9_conversation: "x9_conversation";
                    forge_panel: "forge_panel";
                }>;
                createdAt: z.ZodISODateTime;
            }, z.core.$strict>;
            state: z.ZodLiteral<"open">;
            outcome: z.ZodNull;
        }, z.core.$strict>, z.ZodObject<{
            request: z.ZodObject<{
                requestId: z.ZodString;
                tenantId: z.ZodString;
                organizationId: z.ZodString;
                projectId: z.ZodOptional<z.ZodString>;
                subject: z.ZodOptional<z.ZodObject<{
                    kind: z.ZodEnum<{
                        action_plan: "action_plan";
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>>;
                question: z.ZodString;
                options: z.ZodArray<z.ZodObject<{
                    optionId: z.ZodString;
                    label: z.ZodString;
                    detail: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
                requestedBy: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodNumber;
                }, z.core.$strict>;
                addressedTo: z.ZodObject<{
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>;
                channel: z.ZodEnum<{
                    email: "email";
                    x9_conversation: "x9_conversation";
                    forge_panel: "forge_panel";
                }>;
                createdAt: z.ZodISODateTime;
            }, z.core.$strict>;
            state: z.ZodLiteral<"decided">;
            outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
                outcome: z.ZodLiteral<"approved">;
                optionId: z.ZodString;
                requestId: z.ZodString;
                decidedBy: z.ZodObject<{
                    kind: z.ZodLiteral<"owner">;
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>;
                decidedAt: z.ZodISODateTime;
                channel: z.ZodEnum<{
                    email: "email";
                    x9_conversation: "x9_conversation";
                    forge_panel: "forge_panel";
                }>;
                sourceRef: z.ZodString;
                subject: z.ZodOptional<z.ZodObject<{
                    kind: z.ZodEnum<{
                        action_plan: "action_plan";
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                outcome: z.ZodLiteral<"rejected">;
                reason: z.ZodString;
                requestId: z.ZodString;
                decidedBy: z.ZodObject<{
                    kind: z.ZodLiteral<"owner">;
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>;
                decidedAt: z.ZodISODateTime;
                channel: z.ZodEnum<{
                    email: "email";
                    x9_conversation: "x9_conversation";
                    forge_panel: "forge_panel";
                }>;
                sourceRef: z.ZodString;
                subject: z.ZodOptional<z.ZodObject<{
                    kind: z.ZodEnum<{
                        action_plan: "action_plan";
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>], "outcome">;
        }, z.core.$strict>], "state">>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-memory-decision-requests.d.ts.map