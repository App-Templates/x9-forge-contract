# Canali Telefono/Web — contratti in esecuzione
## Implementato
- C2 pubblico conserva snapshot, CAS, ricevute e routing con archivio obbligatorio dal record proprietario.
- Nuove viste runtime private Phone: configurazione/identità e runtimeLoadState, senza agentArchived.
- Snapshot, ricevute, inventario e selezione runtime riusano le stesse validazioni di linea, tempi e generazioni.
- Helper runtime attestano solo evidenza e candidati: non autorizzano chiamanti o nuove chiamate.
- Descrittori HTTP runtime sulle stesse rotte private/autenticazione; vecchi export conservati.
- Producer e consumer devono adottare insieme la vista runtime: nessun fallback agentArchived=false.
- SDK Web/inviti/storico già presenti restano contratti, non percorsi utente attestati.
## Prove
Comandi: pnpm exec vitest run tests/agent/agent-phone-{runtime,commands}.test.ts e due test HTTP Phone;
pnpm exec tsc --noEmit; eslint dei file toccati; pnpm build; node tests/cjs/agent-phone-channel-smoke.mjs.
- 43 nuovi casi: 7 asserzioni rosse prima della logica, 36 negativi già verdi sullo stub.
- Finale dopo ripristino: 194/194 in 4 file mirati; tipi e lint superati.
- Tre tagli di sicurezza/autorità rilevati: binding 5/5, archivio privato 2/2, archivio pubblico 1/1.
- Pacchetto ESM/CJS: 66/66 asserzioni; build e 378/378 dichiarazioni portabili.
- Nessun provider reale, credenziale reale, push, merge o deploy.
## Fruibilità alla consegna (R-34)
Non consegnata: 0/2 percorsi Telefono/Web verificati dal vivo.
Forge deve comporre archivedAt dal proprio record; X9 non può affermarlo.
Composizione/pin pubblico coordinati con F prima dell'adozione nei consumer.
Restano ammissione inbound, autorità Web/inviti/catalogo, storico voce e prova utente completa.
Review indipendente e suite completa alla consegna dell'intera funzione, non di questo raccordo.
Misura 10/10 dal base del lotto: 103 righe prodotto, 139 test, 24 documenti; derivati build separati.

Inviti amministrativi 06abb33 conservati additivamente con facciata pubblica Web; composizione da verificare.
