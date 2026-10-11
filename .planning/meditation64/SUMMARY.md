# Native64 — contratto di sessione lunga — 11/10/2026

- Aggiunto grant durevole distinto dall'ammissione iniziale; durata esplicita positiva, massimo 24 ore.
- Persona, identità agente, programma, conversazione e configurazione restano quelli ammessi.
- Emissione e collegamento entro l'ammissione; il replay di un grant già emesso può superarla.
- Ogni autorizzazione operativa resta fresca per massimo 60 secondi e mai oltre il grant.
- Correlazione completa; revocato/chiuso non si riattivano, draining permette solo continue.
- API S2S canoniche issue/resolve/recheck; il body non fornisce viewer, policy o durata.
- Il producer deve rileggere policy, inviti, link e runtime dopo gli await: schema e secret non autorizzano.
- RED iniziale 7 asserzioni su 16 casi; mirati finali 16/16, TypeScript exit 0.
- Quattro mutazioni di sicurezza rilevate: 8/8 casi attivi rossi; sorgente ripristinata.
- Regressione finale: 4443/4443 test in 178 file, nessun pending; worker singolo, rete e credenziali negate.
- Build ESM/CJS in copia temporanea nuova, 414/414 dichiarazioni portabili; package.json invariato.
- Comportamenti tramite export compilati: ESM 16/16 e CommonJS 16/16; NodeNext exit 0.
- Smoke CJS esistenti: 36/36 + 6/6 + 15/15 + 16/16 + 39/39; publint exit 0.
- Warning publint preesistente sulle types CJS del root, non introdotto dal grant.
- Adottati 24 file compilati identici alla build; altri 1632 invariati, vecchio archivio/installazioni intatti.
- Preparazione esclusa dai RED: Vite env.mjs vietato per errore, moduli smoke omessi, flag TS6 mancante.
- Unica review finale indipendente APPROVE locale; nessun rilievo P1/P2.

## Esistente (R-35)
Riutilizzati admission, binding/conversation, scope, uguaglianza semantica, header e prefisso nativi.

## Fruibilità alla consegna (R-34)
Contratto e pacchetto verificati localmente. Producer Forge, consumer X9 e percorso browser restano da collegare.
Nessuna migrazione effettiva, attivazione provider, pubblicazione o modifica dell'app Meditation originale.
- Righe oggi11/10 (aggiunte/rimosse): prodotto83/0, test147/0, documenti238/0; compilati separati.
