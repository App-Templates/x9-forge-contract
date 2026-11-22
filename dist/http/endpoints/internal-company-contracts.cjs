"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalCompanyContractsContract = exports.internalDevCompanyContractsContract = exports.internalPaperclipCompanyContractsContract = exports.InternalCompanyContractsQuerySchema = exports.InternalDevCompanyContractsQuerySchema = exports.InternalPaperclipCompanyContractsQuerySchema = exports.INTERNAL_COMPANY_CONTRACTS_PATH = exports.INTERNAL_DEV_COMPANY_CONTRACTS_PATH = exports.INTERNAL_PAPERCLIP_COMPANY_CONTRACTS_PATH = exports.CompanyContractsRefusalSchema = exports.COMPANY_CONTRACTS_REFUSALS = exports.CompanyContractsReadSchema = exports.CompanyContractSourceReadSchema = exports.CompanyContractBreakSchema = exports.CompanyContractInstanceSchema = exports.CompanyContractRequirementSchema = exports.CompanyContractScopeSchema = exports.CompanyContractCatalogEntrySchema = exports.CompanyContractTypeSchema = exports.COMPANY_CONTRACT_TYPES = exports.COMPANY_CONTRACTS_PACKAGE = void 0;
exports.companyContractCatalog = companyContractCatalog;
exports.companyContractsScopeProblem = companyContractsScopeProblem;
exports.companyContractsNoBreakProven = companyContractsNoBreakProven;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../../capability/capability-call-identity.cjs");
const index_js_1 = require("../../capability/dev/index.cjs");
const native_wait_js_1 = require("../../capability/paperclip/native-wait.cjs");
const agent_request_js_1 = require("../../organization/agent-request.cjs");
const asset_js_1 = require("../../organization/asset.cjs");
const business_unit_mandate_js_1 = require("../../organization/business-unit-mandate.cjs");
const decision_request_js_1 = require("../../organization/decision-request.cjs");
/**
 * Read-only catalog of the eight company contracts and their applied instances (task 8258).
 * Every method, path, query, answer and refusal lives here. Nothing here judges a contract: the services keep their
 * own authorizations and verdicts. No credential crosses these shapes (strict objects everywhere).
 */
/** The package that publishes the catalog; the test compares it with package.json. */
exports.COMPANY_CONTRACTS_PACKAGE = { name: '@x9-forge/contracts', version: '1.306.0' };
exports.COMPANY_CONTRACT_TYPES = [
    'mandate', 'code_session', 'design_session', 'referent_email', 'lab_request', 'chief_question', 'unit_exchange', 'document_unit',
];
exports.CompanyContractTypeSchema = zod_1.z.enum(exports.COMPANY_CONTRACT_TYPES);
const ShortText = zod_1.z.string().trim().min(1).max(500);
const Reason = zod_1.z.string().trim().min(1).max(500);
// ---------------------------------------------------------------------------------------------------------------
// Published catalog
// ---------------------------------------------------------------------------------------------------------------
const PublishedRefSchema = zod_1.z.strictObject({
    package: zod_1.z.literal(exports.COMPANY_CONTRACTS_PACKAGE.name),
    version: zod_1.z.string().min(1).max(40),
    commit: zod_1.z.string().min(1).max(64).nullable().describe('Commit that publishes the package, null when the reader does not know it'),
});
const CatalogRequirementSchema = zod_1.z.strictObject({
    id: index_js_1.DevSessionCriterionSchema.shape.id,
    text: index_js_1.DevSessionCriterionSchema.shape.text,
    attestor: index_js_1.DevSessionAttestorSchema,
    proof: index_js_1.DevSessionCriterionSchema.shape.proof,
    origin: zod_1.z.literal('modello'),
    needs: zod_1.z.array(zod_1.z.string().min(1).max(40)).max(20),
    optional: zod_1.z.boolean().describe('Offered by the model but not part of its form criteria'),
});
const CatalogModelSchema = zod_1.z.strictObject({
    version: zod_1.z.int().min(1),
    productKind: index_js_1.DevSessionKindSchema,
    supportedEngines: zod_1.z.array(zod_1.z.string().min(1).max(20)).min(1).max(5),
    requiredInput: zod_1.z.array(zod_1.z.string().min(1).max(40)).max(20),
    materials: zod_1.z.array(zod_1.z.string().min(1).max(40)).max(20),
    requirements: zod_1.z.array(CatalogRequirementSchema).max(60),
}).describe('The model as the CURRENT package publishes it, not the snapshot a saved contract was written under');
exports.CompanyContractCatalogEntrySchema = zod_1.z.strictObject({
    type: exports.CompanyContractTypeSchema,
    variant: zod_1.z.enum(index_js_1.DEV_SESSION_TEMPLATE_IDS).optional().describe('Design sessions only: one entry per model'),
    label: ShortText,
    origin: zod_1.z.strictObject({ schema: ShortText, file: ShortText }),
    published: PublishedRefSchema,
    version: zod_1.z.discriminatedUnion('kind', [
        zod_1.z.strictObject({ kind: zod_1.z.literal('numeric'), value: zod_1.z.int().min(1), from: ShortText }),
        zod_1.z.strictObject({ kind: zod_1.z.literal('absent'), reason: Reason }),
    ]),
    fields: zod_1.z.array(zod_1.z.strictObject({ name: zod_1.z.string().min(1).max(100), required: zod_1.z.boolean() })).min(1).max(100),
    models: zod_1.z.array(CatalogModelSchema).max(5),
    historicalSnapshot: zod_1.z.strictObject({ state: zod_1.z.literal('non_noto'), reason: Reason }),
});
// Field names and obligations are projected from the origin schema, never retyped.
function fieldsOf(shape) {
    return Object.entries(shape).map(([name, field]) => ({ name, required: !field.isOptional() }));
}
const NO_VERSION = 'The schema carries no autonomous version number';
const NO_SNAPSHOT = 'The package keeps no earlier copy of this schema; an instance carries the document that was written';
const SESSION_NO_SNAPSHOT = 'The model text changed while template.version stayed 1; the criteria a saved contract was written under are not preserved';
function catalogModel(template) {
    const requirement = (id, optional) => {
        const source = index_js_1.DEV_SESSION_ACCEPTANCE_CATALOG[id];
        return { id, text: source.text, attestor: source.attestor, proof: source.proof, origin: 'modello', needs: [...source.needs], optional };
    };
    return {
        version: template.version, productKind: template.productKind, supportedEngines: [...template.supportedEngines],
        requiredInput: [...template.requiredInput], materials: [...template.materials],
        requirements: [
            ...template.formCriteria.map((id) => requirement(id, false)),
            ...(template.optionalCriteria ?? []).map((id) => requirement(id, true)),
        ],
    };
}
/** The eight contracts (design in three models) as the current package publishes them; pure. */
function companyContractCatalog(options = {}) {
    const published = { package: exports.COMPANY_CONTRACTS_PACKAGE.name, version: exports.COMPANY_CONTRACTS_PACKAGE.version, commit: options.commit ?? null };
    const structural = (type, label, schemaName, file, shape, version = { kind: 'absent', reason: NO_VERSION }) => ({
        type, label, origin: { schema: schemaName, file }, published, version, fields: fieldsOf(shape), models: [],
        historicalSnapshot: { state: 'non_noto', reason: NO_SNAPSHOT },
    });
    const session = (type, label, templateId) => {
        const models = [index_js_1.DEV_SESSION_TEMPLATES[templateId]];
        if (templateId in index_js_1.DEV_SESSION_TEMPLATES_V2)
            models.push(index_js_1.DEV_SESSION_TEMPLATES_V2[templateId]);
        return {
            type, variant: templateId, label, origin: { schema: 'DevSessionAssignmentSchema', file: 'src/capability/dev/session-assignment.ts' },
            published,
            version: { kind: 'numeric', value: Math.max(...models.map((model) => model.version)), from: 'template.version' },
            fields: fieldsOf(index_js_1.DevSessionAssignmentSchema.shape), models: models.map(catalogModel),
            historicalSnapshot: { state: 'non_noto', reason: SESSION_NO_SNAPSHOT },
        };
    };
    return exports.CompanyContractCatalogEntrySchema.array().parse([
        structural('mandate', 'Mandate', 'ReconciledMandateSchema', 'src/organization/business-unit-mandate.ts', business_unit_mandate_js_1.ReconciledMandateSchema.shape),
        session('code_session', 'Code session', 'sviluppo-pezzo-app'),
        session('design_session', 'Design session: website', 'design-sito'),
        session('design_session', 'Design session: app screen', 'design-schermata-app'),
        session('design_session', 'Design session: retouch', 'design-ritocco'),
        structural('referent_email', 'Email to the referent', 'DecisionRequestSchema', 'src/organization/decision-request.ts', decision_request_js_1.DecisionRequestSchema.shape),
        structural('lab_request', 'Request to the Lab', 'PaperclipLabRequestSchema', 'src/capability/paperclip/native-wait.ts', native_wait_js_1.PaperclipLabRequestSchema.shape),
        structural('chief_question', "Chief's question", 'AgentQuestionDetailsSchema', 'src/organization/agent-request.ts', agent_request_js_1.AgentQuestionDetailsSchema.shape),
        structural('unit_exchange', 'Exchange between units', 'AgentRequestSchema', 'src/organization/agent-request.ts', agent_request_js_1.AgentRequestSchema.shape, { kind: 'numeric', value: 1, from: 'schemaVersion' }),
        structural('document_unit', 'Document unit', 'ActionPlanDocumentPieceSchema', 'src/organization/business-unit-mandate.ts', business_unit_mandate_js_1.ActionPlanDocumentPieceSchema.shape),
    ]);
}
// ---------------------------------------------------------------------------------------------------------------
// Applied instances
// ---------------------------------------------------------------------------------------------------------------
/** A value is known with its source, or it is not known with the reason: never an invented placeholder. */
const known = (value) => zod_1.z.discriminatedUnion('state', [
    zod_1.z.strictObject({ state: zod_1.z.literal('noto'), value, source: ShortText }),
    zod_1.z.strictObject({ state: zod_1.z.literal('non_noto'), reason: Reason }),
]);
const ScopeShape = {
    tenantId: zod_1.z.string().min(1).max(200),
    ownerId: capability_call_identity_js_1.CapabilityAgentScopeSchema.shape.ownerId,
    organizationId: zod_1.z.string().min(1).max(64),
    clientId: zod_1.z.string().min(1).max(200).optional(),
    projectId: zod_1.z.string().min(1).max(64),
    unitId: zod_1.z.string().min(1).max(200).optional(),
};
exports.CompanyContractScopeSchema = zod_1.z.strictObject(ScopeShape);
const ReasonText = zod_1.z.string().trim().min(1).max(index_js_1.DEV_SESSION_CRITERION_TEXT_MAX);
/** Status of one requirement of an applied contract: the session states plus `in_attesa` and `non_noto`. */
const RequirementStatusSchema = zod_1.z.union([
    zod_1.z.strictObject({
        state: zod_1.z.literal('noto'), value: zod_1.z.literal(index_js_1.DEV_SESSION_ATTESTATION_STATUSES[0]),
        proof: zod_1.z.strictObject({ path: index_js_1.DevSessionDeliveredFileSchema.shape.path, sha256: index_js_1.DevSessionDeliveredFileSchema.shape.sha256 }),
        proofOrigin: zod_1.z.enum(index_js_1.DEV_SESSION_PROOF_ORIGINS),
    }),
    zod_1.z.strictObject({
        state: zod_1.z.literal('noto'), value: zod_1.z.literal(index_js_1.DEV_SESSION_ATTESTATION_STATUSES[1]),
        reason: ReasonText, responsible: zod_1.z.enum(index_js_1.DEV_SESSION_RESPONSIBLES), nextAction: ReasonText,
    }),
    zod_1.z.strictObject({ state: zod_1.z.literal('noto'), value: zod_1.z.literal(index_js_1.DEV_SESSION_ATTESTATION_STATUSES[2]), reason: ReasonText }),
    // Only the observed absence of an attestation; an unreadable source is `non_noto`.
    zod_1.z.strictObject({ state: zod_1.z.literal('noto'), value: zod_1.z.literal('in_attesa'), observed: zod_1.z.literal('attestation_absent') }),
    zod_1.z.strictObject({ state: zod_1.z.literal('non_noto'), reason: Reason }),
]);
exports.CompanyContractRequirementSchema = zod_1.z.strictObject({
    id: index_js_1.DevSessionCriterionSchema.shape.id,
    text: index_js_1.DevSessionCriterionSchema.shape.text,
    attestor: index_js_1.DevSessionAttestorSchema,
    proof: index_js_1.DevSessionCriterionSchema.shape.proof,
    origin: zod_1.z.enum(index_js_1.DEV_SESSION_REQUIREMENT_ORIGINS),
    unit: index_js_1.DevSessionCriterionSchema.shape.unit,
    status: RequirementStatusSchema,
});
exports.CompanyContractInstanceSchema = zod_1.z.strictObject({
    type: exports.CompanyContractTypeSchema,
    variant: zod_1.z.enum(index_js_1.DEV_SESSION_TEMPLATE_IDS).optional(),
    scope: exports.CompanyContractScopeSchema,
    reference: known(zod_1.z.strictObject({ kind: zod_1.z.enum(['assignment', 'session', 'document', 'decision', 'request']), id: zod_1.z.string().min(1).max(200) })),
    digest: known(asset_js_1.AssetSha256Schema),
    model: known(zod_1.z.strictObject({ templateId: zod_1.z.string().min(1).max(100).optional(), version: zod_1.z.int().min(1) })),
    nativeRevision: known(zod_1.z.string().min(1).max(200)),
    author: known(zod_1.z.string().min(1).max(200)),
    writtenAt: known(zod_1.z.iso.datetime({ offset: true })),
    requirements: known(zod_1.z.array(exports.CompanyContractRequirementSchema).max(100)),
});
/** A break names the assignment, the code or the requirement, the proof and the origin; never deduced from `blocked`. */
exports.CompanyContractBreakSchema = zod_1.z.strictObject({
    assignment: zod_1.z.string().min(1).max(200),
    code: zod_1.z.enum(index_js_1.DEV_SESSION_VERDICT_PROBLEMS).optional(),
    requirementId: index_js_1.DevSessionCriterionSchema.shape.id.optional(),
    proof: ShortText,
    origin: zod_1.z.enum(index_js_1.DEV_SESSION_REQUIREMENT_ORIGINS),
    source: zod_1.z.enum(['paperclip', 'dev', 'agent_core']),
}).refine((value) => value.code !== undefined || value.requirementId !== undefined, {
    path: ['code'], message: 'A break names a code or a requirement',
});
exports.CompanyContractSourceReadSchema = zod_1.z.strictObject({
    source: zod_1.z.enum(['paperclip', 'dev', 'agent_core']),
    complete: zod_1.z.boolean(),
    reason: Reason.optional(),
    readAt: zod_1.z.iso.datetime({ offset: true }).nullable(),
    sampledAt: zod_1.z.iso.datetime({ offset: true }).nullable(),
}).superRefine((value, ctx) => {
    if (value.complete && (value.reason !== undefined || value.readAt === null)) {
        ctx.addIssue({ code: 'custom', path: ['complete'], message: 'A complete source has readAt and no reason' });
    }
    if (!value.complete && value.reason === undefined) {
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'An incomplete source says why' });
    }
});
const SCOPE_KEYS = Object.keys(ScopeShape);
exports.CompanyContractsReadSchema = zod_1.z.strictObject({
    scope: exports.CompanyContractScopeSchema,
    published: PublishedRefSchema,
    applied: zod_1.z.array(exports.CompanyContractInstanceSchema).max(100),
    breaks: zod_1.z.array(exports.CompanyContractBreakSchema).max(200),
    sources: zod_1.z.array(exports.CompanyContractSourceReadSchema).min(1).max(3),
    page: zod_1.z.strictObject({
        complete: zod_1.z.boolean(),
        nextCursor: zod_1.z.string().min(1).max(2048).nullable(),
        reason: Reason.optional(),
    }),
}).superRefine((read, ctx) => {
    read.applied.forEach((instance, index) => {
        const foreign = SCOPE_KEYS.find((key) => instance.scope[key] !== read.scope[key]);
        if (foreign !== undefined)
            ctx.addIssue({ code: 'custom', path: ['applied', index, 'scope', foreign], message: 'Instance outside the scope read' });
    });
    if (new Set(read.sources.map(({ source }) => source)).size !== read.sources.length) {
        ctx.addIssue({ code: 'custom', path: ['sources'], message: 'Each source appears once' });
    }
    const sourcesComplete = read.sources.every(({ complete }) => complete);
    if (read.page.complete && (read.page.nextCursor !== null || !sourcesComplete || read.page.reason !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['page', 'complete'], message: 'A complete read has no next page, no unread source and no reason' });
    }
    if (!read.page.complete && read.page.reason === undefined) {
        ctx.addIssue({ code: 'custom', path: ['page', 'reason'], message: 'An incomplete read says why' });
    }
});
/** First scope key on which the read differs from the scope requested, or undefined. */
function companyContractsScopeProblem(requested, read) {
    return SCOPE_KEYS.find((key) => read.scope[key] !== requested[key]);
}
/** «No broken contract» is proven only by a complete read: a partial one proves nothing. */
function companyContractsNoBreakProven(read) {
    return read.page.complete && read.breaks.length === 0 && read.sources.every(({ complete }) => complete);
}
// ---------------------------------------------------------------------------------------------------------------
// Endpoint contracts (GET, secret). The first two are service-to-service only and are never offered to the browser.
// ---------------------------------------------------------------------------------------------------------------
const PageQueryShape = {
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional(),
    cursor: zod_1.z.string().min(1).max(2048).optional(),
};
const ProjectQueryShape = {
    tenantId: ScopeShape.tenantId,
    ownerId: ScopeShape.ownerId,
    organizationId: ScopeShape.organizationId,
    clientId: ScopeShape.clientId,
    projectId: ScopeShape.projectId,
    unitId: ScopeShape.unitId,
    ...PageQueryShape,
};
exports.COMPANY_CONTRACTS_REFUSALS = ['scope_foreign', 'scope_unresolved', 'source_unavailable', 'cursor_invalid'];
exports.CompanyContractsRefusalSchema = zod_1.z.strictObject({ error: zod_1.z.enum(exports.COMPANY_CONTRACTS_REFUSALS) });
exports.INTERNAL_PAPERCLIP_COMPANY_CONTRACTS_PATH = '/internal/paperclip/company-contracts';
exports.INTERNAL_DEV_COMPANY_CONTRACTS_PATH = '/internal/dev/company-contracts';
exports.INTERNAL_COMPANY_CONTRACTS_PATH = '/internal/company-board/contracts';
exports.InternalPaperclipCompanyContractsQuerySchema = zod_1.z.strictObject(ProjectQueryShape);
exports.InternalDevCompanyContractsQuerySchema = zod_1.z.strictObject({
    ...capability_call_identity_js_1.CapabilityAgentScopeSchema.shape,
    ...ProjectQueryShape,
});
exports.InternalCompanyContractsQuerySchema = zod_1.z.strictObject(ProjectQueryShape);
/** cap-paperclip: contracts written in Paperclip (mandates, requests, Lab) of one project. Service-only. */
exports.internalPaperclipCompanyContractsContract = {
    method: 'GET',
    path: exports.INTERNAL_PAPERCLIP_COMPANY_CONTRACTS_PATH,
    authType: 'secret',
    querySchema: exports.InternalPaperclipCompanyContractsQuerySchema,
    responseSchema: exports.CompanyContractsReadSchema,
    refusalSchema: exports.CompanyContractsRefusalSchema,
};
/** cap-dev: session contracts and their attestations on behalf of an agent. Service-only. */
exports.internalDevCompanyContractsContract = {
    method: 'GET',
    path: exports.INTERNAL_DEV_COMPANY_CONTRACTS_PATH,
    authType: 'secret',
    querySchema: exports.InternalDevCompanyContractsQuerySchema,
    responseSchema: exports.CompanyContractsReadSchema,
    refusalSchema: exports.CompanyContractsRefusalSchema,
};
/** agent-core: the board read that Forge uses; it merges the two sources and reports which one it could not read. */
exports.internalCompanyContractsContract = {
    method: 'GET',
    path: exports.INTERNAL_COMPANY_CONTRACTS_PATH,
    authType: 'secret',
    querySchema: exports.InternalCompanyContractsQuerySchema,
    responseSchema: exports.CompanyContractsReadSchema,
    refusalSchema: exports.CompanyContractsRefusalSchema,
};
//# sourceMappingURL=internal-company-contracts.js.map