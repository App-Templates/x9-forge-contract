# Plan 04-03 Deferred Items

Scope-boundary items surfaced during Plan 04-03 execution but NOT fixed by
this plan per the GSD executor scope rule (fix only issues caused by the
current task's changes).

## cap-briefing pre-existing test failures (7)

Observed at baseline and after 04-03 migration. Unrelated to HTTP endpoint
contracts — these tests reference cap-briefing / rule-engine logic.

Failures:
- `briefing-config.test.ts > loadBriefingConfig() returns defaults when file does not exist`
- `briefing-config.test.ts > saveBriefingConfig() with partial fields applies defaults`
- `briefing.test.ts > POST /call/briefing_generate > returns success with sent: true and wordCount > 0`
- `briefing.test.ts > POST /call/briefing_generate > returns briefing with calendar error phrase`
- `briefing.test.ts > POST /call/briefing_generate > sends multiple audio chunks`
- `briefing.test.ts > POST /call/briefing_generate > returns briefing with news error phrase`
- `digest-send.test.ts > digest-send tool > 3. truncates content when recipient has filter.maxWords`

Action: owner of agent-x9 Phase 33 (cap-briefing rule-engine refactor) should
triage. None were caused by Plan 04-03 changes.

## Stale `*.js` / `*.d.ts` artifacts in X9 `src/` trees (widespread)

Services `cap-scheduler`, `cap-contacts`, `memory`, and several others carry
committed compiled `.js`/`.d.ts` files next to their `.ts` sources
(pre-existing; from an older build strategy that did not use `outDir: dist`).

Plan 04-03 cleaned only `cap-voice/src/**` because those files were actively
shadowing the fresh TS sources during vitest runs (blocking 04-03-07). The
same cleanup is recommended for:
- `services/cap-scheduler/src/*.js`, `src/tools/*.js`
- `services/cap-briefing/src/` (if present)
- `services/cap-netatmo/src/` (if present)
- other services — run `find services -path '*/src/*.js' -not -path '*/node_modules/*'`

Action: a small chore plan in a future phase to drop these and ensure
`outDir: dist` is honored everywhere.

## 04-03-09 VPS staging deploy

Requires Hostinger SSH credentials not available to this executor. See
`04-03-SMOKE.md` for the deferred deploy checklist.
