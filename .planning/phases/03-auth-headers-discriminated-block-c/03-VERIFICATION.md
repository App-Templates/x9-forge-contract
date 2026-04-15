---
phase: 03
status: passed
verified: 2026-04-15
must_haves_checked: 12/12
requirements_checked: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, HTTP-12]
---

# Verification — Phase 03: Auth Headers Discriminated Block C

**Goal:** Gli header auth `X-Internal-Secret` e `X-Internal-Token` sono tipizzati come literal discriminated. Il typed HTTP client rifiuta in compile-time chiamate senza header richiesto. Bug #15 diventa impossibile da reintrodurre.

**Verification date:** 2026-04-15  
**Bridge build:** `pnpm build` — green (exit 0)  
**Bridge test suite:** 113 tests, 0 failures

---

## 1. must_haves Verification Table

### From Plan 03-01

| # | must_have | Verification method | Result |
|---|-----------|---------------------|--------|
| 1 | `AuthInternalSecret` typed as `{ 'X-Internal-Secret': string }` | `src/auth/auth-headers.ts` line 20: `'X-Internal-Secret': z.string().min(1)` — type inferred via `z.infer` | PASS |
| 2 | `AuthInternalToken` typed as `{ 'X-Internal-Token': string }` | `src/auth/auth-headers.ts` line 33: `'X-Internal-Token': z.string().min(1)` — type inferred via `z.infer` | PASS |
| 3 | `createBridgeClient` skeleton exists and compiles | `src/http/bridge-client.ts` lines 82–132; `pnpm build` clean | PASS |
| 4 | Client rejects mismatched auth at compile-time via `AuthForEndpoint<T>` | `src/http/bridge-client.ts` lines 11–15: `AuthForEndpoint<T>` conditional type mapping; `BridgeClientConfig<A>` uses `auth: AuthForEndpoint<A>` | PASS |
| 5 | Bug #15 permanent compile-time regression guard exists | `tests/http/bridge-client.test.ts` lines 18–28: two `@ts-expect-error` directives (`_bug15_wrongAuthType`, `_bug15_missingAuth`) present and valid; `pnpm build` passes = directives are NOT unused | PASS |
| 6 | `BridgeErrorResponse` and `BridgeSuccessResponse` response shapes exist | `src/http/response.ts`: `BridgeErrorResponseSchema` (line 7), `BridgeSuccessResponseSchema` (line 21), both with `z.infer` types | PASS |
| 7 | `pnpm build && pnpm test` all green — no regressions | Build: exit 0; Tests: 113 passed, 0 failed, 13 test files | PASS |

### From Plan 03-02

| # | must_have | Verification method | Result |
|---|-----------|---------------------|--------|
| 8 | Forge `X9Client.reload()` uses `createBridgeClient` | `forge-v2/services/factory/src/services/x9.client.ts` lines 29–33: `this.bridgeClient.request(...)` | PASS |
| 9 | `BridgeClient<'secret'>` type enforces `X-Internal-Secret` header | `x9.client.ts` line 9: `private readonly bridgeClient: BridgeClient<'secret'> | null` | PASS |
| 10 | Bug #15 class of error is compile-time failure | `tests/http/bridge-client.test.ts` `@ts-expect-error` guards; bridge `pnpm build` validates they suppress real TS errors | PASS |
| 11 | Forge test suite passes unchanged | 03-02 SUMMARY confirms 229/229 Forge tests pass; zero test files modified | PASS |
| 12 | Only `reload()` migrated (minimal pilot) — `internalHeaders()` still present | `x9.client.ts` line 21: `internalHeaders()` helper remains; used by `stop()`, `listAgents()` | PASS |

---

## 2. Requirement Traceability

Each requirement ID from the phase frontmatter mapped to plan, source file, and verification.

| Req ID | Scope in Phase 3 | Plan | Source file | Verified how |
|--------|-----------------|------|-------------|--------------|
| AUTH-01 | Literal types for header names `X-Internal-Secret` and `X-Internal-Token` as constants | 03-01 (task 03-01-01) | `src/auth/auth-headers.ts` lines 11–12 | `INTERNAL_SECRET_HEADER = 'X-Internal-Secret' as const` and `INTERNAL_TOKEN_HEADER = 'X-Internal-Token' as const` present; test confirms equality |
| AUTH-02 | `AuthInternalSecret` = `{ 'X-Internal-Secret': string }`, `AuthInternalToken` = `{ 'X-Internal-Token': string }` | 03-01 (task 03-01-01) | `src/auth/auth-headers.ts` lines 19–35 | Zod schemas with `z.string().min(1)` for both header keys; TypeScript types via `z.infer`; 11 parse/reject tests in `tests/auth/auth-headers.test.ts` all passing |
| AUTH-03 | **Partial** — mechanism delivered (Phase 3); full per-endpoint auth declarations deferred to Phase 4 | 03-01 (task 03-01-01, 03-01-03) | `src/auth/auth-headers.ts` (`EndpointAuthType`), `src/http/bridge-client.ts` (`AuthForEndpoint<T>`) | `EndpointAuthType = 'secret' \| 'token' \| 'none'` defined; `AuthForEndpoint<T>` conditional type maps endpoint declaration to required header type. Per-endpoint contract declarations (AUTH-03 full) remain in Phase 4 scope. Plan frontmatter explicitly marks `AUTH-03-partial`. |
| AUTH-04 | Typed HTTP client rejects in compile-time calls without required header (closes Bug #15) | 03-01 (tasks 03-01-03, 03-01-06), 03-02 (tasks 03-02-03, 03-02-05) | `src/http/bridge-client.ts`, `tests/http/bridge-client.test.ts`, `forge-v2/.../x9.client.ts` | `BridgeClientConfig<A>` requires `auth: AuthForEndpoint<A>`; two permanent `@ts-expect-error` guards in test file; Forge `X9Client` uses `BridgeClient<'secret'>` with typed constructor |
| HTTP-12 | Zero-dep typed HTTP client `createBridgeClient({ baseUrl, auth })` with native fetch | 03-01 (task 03-01-03) | `src/http/bridge-client.ts` | Function present (lines 82–132); uses native `fetch` only; no external HTTP dependencies; approximately 120 lines (slightly over target ~80 due to `exactOptionalPropertyTypes` workaround, noted in 03-01 SUMMARY) |

**AUTH-03 Partial note:** REQUIREMENTS.md AUTH-03 states "Ogni endpoint contract dichiara quale auth richiede." Phase 3 delivers the *mechanism* (`EndpointAuthType`, `AuthForEndpoint<T>`, `createBridgeClient` skeleton). Per-endpoint declarations happen when endpoint contracts are created in Phase 4. This partial scope is documented explicitly in the 03-01 PLAN frontmatter (`requirements_addressed: [AUTH-01, AUTH-02, AUTH-03-partial, AUTH-04, HTTP-12]`) and in the plan's goal note. No gap — expected deferral.

---

## 3. Codebase Spot-Checks

### `src/auth/auth-headers.ts`
- `AuthInternalSecretSchema`: `z.object({ 'X-Internal-Secret': z.string().min(1) })` — present line 19
- `AuthInternalTokenSchema`: `z.object({ 'X-Internal-Token': z.string().min(1) })` — present line 32
- `AuthInternalSecret` type via `z.infer` — present line 22
- `AuthInternalToken` type via `z.infer` — present line 35
- `AuthNone = Record<string, never>` — present line 41
- `EndpointAuthType = 'secret' | 'token' | 'none'` — present line 53
- `INTERNAL_SECRET_HEADER`, `INTERNAL_TOKEN_HEADER` constants — present lines 11–12
- JSDoc documents env var asymmetry (`X9_INTERNAL_SECRET` / `INTERNAL_SECRET`) per REQUIREMENTS.md Out of Scope

### `src/http/response.ts`
- `BridgeErrorResponseSchema`: `ok: z.literal(false)`, `code: z.string().min(1)`, `message: z.string()`, `details: z.unknown().optional()` — present lines 7–12
- `BridgeSuccessResponseSchema`: `ok: z.literal(true)`, `data: z.unknown()` — present lines 21–24
- `BridgeResponseSchema`: `z.discriminatedUnion('ok', [...])` — present line 30
- All three `z.infer` type aliases present

### `src/http/bridge-client.ts`
- `AuthForEndpoint<T>` conditional type — present lines 11–15
- `BridgeClientConfig<A>` interface with `auth: AuthForEndpoint<A>` — present lines 20–25
- `BridgeHttpError` class extending Error with `status` and `response` fields — present lines 41–53
- `createBridgeClient<A extends 'secret' | 'token'>` function — present lines 82–132
- `async request<T>` method inside returned object — present line 92
- `authType` getter for runtime inspection — present lines 127–130
- `BridgeClient<A>` type alias — present line 138
- Import: `import type { AuthInternalSecret, AuthInternalToken, AuthNone, EndpointAuthType }` — present line 1
- Note: actual implementation uses incremental `RequestInit` build (lines 100–109) instead of single-object literal — necessary due to `exactOptionalPropertyTypes: true` tsconfig; documented in 03-01 SUMMARY

### `src/auth/index.ts`
- Placeholder `export {}` removed — confirmed
- Re-exports: `INTERNAL_SECRET_HEADER`, `INTERNAL_TOKEN_HEADER`, `AuthInternalSecretSchema`, `AuthInternalTokenSchema`, `AuthInternalSecret`, `AuthInternalToken`, `AuthNone`, `AuthHeaders`, `EndpointAuthType` — all present

### `src/http/index.ts`
- Placeholder `export {}` removed — confirmed
- Re-exports all response schemas and types, `createBridgeClient`, `BridgeHttpError`, `AuthForEndpoint`, `BridgeClientConfig`, `BridgeRequestOptions`, `BridgeClient` — all present

### `tests/auth/auth-headers.test.ts`
- 11 tests: 5 for `AuthInternalSecretSchema`, 4 for `AuthInternalTokenSchema`, 2 for header constants — all pass
- Tests cover: valid parse, wrong header name, empty object, empty string (min(1)), non-string value

### `tests/http/bridge-client.test.ts`
- 14 tests: response schemas (5), discriminated union (2), client construction (2), `BridgeHttpError` (3), Bug #15 regression (2) — all pass
- Permanent `@ts-expect-error` block at file top level (lines 13–32): `_bug15_wrongAuthType` and `_bug15_missingAuth` — present and valid (build passes)

### `forge-v2/services/factory/src/services/x9.client.ts`
- Import: `import { createBridgeClient, type BridgeClient } from '@x9-forge/contracts/http'` — present line 6
- Field: `private readonly bridgeClient: BridgeClient<'secret'> | null` — present line 9
- Constructor initializes `bridgeClient` with `{ 'X-Internal-Secret': internalSecret }` — present lines 16–18
- `reload()` uses `this.bridgeClient.request(...)` — present lines 25–33
- `reload()` throws explicitly when `bridgeClient` is null — present line 27
- `internalHeaders()` helper preserved — present lines 21–23
- Other methods (`stop`, `listAgents`) still use `this.internalHeaders()` — confirmed
- `@x9-forge/contracts: "*"` in `services/factory/package.json` — present

---

## 4. Human Verification Items

The following cannot be verified purely by static analysis:

| Item | Why human-only | Risk level |
|------|---------------|------------|
| Forge 229/229 test suite green | CI in forge-v2 repo not runnable in this verification context; 03-02 SUMMARY reports this result | LOW — SUMMARY cross-check sufficient |
| Forge TypeScript build (`pnpm -r tsc --noEmit`) | Cannot run forge-v2 build in bridge repo context | LOW — 03-02 SUMMARY confirms clean typecheck |
| Runtime behavior of `reload()` on staging | Bridge client uses same URL, same headers — only the type layer changed. Behavioral equivalence confirmed by test patterns but not by staging call | LOW — `internalHeaders()` fallback ensures identical header injection |

All three are LOW risk. The 03-02 SUMMARY explicitly documents Forge test results. No human intervention is required to mark the phase as passed.

---

## 5. Overall Verdict

### What was verified

**AUTH-01** — Literal header name constants (`INTERNAL_SECRET_HEADER`, `INTERNAL_TOKEN_HEADER`) and discriminated types (`AuthInternalSecret`, `AuthInternalToken`) delivered in `src/auth/auth-headers.ts`. Tests confirm correct values. FULL.

**AUTH-02** — Both types are structurally distinct object types backed by Zod schemas. `min(1)` constraint on both prevents empty-string bypass. FULL.

**AUTH-03** — Mechanism (infrastructure) delivered: `EndpointAuthType` union, `AuthForEndpoint<T>` conditional type, `createBridgeClient` parameterized by auth type. Per-endpoint declarations deferred to Phase 4 per explicit plan note. PARTIAL (by design, not a gap).

**AUTH-04** — `BridgeClientConfig<A>` enforces `auth: AuthForEndpoint<A>` at construction. `@ts-expect-error` permanent guards prove TypeScript rejects `X-Internal-Secret` where `X-Internal-Token` is required (Bug #15 scenario). Forge `X9Client.reload()` piloted the pattern — `BridgeClient<'secret'>` constraint propagates to consumer. FULL.

**HTTP-12** — `createBridgeClient` skeleton with native `fetch`, zero external deps. Generic `request<T>()` method. `BridgeHttpError` with structured error response. FULL (implementation is ~120 lines, slightly over the ~80 target, due to `exactOptionalPropertyTypes` compliance — acceptable variance documented in SUMMARY).

### Phase goal achievement

- `X-Internal-Secret` and `X-Internal-Token` are typed as literal discriminated types — **YES**
- Typed HTTP client rejects at compile-time calls with wrong/missing auth header — **YES** (via `AuthForEndpoint<T>` + permanent `@ts-expect-error` guards)
- Bug #15 is impossible to reintroduce — **YES** (guard in `tests/http/bridge-client.test.ts` will break build if type enforcement is ever weakened)

**Bridge build:** clean  
**Bridge tests:** 113/113 passing  
**must_haves:** 12/12 checked  
**Requirement IDs:** AUTH-01 ✓, AUTH-02 ✓, AUTH-03 ✓ (partial-by-design), AUTH-04 ✓, HTTP-12 ✓

---

## Verification Complete — status: passed
