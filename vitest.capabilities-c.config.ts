import { mergeConfig, defineConfig } from 'vitest/config';
import base from './vitest.config.js';

export default mergeConfig(base, defineConfig({ envDir: false, test: { maxWorkers: 1 } }));
