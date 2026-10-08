import { z } from 'zod';
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
export declare const BackupProviderSchema: z.ZodEnum<{
    hostinger: "hostinger";
}>;
export type BackupProvider = z.infer<typeof BackupProviderSchema>;
/** `<provider>:vm:<machine id>`, e.g. `hostinger:vm:123456`. */
export declare const BackupResourceRefSchema: z.ZodString;
export type BackupResourceRef = z.infer<typeof BackupResourceRefSchema>;
/** Resource configured by the owner in Forge; `expectedIp` is checked against the provider before any call. */
export declare const BackupResourceSchema: z.ZodObject<{
    ref: z.ZodString;
    provider: z.ZodEnum<{
        hostinger: "hostinger";
    }>;
    machineId: z.ZodString;
    expectedIp: z.ZodUnion<readonly [z.ZodIPv4, z.ZodIPv6]>;
    name: z.ZodString;
}, z.core.$strict>;
export type BackupResource = z.infer<typeof BackupResourceSchema>;
/** Release label a snapshot is taken for (e.g. a git tag `pre-phase-60-agent-x9`). */
export declare const BackupReleaseLabelSchema: z.ZodString;
export declare const BackupSnapshotSchema: z.ZodObject<{
    id: z.ZodNumber;
    createdAt: z.ZodISODateTime;
    expiresAt: z.ZodISODateTime;
    restoreSec: z.ZodNumber;
    release: z.ZodNullable<z.ZodString>;
    origin: z.ZodEnum<{
        approved: "approved";
        external: "external";
    }>;
}, z.core.$strict>;
export type BackupSnapshot = z.infer<typeof BackupSnapshotSchema>;
export declare const ProviderBackupSchema: z.ZodObject<{
    id: z.ZodNumber;
    createdAt: z.ZodISODateTime;
    restoreSec: z.ZodNumber;
}, z.core.$strict>;
export declare const BackupActionKindSchema: z.ZodEnum<{
    create: "create";
    "restore-snapshot": "restore-snapshot";
    "restore-backup": "restore-backup";
}>;
export declare const BackupActionStateSchema: z.ZodEnum<{
    failed: "failed";
    ready: "ready";
    expired: "expired";
    running: "running";
    "awaiting-approval": "awaiting-approval";
}>;
export type BackupActionState = z.infer<typeof BackupActionStateSchema>;
export declare const BackupActionSchema: z.ZodObject<{
    actionId: z.ZodString;
    kind: z.ZodEnum<{
        create: "create";
        "restore-snapshot": "restore-snapshot";
        "restore-backup": "restore-backup";
    }>;
    state: z.ZodEnum<{
        failed: "failed";
        ready: "ready";
        expired: "expired";
        running: "running";
        "awaiting-approval": "awaiting-approval";
    }>;
    release: z.ZodNullable<z.ZodString>;
    requestedAt: z.ZodISODateTime;
    updatedAt: z.ZodISODateTime;
    error: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type BackupAction = z.infer<typeof BackupActionSchema>;
export declare const BackupHealthSchema: z.ZodObject<{
    healthy: z.ZodNumber;
    total: z.ZodNumber;
    unhealthy: z.ZodArray<z.ZodString>;
    checkedAt: z.ZodISODateTime;
}, z.core.$strict>;
export declare const BackupStatusSchema: z.ZodObject<{
    resource: z.ZodString;
    snapshot: z.ZodNullable<z.ZodObject<{
        id: z.ZodNumber;
        createdAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
        restoreSec: z.ZodNumber;
        release: z.ZodNullable<z.ZodString>;
        origin: z.ZodEnum<{
            approved: "approved";
            external: "external";
        }>;
    }, z.core.$strict>>;
    action: z.ZodNullable<z.ZodObject<{
        actionId: z.ZodString;
        kind: z.ZodEnum<{
            create: "create";
            "restore-snapshot": "restore-snapshot";
            "restore-backup": "restore-backup";
        }>;
        state: z.ZodEnum<{
            failed: "failed";
            ready: "ready";
            expired: "expired";
            running: "running";
            "awaiting-approval": "awaiting-approval";
        }>;
        release: z.ZodNullable<z.ZodString>;
        requestedAt: z.ZodISODateTime;
        updatedAt: z.ZodISODateTime;
        error: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>;
    providerBackups: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        createdAt: z.ZodISODateTime;
        restoreSec: z.ZodNumber;
    }, z.core.$strict>>;
    lastVerifiedRelease: z.ZodNullable<z.ZodObject<{
        release: z.ZodString;
        verifiedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
    health: z.ZodNullable<z.ZodObject<{
        healthy: z.ZodNumber;
        total: z.ZodNumber;
        unhealthy: z.ZodArray<z.ZodString>;
        checkedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type BackupStatus = z.infer<typeof BackupStatusSchema>;
export declare const BACKUP_APPROVAL_TYPES: {
    readonly create: "backup.create";
    /** Overwrites the only snapshot while the last release is unverified or the stack is not fully healthy. */
    readonly createOverwriteUnverified: "backup.create-overwrite-unverified";
    readonly restoreSnapshot: "backup.restore-snapshot";
    readonly restoreBackup: "backup.restore-backup";
};
export declare const BackupCreateBindingsSchema: z.ZodObject<{
    resource: z.ZodString;
    release: z.ZodString;
    overwrites: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"none">]>;
}, z.core.$strict>;
export declare const BackupRestoreSnapshotBindingsSchema: z.ZodObject<{
    resource: z.ZodString;
    snapshotId: z.ZodNumber;
    snapshotCreatedAt: z.ZodISODateTime;
}, z.core.$strict>;
export declare const BackupRestoreBackupBindingsSchema: z.ZodObject<{
    resource: z.ZodString;
    backupId: z.ZodNumber;
    backupCreatedAt: z.ZodISODateTime;
}, z.core.$strict>;
export declare const BACKUP_TOOL_NAMES: readonly ["backup_status", "backup_create", "backup_restore"];
export declare const BackupStatusInputSchema: z.ZodObject<{
    resource: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const BackupCreateInputSchema: z.ZodObject<{
    resource: z.ZodOptional<z.ZodString>;
    release: z.ZodString;
    confirmToken: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const BackupRestoreInputSchema: z.ZodObject<{
    resource: z.ZodOptional<z.ZodString>;
    source: z.ZodEnum<{
        snapshot: "snapshot";
        backup: "backup";
    }>;
    backupId: z.ZodOptional<z.ZodNumber>;
    confirmToken: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
/** GET /backup/api/status?resource=<ref> — status for the owner's computer (e.g. the pre-release mod). */
export declare const BackupStatusQuerySchema: z.ZodObject<{
    resource: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const backupDeviceStatusContract: {
    readonly method: "GET";
    readonly path: "/backup/api/status";
    readonly authType: "device_signature";
    readonly paramsSchema: z.ZodObject<{
        resource: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        resource: z.ZodString;
        snapshot: z.ZodNullable<z.ZodObject<{
            id: z.ZodNumber;
            createdAt: z.ZodISODateTime;
            expiresAt: z.ZodISODateTime;
            restoreSec: z.ZodNumber;
            release: z.ZodNullable<z.ZodString>;
            origin: z.ZodEnum<{
                approved: "approved";
                external: "external";
            }>;
        }, z.core.$strict>>;
        action: z.ZodNullable<z.ZodObject<{
            actionId: z.ZodString;
            kind: z.ZodEnum<{
                create: "create";
                "restore-snapshot": "restore-snapshot";
                "restore-backup": "restore-backup";
            }>;
            state: z.ZodEnum<{
                failed: "failed";
                ready: "ready";
                expired: "expired";
                running: "running";
                "awaiting-approval": "awaiting-approval";
            }>;
            release: z.ZodNullable<z.ZodString>;
            requestedAt: z.ZodISODateTime;
            updatedAt: z.ZodISODateTime;
            error: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>>;
        providerBackups: z.ZodArray<z.ZodObject<{
            id: z.ZodNumber;
            createdAt: z.ZodISODateTime;
            restoreSec: z.ZodNumber;
        }, z.core.$strict>>;
        lastVerifiedRelease: z.ZodNullable<z.ZodObject<{
            release: z.ZodString;
            verifiedAt: z.ZodISODateTime;
        }, z.core.$strict>>;
        health: z.ZodNullable<z.ZodObject<{
            healthy: z.ZodNumber;
            total: z.ZodNumber;
            unhealthy: z.ZodArray<z.ZodString>;
            checkedAt: z.ZodISODateTime;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
/** POST /backup/api/requests — ask for a snapshot (or a snapshot restore); a pending one for the same resource is reused. */
export declare const BackupDeviceRequestBodySchema: z.ZodObject<{
    resource: z.ZodOptional<z.ZodString>;
    kind: z.ZodEnum<{
        create: "create";
        "restore-snapshot": "restore-snapshot";
    }>;
    release: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const BackupDeviceRequestResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    ok: z.ZodLiteral<true>;
    action: z.ZodObject<{
        actionId: z.ZodString;
        kind: z.ZodEnum<{
            create: "create";
            "restore-snapshot": "restore-snapshot";
            "restore-backup": "restore-backup";
        }>;
        state: z.ZodEnum<{
            failed: "failed";
            ready: "ready";
            expired: "expired";
            running: "running";
            "awaiting-approval": "awaiting-approval";
        }>;
        release: z.ZodNullable<z.ZodString>;
        requestedAt: z.ZodISODateTime;
        updatedAt: z.ZodISODateTime;
        error: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    attachedToExisting: z.ZodBoolean;
}, z.core.$strict>, z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodString;
}, z.core.$strict>], "ok">;
export declare const backupDeviceRequestContract: {
    readonly method: "POST";
    readonly path: "/backup/api/requests";
    readonly authType: "device_signature";
    readonly bodySchema: z.ZodObject<{
        resource: z.ZodOptional<z.ZodString>;
        kind: z.ZodEnum<{
            create: "create";
            "restore-snapshot": "restore-snapshot";
        }>;
        release: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        ok: z.ZodLiteral<true>;
        action: z.ZodObject<{
            actionId: z.ZodString;
            kind: z.ZodEnum<{
                create: "create";
                "restore-snapshot": "restore-snapshot";
                "restore-backup": "restore-backup";
            }>;
            state: z.ZodEnum<{
                failed: "failed";
                ready: "ready";
                expired: "expired";
                running: "running";
                "awaiting-approval": "awaiting-approval";
            }>;
            release: z.ZodNullable<z.ZodString>;
            requestedAt: z.ZodISODateTime;
            updatedAt: z.ZodISODateTime;
            error: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        attachedToExisting: z.ZodBoolean;
    }, z.core.$strict>, z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodString;
    }, z.core.$strict>], "ok">;
};
/** POST /backup/api/verified — the release passed its post-deploy checks (enables a normal-severity next snapshot). */
export declare const BackupDeviceVerifiedBodySchema: z.ZodObject<{
    resource: z.ZodOptional<z.ZodString>;
    release: z.ZodString;
}, z.core.$strict>;
export declare const BackupDeviceVerifiedResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    ok: z.ZodLiteral<true>;
}, z.core.$strict>, z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodString;
}, z.core.$strict>], "ok">;
export declare const backupDeviceVerifiedContract: {
    readonly method: "POST";
    readonly path: "/backup/api/verified";
    readonly authType: "device_signature";
    readonly bodySchema: z.ZodObject<{
        resource: z.ZodOptional<z.ZodString>;
        release: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        ok: z.ZodLiteral<true>;
    }, z.core.$strict>, z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodString;
    }, z.core.$strict>], "ok">;
};
//# sourceMappingURL=index.d.ts.map