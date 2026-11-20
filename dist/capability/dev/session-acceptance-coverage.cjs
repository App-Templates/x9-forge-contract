"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevSessionCoverageImageSchema = exports.DEV_SESSION_COVERAGE_IDENTITY = void 0;
exports.devSessionCoverageSlots = devSessionCoverageSlots;
exports.devSessionCoverageMissing = devSessionCoverageMissing;
const zod_1 = require("zod");
const session_assignment_js_1 = require("./session-assignment.cjs");
exports.DEV_SESSION_COVERAGE_IDENTITY = ['ingresso', 'navigazione', 'risultato'];
/** Coverage follows requested inputs, not the email's preview quota. */
function devSessionCoverageSlots(input) {
    return [
        ...(input.screens ?? []).map(({ name }) => `screen:${name}`),
        ...(input.behaviors ?? []).map((name) => `behavior:${name}`),
        ...(input.states ?? []).map((state) => `state:${state}`),
        ...(input.formats ?? []).map((format) => `format:${format}`),
        ...((input.screens?.length ?? 0) > 0 ? exports.DEV_SESSION_COVERAGE_IDENTITY.map((name) => `identity:${name}`) : []),
    ];
}
exports.DevSessionCoverageImageSchema = zod_1.z.strictObject({
    path: session_assignment_js_1.DevSessionDeliveredFileSchema.shape.path,
    sha256: session_assignment_js_1.DevSessionDeliveredFileSchema.shape.sha256,
    // Require the absolute end of the key, including when it ends in a newline.
    covers: zod_1.z.array(zod_1.z.string().regex(/^(screen|behavior|state|format|identity):[a-z0-9][a-z0-9_-]{0,39}$(?![\s\S])/)).min(1).max(10),
}).superRefine((image, ctx) => {
    const seen = new Set();
    image.covers.forEach((key, index) => {
        const kind = key.split(':')[0];
        if (kind === 'identity')
            return;
        if (seen.has(kind))
            ctx.addIssue({ code: 'custom', path: ['covers', index], message: 'cover_kind_repeated' });
        seen.add(kind);
    });
});
/** Extra declarations cannot satisfy a different requested slot. */
function devSessionCoverageMissing(slots, images) {
    const covered = new Set(images.flatMap(({ covers }) => covers));
    return slots.filter((slot) => !covered.has(slot));
}
//# sourceMappingURL=session-acceptance-coverage.js.map