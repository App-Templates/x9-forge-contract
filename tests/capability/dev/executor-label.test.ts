import { describe, expect, it } from 'vitest';
import * as dev from '../../../src/capability/dev/index.js';
import {
  DEV_SESSION_AUTONOMOUS_LABEL,
  DEV_SESSION_EXECUTOR_LABEL_PREFIX,
  DEV_SESSION_SERVER_EXECUTOR_LABEL,
} from '../../../src/capability/dev/session-assignment.js';

describe('etichetta dell’esecutore del server', () => {
  it('ha il valore atteso e inizia con il prefisso', () => {
    expect(DEV_SESSION_EXECUTOR_LABEL_PREFIX).toBe('esecutore:');
    expect(DEV_SESSION_SERVER_EXECUTOR_LABEL).toBe('esecutore:server');
    expect(DEV_SESSION_SERVER_EXECUTOR_LABEL.startsWith(DEV_SESSION_EXECUTOR_LABEL_PREFIX)).toBe(true);
  });

  it('è diversa dall’etichetta di sessione autonoma', () => {
    expect(DEV_SESSION_SERVER_EXECUTOR_LABEL).not.toBe(DEV_SESSION_AUTONOMOUS_LABEL);
    expect(DEV_SESSION_AUTONOMOUS_LABEL.startsWith(DEV_SESSION_EXECUTOR_LABEL_PREFIX)).toBe(false);
  });

  it('rispetta il limite di 50 caratteri delle etichette GitHub', () => {
    expect(DEV_SESSION_SERVER_EXECUTOR_LABEL.length).toBeLessThanOrEqual(50);
  });

  it('è esportata dal sottopercorso capability/dev', () => {
    expect(dev.DEV_SESSION_SERVER_EXECUTOR_LABEL).toBe(DEV_SESSION_SERVER_EXECUTOR_LABEL);
    expect(dev.DEV_SESSION_EXECUTOR_LABEL_PREFIX).toBe(DEV_SESSION_EXECUTOR_LABEL_PREFIX);
  });
});
