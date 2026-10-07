const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const channel = { channelId: 'synthetic-telegram', kind: 'telegram', state: 'paused', loaded: false, readiness: 'unknown' };
const row = { agentId: 'synthetic-agent', displayName: 'Synthetic', ownerId: 'synthetic-owner' };
const inventory = botUsername => ({ ...row, runtime: { loadState: 'loaded', state: 'no-channel', channelsComplete: true, channels: [{ ...channel, botUsername, allowFromCount: 0 }] } });
const invalid = ['', ' ', 'abot', 'a'.repeat(30) + 'bot', 'https://invalid.test/Bot', '123456:SYNTHETIC_TOKEN', 'synthetic:bot', '@synthetic_bot', 'synthetic/bot', 'synthetic-bot', 'synthetic.bot', 'syntheticébot', 'synthetic_user', 'synthetic_bot ', ' synthetic_bot', 'synthetic_bot\n', 'synthetic_bot\r\n', 'synthetic_bot\u2028', 'synthetic_bot\u2029', 'synthetic_bot\u0000'];
const valid = ['abBot', 'synthetic_bot', 'SyntheticBot', 'SyntheticBOT', 'a'.repeat(29) + 'bot', 'a_9bot'];

(async () => {
  const imports = { CJS: [require('@x9-forge/contracts/agent'), require('@x9-forge/contracts/http')], ESM: [await import('@x9-forge/contracts/agent'), await import('@x9-forge/contracts/http')] };
  for (const [mode, [agent, http]] of Object.entries(imports)) {
    test(mode + ' resolves the installed native archive', () => {
      const filename = require.resolve('@x9-forge/contracts/agent');
      assert.match(filename, /b139-consumer\/node_modules\/@x9-forge\/contracts\/dist\/agent\/index\.cjs$/);
      const root = path.resolve(path.dirname(filename), '../..');
      assert.equal(fs.existsSync(path.join(root, 'src')), false);
      assert.equal(typeof agent.telegramChannelMetadataOf, 'function');
    });
    for (const [index, botUsername] of invalid.entries()) test(mode + ' refuses synthetic invalid username ' + index, () => {
      assert.equal(agent.AgentRuntimeChannelSchema.safeParse({ ...channel, botUsername }).success, false);
      assert.equal(agent.telegramChannelMetadataOf({ ...channel, botUsername, allowFromCount: 0 }), null);
      assert.equal(http.ListAgentsAgentSchema.safeParse(inventory(botUsername)).success, false);
    });
    for (const botUsername of valid) test(mode + ' preserves valid username ' + botUsername, () => {
      const value = { ...channel, botUsername, allowFromCount: 0 };
      assert.deepEqual(agent.AgentRuntimeChannelSchema.parse(value), value);
      assert.deepEqual(agent.telegramChannelMetadataOf(value), { botUsername, allowFromCount: 0 });
      assert.deepEqual(http.ListAgentsAgentSchema.parse(inventory(botUsername)), inventory(botUsername));
    });
    test(mode + ' preserves missing legacy metadata and observed zero', () => {
      assert.deepEqual(agent.AgentRuntimeChannelSchema.parse(channel), channel);
      assert.equal(agent.telegramChannelMetadataOf(channel), null);
      assert.deepEqual(agent.telegramChannelMetadataOf({ ...channel, allowFromCount: 0 }), { allowFromCount: 0 });
    });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
