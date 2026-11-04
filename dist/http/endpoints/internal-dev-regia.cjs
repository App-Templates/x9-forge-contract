"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalDevRegiaResultContract = exports.internalDevRegiaOpenContract = void 0;
exports.internalDevRegiaResultPath = internalDevRegiaResultPath;
const zod_1 = require("zod");
const regia_js_1 = require("../../capability/video/regia.cjs");
/**
 * cap-video → cap-dev: open the regia of a video project as a `design` session on the session board.
 * Internal only, authenticated with INTERNAL_SECRET_HEADER; the identity in the body is admitted only from a service
 * and resolved again by cap-dev against the platform inventory. 200 with the incarico, 4xx/5xx with VideoRegiaError.
 */
exports.internalDevRegiaOpenContract = {
    method: 'POST',
    path: '/internal/dev/regia',
    authType: 'secret',
    paramsSchema: zod_1.z.object({}).strict(),
    requestSchema: regia_js_1.VideoRegiaRequestSchema,
    responseSchema: regia_js_1.VideoRegiaOpenResponseSchema,
    errorSchema: regia_js_1.VideoRegiaErrorSchema,
};
/**
 * cap-video → cap-dev: the verified result of one regia, for the identity that opened it. Read-only POST (the identity
 * travels in the body, never in the URL). Internal only, INTERNAL_SECRET_HEADER.
 */
exports.internalDevRegiaResultContract = {
    method: 'POST',
    path: '/internal/dev/regia/:regiaId/result',
    authType: 'secret',
    paramsSchema: zod_1.z.strictObject({ regiaId: zod_1.z.coerce.number().pipe(regia_js_1.VideoRegiaIdSchema) }),
    requestSchema: regia_js_1.VideoRegiaResultRequestSchema,
    responseSchema: regia_js_1.VideoRegiaResultSchema,
    errorSchema: regia_js_1.VideoRegiaErrorSchema,
};
function internalDevRegiaResultPath(regiaId) {
    const id = regia_js_1.VideoRegiaIdSchema.parse(regiaId);
    return exports.internalDevRegiaResultContract.path.replace(':regiaId', String(id));
}
//# sourceMappingURL=internal-dev-regia.js.map