import { z } from 'zod';
export declare const INTERNAL_PAPERCLIP_RD_ENROLLMENT_PATH: "/internal/paperclip/rd-enrollment";
/** One R&D part of the company with the identity Forge gave it at birth (complete, never legacy). */
export declare const CompanyRdEnrollmentAgentSchema: z.ZodObject<{
    part: z.ZodEnum<{
        ricerca: "ricerca";
        lab: "lab";
    }>;
    agentIdentity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>;
export type CompanyRdEnrollmentAgent = z.infer<typeof CompanyRdEnrollmentAgentSchema>;
/**
 * Forge factory-svc -> cap-paperclip: create the Paperclip seats of the company Lab and Ricerca and enrol them in
 * the company organization. One request, exactly one `lab` and one `ricerca`.
 */
export declare const CompanyRdEnrollmentRequestSchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    companyId: z.ZodString;
    requestId: z.ZodString;
    agents: z.ZodArray<z.ZodObject<{
        part: z.ZodEnum<{
            ricerca: "ricerca";
            lab: "lab";
        }>;
        agentIdentity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type CompanyRdEnrollmentRequest = z.infer<typeof CompanyRdEnrollmentRequestSchema>;
/** `enrolled` only when both seats are enrolled; `in_corso` while the enrolment is still going on. */
export declare const COMPANY_RD_ENROLLMENT_STATES: readonly ["enrolled", "in_corso"];
export declare const CompanyRdEnrollmentStateSchema: z.ZodEnum<{
    enrolled: "enrolled";
    in_corso: "in_corso";
}>;
export type CompanyRdEnrollmentState = z.infer<typeof CompanyRdEnrollmentStateSchema>;
/** Same seat status the read contract of the seats publishes (`key_pending` | `enrolled`). */
export declare const CompanyRdEnrollmentSeatStatusSchema: z.ZodEnum<{
    key_pending: "key_pending";
    enrolled: "enrolled";
}>;
export type CompanyRdEnrollmentSeatStatus = z.infer<typeof CompanyRdEnrollmentSeatStatusSchema>;
/** Status of the seat of one R&D part. No identity and no credential value crosses this boundary. */
export declare const CompanyRdEnrollmentSeatSchema: z.ZodObject<{
    part: z.ZodEnum<{
        ricerca: "ricerca";
        lab: "lab";
    }>;
    paperclipAgentId: z.ZodUUID;
    status: z.ZodEnum<{
        key_pending: "key_pending";
        enrolled: "enrolled";
    }>;
}, z.core.$strict>;
export type CompanyRdEnrollmentSeat = z.infer<typeof CompanyRdEnrollmentSeatSchema>;
export declare const CompanyRdEnrollmentResponseSchema: z.ZodObject<{
    state: z.ZodEnum<{
        enrolled: "enrolled";
        in_corso: "in_corso";
    }>;
    seats: z.ZodArray<z.ZodObject<{
        part: z.ZodEnum<{
            ricerca: "ricerca";
            lab: "lab";
        }>;
        paperclipAgentId: z.ZodUUID;
        status: z.ZodEnum<{
            key_pending: "key_pending";
            enrolled: "enrolled";
        }>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type CompanyRdEnrollmentResponse = z.infer<typeof CompanyRdEnrollmentResponseSchema>;
export declare const COMPANY_RD_ENROLLMENT_ERRORS: readonly ["director_unknown", "person_unknown", "identity_mismatch", "request_conflict", "seat_failed", "binding_write"];
export declare const CompanyRdEnrollmentErrorSchema: z.ZodEnum<{
    identity_mismatch: "identity_mismatch";
    director_unknown: "director_unknown";
    person_unknown: "person_unknown";
    request_conflict: "request_conflict";
    seat_failed: "seat_failed";
    binding_write: "binding_write";
}>;
export type CompanyRdEnrollmentError = z.infer<typeof CompanyRdEnrollmentErrorSchema>;
export declare const CompanyRdEnrollmentErrorResponseSchema: z.ZodObject<{
    error: z.ZodEnum<{
        identity_mismatch: "identity_mismatch";
        director_unknown: "director_unknown";
        person_unknown: "person_unknown";
        request_conflict: "request_conflict";
        seat_failed: "seat_failed";
        binding_write: "binding_write";
    }>;
}, z.core.$strict>;
export type CompanyRdEnrollmentErrorResponse = z.infer<typeof CompanyRdEnrollmentErrorResponseSchema>;
export declare const internalCompanyRdEnrollmentContract: {
    readonly method: "POST";
    readonly path: "/internal/paperclip/rd-enrollment";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly bodySchema: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        companyId: z.ZodString;
        requestId: z.ZodString;
        agents: z.ZodArray<z.ZodObject<{
            part: z.ZodEnum<{
                ricerca: "ricerca";
                lab: "lab";
            }>;
            agentIdentity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        state: z.ZodEnum<{
            enrolled: "enrolled";
            in_corso: "in_corso";
        }>;
        seats: z.ZodArray<z.ZodObject<{
            part: z.ZodEnum<{
                ricerca: "ricerca";
                lab: "lab";
            }>;
            paperclipAgentId: z.ZodUUID;
            status: z.ZodEnum<{
                key_pending: "key_pending";
                enrolled: "enrolled";
            }>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly errorResponseSchema: z.ZodObject<{
        error: z.ZodEnum<{
            identity_mismatch: "identity_mismatch";
            director_unknown: "director_unknown";
            person_unknown: "person_unknown";
            request_conflict: "request_conflict";
            seat_failed: "seat_failed";
            binding_write: "binding_write";
        }>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-paperclip-rd-enrollment.d.ts.map