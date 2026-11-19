import { type DevGenericExecutor, type DevGenericJob, type DevGenericTool } from "../dev/generic-job.js";
import { type SocialJob, type SocialJobKind } from "./queue.js";
import type { SocialTrack } from "./topic.js";
export declare const SOCIAL_JOB_TOOL: Record<SocialJobKind, DevGenericTool>;
export declare const SOCIAL_TRACK_EXECUTOR: Record<SocialTrack, DevGenericExecutor>;
export declare const SOCIAL_JOB_LIMITS: Record<SocialJobKind, DevGenericJob['limits']>;
/** Bind executor policy and identity to the queue job, then check the consumer round trip. */
export declare function socialGenericJobFor(queueJob: SocialJob, input: unknown, { configVersion, createdAt }: {
    configVersion: number;
    createdAt: string;
}): {
    ok: true;
    job: DevGenericJob;
} | {
    ok: false;
    error: 'invalid_job' | 'kind_mismatch' | 'input_mismatch' | 'invalid_input';
};
//# sourceMappingURL=generic-job-map.d.ts.map