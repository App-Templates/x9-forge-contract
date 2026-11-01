import { INTERNAL_TOKEN_HEADER } from '../../auth/index.js';
import {
  BusinessUnitLeadBirthPendingSchema,
  BusinessUnitLeadBirthRequestSchema,
  BusinessUnitLeadBirthResultSchema,
} from '../../organization/business-unit-lead.js';

export const INTERNAL_BUSINESS_UNIT_LEAD_BIRTH_PATH = '/api/internal/factory/business-unit-lead' as const;

/** Director -> Forge factory-svc: provision a business unit lead with its participant identity. */
export const internalBusinessUnitLeadBirthContract = {
  method: 'POST',
  path: INTERNAL_BUSINESS_UNIT_LEAD_BIRTH_PATH,
  authType: 'token',
  authHeader: INTERNAL_TOKEN_HEADER,
  bodySchema: BusinessUnitLeadBirthRequestSchema as typeof BusinessUnitLeadBirthRequestSchema,
  responseSchema: BusinessUnitLeadBirthResultSchema as typeof BusinessUnitLeadBirthResultSchema,
  pendingResponseSchema: BusinessUnitLeadBirthPendingSchema as typeof BusinessUnitLeadBirthPendingSchema,
} as const;
