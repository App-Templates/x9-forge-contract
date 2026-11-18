import { z } from 'zod';
/**
 * Native waits of the P6 «C» variant (PROTOCOLLO-PAPERCLIP-P6.md): what a task waits for is declared to Paperclip, never
 * kept by X9 (P-04, P-05, P-15). Additive: the existing tool inputs and PAPERCLIP_TOOLS are unchanged; a consumer exposes
 * these schemas only behind its own experimental flag.
 *
 * Paperclip 2026.1005.0 semantics these schemas follow:
 * - entering `blocked` needs unresolved blockers, a pending interaction/approval or an `unblockDescriptor`, and an agent
 *   may name only itself as the unblock owner (`routes/issues.ts` PATCH, 422/403);
 * - a parent that truly waits on a child models it with blockers, `parentId` alone is not a dependency
 *   (`doc/execution-semantics.md` «Blockers»); `POST /issues/:id/children` with `blockParentUntilDone` adds the blocker;
 * - an async external job owned by the assignee is a one-shot monitor (`executionPolicy.monitor.nextCheckAt`, notes up to
 *   500 characters, serviceName up to 120), consumed by an `issue_monitor_due` wake.
 * Paperclip monitors support timeoutAt, maxAttempts and recoveryPolicy (validators/issue.ts:390-430).
 * The bridge uses maxAttempts with wake_owner and bounds the first check to one week, equal to retryAfterSeconds.
 */
export declare const PAPERCLIP_NATIVE_WAIT_TOOLS: {
    readonly checkLater: "paperclip_check_later";
};
export declare const PAPERCLIP_CHECK_LATER_MAX_SECONDS = 604800;
export declare const PAPERCLIP_FOLLOW_UP_MAX_ATTEMPTS = 5;
/**
 * Paperclip wakes the owner at most `attempts` times in total: the count survives rearming
 * (server/src/services/issue-execution-policy.ts:221). After the last wake, rearming is refused and the owner acts.
 * A blocked wait cannot carry this field because a monitor never fires on a blocked issue.
 */
export declare const PaperclipFollowUpSchema: z.ZodObject<{
    attempts: z.ZodInt;
}, z.core.$strict>;
export type PaperclipFollowUp = z.infer<typeof PaperclipFollowUpSchema>;
/** The only monitor recovery policy the bridge uses; Paperclip supports three policies. */
export declare const PAPERCLIP_MONITOR_RECOVERY_POLICIES: readonly ["wake_owner"];
/** The single builder of the monitor bounds sent to Paperclip; existing checks remain unbounded. */
export declare function paperclipMonitorBounds(followUp: PaperclipFollowUp | undefined): {
    maxAttempts: number;
    recoveryPolicy: (typeof PAPERCLIP_MONITOR_RECOVERY_POLICIES)[number];
} | undefined;
/** Exact refusal text copied from Paperclip server/src/services/issue-execution-policy.ts:75. */
export declare const PAPERCLIP_MONITOR_EXHAUSTED_TEXT = "Monitor bounds are already exhausted";
/** Paperclip supplies no error code for this refusal: status and the exact trimmed text identify it. */
export declare function isPaperclipMonitorExhausted(httpStatus: number, text: string | null | undefined): boolean;
/** The single question of an «ask another agent» interaction and the limits of its texts (Paperclip answers it with free text). */
export declare const PAPERCLIP_ASK_QUESTION_ID = "detail";
export declare const PAPERCLIP_ASK_QUESTION_MAX = 2000;
export declare const PAPERCLIP_ANSWER_MAX = 4000;
/** The wake reason Paperclip gives the addressee of a pending interaction (`routes/issues.ts`). */
export declare const PAPERCLIP_INTERACTION_PENDING_WAKE = "interaction_pending";
/**
 * What a wait expects, declared with the identifiers the tools returned (`email_request_decision` gives `requestId`,
 * `research_start` gives `researchId`): the link is data, never an id written inside the free text of `action` or `notes`.
 */
export declare const PAPERCLIP_WAIT_REF_KINDS: readonly ["decision", "research"];
export declare const PaperclipWaitRefSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"decision">;
    requestId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"research">;
    researchId: z.ZodString;
}, z.core.$strict>], "kind">;
export type PaperclipWaitRef = z.infer<typeof PaperclipWaitRefSchema>;
/** The only key by which references are compared: `decision:<requestId>` or `research:<researchId>`. */
export declare function paperclipWaitRefKey(ref: PaperclipWaitRef): string;
export declare const PaperclipWaitsOnSchema: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"decision">;
    requestId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"research">;
    researchId: z.ZodString;
}, z.core.$strict>], "kind">>;
/**
 * Who unblocks a wait, declared by the agent with fixed words (the free text of `action` is never read to decide):
 * - `self`: an action of the agent itself;
 * - `external`: a contact or event outside the company's agents; the answer wakes the agent, which stays the owner;
 * - `company_agent`: another agent of the company, which Paperclip refuses (an agent names only itself, 403) and
 *   which is not awaited with this tool.
 */
export declare const PAPERCLIP_WAIT_UNBLOCKERS: readonly ["self", "external", "company_agent"];
export declare const PaperclipWaitUnblockerSchema: z.ZodEnum<{
    external: "external";
    self: "self";
    company_agent: "company_agent";
}>;
export type PaperclipWaitUnblocker = z.infer<typeof PaperclipWaitUnblockerSchema>;
/** The concrete action that unblocks the task, owned by the calling agent itself (Paperclip: agents name only themselves). */
export declare const PaperclipWaitingForSchema: z.ZodObject<{
    action: z.ZodString;
    unblockedBy: z.ZodEnum<{
        external: "external";
        self: "self";
        company_agent: "company_agent";
    }>;
    waitsOn: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"decision">;
        requestId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"research">;
        researchId: z.ZodString;
    }, z.core.$strict>], "kind">>>;
}, z.core.$strict>;
/** Closed list of the refusals of a wait declaration; the name is both the reason and the log code. */
export declare const PAPERCLIP_WAIT_REFUSALS: readonly ["wait_for_company_agent"];
export type PaperclipWaitRefusal = (typeof PAPERCLIP_WAIT_REFUSALS)[number];
export type PaperclipUnblockDescriptorResult = {
    ok: true;
    descriptor: {
        owner: {
            agentId: string;
        };
        action: string;
    };
} | {
    ok: false;
    refusal: PaperclipWaitRefusal;
};
/**
 * The `unblockDescriptor` Paperclip stores (strict: only `owner` and `action`; the declaration stays in the call).
 * The refusal comes from the declared `unblockedBy`, never from `action`.
 */
export declare function paperclipUnblockDescriptor(waitingFor: PaperclipWaitingFor, agentId: string): PaperclipUnblockDescriptorResult;
/** One-shot check of an async job the agent owns: Paperclip wakes it (issue_monitor_due) after afterSeconds. */
export declare const PaperclipCheckLaterSchema: z.ZodObject<{
    afterSeconds: z.ZodNumber;
    notes: z.ZodString;
    serviceName: z.ZodOptional<z.ZodString>;
    waitsOn: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"decision">;
        requestId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"research">;
        researchId: z.ZodString;
    }, z.core.$strict>], "kind">>>;
    followUp: z.ZodOptional<z.ZodObject<{
        attempts: z.ZodInt;
    }, z.core.$strict>>;
}, z.core.$strict>;
/** A decision asked of another agent (resolved from `roleRef` by the consumer): Paperclip interaction + task in_review. */
export declare const PaperclipAskSchema: z.ZodObject<{
    roleRef: z.ZodString;
    question: z.ZodString;
}, z.core.$strict>;
export declare const PaperclipNativeReviewInputSchema: z.ZodObject<{
    issueId: z.ZodUUID;
    comment: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<{
        done: "done";
        blocked: "blocked";
        in_progress: "in_progress";
        in_review: "in_review";
    }>;
    blockedByIssueIds: z.ZodOptional<z.ZodArray<z.ZodUUID>>;
    waitingFor: z.ZodOptional<z.ZodObject<{
        action: z.ZodString;
        unblockedBy: z.ZodEnum<{
            external: "external";
            self: "self";
            company_agent: "company_agent";
        }>;
        waitsOn: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"decision">;
            requestId: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"research">;
            researchId: z.ZodString;
        }, z.core.$strict>], "kind">>>;
    }, z.core.$strict>>;
    checkLater: z.ZodOptional<z.ZodObject<{
        afterSeconds: z.ZodNumber;
        notes: z.ZodString;
        serviceName: z.ZodOptional<z.ZodString>;
        waitsOn: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"decision">;
            requestId: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"research">;
            researchId: z.ZodString;
        }, z.core.$strict>], "kind">>>;
        followUp: z.ZodOptional<z.ZodObject<{
            attempts: z.ZodInt;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    ask: z.ZodOptional<z.ZodObject<{
        roleRef: z.ZodString;
        question: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
/** `paperclip_create_issue` that also declares the wait: the parent stays blocked until this child is done. */
export declare const PaperclipNativeCreateIssueInputSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    assigneeRoleRef: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodUUID>;
    goalId: z.ZodOptional<z.ZodUUID>;
    parentIssueId: z.ZodOptional<z.ZodUUID>;
    blockedByIssueIds: z.ZodOptional<z.ZodArray<z.ZodUUID>>;
    waitForChild: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
/** `paperclip_assign` that can also answer a question another agent put to the assignee (the comment is the answer). */
export declare const PaperclipNativeAssignInputSchema: z.ZodObject<{
    issueId: z.ZodUUID;
    roleRef: z.ZodString;
    comment: z.ZodOptional<z.ZodString>;
    answersInteractionId: z.ZodOptional<z.ZodUUID>;
}, z.core.$strict>;
export declare const PaperclipNativeAssignRefInputSchema: z.ZodObject<{
    roleRef: z.ZodString;
    comment: z.ZodOptional<z.ZodString>;
    issueId: z.ZodUnion<readonly [z.ZodUUID, z.ZodString]>;
    answersInteractionId: z.ZodOptional<z.ZodUUID>;
}, z.core.$strict>;
/** Creation body of `POST /issues/:id/interactions` (kind ask_user_questions) with an addressee and no resolverPolicy. */
export declare const PaperclipAskInteractionBodySchema: z.ZodObject<{
    kind: z.ZodLiteral<"ask_user_questions">;
    idempotencyKey: z.ZodString;
    addresseeAgentId: z.ZodUUID;
    continuationPolicy: z.ZodLiteral<"wake_assignee">;
    payload: z.ZodObject<{
        version: z.ZodLiteral<1>;
        questionSet: z.ZodObject<{
            schema: z.ZodLiteral<"paperclip.question_set.v1">;
            questions: z.ZodTuple<[z.ZodObject<{
                id: z.ZodLiteral<"detail">;
                prompt: z.ZodString;
                answerMode: z.ZodLiteral<"text">;
                required: z.ZodLiteral<true>;
            }, z.core.$strict>], null>;
        }, z.core.$strict>;
        questions: z.ZodTuple<[z.ZodObject<{
            id: z.ZodLiteral<"detail">;
            prompt: z.ZodString;
            selectionMode: z.ZodLiteral<"single">;
            required: z.ZodLiteral<true>;
            options: z.ZodTuple<[z.ZodObject<{
                id: z.ZodLiteral<"text">;
                label: z.ZodString;
                freeText: z.ZodLiteral<true>;
            }, z.core.$strict>], null>;
        }, z.core.$strict>], null>;
    }, z.core.$strict>;
}, z.core.$strict>;
/** Body of `POST /issues/:id/interactions/:interactionId/respond` for that question: free text, no option. */
export declare const PaperclipAnswerInteractionBodySchema: z.ZodObject<{
    answers: z.ZodTuple<[z.ZodObject<{
        questionId: z.ZodLiteral<"detail">;
        optionIds: z.ZodTuple<[], null>;
        otherText: z.ZodString;
    }, z.core.$strict>], null>;
}, z.core.$strict>;
/** `ask:<issueId>:<callId>`, at most 255 characters (throws beyond). */
export declare function paperclipAskIdempotencyKey(issueId: string, callId: string): string;
export declare function paperclipAskInteractionBody(input: {
    question: string;
    addresseeAgentId: string;
    idempotencyKey: string;
}): PaperclipAskInteractionBody;
export declare function paperclipAnswerInteractionBody(text: string): PaperclipAnswerInteractionBody;
/**
 * Closed vocabularies of the Paperclip interactions (cards in the issue thread). Source: Paperclip
 * packages/shared/src/constants.ts:259-267 (kinds), 269-294 (resolver policies), 331-348 (statuses, continuation policies) and
 * packages/shared/src/validators/issue.ts:1223-1227, 1448-1459, 1699-1711, 1866-1876 (outcomes). A value Paperclip adds later
 * fails a read here, loudly, instead of being read as something else.
 */
export declare const PAPERCLIP_INTERACTION_KINDS: readonly ["suggest_tasks", "ask_user_questions", "request_confirmation", "request_checkbox_confirmation", "request_item_verdicts", "connection_intent"];
/** The five kinds `POST /issues/:id/interactions` creates: `connection_intent` is made by the server only (validators/issue.ts:1944-2010). */
export declare const PAPERCLIP_INTERACTION_CREATABLE_KINDS: readonly ["suggest_tasks", "ask_user_questions", "request_confirmation", "request_checkbox_confirmation", "request_item_verdicts"];
export declare const PAPERCLIP_INTERACTION_STATUSES: readonly ["pending", "accepted", "rejected", "answered", "cancelled", "expired", "failed"];
export declare const PAPERCLIP_CONTINUATION_POLICIES: readonly ["none", "wake_assignee", "wake_assignee_on_accept"];
/** Who may resolve a card. `anyone` is the default (the creating run included); `human_only` keeps agents out. */
export declare const PAPERCLIP_RESOLVER_POLICIES: readonly ["anyone", "not_creator", "human_only"];
/** Write-compatible aliases of one migration window (constants.ts:277-285): read them, never write them. */
export declare const PAPERCLIP_RESOLVER_POLICY_ALIASES: readonly ["board_or_agents", "board_only"];
export declare const PAPERCLIP_QUESTION_OUTCOMES: readonly ["skipped", "withdrawn", "issue_closed", "addressee_deleted"];
export declare const PAPERCLIP_QUESTION_EXPIRATION_REASONS: readonly ["superseded_by_comment", "superseded_by_newer_interaction"];
export declare const PAPERCLIP_CONFIRMATION_OUTCOMES: readonly ["accepted", "rejected", "superseded_by_comment", "superseded_by_newer_request", "stale_target", "skipped", "withdrawn", "issue_closed", "addressee_deleted"];
export declare const PaperclipInteractionKindSchema: z.ZodEnum<{
    request_confirmation: "request_confirmation";
    ask_user_questions: "ask_user_questions";
    suggest_tasks: "suggest_tasks";
    request_checkbox_confirmation: "request_checkbox_confirmation";
    request_item_verdicts: "request_item_verdicts";
    connection_intent: "connection_intent";
}>;
export declare const PaperclipInteractionStatusSchema: z.ZodEnum<{
    failed: "failed";
    cancelled: "cancelled";
    pending: "pending";
    expired: "expired";
    rejected: "rejected";
    accepted: "accepted";
    answered: "answered";
}>;
export declare const PaperclipContinuationPolicySchema: z.ZodEnum<{
    none: "none";
    wake_assignee: "wake_assignee";
    wake_assignee_on_accept: "wake_assignee_on_accept";
}>;
export declare const PaperclipResolverPolicySchema: z.ZodEnum<{
    anyone: "anyone";
    not_creator: "not_creator";
    human_only: "human_only";
}>;
export declare const PaperclipResolverPolicyReadSchema: z.ZodEnum<{
    anyone: "anyone";
    not_creator: "not_creator";
    human_only: "human_only";
    board_or_agents: "board_or_agents";
    board_only: "board_only";
}>;
/** Paperclip normalizes the two aliases (constants.ts:296-302); the ponte does the same when it reads a card. */
export declare function paperclipNormalizeResolverPolicy(policy: z.infer<typeof PaperclipResolverPolicyReadSchema>): z.infer<typeof PaperclipResolverPolicySchema>;
/** A card as Paperclip returns it, read tolerantly: the kind and the status are closed, the rest passes. */
export declare const PaperclipInteractionReadSchema: z.ZodObject<{
    id: z.ZodGUID;
    kind: z.ZodEnum<{
        request_confirmation: "request_confirmation";
        ask_user_questions: "ask_user_questions";
        suggest_tasks: "suggest_tasks";
        request_checkbox_confirmation: "request_checkbox_confirmation";
        request_item_verdicts: "request_item_verdicts";
        connection_intent: "connection_intent";
    }>;
    status: z.ZodEnum<{
        failed: "failed";
        cancelled: "cancelled";
        pending: "pending";
        expired: "expired";
        rejected: "rejected";
        accepted: "accepted";
        answered: "answered";
    }>;
    addresseeAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
}, z.core.$loose>;
export declare const PaperclipQuestionResultSchema: z.ZodObject<{
    outcome: z.ZodOptional<z.ZodEnum<{
        skipped: "skipped";
        withdrawn: "withdrawn";
        issue_closed: "issue_closed";
        addressee_deleted: "addressee_deleted";
    }>>;
    expirationReason: z.ZodOptional<z.ZodEnum<{
        superseded_by_comment: "superseded_by_comment";
        superseded_by_newer_interaction: "superseded_by_newer_interaction";
    }>>;
}, z.core.$loose>;
export declare const PaperclipConfirmationResultSchema: z.ZodObject<{
    outcome: z.ZodEnum<{
        rejected: "rejected";
        accepted: "accepted";
        skipped: "skipped";
        withdrawn: "withdrawn";
        issue_closed: "issue_closed";
        addressee_deleted: "addressee_deleted";
        superseded_by_comment: "superseded_by_comment";
        superseded_by_newer_request: "superseded_by_newer_request";
        stale_target: "stale_target";
    }>;
}, z.core.$loose>;
/**
 * Where the question card of the bridge is narrower than Paperclip's `ask_user_questions` (validators/issue.ts:1251, 1270, 1371, 1390),
 * declared: one free-text question per card, and a prompt of at most 2000 characters where Paperclip takes 4000 (the bridge asks one thing at a time).
 */
export declare const PAPERCLIP_ASK_DECLARED_CHOICES: {
    readonly questionsPerCard: {
        readonly ours: 1;
        readonly paperclip: 64;
    };
    readonly promptMax: {
        readonly ours: 2000;
        readonly paperclip: 4000;
    };
};
/**
 * Who a question is put to, with the recipient as an id: `agent` (the card is addressed to that agent, Paperclip wakes it with
 * `interaction_pending`, no `resolverPolicy`: SKILL.md:169,602) or `person` (a human answers: `resolverPolicy: human_only`, nobody is
 * named, the card stays open to the eligible humans; `addresseeUserId` is not offered because the stack has no exact Paperclip user id,
 * api-reference.md:927-928). `PaperclipAskSchema.roleRef` is deprecated.
 */
export declare const PAPERCLIP_ASK_TARGETS: readonly ["agent", "person"];
export declare const PaperclipAddressedAskSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    to: z.ZodLiteral<"agent">;
    addresseeAgentId: z.ZodGUID;
    question: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    to: z.ZodLiteral<"person">;
    question: z.ZodString;
}, z.core.$strict>], "to">;
export type PaperclipAddressedAsk = z.infer<typeof PaperclipAddressedAskSchema>;
/** `paperclip_review` that asks an agent or a person with the recipient as an id; same waits and same checks as the native review. */
export declare const PaperclipNativeReviewAddressedInputSchema: z.ZodObject<{
    issueId: z.ZodUUID;
    comment: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<{
        done: "done";
        blocked: "blocked";
        in_progress: "in_progress";
        in_review: "in_review";
    }>;
    blockedByIssueIds: z.ZodOptional<z.ZodArray<z.ZodUUID>>;
    waitingFor: z.ZodOptional<z.ZodObject<{
        action: z.ZodString;
        unblockedBy: z.ZodEnum<{
            external: "external";
            self: "self";
            company_agent: "company_agent";
        }>;
        waitsOn: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"decision">;
            requestId: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"research">;
            researchId: z.ZodString;
        }, z.core.$strict>], "kind">>>;
    }, z.core.$strict>>;
    checkLater: z.ZodOptional<z.ZodObject<{
        afterSeconds: z.ZodNumber;
        notes: z.ZodString;
        serviceName: z.ZodOptional<z.ZodString>;
        waitsOn: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"decision">;
            requestId: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"research">;
            researchId: z.ZodString;
        }, z.core.$strict>], "kind">>>;
        followUp: z.ZodOptional<z.ZodObject<{
            attempts: z.ZodInt;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    ask: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        to: z.ZodLiteral<"agent">;
        addresseeAgentId: z.ZodGUID;
        question: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        to: z.ZodLiteral<"person">;
        question: z.ZodString;
    }, z.core.$strict>], "to">>;
}, z.core.$strict>;
/** `paperclip_assign` by id that can also answer a question put to the assignee. */
export declare const PaperclipNativeAssignAgentInputSchema: z.ZodObject<{
    issueId: z.ZodUUID;
    assigneeAgentId: z.ZodGUID;
    comment: z.ZodOptional<z.ZodString>;
    answersInteractionId: z.ZodOptional<z.ZodUUID>;
}, z.core.$strict>;
export declare const PaperclipNativeAssignAgentRefInputSchema: z.ZodObject<{
    assigneeAgentId: z.ZodGUID;
    comment: z.ZodOptional<z.ZodString>;
    issueId: z.ZodUnion<readonly [z.ZodUUID, z.ZodString]>;
    answersInteractionId: z.ZodOptional<z.ZodUUID>;
}, z.core.$strict>;
/** `paperclip_create_issue` by id that also declares the wait: the parent stays blocked until the child is done. */
export declare const PaperclipNativeCreateIssueAgentInputSchema: z.ZodObject<{
    description: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    projectId: z.ZodOptional<z.ZodUUID>;
    goalId: z.ZodOptional<z.ZodUUID>;
    parentIssueId: z.ZodOptional<z.ZodUUID>;
    blockedByIssueIds: z.ZodOptional<z.ZodArray<z.ZodUUID>>;
    assigneeAgentId: z.ZodOptional<z.ZodGUID>;
    waitForChild: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
/** Paperclip refuses an interaction an agent addresses to itself (422, services/issue-thread-interactions.ts:3384-3388). */
export declare const PAPERCLIP_ASK_REFUSALS: readonly ["ask_to_self"];
export type PaperclipAskRefusal = (typeof PAPERCLIP_ASK_REFUSALS)[number];
export declare function decidePaperclipAsk(selfAgentId: string, ask: PaperclipAddressedAsk): {
    ok: true;
} | {
    ok: false;
    refusal: PaperclipAskRefusal;
};
/**
 * Creation body of `POST /issues/:id/interactions` (kind ask_user_questions) for a PERSON: `resolverPolicy: human_only`,
 * `continuationPolicy: wake_assignee`, no addressee (api-reference.md:994-1002). The task then goes `in_review`, unchanged assignee,
 * after the card is verified `pending`; never a blocker with owner `user` or `board`.
 */
export declare const PaperclipAskPersonInteractionBodySchema: z.ZodObject<{
    kind: z.ZodLiteral<"ask_user_questions">;
    idempotencyKey: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    resolverPolicy: z.ZodLiteral<"human_only">;
    continuationPolicy: z.ZodLiteral<"wake_assignee">;
    payload: z.ZodObject<{
        version: z.ZodLiteral<1>;
        questionSet: z.ZodObject<{
            schema: z.ZodLiteral<"paperclip.question_set.v1">;
            questions: z.ZodTuple<[z.ZodObject<{
                id: z.ZodLiteral<"detail">;
                prompt: z.ZodString;
                answerMode: z.ZodLiteral<"text">;
                required: z.ZodLiteral<true>;
            }, z.core.$strict>], null>;
        }, z.core.$strict>;
        questions: z.ZodTuple<[z.ZodObject<{
            id: z.ZodLiteral<"detail">;
            prompt: z.ZodString;
            selectionMode: z.ZodLiteral<"single">;
            required: z.ZodLiteral<true>;
            options: z.ZodTuple<[z.ZodObject<{
                id: z.ZodLiteral<"text">;
                label: z.ZodString;
                freeText: z.ZodLiteral<true>;
            }, z.core.$strict>], null>;
        }, z.core.$strict>], null>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type PaperclipAskPersonInteractionBody = z.infer<typeof PaperclipAskPersonInteractionBodySchema>;
/** `ask-person:<issueId>:<callId>`, at most 255 characters (throws beyond). */
export declare function paperclipAskPersonIdempotencyKey(issueId: string, callId: string): string;
export declare function paperclipAskPersonInteractionBody(input: {
    question: string;
    idempotencyKey: string;
    title?: string;
}): PaperclipAskPersonInteractionBody;
/**
 * The plan confirmation with the two policies Paperclip lets the creator choose. The default stays what it is today (no field:
 * `continuationPolicy: none`, `resolverPolicy: anyone`); `wake_assignee_on_accept` makes Paperclip wake the assignee when the
 * plan is accepted, which today nothing does (routes/issues.ts:2595-2602). Choosing it is an adoption decision, not made here.
 */
export declare const PaperclipConfermaConPoliticheCorpoSchema: z.ZodObject<{
    kind: z.ZodLiteral<"request_confirmation">;
    payload: z.ZodObject<{
        version: z.ZodLiteral<1>;
        prompt: z.ZodString;
        target: z.ZodObject<{
            type: z.ZodLiteral<"issue_document">;
            key: z.ZodLiteral<"plan">;
            revisionId: z.ZodGUID;
        }, z.core.$strict>;
    }, z.core.$strict>;
    resolverPolicy: z.ZodOptional<z.ZodEnum<{
        anyone: "anyone";
        not_creator: "not_creator";
        human_only: "human_only";
    }>>;
    continuationPolicy: z.ZodOptional<z.ZodEnum<{
        none: "none";
        wake_assignee: "wake_assignee";
        wake_assignee_on_accept: "wake_assignee_on_accept";
    }>>;
}, z.core.$strict>;
export type PaperclipConfermaConPoliticheCorpo = z.infer<typeof PaperclipConfermaConPoliticheCorpoSchema>;
/** One-shot Paperclip monitor on a task the agent owns, for an async job it will check later (no recurring interval). */
export declare const PaperclipCheckLaterInputSchema: z.ZodObject<{
    issueId: z.ZodUUID;
    afterSeconds: z.ZodNumber;
    notes: z.ZodString;
    serviceName: z.ZodOptional<z.ZodString>;
    waitsOn: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"decision">;
        requestId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"research">;
        researchId: z.ZodString;
    }, z.core.$strict>], "kind">>>;
    followUp: z.ZodOptional<z.ZodObject<{
        attempts: z.ZodInt;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const PaperclipCheckLaterOutputSchema: z.ZodObject<{
    issue: z.ZodObject<{
        id: z.ZodUUID;
        companyId: z.ZodUUID;
        identifier: z.ZodString;
        title: z.ZodString;
        description: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<{
            cancelled: "cancelled";
            done: "done";
            blocked: "blocked";
            backlog: "backlog";
            todo: "todo";
            in_progress: "in_progress";
            in_review: "in_review";
        }>;
        assigneeAgentId: z.ZodNullable<z.ZodUUID>;
        projectId: z.ZodOptional<z.ZodNullable<z.ZodUUID>>;
        goalId: z.ZodOptional<z.ZodNullable<z.ZodUUID>>;
    }, z.core.$strict>;
    nextCheckAt: z.ZodISODateTime;
}, z.core.$strict>;
export type PaperclipAsk = z.infer<typeof PaperclipAskSchema>;
export type PaperclipNativeAssignInput = z.infer<typeof PaperclipNativeAssignInputSchema>;
export type PaperclipNativeAssignRefInput = z.infer<typeof PaperclipNativeAssignRefInputSchema>;
export type PaperclipAskInteractionBody = z.infer<typeof PaperclipAskInteractionBodySchema>;
export type PaperclipAnswerInteractionBody = z.infer<typeof PaperclipAnswerInteractionBodySchema>;
export type PaperclipWaitingFor = z.infer<typeof PaperclipWaitingForSchema>;
export type PaperclipCheckLater = z.infer<typeof PaperclipCheckLaterSchema>;
export type PaperclipNativeReviewInput = z.infer<typeof PaperclipNativeReviewInputSchema>;
export type PaperclipNativeCreateIssueInput = z.infer<typeof PaperclipNativeCreateIssueInputSchema>;
export type PaperclipCheckLaterInput = z.infer<typeof PaperclipCheckLaterInputSchema>;
export type PaperclipCheckLaterOutput = z.infer<typeof PaperclipCheckLaterOutputSchema>;
//# sourceMappingURL=native-wait.d.ts.map