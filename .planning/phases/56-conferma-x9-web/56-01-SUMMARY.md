# 56-01 · contratto delle conferme per X9 Live web
Ultimo aggiornamento: 15:20 (06/10/2026)

Worktree: /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-56-1
Branch: codex/56-01-bridge-conferme. Base d8ef67f (1.28), uguale a origin/main disponibile.
Codex B del pool Forge, assegnazione rettificata 14:58; interruzione ritocchi 1.29 chiusa 2df0516.

## Stato

Contratto implementato e verde: POST interno con secret auth, richiesta sessionId non vuoto,
lista di conferme con numero positivo intero, titolo string, tre comandi e link HTTPS.
Test scritti prima: 0/100 passati, 100/100 assert rossi reali; poi 131/131 con i due contratti di riferimento.
Tipi verdi. Restano mutazioni di ogni guardia, build in copia e qualità/perimetro finali.
Installazione frozen/offline senza lifecycle completata, 235/235 pacchetti riusati e zero scaricati; lockfile invariato.
Hook industriale preservato; .planning/phases/** è ammesso dal hook senza cambiare il perimetro.
Un comando leggero alla volta; test mirati con un worker finché manca un posto riservato.

## Passi e commit

| Passo | Commit | Prove |
| --- | --- | --- |
| Piano e stato iniziale | 943aaac | fonti/perimetro/base verificati |
| Contratto + export + test | questo commit | 0/100 → 131/131, tipi verdi |
| Mutazioni e qualità | da fare | una mutazione per ogni controllo, su copia; build in copia |

## Scelte da confermare

- Il piano prescrive sessionId string min 1. La forma web e l'appartenenza al proprietario sono controlli dei consumer,
  non aggiungo qui una regex o una gestione di token/sessioni.
- Uso bodySchema, forma di EndpointContract e del client del bridge; lo schema pubblico della richiesta è esportato.
- La nuova rotta non dipende da 1.29: nessun riallineamento necessario per scriverla sulla base 1.28 disponibile.
- Versione 1.33, CHANGELOG e dist originali restano alla coordinatrice, come richiesto.
  La build avviene in una copia temporanea: nessuna modifica a questi file nel worktree.
- Non implemento cap-dev, endpoint web, passkey, durata o consegna monouso: sono i successivi piani 56-02/56-03.

Le tabelle Vitest avvolgono gli array invalidi in una cella: [] è davvero provato come valore,
non come una riga senza argomenti. Rosso finale rieseguito prima degli schemi (nessun errore di raccolta).
Gli oggetti nuovi sono strict; nessuna credenziale reale o token nei fixture, link HTTPS sintetico senza segreto.
