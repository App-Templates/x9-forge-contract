import { z } from 'zod';
export const EmailMessageCodeSchema = z.string().max(998).regex(/^<[^\s<>@]+@[^\s<>@]+>$/);
/** Normalize bare message IDs without rewriting other reference formats. */
export function emailMessageCode(id) {
    const value = id.trim();
    return /^[^\s<>@]+@[^\s<>@]+$/.test(value) ? `<${value}>` : value;
}
export function sameEmailMessage(a, b) {
    return emailMessageCode(a) === emailMessageCode(b);
}
//# sourceMappingURL=message-code.js.map