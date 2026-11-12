import { z } from 'zod';
/**
 * The tools of cap-lab (v1.29.0, Phase 54), called at `capToolCallPath(LAB_TOOLS.<tool>)`. The wiki is the one of
 * the agent of the tool call envelope.
 * `lab_ingest` takes a cap-ricerca result, its `researchId` (the service reads it from cap-ricerca), or a document.
 */
export declare const LAB_TOOLS: {
    /** Queue a cap-ricerca result, its `researchId` (read by the service), or a document for digestion. */
    readonly ingest: "lab_ingest";
    /** State of a queued ingest, with final counts when completed. */
    readonly ingestStatus: "lab_ingest_status";
    /** Withdraw a document's sources and rewrite the affected wiki pages. */
    readonly withdraw: "lab_withdraw";
    /** Ask the wiki: the pages and claims that answer. */
    readonly query: "lab_query";
    /** The open gaps: the next questions for research. */
    readonly gaps: "lab_gaps";
    /** The competence graph with levels and scores. */
    readonly competence: "lab_competence";
    /** Publish a versioned page for a client or project. */
    readonly publish: "lab_publish";
    /** Read pages published for a client or project. */
    readonly readPublished: "lab_read_published";
    /** Compare brief topics with published knowledge before researching. */
    readonly briefGaps: "lab_brief_gaps";
};
export type LabToolName = (typeof LAB_TOOLS)[keyof typeof LAB_TOOLS];
/** Why a lab tool call failed, as the bridge tool-call error text. */
export declare const LabToolErrorSchema: z.ZodEnum<{
    invalid_request: "invalid_request";
    not_found: "not_found";
    not_configured: "not_configured";
    not_ready: "not_ready";
}>;
export type LabToolError = z.infer<typeof LabToolErrorSchema>;
export declare const LabIngestIdSchema: z.ZodUUID;
export type LabIngestId = z.infer<typeof LabIngestIdSchema>;
/** Document provenance with optional excerpts; otherwise the lab reads and converts the asset from company memory. */
export declare const LabIngestDocumentSchema: z.ZodObject<{
    asset: z.ZodObject<{
        assetId: z.ZodString;
        sha256: z.ZodString;
        name: z.ZodString;
        mediaType: z.ZodString;
        sizeBytes: z.ZodNumber;
        origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"email">;
            messageId: z.ZodString;
            attachmentName: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"archive">;
            archiveSha256: z.ZodString;
            entryPath: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"session">;
            sessionId: z.ZodString;
            repo: z.ZodOptional<z.ZodString>;
            commit: z.ZodOptional<z.ZodString>;
            path: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"link">;
            url: z.ZodURL;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"generated">;
            agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            sourceAssetIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>], "kind">;
        tenantId: z.ZodString;
        companyId: z.ZodString;
        projectId: z.ZodString;
        assetType: z.ZodOptional<z.ZodString>;
        buSlug: z.ZodOptional<z.ZodString>;
        providedBy: z.ZodOptional<z.ZodObject<{
            personRef: z.ZodString;
        }, z.core.$strict>>;
        createdAt: z.ZodISODateTime;
    }, z.core.$strict>;
    title: z.ZodString;
    excerpts: z.ZodOptional<z.ZodArray<z.ZodString>>;
    /** Previous document asset replaced and withdrawn by this version. */
    supersedes: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const LabWithdrawInputSchema: z.ZodObject<{
    assetId: z.ZodString;
    reason: z.ZodString;
}, z.core.$strict>;
export type LabWithdrawInput = z.infer<typeof LabWithdrawInputSchema>;
export declare const LabWithdrawOutputSchema: z.ZodObject<{
    assetId: z.ZodString;
    sourcesWithdrawn: z.ZodInt;
    pagesRewritten: z.ZodInt;
    withdrawnAt: z.ZodISODateTime;
}, z.core.$strict>;
export type LabWithdrawOutput = z.infer<typeof LabWithdrawOutputSchema>;
export declare const LabIngestInputSchema: z.ZodUnion<readonly [z.ZodObject<{
    result: z.ZodObject<{
        researchId: z.ZodString;
        agentId: z.ZodString;
        state: z.ZodEnum<{
            failed: "failed";
            budget_exhausted: "budget_exhausted";
            completed: "completed";
            queued: "queued";
            running: "running";
        }>;
        question: z.ZodString;
        parentResearchId: z.ZodOptional<z.ZodString>;
        findings: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            sourceUrls: z.ZodArray<z.ZodString>;
            origin: z.ZodLiteral<"web">;
        }, z.core.$strict>>;
        newQuestions: z.ZodArray<z.ZodString>;
        sources: z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
            opened: z.ZodBoolean;
        }, z.core.$strict>>;
        cost: z.ZodObject<{
            usd: z.ZodNumber;
            inputTokens: z.ZodNumber;
            outputTokens: z.ZodNumber;
            webCalls: z.ZodNumber;
            uncertain: z.ZodBoolean;
        }, z.core.$strict>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    document: z.ZodObject<{
        asset: z.ZodObject<{
            assetId: z.ZodString;
            sha256: z.ZodString;
            name: z.ZodString;
            mediaType: z.ZodString;
            sizeBytes: z.ZodNumber;
            origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"email">;
                messageId: z.ZodString;
                attachmentName: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"archive">;
                archiveSha256: z.ZodString;
                entryPath: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"session">;
                sessionId: z.ZodString;
                repo: z.ZodOptional<z.ZodString>;
                commit: z.ZodOptional<z.ZodString>;
                path: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"link">;
                url: z.ZodURL;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"generated">;
                agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                sourceAssetIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>], "kind">;
            tenantId: z.ZodString;
            companyId: z.ZodString;
            projectId: z.ZodString;
            assetType: z.ZodOptional<z.ZodString>;
            buSlug: z.ZodOptional<z.ZodString>;
            providedBy: z.ZodOptional<z.ZodObject<{
                personRef: z.ZodString;
            }, z.core.$strict>>;
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>;
        title: z.ZodString;
        excerpts: z.ZodOptional<z.ZodArray<z.ZodString>>;
        /** Previous document asset replaced and withdrawn by this version. */
        supersedes: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    researchId: z.ZodString;
}, z.core.$strict>]>;
export declare const LabIngestOutputSchema: z.ZodObject<{
    ingestId: z.ZodUUID;
    state: z.ZodLiteral<"queued">;
}, z.core.$strict>;
export declare const LabIngestStatusInputSchema: z.ZodObject<{
    ingestId: z.ZodUUID;
}, z.core.$strict>;
export declare const LabIngestStatusOutputSchema: z.ZodObject<{
    ingestId: z.ZodUUID;
    state: z.ZodEnum<{
        failed: "failed";
        budget_exhausted: "budget_exhausted";
        completed: "completed";
        queued: "queued";
        running: "running";
    }>;
    sourcesStored: z.ZodOptional<z.ZodNumber>;
    pagesTouched: z.ZodOptional<z.ZodNumber>;
    claimsAdded: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
/** How a page was found: by its page name, with all the words, or with at least one word. */
export declare const LAB_PAGE_MATCH_KINDS: readonly ["slug", "all_words", "any_word"];
export declare const LabPageMatchSchema: z.ZodObject<{
    slug: z.ZodString;
    matchedBy: z.ZodEnum<{
        slug: "slug";
        all_words: "all_words";
        any_word: "any_word";
    }>;
}, z.core.$strict>;
/** Why an answer has no pages. */
export declare const LAB_EMPTY_REASONS: readonly ["no_match", "slug_not_found", "notebook_empty"];
export declare const LabEmptyReasonSchema: z.ZodEnum<{
    no_match: "no_match";
    slug_not_found: "slug_not_found";
    notebook_empty: "notebook_empty";
}>;
export type LabPageMatchKind = (typeof LAB_PAGE_MATCH_KINDS)[number];
export type LabPageMatch = z.infer<typeof LabPageMatchSchema>;
export type LabEmptyReason = z.infer<typeof LabEmptyReasonSchema>;
export declare const LabQueryInputSchema: z.ZodObject<{
    question: z.ZodString;
    limit: z.ZodOptional<z.ZodNumber>;
    slugs: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export declare const LabQueryOutputSchema: z.ZodObject<{
    pages: z.ZodArray<z.ZodObject<{
        agentId: z.ZodString;
        slug: z.ZodString;
        kind: z.ZodString;
        title: z.ZodString;
        body: z.ZodString;
        version: z.ZodNumber;
        updatedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
    claims: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        pageSlug: z.ZodString;
        text: z.ZodString;
        sourceIds: z.ZodArray<z.ZodString>;
        status: z.ZodEnum<{
            aperta: "aperta";
            confermata: "confermata";
            contraddetta: "contraddetta";
            scartata: "scartata";
        }>;
        origin: z.ZodEnum<{
            web: "web";
            model: "model";
            dataset: "dataset";
            human: "human";
        }>;
        quotes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            sourceId: z.ZodString;
            text: z.ZodString;
        }, z.core.$strict>>>;
    }, z.core.$strict>>;
    matches: z.ZodOptional<z.ZodArray<z.ZodObject<{
        slug: z.ZodString;
        matchedBy: z.ZodEnum<{
            slug: "slug";
            all_words: "all_words";
            any_word: "any_word";
        }>;
    }, z.core.$strict>>>;
    emptyReason: z.ZodOptional<z.ZodEnum<{
        no_match: "no_match";
        slug_not_found: "slug_not_found";
        notebook_empty: "notebook_empty";
    }>>;
}, z.core.$strict>;
export declare const LabGapsInputSchema: z.ZodObject<{
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const LabGapsOutputSchema: z.ZodObject<{
    gaps: z.ZodArray<z.ZodObject<{
        agentId: z.ZodString;
        question: z.ZodString;
        nodeId: z.ZodOptional<z.ZodString>;
        reason: z.ZodEnum<{
            non_so: "non_so";
            fonte_unica: "fonte_unica";
            contraddizione: "contraddizione";
            prerequisito_mancante: "prerequisito_mancante";
        }>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const LabCompetenceInputSchema: z.ZodObject<{}, z.core.$strict>;
export declare const LabCompetenceOutputSchema: z.ZodObject<{
    nodes: z.ZodArray<z.ZodObject<{
        nodeId: z.ZodString;
        label: z.ZodString;
        parentId: z.ZodOptional<z.ZodString>;
        requires: z.ZodArray<z.ZodString>;
        level: z.ZodNumber;
        score: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
/** Publication recipients always identify the client company explicitly. */
export declare const LabPublicationRecipientSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"client">;
    clientId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"project">;
    clientId: z.ZodString;
    projectId: z.ZodString;
}, z.core.$strict>], "kind">;
export declare const LabPublishInputSchema: z.ZodObject<{
    slug: z.ZodString;
    version: z.ZodOptional<z.ZodNumber>;
    recipient: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"client">;
        clientId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"project">;
        clientId: z.ZodString;
        projectId: z.ZodString;
    }, z.core.$strict>], "kind">;
    contradicts: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
        target: z.ZodLiteral<"decision">;
        requestId: z.ZodString;
        planVersion: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        target: z.ZodLiteral<"map_entry">;
        kind: z.ZodEnum<{
            access: "access";
            referent: "referent";
            person: "person";
            responsibility: "responsibility";
            asset: "asset";
        }>;
        key: z.ZodString;
        version: z.ZodNumber;
    }, z.core.$strict>], "target">]>>>;
}, z.core.$strict>;
export declare const LabPublishOutputSchema: z.ZodObject<{
    slug: z.ZodString;
    version: z.ZodNumber;
    digest: z.ZodString;
    recipient: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"client">;
        clientId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"project">;
        clientId: z.ZodString;
        projectId: z.ZodString;
    }, z.core.$strict>], "kind">;
    publishedAt: z.ZodISODateTime;
}, z.core.$strict>;
export declare const LabReadPublishedInputSchema: z.ZodObject<{
    recipient: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"client">;
        clientId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"project">;
        clientId: z.ZodString;
        projectId: z.ZodString;
    }, z.core.$strict>], "kind">;
    query: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
    slugs: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export declare const LabReadPublishedOutputSchema: z.ZodObject<{
    pages: z.ZodArray<z.ZodObject<{
        slug: z.ZodString;
        version: z.ZodNumber;
        digest: z.ZodString;
        title: z.ZodString;
        content: z.ZodString;
        contradicts: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
            target: z.ZodLiteral<"decision">;
            requestId: z.ZodString;
            planVersion: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            target: z.ZodLiteral<"map_entry">;
            kind: z.ZodEnum<{
                access: "access";
                referent: "referent";
                person: "person";
                responsibility: "responsibility";
                asset: "asset";
            }>;
            key: z.ZodString;
            version: z.ZodNumber;
        }, z.core.$strict>], "target">]>>>;
    }, z.core.$strict>>;
    matches: z.ZodOptional<z.ZodArray<z.ZodObject<{
        slug: z.ZodString;
        matchedBy: z.ZodEnum<{
            slug: "slug";
            all_words: "all_words";
            any_word: "any_word";
        }>;
    }, z.core.$strict>>>;
    emptyReason: z.ZodOptional<z.ZodEnum<{
        no_match: "no_match";
        slug_not_found: "slug_not_found";
        notebook_empty: "notebook_empty";
    }>>;
}, z.core.$strict>;
export declare const LabBriefGapsInputSchema: z.ZodObject<{
    topics: z.ZodArray<z.ZodString>;
    clientId: z.ZodString;
    projectId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const LabBriefGapsOutputSchema: z.ZodObject<{
    gapsRef: z.ZodString;
    hasContext: z.ZodBoolean;
    covered: z.ZodArray<z.ZodObject<{
        slug: z.ZodString;
        version: z.ZodNumber;
    }, z.core.$strict>>;
    gaps: z.ZodArray<z.ZodObject<{
        topic: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type LabPublicationRecipient = z.infer<typeof LabPublicationRecipientSchema>;
export type LabPublishInput = z.infer<typeof LabPublishInputSchema>;
export type LabPublishOutput = z.infer<typeof LabPublishOutputSchema>;
export type LabReadPublishedInput = z.infer<typeof LabReadPublishedInputSchema>;
export type LabReadPublishedOutput = z.infer<typeof LabReadPublishedOutputSchema>;
export type LabBriefGapsInput = z.infer<typeof LabBriefGapsInputSchema>;
export type LabBriefGapsOutput = z.infer<typeof LabBriefGapsOutputSchema>;
export type LabIngestInput = z.infer<typeof LabIngestInputSchema>;
export type LabIngestOutput = z.infer<typeof LabIngestOutputSchema>;
export type LabQueryInput = z.infer<typeof LabQueryInputSchema>;
export type LabQueryOutput = z.infer<typeof LabQueryOutputSchema>;
export type LabGapsInput = z.infer<typeof LabGapsInputSchema>;
export type LabGapsOutput = z.infer<typeof LabGapsOutputSchema>;
export type LabCompetenceInput = z.infer<typeof LabCompetenceInputSchema>;
export type LabCompetenceOutput = z.infer<typeof LabCompetenceOutputSchema>;
export type LabIngestStatusInput = z.infer<typeof LabIngestStatusInputSchema>;
export type LabIngestStatusOutput = z.infer<typeof LabIngestStatusOutputSchema>;
/** Worker-owned paid execution, deliberately excluded from model-visible LAB_TOOLS. */
export declare const LAB_INTERNAL_TOOLS: {
    readonly execute: "lab_execute";
};
/** Receiver validates the current full-scope SQL claim and its unexpired lease before effects. */
export declare const LabExecuteInputSchema: z.ZodObject<{
    jobId: z.ZodUUID;
    leaseToken: z.ZodUUID;
}, z.core.$strict>;
export declare const LabExecuteOutputSchema: z.ZodObject<{
    jobId: z.ZodUUID;
    state: z.ZodEnum<{
        failed: "failed";
        budget_exhausted: "budget_exhausted";
        completed: "completed";
        queued: "queued";
        running: "running";
    }>;
}, z.core.$strict>;
export type LabExecuteInput = z.infer<typeof LabExecuteInputSchema>;
export type LabExecuteOutput = z.infer<typeof LabExecuteOutputSchema>;
//# sourceMappingURL=tools.d.ts.map