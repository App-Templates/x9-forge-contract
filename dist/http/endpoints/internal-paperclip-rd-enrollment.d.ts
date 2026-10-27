import { z } from 'zod';
export declare const INTERNAL_COMPANY_RD_ENROLLMENT_PATH: "/internal/paperclip/rd-enrollment";
/** Forge factory-svc -> Paperclip: enroll the Ricerca and Lab agents of a company as seats. */
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
export declare const CompanyRdEnrollmentSeatStatusSchema: z.ZodEnum<{
    key_pending: "key_pending";
    enrolled: "enrolled";
}>;
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
export declare const CompanyRdEnrollmentErrorCodeSchema: z.ZodEnum<{
    identity_mismatch: "identity_mismatch";
    director_unknown: "director_unknown";
    person_unknown: "person_unknown";
    request_conflict: "request_conflict";
    seat_failed: "seat_failed";
    binding_write: "binding_write";
}>;
export type CompanyRdEnrollmentErrorCode = z.infer<typeof CompanyRdEnrollmentErrorCodeSchema>;
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
    readonly errorSchema: z.ZodObject<{
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