import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ModelPushRequestSchema, ModelPushResponseSchema } from '../../src/model-router/model-push.js';
import { ModelHotReloadNotificationSchema } from '../../src/model-router/model-hot-reload.js';

const FIXTURES_DIR = join(fileURLToPath(new URL('.', import.meta.url)), 'fixtures');

function load(name: string): Record<string, unknown> {
  const raw = JSON.parse(readFileSync(join(FIXTURES_DIR, name), 'utf8')) as Record<string, unknown>;
  const { _note: _ignored, ...rest } = raw;
  return rest;
}

describe('Phase 6 fixtures — green parses', () => {
  it('model-push-request-minimal.json parses', () => {
    expect(ModelPushRequestSchema.safeParse(load('model-push-request-minimal.json')).success).toBe(true);
  });
  it('model-push-request-complete.json parses', () => {
    expect(ModelPushRequestSchema.safeParse(load('model-push-request-complete.json')).success).toBe(true);
  });
  it('model-push-response-success.json parses', () => {
    expect(ModelPushResponseSchema.safeParse(load('model-push-response-success.json')).success).toBe(true);
  });
  it.each([
    'model-push-response-error-invalid-policy.json',
    'model-push-response-error-unknown-cap.json',
    'model-push-response-error-invalid-mapping.json',
    'model-push-response-error-internal.json',
  ])('%s parses', (name) => {
    expect(ModelPushResponseSchema.safeParse(load(name)).success).toBe(true);
  });
  it('model-hot-reload-notification-minimal.json parses', () => {
    expect(ModelHotReloadNotificationSchema.safeParse(load('model-hot-reload-notification-minimal.json')).success).toBe(true);
  });
});
