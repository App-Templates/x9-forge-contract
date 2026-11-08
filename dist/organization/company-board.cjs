"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyListSchema = exports.CompanyOverviewSchema = exports.CompanyOverviewProjectSchema = exports.CompanyBoardSchema = exports.CompanyBoardSpendSchema = exports.CompanyBoardServiceSchema = exports.CompanyBoardMilestoneSchema = exports.CompanyBoardUnitSchema = exports.CompanyBoardUnitActionsSchema = exports.CompanyBoardHistoryEntrySchema = exports.CompanyBoardComputerSessionSchema = exports.CompanyBoardPartSchema = exports.CompanyBoardWaitSchema = exports.CompanyBoardUnblockHintSchema = exports.CompanyBoardPersonSchema = exports.CompanyBoardWaitActionSchema = exports.COMPANY_BOARD_WAIT_ACTIONS = exports.CompanyBoardSourceSchema = exports.CompanyBoardSourceNameSchema = exports.COMPANY_BOARD_SOURCES = exports.CompanyBoardHistoryKindSchema = exports.COMPANY_BOARD_HISTORY_KINDS = exports.CompanyBoardWaitKindSchema = exports.COMPANY_BOARD_WAIT_KINDS = exports.CompanyBoardPartStateSchema = exports.COMPANY_BOARD_PART_STATES = exports.CompanyBoardUnitStateSchema = exports.COMPANY_BOARD_UNIT_STATES = void 0;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../agent/agent-identity.cjs");
const asset_js_1 = require("./asset.cjs");
const business_unit_type_js_1 = require("./business-unit-type.cjs");
/**
 * Company board (1.110.0): the shape X9 produces and Forge shows for the owner —
 * who holds each project, the linked units and their history. Read-only shapes.
 */
const BuSlugSchema = zod_1.z.string().min(1).max(30).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const ProjectIdSchema = zod_1.z.string().min(1).max(100);
const ClientIdSchema = asset_js_1.AssetRefSchema.shape.companyId;
const IsoSchema = zod_1.z.iso.datetime({ offset: true });
const ShortTextSchema = zod_1.z.string().min(1).max(500);
const PartIndexSchema = zod_1.z.number().int().min(0).max(1000);
exports.COMPANY_BOARD_UNIT_STATES = [
    'al_lavoro', 'fermo', 'non_partito', 'aspetta_referente', 'aspetta_proprietario', 'aspetta_director',
    'aspetta_reparto', 'attesa_del_via', 'approvato_non_ripartito', 'errore', 'in_pausa', 'non_iniziato',
    'finito', 'non_noto',
];
exports.CompanyBoardUnitStateSchema = zod_1.z.enum(exports.COMPANY_BOARD_UNIT_STATES);
exports.COMPANY_BOARD_PART_STATES = ['fatto', 'in_corso', 'da_fare', 'non_noto'];
exports.CompanyBoardPartStateSchema = zod_1.z.enum(exports.COMPANY_BOARD_PART_STATES);
exports.COMPANY_BOARD_WAIT_KINDS = ['referente', 'proprietario', 'director', 'reparto', 'guasto'];
exports.CompanyBoardWaitKindSchema = zod_1.z.enum(exports.COMPANY_BOARD_WAIT_KINDS);
exports.COMPANY_BOARD_HISTORY_KINDS = [
    'passo', 'messaggio', 'materiale', 'ricerca', 'mandato', 'approvazione', 'richiesta_modifica', 'tentativo_fallito',
];
exports.CompanyBoardHistoryKindSchema = zod_1.z.enum(exports.COMPANY_BOARD_HISTORY_KINDS);
exports.COMPANY_BOARD_SOURCES = ['piano', 'decisioni', 'materiali', 'incarichi', 'sessioni', 'mappa', 'spesa'];
exports.CompanyBoardSourceNameSchema = zod_1.z.enum(exports.COMPANY_BOARD_SOURCES);
exports.CompanyBoardSourceSchema = zod_1.z.strictObject({
    source: exports.CompanyBoardSourceNameSchema,
    status: zod_1.z.enum(['ok', 'non_disponibile', 'tagliata']),
    reason: zod_1.z.string().min(1).max(300).optional(),
}).superRefine((s, ctx) => {
    if (s.status !== 'ok' && s.reason === undefined) {
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'reason is required when the source is not ok' });
    }
});
exports.COMPANY_BOARD_WAIT_ACTIONS = ['rispondi', 'sveglia', 'dai_il_via', 'apri_reparto'];
exports.CompanyBoardWaitActionSchema = zod_1.z.enum(exports.COMPANY_BOARD_WAIT_ACTIONS);
exports.CompanyBoardPersonSchema = zod_1.z.strictObject({
    name: zod_1.z.string().min(1).max(100),
    initials: zod_1.z.string().min(1).max(4),
    role: zod_1.z.string().min(1).max(100),
});
exports.CompanyBoardUnblockHintSchema = zod_1.z.strictObject({
    channel: zod_1.z.enum(['mail', 'paperclip', 'persona']),
    text: zod_1.z.string().min(1).max(300),
    /** Only for the link; never shown. */
    ref: zod_1.z.string().min(1).max(300).nullable(),
});
exports.CompanyBoardWaitSchema = zod_1.z.strictObject({
    kind: exports.CompanyBoardWaitKindSchema,
    who: zod_1.z.array(exports.CompanyBoardPersonSchema).max(10),
    /** Every unit touched by the wait. */
    buSlugs: zod_1.z.array(BuSlugSchema).max(40),
    partIndex: PartIndexSchema.nullable(),
    since: IsoSchema.nullable(),
    what: ShortTextSchema,
    action: exports.CompanyBoardWaitActionSchema.nullable(),
    unblockHint: exports.CompanyBoardUnblockHintSchema.nullable(),
    openIn: zod_1.z.strictObject({ issueIdentifier: zod_1.z.string().min(1).max(100) }).nullable(),
});
exports.CompanyBoardPartSchema = zod_1.z.strictObject({
    index: PartIndexSchema,
    title: zod_1.z.string().min(1).max(200),
    state: exports.CompanyBoardPartStateSchema,
    note: zod_1.z.string().min(1).max(300).nullable(),
    at: IsoSchema.nullable(),
    after: zod_1.z.array(PartIndexSchema).max(30).optional(),
});
exports.CompanyBoardComputerSessionSchema = zod_1.z.strictObject({
    state: zod_1.z.enum(['adesso', 'oggi_finita']),
    at: IsoSchema,
    computerName: zod_1.z.string().min(1).max(100).nullable(),
    what: zod_1.z.string().min(1).max(300).nullable(),
    /** Null until the 5734 proof says whether stopping the lead stops this session. */
    stopsOnPause: zod_1.z.boolean().nullable(),
});
exports.CompanyBoardHistoryEntrySchema = zod_1.z.strictObject({
    at: IsoSchema,
    kind: exports.CompanyBoardHistoryKindSchema,
    text: ShortTextSchema,
    mine: zod_1.z.boolean(),
});
const CompanyBoardActionStateSchema = zod_1.z.strictObject({
    available: zod_1.z.boolean(),
    reason: zod_1.z.string().min(1).max(300).nullable(),
}).superRefine((a, ctx) => {
    if (!a.available && a.reason === null) {
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'reason is required when the action is not available' });
    }
});
exports.CompanyBoardUnitActionsSchema = zod_1.z.strictObject({
    sveglia: CompanyBoardActionStateSchema,
    via: CompanyBoardActionStateSchema,
    ferma: CompanyBoardActionStateSchema,
    riprendi: CompanyBoardActionStateSchema,
});
exports.CompanyBoardUnitSchema = zod_1.z.strictObject({
    buSlug: BuSlugSchema,
    name: zod_1.z.string().min(1).max(100),
    /** From the plan; drives the colour. */
    typeId: business_unit_type_js_1.BusinessUnitLeadTypeIdSchema,
    /** Forge slug of the lead (`managementAgentId`). */
    leadAgentId: zod_1.z.string().min(1).max(100).nullable(),
    referent: zod_1.z.strictObject({
        name: zod_1.z.string().min(1).max(100).nullable(),
        initials: zod_1.z.string().min(1).max(4).nullable(),
        verified: zod_1.z.boolean(),
        missing: zod_1.z.boolean(),
    }),
    state: exports.CompanyBoardUnitStateSchema,
    stateLabel: zod_1.z.string().min(1).max(100),
    since: IsoSchema.nullable(),
    why: zod_1.z.string().min(1).max(200),
    late: zod_1.z.boolean(),
    alert: zod_1.z.strictObject({
        kind: zod_1.z.enum(['errore', 'ritardo']),
        text: ShortTextSchema,
        attempts: zod_1.z.array(zod_1.z.strictObject({ at: IsoSchema, text: ShortTextSchema })).max(20),
    }).nullable(),
    waitingFor: zod_1.z.array(exports.CompanyBoardWaitSchema).max(20),
    sharedAcrossProjects: zod_1.z.boolean(),
    parts: zod_1.z.array(exports.CompanyBoardPartSchema).min(1).max(30),
    computerSession: exports.CompanyBoardComputerSessionSchema.nullable(),
    history: zod_1.z.array(exports.CompanyBoardHistoryEntrySchema).max(30),
    paused: zod_1.z.strictObject({ at: IsoSchema.nullable(), byOwner: zod_1.z.boolean().nullable() }).nullable(),
    actions: exports.CompanyBoardUnitActionsSchema,
    pauseWarning: zod_1.z.string().min(1).max(300).nullable(),
});
exports.CompanyBoardMilestoneSchema = zod_1.z.strictObject({
    number: zod_1.z.number().int().min(1).max(1000),
    buSlug: BuSlugSchema,
    dueDate: zod_1.z.iso.date().nullable(),
    closeCriterion: zod_1.z.string().min(1).max(500),
    state: zod_1.z.enum(['fatta', 'aperta', 'scaduta', 'non_nota']),
});
exports.CompanyBoardServiceSchema = zod_1.z.strictObject({
    role: zod_1.z.enum(['director', 'ricerca_sviluppo']),
    name: zod_1.z.string().min(1).max(100),
    stateLabel: zod_1.z.string().min(1).max(100),
    why: zod_1.z.string().min(1).max(200),
    since: IsoSchema.nullable(),
    servingProjects: zod_1.z.array(zod_1.z.strictObject({ projectId: ProjectIdSchema, what: ShortTextSchema })).max(50),
});
const CompanyBoardCompanySchema = zod_1.z.strictObject({
    clientId: ClientIdSchema,
    name: zod_1.z.string().min(1).max(200).nullable(),
});
const CompanyBoardExchangeSchema = zod_1.z.strictObject({
    fromBu: BuSlugSchema,
    toBu: BuSlugSchema,
    what: ShortTextSchema,
    blocking: zod_1.z.boolean(),
    open: zod_1.z.boolean(),
});
const CompanyBoardSummarySchema = zod_1.z.string().min(1).max(400);
const SpendMicrosSchema = zod_1.z.number().int().min(0);
/**
 * Spend of a project (1.115.0): micro-dollars of the X9 journal; `null` = agent not measured by the cap, never zero.
 * `scope: 'azienda'` when the spend cannot be split by project.
 */
const CompanyBoardSpendRowSchema = zod_1.z.strictObject({
    kind: zod_1.z.enum(['reparto', 'director', 'ricerca_sviluppo', 'altro']),
    buSlug: BuSlugSchema.nullable(),
    todayMicros: SpendMicrosSchema.nullable(),
    totalMicros: SpendMicrosSchema.nullable(),
}).superRefine((r, ctx) => {
    if ((r.kind === 'reparto') !== (r.buSlug !== null)) {
        ctx.addIssue({ code: 'custom', path: ['buSlug'], message: 'buSlug is required if and only if kind is reparto' });
    }
    if ((r.todayMicros === null) !== (r.totalMicros === null)) {
        ctx.addIssue({ code: 'custom', path: ['todayMicros'], message: 'todayMicros and totalMicros are both null or both numbers' });
    }
    if (r.todayMicros !== null && r.totalMicros !== null && r.todayMicros > r.totalMicros) {
        ctx.addIssue({ code: 'custom', path: ['todayMicros'], message: 'todayMicros cannot exceed totalMicros' });
    }
});
const SPEND_DAYS = 14;
const DAY_MS = 86_400_000;
exports.CompanyBoardSpendSchema = zod_1.z.union([
    zod_1.z.strictObject({ status: zod_1.z.literal('non_collegata') }),
    zod_1.z.strictObject({
        status: zod_1.z.literal('ok'),
        scope: zod_1.z.enum(['progetto', 'azienda']),
        usdPerEur: zod_1.z.number().positive().finite(),
        since: IsoSchema,
        todayMicros: SpendMicrosSchema,
        totalMicros: SpendMicrosSchema,
        days: zod_1.z.array(zod_1.z.strictObject({ date: zod_1.z.iso.date(), micros: SpendMicrosSchema })).length(SPEND_DAYS),
        rows: zod_1.z.array(CompanyBoardSpendRowSchema).max(44),
        estimated: zod_1.z.boolean(),
    }).superRefine((s, ctx) => {
        const consecutive = s.days.every((d, i) => i === 0 || Date.parse(d.date) - Date.parse(s.days[i - 1].date) === DAY_MS);
        if (!consecutive) {
            ctx.addIssue({ code: 'custom', path: ['days'], message: 'days must be consecutive, oldest first' });
        }
        const sum = (values) => values.reduce((a, v) => a + (v ?? 0), 0);
        if (s.days.length === SPEND_DAYS && s.todayMicros !== s.days[SPEND_DAYS - 1].micros) {
            ctx.addIssue({ code: 'custom', path: ['todayMicros'], message: 'todayMicros must equal the last day' });
        }
        if (s.todayMicros !== sum(s.rows.map((r) => r.todayMicros))) {
            ctx.addIssue({ code: 'custom', path: ['todayMicros'], message: 'todayMicros must equal the sum of the rows' });
        }
        if (s.totalMicros !== sum(s.rows.map((r) => r.totalMicros))) {
            ctx.addIssue({ code: 'custom', path: ['totalMicros'], message: 'totalMicros must equal the sum of the rows' });
        }
        if (sum(s.days.map((d) => d.micros)) > s.totalMicros) {
            ctx.addIssue({ code: 'custom', path: ['days'], message: 'the days cannot add up to more than totalMicros' });
        }
        const seen = new Set();
        s.rows.forEach((r, i) => {
            const key = r.kind === 'reparto' ? `reparto:${r.buSlug}` : r.kind;
            if (seen.has(key)) {
                ctx.addIssue({ code: 'custom', path: ['rows', i], message: 'duplicate row' });
            }
            seen.add(key);
        });
    }),
]);
const CompanyBoardProjectBaseShape = {
    project: zod_1.z.strictObject({
        projectId: ProjectIdSchema,
        name: zod_1.z.string().min(1).max(200).nullable(),
        planVersion: zod_1.z.number().int().min(1).nullable(),
    }),
    readAt: IsoSchema,
    summary: CompanyBoardSummarySchema,
    director: zod_1.z.strictObject({
        state: exports.CompanyBoardUnitStateSchema,
        doing: zod_1.z.string().min(1).max(300).nullable(),
        wokenAt: IsoSchema.nullable(),
        wokenWhy: zod_1.z.string().min(1).max(300).nullable(),
    }),
    milestoneLine: zod_1.z.strictObject({ text: zod_1.z.string().min(1).max(300), overdue: zod_1.z.boolean() }).nullable(),
    milestones: zod_1.z.array(exports.CompanyBoardMilestoneSchema).max(200),
    waits: zod_1.z.array(exports.CompanyBoardWaitSchema).max(100),
    exchanges: zod_1.z.array(CompanyBoardExchangeSchema).max(200),
    spend: exports.CompanyBoardSpendSchema,
    sources: zod_1.z.array(exports.CompanyBoardSourceSchema).max(exports.COMPANY_BOARD_SOURCES.length),
};
/** Project page. At most 40 units: agent-core cuts before building (the cut is declared in `sources`). */
exports.CompanyBoardSchema = zod_1.z.strictObject({
    company: CompanyBoardCompanySchema,
    ...CompanyBoardProjectBaseShape,
    units: zod_1.z.array(exports.CompanyBoardUnitSchema).max(40),
    projectHistory: zod_1.z.array(zod_1.z.strictObject({ at: IsoSchema, kind: exports.CompanyBoardHistoryKindSchema, text: ShortTextSchema })).max(10),
});
/** A project inside the company overview: units without `history`. */
exports.CompanyOverviewProjectSchema = zod_1.z.strictObject({
    ...CompanyBoardProjectBaseShape,
    units: zod_1.z.array(exports.CompanyBoardUnitSchema.omit({ history: true })).max(40),
    projectHistory: zod_1.z.array(zod_1.z.strictObject({ at: IsoSchema, kind: exports.CompanyBoardHistoryKindSchema, text: ShortTextSchema })).max(10),
});
exports.CompanyOverviewSchema = zod_1.z.strictObject({
    company: CompanyBoardCompanySchema,
    summary: CompanyBoardSummarySchema,
    services: zod_1.z.array(exports.CompanyBoardServiceSchema).max(10),
    projects: zod_1.z.array(exports.CompanyOverviewProjectSchema).max(100),
});
exports.CompanyListSchema = zod_1.z.strictObject({
    companies: zod_1.z.array(zod_1.z.strictObject({
        directorAgentId: agent_identity_js_1.AgentIdSchema,
        clientId: ClientIdSchema,
        name: zod_1.z.string().min(1).max(200).nullable(),
        projects: zod_1.z.array(zod_1.z.strictObject({ projectId: ProjectIdSchema, name: zod_1.z.string().min(1).max(200).nullable() })).max(100),
    })).max(200),
});
//# sourceMappingURL=company-board.js.map