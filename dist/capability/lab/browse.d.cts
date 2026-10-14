import { z } from 'zod';
export declare const LabPageListInputSchema: z.ZodObject<{
    scope: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        agentId: z.ZodString;
    }, z.core.$strict>;
    limit: z.ZodDefault<z.ZodNumber>;
    cursor: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type LabPageListInput = z.infer<typeof LabPageListInputSchema>;
export declare const LabPageListEntrySchema: z.ZodObject<{
    version: z.ZodNumber;
    kind: z.ZodString;
    title: z.ZodString;
    updatedAt: z.ZodISODateTime;
    slug: z.ZodString;
}, z.core.$strict>;
export type LabPageListEntry = z.infer<typeof LabPageListEntrySchema>;
export declare const LabPageListOutputSchema: z.ZodObject<{
    pages: z.ZodArray<z.ZodObject<{
        version: z.ZodNumber;
        kind: z.ZodString;
        title: z.ZodString;
        updatedAt: z.ZodISODateTime;
        slug: z.ZodString;
    }, z.core.$strict>>;
    nextCursor: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type LabPageListOutput = z.infer<typeof LabPageListOutputSchema>;
export declare const LabPageDetailInputSchema: z.ZodObject<{
    scope: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        agentId: z.ZodString;
    }, z.core.$strict>;
    slug: z.ZodString;
}, z.core.$strict>;
export type LabPageDetailInput = z.infer<typeof LabPageDetailInputSchema>;
export declare const LabPageDetailOutputSchema: z.ZodObject<{
    page: z.ZodObject<{
        agentId: z.ZodString;
        slug: z.ZodString;
        kind: z.ZodString;
        title: z.ZodString;
        body: z.ZodString;
        version: z.ZodNumber;
        updatedAt: z.ZodISODateTime;
    }, z.core.$strict>;
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
            dataset: "dataset";
            human: "human";
        }>;
    }, z.core.$strict>>;
    links: z.ZodArray<z.ZodObject<{
        from: z.ZodString;
        to: z.ZodString;
        kind: z.ZodString;
    }, z.core.$strict>>;
    sources: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        agentId: z.ZodString;
        url: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        fetchedAt: z.ZodISODateTime;
        contentSha256: z.ZodString;
        origin: z.ZodEnum<{
            web: "web";
            dataset: "dataset";
            human: "human";
        }>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type LabPageDetailOutput = z.infer<typeof LabPageDetailOutputSchema>;
export declare const LabExportFormatSchema: z.ZodEnum<{
    json: "json";
    markdown: "markdown";
}>;
export type LabExportFormat = z.infer<typeof LabExportFormatSchema>;
export declare const LabExportRequestSchema: z.ZodObject<{
    scope: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        agentId: z.ZodString;
    }, z.core.$strict>;
    format: z.ZodEnum<{
        json: "json";
        markdown: "markdown";
    }>;
}, z.core.$strict>;
export type LabExportRequest = z.infer<typeof LabExportRequestSchema>;
export declare const LabExportResultSchema: z.ZodObject<{
    filename: z.ZodString;
    bytes: z.ZodNumber;
    generatedFrom: z.ZodNumber;
}, z.core.$strict>;
export type LabExportResult = z.infer<typeof LabExportResultSchema>;
/** Canonical failure for browse/detail/export: reuses the tool error codes. */
export declare const LabBrowseErrorSchema: z.ZodObject<{
    error: z.ZodEnum<{
        invalid_request: "invalid_request";
        not_found: "not_found";
        not_configured: "not_configured";
        not_ready: "not_ready";
    }>;
}, z.core.$strict>;
export type LabBrowseError = z.infer<typeof LabBrowseErrorSchema>;
//# sourceMappingURL=browse.d.ts.map