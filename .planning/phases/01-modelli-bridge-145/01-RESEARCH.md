# Research draft — C5-MODELLI-BRIDGE-145-GSD

Research only, 2026-10-09. No tests, installation, build, network, push, tag, consumer modification or subagent delegation performed. Repository inspected: `/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-156-1`, clean HEAD `6d1bafbd9f7dbf2edcadaeab48430e232d9f3c60` at initial inspection. Counts below are either static observations or explicitly labelled previous evidence; none are new test results.

## Conclusion and scope

The minimum release is metadata/documentation plus an exact native rebuild of the already implemented Modelli contract and a genuine installation from the resulting immutable commit. No new DTO, endpoint, runtime installer, provider interaction or consumer feature belongs to this phase. The current commit still declares version `1.44.0`; its passing public smoke is a bridge self-reference test, not proof of installation from a released SHA in Forge or X9.

The new `1.45.0` commit cannot be fetched from GitHub while it exists only locally. F can prepare and test the candidate locally, commit it, and request publication from the coordinator through the mandated mail tool. F must not push or tag. After the coordinator confirms an authorized publication of the exact commit, F can complete actual isolated GitHTTPS installations and report `passed`. An old published SHA, `link:`, copied `dist/`, or a local tarball cannot satisfy the new-release transport acceptance criterion. If publication is unavailable, retain a concrete candidate and a blocked distribution verification; do not produce a `passed` release verification.

## Evidence and existing implementation

Paths in this section are relative to the inspected bridge repository unless absolute.

| Observation | Evidence |
|---|---|
| Current version is 1.44.0, module package with ESM/CJS and CJS declaration entry | `package.json:2`, `package.json:3`, `package.json:8` |
| Exactly 18 public export keys, each with import/require/types targets | `package.json:34` through `package.json:124` |
| Published package files are dist and README | `package.json:126` |
| Native build is zshy plus declaration portability; native pack check preserves existing node16 profile and false-cjs exclusion | `package.json:131`, `package.json:133` |
| Native test runs Vitest followed by CJS smoke; prepare only runs husky, prepublishOnly builds | `package.json:135`, `package.json:139`, `package.json:140` |
| No npm registry; consumers use GitHTTPS with SHA; dist is committed | `README.md:19`, `README.md:25`; `CHANGELOG.md:7` |
| Local link is development-only and must not stand in for production SHA | `README.md:31`, `README.md:43` |
| Modelli entrypoints already re-export catalogs/settings/configuration/batches/consumer definitions/execution | `src/model-router/index.ts:48`, `src/model-router/index.ts:55`, `src/model-router/index.ts:57` |
| HTTP endpoint contracts are re-exported from the actual ./http public path | `src/http/index.ts:39` |
| Registry contains 34 inventory points, canonical labels/scope/boundaries/routing | `src/model-router/model-consumers.ts:27`, `src/model-router/model-consumers.ts:28`, `src/model-router/model-consumers.ts:40`; full semantics described in `.planning/phases/c5-modelli-consumatori/CONTRATTO.md:3` |
| Existing settings cover tiered, single, failover, embedding dimension | `.planning/phases/c5-modelli-consumatori/CONTRATTO.md:11` |
| Bootstrap/source observation, CAS and replay are contracts, not evidence of runtime installation | `.planning/phases/c5-modelli-consumatori/CONTRATTO.md:20`, `:48`, `:54` |
| Actual first-entrypoint test enumerates manifest exports and formats, launches clean processes, validates key parser after first load | `tests/cjs/public-entrypoints-first.mjs:8`, `:10`, `:12`, `:17`, `:20`, `:23` |
| That runner fixes cwd to bridge root; simply invoking it from a consumer still tests bridge self-reference | `tests/cjs/public-entrypoints-first.mjs:7`, `:23` |
| Normal smoke already invokes first-entrypoint runner | `tests/cjs/smoke.cjs:164` |
| CI builds and rejects committed dist drift, then tests and checks package | `.github/workflows/ci.yml:29`, `:31`, `:34`, `:42` |
| Existing Node20 synthetic consumer installs a tarball and compiles; explicitly not SHA transport proof | `.github/workflows/ci.yml:62`, `:76`, `tests/consumer-cjs/package.json:5`, `:10` |
| Earlier installation evidence is explicitly archive-based, 1192/1192 matching compiled files | `.planning/phases/bridge-138/04-package-input.json:3`, `:6`, `:8` |
| Previous import fix proof reports 5036/5036 source cases in 167 files, 36/36 entry loads over 18 paths and 8/8 quality commands | `.planning/phases/c5-modelli-consumatori/IMPORT-FIX-PROOF.json:4`, `:19`, `:25` |

Static Git tree at the inspected commit contains **1544/1544 tracked dist paths**. This is a baseline inventory, not a fresh-build parity result. Previous proof records **386/386 portable declarations**, which must be freshly measured for this release rather than copied as a new result.

Documentation drift to fix narrowly: `README.md:5` advertises 1.27.1, `README.md:59` and `:75` describe eight public paths, `CHANGELOG.md:7` incorrectly says prepare builds despite `package.json:139` being husky only. Update these release-facing facts and document the SHA procedure; do not redesign historical documentation. Changelog starts with 1.44.0 at `CHANGELOG.md:13`; add 1.45.0 above it, covering the Modelli additions and first-import lazy-cycle correction, and describe remaining consumer/runtime work accurately.

`STATO.md:3` is an older 1.29 status and does not establish current release readiness. Prefer current phase proof and actual manifest/source.

## Consumer facts, read only

| Consumer | Current observed manifests and constraints |
|---|---|
| Forge Factory, 150-1 | `/Users/admintemp/Downloads/Claude/forge-v2-codex-150-1/package.json:12` runs the pin preinstall check; `:26` overrides contracts to GitHTTPS SHA6d1bafbd. `services/factory/package.json:20` uses workspace specifier, but lock resolves that override; `pnpm-lock.yaml:8`, `:97`. `pnpm-workspace.yaml:26` permits preparation only for exact codeload SHA URL. |
| Forge Web, 153-1 | `/Users/admintemp/Downloads/Claude/forge-v2-codex-153-1/package.json:26` uses the same GitHTTPS override; `web/package.json:18` consumes contracts and `:30` Zod4. `pnpm-workspace.yaml:26` has matching exact URL permission. Inspected clean HEAD78953e6f; snapshot a chosen immutable commit, not an evolving working directory. |
| X9 core and SDK, 157-1 | `/Users/admintemp/Downloads/Claude/agent-x9-codex-157-1/package.json:5` selects pnpm9.15.9, `:7` requires Node>=22, `:32` overrides contracts to GitHTTPS6d1bafbd; `:36` and `pnpm-workspace.yaml:8` permit exact preparation. Individual core/SDK manifests still say link (`services/agent-core/package.json:15`, `packages/capability-sdk/package.json:22`), but lock entries resolve root Git override (`pnpm-lock.yaml:29`). Inspect resolved realpaths and lock, not only leaf specifiers. Working tree was dirty at inspection (HEADf7b3256f), including pin/vendor changes. Never modify it or use its transient files without an explicit immutable checkpoint. |
| X9 capability owner, 158-1 | `/Users/admintemp/Downloads/Claude/agent-x9-codex-158-1/package.json:32` root override remains a local link; `packages/capability-sdk/package.json:22` and `pnpm-lock.yaml:8`/`:29` also resolve links. This environment currently provides no genuine SHA-install proof. Use 157-1 committed snapshot for X9 release validation, or ask owner/coordinator for a qualified snapshot/pin. Do not rewrite E's manifests. |

Forge's existing pin preinstall check is insufficient as provenance proof: it only extracts a 40-character SHA and excludes known bad ancestors (`150-1/scripts/verify-bridge-pin.mjs:54`, `:63`, `:75`), without proving the installed package equals that commit.

## Minimum implementation plan

1. Commit GSD context/plan first, recording R31/R35/R34 and explicit expectation mapping. Tavola is unnecessary because this phase changes a distribution package, not UI. Perimeter: package version, CHANGELOG, narrow README corrections, native-derived dist if any, a reusable consumer-install validator and corresponding phase proofs. No contract source changes unless a newly reproduced defect requires a separately scoped fix.
2. Add a validator that accepts **explicit consumer context and expected immutable release SHA/version**. Reuse the existing manifest enumeration and semantic key-parser probes. Unlike the old runner, resolve through each consumer's installed node_modules from its own context and spawn one process per path/format. Keep existing bridge self-reference test intact; the installed-package check is a distinct contract.
3. Baseline/source suite before build; bump version to1.45.0 and add precise release notes; run native typecheck/lint/build/dts/check:pack/test with recorded tool versions and unchanged native config. Record complete pre/post dist inventory and byte equality to a second clean build of the candidate commit. Build must not silently omit paths or use a previous repo's dist. Expected static inventory is1544 paths, but report actual N/N after rebuilding. No version string in lock importer was found during static search; preserve lock unless native install justifies a real dependency delta.
4. Commit release candidate atomically; derive its full SHA only after commit. Record metadata/code/dist hashes. A commit cannot contain its own SHA; final transport reports may be untracked output or a later docs-only commit which clearly identifies the product SHA.
5. Send coordinator the candidate SHA, build evidence, independent-review request and precise need for authorized publication before transport verification. Keep working on local validation while publication is pending; F does not push/tag. After publication, verify GitHTTPS availability and then install that exact SHA in private isolated consumer snapshots.
6. Pin **only isolated snapshots**, adjusting override, lock and exact onlyBuiltDependencies URL together; preserve author repos. First update isolated lock intentionally, then run a fresh frozen installation with no aliases/vendor copy/path overrides. Run available safe lifecycle scripts; record any deliberate lifecycle suppression as a limitation rather than claiming a native installation. Avoid credentials/.env and services/providers. Commit snapshots are materialized from tracked safe files, excluding .env/secrets/private-key artifacts; do not copy ignored state or whole user worktrees.
7. Deliver `VERIFICATION.md` with `passed` only once actual SHA installs and public resolution pass. Include exact R34 delivery subsection, raw manifest hashes, source/product SHA, consumer snapshot SHAs, installer/tool versions, lock resolution, resolved package realpaths and fresh public load results. Ask for independent review through coordinator.

## Validation Architecture

### Layers and denominators

| Layer | Required evidence | Expected denominator, measured afresh |
|---|---|---|
| Native bridge source | Native complete suite before build, no skips concealed | Previous baseline5036 cases/167files; release uses actualN/N |
| Native bridge quality | typecheck, lint, build+dts, check:pack, native smoke/test | Each command exit0; actual declaration count N/N |
| Build provenance | Candidate dist equals clean native rebuild; complete path sets and per-fileSHA256 | Static baseline1544 paths; actualN/N |
| Real Git transport | Fresh isolated Forge150, Forge153, X9D157 install from exact released GitHTTPS#SHA | **3/3 install roots**, independently identified |
| Actual consumer resolution | Factory150, Web153, core157, SDK157 each resolve correct installed version/path/hash | **4/4 contexts**, same releaseSHA |
| Fresh first import | Each of18actualpublickeys ×2formats ×4consumercontexts | **144/144 clean child processes**; also report each context36/36 |
| Semantic Modelli probes | Registered inventory34/34, single/failover/tiered/dimension and bootstrap/observation public symbols; canonical parser valid+invalid afterfirstimport | Report assertions/cases separately, no invented runtime coverage |
| TS consumers | Small NodeNext ESM/CJS declaration probe under each actual installed context; use installed package, no sourcepaths | **8/8 context-format compilations** if fourcontexts retained |
| Runtime product | Outsidephase: provider calls, save/apply propagation, actual34consumerinstallation | **0/34 live consumers verified by this phase** |

3 install roots/4 contexts is the recommended explicit plan because the assignment names both Forge worktrees and X9. A smaller two-family proof must be approved and document exactly which real consumer snapshot each family represents. Do not conflate 144publicloads with144distinctexportpaths, or all-symbol probes with runtime verification.

### Provenance guards

- Require expected releaseSHA in every relevant lock resolution and override; reject link/file/workspace fallback for the resolved bridge package. A GitHTTPS dependency may resolve to pnpm's canonical codeload tar.gz/thatSHA; this is legitimate package-manager transport, distinct from hand-substituting a local tarball.
- Resolve installed package using consumer resolution, then read its adjacent manifest; `@x9-forge/contracts/package.json` is not exported and should not be invented as a public subpath.
- Assert version1.45.0, exact18exportkeys, targetpresence, complete installed dist hashes equal candidate committed dist, and realpath outside author bridge/vendor/source. Record peerZod resolvedversion and noNODE_PATH/loaderalias.
- Keep network/auth failure separate from semantic red. An unknown unpublishedSHA is a distribution blocker, not successful negative test coverage or a contract regression.
- Reuse isolated env and installed tools; never read user auth tokens or dump configuration. Network operations, when needed, use existing credential integration without exposing credentials.

### Mutation requirement for new checks

Before crediting each new guard, prove a targeted assertion failure and restore exactbytes, then freshgreen. At minimum: wrong expectedversion, wrongreleaseSHA/lock identity, locallylinkedpackage, missingdisttarget/hashcorruption, bad publicexport, semantic parser weakened. The first-load matrix should be causally broken at each distinct public target/format; if faults are simultaneous, label **one simultaneous campaign with36failingentrycases**, not36independentmutations. Existing6d cycle mutations are prior evidence and must not be relabelled newrelease mutations. Synthetic nonsecret fixtures only, no author consumer modifications.

### Coordinator request needed

Suggested request content (parent sends via posta.py, researcher sends nothing): candidate1.45.0 will be committed and fully built locally; installation from newSHA is impossible until repository host exposes that immutable commit. Request coordinator's authorized publication/reachableSHA, plus immutable Forge150/153 and X9D157 checkpoints for isolatedinstallation. Ask whether GitHTTPS releaseSHA publication can precede finalconsumer transport proof, which will follow immediately; do not ask for a tag when SHA suffices. Preserve final `passed` gate until transport proof exists. If publication is declined or not authorized, report concrete localcandidate+pendingdistribution, and seek revised acceptance only through coordinator rather than silently downgrading proof.

## Open questions for execution, not user requests

- A's independent review of6d1bafbd is still a prerequisite to qualify the base; read mail before execution.
- Consumer worktrees are moving and D157 is dirty: agree immutable checkpoints and their ownership before materializing snapshots.
- Confirm chosen native Node/pnpm binaries againstconsumerrequirements; X9requiresNode>=22 despite bridgeNode>=20. Do not claim Node20 X9compatibility.
- Source/full native tests may be expensive; acquire the project's heavy-command slot before running and respect prescribed lotlimits. No newtest/installcommands were executed for this research.

## Locked checkpoint resolution — coordinator103259

InitialauthorHEADstrategy superseded: Forge8814f3c6f287b97761ae012dc4c1bb0f2349d31d forFactory/Web andX9f2cf34aa1f8bdba99d28c496d3d1f598de1d2a06 forcore/SDK. Threeinstallroots/fourcontexts accepted. Use exactintegratedrefs, no dirtyHEAD/WIP.
