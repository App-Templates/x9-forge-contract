# Paperclip authority discovery — phase 60, task 1

Status: SOURCE_DESIGN_VERIFIED=false; IMPLEMENTATION_QUALIFIED=false.
Source discovery is complete for native APIs; the X9 host admission path remains absent. No product contract for an unverified run producer has been implemented. No native API calls, secret reads, provisioning, VPS operations or model/provider calls were performed.

## Version evidence

Native published packages @paperclipai/server and @paperclipai/shared are pinned at2026.1005.0 in A161. The package metadata does not include gitHead: the previously reported upstream commit467125f is not independently verified by this discovery. Exact source bytes, complete A commit IDs and SHA256 are in60-SOURCE-MANIFEST.json. The bridge base is origin/main after PR30 (b22032d). A source commits are read via git show, not adopted from mutable worktree files.

C independently approved A bootstrap61da2a9 and handshake8c7b6fb in filiera-codex-163-1/c-rilascio/reviews/a-bootstrap-handshake/REVIEW.md. C also approved prior holder7cb3f76 separately. Those are A/C local evidence, not fresh D tests, host→X9 admission proof or VPS qualification. A181150 and E181450 independently confirm the missing session→run producer.

## Provisioning source

A61da2a9 provision.mjs uses native createCompanySchema/createAgentSchema/createGoalSchema and native POST companies and companies/:companyId/agents responses. The emitted company/agent IDs are server-owned. The helper specifically creates seven coding identities and one spokesperson; it is not a generic Forge installer. BOOTSTRAP-VPS.md explicitly says all eight process identities are dormant and no native endpoint invokes X9 yet. Do not run this helper as a new capability installation flow.

The native agent route checks create permissions and native company approval policy. A board/operator key is needed for provisioning; the per-agent API key loaded by Forge is not a board substitute. Native permissions remain authoritative even with a valid canonical binding.

### Proposed binding design (local implementation remains pending)

D02 owns an operator-controlled, non-secret inventory and per-agent desired/applied store in cap-paperclip. Reuse D7's bounded operator binding file and canonical PaperclipAgentBindingSchema. Inventory records link the trusted Forge scope, unitId, callerRoleRef and native company/agent/target IDs to a provisioningRevision and source provenance. The operator takes native IDs from the verified provisioning result; they are never entered as browser authority, parsed from a slug or inferred from metadata. Forge identity comes from the existing server writer/context scope. Both sources must be checked at installation.

The owner selects ordinary unitId/roleRef only. D02 resolves that pair under the trusted scope to one inventory entry; ambiguous, absent, disabled or differently scoped entries fail closed. Native /agents/me using this agent's loaded key must match the resolved company/agent before any native operation. roleAgents remains a target allowlist, never the caller role. Mapping/inventory changes raise provisioningRevision and require installation/readback; a desired configuration PUT does not install it.

Storage mutations use a per-agent serialized transaction with proposed config version strictly greater than current, persistent atomic replacement and restart readback. Old/equal versions return409; the Zod version primitive alone does not implement CAS. Do not introduce a second Vault resolver, secret counter or freshness guarantee before reload.

## Role inventory source

Published shared/dist/constants.js defines native AGENT_ROLES (ceo,cto,cmo,cfo,security,engineer,designer,pm,qa,devops,researcher,general); createAgentSchema consumes that enum. Native GET company agents provides native identities/roles. A metadata unitKey/agentKey supplies idempotency markers only. Native role, Forge callerRoleRef and roleAgents target allowlist are distinct. Custom Forge roleRef authorization must come from the operator-controlled scope inventory above, with exact native identities, not model text or a native display name.

## Run source

A8c7b6fb native-run-holder.mjs executes as the native process adapter. Native process environment supplies runId/companyId/agentId/key. The helper verifies /agents/me, GET heartbeat-runs/:runId and assigned issue identity/status, then emits exactly one stdout receipt with kind filiera.worker-binding, schemaVersion1, runId,issueId,nonce,capturedAt,deadlineAt. The native JSONL log, read through GET heartbeat-runs/:runId/log and reconstructed with bounded chunk handling, preserves that receipt.

Native agents.js GET /agents/me authenticates agent identity; GET heartbeat-runs/:runId grants telemetry access but is not an own-run-only proof. Consumers must compare run.agentId/companyId/contextSnapshot.issueId and current issue company/assignee explicitly. A valid UUID, sessionId, native log access, current wakeReason or nonce alone cannot prove ownership. /agents/:id/wakeup checks an agent can wake only itself; heartbeat.js still skips non-timer wakes when wakeOnDemand=false.

Coalescing can return the same run to different wake attempts (200/200); checkout idempotency can also return200/200. The immutable first receipt's nonce distinguishes the accepted attempt. Current wakeReason can change and must not replace that receipt. Foreign/ambiguous/missing receipt means no checkout, disposition, cancellation, retry or adoption. Do not mint a replacement run through an LLM tool.

A90b67c6 records that /agents/me.timeoutSec is not proof of the effective timeout after issue/workspace overrides. receipt.deadlineAt is the helper's bound, not native adapter lifetime. No proposed execution contract should claim otherwise. Unknown effective native validity must block mutation rather than derive a lease from a nonce or arbitrary timestamp.

## Existing X9 host path and verified gap

Bridge internalAgentTurnContract is the existing authenticated POST /internal/agents/:agentId/turn with X-Internal-Secret. It already carries authenticated userId and host sessionId/channel/message. Its canonical body has no native run/issue/receipt field. The current agent-core router uses the loaded agent context; neither A's dormant adapter nor D7 creates a trusted mapping from a native execution to that X9 session. A181150 and E181450 confirm this gap. Native APIs validate native objects but do not bind an arbitrary X9 session to them.

The earlier exploratory core self-wakeup idea is NOT selected or qualified: the bootstrap identities set wakeOnDemand=false, and merely enabling/waking/adopting a run would change the native execution lifecycle. A real admission design and its owner are required first.

## Reviewable minimal admission proposal — not authorized or verified yet

Prefer the native process adapter initiating the existing per-agent X9 turn rather than X9 starting a second scheduling loop. Extend the existing canonical InternalAgentTurnRequest with optional Paperclip host admission data; legacy callers remain valid. A small native adapter bridge, owned by an explicitly assigned worker, executes in the native process runtime, obtains native identity/run from that runtime, and calls the existing authenticated per-agent X9 endpoint. It uses the existing internal authentication boundary and sends no native key into model input. Process command/timeout/profile and authenticated transport are operator configuration, not browser or model input. It is a proposed link, not a new orchestrator, but changes the cross-service flow and requires coordinator decision/perimeter before implementation.

E04 would own admission before any model call: resolve the loaded trusted Forge scope and applied installation; validate native own key identity, active run/company/agent/issue, assigned issue, immutable receipt and admissible effective runtime profile; reject ambiguous coalesced receipt; allocate the X9 session mapping server-side on first admission with one run→one admitted session transaction. Caller sessionId/nonce is correlation only, never authorization. The admission must be tied to the authenticated native bridge, not accepted from generic browser/tool input. Shared internal auth alone must not be presented as independent proof of process execution; source validation and an explicit trusted-caller policy are required.

Mapping storage is ephemeral, owned by E04 agent-core, keyed by scope+run+loaded configVersion+provisioningRevision and server-generated session identity. It is not written in Vault, context credentials or ordinary desired settings. Restart drops mappings and requires fresh verified admission. No replay/adoption based only on historical receipt. A source/design review must resolve the exact trusted-caller policy, canonical ingress and effective native validity before SOURCE_DESIGN_VERIFIED can close. Implementation tests must then demonstrate the exact authenticated native adapter→existing endpoint→loaded host session→tool envelope path to close IMPLEMENTATION_QUALIFIED for02/04. Requiring implemented consumers at the design gate would create a dependency cycle and is explicitly excluded.

Open design details: worker/repo for minimal native adapter, canonical ingress extension perimeter, trusted native caller policy, native effective timeout proof including override rules, receipt publication before admission, terminal/cancelled run handling and session single-use semantics. They are explicit gaps, not placeholders in a green contract.

## Invalidation

Binding disabled/removed, own-key identity mismatch, loaded configVersion or provisioningRevision mismatch, reload failure, run terminal/non-running, issue company/assignee change, receipt mismatch, elapsed proven deadline, ambiguous timeout/coalescing, host restart or mapping loss all deny mutations. Revalidate native active state at the cap consumer before take/assign; successful admission is not a permanent lease. Rotate/remove keys takes effect through the already approved sync→load/reload flow; no per-call Vault lookup or pre-reload freshness claim. Native401/403 never triggers global/owner fallback. Unknown mutation outcomes retain reconciliation without blind replay.

## Gates and remaining work

SOURCE_DESIGN_VERIFIED=false: native sources verified; no admitted native→X9 host path/proven validity yet. Task1 discovery is split, not complete. IMPLEMENTATION_QUALIFIED=false: cap02 and core04 not delivered for this design. The complete01 contract package and live readiness remain blocked by the first gate. Independent ordinary desired config and installation/readback shape work can proceed as a clearly partial task2a/3a, without an executionContext DTO, release/completion claim or accepted source gate. Record any such adaptation in PLAN/SUMMARY before code.

## Fruibilità alla consegna (R-34)

This is source discovery and a concrete proposal for review. The owner still cannot use a real Paperclip run through X9 on this evidence. Zero product tests or live verification are credited to this document; source hashes are provenance checks only.
