# Piano bridge per Meditation

Sintesi delle ricognizioni 01–03 del 15/10/2026. Questo documento pianifica il lavoro: non modifica contratti e non attesta test o funzionamento dal vivo.

| Fonte | Esito | Decisione |
| --- | --- | --- |
| [01-CONFIG](01-CONFIG.md) | COMPLETO | Nessun lotto: configurazione ordinaria, Coach ed ElevenLabs già esportati. |
| [02-PRESENTAZIONE](02-PRESENTAZIONE.md) | ESISTE per nome tecnico e sezioni; MANCA per prodotto | Lotto 1: estensione additiva della presentazione. |
| [03-PROGRAMMA](03-PROGRAMMA.md) | COMPLETO | Nessun lotto: riusare PUT, apply e rilettura Coach con scope completo. |

## Lotto 1 — Metadati commerciali della capacità

Dipendenza: ricognizione 158; nessuna nuova rotta HTTP. Non cambiare il nome tecnico della capacità per mostrare “Meditation”.

### Perimetro proposto e limite dei file

- `src/capability/presentation.ts`: unico sorgente da modificare.
- `tests/capability/product-presentation.test.ts`: nuovo test, ammesso anche dall'eccezione test del 14/10.
- `dist/**`: soltanto gli artefatti effettivamente rigenerati dalla build per questa modifica, nello stesso lotto del sorgente, mai modificati a mano.

Il limite è **5 file effettivi per lotto**, non cinque voci o glob. `dist/**` non conta come un solo file. La distinta dei generati va ricavata dallo script dopo la build; le ricognizioni non la forniscono e questa attività non può eseguire la build né leggere `dist/`.

**Vincolo di eseguibilità:** il lotto non è autorizzabile come micro-compito entro cinque file finché lo script non fornisce la distinta completa e ne verifica il conteggio. Anche escludendo il test tramite l'eccezione, restano al massimo quattro generati oltre al sorgente. Gli export ESM/CJS e le dichiarazioni possono superare questo tetto; non separare artificiosamente sorgente e generati in lotti diversi. Se il conteggio supera il limite, richiedere al coordinatore una deroga esplicita per i generati; non consegnare una distribuzione parziale. Non è una seconda lacuna funzionale né autorizzazione a modificare altri file.

### Contratto da implementare

In `presentation.ts`, esportare `CapabilityProductPresentationSchema` e `CapabilityProductPresentation = z.infer<typeof CapabilityProductPresentationSchema>` con forma `{ title: string; description: string; icon: string; category?: string }`, oggetto strict. Riutilizzare `TextSchema` (trim, 1–200 caratteri), `DescriptionSchema` (trim, 1–2000), `IdSchema` (trim, 1–100) rispettivamente per titolo, descrizione, icona/categoria.

Aggiungere `product: CapabilityProductPresentationSchema.optional()` a `CapabilityPresentationDeclarationSchema`. Manifest e registro ereditano il campo: nessuna duplicazione. Conservare gli export già presenti da `@x9-forge/contracts/capability` e `@x9-forge/contracts/capability/presentation`, senza modificare gli index o `package.json`. L'icona è un identificatore da risolvere nel consumer; i limiti di `IdSchema` non costituiscono una sanitizzazione HTML. Vocabolario e resa grafica spettano a Forge.

Non aggiungere endpoint. Se un successivo compito ne autorizzasse uno, ogni nuovo file endpoint deve contenere `import { z } from 'zod'` e riusare i contratti comuni; non estendere questo lotto implicitamente.

### Test e mutazioni richiesti

Nel nuovo test usare import pubblici da entrambi i subpath e verificare anche il tipo inferito esportato. Costruire manifest e registro completi, con dati sintetici validi; confrontare l'intero `presentation.product` dopo il parsing.

| Controllo | Mutazione che deve produrre rosso |
| --- | --- |
| Metadati conservati in manifest e registro | Rimuovere `product` dalla dichiarazione. |
| Payload senza presentazione, senza prodotto e con sezioni B7 preesistenti validi | Rendere `product` obbligatorio. |
| Titolo, descrizione e icona obbligatori; categoria facoltativa | Rendere facoltativo ciascun obbligatorio, poi obbligatoria la categoria. |
| Ogni campo rifiuta vuoto, soli spazi, tipo errato e lunghezza massima + 1; accetta i limiti | Rimuovere separatamente trim, minimo, massimo o controllo di tipo del relativo campo. |
| Spazi esterni normalizzati, categoria inclusa | Rimuovere il trim e confrontare il valore risultante. |
| Chiavi sconosciute nel prodotto rifiutate | Rimuovere strict dal nuovo schema. |
| Schema e tipo disponibili dai due subpath | Rimuovere separatamente gli export aggiunti; build/controllo tipi devono rilevarlo. |

Lo script applica una mutazione per volta, registra caso e asserzione fallita, ripristina e verifica il verde. Riportare mutazioni rilevate/totali e casi passati/totali; un errore di caricamento non prova una validazione runtime. Non indebolire i test esistenti.

### Accettazione del lotto, affidata allo script

Con Node 24 e `$QRUN` impostato all'esecutore silenzioso della corsia:

```bash
$QRUN 'pnpm build'
$QRUN 'pnpm exec vitest run tests/capability/product-presentation.test.ts --maxWorkers=1'
$QRUN 'pnpm exec eslint src/capability/presentation.ts tests/capability/product-presentation.test.ts'
```

Lo script esegue anche il controllo tipi della corsia, le mutazioni e il controllo del perimetro, includendo tutti i generati effettivamente cambiati. Il worker scrive codice e test; non esegue questi comandi di accettazione. Nessuna modifica a dipendenze o configurazioni per rendere verdi i controlli.

## Passaggio ai consumer

Dopo il contratto, compiti separati nei rispettivi repository devono emettere i metadati nei manifest Coach/ElevenLabs, conservarli nella discovery e mostrarli in Forge. Riutilizzare i contratti delle ricognizioni 01 e 03 per configurazione e programmi; verificare nei consumer montaggio delle rotte, autorizzazione, versioni, replay e rilettura. Template Meditation e revisioni devono provenire da fonti autorevoli. Nessun lotto aggiuntivo bridge è giustificato dalle tre ricognizioni.

Stato: piano scritto; implementazione, build, test, mutazioni e verifica dal vivo non eseguiti. Resta da risolvere il conteggio reale dei generati prima di assegnare il lotto entro il tetto richiesto.
