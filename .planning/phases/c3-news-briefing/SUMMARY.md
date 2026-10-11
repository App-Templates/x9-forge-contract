# c.3 News/Briefing — checkpoint Bridge

Piano unico: bacheca/piani/CAPABILITIES-C3-NEWS-BRIEFING-PLAN.md; mandato coordinatrice191730.
Implementato solo il confine tipizzato: stato salvato/effettivo, feed, patch impostazioni e comandi regole.
I metadati delle nuove regole restano del producer; nessun comando Security/Netatmo o destinatari.
GET/POST interni scoped, CAS e helper di confronto della famiglia; ancora nessun handler producer o pannello Forge.
Codec feed/regole/impostazioni riusati, nessuna nuova libreria.

Prove: `pnpm exec vitest run tests/capability/news-briefing-settings.test.ts tests/http/news-briefing-settings.test.ts tests/capability/structured-feeds.test.ts tests/capability/structured-rules-cameras.test.ts --maxWorkers=1`.
Esito: 60/60 in4file (45nuovi+15regressioni). Prima strict schema:19/29 rifiuti fallivano; URL malformato poi1/32rosso, corretto.
Mutazioni sicurezza2/2intercettate: scope/famiglia4/4assertionrosse, metadati regole2/2rosse; ripristino60/60verde.
`pnpm typecheck`, lint dei6file e `git diff --check` verdi; corretto il tipo generico prima della conferma60/60.
Posto ricevuto194224: build/dts492/492 e14/14smoke compilati ESM/CJS verdi; `check:pack` verde (warning tipi CJS esistente).
Install offline mancava1tarball; dipendenze terze parti riusate con copia isolata dal vecchio worktree, senza sue modifiche.
Nessuna suite completa, revisione indipendente anticipata, push, integrazione o deploy.

## Fruibilità alla consegna (R-34)
Non consegnato: questo checkpoint non permette ancora modifiche da Forge/X9.
Restano writer unico/adozione legacy, reader e timer reali, UI, percorso composto e revisione finale.
Prova dal vivo non eseguita; nessuna dichiarazione100%.

Misura giornata c.3: prodotto132righe, test103righe; piano88righe + SUMMARY22righe (perimetri/compilati separati).
