import { describe, expect, it } from 'vitest';
import * as capability from '../../../src/capability/index.js';
import * as endpoints from '../../../src/http/endpoints/index.js';

describe('esportazioni del protocollo Paperclip', () => {
  it('capability_esporta_strumenti_e_mappa', () => {
    expect(capability.PAPERCLIP_PROTOCOLLO_TOOLS).toBeDefined();
    expect(capability.PaperclipProtocolloAgentiSchema).toBeDefined();
    expect(capability.PAPERCLIP_RUN_ID_HEADER).toBeDefined();
    expect(capability.PaperclipFiglioCorpoSchema).toBeDefined();
  });

  it('http_esporta_contratto_turno', () => {
    expect(endpoints.paperclipProtocolloTurnoContract.path).toBe('/webhook/paperclip/turno');
  });
});
