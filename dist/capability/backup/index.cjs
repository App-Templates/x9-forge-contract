"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupDeviceVerifiedContract = exports.BackupDeviceVerifiedResponseSchema = exports.BackupDeviceVerifiedBodySchema = exports.backupDeviceRequestContract = exports.BackupDeviceRequestResponseSchema = exports.BackupDeviceRequestBodySchema = exports.backupDeviceStatusContract = exports.BackupStatusQuerySchema = exports.BackupRestoreInputSchema = exports.BackupCreateInputSchema = exports.BackupStatusInputSchema = exports.BACKUP_TOOL_NAMES = exports.BackupRestoreBackupBindingsSchema = exports.BackupRestoreSnapshotBindingsSchema = exports.BackupCreateBindingsSchema = exports.BACKUP_APPROVAL_TYPES = exports.BackupStatusSchema = exports.BackupHealthSchema = exports.BackupActionSchema = exports.BackupActionStateSchema = exports.BackupActionKindSchema = exports.ProviderBackupSchema = exports.BackupSnapshotSchema = exports.BackupReleaseLabelSchema = exports.BackupResourceSchema = exports.BackupResourceRefSchema = exports.BackupProviderSchema = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../approvals/index.cjs");
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
exports.BackupProviderSchema = zod_1.z.enum(['hostinger']);
/** `<provider>:vm:<machine id>`, e.g. `hostinger:vm:123456`. */
exports.BackupResourceRefSchema = zod_1.z
    .string()
    .regex(/^[a-z]+:vm:[A-Za-z0-9-]{1,64}$/)
    .refine((ref) => exports.BackupProviderSchema.safeParse(ref.slice(0, ref.indexOf(':'))).success, { message: 'unknown provider' });
/** Resource configured by the owner in Forge; `expectedIp` is checked against the provider before any call. */
exports.BackupResourceSchema = zod_1.z
    .object({
    ref: exports.BackupResourceRefSchema,
    provider: exports.BackupProviderSchema,
    machineId: zod_1.z.string().regex(/^[A-Za-z0-9-]{1,64}$/),
    expectedIp: zod_1.z.union([zod_1.z.ipv4(), zod_1.z.ipv6()]),
    name: zod_1.z.string().trim().min(1).max(80),
})
    .strict()
    .refine((r) => r.ref === `${r.provider}:vm:${r.machineId}`, { path: ['ref'], message: 'ref must be <provider>:vm:<machineId>' });
/** Release label a snapshot is taken for (e.g. a git tag `pre-phase-60-agent-x9`). */
exports.BackupReleaseLabelSchema = zod_1.z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._/-]{0,127}$/);
const InstantSchema = zod_1.z.iso.datetime({ offset: true });
exports.BackupSnapshotSchema = zod_1.z
    .object({
    id: zod_1.z.number().int().positive(),
    createdAt: InstantSchema,
    expiresAt: InstantSchema,
    restoreSec: zod_1.z.number().int().nonnegative(),
    /** Release it was approved for; null when taken outside cap-backup (provider panel). */
    release: exports.BackupReleaseLabelSchema.nullable(),
    origin: zod_1.z.enum(['approved', 'external']),
})
    .strict();
exports.ProviderBackupSchema = zod_1.z
    .object({ id: zod_1.z.number().int().positive(), createdAt: InstantSchema, restoreSec: zod_1.z.number().int().nonnegative() })
    .strict();
exports.BackupActionKindSchema = zod_1.z.enum(['create', 'restore-snapshot', 'restore-backup']);
exports.BackupActionStateSchema = zod_1.z.enum(['awaiting-approval', 'running', 'ready', 'failed', 'expired']);
exports.BackupActionSchema = zod_1.z
    .object({
    actionId: zod_1.z.string().regex(/^[A-Za-z0-9_-]{16,64}$/),
    kind: exports.BackupActionKindSchema,
    state: exports.BackupActionStateSchema,
    release: exports.BackupReleaseLabelSchema.nullable(),
    requestedAt: InstantSchema,
    updatedAt: InstantSchema,
    error: zod_1.z.string().min(1).max(500).nullable(),
})
    .strict();
exports.BackupHealthSchema = zod_1.z
    .object({
    healthy: zod_1.z.number().int().nonnegative(),
    total: zod_1.z.number().int().nonnegative(),
    unhealthy: zod_1.z.array(zod_1.z.string().min(1).max(80)).max(50),
    checkedAt: InstantSchema,
})
    .strict()
    .refine((h) => h.healthy <= h.total && h.unhealthy.length === h.total - h.healthy, { message: 'health counts disagree' });
exports.BackupStatusSchema = zod_1.z
    .object({
    resource: exports.BackupResourceRefSchema,
    snapshot: exports.BackupSnapshotSchema.nullable(),
    action: exports.BackupActionSchema.nullable(),
    providerBackups: zod_1.z.array(exports.ProviderBackupSchema).max(20),
    lastVerifiedRelease: zod_1.z.object({ release: exports.BackupReleaseLabelSchema, verifiedAt: InstantSchema }).strict().nullable(),
    health: exports.BackupHealthSchema.nullable(),
})
    .strict();
// ---------------------------------------------------------------------------------------------------------------
// Approval types and bindings (client `backup` of the signed approvals)
exports.BACKUP_APPROVAL_TYPES = {
    create: 'backup.create',
    /** Overwrites the only snapshot while the last release is unverified or the stack is not fully healthy. */
    createOverwriteUnverified: 'backup.create-overwrite-unverified',
    restoreSnapshot: 'backup.restore-snapshot',
    restoreBackup: 'backup.restore-backup',
};
const SnapshotIdBinding = zod_1.z.number().int().positive();
const isApprovalBindings = (b) => index_js_1.ApprovalBindingsSchema.safeParse(b).success;
exports.BackupCreateBindingsSchema = zod_1.z
    .object({
    resource: exports.BackupResourceRefSchema,
    release: exports.BackupReleaseLabelSchema,
    /** Id of the snapshot that will be overwritten, or `none`. */
    overwrites: zod_1.z.union([SnapshotIdBinding, zod_1.z.literal('none')]),
})
    .strict()
    .refine(isApprovalBindings, { message: 'not valid approval bindings' });
exports.BackupRestoreSnapshotBindingsSchema = zod_1.z
    .object({ resource: exports.BackupResourceRefSchema, snapshotId: SnapshotIdBinding, snapshotCreatedAt: InstantSchema })
    .strict()
    .refine(isApprovalBindings, { message: 'not valid approval bindings' });
exports.BackupRestoreBackupBindingsSchema = zod_1.z
    .object({ resource: exports.BackupResourceRefSchema, backupId: SnapshotIdBinding, backupCreatedAt: InstantSchema })
    .strict()
    .refine(isApprovalBindings, { message: 'not valid approval bindings' });
// ---------------------------------------------------------------------------------------------------------------
// Agent tools (via the standard capability /call contract)
exports.BACKUP_TOOL_NAMES = ['backup_status', 'backup_create', 'backup_restore'];
const ConfirmTokenSchema = zod_1.z.string().regex(/^[A-Za-z0-9_-]{16,128}$/);
exports.BackupStatusInputSchema = zod_1.z.object({ resource: exports.BackupResourceRefSchema.optional() }).strict();
exports.BackupCreateInputSchema = zod_1.z
    .object({ resource: exports.BackupResourceRefSchema.optional(), release: exports.BackupReleaseLabelSchema, confirmToken: ConfirmTokenSchema.optional() })
    .strict();
exports.BackupRestoreInputSchema = zod_1.z
    .object({
    resource: exports.BackupResourceRefSchema.optional(),
    source: zod_1.z.enum(['snapshot', 'backup']),
    backupId: zod_1.z.number().int().positive().optional(),
    confirmToken: ConfirmTokenSchema.optional(),
})
    .strict()
    .refine((i) => (i.source === 'backup') === (i.backupId !== undefined), { path: ['backupId'], message: 'backupId iff source=backup' });
// ---------------------------------------------------------------------------------------------------------------
// Device API (public, auth = device signature). Never an effect without a signed approval.
/** GET /backup/api/status?resource=<ref> — status for the owner's computer (e.g. the pre-release mod). */
exports.BackupStatusQuerySchema = zod_1.z.object({ resource: exports.BackupResourceRefSchema.optional() }).strict();
exports.backupDeviceStatusContract = {
    method: 'GET',
    path: '/backup/api/status',
    authType: 'device_signature',
    paramsSchema: exports.BackupStatusQuerySchema,
    responseSchema: exports.BackupStatusSchema,
};
/** POST /backup/api/requests — ask for a snapshot (or a snapshot restore); a pending one for the same resource is reused. */
exports.BackupDeviceRequestBodySchema = zod_1.z
    .object({
    resource: exports.BackupResourceRefSchema.optional(),
    kind: zod_1.z.enum(['create', 'restore-snapshot']),
    release: exports.BackupReleaseLabelSchema.optional(),
})
    .strict()
    .refine((b) => b.kind !== 'create' || b.release !== undefined, { path: ['release'], message: 'create needs a release' });
exports.BackupDeviceRequestResponseSchema = zod_1.z.discriminatedUnion('ok', [
    zod_1.z.object({ ok: zod_1.z.literal(true), action: exports.BackupActionSchema, attachedToExisting: zod_1.z.boolean() }).strict(),
    zod_1.z.object({ ok: zod_1.z.literal(false), error: zod_1.z.string().min(1).max(500) }).strict(),
]);
exports.backupDeviceRequestContract = {
    method: 'POST',
    path: '/backup/api/requests',
    authType: 'device_signature',
    bodySchema: exports.BackupDeviceRequestBodySchema,
    responseSchema: exports.BackupDeviceRequestResponseSchema,
};
/** POST /backup/api/verified — the release passed its post-deploy checks (enables a normal-severity next snapshot). */
exports.BackupDeviceVerifiedBodySchema = zod_1.z
    .object({ resource: exports.BackupResourceRefSchema.optional(), release: exports.BackupReleaseLabelSchema })
    .strict();
exports.BackupDeviceVerifiedResponseSchema = zod_1.z.discriminatedUnion('ok', [
    zod_1.z.object({ ok: zod_1.z.literal(true) }).strict(),
    zod_1.z.object({ ok: zod_1.z.literal(false), error: zod_1.z.string().min(1).max(500) }).strict(),
]);
exports.backupDeviceVerifiedContract = {
    method: 'POST',
    path: '/backup/api/verified',
    authType: 'device_signature',
    bodySchema: exports.BackupDeviceVerifiedBodySchema,
    responseSchema: exports.BackupDeviceVerifiedResponseSchema,
};
//# sourceMappingURL=index.js.map