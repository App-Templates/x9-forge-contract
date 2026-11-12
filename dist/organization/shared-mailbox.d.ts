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
/** Audience of the company mailbox shared by the business unit leads, also what an absent `audience` means. */
export declare const BUSINESS_UNIT_LEADS_MAILBOX_AUDIENCE = "business_unit_leads";
/** Audience of the company mailbox shared by the project Directors. */
export declare const DIRECTORS_MAILBOX_AUDIENCE = "directors";
export declare const SHARED_MAILBOX_AUDIENCES: readonly ["business_unit_leads", "directors"];
export declare const SharedMailboxAudienceSchema: z.ZodEnum<{
    business_unit_leads: "business_unit_leads";
    directors: "directors";
}>;
export type SharedMailboxAudience = z.infer<typeof SharedMailboxAudienceSchema>;
/** One company inbox, shared by the Director and business unit leads, or by the project Directors. */
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
    /** Absent means `business_unit_leads`. */
    audience: z.ZodOptional<z.ZodEnum<{
        business_unit_leads: "business_unit_leads";
        directors: "directors";
    }>>;
}, z.core.$strict>;
export type SharedMailbox = z.infer<typeof SharedMailboxSchema>;
export declare function sharedMailboxAudience(mailbox: Pick<SharedMailbox, 'audience'>): SharedMailboxAudience;
/** Relative to the contexts directory shared by Forge and cap-email. */
export declare const SHARED_MAILBOXES_FILE = "companies/shared-mailboxes.json";
export declare const SharedMailboxFileEntrySchema: z.ZodObject<{
    companyName: z.ZodString;
    mailbox: z.ZodObject<{
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
        /** Absent means `business_unit_leads`. */
        audience: z.ZodOptional<z.ZodEnum<{
            business_unit_leads: "business_unit_leads";
            directors: "directors";
        }>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type SharedMailboxFileEntry = z.infer<typeof SharedMailboxFileEntrySchema>;
export declare const SharedMailboxesFileSchema: z.ZodArray<z.ZodObject<{
    companyName: z.ZodString;
    mailbox: z.ZodObject<{
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
        /** Absent means `business_unit_leads`. */
        audience: z.ZodOptional<z.ZodEnum<{
            business_unit_leads: "business_unit_leads";
            directors: "directors";
        }>>;
    }, z.core.$strict>;
}, z.core.$strict>>;
export type SharedMailboxesFile = z.infer<typeof SharedMailboxesFileSchema>;
/** Reject malformed files before exposing any mailbox to consumers. */
export declare function parseSharedMailboxesFile(json: unknown): SharedMailbox[];
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
export declare const SHARED_MAILBOX_REFUSAL_REASONS: readonly ["label_unknown"];
export type SharedMailboxRouteRefusal = {
    via: 'refused';
    reason: 'label_unknown';
    label: string;
};
type SharedMailboxRouteInput = {
    mailbox: SharedMailbox;
    threads: readonly SharedMailboxThread[];
    providerThreadId?: string | null;
    subject: string;
};
/** prefix of the request id the stack generates for a decision (X9 email-request-decision) */
export declare const GENERATED_DECISION_REQUEST_ID_PREFIX = "dec_";
/** shape of the request id the stack generates for a decision, `dec_` + lowercase UUID; stored ids are read with the wider DecisionRequestIdSchema */
export declare const GeneratedDecisionRequestIdSchema: z.ZodString;
/** a bracket group written by the stack itself (decision request tag): never a holder label */
export declare function isStackSubjectTag(group: string): boolean;
/** Thread first, then leading holders or stack tags; directors refuse an unknown group. */
export declare function decideSharedMailboxRoute(input: SharedMailboxRouteInput): SharedMailboxRoute | SharedMailboxRouteRefusal;
/** Same shape as ever; throws on a refusal so a caller that ignores refusals never delivers to the default. */
export declare function routeSharedMailboxMessage(input: SharedMailboxRouteInput): SharedMailboxRoute;
/** `[label]` as written in a subject; the label must be valid and read back unchanged. */
export declare function formatSharedMailboxSubjectLabel(label: string): string;
/** A valid label from a project name: collapse spaces, drop characters a label refuses, cap at 40. */
export declare function sharedMailboxLabelFromName(name: string): string;
export {};
//# sourceMappingURL=shared-mailbox.d.ts.map