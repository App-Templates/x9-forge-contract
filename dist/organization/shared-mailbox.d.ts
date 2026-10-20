import { z } from 'zod';
import { type AgentId } from "../agent/agent-identity.js";
export declare const SharedMailboxLabelSchema: z.ZodString;
export type SharedMailboxLabel = z.infer<typeof SharedMailboxLabelSchema>;
export declare const SharedMailboxHolderSchema: z.ZodObject<{
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    label: z.ZodString;
    displayName: z.ZodString;
}, z.core.$strict>;
export type SharedMailboxHolder = z.infer<typeof SharedMailboxHolderSchema>;
/** One company inbox, shared by the Director and business unit leads. */
export declare const SharedMailboxSchema: z.ZodObject<{
    mailboxId: z.ZodString;
    tenantId: z.ZodString;
    companyId: z.ZodString;
    providerInboxId: z.ZodString;
    address: z.ZodEmail;
    holders: z.ZodArray<z.ZodObject<{
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        label: z.ZodString;
        displayName: z.ZodString;
    }, z.core.$strict>>;
    defaultAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
}, z.core.$strict>;
export type SharedMailbox = z.infer<typeof SharedMailboxSchema>;
/** Provider conversation ownership, scoped to one mailbox. */
export declare const SharedMailboxThreadSchema: z.ZodObject<{
    mailboxId: z.ZodString;
    providerThreadId: z.ZodString;
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    openedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type SharedMailboxThread = z.infer<typeof SharedMailboxThreadSchema>;
export declare const SHARED_MAILBOX_ROUTE_VIAS: readonly ["thread", "label", "default"];
export type SharedMailboxRouteVia = (typeof SHARED_MAILBOX_ROUTE_VIAS)[number];
export type SharedMailboxRoute = {
    agentId: AgentId;
    via: SharedMailboxRouteVia;
};
export declare function parseSharedMailboxSubjectLabel(subject: string): string | null;
/** Preserve conversation ownership before considering a subject label. */
export declare function routeSharedMailboxMessage(input: {
    mailbox: SharedMailbox;
    threads: readonly SharedMailboxThread[];
    providerThreadId?: string | null;
    subject: string;
}): SharedMailboxRoute;
//# sourceMappingURL=shared-mailbox.d.ts.map