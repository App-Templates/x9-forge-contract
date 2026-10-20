import { BusinessUnitLeadBirthRequestSchema, BusinessUnitLeadBirthResultSchema } from "../../organization/business-unit-lead.cjs";
export declare const INTERNAL_BUSINESS_UNIT_LEAD_BIRTH_PATH: "/api/internal/factory/business-unit-lead";
/** Director -> Forge factory-svc: provision a business unit lead with its participant identity. */
export declare const internalBusinessUnitLeadBirthContract: {
    readonly method: "POST";
    readonly path: "/api/internal/factory/business-unit-lead";
    readonly authType: "token";
    readonly authHeader: "X-Internal-Token";
    readonly bodySchema: typeof BusinessUnitLeadBirthRequestSchema;
    readonly responseSchema: typeof BusinessUnitLeadBirthResultSchema;
};
//# sourceMappingURL=internal-business-unit-lead.d.ts.map