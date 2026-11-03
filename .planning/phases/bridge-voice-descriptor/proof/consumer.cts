import { agentVoiceSettingsFromModelDescriptor, type ModelDescriptorVoiceInput, type ModelDescriptorVoiceResult } from '@x9-forge/contracts/voice';
export function useVoice(input: ModelDescriptorVoiceInput): ModelDescriptorVoiceResult {
  return agentVoiceSettingsFromModelDescriptor(input);
}
