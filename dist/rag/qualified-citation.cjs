"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RagQualifiedCitationSchema = exports.RagAuthorizedDocumentRefSchema = void 0;
exports.isRagQualifiedCitationForContext = isRagQualifiedCitationForContext;
const zod_1 = require("zod");
const rag_common_js_1 = require("./rag-common.cjs");
const rag_document_js_1 = require("./rag-document.cjs");
const rag_query_js_1 = require("./rag-query.cjs");
const authorized_context_js_1 = require("./authorized-context.cjs");
const shared_js_1 = require("../capability/coach/shared.cjs");
exports.RagAuthorizedDocumentRefSchema = zod_1.z.object({
    identity: rag_common_js_1.RagIdentityEnvelopeSchema.strict(), corpus_id: rag_common_js_1.RagCorpusRefSchema.shape.id, corpus_revision: shared_js_1.Text128,
    assignment_id: zod_1.z.uuid(), authorization_revision: shared_js_1.Text128,
    document_id: rag_document_js_1.RagDocumentRefSchema.shape.id, revision_id: rag_document_js_1.RagDocumentRevisionRefSchema.shape.id,
}).strict();
exports.RagQualifiedCitationSchema = zod_1.z.object({
    document: exports.RagAuthorizedDocumentRefSchema, title: rag_query_js_1.RagCitationSchema.shape.title, chunk_text: rag_query_js_1.RagCitationSchema.shape.chunk_text,
    score: rag_query_js_1.RagCitationSchema.shape.score, chunk_index: rag_query_js_1.RagCitationSchema.shape.chunk_index, observed_at: shared_js_1.Instant,
}).strict();
function isRagQualifiedCitationForContext(raw, rawContext, currentAssignment, expectedIdentity, expectedDocument, now) {
    const citation = exports.RagQualifiedCitationSchema.safeParse(raw), context = authorized_context_js_1.RagAuthorizedQueryContextSchema.safeParse(rawContext), document = exports.RagAuthorizedDocumentRefSchema.safeParse(expectedDocument);
    if (!citation.success || !context.success || !document.success || !(0, authorized_context_js_1.isRagAuthorizedContextCurrent)(context.data, currentAssignment, expectedIdentity, now))
        return false;
    const d = citation.data.document, a = context.data.assignment;
    return (0, shared_js_1.sameValue)(d, document.data) && (0, shared_js_1.sameValue)(d.identity, a.identity) && d.corpus_id === a.corpus_id && d.assignment_id === a.assignment_id
        && d.corpus_revision === a.corpus_revision && d.authorization_revision === a.authorization_revision && Date.parse(citation.data.observed_at) <= now.getTime();
}
//# sourceMappingURL=qualified-citation.js.map