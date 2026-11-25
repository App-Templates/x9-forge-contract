import { z } from 'zod';
import {
  VideoEnvironmentAngleRequestSchema,
  VideoEnvironmentApproveRequestSchema,
  VideoEnvironmentCreateRequestSchema,
  VideoEnvironmentDescriptionSchema,
  VideoEnvironmentIdSchema,
  VideoEnvironmentVersionNumberSchema,
} from './ambiente.js';

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
export type VideoEnvironmentListToolInput = z.infer<typeof VideoEnvironmentListToolInputSchema>;

export const VideoEnvironmentGetToolInputSchema = z
  .strictObject({ environmentId })
  .describe('Legge un ambiente con le sue versioni e le sue angolazioni.');
export type VideoEnvironmentGetToolInput = z.infer<typeof VideoEnvironmentGetToolInputSchema>;

export const VideoEnvironmentCreateToolInputSchema = z
  .strictObject({
    name: VideoEnvironmentCreateRequestSchema.shape.name.describe('Nome dell\'ambiente, per esempio «Studio podcast».'),
    kind: VideoEnvironmentCreateRequestSchema.shape.kind.describe('Tipo di ambiente: studio, esterno o documentario.'),
    description: VideoEnvironmentCreateRequestSchema.shape.description.describe(
      'Descrizione della prima versione: stanza, arredi e luce.',
    ),
  })
  .describe('Crea un ambiente nuovo con la sua prima versione in bozza.');
export type VideoEnvironmentCreateToolInput = z.infer<typeof VideoEnvironmentCreateToolInputSchema>;

export const VideoEnvironmentVersionCreateToolInputSchema = z
  .strictObject({
    environmentId,
    description: VideoEnvironmentDescriptionSchema.describe('Descrizione della nuova versione: stanza, arredi e luce.'),
  })
  .describe('Aggiunge una nuova versione in bozza a un ambiente esistente.');
export type VideoEnvironmentVersionCreateToolInput = z.infer<typeof VideoEnvironmentVersionCreateToolInputSchema>;

export const VideoEnvironmentAngleAddToolInputSchema = z
  .strictObject({
    environmentId,
    version,
    projectId: VideoEnvironmentAngleRequestSchema.shape.projectId.describe('Identificativo del progetto che paga l\'immagine.'),
    name: VideoEnvironmentAngleRequestSchema.shape.name.describe('Nome dell\'angolazione, in minuscolo, per esempio «controcampo».'),
    framing: VideoEnvironmentAngleRequestSchema.shape.framing.describe('Come è inquadrata l\'angolazione, in poche parole.'),
    modelId: VideoEnvironmentAngleRequestSchema.shape.modelId.describe(
      'Identificativo della modella da mettere nell\'ambiente; vuoto (null) per il fondo senza persone.',
    ),
    maxCostUsd: VideoEnvironmentAngleRequestSchema.shape.maxCostUsd.describe('Tetto di spesa in dollari per l\'immagine.'),
  })
  .describe('Fa generare un\'angolazione di una versione dell\'ambiente, col personaggio dentro o a fondo vuoto.');
export type VideoEnvironmentAngleAddToolInput = z.infer<typeof VideoEnvironmentAngleAddToolInputSchema>;

export const VideoEnvironmentApproveToolInputSchema = z
  .strictObject({
    environmentId,
    version,
    digest: VideoEnvironmentApproveRequestSchema.shape.digest.describe(
      'Impronta della versione che si approva, 64 caratteri esadecimali minuscoli.',
    ),
  })
  .describe('Approva una versione dell\'ambiente, così il seguito la eredita.');
export type VideoEnvironmentApproveToolInput = z.infer<typeof VideoEnvironmentApproveToolInputSchema>;
