import { z } from 'zod';
export declare const DEV_SIGNED_COMMAND_V2_DOMAIN = "x9.cap-dev.command";
/** The complete scope is signed; omitted report digests are encoded as null. */
export declare const DevSignedCommandV2Schema: z.ZodObject<{
    version: z.ZodLiteral<2>;
    domain: z.ZodLiteral<"x9.cap-dev.command">;
    tenantId: z.ZodString;
    ownerId: z.ZodString;
    agentId: z.ZodString;
    boardId: z.ZodString;
    computerId: z.ZodString;
    projectId: z.ZodString;
    issueId: z.ZodString;
    command: z.ZodEnum<{
        status: "status";
        start: "start";
        stop: "stop";
        plan: "plan";
        report: "report";
    }>;
    reportDigest: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    configVersion: z.ZodNumber;
    keyVersion: z.ZodNumber;
    requestId: z.ZodString;
    nonce: z.ZodString;
    expiresAt: z.ZodISODateTime;
}, z.core.$strict>;
export type DevSignedCommandV2 = z.infer<typeof DevSignedCommandV2Schema>;
/** Encode the returned compact JSON string as UTF-8 before signing/verifying. */
export declare function canonicalizeDevSignedCommandV2(msg: z.input<typeof DevSignedCommandV2Schema>): string;
//# sourceMappingURL=signed-command.d.ts.map