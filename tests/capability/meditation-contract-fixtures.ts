// Synthetic fixtures reuse the reviewed port matrix; no private data.
export const fixtures = {
  "CoachStrategyRef": {
    "strategyId": "synthetic-meditation",
    "strategyVersion": "1"
  },
  "CoachProgramVersionRef": {
    "scope": {
      "tenantId": "10000000-0000-4000-8000-000000000001",
      "ownerId": "20000000-0000-4000-8000-000000000001",
      "agentId": "synthetic-meditation-agent"
    },
    "programId": "synthetic-meditation",
    "programVersion": 1,
    "strategy": {
      "strategyId": "synthetic-meditation",
      "strategyVersion": "1"
    },
    "catalogRevision": "catalog-1",
    "policyRevision": "policy-1",
    "progressionRevision": "progression-1",
    "measureDefinitionRevision": "measures-1"
  },
  "CoachSessionOpeningRef": {
    "openingId": "synthetic-opening-1",
    "scope": {
      "tenantId": "10000000-0000-4000-8000-000000000001",
      "ownerId": "20000000-0000-4000-8000-000000000001",
      "agentId": "synthetic-meditation-agent",
      "userId": "synthetic-meditation-person-1"
    },
    "sessionId": "synthetic-session-1",
    "program": {
      "scope": {
        "tenantId": "10000000-0000-4000-8000-000000000001",
        "ownerId": "20000000-0000-4000-8000-000000000001",
        "agentId": "synthetic-meditation-agent"
      },
      "programId": "synthetic-meditation",
      "programVersion": 1,
      "strategy": {
        "strategyId": "synthetic-meditation",
        "strategyVersion": "1"
      },
      "catalogRevision": "catalog-1",
      "policyRevision": "policy-1",
      "progressionRevision": "progression-1",
      "measureDefinitionRevision": "measures-1"
    },
    "appliedConfigVersion": 1,
    "openedAt": "2026-10-09T00:00:00Z"
  },
  "CoachExecutionSegment": {
    "segmentId": "synthetic-segment",
    "stepId": "synthetic-step",
    "offsetSeconds": 0,
    "durationSeconds": 60
  },
  "CoachSessionExecutionSnapshot": {
    "snapshotId": "synthetic-snapshot-1",
    "opening": {
      "openingId": "synthetic-opening-1",
      "scope": {
        "tenantId": "10000000-0000-4000-8000-000000000001",
        "ownerId": "20000000-0000-4000-8000-000000000001",
        "agentId": "synthetic-meditation-agent",
        "userId": "synthetic-meditation-person-1"
      },
      "sessionId": "synthetic-session-1",
      "program": {
        "scope": {
          "tenantId": "10000000-0000-4000-8000-000000000001",
          "ownerId": "20000000-0000-4000-8000-000000000001",
          "agentId": "synthetic-meditation-agent"
        },
        "programId": "synthetic-meditation",
        "programVersion": 1,
        "strategy": {
          "strategyId": "synthetic-meditation",
          "strategyVersion": "1"
        },
        "catalogRevision": "catalog-1",
        "policyRevision": "policy-1",
        "progressionRevision": "progression-1",
        "measureDefinitionRevision": "measures-1"
      },
      "appliedConfigVersion": 1,
      "openedAt": "2026-10-09T00:00:00Z"
    },
    "segments": [
      {
        "segmentId": "synthetic-segment",
        "stepId": "synthetic-step",
        "offsetSeconds": 0,
        "durationSeconds": 60
      }
    ],
    "totalSeconds": 60,
    "decisionCodes": [
      "synthetic-selection"
    ],
    "startedAt": "2026-10-09T00:01:00Z"
  },
  "CoachSessionPlanRevision": {
    "revisionId": "synthetic-revision-1",
    "scope": {
      "tenantId": "10000000-0000-4000-8000-000000000001",
      "ownerId": "20000000-0000-4000-8000-000000000001",
      "agentId": "synthetic-meditation-agent",
      "userId": "synthetic-meditation-person-1"
    },
    "sessionId": "synthetic-session-1",
    "snapshotId": "synthetic-snapshot-1",
    "sequence": 1,
    "appliedAt": "2026-10-09T00:01:10Z",
    "effectiveFromSeconds": 10,
    "segments": [
      {
        "segmentId": "synthetic-segment",
        "stepId": "synthetic-step",
        "offsetSeconds": 0,
        "durationSeconds": 60
      }
    ],
    "totalSeconds": 60,
    "decisionCodes": [
      "synthetic-adjustment"
    ]
  },
  "CoachMeasureDefinition": {
    "measureId": "synthetic-skill",
    "version": "1",
    "unit": "synthetic-score",
    "min": 0,
    "max": 100
  },
  "CoachMeasureObservation": {
    "observationId": "synthetic-observation-1",
    "scope": {
      "tenantId": "10000000-0000-4000-8000-000000000001",
      "ownerId": "20000000-0000-4000-8000-000000000001",
      "agentId": "synthetic-meditation-agent",
      "userId": "synthetic-meditation-person-1"
    },
    "sessionId": "synthetic-session-1",
    "openingId": "synthetic-opening-1",
    "snapshotId": null,
    "measureId": "synthetic-skill",
    "definitionVersion": "1",
    "unit": "synthetic-score",
    "observedAt": "2026-10-09T00:00:00Z",
    "provenance": {
      "source": "self-report",
      "sourceRef": "synthetic-report-1"
    },
    "value": {
      "kind": "known",
      "value": 0,
      "confidence": null
    }
  },
  "CoachProviderUsage": {
    "usageId": "synthetic-usage-1",
    "scope": {
      "tenantId": "10000000-0000-4000-8000-000000000001",
      "ownerId": "20000000-0000-4000-8000-000000000001",
      "agentId": "synthetic-meditation-agent",
      "userId": "synthetic-meditation-person-1"
    },
    "sessionId": "synthetic-session-1",
    "openingId": "synthetic-opening-1",
    "snapshotId": null,
    "providerConversationId": "synthetic-conversation-1",
    "callStartedAt": "2026-10-09T00:00:00Z",
    "callEndedAt": "2026-10-09T00:00:30Z",
    "billableSeconds": null,
    "durationSeconds": 30,
    "source": "transcript-lower-bound",
    "sourceRef": "synthetic-transcript-1",
    "confidence": null,
    "observedAt": "2026-10-09T00:03:00Z"
  },
  "CoachPracticeObservation": {
    "observationId": "synthetic-practice-1",
    "scope": {
      "tenantId": "10000000-0000-4000-8000-000000000001",
      "ownerId": "20000000-0000-4000-8000-000000000001",
      "agentId": "synthetic-meditation-agent",
      "userId": "synthetic-meditation-person-1"
    },
    "sessionId": "synthetic-session-1",
    "openingId": "synthetic-opening-1",
    "snapshotId": "synthetic-snapshot-1",
    "startedAt": "2026-10-09T00:01:00Z",
    "endedAt": "2026-10-09T00:02:10Z",
    "guidedSeconds": 60,
    "wakeSeconds": 10
  },
  "CoachSessionAccounting": {
    "scope": {
      "tenantId": "10000000-0000-4000-8000-000000000001",
      "ownerId": "20000000-0000-4000-8000-000000000001",
      "agentId": "synthetic-meditation-agent",
      "userId": "synthetic-meditation-person-1"
    },
    "sessionId": "synthetic-session-1",
    "openingId": "synthetic-opening-1",
    "snapshotId": null,
    "usage": {
      "usageId": "synthetic-usage-1",
      "scope": {
        "tenantId": "10000000-0000-4000-8000-000000000001",
        "ownerId": "20000000-0000-4000-8000-000000000001",
        "agentId": "synthetic-meditation-agent",
        "userId": "synthetic-meditation-person-1"
      },
      "sessionId": "synthetic-session-1",
      "openingId": "synthetic-opening-1",
      "snapshotId": null,
      "providerConversationId": "synthetic-conversation-1",
      "callStartedAt": "2026-10-09T00:00:00Z",
      "callEndedAt": "2026-10-09T00:00:30Z",
      "billableSeconds": null,
      "durationSeconds": 30,
      "source": "transcript-lower-bound",
      "sourceRef": "synthetic-transcript-1",
      "confidence": null,
      "observedAt": "2026-10-09T00:03:00Z"
    },
    "practice": null,
    "outcome": "abandoned",
    "progressionCredit": false,
    "strategy": {
      "strategyId": "synthetic-meditation",
      "strategyVersion": "1"
    }
  },
  "CoachRollingBudget": {
    "scope": {
      "tenantId": "10000000-0000-4000-8000-000000000001",
      "ownerId": "20000000-0000-4000-8000-000000000001",
      "agentId": "synthetic-meditation-agent",
      "userId": "synthetic-meditation-person-1"
    },
    "windowSeconds": 86400,
    "asOf": "2026-10-09T00:00:00Z",
    "windowStart": "2026-10-08T00:00:00Z",
    "limitSeconds": 600,
    "usedSeconds": 120
  },
  "CoachSessionQuota": {
    "scope": {
      "tenantId": "10000000-0000-4000-8000-000000000001",
      "ownerId": "20000000-0000-4000-8000-000000000001",
      "agentId": "synthetic-meditation-agent",
      "userId": "synthetic-meditation-person-1"
    },
    "budgetAsOf": "2026-10-09T00:00:00Z",
    "remainingSeconds": 480,
    "shareLimitSeconds": 120,
    "limitSeconds": 120
  },
  "ElevenLabsCoachSessionBinding": {
    "bindingId": "synthetic-binding-1",
    "opening": {
      "openingId": "synthetic-opening-1",
      "scope": {
        "tenantId": "10000000-0000-4000-8000-000000000001",
        "ownerId": "20000000-0000-4000-8000-000000000001",
        "agentId": "synthetic-meditation-agent",
        "userId": "synthetic-meditation-person-1"
      },
      "sessionId": "synthetic-session-1",
      "program": {
        "scope": {
          "tenantId": "10000000-0000-4000-8000-000000000001",
          "ownerId": "20000000-0000-4000-8000-000000000001",
          "agentId": "synthetic-meditation-agent"
        },
        "programId": "synthetic-meditation",
        "programVersion": 1,
        "strategy": {
          "strategyId": "synthetic-meditation",
          "strategyVersion": "1"
        },
        "catalogRevision": "catalog-1",
        "policyRevision": "policy-1",
        "progressionRevision": "progression-1",
        "measureDefinitionRevision": "measures-1"
      },
      "appliedConfigVersion": 1,
      "openedAt": "2026-10-09T00:00:00Z"
    },
    "mapping": {
      "scope": {
        "tenantId": "10000000-0000-4000-8000-000000000001",
        "ownerId": "20000000-0000-4000-8000-000000000001",
        "agentId": "synthetic-meditation-agent"
      },
      "providerAgentId": "synthetic_provider_meditation",
      "origin": "adopted",
      "createdAt": "2026-10-09T00:00:00Z",
      "appliedConfigVersion": 1
    },
    "admittedAt": "2026-10-09T00:00:00Z"
  },
  "ElevenLabsCoachConversationBinding": {
    "conversationBindingId": "synthetic-conversation-binding-1",
    "sessionBinding": {
      "bindingId": "synthetic-binding-1",
      "opening": {
        "openingId": "synthetic-opening-1",
        "scope": {
          "tenantId": "10000000-0000-4000-8000-000000000001",
          "ownerId": "20000000-0000-4000-8000-000000000001",
          "agentId": "synthetic-meditation-agent",
          "userId": "synthetic-meditation-person-1"
        },
        "sessionId": "synthetic-session-1",
        "program": {
          "scope": {
            "tenantId": "10000000-0000-4000-8000-000000000001",
            "ownerId": "20000000-0000-4000-8000-000000000001",
            "agentId": "synthetic-meditation-agent"
          },
          "programId": "synthetic-meditation",
          "programVersion": 1,
          "strategy": {
            "strategyId": "synthetic-meditation",
            "strategyVersion": "1"
          },
          "catalogRevision": "catalog-1",
          "policyRevision": "policy-1",
          "progressionRevision": "progression-1",
          "measureDefinitionRevision": "measures-1"
        },
        "appliedConfigVersion": 1,
        "openedAt": "2026-10-09T00:00:00Z"
      },
      "mapping": {
        "scope": {
          "tenantId": "10000000-0000-4000-8000-000000000001",
          "ownerId": "20000000-0000-4000-8000-000000000001",
          "agentId": "synthetic-meditation-agent"
        },
        "providerAgentId": "synthetic_provider_meditation",
        "origin": "adopted",
        "createdAt": "2026-10-09T00:00:00Z",
        "appliedConfigVersion": 1
      },
      "admittedAt": "2026-10-09T00:00:00Z"
    },
    "conversationId": "synthetic-conversation-1",
    "boundAt": "2026-10-09T00:00:00Z"
  },
  "ElevenLabsCoachExecutionAttachment": {
    "attachmentId": "synthetic-attachment-1",
    "sessionBinding": {
      "bindingId": "synthetic-binding-1",
      "opening": {
        "openingId": "synthetic-opening-1",
        "scope": {
          "tenantId": "10000000-0000-4000-8000-000000000001",
          "ownerId": "20000000-0000-4000-8000-000000000001",
          "agentId": "synthetic-meditation-agent",
          "userId": "synthetic-meditation-person-1"
        },
        "sessionId": "synthetic-session-1",
        "program": {
          "scope": {
            "tenantId": "10000000-0000-4000-8000-000000000001",
            "ownerId": "20000000-0000-4000-8000-000000000001",
            "agentId": "synthetic-meditation-agent"
          },
          "programId": "synthetic-meditation",
          "programVersion": 1,
          "strategy": {
            "strategyId": "synthetic-meditation",
            "strategyVersion": "1"
          },
          "catalogRevision": "catalog-1",
          "policyRevision": "policy-1",
          "progressionRevision": "progression-1",
          "measureDefinitionRevision": "measures-1"
        },
        "appliedConfigVersion": 1,
        "openedAt": "2026-10-09T00:00:00Z"
      },
      "mapping": {
        "scope": {
          "tenantId": "10000000-0000-4000-8000-000000000001",
          "ownerId": "20000000-0000-4000-8000-000000000001",
          "agentId": "synthetic-meditation-agent"
        },
        "providerAgentId": "synthetic_provider_meditation",
        "origin": "adopted",
        "createdAt": "2026-10-09T00:00:00Z",
        "appliedConfigVersion": 1
      },
      "admittedAt": "2026-10-09T00:00:00Z"
    },
    "executionSnapshot": {
      "snapshotId": "synthetic-snapshot-1",
      "opening": {
        "openingId": "synthetic-opening-1",
        "scope": {
          "tenantId": "10000000-0000-4000-8000-000000000001",
          "ownerId": "20000000-0000-4000-8000-000000000001",
          "agentId": "synthetic-meditation-agent",
          "userId": "synthetic-meditation-person-1"
        },
        "sessionId": "synthetic-session-1",
        "program": {
          "scope": {
            "tenantId": "10000000-0000-4000-8000-000000000001",
            "ownerId": "20000000-0000-4000-8000-000000000001",
            "agentId": "synthetic-meditation-agent"
          },
          "programId": "synthetic-meditation",
          "programVersion": 1,
          "strategy": {
            "strategyId": "synthetic-meditation",
            "strategyVersion": "1"
          },
          "catalogRevision": "catalog-1",
          "policyRevision": "policy-1",
          "progressionRevision": "progression-1",
          "measureDefinitionRevision": "measures-1"
        },
        "appliedConfigVersion": 1,
        "openedAt": "2026-10-09T00:00:00Z"
      },
      "segments": [
        {
          "segmentId": "synthetic-segment",
          "stepId": "synthetic-step",
          "offsetSeconds": 0,
          "durationSeconds": 60
        }
      ],
      "totalSeconds": 60,
      "decisionCodes": [
        "synthetic-selection"
      ],
      "startedAt": "2026-10-09T00:01:00Z"
    },
    "attachedAt": "2026-10-09T00:01:00Z"
  },
  "RagAuthorizedPrincipal": {
    "principal_id": "synthetic-server-principal-meditation",
    "principal_kind": "human",
    "identity": {
      "tenant_id": "10000000-0000-4000-8000-000000000001",
      "owner_id": "20000000-0000-4000-8000-000000000001",
      "agent_id": "synthetic-meditation-agent"
    },
    "person_id": "synthetic-meditation-person-1"
  },
  "RagCorpusAssignment": {
    "assignment_id": "40000000-0000-4000-8000-000000000001",
    "identity": {
      "tenant_id": "10000000-0000-4000-8000-000000000001",
      "owner_id": "20000000-0000-4000-8000-000000000001",
      "agent_id": "synthetic-meditation-agent"
    },
    "corpus_id": "30000000-0000-4000-8000-000000000001",
    "corpus_revision": "synthetic-content-1",
    "authorization_revision": "synthetic-auth-1",
    "state": "active",
    "observed_at": "2026-10-09T00:00:00Z"
  },
  "RagAuthorizedQueryContext": {
    "principal": {
      "principal_id": "synthetic-server-principal-meditation",
      "principal_kind": "human",
      "identity": {
        "tenant_id": "10000000-0000-4000-8000-000000000001",
        "owner_id": "20000000-0000-4000-8000-000000000001",
        "agent_id": "synthetic-meditation-agent"
      },
      "person_id": "synthetic-meditation-person-1"
    },
    "assignment": {
      "assignment_id": "40000000-0000-4000-8000-000000000001",
      "identity": {
        "tenant_id": "10000000-0000-4000-8000-000000000001",
        "owner_id": "20000000-0000-4000-8000-000000000001",
        "agent_id": "synthetic-meditation-agent"
      },
      "corpus_id": "30000000-0000-4000-8000-000000000001",
      "corpus_revision": "synthetic-content-1",
      "authorization_revision": "synthetic-auth-1",
      "state": "active",
      "observed_at": "2026-10-09T00:00:00Z"
    },
    "observed_at": "2026-10-09T00:00:00Z",
    "expires_at": "2026-10-09T00:00:30Z"
  },
  "RagAuthorizedDocumentRef": {
    "identity": {
      "tenant_id": "10000000-0000-4000-8000-000000000001",
      "owner_id": "20000000-0000-4000-8000-000000000001",
      "agent_id": "synthetic-meditation-agent"
    },
    "corpus_id": "30000000-0000-4000-8000-000000000001",
    "corpus_revision": "synthetic-content-1",
    "assignment_id": "40000000-0000-4000-8000-000000000001",
    "authorization_revision": "synthetic-auth-1",
    "document_id": "50000000-0000-4000-8000-000000000001",
    "revision_id": "60000000-0000-4000-8000-000000000001"
  },
  "RagQualifiedCitation": {
    "document": {
      "identity": {
        "tenant_id": "10000000-0000-4000-8000-000000000001",
        "owner_id": "20000000-0000-4000-8000-000000000001",
        "agent_id": "synthetic-meditation-agent"
      },
      "corpus_id": "30000000-0000-4000-8000-000000000001",
      "corpus_revision": "synthetic-content-1",
      "assignment_id": "40000000-0000-4000-8000-000000000001",
      "authorization_revision": "synthetic-auth-1",
      "document_id": "50000000-0000-4000-8000-000000000001",
      "revision_id": "60000000-0000-4000-8000-000000000001"
    },
    "title": "Synthetic source fixture",
    "chunk_text": "Synthetic source excerpt",
    "score": 0.5,
    "chunk_index": 0,
    "observed_at": "2026-10-09T00:00:00Z"
  }
};
