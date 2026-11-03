"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalPublicationListContract = exports.internalPublicationWithdrawContract = exports.INTERNAL_PUBLICATION_LIST_PATH = exports.INTERNAL_PUBLICATION_WITHDRAW_PATH = exports.internalPublicationResolveContract = exports.INTERNAL_PUBLICATION_RESOLVE_PATH = void 0;
const index_js_1 = require("../../auth/index.cjs");
const publication_lookup_js_1 = require("../../organization/publication-lookup.cjs");
const publication_operations_js_1 = require("../../organization/publication-operations.cjs");
exports.INTERNAL_PUBLICATION_RESOLVE_PATH = '/internal/publication/resolve';
exports.internalPublicationResolveContract = {
    method: 'POST',
    path: exports.INTERNAL_PUBLICATION_RESOLVE_PATH,
    authType: 'secret',
    authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    bodySchema: publication_operations_js_1.ResolveMaterialRequestSchema,
    responseSchema: publication_operations_js_1.ResolveMaterialResponseSchema,
};
exports.INTERNAL_PUBLICATION_WITHDRAW_PATH = '/internal/publications/withdraw';
exports.INTERNAL_PUBLICATION_LIST_PATH = '/internal/publications/list';
exports.internalPublicationWithdrawContract = {
    method: 'POST',
    path: exports.INTERNAL_PUBLICATION_WITHDRAW_PATH,
    authType: 'secret',
    authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    bodySchema: publication_lookup_js_1.WithdrawPublicationRequestSchema,
    responseSchema: publication_lookup_js_1.WithdrawPublicationResponseSchema,
};
exports.internalPublicationListContract = {
    method: 'POST',
    path: exports.INTERNAL_PUBLICATION_LIST_PATH,
    authType: 'secret',
    authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    bodySchema: publication_lookup_js_1.ListPublicationsRequestSchema,
    responseSchema: publication_lookup_js_1.ListPublicationsResponseSchema,
};
//# sourceMappingURL=internal-publication-read.js.map