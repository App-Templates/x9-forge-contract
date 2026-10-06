# FINAL-MUTATIONS · 56-01

37/37 mutazioni rilevate con asserzioni; un solo worker, solo il test della nuova rotta.
Baseline 105/105; ripristino 105/105.
Giro unico completo: True; originali invariati: True.
JSON/log completi solo nell'archivio temporaneo: /var/folders/m3/mywf84wd2k50664nh_ffnc3m0000gq/T/bridge56-mutation-raw-3_n5vvbh
Edits esatti e controlli riproducibili nel runner tests/http/endpoints/mutate-internal-dev-conferme.py.

| Mutazione | File | Assert falliti | Esempio |
| --- | --- | --- | --- |
| CF-01-path | src/http/endpoints/internal-dev-conferme.ts | 1 | internal dev pending confirmations contract declares the exact internal path |
| CF-02-method | src/http/endpoints/internal-dev-conferme.ts | 1 | internal dev pending confirmations contract uses POST for a one-time delivery request |
| CF-03-auth | src/http/endpoints/internal-dev-conferme.ts | 1 | internal dev pending confirmations contract requires existing internal secret authentication |
| CF-04-body-schema | src/http/endpoints/internal-dev-conferme.ts | 1 | internal dev pending confirmations contract exposes the request through the standard bodySchema |
| CF-05-response-schema | src/http/endpoints/internal-dev-conferme.ts | 1 | internal dev pending confirmations contract exposes the response schema on the contract |
| CF-06-public-export | src/http/endpoints/index.ts | 105 | internal dev pending confirmations contract declares the exact internal path |
| CF-07-request-object | src/http/endpoints/internal-dev-conferme.ts | 16 | pending confirmation request rejects a non-object request 0 |
| CF-08-session-type | src/http/endpoints/internal-dev-conferme.ts | 9 | pending confirmation request rejects a non-object request 5 |
| CF-09-session-required | src/http/endpoints/internal-dev-conferme.ts | 3 | pending confirmation request rejects a non-object request 5 |
| CF-10-session-minimum | src/http/endpoints/internal-dev-conferme.ts | 1 | pending confirmation request rejects an empty sessionId |
| CF-11-request-strict | src/http/endpoints/internal-dev-conferme.ts | 1 | pending confirmation request rejects unknown request fields |
| CF-12-response-object | src/http/endpoints/internal-dev-conferme.ts | 71 | uses the public signed-command schema directly in each confirmation |
| CF-13-collection-required | src/http/endpoints/internal-dev-conferme.ts | 4 | uses the public signed-command schema directly in each confirmation |
| CF-14-collection-type | src/http/endpoints/internal-dev-conferme.ts | 64 | uses the public signed-command schema directly in each confirmation |
| CF-15-item-object | src/http/endpoints/internal-dev-conferme.ts | 56 | uses the public signed-command schema directly in each confirmation |
| CF-16-richiesta-required | src/http/endpoints/internal-dev-conferme.ts | 2 | pending confirmation response requires confirmation field richiesta |
| CF-17-titolo-required | src/http/endpoints/internal-dev-conferme.ts | 2 | pending confirmation response requires confirmation field titolo |
| CF-18-comando-required | src/http/endpoints/internal-dev-conferme.ts | 3 | uses the public signed-command schema directly in each confirmation |
| CF-19-link-required | src/http/endpoints/internal-dev-conferme.ts | 2 | pending confirmation response requires confirmation field link |
| CF-20-request-number-type | src/http/endpoints/internal-dev-conferme.ts | 15 | pending confirmation response requires confirmation field richiesta |
| CF-21-request-number-integer | src/http/endpoints/internal-dev-conferme.ts | 2 | pending confirmation response requires an integer request number 0 |
| CF-22-request-number-positive | src/http/endpoints/internal-dev-conferme.ts | 3 | pending confirmation response requires a positive request number 0 |
| CF-23-title-type | src/http/endpoints/internal-dev-conferme.ts | 7 | pending confirmation response requires confirmation field titolo |
| CF-24-command-values | src/http/endpoints/internal-dev-conferme.ts | 6 | fixes the exact public signed-command options |
| CF-25-command-type | src/http/endpoints/internal-dev-conferme.ts | 13 | fixes the exact public signed-command options |
| CF-26-url-type | src/http/endpoints/internal-dev-conferme.ts | 15 | pending confirmation response requires confirmation field link |
| CF-27-url-validity | src/http/endpoints/internal-dev-conferme.ts | 8 | pending confirmation response requires an absolute URL 6 |
| CF-28-https-only | src/http/endpoints/internal-dev-conferme.ts | 3 | pending confirmation response requires HTTPS 0 |
| CF-29-item-strict | src/http/endpoints/internal-dev-conferme.ts | 1 | pending confirmation response rejects unknown confirmation fields |
| CF-30-response-strict | src/http/endpoints/internal-dev-conferme.ts | 1 | pending confirmation response rejects unknown response fields |
| CF-31-retry-command-preserved | src/http/endpoints/internal-dev-conferme.ts | 3 | fixes the exact public signed-command options |
| CF-32-empty-title-preserved | src/http/endpoints/internal-dev-conferme.ts | 1 | pending confirmation response accepts an empty title as specified by the string contract |
| CF-33-empty-queue-preserved | src/http/endpoints/internal-dev-conferme.ts | 1 | pending confirmation response accepts an empty queue |
| CF-34-session-boundary-preserved | src/http/endpoints/internal-dev-conferme.ts | 1 | pending confirmation request accepts the specified nonempty string without inventing a session format |
| CF-35-public-command-linkage | src/http/endpoints/internal-dev-conferme.ts | 1 | uses the public signed-command schema directly in each confirmation |
| CF-36-command-options | src/http/endpoints/internal-dev-conferme.ts | 1 | fixes the exact public signed-command options |
| CF-37-https-url-validity | src/http/endpoints/internal-dev-conferme.ts | 2 | pending confirmation response rejects an invalid HTTPS URL https:// |
