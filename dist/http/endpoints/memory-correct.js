import { MemoryCorrectiveActionRequestSchema, MemoryCorrectiveActionResponseSchema, } from "../../memory/corrective-action.js";
import { MEMORY_CORRECT_PATH, MEMORY_CORRECT_METHOD } from "../../memory/paths.js";
export const memoryCorrectContract = {
    method: MEMORY_CORRECT_METHOD,
    path: MEMORY_CORRECT_PATH,
    authType: 'secret',
    bodySchema: MemoryCorrectiveActionRequestSchema,
    responseSchema: MemoryCorrectiveActionResponseSchema,
};
//# sourceMappingURL=memory-correct.js.map