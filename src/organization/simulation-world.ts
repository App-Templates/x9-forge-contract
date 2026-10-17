import { createHash } from 'node:crypto';
import { z } from 'zod';
import { OwnerIdSchema } from '../agent/agent-identity.js';
import { RunIdSchema } from './run-context.js';
import { RunOutcomeSchema } from './run-outcome.js';
import { ConsumptionCapSchema, RunReceiptSchema } from './run-receipt.js';
import { ScenarioVersionRefSchema } from './scenario.js';

const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);

/** Typed initial state of a simulated world (never opaque JSON). */
export const SimulationInitialStateSchema = z.strictObject({
  agents: z
    .array(z.strictObject({ agentId: z.string().min(1), role: z.string().min(1) }))
    .min(1),
  jobs: z.array(
    z.strictObject({
      jobId: z.string().min(1),
      agentId: z.string().min(1),
      intervalSeconds: z.number().int().min(1),
      destination: z.string().min(1),
    }),
  ),
  caps: z.array(ConsumptionCapSchema).max(10),
});
export type SimulationInitialState = z.infer<typeof SimulationInitialStateSchema>;

/**
 * An isolated simulated world pinned to a fixed scenario. `organizationId` is
 * explicit and is NOT assumed equal to `tenantId`.
 */
export const SimulationWorldSchema = z
  .strictObject({
    worldId: z.string().min(1),
    schemaVersion: z.literal(1),
    scenarioRef: ScenarioVersionRefSchema,
    tenantId: z.string().min(1),
    organizationId: z.string().min(1),
    ownerId: OwnerIdSchema.optional(),
    clock: z.strictObject({ startAt: z.iso.datetime() }),
    initialState: SimulationInitialStateSchema,
    allowedDestinations: z.array(z.string().min(1)),
  })
  .superRefine((world, ctx) => {
    world.initialState.jobs.forEach((job, index) => {
      if (!world.allowedDestinations.includes(job.destination)) {
        ctx.addIssue({
          code: 'custom',
          path: ['initialState', 'jobs', index, 'destination'],
          message: 'destination is not in allowedDestinations',
        });
      }
    });
  });
export type SimulationWorld = z.infer<typeof SimulationWorldSchema>;

const actionBase = {
  seq: z.number().int().min(0),
  effectId: z.string().min(1),
};

/** One step of the world; `seq` is the semantic order, `effectId` the effect identity. */
export const SimulationActionSchema = z.discriminatedUnion('type', [
  z.strictObject({
    ...actionBase,
    type: z.literal('turn'),
    agentId: z.string().min(1),
    input: z.string().min(1),
    destination: z.string().min(1).optional(),
  }),
  z.strictObject({
    ...actionBase,
    type: z.literal('job_occurrence'),
    jobId: z.string().min(1),
    occurrenceAt: z.iso.datetime(),
  }),
  z.strictObject({ ...actionBase, type: z.literal('stop'), runId: RunIdSchema }),
  z.strictObject({
    ...actionBase,
    type: z.literal('advance_clock'),
    seconds: z.number().int().min(1),
  }),
  z.strictObject({
    ...actionBase,
    type: z.literal('inject_fault'),
    fault: z.enum(['response_lost', 'timeout', 'provider_unknown', 'worker_crashed']),
    target: z.string().min(1),
  }),
]);
export type SimulationAction = z.infer<typeof SimulationActionSchema>;

/** A world plus its ordered actions: unique `seq`, destinations inside the world list. */
export const SimulationScriptSchema = z
  .strictObject({
    world: SimulationWorldSchema,
    actions: z.array(SimulationActionSchema),
  })
  .superRefine((script, ctx) => {
    const seen = new Set<number>();
    script.actions.forEach((action, index) => {
      if (seen.has(action.seq)) {
        ctx.addIssue({
          code: 'custom',
          path: ['actions', index, 'seq'],
          message: 'seq must be unique within a script',
        });
      }
      seen.add(action.seq);
      if (
        action.type === 'turn' &&
        action.destination !== undefined &&
        !script.world.allowedDestinations.includes(action.destination)
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['actions', index, 'destination'],
          message: 'destination is not in allowedDestinations',
        });
      }
    });
  });
export type SimulationScript = z.infer<typeof SimulationScriptSchema>;

/** Correlated result of a simulation: every outcome is tied to its run and attempt. */
export const SimulationResultSchema = z.strictObject({
  worldId: z.string().min(1),
  scenarioRef: ScenarioVersionRefSchema,
  runs: z.array(
    z.strictObject({
      runId: RunIdSchema,
      attemptId: z.string().min(1),
      outcome: RunOutcomeSchema,
    }),
  ),
  receipts: z.array(RunReceiptSchema),
  coverage: z.strictObject({
    numerator: z.number().int().min(0),
    denominator: z.number().int().min(0),
    limits: z.array(z.string().min(1)),
  }),
  canonicalHash: Sha256Schema,
});
export type SimulationResult = z.infer<typeof SimulationResultSchema>;

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) {
      sorted[key] = canonicalize((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

/** SHA-256 (lowercase hex) of the world with object keys sorted; array order is kept. */
export function canonicalWorldHash(world: SimulationWorld): string {
  return createHash('sha256').update(JSON.stringify(canonicalize(world))).digest('hex');
}
