"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalBusinessUnitLeadBirthContract = exports.INTERNAL_BUSINESS_UNIT_LEAD_BIRTH_PATH = void 0;
const index_js_1 = require("../../auth/index.cjs");
const business_unit_lead_js_1 = require("../../organization/business-unit-lead.cjs");
exports.INTERNAL_BUSINESS_UNIT_LEAD_BIRTH_PATH = '/api/internal/factory/business-unit-lead';
/** Director -> Forge factory-svc: provision a business unit lead with its participant identity. */
exports.internalBusinessUnitLeadBirthContract = {
    method: 'POST',
    path: exports.INTERNAL_BUSINESS_UNIT_LEAD_BIRTH_PATH,
    authType: 'token',
    authHeader: index_js_1.INTERNAL_TOKEN_HEADER,
    bodySchema: business_unit_lead_js_1.BusinessUnitLeadBirthRequestSchema,
    responseSchema: business_unit_lead_js_1.BusinessUnitLeadBirthResultSchema,
};
//# sourceMappingURL=internal-business-unit-lead.js.map