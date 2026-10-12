# Bridge composition 1210 — local candidate ready for D review
Base A: 524b5fad8eafaf39ad0fe5d14f23c874485ebef4 (initial rows read-only; version 1.47.0).
C c.3: e45f8158af64c951fb39a6148ff7a63eec0e51ac, via merge 5091324d097eb3feb028de956c4838ea406754d2.
F Native/Coach: d98c0c054d2575f49ca9b87af1e2c12f79f890f1, via merge b940bf76ba1d5f37d6b4b9f0b83fe6b278b207bd.
History retained with two merges; no squash, version/pin/consumer/push/publication changes.
## Conflicts resolved
C: capability/index.ts and http/endpoints/index.ts use the union; internal-agent-turn.ts retains base trusted identity.
C: internal-agent-tool-dispatch.ts retains all18 base actions and TTS_PROVIDER, adds5 approved actions:
news_digest, news_digest_topic, calendar_today, calendar_week, lab_execute (23/23 total; exact set tested).
C tests: dispatch, two CJS inventories and model composition retain both families and exact23 count.
C package.json retains1.47.0; CHANGELOG retains both histories; root .planning state/requirements/roadmap retain base.
F: http/index.ts exports both News/Briefing and Coach authority. All dist conflicts rebuilt; Python regenerated.
ordinary-configuration.ts merges automatically with canonical native codec; models-batch.ts remains byte-identical to A.
## Validation (empty environment, Node24, one process, one worker)
`vitest run --maxWorkers=1 --minWorkers=1 --no-file-parallelism --testTimeout=60000`:6416/6416,231/231 files,0 skips.
Focused models/dispatch/composition:168/168 in3/3 files; new composition test5/5, including compiled package imports.
Initial-row security mutation: source1/1 and compiledESM1/1 assertionRED; each filters4 other cases; restored168/168.
`tsc --noEmit`, ESLint new test, zshy, Python generator and portable declarations514/514:exit0.
`node tests/cjs/smoke.cjs`:exit0, including38/38 entrypoints and396/396 Keys/Models assertions.
`publint` and `attw --pack . --profile node16 --ignore-rules false-cjs`:exit0; existing root CJS types warning unchanged.
Archive extracted: `node tests/cjs/bridge-compose-1210.mjs <package>`32/32 ESM/CJS assertions; generated Python15/15.
Artifact: chat outputs/bridge-compose-1210/x9-forge-contracts-1.47.0-composed.tgz (package.json,README,dist only).
## Fruibilità alla consegna (R-34)
One local package imports initial Models, News/Briefing, Native and Coach; synthetic production-shaped payloads pass.
Initial observations stay read-only and reject CAS0; native/browser and Master scope boundaries remain enforced.
Consumer adoption and real-provider/PWA flow are not verified here; independent D review and coordinator control2 remain.
Manual additions today: product0 lines; new tests108 lines; PLAN14+SUMMARY27+new CHANGELOG entry7=48 lines; imported/generated excluded.
