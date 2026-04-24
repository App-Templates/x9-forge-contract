import { describe, it, expect } from 'vitest';
import {
  STT_TRANSCRIBE_PATH,
  STT_TRANSCRIBE_METHOD,
  CAP_STT_REGISTRY_ENTRY,
} from '../../../src/capability/stt/endpoints.js';
import { CapabilityRegistryEntrySchema } from '../../../src/capability/capability-registry-entry.js';

describe('STT endpoint constants', () => {
  it('Test 5: STT_TRANSCRIBE_PATH is /call/transcribe and method is POST', () => {
    expect(STT_TRANSCRIBE_PATH).toBe('/call/transcribe');
    expect(STT_TRANSCRIBE_METHOD).toBe('POST');
  });
});

describe('CAP_STT_REGISTRY_ENTRY', () => {
  it('Test 6: parses against CapabilityRegistryEntrySchema with correct values', () => {
    const result = CapabilityRegistryEntrySchema.safeParse(CAP_STT_REGISTRY_ENTRY);
    expect(result.success).toBe(true);

    expect(CAP_STT_REGISTRY_ENTRY.name).toBe('stt');
    expect(CAP_STT_REGISTRY_ENTRY.host).toBe('cap-stt');
    expect(CAP_STT_REGISTRY_ENTRY.port).toBe(3216);
    expect(CAP_STT_REGISTRY_ENTRY.requires).toEqual([]);
    expect(CAP_STT_REGISTRY_ENTRY.version).toBe('0.0.1');
    expect(CAP_STT_REGISTRY_ENTRY.enabled).toBe(true);
    expect(CAP_STT_REGISTRY_ENTRY.tools).toHaveLength(1);
    expect(CAP_STT_REGISTRY_ENTRY.tools![0]!.name).toBe('transcribe');
  });
});
