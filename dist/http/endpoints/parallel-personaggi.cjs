"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.officinaVideoParallelImportContract = exports.parallelCharacterExportContract = void 0;
const zod_1 = require("zod");
const personaggio_parallel_js_1 = require("../../capability/video/personaggio-parallel.cjs");
const personaggio_parallel_import_js_1 = require("../../capability/video/personaggio-parallel-import.cjs");
const modella_js_1 = require("../../capability/video/modella.cjs");
const engine_js_1 = require("../../capability/video/engine.cjs");
/** cap-video -> Parallel canon-orchestrator: export characters. Internal, INTERNAL_SECRET_HEADER. */
exports.parallelCharacterExportContract = {
    method: 'GET',
    path: '/companion/export-characters',
    paramsSchema: zod_1.z.object({}).strict(),
    querySchema: personaggio_parallel_js_1.VideoParallelExportQuerySchema,
    responseSchema: personaggio_parallel_js_1.VideoParallelExportSchema,
    errorSchema: personaggio_parallel_js_1.VideoParallelExportErrorSchema,
    responseStatus: 200,
};
/** cap-video -> engine: import a Parallel character. Identity in the query. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoParallelImportContract = {
    method: 'POST',
    path: '/api/modelle/da-parallel',
    paramsSchema: zod_1.z.object({}).strict(),
    querySchema: modella_js_1.VideoModelScopeQuerySchema,
    requestSchema: personaggio_parallel_import_js_1.VideoParallelImportRequestSchema,
    responseSchema: personaggio_parallel_import_js_1.VideoParallelImportResultSchema,
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    responseStatus: 201,
};
//# sourceMappingURL=parallel-personaggi.js.map