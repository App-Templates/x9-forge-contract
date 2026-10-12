# Bridge composition 1210
Mandate: BRIDGE-COMPOSIZIONE-1210; local merge commits only; version remains 1.47.0.
## Esistente (R-35)
Base 524b5fad owns read-only initial model rows; C e45f815 owns c.3 News/Briefing.
F d98c0c05 owns native ordinary, durable binding reads and scoped Coach/browser contracts.
Reuse these schemas and generators; resolve barrels by union and preserve existing guards.
## Execution
Merge C then F without squash; rebuild dist from source after each merge.
Test same-package imports and initial-row read-only/CAS boundaries with all additions present.
Run one worker in an empty environment; final full suite, types, build and package probes.
One final D review followed by coordinator control2; no consumer, pin, push or deploy.
## Fruibilità (R-34)
Consumers can import all three approved contract families from one local package.
Use synthetic production-shaped fixtures; consumer adoption and live proof remain separate.
