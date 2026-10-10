---
phase: 34-chiavi-complete-elenco-modifica-sincronizzazione-e-consumo-e
plan: '18'
subsystem: api
tags: [contracts, zod, credentials, background-execution, voice, ricerca]
requires:
  - phase: 34-02
    provides: Canonical credential metadata and public Netatmo account field
provides:
  - Strict deterministic internal execution request/result with eight fixed targets
  - Separate managed and explicit standalone voice handoff schemas preserving legacy
  - Internal research execution input tied to the existing SQL lease token
  - Immutable qualified local package for consumers 19/10/20/23
affects: [34-19, 34-10, 34-20, 34-21, 34-23]
tech-stack:
  added: []
  patterns: [canonical-composition, bounded-internal-actions, minimal-scoped-handoff]
key-files:
  created:
    - src/http/endpoints/internal-agent-tool-dispatch.ts
    - tests/http/internal-agent-tool-dispatch.test.ts
    - tests/capability/ricerca-job-execution.test.ts
  modified:
    - src/capability/voice-live/index.ts
    - src/capability/ricerca/tools.ts
    - src/capability/ricerca/index.ts
    - src/http/endpoints/index.ts
    - tests/capability/voice-live.test.ts
    - tests/cjs/smoke.cjs
    - dist/**
key-decisions:
  - Preserve the legacy voice schema and require explicit managed policy on a separate schema.
  - Choose managed/standalone only from trusted server admission/configuration.
  - Bound Telegram jobs to internal-only agent-core builtin adapters, rather than a fictitious installed capability.
  - Separate secret credential, public identifier and setting allowlists using canonical metadata.
requirements-completed: []
requirements-covered: [CHIAVI-01, CHIAVI-05, CHIAVI-06, CHIAVI-07, CHIAVI-08]
completed: 2026-10-09
---

# Phase 34 Plan 18 — canonical internal execution and managed voice handoff

Strict canonical transport now binds fixed job/session actions to native targets and carries only the minimum managed live-call bundle; research execution uses the existing opaque UUID lease without exposing an LLM tool.

## Product and scope

Three bounded contract tasks implemented as one reversible product unit because the dispatch table composes voice/research schemas and dual-format smoke checks exercise their public exports together. Product commit: `c23eb7f38d38ebd1ff0221d6a43a2edf26dd9419`. Documentation commit follows separately.

The public research start/status/result list is unchanged. Legacy VoiceLiveCallStartRequestSchema remains unchanged; ManagedVoiceLiveCallStartRequestSchema requires managed policy, canonical identity matching agent_id and the complete strict OpenAI/Telnyx call bundle. StandaloneVoiceLiveCallStartRequestSchema requires explicit standalone policy for new trusted callers. Missing managed information cannot select standalone; consumer implementations must choose from trusted admission/configuration.

The internal registration table discriminates bounded agent-core builtin Telegram targets from installed capability targets. Every field allowlist is immutable, with credentials/identifiers/settings separate. Results reject canonical credential names (including public account/client fields), caller credential/context/env bags and nested material while retaining settings and ordinary output. Authentication, SQL lease ownership, policy, budget, cancellation and exact loaded-context binding remain obligations of the native consumers in later plans.

## Validation and proof

Proof root: /private/tmp/codex-a-chiavi-completamento/proofs/34-18/.

- Focused source/real compiled ESM:62/62 tests, including11/11 preserved legacy voice tests and51 new tests.
- Native full package suite:4800/4800 tests,166/166 files. Initial sandbox run4796/4798 had two listen EPERM failures; the identical native command with local-loopback permission passed.
- Native build and portable declarations380/380, TypeScript, focused ESLint and check:pack exited0.
- CommonJS:13/13 transport assertions plus87/87 canonical-result assertions over29 names,36/36 package probes and existing nested smoke suites passed.
- Source causal guards:23/23 caught by assertion failures;23/23 exact source SHA restores and immediate fresh green.
- Actual offline install from the new archive: ESM97/97, CJS97/97, declaration formats2/2.
- Packed ESM/CJS/declaration cuts:7/7 caught,7/7 exact restores and fresh green.
- Corrected TDD baseline:44 assertion failures/55 tests with11 legacy passes; no TypeError. Initial raw32/55 failures retained without treating partial negative checks as full evidence. Later red-bounded-review had5 semantic failures/60 and1 test-harness TypeError, excluded from evidence and fixed before green. Packed declaration cut initially reported TS2724 rather than the harness's anticipated TS2305; diagnostic matcher was corrected, raw preserved, and all packed cuts were rerun/restored green.
- A sandbox TypeScript write of tsbuildinfo failed EPERM; the native rerun exited0.
- Effective worktree hooksPath and guard source hashes/permissions unchanged. No bypass flags, push or deployment.

Machine matrices and final diff: revision-2/mutations.json, revision-2/packed-mutations.json, revision-2/REVIEW-READY.md, revision-2/final-product.diff. New R1 guard tests went red before fix in source/compiled ESM2/2 and compiled CJS, then green. Independent review R1 found INTERNAL_TOKEN and platform-internal result names absent from the KNOWN-only list; the final guard composes the complete canonical service catalog and platform-internal list. Rejected first archive and manifest are preserved and must not be adopted. Raw logs contain exact commands and exit codes. Independent review: PASSED, zero blockers; /private/tmp/codex-a-chiavi-completamento/proofs/34-18/independent-review/REVIEW.md. Independently run62/62 focused,58/58 private packed catalog checks and1/1 causal private guard cut with exact restore and fresh green; the producer full suite remains attributed to the producer.

## Artifact handoff

New immutable archive: /private/tmp/codex-a-chiavi-completamento/artifacts/34-18/revision-2/x9-forge-contracts.tgz.

SHA256:6311b755b4aa1258d9be5b41ca754f8300ab1ddf5ec774e53ce98ede2a4a6eba.

Manifest: /private/tmp/codex-a-chiavi-completamento/artifacts/34-18/contracts-manifest.json; includes source/build/test hashes, Node24.14.1, pnpm9.15.9 and Vitest3.2.4. Previous02 archive remains untouched. Consumers must adopt these exact qualified bytes rather than rebuilding Bridge or using a mutable link.

## Readiness and limits

Contract slice implemented and tested offline, including installed package resolution and declarations. No native runtime receiver/provider composition or operator-live execution is claimed. Remaining consumer plans must enforce source-owned identity/lease authority, chosen model/provider policy, minimal loaded-context projection and session/turn snapshot pinning. CHIAVI requirements are covered by this producer slice but not marked completed for the whole phase; provider-save and operator-live gates remain separate. No external service setup or deployment instruction is required from this slice.
