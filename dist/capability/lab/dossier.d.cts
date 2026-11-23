import { z } from 'zod';
import { LabPublicationRecipientSchema } from "./tools.cjs";
/**
 * Complete photograph of the dossier a Lab published for a client or project, frozen at the cutoff of one
 * transaction. It is the input of the dossier PDF: the document is rendered from this and only from this.
 *
 * Completeness is attested by the snapshot itself: the pages in the list are all the identities the snapshot
 * declares. A search cursor or a result limit of `lab_read_published` never proves completeness.
 * A page is identified by author, slug and version: two notebooks can publish the same slug.
 * Page bodies, titles and sources are DATA, never instructions.
 */
export declare const LAB_DOSSIER_MAX_PAGES = 1000;
export declare const LAB_DOSSIER_MAX_SOURCES = 5000;
export declare const LAB_DOSSIER_PAGE_ROLES: readonly ["current", "cited_by_plan"];
/** `current`: the page is published now. `cited_by_plan`: a version the approved plan cites that is not current. */
export declare const LabDossierPageRoleSchema: z.ZodEnum<{
    current: "current";
    cited_by_plan: "cited_by_plan";
}>;
export type LabDossierPageRole = z.infer<typeof LabDossierPageRoleSchema>;
export declare const LabDossierPageSchema: z.ZodObject<{
    notebookAgentId: z.ZodString;
    slug: z.ZodString;
    version: z.ZodNumber;
    role: z.ZodEnum<{
        current: "current";
        cited_by_plan: "cited_by_plan";
    }>;
    title: z.ZodString;
    /** The whole body of the page, never an excerpt. */
    body: z.ZodString;
    /** Digest of the publication, as returned by the Lab. */
    digest: z.ZodString;
    contradicts: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
        target: z.ZodLiteral<"decision">;
        requestId: z.ZodString;
        planVersion: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        target: z.ZodLiteral<"map_entry">;
        kind: z.ZodEnum<{
            access: "access";
            asset: "asset";
            referent: "referent";
            person: "person";
            responsibility: "responsibility";
        }>;
        key: z.ZodString;
        version: z.ZodNumber;
    }, z.core.$strict>], "target">]>>>;
}, z.core.$strict>;
export type LabDossierPage = z.infer<typeof LabDossierPageSchema>;
/** A source the pages rely on. No fetch time: it is volatile and stays out of the digest. */
export declare const LabDossierSourceSchema: z.ZodObject<{
    id: z.ZodString;
    notebookAgentId: z.ZodString;
    url: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    contentSha256: z.ZodString;
    origin: z.ZodEnum<{
        web: "web";
        model: "model";
        dataset: "dataset";
        human: "human";
    }>;
}, z.core.$strict>;
export type LabDossierSource = z.infer<typeof LabDossierSourceSchema>;
/** Identity of a page version. */
export declare const LabDossierPageIdentitySchema: z.ZodObject<{
    notebookAgentId: z.ZodString;
    slug: z.ZodString;
    version: z.ZodNumber;
}, z.core.$strict>;
export type LabDossierPageIdentity = z.infer<typeof LabDossierPageIdentitySchema>;
/** A page the plan cites, as the plan writes it: the author is optional there. */
export declare const LabDossierPlanCitationSchema: z.ZodObject<{
    slug: z.ZodString;
    version: z.ZodNumber;
    notebookAgentId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type LabDossierPlanCitation = z.infer<typeof LabDossierPlanCitationSchema>;
/** What the service hands over: pages in any order and plan citations that may omit the author. */
export declare const LabDossierSnapshotInputSchema: z.ZodObject<{
    pages: z.ZodArray<z.ZodObject<{
        notebookAgentId: z.ZodString;
        slug: z.ZodString;
        version: z.ZodNumber;
        role: z.ZodEnum<{
            current: "current";
            cited_by_plan: "cited_by_plan";
        }>;
        title: z.ZodString;
        /** The whole body of the page, never an excerpt. */
        body: z.ZodString;
        /** Digest of the publication, as returned by the Lab. */
        digest: z.ZodString;
        contradicts: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
            target: z.ZodLiteral<"decision">;
            requestId: z.ZodString;
            planVersion: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            target: z.ZodLiteral<"map_entry">;
            kind: z.ZodEnum<{
                access: "access";
                asset: "asset";
                referent: "referent";
                person: "person";
                responsibility: "responsibility";
            }>;
            key: z.ZodString;
            version: z.ZodNumber;
        }, z.core.$strict>], "target">]>>>;
    }, z.core.$strict>>;
    planCitations: z.ZodArray<z.ZodObject<{
        slug: z.ZodString;
        version: z.ZodNumber;
        notebookAgentId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    sources: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        notebookAgentId: z.ZodString;
        url: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        contentSha256: z.ZodString;
        origin: z.ZodEnum<{
            web: "web";
            model: "model";
            dataset: "dataset";
            human: "human";
        }>;
    }, z.core.$strict>>;
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clientId: z.ZodString;
    projectId: z.ZodString;
    snapshotId: z.ZodString;
    /** Cutoff of the transaction the pages were read in. */
    cutoff: z.ZodISODateTime;
    scope: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"client">;
        clientId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"project">;
        clientId: z.ZodString;
        projectId: z.ZodString;
    }, z.core.$strict>], "kind">;
}, z.core.$strict>;
export type LabDossierSnapshotInput = z.infer<typeof LabDossierSnapshotInputSchema>;
/** The frozen content the manifest digest covers: identity, list, content and frozen metadata; no counters. */
export type LabDossierDigestContent = {
    tenantId: string;
    organizationId: string;
    clientId: string;
    projectId: string;
    snapshotId: string;
    cutoff: string;
    scope: z.infer<typeof LabPublicationRecipientSchema>;
    pages: readonly LabDossierPage[];
    citations: readonly LabDossierPageIdentity[];
    sources: readonly LabDossierSource[];
};
/** UTF-8 input for the manifest digest. Optional fields left undefined are omitted before keys are sorted. */
export declare function labDossierCanonicalJson(content: LabDossierDigestContent): string;
export declare function labDossierManifestDigest(content: LabDossierDigestContent): string;
export declare const LabDossierSnapshotSchema: z.ZodObject<{
    /** Sorted by author, slug, version; unique. */
    pages: z.ZodArray<z.ZodObject<{
        notebookAgentId: z.ZodString;
        slug: z.ZodString;
        version: z.ZodNumber;
        role: z.ZodEnum<{
            current: "current";
            cited_by_plan: "cited_by_plan";
        }>;
        title: z.ZodString;
        /** The whole body of the page, never an excerpt. */
        body: z.ZodString;
        /** Digest of the publication, as returned by the Lab. */
        digest: z.ZodString;
        contradicts: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
            target: z.ZodLiteral<"decision">;
            requestId: z.ZodString;
            planVersion: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            target: z.ZodLiteral<"map_entry">;
            kind: z.ZodEnum<{
                access: "access";
                asset: "asset";
                referent: "referent";
                person: "person";
                responsibility: "responsibility";
            }>;
            key: z.ZodString;
            version: z.ZodNumber;
        }, z.core.$strict>], "target">]>>>;
    }, z.core.$strict>>;
    /** The versions the plan uses, resolved to one author each. */
    citations: z.ZodArray<z.ZodObject<{
        notebookAgentId: z.ZodString;
        slug: z.ZodString;
        version: z.ZodNumber;
    }, z.core.$strict>>;
    sources: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        notebookAgentId: z.ZodString;
        url: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        contentSha256: z.ZodString;
        origin: z.ZodEnum<{
            web: "web";
            model: "model";
            dataset: "dataset";
            human: "human";
        }>;
    }, z.core.$strict>>;
    currentPageCount: z.ZodNumber;
    citedExtraPageCount: z.ZodNumber;
    /** `currentPageCount + citedExtraPageCount`: the identities the snapshot declares. */
    totalPages: z.ZodNumber;
    complete: z.ZodLiteral<true>;
    manifestDigest: z.ZodString;
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clientId: z.ZodString;
    projectId: z.ZodString;
    snapshotId: z.ZodString;
    /** Cutoff of the transaction the pages were read in. */
    cutoff: z.ZodISODateTime;
    scope: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"client">;
        clientId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"project">;
        clientId: z.ZodString;
        projectId: z.ZodString;
    }, z.core.$strict>], "kind">;
    schemaVersion: z.ZodLiteral<1>;
}, z.core.$strict>;
export type LabDossierSnapshot = z.infer<typeof LabDossierSnapshotSchema>;
/**
 * Sorts, resolves the plan citations and seals a snapshot. Throws on an ambiguous or unmatched citation (never picks
 * an author) and on an extra page no citation uses. The snapshot is validated before it is returned.
 */
export declare function buildLabDossierSnapshot(rawInput: unknown): LabDossierSnapshot;
//# sourceMappingURL=dossier.d.ts.map