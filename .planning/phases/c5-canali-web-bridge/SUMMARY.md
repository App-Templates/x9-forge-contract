# Canali Web — raccordo pubblico
## Implementato (R-35)
Riusa policy, link, inviti, ammissione e lease browser canonici già esistenti.
Metadata pre-Start: solo nome, link, stato e osservazione; nessun identificativo privato o artefatto provider.
Owner/invitato/pubblico verificati sul server; stato off/paused distinto da disponibilità, evidenza valida meno di 60 secondi.
GET /api/parla/:linkId e POST /api/parla/:linkId/session con correlazione stretta e no-store.
Sessione opzionale soltanto per policy pubblica esplicita; il descrittore non autentica o monta una rotta.
## Prove
Comando: pnpm exec vitest run tests/capability/agent-elevenlabs/web-browser.test.ts tests/capability/c5-web-browser.test.ts tests/http/endpoints/forge-elevenlabs-web.test.ts --maxWorkers=1.
65 nuovi casi: RED 28/65 asserzioni, 37/65 negativi già verdi; finale 104/104 nei tre file.
Sicurezza: accesso 5/5, binding/origine 3/4, scadenza 4/4, correlazione HTTP 1/1 diventati rossi.
Tutte le guardie ripristinate; 104/104 nuovamente verdi.
tsc --noEmit ed eslint dei cinque file modificati: superati.
pnpm build: superata, 380/380 dichiarazioni portabili; smoke inline ESM/CJS 42/42.
## Fruibilità alla consegna (R-34)
Raccordo implementato/testato, non ancora adottato nei consumer o verificato dal vivo: 0/1 percorsi Web.
Il browser continua a ricevere solo la lease già autorizzata; metadata non autorizza avvio o accesso al microfono.
Composizione del pacchetto con F e pin pubblico precedono API Forge/pagina Parla.
Restano handler, authority corrente, UI/SDK montato e prova reale dell'intera funzione Canali.
Review indipendente e suite completa alla consegna della funzione; nessun provider, segreto reale, push o deploy.
Misura di questo delta: 107 righe prodotto, 96 test, 21 documenti; derivati compilati esclusi.
