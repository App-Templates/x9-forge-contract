# Native configuration in ordinary-v2
Request: D 20261011-193636; additive Bridge delta from composed 9b0477e3.

## Esistente (R-35)
`ordinary-configuration.ts` already validates structured values, declarations, CAS and scope.
`agent-elevenlabs/native-config.ts` already owns the complete strict native schema.
Manifest/registry declarations and capability exports already share these schemas.

## Implementation
Register `agent-elevenlabs.nativeConfig`, schemaVersion 1, using the existing native schema.
Include the same schema in ordinary values; preserve B1 and nativeDesired scope/version/hash.
Move concrete native settings and shared elementary values to leaf modules; preserve public re-exports.
Test declaration, write, mismatch, inheritance, call/effective state and package ESM/CJS.
Run targeted tests/types, security mutations, build, final suite and package checks.
Deliver a separate local installable artifact; no bump, pin, push or provider changes.

## Fruibilità (R-34)
Consumers can declare and carry concrete native settings through ordinary-v2 without JSON strings.
Validate the existing production-shaped synthetic fixture locally; provider/live adoption belongs to D.
