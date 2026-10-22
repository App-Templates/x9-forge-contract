"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessUnitTypeCardSchema = void 0;
const zod_1 = require("zod");
const development_session_js_1 = require("../capability/connect/development-session.cjs");
const model_tier_js_1 = require("../model-router/model-tier.cjs");
const Slug = (min, max) => zod_1.z.string().min(min).max(max).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const Text = zod_1.z.string().min(1).max(500);
const uniqueItems = (item, message) => zod_1.z.array(item).refine((items) => new Set(items).size === items.length, { message });
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
    version: zod_1.z.number().int().min(1),
});
//# sourceMappingURL=business-unit-type.js.map