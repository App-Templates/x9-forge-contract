# Revisione indipendente del delta inviti

Esito: **APPROVE limitato al pacchetto SDK** 062dab31 integrato sopra92e669a. Nessun difetto bloccante trovato nel perimetro consegnato.

La validazione mantiene separati registro indisponibile e destinatario sconosciuto. Pending è senza principal e non può diventare autorità C3. Il draft accetta solo identificativo richiesta, email e revisione attesa. La lista controlla binding completo (incluso Vault), scope dei record, ID/email unici, revisione e tempi coerenti. La proiezione pubblica filtra identità e scope; revoca prevale sulla scadenza. Il controllo destinatario richiede email esatta, lookup registrato fresco e usa il controllo C3 canonico per principal, scope, revisione e validità.

Prove indipendenti: 4708/4708 test in163 file, zero saltati; compilazione378/378 dichiarazioni; cinque mutazioni intenzionali rilevate e ripristino esatto; smoke pubblici inviti24/24 per Node20 e24, insieme ai controlli delle parti già integrate. Tipi/lint/pack e probe NodeNext verdi. Dettagli e hash in PROOF.json.

Limiti: il pacchetto non implementa lookup persistente, handler di invito/revoca, account, autenticazione, emissione o percorso browser. L’etichetta active è metadato del record. I producer devono controllare proprietà, registro corrente, policy e revisione prima/dopo operazioni asincrone. Nessuna prova dal vivo e nessun rilascio o pin consumer eseguito da F. Ulteriori lotti dell’autore ancora in corso sono esclusi.
