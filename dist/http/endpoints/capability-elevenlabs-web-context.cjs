"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elevenLabsWebAuthorityContract = exports.ELEVENLABS_WEB_AUTHORITY_PATH = void 0;
const auth_headers_js_1 = require("../../auth/auth-headers.cjs");
const web_context_js_1 = require("../../capability/agent-elevenlabs/web-context.cjs");
/** X9 -> Forge. Authenticate the service, then load the server-owned admission attempt; never trust body authority. */
exports.ELEVENLABS_WEB_AUTHORITY_PATH = '/resolve/elevenlabs-web-admission';
exports.elevenLabsWebAuthorityContract = {
    method: 'POST',
    path: exports.ELEVENLABS_WEB_AUTHORITY_PATH,
    authType: 'token',
    authHeader: auth_headers_js_1.INTERNAL_TOKEN_HEADER,
    authSchema: auth_headers_js_1.AuthInternalTokenSchema,
    bodySchema: web_context_js_1.ElevenLabsWebAuthorityRequestSchema,
    responseSchema: web_context_js_1.ElevenLabsWebAuthorityResponseSchema,
};
//# sourceMappingURL=capability-elevenlabs-web-context.js.map