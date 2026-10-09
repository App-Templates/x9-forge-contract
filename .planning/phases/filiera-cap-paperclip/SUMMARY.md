# D4 — canonical cap-paperclip contracts

Implementato e testato, 09/10 15:32, entro lotto15:21–16:06. Fonte mandato coor151204; bridge169, branchcodex/cap-paperclip-bridge. MaterialEvent, RoutingConfig, ResolvedRoute, Handoff, HandoffReceipt e DecisionRecord sono esportati dal subpath paperclip e dal barrel capability. Shape E1/E2 concordato con E; strictObject e nessuna identità/credenziale accettata nel materiale. La configurazione è solo dato dell'operatore e non costituisce autenticazione o prova di verifica umana.

32/32 test mirati; tutti32 visti rossi;25/25guasti causali, ripristinoverde. Rifiuti per campi aggiunti, versione, evento, timestamp, email e falsa attestazione/effetto Paperclip. Typecheck e lint dei file nuovi verdi; buildESM/CJS,360/360dichiarazioni portabili,6/6exportESM+6/6CJS+6/6barrel verificati.

Regressione iniziale4030/4031: il controllo storico confrontava per uguaglianza la lista dei subpath1.30, vietando ogni aggiunta. Corretto per esigere tutti gli export storici e permettere aggiunte; rimozione intenzionale di ./auth produceAssertionError1/1, restoreverde1/1. Snapshot1.30 immutato. Regressione finale4031/4031 in151file. Prima qualifica positiva produceva ZodError (non accreditato): aggiunta asserzione safeParse prima di parse; replayfinale25/25causali. Primo lint rilevava any nel helpertest: corretto con pathRecordunknown.

## Fruibilità alla consegna (R-34)

E può importare il pacchetto compilato169 e portare gli algoritmi nel cap168 senza duplicare DTO. Nessun cambio della versione1.44.0/push/pubblicazione: integrazione con additive1.45 e release spettano alla coordinatrice. Questo lotto non implementa ancora il servizio167 né l'invioX9;0emailreali,0eventiVPS verificati. Restano nativeclient, toolhandlers, bindingautenticato, routingE, integrazione/collaudoVPS e invioreale email_send dalserver. PROOF.json e qualifiche conservano denominatori,hash e raw.
