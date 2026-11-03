"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalPublicationReadContract = exports.internalPublicationPublishContract = exports.INTERNAL_PUBLICATION_READ_PATH = exports.INTERNAL_PUBLICATION_PUBLISH_PATH = void 0;
const index_js_1 = require("../../auth/index.cjs");
const publication_operations_js_1 = require("../../organization/publication-operations.cjs");
exports.INTERNAL_PUBLICATION_PUBLISH_PATH = '/internal/publications/publish';
exports.INTERNAL_PUBLICATION_READ_PATH = '/internal/publications/read';
exports.internalPublicationPublishContract = {
    method: 'POST',
    path: exports.INTERNAL_PUBLICATION_PUBLISH_PATH,
    authType: 'secret',
    authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    bodySchema: publication_operations_js_1.PublishMaterialRequestSchema,
    responseSchema: publication_operations_js_1.PublishMaterialResponseSchema,
};
exports.internalPublicationReadContract = {
    method: 'POST',
    path: exports.INTERNAL_PUBLICATION_READ_PATH,
    authType: 'secret',
    authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    bodySchema: publication_operations_js_1.ReadMaterialRequestSchema,
    responseSchema: publication_operations_js_1.ReadMaterialResponseSchema,
};
//# sourceMappingURL=internal-publication.js.map