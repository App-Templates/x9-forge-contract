import {describe,expect,it} from 'vitest';
import * as agent from '../../src/agent/index.js';
import {MODEL_PROVIDERS} from '../../src/model-router/model-provider.js';
import {TtsProviderSchema} from '../../src/capability/tts/index.js';
import {TranscribeProviderSchema} from '../../src/capability/stt/index.js';
import {VoiceProviderSchema} from '../../src/capability/voice/provider.js';
const {AGENT_CREDENTIAL_SERVICE_METADATA:map,AgentCredentialServiceMetadataSchema:metadata,AgentCredentialServiceSchema:service,getAgentCredentialServiceMetadata:get}=agent;
const brands:Record<string,string[]>={
 openai:['OPENAI_API_KEY','OPENAI_TTS_MODEL','OPENAI_TTS_VOICE','OPENAI_STT_MODEL','OPENAI_LIVE_VOICE','OPENAI_LIVE_BACKEND_MODEL'],
 anthropic:['ANTHROPIC_API_KEY'],google:['GOOGLE_API_KEY','GOOGLE_CALENDAR_CLIENT_ID','GOOGLE_CALENDAR_CLIENT_SECRET','GOOGLE_CALENDAR_REFRESH_TOKEN','GOOGLE_CONTACTS_CLIENT_ID','GOOGLE_CONTACTS_CLIENT_SECRET','GOOGLE_CONTACTS_REFRESH_TOKEN'],
 telegram:['TELEGRAM_BOT_TOKEN'],elevenlabs:['ELEVENLABS_API_KEY','ELEVENLABS_VOICE_ID','ELEVENLABS_MODEL_ID','ELEVENLABS_MINDFULNESS_AGENT_ID'],
 telnyx:['TELNYX_API_KEY','TELNYX_CONNECTION_ID','TELNYX_FROM_NUMBER','TELNYX_PUBLIC_KEY'],qdrant:['QDRANT_API_KEY'],agentmail:['AGENTMAIL_API_KEY','AGENTMAIL_INBOX_ID','AGENT_EMAIL'],hostinger:['HOSTINGER_API_TOKEN'],netatmo:['NETATMO_CLIENT_ID','NETATMO_CLIENT_SECRET','NETATMO_REFRESH_TOKEN','NETATMO_ACCESS_TOKEN','NETATMO_PASSWORD']};
const internal={x9:['INTERNAL_SECRET','INTERNAL_TOKEN','X9_INTERNAL_SECRET','LIVE_WEB_AUTH_TOKEN'],forge:['FORGE_VOICE_REGISTER_TOKEN']};
const settings=['AGENT_CHAT_MODEL','TTS_PROVIDER','STT_PRIMARY_PROVIDER','VOICE_CALL_PROVIDER','ELEVENLABS_MODEL_ID','OPENAI_TTS_MODEL','OPENAI_TTS_VOICE','OPENAI_STT_MODEL','OPENAI_LIVE_VOICE','OPENAI_LIVE_BACKEND_MODEL'];
const identifiers=['ELEVENLABS_VOICE_ID','ELEVENLABS_MINDFULNESS_AGENT_ID','TELNYX_CONNECTION_ID','TELNYX_FROM_NUMBER','AGENTMAIL_INBOX_ID','AGENT_EMAIL'];
const candidates:Record<string,readonly string[]>={AGENT_CHAT_MODEL:MODEL_PROVIDERS,TTS_PROVIDER:TtsProviderSchema.options,STT_PRIMARY_PROVIDER:TranscribeProviderSchema.options,VOICE_CALL_PROVIDER:VoiceProviderSchema.options.map(p=>p==='openai_live'?'openai':p)};
const declared=[...new Set([...Object.keys(agent.AgentCredentialsSchema.shape),...agent.KNOWN_CREDENTIAL_KEYS,...agent.AUTH_GATE_FIELDS])];
describe('Canonical credential services',()=>{
 it('exports the metadata through the public agent entry',()=>{expect(agent).toHaveProperty('AGENT_CREDENTIAL_SERVICE_METADATA');expect(agent).toHaveProperty('AgentCredentialServiceMetadataSchema');expect(agent).toHaveProperty('getAgentCredentialServiceMetadata');});
 it('covers exactly every declared key, including the additional auth gate',()=>{expect(Object.keys(map).sort()).toEqual([...declared].sort());expect(agent.AGENT_CREDENTIAL_SERVICE_KEYS.toSorted()).toEqual([...declared].sort());expect(declared).toHaveLength(42);expect(get('INTERNAL_TOKEN')).not.toBeNull();});
 it.each(declared)('attests service/kind/label and no values for %s',key=>{
  const entry=get(key)!;expect(entry).not.toBeNull();expect(entry.key).toBe(key);expect(metadata.safeParse(entry).success).toBe(true);expect(entry.label.trim()).not.toBe('');expect(entry.label).toMatch(/Chiave|Token|Segreto|Modello|Voce|Fornitore|Identificativo|Numero|Indirizzo/);
  expect(entry.kind).toBe(settings.includes(key)?'setting':identifiers.includes(key)?'identifier':'credential');expect(entry.secret).toBe(entry.kind==='credential'&&key!=='TELNYX_PUBLIC_KEY'&&!key.endsWith('_CLIENT_ID'));
  const brand=Object.entries(brands).find(([,keys])=>keys.includes(key));const firstParty=Object.entries(internal).find(([,keys])=>keys.includes(key));
  if(brand)expect(entry.service).toEqual({type:'commercial',id:brand[0]});
  else if(firstParty)expect(entry.service).toEqual({type:'internal',id:firstParty[0]});
  else expect(entry.service).toEqual({type:'multi-provider',candidates:[...candidates[key]!].sort((a,b)=>{const expected=['elevenlabs','openai'];return key==='AGENT_CHAT_MODEL'?0:expected.indexOf(a)-expected.indexOf(b)})});
  expect(Object.keys(entry).sort()).toEqual(['key','kind','label','secret','service']);
 });
 it.each(['made-up','voice','email','system','openai_live'])('rejects invented commercial service %s',id=>{expect(service.safeParse({type:'commercial',id}).success).toBe(false);});
 it.each([{type:'multi-provider',candidates:[]},{type:'multi-provider',candidates:['openai']},{type:'multi-provider',candidates:['openai','openai']},{type:'multi-provider',candidates:['openai','fake']},{type:'internal',id:'fake'},{type:'commercial',id:'openai',value:'not-metadata'}])('rejects malformed service %j',input=>{expect(service.safeParse(input).success).toBe(false);});
 it.each(['','CUSTOM_CAPABILITY_KEY','NETATMO_UNKNOWN_KEY','__proto__','constructor','toString'])('unknown key %s never guesses a provider',key=>{expect(get(key)).toBeNull();expect(metadata.safeParse({...map.OPENAI_API_KEY,key}).success).toBe(false);});
 it.each([
  {service:{type:'commercial',id:'google'}},{service:{type:'internal',id:'x9'}},{kind:'setting'},{secret:false},{label:''},{label:'   '},{label:'Un altro servizio'},{value:'not-metadata'},
 ])('rejects forged or value-bearing metadata %j',patch=>{expect(metadata.safeParse({...map.OPENAI_API_KEY,...patch}).success).toBe(false);});
 it('does not allow a candidate selector to claim one active provider',()=>{expect(metadata.safeParse({...map.TTS_PROVIDER,service:{type:'commercial',id:'openai'}}).success).toBe(false);});
 it('registry and nested arrays cannot be mutated by consumers',()=>{expect(Object.isFrozen(map)).toBe(true);for(const entry of Object.values(map)){expect(Object.isFrozen(entry)).toBe(true);expect(Object.isFrozen(entry.service)).toBe(true);if(entry.service.type==='multi-provider')expect(Object.isFrozen(entry.service.candidates)).toBe(true);}});
});
