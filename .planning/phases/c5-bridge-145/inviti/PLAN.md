# Bridge 1.45 — integrazione inviti SDK

Ordine della coordinatrice 215455: integrare il lotto pronto 062dab31 sopra 92e669a, revisione indipendente, distribuzioni e suite completa; consegnare il nuovo SHA per la 1.45 definitiva. F0B torna prioritario dopo questa consegna. Timer 21:57:19–22:42:19 CEST, massimo 45 minuti o tre riparazioni. Slot forge-v2-F-c5-bridge-145-inviti. Perimetro codex_c5-bridge-145.txt. Push, versione, rilascio e pin consumer restano della coordinatrice; PR29 associata alla chat.

## Fruibilità (R-34)

Il pacchetto descrive inviti Web autenticati, destinatari dal registro owners/Clerk, pending senza principal, indisponibilità distinta da utente non registrato. Le proiezioni restituiscono solo metadati pubblici. La prova riguarda fixture sintetiche del pacchetto: handler, persistenza, lookup reale, emissione e percorso browser non sono implementati da questo lotto. Nessuna feature utente dichiarata completa e zero verifiche dal vivo.

## Esistente (R-35)

src/capability/agent-elevenlabs/web-channel.ts:54 contiene il record canonico C3 e il controllo di validità; src/capability/index.ts esporta il modulo pubblico. Scope, email, revisione e binding riusano i validatori esistenti. Cambia lo stack: no; nessun nuovo registro di utenti, account link, protocollo, ledger o autorità. La Rubrica non limita i destinatari Web.

## Sequenza e confini

Merge del solo ref pronto, sorgenti e test autori intatti. Revisione di lookup, binding completo, destinatario/revisione, date, pending e proiezione pubblica. Riuso dei 30 test e dello smoke pubblico dell’autore; quattro mutazioni sorgente e una perdita dell’export, con rosso AssertionError e ripristino byte esatto. Le due esecuzioni ESM/CJS della perdita dell’export restano una sola mutazione. Build nativa, suite completa con un worker, tipi/lint/pack e controlli pubblici Node20/24. Manifest di integrità e perimetro, distribuzioni rigenerate. Conservare i raw precedenti senza sovrascriverli. Nuovi lotti C ancora WIP esclusi. Dopo ogni commit rileggere PLAN e SUMMARY.

## Consegna

Prove finali in PROOF.json e SOURCE-MANIFEST.json; raw distinti in work/c5-bridge-145-inviti/raw. Verdetto limitato al pacchetto SDK. Nessuna modifica package/lock, push, pin, handler o dato esterno. F0B preparato su 77359d12 resta in attesa del riferimento pubblico e del pin autorizzato.
