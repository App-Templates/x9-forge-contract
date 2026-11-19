"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCIAL_JOB_LIMITS = exports.SOCIAL_TRACK_EXECUTOR = exports.SOCIAL_JOB_TOOL = void 0;
exports.socialGenericJobFor = socialGenericJobFor;
const generic_job_js_1 = require("../dev/generic-job.cjs");
const job_io_js_1 = require("./job-io.cjs");
const queue_js_1 = require("./queue.cjs");
const routes_js_1 = require("./routes.cjs");
exports.SOCIAL_JOB_TOOL = {
    collect: 'ig_collect',
    transcribe: 'mlx_whisper',
    filter: 'claude_p',
    verify: 'claude_p',
    group: 'claude_p',
};
exports.SOCIAL_TRACK_EXECUTOR = {
    mac: 'laptop',
    server: 'server',
};
exports.SOCIAL_JOB_LIMITS = {
    collect: { maxDurationSeconds: 900, maxAttempts: 3 },
    transcribe: { maxDurationSeconds: 900, maxAttempts: 3 },
    filter: { maxDurationSeconds: 300, maxAttempts: 3 },
    verify: { maxDurationSeconds: 900, maxAttempts: 2 },
    group: { maxDurationSeconds: 600, maxAttempts: 2 },
};
/** Bind executor policy and identity to the queue job, then check the consumer round trip. */
function socialGenericJobFor(queueJob, input, { configVersion, createdAt }) {
    const queued = queue_js_1.SocialJobSchema.safeParse(queueJob);
    if (!queued.success)
        return { ok: false, error: 'invalid_job' };
    const parsedInput = job_io_js_1.SocialJobInputSchema.safeParse(input);
    if (!parsedInput.success)
        return { ok: false, error: 'invalid_input' };
    const { identity, jobId, kind, track } = queued.data;
    let job;
    try {
        job = generic_job_js_1.DevGenericJobSchema.parse({
            version: 1,
            scope: identity,
            jobId,
            capability: 'social-listening',
            kind,
            tool: exports.SOCIAL_JOB_TOOL[kind],
            executor: exports.SOCIAL_TRACK_EXECUTOR[track],
            limits: exports.SOCIAL_JOB_LIMITS[kind],
            input: parsedInput.data,
            configVersion,
            createdAt,
        });
    }
    catch {
        return { ok: false, error: 'invalid_job' };
    }
    const decoded = (0, routes_js_1.readSocialGenericJob)(job, queued.data);
    if (!decoded.ok) {
        if (decoded.error === 'not_social_job' || decoded.error === 'foreign_scope') {
            return { ok: false, error: 'invalid_job' };
        }
        return { ok: false, error: decoded.error };
    }
    return { ok: true, job };
}
//# sourceMappingURL=generic-job-map.js.map