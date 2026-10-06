# Correzione 3 · rosso intenzionale e ripristino

Test aggiunto prima della mutazione. Baseline 105/105; mutazione 1/1 rilevata con 2/105 AssertionError; ripristino 105/105. Zero errori di raccolta/timeout.
Originali invariati 1013/1013 SHA256.
Prima: z.url({ protocol: /^https$/ })
Mutazione: z.string().startsWith('https://')
Casi rossi: pending confirmation response rejects an invalid HTTPS URL https://, pending confirmation response rejects an invalid HTTPS URL https://a b
Archivio JSON/log: /var/folders/m3/mywf84wd2k50664nh_ffnc3m0000gq/T/bridge56-correction3-y1uppxg5
