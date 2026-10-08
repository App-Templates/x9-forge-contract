"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevenLabsWebBrowserSessionSchema = exports.ElevenLabsWebBrowserRequestSchema = void 0;
exports.projectElevenLabsWebBrowserSession = projectElevenLabsWebBrowserSession;
const zod_1 = require("zod");
const web_context_js_1 = require("./web-context.cjs");
const web_session_js_1 = require("./web-session.cjs");
/** Correlation only. Forge reloads viewer, owner, scope and admission evidence from its own server session. */
exports.ElevenLabsWebBrowserRequestSchema = zod_1.z.object({
    requestId: web_session_js_1.ElevenLabsWebSessionResultSchema.shape.requestId, linkId: web_session_js_1.ElevenLabsWebLinkSchema.shape.linkId,
}).strict();
/** Only the admitted browser receives this short transport lease; never persist, log or include it in history. */
exports.ElevenLabsWebBrowserSessionSchema = zod_1.z.object({
    ok: web_session_js_1.ElevenLabsWebSessionResultSchema.shape.ok,
    requestId: web_session_js_1.ElevenLabsWebSessionResultSchema.shape.requestId, linkId: web_session_js_1.ElevenLabsWebLinkSchema.shape.linkId,
    issuedAt: web_session_js_1.ElevenLabsWebSessionResultSchema.shape.issuedAt, expiresAt: web_session_js_1.ElevenLabsWebSessionResultSchema.shape.expiresAt,
    signedUrl: web_session_js_1.ElevenLabsWebSessionResultSchema.shape.signedUrl,
}).strict().superRefine((lease, ctx) => {
    const duration = Date.parse(lease.expiresAt) - Date.parse(lease.issuedAt);
    if (duration <= 0 || duration > 15 * 60_000)
        ctx.addIssue({ code: 'custom', path: ['expiresAt'], message: 'Connection window must be positive and no longer than fifteen minutes' }); // guard:browser-window
    if (!URL.canParse(lease.signedUrl))
        return;
    const providerId = new URL(lease.signedUrl).searchParams.get('agent_id');
    if (!(0, web_session_js_1.isElevenLabsWebSignedConnectionUrl)(lease.signedUrl, providerId))
        ctx.addIssue({ code: 'custom', path: ['signedUrl'], message: 'Expected the canonical ElevenLabs signed connection format' }); // guard:browser-url
});
function projectElevenLabsWebBrowserSession(evidence) {
    const browser = exports.ElevenLabsWebBrowserRequestSchema.safeParse(evidence.browserRequest);
    const request = web_session_js_1.ElevenLabsWebSessionRequestSchema.safeParse(evidence.internalRequest);
    const result = web_session_js_1.ElevenLabsWebSessionResultSchema.safeParse(evidence.internalResult);
    if (!browser.success || !request.success || !result.success)
        return null; // guard:projection-parse
    if (browser.data.requestId !== request.data.requestId || browser.data.linkId !== request.data.linkId)
        return null; // guard:projection-request
    if (!(0, web_session_js_1.isElevenLabsWebSessionCurrent)(request.data, result.data, evidence.snapshot, evidence.viewer, evidence.configuredOrigin, evidence.now))
        return null; // guard:projection-session
    const authorityRequest = { requestId: request.data.requestId, scope: request.data.scope, linkId: request.data.linkId, phase: 'after' };
    if (!(0, web_context_js_1.isElevenLabsWebAuthorityUsable)(authorityRequest, evidence.authorityResponse, evidence.viewer, evidence.configuredOrigin, evidence.authorityVersion, evidence.agentIdentity, evidence.now))
        return null; // guard:projection-authority
    return exports.ElevenLabsWebBrowserSessionSchema.parse({ ok: true, requestId: result.data.requestId, linkId: result.data.link.linkId,
        issuedAt: result.data.issuedAt, expiresAt: result.data.expiresAt, signedUrl: result.data.signedUrl }); // guard:projection-fields
}
//# sourceMappingURL=web-browser.js.map