# Requisiti del primo incremento

Fonte: riferimento funzionale v2; sono criteri da verificare sul prodotto futuro, non esiti già ottenuti.

## AC01 — Selezione e isolamento
Seleziono un agente autorizzato e vedo soltanto le sue funzioni. Cambiando agente, i dati precedenti spariscono durante il caricamento; una risposta tardiva non sostituisce la nuova selezione.

## AC02 — Configurazione e provenienza
Per ogni funzione vedo il modello configurato e la fonte attestata: locale, ereditata dal Master o del Master stesso. Una fonte non disponibile resta dichiarata; non viene ricostruita da un default presunto.

## AC03 — Configurato e applicato
Apro il dettaglio e distinguo configurazione salvata, default del Master e applicazione osservata, con versioni e data se disponibili. Un applicato assente o discordante è indicato esplicitamente. Non si dichiara una chiamata al modello verificata dalla sola configurazione.

## AC04 — Caricamento e aggiornamento
All’apertura o con Ricarica vedo l’attesa; non compaiono valori di esempio come dati veri. L’esito aggiorna il riferimento temporale. Se l’aggiornamento fallisce, l’eventuale ultimo dato resta marcato non aggiornato.

## AC05 — Vuoto e capacità assente
Se la fonte conferma zero funzioni, vedo Nessuna funzione disponibile. Se una capacità è assente o non verificata, vedo quello stato separato. Un errore della fonte non diventa una pagina vuota.

## AC06 — Errori e dati parziali
Se la fonte non risponde vedo una spiegazione e Riprova la lettura; il tentativo ripete solo la lettura. Se manca un singolo dato, le altre righe attestate restano leggibili e il dato mancante non riceve un valore inventato.

## AC07 — Consultazione e dettaglio
Posso aprire e chiudere il dettaglio, leggere modalità, eventuali livelli e riserva già configurati. Cambia, Risincronizza, Salva e applica e collegamenti alla modifica sono fuori da questo perimetro e non appaiono operativi nella beta.

## AC08 — Accesso e identità
Un account vede soltanto gli agenti consentiti. Identità non risolta o accesso negato producono uno stato comprensibile senza dati di altri agenti. Cambio account/sessione invalida i dati precedenti e il dettaglio aperto.

## Vincoli trasversali

- R01: nessuna scrittura di configurazione o nuova chiamata a provider causata dalla consultazione.
- R02: completezza dichiarata rispetto all’inventario autorizzato; registro di consumer ≠ elenco delle capacità installate.
- R03: nessun dato mancante riempito con un default presunto; origine non ricavata dall’uguaglianza di due valori.
- R04: una prova di configurazione non dimostra una chiamata al modello né un rilascio.
- R05: nuovo contratto soltanto in @x9-forge/contracts; pin/distribuzione coerenti prima dell’integrazione.
