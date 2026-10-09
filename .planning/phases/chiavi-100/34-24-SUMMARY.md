---
phase: 34-chiavi-complete-elenco-modifica-sincronizzazione-e-consumo-e
plan: '24'
subsystem: contracts
tags: [chiavi, models, initial, observed, esm, cjs, composition]
requires:
  - phase: '34-18'
    provides: Qualified result-only dispatch, managed voice and research lease contracts
provides:
  - Roleless Initial and honest observed model contracts composed with02/18
  - NEW immutable archive24 for scoped consumer25 adoption after final approval
affects: ['34-25', '34-05', '34-19']
tech-stack:
  added: []
  patterns: [canonical contracts, immutable archive adoption, native dual-format qualification]
key-files:
  created: [src/model-router/model-consumer-execution.ts, src/http/endpoints/internal-agent-model-source-observation.ts, tests/model-router/chiavi-model-composition.test.ts]
  modified: [src/model-router/agent-model-configuration.ts, src/model-router/capability-model-settings.ts, tests/cjs/smoke.cjs]
key-decisions:
  - Compose16 qualified canonical source files while retaining179 protected sources unchanged
  - Preserve legacy public exports and separate roleless Initial from explicit Master bootstrap
  - Publish immutable archive bytes before binding only the actual reviewed local product commit
metrics:
  completed: 2026-10-09
  tasks: 3
  product-files: 199
status: complete-local-contract-slice
---

# Phase34 Plan24: Initial/observed canonical composition

Canonical roleless Initial evidence, modern local source observation and observed consumer settings coexist with the qualified02 account metadata and18 minimal execution/voice/research contracts in one compiled and offline installed package.

## Outcome and task status

All three bounded tasks are complete and independently approved. Product commit: `5806a8556e08be0a672db9e4cbc590be1d19bd1b`; normal hooks passed. All1776 source/test/dist Git blobs match the reviewed snapshot. The separate documentation commit follows. Consumer25 may adopt this exact archive only under its own approved plan and parent GO.

The16 source changes come from frozen Bridge156 git objects `3d9eda54c9d5493b3b9f51a52618428e9f6e48db` and `2b3ad075a88f5d39a2e5dbb986da55d37ebc9a4a`, with public indexes merged to retain18. Credential catalogs, managed/standalone voice and research lease source contracts retain their180 bytes. No F working tree content was copied.

## Validation

Native Node24.14.1/pnpm9.15.9/Vitest3.2.4/TypeScript6.0.2, minimal environment, envDir:false. Full source suite before build5383/5383 across175 files; focused suite after build1270/1270 across30 files.583 tests are newly added. Build,390 portable declaration files, typecheck and check:pack pass. Lint reports zero errors; four `.mts/.cts` fixtures lie outside the existing lint glob and compile separately.

Source mixed assertions were written before composition: corrected baseline31 failures/62 tests. Built Initial export and declaration fixtures failed before build. C17/C18 isolate pre-existing unknown runtime/read-slot guards; subsequent causal faults make their assertions fail.

Source fault families73/73 caught with exact restores and fresh green; raw74 attempts include the initially masked failover fixture, which was corrected and requalified. Private installed-package faults13/13 caught with exact restores and fresh green. An excluded CJS loader-error mutation was restored and replaced with a publication-only semantic fault. Raw diagnostic attempts remain separate from valid denominators.

The actual archive and native offline installation both pass276 mixed assertions,186 Initial/local HTTP assertions,112 observed assertions,158 C5 assertions,48 compatibility assertions,36 first-import orders and six declaration fixtures. Every1560 archive and installed distribution file matches the producer hashes. No source alias or mutable bridge link participates in consumer qualification.

## Immutable artifact and provenance

Archive `/private/tmp/codex-a-chiavi-completamento/artifacts/34-24/revision-1/x9-forge-contracts.tgz`, SHA256 `b644e82dcf5290d5a83b47c69e7f35e9ca0e7f659dafa01d08b454f73d1576cc`, mode0444.

Manifest `/private/tmp/codex-a-chiavi-completamento/artifacts/34-24/contracts-manifest.json` binds actual local product commit `5806a8556e08be0a672db9e4cbc590be1d19bd1b` and parent `144369c716b3f91ad1d09b093930759bc5a1d803`. Archive bytes remain unchanged; no repack occurred. Manifest SHA256 `5cf3f76584b232767f97c6111cbb15891b9abae734d209a43b47240c2ec732cd`. Source/test/dist snapshot SHA256 `5aee41d26bbdfd08dc867303c76422ae2b4dcaee07085e20a6da35f0adef1cbc`; final product diff SHA256 `ed10074dfd33a130aff6e0ffd5f5d7985f8173622d35567a143c6ebf344c719f`.

Inventories contain195 sources,1560 distribution files and21 declared tests/smokes/type fixtures. The199 changed product files fit the planned literal files plus `dist/**`.179 protected sources, three native18 tests and both02/18 qualified archives retain their original hashes. Normal hooks run; effective guard path, hook bytes and modes remain intact.

## Deviations and interruptions

- One initial mixed-test assertion incorrectly expected a voice-live export from the package root. It was corrected to the actual public voice-live subpath before source changes; only corrected RED evidence is counted.
- The failover embedding fixture contained an extraneous `descriptor:undefined`, masking its intended guard. The fixture now uses the valid failover shape and the guard mutation produces a named assertion failure.
- Private copies of author-layout C5/compatibility/first-entrypoint scripts adapt paths to real installed package resolution. Original and adapted hashes are recorded; a loader failure from the first private copy is excluded from semantic RED.
- Automatic approval initially applied an obsolete worktree scope. Read-only coordinator authorization19:59/20:05 plus current perimeter established Bridge180 authorization and the bounded retry succeeded.
- Disk exhaustion paused all writes and mutation/build work. No data was deleted by this executor. Work resumed only after explicit SPACEGO with15GiB available.

## Security and limits

Threat boundaries remain canonical: complete identity and owner/tenant scope, fresh source generation, registered consumer metadata, explicit installed receipts, embedding vector-space checks and secret-authenticated internal transport. Initial grants no Master role and observed settings grant no installed provenance. Retained18 blocks all canonical credential names, including INTERNAL_TOKEN and platform signing/session fields, in nested results. No new Vault resolver, credential response, full credential bag, environment fallback, public job executor or endpoint implementation was introduced by this contract-only composition.

No stub patterns were found in the16 changed source files. No additional threat surface beyond the planned canonical model source/state/install contract boundaries was introduced. Live provider validation and policy/operator gates remain outstanding elsewhere in phase34. No deploy, push, server or real-environment action was performed.

## Evidence

Private proof root `/private/tmp/codex-a-chiavi-completamento/proofs/34-24/`; `qualification-summary.json`, `REVIEW-READY.md`, `final-product.diff`, raw command/exit logs and causal matrices. Independent report PASSED with zero findings: `proof/34-24/independent-review/REVIEW.md`, SHA256 `55c5922bece9a2ceb28019abd271506a22989a80dcdb29b4912a791b0fa3c384`. The reviewer reran330/330 native checkout tests,127/127 private source tests (361 distinct across both sets),780/780 packed public assertions,36/36 first imports and6/6 declaration fixtures. Its separate terminal observed-authority fault caused6/127 named assertion failures, kept96/96 Initial checks green, restored exact bytes and reran127/127 green. Parent separately checked195/195 source,1560/1560 dist,21/21 tests and1560/1560 archive identities. Durable raw .log.txt files are byte-identical copies mapped by RAW-COPY-MAPPING.json; diagnostics are excluded, not rewritten.

## Self-check

Producer/archive/installed/protected bytes, exact staged199-file set and committed1776/1776 Git blobs verified. Independent PASS and parent mutex received; product commit completed with unchanged guard. Requirements for the complete phase remain open; no operator-live claim. Documentation commit records this scoped completion separately.
