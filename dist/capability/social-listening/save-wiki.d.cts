import { z } from 'zod';
import { type LabIngestInput } from "../lab/tools.cjs";
import type { SocialTopicGetOutput } from "./tools.cjs";
/**
 * "Salva nella wiki": from a topic to the request of `lab_ingest`, only with the explicit yes of the owner (D15).
 *
 * The service accepts this tool only from a call of the owner (Forge page or a message of the owner), never from an
 * automatic round. Identity never comes from the input (R-33); the service calls cap-lab with the same envelope.
 */
export declare const SOCIAL_TOPIC_WIKI_TOOLS: {
    readonly save: "social_topic_save_wiki";
};
export declare const SocialTopicSaveWikiInputSchema: z.ZodObject<{
    topicId: z.ZodString;
    ownerConfirmed: z.ZodLiteral<true>;
}, z.core.$strict>;
export type SocialTopicSaveWikiInput = z.infer<typeof SocialTopicSaveWikiInputSchema>;
export declare const SocialTopicSaveWikiOutputSchema: z.ZodObject<{
    topicId: z.ZodString;
    ingestId: z.ZodUUID;
    state: z.ZodLiteral<"queued">;
}, z.core.$strict>;
export type SocialTopicSaveWikiOutput = z.infer<typeof SocialTopicSaveWikiOutputSchema>;
export declare const SocialTopicWikiToolErrorSchema: z.ZodEnum<{
    invalid_request: "invalid_request";
    not_configured: "not_configured";
    unknown_topic: "unknown_topic";
    nothing_to_save: "nothing_to_save";
    lab_not_enabled: "lab_not_enabled";
}>;
export type SocialTopicWikiToolError = z.infer<typeof SocialTopicWikiToolErrorSchema>;
export type SocialTopicLabIngestResult = {
    ok: true;
    input: LabIngestInput;
} | {
    ok: false;
    error: 'nothing_to_save';
};
/**
 * The request of `lab_ingest`, validated with cap-lab's own schema. With an extended research the research itself is
 * passed (richer); otherwise the verified facts become a synthetic result with id `social:<topicId>`.
 */
export declare function socialTopicLabIngestInput(topic: SocialTopicGetOutput, agentId: string): SocialTopicLabIngestResult;
//# sourceMappingURL=save-wiki.d.ts.map