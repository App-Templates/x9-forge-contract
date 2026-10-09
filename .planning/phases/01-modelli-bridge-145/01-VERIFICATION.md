---
phase: 01-modelli-bridge-145
verified: 2026-10-09
status: passed
score: 3/3 must-have truths verified
requirements_verified: [M145-01, M145-02, M145-03]
release_sha: a5103c97c39b6178e8d53f201f27352c0fb58220
native_source_execution_sha: f68b97c4e85f135c4ab37097227b1733ab5509b3
re_verification:
  previous_status: gaps_found
  previous_score: 2/3
  gaps_closed: [M145-03]
  gaps_remaining: []
  regressions: []
overrides_applied: 0
gaps: []
independent_release_review: pending another Codex
---

# Phase 1 — final goal-backward verification

**PASSED: 3/3 observable truths and all three requirements verified.** The approved Modelli contracts are identified as1.45.0, retain their qualified native distribution, and are actually installed from final published commit **a5103c97c39b6178e8d53f201f27352c0fb58220** in Forge and X9 isolated consumers. This author-phase GSD verification does not replace the pending independent release review by another Codex, or a live product qualification.

Repository: `/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-156-1`. Latest observed documentation HEAD8ac3ba2a41a82311abb3150485aa32cba5da92df; release/product SHA is explicitlya510, not that documentation HEAD. Raw directory, abbreviated **RAW**: `/Users/admintemp/Documents/Codex/2026-10-08/tu-sei-codex-f-crea-in/work/c5-bridge-145-gsd`.

Method: GSD goal-backward re-verification of prior M145-03 gap, inspection of actual runner/plan/diff and named raw logs, plus lightweight independent reads and SHA256 comparisons of current installed packages. Previously passed M145-01/02 received a source/distribution identity sanity check. No heavy suite, build, install, application or mutation was executed by this verifier, and no author repository was modified. Existing full source execution belongs to **f68b97c4**, with canonical source/dist/lock unchanged afterward; it is not relabelled a full run ona510.

## Observable truths and requirements

| Truth / requirement | Status | Evidence |
|---|---|---|
| Release metadata identifies1.45.0 and approved contracts accurately — M145-01 | VERIFIED | `package.json:3`, `CHANGELOG.md:13`, `README.md:5`; version-only package change. Release notes describe registry/settings/source/CAS/execution contracts and initial-import correction without claiming handlers or runtime completion. RAW/metadata-red.log shows wrongversion1.44→AssertionError; metadata-green.log shows candidate success. |
| Native regression and reproducible committed distribution retain canonical contracts — M145-02 | VERIFIED, retained native proof | RAW/full-native.json:5036/5036 cases in167file results,0pending/skip/todo; QUALITY.json:10/10commands exit0; dts.log:386/386portable declarations; BUILD-PARITY.json:1544/1544files. Default-final report is byte-identical to default-before,36/36. Follow-up lint-final.exit=0. Current Git diff of src/dist/pnpm-lock against approved6d is empty. |
| Published finalSHA is installed natively in Forge/X9 and all public paths resolve — M145-03 | VERIFIED, gap closed | RAW/INSTALLS.json:6/6stages for3/3roots onexacta510; CONSUMER-CHECKS.json:16/16commands;4contexts×18paths×2formats=144/144freshloads;8/8separateTScompilations;19/19semanticprovenancefaults and8/8typefaults red/restored. Independently read currentinstalled dist:6176/6176comparisons equal candidate and recorded report. |

Roadmap phase goal and PLAN truths are satisfied together. REQUIREMENTS names two consumer families; authorized PLAN's stronger three-root/four-context acceptance was retained in full. There are no scope overrides.

Native Vitest JSON reports566suite objects from nested suites; **167** is the file denominator. Ten quality commands and16consumer commands are process outcomes, not counts of new semantic assertions. The158Models assertions per context are existing public contract checks;632/632executions do not claim632newtests or runtime flows.

## Actual installation and resolution matrix

All roots are private copies under RAW, materialized from safe tracked immutable consumer revisions. ForgeFactory and ForgeWeb use **8814f3c6f287b97761ae012dc4c1bb0f2349d31d**; X9 uses **f2cf34aa1f8bdba99d28c496d3d1f598de1d2a06**. `SNAPSHOTS.json` records sources and excluded protected paths.

| Installed context, relative to RAW | Root | Fresh loads | Existing Models assertions | Separate TS probes | Current dist byte comparisons |
|---|---|---|---|---|---|
| `forge-factory/services/factory` | `forge-factory` |36/36|158/158|2/2|1544/1544|
| `forge-web/web` | `forge-web` |36/36|158/158|2/2|1544/1544|
| `x9/services/agent-core` | `x9` |36/36|158/158|2/2|1544/1544|
| `x9/packages/capability-sdk` | `x9` |36/36|158/158|2/2|1544/1544|
| **Total** | **3/3 roots** |**144/144**|**632/632**|**8/8**|**6176/6176**|

The6176count is four context comparisons; core andSDK resolve the same physical X9 package tree. There are three independent installation roots, not four independently installed package trees.

`INSTALLS.json` records native `pnpm install --lockfile-only --no-frozen-lockfile --prefer-offline`, followed by actual `pnpm install --frozen-lockfile --prefer-offline`, for each root; all six stages exit0 and identifya510. The override is GitHTTPS#fullSHA and native lock resolution uses codeload/thatSHA. This is the package manager's real Git dependency transport, not a substituted local tarball. Native lifecycle policy remained active; no `--ignore-scripts` fallback was introduced. Unrelated lifecycle scripts blocked by the existing allowlist and hooks-only prepare's nonfatal missing.git notice remain explicit limits.

### Independent current installed-artifact reads

For each named `*-entrypoints.json`, the verifier read `provenance.installedRoot` from disk, parsed the adjacent actual package manifest, hashed every current dist file and compared the whole path/hash map with both the author candidate and recorded installed hashes. All four identifyversion1.45.0 andexacta510;1544files/contextmatch. Root and installed virtual-store `lock.yaml` bytes are equal in all four contexts. Therefore final stored results are also consistent with current restored installation bytes.

Actual installed roots are native paths below each root's `node_modules/.pnpm/.../node_modules/@x9-forge/contracts`; they are outside the author bridge. pnpm truncates the virtual folder's display SHA, so provenance properly uses the actual importer/root/installed locks plus full content hashes, rather than falsely requiring the entire SHA in a folder name.

## Existence, substance and wiring

| Link / artifact | Verification |
|---|---|
| Native metadata/build → release package | Version1.45, unchanged exports/scripts/dependencies; native zshy/dts/check:pack results and1544-file second-build parity supported by raw reports and build-parity.py. |
| Native test → independent first-entrypoint runner | `package.json:135` → `tests/cjs/smoke.cjs:165`; default36/36report identical before/final after consumer CLI addition. |
| Explicit context → installed package | Runner:40–49 requires all context options and confines context/install/realpath to native store. Actual consumer createRequire resolution is exercised in four contexts. |
| Consumer override/selected importer → immutable remote SHA | Runner:50–66 binds exactGitHTTPSoverride, specifically selected importer specifier/codeloadresolution and installed/root lock equality. The unrelated expected-SHA-entry mutation fails as intended. |
| Installed package → version/export map/dist | Runner:67–74 checks actual package identity/version, full export map and full distribution hashes. Current independent6176-file comparison agrees. |
| Context → first-import runtime semantics | Runner:77–90 launches a fresh process for each path/format from consumer cwd, checks nonempty namespace and actual valid/invalid canonical key parsing.144results allpassed. |
| Installed declarations → consumer compiler | Eight separate NodeNext strict/noEmit compilations; Factory/core/SDK retain nativeTS6 with explicit-fileignoreConfig, Web retains nativeTS5 without it. Wrong canonical function type causesTS2322inall8probes. |

These are substantive executed links, not merely existing files. UI/ORM data-flow gates are not applicable: no UI or database schema changed. RAW/SCHEMA-DRIFT.json records drift_detected=false,blocking=false. RAW/SNAPSHOT-DELTA.json records all tracked consumer files unchanged except package.json/pnpm-lock.yaml/pnpm-workspace.yaml in each private snapshot; outsideInstallationConfigChanges=0 for3/3roots.

## Causal negative checks and exact restoration

The verifier inspected every named red and restored log referenced by `CONSUMER-MUTATIONS.json`. All **19/19** show the expected AssertionError guard, not network/install/timeout failure; every restored log ends36/36first-entrypointchecks and has recorded exit0. Mutation script restores original bytes and asserts equality for modified manifests, lock files and dist, and restores the actual consumer symlink. Current installed manifests/locks/dist agree with the candidate independently after the campaign.

| Deliberate fault | Observed semantic guard |
|---|---|
| unknown-option / missing-value / required-consumer-option | CLI unknownoption / missingvalue / requiredconsumer assertions |
| expected-version / sha-shape | Installedversion mismatch / immutableSHAshape assertion |
| consumer-containment / author-self-reference | Context containment / outsideauthorbridge assertion |
| override / installed-name / export-map | ExpectedGitoverride / packageidentity / completeexportmap assertion |
| importer-missing / dependency-missing | Selectednativeimporter / actualbridge dependency assertion |
| specifier-sha / resolution-sha-unrelated-preserved | Selectedimporter's exactspecifier / exactremoteSHA assertion |
| installed-lock | Installedvirtualstorelock equals frozenrootlock assertion |
| dist-byte / dist-symlink | Fulldistributionhash equality / nosymlinks assertion |
| outside-node-modules / resolution-sha-path | Actualpackage must lie in nativeconsumer `.pnpm` store assertion |

Two path cases exercise the same native-store guard under different copied-package destinations; they are two causal faults, not two distinct product safeguards. The campaign validates provenance/CLI assertions. It does not introduce or claim19independenttests of all18exporttargets. Existing first-import parser semantics remain directly asserted in the144fresh processes.

`TYPE-MUTATIONS.json` records **8/8** separate `.mts`/`.cts` faults: canonical function string changed to42, each redexit2/TS2322, exactRestoration=true andrestoreexit0. The verifier read all eight named `context-types-format-red.log` diagnostics. Type mutation script uses finally to restore original bytes, reruns each original compilation and assertsbyteequality. Metadata wrongversion red/green is **1/1**, separate from the19provenancefaults and8typefaults.

## Prior gap trajectory, retained honestly

Initial verification was **gaps_found2/3**. First task3 lot stopped under R32 after three technical attempts: fullSHA-in-pnpm-folder false assumption; TS6 explicitfiles needsignoreConfig; WebTS5 rejects that flag. Earlierf68 results are preserved in their diagnostic history and not counted as finala510qualification. Coordinator publication ofa510 at10:52:35 resolved the publication gate; new gap lot authorized10:55:01 permitted resumed execution under01-02.

During the gap mutation campaign, a workspace-only delimiter bug interrupted after13qualified faults. `CONSUMER-MUTATIONS-ATTEMPT1.json` preserves those13; the script corrected its delimiter, retained qualified results and ran only thesixremaining faults. Final19records are19distinct observations, not13+19. The failed harness interruption itself is not credited as semantic fault coverage. All final install/load/type/mutation totals above refer toactuala510results.

Native fullsource5036/5036 was executed onf68 before build. A510 changes only two provenance assertions in the test runner; later changes are phase documentation. The verifier independently checked canonical src/dist/pnpm-lock unchanged from6d, preserving native contract/build qualification without claiming a repeated full run on finalSHA. Default-final36/36byteequality and follow-up lint0 cover the amended runner's retained default behavior.

No TODO/FIXME/placeholder stub was found in the reviewed changed runner. Native check:pack exits0 under its unchangednode16/false-cjsprofile, with the pre-existing CJS.types ambiguity warning explicitly retained; this is not warning-free package qualification. No false green, fallback local package, unapproved contract rewrite or runtime inference is accepted here.

## Fruibilità alla consegna (R-34)

**La feature è completa?** La fase assegnata di distribuzione del contratto Modelli1.45.0 è implementata e verificata: metadata, distribuzione nativa e installazione del commitpubblicatoa510nei consumatori isolati Forge/X9. La feature Modelli nel prodotto e il suo cambio effettivo nei runtime non sono dichiarati completi da questa fase.

**Cosa ne impedisce l'uso?** Non rimangono gap di installazione nei tre ambienti isolati provati. Restano la revisione indipendente della release da parte di un altroCodex, l'adozione coordinata nei consumatori reali e la prova funzionale dal vivo della feature complessiva. **0/34 percorsi Modelli dal vivo verificati da questa fase.** F non ha eseguito push/tag/merge/deploy; la pubblicazione è della coordinatrice.

**Prova del percorso dell'utente:** Chi integra il contratto parte dai commitimmutabili Forge8814f3c6/X9f2cf34aa in copie private; imposta GitHTTPS#**a5103c97c39b6178e8d53f201f27352c0fb58220** con policy nativa; aggiorna il lock; installa frozen; risolve il pacchetto dalla cartella effettiva Factory/Web/core/SDK; controlla versione1.45.0, export e1544filedist; esegue144/144primiimport/require,632/632asserzioniModelli e8/8compilazioni. Le prove negative rilevano19/19guasti di provenienza e8/8guasti di tipo; i ripristini tornano verdi e i file installati correnti sono identici alla distribuzione candidata.

## Corrispondenza aspettativa e tavola (R-34)

**Aspettativa:** fase1 dellaROADMAP eM145-01/02/03 richiedono release identificabile, distribuzione canonica fedele e installazione autentica daSHA inForge/X9.

| Aspettativa | Percorso provato / corrispondenza |
|---|---|
| Identificazione1.45 e note accurate | package/CHANGELOG/README; metadato wrongversion rosso→verde; M145-01VERIFIED |
| Contratti e distribuzione nativa integri |5036/5036baselinef68,10/10qualità,386/386dichiarazioni,1544/1544parità; source/distidentitàconfermata; M145-02VERIFIED |
| Installazione pubblicata e risoluzioneconsumer |3/3root,6/6stadi,4/4contesti,144/144caricamenti,8/8compilazioni,6176/6176confrontibyte; M145-03VERIFIED |
| Controlli capaci di rilevare il guasto |1/1metadato,19/19provenienza,8/8tipi rossi e ripristinati; nessuna failure di rete accreditata |

**Tavola:** non serve: questa fase distribuisce un pacchetto di contratti senza interfaccia visiva. La tavola della paginaModelli e le prove utente sui runtime appartengono alle rispettive fasi prodotto.

## Final outcome

All three phase requirements are verified; prior goal gap M145-03 is closed with observed finalSHA evidence. **Status passed,3/3.** Canonical contract identity, actual native transport and installed runtime/type resolution are all supported. Scope is exclusively **01-modelli-bridge-145**, the new release phase; it does not mark historical v1.0 Capability Contracts, Shim Cleanup or an entire unrelated milestone complete. Independent review by another Codex remains pending and must be recorded separately; this verifier report does not grant publication, merge, deployment or live-product approval.
