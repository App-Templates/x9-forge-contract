"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RagAuthorizedQueryContextSchema = exports.RagCorpusAssignmentSchema = exports.RagAuthorizedPrincipalSchema = void 0;
exports.isRagAuthorizedContextCurrent = isRagAuthorizedContextCurrent;
const zod_1 = require("zod");
const rag_common_js_1 = require("./rag-common.cjs");
const shared_js_1 = require("../capability/coach/shared.cjs");
exports.RagAuthorizedPrincipalSchema = zod_1.z.object({
    principal_id: shared_js_1.Text128, principal_kind: zod_1.z.enum(['human', 'service']), identity: rag_common_js_1.RagIdentityEnvelopeSchema.strict(), person_id: shared_js_1.Text128.optional(),
}).strict();
exports.RagCorpusAssignmentSchema = zod_1.z.object({
    assignment_id: zod_1.z.uuid(), identity: rag_common_js_1.RagIdentityEnvelopeSchema.strict(), corpus_id: rag_common_js_1.RagCorpusRefSchema.shape.id,
    corpus_revision: shared_js_1.Text128, authorization_revision: shared_js_1.Text128, state: zod_1.z.enum(['active', 'revoked']), observed_at: shared_js_1.Instant,
}).strict();
exports.RagAuthorizedQueryContextSchema = zod_1.z.object({
    principal: exports.RagAuthorizedPrincipalSchema, assignment: exports.RagCorpusAssignmentSchema, observed_at: shared_js_1.Instant, expires_at: shared_js_1.Instant,
}).strict().refine(x => (0, shared_js_1.sameValue)(x.principal.identity, x.assignment.identity) && x.assignment.state === 'active'
    && Date.parse(x.assignment.observed_at) <= Date.parse(x.observed_at)
    && Date.parse(x.expires_at) > Date.parse(x.observed_at) && Date.parse(x.expires_at) - Date.parse(x.observed_at) <= 60000, 'Scoped active short-lived assignment');
function isRagAuthorizedContextCurrent(raw, currentAssignment, expectedIdentity, now) {
    const context = exports.RagAuthorizedQueryContextSchema.safeParse(raw), current = exports.RagCorpusAssignmentSchema.safeParse(currentAssignment), identity = rag_common_js_1.RagIdentityEnvelopeSchema.strict().safeParse(expectedIdentity);
    if (!context.success || !current.success || !identity.success || !Number.isFinite(now.getTime()))
        return false;
    const c = context.data, a = current.data, original = c.assignment;
    return a.state === 'active' && (0, shared_js_1.sameValue)(a.identity, identity.data) && (0, shared_js_1.sameValue)(original.identity, identity.data)
        && a.assignment_id === original.assignment_id && a.corpus_id === original.corpus_id
        && a.corpus_revision === original.corpus_revision && a.authorization_revision === original.authorization_revision
        && Date.parse(a.observed_at) <= now.getTime() && Date.parse(c.observed_at) <= now.getTime() && now.getTime() < Date.parse(c.expires_at);
}
//# sourceMappingURL=authorized-context.js.map