import { describe, expect, it } from 'vitest';
import {
  DECISION_REQUEST_HEADER,
  decisionRequestHeaderMatches,
} from '../../src/organization/index.js';

const ID = 'dec_x';

describe('decisionRequestHeaderMatches', () => {
  it('exports the header name from the index', () => {
    expect(DECISION_REQUEST_HEADER).toBe('X-X9-Decision-Request');
  });

  it('matches with the canonical header name', () => {
    expect(decisionRequestHeaderMatches({ 'X-X9-Decision-Request': ID }, ID)).toBe(true);
  });

  it('matches with a lowercase header name', () => {
    expect(decisionRequestHeaderMatches({ 'x-x9-decision-request': ID }, ID)).toBe(true);
  });

  it('trims spaces around the value', () => {
    expect(decisionRequestHeaderMatches({ 'X-X9-Decision-Request': `  ${ID} ` }, ID)).toBe(true);
  });

  it('does not match without headers', () => {
    expect(decisionRequestHeaderMatches(undefined, ID)).toBe(false);
    expect(decisionRequestHeaderMatches({}, ID)).toBe(false);
    expect(decisionRequestHeaderMatches({ 'X-Other': ID }, ID)).toBe(false);
  });

  it('does not match the value of another request', () => {
    expect(decisionRequestHeaderMatches({ 'X-X9-Decision-Request': 'dec_y' }, ID)).toBe(false);
  });

  it('does not match when the requestId is only part of the value', () => {
    expect(decisionRequestHeaderMatches({ 'X-X9-Decision-Request': 'dec_x-altro' }, ID)).toBe(false);
    expect(decisionRequestHeaderMatches({ 'X-X9-Decision-Request': 'dec_x dec_y' }, ID)).toBe(false);
  });
});
