import { z } from 'zod';
import { type CapabilityPersonScope } from "../capability-call-context.cjs";
export declare const RefId: z.ZodString;
export declare const Text128: z.ZodString;
export declare const Instant: z.ZodISODateTime;
export declare const Seconds: z.ZodNumber;
export declare const SessionId: z.ZodString;
export declare const DecisionCodes: z.ZodArray<z.ZodString>;
export declare function agentScope(scope: CapabilityPersonScope): {
    agentId: string;
    ownerId: string;
    tenantId: string;
};
/** Semantic equality for already parsed contract values; object key order is irrelevant. */
export declare function sameValue(a: unknown, b: unknown): boolean;
//# sourceMappingURL=shared.d.ts.map