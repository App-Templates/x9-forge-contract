import { z } from 'zod';
import { CapabilityOutputSchema, CAPABILITY_OUTPUT_CONTENT_MAX_BYTES } from "../../presentation.js";
import { CoachProgramIdSchema } from "../index.js";
import { CoachStrategyRefSchema } from "../program-version.js";
import { CoachOperationalCommandMetadataSchema, result, DecisionCodes, sameValue } from "./common.js";
/** Structural preflight before recursive canonical JSON parsing and serialization. */
function boundedObject(raw) {
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw))
        return false;
    const pending = [{ value: raw, depth: 0 }], seen = new WeakSet();
    let bytes = 0;
    while (pending.length) {
        const { value, depth } = pending.pop();
        if (depth > 8)
            return false;
        if (value === null || typeof value === 'boolean')
            continue;
        if (typeof value === 'number') {
            if (!Number.isFinite(value))
                return false;
            continue;
        }
        if (typeof value === 'string') {
            bytes += new TextEncoder().encode(value).byteLength;
            if (bytes > CAPABILITY_OUTPUT_CONTENT_MAX_BYTES)
                return false;
            continue;
        }
        if (typeof value !== 'object' || seen.has(value))
            return false;
        seen.add(value);
        const array = Array.isArray(value), prototype = Object.getPrototypeOf(value);
        if ((!array && prototype !== Object.prototype && prototype !== null) || (array && value.length > 500))
            return false;
        const descriptors = Object.getOwnPropertyDescriptors(value);
        const keys = Reflect.ownKeys(value).filter(key => !(array && key === 'length'));
        if (!array && keys.length > 128)
            return false;
        for (const key of keys) {
            if (typeof key !== 'string' || ['__proto__', 'constructor', 'prototype'].includes(key))
                return false;
            const descriptor = descriptors[key];
            if (!('value' in descriptor) || !descriptor.enumerable)
                return false;
            bytes += new TextEncoder().encode(key).byteLength;
            if (bytes > CAPABILITY_OUTPUT_CONTENT_MAX_BYTES)
                return false;
            pending.push({ value: descriptor.value, depth: depth + 1 });
        }
        if (array && keys.length !== value.length)
            return false;
    }
    return true;
}
const Payload = z.preprocess((raw, ctx) => {
    if (!boundedObject(raw)) {
        ctx.addIssue({ code: 'custom', message: 'Bounded plain JSON object required' });
        return z.NEVER;
    }
    return raw;
}, CapabilityOutputSchema.shape.content);
export const CoachProgramInputEnvelopeSchema = z.object({ kind: CoachProgramIdSchema, payload: Payload }).strict();
export const CoachProgramProjectionSchema = z.object({ strategy: CoachStrategyRefSchema, value: Payload }).strict();
export const CoachConversationInputRequestSchema = CoachOperationalCommandMetadataSchema.extend({ input: CoachProgramInputEnvelopeSchema }).strict();
export const CoachConversationResultSchema = z.object({ ...result, draft: CoachProgramProjectionSchema.nullable(), decisionCodes: DecisionCodes }).strict()
    .refine(x => x.draft === null || sameValue(x.draft.strategy, x.opening.program.strategy), 'Draft uses original pinned strategy');
//# sourceMappingURL=conversation.js.map