import { INTERNAL_SECRET_HEADER } from '../../auth/index.js';
import {
  ListPublicationsRequestSchema,
  ListPublicationsResponseSchema,
  WithdrawPublicationRequestSchema,
  WithdrawPublicationResponseSchema,
} from '../../organization/publication-lookup.js';

export const INTERNAL_PUBLICATION_WITHDRAW_PATH = '/internal/publications/withdraw' as const;
export const INTERNAL_PUBLICATION_LIST_PATH = '/internal/publications/list' as const;

export const internalPublicationWithdrawContract = {
  method: 'POST' as const,
  path: INTERNAL_PUBLICATION_WITHDRAW_PATH,
  authType: 'secret' as const,
  authHeader: INTERNAL_SECRET_HEADER,
  bodySchema: WithdrawPublicationRequestSchema,
  responseSchema: WithdrawPublicationResponseSchema,
} as const;

export const internalPublicationListContract = {
  method: 'POST' as const,
  path: INTERNAL_PUBLICATION_LIST_PATH,
  authType: 'secret' as const,
  authHeader: INTERNAL_SECRET_HEADER,
  bodySchema: ListPublicationsRequestSchema,
  responseSchema: ListPublicationsResponseSchema,
} as const;
