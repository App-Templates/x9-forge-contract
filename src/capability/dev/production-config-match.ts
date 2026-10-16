import { DevAgentConfigStateSchema } from './config-state.js';
import { DevProductionRoleModelsSchema } from '../../http/endpoints/development-session-models.js';
import { DevProductionJobSchema } from './production-job.js';

const ROLES = DevProductionRoleModelsSchema.keyof().options;

/**
 * Pure compatibility check for S3's final configuration reread. Only an explicit
 * applied state qualifies; ready/pending do not attest an applied configuration.
 * This proves neither installation, consent, online presence nor an A11 signature/nonce.
 * The service must separately check the APPLIED capability manifest/context, a fresh
 * trusted lease and the execution permit before effects.
 */
export function isDevProductionJobForConfig(rawJob: unknown, rawConfigState: unknown): boolean {
  const parsedJob = DevProductionJobSchema.safeParse(rawJob);
  const parsedConfig = DevAgentConfigStateSchema.safeParse(rawConfigState);
  if (!parsedJob.success || !parsedConfig.success) return false;
  const job = parsedJob.data;
  const { config, state } = parsedConfig.data;
  if (!config.enabled) return false;
  if (!config.production) return false;
  if (state.status !== 'applied') return false;
  if (state.appliedConfigVersion !== config.configVersion) return false;
  if (config.configVersion !== job.configVersion) return false;
  if (config.keyVersion !== job.keyVersion) return false;
  if (job.scope.tenantId !== config.tenantId) return false;
  if (job.scope.ownerId !== config.ownerId) return false;
  if (job.scope.agentId !== config.agentId) return false;
  if (!config.production.allowedProjectIds.includes(job.projectId)) return false;
  const session = config.production.session;
  if (session.sessionId !== job.session.sessionId) return false;
  if (session.target.kind !== job.session.target.kind) return false;
  if (session.target.kind === 'local' && job.session.target.kind === 'local'
    && session.target.deviceId !== job.session.target.deviceId) return false;
  if (session.target.kind === 'cloud' && job.session.target.kind === 'cloud'
    && session.target.connectionRef !== job.session.target.connectionRef) return false;
  if (session.engines.length !== job.session.engines.length
    || !session.engines.every(engine => job.session.engines.includes(engine))) return false;
  // Role models: both absent keeps the historical match; otherwise every role must be identical.
  const jobRoles = job.roleModels;
  const configRoles = config.production.roleModels;
  if (jobRoles === undefined && configRoles !== undefined) return false;
  if (jobRoles !== undefined && configRoles === undefined) return false;
  if (jobRoles === undefined || configRoles === undefined) return true;
  for (const role of ROLES) {
    const requested = jobRoles[role];
    const applied = configRoles[role];
    if (requested.engine !== applied.engine) return false;
    if (requested.modelId !== applied.modelId) return false;
    if (requested.reasoningEffort !== applied.reasoningEffort) return false;
  }
  return true;
}
