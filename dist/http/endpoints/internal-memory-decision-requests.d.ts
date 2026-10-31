import { z } from 'zod';
export declare const INTERNAL_MEMORY_DECISION_REQUESTS_PATH: "/internal/memory/decision-requests";
export declare const INTERNAL_MEMORY_DECISION_REQUEST_PATH: "/internal/memory/decision-requests/:requestId";
export declare const INTERNAL_MEMORY_DECISION_REQUEST_OUTCOME_PATH: "/internal/memory/decision-requests/:requestId/outcome";
export declare const INTERNAL_MEMORY_DECISION_REQUEST_PROJECT_LIST_PATH: "/internal/memory/decision-requests/by-project";
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
        subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodEnum<{
                action_plan: "action_plan";
                vertical_plan: "vertical_plan";
                confirmation: "confirmation";
            }>;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"delivery">;
            organizationId: z.ZodString;
            projectId: z.ZodString;
            buSlug: z.ZodString;
            deliveryRef: z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>], "kind">>;
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
        addressedTo: z.ZodUnion<readonly [z.ZodObject<{
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"referent">;
            email: z.ZodEmail;
        }, z.core.$strict>]>;
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
        subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodEnum<{
                action_plan: "action_plan";
                vertical_plan: "vertical_plan";
                confirmation: "confirmation";
            }>;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"delivery">;
            organizationId: z.ZodString;
            projectId: z.ZodString;
            buSlug: z.ZodString;
            deliveryRef: z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>], "kind">>;
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
        addressedTo: z.ZodUnion<readonly [z.ZodObject<{
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"referent">;
            email: z.ZodEmail;
        }, z.core.$strict>]>;
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
        decidedBy: z.ZodUnion<readonly [z.ZodObject<{
            kind: z.ZodLiteral<"owner">;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"referent">;
            email: z.ZodEmail;
        }, z.core.$strict>]>;
        decidedAt: z.ZodISODateTime;
        channel: z.ZodEnum<{
            email: "email";
            x9_conversation: "x9_conversation";
            forge_panel: "forge_panel";
        }>;
        sourceRef: z.ZodString;
        subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodEnum<{
                action_plan: "action_plan";
                vertical_plan: "vertical_plan";
                confirmation: "confirmation";
            }>;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"delivery">;
            organizationId: z.ZodString;
            projectId: z.ZodString;
            buSlug: z.ZodString;
            deliveryRef: z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>], "kind">>;
    }, z.core.$strict>, z.ZodObject<{
        outcome: z.ZodLiteral<"rejected">;
        reason: z.ZodString;
        requestId: z.ZodString;
        decidedBy: z.ZodUnion<readonly [z.ZodObject<{
            kind: z.ZodLiteral<"owner">;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"referent">;
            email: z.ZodEmail;
        }, z.core.$strict>]>;
        decidedAt: z.ZodISODateTime;
        channel: z.ZodEnum<{
            email: "email";
            x9_conversation: "x9_conversation";
            forge_panel: "forge_panel";
        }>;
        sourceRef: z.ZodString;
        subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodEnum<{
                action_plan: "action_plan";
                vertical_plan: "vertical_plan";
                confirmation: "confirmation";
            }>;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"delivery">;
            organizationId: z.ZodString;
            projectId: z.ZodString;
            buSlug: z.ZodString;
            deliveryRef: z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>], "kind">>;
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
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodEnum<{
                    action_plan: "action_plan";
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>], "kind">>;
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
            addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
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
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodEnum<{
                    action_plan: "action_plan";
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>], "kind">>;
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
            addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
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
            decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                kind: z.ZodLiteral<"owner">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
            decidedAt: z.ZodISODateTime;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            sourceRef: z.ZodString;
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodEnum<{
                    action_plan: "action_plan";
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>], "kind">>;
        }, z.core.$strict>, z.ZodObject<{
            outcome: z.ZodLiteral<"rejected">;
            reason: z.ZodString;
            requestId: z.ZodString;
            decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                kind: z.ZodLiteral<"owner">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
            decidedAt: z.ZodISODateTime;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            sourceRef: z.ZodString;
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodEnum<{
                    action_plan: "action_plan";
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>], "kind">>;
        }, z.core.$strict>], "outcome">;
    }, z.core.$strict>], "state">>;
}, z.core.$strict>;
export type InternalMemoryDecisionRequestListResponse = z.infer<typeof InternalMemoryDecisionRequestListResponseSchema>;
/** agentId identifies the Director reader to authorize, never the requests' producers. */
export declare const InternalMemoryDecisionRequestProjectListQuerySchema: z.ZodObject<{
    tenantId: z.ZodString;
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    organizationId: z.ZodString;
    projectId: z.ZodString;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    cursor: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type InternalMemoryDecisionRequestProjectListQuery = z.infer<typeof InternalMemoryDecisionRequestProjectListQuerySchema>;
/**
 * Decoded cursor: transported as opaque base64url-encoded JSON. The service must
 * validate the decoded value and match its tenant/organization/project against
 * the query and authenticated scope on every page; a cursor grants no access.
 * Both ordering keys are mandatory, including when several rows share a timestamp.
 */
export declare const InternalMemoryDecisionRequestProjectCursorSchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    projectId: z.ZodString;
    createdAt: z.ZodISODateTime;
    requestId: z.ZodString;
}, z.core.$strict>;
export type InternalMemoryDecisionRequestProjectCursor = z.infer<typeof InternalMemoryDecisionRequestProjectCursorSchema>;
export declare const InternalMemoryDecisionRequestProjectListResponseSchema: z.ZodObject<{
    requests: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        request: z.ZodObject<{
            requestId: z.ZodString;
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            projectId: z.ZodOptional<z.ZodString>;
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodEnum<{
                    action_plan: "action_plan";
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>], "kind">>;
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
            addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
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
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodEnum<{
                    action_plan: "action_plan";
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>], "kind">>;
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
            addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
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
            decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                kind: z.ZodLiteral<"owner">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
            decidedAt: z.ZodISODateTime;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            sourceRef: z.ZodString;
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodEnum<{
                    action_plan: "action_plan";
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>], "kind">>;
        }, z.core.$strict>, z.ZodObject<{
            outcome: z.ZodLiteral<"rejected">;
            reason: z.ZodString;
            requestId: z.ZodString;
            decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                kind: z.ZodLiteral<"owner">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
            decidedAt: z.ZodISODateTime;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            sourceRef: z.ZodString;
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodEnum<{
                    action_plan: "action_plan";
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>], "kind">>;
        }, z.core.$strict>], "outcome">;
    }, z.core.$strict>], "state">>;
    nextCursor: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type InternalMemoryDecisionRequestProjectListResponse = z.infer<typeof InternalMemoryDecisionRequestProjectListResponseSchema>;
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
        subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodEnum<{
                action_plan: "action_plan";
                vertical_plan: "vertical_plan";
                confirmation: "confirmation";
            }>;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"delivery">;
            organizationId: z.ZodString;
            projectId: z.ZodString;
            buSlug: z.ZodString;
            deliveryRef: z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>], "kind">>;
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
        addressedTo: z.ZodUnion<readonly [z.ZodObject<{
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"referent">;
            email: z.ZodEmail;
        }, z.core.$strict>]>;
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
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodEnum<{
                    action_plan: "action_plan";
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>], "kind">>;
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
            addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
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
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodEnum<{
                    action_plan: "action_plan";
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>], "kind">>;
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
            addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
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
            decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                kind: z.ZodLiteral<"owner">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
            decidedAt: z.ZodISODateTime;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            sourceRef: z.ZodString;
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodEnum<{
                    action_plan: "action_plan";
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>], "kind">>;
        }, z.core.$strict>, z.ZodObject<{
            outcome: z.ZodLiteral<"rejected">;
            reason: z.ZodString;
            requestId: z.ZodString;
            decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                kind: z.ZodLiteral<"owner">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                email: z.ZodEmail;
            }, z.core.$strict>]>;
            decidedAt: z.ZodISODateTime;
            channel: z.ZodEnum<{
                email: "email";
                x9_conversation: "x9_conversation";
                forge_panel: "forge_panel";
            }>;
            sourceRef: z.ZodString;
            subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodEnum<{
                    action_plan: "action_plan";
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"delivery">;
                organizationId: z.ZodString;
                projectId: z.ZodString;
                buSlug: z.ZodString;
                deliveryRef: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>], "kind">>;
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
        decidedBy: z.ZodUnion<readonly [z.ZodObject<{
            kind: z.ZodLiteral<"owner">;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"referent">;
            email: z.ZodEmail;
        }, z.core.$strict>]>;
        decidedAt: z.ZodISODateTime;
        channel: z.ZodEnum<{
            email: "email";
            x9_conversation: "x9_conversation";
            forge_panel: "forge_panel";
        }>;
        sourceRef: z.ZodString;
        subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodEnum<{
                action_plan: "action_plan";
                vertical_plan: "vertical_plan";
                confirmation: "confirmation";
            }>;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"delivery">;
            organizationId: z.ZodString;
            projectId: z.ZodString;
            buSlug: z.ZodString;
            deliveryRef: z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>], "kind">>;
    }, z.core.$strict>, z.ZodObject<{
        outcome: z.ZodLiteral<"rejected">;
        reason: z.ZodString;
        requestId: z.ZodString;
        decidedBy: z.ZodUnion<readonly [z.ZodObject<{
            kind: z.ZodLiteral<"owner">;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"referent">;
            email: z.ZodEmail;
        }, z.core.$strict>]>;
        decidedAt: z.ZodISODateTime;
        channel: z.ZodEnum<{
            email: "email";
            x9_conversation: "x9_conversation";
            forge_panel: "forge_panel";
        }>;
        sourceRef: z.ZodString;
        subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodEnum<{
                action_plan: "action_plan";
                vertical_plan: "vertical_plan";
                confirmation: "confirmation";
            }>;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"delivery">;
            organizationId: z.ZodString;
            projectId: z.ZodString;
            buSlug: z.ZodString;
            deliveryRef: z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>], "kind">>;
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
                subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodEnum<{
                        action_plan: "action_plan";
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"delivery">;
                    organizationId: z.ZodString;
                    projectId: z.ZodString;
                    buSlug: z.ZodString;
                    deliveryRef: z.ZodObject<{
                        assetId: z.ZodString;
                        sha256: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>], "kind">>;
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
                addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"referent">;
                    email: z.ZodEmail;
                }, z.core.$strict>]>;
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
                subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodEnum<{
                        action_plan: "action_plan";
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"delivery">;
                    organizationId: z.ZodString;
                    projectId: z.ZodString;
                    buSlug: z.ZodString;
                    deliveryRef: z.ZodObject<{
                        assetId: z.ZodString;
                        sha256: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>], "kind">>;
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
                addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"referent">;
                    email: z.ZodEmail;
                }, z.core.$strict>]>;
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
                decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                    kind: z.ZodLiteral<"owner">;
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"referent">;
                    email: z.ZodEmail;
                }, z.core.$strict>]>;
                decidedAt: z.ZodISODateTime;
                channel: z.ZodEnum<{
                    email: "email";
                    x9_conversation: "x9_conversation";
                    forge_panel: "forge_panel";
                }>;
                sourceRef: z.ZodString;
                subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodEnum<{
                        action_plan: "action_plan";
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"delivery">;
                    organizationId: z.ZodString;
                    projectId: z.ZodString;
                    buSlug: z.ZodString;
                    deliveryRef: z.ZodObject<{
                        assetId: z.ZodString;
                        sha256: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>], "kind">>;
            }, z.core.$strict>, z.ZodObject<{
                outcome: z.ZodLiteral<"rejected">;
                reason: z.ZodString;
                requestId: z.ZodString;
                decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                    kind: z.ZodLiteral<"owner">;
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"referent">;
                    email: z.ZodEmail;
                }, z.core.$strict>]>;
                decidedAt: z.ZodISODateTime;
                channel: z.ZodEnum<{
                    email: "email";
                    x9_conversation: "x9_conversation";
                    forge_panel: "forge_panel";
                }>;
                sourceRef: z.ZodString;
                subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodEnum<{
                        action_plan: "action_plan";
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"delivery">;
                    organizationId: z.ZodString;
                    projectId: z.ZodString;
                    buSlug: z.ZodString;
                    deliveryRef: z.ZodObject<{
                        assetId: z.ZodString;
                        sha256: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>], "kind">>;
            }, z.core.$strict>], "outcome">;
        }, z.core.$strict>], "state">>;
    }, z.core.$strict>;
};
/**
 * Project list: authorize agentId as a Director for this tenant, organization
 * and project before returning data, on every page. Return no data from other
 * scopes; query parameters and decoded cursors alone authorize nobody.
 * Include every lead's requests and every state, preserving full requests,
 * referents, outcomes and email receipts. No producer, plan or state filter.
 *
 * Stable order: createdAt DESC, requestId ASC. Continue strictly after BOTH keys:
 * createdAt < cursor.createdAt OR (createdAt = cursor.createdAt AND requestId >
 * cursor.requestId). Never use an offset. Decode and validate cursors with
 * InternalMemoryDecisionRequestProjectCursorSchema and verify their scope as
 * documented above on every page.
 *
 * The service reads limit + 1 rows (default limit: 50), returns at most limit
 * rows, and emits a cursor for the last returned row only if more rows remain.
 * Only the mandatory nextCursor: null marks completion; clients must read all
 * pages. State changes do not move rows. New requests require a new complete
 * read before assembly; an empty or partial list does not authorize assembly.
 * Authorization, database pagination and assembly checks belong to consumers.
 */
export declare const internalMemoryDecisionRequestProjectListContract: {
    readonly method: "GET";
    readonly path: "/internal/memory/decision-requests/by-project";
    readonly authType: "secret";
    readonly querySchema: z.ZodObject<{
        tenantId: z.ZodString;
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        organizationId: z.ZodString;
        projectId: z.ZodString;
        limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        cursor: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        requests: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            request: z.ZodObject<{
                requestId: z.ZodString;
                tenantId: z.ZodString;
                organizationId: z.ZodString;
                projectId: z.ZodOptional<z.ZodString>;
                subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodEnum<{
                        action_plan: "action_plan";
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"delivery">;
                    organizationId: z.ZodString;
                    projectId: z.ZodString;
                    buSlug: z.ZodString;
                    deliveryRef: z.ZodObject<{
                        assetId: z.ZodString;
                        sha256: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>], "kind">>;
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
                addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"referent">;
                    email: z.ZodEmail;
                }, z.core.$strict>]>;
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
                subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodEnum<{
                        action_plan: "action_plan";
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"delivery">;
                    organizationId: z.ZodString;
                    projectId: z.ZodString;
                    buSlug: z.ZodString;
                    deliveryRef: z.ZodObject<{
                        assetId: z.ZodString;
                        sha256: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>], "kind">>;
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
                addressedTo: z.ZodUnion<readonly [z.ZodObject<{
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"referent">;
                    email: z.ZodEmail;
                }, z.core.$strict>]>;
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
                decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                    kind: z.ZodLiteral<"owner">;
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"referent">;
                    email: z.ZodEmail;
                }, z.core.$strict>]>;
                decidedAt: z.ZodISODateTime;
                channel: z.ZodEnum<{
                    email: "email";
                    x9_conversation: "x9_conversation";
                    forge_panel: "forge_panel";
                }>;
                sourceRef: z.ZodString;
                subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodEnum<{
                        action_plan: "action_plan";
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"delivery">;
                    organizationId: z.ZodString;
                    projectId: z.ZodString;
                    buSlug: z.ZodString;
                    deliveryRef: z.ZodObject<{
                        assetId: z.ZodString;
                        sha256: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>], "kind">>;
            }, z.core.$strict>, z.ZodObject<{
                outcome: z.ZodLiteral<"rejected">;
                reason: z.ZodString;
                requestId: z.ZodString;
                decidedBy: z.ZodUnion<readonly [z.ZodObject<{
                    kind: z.ZodLiteral<"owner">;
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"referent">;
                    email: z.ZodEmail;
                }, z.core.$strict>]>;
                decidedAt: z.ZodISODateTime;
                channel: z.ZodEnum<{
                    email: "email";
                    x9_conversation: "x9_conversation";
                    forge_panel: "forge_panel";
                }>;
                sourceRef: z.ZodString;
                subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodEnum<{
                        action_plan: "action_plan";
                        vertical_plan: "vertical_plan";
                        confirmation: "confirmation";
                    }>;
                    planId: z.ZodString;
                    planVersion: z.ZodNumber;
                    digest: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"delivery">;
                    organizationId: z.ZodString;
                    projectId: z.ZodString;
                    buSlug: z.ZodString;
                    deliveryRef: z.ZodObject<{
                        assetId: z.ZodString;
                        sha256: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>], "kind">>;
            }, z.core.$strict>], "outcome">;
        }, z.core.$strict>], "state">>;
        nextCursor: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-memory-decision-requests.d.ts.map