import { z } from 'zod';
/**
 * AgentEmailInbox — per-agent email inbox provisioned by Forge factory-svc
 * via AgentMail `inboxes.create({ username, domain })`.
 *
 * Matches the shape returned by `forge-v2/services/factory/src/services/
 * agentmail.service.ts:30,38` which produces `{ inboxId, email }` plus
 * provisioning metadata. Bridge typing makes the cross-repo handshake
 * (Forge factory → cap-email lookup) safe under R-14.
 *
 * The token / API key for sending via this inbox lives elsewhere (see
 * `agent-credentials.ts` `AGENTMAIL_API_KEY`) — this schema describes the
 * inbox identity only, never carries secret material (R-17).
 */
export declare const AgentEmailInboxSchema: z.ZodObject<{
    agent_id: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    provider_inbox_id: z.ZodString;
    address: z.ZodString;
    display_name: z.ZodNullable<z.ZodString>;
    created_at: z.ZodString;
}, z.core.$strip>;
export type AgentEmailInbox = z.infer<typeof AgentEmailInboxSchema>;
//# sourceMappingURL=agent-email-inbox.d.ts.map