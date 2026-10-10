import { z } from 'zod';
import { RagIdentityEnvelopeSchema, RagCorpusRefSchema } from "./rag-common.js";
import { Text128, Instant, sameValue } from "../capability/coach/shared.js";
export const RagAuthorizedPrincipalSchema = z.object({
    principal_id: Text128, principal_kind: z.enum(['human', 'service']), identity: RagIdentityEnvelopeSchema.strict(), person_id: Text128.optional(),
}).strict();
export const RagCorpusAssignmentSchema = z.object({
    assignment_id: z.uuid(), identity: RagIdentityEnvelopeSchema.strict(), corpus_id: RagCorpusRefSchema.shape.id,
    corpus_revision: Text128, authorization_revision: Text128, state: z.enum(['active', 'revoked']), observed_at: Instant,
}).strict();
export const RagAuthorizedQueryContextSchema = z.object({
    principal: RagAuthorizedPrincipalSchema, assignment: RagCorpusAssignmentSchema, observed_at: Instant, expires_at: Instant,
}).strict().refine(x => sameValue(x.principal.identity, x.assignment.identity) && x.assignment.state === 'active'
    && Date.parse(x.assignment.observed_at) <= Date.parse(x.observed_at)
    && Date.parse(x.expires_at) > Date.parse(x.observed_at) && Date.parse(x.expires_at) - Date.parse(x.observed_at) <= 60000, 'Scoped active short-lived assignment');
export function isRagAuthorizedContextCurrent(raw, currentAssignment, expectedIdentity, now) {
    const context = RagAuthorizedQueryContextSchema.safeParse(raw), current = RagCorpusAssignmentSchema.safeParse(currentAssignment), identity = RagIdentityEnvelopeSchema.strict().safeParse(expectedIdentity);
    if (!context.success || !current.success || !identity.success || !Number.isFinite(now.getTime()))
        return false;
    const c = context.data, a = current.data, original = c.assignment;
    return a.state === 'active' && sameValue(a.identity, identity.data) && sameValue(original.identity, identity.data)
        && a.assignment_id === original.assignment_id && a.corpus_id === original.corpus_id
        && a.corpus_revision === original.corpus_revision && a.authorization_revision === original.authorization_revision
        && Date.parse(a.observed_at) <= now.getTime() && Date.parse(c.observed_at) <= now.getTime() && now.getTime() < Date.parse(c.expires_at);
}
//# sourceMappingURL=authorized-context.js.map