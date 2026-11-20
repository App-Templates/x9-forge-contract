import { z } from 'zod';
import type { PaperclipCommunicationChannel } from "../capability/paperclip/communication-channels.cjs";
import { type AgentRole } from "./agent-role.cjs";
/**
 * The caller scopes referents and the brief opener to the correct tenant, client and
 * project, and keeps responsibility for those checks. The brief opener comes from
 * the actual incoming email sender, never from a model or a document.
 * This policy trusts the supplied scope and only decides recipient admission.
 */
export declare const EMAIL_RECIPIENT_BASES: readonly ["certified_referent", "brief_opener", "thread_referent_sender", "owner"];
export type EmailRecipientBasis = (typeof EMAIL_RECIPIENT_BASES)[number];
export declare const EMAIL_RECIPIENT_ROLE_BASES: Record<AgentRole, readonly EmailRecipientBasis[]>;
export declare const EMAIL_RECIPIENT_REFUSALS: readonly ["recipient_is_company_agent", "recipient_not_certified", "role_not_admitted", "recipient_check_unavailable"];
export type EmailRecipientRefusal = (typeof EMAIL_RECIPIENT_REFUSALS)[number];
export declare const EMAIL_REFUSAL_CHANNELS: Record<EmailRecipientRefusal, readonly PaperclipCommunicationChannel[]>;
export declare const EmailRecipientFactsSchema: z.ZodObject<{
    role: z.ZodEnum<{
        ricerca: "ricerca";
        lab: "lab";
        director: "director";
        "capo-bu": "capo-bu";
    }>;
    recipient: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodEmail>;
    referents: z.ZodArray<z.ZodObject<{
        source: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"seed">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"decision">;
            requestId: z.ZodLazy<z.ZodString>;
            planVersion: z.ZodNumber;
        }, z.core.$strict>], "kind">;
        confirmedAt: z.ZodISODateTime;
        supersedes: z.ZodOptional<z.ZodNumber>;
        version: z.ZodNumber;
        digest: z.ZodString;
        kind: z.ZodLiteral<"referent">;
        personRef: z.ZodString;
        name: z.ZodString;
        role: z.ZodString;
        email: z.ZodEmail;
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        clientId: z.ZodString;
        projectId: z.ZodOptional<z.ZodString>;
        buSlug: z.ZodOptional<z.ZodString>;
        level: z.ZodEnum<{
            client: "client";
            project: "project";
            business_unit: "business_unit";
        }>;
    }, z.core.$strict>>;
    ownerAddresses: z.ZodArray<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodEmail>>;
    companyAgentAddresses: z.ZodArray<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodEmail>>;
    briefOpener: z.ZodOptional<z.ZodObject<{
        address: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodEmail>;
    }, z.core.$strict>>;
    threadSender: z.ZodOptional<z.ZodObject<{
        address: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodEmail>;
        isCertifiedReferent: z.ZodBoolean;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type EmailRecipientFacts = z.infer<typeof EmailRecipientFactsSchema>;
export type EmailRecipientDecision = {
    ok: true;
    basis: EmailRecipientBasis;
} | {
    ok: false;
    refusal: EmailRecipientRefusal;
    channels: readonly PaperclipCommunicationChannel[];
};
/** Pure admission rule; refusals contain only closed codes and communication channels. */
export declare function decideEmailRecipient(facts: unknown): EmailRecipientDecision;
//# sourceMappingURL=email-recipient-policy.d.ts.map