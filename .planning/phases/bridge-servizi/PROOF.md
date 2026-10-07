# Verification recipe

Original94-1 base93e8c4d. Private copy /private/tmp/codex-e-bridge-servizi-20261007/checkout. All values in negative tests are synthetic metadata sentinel strings. No real credentials/environment files were accessed.

Tests:
`node node_modules/vitest/vitest.mjs run tests/agent/agent-credential-services.test.ts --maxWorkers=1 --no-file-parallelism --testTimeout=60000`
Full suite same worker flags without file selection; native typecheck, eslint src/tests, zshy build, portable declarations, publint, attw --pack node16 ignoring existing false-cjs profile rule, native tests/cjs/smoke.cjs.

Initial red: before adding export/module the public agent entry lacks AGENT_CREDENTIAL_SERVICE_METADATA (qualified assertion1/1). After implementation62/62 targeted cases: public exports1, exact independent declared keys1, per-key attestation33, invented services5, malformed services6, unknown/prototype keys6, forged/value-bearing metadata8, selector cannot claim active provider1, immutable registry/service/candidates1.

Mutation definitions independent of tests: for every33 declared entry remove it (exhaustiveness assertion), replace its service with another real brand/internal service or wrong valid candidates, change kind, flip secret, empty label. Further bypass candidate cardinality/uniqueness, commercial/internal enum, strict service/metadata, canonical binding, own-property guard and each of registry/entry/service/candidate freezes.177/177 nonzero native runs with actual AssertionError failures, no compilation/collection/TypeError counted. Exact restoration after each. Logs and machine reports in parent private directory; compact mutation ledger will be saved alongside this document.

Installed artifact probe: npm pack --ignore-scripts to private directory; npm install --offline --ignore-scripts --legacy-peer-deps --package-lock=false into fresh consumer. Zod linked from local existing dependency. Separate ESM/CJS imports via actual package exports (no source aliases), full33-key payload schema checks plus direct commercial/internal/multi-provider/unknown/forged/public-key cases. Separate Node16 .cts/.mts declaration consumers include @ts-expect-error for invented key. No published release performed; archive retains existing1.39 version for local packaging proof only.

Final results: targeted62/62; full2681/2681 in125files,0failed/0skipped; mutations177/177;9/9 native steps;304/304 portable declarations; native CJS57/57; installed ESM108/108,CJS108/108,CTS/MTS2/2. See FINAL-PROOF.json.
