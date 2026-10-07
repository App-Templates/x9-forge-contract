import { describe, expect, it } from 'vitest';
import * as http from '../../src/http/index.js';
import * as endpoints from '../../src/http/endpoints/index.js';
import { INTERNAL_SECRET_HEADER } from '../../src/auth/index.js';
import { VoiceProviderCatalogSchema } from '../../src/capability/voice/index.js';

function contract() {
  const value = Reflect.get(http, 'internalVoiceCatalogContract') as { method: string; path: string; authType: string; authHeader: string; responseSchema: typeof VoiceProviderCatalogSchema; bodySchema?: unknown } | undefined;
  expect(value, 'the canonical internal voice catalog contract must be exported').toBeDefined();
  return value!;
}
const menu = { provider: 'openai_live', label: 'GPT', protocols: ['websocket'], transports: ['phone','web'], models: [{id:'synthetic-live-model',label:'Synthetic live'}], voices:{kind:'menu',options:[{id:'synthetic-voice',label:'Synthetic voice'}]} };
const id = { ...menu,provider:'elevenlabs',label:'ElevenLabs',protocols:['sip'],transports:['phone'],voices:{kind:'id',pattern:'^[a-zA-Z0-9]+$'} };
const catalog = () => ({ version: 'synthetic-catalog-v1', providers: [menu,id] });
function parsed(value: unknown) {
  const result = contract().responseSchema.safeParse(value);
  expect(result.success).toBe(true);
  return result.success ? result.data : undefined;
}
describe('internal voice producer catalog contract', () => {
 it('exports the same endpoint through the HTTP and endpoint entry points', () => expect(contract()).toBe(Reflect.get(endpoints,'internalVoiceCatalogContract')));
 it('uses a read-only GET', () => expect(contract().method).toBe('GET'));
 it('owns the canonical internal catalog path', () => expect(contract().path).toBe('/internal/voice/catalog'));
 it('requires the existing platform secret authentication kind', () => expect(contract().authType).toBe('secret'));
 it('imports the existing internal secret header', () => expect(contract().authHeader).toBe(INTERNAL_SECRET_HEADER));
 it('has no model-chosen request body or agent override', () => expect(contract().bodySchema).toBeUndefined());
 it('reuses the canonical versioned provider catalog schema', () => expect(contract().responseSchema).toBe(VoiceProviderCatalogSchema));
 it('returns version and the producer menu without changing supported choices', () => {
  const value = {version:'synthetic-menu-v1',providers:[menu]};expect(parsed(value)).toEqual(value);
 });
 it('returns opaque provider voice IDs and the producer pattern', () => {
  const value = {version:'synthetic-id-v1',providers:[id]};expect(parsed(value)).toEqual(value);
 });
 it('allows an explicitly empty producer catalog without inventing a provider', () => expect(parsed({version:'synthetic-empty-v1',providers:[]})).toEqual({version:'synthetic-empty-v1',providers:[]}));
 it('rejects a catalog with no version', () => expect(contract().responseSchema.safeParse({providers:[menu]}).success).toBe(false));
 it('rejects an empty version', () => expect(contract().responseSchema.safeParse({...catalog(),version:''}).success).toBe(false));
 it('rejects missing providers', () => expect(contract().responseSchema.safeParse({version:'v1'}).success).toBe(false));
 it('rejects duplicate provider identities', () => expect(contract().responseSchema.safeParse({...catalog(),providers:[menu,menu]}).success).toBe(false));
 it('rejects a provider with no supported models', () => expect(contract().responseSchema.safeParse({...catalog(),providers:[{...menu,models:[]}]}).success).toBe(false));
 it('rejects an empty closed voice menu', () => expect(contract().responseSchema.safeParse({...catalog(),providers:[{...menu,voices:{kind:'menu',options:[]}}]}).success).toBe(false));
 it('rejects an invalid provider ID pattern', () => expect(contract().responseSchema.safeParse({...catalog(),providers:[{...id,voices:{kind:'id',pattern:'['}}]}).success).toBe(false));
 it('strips noncatalog source metadata from the wire response', () => {
  const value=catalog();expect(parsed({...value,synthetic_private_marker:'do-not-forward',providers:value.providers.map(provider=>({...provider,synthetic_private_marker:'do-not-forward'}))})).toEqual(value);
 });
});
