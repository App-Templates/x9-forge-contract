import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    setupFiles: ['./tests/setup.ts'],
    environment: 'node',
    globals: false,
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['dist', 'tests', 'node_modules', '**/*.d.ts']
    }
  }
});
