import { z } from 'zod';
/**
 * Agent scope and action policy (R5 / D-A1 / D-A9 point 4, v1.31.0) — enforced by the runtime, not only by prompts.
 *
 * - Per capability and per tool: allow / ask / deny, read distinct from write. Precedence: tool rule > capability
 *   rule > defaults.
 * - `defaultWebSearch`: the model's native web search is on by default for a normal agent.
 * - `scopeLimited`: the agent only does its purpose; every default is deny, so only explicit rules open a capability.
 * - `ask` suspends the action until an authenticated human decides, bound to agent/person/operation/policy version
 *   with an expiry (`PolicyApprovalSchema`). Model text or tool output is never an approval.
 * - Every action leaves a log event without payloads or secrets (`AgentActionLogEventSchema`).
 */
export declare const PolicyDecisionSchema: z.ZodEnum<{
    allow: "allow";
    ask: "ask";
    deny: "deny";
}>;
export type PolicyDecision = z.infer<typeof PolicyDecisionSchema>;
export declare const PolicyAccessSchema: z.ZodEnum<{
    read: "read";
    write: "write";
}>;
export type PolicyAccess = z.infer<typeof PolicyAccessSchema>;
export declare const PolicyAccessDecisionsSchema: z.ZodObject<{
    read: z.ZodEnum<{
        allow: "allow";
        ask: "ask";
        deny: "deny";
    }>;
    write: z.ZodEnum<{
        allow: "allow";
        ask: "ask";
        deny: "deny";
    }>;
}, z.core.$strict>;
export type PolicyAccessDecisions = z.infer<typeof PolicyAccessDecisionsSchema>;
/** Without `tool`: the whole capability. With `tool`: that tool only (overrides the capability rule). */
export declare const AgentPolicyRuleSchema: z.ZodObject<{
    capability: z.ZodString;
    tool: z.ZodOptional<z.ZodString>;
    read: z.ZodEnum<{
        allow: "allow";
        ask: "ask";
        deny: "deny";
    }>;
    write: z.ZodEnum<{
        allow: "allow";
        ask: "ask";
        deny: "deny";
    }>;
}, z.core.$strict>;
export type AgentPolicyRule = z.infer<typeof AgentPolicyRuleSchema>;
export declare const AgentScopePolicySchema: z.ZodObject<{
    version: z.ZodNumber;
    defaultWebSearch: z.ZodBoolean;
    scopeLimited: z.ZodBoolean;
    purpose: z.ZodOptional<z.ZodString>;
    defaults: z.ZodObject<{
        read: z.ZodEnum<{
            allow: "allow";
            ask: "ask";
            deny: "deny";
        }>;
        write: z.ZodEnum<{
            allow: "allow";
            ask: "ask";
            deny: "deny";
        }>;
    }, z.core.$strict>;
    rules: z.ZodArray<z.ZodObject<{
        capability: z.ZodString;
        tool: z.ZodOptional<z.ZodString>;
        read: z.ZodEnum<{
            allow: "allow";
            ask: "ask";
            deny: "deny";
        }>;
        write: z.ZodEnum<{
            allow: "allow";
            ask: "ask";
            deny: "deny";
        }>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type AgentScopePolicy = z.infer<typeof AgentScopePolicySchema>;
export interface PolicyRequest {
    readonly capability: string;
    readonly tool?: string;
    readonly access: PolicyAccess;
}
/** Decision for one operation: tool rule > capability rule > defaults. */
export declare function resolvePolicyDecision(policy: AgentScopePolicy, request: PolicyRequest): PolicyDecision;
export declare const PolicyApprovalStatusSchema: z.ZodEnum<{
    pending: "pending";
    approved: "approved";
    rejected: "rejected";
    expired: "expired";
    revoked: "revoked";
}>;
export type PolicyApprovalStatus = z.infer<typeof PolicyApprovalStatusSchema>;
export declare const PolicyApprovalSchema: z.ZodObject<{
    approvalId: z.ZodString;
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        userId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    capability: z.ZodString;
    tool: z.ZodString;
    access: z.ZodEnum<{
        read: "read";
        write: "write";
    }>;
    policyVersion: z.ZodNumber;
    requestedAt: z.ZodISODateTime;
    expiresAt: z.ZodISODateTime;
    status: z.ZodEnum<{
        pending: "pending";
        approved: "approved";
        rejected: "rejected";
        expired: "expired";
        revoked: "revoked";
    }>;
    decidedBy: z.ZodOptional<z.ZodString>;
    decidedAt: z.ZodOptional<z.ZodISODateTime>;
}, z.core.$strict>;
export type PolicyApproval = z.infer<typeof PolicyApprovalSchema>;
export declare const AgentActionOutcomeSchema: z.ZodEnum<{
    failed: "failed";
    expired: "expired";
    executed: "executed";
    denied: "denied";
    "pending-approval": "pending-approval";
}>;
export type AgentActionOutcome = z.infer<typeof AgentActionOutcomeSchema>;
/** Who originated the action; `external-content` marks untrusted data (web, documents, provider output). */
export declare const AgentActionProvenanceSchema: z.ZodEnum<{
    model: "model";
    system: "system";
    user: "user";
    callback: "callback";
    "external-content": "external-content";
}>;
export type AgentActionProvenance = z.infer<typeof AgentActionProvenanceSchema>;
/** Registry of every action: decision, outcome, provenance — never input/output payloads or secrets. */
export declare const AgentActionLogEventSchema: z.ZodObject<{
    eventId: z.ZodString;
    occurredAt: z.ZodISODateTime;
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        userId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    capability: z.ZodString;
    tool: z.ZodString;
    access: z.ZodEnum<{
        read: "read";
        write: "write";
    }>;
    decision: z.ZodEnum<{
        allow: "allow";
        ask: "ask";
        deny: "deny";
    }>;
    outcome: z.ZodEnum<{
        failed: "failed";
        expired: "expired";
        executed: "executed";
        denied: "denied";
        "pending-approval": "pending-approval";
    }>;
    policyVersion: z.ZodNumber;
    provenance: z.ZodEnum<{
        model: "model";
        system: "system";
        user: "user";
        callback: "callback";
        "external-content": "external-content";
    }>;
    channel: z.ZodOptional<z.ZodUnion<[z.ZodEnum<{
        email: "email";
        telegram: "telegram";
        voice: "voice";
        whatsapp: "whatsapp";
    }>, z.ZodLiteral<"web">]>>;
    approvalId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type AgentActionLogEvent = z.infer<typeof AgentActionLogEventSchema>;
//# sourceMappingURL=agent-scope-policy.d.ts.map