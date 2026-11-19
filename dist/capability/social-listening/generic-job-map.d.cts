import { type DevGenericExecutor, type DevGenericJob, type DevGenericTool } from "../dev/generic-job.cjs";
import { RICERCA_TOOLS } from "../ricerca/tools.cjs";
import { type SocialJob, type SocialJobKind } from "./queue.cjs";
import type { SocialTrack } from "./topic.cjs";
export declare const SOCIAL_JOB_TOOL: Record<SocialJobKind, DevGenericTool>;
export declare const SOCIAL_TRACK_EXECUTOR: Record<SocialTrack, DevGenericExecutor>;
export type SocialJobRoute = {
    runner: 'executor';
    executor: DevGenericExecutor;
    tool: DevGenericTool;
} | {
    runner: 'capability';
    capability: 'stt';
    tool: 'transcribe';
} | {
    runner: 'capability';
    capability: 'ricerca';
    tool: typeof RICERCA_TOOLS.start;
} | {
    runner: 'service';
    source: 'meta_graph';
};
/** Route new jobs by track; server collection never uses Instagram cookies. */
export declare function socialJobRoute(kind: SocialJobKind, track: SocialTrack): SocialJobRoute;
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