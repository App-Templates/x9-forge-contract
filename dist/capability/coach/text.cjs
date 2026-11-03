"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Text128 = void 0;
const zod_1 = require("zod");
exports.Text128 = zod_1.z.string().trim().min(1).max(128);
//# sourceMappingURL=text.js.map