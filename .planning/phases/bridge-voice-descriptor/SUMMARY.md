# BRIDGE-VOICE-DESCRIPTOR — ready for independent review

Base a251bbc9451381a67afa10f330fa5a3b501e8ba4, version1.43.0, branch codex/bridge-voice-descriptor, worktree119-1. Implemented and tested locally; release and Forge consumption remain separate coordinator work. No push, merge, tag, version bump or deployment.

## Behavior and R-31

Public /voice export agentVoiceSettingsFromModelDescriptor(input), with exported ModelDescriptorVoiceInput and ModelDescriptorVoiceResult. Input requires canonical descriptor, role, explicit voice choices and producer voice catalog. Explicit rows: openai/realtime→openai_live, elevenlabs/speech or realtime→elevenlabs. Unknown providers including constructor produce typed unsupported_voice_model, never a default. API protocol and media protocol are distinct; no first catalog model, voice or transport is selected. Full enabled settings preserve exact modelId, caller locale/params and choices, clone mutable input data, and always pass validateAgentVoiceSettings before success. Canonical schemas handle malformed input, descriptor, choices and catalog. This function does not attest model access, adapter availability, authorization or catalog freshness.

## Proof

Tests preceded implementation: 1/1 native export AssertionError. Final target52/52. One complete mutation campaign17/17 detected,44 native AssertionError failures,17/17 exact-source restores followed by fresh52/52 greens. Both provider rows and all3 protocol combinations are mutated; input/descriptor/choices/catalog schemas, voice role, unknown-provider fallback, API protocols, exact model, explicit/optional choices, catalog validator and output order are covered. No import errors, crashes or timeouts counted as red. Recipes and raw native reports are in proof/ and FINAL-PROOF.json records hashes.

Native Node24 env -i full suite3279/3279,0 failed,139/139 files. Native CJS112/112 assertions across5 probe groups; new public ESM/CJS6/6 assertions. Both exported declaration consumers2/2 compile. Build with336/336 portable declaration files, check:pack, full tests, native CJS, typecheck, entire src/tests lint, public JS consumers and typed consumers:8/8 commands exit0. check:pack retains the pre-existing root types-CJS warning and native ignored false-cjs rule; no new overrides.

All source changes stay within the authorized index/helper/test, generated dist and this phase. Original package.json/lockfiles unchanged. Review by another Codex is still required. Source SHA256 ef6b646848221235242f12099fb5011035e90aa9ddf0ffeaf1ca65269ccfb6c3; final test SHA256 93e386980c9c051ac46f9d461f3587946c62bf5c48bbdea40799700127c71c96.
