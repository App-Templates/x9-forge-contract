"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoFootageChoiceSchema = exports.VideoFootageIdSchema = void 0;
const zod_1 = require("zod");
/** Id of one shot of the footage archive on the engine (e.g. `piante-02`). Never a path. */
exports.VideoFootageIdSchema = zod_1.z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/);
/** One or two shots of the same place (a single shot, or the wide/narrow pair of `ibrido-alternato`). */
exports.VideoFootageChoiceSchema = zod_1.z.array(exports.VideoFootageIdSchema).min(1).max(2);
//# sourceMappingURL=footage.js.map