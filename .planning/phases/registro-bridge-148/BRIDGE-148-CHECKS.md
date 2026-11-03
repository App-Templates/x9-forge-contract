# REGISTRO-BRIDGE-148 — evidenze locali

13/10/2026, Node24.14.1. Posto riservato dalla coordinatrice (134414); dipendenze frozen/offline/ignore-scripts, 235/235 riusate e zero download. Nessun test su produzione.

## Controlli finali

| Controllo | Esito e denominatore |
|---|---|
| Mirati nuovi | 53/53: B1 6, B2a 31, B2b 16; 3/3 file |
| Mutazioni | 35/35 rifiutate per AssertionError, non errori di importazione/tipo/timeout |
| Vitest completo | 5676/5676, 186/186 file; un solo giro, 27,60 secondi |
| Tipi/lint/build/check:dts/check:pack | 5/5 comandi riusciti; dichiarazioni portabili 402/402 |
| CJS base | 36/36 probe |
| Altri gruppi compilati/pubblici dello stesso script | 6/6, 15/15, 16/16, 39/39, 38/38, 48/48, 158/158, 186/186, 356/356, 112/112 |
| Dati pubblici catturati | 2/2 file, 8/8 verifiche su ESM e CJS; aiuto esportato 2/2 formati |

check:pack conserva il warning preesistente delle types CJS al root e il profilo node16/ignore false-cjs già nel package della base. Nessuna esclusione aggiunta.

## Mutazioni nominate

| # | Barriera disattivata temporaneamente | Esito |
|---|---|---|
| 1 | B1 route slot binding | AssertionError, exit1 |
| 2 | B1 strict params | AssertionError, exit1 |
| 3 | B1 strict receipt | AssertionError, exit1 |
| 4 | B1 path slot validation | AssertionError, exit1 |
| 5 | B1 POST metadata | AssertionError, exit1 |
| 6 | B1 secret authentication metadata | AssertionError, exit1 |
| 7 | B1 canonical auth header | AssertionError, exit1 |
| 8 | B1 correct core route | AssertionError, exit1 |
| 9 | B2 strict work | AssertionError, exit1 |
| 10 | B2 strict slot | AssertionError, exit1 |
| 11 | B2 strict progress | AssertionError, exit1 |
| 12 | B2 strict failure | AssertionError, exit1 |
| 13 | B2 duplicate slots | AssertionError, exit1 |
| 14 | B2 registered slots | AssertionError, exit1 |
| 15 | B2 registered failure slot | AssertionError, exit1 |
| 16 | B2 progress bound | AssertionError, exit1 |
| 17 | B2 completed nonnegative | AssertionError, exit1 |
| 18 | B2 completed integer | AssertionError, exit1 |
| 19 | B2 total integer | AssertionError, exit1 |
| 20 | B2 total nonnegative with overlapping bound bypassed | AssertionError, exit1 |
| 21 | B2 chronological update | AssertionError, exit1 |
| 22 | B2 failure phase equivalence | AssertionError, exit1 |
| 23 | B2 initial version one | AssertionError, exit1 |
| 24 | B2 initial requires absent saved | AssertionError, exit1 |
| 25 | B2 apply requires saved | AssertionError, exit1 |
| 26 | B2 optional pending | AssertionError, exit1 |
| 27 | B2 nullable pending | AssertionError, exit1 |
| 28 | B2 work kind | AssertionError, exit1 |
| 29 | B2 work phase | AssertionError, exit1 |
| 30 | B2 slot status | AssertionError, exit1 |
| 31 | B2b valid result header | AssertionError, exit1 |
| 32 | B2b apply action | AssertionError, exit1 |
| 33 | B2b at least one unsuccessful target | AssertionError, exit1 |
| 34 | B2b every unsuccessful reason | AssertionError, exit1 |
| 35 | B2b requested version remains unapplied | AssertionError, exit1 |

La negatività del totale è coperta anche da completed≤total: la mutazione20 bypassa entrambe per isolare il limite numerico. La mutazione35 bypassa il vincolo già esistente di convergenza delle versioni: il nuovo aiuto lo riusa, non lo duplica. Non sono mutazioni equivalenti conteggiate come rilevate.

I tre sorgenti sono ripristinati in finally e confrontati byte per byte con la baseline. Tutte le esecuzioni delle mutazioni usano solo i tre test nuovi, maxWorkers=1; nessun giro completo aggiuntivo.

## Dati pubblici in forma di produzione

README della coordinatrice e file in forge-v2-bacheca/piani/dati-reali-1310, sola lettura; UUID già sostituiti con finti. Master conserva 10 scelte e 24 esclusi, memory_embedding installato e progressione490/490.

Per ciascuno dei formati ESM e CJS: Master originario valido; stesso Master con pending iniziale valido; notifica memory_embedding valida; stesso corpo con slot della rotta agent_classifier rifiutato. Prova offline dei parser, non dell’integrazione o della pagina.

Impronte SHA256 dei dati letti:
- stato-master.json: a57567020f35acc2ef5bb237587e69e07d15c6e745bbfa2a0067b0a05da55cc4
- stato-memory-embedding.json: 4d3fac077ba3a45ed1ed0fe43ce30674dfcc59414d473991e7bdd1fdd4a5f4fb

## Ripristino e perimetro

Build genera solo i 24 artefatti dist dei tre sorgenti: ripristinati dopo controlli pubblici e suite, previa verifica della radice193-2. Nessun nuovo file dist. Package, lock, CHANGELOG, tutti gli index, agent-model-management-values e model-consumers hanno diff vuoto.

Rischio di adozione: uno stato stretto precedente non legge pending; ordine bridge→F5 senza emissione→X4/X6 resta obbligatorio. Review indipendente e rilascio non eseguiti.

Runner riproducibili: BRIDGE-148-MUTATE.py (soli mirati, ripristino automatico) e BRIDGE-148-PRODUCTION-SHAPE.mjs (dopo build, sui dati pubblici esterni). La suite completa non viene richiamata dai runner.
