import { z } from 'zod';
import { VideoEnvironmentAngleRequestSchema, VideoEnvironmentApproveRequestSchema, VideoEnvironmentCreateRequestSchema, VideoEnvironmentDescriptionSchema, VideoEnvironmentIdSchema, VideoEnvironmentListSchema, VideoEnvironmentSchema, VideoEnvironmentVersionNumberSchema, VideoEnvironmentVersionSchema, } from "./ambiente.js";
export const VIDEO_ENVIRONMENT_LIST_TOOL = 'video_environment_list';
export const VIDEO_ENVIRONMENT_GET_TOOL = 'video_environment_get';
export const VIDEO_ENVIRONMENT_CREATE_TOOL = 'video_environment_create';
export const VIDEO_ENVIRONMENT_VERSION_CREATE_TOOL = 'video_environment_version_create';
export const VIDEO_ENVIRONMENT_ANGLE_ADD_TOOL = 'video_environment_angle_add';
export const VIDEO_ENVIRONMENT_APPROVE_TOOL = 'video_environment_approve';
const environmentId = VideoEnvironmentIdSchema.describe('Identificativo dell\'ambiente (minuscole, numeri e trattini).');
const version = VideoEnvironmentVersionNumberSchema.describe('Numero della versione dell\'ambiente, da 1 a 50.');
/** Identity (tenant, owner, agent, requestedBy) comes only from the admitted tool envelope (R-33). */
export const VideoEnvironmentListToolInputSchema = z
    .strictObject({})
    .describe('Elenca gli ambienti della libreria, con le loro versioni.');
export const VideoEnvironmentGetToolInputSchema = z
    .strictObject({ environmentId })
    .describe('Legge un ambiente con le sue versioni e le sue angolazioni.');
export const VideoEnvironmentCreateToolInputSchema = z
    .strictObject({
    name: VideoEnvironmentCreateRequestSchema.shape.name.describe('Nome dell\'ambiente, per esempio «Studio podcast».'),
    kind: VideoEnvironmentCreateRequestSchema.shape.kind.describe('Tipo di ambiente: studio, esterno o documentario.'),
    description: VideoEnvironmentCreateRequestSchema.shape.description.describe('Descrizione della prima versione: stanza, arredi e luce.'),
})
    .describe('Crea un ambiente nuovo con la sua prima versione in bozza.');
export const VideoEnvironmentVersionCreateToolInputSchema = z
    .strictObject({
    environmentId,
    description: VideoEnvironmentDescriptionSchema.describe('Descrizione della nuova versione: stanza, arredi e luce.'),
})
    .describe('Aggiunge una nuova versione in bozza a un ambiente esistente.');
export const VideoEnvironmentAngleAddToolInputSchema = z
    .strictObject({
    environmentId,
    version,
    projectId: VideoEnvironmentAngleRequestSchema.shape.projectId.describe('Identificativo del progetto che paga l\'immagine.'),
    name: VideoEnvironmentAngleRequestSchema.shape.name.describe('Nome dell\'angolazione, in minuscolo, per esempio «controcampo».'),
    framing: VideoEnvironmentAngleRequestSchema.shape.framing.describe('Come è inquadrata l\'angolazione, in poche parole.'),
    modelId: VideoEnvironmentAngleRequestSchema.shape.modelId.describe('Identificativo della modella da mettere nell\'ambiente; vuoto (null) per il fondo senza persone.'),
    maxCostUsd: VideoEnvironmentAngleRequestSchema.shape.maxCostUsd.describe('Tetto di spesa in dollari per l\'immagine.'),
})
    .describe('Fa generare un\'angolazione di una versione dell\'ambiente, col personaggio dentro o a fondo vuoto.');
export const VideoEnvironmentApproveToolInputSchema = z
    .strictObject({
    environmentId,
    version,
    digest: VideoEnvironmentApproveRequestSchema.shape.digest.describe('Impronta della versione che si approva, 64 caratteri esadecimali minuscoli.'),
})
    .describe('Approva una versione dell\'ambiente, così il seguito la eredita.');
export const VIDEO_ENVIRONMENT_GET_REASONS = ['ambiente_non_trovato', 'motore_non_disponibile'];
export const VIDEO_ENVIRONMENT_CREATE_REASONS = ['nome_esistente', 'richiesta_non_valida', 'motore_non_disponibile'];
export const VIDEO_ENVIRONMENT_VERSION_CREATE_REASONS = [
    'ambiente_non_trovato',
    'versioni_troppe',
    'richiesta_non_valida',
    'motore_non_disponibile',
];
export const VIDEO_ENVIRONMENT_ANGLE_ADD_REASONS = [
    'progetto_sconosciuto',
    'ambiente_non_trovato',
    'versione_non_trovata',
    'versione_approvata',
    'angolazione_esistente',
    'angolazioni_troppe',
    'modello_non_approvato',
    'riferimento_alterato',
    'costo_oltre_tetto',
    'budget_insufficiente',
    'generazione_fallita',
    'generazione_non_disponibile',
    'richiesta_non_valida',
    'motore_non_disponibile',
];
export const VIDEO_ENVIRONMENT_APPROVE_REASONS = [
    'ambiente_non_trovato',
    'versione_non_trovata',
    'versione_approvata',
    'digest_cambiato',
    'senza_angolazioni',
    'motore_non_disponibile',
];
export const VideoEnvironmentListToolResponseSchema = VideoEnvironmentListSchema;
export const VideoEnvironmentGetToolResponseSchema = z.discriminatedUnion('status', [
    z.strictObject({ status: z.literal('trovato'), environment: VideoEnvironmentSchema }),
    z.strictObject({ status: z.literal('rifiutata'), reason: z.enum(VIDEO_ENVIRONMENT_GET_REASONS), message: z.string() }),
]);
export const VideoEnvironmentCreateToolResponseSchema = z.discriminatedUnion('status', [
    z.strictObject({ status: z.literal('creato'), environment: VideoEnvironmentSchema }),
    z.strictObject({ status: z.literal('rifiutata'), reason: z.enum(VIDEO_ENVIRONMENT_CREATE_REASONS), message: z.string() }),
]);
export const VideoEnvironmentVersionCreateToolResponseSchema = z.discriminatedUnion('status', [
    z.strictObject({ status: z.literal('versione_creata'), version: VideoEnvironmentVersionSchema }),
    z.strictObject({
        status: z.literal('rifiutata'),
        reason: z.enum(VIDEO_ENVIRONMENT_VERSION_CREATE_REASONS),
        message: z.string(),
    }),
]);
export const VideoEnvironmentAngleAddToolResponseSchema = z.discriminatedUnion('status', [
    z.strictObject({ status: z.literal('angolazione_aggiunta'), version: VideoEnvironmentVersionSchema }),
    z.strictObject({ status: z.literal('rifiutata'), reason: z.enum(VIDEO_ENVIRONMENT_ANGLE_ADD_REASONS), message: z.string() }),
]);
export const VideoEnvironmentApproveToolResponseSchema = z.discriminatedUnion('status', [
    z.strictObject({ status: z.literal('approvata'), version: VideoEnvironmentVersionSchema }),
    z.strictObject({ status: z.literal('rifiutata'), reason: z.enum(VIDEO_ENVIRONMENT_APPROVE_REASONS), message: z.string() }),
]);
//# sourceMappingURL=ambiente-tool.js.map