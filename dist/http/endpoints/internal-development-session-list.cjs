"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDevelopmentSessionsContract = exports.DevelopmentSessionListSchema = exports.DevelopmentSessionListQuerySchema = void 0;
exports.selectDevelopmentSessionList = selectDevelopmentSessionList;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
const development_session_state_js_1 = require("../../capability/connect/development-session-state.cjs");
exports.DevelopmentSessionListQuerySchema = zod_1.z.object({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    cursor: zod_1.z.string().trim().min(1).max(512).optional(),
    limit: zod_1.z.number().int().min(1).max(50).default(20),
}).strict();
exports.DevelopmentSessionListSchema = zod_1.z.object({
    items: zod_1.z.array(development_session_state_js_1.DevelopmentSessionLeaseSchema).max(50),
    nextCursor: zod_1.z.string().trim().min(1).max(512).nullable(),
}).strict()
    .refine(({ items }) => new Set(items.map(({ binding }) => binding.sessionId)).size === items.length, {
    message: 'Session IDs must be unique', path: ['items'],
})
    .refine(({ items }) => {
    const first = items[0];
    if (!first)
        return true;
    return items.every(({ binding }) => binding.scope.tenantId === first.binding.scope.tenantId
        && binding.scope.ownerId === first.binding.scope.ownerId
        && binding.scope.agentId === first.binding.scope.agentId);
}, {
    message: 'Session scopes must match within a page', path: ['items'],
});
/**
 * The service authenticates the owner, filters by scope and correlates the cursor
 * with the authenticated tenant, owner and agent. The query alone authenticates nobody.
 * Include offline and revoked sessions so the selector shows their real state.
 * An empty page is valid; invalid registry data must propagate as an error, never an empty list.
 * This contract provides neither a registry nor an HTTP handler.
 */
exports.listDevelopmentSessionsContract = {
    method: 'GET',
    path: '/internal/connect/development-sessions',
    authType: 'secret',
    querySchema: exports.DevelopmentSessionListQuerySchema,
    responseSchema: exports.DevelopmentSessionListSchema,
};
/**
 * Consumer-side check of a list page against the query the authenticated caller sent. Returns an independent
 * parsed copy, or null for any malformed input, oversized page or foreign scope. Order, nextCursor, targets,
 * engines and offline/revoked leases are kept as received: nothing is filtered and an error is never an empty page.
 * Owner authentication and the cursor stay the server's responsibility.
 */
function selectDevelopmentSessionList(rawPage, expectedQuery) {
    const query = exports.DevelopmentSessionListQuerySchema.safeParse(expectedQuery);
    const page = exports.DevelopmentSessionListSchema.safeParse(rawPage);
    if (!query.success || !page.success)
        return null;
    if (page.data.items.length > query.data.limit)
        return null;
    if (!page.data.items.every(({ binding }) => (0, capability_call_context_js_1.sameCapabilityScope)(binding.scope, query.data.scope)))
        return null;
    return page.data;
}
//# sourceMappingURL=internal-development-session-list.js.map