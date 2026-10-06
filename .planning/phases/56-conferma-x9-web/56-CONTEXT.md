# Phase 56 — Conferma con impronta direttamente da X9 Live web — CONTEXT

conforms: x9-bacheca DECISIONI D-02, D-11, D-12 (06/10) + richiesta di Stefano 06/10 («falla anche da X9 web,
mettila in coda per Codex»); R-14 (contratto nel bridge prima del consumatore), R-17, R-20, R-23.

**Obiettivo.** Quando Stefano approva/riprende/scarta a voce da X9 Live web, la pagina di X9 Live mostra subito un
pulsante «Conferma con impronta — R<n> <titolo>» che apre la pagina passkey di cap-dev. Telegram resta (doppio canale).

**Vincolo di sicurezza (perché non basta far dire il link a X9):** il link monouso vale come una chiave per 5 minuti;
NON deve mai passare dal modello (contesto LLM, trascrizioni conservate 30 giorni) né da log, URL o percorsi. Deve
andare solo alla pagina della sessione web autenticata del proprietario che ha dato l'ordine.

**Disegno.**
1. cap-dev (Phase 55): quando emette un link di conferma per un ordine partito da una sessione X9 Live web
   (`sessionId` `^web-[0-9a-f]{8}$`), tiene il token grezzo SOLO in memoria, legato a quel sessionId, con lo stesso
   TTL del link (5 min), consegnabile UNA volta.
2. Rotta interna nuova di cap-dev `POST /internal/dev/conferme-in-attesa` (segreto interno, header dal bridge), corpo
   `{ sessionId }` → `{ conferme: [{ richiesta, titolo, comando, link }] }`, e il token consegnato si cancella. Mai
   pubblica (Traefik espone solo `/dev/`).
3. Contratto della rotta nel bridge (v1.33.0, prenotata in `~/.claude/agent-coordination/BRIDGE-VERSIONI.md`).
4. cap-voice-live: rotta server della pagina web (dietro `LIVE_WEB_AUTH_TOKEN`) che, per la SOLA sessione web
   autenticata (sessionId dal server, mai dal client), interroga cap-dev; la pagina mostra il pulsante e apre il link
   in una scheda nuova (`window.open(link, "_blank", "noopener")`). Nessun token in log, URL o storage del browser.

**Base:** agent-x9 branch `phase/55-cap-dev` (cap-dev non ancora su main); bridge `origin/main` (v1.27.1).
