"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectSpendDaySchema = exports.ProjectDaySchema = void 0;
const zod_1 = require("zod");
const project_js_1 = require("./project.cjs");
/**
 * One project day of spend, as cap-ricerca counts it (v1.28.0, Phase 54). Read by the control panel (Forge).
 * `day` is the date in the project's time zone; `reservedUsd` is what running researches have reserved and not yet
 * settled (an unknown cost is never free: it stays reserved).
 */
exports.ProjectDaySchema = zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
exports.ProjectSpendDaySchema = zod_1.z.object({
    projectId: project_js_1.ProjectIdSchema,
    day: exports.ProjectDaySchema,
    spentUsd: zod_1.z.number().nonnegative().finite(),
    reservedUsd: zod_1.z.number().nonnegative().finite(),
    capUsd: zod_1.z.number().positive().finite(),
    calls: zod_1.z.number().int().nonnegative(),
    webCalls: zod_1.z.number().int().nonnegative(),
}).strict();
//# sourceMappingURL=spend.js.map