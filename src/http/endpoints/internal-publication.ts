// eslint-disable-next-line @typescript-eslint/no-unused-vars -- intentional: in-scope `z` is required for TS to emit portable .d.ts (`z.ZodObject<...>` named ref instead of synthesized `import("zod").ZodObject<...>`). See scripts/check-portable-dts.mjs (v1.6.3 fix, commit 6df26a1, Phase 19-00).
import { z } from 'zod';
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
