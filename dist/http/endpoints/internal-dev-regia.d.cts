import { z } from 'zod';
/**
 * cap-video → cap-dev: open the regia of a video project as a `design` session on the session board.
 * Internal only, authenticated with INTERNAL_SECRET_HEADER; the identity in the body is admitted only from a service
 * and resolved again by cap-dev against the platform inventory. 200 with the incarico, 4xx/5xx with VideoRegiaError.
 */
export declare const internalDevRegiaOpenContract: {
    readonly method: "POST";
    readonly path: "/internal/dev/regia";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{}, z.core.$strict>;
    readonly requestSchema: z.ZodObject<{
        identity: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        videoProjectId: z.ZodString;
        brief: z.ZodString;
        presetId: z.ZodString;
        footageCandidates: z.ZodArray<z.ZodString>;
        footage: z.ZodOptional<z.ZodArray<z.ZodString>>;
        recipe: z.ZodOptional<z.ZodString>;
        materials: z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            note: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        regiaId: z.ZodNumber;
        repeated: z.ZodBoolean;
        repo: z.ZodString;
        branch: z.ZodString;
    }, z.core.$strict>;
    readonly errorSchema: z.ZodObject<{
        code: z.ZodEnum<{
            unavailable: "unavailable";
            invalid_request: "invalid_request";
            not_found: "not_found";
            identity_refused: "identity_refused";
            board_error: "board_error";
        }>;
        error: z.ZodString;
    }, z.core.$strict>;
};
/**
 * cap-video → cap-dev: the verified result of one regia, for the identity that opened it. Read-only POST (the identity
 * travels in the body, never in the URL). Internal only, INTERNAL_SECRET_HEADER.
 */
export declare const internalDevRegiaResultContract: {
    readonly method: "POST";
    readonly path: "/internal/dev/regia/:regiaId/result";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        regiaId: z.ZodPipe<z.ZodCoercedNumber<unknown>, z.ZodNumber>;
    }, z.core.$strict>;
    readonly requestSchema: z.ZodObject<{
        identity: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        status: z.ZodLiteral<"pending">;
        regiaId: z.ZodNumber;
        boardState: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"failed">;
        regiaId: z.ZodNumber;
        reason: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"delivered">;
        regiaId: z.ZodNumber;
        repo: z.ZodString;
        branch: z.ZodString;
        commit: z.ZodString;
        link: z.ZodString;
        regia: z.ZodObject<{
            version: z.ZodLiteral<1>;
            scenes: z.ZodArray<z.ZodObject<{
                text: z.ZodString;
                tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>>;
            footage: z.ZodOptional<z.ZodArray<z.ZodString>>;
            outro: z.ZodObject<{
                title: z.ZodString;
                line: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>;
        regiaFile: z.ZodObject<{
            path: z.ZodString;
            sha256: z.ZodString;
            sizeBytes: z.ZodNumber;
        }, z.core.$strict>;
        graphicHtml: z.ZodString;
        graphicFile: z.ZodObject<{
            path: z.ZodString;
            sha256: z.ZodString;
            sizeBytes: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>], "status">;
    readonly errorSchema: z.ZodObject<{
        code: z.ZodEnum<{
            unavailable: "unavailable";
            invalid_request: "invalid_request";
            not_found: "not_found";
            identity_refused: "identity_refused";
            board_error: "board_error";
        }>;
        error: z.ZodString;
    }, z.core.$strict>;
};
export declare function internalDevRegiaResultPath(regiaId: number): string;
//# sourceMappingURL=internal-dev-regia.d.ts.map