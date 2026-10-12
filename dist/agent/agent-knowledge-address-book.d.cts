import { z } from 'zod';
import { type AgentChannelAddressBook } from "./agent-channel-access.cjs";
/** Canonical international number from voice-live; never normalize an ambiguous regional contact. */
export declare const AgentKnowledgePhoneNumberSchema: z.ZodString;
export type AgentKnowledgePhoneNumber = z.infer<typeof AgentKnowledgePhoneNumberSchema>;
/** Forge Conoscenza is authoritative. An incomplete source publishes neither admission list. */
export declare const AgentKnowledgeAddressBookSchema: z.ZodObject<{
    status: z.ZodEnum<{
        unavailable: "unavailable";
        partial: "partial";
        complete: "complete";
    }>;
    version: z.ZodNullable<z.ZodNumber>;
    observedAt: z.ZodNullable<z.ZodISODateTime>;
    emails: z.ZodNullable<z.ZodArray<z.ZodEmail>>;
    phones: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
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
export type AgentKnowledgeAddressBook = z.infer<typeof AgentKnowledgeAddressBookSchema>;
export type AgentKnowledgeAddressBookInput = z.input<typeof AgentKnowledgeAddressBookSchema>;
/** Mandatory writer boundary; returns detached validated values without defaults. */
export declare function createAgentKnowledgeAddressBook(input: AgentKnowledgeAddressBookInput): AgentKnowledgeAddressBook;
/** Validated C1 projection, preserving authority, completeness, version, time and exact email/telephone entries. */
export declare function toAgentChannelAddressBook(rawBook: unknown): AgentChannelAddressBook;
/** Current complete source only. Consumers recheck remote revocations after awaits before effects. */
export declare function isAgentKnowledgeAddressBookCurrent(rawBook: unknown, rawBinding: unknown, now: number, maximumAgeMs?: number): boolean;
//# sourceMappingURL=agent-knowledge-address-book.d.ts.map