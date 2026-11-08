import { z } from 'zod';
import { AgentIdSchema } from "../agent/agent-identity.js";
import { AssetRefSchema } from "./asset.js";
import { BusinessUnitLeadTypeIdSchema } from "./business-unit-type.js";
/**
 * Company board (1.110.0): the shape X9 produces and Forge shows for the owner —
 * who holds each project, the linked units and their history. Read-only shapes.
 */
const BuSlugSchema = z.string().min(1).max(30).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const ProjectIdSchema = z.string().min(1).max(100);
const ClientIdSchema = AssetRefSchema.shape.companyId;
const IsoSchema = z.iso.datetime({ offset: true });
const ShortTextSchema = z.string().min(1).max(500);
const PartIndexSchema = z.number().int().min(0).max(1000);
export const COMPANY_BOARD_UNIT_STATES = [
    'al_lavoro', 'fermo', 'non_partito', 'aspetta_referente', 'aspetta_proprietario', 'aspetta_director',
    'aspetta_reparto', 'attesa_del_via', 'approvato_non_ripartito', 'errore', 'in_pausa', 'non_iniziato',
    'finito', 'non_noto',
];
export const CompanyBoardUnitStateSchema = z.enum(COMPANY_BOARD_UNIT_STATES);
export const COMPANY_BOARD_PART_STATES = ['fatto', 'in_corso', 'da_fare', 'non_noto'];
export const CompanyBoardPartStateSchema = z.enum(COMPANY_BOARD_PART_STATES);
export const COMPANY_BOARD_WAIT_KINDS = ['referente', 'proprietario', 'director', 'reparto', 'guasto'];
export const CompanyBoardWaitKindSchema = z.enum(COMPANY_BOARD_WAIT_KINDS);
export const COMPANY_BOARD_HISTORY_KINDS = [
    'passo', 'messaggio', 'materiale', 'ricerca', 'mandato', 'approvazione', 'richiesta_modifica', 'tentativo_fallito',
];
export const CompanyBoardHistoryKindSchema = z.enum(COMPANY_BOARD_HISTORY_KINDS);
export const COMPANY_BOARD_SOURCES = ['piano', 'decisioni', 'materiali', 'incarichi', 'sessioni', 'mappa', 'spesa'];
export const CompanyBoardSourceNameSchema = z.enum(COMPANY_BOARD_SOURCES);
export const CompanyBoardSourceSchema = z.strictObject({
    source: CompanyBoardSourceNameSchema,
    status: z.enum(['ok', 'non_disponibile', 'tagliata']),
    reason: z.string().min(1).max(300).optional(),
}).superRefine((s, ctx) => {
    if (s.status !== 'ok' && s.reason === undefined) {
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'reason is required when the source is not ok' });
    }
});
export const COMPANY_BOARD_WAIT_ACTIONS = ['rispondi', 'sveglia', 'dai_il_via', 'apri_reparto'];
export const CompanyBoardWaitActionSchema = z.enum(COMPANY_BOARD_WAIT_ACTIONS);
export const CompanyBoardPersonSchema = z.strictObject({
    name: z.string().min(1).max(100),
    initials: z.string().min(1).max(4),
    role: z.string().min(1).max(100),
});
export const CompanyBoardUnblockHintSchema = z.strictObject({
    channel: z.enum(['mail', 'paperclip', 'persona']),
    text: z.string().min(1).max(300),
    /** Only for the link; never shown. */
    ref: z.string().min(1).max(300).nullable(),
});
export const CompanyBoardWaitSchema = z.strictObject({
    kind: CompanyBoardWaitKindSchema,
    who: z.array(CompanyBoardPersonSchema).max(10),
    /** Every unit touched by the wait. */
    buSlugs: z.array(BuSlugSchema).max(40),
    partIndex: PartIndexSchema.nullable(),
    since: IsoSchema.nullable(),
    what: ShortTextSchema,
    action: CompanyBoardWaitActionSchema.nullable(),
    unblockHint: CompanyBoardUnblockHintSchema.nullable(),
    openIn: z.strictObject({ issueIdentifier: z.string().min(1).max(100) }).nullable(),
});
export const CompanyBoardPartSchema = z.strictObject({
    index: PartIndexSchema,
    title: z.string().min(1).max(200),
    state: CompanyBoardPartStateSchema,
    note: z.string().min(1).max(300).nullable(),
    at: IsoSchema.nullable(),
    after: z.array(PartIndexSchema).max(30).optional(),
});
export const CompanyBoardComputerSessionSchema = z.strictObject({
    state: z.enum(['adesso', 'oggi_finita']),
    at: IsoSchema,
    computerName: z.string().min(1).max(100).nullable(),
    what: z.string().min(1).max(300).nullable(),
    /** Null until the 5734 proof says whether stopping the lead stops this session. */
    stopsOnPause: z.boolean().nullable(),
});
export const CompanyBoardHistoryEntrySchema = z.strictObject({
    at: IsoSchema,
    kind: CompanyBoardHistoryKindSchema,
    text: ShortTextSchema,
    mine: z.boolean(),
});
const CompanyBoardActionStateSchema = z.strictObject({
    available: z.boolean(),
    reason: z.string().min(1).max(300).nullable(),
}).superRefine((a, ctx) => {
    if (!a.available && a.reason === null) {
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'reason is required when the action is not available' });
    }
});
export const CompanyBoardUnitActionsSchema = z.strictObject({
    sveglia: CompanyBoardActionStateSchema,
    via: CompanyBoardActionStateSchema,
    ferma: CompanyBoardActionStateSchema,
    riprendi: CompanyBoardActionStateSchema,
});
export const CompanyBoardUnitSchema = z.strictObject({
    buSlug: BuSlugSchema,
    name: z.string().min(1).max(100),
    /** From the plan; drives the colour. */
    typeId: BusinessUnitLeadTypeIdSchema,
    /** Forge slug of the lead (`managementAgentId`). */
    leadAgentId: z.string().min(1).max(100).nullable(),
    referent: z.strictObject({
        name: z.string().min(1).max(100).nullable(),
        initials: z.string().min(1).max(4).nullable(),
        verified: z.boolean(),
        missing: z.boolean(),
    }),
    state: CompanyBoardUnitStateSchema,
    stateLabel: z.string().min(1).max(100),
    since: IsoSchema.nullable(),
    why: z.string().min(1).max(200),
    late: z.boolean(),
    alert: z.strictObject({
        kind: z.enum(['errore', 'ritardo']),
        text: ShortTextSchema,
        attempts: z.array(z.strictObject({ at: IsoSchema, text: ShortTextSchema })).max(20),
    }).nullable(),
    waitingFor: z.array(CompanyBoardWaitSchema).max(20),
    sharedAcrossProjects: z.boolean(),
    parts: z.array(CompanyBoardPartSchema).min(1).max(30),
    computerSession: CompanyBoardComputerSessionSchema.nullable(),
    history: z.array(CompanyBoardHistoryEntrySchema).max(30),
    paused: z.strictObject({ at: IsoSchema.nullable(), byOwner: z.boolean().nullable() }).nullable(),
    actions: CompanyBoardUnitActionsSchema,
    pauseWarning: z.string().min(1).max(300).nullable(),
});
export const CompanyBoardMilestoneSchema = z.strictObject({
    number: z.number().int().min(1).max(1000),
    buSlug: BuSlugSchema,
    dueDate: z.iso.date().nullable(),
    closeCriterion: z.string().min(1).max(500),
    state: z.enum(['fatta', 'aperta', 'scaduta', 'non_nota']),
});
export const CompanyBoardServiceSchema = z.strictObject({
    role: z.enum(['director', 'ricerca_sviluppo']),
    name: z.string().min(1).max(100),
    stateLabel: z.string().min(1).max(100),
    why: z.string().min(1).max(200),
    since: IsoSchema.nullable(),
    servingProjects: z.array(z.strictObject({ projectId: ProjectIdSchema, what: ShortTextSchema })).max(50),
});
const CompanyBoardCompanySchema = z.strictObject({
    clientId: ClientIdSchema,
    name: z.string().min(1).max(200).nullable(),
});
const CompanyBoardExchangeSchema = z.strictObject({
    fromBu: BuSlugSchema,
    toBu: BuSlugSchema,
    what: ShortTextSchema,
    blocking: z.boolean(),
    open: z.boolean(),
});
const CompanyBoardSummarySchema = z.string().min(1).max(400);
const SpendMicrosSchema = z.number().int().min(0);
/**
 * Spend of a project (1.115.0): micro-dollars of the X9 journal; `null` = agent not measured by the cap, never zero.
 * `scope: 'azienda'` when the spend cannot be split by project.
 */
const CompanyBoardSpendRowSchema = z.strictObject({
    kind: z.enum(['reparto', 'director', 'ricerca_sviluppo', 'altro']),
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
export const CompanyBoardSpendSchema = z.union([
    z.strictObject({ status: z.literal('non_collegata') }),
    z.strictObject({
        status: z.literal('ok'),
        scope: z.enum(['progetto', 'azienda']),
        usdPerEur: z.number().positive().finite(),
        since: IsoSchema,
        todayMicros: SpendMicrosSchema,
        totalMicros: SpendMicrosSchema,
        days: z.array(z.strictObject({ date: z.iso.date(), micros: SpendMicrosSchema })).length(SPEND_DAYS),
        rows: z.array(CompanyBoardSpendRowSchema).max(44),
        estimated: z.boolean(),
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
    project: z.strictObject({
        projectId: ProjectIdSchema,
        name: z.string().min(1).max(200).nullable(),
        planVersion: z.number().int().min(1).nullable(),
    }),
    readAt: IsoSchema,
    summary: CompanyBoardSummarySchema,
    director: z.strictObject({
        state: CompanyBoardUnitStateSchema,
        doing: z.string().min(1).max(300).nullable(),
        wokenAt: IsoSchema.nullable(),
        wokenWhy: z.string().min(1).max(300).nullable(),
    }),
    milestoneLine: z.strictObject({ text: z.string().min(1).max(300), overdue: z.boolean() }).nullable(),
    milestones: z.array(CompanyBoardMilestoneSchema).max(200),
    waits: z.array(CompanyBoardWaitSchema).max(100),
    exchanges: z.array(CompanyBoardExchangeSchema).max(200),
    spend: CompanyBoardSpendSchema,
    sources: z.array(CompanyBoardSourceSchema).max(COMPANY_BOARD_SOURCES.length),
};
/** Project page. At most 40 units: agent-core cuts before building (the cut is declared in `sources`). */
export const CompanyBoardSchema = z.strictObject({
    company: CompanyBoardCompanySchema,
    ...CompanyBoardProjectBaseShape,
    units: z.array(CompanyBoardUnitSchema).max(40),
    projectHistory: z.array(z.strictObject({ at: IsoSchema, kind: CompanyBoardHistoryKindSchema, text: ShortTextSchema })).max(10),
});
/** A project inside the company overview: units without `history`. */
export const CompanyOverviewProjectSchema = z.strictObject({
    ...CompanyBoardProjectBaseShape,
    units: z.array(CompanyBoardUnitSchema.omit({ history: true })).max(40),
    projectHistory: z.array(z.strictObject({ at: IsoSchema, kind: CompanyBoardHistoryKindSchema, text: ShortTextSchema })).max(10),
});
export const CompanyOverviewSchema = z.strictObject({
    company: CompanyBoardCompanySchema,
    summary: CompanyBoardSummarySchema,
    services: z.array(CompanyBoardServiceSchema).max(10),
    projects: z.array(CompanyOverviewProjectSchema).max(100),
});
export const CompanyListSchema = z.strictObject({
    companies: z.array(z.strictObject({
        directorAgentId: AgentIdSchema,
        clientId: ClientIdSchema,
        name: z.string().min(1).max(200).nullable(),
        projects: z.array(z.strictObject({ projectId: ProjectIdSchema, name: z.string().min(1).max(200).nullable() })).max(100),
    })).max(200),
});
//# sourceMappingURL=company-board.js.map