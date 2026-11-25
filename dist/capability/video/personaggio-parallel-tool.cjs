"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoCharacterOutfitStyleToolResponseSchema = exports.VideoCharacterImportToolResponseSchema = exports.VideoCharacterListToolResponseSchema = exports.VIDEO_CHARACTER_OUTFIT_STYLE_REASONS = exports.VIDEO_CHARACTER_IMPORT_REASONS = exports.VIDEO_CHARACTER_LIST_REASONS = exports.VideoCharacterListItemSchema = exports.VideoCharacterOutfitStyleToolInputSchema = exports.VideoCharacterImportToolInputSchema = exports.VideoCharacterListToolInputSchema = exports.VIDEO_CHARACTER_OUTFIT_STYLE_TOOL = exports.VIDEO_CHARACTER_IMPORT_TOOL = exports.VIDEO_CHARACTER_LIST_TOOL = void 0;
const zod_1 = require("zod");
const abito_stile_js_1 = require("./abito-stile.cjs");
const modella_js_1 = require("./modella.cjs");
const personaggio_parallel_js_1 = require("./personaggio-parallel.cjs");
const personaggio_parallel_import_js_1 = require("./personaggio-parallel-import.cjs");
exports.VIDEO_CHARACTER_LIST_TOOL = 'video_character_list';
exports.VIDEO_CHARACTER_IMPORT_TOOL = 'video_character_import';
exports.VIDEO_CHARACTER_OUTFIT_STYLE_TOOL = 'video_character_outfit_style';
/** Identity (tenant, owner, agent, requestedBy) comes only from the admitted tool envelope (R-33). */
exports.VideoCharacterListToolInputSchema = zod_1.z.strictObject({
    communityId: personaggio_parallel_js_1.VideoParallelCommunityIdSchema.describe('Identificativo della comunità di Parallel (26 caratteri).'),
}).describe('Elenca i personaggi di Parallel utilizzabili, con viste mancanti e consenso.');
exports.VideoCharacterImportToolInputSchema = zod_1.z.strictObject({
    communityId: personaggio_parallel_import_js_1.VideoParallelImportRequestSchema.shape.communityId.describe('Identificativo della comunità di Parallel.'),
    characterId: personaggio_parallel_import_js_1.VideoParallelImportRequestSchema.shape.characterId.describe('Identificativo del personaggio in Parallel.'),
    version: personaggio_parallel_import_js_1.VideoParallelImportRequestSchema.shape.version.describe('Impronta della versione da importare, in esadecimale minuscolo; se manca, la più recente.'),
    name: personaggio_parallel_import_js_1.VideoParallelImportRequestSchema.shape.name.describe('Nome della modella; se manca, quello del personaggio.'),
}).describe('Importa un personaggio di Parallel come modella fissa.');
exports.VideoCharacterOutfitStyleToolInputSchema = zod_1.z.strictObject({
    modelId: modella_js_1.VideoModelIdSchema.describe('Identificativo della modella già importata da Parallel.'),
    request: abito_stile_js_1.VideoOutfitStyleRequestSchema.shape.request.describe('Che abito si vuole, in poche parole (fino a 300 caratteri).'),
}).describe('Compone un abito per la modella, coerente con lo stile del personaggio.');
/** Listing item: never the backstory and never portrait addresses. */
exports.VideoCharacterListItemSchema = zod_1.z.strictObject({
    characterId: personaggio_parallel_js_1.VideoParallelCharacterIdSchema,
    name: zod_1.z.string().min(1).max(200),
    version: personaggio_parallel_import_js_1.VideoParallelImportResultSchema.shape.sourceVersion,
    consent: zod_1.z.enum(['valido', 'assente', 'revocato']),
    viewsDeclared: zod_1.z.array(modella_js_1.VideoModelRefKindSchema).max(4),
    portraitCount: zod_1.z.number().int().min(0).max(personaggio_parallel_js_1.VIDEO_PARALLEL_MAX_PORTRAITS),
    voiceAssigned: zod_1.z.boolean(),
    missing: zod_1.z.array(personaggio_parallel_js_1.VideoParallelMissingSchema).max(7),
    alreadyImportedAs: modella_js_1.VideoModelIdSchema.nullable(),
});
exports.VIDEO_CHARACTER_LIST_REASONS = [
    'parallel_non_collegato',
    'comunita_non_trovata',
    'comunita_non_pronta',
    'non_autorizzato',
    'nessun_gruppo_per_te',
    'parallel_non_disponibile',
    'motore_non_disponibile',
];
exports.VIDEO_CHARACTER_IMPORT_REASONS = [
    'comunita_non_trovata',
    'personaggio_non_trovato',
    'senza_consenso',
    'ritratto_illeggibile',
    'nome_esistente',
    'personaggio_gia_importato',
    'aspetto_incompleto',
    'fonte_non_disponibile',
    'motore_non_disponibile',
];
exports.VIDEO_CHARACTER_OUTFIT_STYLE_REASONS = [
    'non_da_parallel',
    'richiesta_non_valida',
    'modello_sconosciuto',
    'motore_non_disponibile',
];
exports.VideoCharacterListToolResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({
        status: zod_1.z.literal('elenco'),
        communityId: personaggio_parallel_js_1.VideoParallelCommunityIdSchema,
        characters: zod_1.z.array(exports.VideoCharacterListItemSchema).max(50),
    }),
    zod_1.z.strictObject({ status: zod_1.z.literal('rifiutata'), reason: zod_1.z.enum(exports.VIDEO_CHARACTER_LIST_REASONS), message: zod_1.z.string() }),
]);
exports.VideoCharacterImportToolResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('importato'), result: personaggio_parallel_import_js_1.VideoParallelImportResultSchema }),
    zod_1.z.strictObject({ status: zod_1.z.literal('rifiutata'), reason: zod_1.z.enum(exports.VIDEO_CHARACTER_IMPORT_REASONS), message: zod_1.z.string() }),
]);
exports.VideoCharacterOutfitStyleToolResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('composta'), ...abito_stile_js_1.VideoOutfitStyleResultSchema.shape }),
    zod_1.z.strictObject({ status: zod_1.z.literal('rifiutata'), reason: zod_1.z.enum(exports.VIDEO_CHARACTER_OUTFIT_STYLE_REASONS), message: zod_1.z.string() }),
]);
//# sourceMappingURL=personaggio-parallel-tool.js.map