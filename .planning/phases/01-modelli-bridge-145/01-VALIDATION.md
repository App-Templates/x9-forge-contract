---
phase: 1
slug: modelli-bridge-145
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-10-09
---
# Phase1 — Validation Strategy

Native Vitest3 config; pnpm/Node24 cleanenvironment, worker1,60s. Quick: node tests/cjs/public-entrypoints-first.mjs. Full: pnpm exec vitest run --maxWorkers=1 --testTimeout=60000, followed by node tests/cjs/smoke.cjs. Native full before build; no suppressed lifecycle or sourcealiases. No watch flags.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01-01-01 | 01 | 1 | M145-01 | T01 | exact version | metadata | node .planning/phases/01-modelli-bridge-145/metadata-check.mjs | yes | passed |
| 01-01-02 | 01 | 1 | M145-02 | T02 | exactdist/source | nativefull/build | pnpm exec vitest run --maxWorkers=1 --testTimeout=60000; pnpm typecheck; pnpm lint; pnpm build; pnpm check:pack; node tests/cjs/smoke.cjs | yes | passed |
| 01-01-03 | 01 | 1 | M145-03 | T03 | no localpackage substitution | install+publicload | pnpm install --prefer-offline; pnpm install --frozen-lockfile --prefer-offline; node tests/cjs/public-entrypoints-first.mjs --consumer CONTEXT_PATH --install-root SNAPSHOT_ROOT --expected-sha RELEASE_SHA --expected-version 1.45.0 --expected-bridge BRIDGE_ROOT --report REPORT_PATH; pnpm exec tsc --noEmit --module NodeNext --moduleResolution NodeNext --target ES2022 --strict --skipLibCheck release-probe.mts release-probe.cts | yes | passed |

Wave0: extend first-entrypoint runner with explicitconsumer/version/SHA+distproof; semanticred/restore for each newguard. Existing matrix unchanged in defaultmode. Nativefull after metadata; afterwave installationfullpublicmatrix fresh. Each task acceptance checked before commit. Maximumfeedback5min duringfull/install; commentary at≤60s. Manual-only: coordinator authorizedpublication and external independentreview; Fneverpushes. 0runtime/liveflow claims. Signoff remains pending until all three requirements proved.

ConcreteCLI and Wave0creationorder in01-01-PLAN.md. Immutable snapshotdecision103259: Forge8814f3c6/X9f2cf34aa; threeinstallroots/fourcontexts144freshloads.

Task1createsmutations.py --local beforeuse; task3adds --consumer afterinstallation. Eightseparatetsccommands=4contexts×2formats.

Final signoff: M145-01/02 retained observednative evidence; M145-03 closed by01-02 rawfinalSHA matrix. Metadatafault1/1, provenancefaults19/19, typefaults8/8semanticred+exactrestore. Coverage feedback6s forentrypoints, under2s pertype; no watchmode. Table outcomes refer to reviewed gap execution01-02 for consumer profiles; this signoff and01-FINAL-PROOF contain final outcomes. No manual runtime claim; independentCodexreview pending.
