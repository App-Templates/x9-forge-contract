---
phase: 2
slug: agentcontext-split-block-b
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-15
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test -- --run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-02-01 | 02 | 1 | AGNT-01 | — | N/A | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | AGNT-02 | — | N/A | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 1 | AGNT-03 | — | N/A | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 02-02-04 | 02 | 1 | AGNT-04 | — | N/A | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | AGNT-05 | — | N/A | integration | `pnpm test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/agent-context/__tests__/agent-context-core.test.ts` — stubs for AGNT-01, AGNT-02
- [ ] `src/agent-context/__tests__/agent-credentials.test.ts` — stubs for AGNT-03
- [ ] `src/agent-context/__tests__/parse-agent-context.test.ts` — stubs for AGNT-04, AGNT-05

*Existing vitest infrastructure covers framework requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| VPS context.json backward compat | AGNT-05 | Requires real production context.json samples | Parse actual VPS context.json files through `parseAgentContext()` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
