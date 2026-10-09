# Contratto UI del primo incremento

Riferimento esistente: f-formato/v2/riferimento.json + TAVOLA-MODELLI-v2.html/PDF; tavola origine C .planning/phases/c5-modelli-pagina/preview/drawing.html e drawing.css, SHA C5460fa2f. Stato proposta v2; review tecnica dei materiali acquisita, approvazione del referente da registrare. Non si cambia lo stack o il kit e non si avvia un redesign.

## Componenti da riusare

Shell/router autenticati, ModelsReadOnly, ModelConfiguration, consumerLabel, models-page.css e kit fx esistenti. ModelsPage editor resta fuori incremento: non sostituirlo globalmente e non attivarne i comandi dalla consultazione.

## Mappa vincolante U01..U08

U01 agente da inventario autorizzato/nome pubblico con fallback ID esplicito; route slug risolta sul mapping attestato, niente uguaglianza indovinata. Cambio agente/caller cancella subito modello e dettaglio precedenti; risposte tardive ignorate.
U02 riga per funzione realmente censita: riepilogo configurato esatto, anche single/tiered/failover; nessun modello inventato o elenco statico.
U03 origine locale/ereditata/Master stesso solo se attestata; altrimenti «Provenienza non disponibile». Colore sempre accompagnato da testo.
U04 Dettagli espandibile, saved/default/applied separati con versioni/date disponibili; «Applicazione non verificata» se assente. Nessuna chiamata al provider dichiarata verificata.
U05 Ricarica: attesa e ultimo observedAt dalla fonte. Al fallimento nello stesso scope l’ultimo dato resta marcato «Non aggiornato»; cambio identità o revoca lo rimuove, non lo conserva.
U06 «Nessuna funzione disponibile» solo dopo copertura complete e zero attestato; capacità «assente» e «installazione non verificata» distinti.
U07 errore di fonte oppure riga parziale con motivo pubblico neutro e «Riprova la lettura»; nessun payload privato nei testi.
U08 testo «Solo consultazione»; nessun Cambia, Risincronizza, Salva/Applica, form di scrittura o link «Cambia in Modelli». Dettagli e rilettura sono le sole azioni.

## Verifica visuale futura

1280×950 e390×844, tema del kit chiaro/scuro disponibile, tabulazione e focus visibili, controlli con nome accessibile; mobile senza overflow del corpo (eventuale tabella scrollabile con indicazione). Screenshot prodotto autenticato su fixture distinte da quelle del materiale. Confronto affiancato con v2 per tutti8stati, nessuna approvazione grafica dedotta dal test DOM. Nessuna nuova dipendenza/font/asset remoto.
