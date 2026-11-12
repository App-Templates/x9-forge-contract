"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailMessageCodeSchema = void 0;
exports.emailMessageCode = emailMessageCode;
exports.sameEmailMessage = sameEmailMessage;
const zod_1 = require("zod");
exports.EmailMessageCodeSchema = zod_1.z.string().max(998).regex(/^<[^\s<>@]+@[^\s<>@]+>$/);
/** Normalize bare message IDs without rewriting other reference formats. */
function emailMessageCode(id) {
    const value = id.trim();
    return /^[^\s<>@]+@[^\s<>@]+$/.test(value) ? `<${value}>` : value;
}
function sameEmailMessage(a, b) {
    return emailMessageCode(a) === emailMessageCode(b);
}
//# sourceMappingURL=message-code.js.map