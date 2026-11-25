import { z } from 'zod';
import { VideoOutfitStyleRequestSchema, VideoOutfitStyleResultSchema } from "./abito-stile.js";
import { VideoModelIdSchema, VideoModelRefKindSchema } from "./modella.js";
import { VIDEO_PARALLEL_MAX_PORTRAITS, VideoParallelCharacterIdSchema, VideoParallelCommunityIdSchema, VideoParallelMissingSchema, } from "./personaggio-parallel.js";
import { VideoParallelImportRequestSchema, VideoParallelImportResultSchema } from "./personaggio-parallel-import.js";
export const VIDEO_CHARACTER_LIST_TOOL = 'video_character_list';
export const VIDEO_CHARACTER_IMPORT_TOOL = 'video_character_import';
export const VIDEO_CHARACTER_OUTFIT_STYLE_TOOL = 'video_character_outfit_style';
/** Identity (tenant, owner, agent, requestedBy) comes only from the admitted tool envelope (R-33). */
export const VideoCharacterListToolInputSchema = z.strictObject({
    communityId: VideoParallelCommunityIdSchema.describe('Identificativo della comunità di Parallel (26 caratteri).'),
}).describe('Elenca i personaggi di Parallel utilizzabili, con viste mancanti e consenso.');
export const VideoCharacterImportToolInputSchema = z.strictObject({
    communityId: VideoParallelImportRequestSchema.shape.communityId.describe('Identificativo della comunità di Parallel.'),
    characterId: VideoParallelImportRequestSchema.shape.characterId.describe('Identificativo del personaggio in Parallel.'),
    version: VideoParallelImportRequestSchema.shape.version.describe('Impronta della versione da importare, in esadecimale minuscolo; se manca, la più recente.'),
    name: VideoParallelImportRequestSchema.shape.name.describe('Nome della modella; se manca, quello del personaggio.'),
}).describe('Importa un personaggio di Parallel come modella fissa.');
export const VideoCharacterOutfitStyleToolInputSchema = z.strictObject({
    modelId: VideoModelIdSchema.describe('Identificativo della modella già importata da Parallel.'),
    request: VideoOutfitStyleRequestSchema.shape.request.describe('Che abito si vuole, in poche parole (fino a 300 caratteri).'),
}).describe('Compone un abito per la modella, coerente con lo stile del personaggio.');
/** Listing item: never the backstory and never portrait addresses. */
export const VideoCharacterListItemSchema = z.strictObject({
    characterId: VideoParallelCharacterIdSchema,
    name: z.string().min(1).max(200),
    version: VideoParallelImportResultSchema.shape.sourceVersion,
    consent: z.enum(['valido', 'assente', 'revocato']),
    viewsDeclared: z.array(VideoModelRefKindSchema).max(4),
    portraitCount: z.number().int().min(0).max(VIDEO_PARALLEL_MAX_PORTRAITS),
    voiceAssigned: z.boolean(),
    missing: z.array(VideoParallelMissingSchema).max(7),
    alreadyImportedAs: VideoModelIdSchema.nullable(),
});
export const VIDEO_CHARACTER_LIST_REASONS = [
    'parallel_non_collegato',
    'comunita_non_trovata',
    'comunita_non_pronta',
    'non_autorizzato',
    'nessun_gruppo_per_te',
    'parallel_non_disponibile',
    'motore_non_disponibile',
];
export const VIDEO_CHARACTER_IMPORT_REASONS = [
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
export const VIDEO_CHARACTER_OUTFIT_STYLE_REASONS = [
    'non_da_parallel',
    'richiesta_non_valida',
    'modello_sconosciuto',
    'motore_non_disponibile',
];
export const VideoCharacterListToolResponseSchema = z.discriminatedUnion('status', [
    z.strictObject({
        status: z.literal('elenco'),
        communityId: VideoParallelCommunityIdSchema,
        characters: z.array(VideoCharacterListItemSchema).max(50),
    }),
    z.strictObject({ status: z.literal('rifiutata'), reason: z.enum(VIDEO_CHARACTER_LIST_REASONS), message: z.string() }),
]);
export const VideoCharacterImportToolResponseSchema = z.discriminatedUnion('status', [
    z.strictObject({ status: z.literal('importato'), result: VideoParallelImportResultSchema }),
    z.strictObject({ status: z.literal('rifiutata'), reason: z.enum(VIDEO_CHARACTER_IMPORT_REASONS), message: z.string() }),
]);
export const VideoCharacterOutfitStyleToolResponseSchema = z.discriminatedUnion('status', [
    z.strictObject({ status: z.literal('composta'), ...VideoOutfitStyleResultSchema.shape }),
    z.strictObject({ status: z.literal('rifiutata'), reason: z.enum(VIDEO_CHARACTER_OUTFIT_STYLE_REASONS), message: z.string() }),
]);
//# sourceMappingURL=personaggio-parallel-tool.js.map