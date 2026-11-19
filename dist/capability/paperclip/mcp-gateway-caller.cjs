"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperclipTwinDeclarationsSchema = exports.X9_MCP_PATH = exports.X9_MCP_KEY_PREFIX = exports.X9_MCP_KEY_HEADER = exports.PaperclipGatewayCallerSchema = exports.X9_MCP_REQUIRED_KEYS = exports.X9_MCP_FORWARDED_KEYS = exports.PAPERCLIP_GATEWAY_METADATA_KEYS = void 0;
exports.paperclipGatewayHeader = paperclipGatewayHeader;
exports.readPaperclipGatewayCaller = readPaperclipGatewayCaller;
const zod_1 = require("zod");
const tools_js_1 = require("./tools.cjs");
/**
 * Who is calling, when a Paperclip lead uses an X9 tool through Paperclip's MCP gateway.
 * Paperclip tells an external MCP server who calls only through the headers chosen in the connection
 * (`headerPolicy.metadata.forward`); the identity never comes from a request body or a tool argument.
 * Without this shape X9 would hand-write the header names and read the identity from wherever it happens to sit (R-14).
 */
/** Metadata keys Paperclip allows in `headerPolicy.metadata.forward` (Paperclip server/src/services/tool-gateway.ts:376-384). */
exports.PAPERCLIP_GATEWAY_METADATA_KEYS = [
    'company_id', 'agent_id', 'issue_id', 'project_id', 'run_id', 'gateway_session_id', 'correlation_id',
];
/**
 * Header a forwarded key becomes: `x-paperclip-<key with dashes>` (tool-gateway.ts:3349-3371). Lowercase because Node
 * exposes incoming header names that way. An agent-sent `x-paperclip-*` is dropped by Paperclip (:471-477), so these
 * can be trusted as Paperclip's own.
 */
function paperclipGatewayHeader(key) {
    return `x-paperclip-${key.replace(/_/g, '-')}`;
}
/** Keys X9 asks Paperclip to forward. `correlation_id` is left out: it changes on every call, so it identifies nothing. */
exports.X9_MCP_FORWARDED_KEYS = [
    'company_id', 'agent_id', 'issue_id', 'run_id', 'project_id', 'gateway_session_id',
];
/** Keys without which a call is refused. The issue, not the run, is what recognises a repeated request. */
exports.X9_MCP_REQUIRED_KEYS = ['company_id', 'agent_id', 'run_id', 'issue_id'];
exports.PaperclipGatewayCallerSchema = zod_1.z.strictObject({
    companyId: zod_1.z.guid(),
    agentId: tools_js_1.PaperclipAgentIdSchema,
    runId: zod_1.z.guid(),
    issueId: zod_1.z.guid(),
    projectId: zod_1.z.guid().optional(),
    gatewaySessionId: zod_1.z.string().min(1).max(200).optional(),
});
const FIELD_OF = {
    company_id: 'companyId',
    agent_id: 'agentId',
    issue_id: 'issueId',
    run_id: 'runId',
    project_id: 'projectId',
    gateway_session_id: 'gatewaySessionId',
};
/**
 * Reads the caller from request headers only (nothing else is looked at). A required header absent or empty is
 * `caller_header_missing`; a value that is not a single string (doubled header) or fails the schema is
 * `caller_header_invalid`. `header` is the exact header name so the error can name it.
 */
function readPaperclipGatewayCaller(headers) {
    const raw = {};
    for (const key of exports.X9_MCP_FORWARDED_KEYS) {
        const header = paperclipGatewayHeader(key);
        const value = headers[header];
        const required = exports.X9_MCP_REQUIRED_KEYS.includes(key);
        if (value === undefined || value === '') {
            // Paperclip sends no header for an empty value, so an empty optional one is simply absent.
            if (required)
                return { ok: false, code: 'caller_header_missing', header };
            continue;
        }
        if (typeof value !== 'string')
            return { ok: false, code: 'caller_header_invalid', header };
        raw[FIELD_OF[key]] = value;
        const field = FIELD_OF[key];
        const check = exports.PaperclipGatewayCallerSchema.shape[field].safeParse(value);
        if (!check.success)
            return { ok: false, code: 'caller_header_invalid', header };
    }
    const parsed = exports.PaperclipGatewayCallerSchema.safeParse(raw);
    if (!parsed.success)
        return { ok: false, code: 'caller_header_invalid', header: paperclipGatewayHeader('agent_id') };
    return { ok: true, caller: parsed.data };
}
/** The key X9 expects from Paperclip: an app key on a link is sent as `Authorization: Bearer <key>` (tool-access.ts:8268-8276). */
exports.X9_MCP_KEY_HEADER = 'authorization';
exports.X9_MCP_KEY_PREFIX = 'Bearer ';
exports.X9_MCP_PATH = '/mcp/x9-tools';
/**
 * Operator setting `<twin>=<lead>[,…]` (Stefano 19/11: first a twin of the development lead): the twin acts as the
 * lead. Never read from a call. A malformed entry, a repeated twin, two twins for one lead, or a twin that is
 * also a lead (a chain) is rejected.
 */
exports.PaperclipTwinDeclarationsSchema = zod_1.z.string().max(4000).transform((value, ctx) => {
    const map = new Map();
    const leads = new Set();
    for (const entry of value.split(',').map((e) => e.replace(/\s+/g, '')).filter((e) => e !== '')) {
        const parts = entry.split('=');
        const [twin, lead] = parts;
        const reason = (() => {
            if (parts.length !== 2 || !twin || !lead)
                return 'expected <twin>=<lead>';
            if (!zod_1.z.guid().safeParse(twin).success || !zod_1.z.guid().safeParse(lead).success)
                return 'ids must be guids';
            if (twin === lead)
                return 'a twin cannot be its own lead';
            if (map.has(twin))
                return 'twin declared twice';
            if (leads.has(lead))
                return 'two twins for one lead';
            if (leads.has(twin) || map.has(lead))
                return 'a twin cannot also be a lead';
            return null;
        })();
        if (reason !== null || twin === undefined || lead === undefined) {
            ctx.addIssue({ code: 'custom', message: `invalid twin declaration "${entry}": ${reason ?? 'malformed'}` });
            return zod_1.z.NEVER;
        }
        map.set(twin, lead);
        leads.add(lead);
    }
    return map;
});
//# sourceMappingURL=mcp-gateway-caller.js.map