import {
  DevGenericJobSchema,
  type DevGenericExecutor,
  type DevGenericJob,
  type DevGenericTool,
} from '../dev/generic-job.js';
import { SocialJobInputSchema } from './job-io.js';
import { SocialJobSchema, type SocialJob, type SocialJobKind } from './queue.js';
import { readSocialGenericJob } from './routes.js';
import type { SocialTrack } from './topic.js';

export const SOCIAL_JOB_TOOL: Record<SocialJobKind, DevGenericTool> = {
  collect: 'ig_collect',
  transcribe: 'mlx_whisper',
  filter: 'claude_p',
  verify: 'claude_p',
  group: 'claude_p',
};

export const SOCIAL_TRACK_EXECUTOR: Record<SocialTrack, DevGenericExecutor> = {
  mac: 'laptop',
  server: 'server',
};

export const SOCIAL_JOB_LIMITS: Record<SocialJobKind, DevGenericJob['limits']> = {
  collect: { maxDurationSeconds: 900, maxAttempts: 3 },
  transcribe: { maxDurationSeconds: 900, maxAttempts: 3 },
  filter: { maxDurationSeconds: 300, maxAttempts: 3 },
  verify: { maxDurationSeconds: 900, maxAttempts: 2 },
  group: { maxDurationSeconds: 600, maxAttempts: 2 },
};

/** Bind executor policy and identity to the queue job, then check the consumer round trip. */
export function socialGenericJobFor(
  queueJob: SocialJob,
  input: unknown,
  { configVersion, createdAt }: { configVersion: number; createdAt: string },
): { ok: true; job: DevGenericJob } | {
  ok: false;
  error: 'invalid_job' | 'kind_mismatch' | 'input_mismatch' | 'invalid_input';
} {
  const queued = SocialJobSchema.safeParse(queueJob);
  if (!queued.success) return { ok: false, error: 'invalid_job' };
  const parsedInput = SocialJobInputSchema.safeParse(input);
  if (!parsedInput.success) return { ok: false, error: 'invalid_input' };

  const { identity, jobId, kind, track } = queued.data;
  let job: DevGenericJob;
  try {
    job = DevGenericJobSchema.parse({
      version: 1,
      scope: identity,
      jobId,
      capability: 'social-listening',
      kind,
      tool: SOCIAL_JOB_TOOL[kind],
      executor: SOCIAL_TRACK_EXECUTOR[track],
      limits: SOCIAL_JOB_LIMITS[kind],
      input: parsedInput.data,
      configVersion,
      createdAt,
    });
  } catch {
    return { ok: false, error: 'invalid_job' };
  }

  const decoded = readSocialGenericJob(job, queued.data);
  if (!decoded.ok) {
    if (decoded.error === 'not_social_job' || decoded.error === 'foreign_scope') {
      return { ok: false, error: 'invalid_job' };
    }
    return { ok: false, error: decoded.error };
  }
  return { ok: true, job };
}
