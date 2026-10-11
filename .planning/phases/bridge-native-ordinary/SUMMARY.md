# Native configuration in ordinary-v2 — local delivery
Request D 20261011-193636; base 9b0477e3, branch codex/bridge-native-ordinary-f.
Registered `agent-elevenlabs.nativeConfig`, schemaVersion 1, in the existing ordinary codec/value schemas.
Reused ElevenLabsNativeConfigSchema; manifest/registry declarations and public capability exports retain the object.
NativeDesired scope/version/hash, legacy B1 and provider behavior are unchanged.
Concrete native settings and elementary requestId/credentialKey/voice/text schemas now live in leaf modules.
Original public modules re-export those same schema instances; no duplicated validator or new DSL.
The full suite exposed import cycles; leaf modules fix direct and barrel imports. ToolCall remains unchanged.

## Validation
Clean env, Node24, one Vitest worker/file at a time; local synthetic production-shaped fixtures.
New tests: baseline 11/15 failed, 4/15 passed; final 15/15 passed.
`vitest run --config <chat>/work/native-ordinary/vitest.config.mjs`: 6102/6102, 223/223 files, 64.25s.
`node tests/cjs/smoke.cjs`: passed; `tsc --noEmit`: passed; ESLint: 13/13 changed TS files passed.
Build/generator passed; portable declarations 498/498; publint/attw passed with existing root CJS-types warning.
Security mutations auth/scope: 2/2 caught (1/1 + 3/3 assertions); restored 15/15 green, no mutated source saved.
Packed archive: 34/34 ESM/CJS probes, including 14/14 fresh import orders; Python regression 15/15.
Package/build parity: 1994/1994 dist files. Archive: outputs/bridge-native-ordinary/x9-forge-contracts-1.46.0.tgz.
Package version/exports/lockfile/CHANGELOG unchanged; no consumer pin, push, publication or deploy.

## Fruibilità alla consegna (R-34)
Consumers can declare/write/inherit/freeze concrete native settings through ordinary-v2 and import the local package.
Provider use, end-to-end consumer adoption and live verification remain with D; final independent review pending.
Measure: product +69/-46 across 12 source files, tests +126/-0, PLAN+SUMMARY 43 lines; generated dist excluded.
