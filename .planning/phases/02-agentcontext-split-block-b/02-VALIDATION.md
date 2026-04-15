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
| 02-01-01 | 02-01 | 1 | AGNT-04, AGNT-05 | T-02-01 | No real secrets in fixtures | manual | `echo "Manual SSH step"` | — | ⬜ pending |
| 02-01-02 | 02-01 | 1 | AGNT-04, AGNT-05 | T-02-01 | Placeholder-only values | unit | `node -e "JSON.parse(...)"` | ❌ W0 | ⬜ pending |
| 02-01-03 | 02-01 | 1 | AGNT-04, AGNT-05 | — | N/A | manual | `echo "Manual documentation"` | — | ⬜ pending |
| 02-02-01 | 02-02 | 2 | AGNT-01 | T-02-05 | Branded types prevent ID confusion | unit | `pnpm build` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02-02 | 2 | AGNT-04 | T-02-07 | Key names only, no values | unit | `pnpm build` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02-02 | 2 | AGNT-02 | T-02-06 | Passthrough preserves fields | unit | `pnpm build` | ❌ W0 | ⬜ pending |
| 02-02-04 | 02-02 | 2 | AGNT-05 | T-02-04 | Fail-loud on invalid input | unit | `pnpm build` | ❌ W0 | ⬜ pending |
| 02-02-06 | 02-02 | 2 | AGNT-01 | T-02-05 | N/A | unit | `pnpm test -- tests/agent/agent-identity` | ❌ W0 | ⬜ pending |
| 02-02-07 | 02-02 | 2 | AGNT-04 | T-02-07 | N/A | unit | `pnpm test -- tests/agent/agent-credentials` | ❌ W0 | ⬜ pending |
| 02-02-08 | 02-02 | 2 | AGNT-02, AGNT-05 | T-02-06 | N/A | unit | `pnpm test -- tests/agent/agent-context-core` | ❌ W0 | ⬜ pending |
| 02-02-09 | 02-02 | 2 | AGNT-05 | T-02-04 | N/A | unit | `pnpm test -- tests/agent/parse-agent-context` | ❌ W0 | ⬜ pending |
| 02-03-01 | 02-03 | 3 | AGNT-03 | T-02-09 | Runtime extends Core | integration | `pnpm typecheck` (X9) | ❌ W0 | ⬜ pending |
| 02-03-05 | 02-03 | 3 | AGNT-02, AGNT-05 | T-02-10 | Schema validates context.json | integration | `pnpm typecheck` (X9) | ❌ W0 | ⬜ pending |
| 02-03-06 | 02-03 | 3 | AGNT-02 | T-02-11 | Forge compat alias | integration | `pnpm typecheck` (Forge) | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/agent/agent-identity.test.ts` — stubs for AGNT-01
- [ ] `tests/agent/agent-credentials.test.ts` — stubs for AGNT-04
- [ ] `tests/agent/agent-context-core.test.ts` — stubs for AGNT-02, AGNT-05
- [ ] `tests/agent/parse-agent-context.test.ts` — stubs for AGNT-05

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
