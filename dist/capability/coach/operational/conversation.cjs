"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachConversationResultSchema = exports.CoachConversationInputRequestSchema = exports.CoachProgramProjectionSchema = exports.CoachProgramInputEnvelopeSchema = void 0;
const zod_1 = require("zod");
const presentation_js_1 = require("../../presentation.cjs");
const index_js_1 = require("../index.cjs");
const program_version_js_1 = require("../program-version.cjs");
const common_js_1 = require("./common.cjs");
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
            if (bytes > presentation_js_1.CAPABILITY_OUTPUT_CONTENT_MAX_BYTES)
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
            if (bytes > presentation_js_1.CAPABILITY_OUTPUT_CONTENT_MAX_BYTES)
                return false;
            pending.push({ value: descriptor.value, depth: depth + 1 });
        }
        if (array && keys.length !== value.length)
            return false;
    }
    return true;
}
const Payload = zod_1.z.preprocess((raw, ctx) => {
    if (!boundedObject(raw)) {
        ctx.addIssue({ code: 'custom', message: 'Bounded plain JSON object required' });
        return zod_1.z.NEVER;
    }
    return raw;
}, presentation_js_1.CapabilityOutputSchema.shape.content);
exports.CoachProgramInputEnvelopeSchema = zod_1.z.object({ kind: index_js_1.CoachProgramIdSchema, payload: Payload }).strict();
exports.CoachProgramProjectionSchema = zod_1.z.object({ strategy: program_version_js_1.CoachStrategyRefSchema, value: Payload }).strict();
exports.CoachConversationInputRequestSchema = common_js_1.CoachOperationalCommandMetadataSchema.extend({ input: exports.CoachProgramInputEnvelopeSchema }).strict();
exports.CoachConversationResultSchema = zod_1.z.object({ ...common_js_1.result, draft: exports.CoachProgramProjectionSchema.nullable(), decisionCodes: common_js_1.DecisionCodes }).strict()
    .refine(x => x.draft === null || (0, common_js_1.sameValue)(x.draft.strategy, x.opening.program.strategy), 'Draft uses original pinned strategy');
//# sourceMappingURL=conversation.js.map