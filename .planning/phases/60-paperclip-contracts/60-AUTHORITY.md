# Paperclip authority discovery — phase 60, task 1

Status: SOURCE_DESIGN_VERIFIED=true for the final approved section (C18cb8ec, 815d820 + aa401599); IMPLEMENTATION_QUALIFIED=false.
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


## Approved flow and concrete admission design — coordinator182006 / perimeter183039

The native process→existing per-agent internal turn link is approved. D owns services/cap-paperclip adapter and bridge171 DTOs; E owns the runtime route173. Bridge internal-agent-turn* was added to D171 perimeter at183039. This approval does not independently verify the final design or implementations. The previous unapproved proposal is retained above as history; this section supersedes its undecided caller, session and primary details.

### Caller authentication through the existing credential pipeline

A single global adapter secret would not isolate native agents. Use a dedicated per-agent PAPERCLIP_X9_ADAPTER_SECRET, delivered to the agent context through the SAME Forge key writer/sync→load/reload pipeline as the existing per-agent PAPERCLIP_API_KEY. D03/E must enforce tier=agent for BOTH keys; neither owner/Master/global fallback nor a new Vault API/resolver/counter is allowed. AgentCredentials already accepts dynamic keys. Export canonical key names from the Paperclip contract; add the adapter key to the capability's key requirements in D02. Do not project this admission key into ToolCallRequest.credentials: only the own native PAPERCLIP_API_KEY goes to cap-paperclip.

The operator configures the matching per-agent native adapter transport credential with Paperclip's existing secret_ref env binding; native shared validators/secret.js and agent.js validate that mechanism, and server process/execute.js receives already resolved env. This is operator configuration, not Codex reading/creating a real secret, a raw value in adapter JSON or another Forge key delivery path. No secret value is in a wire DTO, model prompt, log, test evidence or browser response.

Reuse X-Internal-Secret on the existing endpoint. In the native admission branch, authenticate against the currently LOADED per-agent adapter credential. Resolve exactly one loaded caller context for the presented credential, reject duplicates/global-key collision, then require that authenticated context's runtime ID equals the path target. Caller-supplied path/scope/channel/nonce never selects a different authority. Reload/removal invalidates the credential through the same loaded context replacement as ordinary credentials. There is no new persistent auth file/map, per-call Vault read or second identity resolver. Generic internal callers keep the existing global secret behavior and CANNOT submit a Paperclip admission. A dedicated adapter credential cannot invoke a generic model turn without admission. E04 must recheck exact context object/version/installed binding after every awaited preflight.

### Two-phase admission on the same endpoint; no new endpoint

A receipt alone could be adopted after an X9 restart. Use a host-generated challenge and a one-shot native stdout receipt, following the verified native JSONL/receipt mechanics but with a distinct X9 protocol:

1. Native adapter sends a prepare admission on POST /internal/agents/:agentId/turn. It obtains native company/agent/run from the real native process environment and current native run's assigned issue. The host authenticates the per-agent transport and reserves runId synchronously BEFORE any await. The reservation key is native runId alone, with trusted scope/configVersion/provisioningRevision as immutable constraints; changing a revision cannot create another reservation for the same run. No model, cache turn work, counter, lead loop or side effect runs at prepare.
2. Host verifies applied cap readback, own native key identity, running native run/company/agent/issue and current assignment. It rejects an existing X9 receipt/admission for this run. It allocates admissionId/challenge and server session identity in ephemeral memory, bounds a host deadline using its own clock and returns a prepared result. The caller sessionId remains correlation only. A lost/unknown prepare outcome is not retried blindly.
3. The native adapter publishes EXACTLY ONE paperclip.x9-run-binding stdout receipt containing BOTH the returned admissionId AND the exact host-generated challenge, plus native run/company/agent/issue and the bounded host deadline. The challenge is a required receipt field echoed unchanged from prepare; it must never be omitted, regenerated or inferred from admissionId. It then sends commit on the SAME endpoint, with that admissionId. It never emits a second receipt, regenerates a challenge, retries a model POST or adopts another wake's receipt. The existing filiera.worker-binding protocol and mutable wakeReason are not reused as X9 authority.
4. Commit looks up the current host reservation, authenticates the same loaded caller, reads the native bounded JSONL stdout log and checks exactly one X9 receipt whose required challenge equals that reservation's challenge exactly, along with admissionId and native identity. A missing, empty, substituted or mismatched challenge is rejected before model admission. Missing receipt may have a short bounded READ-ONLY publication wait inside the host deadline; no model POST retry. Ambiguous, duplicate, foreign, expired or historical receipt fails closed. The host rechecks native running state/assignment and exact loaded context/binding after awaits, consumes the reservation once before calling the model, and supplies a server-owned session/execution context to the tool router.
5. Native run terminal/error, cancellation, host expiry, configuration/key/binding replacement or request disconnect cancels/denies further work. The cap revalidates own native identity and current native run/issue before each mutation. Unknown outcomes require reconciliation, never replay. Responses contain admission metadata or a normal turn reply; no credentials.

Restart drops reservations. An old commit has no reservation. A new prepare yields a new challenge, while the immutable existing native receipt still contains the old one, so commit cannot adopt it. Reject historical/second receipt at prepare/commit; retain consumed/failed run tombstones for the host lifetime independently of configuration versions. The adapter's single prepare/single receipt/single commit rule and native run coalescing behavior must be qualified by causal tests, including a restart between all protocol steps. A process crash is not an instruction to force release/cancel another run.

### Validity and native timeout limit

The host deadline is an explicit host admission budget, NOT a native adapter deadline/lease. Receipt expiry must equal the host's stored bound; timestamps supplied by the caller never extend it. The native bridge enforces its own elapsed HTTP/process budget. Native active state is observed before admission and before each mutation; native termination can shorten the work at any instant. No claim of guaranteed completion or atomic native lifetime follows from an active-state read.

Use an operator-controlled fixed native process profile for the initial qualification: approved command/args/runtime, no issue/project/environment/managed-AI overrides, timeout longer than the bridge budget plus cleanup. Check those admissibility constraints at dispatch/admission, reject unsupported profiles, and prohibit operator reconfiguration during the run. Published heartbeat source merges overrides and process onMeta omits effective timeout; A90b67c6 therefore remains an explicit limitation. Do not add an invented native adapterDeadline or infer one from current /me.timeoutSec. Tests must distinguish host budget enforcement/current run status from native effective-timeout attestation. This is source/design only; native profile/runtime qualification remains in02/04/06 and no VPS proof is credited.

### PRIMARY and legacy compatibility

E183039 confirms a Forge-managed identity can map to the env-declared PRIMARY. Source c56bdc01 index loads manager context files then initializeBootInventory; manager.register preserves an already loaded primary context. The envPrimaryCtx fallback has no Paperclip credentials/installation and cannot authorize admission.

Keep generic/legacy requests to primary403 exactly as today. Only the authenticated native admission branch may address primary, and only when the current manager holds a real Forge-written loaded primary context with explicit identity/scope, per-agent native+adapter keys and successful current cap installation/readback. Use that same loaded object/registry/workspace, not env values or an alternative personal-agent fallback. An env-only primary remains unavailable for Paperclip; this is an explicit not-configured case, not a reason to infer identity. E04 tests both file-backed primary success and env-only denial, plus unchanged legacy403. No production environment was read to guess which case is installed.

### Wire and owner decisions

D171 will define ordinary config/applied binding/install/readback plus native prepare/commit receipt/admission and server execution context. InternalAgentTurnRequest/Response gain optional protocol fields; legacy consumers retain their existing body/response. The cap readback extends the canonical applied binding so the host can actually compare native company/agent/roles/provenance; a metadata-only readback was insufficient and was corrected with a failing-then-passing test. Registry fingerprint and configuration fingerprint are distinct non-secret digests. No arbitrary native ID, role or scope is accepted as browser authority.

D02 implements inventory, CAS/install/readback/current native checks and the single-shot native process bridge; E03 the existing writer/tier-agent filters for both keys; E04 admission/auth/primary/ephemeral reservation and ctx→tool envelope; E05 desired/applied UI;06 integration/live gates. These are the approved existing services, not another queue/orchestrator.

SOURCE_DESIGN_VERIFIED remains false until this exact design receives independent review and unresolved findings are closed. IMPLEMENTATION_QUALIFIED remains false until02/04 are actually delivered and tested. A source/design gate never waits for all downstream implementations; implementation tests never become proof merely because a schema parses. The first discovery lot18:09–18:54 is closed as a partial checkpoint; pending design review is a split dependency, not a green completion. C185654 requested an explicit required challenge echo; this isolated documentary correction closes that ambiguity for review without implementing a DTO or qualifying a consumer.

## Independent source/design gate closed — C190545

C18cb8ec c-rilascio/reviews/d60-source-design/REVIEW.md in filiera-codex-163-1 approves ONLY the exact source/design815d820 + aa401599 (intermediate bookkeeping6a2d4f9 reviewed). 24/24 declared source digests plus2 supplemental native utils sources,21/21 original delta identities,16/16 documentary obligations with16/16 omission checks and39/39 persisted proof hashes. These are source/document checks, not product/native tests. C did not rerun the author's119config tests. Earlier false/open statements above record the discovery history; the final approved design and this limited gate supersede them.

SOURCE_DESIGN_VERIFIED=true enables canonical run/ingress contracts. IMPLEMENTATION_QUALIFIED=false; downstream CAS, per-agent writer, primary provenance, authenticated admission/replay/native-current-state integration and live operation remain pending. No source/design approval certifies a runtime reservation or lease.
