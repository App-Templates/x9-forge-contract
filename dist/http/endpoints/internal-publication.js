import { INTERNAL_SECRET_HEADER } from "../../auth/index.js";
import { PublishMaterialRequestSchema, PublishMaterialResponseSchema, ReadMaterialRequestSchema, ReadMaterialResponseSchema, } from "../../organization/publication-operations.js";
export const INTERNAL_PUBLICATION_PUBLISH_PATH = '/internal/publications/publish';
export const INTERNAL_PUBLICATION_READ_PATH = '/internal/publications/read';
export const internalPublicationPublishContract = {
    method: 'POST',
    path: INTERNAL_PUBLICATION_PUBLISH_PATH,
    authType: 'secret',
    authHeader: INTERNAL_SECRET_HEADER,
    bodySchema: PublishMaterialRequestSchema,
    responseSchema: PublishMaterialResponseSchema,
};
export const internalPublicationReadContract = {
    method: 'POST',
    path: INTERNAL_PUBLICATION_READ_PATH,
    authType: 'secret',
    authHeader: INTERNAL_SECRET_HEADER,
    bodySchema: ReadMaterialRequestSchema,
    responseSchema: ReadMaterialResponseSchema,
};
//# sourceMappingURL=internal-publication.js.map