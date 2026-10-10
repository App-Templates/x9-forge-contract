import { z } from 'zod';
import { CapabilityAgentScopeSchema, sameCapabilityScope, type CapabilityAgentScope } from './capability-call-context.js';
import { CapabilityAgentParameterSchema, CapabilityAgentParametersSchema, CapabilityParameterSchema, CapabilityParameterKeySchema, CapabilityParameterValueSchema, CapabilityParameterApplicationSchema, type CapabilityParameter } from './parameters.js';
import { AgentConfigVersionSchema } from './ricerca/agent-config.js';
import { AgentManagementRequestIdSchema, AgentConfigVersionStateSchema } from '../agent/agent-model-management-values.js';

import { BriefingFeedsSchema, NewsFeedsSchema } from './configuration/feeds.js';
import { BriefingCategoryWeightsSchema } from './configuration/briefing.js';
import { BriefingRulesSchema, NewsRulesSchema, NetatmoRulesSchema, SecurityRulesSchema, parseCapabilityRulesWrite, type CapabilityRulesWriteAuthority } from './configuration/rules.js';
import { CameraPoliciesSchema, parseCameraPoliciesWrite, type CameraPoliciesWriteAuthority } from './configuration/camera-policy.js';

export const CapabilityOrdinaryStructuredCodecs = { 'briefing.feeds': BriefingFeedsSchema, 'briefing.categoryWeights': BriefingCategoryWeightsSchema, 'news.feeds': NewsFeedsSchema, 'rules.briefing': BriefingRulesSchema, 'rules.news': NewsRulesSchema, 'rules.netatmo': NetatmoRulesSchema, 'rules.security': SecurityRulesSchema, 'security.cameraPolicies': CameraPoliciesSchema } as const;
export const CapabilityOrdinaryStructuredSchemaKeySchema = z.enum(Object.keys(CapabilityOrdinaryStructuredCodecs) as [keyof typeof CapabilityOrdinaryStructuredCodecs, ...(keyof typeof CapabilityOrdinaryStructuredCodecs)[]]);
export const CapabilityOrdinaryValueSchema = z.union([CapabilityParameterValueSchema, NewsFeedsSchema, BriefingFeedsSchema, BriefingCategoryWeightsSchema, BriefingRulesSchema, NewsRulesSchema, NetatmoRulesSchema, SecurityRulesSchema, CameraPoliciesSchema]);
export const CapabilityOrdinaryStructuredParameterSchema = CapabilityParameterSchema.options[0].omit({ type: true, min: true, max: true, platformDefault: true }).extend({ type: z.literal('structured'), schemaKey: CapabilityOrdinaryStructuredSchemaKeySchema, schemaVersion: z.literal(1), platformDefault: CapabilityOrdinaryValueSchema.optional() }).strict().superRefine((definition, ctx) => {
  if (definition.platformDefault !== undefined && !CapabilityOrdinaryStructuredCodecs[definition.schemaKey].safeParse(definition.platformDefault).success) ctx.addIssue({ code: 'custom', path: ['platformDefault'], message: 'Structured default violates codec' });
});
export const CapabilityOrdinaryDefinitionSchema = z.union([CapabilityParameterSchema, CapabilityOrdinaryStructuredParameterSchema]);
export type CapabilityOrdinaryDefinition = z.infer<typeof CapabilityOrdinaryDefinitionSchema>;

const NameSchema = CapabilityAgentParametersSchema.shape.capability;
const DateSchema = z.iso.datetime({ offset: true });
const MasterReferenceSchema = CapabilityAgentScopeSchema.omit({ agentId: true }).extend({ masterId: CapabilityAgentScopeSchema.shape.agentId, version: AgentConfigVersionSchema }).strict();
export const CapabilityOrdinaryOriginSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('platform_default') }).strict(),
  z.object({ kind: z.literal('agent_override') }).strict(),
  z.object({ kind: z.literal('needs_choice') }).strict(),
  z.object({ kind: z.literal('master'), source: MasterReferenceSchema }).strict(),
]);
export const CapabilityOrdinaryParameterSchema = z.object({
  parameter: CapabilityOrdinaryDefinitionSchema,
  origin: CapabilityOrdinaryOriginSchema,
  value: CapabilityOrdinaryValueSchema.optional(),
}).strict().superRefine((entry, ctx) => {
  if (entry.parameter.type === 'structured') {
    const definition = entry.parameter;
    if (entry.origin.kind === 'needs_choice') {
      if (entry.value !== undefined || definition.platformDefault !== undefined) ctx.addIssue({ code: 'custom', message: 'needs_choice has no value or default' });
    } else if (!(definition.optional && entry.value === undefined && entry.origin.kind !== 'platform_default') && !CapabilityOrdinaryStructuredCodecs[definition.schemaKey].safeParse(entry.value).success) ctx.addIssue({ code: 'custom', path: ['value'], message: 'Structured value violates codec' });
    if (entry.origin.kind === 'platform_default' && (definition.platformDefault === undefined || !sameOrdinaryData(entry.value, definition.platformDefault))) ctx.addIssue({ code: 'custom', path: ['value'], message: 'Structured platform default mismatch' });
    return;
  }
  const checked = CapabilityAgentParameterSchema.safeParse({ ...entry, origin: entry.origin.kind === 'master' ? 'agent_override' : entry.origin.kind });
  if (!checked.success) for (const issue of checked.error.issues) ctx.addIssue({ code: 'custom', path: [...issue.path], message: issue.message });
});
export const CapabilityOrdinaryConfigurationSchema = z.object({
  format: z.literal('ordinary-v2'),
  scope: CapabilityAgentScopeSchema,
  capability: NameSchema,
  version: AgentConfigVersionSchema,
  parameters: z.array(CapabilityOrdinaryParameterSchema).max(100),
}).strict().superRefine((config, ctx) => {
  if (new Set(config.parameters.map(entry => entry.parameter.key)).size !== config.parameters.length) ctx.addIssue({ code: 'custom', path: ['parameters'], message: 'Parameter keys must be unique' });
  for (const [index, entry] of config.parameters.entries()) if (entry.origin.kind === 'master' && (entry.origin.source.tenantId !== config.scope.tenantId || entry.origin.source.ownerId !== config.scope.ownerId)) ctx.addIssue({ code: 'custom', path: ['parameters', index, 'origin'], message: 'Master cannot cross tenant or owner' });
});
export type CapabilityOrdinaryConfiguration = z.infer<typeof CapabilityOrdinaryConfigurationSchema>;
export type CapabilityOrdinaryParameter = z.infer<typeof CapabilityOrdinaryParameterSchema>;
export type CapabilityOrdinaryOrigin = z.infer<typeof CapabilityOrdinaryOriginSchema>;

/** Structural comparison ignores object insertion order, preserving exact arrays and primitive values. */
export function sameOrdinaryData(left: unknown, right: unknown): boolean {
  if (left === right) return true;
  if (Array.isArray(left)) return Array.isArray(right) && left.length === right.length && left.every((item, index) => sameOrdinaryData(item, right[index]));
  if (left === null || right === null || typeof left !== 'object' || typeof right !== 'object' || Array.isArray(right)) return false;
  const a = Object.keys(left).sort(), b = Object.keys(right).sort();
  return a.length === b.length && a.every((key, index) => key === b[index] && sameOrdinaryData((left as Record<string, unknown>)[key], (right as Record<string, unknown>)[key]));
}
export const CapabilityOrdinaryConfigWriteSchema = z.object({
  requestId: AgentManagementRequestIdSchema,
  expectedVersion: AgentConfigVersionSchema.nullable(),
  configuration: CapabilityOrdinaryConfigurationSchema,
}).strict();
export type CapabilityOrdinaryConfigWrite = z.infer<typeof CapabilityOrdinaryConfigWriteSchema>;
export type CapabilityOrdinaryTarget = { scope: CapabilityAgentScope; capability: string; parameters: readonly (CapabilityParameter | CapabilityOrdinaryDefinition)[]; structuredAuthorities?: Readonly<Record<string, { rules?: CapabilityRulesWriteAuthority; cameras?: CameraPoliciesWriteAuthority }>> };

/** Authenticate and resolve declarations/Masters server-side; durable requestId replay precedes this CAS check. */
export function parseCapabilityOrdinaryWrite(request: unknown, authority: CapabilityOrdinaryTarget, currentVersion: number | null, masters: readonly CapabilityOrdinaryConfiguration[] = []): CapabilityOrdinaryConfigWrite {
  const parsed = CapabilityOrdinaryConfigWriteSchema.parse(request), config = parsed.configuration;
  CapabilityAgentScopeSchema.parse(authority.scope);
  if (!sameCapabilityScope(config.scope, authority.scope) || config.capability !== authority.capability) throw new Error('Ordinary target mismatch');
  if (currentVersion !== null) AgentConfigVersionSchema.parse(currentVersion);
  if (parsed.expectedVersion !== currentVersion || config.version !== (currentVersion ?? 0) + 1) throw new Error('Ordinary CAS conflict');
  if (new Set(authority.parameters.map(p => p.key)).size !== authority.parameters.length || config.parameters.length !== authority.parameters.length) throw new Error('Ordinary declarations mismatch');
  for (const entry of config.parameters) {
    const definition = authority.parameters.find(p => p.key === entry.parameter.key);
    if (!definition || !sameOrdinaryData(CapabilityOrdinaryDefinitionSchema.parse(definition), entry.parameter)) throw new Error('Ordinary declaration mismatch');
    if (entry.parameter.type === 'structured' && entry.value !== undefined) {
      const schemaKey = entry.parameter.schemaKey, permission = authority.structuredAuthorities?.[entry.parameter.key];
      if (schemaKey.startsWith('rules.')) {
        if (!permission?.rules) throw new Error('Structured rules authority required');
        parseCapabilityRulesWrite(schemaKey.slice(6) as 'briefing' | 'news' | 'netatmo' | 'security', entry.value, permission.rules);
      }
      if (schemaKey === 'security.cameraPolicies') {
        if (!permission?.cameras) throw new Error('Structured camera authority required');
        parseCameraPoliciesWrite(entry.value, permission.cameras);
      }
    }
    if (entry.origin.kind !== 'master') continue;
    const source = entry.origin.source;
    const candidates = masters.filter(master => master.scope.tenantId === source.tenantId && master.scope.ownerId === source.ownerId && master.scope.agentId === source.masterId && master.capability === config.capability);
    if (candidates.length !== 1) throw new Error('Master authority missing or ambiguous');
    const master = CapabilityOrdinaryConfigurationSchema.parse(candidates[0]);
    const inherited = master.parameters.find(p => p.parameter.key === entry.parameter.key);
    if (master.version !== source.version || !inherited || inherited.origin.kind === 'needs_choice' || !sameOrdinaryData(inherited.parameter, entry.parameter) || !sameOrdinaryData(inherited.value, entry.value)) throw new Error('Master revision or inherited value mismatch');
  }
  return parsed;
}

export const CapabilityOrdinaryAppliedSchema = z.object({ configuration: CapabilityOrdinaryConfigurationSchema, loadedAt: DateSchema }).strict();
export const CapabilityOrdinaryEffectiveParameterSchema = z.object({
  scope: CapabilityAgentScopeSchema,
  capability: NameSchema,
  key: CapabilityParameterKeySchema,
  value: CapabilityOrdinaryValueSchema.optional(),
  mode: CapabilityParameterApplicationSchema,
  sourceConfigVersion: AgentConfigVersionSchema,
  observedAt: DateSchema,
}).strict();
export const CapabilityOrdinaryConfigStateSchema = z.object({
  scope: CapabilityAgentScopeSchema,
  capability: NameSchema,
  desired: CapabilityOrdinaryConfigurationSchema.nullable(),
  runtimeState: z.enum(['loaded', 'unloaded', 'unknown']),
  applied: CapabilityOrdinaryAppliedSchema.nullable(),
  failed: AgentConfigVersionStateSchema.shape.failed,
  effectiveParameters: z.array(CapabilityOrdinaryEffectiveParameterSchema).max(100),
}).strict().superRefine((state, ctx) => {
  const issue = (message: string) => ctx.addIssue({ code: 'custom', message });
  if (state.runtimeState !== 'loaded' && (state.applied !== null || state.effectiveParameters.length > 0)) issue('Unloaded or unknown consumer cannot attest effective configuration');
  for (const config of [state.desired, state.applied?.configuration]) if (config && (!sameCapabilityScope(config.scope, state.scope) || config.capability !== state.capability)) issue('Configuration target mismatch');
  if (state.applied && (!state.desired || state.applied.configuration.version > state.desired.version)) issue('Applied cannot be ahead of desired');
  if (state.failed && (!state.desired || state.failed.version > state.desired.version || state.failed.version <= (state.applied?.configuration.version ?? 0))) issue('Failed version must be pending within desired history');
  if (new Set(state.effectiveParameters.map(entry => entry.key)).size !== state.effectiveParameters.length) issue('Effective keys must be unique');
  for (const entry of state.effectiveParameters) {
    if (!sameCapabilityScope(entry.scope, state.scope) || entry.capability !== state.capability) issue('Effective parameter target mismatch');
    if (!state.desired || entry.sourceConfigVersion > state.desired.version) issue('Effective version cannot be ahead of desired');
    const desiredEntry = state.desired?.parameters.find(p => p.parameter.key === entry.key);
    const definition = desiredEntry?.parameter;
    if (state.desired && entry.sourceConfigVersion === state.desired.version && (!desiredEntry || desiredEntry.origin.kind === 'needs_choice' || !sameOrdinaryData(entry.value, desiredEntry.value))) issue('Effective value differs from its authoritative source revision');
    if (!definition || definition.appliesWhen !== entry.mode || !CapabilityOrdinaryParameterSchema.safeParse({ parameter: definition, origin: { kind: 'agent_override' }, ...(entry.value !== undefined ? { value: entry.value } : {}) }).success) issue('Effective parameter must match declaration and value constraints');
  }
  if (state.applied) {
    const config = state.applied.configuration;
    const resolved = config.parameters.filter(p => p.origin.kind !== 'needs_choice');
    if (resolved.length !== config.parameters.length || resolved.length !== state.effectiveParameters.length || resolved.some(p => !state.effectiveParameters.some(e => e.key === p.parameter.key && e.mode === p.parameter.appliesWhen && e.sourceConfigVersion === config.version && sameOrdinaryData(e.value, p.value)))) issue('Applied requires the whole authoritative revision to be effective');
    if (state.desired?.version === config.version && !sameOrdinaryData(state.desired, config)) issue('One revision cannot have different desired and applied values');
  }
});
export type CapabilityOrdinaryConfigState = z.infer<typeof CapabilityOrdinaryConfigStateSchema>;
export type CapabilityOrdinaryApplied = z.infer<typeof CapabilityOrdinaryAppliedSchema>;
export type CapabilityOrdinaryEffectiveParameter = z.infer<typeof CapabilityOrdinaryEffectiveParameterSchema>;

export const CapabilityOrdinaryCallSnapshotSchema = z.object({
  scope: CapabilityAgentScopeSchema,
  capability: NameSchema,
  version: AgentConfigVersionSchema,
  values: z.record(CapabilityParameterKeySchema, CapabilityOrdinaryValueSchema),
}).strict().refine(snapshot => Object.keys(snapshot.values).length <= 100, 'Too many ordinary values');
export type CapabilityOrdinaryCallSnapshot = z.infer<typeof CapabilityOrdinaryCallSnapshotSchema>;

/** Only next_apply values from the server-owned active snapshot are dispatched; immediate is consumer-owned. */
export function parseCapabilityOrdinaryCall(snapshot: unknown, authoritative: CapabilityOrdinaryConfiguration): CapabilityOrdinaryCallSnapshot {
  const value = CapabilityOrdinaryCallSnapshotSchema.parse(snapshot), config = CapabilityOrdinaryConfigurationSchema.parse(authoritative);
  if (!sameCapabilityScope(value.scope, config.scope) || value.capability !== config.capability || value.version !== config.version) throw new Error('Ordinary call target or version mismatch');
  const expected = Object.fromEntries(config.parameters.filter(entry => entry.parameter.appliesWhen === 'next_apply' && entry.origin.kind !== 'needs_choice' && entry.value !== undefined).map(entry => [entry.parameter.key, entry.value]));
  if (!sameOrdinaryData(value.values, expected)) throw new Error('Ordinary call keyset or values mismatch');
  if (config.parameters.some(entry => entry.parameter.appliesWhen === 'next_apply' && entry.origin.kind === 'needs_choice')) throw new Error('Ordinary call requires resolved next_apply values');
  return value;
}
