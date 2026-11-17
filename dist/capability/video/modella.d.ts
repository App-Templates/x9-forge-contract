import { z } from 'zod';
/** The four angles of a fixed model's approved references (one per angle; the engine checks it). */
export declare const VIDEO_MODEL_REF_KINDS: readonly ["frontale", "tre_quarti", "profilo", "figura_intera"];
export declare const VideoModelRefKindSchema: z.ZodEnum<{
    frontale: "frontale";
    tre_quarti: "tre_quarti";
    profilo: "profilo";
    figura_intera: "figura_intera";
}>;
export type VideoModelRefKind = z.infer<typeof VideoModelRefKindSchema>;
/** Largest reference image the engine takes. */
export declare const VIDEO_MODEL_REF_MAX_BYTES: number;
export declare const VIDEO_MODEL_REF_MEDIA_TYPES: readonly ["image/png", "image/jpeg"];
export declare const VIDEO_MODEL_MAX_VERSIONS = 50;
export declare const VIDEO_MODEL_MAX_PER_AGENT = 200;
/** Id of a model: a slug, never a path. */
export declare const VideoModelIdSchema: z.ZodString;
export type VideoModelId = z.infer<typeof VideoModelIdSchema>;
export declare const VideoModelNameSchema: z.ZodString;
export type VideoModelName = z.infer<typeof VideoModelNameSchema>;
export declare const VideoModelVersionNumberSchema: z.ZodNumber;
export type VideoModelVersionNumber = z.infer<typeof VideoModelVersionNumberSchema>;
/** The same version number as a path piece. */
export declare const VideoModelVersionParamSchema: z.ZodString;
export type VideoModelVersionParam = z.infer<typeof VideoModelVersionParamSchema>;
export declare const VideoModelDescriptionSchema: z.ZodObject<{
    face: z.ZodString;
    body: z.ZodString;
    hair: z.ZodString;
}, z.core.$strict>;
export type VideoModelDescription = z.infer<typeof VideoModelDescriptionSchema>;
/** How the images were generated. The seed helps reproducibility; it is not a guarantee of identity. */
export declare const VideoModelGenerationSchema: z.ZodObject<{
    model: z.ZodString;
    seed: z.ZodNullable<z.ZodNumber>;
    parameters: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type VideoModelGeneration = z.infer<typeof VideoModelGenerationSchema>;
export declare const VideoModelRefSchema: z.ZodObject<{
    kind: z.ZodEnum<{
        frontale: "frontale";
        tre_quarti: "tre_quarti";
        profilo: "profilo";
        figura_intera: "figura_intera";
    }>;
    fileName: z.ZodString;
    sha256: z.ZodString;
    width: z.ZodNumber;
    height: z.ZodNumber;
    sizeBytes: z.ZodNumber;
}, z.core.$strict>;
export type VideoModelRef = z.infer<typeof VideoModelRefSchema>;
export declare const VideoModelVersionStatusSchema: z.ZodEnum<{
    bozza: "bozza";
    approvata: "approvata";
    sostituita: "sostituita";
}>;
export type VideoModelVersionStatus = z.infer<typeof VideoModelVersionStatusSchema>;
export declare const VideoModelVersionSchema: z.ZodObject<{
    version: z.ZodNumber;
    status: z.ZodEnum<{
        bozza: "bozza";
        approvata: "approvata";
        sostituita: "sostituita";
    }>;
    description: z.ZodObject<{
        face: z.ZodString;
        body: z.ZodString;
        hair: z.ZodString;
    }, z.core.$strict>;
    refs: z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            frontale: "frontale";
            tre_quarti: "tre_quarti";
            profilo: "profilo";
            figura_intera: "figura_intera";
        }>;
        fileName: z.ZodString;
        sha256: z.ZodString;
        width: z.ZodNumber;
        height: z.ZodNumber;
        sizeBytes: z.ZodNumber;
    }, z.core.$strict>>;
    generation: z.ZodObject<{
        model: z.ZodString;
        seed: z.ZodNullable<z.ZodNumber>;
        parameters: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    createdAt: z.ZodString;
    approvedAt: z.ZodNullable<z.ZodString>;
    digest: z.ZodString;
}, z.core.$strict>;
export type VideoModelVersion = z.infer<typeof VideoModelVersionSchema>;
export declare const VideoModelSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    versions: z.ZodArray<z.ZodObject<{
        version: z.ZodNumber;
        status: z.ZodEnum<{
            bozza: "bozza";
            approvata: "approvata";
            sostituita: "sostituita";
        }>;
        description: z.ZodObject<{
            face: z.ZodString;
            body: z.ZodString;
            hair: z.ZodString;
        }, z.core.$strict>;
        refs: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                frontale: "frontale";
                tre_quarti: "tre_quarti";
                profilo: "profilo";
                figura_intera: "figura_intera";
            }>;
            fileName: z.ZodString;
            sha256: z.ZodString;
            width: z.ZodNumber;
            height: z.ZodNumber;
            sizeBytes: z.ZodNumber;
        }, z.core.$strict>>;
        generation: z.ZodObject<{
            model: z.ZodString;
            seed: z.ZodNullable<z.ZodNumber>;
            parameters: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                value: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        createdAt: z.ZodString;
        approvedAt: z.ZodNullable<z.ZodString>;
        digest: z.ZodString;
    }, z.core.$strict>>;
    currentVersion: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>;
export type VideoModel = z.infer<typeof VideoModelSchema>;
export declare const VideoModelListSchema: z.ZodObject<{
    models: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        identity: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        versions: z.ZodArray<z.ZodObject<{
            version: z.ZodNumber;
            status: z.ZodEnum<{
                bozza: "bozza";
                approvata: "approvata";
                sostituita: "sostituita";
            }>;
            description: z.ZodObject<{
                face: z.ZodString;
                body: z.ZodString;
                hair: z.ZodString;
            }, z.core.$strict>;
            refs: z.ZodArray<z.ZodObject<{
                kind: z.ZodEnum<{
                    frontale: "frontale";
                    tre_quarti: "tre_quarti";
                    profilo: "profilo";
                    figura_intera: "figura_intera";
                }>;
                fileName: z.ZodString;
                sha256: z.ZodString;
                width: z.ZodNumber;
                height: z.ZodNumber;
                sizeBytes: z.ZodNumber;
            }, z.core.$strict>>;
            generation: z.ZodObject<{
                model: z.ZodString;
                seed: z.ZodNullable<z.ZodNumber>;
                parameters: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    value: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>;
            createdAt: z.ZodString;
            approvedAt: z.ZodNullable<z.ZodString>;
            digest: z.ZodString;
        }, z.core.$strict>>;
        currentVersion: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type VideoModelList = z.infer<typeof VideoModelListSchema>;
/** Query of the model routes: the identity only. */
export declare const VideoModelScopeQuerySchema: z.ZodObject<{
    agentId: z.ZodString;
    ownerId: z.ZodString;
    tenantId: z.ZodString;
}, z.core.$strict>;
export type VideoModelScopeQuery = z.infer<typeof VideoModelScopeQuerySchema>;
/** Query of the reference upload: the identity and the angle; the body is the image itself. */
export declare const VideoModelRefAddQuerySchema: z.ZodObject<{
    kind: z.ZodEnum<{
        frontale: "frontale";
        tre_quarti: "tre_quarti";
        profilo: "profilo";
        figura_intera: "figura_intera";
    }>;
    agentId: z.ZodString;
    ownerId: z.ZodString;
    tenantId: z.ZodString;
}, z.core.$strict>;
export type VideoModelRefAddQuery = z.infer<typeof VideoModelRefAddQuerySchema>;
export declare const VideoModelCreateRequestSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodObject<{
        face: z.ZodString;
        body: z.ZodString;
        hair: z.ZodString;
    }, z.core.$strict>;
    generation: z.ZodObject<{
        model: z.ZodString;
        seed: z.ZodNullable<z.ZodNumber>;
        parameters: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type VideoModelCreateRequest = z.infer<typeof VideoModelCreateRequestSchema>;
export declare const VideoModelVersionCreateRequestSchema: z.ZodObject<{
    description: z.ZodObject<{
        face: z.ZodString;
        body: z.ZodString;
        hair: z.ZodString;
    }, z.core.$strict>;
    generation: z.ZodObject<{
        model: z.ZodString;
        seed: z.ZodNullable<z.ZodNumber>;
        parameters: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type VideoModelVersionCreateRequest = z.infer<typeof VideoModelVersionCreateRequestSchema>;
/** One approves the version the person has seen: its digest. */
export declare const VideoModelApproveRequestSchema: z.ZodObject<{
    digest: z.ZodString;
}, z.core.$strict>;
export type VideoModelApproveRequest = z.infer<typeof VideoModelApproveRequestSchema>;
//# sourceMappingURL=modella.d.ts.map