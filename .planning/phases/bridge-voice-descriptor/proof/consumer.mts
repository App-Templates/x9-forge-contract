import { agentVoiceSettingsFromModelDescriptor } from '@x9-forge/contracts/voice';
import type { ModelDescriptorVoiceInput, ModelDescriptorVoiceResult, AgentVoiceEnabledSettings } from '@x9-forge/contracts/voice';
export function useVoice(input: ModelDescriptorVoiceInput): AgentVoiceEnabledSettings | 'unsupported_voice_model' {
  const result: ModelDescriptorVoiceResult = agentVoiceSettingsFromModelDescriptor(input);
  return result.ok ? result.settings : result.error;
}
