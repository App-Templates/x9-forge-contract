import { z } from 'zod';
export declare const VIDEO_ENVIRONMENT_KINDS: readonly ["studio", "esterno", "documentario"];
export declare const VIDEO_ENVIRONMENT_MAX_ANGLES = 10;
export declare const VIDEO_ENVIRONMENT_MAX_VERSIONS = 50;
export declare const VIDEO_ENVIRONMENT_MAX_PER_AGENT = 200;
export declare const VideoEnvironmentIdSchema: z.ZodString;
export type VideoEnvironmentId = z.infer<typeof VideoEnvironmentIdSchema>;
export declare const VideoEnvironmentKindSchema: z.ZodEnum<{
    studio: "studio";
    esterno: "esterno";
    documentario: "documentario";
}>;
export type VideoEnvironmentKind = z.infer<typeof VideoEnvironmentKindSchema>;
export declare const VideoEnvironmentNameSchema: z.ZodString;
export type VideoEnvironmentName = z.infer<typeof VideoEnvironmentNameSchema>;
export declare const VideoEnvironmentVersionNumberSchema: z.ZodNumber;
export type VideoEnvironmentVersionNumber = z.infer<typeof VideoEnvironmentVersionNumberSchema>;
/** Version number as a path segment. The engine checks the version range. */
export declare const VideoEnvironmentVersionParamSchema: z.ZodString;
export type VideoEnvironmentVersionParam = z.infer<typeof VideoEnvironmentVersionParamSchema>;
export declare const VideoEnvironmentAngleNameSchema: z.ZodString;
export type VideoEnvironmentAngleName = z.infer<typeof VideoEnvironmentAngleNameSchema>;
export declare const VideoEnvironmentDescriptionSchema: z.ZodObject<{
    room: z.ZodString;
    furniture: z.ZodString;
    light: z.ZodString;
}, z.core.$strict>;
export type VideoEnvironmentDescription = z.infer<typeof VideoEnvironmentDescriptionSchema>;
export declare const VideoEnvironmentAngleSchema: z.ZodObject<{
    name: z.ZodString;
    framing: z.ZodString;
    imagePath: z.ZodString;
    sha256: z.ZodString;
}, z.core.$strict>;
export type VideoEnvironmentAngle = z.infer<typeof VideoEnvironmentAngleSchema>;
export declare const VideoEnvironmentVersionStatusSchema: z.ZodEnum<{
    bozza: "bozza";
    approvata: "approvata";
    sostituita: "sostituita";
}>;
export type VideoEnvironmentVersionStatus = z.infer<typeof VideoEnvironmentVersionStatusSchema>;
export declare const VideoEnvironmentVersionSchema: z.ZodObject<{
    number: z.ZodNumber;
    status: z.ZodEnum<{
        bozza: "bozza";
        approvata: "approvata";
        sostituita: "sostituita";
    }>;
    description: z.ZodObject<{
        room: z.ZodString;
        furniture: z.ZodString;
        light: z.ZodString;
    }, z.core.$strict>;
    angles: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        framing: z.ZodString;
        imagePath: z.ZodString;
        sha256: z.ZodString;
    }, z.core.$strict>>;
    createdAt: z.ZodString;
    approvedAt: z.ZodNullable<z.ZodString>;
    digest: z.ZodString;
}, z.core.$strict>;
export type VideoEnvironmentVersion = z.infer<typeof VideoEnvironmentVersionSchema>;
export declare const VideoEnvironmentSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    kind: z.ZodEnum<{
        studio: "studio";
        esterno: "esterno";
        documentario: "documentario";
    }>;
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    versions: z.ZodArray<z.ZodObject<{
        number: z.ZodNumber;
        status: z.ZodEnum<{
            bozza: "bozza";
            approvata: "approvata";
            sostituita: "sostituita";
        }>;
        description: z.ZodObject<{
            room: z.ZodString;
            furniture: z.ZodString;
            light: z.ZodString;
        }, z.core.$strict>;
        angles: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            framing: z.ZodString;
            imagePath: z.ZodString;
            sha256: z.ZodString;
        }, z.core.$strict>>;
        createdAt: z.ZodString;
        approvedAt: z.ZodNullable<z.ZodString>;
        digest: z.ZodString;
    }, z.core.$strict>>;
    currentVersion: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>;
export type VideoEnvironment = z.infer<typeof VideoEnvironmentSchema>;
export declare const VideoEnvironmentListSchema: z.ZodObject<{
    environments: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        kind: z.ZodEnum<{
            studio: "studio";
            esterno: "esterno";
            documentario: "documentario";
        }>;
        identity: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        versions: z.ZodArray<z.ZodObject<{
            number: z.ZodNumber;
            status: z.ZodEnum<{
                bozza: "bozza";
                approvata: "approvata";
                sostituita: "sostituita";
            }>;
            description: z.ZodObject<{
                room: z.ZodString;
                furniture: z.ZodString;
                light: z.ZodString;
            }, z.core.$strict>;
            angles: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                framing: z.ZodString;
                imagePath: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>>;
            createdAt: z.ZodString;
            approvedAt: z.ZodNullable<z.ZodString>;
            digest: z.ZodString;
        }, z.core.$strict>>;
        currentVersion: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type VideoEnvironmentList = z.infer<typeof VideoEnvironmentListSchema>;
/** Identity belongs in the query, never in an angle generation body. */
export declare const VideoEnvironmentScopeQuerySchema: z.ZodObject<{
    agentId: z.ZodString;
    ownerId: z.ZodString;
    tenantId: z.ZodString;
}, z.core.$strict>;
export type VideoEnvironmentScopeQuery = z.infer<typeof VideoEnvironmentScopeQuerySchema>;
export declare const VideoEnvironmentCreateRequestSchema: z.ZodObject<{
    name: z.ZodString;
    kind: z.ZodEnum<{
        studio: "studio";
        esterno: "esterno";
        documentario: "documentario";
    }>;
    description: z.ZodObject<{
        room: z.ZodString;
        furniture: z.ZodString;
        light: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type VideoEnvironmentCreateRequest = z.infer<typeof VideoEnvironmentCreateRequestSchema>;
export declare const VideoEnvironmentVersionCreateRequestSchema: z.ZodObject<{
    description: z.ZodObject<{
        room: z.ZodString;
        furniture: z.ZodString;
        light: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type VideoEnvironmentVersionCreateRequest = z.infer<typeof VideoEnvironmentVersionCreateRequestSchema>;
export declare const VideoEnvironmentApproveRequestSchema: z.ZodObject<{
    digest: z.ZodString;
}, z.core.$strict>;
export type VideoEnvironmentApproveRequest = z.infer<typeof VideoEnvironmentApproveRequestSchema>;
/** The project owns the frame-step cost; a null model generates an empty background. */
export declare const VideoEnvironmentAngleRequestSchema: z.ZodObject<{
    projectId: z.ZodString;
    name: z.ZodString;
    framing: z.ZodString;
    modelId: z.ZodNullable<z.ZodString>;
    maxCostUsd: z.ZodNumber;
}, z.core.$strict>;
export type VideoEnvironmentAngleRequest = z.infer<typeof VideoEnvironmentAngleRequestSchema>;
//# sourceMappingURL=ambiente.d.ts.map