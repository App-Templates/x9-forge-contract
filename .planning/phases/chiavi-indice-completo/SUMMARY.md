# Chiavi — canonical provider index complete

Ultimo aggiornamento: 19:25 CEST, 09/10/2026.
Base e22e7a2d138be7120cd79800a7ada102183e7e74; worktree175-1, branch codex/chiavi-indice-completo.
Version remains1.44.0. F owns later1.46 composition; this preserves the production Chiavi vendor lineage.

## Implemented and tested offline

Added eight known, explicit optional string fields: three Google Contacts OAuth fields and five Netatmo OAuth/account fields. Metadata identifies their commercial service and credential kind; Calendar CLIENT_ID is also credential kind. All three public client IDs remain non-secret. Secret/token/password fields remain secret. No platform/internal keys, routes, existing credential values or new dependencies changed.

The exhaustive registry fixture now checks42/42 declared keys, including INTERNAL_TOKEN, preserves negative unknown-service/prototype/forged-metadata checks, and uses NETATMO_UNKNOWN_KEY for the still-unknown case.

| Proof | Before | After |
|---|---|---|
| New source regression |25/25 AssertionError,0/25 passing|25/25 passing within104/104 targeted|
| Complete bridge suite |No pre-change complete baseline claimed|4741/4741,164/164 files,0skip/todo|
| Deliberate source cuts |53/53 detected by assertions|53/53 exact byte/SHA restores;25/25 fresh after each|
| Compiled ESM/CJS public entry probes |106/106 detected by AssertionError across2variants|106/106 exact restores;25/25 fresh per variant after each|
| Types/lint/build/package/CJS |Not counted as product tests|All exit0;378/378 portable declaration scans|

Existing CJS runner:36/36main+6/6BRIDGE130+15/15R7+16/16catalog+39/39batch probes, kept distinct from Vitest4741. New compiled probe25/25 for ESM and25/25 for CJS, also separate.

Raw outputs, recipes and SHA256 manifest are under proof/ and PROOF.json. Full fresh run was repeated after all mutations. First full run raced dist build and lost ESM resolution (no semantic failed tests); excluded. The first missing-entry mutation left an invalid comma; excluded syntax diagnostics are preserved, then the full53/106 campaigns repeated with valid mutations. Neither diagnostic counts as a qualified red.

## Remaining Forge consumer work

Forge176-1 base568d4924 has no vendor directory in Git or on disk; it uses the existing Git override e22e7a2d. Requested a narrow pnpm-workspace.yaml allowlist extension and coordinator publication of this qualified SHA before pinning it. No local vendor or alternate transport introduced to bypass verify-bridge-pin. Next: nine native import regressions red on old pin, then approved pin/lock/allowlist update, complete Vault suite and types.

## Fruibilità alla consegna (R-34)

Bridge supports the existing Master import metadata path. Native Forge import is still pending; production import and real provider verification0, not claimed. No secret/env access, push, merge, deploy or server commands.
