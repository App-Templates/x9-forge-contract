# 34-21 — Scoped native turn producer

- Added optional canonical admission identity to the per-agent turn contract; unscoped legacy bodies are unchanged.
- Moved the existing identity schema to a dependency leaf and re-exported it unchanged, avoiding a circular import.
- Necessary paths beyond plan21: producer schema/context/identity leaf, native contract test, generated dist and this summary; native core/adoption documented with consumer21.
- FIRST: 4/5 new schema assertions failed semantically; the legacy-body case was already green.
- GREEN: `pnpm exec vitest run tests/http/endpoints/internal-agent-turn.test.ts tests/capability/capability-call-context.test.ts --maxWorkers=1` — 42/42.
- `pnpm typecheck`, `pnpm build`, and ESLint of the four changed source/test files passed.
- Native consumer core FIRST: 4/7 new cases failed semantically (primary403 and foreign secondary200); 3 primary-denial cases were already green.

## Fruibilità alla consegna (R-34)
The shared contract is locally built for private server-owned vocal admission. It does not by itself prove a live user session or production key use. No server, real key, push or deployment was used.
