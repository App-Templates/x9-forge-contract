import { z } from 'zod';
import { ApprovalBindingsSchema } from '../approvals/index.js';

/**
 * cap-backup (phase 59) — restore points of the owner's servers, per provider (Hostinger first).
 *
 * - First client of the signed approvals (`../approvals`): creating a snapshot and every restore happen only after a
 *   passkey-approved, signed permit bound to the resource and to the release / snapshot / backup concerned.
 * - Provider limits are explicit: Hostinger keeps ONE snapshot per machine and a new one overwrites it, so the status
 *   says what would be overwritten, the stack health and whether the last release was verified.
 * - The provider API token never leaves cap-backup (vault); the owner's computer talks to the device API below,
 *   signed with its own key (`@x9-forge/contracts/auth` device signature), and can only read status or ask.
 */

export const BackupProviderSchema = z.enum(['hostinger']);
export type BackupProvider = z.infer<typeof BackupProviderSchema>;

/** `<provider>:vm:<machine id>`, e.g. `hostinger:vm:123456`. */
export const BackupResourceRefSchema = z
  .string()
  .regex(/^[a-z]+:vm:[A-Za-z0-9-]{1,64}$/)
  .refine((ref) => BackupProviderSchema.safeParse(ref.slice(0, ref.indexOf(':'))).success, { message: 'unknown provider' });
export type BackupResourceRef = z.infer<typeof BackupResourceRefSchema>;

/** Resource configured by the owner in Forge; `expectedIp` is checked against the provider before any call. */
export const BackupResourceSchema = z
  .object({
    ref: BackupResourceRefSchema,
    provider: BackupProviderSchema,
    machineId: z.string().regex(/^[A-Za-z0-9-]{1,64}$/),
    expectedIp: z.union([z.ipv4(), z.ipv6()]),
    name: z.string().trim().min(1).max(80),
  })
  .strict()
  .refine((r) => r.ref === `${r.provider}:vm:${r.machineId}`, { path: ['ref'], message: 'ref must be <provider>:vm:<machineId>' });
export type BackupResource = z.infer<typeof BackupResourceSchema>;

/** Release label a snapshot is taken for (e.g. a git tag `pre-phase-60-agent-x9`). */
export const BackupReleaseLabelSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._/-]{0,127}$/);

const InstantSchema = z.iso.datetime({ offset: true });

export const BackupSnapshotSchema = z
  .object({
    id: z.number().int().positive(),
    createdAt: InstantSchema,
    expiresAt: InstantSchema,
    restoreSec: z.number().int().nonnegative(),
    /** Release it was approved for; null when taken outside cap-backup (provider panel). */
    release: BackupReleaseLabelSchema.nullable(),
    origin: z.enum(['approved', 'external']),
  })
  .strict();
export type BackupSnapshot = z.infer<typeof BackupSnapshotSchema>;

export const ProviderBackupSchema = z
  .object({ id: z.number().int().positive(), createdAt: InstantSchema, restoreSec: z.number().int().nonnegative() })
  .strict();

export const BackupActionKindSchema = z.enum(['create', 'restore-snapshot', 'restore-backup']);
export const BackupActionStateSchema = z.enum(['awaiting-approval', 'running', 'ready', 'failed', 'expired']);
export type BackupActionState = z.infer<typeof BackupActionStateSchema>;

export const BackupActionSchema = z
  .object({
    actionId: z.string().regex(/^[A-Za-z0-9_-]{16,64}$/),
    kind: BackupActionKindSchema,
    state: BackupActionStateSchema,
    release: BackupReleaseLabelSchema.nullable(),
    requestedAt: InstantSchema,
    updatedAt: InstantSchema,
    error: z.string().min(1).max(500).nullable(),
  })
  .strict();
export type BackupAction = z.infer<typeof BackupActionSchema>;

export const BackupHealthSchema = z
  .object({
    healthy: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
    unhealthy: z.array(z.string().min(1).max(80)).max(50),
    checkedAt: InstantSchema,
  })
  .strict()
  .refine((h) => h.healthy <= h.total && h.unhealthy.length === h.total - h.healthy, { message: 'health counts disagree' });

export const BackupStatusSchema = z
  .object({
    resource: BackupResourceRefSchema,
    snapshot: BackupSnapshotSchema.nullable(),
    action: BackupActionSchema.nullable(),
    providerBackups: z.array(ProviderBackupSchema).max(20),
    lastVerifiedRelease: z.object({ release: BackupReleaseLabelSchema, verifiedAt: InstantSchema }).strict().nullable(),
    health: BackupHealthSchema.nullable(),
  })
  .strict();
export type BackupStatus = z.infer<typeof BackupStatusSchema>;

// ---------------------------------------------------------------------------------------------------------------
// Approval types and bindings (client `backup` of the signed approvals)

export const BACKUP_APPROVAL_TYPES = {
  create: 'backup.create',
  /** Overwrites the only snapshot while the last release is unverified or the stack is not fully healthy. */
  createOverwriteUnverified: 'backup.create-overwrite-unverified',
  restoreSnapshot: 'backup.restore-snapshot',
  restoreBackup: 'backup.restore-backup',
} as const;

const SnapshotIdBinding = z.number().int().positive();
const isApprovalBindings = (b: unknown): boolean => ApprovalBindingsSchema.safeParse(b).success;
export const BackupCreateBindingsSchema = z
  .object({
    resource: BackupResourceRefSchema,
    release: BackupReleaseLabelSchema,
    /** Id of the snapshot that will be overwritten, or `none`. */
    overwrites: z.union([SnapshotIdBinding, z.literal('none')]),
  })
  .strict()
  .refine(isApprovalBindings, { message: 'not valid approval bindings' });
export const BackupRestoreSnapshotBindingsSchema = z
  .object({ resource: BackupResourceRefSchema, snapshotId: SnapshotIdBinding, snapshotCreatedAt: InstantSchema })
  .strict()
  .refine(isApprovalBindings, { message: 'not valid approval bindings' });
export const BackupRestoreBackupBindingsSchema = z
  .object({ resource: BackupResourceRefSchema, backupId: SnapshotIdBinding, backupCreatedAt: InstantSchema })
  .strict()
  .refine(isApprovalBindings, { message: 'not valid approval bindings' });

// ---------------------------------------------------------------------------------------------------------------
// Agent tools (via the standard capability /call contract)

export const BACKUP_TOOL_NAMES = ['backup_status', 'backup_create', 'backup_restore'] as const;
const ConfirmTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{16,128}$/);

export const BackupStatusInputSchema = z.object({ resource: BackupResourceRefSchema.optional() }).strict();
export const BackupCreateInputSchema = z
  .object({ resource: BackupResourceRefSchema.optional(), release: BackupReleaseLabelSchema, confirmToken: ConfirmTokenSchema.optional() })
  .strict();
export const BackupRestoreInputSchema = z
  .object({
    resource: BackupResourceRefSchema.optional(),
    source: z.enum(['snapshot', 'backup']),
    backupId: z.number().int().positive().optional(),
    confirmToken: ConfirmTokenSchema.optional(),
  })
  .strict()
  .refine((i) => (i.source === 'backup') === (i.backupId !== undefined), { path: ['backupId'], message: 'backupId iff source=backup' });

// ---------------------------------------------------------------------------------------------------------------
// Device API (public, auth = device signature). Never an effect without a signed approval.

/** GET /backup/api/status?resource=<ref> — status for the owner's computer (e.g. the pre-release mod). */
export const BackupStatusQuerySchema = z.object({ resource: BackupResourceRefSchema.optional() }).strict();
export const backupDeviceStatusContract = {
  method: 'GET' as const,
  path: '/backup/api/status' as const,
  authType: 'device_signature' as const,
  paramsSchema: BackupStatusQuerySchema,
  responseSchema: BackupStatusSchema,
} as const;

/** POST /backup/api/requests — ask for a snapshot (or a snapshot restore); a pending one for the same resource is reused. */
export const BackupDeviceRequestBodySchema = z
  .object({
    resource: BackupResourceRefSchema.optional(),
    kind: z.enum(['create', 'restore-snapshot']),
    release: BackupReleaseLabelSchema.optional(),
  })
  .strict()
  .refine((b) => b.kind !== 'create' || b.release !== undefined, { path: ['release'], message: 'create needs a release' });
export const BackupDeviceRequestResponseSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), action: BackupActionSchema, attachedToExisting: z.boolean() }).strict(),
  z.object({ ok: z.literal(false), error: z.string().min(1).max(500) }).strict(),
]);
export const backupDeviceRequestContract = {
  method: 'POST' as const,
  path: '/backup/api/requests' as const,
  authType: 'device_signature' as const,
  bodySchema: BackupDeviceRequestBodySchema,
  responseSchema: BackupDeviceRequestResponseSchema,
} as const;

/** POST /backup/api/verified — the release passed its post-deploy checks (enables a normal-severity next snapshot). */
export const BackupDeviceVerifiedBodySchema = z
  .object({ resource: BackupResourceRefSchema.optional(), release: BackupReleaseLabelSchema })
  .strict();
export const BackupDeviceVerifiedResponseSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true) }).strict(),
  z.object({ ok: z.literal(false), error: z.string().min(1).max(500) }).strict(),
]);
export const backupDeviceVerifiedContract = {
  method: 'POST' as const,
  path: '/backup/api/verified' as const,
  authType: 'device_signature' as const,
  bodySchema: BackupDeviceVerifiedBodySchema,
  responseSchema: BackupDeviceVerifiedResponseSchema,
} as const;
