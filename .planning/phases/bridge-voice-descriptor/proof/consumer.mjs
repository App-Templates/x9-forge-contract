import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import * as esm from '@x9-forge/contracts/voice';
const cjs = createRequire(import.meta.url)('@x9-forge/contracts/voice');
const input = {
  descriptor: { provider: 'openai', modelId: 'synthetic-live', protocol: 'realtime', adapterId: 'synthetic-adapter' },
  role: 'voice',
  choices: { protocol: 'webrtc', voiceId: 'synthetic-voice', transports: ['web'] },
  catalog: { version: 'synthetic', providers: [{ provider: 'openai_live', label: 'Synthetic', protocols: ['webrtc'], transports: ['web'], models: [{ id: 'synthetic-live', label: 'Synthetic' }], voices: { kind: 'menu', options: [{ id: 'synthetic-voice', label: 'Synthetic' }] } }] },
};
for (const [name, api] of [['ESM', esm], ['CJS', cjs]]) {
  const result = api.agentVoiceSettingsFromModelDescriptor(input);
  assert.deepEqual(result, { ok: true, settings: { ...input.choices, mode: 'voice', provider: 'openai_live', model: input.descriptor.modelId } });
  assert.deepEqual(api.validateAgentVoiceSettings(result.settings, input.catalog), []);
  assert.deepEqual(api.agentVoiceSettingsFromModelDescriptor({ ...input, descriptor: { ...input.descriptor, provider: 'future-provider' } }), { ok: false, error: 'unsupported_voice_model' });
  console.log(`${name}: 3/3 public package assertions passed`);
}
