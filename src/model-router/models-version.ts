import { ModelCatalogSchema, ModelCatalogVersionSchema, type ModelCatalog } from './model-catalog.js';
import type { AgentModelsConfiguration } from './agent-model-configuration-values.js';

// SHA-256 constants and UTF-8 encoding keep these synchronous exports portable to browser consumers.
const K = [
  0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
  0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
  0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
  0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
  0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
  0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
  0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
  0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2,
];
const rotate = (word: number, bits: number): number => (word >>> bits) | (word << (32 - bits));
function sha256(text: string): string {
  const bytes = new TextEncoder().encode(text), size = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(size); padded.set(bytes); padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(size - 8, Math.floor(bytes.length / 0x20000000)); view.setUint32(size - 4, bytes.length << 3);
  const hash = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const words = new Uint32Array(64);
  for (let offset = 0; offset < size; offset += 64) {
    for (let i = 0; i < 16; i++) words[i] = view.getUint32(offset + i * 4);
    for (let i = 16; i < 64; i++) {
      const x = words[i - 15]!, y = words[i - 2]!;
      words[i] = words[i - 16]! + (rotate(x,7) ^ rotate(x,18) ^ (x >>> 3)) + words[i - 7]! + (rotate(y,17) ^ rotate(y,19) ^ (y >>> 10));
    }
    let [a,b,c,d,e,f,g,h] = hash as [number,number,number,number,number,number,number,number];
    for (let i = 0; i < 64; i++) {
      const first = (h + (rotate(e,6) ^ rotate(e,11) ^ rotate(e,25)) + ((e & f) ^ (~e & g)) + K[i]! + words[i]!) >>> 0;
      const second = ((rotate(a,2) ^ rotate(a,13) ^ rotate(a,22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      h=g; g=f; f=e; e=(d+first)>>>0; d=c; c=b; b=a; a=(first+second)>>>0;
    }
    for (const [i, word] of [a,b,c,d,e,f,g,h].entries()) hash[i] = (hash[i]! + word) >>> 0;
  }
  return hash.map(word => word.toString(16).padStart(8, '0')).join('');
}
/** Exact agent-core public-content fingerprint; observation times and its previous token do not participate. */
export function modelCatalogContentVersion(catalog: ModelCatalog): string {
  const {version: _version, observedAt: _observedAt, validUntil: _validUntil, ...content} = ModelCatalogSchema.parse(catalog);
  const entries = [...content.entries].sort((a,b) => JSON.stringify([a.provider,a.modelId,a.function]).localeCompare(JSON.stringify([b.provider,b.modelId,b.function])));
  const inventory = [...(content.inventory ?? [])].sort((a,b) => JSON.stringify([a.provider,a.modelId]).localeCompare(JSON.stringify([b.provider,b.modelId])));
  return sha256(JSON.stringify({...content, entries, inventory}));
}
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === 'object') return Object.fromEntries(Object.entries(value)
    .filter(([, item]) => item !== undefined).sort(([a],[b]) => a.localeCompare(b)).map(([key,item]) => [key,canonical(item)]));
  return value;
}
/** Saved content includes identity/provenance; only its sequence and per-slot catalog observation tokens are omitted. */
export function modelConfigurationContentVersion(configuration: AgentModelsConfiguration): string {
  const {configVersion: _configVersion, selections, provenance, ...content} = configuration;
  const slots = selections.map(({settings, ...selection}) => {
    const {catalogVersion: _catalogVersion, ...selected} = settings;
    return {...selection, settings: selected};
  }).sort((a,b) => a.slotId.localeCompare(b.slotId));
  return sha256(JSON.stringify(canonical({...content, selections: slots, ...(provenance === undefined ? {} : {
    provenance: {...provenance, bindings: [...provenance.bindings].sort((a,b) => a.slotId.localeCompare(b.slotId))},
  })})));
}
/** One content version for the catalog/configuration pair. */
export function modelsVersion(input: {catalogVersion: string; configurationVersion: string}): string {
  return 'mv1-' + sha256(input.catalogVersion + '\n' + input.configurationVersion).slice(0, 32);
}
/** Stamp the token of the catalog object just validated, without mutating the caller's selection. */
export function withCatalogVersion<S extends {settings: {catalogVersion: string}}>(selection: S, catalog: {version: string}): S {
  return {...selection, settings: {...selection.settings, catalogVersion: ModelCatalogVersionSchema.parse(catalog.version)}};
}
