"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevenLabsNativeCommandReceiptSchema = exports.ElevenLabsNativeDesiredConfigSchema = exports.ElevenLabsNativeConfigSchema = void 0;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const agent_config_js_1 = require("../ricerca/agent-config.cjs");
const shared_js_1 = require("../coach/shared.cjs");
const native_config_values_js_1 = require("./native-config-values.cjs");
const native_session_js_1 = require("./native-session.cjs");
var native_config_values_js_2 = require("./native-config-values.cjs");
Object.defineProperty(exports, "ElevenLabsNativeConfigSchema", { enumerable: true, get: function () { return native_config_values_js_2.ElevenLabsNativeConfigSchema; } });
exports.ElevenLabsNativeDesiredConfigSchema = zod_1.z.object({ scope: capability_call_context_js_1.CapabilityAgentScopeSchema, configVersion: agent_config_js_1.AgentConfigVersionSchema,
    promptBundleHash: native_session_js_1.ElevenLabsPromptBundleHashSchema, fingerprint: native_session_js_1.ElevenLabsPromptBundleHashSchema, config: native_config_values_js_1.ElevenLabsNativeConfigSchema,
}).strict();
/** An acknowledged command is not provider readback and never marks configuration applied. */
exports.ElevenLabsNativeCommandReceiptSchema = zod_1.z.object({ requestId: shared_js_1.RefId, desired: exports.ElevenLabsNativeDesiredConfigSchema,
    acceptedAt: shared_js_1.Instant, status: zod_1.z.enum(['accepted', 'reconcile_pending', 'rejected']) }).strict();
//# sourceMappingURL=native-config.js.map