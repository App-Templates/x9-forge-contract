import { z } from 'zod';
import { PAPERCLIP_TOOLS } from "./tools.cjs";
/**
 * The closed list of the seven Paperclip processes company agents talk to each other with, and the one "Come si
 * comunica" section every agent profile carries. Agent-to-agent email does not exist in Paperclip: profiles import
 * this text instead of telling their own version. Sources are Paperclip 2026.1005.0 paths (relative to its root).
 */
export declare const PAPERCLIP_COMMUNICATION_CHANNELS: readonly ["assigned_issue", "child_issue_with_blockers", "child_result_by_closing", "addressed_question", "issue_comment", "scheduled_check", "task_watchdog"];
export declare const PaperclipCommunicationChannelSchema: z.ZodEnum<{
    assigned_issue: "assigned_issue";
    child_issue_with_blockers: "child_issue_with_blockers";
    child_result_by_closing: "child_result_by_closing";
    addressed_question: "addressed_question";
    issue_comment: "issue_comment";
    scheduled_check: "scheduled_check";
    task_watchdog: "task_watchdog";
}>;
export type PaperclipCommunicationChannel = z.infer<typeof PaperclipCommunicationChannelSchema>;
type PaperclipToolName = (typeof PAPERCLIP_TOOLS)[keyof typeof PAPERCLIP_TOOLS];
export declare const PAPERCLIP_CHANNEL_TOOLS: Record<PaperclipCommunicationChannel, readonly PaperclipToolName[]>;
/**
 * How files and proofs travel between agents: always inside the issue, never on a channel of our own. A path on the
 * agent's disk is not enough because reviewers cannot see it (Paperclip doc/AGENT-ARTIFACTS.md:3-6,59-65; skills/paperclip/
 * SKILL.md:201). The two ways are an attachment of the issue and a work product of the issue; the seven processes above
 * are untouched.
 */
export declare const PAPERCLIP_DELIVERY_CHANNELS: readonly ["attachment", "work_product"];
export declare const PaperclipDeliveryChannelSchema: z.ZodEnum<{
    attachment: "attachment";
    work_product: "work_product";
}>;
export type PaperclipDeliveryChannel = z.infer<typeof PaperclipDeliveryChannelSchema>;
/**
 * Who an agent turns to when it waits for something it cannot do itself. Paperclip's skill says a blocker is handled on
 * the agent's own task and a person is asked with a saved question, never by climbing the manager chain
 * (skills/paperclip/SKILL.md:601-602; references/api-reference.md:42). Our referent is not a Paperclip board user, so the
 * person is reached through Memoria's map and mail; the super-admin (Paperclip `instance_admin`) receives only what the
 * referent hands over. Additive: the seven processes above are untouched.
 */
export declare const PAPERCLIP_WAIT_RECIPIENTS: readonly ["agent", "person_or_repair", "infrastructure"];
export declare const PaperclipWaitRecipientSchema: z.ZodEnum<{
    agent: "agent";
    person_or_repair: "person_or_repair";
    infrastructure: "infrastructure";
}>;
export type PaperclipWaitRecipient = z.infer<typeof PaperclipWaitRecipientSchema>;
/** The section as lines: first person, plain Italian. Tool names are interpolated from PAPERCLIP_TOOLS only. */
export declare function communicationSectionLines(): readonly string[];
export declare function communicationSection(): string;
export {};
//# sourceMappingURL=communication-channels.d.ts.map