# Fixture Redaction Notes — Phase 5

Per `.planning/phases/05-vault-contracts-block-e/05-RESEARCH.md` §Fixture Strategy and ASVS L1 §V7.

## Plain fixtures
- `vault-entry-plain-agent.json` — `value="REDACTED"` (synthetic; replaces what would be an OPENAI_API_KEY).
- `vault-entry-plain-platform.json` — `value="not-a-secret"` (isSecret=false; no redaction needed).

## Encrypted fixtures
- `vault-entry-encrypted-agent.json` — `value` is synthetic lowercase hex matching `AES_WIRE_FORMAT_REGEX`. NOT real ciphertext. Sentinel `_synthetic: true`.
- `vault-entry-encrypted-owner.json` — same pattern, different synthetic hex.

## Rule
Never commit real plaintext secrets. Never commit real ciphertext captured from staging.
All encrypted fixtures must carry `_synthetic: true` and use made-up hex.
