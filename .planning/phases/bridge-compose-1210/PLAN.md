# Bridge composition 1210
Mandate: BRIDGE-COMPOSIZIONE-1210; local merge commits only; version remains 1.47.0.
## Esistente (R-35)
**Esiste già?** Sì: all three approved contract lines already exist; this task combines them.
**Dove vive oggi:** src/http/endpoints/index.ts:9; src/http/index.ts:9; src/model-router/models-batch.ts:1.
**Come funziona oggi:** A defines initial read-only model rows; C defines scoped News/Briefing; F defines native binding and Coach/browser authority. Consumers import the generated bridge package.
**Vecchio Forge:** non esisteva: this exact three-parent package composition is a new technical integration, not a redesign of a legacy user flow.
**Comportamento da mantenere:** Preserve all parent schemas, initial read-only/CAS guards, trusted identity, scoped authority and existing exports.
**Cosa si riusa:** A524b5fad, Ce45f815 and Fd98c0c05 sources and existing generators.
**Si riscrive?** No: reuse approved contracts; combine barrels and regenerate dist.
**Cambia come funziona lo stack?** No: only compose existing approved contracts; no consumer or runtime changes.
## Execution
Merge C then F without squash; rebuild dist from source after each merge.
Test same-package imports and initial-row read-only/CAS boundaries with all additions present.
Run one worker in an empty environment; final full suite, types, build and package probes.
One final D review followed by coordinator control2; no consumer, pin, push or deploy.
## Fruibilità (R-34)
Consumers can import all three approved contract families from one local package.
Use synthetic production-shaped fixtures; consumer adoption and live proof remain separate.
