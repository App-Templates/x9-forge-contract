---
phase: 01-modelli-bridge-145
plan: 01
subsystem: contracts
tags: [release, models, provenance]
requires: []
provides: [version 1.45.0 metadata, native reproducible distribution, installed-consumer proof harness]
affects: [Forge, X9]
tech-stack:
  added: []
  patterns: [native Git SHA install, importer-bound provenance]
key-files:
  created: [.planning/phases/01-modelli-bridge-145/metadata-check.mjs]
  modified: [package.json, CHANGELOG.md, README.md, tests/cjs/public-entrypoints-first.mjs]
key-decisions: [Keep canonical sources unchanged, reject unproved consumer release claims]
patterns-established: [Complete dist hash comparison]
requirements-completed: [M145-01, M145-02]
duration: 29min
completed: 2026-10-09
status: partial
---

# Release 1.45 initial plan — qualified native package, consumer proof gap

Version 1.45.0 and accurate release metadata implemented in f68b97c4e85f135c4ab37097227b1733ab5509b3. Test-only correction a5103c97c39b6178e8d53f201f27352c0fb58220 rejects native virtual-store provenance errors without assuming untruncated pnpm directory names. Both SHAs published by coordinator, not F. No source, DTO, dependency-lock or committed dist changes from approved6d; two native builds produce identical1544/1544files.

Task1 metadata/default proof implemented; final new consumer-guard qualification moves to gap plan. Task2 native release qualified:5036/5036 cases in167files,0pending,10/10quality commands,386/386portable declarations,36/36default entrypoints,1/1metadata fault red/restored. Static GSD code review clean after importer-lock correction.

Task3 **SALTATO** at three technical attempts under board limit: (1) native pnpm truncates path SHA, corrected test; (2) TypeScript6 standalone file CLI requires explicit ignoreConfig; (3) Web TypeScript5 rejects that option. Root cause is test harness compiler version selection; no package contract defect observed. Raw failures preserved. f68installed via remoteSHA in3roots,6/6lock-update/frozen commands; Factory36/36+158/158+2/2TS;Web36/36+158/158; finala510 and core/SDK unqualified. Do not report task3 complete.

## Deviations and evidence

Planning/context/research/check complete before execution. Single plan executed sequentially by responsible F to honor one-heavy-command rule, with separate read-only GSD code review and goal verifier. Native lock update uses --lockfile-only followed by actual frozen install; no ignore-scripts, aliases, copied dist or local tarball proof. check:pack retains pre-existing CJS.types ambiguity warning and unchanged native profile. New guard faults and final consumer types remain gap evidence, not claimed yet.

Raw: workspace work/c5-bridge-145-gsd/full-native.json,QUALITY.json,BUILD-PARITY.json,LOCAL-GUARDS.json,attempt-f68/,CONSUMER-CHECKS-ATTEMPT1.json,factory-entrypoints-ATTEMPT1.log,CONSUMER-CHECKS.json. Canonical decisions R31/R35/R34 once in01-CONTEXT.md.

## Fruibilità alla consegna (R-34)

Package1.45 built and loadable natively. Three isolated immutable consumer roots obtained f68via GitHTTPS and native pnpm; final releaseSHAa510 and completefour-context/eight-type proof remain open. M145-01/02verified;M145-03gap. No tag/deploy/actualconsumer repository change by F. Actual Models live flows remain0/34verified in this release-preparation phase; no claim of complete user feature.

## Self-Check

PASS: commitf68/a510 exist; metadata/full/quality/parity/default artifacts exist and observed. GAP: final consumer proof. Phase remains open and continues only through reviewed gap plan after coordinator authorizes new R32lot.
