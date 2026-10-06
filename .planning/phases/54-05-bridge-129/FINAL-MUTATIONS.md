# FINAL-MUTATIONS · BRIDGE-129

Giro unico: 299/299 eseguite; 299/299 rilevate da asserzioni.
Baseline: 469/469; ripristino: 469/469.
Sorgenti/dist originali invariati: True; giro completo unico: True; ripristino verde: True.
Le 133/133 aggregate della prima consegna e il primo giro completo 286/286 sono soltanto storico.

Runner riproducibile: scripts/mutate-54-05-review.py; nessun lotto selezionabile.
Prova completa (edit, nomi e risultati): /var/folders/m3/mywf84wd2k50664nh_ffnc3m0000gq/T/bridge129-final-mut-evidence-5ds6iaeh/complete-proof.json
SHA256 prova completa: 45b9af0b403acd721716496f9d3d455c287f3371bf0a055843cc805bbb5b98a3
Report Vitest grezzi: /var/folders/m3/mywf84wd2k50664nh_ffnc3m0000gq/T/bridge129-final-mut-evidence-5ds6iaeh (archivio locale temporaneo, nessuno stack in Git).
Prove durabili precedenti: git show 233ca43:.planning/phases/54-05-bridge-129/review/final-mutations.json

Ogni riga riporta un assert fallito rappresentativo e il numero degli assert falliti in quel processo.

| Mutazione | File | Assert falliti | Test rappresentativo |
| --- | --- | --- | --- |
| B1-key | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects invalid key |
| B1-labels | src/capability/parameters.ts | 4 | B1 declared capability parameters rejects empty label |
| B1-value-type | src/capability/parameters.ts | 7 | public parameter value rejects nonprimitive/nonfinite input 0 |
| B1-status | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects unknown status |
| B1-application | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects unknown application time |
| B1-reference-required | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects missing reference |
| B1-consumes-required | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects missing spend flag |
| B1-strict-number | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects extra definition field |
| B1-strict-integer | src/capability/parameters.ts | 1 | each parameter variant rejects extra fields 0 |
| B1-strict-string | src/capability/parameters.ts | 1 | each parameter variant rejects extra fields 1 |
| B1-strict-boolean | src/capability/parameters.ts | 1 | each parameter variant rejects extra fields 2 |
| B1-strict-enum | src/capability/parameters.ts | 1 | each parameter variant rejects extra fields 3 |
| B1-number-min-finite | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects nonfinite minimum |
| B1-number-max-finite | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects nonfinite maximum |
| B1-integer-default | src/capability/parameters.ts | 2 | B1 declared capability parameters rejects fractional integer value |
| B1-integer-bound | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects fractional integer bound |
| B1-string-bound-integer | src/capability/parameters.ts | 2 | B1 declared capability parameters rejects fractional string bound |
| B1-string-bound-positive | src/capability/parameters.ts | 2 | B1 declared capability parameters rejects negative string bound |
| B1-boolean-default | src/capability/parameters.ts | 2 | B1 declared capability parameters rejects wrong boolean default |
| B1-option-count | src/capability/parameters.ts | 2 | B1 declared capability parameters rejects empty enum |
| B1-option-strict | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects extra enum option field |
| B1-minimum | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects default below minimum |
| B1-maximum | src/capability/parameters.ts | 2 | B1 declared capability parameters rejects default above maximum |
| B1-chosen-integer | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects fractional chosen integer |
| B1-string-type | src/capability/parameters.ts | 2 | B1 declared capability parameters rejects wrong string chosen type |
| B1-string-minimum | src/capability/parameters.ts | 2 | B1 declared capability parameters rejects string length below minimum |
| B1-string-maximum | src/capability/parameters.ts | 2 | B1 declared capability parameters rejects string length above maximum |
| B1-boolean-type | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects wrong boolean chosen type |
| B1-enum-membership | src/capability/parameters.ts | 2 | B1 declared capability parameters rejects unknown enum default |
| B1-ordered-number-bounds | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects minimum above maximum |
| B1-ordered-string-bounds | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects string bounds reversed |
| B1-unique-options | src/capability/parameters.ts | 2 | B1 declared capability parameters rejects duplicate enum options |
| B1-default-validity | src/capability/parameters.ts | 10 | B1 declared capability parameters rejects default below minimum |
| B1-origin | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects unknown origin |
| B1-resolved-strict | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects extra resolved field |
| B1-choice-has-value | src/capability/parameters.ts | 2 | B1 declared capability parameters rejects choice state zero is still a value |
| B1-choice-has-default | src/capability/parameters.ts | 2 | B1 declared capability parameters rejects choice state false default exists |
| B1-chosen-value-required | src/capability/parameters.ts | 2 | B1 declared capability parameters rejects missing chosen value |
| B1-chosen-value-valid | src/capability/parameters.ts | 14 | B1 declared capability parameters rejects wrong string chosen type |
| B1-default-source | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects default source without declared default |
| B1-default-match | src/capability/parameters.ts | 2 | B1 declared capability parameters rejects default source disagrees with default |
| B1-declaration-consumes | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects missing capability spend flag |
| B1-declaration-ledger | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects missing ledger flag |
| B1-declaration-strict | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects extra declaration field |
| B1-declaration-unique | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects repeated parameter key |
| B1-agent-id | src/capability/parameters.ts | 2 | B1 declared capability parameters rejects bad agent id |
| B1-capability | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects empty capability |
| B1-version | src/capability/parameters.ts | 2 | B1 declared capability parameters rejects zero version |
| B1-agent-strict | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects extra agent field |
| B1-agent-unique | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects repeated agent parameter key |
| B7-labels | src/capability/presentation.ts | 7 | B7 generic per-agent outputs, feedback and trends rejects empty title |
| B7-agent-id | src/capability/presentation.ts | 3 | B7 generic per-agent outputs, feedback and trends rejects invalid agent id |
| B7-capability-required | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects missing capability |
| B7-source-kind | src/capability/presentation.ts | 2 | B7 generic per-agent outputs, feedback and trends rejects unknown source |
| B7-source-strict | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects extra source field |
| B7-kind-strict | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects extra kind field |
| B7-field-type | src/capability/presentation.ts | 3 | B7 generic per-agent outputs, feedback and trends rejects unknown field type |
| B7-field-strict | src/capability/presentation.ts | 2 | B7 generic per-agent outputs, feedback and trends rejects extra output field declaration |
| B7-metric-strict | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects extra metric field |
| B7-kinds-required | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects empty output kinds |
| B7-output-declaration-strict | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects extra output declaration field |
| B7-kinds-unique | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects repeated output kind |
| B7-fields-unique | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects repeated output field |
| B7-feedback-kind | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects unknown feedback kind |
| B7-sources-required | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects empty feedback sources |
| B7-feedback-declaration-strict | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects extra feedback declaration field |
| B7-sources-unique | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects repeated feedback sources |
| B7-presentation-strict | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects extra presentation field |
| B7-metrics-unique | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects repeated trend metric |
| B7-summary-required | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects missing summary |
| B7-content-json | src/capability/presentation.ts | 2 | B7 generic per-agent outputs, feedback and trends rejects non JSON content |
| B7-output-strict | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects extra output field |
| B7-source-required | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects missing source |
| B7-reviewer-required | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects missing reviewer |
| B7-output-id-required | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects missing output id |
| B7-rating-integer | src/capability/presentation.ts | 2 | B7 generic per-agent outputs, feedback and trends rejects fractional rating |
| B7-rating-min | src/capability/presentation.ts | 2 | B7 generic per-agent outputs, feedback and trends rejects rating below one |
| B7-rating-max | src/capability/presentation.ts | 2 | B7 generic per-agent outputs, feedback and trends rejects rating above ten |
| B7-feedback-strict | src/capability/presentation.ts | 2 | B7 generic per-agent outputs, feedback and trends rejects extra feedback field |
| B7-output-time | src/capability/presentation.ts | 2 | B7 generic per-agent outputs, feedback and trends rejects invalid timestamp |
| B7-feedback-time | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects bad feedback timestamp |
| B7-point-day | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects impossible trend date |
| B7-point-finite | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects nonfinite trend value |
| B7-point-strict | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects extra point field |
| B7-series-strict | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects extra series field |
| B7-day-order | src/capability/presentation.ts | 2 | B7 generic per-agent outputs, feedback and trends rejects repeated trend day |
| B7-scope-agent-outputs | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends CapabilityOutputsSchema rejects foreign agent |
| B7-scope-capability-outputs | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends CapabilityOutputsSchema rejects foreign capability |
| B7-unique-outputs | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends CapabilityOutputsSchema rejects duplicate ids or metric keys |
| B7-strict-outputs | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends CapabilityOutputsSchema rejects unknown envelope fields |
| B7-scope-agent-feedback | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends CapabilityFeedbackListSchema rejects foreign agent |
| B7-scope-capability-feedback | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends CapabilityFeedbackListSchema rejects foreign capability |
| B7-unique-feedback | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends CapabilityFeedbackListSchema rejects duplicate ids or metric keys |
| B7-strict-feedback | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends CapabilityFeedbackListSchema rejects unknown envelope fields |
| B7-scope-agent-series | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends CapabilityTrendsSchema rejects foreign agent |
| B7-scope-capability-series | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends CapabilityTrendsSchema rejects foreign capability |
| B7-unique-series | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends CapabilityTrendsSchema rejects duplicate ids or metric keys |
| B7-strict-series | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends CapabilityTrendsSchema rejects unknown envelope fields |
| declaration-manifest-parameters | src/capability/capability-manifest.ts | 1 | additive B1/B7 declarations manifest validates B1 rather than silently stripping it |
| declaration-manifest-presentation | src/capability/capability-manifest.ts | 1 | additive B1/B7 declarations manifest validates B7 rather than silently stripping it |
| legacy-manifest | src/capability/capability-manifest.ts | 2 | additive B1/B7 declarations manifest retains an old payload exactly |
| declaration-registry-parameters | src/capability/capability-registry-entry.ts | 1 | additive B1/B7 declarations registry validates B1 rather than silently stripping it |
| declaration-registry-presentation | src/capability/capability-registry-entry.ts | 1 | additive B1/B7 declarations registry validates B7 rather than silently stripping it |
| legacy-registry | src/capability/capability-registry-entry.ts | 2 | additive B1/B7 declarations registry retains an old payload exactly |
| existing-manifest-auth | src/http/endpoints/cap-manifest.ts | 1 | additive B1/B7 declarations the existing manifest endpoint carries the optional declarations |
| existing-config-auth | src/http/endpoints/internal-capability-agent.ts | 1 | additive B1/B7 declarations existing per-agent config routes retain secret auth and their paths |
| B1-false-default-source | src/capability/parameters.ts | 1 | zero and false platform defaults remain resolved, never missing |
| B1-zero-choice-value | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects choice state zero is still a value |
| B1-false-choice-default | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects choice state false default exists |
| B1-number-default-type | src/capability/parameters.ts | 12 | B1 declared capability parameters rejects default below minimum |
| new-export-parameters-import | package.json | 2 | registers new parameters build/export targets together |
| new-export-parameters-require | package.json | 2 | registers new parameters build/export targets together |
| new-build-parameters | package.json | 1 | registers new parameters build/export targets together |
| new-export-presentation-import | package.json | 2 | registers new presentation build/export targets together |
| new-export-presentation-require | package.json | 2 | registers new presentation build/export targets together |
| new-build-presentation | package.json | 1 | registers new presentation build/export targets together |
| old-symbol-. | dist/index.cjs | 1 | v1.29 additive distribution preserves old targets and symbols at . |
| old-symbol-._auth | dist/auth/index.cjs | 1 | v1.29 additive distribution preserves old targets and symbols at ./auth |
| old-symbol-._agent | dist/agent/index.cjs | 1 | v1.29 additive distribution preserves old targets and symbols at ./agent |
| old-symbol-._capability | dist/capability/index.cjs | 1 | v1.29 additive distribution preserves old targets and symbols at ./capability |
| old-symbol-._voice | dist/capability/voice/index.cjs | 1 | v1.29 additive distribution preserves old targets and symbols at ./voice |
| old-symbol-._capability_stt | dist/capability/stt/index.cjs | 1 | v1.29 additive distribution preserves old targets and symbols at ./capability/stt |
| old-symbol-._capability_tts | dist/capability/tts/index.cjs | 1 | v1.29 additive distribution preserves old targets and symbols at ./capability/tts |
| old-symbol-._capability_voice-live | dist/capability/voice-live/index.cjs | 1 | v1.29 additive distribution preserves old targets and symbols at ./capability/voice-live |
| old-symbol-._capability_ricerca | dist/capability/ricerca/index.cjs | 1 | v1.29 additive distribution preserves old targets and symbols at ./capability/ricerca |
| old-symbol-._capability_lab | dist/capability/lab/index.cjs | 1 | v1.29 additive distribution preserves old targets and symbols at ./capability/lab |
| old-symbol-._http | dist/http/index.cjs | 1 | v1.29 additive distribution preserves old targets and symbols at ./http |
| old-symbol-._memory | dist/memory/index.cjs | 1 | v1.29 additive distribution preserves old targets and symbols at ./memory |
| old-symbol-._messaging | dist/messaging/index.cjs | 1 | v1.29 additive distribution preserves old targets and symbols at ./messaging |
| old-symbol-._model-router | dist/model-router/index.cjs | 2 | v1.29 additive distribution preserves old targets and symbols at . |
| old-symbol-._rag | dist/rag/index.cjs | 1 | v1.29 additive distribution preserves old targets and symbols at ./rag |
| old-symbol-._vault | dist/vault/index.cjs | 1 | v1.29 additive distribution preserves old targets and symbols at ./vault |
| version | package.json | 1 | v1.29 additive distribution uses the coordinated 1.29.0 proposal version |
| B1-key-length | src/capability/parameters.ts | 1 | review R3 bounded declarations and pages accepts the limit and rejects one above: parameter key |
| B1-list-element-length | src/capability/parameters.ts | 1 | isolated wire boundaries after review bounds a list element independently of its pattern |
| B1-list-wire-count | src/capability/parameters.ts | 2 | review R4 generic existing agent configuration rejects impossible list/string declarations 16 |
| B1-value-string-length | src/capability/parameters.ts | 1 | isolated wire boundaries after review bounds a public string value independently of semantic string constraints |
| B1-label-length | src/capability/parameters.ts | 4 | review R3 bounded declarations and pages accepts the limit and rejects one above: label |
| B1-description-length | src/capability/parameters.ts | 4 | review R3 bounded declarations and pages accepts the limit and rejects one above: description |
| B7-label-length | src/capability/presentation.ts | 3 | review R3 bounded declarations and pages accepts the limit and rejects one above: output title |
| B7-description-length | src/capability/presentation.ts | 1 | review R3 bounded declarations and pages accepts the limit and rejects one above: output description |
| B1-string-default-length | src/capability/parameters.ts | 1 | review R3 bounded declarations and pages accepts the limit and rejects one above: string default |
| B1-minLength-cap | src/capability/parameters.ts | 1 | isolated wire boundaries after review bounds declared minLength without a default |
| B1-maxLength-cap | src/capability/parameters.ts | 1 | isolated wire boundaries after review bounds declared maxLength without a default |
| B1-options-cap | src/capability/parameters.ts | 1 | review R3 bounded declarations and pages accepts the limit and rejects one above: number of options |
| B1-declared-cap | src/capability/parameters.ts | 1 | review R3 bounded declarations and pages accepts the limit and rejects one above: declared parameters |
| B1-resolved-cap | src/capability/parameters.ts | 1 | review R3 bounded declarations and pages accepts the limit and rejects one above: resolved parameters |
| B1-capability-length | src/capability/parameters.ts | 1 | isolated wire boundaries after review bounds an agent capability identifier independently of output scope |
| B1-description-required | src/capability/parameters.ts | 3 | B1 declared capability parameters rejects empty description |
| B1-enum-default-length | src/capability/parameters.ts | 5 | review R3 bounded declarations and pages accepts the limit and rejects one above: description |
| B1-optional-required | src/capability/parameters.ts | 1 | review R4 generic existing agent configuration rejects impossible list/string declarations 0 |
| B1-optional-type | src/capability/parameters.ts | 2 | review R4 generic existing agent configuration rejects impossible list/string declarations 0 |
| B1-optional-absence | src/capability/parameters.ts | 1 | review R4 generic existing agent configuration permits an absent optional override without inventing a default |
| B1-required-absence | src/capability/parameters.ts | 2 | B1 declared capability parameters rejects missing chosen value |
| B1-editor-role | src/capability/parameters.ts | 4 | R5 explicit parameter editors rejects unknown editor role 0 |
| B1-editors-required | src/capability/parameters.ts | 7 | R5 explicit parameter editors rejects missing editors |
| B1-editors-nonempty | src/capability/parameters.ts | 1 | R5 explicit parameter editors rejects empty editors |
| B1-editors-unique | src/capability/parameters.ts | 1 | R5 explicit parameter editors rejects duplicate editors |
| B1-editors-cap | src/capability/parameters.ts | 2 | R5 explicit parameter editors rejects duplicate editors |
| B1-list-strict | src/capability/parameters.ts | 1 | isolated wire boundaries after review rejects extra fields in a string-list definition |
| B1-minItems-cap | src/capability/parameters.ts | 1 | isolated wire boundaries after review bounds declared minItems without a default |
| B1-minItems-integer | src/capability/parameters.ts | 1 | isolated wire boundaries after review requires nonnegative integer minItems without semantic masking |
| B1-minItems-nonnegative | src/capability/parameters.ts | 2 | review R4 generic existing agent configuration rejects impossible list/string declarations 9 |
| B1-maxItems-cap | src/capability/parameters.ts | 2 | review R4 generic existing agent configuration rejects impossible list/string declarations 11 |
| B1-maxItems-integer | src/capability/parameters.ts | 2 | review R4 generic existing agent configuration rejects impossible list/string declarations 10 |
| B1-maxItems-nonnegative | src/capability/parameters.ts | 1 | isolated wire boundaries after review requires nonnegative integer maxItems without semantic masking |
| B1-list-bounds-order | src/capability/parameters.ts | 1 | review R4 generic existing agent configuration rejects impossible list/string declarations 8 |
| B1-list-value-type | src/capability/parameters.ts | 1 | review R4 generic existing agent configuration rejects wrong resolved types, patterns, counts and origins 0 |
| B1-list-minimum | src/capability/parameters.ts | 2 | review R4 generic existing agent configuration rejects impossible list/string declarations 6 |
| B1-list-maximum | src/capability/parameters.ts | 2 | review R4 generic existing agent configuration rejects impossible list/string declarations 7 |
| B1-list-pattern | src/capability/parameters.ts | 2 | review R4 generic existing agent configuration rejects impossible list/string declarations 5 |
| B1-list-membership | src/capability/parameters.ts | 2 | review R4 generic existing agent configuration rejects impossible list/string declarations 14 |
| B1-string-pattern | src/capability/parameters.ts | 2 | review R4 generic existing agent configuration rejects impossible list/string declarations 4 |
| B1-pattern-nonempty | src/capability/parameters.ts | 1 | isolated wire boundaries after review rejects an empty regular expression declaration |
| B1-pattern-length | src/capability/parameters.ts | 1 | review R4 generic existing agent configuration rejects impossible list/string declarations 3 |
| B1-pattern-syntax | src/capability/parameters.ts | 1 | review R4 generic existing agent configuration rejects impossible list/string declarations 2 |
| B1-list-default-equality | src/capability/parameters.ts | 1 | review R4 generic existing agent configuration rejects wrong resolved types, patterns, counts and origins 10 |
| B7-id-length | src/capability/presentation.ts | 7 | review R3 bounded declarations and pages accepts the limit and rejects one above: output id |
| B7-id-required | src/capability/presentation.ts | 7 | B7 generic per-agent outputs, feedback and trends rejects empty id |
| B7-kinds-cap | src/capability/presentation.ts | 1 | review R3 bounded declarations and pages accepts the limit and rejects one above: output kinds |
| B7-fields-cap | src/capability/presentation.ts | 1 | review R3 bounded declarations and pages accepts the limit and rejects one above: output fields |
| B7-metrics-cap | src/capability/presentation.ts | 1 | review R3 bounded declarations and pages accepts the limit and rejects one above: declared metrics |
| B7-points-cap | src/capability/presentation.ts | 1 | review R3 bounded declarations and pages accepts the limit and rejects one above: points |
| B7-page-cap-outputs | src/capability/presentation.ts | 1 | review R3 bounded declarations and pages accepts the limit and rejects one above: output page |
| B7-page-cap-feedback | src/capability/presentation.ts | 1 | review R3 bounded declarations and pages accepts the limit and rejects one above: feedback page |
| B7-page-cap-series | src/capability/presentation.ts | 1 | review R3 bounded declarations and pages accepts the limit and rejects one above: trend page |
| B7-summary-length | src/capability/presentation.ts | 1 | review R3 bounded declarations and pages accepts the limit and rejects one above: output summary |
| B7-comment-length | src/capability/presentation.ts | 1 | review R3 bounded declarations and pages accepts the limit and rejects one above: comment |
| B7-content-size | src/capability/presentation.ts | 2 | review R3 bounded declarations and pages bounds content to 64 KiB of serialized UTF-8 JSON (a) |
| B7-content-UTF8 | src/capability/presentation.ts | 1 | review R3 bounded declarations and pages bounds content to 64 KiB of serialized UTF-8 JSON (é) |
| B7-approval-decision | src/capability/presentation.ts | 1 | review R1 feedback kinds rejects wrong feedback branch 6 |
| B7-approval-required | src/capability/presentation.ts | 1 | review R1 feedback kinds rejects wrong feedback branch 5 |
| B7-approval-strict | src/capability/presentation.ts | 1 | review R1 feedback kinds rejects wrong feedback branch 7 |
| B7-reviewer-name-required | src/capability/presentation.ts | 1 | review R2 reviewer name and photos rejects invalid reviewer or attachments 0 |
| B7-reviewer-name-nonempty | src/capability/presentation.ts | 1 | review R2 reviewer name and photos rejects invalid reviewer or attachments 1 |
| B7-reviewer-name-length | src/capability/presentation.ts | 1 | review R2 reviewer name and photos rejects invalid reviewer or attachments 2 |
| B7-attachments-declaration | src/capability/presentation.ts | 1 | review R2 reviewer name and photos requires an explicit boolean attachments declaration 0 |
| B7-attachments-flag-type | src/capability/presentation.ts | 2 | review R2 reviewer name and photos requires an explicit boolean attachments declaration 0 |
| B7-attachments-cap | src/capability/presentation.ts | 1 | review R2 reviewer name and photos rejects invalid reviewer or attachments 3 |
| B7-attachments-url | src/capability/presentation.ts | 6 | review R2 reviewer name and photos rejects invalid reviewer or attachments 4 |
| B7-attachments-optional | src/capability/presentation.ts | 11 | review R1 feedback kinds retains rating boundary 1 |
| B7-sources-cap | src/capability/presentation.ts | 2 | B7 generic per-agent outputs, feedback and trends rejects repeated feedback sources |
| B7-scale-min | src/capability/presentation.ts | 2 | R7 output field types and numeric scales rejects infinite min scale |
| B7-scale-max | src/capability/presentation.ts | 2 | R7 output field types and numeric scales rejects infinite max scale |
| B7-scale-type | src/capability/presentation.ts | 3 | R7 output field types and numeric scales rejects numeric bounds on text |
| B7-scale-order | src/capability/presentation.ts | 1 | R7 output field types and numeric scales rejects reversed scale |
| B1-minLength-nonnegative | src/capability/parameters.ts | 1 | isolated wire boundaries after review requires nonnegative integer minLength without semantic masking |
| B1-maxLength-integer | src/capability/parameters.ts | 1 | isolated wire boundaries after review requires nonnegative integer maxLength without semantic masking |
| B1-list-wire-elements | src/capability/parameters.ts | 2 | public parameter value rejects nonprimitive/nonfinite input 2 |
| B1-TextSchema-trim | src/capability/parameters.ts | 2 | B1 declared capability parameters rejects empty label |
| B1-DescriptionSchema-trim | src/capability/parameters.ts | 1 | B1 declared capability parameters rejects empty description |
| B7-TextSchema-trim | src/capability/presentation.ts | 1 | B7 generic per-agent outputs, feedback and trends rejects empty title |
| B7-DescriptionSchema-trim | src/capability/presentation.ts | 1 | isolated wire boundaries after review rejects blank output descriptions and scope identifiers |
| B7-description-nonempty | src/capability/presentation.ts | 2 | B7 generic per-agent outputs, feedback and trends rejects empty kind description |
| B7-id-trim | src/capability/presentation.ts | 1 | isolated wire boundaries after review rejects blank output descriptions and scope identifiers |
| B7-reviewer-name-trim | src/capability/presentation.ts | 1 | review R2 reviewer name and photos rejects invalid reviewer or attachments 1 |
| B7-rating-kind-required | src/capability/presentation.ts | 1 | review R1 feedback kinds rejects wrong feedback branch 0 |
| B7-approval-kind-required | src/capability/presentation.ts | 1 | isolated wire boundaries after review requires an approval kind even when the decision is present |
| LAB-usd-positive | src/capability/ricerca/agent-config.ts | 2 | lab mandatory models and budget rejects invalid shared USD 0 |
| LAB-usd-finite | src/capability/ricerca/agent-config.ts | 8 | lab mandatory models and budget rejects invalid shared USD 0 |
| LAB-model-min | src/capability/ricerca/agent-config.ts | 3 | lab mandatory models and budget rejects invalid shared model ID 0 |
| LAB-model-max | src/capability/ricerca/agent-config.ts | 3 | lab mandatory models and budget rejects invalid shared model ID 1 |
| LAB-budget-order | src/capability/lab/agent-config.ts | 1 | lab mandatory models and budget rejects above day budget |
| LAB-budget-strict | src/capability/lab/agent-config.ts | 1 | lab mandatory models and budget rejects extra budget budget |
| LAB-budget-dailyUsd-required | src/capability/lab/agent-config.ts | 2 | lab mandatory models and budget rejects missing daily budget |
| LAB-budget-perIngestMaxUsd-required | src/capability/lab/agent-config.ts | 2 | lab mandatory models and budget rejects missing ingest ceiling budget |
| LAB-timezone-required | src/capability/lab/agent-config.ts | 1 | lab mandatory models and budget rejects missing timezone budget |
| LAB-timezone-valid | src/capability/lab/agent-config.ts | 1 | lab mandatory models and budget rejects unknown timezone budget |
| LAB-models-strict | src/capability/lab/agent-config.ts | 1 | lab mandatory models and budget rejects extra model models |
| LAB-digest-required | src/capability/lab/agent-config.ts | 1 | lab mandatory models and budget rejects missing digest models |
| LAB-read-optional | src/capability/lab/agent-config.ts | 2 | lab mandatory models and budget retains models without selecting a default 0 |
| LAB-config-models-required | src/capability/lab/agent-config.ts | 1 | lab mandatory models and budget requires models before spending |
| LAB-config-budget-required | src/capability/lab/agent-config.ts | 1 | lab mandatory models and budget requires budget before spending |
| LAB-spending-capability | src/capability/ricerca/spend.ts | 3 | lab per-agent spend contract declares spending capability lab |
| LAB-spending-reject-unknown | src/capability/ricerca/spend.ts | 2 | lab per-agent spend contract rejects undeclared spending capability |
| LAB-spend-authType | src/http/endpoints/internal-capability-agent.ts | 1 | lab per-agent spend contract uses the shared authType |
| LAB-spend-method | src/http/endpoints/internal-capability-agent.ts | 1 | lab per-agent spend contract uses the shared method |
| LAB-spend-path | src/http/endpoints/internal-capability-agent.ts | 1 | lab per-agent spend contract uses the shared path |
| LAB-spend-paramsSchema | src/http/endpoints/internal-capability-agent.ts | 1 | lab per-agent spend contract reuses exactly the validated params, query and response schemas |
| LAB-spend-querySchema | src/http/endpoints/internal-capability-agent.ts | 2 | lab per-agent spend contract reuses exactly the validated params, query and response schemas |
| LAB-spend-responseSchema | src/http/endpoints/internal-capability-agent.ts | 3 | lab per-agent spend contract reuses exactly the validated params, query and response schemas |
| LAB-tool-errors | src/capability/lab/tools.ts | 2 | lab asynchronous ingest and tool errors rejects undeclared error 0 |
| LAB-status-tool-name | src/capability/lab/tools.ts | 1 | lab asynchronous ingest and tool errors exports and routes the new status tool |
| LAB-ingest-uuid | src/capability/lab/tools.ts | 3 | lab asynchronous ingest and tool errors rejects invalid uuid ingest acknowledgment |
| LAB-ingest-queued | src/capability/lab/tools.ts | 1 | lab asynchronous ingest and tool errors rejects running acknowledgment ingest acknowledgment |
| LAB-ingest-strict | src/capability/lab/tools.ts | 2 | lab asynchronous ingest and tool errors rejects premature counts ingest acknowledgment |
| LAB-status-input-strict | src/capability/lab/tools.ts | 1 | lab asynchronous ingest and tool errors rejects invalid status input 2 |
| LAB-status-states | src/capability/lab/tools.ts | 1 | lab asynchronous ingest and tool errors rejects invalid status output 2 |
| LAB-status-state-required | src/capability/lab/tools.ts | 1 | lab asynchronous ingest and tool errors rejects invalid status output 0 |
| LAB-status-strict | src/capability/lab/tools.ts | 1 | lab asynchronous ingest and tool errors rejects invalid status output 4 |
| LAB-count-sourcesStored-int | src/capability/lab/tools.ts | 1 | lab asynchronous ingest and tool errors requires nonnegative integer sourcesStored |
| LAB-count-sourcesStored-nonnegative | src/capability/lab/tools.ts | 1 | lab asynchronous ingest and tool errors requires nonnegative integer sourcesStored |
| LAB-completed-sourcesStored | src/capability/lab/tools.ts | 1 | lab asynchronous ingest and tool errors requires completed sourcesStored |
| LAB-premature-sourcesStored | src/capability/lab/tools.ts | 2 | lab asynchronous ingest and tool errors rejects premature sourcesStored |
| LAB-count-pagesTouched-int | src/capability/lab/tools.ts | 1 | lab asynchronous ingest and tool errors requires nonnegative integer pagesTouched |
| LAB-count-pagesTouched-nonnegative | src/capability/lab/tools.ts | 1 | lab asynchronous ingest and tool errors requires nonnegative integer pagesTouched |
| LAB-completed-pagesTouched | src/capability/lab/tools.ts | 1 | lab asynchronous ingest and tool errors requires completed pagesTouched |
| LAB-premature-pagesTouched | src/capability/lab/tools.ts | 1 | lab asynchronous ingest and tool errors rejects premature pagesTouched |
| LAB-count-claimsAdded-int | src/capability/lab/tools.ts | 1 | lab asynchronous ingest and tool errors requires nonnegative integer claimsAdded |
| LAB-count-claimsAdded-nonnegative | src/capability/lab/tools.ts | 1 | lab asynchronous ingest and tool errors requires nonnegative integer claimsAdded |
| LAB-completed-claimsAdded | src/capability/lab/tools.ts | 1 | lab asynchronous ingest and tool errors requires completed claimsAdded |
| LAB-premature-claimsAdded | src/capability/lab/tools.ts | 1 | lab asynchronous ingest and tool errors rejects premature claimsAdded |
| DIST-parameters-CapabilityParameterEditorRoleSchema.js | dist/capability/parameters.js | 1 | reviewed 1.29 distribution consumed through public exports ESM preserves reviewed parameters payloads |
| DIST-parameters-CapabilityParameterEditorRoleSchema.cjs | dist/capability/parameters.cjs | 1 | reviewed 1.29 distribution consumed through public exports CJS preserves reviewed parameters payloads |
| DIST-presentation-CapabilityOutputFieldTypeSchema.js | dist/capability/presentation.js | 1 | reviewed 1.29 distribution consumed through public exports ESM preserves reviewed presentation payloads |
| DIST-presentation-CapabilityOutputFieldTypeSchema.cjs | dist/capability/presentation.cjs | 1 | reviewed 1.29 distribution consumed through public exports CJS preserves reviewed presentation payloads |
| DIST-presentation-CapabilityFeedbackKindSchema.js | dist/capability/presentation.js | 1 | reviewed 1.29 distribution consumed through public exports ESM preserves reviewed presentation payloads |
| DIST-presentation-CapabilityFeedbackKindSchema.cjs | dist/capability/presentation.cjs | 1 | reviewed 1.29 distribution consumed through public exports CJS preserves reviewed presentation payloads |
| DIST-presentation-CapabilityFeedbackDecisionSchema.js | dist/capability/presentation.js | 1 | reviewed 1.29 distribution consumed through public exports ESM preserves reviewed presentation payloads |
| DIST-presentation-CapabilityFeedbackDecisionSchema.cjs | dist/capability/presentation.cjs | 1 | reviewed 1.29 distribution consumed through public exports CJS preserves reviewed presentation payloads |
| DIST-ricerca-CapabilityUsdSchema.js | dist/capability/ricerca/index.js | 1 | reviewed 1.29 distribution consumed through public exports ESM preserves reviewed ricerca payloads |
| DIST-ricerca-CapabilityUsdSchema.cjs | dist/capability/ricerca/index.cjs | 1 | reviewed 1.29 distribution consumed through public exports CJS preserves reviewed ricerca payloads |
| DIST-ricerca-CapabilityModelIdSchema.js | dist/capability/ricerca/index.js | 1 | reviewed 1.29 distribution consumed through public exports ESM preserves reviewed ricerca payloads |
| DIST-ricerca-CapabilityModelIdSchema.cjs | dist/capability/ricerca/index.cjs | 1 | reviewed 1.29 distribution consumed through public exports CJS preserves reviewed ricerca payloads |
| DIST-lab-LabBudgetSchema.js | dist/capability/lab/index.js | 1 | reviewed 1.29 distribution consumed through public exports ESM preserves reviewed lab payloads |
| DIST-lab-LabBudgetSchema.cjs | dist/capability/lab/index.cjs | 1 | reviewed 1.29 distribution consumed through public exports CJS preserves reviewed lab payloads |
| DIST-lab-LabModelsSchema.js | dist/capability/lab/index.js | 1 | reviewed 1.29 distribution consumed through public exports ESM preserves reviewed lab payloads |
| DIST-lab-LabModelsSchema.cjs | dist/capability/lab/index.cjs | 1 | reviewed 1.29 distribution consumed through public exports CJS preserves reviewed lab payloads |
| DIST-lab-LabToolErrorSchema.js | dist/capability/lab/index.js | 1 | reviewed 1.29 distribution consumed through public exports ESM preserves reviewed lab payloads |
| DIST-lab-LabToolErrorSchema.cjs | dist/capability/lab/index.cjs | 1 | reviewed 1.29 distribution consumed through public exports CJS preserves reviewed lab payloads |
| DIST-lab-LabIngestIdSchema.js | dist/capability/lab/index.js | 1 | reviewed 1.29 distribution consumed through public exports ESM preserves reviewed lab payloads |
| DIST-lab-LabIngestIdSchema.cjs | dist/capability/lab/index.cjs | 1 | reviewed 1.29 distribution consumed through public exports CJS preserves reviewed lab payloads |
| DIST-lab-LabIngestStatusInputSchema.js | dist/capability/lab/index.js | 1 | reviewed 1.29 distribution consumed through public exports ESM preserves reviewed lab payloads |
| DIST-lab-LabIngestStatusInputSchema.cjs | dist/capability/lab/index.cjs | 1 | reviewed 1.29 distribution consumed through public exports CJS preserves reviewed lab payloads |
| DIST-lab-LabIngestStatusOutputSchema.js | dist/capability/lab/index.js | 1 | reviewed 1.29 distribution consumed through public exports ESM preserves reviewed lab payloads |
| DIST-lab-LabIngestStatusOutputSchema.cjs | dist/capability/lab/index.cjs | 1 | reviewed 1.29 distribution consumed through public exports CJS preserves reviewed lab payloads |
| B7-unknown-rating-kind | src/capability/presentation.ts | 1 | review R1 feedback kinds rejects wrong feedback branch 1 |
| B7-attachments-element-type | src/capability/presentation.ts | 7 | review R2 reviewer name and photos rejects invalid reviewer or attachments 4 |
| B7-attachments-container-type | src/capability/presentation.ts | 1 | review R2 reviewer name and photos rejects invalid reviewer or attachments 11 |
| B1-constrained-list-element-length | src/capability/parameters.ts | 5 | review R4 generic existing agent configuration rejects impossible list/string declarations 5 |
| B1-unset-platform-default | src/capability/parameters.ts | 4 | B1 declared capability parameters rejects missing chosen value |
| B1-editors-array-type | src/capability/parameters.ts | 9 | R5 explicit parameter editors rejects missing editors |
| B7-scale-min-optional | src/capability/presentation.ts | 4 | review R3 bounded declarations and pages accepts the limit and rejects one above: field label |
| B7-scale-max-optional | src/capability/presentation.ts | 4 | review R3 bounded declarations and pages accepts the limit and rejects one above: field label |
| B7-unknown-type-with-scale | src/capability/presentation.ts | 7 | B7 generic per-agent outputs, feedback and trends rejects unknown field type |
| LAB-model-boundary-accepted | src/capability/ricerca/agent-config.ts | 3 | lab mandatory models and budget exports shared model ID 1 |
| LAB-ricerca-spend-preserved | src/capability/ricerca/spend.ts | 1 | lab per-agent spend contract declares spending capability ricerca |
| LAB-ingest-id-required | src/capability/lab/tools.ts | 1 | lab asynchronous ingest and tool errors rejects missing id ingest acknowledgment |
| LAB-ingest-state-required | src/capability/lab/tools.ts | 1 | lab asynchronous ingest and tool errors rejects missing state ingest acknowledgment |

## Copertura rossa e conservazione delle prove

469/469 casi distinti visti rossi con asserzioni, poi 469/469 verdi. Nessun timeout contato.
La copertura nominativa completa resta in Git: git show 233ca43:.planning/phases/54-05-bridge-129/review/red-coverage.json
I JSON/log di mutazione sono sostituiti da questo SOLO report Markdown come richiesto dalla coordinatrice (15:02).
Archivio esatto locale: /var/folders/m3/mywf84wd2k50664nh_ffnc3m0000gq/T/bridge129-mutations-archive-cumho2sx
Originali durabili: storia Git 233ca43 / 1bdf022 / 846311c; la copia locale non è l'unica prova.

| Prova sostituita | SHA256 archivio esatto |
| --- | --- |
| review/FINAL-MUTATIONS.md | 26efb5eb83ad50c1d86aa533d2d4c28399daa956afbc60bdb28b95f12f5e00a6 |
| review/final-mutation-baseline-first.json | 3486a8ffe56c10ca95d0aaab3c714951887e451dfba76ed9b78bd7fb88207645 |
| review/final-mutation-baseline.json | 3486a8ffe56c10ca95d0aaab3c714951887e451dfba76ed9b78bd7fb88207645 |
| review/final-mutation-green-first.json | 3486a8ffe56c10ca95d0aaab3c714951887e451dfba76ed9b78bd7fb88207645 |
| review/final-mutation-green.json | 3486a8ffe56c10ca95d0aaab3c714951887e451dfba76ed9b78bd7fb88207645 |
| review/final-mutations-first.json | be5594c734855b8e89e31b01ec51d8eced56360b6a233c181762b328c4ced1a1 |
| review/final-mutations.json | 8ebfb01f0844a6124e2d559515e31b73886c41721dc80fdc01fcbba11699eae9 |
| review/red-coverage.json | 628ce5c0fa5fac95b5312b7bcea4a0a8024b80d876ecd634833147c8f2da9434 |
| task5-baseline.json | a2c8bfa813976de5b50bee0be31b39e8d33b050ae87f29f8795aee43d4bb6f61 |
| task5-fault-current.json | 20ee658eb695cf405789af106e4e8b8c616fa57c4bbedd9778006566eab73407 |
| task5-final-mutations.json | 2ef85ab1f479e17ff0f2fb1b2ef1d7debcf451c8a84eef33b68da730f10f41bc |
| task5-first-baseline.json | 701b52992f38d3b19a6a12e76b4978adba651e4438bff641842e6aab4278156b |
| task5-first-green.json | a45d7a14a01e773f471ddd2a2ff84d80cad4c8b393da8f58255c1347c1aee1f3 |
| task5-first-mutations.json | 11a16d1d59eba546475d15b9d6dddf48e91dbf3c9259db7c16625be2892f3a5d |
| task5-first-mutations.txt | e2a232862d13c41f998d51f7f7bc183e155e5cc0441fe0432d10f3076f3fcc20 |
| task5-green.json | 8f475a78a10bda848de51ef3abaea2b64af22e9b6b4639abed1f5a25f7f22ea3 |
| task5-mutations.json | d6b0732c33a585cfd2d6c348dfa4c75ac4ab2949d11b93517cce2e01b947fff1 |
| task5-mutations.txt | dde0a991bb96a5008aa5e428b403cf49c97fb35e23cbdff0111d4631484ffc43 |
| task5-retry-ids.json | 069ea62b4449cefe3b65773889c48a9033a3ab3699a8c664f7ff906de8520958 |
| task5-second-baseline.json | 35bc20a197f8d694e5877a35d077fb3662bdb80e51ffadf20ab47a1bb2b19434 |
| task5-second-mutations.json | 06d942d1659ec363daa5047c3b74f886961bb5383a18a3c6d9ce8141c0d5ef4b |
| task5-second-mutations.txt | 583b5bf51ea21dfc4313ad031d43a969681567378abe983cd00d70bb255164c2 |
| task5-third-mutations.txt | dde0a991bb96a5008aa5e428b403cf49c97fb35e23cbdff0111d4631484ffc43 |

Il giro 299/299 è stato eseguito sul runtime di 233ca43. I ritocchi successivi cambiano solo documentazione
e forma delle prove: runtime TS/ESM/CJS confrontato identico rimuovendo la sola riga JSDoc.
