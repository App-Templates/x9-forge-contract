import { describe, expect, it } from 'vitest';
import { EMAIL_SEND_TOOL } from '../../src/capability/email-tools.js';
import { INTERNAL_AGENT_EXECUTIONS } from '../../src/http/endpoints/internal-agent-tool-dispatch.js';

describe('email tools', () => {
  it('s6101 EMAIL_SEND_TOOL is email_send and the voice dispatch registers it by the constant', () => {
    expect(EMAIL_SEND_TOOL).toBe('email_send');
    expect(INTERNAL_AGENT_EXECUTIONS.voice_email_send.tool).toBe(EMAIL_SEND_TOOL);
    expect(INTERNAL_AGENT_EXECUTIONS.voice_email_send.capability).toBe('email');
  });
});
