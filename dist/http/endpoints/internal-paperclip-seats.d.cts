import { z } from 'zod';
export declare const INTERNAL_PAPERCLIP_SEATS_PATH: "/internal/paperclip/seats";
export declare const InternalPaperclipSeatsQuerySchema: z.ZodObject<{
    organizationId: z.ZodString;
}, z.core.$strict>;
/** Read-only seat status. Credential values must never cross this boundary. */
export declare const InternalPaperclipSeatSchema: z.ZodObject<{
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    paperclipAgentId: z.ZodUUID;
    companyId: z.ZodUUID;
    reportsToPaperclipAgentId: z.ZodUUID;
    enrollment: z.ZodObject<{
        state: z.ZodEnum<{
            key_pending: "key_pending";
            enrolled: "enrolled";
        }>;
        attempts: z.ZodInt;
        lastReason: z.ZodOptional<z.ZodString>;
        updatedAt: z.ZodISODateTime;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const InternalPaperclipSeatsResponseSchema: z.ZodObject<{
    seats: z.ZodArray<z.ZodObject<{
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        paperclipAgentId: z.ZodUUID;
        companyId: z.ZodUUID;
        reportsToPaperclipAgentId: z.ZodUUID;
        enrollment: z.ZodObject<{
            state: z.ZodEnum<{
                key_pending: "key_pending";
                enrolled: "enrolled";
            }>;
            attempts: z.ZodInt;
            lastReason: z.ZodOptional<z.ZodString>;
            updatedAt: z.ZodISODateTime;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const internalPaperclipSeatsReadContract: {
    readonly method: "GET";
    readonly path: "/internal/paperclip/seats";
    readonly authType: "secret";
    readonly querySchema: z.ZodObject<{
        organizationId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        seats: z.ZodArray<z.ZodObject<{
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            paperclipAgentId: z.ZodUUID;
            companyId: z.ZodUUID;
            reportsToPaperclipAgentId: z.ZodUUID;
            enrollment: z.ZodObject<{
                state: z.ZodEnum<{
                    key_pending: "key_pending";
                    enrolled: "enrolled";
                }>;
                attempts: z.ZodInt;
                lastReason: z.ZodOptional<z.ZodString>;
                updatedAt: z.ZodISODateTime;
            }, z.core.$strict>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-paperclip-seats.d.ts.map