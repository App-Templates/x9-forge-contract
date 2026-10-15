import { INTERNAL_SECRET_HEADER } from '../../auth/index.js';
import {
  PublishMaterialRequestSchema,
  PublishMaterialResponseSchema,
  ReadMaterialRequestSchema,
  ReadMaterialResponseSchema,
} from '../../organization/publication-operations.js';

export const INTERNAL_PUBLICATION_PUBLISH_PATH = '/internal/publications/publish' as const;
export const INTERNAL_PUBLICATION_READ_PATH = '/internal/publications/read' as const;

export const internalPublicationPublishContract = {
  method: 'POST' as const,
  path: INTERNAL_PUBLICATION_PUBLISH_PATH,
  authType: 'secret' as const,
  authHeader: INTERNAL_SECRET_HEADER,
  bodySchema: PublishMaterialRequestSchema,
  responseSchema: PublishMaterialResponseSchema,
} as const;

export const internalPublicationReadContract = {
  method: 'POST' as const,
  path: INTERNAL_PUBLICATION_READ_PATH,
  authType: 'secret' as const,
  authHeader: INTERNAL_SECRET_HEADER,
  bodySchema: ReadMaterialRequestSchema,
  responseSchema: ReadMaterialResponseSchema,
} as const;
