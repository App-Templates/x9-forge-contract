"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.officinaVideoHealthContract = exports.officinaVideoJobContract = void 0;
const zod_1 = require("zod");
const engine_js_1 = require("../../capability/video/engine.cjs");
/** cap-video -> Officina video engine. Internal calls only, authenticated with INTERNAL_SECRET_HEADER. */
exports.officinaVideoJobContract = {
    method: 'POST',
    path: '/api/jobs',
    paramsSchema: zod_1.z.object({}).strict(),
    requestSchema: engine_js_1.VideoEngineJobSchema,
    responseSchema: engine_js_1.VideoEngineJobResponseSchema,
};
/** cap-video -> Officina video engine health probe. Internal calls only, authenticated with INTERNAL_SECRET_HEADER. */
exports.officinaVideoHealthContract = {
    method: 'GET',
    path: '/api/health',
    paramsSchema: zod_1.z.object({}).strict(),
};
//# sourceMappingURL=officina-video.js.map