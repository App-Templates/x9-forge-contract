import { describe, it, expect } from 'vitest';
import { CapabilityManifestSchema, type CapabilityManifest } from '../../src/capability/index';

// Real fixture captured from agent-x9/services/agent-core/registry.json (2026-04-15)
const REAL_MANIFEST_FIXTURE: CapabilityManifest = {
  name: 'memory',
  version: '1.0.0',
  endpoint: 'http://memory:3001',
  tools: [
    {
      name: 'memory_capture',
      description: 'Save a piece of information to long-term memory',
      inputSchema: {
        type: 'object',
        properties: {
          content: { type: 'string', description: 'The information to remember' },
        },
        required: ['content'],
      },
    },
    {
      name: 'memory_recall',
      description: 'Search long-term memory for relevant information',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
        },
        required: ['query'],
      },
    },
  ],
};

describe('CapabilityManifestSchema', () => {
  it('parses a valid manifest (real fixture from staging)', () => {
    const result = CapabilityManifestSchema.safeParse(REAL_MANIFEST_FIXTURE);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('memory');
      expect(result.data.tools).toHaveLength(2);
      expect(result.data.serviceName).toBeUndefined();
    }
  });

  it('parses manifest with optional serviceName (Forge X9Client discovery)', () => {
    const withServiceName = { ...REAL_MANIFEST_FIXTURE, serviceName: 'memory' };
    const result = CapabilityManifestSchema.safeParse(withServiceName);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.serviceName).toBe('memory');
    }
  });

  it('rejects manifest with missing name (fail-loud contract)', () => {
    const { name: _, ...withoutName } = REAL_MANIFEST_FIXTURE;
    expect(CapabilityManifestSchema.safeParse(withoutName).success).toBe(false);
  });

  it('rejects manifest with empty endpoint (fail-loud contract)', () => {
    const invalid = { ...REAL_MANIFEST_FIXTURE, endpoint: '' };
    expect(CapabilityManifestSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects manifest with missing tools array (fail-loud contract)', () => {
    const { tools: _, ...withoutTools } = REAL_MANIFEST_FIXTURE;
    expect(CapabilityManifestSchema.safeParse(withoutTools).success).toBe(false);
  });

  it('parses real cap-calendar manifest (5 tools, TEST-02 conformance)', () => {
    const CAP_CALENDAR_FIXTURE: CapabilityManifest = {
      name: 'calendar',
      version: '0.0.1',
      endpoint: 'http://cap-calendar:3200',
      tools: [
        { name: 'calendar_today', description: "Get today's calendar events", inputSchema: { type: 'object', properties: {} } },
        { name: 'calendar_week', description: 'Get calendar events for a specific week', inputSchema: { type: 'object', properties: { targetDate: { type: 'string' }, weekOffset: { type: 'number' } } } },
        { name: 'calendar_create', description: 'Create a new event', inputSchema: { type: 'object', properties: { summary: { type: 'string' }, startTime: { type: 'string' }, endTime: { type: 'string' } }, required: ['summary', 'startTime', 'endTime'] } },
        { name: 'calendar_update', description: 'Update an existing event', inputSchema: { type: 'object', properties: { eventId: { type: 'string' }, changes: { type: 'object' } }, required: ['eventId', 'changes'] } },
        { name: 'calendar_delete', description: 'Delete an event', inputSchema: { type: 'object', properties: { eventId: { type: 'string' } }, required: ['eventId'] } },
      ],
    };
    const result = CapabilityManifestSchema.safeParse(CAP_CALENDAR_FIXTURE);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('calendar');
      expect(result.data.tools).toHaveLength(5);
      expect(result.data.serviceName).toBeUndefined();
    }
  });
});
