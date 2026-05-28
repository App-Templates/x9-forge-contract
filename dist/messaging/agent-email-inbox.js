import { z } from 'zod';
import { AgentIdSchema } from "../agent/agent-identity.js";
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
export const AgentEmailInboxSchema = z.object({
    /** Branded agent id this inbox is bound to. */
    agent_id: AgentIdSchema,
    /**
     * AgentMail-internal inbox id (opaque string returned by `inboxes.create`).
     * Used as the primary key when cap-email forwards inbound webhooks back
     * upstream (envelope `to` field is the email address; inboxId is the
     * stable provider handle).
     */
    provider_inbox_id: z.string().min(1).max(200),
    /**
     * Full email address (`<username>@<domain>` — typically
     * `<slug>@agentmail.to` per Forge default; custom domains supported by
     * AgentMail for paid tiers).
     */
    address: z.string().email().max(320),
    /**
     * Display name surfaced to recipients (e.g. character name "Giovanni
     * Bellini"). null when AgentMail derives it from username.
     */
    display_name: z.string().min(1).max(200).nullable(),
    /** RFC-3339 timestamp of inbox creation in AgentMail. */
    created_at: z.string().datetime({ offset: true }),
});
//# sourceMappingURL=agent-email-inbox.js.map