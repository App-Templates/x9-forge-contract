"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentManagementRequestIdSchema = void 0;
const zod_1 = require("zod");
/** Caller-chosen idempotency key, unique per intended command (e.g. a UUID). */
exports.AgentManagementRequestIdSchema = zod_1.z.string().min(8).max(128).regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/);
//# sourceMappingURL=agent-management-request-id.js.map