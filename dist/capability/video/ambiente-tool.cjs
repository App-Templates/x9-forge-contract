"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoEnvironmentApproveToolResponseSchema = exports.VideoEnvironmentAngleAddToolResponseSchema = exports.VideoEnvironmentVersionCreateToolResponseSchema = exports.VideoEnvironmentCreateToolResponseSchema = exports.VideoEnvironmentGetToolResponseSchema = exports.VideoEnvironmentListToolResponseSchema = exports.VIDEO_ENVIRONMENT_APPROVE_REASONS = exports.VIDEO_ENVIRONMENT_ANGLE_ADD_REASONS = exports.VIDEO_ENVIRONMENT_VERSION_CREATE_REASONS = exports.VIDEO_ENVIRONMENT_CREATE_REASONS = exports.VIDEO_ENVIRONMENT_GET_REASONS = exports.VideoEnvironmentApproveToolInputSchema = exports.VideoEnvironmentAngleAddToolInputSchema = exports.VideoEnvironmentVersionCreateToolInputSchema = exports.VideoEnvironmentCreateToolInputSchema = exports.VideoEnvironmentGetToolInputSchema = exports.VideoEnvironmentListToolInputSchema = exports.VIDEO_ENVIRONMENT_APPROVE_TOOL = exports.VIDEO_ENVIRONMENT_ANGLE_ADD_TOOL = exports.VIDEO_ENVIRONMENT_VERSION_CREATE_TOOL = exports.VIDEO_ENVIRONMENT_CREATE_TOOL = exports.VIDEO_ENVIRONMENT_GET_TOOL = exports.VIDEO_ENVIRONMENT_LIST_TOOL = void 0;
const zod_1 = require("zod");
const ambiente_js_1 = require("./ambiente.cjs");
exports.VIDEO_ENVIRONMENT_LIST_TOOL = 'video_environment_list';
exports.VIDEO_ENVIRONMENT_GET_TOOL = 'video_environment_get';
exports.VIDEO_ENVIRONMENT_CREATE_TOOL = 'video_environment_create';
exports.VIDEO_ENVIRONMENT_VERSION_CREATE_TOOL = 'video_environment_version_create';
exports.VIDEO_ENVIRONMENT_ANGLE_ADD_TOOL = 'video_environment_angle_add';
exports.VIDEO_ENVIRONMENT_APPROVE_TOOL = 'video_environment_approve';
const environmentId = ambiente_js_1.VideoEnvironmentIdSchema.describe('Identificativo dell\'ambiente (minuscole, numeri e trattini).');
const version = ambiente_js_1.VideoEnvironmentVersionNumberSchema.describe('Numero della versione dell\'ambiente, da 1 a 50.');
/** Identity (tenant, owner, agent, requestedBy) comes only from the admitted tool envelope (R-33). */
exports.VideoEnvironmentListToolInputSchema = zod_1.z
    .strictObject({})
    .describe('Elenca gli ambienti della libreria, con le loro versioni.');
exports.VideoEnvironmentGetToolInputSchema = zod_1.z
    .strictObject({ environmentId })
    .describe('Legge un ambiente con le sue versioni e le sue angolazioni.');
exports.VideoEnvironmentCreateToolInputSchema = zod_1.z
    .strictObject({
    name: ambiente_js_1.VideoEnvironmentCreateRequestSchema.shape.name.describe('Nome dell\'ambiente, per esempio «Studio podcast».'),
    kind: ambiente_js_1.VideoEnvironmentCreateRequestSchema.shape.kind.describe('Tipo di ambiente: studio, esterno o documentario.'),
    description: ambiente_js_1.VideoEnvironmentCreateRequestSchema.shape.description.describe('Descrizione della prima versione: stanza, arredi e luce.'),
})
    .describe('Crea un ambiente nuovo con la sua prima versione in bozza.');
exports.VideoEnvironmentVersionCreateToolInputSchema = zod_1.z
    .strictObject({
    environmentId,
    description: ambiente_js_1.VideoEnvironmentDescriptionSchema.describe('Descrizione della nuova versione: stanza, arredi e luce.'),
})
    .describe('Aggiunge una nuova versione in bozza a un ambiente esistente.');
exports.VideoEnvironmentAngleAddToolInputSchema = zod_1.z
    .strictObject({
    environmentId,
    version,
    projectId: ambiente_js_1.VideoEnvironmentAngleRequestSchema.shape.projectId.describe('Identificativo del progetto che paga l\'immagine.'),
    name: ambiente_js_1.VideoEnvironmentAngleRequestSchema.shape.name.describe('Nome dell\'angolazione, in minuscolo, per esempio «controcampo».'),
    framing: ambiente_js_1.VideoEnvironmentAngleRequestSchema.shape.framing.describe('Come è inquadrata l\'angolazione, in poche parole.'),
    modelId: ambiente_js_1.VideoEnvironmentAngleRequestSchema.shape.modelId.describe('Identificativo della modella da mettere nell\'ambiente; vuoto (null) per il fondo senza persone.'),
    maxCostUsd: ambiente_js_1.VideoEnvironmentAngleRequestSchema.shape.maxCostUsd.describe('Tetto di spesa in dollari per l\'immagine.'),
})
    .describe('Fa generare un\'angolazione di una versione dell\'ambiente, col personaggio dentro o a fondo vuoto.');
exports.VideoEnvironmentApproveToolInputSchema = zod_1.z
    .strictObject({
    environmentId,
    version,
    digest: ambiente_js_1.VideoEnvironmentApproveRequestSchema.shape.digest.describe('Impronta della versione che si approva, 64 caratteri esadecimali minuscoli.'),
})
    .describe('Approva una versione dell\'ambiente, così il seguito la eredita.');
exports.VIDEO_ENVIRONMENT_GET_REASONS = ['ambiente_non_trovato', 'motore_non_disponibile'];
exports.VIDEO_ENVIRONMENT_CREATE_REASONS = ['nome_esistente', 'richiesta_non_valida', 'motore_non_disponibile'];
exports.VIDEO_ENVIRONMENT_VERSION_CREATE_REASONS = [
    'ambiente_non_trovato',
    'versioni_troppe',
    'richiesta_non_valida',
    'motore_non_disponibile',
];
exports.VIDEO_ENVIRONMENT_ANGLE_ADD_REASONS = [
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
exports.VIDEO_ENVIRONMENT_APPROVE_REASONS = [
    'ambiente_non_trovato',
    'versione_non_trovata',
    'versione_approvata',
    'digest_cambiato',
    'senza_angolazioni',
    'motore_non_disponibile',
];
exports.VideoEnvironmentListToolResponseSchema = ambiente_js_1.VideoEnvironmentListSchema;
exports.VideoEnvironmentGetToolResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('trovato'), environment: ambiente_js_1.VideoEnvironmentSchema }),
    zod_1.z.strictObject({ status: zod_1.z.literal('rifiutata'), reason: zod_1.z.enum(exports.VIDEO_ENVIRONMENT_GET_REASONS), message: zod_1.z.string() }),
]);
exports.VideoEnvironmentCreateToolResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('creato'), environment: ambiente_js_1.VideoEnvironmentSchema }),
    zod_1.z.strictObject({ status: zod_1.z.literal('rifiutata'), reason: zod_1.z.enum(exports.VIDEO_ENVIRONMENT_CREATE_REASONS), message: zod_1.z.string() }),
]);
exports.VideoEnvironmentVersionCreateToolResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('versione_creata'), version: ambiente_js_1.VideoEnvironmentVersionSchema }),
    zod_1.z.strictObject({
        status: zod_1.z.literal('rifiutata'),
        reason: zod_1.z.enum(exports.VIDEO_ENVIRONMENT_VERSION_CREATE_REASONS),
        message: zod_1.z.string(),
    }),
]);
exports.VideoEnvironmentAngleAddToolResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('angolazione_aggiunta'), version: ambiente_js_1.VideoEnvironmentVersionSchema }),
    zod_1.z.strictObject({ status: zod_1.z.literal('rifiutata'), reason: zod_1.z.enum(exports.VIDEO_ENVIRONMENT_ANGLE_ADD_REASONS), message: zod_1.z.string() }),
]);
exports.VideoEnvironmentApproveToolResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('approvata'), version: ambiente_js_1.VideoEnvironmentVersionSchema }),
    zod_1.z.strictObject({ status: zod_1.z.literal('rifiutata'), reason: zod_1.z.enum(exports.VIDEO_ENVIRONMENT_APPROVE_REASONS), message: zod_1.z.string() }),
]);
//# sourceMappingURL=ambiente-tool.js.map