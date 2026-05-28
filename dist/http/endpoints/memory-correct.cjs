"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryCorrectContract = void 0;
const corrective_action_js_1 = require("../../memory/corrective-action.cjs");
const paths_js_1 = require("../../memory/paths.cjs");
exports.memoryCorrectContract = {
    method: paths_js_1.MEMORY_CORRECT_METHOD,
    path: paths_js_1.MEMORY_CORRECT_PATH,
    authType: 'secret',
    bodySchema: corrective_action_js_1.MemoryCorrectiveActionRequestSchema,
    responseSchema: corrective_action_js_1.MemoryCorrectiveActionResponseSchema,
};
//# sourceMappingURL=memory-correct.js.map