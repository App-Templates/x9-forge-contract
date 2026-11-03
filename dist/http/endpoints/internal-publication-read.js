import { INTERNAL_SECRET_HEADER } from "../../auth/index.js";
import { ListPublicationsRequestSchema, ListPublicationsResponseSchema, WithdrawPublicationRequestSchema, WithdrawPublicationResponseSchema, } from "../../organization/publication-lookup.js";
import { ResolveMaterialRequestSchema, ResolveMaterialResponseSchema, } from "../../organization/publication-operations.js";
export const INTERNAL_PUBLICATION_RESOLVE_PATH = '/internal/publication/resolve';
export const internalPublicationResolveContract = {
    method: 'POST',
    path: INTERNAL_PUBLICATION_RESOLVE_PATH,
    authType: 'secret',
    authHeader: INTERNAL_SECRET_HEADER,
    bodySchema: ResolveMaterialRequestSchema,
    responseSchema: ResolveMaterialResponseSchema,
};
export const INTERNAL_PUBLICATION_WITHDRAW_PATH = '/internal/publications/withdraw';
export const INTERNAL_PUBLICATION_LIST_PATH = '/internal/publications/list';
export const internalPublicationWithdrawContract = {
    method: 'POST',
    path: INTERNAL_PUBLICATION_WITHDRAW_PATH,
    authType: 'secret',
    authHeader: INTERNAL_SECRET_HEADER,
    bodySchema: WithdrawPublicationRequestSchema,
    responseSchema: WithdrawPublicationResponseSchema,
};
export const internalPublicationListContract = {
    method: 'POST',
    path: INTERNAL_PUBLICATION_LIST_PATH,
    authType: 'secret',
    authHeader: INTERNAL_SECRET_HEADER,
    bodySchema: ListPublicationsRequestSchema,
    responseSchema: ListPublicationsResponseSchema,
};
//# sourceMappingURL=internal-publication-read.js.map