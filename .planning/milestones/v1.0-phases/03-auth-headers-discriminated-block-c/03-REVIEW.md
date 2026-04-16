---
phase: 03
status: issues_found
depth: standard
files_reviewed: 7
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
date: 2026-04-15
---

# Code Review — Phase 03: Auth Headers Discriminated (Block C)

## Summary

Seven files reviewed. No critical security vulnerabilities found. Four warnings and three informational items identified. The core type safety model is sound; findings are concentrated around unvalidated error response casting, missing 204/empty-body handling, `AuthNone` ambiguity, and minor test coverage gaps.

---

## Findings

### WR-01 (warning)
**File:** src/http/bridge-client.ts
**Line:** 116
**Issue:** The error body is cast directly to `BridgeErrorResponse` without runtime validation (`(await res.json()) as BridgeErrorResponse`). If the remote service returns a non-conforming JSON shape (e.g. a plain string, an HTML error page parsed as JSON, or a different error schema), the `BridgeHttpError` constructor will silently produce `undefined` for `response.code` and `response.message`, resulting in a misleading error message like `Bridge HTTP 502: [undefined] undefined`.
**Fix:** Parse the JSON body through `BridgeErrorResponseSchema.safeParse()` instead of a bare type assertion. Use the parsed value only on success; fall back to `null` on parse failure.

```typescript
try {
  const raw = await res.json();
  const parsed = BridgeErrorResponseSchema.safeParse(raw);
  errorBody = parsed.success ? parsed.data : null;
} catch {
  // errorBody stays null
}
```

---

### WR-02 (warning)
**File:** src/http/bridge-client.ts
**Line:** 123
**Issue:** `res.json()` is called unconditionally on every 2xx response, including `204 No Content`. A 204 response has an empty body; calling `.json()` on it will throw a `SyntaxError`, which bubbles up as an uncaught exception from `request<T>()`. This will break callers using any endpoint that returns 204 (e.g., reload, stop, DELETE operations).
**Fix:** Check `res.status === 204` (or `res.headers.get('content-length') === '0'`) before calling `.json()`. Return `undefined as unknown as T` for empty-body responses, or document that all bridge endpoints must return a JSON body (and enforce this at the schema level in Phase 4).

```typescript
if (res.status === 204) return undefined as unknown as T;
return (await res.json()) as T;
```

---

### WR-03 (warning)
**File:** src/http/bridge-client.ts
**Line:** 127–130
**Issue:** The `authType` getter infers type by checking for `'X-Internal-Secret' in auth`. This logic is correct for the two current auth types, but it silently returns `'token'` for any auth object that does not have `X-Internal-Secret` — including a future third auth type or a misconfigured object. If `AuthHeaders` is extended to include a third variant, the getter will misclassify it as `'token'` with no compile-time warning.
**Fix:** Add an explicit check for both keys and throw for unrecognised shapes, or switch to a discriminant property pattern. As a minimum, assert exhaustiveness:

```typescript
get authType(): A {
  if ('X-Internal-Secret' in auth) return 'secret' as A;
  if ('X-Internal-Token' in auth) return 'token' as A;
  throw new Error('BridgeClient: unrecognised auth header shape');
},
```

---

### WR-04 (warning)
**File:** src/auth/auth-headers.ts
**Line:** 41
**Issue:** `AuthNone` is typed as `Record<string, never>`, which structurally means an object with no string-keyed properties. While correct for an "empty headers" constraint, this type is incompatible with plain `{}` at the type level in strict TypeScript (`{}` satisfies `Record<string, never>` only when the property bag is empty, but TypeScript does not always narrow this as expected under `strictNullChecks`). More importantly, the `AuthHeaders` discriminated union has no runtime discriminant — code cannot switch on `AuthNone` at runtime to distinguish it from a missing auth parameter. The union `AuthInternalSecret | AuthInternalToken | AuthNone` does not form a true discriminated union because there is no shared literal property.
**Fix:** Either document explicitly that `AuthNone` is a compile-time-only sentinel (not for runtime use), or add a runtime discriminant such as `authKind: 'none' | 'secret' | 'token'` to all three types. At minimum, add a JSDoc note clarifying the limitation to prevent future callers from attempting to switch-on `AuthHeaders` at runtime.

---

### IR-01 (info)
**File:** src/http/bridge-client.ts
**Line:** 82–131
**Issue:** `createBridgeClient` is a factory that accepts `'secret' | 'token'` as the type parameter `A`, but the constraint on `BridgeClientConfig<A>` only supports those two values. `EndpointAuthType` includes `'none'`, but `BridgeClientConfig` correctly excludes it (`A extends 'secret' | 'token'`). This is intentional and sound, but the relationship between `EndpointAuthType` and the client's `A` parameter is not documented. A future developer adding a `'none'`-auth client variant may miss that the factory does not support it.
**Fix:** Add a brief JSDoc comment on `createBridgeClient` noting that `'none'` endpoints do not require a client instance (direct `fetch` with no auth headers is the pattern), or reference the `EndpointAuthType` definition.

---

### IR-02 (info)
**File:** tests/http/bridge-client.test.ts
**Line:** 99–117
**Issue:** The `createBridgeClient` tests only verify that `request` is a function and that `authType` returns the correct string. There are no integration-style tests for the actual HTTP behaviour of `request()` (URL construction, header merging, body serialisation, error path, signal forwarding). While `fetch` mocking in unit tests requires setup, the absence of these tests means the core behaviour of the client (WR-01 and WR-02 scenarios) has no regression coverage.
**Fix:** Add fetch-mock tests (using `vitest`'s `vi.stubGlobal('fetch', ...)` or `msw`) for at least: (a) successful JSON response, (b) non-2xx response with valid `BridgeErrorResponse`, (c) non-2xx response with non-JSON body, and (d) 204 response.

---

### IR-03 (info)
**File:** tests/auth/auth-headers.test.ts
**Line:** 52–75
**Issue:** `AuthInternalTokenSchema` tests do not include a `'rejects non-string value'` case, whereas `AuthInternalSecretSchema` tests do (line 45–49). The missing case is a minor gap — the schema behaviour is identical — but the asymmetry is a maintenance signal: if the schemas diverge in future, the missing test may not catch it.
**Fix:** Add a `it('rejects non-string value', ...)` test for `AuthInternalTokenSchema` mirroring the existing test for `AuthInternalSecretSchema`.

---

## Notes

- **Secret leakage:** No secrets are logged, serialised, or exposed in error messages. Auth values flow only through HTTP headers. No concern.
- **Injection:** URL is constructed by simple string concatenation (`baseUrl + path`). `path` is caller-supplied; no sanitisation is performed. This is acceptable for an internal service-to-service client where the caller is trusted code, not user input — but worth noting if the usage pattern ever changes.
- **Zod schemas:** Both auth schemas correctly use `z.string().min(1)` to reject empty strings. `BridgeErrorResponseSchema` correctly types `details` as `z.unknown().optional()` — appropriate for an open-ended field.
- **Type exports:** All public types are re-exported through domain index files. No orphaned types found.
- **Dead code:** None found.
