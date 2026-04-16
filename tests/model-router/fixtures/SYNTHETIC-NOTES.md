# Phase 6 Model Router Fixtures — SYNTHETIC

All fixtures in this directory are **invented**. Phase 6 is greenfield — there
is no live `POST /internal/model-config` endpoint at fixture-capture time.

Will be replaced with staging captures once Phase 35 X9 ships and a live
endpoint exists.

Per CONTEXT D-26/D-27:
- 2 push requests (minimal, complete)
- 5 push responses (1 success, 4 error codes)
- 1 hot-reload notification (minimal)
- 2 registry entries — live under `tests/capability/fixtures/` and are added
  by plan 06-03 (`registry-entry-with-model-policy.json`, `registry-entry-without-model-policy.json`).

Fixtures embed a `"_note"` field at the root level. Bridge schemas use
default-strip semantics (Zod v4 `z.object()` drops unknown top-level keys
on `.safeParse()`), but the test helper strips `_note` explicitly so fixtures
stay self-documenting without impacting parse semantics.

## Lineage convention (Phase 35 handoff)

When a fixture is replaced with a real capture from staging or production,
update its `_note` to the canonical form:

    "_note": "STAGING — captured 2026-MM-DD from agent-x9@<sha>"
    "_note": "PROD — captured 2026-MM-DD from agent-x9@<sha>"

Synthetic fixtures retain the free-form `"_note"` they have today. The
`STAGING — captured` / `PROD — captured` prefixes act as a grep-able audit
signal so PR review can see fixture lineage drift at a glance without
opening each JSON.
