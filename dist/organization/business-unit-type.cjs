"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessUnitTypeCardSchema = exports.BUSINESS_UNIT_DELIVERY_EMAIL_DEFAULTS = exports.DeliveryEmailModelSchema = exports.BusinessUnitLeadTypeIdSchema = exports.BUSINESS_UNIT_LEAD_TYPE_IDS = void 0;
exports.deliveryPackageMeets = deliveryPackageMeets;
const zod_1 = require("zod");
const development_session_js_1 = require("../capability/connect/development-session.cjs");
const model_tier_js_1 = require("../model-router/model-tier.cjs");
const Slug = (min, max) => zod_1.z.string().min(min).max(max).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const Text = zod_1.z.string().min(1).max(500);
const uniqueItems = (item, message) => zod_1.z.array(item).refine((items) => new Set(items).size === items.length, { message });
/**
 * Business unit types whose lead is born by the capo-bu route (Forge F2F-01, `businessUnitBirthPlan`): the ids of
 * the lead types of Forge's catalog (`packages/shared/src/business-unit-types.ts`, commit 0e150e058). An action plan
 * may name only these types, so a unit never fails at birth for an unknown type. This list is the single source
 * (R-14): Forge's catalog imports these ids and keeps only its own details (capabilities, level, profile).
 */
exports.BUSINESS_UNIT_LEAD_TYPE_IDS = ['dati', 'design', 'sviluppo', 'finanza', 'marketing'];
exports.BusinessUnitLeadTypeIdSchema = zod_1.z.enum(exports.BUSINESS_UNIT_LEAD_TYPE_IDS);
exports.DeliveryEmailModelSchema = zod_1.z.strictObject({
    keyScreens: zod_1.z.strictObject({
        min: zod_1.z.number().int().min(0).max(8),
        max: zod_1.z.number().int().min(0).max(8),
    }).refine(({ min, max }) => min <= max, { message: 'Minimum must not exceed maximum' }),
    overviewSheet: zod_1.z.boolean(),
    preview: zod_1.z.boolean(),
});
exports.BUSINESS_UNIT_DELIVERY_EMAIL_DEFAULTS = {
    design: { keyScreens: { min: 6, max: 8 }, overviewSheet: true, preview: true },
};
/** Card fixing capabilities, skills, model, engine, budget, delivery criteria and reviewer of a business unit type. */
exports.BusinessUnitTypeCardSchema = zod_1.z.strictObject({
    typeId: Slug(2, 40),
    label: zod_1.z.string().min(1).max(120),
    capabilities: uniqueItems(zod_1.z.string().min(1).max(120), 'Capabilities must be unique'),
    skills: uniqueItems(zod_1.z.string().min(1).max(120), 'Skills must be unique'),
    model: model_tier_js_1.ModelTierSchema,
    sessionEngine: development_session_js_1.DevelopmentSessionEngineSchema,
    budget: zod_1.z.strictObject({
        currency: zod_1.z.string().min(1).max(10),
        monthlyCap: zod_1.z.number().nonnegative().finite(),
        warnPercent: zod_1.z.number().int().min(1).max(100),
    }),
    deliveryCriteria: zod_1.z.array(Text).min(1),
    reviewerTypeId: Slug(2, 40).optional(),
    deliveryEmail: exports.DeliveryEmailModelSchema.optional(),
    version: zod_1.z.number().int().min(1),
});
/** Missing delivery requirements in presentation order; legacy cards impose none. */
function deliveryPackageMeets(card, pkg) {
    const model = card.deliveryEmail;
    if (!model)
        return [];
    const missing = [];
    const count = pkg.keyScreens.length;
    if (count < model.keyScreens.min) {
        missing.push(`servono almeno ${model.keyScreens.min} schermate chiave, ce ne sono ${count}`);
    }
    if (count > model.keyScreens.max) {
        missing.push(`al massimo ${model.keyScreens.max} schermate chiave, ce ne sono ${count}`);
    }
    if (model.overviewSheet && !pkg.overviewSheet)
        missing.push('manca il foglio unico');
    if (model.preview && !pkg.preview)
        missing.push("manca l'anteprima");
    return missing;
}
//# sourceMappingURL=business-unit-type.js.map