"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentModelBootstrapPreconditionSchema = exports.AgentModelBootstrapSourceVersionSchema = exports.ModelSlotIdSchema = exports.AGENT_CHAT_MODEL_SLOT_ID = void 0;
const zod_1 = require("zod");
/** Stable conversation slot; syntax remains open for legacy custom slots. */
exports.AGENT_CHAT_MODEL_SLOT_ID = 'agent_chat';
exports.ModelSlotIdSchema = zod_1.z.string().regex(/^[a-z][a-z0-9._-]{0,63}$/);
/** Runtime generation is independent of Forge's numeric configuration version. */
exports.AgentModelBootstrapSourceVersionSchema = zod_1.z.string().trim().min(1).max(128);
exports.AgentModelBootstrapPreconditionSchema = zod_1.z.object({
    expectedSourceVersion: exports.AgentModelBootstrapSourceVersionSchema, expectedAbsent: zod_1.z.literal(true),
}).strict();
//# sourceMappingURL=model-slot.js.map