import { z } from 'zod';
/** Explicit ownership for access control; names and credentials never confer authorization. */
export declare const AgentChannelAccessBindingSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type AgentChannelAccessBinding = z.infer<typeof AgentChannelAccessBindingSchema>;
export declare function sameAgentChannelAccessBinding(left: unknown, right: unknown): boolean;
/** Telegram uses at most 52 significant bits; canonical decimal strings preserve group signs. */
export declare const AgentTelegramChatIdSchema: z.ZodString;
export type AgentTelegramChatId = z.infer<typeof AgentTelegramChatIdSchema>;
export declare const AgentTelegramChatTypeSchema: z.ZodEnum<{
    group: "group";
    private: "private";
    supergroup: "supergroup";
}>;
export declare const AgentChannelAccessNameSchema: z.ZodString;
export declare const AgentTelegramAdmittedChatSchema: z.ZodObject<{
    chatId: z.ZodString;
    type: z.ZodEnum<{
        group: "group";
        private: "private";
        supergroup: "supergroup";
    }>;
    name: z.ZodString;
    admittedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type AgentTelegramAdmittedChat = z.infer<typeof AgentTelegramAdmittedChatSchema>;
export declare const AgentTelegramAccessPolicySchema: z.ZodObject<{
    kind: z.ZodLiteral<"telegram">;
    mode: z.ZodEnum<{
        "approved-chats": "approved-chats";
        anyone: "anyone";
    }>;
    chats: z.ZodArray<z.ZodObject<{
        chatId: z.ZodString;
        type: z.ZodEnum<{
            group: "group";
            private: "private";
            supergroup: "supergroup";
        }>;
        name: z.ZodString;
        admittedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type AgentTelegramAccessPolicy = z.infer<typeof AgentTelegramAccessPolicySchema>;
export declare const AgentEmailAccessPolicySchema: z.ZodObject<{
    kind: z.ZodLiteral<"email">;
    mode: z.ZodEnum<{
        anyone: "anyone";
        "address-book": "address-book";
    }>;
}, z.core.$strict>;
export type AgentEmailAccessPolicy = z.infer<typeof AgentEmailAccessPolicySchema>;
export declare const AgentChannelAccessPolicySchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"telegram">;
    mode: z.ZodEnum<{
        "approved-chats": "approved-chats";
        anyone: "anyone";
    }>;
    chats: z.ZodArray<z.ZodObject<{
        chatId: z.ZodString;
        type: z.ZodEnum<{
            group: "group";
            private: "private";
            supergroup: "supergroup";
        }>;
        name: z.ZodString;
        admittedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"email">;
    mode: z.ZodEnum<{
        anyone: "anyone";
        "address-book": "address-book";
    }>;
}, z.core.$strict>], "kind">;
export type AgentChannelAccessPolicy = z.infer<typeof AgentChannelAccessPolicySchema>;
/** Versions belong to the enclosing channel configuration, not the whole agent or a copied credential. */
export declare const AgentChannelAccessConfigurationSchema: z.ZodObject<{
    desiredPolicy: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"telegram">;
        mode: z.ZodEnum<{
            "approved-chats": "approved-chats";
            anyone: "anyone";
        }>;
        chats: z.ZodArray<z.ZodObject<{
            chatId: z.ZodString;
            type: z.ZodEnum<{
                group: "group";
                private: "private";
                supergroup: "supergroup";
            }>;
            name: z.ZodString;
            admittedAt: z.ZodISODateTime;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"email">;
        mode: z.ZodEnum<{
            anyone: "anyone";
            "address-book": "address-book";
        }>;
    }, z.core.$strict>], "kind">;
    appliedPolicy: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"telegram">;
        mode: z.ZodEnum<{
            "approved-chats": "approved-chats";
            anyone: "anyone";
        }>;
        chats: z.ZodArray<z.ZodObject<{
            chatId: z.ZodString;
            type: z.ZodEnum<{
                group: "group";
                private: "private";
                supergroup: "supergroup";
            }>;
            name: z.ZodString;
            admittedAt: z.ZodISODateTime;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"email">;
        mode: z.ZodEnum<{
            anyone: "anyone";
            "address-book": "address-book";
        }>;
    }, z.core.$strict>], "kind">>;
}, z.core.$strict>;
export type AgentChannelAccessConfiguration = z.infer<typeof AgentChannelAccessConfigurationSchema>;
/** Absence is handled by the consumer's legacy path; this helper never turns unknown into public access. */
export declare function isTelegramChatAdmitted(rawPolicy: unknown, rawChatId: unknown): boolean;
/** Exact normalized mailbox, never a display-name, domain wildcard or fuzzy contact match. */
export declare const AgentChannelEmailAddressSchema: z.ZodEmail;
export declare const AgentChannelAddressBookSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
    status: z.ZodEnum<{
        unavailable: "unavailable";
        partial: "partial";
        complete: "complete";
    }>;
    version: z.ZodNullable<z.ZodNumber>;
    observedAt: z.ZodNullable<z.ZodISODateTime>;
    emails: z.ZodNullable<z.ZodArray<z.ZodEmail>>;
    phones: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
}, z.core.$strict>;
export type AgentChannelAddressBook = z.infer<typeof AgentChannelAddressBookSchema>;
/** Metadata contract for the future scoped Conoscenza producer; no provider or notes file is an implicit source. */
export declare function isEmailSenderAdmitted(rawPolicy: unknown, rawSender: unknown, rawBook: unknown, rawBinding: unknown, now: number, maximumAgeMs?: number): boolean;
//# sourceMappingURL=agent-channel-access.d.ts.map