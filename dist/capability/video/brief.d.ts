import { z } from 'zod';
export declare const VideoModeSchema: z.ZodEnum<{
    approval: "approval";
    autonomous: "autonomous";
}>;
export type VideoMode = z.infer<typeof VideoModeSchema>;
export declare const VideoPresetIdSchema: z.ZodString;
export type VideoPresetId = z.infer<typeof VideoPresetIdSchema>;
export declare const VideoBriefRequestSchema: z.ZodObject<{
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    requestedBy: z.ZodString;
    approverEmail: z.ZodEmail;
    presetId: z.ZodString;
    mode: z.ZodEnum<{
        approval: "approval";
        autonomous: "autonomous";
    }>;
    budgetUsd: z.ZodNumber;
    brief: z.ZodString;
    externalRef: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type VideoBriefRequest = z.infer<typeof VideoBriefRequestSchema>;
export declare const VideoProjectIdSchema: z.ZodString;
export type VideoProjectId = z.infer<typeof VideoProjectIdSchema>;
export declare const VideoProjectStateSchema: z.ZodEnum<{
    failed: "failed";
    created: "created";
    delivered: "delivered";
    planning: "planning";
    awaiting_approval: "awaiting_approval";
    producing: "producing";
}>;
export type VideoProjectState = z.infer<typeof VideoProjectStateSchema>;
export declare const VideoBriefResponseSchema: z.ZodObject<{
    projectId: z.ZodString;
    state: z.ZodEnum<{
        failed: "failed";
        created: "created";
        delivered: "delivered";
        planning: "planning";
        awaiting_approval: "awaiting_approval";
        producing: "producing";
    }>;
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    presetId: z.ZodString;
    mode: z.ZodEnum<{
        approval: "approval";
        autonomous: "autonomous";
    }>;
    budgetUsd: z.ZodNumber;
}, z.core.$strict>;
export type VideoBriefResponse = z.infer<typeof VideoBriefResponseSchema>;
//# sourceMappingURL=brief.d.ts.map