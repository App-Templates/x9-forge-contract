import { z } from 'zod';
export declare const EmailMessageCodeSchema: z.ZodString;
/** Normalize bare message IDs without rewriting other reference formats. */
export declare function emailMessageCode(id: string): string;
export declare function sameEmailMessage(a: string, b: string): boolean;
//# sourceMappingURL=message-code.d.ts.map