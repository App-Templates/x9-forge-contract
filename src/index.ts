/**
 * @x9-forge/contracts — single source of truth per i contratti cross-repo
 * tra agent-x9 (runtime) e forge-v2 (control plane).
 *
 * Non importare direttamente da qui nei consumer: usare sub-path export
 * (es. `import { ... } from '@x9-forge/contracts/capability'`).
 *
 * @see README.md
 */
export * from './model-router/index.js';
