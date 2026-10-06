# contract-red

Comando: pnpm -C /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-56-1 exec vitest run --maxWorkers=1 --testTimeout=60000 --reporter=json --outputFile=/var/folders/m3/mywf84wd2k50664nh_ffnc3m0000gq/T/bridge56-contract-red-i5u741w8/vitest.json tests/http/endpoints/internal-dev-conferme.test.ts
Esito: exit 1; 0/100 passati, 100 falliti; errori di raccolta 0.
Archivio completo: /var/folders/m3/mywf84wd2k50664nh_ffnc3m0000gq/T/bridge56-contract-red-i5u741w8
Ora: 2026-10-06T15:17:39.208499+02:00

| Test | Stato | Assert rosso |
| --- | --- | --- |
| internal dev pending confirmations contract declares the exact internal path | failed | True |
| internal dev pending confirmations contract uses POST for a one-time delivery request | failed | True |
| internal dev pending confirmations contract requires existing internal secret authentication | failed | True |
| internal dev pending confirmations contract exposes the request through the standard bodySchema | failed | True |
| internal dev pending confirmations contract exposes the response schema on the contract | failed | True |
| internal dev pending confirmations contract exports the same InternalDevConfermeRequestSchema through HTTP and its endpoints barrel | failed | True |
| internal dev pending confirmations contract exports the same InternalDevConfermeResponseSchema through HTTP and its endpoints barrel | failed | True |
| internal dev pending confirmations contract exports the same internalDevConfermeContract through HTTP and its endpoints barrel | failed | True |
| pending confirmation request preserves a web session identifier | failed | True |
| pending confirmation request accepts the specified nonempty string without inventing a session format | failed | True |
| pending confirmation request rejects a non-object request 0 | failed | True |
| pending confirmation request rejects a non-object request 1 | failed | True |
| pending confirmation request rejects a non-object request 2 | failed | True |
| pending confirmation request rejects a non-object request 3 | failed | True |
| pending confirmation request rejects a non-object request 4 | failed | True |
| pending confirmation request rejects a non-object request 5 | failed | True |
| pending confirmation request rejects a non-object request 6 | failed | True |
| pending confirmation request requires sessionId | failed | True |
| pending confirmation request rejects an empty sessionId | failed | True |
| pending confirmation request rejects a non-string sessionId 0 | failed | True |
| pending confirmation request rejects a non-string sessionId 1 | failed | True |
| pending confirmation request rejects a non-string sessionId 2 | failed | True |
| pending confirmation request rejects a non-string sessionId 3 | failed | True |
| pending confirmation request rejects a non-string sessionId 4 | failed | True |
| pending confirmation request rejects a non-string sessionId 5 | failed | True |
| pending confirmation request rejects unknown request fields | failed | True |
| pending confirmation response accepts command APPROVATO | failed | True |
| pending confirmation response accepts command SCARTATO | failed | True |
| pending confirmation response accepts command RIPRENDI | failed | True |
| pending confirmation response accepts an empty queue | failed | True |
| pending confirmation response preserves multiple confirmations in delivery order | failed | True |
| pending confirmation response accepts an empty title as specified by the string contract | failed | True |
| pending confirmation response rejects a non-object response 0 | failed | True |
| pending confirmation response rejects a non-object response 1 | failed | True |
| pending confirmation response rejects a non-object response 2 | failed | True |
| pending confirmation response rejects a non-object response 3 | failed | True |
| pending confirmation response rejects a non-object response 4 | failed | True |
| pending confirmation response rejects a non-object response 5 | failed | True |
| pending confirmation response rejects a non-object response 6 | failed | True |
| pending confirmation response requires the conferme collection | failed | True |
| pending confirmation response rejects a non-array collection 0 | failed | True |
| pending confirmation response rejects a non-array collection 1 | failed | True |
| pending confirmation response rejects a non-array collection 2 | failed | True |
| pending confirmation response rejects a non-array collection 3 | failed | True |
| pending confirmation response rejects a non-array collection 4 | failed | True |
| pending confirmation response rejects a non-array collection 5 | failed | True |
| pending confirmation response rejects a non-object confirmation 0 | failed | True |
| pending confirmation response rejects a non-object confirmation 1 | failed | True |
| pending confirmation response rejects a non-object confirmation 2 | failed | True |
| pending confirmation response rejects a non-object confirmation 3 | failed | True |
| pending confirmation response rejects a non-object confirmation 4 | failed | True |
| pending confirmation response requires confirmation field richiesta | failed | True |
| pending confirmation response requires confirmation field titolo | failed | True |
| pending confirmation response requires confirmation field comando | failed | True |
| pending confirmation response requires confirmation field link | failed | True |
| pending confirmation response rejects a non-finite numeric request number 0 | failed | True |
| pending confirmation response rejects a non-finite numeric request number 1 | failed | True |
| pending confirmation response rejects a non-finite numeric request number 2 | failed | True |
| pending confirmation response rejects a non-finite numeric request number 3 | failed | True |
| pending confirmation response rejects a non-finite numeric request number 4 | failed | True |
| pending confirmation response rejects a non-finite numeric request number 5 | failed | True |
| pending confirmation response rejects a non-finite numeric request number 6 | failed | True |
| pending confirmation response rejects a non-finite numeric request number 7 | failed | True |
| pending confirmation response rejects a non-finite numeric request number 8 | failed | True |
| pending confirmation response requires a positive request number 0 | failed | True |
| pending confirmation response requires a positive request number 1 | failed | True |
| pending confirmation response requires a positive request number 2 | failed | True |
| pending confirmation response requires an integer request number 0 | failed | True |
| pending confirmation response requires an integer request number 1 | failed | True |
| pending confirmation response requires a string title 0 | failed | True |
| pending confirmation response requires a string title 1 | failed | True |
| pending confirmation response requires a string title 2 | failed | True |
| pending confirmation response requires a string title 3 | failed | True |
| pending confirmation response requires a string title 4 | failed | True |
| pending confirmation response requires a string title 5 | failed | True |
| pending confirmation response rejects an unknown or non-string command 0 | failed | True |
| pending confirmation response rejects an unknown or non-string command 1 | failed | True |
| pending confirmation response rejects an unknown or non-string command 2 | failed | True |
| pending confirmation response rejects an unknown or non-string command 3 | failed | True |
| pending confirmation response rejects an unknown or non-string command 4 | failed | True |
| pending confirmation response rejects an unknown or non-string command 5 | failed | True |
| pending confirmation response rejects an unknown or non-string command 6 | failed | True |
| pending confirmation response rejects an unknown or non-string command 7 | failed | True |
| pending confirmation response rejects an unknown or non-string command 8 | failed | True |
| pending confirmation response rejects an unknown or non-string command 9 | failed | True |
| pending confirmation response rejects an unknown or non-string command 10 | failed | True |
| pending confirmation response requires an absolute URL 0 | failed | True |
| pending confirmation response requires an absolute URL 1 | failed | True |
| pending confirmation response requires an absolute URL 2 | failed | True |
| pending confirmation response requires an absolute URL 3 | failed | True |
| pending confirmation response requires an absolute URL 4 | failed | True |
| pending confirmation response requires an absolute URL 5 | failed | True |
| pending confirmation response requires an absolute URL 6 | failed | True |
| pending confirmation response requires an absolute URL 7 | failed | True |
| pending confirmation response requires an absolute URL 8 | failed | True |
| pending confirmation response requires HTTPS 0 | failed | True |
| pending confirmation response requires HTTPS 1 | failed | True |
| pending confirmation response requires HTTPS 2 | failed | True |
| pending confirmation response rejects unknown confirmation fields | failed | True |
| pending confirmation response rejects unknown response fields | failed | True |
