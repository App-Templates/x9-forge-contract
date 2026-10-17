# Canali Web e contenuti storico — raccordi canonici
## Implementato
Riusa policy/link/inviti/CAS/lease e binding completo esistenti; nessun writer o archivio alternativo.
Pubblico: metadata minimo pre-Start e sessione correlata, no-store, senza mapping o policy privata.
Admin: snapshot sicuro, preview/apply policy correlati e catalogo read-only per il writer Modelli.
Sessione SA/owner e management alias obbligatori; runtime alias distinto, versioni e link stabile verificati.
Readiness amministrativa non concede admission: policy off/pausa/lifecycle e provider osservato <60s.
Trascrizioni: testo user/assistant e oggetto email, limiti aggregati, ordine temporale e stato retention esplicito.
Lettura canonica interna e Forge tramite entryId opaco; fullbinding/kind/entry/conversation/freschezza correlati.
Nessun URL/provider envelope/tool arguments/system prompt nel DTO; contenuto autorizzato, non log grezzo.
## Prove locali
Pubblico precedente:104/104, tipi/lint/build0, ESM/CJS42/42.
Admin25 nuovi +22 pubblici:47/47; RED16/46 e link malformato1/1 causale; 2/2 guardie sicurezza rosse/ripristinate.
Trascrizioni44/44: RED21/44 asserzioni,23 baseline verdi; 2/2 guardie scope/owner rosse/ripristinate.
Finale integrato dei due file91/91; tsc --noEmit ed eslint degli otto file modificati: exit0.
Build nativa0,386/386 dichiarazioni portabili; export ESM25/25+CJS25/25, nessun provider o dato reale.
## Fruibilità e confini
Descrittori e helper non montano handler né autenticano chiamanti; producer e consumer devono comporre le guardie.
Fonte phone conserva trascrizione nel webhook; Email richiede lettura del corpo, TG/Web il proprio evento preciso.
Contenuti audio restano senza rotta; non si dichiara audio disponibile o trascrizione vuota per assenza.
Composizione unica affidata a F; pin pubblicato precede adozione API/UI nei consumer.
Pagina Parla, authority corrente, UI/SDK montato e letture contenuto reali restano da completare.
Review indipendente e suite completa alla consegna funzione; nessun push, merge, deploy o cancellazione.
Prove Web dal vivo0/1; nessuna dichiarazione100%.
