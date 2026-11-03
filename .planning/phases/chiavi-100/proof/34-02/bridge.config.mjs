import { defineConfig } from '/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-180-1/node_modules/vitest/dist/config.js';
export default defineConfig({
  root: '/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-180-1',
  envDir: false,
  cacheDir: '/private/tmp/codex-a-chiavi-completamento/bridge-cache',
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    setupFiles: ['./tests/setup.ts'],
    environment: 'node',
    globals: false,
    reporters: ['default'],
  },
});
