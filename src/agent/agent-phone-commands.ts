import { z } from 'zod';
import { AgentConfigVersionSchema } from '../capability/ricerca/agent-config.js';
import { VoiceLiveCallStartRequestSchema } from '../capability/voice-live/index.js';
import { AgentChannelAccessApplyCommandSchema, AgentChannelAccessApplyResultSchema } from './agent-channel-access-requests.js';
import { AgentChannelAccessBindingSchema, sameAgentChannelAccessBinding, type AgentChannelAccessBinding } from './agent-channel-access.js';
import { AgentPhoneChannelConfigurationSchema, AgentPhoneRoutingBindingSchema, isPhoneChannelConfigurationApplied } from './agent-phone-channel.js';
import { AgentRuntimeLoadStateSchema } from './agent-runtime-state.js';
import { AgentRuntimeSourceSchema } from './agent-runtime-source.js';

const time = z.iso.datetime({ offset: true });
const bindingOf = (value: AgentChannelAccessBinding) => ({ scope: value.scope, identity: value.identity });
function currentDate(value: string, now: number, maximumAgeMs: number): boolean {
  const age = now - Date.parse(value);
  return Number.isFinite(now) && Number.isFinite(maximumAgeMs) && age >= 0 && age <= maximumAgeMs;
}

/** Runtime evidence only. X9 cannot assert the archival status owned by Forge. */
export const AgentPhoneRuntimeSnapshotSchema = z.object({
  configuration: AgentPhoneChannelConfigurationSchema, observedAt: time,
  runtimeLoadState: AgentRuntimeLoadStateSchema,
}).strict().superRefine((snapshot, ctx) => {
  const config = snapshot.configuration;
  const observations = [config.sharedNumber.observedAt, config.attestation?.observedAt];
  if (observations.some(value => value != null && Date.parse(value) > Date.parse(snapshot.observedAt))) ctx.addIssue({ code: 'custom', path: ['observedAt'], message: 'Snapshot cannot predate its evidence' }); // guard:snapshot-time
});
export type AgentPhoneRuntimeSnapshot = z.infer<typeof AgentPhoneRuntimeSnapshotSchema>;
/** Public composition requires archival status from the owning agent record, never a default. */
export const AgentPhoneSnapshotSchema = AgentPhoneRuntimeSnapshotSchema.safeExtend({ agentArchived: z.boolean() });
export type AgentPhoneSnapshot = z.infer<typeof AgentPhoneSnapshotSchema>;

/** Phone has no Telegram request queue. Reuse C1 CAS/action/requestId and reject all request changes. */
export const AgentPhoneApplyCommandSchema = AgentChannelAccessApplyCommandSchema.safeExtend({
  requestChanges: z.null(), expectedNumberVersion: AgentConfigVersionSchema.nullable(),
  expectedRoutingIdentity: AgentPhoneRoutingBindingSchema.shape.routingIdentity.nullable(),
}).strict();
export type AgentPhoneApplyCommand = z.infer<typeof AgentPhoneApplyCommandSchema>;

function phoneSnapshotCurrent(snapshot: AgentPhoneRuntimeSnapshot, rawBinding: unknown, now: number, maximumAgeMs: number): boolean {
  if (!sameAgentChannelAccessBinding(bindingOf(snapshot.configuration), rawBinding)) return false; // guard:snapshot-binding
  return currentDate(snapshot.observedAt, now, maximumAgeMs);
}
export function isAgentPhoneRuntimeSnapshotCurrent(rawSnapshot: unknown, rawBinding: unknown, now: number, maximumAgeMs = 60_000): boolean {
  const snapshot = AgentPhoneRuntimeSnapshotSchema.safeParse(rawSnapshot);
  return snapshot.success && phoneSnapshotCurrent(snapshot.data, rawBinding, now, maximumAgeMs);
}
export function isAgentPhoneSnapshotCurrent(rawSnapshot: unknown, rawBinding: unknown, now: number, maximumAgeMs = 60_000): boolean {
  const snapshot = AgentPhoneSnapshotSchema.safeParse(rawSnapshot);
  return snapshot.success && phoneSnapshotCurrent(snapshot.data, rawBinding, now, maximumAgeMs);
}
/** Pure runtime CAS check, not caller admission. Authenticate and recheck authority after every await. */
function phoneApplyReady(rawCommand: unknown, current: AgentPhoneRuntimeSnapshot, rawBinding: unknown, now: number, maximumAgeMs: number): boolean {
  const command = AgentPhoneApplyCommandSchema.safeParse(rawCommand);
  if (!command.success || !phoneSnapshotCurrent(current, rawBinding, now, maximumAgeMs)) return false; // guard:apply-current
  const intent = command.data, config = current.configuration;
  if (intent.desiredVersion !== config.desired.version || intent.expectedAppliedVersion !== (config.applied?.version ?? null)) return false; // guard:apply-versions
  if (intent.expectedNumberVersion !== config.sharedNumber.version || intent.expectedRoutingIdentity !== (config.routing?.routingIdentity ?? null)) return false; // guard:apply-routing-cas
  if (config.desired.state === 'paused') return true; // guard:pause-independent
  if (current.runtimeLoadState !== 'loaded') return false; // guard:apply-runtime
  if (config.routing === null || config.sharedNumber.status !== 'available') return false; // guard:apply-resource
  return currentDate(config.sharedNumber.observedAt ?? '', now, maximumAgeMs); // guard:apply-number-time
}
export function isAgentPhoneRuntimeApplyReady(rawCommand: unknown, rawSnapshot: unknown, rawBinding: unknown, now: number, maximumAgeMs = 60_000): boolean {
  const snapshot = AgentPhoneRuntimeSnapshotSchema.safeParse(rawSnapshot);
  return snapshot.success && phoneApplyReady(rawCommand, snapshot.data, rawBinding, now, maximumAgeMs);
}
export function isAgentPhoneApplyReady(rawCommand: unknown, rawSnapshot: unknown, rawBinding: unknown, now: number, maximumAgeMs = 60_000): boolean {
  const snapshot = AgentPhoneSnapshotSchema.safeParse(rawSnapshot);
  if (!snapshot.success || snapshot.data.agentArchived) return false; // guard:apply-archived
  return phoneApplyReady(rawCommand, snapshot.data, rawBinding, now, maximumAgeMs);
}

/** C1 outcome vocabulary and sanitized errors, with phone-specific snapshot correlation. */
export const AgentPhoneRuntimeApplyResultSchema = AgentChannelAccessBindingSchema.safeExtend({
  ...AgentPhoneApplyCommandSchema.shape, kind: z.literal('phone'),
  replayed: AgentChannelAccessApplyResultSchema.shape.replayed,
  outcome: AgentChannelAccessApplyResultSchema.shape.outcome, completedAt: time,
  snapshot: AgentPhoneRuntimeSnapshotSchema, error: AgentChannelAccessApplyResultSchema.shape.error,
}).strict().superRefine((result, ctx) => {
  const config = result.snapshot.configuration;
  const issue = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
  if (!sameAgentChannelAccessBinding(bindingOf(result), bindingOf(config))) issue('snapshot', 'Receipt belongs to another agent'); // guard:receipt-binding
  if (result.desiredVersion !== config.desired.version) issue('desiredVersion', 'Receipt must match the saved phone version'); // guard:receipt-desired
  if (result.expectedAppliedVersion !== null && result.expectedAppliedVersion > result.desiredVersion) issue('expectedAppliedVersion', 'Previous applied version cannot exceed desired'); // guard:receipt-order
  if (Date.parse(result.completedAt) < Date.parse(result.snapshot.observedAt)) issue('completedAt', 'Receipt cannot predate its snapshot'); // guard:receipt-time
  if (result.outcome === 'failed' && result.error === null) issue('error', 'Failure requires a fixed error code'); // guard:receipt-failure
  if (result.outcome === 'applied' && (result.error !== null || !isPhoneChannelConfigurationApplied(config, Date.parse(result.completedAt)))) issue('outcome', 'Applied requires current actual phone evidence without error'); // guard:receipt-applied
  if (result.outcome === 'applied' && config.desired.state === 'active' && (result.snapshot.runtimeLoadState !== 'loaded')) issue('snapshot', 'An archived or stopped agent cannot expose an active applied phone'); // guard:receipt-agent
  if (result.outcome === 'applied' && config.desired.state === 'active' && (result.expectedNumberVersion !== config.sharedNumber.version || result.expectedRoutingIdentity !== (config.routing?.routingIdentity ?? null))) issue('snapshot', 'Active receipt must match the expected line and routing generation'); // guard:receipt-routing
});
export type AgentPhoneRuntimeApplyResult = z.infer<typeof AgentPhoneRuntimeApplyResultSchema>;
export const AgentPhoneApplyResultSchema = AgentPhoneRuntimeApplyResultSchema.safeExtend({ snapshot: AgentPhoneSnapshotSchema }).superRefine((result, ctx) => {
  if (result.outcome === 'applied' && result.snapshot.configuration.desired.state === 'active' && result.snapshot.agentArchived) {
    ctx.addIssue({ code: 'custom', path: ['snapshot'], message: 'An archived agent cannot expose an active applied phone' }); // guard:receipt-archived
  }
});
export type AgentPhoneApplyResult = z.infer<typeof AgentPhoneApplyResultSchema>;

/** Full correlation is separate from durable idempotency, which remains the producer's responsibility. */
function phoneResultForCommand(rawCommand: unknown, actual: AgentPhoneRuntimeApplyResult, rawBinding: unknown, now: number, maximumAgeMs: number): boolean {
  const command = AgentPhoneApplyCommandSchema.safeParse(rawCommand);
  if (!command.success) return false;
  const intent = command.data;
  if (!phoneSnapshotCurrent(actual.snapshot, rawBinding, now, maximumAgeMs)) return false; // guard:result-current
  if (!currentDate(actual.completedAt, now, maximumAgeMs)) return false; // guard:result-time
  if (actual.requestId !== intent.requestId || actual.desiredVersion !== intent.desiredVersion || actual.expectedAppliedVersion !== intent.expectedAppliedVersion) return false; // guard:result-command
  if (actual.expectedNumberVersion !== intent.expectedNumberVersion || actual.expectedRoutingIdentity !== intent.expectedRoutingIdentity) return false; // guard:result-routing
  return true;
}
export function isAgentPhoneRuntimeResultForCommand(rawCommand: unknown, rawResult: unknown, rawBinding: unknown, now: number, maximumAgeMs = 60_000): boolean {
  const result = AgentPhoneRuntimeApplyResultSchema.safeParse(rawResult);
  return result.success && phoneResultForCommand(rawCommand, result.data, rawBinding, now, maximumAgeMs);
}
export function isAgentPhoneResultForCommand(rawCommand: unknown, rawResult: unknown, rawBinding: unknown, now: number, maximumAgeMs = 60_000): boolean {
  const result = AgentPhoneApplyResultSchema.safeParse(rawResult);
  return result.success && phoneResultForCommand(rawCommand, result.data, rawBinding, now, maximumAgeMs);
}

/** Payload from an already verified provider event; this schema never verifies a signature or grants admission. */
export const AgentPhoneInboundRouteEventSchema = z.object({
  callId: VoiceLiveCallStartRequestSchema.shape.call_id,
  toNumber: VoiceLiveCallStartRequestSchema.shape.to_number,
  fromNumber: VoiceLiveCallStartRequestSchema.shape.to_number.nullable(),
  routingIdentity: AgentPhoneRoutingBindingSchema.shape.routingIdentity, receivedAt: time,
}).strict();
export type AgentPhoneInboundRouteEvent = z.infer<typeof AgentPhoneInboundRouteEventSchema>;

/** Completeness is authoritative for ambiguity detection; a partial inventory cannot prove a unique route. */
export const AgentPhoneRuntimeRoutingInventorySchema = z.object({
  source: AgentRuntimeSourceSchema.strict(), snapshots: z.array(AgentPhoneRuntimeSnapshotSchema).max(2048),
}).strict().superRefine((inventory, ctx) => {
  if (inventory.source.observedAt !== null && inventory.snapshots.some(snapshot => Date.parse(snapshot.observedAt) > Date.parse(inventory.source.observedAt!))) ctx.addIssue({ code: 'custom', path: ['source'], message: 'Inventory cannot predate a route snapshot' }); // guard:inventory-time
});
export type AgentPhoneRuntimeRoutingInventory = z.infer<typeof AgentPhoneRuntimeRoutingInventorySchema>;
export const AgentPhoneRoutingInventorySchema = AgentPhoneRuntimeRoutingInventorySchema.safeExtend({ snapshots: z.array(AgentPhoneSnapshotSchema).max(2048) });
export type AgentPhoneRoutingInventory = z.infer<typeof AgentPhoneRoutingInventorySchema>;

/** Resolves one current active door only. Rubrica/voice/provider authentication still gate effects after resolution. */
function selectPhoneRoute<T extends AgentPhoneRuntimeSnapshot>(rawEvent: unknown,
  inventory: { source: AgentPhoneRuntimeRoutingInventory['source']; snapshots: T[] }, now: number, maximumAgeMs: number): T | null {
  const event = AgentPhoneInboundRouteEventSchema.safeParse(rawEvent);
  if (!event.success) return null;
  const source = inventory.source;
  if (source.availability !== 'available' || source.completeness !== 'complete') return null; // guard:route-source
  if (!currentDate(event.data.receivedAt, now, maximumAgeMs) || !currentDate(source.observedAt ?? '', now, maximumAgeMs)) return null; // guard:route-times
  const matches = inventory.snapshots.filter(snapshot => snapshot.configuration.routing?.routingIdentity === event.data.routingIdentity && snapshot.configuration.routing.number === event.data.toNumber);
  if (matches.length !== 1) return null; // guard:route-unique
  const selected = matches[0]!;
  if (selected.runtimeLoadState !== 'loaded') return null; // guard:route-agent
  if (selected.configuration.desired.state !== 'active') return null; // guard:route-active
  if (!isPhoneChannelConfigurationApplied(selected.configuration, now, maximumAgeMs)) return null; // guard:route-applied
  return selected;
}
/** A runtime candidate is not admission: Forge archival, Rubrica and caller authority still gate effects. */
export function resolveAgentPhoneRuntimeRoute(rawEvent: unknown, rawInventory: unknown, now: number, maximumAgeMs = 60_000): AgentPhoneRuntimeSnapshot | null {
  const inventory = AgentPhoneRuntimeRoutingInventorySchema.safeParse(rawInventory);
  return inventory.success ? selectPhoneRoute(rawEvent, inventory.data, now, maximumAgeMs) : null;
}
export function resolveAgentPhoneRoute(rawEvent: unknown, rawInventory: unknown, now: number, maximumAgeMs = 60_000): AgentPhoneSnapshot | null {
  const inventory = AgentPhoneRoutingInventorySchema.safeParse(rawInventory);
  if (!inventory.success) return null;
  const selected = selectPhoneRoute(rawEvent, inventory.data, now, maximumAgeMs);
  return selected && !selected.agentArchived ? selected : null; // guard:route-archived
}

/** Correlated routing observation, including an explicit unresolved result. Never a caller admission receipt. */
export const AgentPhoneRuntimeRouteResultSchema = z.object({
  event: AgentPhoneInboundRouteEventSchema, snapshot: AgentPhoneRuntimeSnapshotSchema.nullable(), resolvedAt: time,
}).strict().superRefine((result, ctx) => {
  const issue = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
  if (Date.parse(result.resolvedAt) < Date.parse(result.event.receivedAt)) issue('resolvedAt', 'Route result cannot predate its event'); // guard:route-result-event-time
  if (result.snapshot === null) return;
  const config = result.snapshot.configuration;
  if (Date.parse(result.resolvedAt) < Date.parse(result.snapshot.observedAt)) issue('resolvedAt', 'Route result cannot predate its snapshot'); // guard:route-result-snapshot-time
  if (config.routing?.routingIdentity !== result.event.routingIdentity || config.routing.number !== result.event.toNumber) issue('snapshot', 'Selected route must match the exact selector and shared number'); // guard:route-result-selection
  if (result.snapshot.runtimeLoadState !== 'loaded') issue('snapshot', 'Selected agent must be current and loaded'); // guard:route-result-agent
  if (config.desired.state !== 'active' || !isPhoneChannelConfigurationApplied(config, Date.parse(result.resolvedAt))) issue('snapshot', 'Selection requires an active applied door with current evidence'); // guard:route-result-active
});
export type AgentPhoneRuntimeRouteResult = z.infer<typeof AgentPhoneRuntimeRouteResultSchema>;
export const AgentPhoneRouteResultSchema = AgentPhoneRuntimeRouteResultSchema.safeExtend({ snapshot: AgentPhoneSnapshotSchema.nullable() }).superRefine((result, ctx) => {
  if (result.snapshot?.agentArchived) ctx.addIssue({ code: 'custom', path: ['snapshot'], message: 'Selected agent must not be archived' }); // guard:route-result-archived
});
export type AgentPhoneRouteResult = z.infer<typeof AgentPhoneRouteResultSchema>;

function phoneRouteResultForEvent(rawEvent: unknown, result: AgentPhoneRuntimeRouteResult, now: number, maximumAgeMs: number): boolean {
  const event = AgentPhoneInboundRouteEventSchema.safeParse(rawEvent);
  if (!event.success) return false;
  if (JSON.stringify(event.data) !== JSON.stringify(result.event)) return false; // guard:route-result-correlation
  if (!currentDate(result.resolvedAt, now, maximumAgeMs)) return false; // guard:route-result-current
  return currentDate(result.event.receivedAt, now, maximumAgeMs); // guard:route-result-event-current
}
export function isAgentPhoneRuntimeRouteResultForEvent(rawEvent: unknown, rawResult: unknown, now: number, maximumAgeMs = 60_000): boolean {
  const result = AgentPhoneRuntimeRouteResultSchema.safeParse(rawResult);
  return result.success && phoneRouteResultForEvent(rawEvent, result.data, now, maximumAgeMs);
}
export function isAgentPhoneRouteResultForEvent(rawEvent: unknown, rawResult: unknown, now: number, maximumAgeMs = 60_000): boolean {
  const result = AgentPhoneRouteResultSchema.safeParse(rawResult);
  return result.success && phoneRouteResultForEvent(rawEvent, result.data, now, maximumAgeMs);
}
