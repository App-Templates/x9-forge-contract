"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sameValue = exports.DecisionCodes = exports.result = exports.CoachOperationalCommandMetadataSchema = exports.RevisionNumber = void 0;
exports.forOpening = forOpening;
const zod_1 = require("zod");
const execution_js_1 = require("../execution.cjs");
const shared_js_1 = require("../shared.cjs");
Object.defineProperty(exports, "DecisionCodes", { enumerable: true, get: function () { return shared_js_1.DecisionCodes; } });
Object.defineProperty(exports, "sameValue", { enumerable: true, get: function () { return shared_js_1.sameValue; } });
const capability_call_context_js_1 = require("../../capability-call-context.cjs");
exports.RevisionNumber = zod_1.z.number().int().nonnegative();
exports.CoachOperationalCommandMetadataSchema = zod_1.z.object({
    requestId: shared_js_1.RefId, opening: execution_js_1.CoachSessionOpeningRefSchema, expectedRevision: exports.RevisionNumber,
}).strict();
exports.result = { ok: zod_1.z.literal(true), requestId: shared_js_1.RefId, replayed: zod_1.z.boolean(), opening: execution_js_1.CoachSessionOpeningRefSchema, revision: exports.RevisionNumber };
function forOpening(record, opening) {
    return (0, capability_call_context_js_1.sameCapabilityScope)(record.scope, opening.scope) && record.sessionId === opening.sessionId && record.openingId === opening.openingId;
}
//# sourceMappingURL=common.js.map