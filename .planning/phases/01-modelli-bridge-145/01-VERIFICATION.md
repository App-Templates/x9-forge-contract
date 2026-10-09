---
phase: 01-modelli-bridge-145
verified: 2026-10-09
status: gaps_found
score: 2/3 must-have truths verified
release_sha: a5103c97c39b6178e8d53f201f27352c0fb58220
native_qualified_candidate: f68b97c4e85f135c4ab37097227b1733ab5509b3
verification_scope: tasks 1 and 2 verified; task 3 stopped under R32 after three attempts, pending new authorized lot
overrides_applied: 0
gaps:
  - truth: Three immutable consumer installation roots install the published release SHA; four contexts resolve 18 public paths in ESM/CJS.
    status: failed
    reason: Task 3 reached the R32 three-attempt limit. Earlier f68 candidate installed in three roots, but final a510 release has not been installed and the complete four-context compiler/load/guard-mutation matrix is missing. TS6 needs explicit-file ignoreConfig while TS5 rejects that flag.
    artifacts:
      - path: work/c5-bridge-145-gsd/INSTALLS.json
        issue: Six successful stages prove three roots installed earlier f68, not the final a510 release. Final SHA update and frozen installation remain required.
      - path: tests/cjs/public-entrypoints-first.mjs
        issue: Consumer mode exists and is substantive, but completed four-context installation results and causal guard qualification are pending assessment.
    missing:
      - New authorized lot after author's request at 10:53:41; no further execution under the exhausted lot.
      - Compiler invocation chosen per actual consumer TypeScript major: explicit-file TS>=6 uses ignoreConfig, TS5 does not.
      - Install published a5103c97c39b6178e8d53f201f27352c0fb58220 in all three immutable native roots, with subsequent frozen installs.
      - Final-SHA four-context matrix, 36/36 fresh import/require checks each, 144/144 total, matching installed version/export map/dist hashes.
      - Final-SHA eight separate NodeNext compilation results and deliberate failures of each new provenance guard, with exact restoration and fresh green.
      - Delivery R34 evidence updated with actual completed install path, followed by independent release review.
---

# Phase 1 goal-backward verification — draft

**Status: gaps_found, 2/3 truths verified.** M145-01 and M145-02 retain the verified native contract/distribution evidence. M145-03 is incomplete: task3 was **SALTATO under R32 after three attempts**, and the author requested a new authorized lot at10:53:41. Final commit **a5103c97c39b6178e8d53f201f27352c0fb58220** was published by the coordinator at10:52:35, but has not yet been installed in the final matrix. No further execution is authorized by this report.

## Actual task3 cutoff — supersedes earlier pending-only descriptions below

The previous sections' task1/task2 assessment is preserved as historical qualification for f68. The following observed task3 evidence supersedes statements below that installation results had not been assessed.

| Evidence | Actual result | What it proves |
|---|---|---|
| RAW/INSTALLS.json | **6/6 stages exit0**: update/frozen for ForgeFactory,ForgeWeb,X9; all identify **f68b97c4e85f135c4ab37097227b1733ab5509b3**. | Genuine earlier-candidate GitHTTPS installation in3/3roots. Does not prove installation of finala510. |
| RAW/CONSUMER-CHECKS.json, Factory |36/36fresh entrypoint cases;158/158Models assertions from factory-models.log; **2/2 separate TS commands exit0**. | Factory context on installedf68, using corrected author runner. |
| Same report, Web |36/36fresh entrypoint cases;158/158Models assertions from web-models.log. ESM type probe exit1: **TS5023 unknown --ignoreConfig**. | Web load/model proof on installedf68; compiler qualification incomplete. |
| Core and SDK | No completed final context results in this campaign. | **0/2 contexts qualified**, not inferred from X9 installation success. |
| RAW/REVIEW-DRAFT.md | Latest targeted review explicitly identifiesa510 and remains clean. | Static two-assertion provenance correction reviewed; no final native install or negative-test coverage inferred. |

There are **72/144 fresh load cases observed on the earlier installedf68**, **2/8 successful consumer-format compilation commands**, and **0/144 finala510 load cases qualified**. The two158/158Models assertion groups are distinct context executions; they are not158newcontract tests or runtime paths. No consumer-guard mutation campaign has been qualified yet.

### Three attempts and concrete gap

1. **Attempt1 — pnpm virtual-store filename assumption.** RAW/CONSUMER-CHECKS-ATTEMPT1.json and factory-entrypoints-ATTEMPT1.log show Factory exit1, AssertionError `Installed resolution must identify expected SHA`. pnpm's virtual-store folder truncates the SHA; this was a false harness assumption, not a contract semantic regression and not credited as a deliberate mutation. Corrective commita510 confines installedRoot to native`.pnpm` and requires installed virtual-store lock bytes equal the consumer lock, retaining selected-importer exactSHA/version/export/dist guards.
2. **Attempt2 — TypeScript6 explicit-file invocation.** Retained RAW/attempt-f68/factory-types-mts.log records TS5112 because a tsconfig exists and explicit files were passed without `--ignoreConfig`. The compiler invocation needed the actual TS6 profile.
3. **Attempt3 — uniform flag breaks TypeScript5.** RAW/web-types-mts.log records TS5023 unknown`--ignoreConfig`; RAW/CONSUMER-CHECKS.json records Web type probe exit1 after successful Factory/ Web loads and Factory types. TypeScript5 does not accept the TS6 flag. The attempt limit was reached; continuing automatically would violate R32.

Next authorized gap plan must choose a compiler profile from **each context's actual installed compiler major**, preserving NodeNext/strict/noEmit settings: TS>=6 explicit-file invocation withignoreConfig; TS5 invocation without that flag. Do not change consumer TypeScript dependency versions to make the harness pass. Then install exactpublisheda510 in all3roots, frozeninstall, run4×36loads and8separatecompiles, qualify new guard mutations, restore bytes and collect finalfreshgreen.

The clean a510 review concerns only the provenance assertions; full native source/build proof belongs to f68. Contract source/dist remained unchanged by a510, so their prior native qualification is retained with that precise provenance, rather than claiming a fresh full suite ran on a510. Final consumer checks must exercise the a510 runner and installeda510 package together. No publication gap remains; the gap is final-SHA installation plus compiler-profile/matrix and causal guard qualification. No local tarball substitution or acceptance override is warranted.

Repository: `/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-156-1`. Initial inspected clean HEAD/native proof: **f68b97c4e85f135c4ab37097227b1733ab5509b3**; latest observed HEAD/provenance correction: **a5103c97c39b6178e8d53f201f27352c0fb58220**. Base contract: **6d1bafbd9f7dbf2edcadaeab48430e232d9f3c60**. Raw evidence root, abbreviated **RAW** below: `/Users/admintemp/Documents/Codex/2026-10-08/tu-sei-codex-f-crea-in/work/c5-bridge-145-gsd`.

Method: read-only code/config/diff and existing raw-results inspection under `gsd-verifier` goal-backward instructions and `verify-phase` workflow. Read verification override, gate and calibration guidance. No suite, build, install, application, mutation, publication or repository edit executed by this verifier. A lightweight read-only SHA256 comparison of current dist against the raw build report was performed. No SUMMARY was used as sole proof. No previous phase VERIFICATION or accepted override was present at inspection.

## Goal and observable truths

Roadmap goal (`.planning/ROADMAP.md:70`): prepare version1.45.0 of the approved Models contracts with native distribution and actual SHA-pinned isolated consumer installations. PLAN's three truths preserve the entire goal; the implementation task count cannot replace these acceptance criteria.

| # | Observable truth | Status | Evidence |
|---|---|---|---|
| 1 | Release metadata identifies1.45.0 and approved Models contracts accurately. | VERIFIED | `package.json:3`; `CHANGELOG.md:13` and Added/Fixed text; `README.md:5`. Version-only package diff, scoped accurate documentation. Metadata baseline red and candidate green in RAW/metadata-red.log, metadata-green.log. |
| 2 | Complete native regression and reproducible committed dist retain canonical contracts. | VERIFIED | RAW/full-native.json:5036/5036 cases,167 file results,0pending/skip/todo; RAW/QUALITY.json:10/10 commands exit0; RAW/dts.log:386/386 portable declarations; RAW/BUILD-PARITY.json:1544/1544 files. Independent read-only current dist hashes match all1544 report entries. `git diff 6d1bafbd..HEAD -- src dist pnpm-lock.yaml` is empty. |
| 3 | Three immutable native install roots obtain the published release SHA, and four installed contexts load all18paths in both formats. | PENDING / GAP | Consumer harness exists, but local default36/36 is bridge self-reference. Final remote transport, installed-provenance,144/144load,8/8compilation and consumer-guard mutation evidence remain to be assessed after orchestrator update. |

Vitest reports566/566 suite objects because nested describes are counted; **167 file results** is the correct file denominator. Do not report566files.

## Artifact verification: exists, substantive, wired

| Artifact | Existence/substance | Wiring and outcome |
|---|---|---|
| `package.json` | Present; version1.45.0; export/scripts/dependency map retained. | Native commands and manifests identify candidate version; VERIFIED. |
| `CHANGELOG.md` | Present; specific Modelli registry/configuration/source/CAS/execution-contract additions and first-load fix. | Describes pre-existing approved contracts and expressly states no handler/live runtime introduction; VERIFIED. |
| `README.md` | Present; narrow version,18entrypoint list, hooks-only prepare and committed dist correction. | Consistent with actual manifest/build policy; VERIFIED for release-facing change. Historical unrelated documentation was not a new acceptance target. |
| `metadata-check.mjs` | Present; exact version assertion. | Invoked in quality and local guard evidence. Baseline1.44.0 produced semantic AssertionError, then candidate green; VERIFIED. |
| `tests/cjs/public-entrypoints-first.mjs` default mode | Present; enumerates manifest, spawns clean process per path/format, validates namespace plus canonical valid/invalid key parser. | Existing native smoke invokes runner at `tests/cjs/smoke.cjs:165`. RAW/default-before.json and default-after.json both36/36 and byte-identical; VERIFIED default regression. |
| Same runner, consumer mode | Present; complete required CLI options, consumer-root confinement, consumer createRequire resolution, specific lock importer, version/export/hash guards. | Static wiring is substantive; installed invocation and guard mutations pending assessment. Not labelled a working transport proof merely because code exists. |
| Committed dist |1544tracked files with complete path/hash maps. | RAW/build-parity.py:7–12 records native second build, exact hash equality, and equality of generated/tracked path sets. Read-only verifier comparison confirms1544/1544 current bytes match report. Native build produces no committed dist change from approved6d base; this is valid, not an omitted rebuild. |

The release delta itself contains five files: metadata-check, CHANGELOG, README, package version and runner. Phase planning commits additionally contain documentation. **0 contract source,0 dist,0 dependency-lock changes** relative to6d base. No new DTO or provider behavior is introduced.

## Key links and data flow

| Link | Inspection | Status |
|---|---|---|
| Native build → declarations/dist | `package.json:131` runs zshy then portability validator; raw build/dts and parity evidence agree. | VERIFIED |
| Native test → default first-entrypoint smoke | `package.json:135` invokes CJS smoke, which invokes runner; recorded native-cjs/default results exit0. | VERIFIED |
| CLI consumer → installed resolver | Runner:40–49 requires context and install root, resolves root entry through context createRequire, rejects author bridge/outside node_modules. | STATIC WIRED; live invocation pending |
| Consumer override/selected importer lock → expected remote SHA | Runner:50–66 checks root override plus specifically delimited consumer importer specifier and codeload resolution; unrelated lock entry cannot satisfy this code. | STATIC WIRED; targeted negative evidence pending |
| Installed package → exact candidate artifacts | Runner:67–74 checks identity/version/export map and all dist file SHA256s. | STATIC WIRED; actual installation evidence pending |
| Selected context → fresh first-import subprocess | Runner:77–90 enumerates18keys×2formats and spawns with `cwd: root`. Default root is bridge; consumer mode explicitly selects installed context. | Default VERIFIED, consumer pending |

No UI/data-fetch rendering was introduced, so GSD Level4 UI data-flow trace is not applicable. Relevant upstream flow here is Git dependency → native lock/importer → installed package → runtime module resolution; that final transport chain is deliberately not credited until task3 finishes.

## Requirements coverage

| Requirement | Source | Status | Evidence/limit |
|---|---|---|---|
| M145-01 |01-01-PLAN, task1; REQUIREMENTS.md:5 | VERIFIED |1.45.0 metadata and accurate existing-contract release notes. Wrong-version assertion observed red, then green. |
| M145-02 |01-01-PLAN, task2; REQUIREMENTS.md:6 | VERIFIED |5036/5036native source,10/10quality commands,386/386dts,18paths×2formats36/36,1544/1544reproducible dist, canonical source unchanged. |
| M145-03 |01-01-PLAN, task3; REQUIREMENTS.md:7 | PENDING / GAP | Phase requirement says two consumer families; authorized PLAN adds three roots/four contexts, which cannot be reduced. Final proof must use this release's published immutable SHA. |

## Raw evidence assessment

- **RAW/full-native.json**: success=true,5036total/passed,0failed/pending/todo,167testResults. Native source run precedes quality build in executor record; verifier did not rerun it.
- **RAW/QUALITY.json**, backed by named logs: metadata-green,types,lint,build,dts,default-after,public-models,public-consumers,native-cjs,pack all exit0, **10/10**. Preserve individual result meanings; ten commands are not ten semantic assertions.
- **RAW/BUILD-PARITY.json** and **RAW/build-parity.py**:1544/1544 matching distribution files, exact tracked path set, second native build asserted successful. Verifier independently checked current dist map equals recorded map.
- **RAW/LOCAL-GUARDS.json**, **metadata-red.log**, **metadata-green.log**, **default-before.json**, **default-after.json**, **mutations.py:7–10**:1/1metadata red/green,36/36default cases unchanged, raw default report bytes identical. This qualifies the metadata/default checks only; it does **not** qualify newly added consumer guards.
- **RAW/REVIEW-DRAFT.md**: clean static review after selected-importer guard correction. This supports code review, not install completion, causal negative coverage or independent final release approval.
- **RAW/SNAPSHOTS.json**: immutable source materializations for three roots: two Forge copies from8814f3c6f287b97761ae012dc4c1bb0f2349d31d and one X9 copy fromf2cf34aa1f8bdba99d28c496d3d1f598de1d2a06. Snapshot existence and safe excluded-path metadata are preparatory, not successful SHA installations.

Native `check:pack` exits0 with the pre-existing root CJS.types ambiguity warning and existing node16/false-cjs profile. No new exclusion was added. Report this limitation rather than saying warning-free.

## Anti-patterns and review limits

No TODO/FIXME/placeholder stub found in the changed runner. Its logs report actual results and are not placeholder implementation. The precise importer guard avoids the earlier unrelated-lock-entry false positive. The optional consumer path does not alter the existing default probe body or results.

The source/data contract is unchanged, so broad product re-review is unnecessary here. Actual transport could still fail because the candidate SHA is unpublished or the package manager policy rejects it; such failures are release gaps, not semantic red tests. No fallback tarball or local link is acceptable as evidence for M145-03. No override applies, and none is suggested for an incomplete requirement.

## Fruibilità alla consegna (R-34)

**La feature è completa?** La preparazione locale della release è implementata e testata nei limiti M145-01/M145-02. La fase di rilascio non è ancora verificata completa: M145-03 deve chiudersi con la prova vera del nuovo SHA nei consumatori.

**Cosa ne impedisce l'uso?** Il commit finalea510 è stato pubblicato dalla coordinatrice, ma manca la sua installazione qualificata nelle tre copie isolate e la matrice completa dei quattro contesti. Il lotto si è fermato dopo tre tentativi R32; profili TS6/TS5 da distinguere nel nuovo lotto richiesto. La disponibilità dei contratti non dimostra l'applicazione dei modelli nei runtime; **0/34 consumer dal vivo verificati da questa fase**.

**Prova del percorso dell'utente:** Chi integra Forge/X9 sceglie SHAimmutabile → installa con policy nativa → risolve pacchetto1.45.0 dalla propria cartella → carica18sottopercorsi ESM/CJS → compila contro dichiarazioni installate. Sull'earlierf68 sono osservati3/3installazioni (6/6stadi),72/144caricamenti nei soli contesti Factory/Web e2/8compilazioni inFactory. Nessuna matrice finale installata su a510 ancora qualificata; core/SDK e nuove mutazioni restano da provare nel nuovo lotto.

## Corrispondenza aspettativa e tavola (R-34)

**Aspettativa:** ROADMAP fase1, REQUIREMENTS M145-01/02/03 e PLAN richiedono una release identificabile, compilata fedelmente e realmente installabile da SHA in Forge/X9. Le prime due parti sono provate; la terza è il gap dichiarato.

**Tavola:** non serve: la fase riguarda distribuzione e contratti, senza interfaccia visiva. Nessun esito UI o comportamento live è dedotto dalle prove di pacchetto.

## Gaps summary and re-verification

One goal gap remains: qualify task3 end-to-end distribution of final **a5103c97c39b6178e8d53f201f27352c0fb58220**, already published by the coordinator. **Wait for a new authorized lot before execution.** Under that lot, fix compiler profiles per context, install the finalSHA, collect the full144/144load and8/8compilation matrix, and qualify all new guard mutations with restoration/freshgreen. Reverify only this gap fully and sanity-check retained metadata/dist without repeating expensive native suites unless a new code change justifies it. Update to `passed` only when the three-root/four-context goal has observed final-SHA evidence. Independent release review/delivery remains a separate coordination gate.
