import { z } from 'zod';
import { type AssetRef } from "../../organization/asset.cjs";
import type { CapabilityAgentScope } from "../capability-call-identity.cjs";
export declare const DEV_SESSION_MATERIAL_PATH: "/dev/materiali/:chiave";
export declare const DevSessionMaterialKeySchema: z.ZodString;
export declare const DevSessionMaterialLinkSchema: z.ZodObject<{
    assetId: z.ZodString;
    sha256: z.ZodString;
    sizeBytes: z.ZodNumber;
    url: z.ZodURL;
    expiresAt: z.ZodISODateTime;
}, z.core.$strict>;
export type DevSessionMaterialLink = z.infer<typeof DevSessionMaterialLinkSchema>;
/** Stable key for a memory asset within the complete agent scope. */
export declare function devSessionMaterialKey({ tenantId, ownerId, agentId, assetId, sha256 }: CapabilityAgentScope & Pick<AssetRef, 'assetId' | 'sha256'>): string;
/** UTF-8 message signed and verified by cap-dev; the bridge holds no signing key. */
export declare function devSessionMaterialSignedMessage({ chiave, sha256, expiresAt }: {
    chiave: string;
} & Pick<DevSessionMaterialLink, 'sha256' | 'expiresAt'>): string;
/** Independent section outside the assignment digest. */
export declare function renderDevSessionMaterialLinks(links: readonly DevSessionMaterialLink[]): string;
export type DevSessionMaterialLinksFailure = 'multiple' | 'malformed' | 'invalid_json' | 'invalid_links';
export declare function parseDevSessionMaterialLinks(body: string): {
    ok: true;
    links: DevSessionMaterialLink[];
} | {
    ok: false;
    reason: DevSessionMaterialLinksFailure;
};
//# sourceMappingURL=session-material-link.d.ts.map