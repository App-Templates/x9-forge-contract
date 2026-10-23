"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionPlanSchema = exports.ActionPlanBusinessUnitSchema = exports.ActionPlanBuStartSchema = exports.ActionPlanRoleAgentSchema = exports.ActionPlanReferentRefSchema = exports.ActionPlanBuExecutorSchema = exports.ACTION_PLAN_BU_EXECUTORS = void 0;
exports.actionPlanCanonicalJson = actionPlanCanonicalJson;
const zod_1 = require("zod");
const agent_role_js_1 = require("./agent-role.cjs");
const asset_js_1 = require("./asset.cjs");
const decision_request_js_1 = require("./decision-request.cjs");
const SlugSchema = (min, max) => zod_1.z.string().min(min).max(max).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const UniqueCompetenciesSchema = zod_1.z.array(zod_1.z.string().min(1).max(200)).min(1).max(20).refine((competencies) => new Set(competencies).size === competencies.length, { message: 'Competencies must be unique' });
/** How a business unit of the action plan produces its work. */
exports.ACTION_PLAN_BU_EXECUTORS = ['agent', 'dev_session', 'night'];
exports.ActionPlanBuExecutorSchema = zod_1.z.enum(exports.ACTION_PLAN_BU_EXECUTORS);
/** The referent is only a pointer to an entry of the company memory map: no name, no address. */
exports.ActionPlanReferentRefSchema = zod_1.z.strictObject({
    personRef: SlugSchema(1, 40),
    entryVersion: zod_1.z.number().int().min(1),
});
/** Role agents are only listed in the plan; they are not born with it. */
exports.ActionPlanRoleAgentSchema = zod_1.z.strictObject({
    role: zod_1.z.string().min(1).max(120),
    competencies: UniqueCompetenciesSchema,
});
exports.ActionPlanBuStartSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({ kind: zod_1.z.literal('now') }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('planned'),
        unlockedBy: zod_1.z.strictObject({
            milestone: zod_1.z.number().int().min(1),
            delivery: zod_1.z.string().min(1).max(500),
        }),
    }),
]);
/** Part 6 «Organizzazione» of the action plan: one business unit. */
exports.ActionPlanBusinessUnitSchema = zod_1.z.strictObject({
    buSlug: SlugSchema(1, 30),
    typeId: SlugSchema(2, 40),
    mandate: zod_1.z.string().min(1).max(2000),
    competencies: UniqueCompetenciesSchema,
    lead: zod_1.z.strictObject({ role: zod_1.z.literal(agent_role_js_1.BUSINESS_UNIT_LEAD_ROLE) }),
    reviewer: zod_1.z.union([
        zod_1.z.strictObject({ buSlug: SlugSchema(1, 30) }),
        zod_1.z.strictObject({ role: zod_1.z.literal(agent_role_js_1.DIRECTOR_ROLE) }),
    ]).optional(),
    executor: exports.ActionPlanBuExecutorSchema,
    referent: exports.ActionPlanReferentRefSchema,
    firstActivities: zod_1.z.array(zod_1.z.string().min(1).max(500)).min(1).max(20),
    roleAgents: zod_1.z.array(exports.ActionPlanRoleAgentSchema).max(20).optional(),
    start: exports.ActionPlanBuStartSchema,
});
const TextSchema = zod_1.z.string().min(1).max(2000);
const BuSlugSchema = SlugSchema(1, 30);
const MilestoneNumberSchema = zod_1.z.number().int().min(1);
const DeliveryCriteriaSchema = zod_1.z.array(TextSchema).min(1).max(20);
/** The eleven required parts of the versioned plan submitted for owner approval. */
exports.ActionPlanSchema = zod_1.z.strictObject({
    planId: decision_request_js_1.DecisionRequestIdSchema,
    version: zod_1.z.number().int().min(1),
    digest: asset_js_1.AssetSha256Schema,
    tenantId: asset_js_1.AssetRefSchema.shape.tenantId,
    organizationId: zod_1.z.string().min(1).max(64),
    clientId: asset_js_1.AssetRefSchema.shape.companyId,
    projectId: zod_1.z.string().min(1).max(64),
    objective: zod_1.z.strictObject({
        request: TextSchema,
        expectedResult: TextSchema,
        measure: TextSchema,
    }),
    analysis: zod_1.z.strictObject({
        startingPoint: TextSchema,
        marketAndAlternatives: zod_1.z.strictObject({
            text: TextSchema,
            sources: zod_1.z.array(zod_1.z.url({ protocol: /^https?$/ })).min(1).max(30),
        }),
        recommendedMethod: zod_1.z.strictObject({ method: TextSchema, why: TextSchema }),
    }),
    strategy: zod_1.z.strictObject({
        approach: TextSchema,
        choices: zod_1.z.array(TextSchema).min(1).max(20),
        discardedAlternatives: zod_1.z.array(TextSchema).max(20),
    }),
    objectiveTree: zod_1.z.strictObject({
        project: zod_1.z.strictObject({ expectedResult: TextSchema, deliveryCriteria: DeliveryCriteriaSchema }),
        businessUnits: zod_1.z.array(zod_1.z.strictObject({
            buSlug: BuSlugSchema,
            expectedResult: TextSchema,
            deliveryCriteria: DeliveryCriteriaSchema,
            indicators: zod_1.z.array(zod_1.z.strictObject({ name: TextSchema, source: TextSchema })).max(20),
        })),
    }),
    milestones: zod_1.z.array(zod_1.z.strictObject({
        number: MilestoneNumberSchema,
        delivery: TextSchema,
        buSlug: BuSlugSchema,
        dueDate: zod_1.z.iso.date(),
        closeCriterion: TextSchema,
        blockedBy: zod_1.z.array(zod_1.z.number().int()),
    })).min(1).max(50),
    criticalPath: zod_1.z.array(zod_1.z.number().int()).min(1).max(50),
    businessUnits: zod_1.z.array(exports.ActionPlanBusinessUnitSchema).min(1).max(20),
    exchanges: zod_1.z.array(zod_1.z.strictObject({
        fromBu: BuSlugSchema,
        toBu: BuSlugSchema,
        what: TextSchema,
        format: TextSchema,
    })),
    budget: zod_1.z.strictObject({
        currency: TextSchema,
        total: zod_1.z.number().min(0),
        perBu: zod_1.z.array(zod_1.z.strictObject({ buSlug: BuSlugSchema, cap: zod_1.z.number().min(0) })),
    }),
    risks: zod_1.z.array(TextSchema).max(30),
    assumptions: zod_1.z.array(TextSchema).max(30),
    missingMaterials: zod_1.z.array(zod_1.z.strictObject({
        what: TextSchema,
        kind: zod_1.z.enum(['asset', 'access', 'data']),
        owner: TextSchema.optional(),
        blocks: zod_1.z.strictObject({ buSlug: BuSlugSchema, milestone: MilestoneNumberSchema }).optional(),
        neededBy: zod_1.z.iso.date().optional(),
    })),
    questions: zod_1.z.array(zod_1.z.strictObject({ question: TextSchema, unlocks: TextSchema })),
    ifApproved: zod_1.z.strictObject({
        startNow: zod_1.z.array(BuSlugSchema),
        startLater: zod_1.z.array(zod_1.z.strictObject({ buSlug: BuSlugSchema, after: TextSchema })),
        verticalPlanDueBy: zod_1.z.array(zod_1.z.strictObject({ buSlug: BuSlugSchema, dueDate: zod_1.z.iso.date() })),
        updates: zod_1.z.strictObject({ how: TextSchema, every: TextSchema }),
    }),
    opportunities: zod_1.z.array(TextSchema).optional(),
});
function canonicalJson(value) {
    if (Array.isArray(value))
        return `[${value.map(canonicalJson).join(',')}]`;
    if (value !== null && typeof value === 'object') {
        const entries = Object.keys(value)
            .sort()
            .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`);
        return `{${entries.join(',')}}`;
    }
    return JSON.stringify(value);
}
/** Portable UTF-8 input for the writer's SHA-256; the digest itself is excluded. */
function actionPlanCanonicalJson(plan) {
    const { digest: _digest, ...content } = plan;
    return canonicalJson(content);
}
//# sourceMappingURL=action-plan.js.map