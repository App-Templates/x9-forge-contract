"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoLongChaptersApproveRequestSchema = exports.VideoLongChaptersSchema = exports.VideoLongChaptersStatusSchema = exports.VideoLongChaptersDocumentSchema = exports.VideoLongResearchedChapterSchema = exports.VideoLongFrameHypothesisSchema = exports.VideoLongFramingSchema = exports.VideoLongResearchRefusalSchema = exports.VideoLongResearchSchema = exports.VideoLongResearchStartRequestSchema = exports.VideoLongDossierSchema = exports.VideoLongDossierDocumentSchema = exports.VideoLongClaimSchema = exports.VideoLongSourceSchema = exports.VIDEO_LONG_MAX_CLAIMS = exports.VIDEO_LONG_MAX_SOURCES = exports.VIDEO_LONG_RESEARCH_MAX_QUESTIONS = void 0;
const zod_1 = require("zod");
const asset_js_1 = require("../../organization/asset.cjs");
const tools_js_1 = require("../lab/tools.cjs");
const wiki_js_1 = require("../lab/wiki.cjs");
const research_js_1 = require("../ricerca/research.cjs");
const engine_js_1 = require("./engine.cjs");
const lungo_bozza_js_1 = require("./lungo-bozza.cjs");
const lungo_js_1 = require("./lungo.cjs");
exports.VIDEO_LONG_RESEARCH_MAX_QUESTIONS = 12;
exports.VIDEO_LONG_MAX_SOURCES = 60;
exports.VIDEO_LONG_MAX_CLAIMS = 200;
exports.VideoLongSourceSchema = zod_1.z.strictObject({
    id: wiki_js_1.WikiSourceIdSchema,
    title: zod_1.z.string().min(1).max(500).nullable(),
    url: zod_1.z.url().max(2000).nullable(),
    publisher: zod_1.z.string().min(1).max(200).nullable(),
    excerpt: zod_1.z.string().min(1).max(600),
    origin: wiki_js_1.WikiOriginSchema,
    labPageSlug: wiki_js_1.WikiPageSlugSchema.nullable(),
    retrievedAt: zod_1.z.string().min(1).max(40),
});
exports.VideoLongClaimSchema = zod_1.z.strictObject({
    id: zod_1.z.string().min(1).max(64),
    text: zod_1.z.string().min(1).max(600),
    sourceIds: zod_1.z.array(wiki_js_1.WikiSourceIdSchema).min(1).max(5),
    attributed: zod_1.z.boolean(),
});
/** The engine checks source/claim references and links claims to chapters. */
exports.VideoLongDossierDocumentSchema = zod_1.z.strictObject({
    draftRevision: engine_js_1.VideoEngineRevisionSchema,
    researchIds: zod_1.z.array(research_js_1.ResearchIdSchema).max(exports.VIDEO_LONG_RESEARCH_MAX_QUESTIONS),
    sources: zod_1.z.array(exports.VideoLongSourceSchema).max(exports.VIDEO_LONG_MAX_SOURCES),
    claims: zod_1.z.array(exports.VideoLongClaimSchema).max(exports.VIDEO_LONG_MAX_CLAIMS),
    /** null means cap-ricerca did not measure the cost. */
    costUsd: research_js_1.ResearchCostSchema.shape.usd.nullable(),
});
exports.VideoLongDossierSchema = exports.VideoLongDossierDocumentSchema.extend({
    revision: engine_js_1.VideoEngineRevisionSchema,
    digest: lungo_bozza_js_1.VideoLongDraftSchema.shape.digest,
    recordedAt: zod_1.z.string().min(1).max(40),
});
/** The engine checks approval, revision/digest consistency and question uniqueness. */
exports.VideoLongResearchStartRequestSchema = zod_1.z.strictObject({
    draftRevision: engine_js_1.VideoEngineRevisionSchema,
    draftDigest: lungo_bozza_js_1.VideoLongDraftSchema.shape.digest,
    questions: zod_1.z.array(tools_js_1.LabQueryInputSchema.shape.question).min(1).max(exports.VIDEO_LONG_RESEARCH_MAX_QUESTIONS),
    labClientId: asset_js_1.AssetRefSchema.shape.companyId,
    labProjectId: asset_js_1.AssetRefSchema.shape.projectId,
});
exports.VideoLongResearchSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema,
    draftRevision: engine_js_1.VideoEngineRevisionSchema,
    draftDigest: lungo_bozza_js_1.VideoLongDraftSchema.shape.digest,
    state: research_js_1.ResearchStateSchema,
    gapsRef: research_js_1.LabGapsRefSchema.nullable(),
    researchIds: zod_1.z.array(research_js_1.ResearchIdSchema).max(exports.VIDEO_LONG_RESEARCH_MAX_QUESTIONS),
    startedAt: zod_1.z.string().min(1).max(40),
    finishedAt: zod_1.z.string().min(1).max(40).nullable(),
});
exports.VideoLongResearchRefusalSchema = zod_1.z.enum([
    'bozza_non_approvata',
    'revisione_cambiata',
    'impronta_diversa',
    'ricerca_gia_avviata',
    'motore_non_disponibile',
]);
/**
 * How a piece of a chapter is imagined: the person on the armchair, the footage
 * that starts afterwards, the place, or a graphic.
 */
exports.VideoLongFramingSchema = zod_1.z.enum(['intervista', 'immagini', 'ambiente', 'grafica']);
exports.VideoLongFrameHypothesisSchema = zod_1.z.strictObject({
    description: zod_1.z.string().min(1).max(400),
    framing: exports.VideoLongFramingSchema,
    sourceId: wiki_js_1.WikiSourceIdSchema.nullable(),
});
/** The draft chapter, unchanged, extended with sources and frame hypotheses. */
exports.VideoLongResearchedChapterSchema = lungo_bozza_js_1.VideoLongChapterSchema.extend({
    sourceIds: zod_1.z.array(wiki_js_1.WikiSourceIdSchema).max(10),
    frameHypotheses: zod_1.z.array(exports.VideoLongFrameHypothesisSchema).min(1).max(6),
});
/** The engine checks consecutive indexes, sources present in the dossier and the total. */
exports.VideoLongChaptersDocumentSchema = zod_1.z.strictObject({
    draftRevision: engine_js_1.VideoEngineRevisionSchema,
    dossierRevision: engine_js_1.VideoEngineRevisionSchema,
    chapters: zod_1.z.array(exports.VideoLongResearchedChapterSchema).min(1).max(lungo_js_1.VIDEO_LONG_MAX_CHAPTERS),
    usage: lungo_bozza_js_1.VideoLongUsageSchema.nullable(),
});
exports.VideoLongChaptersStatusSchema = zod_1.z.enum(['da-approvare', 'approvati']);
exports.VideoLongChaptersSchema = exports.VideoLongChaptersDocumentSchema.extend({
    revision: engine_js_1.VideoEngineRevisionSchema,
    status: exports.VideoLongChaptersStatusSchema,
    totalSeconds: zod_1.z.number().int().min(10).max(lungo_js_1.VIDEO_LONG_MAX_SECONDS),
    digest: lungo_bozza_js_1.VideoLongDraftSchema.shape.digest,
    approvedAt: zod_1.z.string().min(1).max(40).nullable(),
});
exports.VideoLongChaptersApproveRequestSchema = zod_1.z.strictObject({
    revision: engine_js_1.VideoEngineRevisionSchema,
    digest: lungo_bozza_js_1.VideoLongDraftSchema.shape.digest,
});
//# sourceMappingURL=lungo-ricerca.js.map