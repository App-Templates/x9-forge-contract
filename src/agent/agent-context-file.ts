import { z } from 'zod';
import { AgentContextCoreSchema } from './agent-context-core.js';
import { isPlatformInternalCredentialKey } from '../vault/platform-internal-credentials.js';
import { AgentConfigVersionSchema } from '../capability/ricerca/agent-config.js';

/**
 * AgentContextFile — the FULL canonical contract for `context.json` on disk.
 *
 * Forge `deploy.machine.ts` WRITES this shape; X9 `agent-manager.ts` READS
 * and validates it. Both sides therefore share it cross-repo — it lives
 * here, not in either consumer (R-14).
 *
 * History (F-1, 2026-06-11): the Runtime fields used to be re-declared
 * X9-side with `telegramBotToken: z.string().min(1)` while Forge wrote
 * `''` for bot-less agents (BotFather skipped/failed, email-only persona).
 * X9's reload threw on the schema, Forge swallowed the error, and the agent
 * was silently never registered in agent-core — Bug #15 class drift.
 *
 * DECISION (encoded here, both consumers import):
 * **bot-less agents are legal.** `telegramBotToken` may be absent, or the
 * empty string (what Forge's writer emits today). Consumers MUST use
 * {@link hasTelegramBot} to decide whether to boot a Telegram channel for
 * the agent; `/internal/turn` + proactive delivery remain available either
 * way.
 *
 * @see F-1 — E2E-FINDINGS-2026-06-11
 */
export const AgentContextRuntimeFieldsSchema = z.object({
  /** Absolute path to the agent workspace dir (Forge: /data/workspaces/{agentId}). */
  workspacePath: z.string().min(1),
  /** Absolute path to the agent registry.json (Forge: /data/agents/{agentId}/registry.json). */
  registryPath: z.string().min(1),
  /**
   * Telegram bot token. Absent or `''` ⇒ bot-less agent (legal): no
   * Telegram channel is booted, the agent is still registered for
   * `/internal/turn` and proactive delivery. Use {@link hasTelegramBot}.
   */
  telegramBotToken: z.string().optional(),
  /** Human-readable agent name (logs, UI). */
  displayName: z.string().min(1),
  /**
   * BRIDGE-133 (v1.33.0) — version of the WHOLE saved agent configuration this context materializes.
   *
   * Forge writes it on Apply (same numeric version as `AgentConfigVersionStateSchema.desired/applied`).
   * X9 reads it only after validating the context; once the context is loaded, this value IS the applied version
   * (`AgentConfigVersionStateSchema.applied`). Absent ⇒ never applied: report `null` via
   * {@link appliedAgentConfigVersion}, never a guessed value. Additive: 1.32 contexts without it stay valid.
   */
  configVersion: AgentConfigVersionSchema.optional(),
});
export type AgentContextRuntimeFields = z.infer<typeof AgentContextRuntimeFieldsSchema>;

/**
 * Full context.json schema: Core (cross-repo identity/credentials/llm) +
 * Runtime fields (paths, telegram, display). Passthrough is inherited from
 * Core so future additive fields never break either consumer.
 */
export const AgentContextFileSchema = AgentContextCoreSchema.extend(
  AgentContextRuntimeFieldsSchema.shape,
);
export type AgentContextFile = z.infer<typeof AgentContextFileSchema>;

/**
 * Canonical bot-less discriminator. `''` and whitespace-only count as
 * "no bot" because Forge's writer emits `params.telegram_bot_token?.trim() ?? ''`.
 */
export function hasTelegramBot(ctx: Pick<AgentContextFile, 'telegramBotToken'>): boolean {
  return typeof ctx.telegramBotToken === 'string' && ctx.telegramBotToken.trim().length > 0;
}

/**
 * Applied configuration version of a VALIDATED context: its `configVersion`, or `null` (never applied) when absent.
 * Never infers a version from other fields.
 */
export function appliedAgentConfigVersion(ctx: Pick<AgentContextFile, 'configVersion'>): number | null {
  return ctx.configVersion ?? null;
}

/**
 * Parse and validate raw JSON into the full AgentContextFile shape.
 * Fail-loud: throws ZodError on invalid input. Boundary helper for both
 * the Forge writer (validate-before-write) and the X9 reader.
 */
export function parseAgentContextFile(json: unknown): AgentContextFile {
  return AgentContextFileSchema.parse(json);
}

/**
 * Writer-side schema: the full context.json shape, plus no platform-internal
 * credential (see `PLATFORM_INTERNAL_CREDENTIAL_KEYS` in `/vault`) in
 * `credentials`. Writers (Forge `deploy.machine`) validate with this.
 *
 * The reader schema ({@link AgentContextFileSchema}) deliberately stays
 * lenient: contexts written before v1.25.0 still carry such keys, and a
 * strict reader would quarantine them instead of loading the agent.
 */
export const AgentContextFileWriteSchema = AgentContextFileSchema.superRefine((ctx, issue) => {
  for (const key of Object.keys(ctx.credentials)) {
    if (isPlatformInternalCredentialKey(key)) {
      issue.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['credentials', key],
        message: `platform-internal credential "${key}" must not be written into an agent context`,
      });
    }
  }
});

/**
 * Validate a context.json about to be WRITTEN. Fail-loud like
 * {@link parseAgentContextFile}, and also rejects platform-internal
 * credentials. Error messages carry key names only, never values.
 */
export function parseAgentContextFileForWrite(json: unknown): AgentContextFile {
  return AgentContextFileWriteSchema.parse(json);
}
