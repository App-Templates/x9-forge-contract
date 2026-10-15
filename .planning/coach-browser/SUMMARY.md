# Coach browser and person/program boundary — local candidate

Coordinator perimeter233133, RIPARTITE003247; branch codex/bridge-native-ordinary-f, base06bbde47.
Implemented, tested locally and independently reviewed. Native component77a68520f6050dc042b6ec0d992148bbe62a1d62; app component is this separate commit.
Coordinator004656 aligned R-20 paths already approved233133. D004400 APPROVE: no blocking findings, independently reproduced108/108 and archive/dist2034/2034.
Meditation pauses after this delivery by coordinator004656. No consumer adoption, production or live migration is attested.

## Behavior
Native bindings/read observes one existing attempt-index/session record under exact person scope and compares the full trusted original Forge attempt.
A <=60s observation never extends admission. Absence, pause, revoked and expired attempts are facts, never a permission grant.
Person/program read returns strategy/version-partitioned person state plus full immutable program-pin history, deterministic descending time/ID, unique records and bounded opaque cursor pages1..100.
Existing operational authority operation `read` is reused by producers; no new authority enum, source, DTO or issuer.
Browser POST /api/coach uses Forge session auth. Clerk person, program, original opening and proof stay server-resolved.
Twelve action kinds (open has text/native variants) expose opaque refs, canonical strategy payloads, reduced budget/execution/practice/measure views.
Strict structural privacy guards are not ACLs or free-text redaction; strategies publish browser-safe projections.
Native mint validates the original server request/current binding/ref/clock before exposing only the ephemeral canonical connection; Cache-Control:no-store is mandatory.
Do not log, persist or cache that connection. Transport fallback retains sessionRef and uses a distinct requestId.

## Evidence
Focused108/108: Native31/31, person/program24/24, browser53/53.
Final source full6286/6286 in227/227files, no skips; one process/worker1.
Guard mutations30/30 assertionRED (Native8, person7, browser15), restored before final full.
Types and lint6/6files exit0. Native-only build/dts504/504/portable generator exit0.
Combined dual build/dts508/508/portable generator and CJS smoke exit0.
Publint and attw exit0; existing root types warning and node16/false-cjs profile unchanged.
Packaged tests216/216 =108 ESM+108 CJS; compiled guard mutations2/2 assertionRED and restored216/216.
Dist parity2034/2034 between archive, extracted package and working build.
Initial Vitest startup permission failures were0/0 and do not count as red proofs; an initial publint CLI-path failure was corrected before the successful check.
All checks used an empty process environment with explicit local runtime paths; no .env values loaded, no install or service/network use.
Archive: x9-forge-contracts-1.46.0.tgz
SHA256: eef3dc75f1fd5cd194656567a82c72115618e5d3c57832d346adddf7c1c77b59
Frozen seven source/test/barrel hashes: private output SOURCE-MANIFEST.json.

## Fruibilità alla consegna (R-34)
D can review the frozen source candidate/package, then adopt after final commit/review confirmation in his own copy.
The public HTTP barrel exports all new schemas, types, contracts, path/correlation helpers and browser projection adapters.
B consumes Native pregrant read only through that canonical API and D's exact durable reader; no second open, latest-binding fallback or authority from readback.
Producer access checks/rechecks, program management authority, real browser integration, migration/rollback and live operation remain consumer work.
No existing schema, version/pins, consumer, issuer/store, production, push, merge or deployment changed by F.
