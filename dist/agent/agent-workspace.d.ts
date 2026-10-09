import { z } from 'zod';
export { AgentWorkspaceAttestationSchema } from "./agent-workspace-attestation.js";
export type { AgentWorkspaceAttestation } from "./agent-workspace-attestation.js";
/** D-A9: these exact root-relative names replace Forge's temporary CORE_MODEL_FILES list. */
export declare const AGENT_WORKSPACE_HUMAN_FILES: readonly ["IDENTITY.md", "SOUL.md", "POLICIES.md", "USER.md"];
export declare const AGENT_WORKSPACE_TOOLS_FILE: "TOOLS.md";
/** Wire safety bounds in UTF-8 bytes, not a claim about prompt tokens or the old L1 budget. */
export declare const AGENT_WORKSPACE_LIMITS: {
    readonly humanFileBytes: 16384;
    readonly toolsBytes: 65536;
    readonly skillDescriptionBytes: 512;
    readonly skillProcedureBytes: 32768;
    readonly historyEntries: 100;
    readonly skills: 128;
};
export declare const AgentWorkspaceHumanFileNameSchema: z.ZodEnum<{
    "IDENTITY.md": "IDENTITY.md";
    "SOUL.md": "SOUL.md";
    "POLICIES.md": "POLICIES.md";
    "USER.md": "USER.md";
}>;
export type AgentWorkspaceHumanFileName = z.infer<typeof AgentWorkspaceHumanFileNameSchema>;
/** Origin is explicit; an override does not erase the earlier master/template revisions. */
export declare const AgentWorkspaceOriginSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"master">;
    source: z.ZodObject<{
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    }, z.core.$strip>;
    version: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"template">;
    templateId: z.ZodString;
    ownerId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "OwnerId", "out">>;
    version: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"agent">;
}, z.core.$strict>], "kind">;
export type AgentWorkspaceOrigin = z.infer<typeof AgentWorkspaceOriginSchema>;
export declare const AgentWorkspaceFileRevisionSchema: z.ZodObject<{
    version: z.ZodNumber;
    origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"master">;
        source: z.ZodObject<{
            agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        }, z.core.$strip>;
        version: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"template">;
        templateId: z.ZodString;
        ownerId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "OwnerId", "out">>;
        version: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"agent">;
    }, z.core.$strict>], "kind">;
    hash: z.ZodString;
    bytes: z.ZodNumber;
    updatedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type AgentWorkspaceFileRevision = z.infer<typeof AgentWorkspaceFileRevisionSchema>;
/** History contains metadata only. Content belongs to the scoped workspace service, never this context DTO. */
export declare const AgentWorkspaceHumanFileSchema: z.ZodObject<{
    name: z.ZodEnum<{
        "IDENTITY.md": "IDENTITY.md";
        "SOUL.md": "SOUL.md";
        "POLICIES.md": "POLICIES.md";
        "USER.md": "USER.md";
    }>;
    load: z.ZodLiteral<"always">;
    versions: z.ZodObject<{
        desired: z.ZodNumber;
        applied: z.ZodNullable<z.ZodNumber>;
        failed: z.ZodNullable<z.ZodObject<{
            version: z.ZodNumber;
            reason: z.ZodObject<{
                code: z.ZodEnum<{
                    unknown: "unknown";
                    "not-loaded": "not-loaded";
                    "load-failed": "load-failed";
                    "validation-failed": "validation-failed";
                    timeout: "timeout";
                    "source-unavailable": "source-unavailable";
                    "shared-runtime": "shared-runtime";
                    "externally-owned": "externally-owned";
                    "not-supported": "not-supported";
                    "in-progress": "in-progress";
                }>;
                detail: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>>;
    }, z.core.$strip>;
    history: z.ZodArray<z.ZodObject<{
        version: z.ZodNumber;
        origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"master">;
            source: z.ZodObject<{
                agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            }, z.core.$strip>;
            version: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"template">;
            templateId: z.ZodString;
            ownerId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "OwnerId", "out">>;
            version: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"agent">;
        }, z.core.$strict>], "kind">;
        hash: z.ZodString;
        bytes: z.ZodNumber;
        updatedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type AgentWorkspaceHumanFile = z.infer<typeof AgentWorkspaceHumanFileSchema>;
/** TOOLS is generated from the frozen registry. A human override or editable flag is invalid. */
export declare const AgentWorkspaceToolsSchema: z.ZodObject<{
    name: z.ZodLiteral<"TOOLS.md">;
    origin: z.ZodLiteral<"generated">;
    editable: z.ZodLiteral<false>;
    load: z.ZodLiteral<"always">;
    version: z.ZodNumber;
    hash: z.ZodString;
    bytes: z.ZodNumber;
    updatedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type AgentWorkspaceTools = z.infer<typeof AgentWorkspaceToolsSchema>;
/** One canonical relative procedure path per enabled capability; consumers still enforce filesystem containment. */
export declare function agentWorkspaceSkillPath(capability: string): string;
export declare const AgentWorkspaceSkillSchema: z.ZodObject<{
    capability: z.ZodString;
    description: z.ZodString;
    procedure: z.ZodObject<{
        path: z.ZodString;
        load: z.ZodLiteral<"on-demand">;
        editable: z.ZodLiteral<false>;
        version: z.ZodNumber;
        hash: z.ZodString;
        bytes: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>;
export type AgentWorkspaceSkill = z.infer<typeof AgentWorkspaceSkillSchema>;
/**
 * Applied core bundle descriptor. File versions track editing independently of the bundle's applied `version`.
 * To read the effective human text, select its `versions.applied` revision, never the latest saved revision.
 * Registry and generated references are the validated snapshot used at Apply, not a second discovery on GET.
 * Permissions come ONLY from the enclosing context's canonical BRIDGE-134 scopePolicy, never file prose.
 */
export declare const AgentWorkspaceDescriptorSchema: z.ZodObject<{
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    tenantId: z.ZodOptional<z.ZodString>;
    version: z.ZodNumber;
    files: z.ZodArray<z.ZodObject<{
        name: z.ZodEnum<{
            "IDENTITY.md": "IDENTITY.md";
            "SOUL.md": "SOUL.md";
            "POLICIES.md": "POLICIES.md";
            "USER.md": "USER.md";
        }>;
        load: z.ZodLiteral<"always">;
        versions: z.ZodObject<{
            desired: z.ZodNumber;
            applied: z.ZodNullable<z.ZodNumber>;
            failed: z.ZodNullable<z.ZodObject<{
                version: z.ZodNumber;
                reason: z.ZodObject<{
                    code: z.ZodEnum<{
                        unknown: "unknown";
                        "not-loaded": "not-loaded";
                        "load-failed": "load-failed";
                        "validation-failed": "validation-failed";
                        timeout: "timeout";
                        "source-unavailable": "source-unavailable";
                        "shared-runtime": "shared-runtime";
                        "externally-owned": "externally-owned";
                        "not-supported": "not-supported";
                        "in-progress": "in-progress";
                    }>;
                    detail: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>;
            }, z.core.$strict>>;
        }, z.core.$strip>;
        history: z.ZodArray<z.ZodObject<{
            version: z.ZodNumber;
            origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"master">;
                source: z.ZodObject<{
                    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                }, z.core.$strip>;
                version: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"template">;
                templateId: z.ZodString;
                ownerId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "OwnerId", "out">>;
                version: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"agent">;
            }, z.core.$strict>], "kind">;
            hash: z.ZodString;
            bytes: z.ZodNumber;
            updatedAt: z.ZodISODateTime;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    tools: z.ZodObject<{
        name: z.ZodLiteral<"TOOLS.md">;
        origin: z.ZodLiteral<"generated">;
        editable: z.ZodLiteral<false>;
        load: z.ZodLiteral<"always">;
        version: z.ZodNumber;
        hash: z.ZodString;
        bytes: z.ZodNumber;
        updatedAt: z.ZodISODateTime;
    }, z.core.$strict>;
    registry: z.ZodObject<{
        capabilities: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            enabled: z.ZodBoolean;
            host: z.ZodString;
            port: z.ZodNumber;
            version: z.ZodString;
            protocol: z.ZodOptional<z.ZodEnum<{
                http: "http";
                https: "https";
            }>>;
            tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                description: z.ZodString;
                inputSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>>;
            modelPolicy: z.ZodOptional<z.ZodObject<{
                min: z.ZodEnum<{
                    standard: "standard";
                    advanced: "advanced";
                    reasoning: "reasoning";
                }>;
                max: z.ZodEnum<{
                    standard: "standard";
                    advanced: "advanced";
                    reasoning: "reasoning";
                }>;
            }, z.core.$strip>>;
            requires: z.ZodOptional<z.ZodArray<z.ZodString>>;
            credentialRequirements: z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodLazy<z.ZodString>;
                required: z.ZodBoolean;
            }, z.core.$strict>>>;
            context: z.ZodOptional<z.ZodObject<{
                maxChars: z.ZodNumber;
            }, z.core.$strip>>;
            turnLead: z.ZodOptional<z.ZodObject<{}, z.core.$strict>>;
            parameters: z.ZodOptional<z.ZodObject<{
                parameters: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"number">;
                    min: z.ZodOptional<z.ZodNumber>;
                    max: z.ZodOptional<z.ZodNumber>;
                    platformDefault: z.ZodOptional<z.ZodNumber>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"integer">;
                    min: z.ZodOptional<z.ZodNumber>;
                    max: z.ZodOptional<z.ZodNumber>;
                    platformDefault: z.ZodOptional<z.ZodNumber>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"string">;
                    minLength: z.ZodOptional<z.ZodNumber>;
                    maxLength: z.ZodOptional<z.ZodNumber>;
                    pattern: z.ZodOptional<z.ZodString>;
                    platformDefault: z.ZodOptional<z.ZodString>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"boolean">;
                    platformDefault: z.ZodOptional<z.ZodBoolean>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"enum">;
                    options: z.ZodArray<z.ZodObject<{
                        value: z.ZodString;
                        label: z.ZodString;
                    }, z.core.$strict>>;
                    platformDefault: z.ZodOptional<z.ZodString>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"string_list">;
                    minItems: z.ZodOptional<z.ZodNumber>;
                    maxItems: z.ZodOptional<z.ZodNumber>;
                    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        value: z.ZodString;
                        label: z.ZodString;
                    }, z.core.$strict>>>;
                    pattern: z.ZodOptional<z.ZodString>;
                    platformDefault: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    key: z.ZodString;
                    label: z.ZodString;
                    description: z.ZodString;
                    explanation: z.ZodOptional<z.ZodString>;
                    group: z.ZodOptional<z.ZodString>;
                    unit: z.ZodOptional<z.ZodString>;
                    status: z.ZodEnum<{
                        decided: "decided";
                        proposed: "proposed";
                    }>;
                    reference: z.ZodString;
                    appliesWhen: z.ZodEnum<{
                        immediate: "immediate";
                        next_apply: "next_apply";
                    }>;
                    consumes: z.ZodBoolean;
                    optional: z.ZodBoolean;
                    editableBy: z.ZodArray<z.ZodEnum<{
                        superadmin: "superadmin";
                        owner: "owner";
                    }>>;
                }, z.core.$strict>], "type">>;
                consumes: z.ZodBoolean;
                spendLedger: z.ZodBoolean;
            }, z.core.$strict>>;
            presentation: z.ZodOptional<z.ZodObject<{
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
                        min: z.ZodOptional<z.ZodNumber>;
                        max: z.ZodOptional<z.ZodNumber>;
                    }, z.core.$strict>>;
                }, z.core.$strict>>;
                feedback: z.ZodOptional<z.ZodObject<{
                    label: z.ZodString;
                    kind: z.ZodEnum<{
                        rating: "rating";
                        approval: "approval";
                    }>;
                    attachments: z.ZodBoolean;
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
            }, z.core.$strict>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    skills: z.ZodArray<z.ZodObject<{
        capability: z.ZodString;
        description: z.ZodString;
        procedure: z.ZodObject<{
            path: z.ZodString;
            load: z.ZodLiteral<"on-demand">;
            editable: z.ZodLiteral<false>;
            version: z.ZodNumber;
            hash: z.ZodString;
            bytes: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type AgentWorkspaceDescriptor = z.infer<typeof AgentWorkspaceDescriptorSchema>;
/** Request selects a previous revision as a NEW desired revision; it never directly changes the applied version. */
export declare const AgentWorkspaceRollbackRequestSchema: z.ZodObject<{
    file: z.ZodEnum<{
        "IDENTITY.md": "IDENTITY.md";
        "SOUL.md": "SOUL.md";
        "POLICIES.md": "POLICIES.md";
        "USER.md": "USER.md";
    }>;
    expectedVersion: z.ZodNumber;
    targetVersion: z.ZodNumber;
}, z.core.$strict>;
export type AgentWorkspaceRollbackRequest = z.infer<typeof AgentWorkspaceRollbackRequestSchema>;
/** Server-owned current descriptor + untrusted request: always validate this binding, not just request syntax. */
export declare const AgentWorkspaceRollbackValidationSchema: z.ZodObject<{
    workspace: z.ZodObject<{
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        tenantId: z.ZodOptional<z.ZodString>;
        version: z.ZodNumber;
        files: z.ZodArray<z.ZodObject<{
            name: z.ZodEnum<{
                "IDENTITY.md": "IDENTITY.md";
                "SOUL.md": "SOUL.md";
                "POLICIES.md": "POLICIES.md";
                "USER.md": "USER.md";
            }>;
            load: z.ZodLiteral<"always">;
            versions: z.ZodObject<{
                desired: z.ZodNumber;
                applied: z.ZodNullable<z.ZodNumber>;
                failed: z.ZodNullable<z.ZodObject<{
                    version: z.ZodNumber;
                    reason: z.ZodObject<{
                        code: z.ZodEnum<{
                            unknown: "unknown";
                            "not-loaded": "not-loaded";
                            "load-failed": "load-failed";
                            "validation-failed": "validation-failed";
                            timeout: "timeout";
                            "source-unavailable": "source-unavailable";
                            "shared-runtime": "shared-runtime";
                            "externally-owned": "externally-owned";
                            "not-supported": "not-supported";
                            "in-progress": "in-progress";
                        }>;
                        detail: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>;
                }, z.core.$strict>>;
            }, z.core.$strip>;
            history: z.ZodArray<z.ZodObject<{
                version: z.ZodNumber;
                origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"master">;
                    source: z.ZodObject<{
                        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                    }, z.core.$strip>;
                    version: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"template">;
                    templateId: z.ZodString;
                    ownerId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "OwnerId", "out">>;
                    version: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"agent">;
                }, z.core.$strict>], "kind">;
                hash: z.ZodString;
                bytes: z.ZodNumber;
                updatedAt: z.ZodISODateTime;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        tools: z.ZodObject<{
            name: z.ZodLiteral<"TOOLS.md">;
            origin: z.ZodLiteral<"generated">;
            editable: z.ZodLiteral<false>;
            load: z.ZodLiteral<"always">;
            version: z.ZodNumber;
            hash: z.ZodString;
            bytes: z.ZodNumber;
            updatedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        registry: z.ZodObject<{
            capabilities: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                enabled: z.ZodBoolean;
                host: z.ZodString;
                port: z.ZodNumber;
                version: z.ZodString;
                protocol: z.ZodOptional<z.ZodEnum<{
                    http: "http";
                    https: "https";
                }>>;
                tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    description: z.ZodString;
                    inputSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                }, z.core.$strip>>>;
                modelPolicy: z.ZodOptional<z.ZodObject<{
                    min: z.ZodEnum<{
                        standard: "standard";
                        advanced: "advanced";
                        reasoning: "reasoning";
                    }>;
                    max: z.ZodEnum<{
                        standard: "standard";
                        advanced: "advanced";
                        reasoning: "reasoning";
                    }>;
                }, z.core.$strip>>;
                requires: z.ZodOptional<z.ZodArray<z.ZodString>>;
                credentialRequirements: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodLazy<z.ZodString>;
                    required: z.ZodBoolean;
                }, z.core.$strict>>>;
                context: z.ZodOptional<z.ZodObject<{
                    maxChars: z.ZodNumber;
                }, z.core.$strip>>;
                turnLead: z.ZodOptional<z.ZodObject<{}, z.core.$strict>>;
                parameters: z.ZodOptional<z.ZodObject<{
                    parameters: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"number">;
                        min: z.ZodOptional<z.ZodNumber>;
                        max: z.ZodOptional<z.ZodNumber>;
                        platformDefault: z.ZodOptional<z.ZodNumber>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"integer">;
                        min: z.ZodOptional<z.ZodNumber>;
                        max: z.ZodOptional<z.ZodNumber>;
                        platformDefault: z.ZodOptional<z.ZodNumber>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"string">;
                        minLength: z.ZodOptional<z.ZodNumber>;
                        maxLength: z.ZodOptional<z.ZodNumber>;
                        pattern: z.ZodOptional<z.ZodString>;
                        platformDefault: z.ZodOptional<z.ZodString>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"boolean">;
                        platformDefault: z.ZodOptional<z.ZodBoolean>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"enum">;
                        options: z.ZodArray<z.ZodObject<{
                            value: z.ZodString;
                            label: z.ZodString;
                        }, z.core.$strict>>;
                        platformDefault: z.ZodOptional<z.ZodString>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"string_list">;
                        minItems: z.ZodOptional<z.ZodNumber>;
                        maxItems: z.ZodOptional<z.ZodNumber>;
                        options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            value: z.ZodString;
                            label: z.ZodString;
                        }, z.core.$strict>>>;
                        pattern: z.ZodOptional<z.ZodString>;
                        platformDefault: z.ZodOptional<z.ZodArray<z.ZodString>>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>], "type">>;
                    consumes: z.ZodBoolean;
                    spendLedger: z.ZodBoolean;
                }, z.core.$strict>>;
                presentation: z.ZodOptional<z.ZodObject<{
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
                            min: z.ZodOptional<z.ZodNumber>;
                            max: z.ZodOptional<z.ZodNumber>;
                        }, z.core.$strict>>;
                    }, z.core.$strict>>;
                    feedback: z.ZodOptional<z.ZodObject<{
                        label: z.ZodString;
                        kind: z.ZodEnum<{
                            rating: "rating";
                            approval: "approval";
                        }>;
                        attachments: z.ZodBoolean;
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
                }, z.core.$strict>>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        skills: z.ZodArray<z.ZodObject<{
            capability: z.ZodString;
            description: z.ZodString;
            procedure: z.ZodObject<{
                path: z.ZodString;
                load: z.ZodLiteral<"on-demand">;
                editable: z.ZodLiteral<false>;
                version: z.ZodNumber;
                hash: z.ZodString;
                bytes: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    request: z.ZodObject<{
        file: z.ZodEnum<{
            "IDENTITY.md": "IDENTITY.md";
            "SOUL.md": "SOUL.md";
            "POLICIES.md": "POLICIES.md";
            "USER.md": "USER.md";
        }>;
        expectedVersion: z.ZodNumber;
        targetVersion: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare function parseAgentWorkspaceRollbackRequest(request: unknown, authoritativeWorkspace: unknown): AgentWorkspaceRollbackRequest;
/** Additive reader/writer extension. Legacy absence is valid; channel and canonical scopePolicy guards are inherited. */
export declare const AgentContextWithWorkspaceSchema: z.ZodObject<{
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    credentials: z.ZodObject<{
        OPENAI_API_KEY: z.ZodOptional<z.ZodString>;
        ANTHROPIC_API_KEY: z.ZodOptional<z.ZodString>;
        GOOGLE_API_KEY: z.ZodOptional<z.ZodString>;
        AGENT_CHAT_MODEL: z.ZodOptional<z.ZodString>;
        TELEGRAM_BOT_TOKEN: z.ZodOptional<z.ZodString>;
        ELEVENLABS_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_VOICE_ID: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MODEL_ID: z.ZodOptional<z.ZodString>;
        TTS_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_MODEL: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_VOICE: z.ZodOptional<z.ZodString>;
        STT_PRIMARY_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_STT_MODEL: z.ZodOptional<z.ZodString>;
        VOICE_CALL_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_VOICE: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_BACKEND_MODEL: z.ZodOptional<z.ZodString>;
        TELNYX_API_KEY: z.ZodOptional<z.ZodString>;
        TELNYX_CONNECTION_ID: z.ZodOptional<z.ZodString>;
        TELNYX_FROM_NUMBER: z.ZodOptional<z.ZodString>;
        TELNYX_PUBLIC_KEY: z.ZodOptional<z.ZodString>;
        LIVE_WEB_AUTH_TOKEN: z.ZodOptional<z.ZodString>;
        QDRANT_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MINDFULNESS_AGENT_ID: z.ZodOptional<z.ZodString>;
        FORGE_VOICE_REGISTER_TOKEN: z.ZodOptional<z.ZodString>;
        AGENTMAIL_API_KEY: z.ZodOptional<z.ZodString>;
        AGENTMAIL_INBOX_ID: z.ZodOptional<z.ZodString>;
        AGENT_EMAIL: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_EMAIL: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_ID: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        NETATMO_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_ACCESS_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_PASSWORD: z.ZodOptional<z.ZodString>;
        INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
        X9_INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
    }, z.core.$catchall<z.ZodString>>;
    llmConfig: z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
    }, z.core.$strip>;
    telegramAllowFrom: z.ZodArray<z.ZodString>;
    inboundForwardUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tenantId: z.ZodOptional<z.ZodString>;
    workspacePath: z.ZodString;
    registryPath: z.ZodString;
    telegramBotToken: z.ZodOptional<z.ZodString>;
    displayName: z.ZodString;
    configVersion: z.ZodOptional<z.ZodNumber>;
    identity: z.ZodOptional<z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    channelConfigurations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            email: "email";
            telegram: "telegram";
        }>;
        desired: z.ZodObject<{
            version: z.ZodNumber;
            state: z.ZodEnum<{
                active: "active";
                paused: "paused";
            }>;
        }, z.core.$strict>;
        access: z.ZodOptional<z.ZodObject<{
            desiredPolicy: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"telegram">;
                mode: z.ZodEnum<{
                    "approved-chats": "approved-chats";
                    anyone: "anyone";
                }>;
                chats: z.ZodArray<z.ZodObject<{
                    chatId: z.ZodString;
                    type: z.ZodEnum<{
                        group: "group";
                        private: "private";
                        supergroup: "supergroup";
                    }>;
                    name: z.ZodString;
                    admittedAt: z.ZodISODateTime;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"email">;
                mode: z.ZodEnum<{
                    anyone: "anyone";
                    "address-book": "address-book";
                }>;
            }, z.core.$strict>], "kind">;
            appliedPolicy: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"telegram">;
                mode: z.ZodEnum<{
                    "approved-chats": "approved-chats";
                    anyone: "anyone";
                }>;
                chats: z.ZodArray<z.ZodObject<{
                    chatId: z.ZodString;
                    type: z.ZodEnum<{
                        group: "group";
                        private: "private";
                        supergroup: "supergroup";
                    }>;
                    name: z.ZodString;
                    admittedAt: z.ZodISODateTime;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"email">;
                mode: z.ZodEnum<{
                    anyone: "anyone";
                    "address-book": "address-book";
                }>;
            }, z.core.$strict>], "kind">>;
        }, z.core.$strict>>;
        applied: z.ZodNullable<z.ZodObject<{
            version: z.ZodNumber;
            state: z.ZodEnum<{
                active: "active";
                paused: "paused";
            }>;
        }, z.core.$strict>>;
        resource: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodEnum<{
                telegram: "telegram";
            }>;
            resource: z.ZodObject<{
                agent_id: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                bot_username: z.ZodString;
                created_at: z.ZodString;
            }, z.core.$strict>;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodEnum<{
                email: "email";
            }>;
            resource: z.ZodObject<{
                agent_id: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                provider_inbox_id: z.ZodString;
                address: z.ZodString;
                display_name: z.ZodNullable<z.ZodString>;
                created_at: z.ZodString;
            }, z.core.$strict>;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strict>], "kind">>;
        observation: z.ZodNullable<z.ZodObject<{
            channelId: z.ZodString;
            kind: z.ZodUnion<[z.ZodEnum<{
                email: "email";
                voice: "voice";
                telegram: "telegram";
                whatsapp: "whatsapp";
            }>, z.ZodLiteral<"web">]>;
            state: z.ZodEnum<{
                error: "error";
                unknown: "unknown";
                stopped: "stopped";
                loaded: "loaded";
                paused: "paused";
            }>;
            loaded: z.ZodNullable<z.ZodBoolean>;
            readiness: z.ZodEnum<{
                unknown: "unknown";
                ready: "ready";
                "not-ready": "not-ready";
            }>;
            botUsername: z.ZodOptional<z.ZodString>;
            allowFromCount: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        observedAt: z.ZodNullable<z.ZodISODateTime>;
        error: z.ZodNullable<z.ZodObject<{
            code: z.ZodEnum<{
                source_unavailable: "source_unavailable";
                resource_missing: "resource_missing";
                resource_conflict: "resource_conflict";
                provider_unavailable: "provider_unavailable";
                provider_rejected: "provider_rejected";
                account_blocked: "account_blocked";
                load_failed: "load_failed";
                apply_failed: "apply_failed";
                reconcile_pending: "reconcile_pending";
                first_check_failed: "first_check_failed";
            }>;
            retryable: z.ZodBoolean;
        }, z.core.$strict>>;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
    }, z.core.$strict>>>;
    voiceConfiguration: z.ZodOptional<z.ZodObject<{
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        versions: z.ZodObject<{
            desired: z.ZodNumber;
            applied: z.ZodNullable<z.ZodNumber>;
            failed: z.ZodNullable<z.ZodObject<{
                version: z.ZodNumber;
                reason: z.ZodObject<{
                    code: z.ZodEnum<{
                        unknown: "unknown";
                        "not-loaded": "not-loaded";
                        "load-failed": "load-failed";
                        "validation-failed": "validation-failed";
                        timeout: "timeout";
                        "source-unavailable": "source-unavailable";
                        "shared-runtime": "shared-runtime";
                        "externally-owned": "externally-owned";
                        "not-supported": "not-supported";
                        "in-progress": "in-progress";
                    }>;
                    detail: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>;
            }, z.core.$strict>>;
        }, z.core.$strip>;
        desired: z.ZodDiscriminatedUnion<[z.ZodObject<{
            mode: z.ZodLiteral<"text-only">;
        }, z.core.$strict>, z.ZodObject<{
            mode: z.ZodLiteral<"voice">;
            provider: z.ZodString;
            protocol: z.ZodEnum<{
                websocket: "websocket";
                webrtc: "webrtc";
                sip: "sip";
            }>;
            transports: z.ZodArray<z.ZodEnum<{
                web: "web";
                phone: "phone";
            }>>;
            voiceId: z.ZodString;
            model: z.ZodString;
            locale: z.ZodOptional<z.ZodString>;
            params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>>>;
        }, z.core.$strict>], "mode">;
        applied: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
            mode: z.ZodLiteral<"text-only">;
        }, z.core.$strict>, z.ZodObject<{
            mode: z.ZodLiteral<"voice">;
            provider: z.ZodString;
            protocol: z.ZodEnum<{
                websocket: "websocket";
                webrtc: "webrtc";
                sip: "sip";
            }>;
            transports: z.ZodArray<z.ZodEnum<{
                web: "web";
                phone: "phone";
            }>>;
            voiceId: z.ZodString;
            model: z.ZodString;
            locale: z.ZodOptional<z.ZodString>;
            params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>>>;
        }, z.core.$strict>], "mode">>;
    }, z.core.$strip>>;
    scopePolicy: z.ZodOptional<z.ZodObject<{
        version: z.ZodNumber;
        defaultWebSearch: z.ZodBoolean;
        scopeLimited: z.ZodBoolean;
        purpose: z.ZodOptional<z.ZodString>;
        defaults: z.ZodObject<{
            read: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
            write: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
        }, z.core.$strict>;
        rules: z.ZodArray<z.ZodObject<{
            capability: z.ZodString;
            tool: z.ZodOptional<z.ZodString>;
            read: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
            write: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    workspace: z.ZodOptional<z.ZodObject<{
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        tenantId: z.ZodOptional<z.ZodString>;
        version: z.ZodNumber;
        files: z.ZodArray<z.ZodObject<{
            name: z.ZodEnum<{
                "IDENTITY.md": "IDENTITY.md";
                "SOUL.md": "SOUL.md";
                "POLICIES.md": "POLICIES.md";
                "USER.md": "USER.md";
            }>;
            load: z.ZodLiteral<"always">;
            versions: z.ZodObject<{
                desired: z.ZodNumber;
                applied: z.ZodNullable<z.ZodNumber>;
                failed: z.ZodNullable<z.ZodObject<{
                    version: z.ZodNumber;
                    reason: z.ZodObject<{
                        code: z.ZodEnum<{
                            unknown: "unknown";
                            "not-loaded": "not-loaded";
                            "load-failed": "load-failed";
                            "validation-failed": "validation-failed";
                            timeout: "timeout";
                            "source-unavailable": "source-unavailable";
                            "shared-runtime": "shared-runtime";
                            "externally-owned": "externally-owned";
                            "not-supported": "not-supported";
                            "in-progress": "in-progress";
                        }>;
                        detail: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>;
                }, z.core.$strict>>;
            }, z.core.$strip>;
            history: z.ZodArray<z.ZodObject<{
                version: z.ZodNumber;
                origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"master">;
                    source: z.ZodObject<{
                        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                    }, z.core.$strip>;
                    version: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"template">;
                    templateId: z.ZodString;
                    ownerId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "OwnerId", "out">>;
                    version: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"agent">;
                }, z.core.$strict>], "kind">;
                hash: z.ZodString;
                bytes: z.ZodNumber;
                updatedAt: z.ZodISODateTime;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        tools: z.ZodObject<{
            name: z.ZodLiteral<"TOOLS.md">;
            origin: z.ZodLiteral<"generated">;
            editable: z.ZodLiteral<false>;
            load: z.ZodLiteral<"always">;
            version: z.ZodNumber;
            hash: z.ZodString;
            bytes: z.ZodNumber;
            updatedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        registry: z.ZodObject<{
            capabilities: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                enabled: z.ZodBoolean;
                host: z.ZodString;
                port: z.ZodNumber;
                version: z.ZodString;
                protocol: z.ZodOptional<z.ZodEnum<{
                    http: "http";
                    https: "https";
                }>>;
                tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    description: z.ZodString;
                    inputSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                }, z.core.$strip>>>;
                modelPolicy: z.ZodOptional<z.ZodObject<{
                    min: z.ZodEnum<{
                        standard: "standard";
                        advanced: "advanced";
                        reasoning: "reasoning";
                    }>;
                    max: z.ZodEnum<{
                        standard: "standard";
                        advanced: "advanced";
                        reasoning: "reasoning";
                    }>;
                }, z.core.$strip>>;
                requires: z.ZodOptional<z.ZodArray<z.ZodString>>;
                credentialRequirements: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodLazy<z.ZodString>;
                    required: z.ZodBoolean;
                }, z.core.$strict>>>;
                context: z.ZodOptional<z.ZodObject<{
                    maxChars: z.ZodNumber;
                }, z.core.$strip>>;
                turnLead: z.ZodOptional<z.ZodObject<{}, z.core.$strict>>;
                parameters: z.ZodOptional<z.ZodObject<{
                    parameters: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"number">;
                        min: z.ZodOptional<z.ZodNumber>;
                        max: z.ZodOptional<z.ZodNumber>;
                        platformDefault: z.ZodOptional<z.ZodNumber>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"integer">;
                        min: z.ZodOptional<z.ZodNumber>;
                        max: z.ZodOptional<z.ZodNumber>;
                        platformDefault: z.ZodOptional<z.ZodNumber>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"string">;
                        minLength: z.ZodOptional<z.ZodNumber>;
                        maxLength: z.ZodOptional<z.ZodNumber>;
                        pattern: z.ZodOptional<z.ZodString>;
                        platformDefault: z.ZodOptional<z.ZodString>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"boolean">;
                        platformDefault: z.ZodOptional<z.ZodBoolean>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"enum">;
                        options: z.ZodArray<z.ZodObject<{
                            value: z.ZodString;
                            label: z.ZodString;
                        }, z.core.$strict>>;
                        platformDefault: z.ZodOptional<z.ZodString>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"string_list">;
                        minItems: z.ZodOptional<z.ZodNumber>;
                        maxItems: z.ZodOptional<z.ZodNumber>;
                        options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            value: z.ZodString;
                            label: z.ZodString;
                        }, z.core.$strict>>>;
                        pattern: z.ZodOptional<z.ZodString>;
                        platformDefault: z.ZodOptional<z.ZodArray<z.ZodString>>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>], "type">>;
                    consumes: z.ZodBoolean;
                    spendLedger: z.ZodBoolean;
                }, z.core.$strict>>;
                presentation: z.ZodOptional<z.ZodObject<{
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
                            min: z.ZodOptional<z.ZodNumber>;
                            max: z.ZodOptional<z.ZodNumber>;
                        }, z.core.$strict>>;
                    }, z.core.$strict>>;
                    feedback: z.ZodOptional<z.ZodObject<{
                        label: z.ZodString;
                        kind: z.ZodEnum<{
                            rating: "rating";
                            approval: "approval";
                        }>;
                        attachments: z.ZodBoolean;
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
                }, z.core.$strict>>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        skills: z.ZodArray<z.ZodObject<{
            capability: z.ZodString;
            description: z.ZodString;
            procedure: z.ZodObject<{
                path: z.ZodString;
                load: z.ZodLiteral<"on-demand">;
                editable: z.ZodLiteral<false>;
                version: z.ZodNumber;
                hash: z.ZodString;
                bytes: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$loose>;
export declare const AgentContextWithWorkspaceWriteSchema: z.ZodObject<{
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    credentials: z.ZodObject<{
        OPENAI_API_KEY: z.ZodOptional<z.ZodString>;
        ANTHROPIC_API_KEY: z.ZodOptional<z.ZodString>;
        GOOGLE_API_KEY: z.ZodOptional<z.ZodString>;
        AGENT_CHAT_MODEL: z.ZodOptional<z.ZodString>;
        TELEGRAM_BOT_TOKEN: z.ZodOptional<z.ZodString>;
        ELEVENLABS_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_VOICE_ID: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MODEL_ID: z.ZodOptional<z.ZodString>;
        TTS_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_MODEL: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_VOICE: z.ZodOptional<z.ZodString>;
        STT_PRIMARY_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_STT_MODEL: z.ZodOptional<z.ZodString>;
        VOICE_CALL_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_VOICE: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_BACKEND_MODEL: z.ZodOptional<z.ZodString>;
        TELNYX_API_KEY: z.ZodOptional<z.ZodString>;
        TELNYX_CONNECTION_ID: z.ZodOptional<z.ZodString>;
        TELNYX_FROM_NUMBER: z.ZodOptional<z.ZodString>;
        TELNYX_PUBLIC_KEY: z.ZodOptional<z.ZodString>;
        LIVE_WEB_AUTH_TOKEN: z.ZodOptional<z.ZodString>;
        QDRANT_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MINDFULNESS_AGENT_ID: z.ZodOptional<z.ZodString>;
        FORGE_VOICE_REGISTER_TOKEN: z.ZodOptional<z.ZodString>;
        AGENTMAIL_API_KEY: z.ZodOptional<z.ZodString>;
        AGENTMAIL_INBOX_ID: z.ZodOptional<z.ZodString>;
        AGENT_EMAIL: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_EMAIL: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_ID: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        NETATMO_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_ACCESS_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_PASSWORD: z.ZodOptional<z.ZodString>;
        INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
        X9_INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
    }, z.core.$catchall<z.ZodString>>;
    llmConfig: z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
    }, z.core.$strip>;
    telegramAllowFrom: z.ZodArray<z.ZodString>;
    inboundForwardUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tenantId: z.ZodOptional<z.ZodString>;
    workspacePath: z.ZodString;
    registryPath: z.ZodString;
    telegramBotToken: z.ZodOptional<z.ZodString>;
    displayName: z.ZodString;
    configVersion: z.ZodOptional<z.ZodNumber>;
    identity: z.ZodOptional<z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    channelConfigurations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            email: "email";
            telegram: "telegram";
        }>;
        desired: z.ZodObject<{
            version: z.ZodNumber;
            state: z.ZodEnum<{
                active: "active";
                paused: "paused";
            }>;
        }, z.core.$strict>;
        access: z.ZodOptional<z.ZodObject<{
            desiredPolicy: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"telegram">;
                mode: z.ZodEnum<{
                    "approved-chats": "approved-chats";
                    anyone: "anyone";
                }>;
                chats: z.ZodArray<z.ZodObject<{
                    chatId: z.ZodString;
                    type: z.ZodEnum<{
                        group: "group";
                        private: "private";
                        supergroup: "supergroup";
                    }>;
                    name: z.ZodString;
                    admittedAt: z.ZodISODateTime;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"email">;
                mode: z.ZodEnum<{
                    anyone: "anyone";
                    "address-book": "address-book";
                }>;
            }, z.core.$strict>], "kind">;
            appliedPolicy: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"telegram">;
                mode: z.ZodEnum<{
                    "approved-chats": "approved-chats";
                    anyone: "anyone";
                }>;
                chats: z.ZodArray<z.ZodObject<{
                    chatId: z.ZodString;
                    type: z.ZodEnum<{
                        group: "group";
                        private: "private";
                        supergroup: "supergroup";
                    }>;
                    name: z.ZodString;
                    admittedAt: z.ZodISODateTime;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"email">;
                mode: z.ZodEnum<{
                    anyone: "anyone";
                    "address-book": "address-book";
                }>;
            }, z.core.$strict>], "kind">>;
        }, z.core.$strict>>;
        applied: z.ZodNullable<z.ZodObject<{
            version: z.ZodNumber;
            state: z.ZodEnum<{
                active: "active";
                paused: "paused";
            }>;
        }, z.core.$strict>>;
        resource: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodEnum<{
                telegram: "telegram";
            }>;
            resource: z.ZodObject<{
                agent_id: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                bot_username: z.ZodString;
                created_at: z.ZodString;
            }, z.core.$strict>;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodEnum<{
                email: "email";
            }>;
            resource: z.ZodObject<{
                agent_id: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                provider_inbox_id: z.ZodString;
                address: z.ZodString;
                display_name: z.ZodNullable<z.ZodString>;
                created_at: z.ZodString;
            }, z.core.$strict>;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strict>], "kind">>;
        observation: z.ZodNullable<z.ZodObject<{
            channelId: z.ZodString;
            kind: z.ZodUnion<[z.ZodEnum<{
                email: "email";
                voice: "voice";
                telegram: "telegram";
                whatsapp: "whatsapp";
            }>, z.ZodLiteral<"web">]>;
            state: z.ZodEnum<{
                error: "error";
                unknown: "unknown";
                stopped: "stopped";
                loaded: "loaded";
                paused: "paused";
            }>;
            loaded: z.ZodNullable<z.ZodBoolean>;
            readiness: z.ZodEnum<{
                unknown: "unknown";
                ready: "ready";
                "not-ready": "not-ready";
            }>;
            botUsername: z.ZodOptional<z.ZodString>;
            allowFromCount: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        observedAt: z.ZodNullable<z.ZodISODateTime>;
        error: z.ZodNullable<z.ZodObject<{
            code: z.ZodEnum<{
                source_unavailable: "source_unavailable";
                resource_missing: "resource_missing";
                resource_conflict: "resource_conflict";
                provider_unavailable: "provider_unavailable";
                provider_rejected: "provider_rejected";
                account_blocked: "account_blocked";
                load_failed: "load_failed";
                apply_failed: "apply_failed";
                reconcile_pending: "reconcile_pending";
                first_check_failed: "first_check_failed";
            }>;
            retryable: z.ZodBoolean;
        }, z.core.$strict>>;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
    }, z.core.$strict>>>;
    voiceConfiguration: z.ZodOptional<z.ZodObject<{
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        versions: z.ZodObject<{
            desired: z.ZodNumber;
            applied: z.ZodNullable<z.ZodNumber>;
            failed: z.ZodNullable<z.ZodObject<{
                version: z.ZodNumber;
                reason: z.ZodObject<{
                    code: z.ZodEnum<{
                        unknown: "unknown";
                        "not-loaded": "not-loaded";
                        "load-failed": "load-failed";
                        "validation-failed": "validation-failed";
                        timeout: "timeout";
                        "source-unavailable": "source-unavailable";
                        "shared-runtime": "shared-runtime";
                        "externally-owned": "externally-owned";
                        "not-supported": "not-supported";
                        "in-progress": "in-progress";
                    }>;
                    detail: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>;
            }, z.core.$strict>>;
        }, z.core.$strip>;
        desired: z.ZodDiscriminatedUnion<[z.ZodObject<{
            mode: z.ZodLiteral<"text-only">;
        }, z.core.$strict>, z.ZodObject<{
            mode: z.ZodLiteral<"voice">;
            provider: z.ZodString;
            protocol: z.ZodEnum<{
                websocket: "websocket";
                webrtc: "webrtc";
                sip: "sip";
            }>;
            transports: z.ZodArray<z.ZodEnum<{
                web: "web";
                phone: "phone";
            }>>;
            voiceId: z.ZodString;
            model: z.ZodString;
            locale: z.ZodOptional<z.ZodString>;
            params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>>>;
        }, z.core.$strict>], "mode">;
        applied: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
            mode: z.ZodLiteral<"text-only">;
        }, z.core.$strict>, z.ZodObject<{
            mode: z.ZodLiteral<"voice">;
            provider: z.ZodString;
            protocol: z.ZodEnum<{
                websocket: "websocket";
                webrtc: "webrtc";
                sip: "sip";
            }>;
            transports: z.ZodArray<z.ZodEnum<{
                web: "web";
                phone: "phone";
            }>>;
            voiceId: z.ZodString;
            model: z.ZodString;
            locale: z.ZodOptional<z.ZodString>;
            params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>>>;
        }, z.core.$strict>], "mode">>;
    }, z.core.$strip>>;
    scopePolicy: z.ZodOptional<z.ZodObject<{
        version: z.ZodNumber;
        defaultWebSearch: z.ZodBoolean;
        scopeLimited: z.ZodBoolean;
        purpose: z.ZodOptional<z.ZodString>;
        defaults: z.ZodObject<{
            read: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
            write: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
        }, z.core.$strict>;
        rules: z.ZodArray<z.ZodObject<{
            capability: z.ZodString;
            tool: z.ZodOptional<z.ZodString>;
            read: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
            write: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    workspace: z.ZodOptional<z.ZodObject<{
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        tenantId: z.ZodOptional<z.ZodString>;
        version: z.ZodNumber;
        files: z.ZodArray<z.ZodObject<{
            name: z.ZodEnum<{
                "IDENTITY.md": "IDENTITY.md";
                "SOUL.md": "SOUL.md";
                "POLICIES.md": "POLICIES.md";
                "USER.md": "USER.md";
            }>;
            load: z.ZodLiteral<"always">;
            versions: z.ZodObject<{
                desired: z.ZodNumber;
                applied: z.ZodNullable<z.ZodNumber>;
                failed: z.ZodNullable<z.ZodObject<{
                    version: z.ZodNumber;
                    reason: z.ZodObject<{
                        code: z.ZodEnum<{
                            unknown: "unknown";
                            "not-loaded": "not-loaded";
                            "load-failed": "load-failed";
                            "validation-failed": "validation-failed";
                            timeout: "timeout";
                            "source-unavailable": "source-unavailable";
                            "shared-runtime": "shared-runtime";
                            "externally-owned": "externally-owned";
                            "not-supported": "not-supported";
                            "in-progress": "in-progress";
                        }>;
                        detail: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>;
                }, z.core.$strict>>;
            }, z.core.$strip>;
            history: z.ZodArray<z.ZodObject<{
                version: z.ZodNumber;
                origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"master">;
                    source: z.ZodObject<{
                        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
                    }, z.core.$strip>;
                    version: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"template">;
                    templateId: z.ZodString;
                    ownerId: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "OwnerId", "out">>;
                    version: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"agent">;
                }, z.core.$strict>], "kind">;
                hash: z.ZodString;
                bytes: z.ZodNumber;
                updatedAt: z.ZodISODateTime;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        tools: z.ZodObject<{
            name: z.ZodLiteral<"TOOLS.md">;
            origin: z.ZodLiteral<"generated">;
            editable: z.ZodLiteral<false>;
            load: z.ZodLiteral<"always">;
            version: z.ZodNumber;
            hash: z.ZodString;
            bytes: z.ZodNumber;
            updatedAt: z.ZodISODateTime;
        }, z.core.$strict>;
        registry: z.ZodObject<{
            capabilities: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                enabled: z.ZodBoolean;
                host: z.ZodString;
                port: z.ZodNumber;
                version: z.ZodString;
                protocol: z.ZodOptional<z.ZodEnum<{
                    http: "http";
                    https: "https";
                }>>;
                tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    description: z.ZodString;
                    inputSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                }, z.core.$strip>>>;
                modelPolicy: z.ZodOptional<z.ZodObject<{
                    min: z.ZodEnum<{
                        standard: "standard";
                        advanced: "advanced";
                        reasoning: "reasoning";
                    }>;
                    max: z.ZodEnum<{
                        standard: "standard";
                        advanced: "advanced";
                        reasoning: "reasoning";
                    }>;
                }, z.core.$strip>>;
                requires: z.ZodOptional<z.ZodArray<z.ZodString>>;
                credentialRequirements: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodLazy<z.ZodString>;
                    required: z.ZodBoolean;
                }, z.core.$strict>>>;
                context: z.ZodOptional<z.ZodObject<{
                    maxChars: z.ZodNumber;
                }, z.core.$strip>>;
                turnLead: z.ZodOptional<z.ZodObject<{}, z.core.$strict>>;
                parameters: z.ZodOptional<z.ZodObject<{
                    parameters: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"number">;
                        min: z.ZodOptional<z.ZodNumber>;
                        max: z.ZodOptional<z.ZodNumber>;
                        platformDefault: z.ZodOptional<z.ZodNumber>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"integer">;
                        min: z.ZodOptional<z.ZodNumber>;
                        max: z.ZodOptional<z.ZodNumber>;
                        platformDefault: z.ZodOptional<z.ZodNumber>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"string">;
                        minLength: z.ZodOptional<z.ZodNumber>;
                        maxLength: z.ZodOptional<z.ZodNumber>;
                        pattern: z.ZodOptional<z.ZodString>;
                        platformDefault: z.ZodOptional<z.ZodString>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"boolean">;
                        platformDefault: z.ZodOptional<z.ZodBoolean>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"enum">;
                        options: z.ZodArray<z.ZodObject<{
                            value: z.ZodString;
                            label: z.ZodString;
                        }, z.core.$strict>>;
                        platformDefault: z.ZodOptional<z.ZodString>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"string_list">;
                        minItems: z.ZodOptional<z.ZodNumber>;
                        maxItems: z.ZodOptional<z.ZodNumber>;
                        options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            value: z.ZodString;
                            label: z.ZodString;
                        }, z.core.$strict>>>;
                        pattern: z.ZodOptional<z.ZodString>;
                        platformDefault: z.ZodOptional<z.ZodArray<z.ZodString>>;
                        key: z.ZodString;
                        label: z.ZodString;
                        description: z.ZodString;
                        explanation: z.ZodOptional<z.ZodString>;
                        group: z.ZodOptional<z.ZodString>;
                        unit: z.ZodOptional<z.ZodString>;
                        status: z.ZodEnum<{
                            decided: "decided";
                            proposed: "proposed";
                        }>;
                        reference: z.ZodString;
                        appliesWhen: z.ZodEnum<{
                            immediate: "immediate";
                            next_apply: "next_apply";
                        }>;
                        consumes: z.ZodBoolean;
                        optional: z.ZodBoolean;
                        editableBy: z.ZodArray<z.ZodEnum<{
                            superadmin: "superadmin";
                            owner: "owner";
                        }>>;
                    }, z.core.$strict>], "type">>;
                    consumes: z.ZodBoolean;
                    spendLedger: z.ZodBoolean;
                }, z.core.$strict>>;
                presentation: z.ZodOptional<z.ZodObject<{
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
                            min: z.ZodOptional<z.ZodNumber>;
                            max: z.ZodOptional<z.ZodNumber>;
                        }, z.core.$strict>>;
                    }, z.core.$strict>>;
                    feedback: z.ZodOptional<z.ZodObject<{
                        label: z.ZodString;
                        kind: z.ZodEnum<{
                            rating: "rating";
                            approval: "approval";
                        }>;
                        attachments: z.ZodBoolean;
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
                }, z.core.$strict>>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        skills: z.ZodArray<z.ZodObject<{
            capability: z.ZodString;
            description: z.ZodString;
            procedure: z.ZodObject<{
                path: z.ZodString;
                load: z.ZodLiteral<"on-demand">;
                editable: z.ZodLiteral<false>;
                version: z.ZodNumber;
                hash: z.ZodString;
                bytes: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$loose>;
export type AgentContextWithWorkspace = z.infer<typeof AgentContextWithWorkspaceSchema>;
/** Version comes only from a validated applied bundle; never guess from file histories or configVersion. */
export declare function appliedWorkspaceVersion(ctx: Pick<AgentContextWithWorkspace, 'workspace'>): number | null;
/**
 * Read only a validated wire attestation. Never derive readiness/version from configVersion, desired files,
 * file histories, registry metadata or another row. Forge compares this bundle with the archived descriptor
 * for its configuration snapshot; X9 supplies it only after loading the effective verified snapshot.
 */
export declare function attestedWorkspaceVersionOf(row: unknown): number | null;
//# sourceMappingURL=agent-workspace.d.ts.map