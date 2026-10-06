import { z } from 'zod';
export declare const CapabilityFeedbackSourceKindSchema: z.ZodEnum<{
    project_view: "project_view";
    domain_app: "domain_app";
}>;
export declare const CapabilityFeedbackSourceSchema: z.ZodObject<{
    kind: z.ZodEnum<{
        project_view: "project_view";
        domain_app: "domain_app";
    }>;
    id: z.ZodString;
}, z.core.$strict>;
export declare const CapabilityOutputKindSchema: z.ZodObject<{
    key: z.ZodString;
    label: z.ZodString;
    description: z.ZodString;
}, z.core.$strict>;
export declare const CapabilityOutputFieldSchema: z.ZodObject<{
    key: z.ZodString;
    label: z.ZodString;
    type: z.ZodEnum<{
        number: "number";
        boolean: "boolean";
        text: "text";
        json: "json";
    }>;
}, z.core.$strict>;
export declare const CapabilityTrendMetricSchema: z.ZodObject<{
    key: z.ZodString;
    label: z.ZodString;
    unit: z.ZodString;
}, z.core.$strict>;
export declare const CapabilityOutputsDeclarationSchema: z.ZodObject<{
    label: z.ZodString;
    kinds: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        label: z.ZodString;
        description: z.ZodString;
    }, z.core.$strict>>;
    fields: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        label: z.ZodString;
        type: z.ZodEnum<{
            number: "number";
            boolean: "boolean";
            text: "text";
            json: "json";
        }>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const CapabilityFeedbackDeclarationSchema: z.ZodObject<{
    label: z.ZodString;
    kind: z.ZodLiteral<"rating">;
    sources: z.ZodArray<z.ZodEnum<{
        project_view: "project_view";
        domain_app: "domain_app";
    }>>;
}, z.core.$strict>;
export declare const CapabilityPresentationDeclarationSchema: z.ZodObject<{
    outputs: z.ZodOptional<z.ZodObject<{
        label: z.ZodString;
        kinds: z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            label: z.ZodString;
            description: z.ZodString;
        }, z.core.$strict>>;
        fields: z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            label: z.ZodString;
            type: z.ZodEnum<{
                number: "number";
                boolean: "boolean";
                text: "text";
                json: "json";
            }>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    feedback: z.ZodOptional<z.ZodObject<{
        label: z.ZodString;
        kind: z.ZodLiteral<"rating">;
        sources: z.ZodArray<z.ZodEnum<{
            project_view: "project_view";
            domain_app: "domain_app";
        }>>;
    }, z.core.$strict>>;
    trends: z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        label: z.ZodString;
        unit: z.ZodString;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export type CapabilityPresentationDeclaration = z.infer<typeof CapabilityPresentationDeclarationSchema>;
export declare const CapabilityOutputSchema: z.ZodObject<{
    id: z.ZodString;
    kind: z.ZodString;
    title: z.ZodString;
    summary: z.ZodString;
    createdAt: z.ZodISODateTime;
    content: z.ZodRecord<z.ZodString, z.ZodJSONSchema>;
    agentId: z.ZodString;
    capability: z.ZodString;
}, z.core.$strict>;
export type CapabilityOutput = z.infer<typeof CapabilityOutputSchema>;
export declare const CapabilityFeedbackSchema: z.ZodObject<{
    id: z.ZodString;
    outputId: z.ZodString;
    source: z.ZodObject<{
        kind: z.ZodEnum<{
            project_view: "project_view";
            domain_app: "domain_app";
        }>;
        id: z.ZodString;
    }, z.core.$strict>;
    reviewerId: z.ZodString;
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodISODateTime;
    agentId: z.ZodString;
    capability: z.ZodString;
}, z.core.$strict>;
export type CapabilityFeedback = z.infer<typeof CapabilityFeedbackSchema>;
export declare const CapabilityTrendPointSchema: z.ZodObject<{
    day: z.ZodString;
    value: z.ZodNumber;
}, z.core.$strict>;
export declare const CapabilityTrendSeriesSchema: z.ZodObject<{
    metric: z.ZodObject<{
        key: z.ZodString;
        label: z.ZodString;
        unit: z.ZodString;
    }, z.core.$strict>;
    points: z.ZodArray<z.ZodObject<{
        day: z.ZodString;
        value: z.ZodNumber;
    }, z.core.$strict>>;
    agentId: z.ZodString;
    capability: z.ZodString;
}, z.core.$strict>;
export type CapabilityTrendSeries = z.infer<typeof CapabilityTrendSeriesSchema>;
/** Collections reject cross-agent/capability records before they reach a consumer. */
export declare const CapabilityOutputsSchema: z.ZodObject<{
    outputs: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        kind: z.ZodString;
        title: z.ZodString;
        summary: z.ZodString;
        createdAt: z.ZodISODateTime;
        content: z.ZodRecord<z.ZodString, z.ZodJSONSchema>;
        agentId: z.ZodString;
        capability: z.ZodString;
    }, z.core.$strict>>;
    agentId: z.ZodString;
    capability: z.ZodString;
}, z.core.$strict>;
export declare const CapabilityFeedbackListSchema: z.ZodObject<{
    feedback: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        outputId: z.ZodString;
        source: z.ZodObject<{
            kind: z.ZodEnum<{
                project_view: "project_view";
                domain_app: "domain_app";
            }>;
            id: z.ZodString;
        }, z.core.$strict>;
        reviewerId: z.ZodString;
        rating: z.ZodNumber;
        comment: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodISODateTime;
        agentId: z.ZodString;
        capability: z.ZodString;
    }, z.core.$strict>>;
    agentId: z.ZodString;
    capability: z.ZodString;
}, z.core.$strict>;
export declare const CapabilityTrendsSchema: z.ZodObject<{
    series: z.ZodArray<z.ZodObject<{
        metric: z.ZodObject<{
            key: z.ZodString;
            label: z.ZodString;
            unit: z.ZodString;
        }, z.core.$strict>;
        points: z.ZodArray<z.ZodObject<{
            day: z.ZodString;
            value: z.ZodNumber;
        }, z.core.$strict>>;
        agentId: z.ZodString;
        capability: z.ZodString;
    }, z.core.$strict>>;
    agentId: z.ZodString;
    capability: z.ZodString;
}, z.core.$strict>;
export type CapabilityOutputs = z.infer<typeof CapabilityOutputsSchema>;
export type CapabilityFeedbackList = z.infer<typeof CapabilityFeedbackListSchema>;
export type CapabilityTrends = z.infer<typeof CapabilityTrendsSchema>;
export type CapabilityFeedbackSource = z.infer<typeof CapabilityFeedbackSourceSchema>;
export type CapabilityOutputKind = z.infer<typeof CapabilityOutputKindSchema>;
export type CapabilityOutputField = z.infer<typeof CapabilityOutputFieldSchema>;
export type CapabilityTrendMetric = z.infer<typeof CapabilityTrendMetricSchema>;
export type CapabilityOutputsDeclaration = z.infer<typeof CapabilityOutputsDeclarationSchema>;
export type CapabilityFeedbackDeclaration = z.infer<typeof CapabilityFeedbackDeclarationSchema>;
export type CapabilityTrendPoint = z.infer<typeof CapabilityTrendPointSchema>;
export type CapabilityFeedbackSourceKind = z.infer<typeof CapabilityFeedbackSourceKindSchema>;
//# sourceMappingURL=presentation.d.ts.map