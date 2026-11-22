import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../../capability/capability-call-identity.js";
import { DEV_SESSION_ACCEPTANCE_CATALOG, DEV_SESSION_CRITERION_TEXT_MAX, DEV_SESSION_TEMPLATE_IDS, DEV_SESSION_TEMPLATES, DEV_SESSION_TEMPLATES_V2, DEV_SESSION_REQUIREMENT_ORIGINS, DEV_SESSION_ATTESTATION_STATUSES, DEV_SESSION_PROOF_ORIGINS, DEV_SESSION_RESPONSIBLES, DEV_SESSION_VERDICT_PROBLEMS, DevSessionAssignmentSchema, DevSessionAttestorSchema, DevSessionCriterionSchema, DevSessionDeliveredFileSchema, DevSessionKindSchema, } from "../../capability/dev/index.js";
import { PaperclipLabRequestSchema } from "../../capability/paperclip/native-wait.js";
import { AgentQuestionDetailsSchema, AgentRequestSchema } from "../../organization/agent-request.js";
import { AssetSha256Schema } from "../../organization/asset.js";
import { ActionPlanDocumentPieceSchema, ReconciledMandateSchema } from "../../organization/business-unit-mandate.js";
import { DecisionRequestSchema } from "../../organization/decision-request.js";
/**
 * Read-only catalog of the eight company contracts and their applied instances (task 8258).
 * Every method, path, query, answer and refusal lives here. Nothing here judges a contract: the services keep their
 * own authorizations and verdicts. No credential crosses these shapes (strict objects everywhere).
 */
/** The package that publishes the catalog; the test compares it with package.json. */
export const COMPANY_CONTRACTS_PACKAGE = { name: '@x9-forge/contracts', version: '1.306.0' };
export const COMPANY_CONTRACT_TYPES = [
    'mandate', 'code_session', 'design_session', 'referent_email', 'lab_request', 'chief_question', 'unit_exchange', 'document_unit',
];
export const CompanyContractTypeSchema = z.enum(COMPANY_CONTRACT_TYPES);
const ShortText = z.string().trim().min(1).max(500);
const Reason = z.string().trim().min(1).max(500);
// ---------------------------------------------------------------------------------------------------------------
// Published catalog
// ---------------------------------------------------------------------------------------------------------------
const PublishedRefSchema = z.strictObject({
    package: z.literal(COMPANY_CONTRACTS_PACKAGE.name),
    version: z.string().min(1).max(40),
    commit: z.string().min(1).max(64).nullable().describe('Commit that publishes the package, null when the reader does not know it'),
});
const CatalogRequirementSchema = z.strictObject({
    id: DevSessionCriterionSchema.shape.id,
    text: DevSessionCriterionSchema.shape.text,
    attestor: DevSessionAttestorSchema,
    proof: DevSessionCriterionSchema.shape.proof,
    origin: z.literal('modello'),
    needs: z.array(z.string().min(1).max(40)).max(20),
    optional: z.boolean().describe('Offered by the model but not part of its form criteria'),
});
const CatalogModelSchema = z.strictObject({
    version: z.int().min(1),
    productKind: DevSessionKindSchema,
    supportedEngines: z.array(z.string().min(1).max(20)).min(1).max(5),
    requiredInput: z.array(z.string().min(1).max(40)).max(20),
    materials: z.array(z.string().min(1).max(40)).max(20),
    requirements: z.array(CatalogRequirementSchema).max(60),
}).describe('The model as the CURRENT package publishes it, not the snapshot a saved contract was written under');
export const CompanyContractCatalogEntrySchema = z.strictObject({
    type: CompanyContractTypeSchema,
    variant: z.enum(DEV_SESSION_TEMPLATE_IDS).optional().describe('Design sessions only: one entry per model'),
    label: ShortText,
    origin: z.strictObject({ schema: ShortText, file: ShortText }),
    published: PublishedRefSchema,
    version: z.discriminatedUnion('kind', [
        z.strictObject({ kind: z.literal('numeric'), value: z.int().min(1), from: ShortText }),
        z.strictObject({ kind: z.literal('absent'), reason: Reason }),
    ]),
    fields: z.array(z.strictObject({ name: z.string().min(1).max(100), required: z.boolean() })).min(1).max(100),
    models: z.array(CatalogModelSchema).max(5),
    historicalSnapshot: z.strictObject({ state: z.literal('non_noto'), reason: Reason }),
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
        const source = DEV_SESSION_ACCEPTANCE_CATALOG[id];
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
export function companyContractCatalog(options = {}) {
    const published = { package: COMPANY_CONTRACTS_PACKAGE.name, version: COMPANY_CONTRACTS_PACKAGE.version, commit: options.commit ?? null };
    const structural = (type, label, schemaName, file, shape, version = { kind: 'absent', reason: NO_VERSION }) => ({
        type, label, origin: { schema: schemaName, file }, published, version, fields: fieldsOf(shape), models: [],
        historicalSnapshot: { state: 'non_noto', reason: NO_SNAPSHOT },
    });
    const session = (type, label, templateId) => {
        const models = [DEV_SESSION_TEMPLATES[templateId]];
        if (templateId in DEV_SESSION_TEMPLATES_V2)
            models.push(DEV_SESSION_TEMPLATES_V2[templateId]);
        return {
            type, variant: templateId, label, origin: { schema: 'DevSessionAssignmentSchema', file: 'src/capability/dev/session-assignment.ts' },
            published,
            version: { kind: 'numeric', value: Math.max(...models.map((model) => model.version)), from: 'template.version' },
            fields: fieldsOf(DevSessionAssignmentSchema.shape), models: models.map(catalogModel),
            historicalSnapshot: { state: 'non_noto', reason: SESSION_NO_SNAPSHOT },
        };
    };
    return CompanyContractCatalogEntrySchema.array().parse([
        structural('mandate', 'Mandate', 'ReconciledMandateSchema', 'src/organization/business-unit-mandate.ts', ReconciledMandateSchema.shape),
        session('code_session', 'Code session', 'sviluppo-pezzo-app'),
        session('design_session', 'Design session: website', 'design-sito'),
        session('design_session', 'Design session: app screen', 'design-schermata-app'),
        session('design_session', 'Design session: retouch', 'design-ritocco'),
        structural('referent_email', 'Email to the referent', 'DecisionRequestSchema', 'src/organization/decision-request.ts', DecisionRequestSchema.shape),
        structural('lab_request', 'Request to the Lab', 'PaperclipLabRequestSchema', 'src/capability/paperclip/native-wait.ts', PaperclipLabRequestSchema.shape),
        structural('chief_question', "Chief's question", 'AgentQuestionDetailsSchema', 'src/organization/agent-request.ts', AgentQuestionDetailsSchema.shape),
        structural('unit_exchange', 'Exchange between units', 'AgentRequestSchema', 'src/organization/agent-request.ts', AgentRequestSchema.shape, { kind: 'numeric', value: 1, from: 'schemaVersion' }),
        structural('document_unit', 'Document unit', 'ActionPlanDocumentPieceSchema', 'src/organization/business-unit-mandate.ts', ActionPlanDocumentPieceSchema.shape),
    ]);
}
// ---------------------------------------------------------------------------------------------------------------
// Applied instances
// ---------------------------------------------------------------------------------------------------------------
/** A value is known with its source, or it is not known with the reason: never an invented placeholder. */
const known = (value) => z.discriminatedUnion('state', [
    z.strictObject({ state: z.literal('noto'), value, source: ShortText }),
    z.strictObject({ state: z.literal('non_noto'), reason: Reason }),
]);
const ScopeShape = {
    tenantId: z.string().min(1).max(200),
    ownerId: CapabilityAgentScopeSchema.shape.ownerId,
    organizationId: z.string().min(1).max(64),
    clientId: z.string().min(1).max(200).optional(),
    projectId: z.string().min(1).max(64),
    unitId: z.string().min(1).max(200).optional(),
};
export const CompanyContractScopeSchema = z.strictObject(ScopeShape);
const ReasonText = z.string().trim().min(1).max(DEV_SESSION_CRITERION_TEXT_MAX);
/** Status of one requirement of an applied contract: the session states plus `in_attesa` and `non_noto`. */
const RequirementStatusSchema = z.union([
    z.strictObject({
        state: z.literal('noto'), value: z.literal(DEV_SESSION_ATTESTATION_STATUSES[0]),
        proof: z.strictObject({ path: DevSessionDeliveredFileSchema.shape.path, sha256: DevSessionDeliveredFileSchema.shape.sha256 }),
        proofOrigin: z.enum(DEV_SESSION_PROOF_ORIGINS),
    }),
    z.strictObject({
        state: z.literal('noto'), value: z.literal(DEV_SESSION_ATTESTATION_STATUSES[1]),
        reason: ReasonText, responsible: z.enum(DEV_SESSION_RESPONSIBLES), nextAction: ReasonText,
    }),
    z.strictObject({ state: z.literal('noto'), value: z.literal(DEV_SESSION_ATTESTATION_STATUSES[2]), reason: ReasonText }),
    // Only the observed absence of an attestation; an unreadable source is `non_noto`.
    z.strictObject({ state: z.literal('noto'), value: z.literal('in_attesa'), observed: z.literal('attestation_absent') }),
    z.strictObject({ state: z.literal('non_noto'), reason: Reason }),
]);
export const CompanyContractRequirementSchema = z.strictObject({
    id: DevSessionCriterionSchema.shape.id,
    text: DevSessionCriterionSchema.shape.text,
    attestor: DevSessionAttestorSchema,
    proof: DevSessionCriterionSchema.shape.proof,
    origin: z.enum(DEV_SESSION_REQUIREMENT_ORIGINS),
    unit: DevSessionCriterionSchema.shape.unit,
    status: RequirementStatusSchema,
});
export const CompanyContractInstanceSchema = z.strictObject({
    type: CompanyContractTypeSchema,
    variant: z.enum(DEV_SESSION_TEMPLATE_IDS).optional(),
    scope: CompanyContractScopeSchema,
    reference: known(z.strictObject({ kind: z.enum(['assignment', 'session', 'document', 'decision', 'request']), id: z.string().min(1).max(200) })),
    digest: known(AssetSha256Schema),
    model: known(z.strictObject({ templateId: z.string().min(1).max(100).optional(), version: z.int().min(1) })),
    nativeRevision: known(z.string().min(1).max(200)),
    author: known(z.string().min(1).max(200)),
    writtenAt: known(z.iso.datetime({ offset: true })),
    requirements: known(z.array(CompanyContractRequirementSchema).max(100)),
});
/** A break names the assignment, the code or the requirement, the proof and the origin; never deduced from `blocked`. */
export const CompanyContractBreakSchema = z.strictObject({
    assignment: z.string().min(1).max(200),
    code: z.enum(DEV_SESSION_VERDICT_PROBLEMS).optional(),
    requirementId: DevSessionCriterionSchema.shape.id.optional(),
    proof: ShortText,
    origin: z.enum(DEV_SESSION_REQUIREMENT_ORIGINS),
    source: z.enum(['paperclip', 'dev', 'agent_core']),
}).refine((value) => value.code !== undefined || value.requirementId !== undefined, {
    path: ['code'], message: 'A break names a code or a requirement',
});
export const CompanyContractSourceReadSchema = z.strictObject({
    source: z.enum(['paperclip', 'dev', 'agent_core']),
    complete: z.boolean(),
    reason: Reason.optional(),
    readAt: z.iso.datetime({ offset: true }).nullable(),
    sampledAt: z.iso.datetime({ offset: true }).nullable(),
}).superRefine((value, ctx) => {
    if (value.complete && (value.reason !== undefined || value.readAt === null)) {
        ctx.addIssue({ code: 'custom', path: ['complete'], message: 'A complete source has readAt and no reason' });
    }
    if (!value.complete && value.reason === undefined) {
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'An incomplete source says why' });
    }
});
const SCOPE_KEYS = Object.keys(ScopeShape);
export const CompanyContractsReadSchema = z.strictObject({
    scope: CompanyContractScopeSchema,
    published: PublishedRefSchema,
    applied: z.array(CompanyContractInstanceSchema).max(100),
    breaks: z.array(CompanyContractBreakSchema).max(200),
    sources: z.array(CompanyContractSourceReadSchema).min(1).max(3),
    page: z.strictObject({
        complete: z.boolean(),
        nextCursor: z.string().min(1).max(2048).nullable(),
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
export function companyContractsScopeProblem(requested, read) {
    return SCOPE_KEYS.find((key) => read.scope[key] !== requested[key]);
}
/** «No broken contract» is proven only by a complete read: a partial one proves nothing. */
export function companyContractsNoBreakProven(read) {
    return read.page.complete && read.breaks.length === 0 && read.sources.every(({ complete }) => complete);
}
// ---------------------------------------------------------------------------------------------------------------
// Endpoint contracts (GET, secret). The first two are service-to-service only and are never offered to the browser.
// ---------------------------------------------------------------------------------------------------------------
const PageQueryShape = {
    limit: z.coerce.number().int().min(1).max(100).optional(),
    cursor: z.string().min(1).max(2048).optional(),
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
export const COMPANY_CONTRACTS_REFUSALS = ['scope_foreign', 'scope_unresolved', 'source_unavailable', 'cursor_invalid'];
export const CompanyContractsRefusalSchema = z.strictObject({ error: z.enum(COMPANY_CONTRACTS_REFUSALS) });
export const INTERNAL_PAPERCLIP_COMPANY_CONTRACTS_PATH = '/internal/paperclip/company-contracts';
export const INTERNAL_DEV_COMPANY_CONTRACTS_PATH = '/internal/dev/company-contracts';
export const INTERNAL_COMPANY_CONTRACTS_PATH = '/internal/company-board/contracts';
export const InternalPaperclipCompanyContractsQuerySchema = z.strictObject(ProjectQueryShape);
export const InternalDevCompanyContractsQuerySchema = z.strictObject({
    ...CapabilityAgentScopeSchema.shape,
    ...ProjectQueryShape,
});
export const InternalCompanyContractsQuerySchema = z.strictObject(ProjectQueryShape);
/** cap-paperclip: contracts written in Paperclip (mandates, requests, Lab) of one project. Service-only. */
export const internalPaperclipCompanyContractsContract = {
    method: 'GET',
    path: INTERNAL_PAPERCLIP_COMPANY_CONTRACTS_PATH,
    authType: 'secret',
    querySchema: InternalPaperclipCompanyContractsQuerySchema,
    responseSchema: CompanyContractsReadSchema,
    refusalSchema: CompanyContractsRefusalSchema,
};
/** cap-dev: session contracts and their attestations on behalf of an agent. Service-only. */
export const internalDevCompanyContractsContract = {
    method: 'GET',
    path: INTERNAL_DEV_COMPANY_CONTRACTS_PATH,
    authType: 'secret',
    querySchema: InternalDevCompanyContractsQuerySchema,
    responseSchema: CompanyContractsReadSchema,
    refusalSchema: CompanyContractsRefusalSchema,
};
/** agent-core: the board read that Forge uses; it merges the two sources and reports which one it could not read. */
export const internalCompanyContractsContract = {
    method: 'GET',
    path: INTERNAL_COMPANY_CONTRACTS_PATH,
    authType: 'secret',
    querySchema: InternalCompanyContractsQuerySchema,
    responseSchema: CompanyContractsReadSchema,
    refusalSchema: CompanyContractsRefusalSchema,
};
//# sourceMappingURL=internal-company-contracts.js.map