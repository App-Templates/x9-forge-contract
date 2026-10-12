# Coach explicit proof transport — local delivery
Separate additive delta above5405bda; branch codex/bridge-native-ordinary-f.
D request221306 and agreement221604; coordinator perimeter220750 already includes the new HTTP module/tests/dist.
First authority delta5405bda remains independently APPROVE D; this follow-up adds only transport and its checks.

## Behavior and canonical imports
From @x9-forge/contracts/http: COACH_OPERATIONAL_AUTHORITY_PROOF_HEADER = X-X9-Coach-Authority-Proof.
CoachOperationalAuthorityProofHeaderSchema decodes admission:<proofId> or session:<proofId> through the existing strict proofRef schema.
formatCoachOperationalAuthorityProofHeader validates a proofRef and emits the single header value; IDs may contain further colons.
parseCoachOperationalAuthorityProofHeader(raw, mode) requires trusted server mode legacy|managed, never a caller flag.
Only undefined legacy returns null; missing managed, null, arrays, comma-merged duplicates, whitespace, CRLF and invalid kind/ID throw.
The reference is neither a credential nor authorization: producer must recheck current scoped program/opening/evidence and requestId.
Existing operational DTOs, authority semantics and authentication headers remain unchanged.

## Validation
Focused73/73 and final full6178/6178 in224/224 files passed; no skips.
Missing-API baseline5/25 red;20/25 throw checks initially non-probative, now exposed by explicit decoder/formatter mutations.
Two missing-separator regressions2/2 red before the guard, then green; four transport mutations4/4 caught by assertions.
Types, lint2/2 files, build, portable generator, CJS smoke, publint and attw exited0; declarations502/502 portable.
Existing root types warning and node16/false-cjs pack profile unchanged.
Packaged ESM/CJS52/52; compiled managed-header mutation1/1 red; restored52/52; dist parity2010/2010.
Archive SHA256049e2a0b5c381f7ad39d5f2ad3ecf8ce8b91a7ac82174a9cf51f14981e478960; previous9635b0c2 archive preserved separately.
Commands: isolated vitest full/focused; tsc --noEmit; eslint2files; zshy+portable scripts; publint/attw; packaged probes.

## Fruibilità alla consegna (R-34)
D can install outputs/bridge-coach-authority-header/x9-forge-contracts-1.46.0.tgz and wire its existing Coach HTTP client/handler.
Use verified admission attemptId for opening and correlated durable session reference for later operations; no latest-grant fallback.
Final independent delta review requested from D after commit; producer integration, real operation and common release remain open.
No consumer, original checkout, pin/version, production, push, merge, deployment or real session changed by F.
