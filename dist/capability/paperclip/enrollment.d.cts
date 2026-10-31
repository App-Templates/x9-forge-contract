import { z } from 'zod';
export declare const PAPERCLIP_AGENT_KEY_NAME: "PAPERCLIP_API_KEY";
/** One record per enrolled agent: seat, applied binding and Vault key state. It never carries a key value. */
export declare const PaperclipEnrollmentSchema: z.ZodObject<{
    seat: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        unitId: z.ZodString;
        companyId: z.ZodUUID;
        paperclipAgentId: z.ZodUUID;
        enabled: z.ZodBoolean;
        roleAgents: z.ZodRecord<z.ZodString, z.ZodUUID>;
    }, z.core.$strict>;
    organizationId: z.ZodString;
    role: z.ZodEnum<{
        ricerca: "ricerca";
        lab: "lab";
        director: "director";
        "capo-bu": "capo-bu";
    }>;
    reportsToPaperclipAgentId: z.ZodOptional<z.ZodUUID>;
    participantBinding: z.ZodEnum<{
        applied: "applied";
        pending: "pending";
    }>;
    agentKey: z.ZodObject<{
        key: z.ZodLiteral<"PAPERCLIP_API_KEY">;
        store: z.ZodLiteral<"vault">;
        status: z.ZodEnum<{
            pending: "pending";
            stored: "stored";
        }>;
    }, z.core.$strict>;
    enrolledAt: z.ZodISODateTime;
}, z.core.$strict>;
export type PaperclipEnrollment = z.infer<typeof PaperclipEnrollmentSchema>;
/** Complete only when the participant binding is applied and the agent key is stored in the Vault. */
export declare function paperclipEnrollmentComplete(e: PaperclipEnrollment): boolean;
export declare const INTERNAL_PAPERCLIP_ENROLLMENT_RESOLVE_PATH: "/internal/paperclip/enrollments/resolve";
export declare const InternalPaperclipEnrollmentResolveRequestSchema: z.ZodUnion<readonly [z.ZodObject<{
    paperclipAgentId: z.ZodUUID;
}, z.core.$strict>, z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>]>;
export declare const InternalPaperclipEnrollmentResolveResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    outcome: z.ZodLiteral<"found">;
    enrollment: z.ZodObject<{
        seat: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            unitId: z.ZodString;
            companyId: z.ZodUUID;
            paperclipAgentId: z.ZodUUID;
            enabled: z.ZodBoolean;
            roleAgents: z.ZodRecord<z.ZodString, z.ZodUUID>;
        }, z.core.$strict>;
        organizationId: z.ZodString;
        role: z.ZodEnum<{
            ricerca: "ricerca";
            lab: "lab";
            director: "director";
            "capo-bu": "capo-bu";
        }>;
        reportsToPaperclipAgentId: z.ZodOptional<z.ZodUUID>;
        participantBinding: z.ZodEnum<{
            applied: "applied";
            pending: "pending";
        }>;
        agentKey: z.ZodObject<{
            key: z.ZodLiteral<"PAPERCLIP_API_KEY">;
            store: z.ZodLiteral<"vault">;
            status: z.ZodEnum<{
                pending: "pending";
                stored: "stored";
            }>;
        }, z.core.$strict>;
        enrolledAt: z.ZodISODateTime;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    outcome: z.ZodLiteral<"not_found">;
}, z.core.$strict>], "outcome">;
export type InternalPaperclipEnrollmentResolveRequest = z.infer<typeof InternalPaperclipEnrollmentResolveRequestSchema>;
export type InternalPaperclipEnrollmentResolveResponse = z.infer<typeof InternalPaperclipEnrollmentResolveResponseSchema>;
export declare const internalPaperclipEnrollmentResolveContract: {
    readonly method: "POST";
    readonly path: "/internal/paperclip/enrollments/resolve";
    readonly authType: "secret";
    readonly bodySchema: z.ZodUnion<readonly [z.ZodObject<{
        paperclipAgentId: z.ZodUUID;
    }, z.core.$strict>, z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>]>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        outcome: z.ZodLiteral<"found">;
        enrollment: z.ZodObject<{
            seat: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                unitId: z.ZodString;
                companyId: z.ZodUUID;
                paperclipAgentId: z.ZodUUID;
                enabled: z.ZodBoolean;
                roleAgents: z.ZodRecord<z.ZodString, z.ZodUUID>;
            }, z.core.$strict>;
            organizationId: z.ZodString;
            role: z.ZodEnum<{
                ricerca: "ricerca";
                lab: "lab";
                director: "director";
                "capo-bu": "capo-bu";
            }>;
            reportsToPaperclipAgentId: z.ZodOptional<z.ZodUUID>;
            participantBinding: z.ZodEnum<{
                applied: "applied";
                pending: "pending";
            }>;
            agentKey: z.ZodObject<{
                key: z.ZodLiteral<"PAPERCLIP_API_KEY">;
                store: z.ZodLiteral<"vault">;
                status: z.ZodEnum<{
                    pending: "pending";
                    stored: "stored";
                }>;
            }, z.core.$strict>;
            enrolledAt: z.ZodISODateTime;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        outcome: z.ZodLiteral<"not_found">;
    }, z.core.$strict>], "outcome">;
};
//# sourceMappingURL=enrollment.d.ts.map