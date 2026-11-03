"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialKeySchema = void 0;
const zod_1 = require("zod");
const platform_internal_credentials_js_1 = require("./platform-internal-credentials.cjs");
/** Vault key name; platform-internal keys are never listed or acted upon for an agent. */
exports.CredentialKeySchema = zod_1.z.string().max(128).regex(/^[A-Za-z_][A-Za-z0-9_.-]*$/)
    .refine((key) => !(0, platform_internal_credentials_js_1.isPlatformInternalCredentialKey)(key), { message: 'Platform-internal credential keys are never exposed per agent' });
//# sourceMappingURL=credential-key.js.map