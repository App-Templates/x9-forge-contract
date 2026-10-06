# FINAL-MUTATIONS · 56-01

34/34 mutazioni rilevate con asserzioni; un solo worker, solo il test della nuova rotta.
Baseline 100/100; ripristino 100/100.
Giro unico completo: True; originali invariati: True.
JSON/log completi solo nell'archivio temporaneo: /var/folders/m3/mywf84wd2k50664nh_ffnc3m0000gq/T/bridge56-mutation-raw-oahmy76p
Edits esatti e controlli riproducibili nel runner tests/http/endpoints/mutate-internal-dev-conferme.py.

| Mutazione | File | Assert falliti | Esempio |
| --- | --- | --- | --- |
| CF-01-path | src/http/endpoints/internal-dev-conferme.ts | 1 | internal dev pending confirmations contract declares the exact internal path |
| CF-02-method | src/http/endpoints/internal-dev-conferme.ts | 1 | internal dev pending confirmations contract uses POST for a one-time delivery request |
| CF-03-auth | src/http/endpoints/internal-dev-conferme.ts | 1 | internal dev pending confirmations contract requires existing internal secret authentication |
| CF-04-body-schema | src/http/endpoints/internal-dev-conferme.ts | 1 | internal dev pending confirmations contract exposes the request through the standard bodySchema |
| CF-05-response-schema | src/http/endpoints/internal-dev-conferme.ts | 1 | internal dev pending confirmations contract exposes the response schema on the contract |
| CF-06-public-export | src/http/endpoints/index.ts | 100 | internal dev pending confirmations contract declares the exact internal path |
| CF-07-request-object | src/http/endpoints/internal-dev-conferme.ts | 16 | pending confirmation request rejects a non-object request 0 |
| CF-08-session-type | src/http/endpoints/internal-dev-conferme.ts | 9 | pending confirmation request rejects a non-object request 5 |
| CF-09-session-required | src/http/endpoints/internal-dev-conferme.ts | 3 | pending confirmation request rejects a non-object request 5 |
| CF-10-session-minimum | src/http/endpoints/internal-dev-conferme.ts | 1 | pending confirmation request rejects an empty sessionId |
| CF-11-request-strict | src/http/endpoints/internal-dev-conferme.ts | 1 | pending confirmation request rejects unknown request fields |
| CF-12-response-object | src/http/endpoints/internal-dev-conferme.ts | 68 | pending confirmation response rejects a non-object response 0 |
| CF-13-collection-required | src/http/endpoints/internal-dev-conferme.ts | 3 | pending confirmation response rejects a non-object response 5 |
| CF-14-collection-type | src/http/endpoints/internal-dev-conferme.ts | 61 | pending confirmation response rejects a non-object response 5 |
| CF-15-item-object | src/http/endpoints/internal-dev-conferme.ts | 53 | pending confirmation response rejects a non-object confirmation 0 |
| CF-16-richiesta-required | src/http/endpoints/internal-dev-conferme.ts | 2 | pending confirmation response requires confirmation field richiesta |
| CF-17-titolo-required | src/http/endpoints/internal-dev-conferme.ts | 2 | pending confirmation response requires confirmation field titolo |
| CF-18-comando-required | src/http/endpoints/internal-dev-conferme.ts | 2 | pending confirmation response requires confirmation field comando |
| CF-19-link-required | src/http/endpoints/internal-dev-conferme.ts | 2 | pending confirmation response requires confirmation field link |
| CF-20-request-number-type | src/http/endpoints/internal-dev-conferme.ts | 15 | pending confirmation response requires confirmation field richiesta |
| CF-21-request-number-integer | src/http/endpoints/internal-dev-conferme.ts | 2 | pending confirmation response requires an integer request number 0 |
| CF-22-request-number-positive | src/http/endpoints/internal-dev-conferme.ts | 3 | pending confirmation response requires a positive request number 0 |
| CF-23-title-type | src/http/endpoints/internal-dev-conferme.ts | 7 | pending confirmation response requires confirmation field titolo |
| CF-24-command-values | src/http/endpoints/internal-dev-conferme.ts | 5 | pending confirmation response rejects an unknown or non-string command 6 |
| CF-25-command-type | src/http/endpoints/internal-dev-conferme.ts | 12 | pending confirmation response requires confirmation field comando |
| CF-26-url-type | src/http/endpoints/internal-dev-conferme.ts | 13 | pending confirmation response requires confirmation field link |
| CF-27-url-validity | src/http/endpoints/internal-dev-conferme.ts | 6 | pending confirmation response requires an absolute URL 6 |
| CF-28-https-only | src/http/endpoints/internal-dev-conferme.ts | 3 | pending confirmation response requires HTTPS 0 |
| CF-29-item-strict | src/http/endpoints/internal-dev-conferme.ts | 1 | pending confirmation response rejects unknown confirmation fields |
| CF-30-response-strict | src/http/endpoints/internal-dev-conferme.ts | 1 | pending confirmation response rejects unknown response fields |
| CF-31-retry-command-preserved | src/http/endpoints/internal-dev-conferme.ts | 2 | pending confirmation response accepts command RIPRENDI |
| CF-32-empty-title-preserved | src/http/endpoints/internal-dev-conferme.ts | 1 | pending confirmation response accepts an empty title as specified by the string contract |
| CF-33-empty-queue-preserved | src/http/endpoints/internal-dev-conferme.ts | 1 | pending confirmation response accepts an empty queue |
| CF-34-session-boundary-preserved | src/http/endpoints/internal-dev-conferme.ts | 1 | pending confirmation request accepts the specified nonempty string without inventing a session format |

Verifica supplementare dei reporter archiviati: 34/34 raccolgono tutti i 100 casi, 34/34 senza messaggi di errore del file; ogni rosso ha AssertionError.
Il runner richiede anche il denominatore identico alla baseline e nessun errore del file; verificati sui reporter dello stesso giro, senza sommare lotti.
