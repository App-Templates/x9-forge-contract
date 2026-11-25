"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoParallelImportErrorSchema = exports.VideoParallelImportResultSchema = exports.VideoParallelImportRequestSchema = void 0;
const zod_1 = require("zod");
const modella_js_1 = require("./modella.cjs");
const personaggio_parallel_js_1 = require("./personaggio-parallel.cjs");
const Sha256Schema = zod_1.z.string().regex(/^[0-9a-f]{64}$/);
/** Ask the engine to import a Parallel character as a fixed model. */
exports.VideoParallelImportRequestSchema = zod_1.z.strictObject({
    requestedBy: zod_1.z.string().min(1).max(256),
    communityId: personaggio_parallel_js_1.VideoParallelCommunityIdSchema,
    characterId: personaggio_parallel_js_1.VideoParallelCharacterIdSchema,
    version: Sha256Schema.optional(),
    name: modella_js_1.VideoModelNameSchema.optional(),
    modelId: modella_js_1.VideoModelIdSchema.optional(),
});
/** Missing views are reported, never invented. */
exports.VideoParallelImportResultSchema = zod_1.z.strictObject({
    modelId: modella_js_1.VideoModelIdSchema,
    characterId: personaggio_parallel_js_1.VideoParallelCharacterIdSchema,
    sourceVersion: Sha256Schema.nullable(),
    viewsPresent: zod_1.z.array(modella_js_1.VideoModelRefKindSchema).max(4),
    viewsMissing: zod_1.z.array(modella_js_1.VideoModelRefKindSchema).max(4),
    voiceAssigned: zod_1.z.boolean(),
    importedAt: zod_1.z.string().min(1).max(40),
});
exports.VideoParallelImportErrorSchema = zod_1.z.strictObject({
    error: zod_1.z.enum([
        'comunita_non_trovata', 'personaggio_non_trovato', 'senza_consenso', 'ritratto_illeggibile', 'motore_non_disponibile',
    ]),
});
//# sourceMappingURL=personaggio-parallel-import.js.map