"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MandateRequirementSchema = void 0;
const session_acceptance_js_1 = require("../capability/dev/session-acceptance.cjs");
// Keep the session grammar and its checks: mandate origin already excludes session/executor attestors.
// Export only through the existing organization/* subpath to avoid a plan/mandate barrel cycle.
exports.MandateRequirementSchema = session_acceptance_js_1.DevSessionCriterionSchema.refine((criterion) => criterion.origin === 'mandato', { message: 'Mandate requirements must originate from the mandate', path: ['origin'] });
//# sourceMappingURL=mandate-requirement.js.map