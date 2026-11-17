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
/** The section as lines: first person, plain Italian. Tool names are interpolated from PAPERCLIP_TOOLS only. */
export declare function communicationSectionLines(): readonly string[];
export declare function communicationSection(): string;
export {};
//# sourceMappingURL=communication-channels.d.ts.map