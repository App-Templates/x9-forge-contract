import { z } from 'zod';
export type ElevenLabsNativeInputProperty = {
    type: 'string' | 'integer' | 'number' | 'boolean' | 'object';
    description?: string | undefined;
    enum?: string[] | undefined;
    minimum?: number | undefined;
    maximum?: number | undefined;
    minLength?: number | undefined;
    maxLength?: number | undefined;
    properties?: Record<string, ElevenLabsNativeInputProperty> | undefined;
    required?: string[] | undefined;
    additionalProperties?: false | undefined;
};
export declare const ElevenLabsNativeInputSchemaSchema: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<ElevenLabsNativeInputProperty, Record<string, unknown>>>;
export type ElevenLabsNativeInputSchema = z.infer<typeof ElevenLabsNativeInputSchemaSchema>;
export declare const ElevenLabsNativeHeaderLocatorSchema: z.ZodObject<{
    name: z.ZodString;
    source: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"credential">;
        key: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"session">;
        bindingId: z.ZodString;
    }, z.core.$strict>], "kind">;
}, z.core.$strict>;
export type ElevenLabsNativeHeaderLocator = z.infer<typeof ElevenLabsNativeHeaderLocatorSchema>;
export declare const ElevenLabsNativeClientToolSchema: z.ZodObject<{
    type: z.ZodLiteral<"client">;
    expects_response: z.ZodBoolean;
    response_timeout_secs: z.ZodNumber;
    execution_mode: z.ZodOptional<z.ZodEnum<{
        immediate: "immediate";
        post_tool_speech: "post_tool_speech";
    }>>;
    interruption_mode: z.ZodOptional<z.ZodEnum<{
        allow: "allow";
        block: "block";
    }>>;
    parameters: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<ElevenLabsNativeInputProperty, Record<string, unknown>>>;
    name: z.ZodString;
    description: z.ZodString;
}, z.core.$strict>;
export type ElevenLabsNativeClientTool = z.infer<typeof ElevenLabsNativeClientToolSchema>;
export declare const ElevenLabsNativeWebhookToolSchema: z.ZodObject<{
    type: z.ZodLiteral<"webhook">;
    response_timeout_secs: z.ZodNumber;
    api_schema: z.ZodObject<{
        method: z.ZodLiteral<"POST">;
        path: z.ZodString;
        request_body_schema: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<ElevenLabsNativeInputProperty, Record<string, unknown>>>;
        request_headers: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"credential">;
                key: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"session">;
                bindingId: z.ZodString;
            }, z.core.$strict>], "kind">;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    name: z.ZodString;
    description: z.ZodString;
}, z.core.$strict>;
export type ElevenLabsNativeWebhookTool = z.infer<typeof ElevenLabsNativeWebhookToolSchema>;
export declare const ElevenLabsNativeBuiltinToolSchema: z.ZodObject<{
    type: z.ZodLiteral<"system">;
    params: z.ZodObject<{
        system_tool_type: z.ZodEnum<{
            end_call: "end_call";
            skip_turn: "skip_turn";
        }>;
    }, z.core.$strict>;
    name: z.ZodString;
    description: z.ZodString;
}, z.core.$strict>;
export type ElevenLabsNativeBuiltinTool = z.infer<typeof ElevenLabsNativeBuiltinToolSchema>;
export declare const ElevenLabsNativeToolSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"client">;
    expects_response: z.ZodBoolean;
    response_timeout_secs: z.ZodNumber;
    execution_mode: z.ZodOptional<z.ZodEnum<{
        immediate: "immediate";
        post_tool_speech: "post_tool_speech";
    }>>;
    interruption_mode: z.ZodOptional<z.ZodEnum<{
        allow: "allow";
        block: "block";
    }>>;
    parameters: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<ElevenLabsNativeInputProperty, Record<string, unknown>>>;
    name: z.ZodString;
    description: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"webhook">;
    response_timeout_secs: z.ZodNumber;
    api_schema: z.ZodObject<{
        method: z.ZodLiteral<"POST">;
        path: z.ZodString;
        request_body_schema: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<ElevenLabsNativeInputProperty, Record<string, unknown>>>;
        request_headers: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"credential">;
                key: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"session">;
                bindingId: z.ZodString;
            }, z.core.$strict>], "kind">;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    name: z.ZodString;
    description: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"system">;
    params: z.ZodObject<{
        system_tool_type: z.ZodEnum<{
            end_call: "end_call";
            skip_turn: "skip_turn";
        }>;
    }, z.core.$strict>;
    name: z.ZodString;
    description: z.ZodString;
}, z.core.$strict>], "type">;
export type ElevenLabsNativeTool = z.infer<typeof ElevenLabsNativeToolSchema>;
export declare const ElevenLabsNativeToolsSchema: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"client">;
    expects_response: z.ZodBoolean;
    response_timeout_secs: z.ZodNumber;
    execution_mode: z.ZodOptional<z.ZodEnum<{
        immediate: "immediate";
        post_tool_speech: "post_tool_speech";
    }>>;
    interruption_mode: z.ZodOptional<z.ZodEnum<{
        allow: "allow";
        block: "block";
    }>>;
    parameters: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<ElevenLabsNativeInputProperty, Record<string, unknown>>>;
    name: z.ZodString;
    description: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"webhook">;
    response_timeout_secs: z.ZodNumber;
    api_schema: z.ZodObject<{
        method: z.ZodLiteral<"POST">;
        path: z.ZodString;
        request_body_schema: z.ZodPipe<z.ZodPipe<z.ZodCustom<Record<string, unknown>, Record<string, unknown>>, z.ZodRecord<z.ZodString, z.ZodUnknown>>, z.ZodTransform<ElevenLabsNativeInputProperty, Record<string, unknown>>>;
        request_headers: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"credential">;
                key: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"session">;
                bindingId: z.ZodString;
            }, z.core.$strict>], "kind">;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    name: z.ZodString;
    description: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"system">;
    params: z.ZodObject<{
        system_tool_type: z.ZodEnum<{
            end_call: "end_call";
            skip_turn: "skip_turn";
        }>;
    }, z.core.$strict>;
    name: z.ZodString;
    description: z.ZodString;
}, z.core.$strict>], "type">>;
export declare const ElevenLabsNativeToolReferenceSchema: z.ZodObject<{
    name: z.ZodString;
    kind: z.ZodEnum<{
        system: "system";
        webhook: "webhook";
        client: "client";
    }>;
}, z.core.$strict>;
//# sourceMappingURL=native-tools.d.ts.map