---
phase: 06-model-router-contracts-block-f
plan: 06-01
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md
  - /Users/admintemp/Downloads/Claude/agent-x9/.planning/ROADMAP.md
autonomous: true
requirements: [MDRT-07]
validation_ref: 06-VALIDATION.md

must_haves:
  truths:
    - "`.planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md` exists and contains a mapping table of bridge names ↔ X9 Phase 35 names"
    - "Research doc ships an explicit decision section `## Hot-Reload Mechanism Decision` naming either `polling` or `SSE` or `both`, with justification citing `agent-x9/.planning/ROADMAP.md` ROUTER-06"
    - "Research doc ships a `## Provider List Decision` section confirming the final enum values (`openai`, `anthropic`, `google`) or documenting a removal"
    - "Research doc ships a `## Divergences & Amendments` section — empty or listing any structural changes required against CONTEXT D-01..D-30"
    - "`agent-x9/.planning/ROADMAP.md` §Phase 35 preamble references `@x9-forge/contracts/model-router` as source of truth (MDRT-07 SC #7)"
  artifacts:
    - path: ".planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md"
      provides: "Coordination doc — finalises hot-reload mechanism, provider list, and X9 name mapping before plan 06-02 starts"
      contains: "Hot-Reload Mechanism Decision"
    - path: "/Users/admintemp/Downloads/Claude/agent-x9/.planning/ROADMAP.md"
      provides: "Cross-repo handoff — Phase 35 entry updated to cite bridge as source of truth"
      contains: "@x9-forge/contracts/model-router"
  key_links:
    - from: ".planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md"
      to: "agent-x9/.planning/ROADMAP.md §Phase 35"
      via: "markdown citation"
      pattern: "ROADMAP\\.md:328"
    - from: "agent-x9/.planning/ROADMAP.md §Phase 35"
      to: "bridge sub-path @x9-forge/contracts/model-router"
      via: "imperative preamble"
      pattern: "@x9-forge/contracts/model-router"
---

<objective>
Produce the research-phase alignment document that locks D-17/D-18 hot-reload mechanism (SSE vs polling vs both), confirms D-08 provider list, and maps X9 Phase 35 draft names to bridge names so plan 06-02 can execute without guessing. Then edit `agent-x9/.planning/ROADMAP.md` §Phase 35 to cite `@x9-forge/contracts/model-router` as canonical (satisfies MDRT-07 SC #7). Bridge decisions D-01..D-30 are LOCKED — this plan only fills the deferred mechanism slot and freezes the X9 cross-repo handoff.

Per 06-RESEARCH.md §Hot-Reload Mechanism Analysis the recommended mechanism is **polling** (ROUTER-06 "per-turn mtime/API check" fits pull model); SSE is reserved for a later amendment if X9 authors express push intent. This plan documents the polling decision unless re-reading Phase 35 surfaces contradicting evidence.
</objective>

<execution_context>
@/Users/admintemp/Downloads/Claude/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/06-model-router-contracts-block-f/06-CONTEXT.md
@.planning/phases/06-model-router-contracts-block-f/06-RESEARCH.md
@.planning/phases/06-model-router-contracts-block-f/06-VALIDATION.md
@/Users/admintemp/Downloads/Claude/agent-x9/.planning/ROADMAP.md
</context>

<tasks>

<task type="auto" tdd="false">
  <task_id>06-01-01</task_id>
  <name>Read Phase 35 draft & extract ROUTER-01..08 intent verbatim</name>
  <files>
    .planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md
  </files>
  <read_first>
    - /Users/admintemp/Downloads/Claude/agent-x9/.planning/ROADMAP.md (§Phase 35, lines ~328-418 per 06-RESEARCH.md §X9 Phase 35 Alignment)
    - .planning/phases/06-model-router-contracts-block-f/06-RESEARCH.md §"X9 Phase 35 Alignment" (table of bridge↔X9 matches)
    - .planning/phases/06-model-router-contracts-block-f/06-CONTEXT.md D-01..D-30
  </read_first>
  <action>
Create `.planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md` with this exact top-level structure (fill each section with findings from Phase 35 read-through):

```markdown
# Phase 6 — X9 Phase 35 Alignment Research

**Date:** 2026-04-16
**Status:** FINAL
**Author:** gsd-executor (plan 06-01)
**Consumes:** 06-CONTEXT.md (D-01..D-30 LOCKED), 06-RESEARCH.md §X9 Phase 35 Alignment

## Phase 35 Draft Summary

(Paste ROUTER-01..08 bullet list copied verbatim from `agent-x9/.planning/ROADMAP.md` §Phase 35.)

## Name Mapping Table

| Bridge name (D-01..) | X9 Phase 35 name | Match / Divergence | Resolution (bridge wins per BRDG-03) |
|---|---|---|---|
| `ModelTier` (D-04) | ... | ✅/⚠ | ... |
| `MODEL_TIERS` (D-06) | ... | ... | ... |
| `compareTiers` (D-05) | ... | ... | ... |
| `ModelPolicy` (D-11) | ... | ... | ... |
| `ModelTierMapping` (D-09) | ... | ... | ... |
| `ModelProvider` (D-08) | ... | ... | ... |
| `ModelPushRequest` (D-13) | ... | ... | ... |
| `ModelPushResponse` (D-14) | ... | ... | ... |
| `ModelHotReloadNotification` (D-17) | ... | ... | ... |
| `PerAgentModelOverride` (D-20) | ... | ... | ... |
| `CapabilityRegistryEntry.modelPolicy?` (D-23) | ... | ... | ... |

## Hot-Reload Mechanism Decision (D-18)

**Decision:** `polling` | `SSE` | `both`

**Rationale:** (cite ROUTER-06 verbatim + reasoning; 06-RESEARCH.md recommends polling)

**Implications for plan 06-02:**
- If polling → plan 06-02 adds `src/http/endpoints/internal-model-config-version.ts` (GET `/internal/model-config/version`, authType secret, responseSchema = `ModelHotReloadNotificationSchema`).
- If SSE → plan 06-02 adds SSE frame variant `type: 'model-config-reloaded'` to `src/http/sse-frames.ts`.
- If both → plan 06-02 ships both artifacts.

## Provider List Decision (D-08)

**Decision:** keep `['openai', 'anthropic', 'google']` | trim to `[...]`

**Rationale:** (cite signals for/against from 06-RESEARCH.md §Provider list)

## Divergences & Amendments

(List any LOCKED decisions that need amendment. Default: empty — bridge is authoritative per BRDG-03.
If non-empty, notify Stefano before plan 06-02 execution per D-29.)

## Plan 06-02 Inputs

Summary handoff:
- Sub-path: `@x9-forge/contracts/model-router` (already wired in `package.json:37-40`)
- Files to create: model-tier.ts, model-provider.ts, model-tier-mapping.ts, model-policy.ts, model-push.ts, model-hot-reload.ts, per-agent-model-override.ts, index.ts
- Endpoint contract files: `internal-model-config.ts` (POST push) + [based on mechanism decision above]
- Provider list: [as decided]
- Hot-reload transport artefacts: [as decided]

## Plan 06-03 Inputs

- Extend `src/capability/capability-registry-entry.ts` with `modelPolicy: ModelPolicySchema.optional()`
- Import path: `../model-router/model-policy.js`
- Four test cases per D-25 (see 06-VALIDATION.md table rows 06-03-XX)

## RESEARCH-X9-ALIGNMENT COMPLETE
```

Populate the placeholders by reading `/Users/admintemp/Downloads/Claude/agent-x9/.planning/ROADMAP.md` §Phase 35 and cross-referencing 06-RESEARCH.md. Default to the recommendations already baked into 06-RESEARCH.md (polling + keep `google`) unless Phase 35 re-read surfaces a contradicting signal. If the mapping table exposes a hard divergence from D-01..D-30, STOP before writing and surface to user per D-29.

Commit message: `docs(phase-6): RESEARCH-X9-ALIGNMENT — hot-reload mechanism + provider list locked (06-01-01)`
  </action>
  <acceptance_criteria>
    - File `.planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md` exists.
    - `grep -q "^## Hot-Reload Mechanism Decision" .planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md` exits 0.
    - `grep -q "^## Provider List Decision" .planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md` exits 0.
    - `grep -q "^## Name Mapping Table" .planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md` exits 0.
    - `grep -qE "Decision:\*\* (polling|SSE|both)" .planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md` exits 0.
    - Document ends with `## RESEARCH-X9-ALIGNMENT COMPLETE` marker.
    - Mapping table has a row for each of the 11 bridge names listed above.
  </acceptance_criteria>
  <automated>test -f /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge/.planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md &amp;&amp; grep -qE "Decision:\*\* (polling|SSE|both)" /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge/.planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md &amp;&amp; grep -q "^## RESEARCH-X9-ALIGNMENT COMPLETE" /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge/.planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md</automated>
</task>

<task type="auto" tdd="false">
  <task_id>06-01-02</task_id>
  <name>Validate LOCKED decisions D-01..D-30 against Phase 35 findings — amendment gate</name>
  <files>
    .planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md
  </files>
  <read_first>
    - .planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md (from 06-01-01)
    - .planning/phases/06-model-router-contracts-block-f/06-CONTEXT.md §"Implementation Decisions"
  </read_first>
  <action>
Review the `## Divergences & Amendments` section of the doc created in 06-01-01. If the section is empty (expected path per 06-RESEARCH.md: zero hard divergences), append the following explicit closure line at the bottom of the section:

```
**Status:** No amendments required. D-01..D-30 stand. Plan 06-02 may execute against CONTEXT as-is.
```

If the section is NON-empty (any LOCKED decision requires amendment), STOP and surface to user per D-29 before continuing. Do NOT auto-amend CONTEXT.md — amendments require user sign-off per CONTEXT D-29 "In caso di amend sostanziale, notificare utente (Stefano) prima di committare il bridge".

Per 06-RESEARCH.md §X9 Phase 35 Alignment summary: "Zero hard divergences" — the expected path is the empty-amendments closure line.

Commit message (only if empty path): `docs(phase-6): confirm D-01..D-30 stand — no amendments vs Phase 35 draft (06-01-02)`
  </action>
  <acceptance_criteria>
    - Document contains either:
      (a) Line `**Status:** No amendments required. D-01..D-30 stand. Plan 06-02 may execute against CONTEXT as-is.` — expected happy path, OR
      (b) A non-empty amendment list AND a user ack annotation (if surfaced to user).
    - No silent amendment of CONTEXT.md — verify with `git diff --stat .planning/phases/06-model-router-contracts-block-f/06-CONTEXT.md` showing zero changes.
  </acceptance_criteria>
  <automated>cd /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge &amp;&amp; grep -qE "(No amendments required|STOP — user ack pending)" .planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md &amp;&amp; test -z "$(git diff --stat .planning/phases/06-model-router-contracts-block-f/06-CONTEXT.md)"</automated>
</task>

<task type="manual" tdd="false">
  <task_id>06-01-03</task_id>
  <name>Cross-repo handoff — update agent-x9 ROADMAP Phase 35 preamble to cite bridge (MDRT-07 SC #7)</name>
  <files>
    /Users/admintemp/Downloads/Claude/agent-x9/.planning/ROADMAP.md
  </files>
  <read_first>
    - /Users/admintemp/Downloads/Claude/agent-x9/.planning/ROADMAP.md §Phase 35 (approximately lines 328-418)
    - .planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md (from 06-01-01)
  </read_first>
  <action>
Edit `/Users/admintemp/Downloads/Claude/agent-x9/.planning/ROADMAP.md` §Phase 35. After the Phase 35 heading and before ROUTER-01, insert (or replace existing placeholder preamble) with the following block:

```markdown
**Bridge contract source of truth:** this phase consumes types from `@x9-forge/contracts/model-router` — see `x9-forge-contract-bridge/.planning/phases/06-model-router-contracts-block-f/` for the canonical freeze (Phase 6, landed 2026-04-16). Local runtime must `import type { ModelTier, ModelPolicy, ModelTierMapping, PerAgentModelOverride } from '@x9-forge/contracts/model-router'` rather than re-declare these shapes. The hot-reload transport (SSE / polling) was decided in bridge plan 06-01 — see `06-RESEARCH-X9-ALIGNMENT.md` §"Hot-Reload Mechanism Decision".
```

**Cross-repo manual gate:** this task modifies a file outside the bridge repo. The executor must:
1. Make the edit.
2. Commit in the agent-x9 repo separately with message `docs(phase-35): cite bridge @x9-forge/contracts/model-router as SSOT (from x9-forge-contract-bridge 06-01-03)`.
3. Do NOT push to remote — user will review and push.
4. Record the agent-x9 commit SHA in `.planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md` under a new final section `## Cross-Repo Handoff Record` with the SHA + date.

Rationale: per 06-VALIDATION.md §Manual-Only Verifications, cross-repo edits are not automatable from the bridge test suite. The plan stays `autonomous: true` because the bridge-side research doc is autonomous; this single cross-repo handoff task is manual.
  </action>
  <acceptance_criteria>
    - `/Users/admintemp/Downloads/Claude/agent-x9/.planning/ROADMAP.md` §Phase 35 contains the literal string `@x9-forge/contracts/model-router`.
    - `/Users/admintemp/Downloads/Claude/agent-x9/.planning/ROADMAP.md` §Phase 35 contains the literal string `x9-forge-contract-bridge/.planning/phases/06-model-router-contracts-block-f/`.
    - A new commit exists on the agent-x9 `main` (or current) branch with the handoff message.
    - `.planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md` contains a `## Cross-Repo Handoff Record` section naming the agent-x9 commit SHA.
  </acceptance_criteria>
  <automated>manual — cross-repo file edit in /Users/admintemp/Downloads/Claude/agent-x9/, not runnable from the bridge test suite. Verify with: grep -l "@x9-forge/contracts/model-router" /Users/admintemp/Downloads/Claude/agent-x9/.planning/ROADMAP.md &amp;&amp; cd /Users/admintemp/Downloads/Claude/agent-x9 &amp;&amp; git log --oneline -1 -- .planning/ROADMAP.md | grep -q "SSOT"</automated>
</task>

</tasks>

<threat_model>
Phase 6 is contracts-only (no runtime code). Phase 06-01 produces only markdown + a cross-repo markdown edit — no attack surface. No threats tracked at this plan. All Phase 6 threats (T-06-01, T-06-02) land in plan 06-02 where the Zod schemas execute against untrusted input.
</threat_model>

<verification>
Phase-level must-haves (whole Phase 6):
- 06-01: RESEARCH-X9-ALIGNMENT.md exists with mechanism + provider + name-mapping decisions frozen.
- 06-01: agent-x9 Phase 35 ROADMAP entry cites bridge sub-path.
- 06-01 OUTPUTS feed 06-02 task specs — `ModelHotReloadNotification` transport implementation (polling endpoint file vs SSE frame) is decided before 06-02 execution begins.

Plan-level verification commands:
```
cd /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge
test -f .planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md
grep -qE "Decision:\*\* (polling|SSE|both)" .planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md
grep -q "^## RESEARCH-X9-ALIGNMENT COMPLETE" .planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md
grep -q "@x9-forge/contracts/model-router" /Users/admintemp/Downloads/Claude/agent-x9/.planning/ROADMAP.md
```
</verification>

<phase_goal_sc_mapping>
- SC #7 (roadmap agent-x9 Phase 35 aggiornato per importare dal bridge) → task 06-01-03.
- SC #1..#6 — out of scope for this plan; landed by 06-02 and 06-03.
</phase_goal_sc_mapping>
