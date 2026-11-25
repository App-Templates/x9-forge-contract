import { z } from 'zod';
export declare const VIDEO_ENVIRONMENT_LIST_TOOL = "video_environment_list";
export declare const VIDEO_ENVIRONMENT_GET_TOOL = "video_environment_get";
export declare const VIDEO_ENVIRONMENT_CREATE_TOOL = "video_environment_create";
export declare const VIDEO_ENVIRONMENT_VERSION_CREATE_TOOL = "video_environment_version_create";
export declare const VIDEO_ENVIRONMENT_ANGLE_ADD_TOOL = "video_environment_angle_add";
export declare const VIDEO_ENVIRONMENT_APPROVE_TOOL = "video_environment_approve";
/** Identity (tenant, owner, agent, requestedBy) comes only from the admitted tool envelope (R-33). */
export declare const VideoEnvironmentListToolInputSchema: z.ZodObject<{}, z.core.$strict>;
export type VideoEnvironmentListToolInput = z.infer<typeof VideoEnvironmentListToolInputSchema>;
export declare const VideoEnvironmentGetToolInputSchema: z.ZodObject<{
    environmentId: z.ZodString;
}, z.core.$strict>;
export type VideoEnvironmentGetToolInput = z.infer<typeof VideoEnvironmentGetToolInputSchema>;
export declare const VideoEnvironmentCreateToolInputSchema: z.ZodObject<{
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
export type VideoEnvironmentCreateToolInput = z.infer<typeof VideoEnvironmentCreateToolInputSchema>;
export declare const VideoEnvironmentVersionCreateToolInputSchema: z.ZodObject<{
    environmentId: z.ZodString;
    description: z.ZodObject<{
        room: z.ZodString;
        furniture: z.ZodString;
        light: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type VideoEnvironmentVersionCreateToolInput = z.infer<typeof VideoEnvironmentVersionCreateToolInputSchema>;
export declare const VideoEnvironmentAngleAddToolInputSchema: z.ZodObject<{
    environmentId: z.ZodString;
    version: z.ZodNumber;
    projectId: z.ZodString;
    name: z.ZodString;
    framing: z.ZodString;
    modelId: z.ZodNullable<z.ZodString>;
    maxCostUsd: z.ZodNumber;
}, z.core.$strict>;
export type VideoEnvironmentAngleAddToolInput = z.infer<typeof VideoEnvironmentAngleAddToolInputSchema>;
export declare const VideoEnvironmentApproveToolInputSchema: z.ZodObject<{
    environmentId: z.ZodString;
    version: z.ZodNumber;
    digest: z.ZodString;
}, z.core.$strict>;
export type VideoEnvironmentApproveToolInput = z.infer<typeof VideoEnvironmentApproveToolInputSchema>;
export declare const VIDEO_ENVIRONMENT_GET_REASONS: readonly ["ambiente_non_trovato", "motore_non_disponibile"];
export declare const VIDEO_ENVIRONMENT_CREATE_REASONS: readonly ["nome_esistente", "richiesta_non_valida", "motore_non_disponibile"];
export declare const VIDEO_ENVIRONMENT_VERSION_CREATE_REASONS: readonly ["ambiente_non_trovato", "versioni_troppe", "richiesta_non_valida", "motore_non_disponibile"];
export declare const VIDEO_ENVIRONMENT_ANGLE_ADD_REASONS: readonly ["progetto_sconosciuto", "ambiente_non_trovato", "versione_non_trovata", "versione_approvata", "angolazione_esistente", "angolazioni_troppe", "modello_non_approvato", "riferimento_alterato", "costo_oltre_tetto", "budget_insufficiente", "generazione_fallita", "generazione_non_disponibile", "richiesta_non_valida", "motore_non_disponibile"];
export declare const VIDEO_ENVIRONMENT_APPROVE_REASONS: readonly ["ambiente_non_trovato", "versione_non_trovata", "versione_approvata", "digest_cambiato", "senza_angolazioni", "motore_non_disponibile"];
export declare const VideoEnvironmentListToolResponseSchema: z.ZodObject<{
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
export type VideoEnvironmentListToolResponse = z.infer<typeof VideoEnvironmentListToolResponseSchema>;
export declare const VideoEnvironmentGetToolResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"trovato">;
    environment: z.ZodObject<{
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
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"rifiutata">;
    reason: z.ZodEnum<{
        motore_non_disponibile: "motore_non_disponibile";
        ambiente_non_trovato: "ambiente_non_trovato";
    }>;
    message: z.ZodString;
}, z.core.$strict>], "status">;
export type VideoEnvironmentGetToolResponse = z.infer<typeof VideoEnvironmentGetToolResponseSchema>;
export declare const VideoEnvironmentCreateToolResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"creato">;
    environment: z.ZodObject<{
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
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"rifiutata">;
    reason: z.ZodEnum<{
        motore_non_disponibile: "motore_non_disponibile";
        richiesta_non_valida: "richiesta_non_valida";
        nome_esistente: "nome_esistente";
    }>;
    message: z.ZodString;
}, z.core.$strict>], "status">;
export type VideoEnvironmentCreateToolResponse = z.infer<typeof VideoEnvironmentCreateToolResponseSchema>;
export declare const VideoEnvironmentVersionCreateToolResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"versione_creata">;
    version: z.ZodObject<{
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
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"rifiutata">;
    reason: z.ZodEnum<{
        motore_non_disponibile: "motore_non_disponibile";
        richiesta_non_valida: "richiesta_non_valida";
        ambiente_non_trovato: "ambiente_non_trovato";
        versioni_troppe: "versioni_troppe";
    }>;
    message: z.ZodString;
}, z.core.$strict>], "status">;
export type VideoEnvironmentVersionCreateToolResponse = z.infer<typeof VideoEnvironmentVersionCreateToolResponseSchema>;
export declare const VideoEnvironmentAngleAddToolResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"angolazione_aggiunta">;
    version: z.ZodObject<{
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
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"rifiutata">;
    reason: z.ZodEnum<{
        motore_non_disponibile: "motore_non_disponibile";
        richiesta_non_valida: "richiesta_non_valida";
        progetto_sconosciuto: "progetto_sconosciuto";
        ambiente_non_trovato: "ambiente_non_trovato";
        versione_non_trovata: "versione_non_trovata";
        versione_approvata: "versione_approvata";
        angolazione_esistente: "angolazione_esistente";
        angolazioni_troppe: "angolazioni_troppe";
        modello_non_approvato: "modello_non_approvato";
        riferimento_alterato: "riferimento_alterato";
        costo_oltre_tetto: "costo_oltre_tetto";
        budget_insufficiente: "budget_insufficiente";
        generazione_fallita: "generazione_fallita";
        generazione_non_disponibile: "generazione_non_disponibile";
    }>;
    message: z.ZodString;
}, z.core.$strict>], "status">;
export type VideoEnvironmentAngleAddToolResponse = z.infer<typeof VideoEnvironmentAngleAddToolResponseSchema>;
export declare const VideoEnvironmentApproveToolResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"approvata">;
    version: z.ZodObject<{
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
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"rifiutata">;
    reason: z.ZodEnum<{
        motore_non_disponibile: "motore_non_disponibile";
        ambiente_non_trovato: "ambiente_non_trovato";
        versione_non_trovata: "versione_non_trovata";
        versione_approvata: "versione_approvata";
        digest_cambiato: "digest_cambiato";
        senza_angolazioni: "senza_angolazioni";
    }>;
    message: z.ZodString;
}, z.core.$strict>], "status">;
export type VideoEnvironmentApproveToolResponse = z.infer<typeof VideoEnvironmentApproveToolResponseSchema>;
//# sourceMappingURL=ambiente-tool.d.ts.map