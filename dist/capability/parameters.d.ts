import { z } from 'zod';
/** B1: ordinary configuration, never credentials. No product default is selected by the bridge. */
export declare const CapabilityParameterKeySchema: z.ZodString;
export declare const CapabilityParameterValueSchema: z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean]>;
export declare const CapabilityParameterOriginSchema: z.ZodEnum<{
    platform_default: "platform_default";
    agent_override: "agent_override";
    needs_choice: "needs_choice";
}>;
export declare const CapabilityParameterStatusSchema: z.ZodEnum<{
    decided: "decided";
    proposed: "proposed";
}>;
export declare const CapabilityParameterApplicationSchema: z.ZodEnum<{
    immediate: "immediate";
    next_apply: "next_apply";
}>;
export declare const CapabilityParameterOptionSchema: z.ZodObject<{
    value: z.ZodString;
    label: z.ZodString;
}, z.core.$strict>;
export declare const CapabilityParameterSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"string">;
    minLength: z.ZodOptional<z.ZodNumber>;
    maxLength: z.ZodOptional<z.ZodNumber>;
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
}, z.core.$strict>], "type">;
export type CapabilityParameter = z.infer<typeof CapabilityParameterSchema>;
/** A resolved parameter carries the source of its value. Absence is explicit, never a fabricated default. */
export declare const CapabilityAgentParameterSchema: z.ZodObject<{
    parameter: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"string">;
        minLength: z.ZodOptional<z.ZodNumber>;
        maxLength: z.ZodOptional<z.ZodNumber>;
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
    }, z.core.$strict>], "type">;
    origin: z.ZodEnum<{
        platform_default: "platform_default";
        agent_override: "agent_override";
        needs_choice: "needs_choice";
    }>;
    value: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean]>>;
}, z.core.$strict>;
export type CapabilityAgentParameter = z.infer<typeof CapabilityAgentParameterSchema>;
export declare const CapabilityParametersDeclarationSchema: z.ZodObject<{
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
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"string">;
        minLength: z.ZodOptional<z.ZodNumber>;
        maxLength: z.ZodOptional<z.ZodNumber>;
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
    }, z.core.$strict>], "type">>;
    consumes: z.ZodBoolean;
    spendLedger: z.ZodBoolean;
}, z.core.$strict>;
export type CapabilityParametersDeclaration = z.infer<typeof CapabilityParametersDeclarationSchema>;
export declare const CapabilityAgentParametersSchema: z.ZodObject<{
    agentId: z.ZodString;
    capability: z.ZodString;
    version: z.ZodNumber;
    parameters: z.ZodArray<z.ZodObject<{
        parameter: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
        }, z.core.$strict>, z.ZodObject<{
            type: z.ZodLiteral<"string">;
            minLength: z.ZodOptional<z.ZodNumber>;
            maxLength: z.ZodOptional<z.ZodNumber>;
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
        }, z.core.$strict>], "type">;
        origin: z.ZodEnum<{
            platform_default: "platform_default";
            agent_override: "agent_override";
            needs_choice: "needs_choice";
        }>;
        value: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean]>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type CapabilityAgentParameters = z.infer<typeof CapabilityAgentParametersSchema>;
export type CapabilityParameterKey = z.infer<typeof CapabilityParameterKeySchema>;
export type CapabilityParameterValue = z.infer<typeof CapabilityParameterValueSchema>;
export type CapabilityParameterOrigin = z.infer<typeof CapabilityParameterOriginSchema>;
export type CapabilityParameterStatus = z.infer<typeof CapabilityParameterStatusSchema>;
export type CapabilityParameterApplication = z.infer<typeof CapabilityParameterApplicationSchema>;
export type CapabilityParameterOption = z.infer<typeof CapabilityParameterOptionSchema>;
//# sourceMappingURL=parameters.d.ts.map