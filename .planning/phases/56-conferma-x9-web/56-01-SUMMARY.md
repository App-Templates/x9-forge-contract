# 56-01 · contratto delle conferme per X9 Live web
Ultimo aggiornamento: 15:34 (06/10/2026)

Worktree: /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-56-1
Branch: codex/56-01-bridge-conferme. Base d8ef67f (1.28); nessun riallineamento necessario per questo contratto aggiuntivo.
Codex B del pool Forge, assegnazione rettificata 14:58. Interruzione ritocchi 1.29 chiusa 2df0516.
La coordinatrice ha comunicato il rilascio canonico 1.29 alle 15:24; non ho cambiato base/branch.

## Stato

PRONTO PER REVISIONE. Tutti i passi del 56-01 completati, nessun passo saltato.
Contratto implementato: POST interno con autenticazione a segreto, richiesta sessionId non vuoto,
conferme con numero intero positivo, titolo stringa, APPROVATO / SCARTATO / RIPRENDI e link HTTPS.
Non è ancora un pulsante visibile nella pagina: cap-dev e la pagina web sono i successivi piani 56-02/56-03.
Rilascio 1.33.0 e integrazione a cura della coordinatrice; nessun mio push/tag/versionamento.

## Passi e commit

| Passo | Commit | Prove |
| --- | --- | --- |
| Piano, contesto e stato iniziale | 943aaac | fonti/perimetro/base verificati; copia identica dei piani |
| Contratto + export + test | 1b356b9 | 0/100 → 131/131 con i due contratti di riferimento; tipi e lint mirato verdi |
| Mutazioni e qualità finale | commit di verifica, HEAD di questa consegna | 34/34 nello stesso giro; 1067/1067, CJS 31/31, build in copia, lint e perimetro verdi |

SUMMARY aggiornato e PLAN/SUMMARY riletti dopo ogni commit. Un comando alla volta, un worker.
Installazione frozen/offline senza lifecycle: 235/235 pacchetti riusati, zero scaricati, lock invariato.
Hook industriale preservato; .planning/phases/** ammesso dal hook senza cambiare il perimetro.

## Prove rosso → verde

- Test scritti prima del contratto: 0/100 verdi, 100/100 AssertionError reali; nessun errore di raccolta.
  Test parametrizzati con gli array in una cella: [] è davvero il valore provato.
- Dopo l'implementazione: 131/131 (100 nuovi + 13 reload + 18 model-config); tipi exit 0.
- Un giro finale completo di 34/34 mutazioni, seriali sulla sola rotta in copia, tutte rilevate da AssertionError.
  Baseline e ripristino 100/100; 34/34 reporter raccolgono 100 casi e nessun messaggio di errore del file.
  Nessuna somma di lotti, nessun errore di caricamento o timeout contato come rosso.
- Suite completa autorizzata esplicitamente dalla coordinatrice alle 15:24: UN giro,
  1067/1067 test in 79/79 file, 967 preesistenti + 100 nuovi, success true.
- Smoke CJS storico: 31/31 nell'originale e 31/31 nella copia compilata.
- Build eseguita nella copia temporanea: exit 0, 254/254 dichiarazioni portabili.
  Export pubblico ESM/CJS rotto nella sola copia: 2/2 AssertionError; ripristinato: 2/2 verdi.
  Consumer di tipi .mts/.cts compilati: exit 0.
- Lint completo src/tests: exit 0. Hash protetti package/CHANGELOG/lock/dist: 1011/1011 invariati.
- Perimetro e git diff --check verdi; l'unico file preesistente cambiato è il barrel, una riga di export in più.

I primi due tentativi del helper temporaneo di qualità si sono fermati nelle verifiche del helper:
ancora JS con virgolette/estensione diversa dall'output compilato, poi TS6 richiedeva --ignoreConfig
per i due file consumer espliciti. Corrette solo le chiamate del helper, terzo tentativo verde;
nessuna modifica al compilatore, ai test/contratto o ai file protetti e nessun rosso spacciato per mutazione.

## Contratto e stati

| Elemento | Specifica del piano | Stati coperti |
| --- | --- | --- |
| internalDevConfermeContract | POST /internal/dev/conferme-in-attesa, auth secret | path, metodo, auth, body/responseSchema, export HTTP e barrel |
| richiesta | sessionId string min 1 | web e stringa di un carattere validi; vuoto, assente, tipi diversi, oggetto extra respinti |
| risposta | conferme array di oggetti | coda vuota, più conferme e ordine; campi mancanti, tipi/extra respinti |
| richiesta numerica | int > 0 | 1 valido; zero/negativi/frazioni/non-finiti/non-numeri respinti |
| titolo | string | stringa vuota valida; non stringhe respinte |
| comando | APPROVATO / SCARTATO / RIPRENDI | tutti e tre validi; varianti, casing e altri tipi respinti |
| link | URL HTTPS | HTTPS valido; relativo, malformato, HTTP/FTP/httpsx e tipi diversi respinti |

## Scelte da confermare

- Il piano prescrive sessionId string min 1. La forma web e l'appartenenza al proprietario sono controlli dei consumer:
  non aggiungo regex, trim o durata al contratto.
- Uso bodySchema, forma di EndpointContract e del client del bridge; schema e tipi pubblici esportati dal sottopercorso HTTP.
- Gli oggetti nuovi sono strict, come gli endpoint nuovi del bridge; titolo vuoto e coda vuota sono validi.
- Versione 1.33, CHANGELOG e dist originali restano alla coordinatrice. Build solo in copia per rispettare il piano.
- Passkey, token monouso, TTL, conservazione in memoria e legame alla sessione autenticata appartengono ai consumer;
  documentati nel JSDoc ma non dichiarati come implementati da questo contratto.
- Fixture sintetici, URL senza token/segreti; nessuna credenziale reale, rete, storage o LLM coinvolti.

## Evidenze

- contract-red.md e contract-green.md: tutti i casi rosso/verde e comandi.
- FINAL-MUTATIONS.md: 34 mutazioni, assert rappresentativi e archivio completo;
  runner riproducibile tests/http/endpoints/mutate-internal-dev-conferme.py.
- full-suite.md: denominatori, 79 file e SHA256 del reporter completo.
- FINAL-QUALITY.md: comandi build/consumer/CJS/lint e archivio temporaneo.
- FINAL-PERIMETER.md: file ammessi, diff protetti vuoto e una sola aggiunta al barrel.

I JSON e log completi rimangono negli archivi temporanei indicati dai report; nel Git soltanto riepiloghi Markdown.
Nessuna verifica dal vivo dei servizi o della pagina web: fuori dal piano del contratto.
