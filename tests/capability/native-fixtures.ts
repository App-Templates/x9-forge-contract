export const nativeTools = [
  {
    "type": "client",
    "name": "inizia_guida",
    "description": "Avvia la parte guidata quando la persona è pronta: il sistema fissa la pratica e la durata, la pagina avvia il sottofondo e misura il tempo. Restituisce la durata della pratica, risveglio_secondi (il risveglio dopo la pratica) e i passi con i tempi e ritmo opzionale (inspira, pausa, espira in secondi). La luna tiene il ritmo; la voce introduce, dà pochi cenni e lascia silenzio. Senza ritmo nel passo, respiro naturale.",
    "expects_response": true,
    "response_timeout_secs": 15,
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    }
  },
  {
    "type": "client",
    "name": "fine_guida",
    "description": "Chiude la parte guidata quando il tempo è finito, a risveglio concluso. Se risponde non_ancora con i secondi che mancano, continua a guidare.",
    "expects_response": true,
    "response_timeout_secs": 15,
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    }
  },
  {
    "type": "client",
    "name": "tappeto",
    "description": "Regola il volume del sottofondo durante la guida, solo se la persona lo chiede.",
    "expects_response": true,
    "response_timeout_secs": 5,
    "parameters": {
      "type": "object",
      "properties": {
        "livello": {
          "type": "string",
          "enum": [
            "piu_basso",
            "normale",
            "piu_alto"
          ],
          "description": "Livello richiesto dalla persona"
        }
      },
      "required": [
        "livello"
      ]
    }
  },
  {
    "type": "client",
    "name": "silenzio",
    "description": "Solo per limitare le pause della guida (segnala_evento ti ha dato un silenzio_massimo, oppure sonno, disagio, radicamento): i secondi che chiedi diventano il massimo delle pause successive; subito dopo chiami skip_turn. Di norma non serve: dopo una frase della guida basta skip_turn.",
    "expects_response": false,
    "response_timeout_secs": 120,
    "execution_mode": "immediate",
    "interruption_mode": "allow",
    "parameters": {
      "type": "object",
      "properties": {
        "secondi": {
          "type": "integer",
          "minimum": 1,
          "description": "Secondi di silenzio, entro il massimo indicato dal piano, da salva_preferenza o da segnala_evento"
        }
      },
      "required": [
        "secondi"
      ]
    }
  },
  {
    "type": "webhook",
    "name": "salva_profilo",
    "description": "Salva ciò che la persona ha appena detto di sé, con le sue parole. Almeno un campo.",
    "response_timeout_secs": 10,
    "api_schema": {
      "method": "POST",
      "path": "/call/salva_profilo",
      "request_body_schema": {
        "type": "object",
        "description": "Profilo detto dalla persona",
        "properties": {
          "name": {
            "type": "string",
            "maxLength": 40,
            "description": "Nome con cui vuole essere chiamata"
          },
          "gender": {
            "type": "string",
            "enum": [
              "f",
              "m"
            ],
            "description": "Genere grammaticale, solo se lo ha reso esplicito parlando di sé"
          },
          "experience": {
            "type": "string",
            "enum": [
              "none",
              "some",
              "regular"
            ],
            "description": "none: mai meditato; some: qualche volta; regular: con regolarità. Sempre insieme a experienceWords"
          },
          "experienceWords": {
            "type": "string",
            "maxLength": 500,
            "description": "Le sue parole sull'esperienza"
          },
          "practiceWords": {
            "type": "string",
            "maxLength": 500,
            "description": "Le sue parole su che pratica fa e cosa le piace"
          }
        },
        "required": []
      },
      "request_headers": [
        {
          "name": "X-Internal-Secret",
          "source": {
            "kind": "credential",
            "key": "workspace"
          }
        },
        {
          "name": "X-Coach-Session",
          "source": {
            "kind": "session",
            "bindingId": "synthetic-session-binding"
          }
        }
      ]
    }
  },
  {
    "type": "webhook",
    "name": "salva_preferenza",
    "description": "Appena la persona la esprime, anche durante la guida: salva una preferenza esplicita su tecnica, sottofondo o stile della guida (silenzi, quantità di voce), con le sue parole. Mai dedurla. Il sistema la applica: restituisce applicata (pratica_di_oggi con pratica_prevista, guida_in_corso con la nuova guida: silenzio_secondi, secondi_consigliati e densita_guida, o prossime_sessioni).",
    "response_timeout_secs": 10,
    "api_schema": {
      "method": "POST",
      "path": "/call/salva_preferenza",
      "request_body_schema": {
        "type": "object",
        "description": "Preferenza detta dalla persona",
        "properties": {
          "key": {
            "type": "string",
            "enum": [
              "bed",
              "technique",
              "guidance"
            ],
            "description": "bed per il sottofondo, technique per la tecnica, guidance per lo stile della guida (silenzi o voce)"
          },
          "value": {
            "type": "string",
            "enum": [
              "onde",
              "pioggia",
              "pad",
              "focused_attention_breath",
              "body_scan",
              "loving_kindness",
              "open_awareness",
              "grounding",
              "focused_attention_sound",
              "noting",
              "acceptance_practice",
              "extended_exhale",
              "paced_breathing",
              "silence",
              "voice"
            ],
            "description": "Sottofondo (onde, pioggia, pad), stile della guida (silence: i silenzi; voice: la quantità di guida a voce) o tecnica: focused_attention_breath (attenzione al respiro), body_scan (ascolto del corpo), loving_kindness (gentilezza amorevole), open_awareness (presenza aperta), grounding (radicamento), focused_attention_sound (attenzione ai suoni), noting (annotare), acceptance_practice (accettazione), extended_exhale (espirazione allungata senza pausa), paced_breathing (respiro con pausa breve). Senza pause: avoid paced_breathing; senza conteggio: avoid entrambe le tecniche ritmate. Mai salvare motivi sanitari"
          },
          "direction": {
            "type": "string",
            "enum": [
              "prefer",
              "avoid"
            ],
            "description": "prefer se le piace, avoid se non lo vuole; per silence e voice: prefer per di più (silenzi più lunghi, più voce), avoid per di meno"
          },
          "words": {
            "type": "string",
            "maxLength": 500,
            "description": "Le sue parole"
          }
        },
        "required": [
          "key",
          "value",
          "direction",
          "words"
        ]
      },
      "request_headers": [
        {
          "name": "X-Internal-Secret",
          "source": {
            "kind": "credential",
            "key": "workspace"
          }
        },
        {
          "name": "X-Coach-Session",
          "source": {
            "kind": "session",
            "bindingId": "synthetic-session-binding"
          }
        }
      ]
    }
  },
  {
    "type": "webhook",
    "name": "salva_stato",
    "description": "Prima della guida: salva ciò che è emerso in modo naturale su come arriva la persona oggi, di cosa ha bisogno e quanto tempo ha, anche parziale: solo i campi che la persona ha espresso, stimati dalle sue parole, mai valori inventati; chiamalo di nuovo se emerge altro. Quando stai per proporre la pratica di oggi aggiungi proponi true (anche senza altri campi): la pagina mostra allora la proposta con i pulsanti. Restituisce la pratica prevista dal sistema, o tempo_insufficiente se oggi non c'è tempo per una pratica guidata. Se occorre evitare il ritmo, salva solo breathing_allowed false, senza diagnosi o motivo: vale solo per questa sessione. Durante la guida è ammesso solo quel campo e il ritmo viene rimosso subito.",
    "response_timeout_secs": 10,
    "api_schema": {
      "method": "POST",
      "path": "/call/salva_stato",
      "request_body_schema": {
        "type": "object",
        "description": "Stato di oggi, solo ciò che emerge dalla conversazione",
        "properties": {
          "mood_valence": {
            "type": "number",
            "minimum": -1,
            "maximum": 1,
            "description": "Umore da -1 (molto negativo) a 1 (molto positivo)"
          },
          "arousal": {
            "type": "number",
            "minimum": 0,
            "maximum": 1,
            "description": "Agitazione da 0 a 1"
          },
          "energy": {
            "type": "number",
            "minimum": 0,
            "maximum": 1,
            "description": "Energia da 0 a 1"
          },
          "sleepiness": {
            "type": "number",
            "minimum": 0,
            "maximum": 1,
            "description": "Sonnolenza da 0 a 1"
          },
          "stress": {
            "type": "number",
            "minimum": 0,
            "maximum": 1,
            "description": "Stress da 0 a 1"
          },
          "cognitive_load": {
            "type": "number",
            "minimum": 0,
            "maximum": 1,
            "description": "Mente piena, carico mentale da 0 a 1"
          },
          "attention": {
            "type": "number",
            "minimum": 0,
            "maximum": 1,
            "description": "Capacità di attenzione adesso da 0 a 1"
          },
          "body_tension": {
            "type": "number",
            "minimum": 0,
            "maximum": 1,
            "description": "Tensione nel corpo da 0 a 1"
          },
          "intention": {
            "type": "string",
            "enum": [
              "daily_practice",
              "calm_down",
              "decompress",
              "focus",
              "sleep",
              "emotional_processing",
              "self_compassion",
              "body_awareness",
              "stress_management",
              "advanced_practice",
              "curiosity"
            ],
            "description": "Di cosa ha bisogno oggi"
          },
          "available_minutes": {
            "type": "integer",
            "minimum": 1,
            "maximum": 60,
            "description": "Minuti che ha a disposizione"
          },
          "proponi": {
            "type": "boolean",
            "description": "Solo true, e solo quando stai per proporre la pratica di oggi: la pagina mostra la proposta alla persona"
          },
          "breathing_allowed": {
            "type": "boolean",
            "description": "Solo false per evitare o interrompere il ritmo in questa sessione, anche durante la guida: da solo. Non salvare diagnosi o motivo sanitario; non riattivabile nella stessa sessione"
          },
          "environment": {
            "type": "object",
            "description": "Dove e come pratica oggi, solo ciò che ha detto",
            "properties": {
              "position": {
                "type": "string",
                "enum": [
                  "sitting",
                  "lying",
                  "standing",
                  "walking"
                ],
                "description": "Seduta, sdraiata, in piedi o camminando"
              },
              "can_close_eyes": {
                "type": "boolean",
                "description": "false se non può o non vuole chiudere gli occhi (per esempio alla guida o in un luogo pubblico)"
              },
              "can_move": {
                "type": "boolean",
                "description": "Se può muoversi liberamente"
              },
              "noise_level": {
                "type": "string",
                "enum": [
                  "low",
                  "medium",
                  "high"
                ],
                "description": "Quanto rumore c'è intorno"
              }
            },
            "required": []
          }
        },
        "required": []
      },
      "request_headers": [
        {
          "name": "X-Internal-Secret",
          "source": {
            "kind": "credential",
            "key": "workspace"
          }
        },
        {
          "name": "X-Coach-Session",
          "source": {
            "kind": "session",
            "bindingId": "synthetic-session-binding"
          }
        }
      ]
    }
  },
  {
    "type": "webhook",
    "name": "segnala_evento",
    "description": "Durante la guida: segnala ciò che noti o che la persona dice (agitazione, sonno, confusione, distrazione, disagio col respiro o col silenzio, va bene così, possibile malessere). Restituisce se e come intervenire. Una richiesta di più o meno silenzio o voce è una preferenza: salva_preferenza. Con wants_less_voice o wants_more_voice il sistema salva anche la preferenza sui silenzi e restituisce applicata (durante la guida guida_in_corso con la nuova guida: silenzio_secondi, secondi_consigliati, densita_guida). Con breath_discomfort, possible_distress, emotional_activation e wants_to_stop il sistema rimuove ogni ritmo al primo segnale, indipendentemente dalla soglia: ritmo_rimosso impone di lasciare subito il ritmo e non riprenderlo.",
    "response_timeout_secs": 10,
    "api_schema": {
      "method": "POST",
      "path": "/call/segnala_evento",
      "request_body_schema": {
        "type": "object",
        "description": "Evento della sessione",
        "properties": {
          "evento": {
            "type": "string",
            "enum": [
              "user_restless",
              "user_sleepy",
              "user_confused",
              "high_mind_wandering",
              "emotional_activation",
              "breath_discomfort",
              "silence_discomfort",
              "wants_less_voice",
              "wants_more_voice",
              "positive_flow",
              "possible_distress",
              "wants_to_stop"
            ],
            "description": "Che cosa sta succedendo"
          }
        },
        "required": [
          "evento"
        ]
      },
      "request_headers": [
        {
          "name": "X-Internal-Secret",
          "source": {
            "kind": "credential",
            "key": "workspace"
          }
        },
        {
          "name": "X-Coach-Session",
          "source": {
            "kind": "session",
            "bindingId": "synthetic-session-binding"
          }
        }
      ]
    }
  },
  {
    "type": "webhook",
    "name": "chiudi",
    "description": "Alla fine, dopo la breve riflessione e prima del saluto: registra com'è andata. Il sistema decide se la sessione è completata e aggiorna i progressi; con guida troppa o poca salva la preferenza sui silenzi e restituisce applicata prossime_sessioni.",
    "response_timeout_secs": 10,
    "api_schema": {
      "method": "POST",
      "path": "/call/chiudi",
      "request_body_schema": {
        "type": "object",
        "description": "Esito e riflessione",
        "properties": {
          "esito": {
            "type": "string",
            "maxLength": 1000,
            "description": "Esito breve e fedele: come si sente, cosa si porta via, con le sue parole quando possibile"
          },
          "presenza": {
            "type": "integer",
            "minimum": 0,
            "maximum": 10,
            "description": "Quanto è stato facile restare presente, da 0 a 10, se la persona lo ha detto"
          },
          "accorgersi": {
            "type": "integer",
            "minimum": 0,
            "maximum": 10,
            "description": "Quanto si è accorta quando la mente si allontanava, da 0 a 10, se lo ha detto"
          },
          "guida": {
            "type": "string",
            "enum": [
              "troppa",
              "giusta",
              "poca"
            ],
            "description": "La quantità di guida, se lo ha detto"
          },
          "umore_dopo": {
            "type": "number",
            "minimum": -1,
            "maximum": 1,
            "description": "Come si sente dopo la pratica rispetto a prima, da -1 (molto negativo) a 1 (molto positivo), sulla stessa scala di mood_valence in salva_stato, solo se lo ha detto"
          }
        },
        "required": [
          "esito"
        ]
      },
      "request_headers": [
        {
          "name": "X-Internal-Secret",
          "source": {
            "kind": "credential",
            "key": "workspace"
          }
        },
        {
          "name": "X-Coach-Session",
          "source": {
            "kind": "session",
            "bindingId": "synthetic-session-binding"
          }
        }
      ]
    }
  },
  {
    "name": "end_call",
    "type": "system",
    "description": "Chiude la chiamata per sempre. Solo alla fine: dopo chiudi e dopo il saluto, quando la persona ha salutato e non ha altro da dire. Mai per aspettare una risposta.",
    "params": {
      "system_tool_type": "end_call"
    }
  },
  {
    "name": "skip_turn",
    "type": "system",
    "description": "Quando hai finito di parlare e aspetti senza dire altro: durante la guida dopo una frase che invita a sentire (la pagina tiene il silenzio e poi ti scrive), oppure quando aspetti la risposta della persona.",
    "params": {
      "system_tool_type": "skip_turn"
    }
  }
];
export const nativeConfig = {
  "agent": {
    "first_message": "",
    "language": "it",
    "prompt": {
      "llm": "gpt-6-luna",
      "reasoning_effort": "none",
      "temperature": 0.6,
      "backup_llm_config": {
        "preference": "override",
        "order": [
          "gpt-5.4-mini",
          "claude-haiku-4-5"
        ]
      },
      "cascade_timeout_seconds": 6,
      "tools": [
        {
          "type": "client",
          "name": "inizia_guida",
          "description": "Avvia la parte guidata quando la persona è pronta: il sistema fissa la pratica e la durata, la pagina avvia il sottofondo e misura il tempo. Restituisce la durata della pratica, risveglio_secondi (il risveglio dopo la pratica) e i passi con i tempi e ritmo opzionale (inspira, pausa, espira in secondi). La luna tiene il ritmo; la voce introduce, dà pochi cenni e lascia silenzio. Senza ritmo nel passo, respiro naturale.",
          "expects_response": true,
          "response_timeout_secs": 15,
          "parameters": {
            "type": "object",
            "properties": {},
            "required": []
          }
        },
        {
          "type": "client",
          "name": "fine_guida",
          "description": "Chiude la parte guidata quando il tempo è finito, a risveglio concluso. Se risponde non_ancora con i secondi che mancano, continua a guidare.",
          "expects_response": true,
          "response_timeout_secs": 15,
          "parameters": {
            "type": "object",
            "properties": {},
            "required": []
          }
        },
        {
          "type": "client",
          "name": "tappeto",
          "description": "Regola il volume del sottofondo durante la guida, solo se la persona lo chiede.",
          "expects_response": true,
          "response_timeout_secs": 5,
          "parameters": {
            "type": "object",
            "properties": {
              "livello": {
                "type": "string",
                "enum": [
                  "piu_basso",
                  "normale",
                  "piu_alto"
                ],
                "description": "Livello richiesto dalla persona"
              }
            },
            "required": [
              "livello"
            ]
          }
        },
        {
          "type": "client",
          "name": "silenzio",
          "description": "Solo per limitare le pause della guida (segnala_evento ti ha dato un silenzio_massimo, oppure sonno, disagio, radicamento): i secondi che chiedi diventano il massimo delle pause successive; subito dopo chiami skip_turn. Di norma non serve: dopo una frase della guida basta skip_turn.",
          "expects_response": false,
          "response_timeout_secs": 120,
          "execution_mode": "immediate",
          "interruption_mode": "allow",
          "parameters": {
            "type": "object",
            "properties": {
              "secondi": {
                "type": "integer",
                "minimum": 1,
                "description": "Secondi di silenzio, entro il massimo indicato dal piano, da salva_preferenza o da segnala_evento"
              }
            },
            "required": [
              "secondi"
            ]
          }
        },
        {
          "type": "webhook",
          "name": "salva_profilo",
          "description": "Salva ciò che la persona ha appena detto di sé, con le sue parole. Almeno un campo.",
          "response_timeout_secs": 10,
          "api_schema": {
            "method": "POST",
            "path": "/call/salva_profilo",
            "request_body_schema": {
              "type": "object",
              "description": "Profilo detto dalla persona",
              "properties": {
                "name": {
                  "type": "string",
                  "maxLength": 40,
                  "description": "Nome con cui vuole essere chiamata"
                },
                "gender": {
                  "type": "string",
                  "enum": [
                    "f",
                    "m"
                  ],
                  "description": "Genere grammaticale, solo se lo ha reso esplicito parlando di sé"
                },
                "experience": {
                  "type": "string",
                  "enum": [
                    "none",
                    "some",
                    "regular"
                  ],
                  "description": "none: mai meditato; some: qualche volta; regular: con regolarità. Sempre insieme a experienceWords"
                },
                "experienceWords": {
                  "type": "string",
                  "maxLength": 500,
                  "description": "Le sue parole sull'esperienza"
                },
                "practiceWords": {
                  "type": "string",
                  "maxLength": 500,
                  "description": "Le sue parole su che pratica fa e cosa le piace"
                }
              },
              "required": []
            },
            "request_headers": [
              {
                "name": "X-Internal-Secret",
                "source": {
                  "kind": "credential",
                  "key": "workspace"
                }
              },
              {
                "name": "X-Coach-Session",
                "source": {
                  "kind": "session",
                  "bindingId": "synthetic-session-binding"
                }
              }
            ]
          }
        },
        {
          "type": "webhook",
          "name": "salva_preferenza",
          "description": "Appena la persona la esprime, anche durante la guida: salva una preferenza esplicita su tecnica, sottofondo o stile della guida (silenzi, quantità di voce), con le sue parole. Mai dedurla. Il sistema la applica: restituisce applicata (pratica_di_oggi con pratica_prevista, guida_in_corso con la nuova guida: silenzio_secondi, secondi_consigliati e densita_guida, o prossime_sessioni).",
          "response_timeout_secs": 10,
          "api_schema": {
            "method": "POST",
            "path": "/call/salva_preferenza",
            "request_body_schema": {
              "type": "object",
              "description": "Preferenza detta dalla persona",
              "properties": {
                "key": {
                  "type": "string",
                  "enum": [
                    "bed",
                    "technique",
                    "guidance"
                  ],
                  "description": "bed per il sottofondo, technique per la tecnica, guidance per lo stile della guida (silenzi o voce)"
                },
                "value": {
                  "type": "string",
                  "enum": [
                    "onde",
                    "pioggia",
                    "pad",
                    "focused_attention_breath",
                    "body_scan",
                    "loving_kindness",
                    "open_awareness",
                    "grounding",
                    "focused_attention_sound",
                    "noting",
                    "acceptance_practice",
                    "extended_exhale",
                    "paced_breathing",
                    "silence",
                    "voice"
                  ],
                  "description": "Sottofondo (onde, pioggia, pad), stile della guida (silence: i silenzi; voice: la quantità di guida a voce) o tecnica: focused_attention_breath (attenzione al respiro), body_scan (ascolto del corpo), loving_kindness (gentilezza amorevole), open_awareness (presenza aperta), grounding (radicamento), focused_attention_sound (attenzione ai suoni), noting (annotare), acceptance_practice (accettazione), extended_exhale (espirazione allungata senza pausa), paced_breathing (respiro con pausa breve). Senza pause: avoid paced_breathing; senza conteggio: avoid entrambe le tecniche ritmate. Mai salvare motivi sanitari"
                },
                "direction": {
                  "type": "string",
                  "enum": [
                    "prefer",
                    "avoid"
                  ],
                  "description": "prefer se le piace, avoid se non lo vuole; per silence e voice: prefer per di più (silenzi più lunghi, più voce), avoid per di meno"
                },
                "words": {
                  "type": "string",
                  "maxLength": 500,
                  "description": "Le sue parole"
                }
              },
              "required": [
                "key",
                "value",
                "direction",
                "words"
              ]
            },
            "request_headers": [
              {
                "name": "X-Internal-Secret",
                "source": {
                  "kind": "credential",
                  "key": "workspace"
                }
              },
              {
                "name": "X-Coach-Session",
                "source": {
                  "kind": "session",
                  "bindingId": "synthetic-session-binding"
                }
              }
            ]
          }
        },
        {
          "type": "webhook",
          "name": "salva_stato",
          "description": "Prima della guida: salva ciò che è emerso in modo naturale su come arriva la persona oggi, di cosa ha bisogno e quanto tempo ha, anche parziale: solo i campi che la persona ha espresso, stimati dalle sue parole, mai valori inventati; chiamalo di nuovo se emerge altro. Quando stai per proporre la pratica di oggi aggiungi proponi true (anche senza altri campi): la pagina mostra allora la proposta con i pulsanti. Restituisce la pratica prevista dal sistema, o tempo_insufficiente se oggi non c'è tempo per una pratica guidata. Se occorre evitare il ritmo, salva solo breathing_allowed false, senza diagnosi o motivo: vale solo per questa sessione. Durante la guida è ammesso solo quel campo e il ritmo viene rimosso subito.",
          "response_timeout_secs": 10,
          "api_schema": {
            "method": "POST",
            "path": "/call/salva_stato",
            "request_body_schema": {
              "type": "object",
              "description": "Stato di oggi, solo ciò che emerge dalla conversazione",
              "properties": {
                "mood_valence": {
                  "type": "number",
                  "minimum": -1,
                  "maximum": 1,
                  "description": "Umore da -1 (molto negativo) a 1 (molto positivo)"
                },
                "arousal": {
                  "type": "number",
                  "minimum": 0,
                  "maximum": 1,
                  "description": "Agitazione da 0 a 1"
                },
                "energy": {
                  "type": "number",
                  "minimum": 0,
                  "maximum": 1,
                  "description": "Energia da 0 a 1"
                },
                "sleepiness": {
                  "type": "number",
                  "minimum": 0,
                  "maximum": 1,
                  "description": "Sonnolenza da 0 a 1"
                },
                "stress": {
                  "type": "number",
                  "minimum": 0,
                  "maximum": 1,
                  "description": "Stress da 0 a 1"
                },
                "cognitive_load": {
                  "type": "number",
                  "minimum": 0,
                  "maximum": 1,
                  "description": "Mente piena, carico mentale da 0 a 1"
                },
                "attention": {
                  "type": "number",
                  "minimum": 0,
                  "maximum": 1,
                  "description": "Capacità di attenzione adesso da 0 a 1"
                },
                "body_tension": {
                  "type": "number",
                  "minimum": 0,
                  "maximum": 1,
                  "description": "Tensione nel corpo da 0 a 1"
                },
                "intention": {
                  "type": "string",
                  "enum": [
                    "daily_practice",
                    "calm_down",
                    "decompress",
                    "focus",
                    "sleep",
                    "emotional_processing",
                    "self_compassion",
                    "body_awareness",
                    "stress_management",
                    "advanced_practice",
                    "curiosity"
                  ],
                  "description": "Di cosa ha bisogno oggi"
                },
                "available_minutes": {
                  "type": "integer",
                  "minimum": 1,
                  "maximum": 60,
                  "description": "Minuti che ha a disposizione"
                },
                "proponi": {
                  "type": "boolean",
                  "description": "Solo true, e solo quando stai per proporre la pratica di oggi: la pagina mostra la proposta alla persona"
                },
                "breathing_allowed": {
                  "type": "boolean",
                  "description": "Solo false per evitare o interrompere il ritmo in questa sessione, anche durante la guida: da solo. Non salvare diagnosi o motivo sanitario; non riattivabile nella stessa sessione"
                },
                "environment": {
                  "type": "object",
                  "description": "Dove e come pratica oggi, solo ciò che ha detto",
                  "properties": {
                    "position": {
                      "type": "string",
                      "enum": [
                        "sitting",
                        "lying",
                        "standing",
                        "walking"
                      ],
                      "description": "Seduta, sdraiata, in piedi o camminando"
                    },
                    "can_close_eyes": {
                      "type": "boolean",
                      "description": "false se non può o non vuole chiudere gli occhi (per esempio alla guida o in un luogo pubblico)"
                    },
                    "can_move": {
                      "type": "boolean",
                      "description": "Se può muoversi liberamente"
                    },
                    "noise_level": {
                      "type": "string",
                      "enum": [
                        "low",
                        "medium",
                        "high"
                      ],
                      "description": "Quanto rumore c'è intorno"
                    }
                  },
                  "required": []
                }
              },
              "required": []
            },
            "request_headers": [
              {
                "name": "X-Internal-Secret",
                "source": {
                  "kind": "credential",
                  "key": "workspace"
                }
              },
              {
                "name": "X-Coach-Session",
                "source": {
                  "kind": "session",
                  "bindingId": "synthetic-session-binding"
                }
              }
            ]
          }
        },
        {
          "type": "webhook",
          "name": "segnala_evento",
          "description": "Durante la guida: segnala ciò che noti o che la persona dice (agitazione, sonno, confusione, distrazione, disagio col respiro o col silenzio, va bene così, possibile malessere). Restituisce se e come intervenire. Una richiesta di più o meno silenzio o voce è una preferenza: salva_preferenza. Con wants_less_voice o wants_more_voice il sistema salva anche la preferenza sui silenzi e restituisce applicata (durante la guida guida_in_corso con la nuova guida: silenzio_secondi, secondi_consigliati, densita_guida). Con breath_discomfort, possible_distress, emotional_activation e wants_to_stop il sistema rimuove ogni ritmo al primo segnale, indipendentemente dalla soglia: ritmo_rimosso impone di lasciare subito il ritmo e non riprenderlo.",
          "response_timeout_secs": 10,
          "api_schema": {
            "method": "POST",
            "path": "/call/segnala_evento",
            "request_body_schema": {
              "type": "object",
              "description": "Evento della sessione",
              "properties": {
                "evento": {
                  "type": "string",
                  "enum": [
                    "user_restless",
                    "user_sleepy",
                    "user_confused",
                    "high_mind_wandering",
                    "emotional_activation",
                    "breath_discomfort",
                    "silence_discomfort",
                    "wants_less_voice",
                    "wants_more_voice",
                    "positive_flow",
                    "possible_distress",
                    "wants_to_stop"
                  ],
                  "description": "Che cosa sta succedendo"
                }
              },
              "required": [
                "evento"
              ]
            },
            "request_headers": [
              {
                "name": "X-Internal-Secret",
                "source": {
                  "kind": "credential",
                  "key": "workspace"
                }
              },
              {
                "name": "X-Coach-Session",
                "source": {
                  "kind": "session",
                  "bindingId": "synthetic-session-binding"
                }
              }
            ]
          }
        },
        {
          "type": "webhook",
          "name": "chiudi",
          "description": "Alla fine, dopo la breve riflessione e prima del saluto: registra com'è andata. Il sistema decide se la sessione è completata e aggiorna i progressi; con guida troppa o poca salva la preferenza sui silenzi e restituisce applicata prossime_sessioni.",
          "response_timeout_secs": 10,
          "api_schema": {
            "method": "POST",
            "path": "/call/chiudi",
            "request_body_schema": {
              "type": "object",
              "description": "Esito e riflessione",
              "properties": {
                "esito": {
                  "type": "string",
                  "maxLength": 1000,
                  "description": "Esito breve e fedele: come si sente, cosa si porta via, con le sue parole quando possibile"
                },
                "presenza": {
                  "type": "integer",
                  "minimum": 0,
                  "maximum": 10,
                  "description": "Quanto è stato facile restare presente, da 0 a 10, se la persona lo ha detto"
                },
                "accorgersi": {
                  "type": "integer",
                  "minimum": 0,
                  "maximum": 10,
                  "description": "Quanto si è accorta quando la mente si allontanava, da 0 a 10, se lo ha detto"
                },
                "guida": {
                  "type": "string",
                  "enum": [
                    "troppa",
                    "giusta",
                    "poca"
                  ],
                  "description": "La quantità di guida, se lo ha detto"
                },
                "umore_dopo": {
                  "type": "number",
                  "minimum": -1,
                  "maximum": 1,
                  "description": "Come si sente dopo la pratica rispetto a prima, da -1 (molto negativo) a 1 (molto positivo), sulla stessa scala di mood_valence in salva_stato, solo se lo ha detto"
                }
              },
              "required": [
                "esito"
              ]
            },
            "request_headers": [
              {
                "name": "X-Internal-Secret",
                "source": {
                  "kind": "credential",
                  "key": "workspace"
                }
              },
              {
                "name": "X-Coach-Session",
                "source": {
                  "kind": "session",
                  "bindingId": "synthetic-session-binding"
                }
              }
            ]
          }
        },
        {
          "name": "end_call",
          "type": "system",
          "description": "Chiude la chiamata per sempre. Solo alla fine: dopo chiudi e dopo il saluto, quando la persona ha salutato e non ha altro da dire. Mai per aspettare una risposta.",
          "params": {
            "system_tool_type": "end_call"
          }
        },
        {
          "name": "skip_turn",
          "type": "system",
          "description": "Quando hai finito di parlare e aspetti senza dire altro: durante la guida dopo una frase che invita a sentire (la pagina tiene il silenzio e poi ti scrive), oppure quando aspetti la risposta della persona.",
          "params": {
            "system_tool_type": "skip_turn"
          }
        }
      ]
    }
  },
  "tts": {
    "voice_id": "synthetic-voice",
    "model_id": "eleven_v4_turbo",
    "stability": 0.5,
    "speed": 1.0,
    "similarity_boost": 0.75,
    "optimize_streaming_latency": 0,
    "agent_output_audio_format": "pcm_24000",
    "supported_voices": [
      {
        "label": "Guida",
        "voice_id": "synthetic-voice-0",
        "description": "Voce della parte guidata: intima, bassa, sussurrata e costante nella pratica; nel risveglio, senza sussurro, porta per gradi alla voce naturale.",
        "stability": 0.85,
        "speed": 0.85,
        "similarity_boost": 0.75
      }
    ]
  },
  "turn": {
    "turn_timeout": 8,
    "interruption_ignore_terms": [
      "sì",
      "si",
      "sì sì",
      "mh",
      "mhm",
      "mm",
      "ok",
      "okay",
      "certo",
      "giusto",
      "esatto",
      "bene",
      "va bene",
      "perfetto",
      "capito",
      "d'accordo",
      "ah",
      "eh",
      "infatti",
      "vero"
    ],
    "merge_with_default_ignore_terms": true,
    "silence_end_call_timeout": -1
  },
  "conversation": {
    "max_duration_seconds": 1800,
    "client_events": [
      "audio",
      "interruption",
      "agent_response",
      "user_transcript",
      "agent_response_correction",
      "agent_tool_response"
    ]
  },
  "platform_settings": {
    "auth": {
      "enable_auth": true,
      "allowlist": [
        "https://forge.example.test/"
      ],
      "require_origin_header": true
    }
  }
};
