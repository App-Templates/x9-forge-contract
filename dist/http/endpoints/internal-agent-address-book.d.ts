import { z } from 'zod';
export declare const AgentAddressBookChannelSchema: z.ZodEnum<{
    email: "email";
    phone: "phone";
}>;
export type AgentAddressBookChannel = z.infer<typeof AgentAddressBookChannelSchema>;
export declare const AgentAddressBookParamsSchema: z.ZodObject<{
    agentId: z.ZodString;
    kind: z.ZodEnum<{
        email: "email";
        phone: "phone";
    }>;
}, z.core.$strict>;
export type AgentAddressBookParams = z.infer<typeof AgentAddressBookParamsSchema>;
export declare const AgentAddressBookResponseSchema: z.ZodObject<{
    kind: z.ZodEnum<{
        email: "email";
        phone: "phone";
    }>;
    addressBook: z.ZodObject<{
        status: z.ZodEnum<{
            unavailable: "unavailable";
            partial: "partial";
            complete: "complete";
        }>;
        version: z.ZodNullable<z.ZodNumber>;
        observedAt: z.ZodNullable<z.ZodISODateTime>;
        emails: z.ZodNullable<z.ZodArray<z.ZodEmail>>;
        scope: z.ZodObject<{
            agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        phoneNumbers: z.ZodNullable<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type AgentAddressBookResponse = z.infer<typeof AgentAddressBookResponseSchema>;
export declare const AgentAddressBookErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        invalid_request: "invalid_request";
        agent_not_found: "agent_not_found";
        idempotency_conflict: "idempotency_conflict";
        source_unavailable: "source_unavailable";
        identity_mismatch: "identity_mismatch";
        load_failed: "load_failed";
        apply_failed: "apply_failed";
        reconcile_pending: "reconcile_pending";
        stale_version: "stale_version";
        request_not_found: "request_not_found";
        command_in_progress: "command_in_progress";
        address_book_unavailable: "address_book_unavailable";
        queue_limit: "queue_limit";
        not_supported: "not_supported";
    }>;
    currentVersion: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strict>;
export type AgentAddressBookErrorResponse = z.infer<typeof AgentAddressBookErrorResponseSchema>;
/** X9 -> Forge Conoscenza. Resolve trusted agent authority before fetching; never persist a copied allowlist.
 * Internal token authentication does not grant arbitrary owner/tenant access. This descriptor installs no handler.
 * Telegram retains its own approved-chat policy, never inferred from email or phone contacts.
 */
export declare const internalAgentAddressBookContract: {
    readonly method: "GET";
    readonly path: "/internal/agents/:agentId/channels/:kind/address-book";
    readonly authType: "token";
    readonly authHeader: "X-Internal-Token";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        kind: z.ZodEnum<{
            email: "email";
            phone: "phone";
        }>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        kind: z.ZodEnum<{
            email: "email";
            phone: "phone";
        }>;
        addressBook: z.ZodObject<{
            status: z.ZodEnum<{
                unavailable: "unavailable";
                partial: "partial";
                complete: "complete";
            }>;
            version: z.ZodNullable<z.ZodNumber>;
            observedAt: z.ZodNullable<z.ZodISODateTime>;
            emails: z.ZodNullable<z.ZodArray<z.ZodEmail>>;
            scope: z.ZodObject<{
                agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            phoneNumbers: z.ZodNullable<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly errorResponseSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodEnum<{
            invalid_request: "invalid_request";
            agent_not_found: "agent_not_found";
            idempotency_conflict: "idempotency_conflict";
            source_unavailable: "source_unavailable";
            identity_mismatch: "identity_mismatch";
            load_failed: "load_failed";
            apply_failed: "apply_failed";
            reconcile_pending: "reconcile_pending";
            stale_version: "stale_version";
            request_not_found: "request_not_found";
            command_in_progress: "command_in_progress";
            address_book_unavailable: "address_book_unavailable";
            queue_limit: "queue_limit";
            not_supported: "not_supported";
        }>;
        currentVersion: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, z.core.$strict>;
};
export declare function agentAddressBookPath(agentId: string, kind: AgentAddressBookChannel): string;
/** Correlate one response with the management route, requested door and full trusted runtime authority. */
export declare function isAgentAddressBookResponseForRequest(rawResponse: unknown, rawParams: unknown, rawBinding: unknown, now: number, maximumAgeMs?: number): boolean;
//# sourceMappingURL=internal-agent-address-book.d.ts.map